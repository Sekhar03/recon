/**
 * 3.2 4-Way UPI Transaction Reconciliation Engine
 * Joins NPCI, Switch, Middleware, and Wallet extracts.
 * Applies configurable rules engine for mismatch classification, disposition, and auto-actions.
 */

export const DEFAULT_RULES_ENGINE = [
  {
    id: 'RULE_1',
    npci: 'Success',
    switch: 'Success',
    middleware: 'Success',
    wallet: 'Success',
    action: 'No action (matched)',
    isMatched: true,
    autoActionable: true
  },
  {
    id: 'RULE_2',
    npci: 'Success',
    switch: 'Success',
    middleware: 'In Progress',
    wallet: 'N/A',
    action: 'Raise credit adjustment',
    isMatched: false,
    autoActionable: false
  },
  {
    id: 'RULE_3',
    npci: 'Success',
    switch: 'Success',
    middleware: 'In Progress',
    wallet: 'Success',
    action: 'Update Middleware status -> Success',
    isMatched: false,
    autoActionable: true
  },
  {
    id: 'RULE_4',
    npci: 'Success',
    switch: 'Success',
    middleware: 'Success',
    wallet: 'N/A',
    action: 'Process wallet operation -> Success',
    isMatched: false,
    autoActionable: true
  },
  {
    id: 'RULE_5',
    npci: 'Pending',
    switch: 'Pending',
    middleware: 'In Progress',
    wallet: 'N/A',
    action: 'Raise RET in URCS portal',
    isMatched: false,
    autoActionable: false
  },
  {
    id: 'RULE_6',
    npci: 'Success',
    switch: 'Failed',
    middleware: 'Failed',
    wallet: 'N/A',
    action: 'Raise RET in URCS portal',
    isMatched: false,
    autoActionable: false
  },
  {
    id: 'RULE_7',
    npci: 'Pending',
    switch: 'Success',
    middleware: 'Success',
    wallet: 'Success',
    action: 'Raise TCC in URCS portal',
    isMatched: false,
    autoActionable: false
  },
  {
    id: 'RULE_8',
    npci: 'Success',
    switch: 'Pending',
    middleware: 'Success',
    wallet: 'Success',
    action: 'No action',
    isMatched: false,
    autoActionable: true
  }
];

