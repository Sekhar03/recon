/**
 * 3.4 Commission Reconciliation Module
 * Joins Middleware matched records with Commission Report.
 * Flags transactions missing commission debits for partner credit / merchant debit audit logging.
 */

export function runCommissionReconciliation(matchedTxns, commissionRows = []) {
  const commMap = new Map();
  commissionRows.forEach(c => {
    const key = c.relationalId || c.Id;
    if (key) commMap.set(String(key), c);
  });

  const reconciledCommissions = [];
  const missingCommissionExceptions = [];

  matchedTxns.forEach(txn => {
    const commRecord = commMap.get(String(txn.id)) || commMap.get(String(txn.rrn));

    if (commRecord) {
      const commAmount = parseFloat(commRecord.amountTransacted || commRecord.relationalAmount || 0);
      reconciledCommissions.push({
        txnId: txn.id,
        rrn: txn.rrn,
        userName: txn.userName,
        txnAmount: txn.amount,
        commissionAmount: commAmount,
        tds: parseFloat(commRecord.tds || 0),
        taxable: parseFloat(commRecord.taxable || 0),
        gst: parseFloat(commRecord.gst || 0),
        status: 'MATCHED'
      });
    } else {
      // Missing commission debit exception
      const estimatedComm = (parseFloat(txn.amount) * 0.0015).toFixed(2); // 0.15% default fallback estimate
      const exceptionObj = {
        txnId: txn.id,
        rrn: txn.rrn,
        userName: txn.userName,
        txnAmount: txn.amount,
        estimatedCommission: estimatedComm,
        actionRequired: 'Manual debit from merchant + Manual credit to partner account',
        status: 'MISSING_COMMISSION',
        loggedAt: new Date().toISOString()
      };
      missingCommissionExceptions.push(exceptionObj);
      reconciledCommissions.push({
        txnId: txn.id,
        rrn: txn.rrn,
        userName: txn.userName,
        txnAmount: txn.amount,
        commissionAmount: parseFloat(estimatedComm),
        status: 'ESTIMATED_PENDING_AUDIT'
      });
    }
  });

  const totalCommission = reconciledCommissions.reduce((acc, curr) => acc + (curr.commissionAmount || 0), 0);

  return {
    totalTxns: matchedTxns.length,
    commissionMatchedCount: matchedTxns.length - missingCommissionExceptions.length,
    missingCommissionCount: missingCommissionExceptions.length,
    totalCommissionAmount: totalCommission.toFixed(2),
    reconciledCommissions,
    missingCommissionExceptions
  };
}
