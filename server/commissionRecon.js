/**
 * Module B — Commission Reconciliation
 * Joins Matched Middleware transactions with Commission Report.
 * Emits Summary, Commission_Matched, and Commission_Mismatched datasets.
 */

export function runModuleBCommissionRecon(matchedMwTxns = [], commissionRows = []) {
  const matchedList = [];
  const mismatchedList = [];

  const commMapByRelationalId = new Map();
  commissionRows.forEach(c => {
    const key = c.relationalId || c.Id || c.transactionId;
    if (key) commMapByRelationalId.set(String(key), c);
  });

  matchedMwTxns.forEach(mwTxn => {
    const txnId = mwTxn['Transaction ID'] || mwTxn.id || mwTxn.Id;
    const rrn = mwTxn['RRN'] || mwTxn.rrn || 'N/A';
    const mwUser = mwTxn['userName'] || mwTxn.userName || 'merchant_01';
    const mwAmt = parseFloat(mwTxn['Amount'] || mwTxn.amount || 0);

    const commRecord = commMapByRelationalId.get(String(txnId)) || commMapByRelationalId.get(String(rrn));

    const baseRecord = {
      'Transaction ID': txnId,
      'RRN': rrn,
      'User Name': mwUser,
      'Transaction Amount': mwAmt.toFixed(2),
      'Commission Amount': commRecord ? parseFloat(commRecord.amountTransacted || commRecord.relationalAmount || 0).toFixed(2) : '0.00',
      'TDS': commRecord ? parseFloat(commRecord.tds || 0).toFixed(2) : '0.00',
      'GST': commRecord ? parseFloat(commRecord.gst || 0).toFixed(2) : '0.00'
    };

    if (!commRecord) {
      mismatchedList.push({
        ...baseRecord,
        'Label': 'Commission not debited — needs manual debit from merchant + manual credit to partner',
        'Notes': ''
      });
    } else {
      const commRelAmt = parseFloat(commRecord.relationalAmount || mwAmt);
      const commUser = commRecord.userName || commRecord.merchantName || mwUser;

      const amtDiff = Math.abs(mwAmt - commRelAmt);
      const userMatch = commUser.toLowerCase() === mwUser.toLowerCase();

      if (amtDiff < 0.05 && userMatch) {
        matchedList.push({ ...baseRecord, 'Status': 'Matched' });
      } else if (!userMatch) {
        mismatchedList.push({ ...baseRecord, 'Label': 'Username mismatch', 'Notes': '' });
      } else if (amtDiff >= 0.05) {
        mismatchedList.push({ ...baseRecord, 'Label': 'Amount mismatch', 'Notes': '' });
      } else {
        mismatchedList.push({ ...baseRecord, 'Label': 'Unclassified — needs manual review', 'Notes': '' });
      }
    }
  });

  const total = matchedMwTxns.length;
  const matchedCount = matchedList.length;
  const mismatchedCount = mismatchedList.length;

  return {
    summary: {
      'Total Transactions Analyzed': total,
      'Commission Matched Count': matchedCount,
      'Commission Mismatched Count': mismatchedCount,
      'Commission Match Rate': total > 0 ? ((matchedCount / total) * 100).toFixed(1) + '%' : '0%'
    },
    matchedList,
    mismatchedList
  };
}

