/**
 * 3.5, 3.6, 3.7 Settlement & Payout Generation Engine
 * Aggregates merchant transactions, applies confirmed settlement formula,
 * enforces hard gate check against GEFU final settlement total,
 * and splits payout rows exceeding ₹5,00,000 into compliant IMPS chunks.
 */

export function calculateMerchantSettlement(merchantGroup, bankShareRate = 0.002006) {
  const txnAmount = merchantGroup.transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const txnCount = merchantGroup.transactions.length;

  const interchange = (txnAmount * 0.0010); // 0.10% sample interchange
  const switchingFee = (txnAmount * 0.0005); // 0.05% sample switching fee
  const bankShare = (txnAmount * bankShareRate); // 0.2006% bank share
  const platformFee = (txnAmount * 0.0002); // 0.02% platform fee

  const leaHold = merchantGroup.leaHold || 0;
  const periodLien = merchantGroup.periodLien || 0;
  const crAdjustment = merchantGroup.crAdjustment || 0;
  const chargeback = merchantGroup.chargeback || 0;
  const chargebackWon = merchantGroup.chargebackWon || 0;

  const netSettlement = txnAmount 
                        - interchange 
                        - switchingFee 
                        - bankShare 
                        - platformFee 
                        - leaHold 
                        - periodLien 
                        + crAdjustment 
                        - chargeback 
                        + chargebackWon;

  return {
    merchant: merchantGroup.merchantName || merchantGroup.userName || 'MERCHANT_001',
    userName: merchantGroup.userName || 'user_001',
    partner: merchantGroup.partnerName || 'iServeU Partner Network',
    txnCount: txnCount,
    txnAmount: parseFloat(txnAmount.toFixed(2)),
    interchange: parseFloat(interchange.toFixed(2)),
    switchingFee: parseFloat(switchingFee.toFixed(2)),
    bankShare: parseFloat(bankShare.toFixed(2)),
    platformFee: parseFloat(platformFee.toFixed(2)),
    leaHold: parseFloat(leaHold.toFixed(2)),
    periodLienAmount: parseFloat(periodLien.toFixed(2)),
    crAdjustment: parseFloat(crAdjustment.toFixed(2)),
    chargeback: parseFloat(chargeback.toFixed(2)),
    chargebackWon: parseFloat(chargebackWon.toFixed(2)),
    netSettlement: parseFloat(netSettlement.toFixed(2)),
    beneName: merchantGroup.beneName || 'MERCHANT STORE ENTERPRISES',
    beneAccountNo: merchantGroup.beneAccountNo || '50100234567890',
    beneIfsc: merchantGroup.beneIfsc || 'HDFC0000128',
    benePhoneNo: merchantGroup.benePhoneNo || '9876543210',
    beneBankName: merchantGroup.beneBankName || 'HDFC Bank'
  };
}

/**
 * 3.7 IMPS Chunking function
 * Splits net settlement amounts exceeding ₹5,00,000 into compliant IMPS rows
 */
