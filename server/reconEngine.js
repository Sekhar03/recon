/**
 * 4-Way UPI Transaction Reconciliation Engine
 * Joins NPCI, Switch, Middleware, and Wallet extracts.
 * Reconciles transactions and classifies exceptions cleanly for review and Excel export.
 */

export const RECON_RULES = [
  { id: 'RULE_1', npci: 'Success', switch: 'Success', middleware: 'Success', wallet: 'Success', status: 'MATCHED', desc: '4-Way Fully Matched (Settlement Eligible)' },
  { id: 'RULE_2', npci: 'Success', switch: 'Success', middleware: 'In Progress', wallet: 'N/A', status: 'MISMATCH', desc: 'Middleware Pending / Credit Adjustment Required' },
  { id: 'RULE_3', npci: 'Success', switch: 'Success', middleware: 'In Progress', wallet: 'Success', status: 'MISMATCH', desc: 'Middleware Status Sync Needed' },
  { id: 'RULE_4', npci: 'Success', switch: 'Success', middleware: 'Success', wallet: 'N/A', status: 'MISMATCH', desc: 'Wallet Debited / Pending Sync' },
  { id: 'RULE_5', npci: 'Pending', switch: 'Pending', middleware: 'In Progress', wallet: 'N/A', status: 'MISMATCH', desc: 'RET Portal Action Required' },
  { id: 'RULE_6', npci: 'Success', switch: 'Failed', middleware: 'Failed', wallet: 'N/A', status: 'MISMATCH', desc: 'Switch/Middleware Failed / RET Action Required' },
  { id: 'RULE_7', npci: 'Pending', switch: 'Success', middleware: 'Success', wallet: 'Success', status: 'MISMATCH', desc: 'TCC Portal Action Required' },
  { id: 'RULE_8', npci: 'Success', switch: 'Pending', middleware: 'Success', wallet: 'Success', status: 'MISMATCH', desc: 'Switch Pending' }
];

export function run4WayReconciliation(npciRows = [], switchRows = [], mwRows = [], walletRows = [], customRules = RECON_RULES) {
  const matchedList = [];
  const exceptionQueue = [];

  // Build high-performance lookup maps
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

  // Reconcile each NPCI transaction
  npciRows.forEach(npci => {
    const npciTxnId = npci['TXN ID'] || npci.txn_id || npci.RRN || npci.rrn;
    const rrn = npci.RRN || npci.rrn || 'N/A';

    // 1. Join Switch
    const switchRow = switchMapByTxnId.get(String(npciTxnId)) || switchMapByRrn.get(String(rrn)) || null;

    // 2. Join Middleware
    let mwRow = null;
    if (switchRow && switchRow.client_ref_id) {
      mwRow = mwMapById.get(String(switchRow.client_ref_id));
    }
    if (!mwRow) {
      mwRow = mwMapById.get(String(npciTxnId));
    }

    // 3. Join Wallet
    let walletRow = null;
    if (mwRow && mwRow.Id) {
      walletRow = walletMapByRelId.get(String(mwRow.Id));
    }
    if (!walletRow) {
      walletRow = walletMapByRelId.get(String(npciTxnId));
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

    // Amount Normalization
    let npciAmt = parseFloat(npci['SETTLEMENT AMOUNT'] || npci.amount || 0);
    if (npciAmt > 100000) npciAmt = npciAmt / 100;
    const amount = npciAmt || parseFloat(switchRow?.amount || 0) || parseFloat(mwRow?.amountTransacted || 0);

    // Rule Evaluation
    let rule = customRules.find(r => 
      r.npci === npciStatus &&
      r.switch === switchStatus &&
      r.middleware === mwStatus &&
      (r.wallet === 'N/A' || r.wallet === walletStatus)
    );

    const isMatched = rule ? rule.status === 'MATCHED' : false;

    const record = {
      id: npciTxnId,
      rrn,
      payerVpa: npci['payer VPA'] || npci.payer_vpa || switchRow?.payer_vpa || 'N/A',
      payeeVpa: npci['payee VPA'] || npci.payee_vpa || switchRow?.payee_vpa || 'N/A',
      amount,
      userName: mwRow?.userName || mwRow?.retailerUserName || 'merchant_01',
      npciStatus,
      switchStatus,
      mwStatus,
      walletStatus,
      ruleId: rule?.id || 'UNCLASSIFIED',
      discrepancyReason: rule?.desc || 'Status mismatch across systems',
      settlementStatus: isMatched ? 'READY_FOR_SETTLEMENT' : 'EXCLUDED_MISMATCH',
      reconciledAt: new Date().toISOString()
    };

    if (isMatched) {
      matchedList.push(record);
    } else {
      exceptionQueue.push(record);
    }
  });

  return {
    totalProcessed: npciRows.length,
    matchedCount: matchedList.length,
    exceptionCount: exceptionQueue.length,
    matchRate: npciRows.length > 0 ? ((matchedList.length / npciRows.length) * 100).toFixed(1) + '%' : '0%',
    matchedList,
    exceptionQueue
  };
}


