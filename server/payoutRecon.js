/**
 * 3.8 Payout Reconciliation (3-Way Match) Engine
 * Reconciles iServeU Payout Report, Bank MIS Report, and Bank Statement.
 * Flags discrepancies and logs audit trail for reviewer disposition.
 */

export function runPayoutReconciliation(payoutRows, bankMisRows = [], bankStatementRows = []) {
  const misMap = new Map();
  bankMisRows.forEach(r => {
    const key = r.clientReferenceNo || r.utr || r.payoutRef;
    if (key) misMap.set(String(key), r);
  });

  const stmtMap = new Map();
  bankStatementRows.forEach(s => {
    const key = s.utr || s.clientReferenceNo || s.refNo;
    if (key) stmtMap.set(String(key), s);
  });

  const matchedPayouts = [];
  const payoutExceptions = [];

  payoutRows.forEach(po => {
    const refNo = po.clientReferenceNo;
    const misRow = misMap.get(String(refNo));
    const stmtRow = stmtMap.get(String(refNo));

    const poAmt = parseFloat(po.amount || 0);
    const misAmt = misRow ? parseFloat(misRow.amount || 0) : null;
    const stmtAmt = stmtRow ? parseFloat(stmtRow.amount || 0) : null;

    const misStatus = misRow ? (misRow.status || 'SUCCESS') : 'MISSING_IN_MIS';
    const stmtStatus = stmtRow ? (stmtRow.status || 'DEBITED') : 'MISSING_IN_STMT';

    const isAmtMatched = (misAmt === null || Math.abs(poAmt - misAmt) < 0.01) &&
                         (stmtAmt === null || Math.abs(poAmt - stmtAmt) < 0.01);

    const isFullyMatched = misRow && stmtRow && isAmtMatched && misStatus === 'SUCCESS' && (stmtStatus === 'DEBITED' || stmtStatus === 'SUCCESS');

    const resultRecord = {
      clientReferenceNo: refNo,
      username: po.username,
      beneName: po.beneName,
      payoutAmount: poAmt,
      bankMisAmount: misAmt,
      bankStmtAmount: stmtAmt,
      payoutStatus: 'INITIATED',
      bankMisStatus: misStatus,
      bankStmtStatus: stmtStatus,
      utr: misRow?.utr || stmtRow?.utr || `UTR${Date.now()}${Math.floor(Math.random() * 1000)}`,
      reconciledAt: new Date().toISOString()
    };

    if (isFullyMatched) {
      matchedPayouts.push({ ...resultRecord, status: 'MATCHED' });
    } else {
      let failureReason = 'Discrepancy detected';
      if (!misRow) failureReason = 'Missing in Bank MIS Report';
      else if (!stmtRow) failureReason = 'Missing in Bank Statement';
      else if (!isAmtMatched) failureReason = 'Amount variance across records';
      else if (misStatus !== 'SUCCESS') failureReason = `Bank MIS status: ${misStatus}`;

      payoutExceptions.push({
        ...resultRecord,
        status: 'EXCEPTION',
        failureReason,
        actionRequired: 'Escalate to Bank Ops / Manual Review',
        dispositionStatus: 'PENDING_REVIEW'
      });
    }
  });

  return {
    totalPayouts: payoutRows.length,
    matchedCount: matchedPayouts.length,
    exceptionCount: payoutExceptions.length,
    matchedPayouts,
    payoutExceptions,
    payoutMatchRate: payoutRows.length > 0 ? ((matchedPayouts.length / payoutRows.length) * 100).toFixed(1) + '%' : '0%'
  };
}
