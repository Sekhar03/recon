/**
 * Module A — Transaction Reconciliation (4-Way)
 * Joins NPCI, Switch, Middleware, and Wallet reports.
 * Emits Summary, Txn_Matched, and Txn_Mismatched dataset structures.
 */

export function runModuleATransactionRecon(npciRows = [], switchRows = [], mwRows = [], walletRows = []) {
  const matchedList = [];
  const mismatchedList = [];

  // Build lookup maps
  const switchMapByTxnId = new Map();
  const switchMapByRrn = new Map();
  switchRows.forEach(row => {
    if (row.switch_txn_id || row.npci_txn_id) switchMapByTxnId.set(String(row.switch_txn_id || row.npci_txn_id), row);
    if (row.rrn) switchMapByRrn.set(String(row.rrn), row);
  });

  const mwMapById = new Map();
  mwRows.forEach(row => {
    if (row.Id || row.apiTid) mwMapById.set(String(row.Id || row.apiTid), row);
  });

  const walletMapByRelId = new Map();
  walletRows.forEach(row => {
    if (row.relationalId || row.Id) walletMapByRelId.set(String(row.relationalId || row.Id), row);
  });

  npciRows.forEach(npci => {
    const txnId = npci['TXN ID'] || npci.txn_id || npci.RRN || npci.rrn;
    const rrn = npci.RRN || npci.rrn || 'N/A';

    // 1. Join Switch
    const switchRow = switchMapByTxnId.get(String(txnId)) || switchMapByRrn.get(String(rrn)) || null;

    // 2. Join Middleware
    let mwRow = null;
    if (switchRow && switchRow.client_ref_id) {
      mwRow = mwMapById.get(String(switchRow.client_ref_id));
    }
    if (!mwRow) {
      mwRow = mwMapById.get(String(txnId));
    }

    // 3. Join Wallet
    let walletRow = null;
    if (mwRow && mwRow.Id) {
      walletRow = walletMapByRelId.get(String(mwRow.Id));
    }
    if (!walletRow) {
      walletRow = walletMapByRelId.get(String(txnId));
    }

    // Status Normalization
    const rawNpci = String(npci['RESPONSE CODE'] || npci.response_code || npci.status || '').toUpperCase();
    const npciStatus = (rawNpci === '00' || rawNpci === 'SUCCESS') ? 'Success' : (rawNpci === 'PENDING' ? 'Pending' : 'Failed');

    const rawSwitch = switchRow ? String(switchRow.status || switchRow.response_code || '').toUpperCase() : 'N/A';
    const switchStatus = switchRow ? ((rawSwitch === 'SUCCESS' || rawSwitch === '00') ? 'Success' : (rawSwitch === 'PENDING' ? 'Pending' : 'Failed')) : 'N/A';

    const rawMw = mwRow ? String(mwRow.status || '').toUpperCase() : 'N/A';
    const mwStatus = mwRow ? ((rawMw === 'SUCCESS') ? 'Success' : (rawMw === 'IN_PROGRESS' || rawMw === 'PENDING' ? 'In Progress' : 'Failed')) : 'N/A';

    const rawWallet = walletRow ? String(walletRow.status || '').toUpperCase() : 'N/A';
    const walletStatus = walletRow ? ((rawWallet === 'SUCCESS') ? 'Success' : (rawWallet === 'IN_PROGRESS' || rawWallet === 'PENDING' ? 'In Progress' : 'Failed')) : 'N/A';

    // Amount Normalization (NPCI amount ÷ 100 per spec if in paise)
    let npciAmt = parseFloat(npci['SETTLEMENT AMOUNT'] || npci.amount || 0);
    if (npciAmt > 100000) npciAmt = npciAmt / 100;
    const amount = npciAmt || parseFloat(switchRow?.amount || 0) || parseFloat(mwRow?.amountTransacted || 0);

    // Cross-check RRN and payer_vpa between NPCI and Switch
    const switchPayerVpa = switchRow?.payer_vpa || 'N/A';
    const npciPayerVpa = npci['payer VPA'] || npci.payer_vpa || 'N/A';
    const vpaMismatch = (switchPayerVpa !== 'N/A' && npciPayerVpa !== 'N/A' && switchPayerVpa.toLowerCase() !== npciPayerVpa.toLowerCase());

    // Label determination matching spec table exactly
    let label = '';
    let isMatched = false;

    if (!vpaMismatch && npciStatus === 'Success' && switchStatus === 'Success' && mwStatus === 'Success' && walletStatus === 'Success') {
      label = 'Matched';
      isMatched = true;
    } else if (npciStatus === 'Success' && switchStatus === 'Success' && mwStatus === 'In Progress' && walletStatus === 'N/A') {
      label = 'Credit adjustment likely needed';
    } else if (npciStatus === 'Success' && switchStatus === 'Success' && mwStatus === 'In Progress' && walletStatus === 'Success') {
      label = 'Middleware status out of sync';
    } else if (npciStatus === 'Success' && switchStatus === 'Success' && mwStatus === 'Success' && walletStatus === 'N/A') {
      label = 'Wallet operation not completed';
    } else if (npciStatus === 'Pending' && switchStatus === 'Pending' && mwStatus === 'In Progress') {
      label = 'Raise RET in URCS portal';
    } else if (npciStatus === 'Success' && switchStatus === 'Failed' && mwStatus === 'Failed') {
      label = 'Raise RET in URCS portal';
    } else if (npciStatus === 'Pending' && switchStatus === 'Success' && mwStatus === 'Success' && walletStatus === 'Success') {
      label = 'Raise TCC in URCS portal';
    } else if (npciStatus === 'Success' && switchStatus === 'Pending' && mwStatus === 'Success' && walletStatus === 'Success') {
      label = 'Matched (no action)';
      isMatched = true;
    } else {
      label = 'Unclassified — needs manual review';
    }

    const baseRecord = {
      'Transaction ID': txnId,
      'RRN': rrn,
      'Payer VPA': npciPayerVpa !== 'N/A' ? npciPayerVpa : switchPayerVpa,
      'Payee VPA': npci['payee VPA'] || npci.payee_vpa || switchRow?.payee_vpa || 'N/A',
      'Amount': amount.toFixed(2),
      'NPCI Status': npciStatus,
      'Switch Status': switchStatus,
      'MW Status': mwStatus,
      'Wallet Status': walletStatus,
      'userName': mwRow?.userName || mwRow?.retailerUserName || 'merchant_01'
    };

    if (isMatched) {
      matchedList.push({ ...baseRecord, 'Status': 'Matched' });
    } else {
      mismatchedList.push({ ...baseRecord, 'Label': label, 'Notes': '' });
    }
  });

  const totalProcessed = npciRows.length;
  const matchedCount = matchedList.length;
  const mismatchedCount = mismatchedList.length;

  return {
    summary: {
      'Total Transactions': totalProcessed,
      'Matched Count': matchedCount,
      'Mismatched Count': mismatchedCount,
      'Match Rate': totalProcessed > 0 ? ((matchedCount / totalProcessed) * 100).toFixed(1) + '%' : '0%'
    },
    matchedList,
    mismatchedList
  };
}