export function run4WayReconciliation(npciRows, switchRows, mwRows, walletRows, customRules = DEFAULT_RULES_ENGINE) {
  const matchedList = [];
  const exceptionQueue = [];
  const autoActionsExecuted = [];

  // Indexing maps for multi-source joins
  const switchMapByTxnId = new Map();
  const switchMapByRef = new Map();
  const switchMapByRrn = new Map();

  switchRows.forEach(row => {
    if (row.switch_txn_id || row.npci_txn_id) switchMapByTxnId.set(String(row.switch_txn_id || row.npci_txn_id), row);
    if (row.client_ref_id) switchMapByRef.set(String(row.client_ref_id), row);
    if (row.rrn) switchMapByRrn.set(String(row.rrn), row);
  });

  const mwMapById = new Map();
  const mwMapByTid = new Map();
  mwRows.forEach(row => {
    if (row.Id) mwMapById.set(String(row.Id), row);
    if (row.apiTid) mwMapByTid.set(String(row.apiTid), row);
  });

  const walletMapByRelId = new Map();
  const walletMapById = new Map();
  const walletMapByRef = new Map();
  walletRows.forEach(row => {
    if (row.relationalId) walletMapByRelId.set(String(row.relationalId), row);
    if (row.Id) walletMapById.set(String(row.Id), row);
    if (row.referenceNo) walletMapByRef.set(String(row.referenceNo), row);
  });

  // Reconcile each NPCI record
  npciRows.forEach(npci => {
    const npciTxnId = npci['TXN ID'] || npci.txn_id || npci.RRN || npci.rrn;
    const rrn = npci.RRN || npci.rrn || 'N/A';

    // 1. Join Switch
    const switchRow = switchMapByTxnId.get(String(npciTxnId)) || switchMapByRrn.get(String(rrn)) || null;

    // 2. Join Middleware (via Switch client_ref_id or direct npciTxnId)
    let mwRow = null;
    if (switchRow && switchRow.client_ref_id) {
      mwRow = mwMapById.get(String(switchRow.client_ref_id)) || mwMapByTid.get(String(switchRow.client_ref_id));
    }
    if (!mwRow) {
      mwRow = mwMapById.get(String(npciTxnId)) || mwMapByTid.get(String(npciTxnId));
    }

    // 3. Join Wallet (via Middleware Id or direct npciTxnId)
    let walletRow = null;
    if (mwRow && mwRow.Id) {
      walletRow = walletMapByRelId.get(String(mwRow.Id)) || walletMapById.get(String(mwRow.Id));
    }
    if (!walletRow) {
      walletRow = walletMapByRelId.get(String(npciTxnId)) || walletMapByRef.get(String(npciTxnId));
    }

    // Status Normalization
    const rawNpciResp = String(npci['RESPONSE CODE'] || npci.response_code || npci.status || '').toUpperCase();
    const npciStatus = (rawNpciResp === '00' || rawNpciResp === 'SUCCESS') ? 'Success' :
                      (rawNpciResp === 'PENDING' || rawNpciResp === 'IN_PROGRESS') ? 'Pending' : 'Failed';

    const rawSwitchStatus = switchRow ? String(switchRow.status || switchRow.response_code || '').toUpperCase() : 'N/A';
    const switchStatus = switchRow ? ((rawSwitchStatus === 'SUCCESS' || rawSwitchStatus === '00') ? 'Success' :
                         (rawSwitchStatus === 'PENDING' || rawSwitchStatus === 'IN_PROGRESS') ? 'Pending' : 'Failed') : 'N/A';

    const rawMwStatus = mwRow ? String(mwRow.status || '').toUpperCase() : 'N/A';
    const mwStatus = mwRow ? ((rawMwStatus === 'SUCCESS') ? 'Success' :
                     (rawMwStatus === 'IN_PROGRESS' || rawMwStatus === 'PENDING') ? 'In Progress' : 'Failed') : 'N/A';

    const rawWalletStatus = walletRow ? String(walletRow.status || '').toUpperCase() : 'N/A';
    const walletStatus = walletRow ? ((rawWalletStatus === 'SUCCESS') ? 'Success' :
                        (rawWalletStatus === 'IN_PROGRESS' || rawWalletStatus === 'PENDING') ? 'In Progress' : 'Failed') : 'N/A';

    // Amount Normalization (NPCI amount in paise vs rupees check)
    let npciAmt = parseFloat(npci['SETTLEMENT AMOUNT'] || npci.amount || 0);
    if (npciAmt > 100000) npciAmt = npciAmt / 100;

    const switchAmt = switchRow ? parseFloat(switchRow.amount || 0) : 0;
    const mwAmt = mwRow ? parseFloat(mwRow.amountTransacted || 0) : 0;
    const finalAmt = npciAmt || switchAmt || mwAmt;

    // Cross-check RRN and payer_vpa between NPCI and Switch
    const switchPayerVpa = switchRow?.payer_vpa || 'N/A';
    const npciPayerVpa = npci['payer VPA'] || npci.payer_vpa || 'N/A';
    const vpaMismatch = (switchPayerVpa !== 'N/A' && npciPayerVpa !== 'N/A' && switchPayerVpa.toLowerCase() !== npciPayerVpa.toLowerCase());

    // Evaluate rules matrix
    let matchedRule = customRules.find(rule => 
      rule.npci === npciStatus &&
      rule.switch === switchStatus &&
      rule.middleware === mwStatus &&
      (rule.wallet === 'N/A' || rule.wallet === walletStatus)
    );

    if (!matchedRule || vpaMismatch) {
      matchedRule = {
        id: vpaMismatch ? 'VPA_MISMATCH_EXCEPTION' : 'CUSTOM_EXCEPTION',
        action: vpaMismatch ? 'Flagged: Payer VPA mismatch between NPCI and Switch' : 'Flagged for manual investigation',
        isMatched: false,
        autoActionable: false
      };
    }

    const unifiedRecord = {
      id: npciTxnId,
      rrn,
      payerVpa: npciPayerVpa !== 'N/A' ? npciPayerVpa : switchPayerVpa,
      payeeVpa: npci['payee VPA'] || npci.payee_vpa || switchRow?.payee_vpa || mwRow?.PayeeVpa || 'N/A',
      amount: finalAmt,
      userName: mwRow?.userName || mwRow?.retailerUserName || 'merchant_01',
      npciStatus,
      switchStatus,
      mwStatus,
      walletStatus,
      ruleId: matchedRule.id,
      actionRequired: matchedRule.action,
      state: matchedRule.isMatched ? 'settled' : 'exception',
      reconciledAt: new Date().toISOString()
    };

    if (matchedRule.isMatched) {
      matchedList.push(unifiedRecord);
    } else {
      exceptionQueue.push(unifiedRecord);
      if (matchedRule.autoActionable) {
        autoActionsExecuted.push({
          txnId: unifiedRecord.id,
          ruleId: matchedRule.id,
          actionTaken: matchedRule.action,
          executedAt: new Date().toISOString()
        });
      }
    }
  });

  return {
    totalProcessed: npciRows.length,
    matchedCount: matchedList.length,
    exceptionCount: exceptionQueue.length,
    matchedList,
    exceptionQueue,
    autoActionsExecuted,
    matchRate: npciRows.length > 0 ? ((matchedList.length / npciRows.length) * 100).toFixed(2) + '%' : '0%'
  };
}

