/**
 * Module C — Payout Reconciliation (3-Way)
 * Reconciles iServeU Payout Report, Bank MIS Report, and Bank Statement.
 * Emits Summary, Payout_Matched, and Payout_Mismatched datasets.
 */

export function runModuleCPayoutRecon(payoutRows = [], bankMisRows = [], bankStatementRows = []) {
  const matchedList = [];
  const mismatchedList = [];

  const misMapByRef = new Map();
  bankMisRows.forEach(r => {
    const key = r.clientReferenceNo || r.utr || r.payoutRef || r.refNo;
    if (key) misMapByRef.set(String(key), r);
  });

  const stmtMapByRef = new Map();
  bankStatementRows.forEach(s => {
    const key = s.utr || s.clientReferenceNo || s.refNo;
    if (key) stmtMapByRef.set(String(key), s);
  });

  payoutRows.forEach(po => {
    const refNo = po.clientReferenceNo || po.refNo || po.utr;
    const username = po.username || po.userName || 'merchant_01';
    const poAmt = parseFloat(po.amount || po.payoutAmount || 0);

    const misRow = misMapByRef.get(String(refNo));
    const stmtRow = stmtMapByRef.get(String(refNo));

    const misAmt = misRow ? parseFloat(misRow.amount || misRow.bankMisAmount || 0) : null;
    const stmtAmt = stmtRow ? parseFloat(stmtRow.amount || stmtRow.bankStmtAmount || 0) : null;

    const misStatus = misRow ? String(misRow.status || 'SUCCESS').toUpperCase() : 'N/A';
    const stmtStatus = stmtRow ? String(stmtRow.status || 'DEBITED').toUpperCase() : 'N/A';

    const baseRecord = {
      'Client Reference No': refNo,
      'User Name': username,
      'Payout Amount': poAmt.toFixed(2),
      'Bank MIS Amount': misAmt !== null ? misAmt.toFixed(2) : 'N/A',
      'Bank Statement Amount': stmtAmt !== null ? stmtAmt.toFixed(2) : 'N/A',
      'Bank MIS Status': misStatus,
      'Bank Statement Status': stmtStatus,
      'UTR': misRow?.utr || stmtRow?.utr || po.utr || 'N/A'
    };

    if (!misRow) {
      mismatchedList.push({ ...baseRecord, 'Label': 'Missing in Bank MIS', 'Notes': '' });
    } else if (!stmtRow) {
      mismatchedList.push({ ...baseRecord, 'Label': 'Missing in Bank Statement', 'Notes': '' });
    } else {
      const isAmtMatch = Math.abs(poAmt - misAmt) < 0.05 && Math.abs(poAmt - stmtAmt) < 0.05;
      const isStatusMatch = (misStatus === 'SUCCESS' || misStatus === 'PROCESSED') && (stmtStatus === 'DEBITED' || stmtStatus === 'SUCCESS');

      if (isAmtMatch && isStatusMatch) {
        matchedList.push({ ...baseRecord, 'Status': 'Matched' });
      } else if (!isAmtMatch) {
        mismatchedList.push({ ...baseRecord, 'Label': 'Amount mismatch', 'Notes': '' });
      } else if (!isStatusMatch) {
        mismatchedList.push({ ...baseRecord, 'Label': 'Status mismatch', 'Notes': '' });
      } else {
        mismatchedList.push({ ...baseRecord, 'Label': 'Unclassified — needs manual review', 'Notes': '' });
      }
    }
  });

  const total = payoutRows.length;
  const matchedCount = matchedList.length;
  const mismatchedCount = mismatchedList.length;

  return {
    summary: {
      'Total Payouts Analyzed': total,
      'Payout Matched Count': matchedCount,
      'Payout Mismatched Count': mismatchedCount,
      'Payout Match Rate': total > 0 ? ((matchedCount / total) * 100).toFixed(1) + '%' : '0%'
    },
    matchedList,
    mismatchedList
  };
}