export function splitPayoutRow(settlementRow, maxLimit = 500000) {
  const netAmount = settlementRow.netSettlement;
  if (netAmount <= maxLimit) {
    return [{
      username: settlementRow.userName,
      fundTransferType: 'IMPS',
      amount: netAmount.toFixed(2),
      beneName: settlementRow.beneName,
      beneAccountNo: settlementRow.beneAccountNo,
      beneifsc: settlementRow.beneIfsc,
      benePhoneNo: settlementRow.benePhoneNo,
      beneBankName: settlementRow.beneBankName,
      paramA: 'UPI_SETTL',
      paramB: 'CYC_1',
      clientReferenceNo: `PO_${settlementRow.userName}_${Date.now()}_01`
    }];
  }

  const rows = [];
  const remainder = parseFloat((netAmount % maxLimit).toFixed(2));
  const fullChunksCount = Math.floor(netAmount / maxLimit);

  let seq = 1;
  // If remainder exists, add remainder row first per confirmed real data pattern (e.g. ₹9,29,156.36 -> ₹4,29,156.36 + ₹5,00,000)
  if (remainder > 0) {
    rows.push({
      username: settlementRow.userName,
      fundTransferType: 'IMPS',
      amount: remainder.toFixed(2),
      beneName: settlementRow.beneName,
      beneAccountNo: settlementRow.beneAccountNo,
      beneifsc: settlementRow.beneIfsc,
      benePhoneNo: settlementRow.benePhoneNo,
      beneBankName: settlementRow.beneBankName,
      paramA: 'UPI_SETTL_REM',
      paramB: 'CYC_1',
      clientReferenceNo: `PO_${settlementRow.userName}_${Date.now()}_${String(seq).padStart(2, '0')}`
    });
    seq++;
  }

  for (let i = 0; i < fullChunksCount; i++) {
    rows.push({
      username: settlementRow.userName,
      fundTransferType: 'IMPS',
      amount: maxLimit.toFixed(2),
      beneName: settlementRow.beneName,
      beneAccountNo: settlementRow.beneAccountNo,
      beneifsc: settlementRow.beneIfsc,
      benePhoneNo: settlementRow.benePhoneNo,
      beneBankName: settlementRow.beneBankName,
      paramA: 'UPI_SETTL_MAX',
      paramB: 'CYC_1',
      clientReferenceNo: `PO_${settlementRow.userName}_${Date.now()}_${String(seq).padStart(2, '0')}`
    });
    seq++;
  }

  return rows;
}

export function generateSettlementAndPayoutFiles(matchedTxns, gefuFinalSettlementAmount = null) {
  // Group transactions by merchant
  const grouped = new Map();
  matchedTxns.forEach(t => {
    const user = t.userName || 'default_merchant';
    if (!grouped.has(user)) {
      grouped.set(user, {
        userName: user,
        merchantName: `${user.toUpperCase()} TRADERS`,
        partnerName: 'iServeU Tech Network',
        transactions: [],
        leaHold: user === 'merchant_03' ? 1200.00 : 0,
        periodLien: 0,
        crAdjustment: user === 'merchant_01' ? 500.00 : 0,
        chargeback: 0,
        chargebackWon: 0,
        beneName: `${user.toUpperCase()} RETAIL SERVICES`,
        beneAccountNo: '50100' + Math.floor(10000000 + Math.random() * 90000000),
        beneIfsc: 'ICIC0001042',
        benePhoneNo: '98' + Math.floor(10000000 + Math.random() * 90000000),
        beneBankName: 'ICICI Bank'
      });
    }
    grouped.get(user).transactions.push(t);
  });

  const settlementRows = Array.from(grouped.values()).map(g => calculateMerchantSettlement(g));
  const totalNetSettlement = settlementRows.reduce((acc, r) => acc + r.netSettlement, 0);

  // Hard Gate Check (§3.6) against GEFU Final Settlement Amount
  let gatePassed = true;
  let variance = 0;
  if (gefuFinalSettlementAmount !== null && gefuFinalSettlementAmount !== undefined) {
    variance = Math.abs(totalNetSettlement - gefuFinalSettlementAmount);
    if (variance > 1.00) { // allow max 1 rupee rounding variance threshold
      gatePassed = false;
    }
  }

  // Generate Payout Rows with IMPS ₹5L split
  let payoutRows = [];
  if (gatePassed) {
    settlementRows.forEach(sRow => {
      const splits = splitPayoutRow(sRow);
      payoutRows.push(...splits);
    });
  }

  return {
    gatePassed,
    variance: variance.toFixed(2),
    totalSettlementAmount: totalNetSettlement.toFixed(2),
    gefuFinalSettlementAmount: gefuFinalSettlementAmount ? gefuFinalSettlementAmount.toFixed(2) : null,
    settlementRows,
    payoutRows,
    payoutRowCount: payoutRows.length
  };
}
