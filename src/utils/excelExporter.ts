import * as XLSX from 'xlsx';
import { ReconRecord } from '../types';

export interface SettlementSummaryRow {
  merchant: string;
  userName: string;
  partner: string;
  txnCount: number;
  txnAmount: number;
  interchange: number;
  switchingFee: number;
  bankShare: number;
  platformFee: number;
  leaHold: number;
  crAdjustment: number;
  chargeback: number;
  chargebackWon: number;
  periodLienAmount: number;
  netSettlement: number;
}

const MERCHANT_CATALOG: Record<string, { merchant: string; userName: string; partner: string }> = {
  'AGNT-1024': { merchant: 'NSDLM0000000015', userName: 'cybercareapi', partner: 'YES BANK' },
  'AGNT-2048': { merchant: 'NSDLM0000000021', userName: 'jayant@sambhavpay.com', partner: 'ICICI BANK' },
  'AGNT-3096': { merchant: 'NSDLM0000000016', userName: 'rajesh@diaspay.in', partner: 'AXIS BANK' },
  'AGNT-4112': { merchant: 'NSDLM0000000022', userName: 'support@iserveu.in', partner: 'HDFC BANK' },
  'AGNT-5020': { merchant: 'NSDLM0000000043', userName: 'fintechops@diaspay.in', partner: 'NSDL Nodal' },
  'AGNT-6180': { merchant: 'NSDLM0000000055', userName: 'paynetapi@connect.in', partner: 'SBI' },
  'AGNT-7220': { merchant: 'NSDLM0000000068', userName: 'merchant@digipay.in', partner: 'Kotak' },
  'AGNT-8900': { merchant: 'NSDLM0000000079', userName: 'billing@globalpay.com', partner: 'IDFC FIRST' },
};

export function generateSettlementData(matchedRecords: ReconRecord[]): SettlementSummaryRow[] {
  const groups: Record<string, { merchant: string; userName: string; partner: string; count: number; amount: number }> = {};

  if (!matchedRecords || matchedRecords.length === 0) {
    // Return sample rows if empty
    return [
      { merchant: 'NSDLM0000000015', userName: 'cybercareapi', partner: '', txnCount: 5, txnAmount: 14591, interchange: 0, switchingFee: 0, bankShare: 29.269546, platformFee: 147.4, leaHold: 0, crAdjustment: 0, chargeback: 0, chargebackWon: 0, periodLienAmount: 0, netSettlement: 14414.33 },
      { merchant: 'NSDLM0000000021', userName: 'jayant@sambhavpay.com', partner: '', txnCount: 243, txnAmount: 940250, interchange: 0, switchingFee: 0, bankShare: 1886.1415, platformFee: 11093.64, leaHold: 0, crAdjustment: 0, chargeback: 0, chargebackWon: 0, periodLienAmount: 0, netSettlement: 927270.22 },
      { merchant: 'NSDLM0000000016', userName: 'rajesh@diaspay.in', partner: '', txnCount: 1, txnAmount: 500, interchange: 0, switchingFee: 0, bankShare: 1.003, platformFee: 3.25, leaHold: 0, crAdjustment: 0, chargeback: 0, chargebackWon: 0, periodLienAmount: 0, netSettlement: 495.75 },
      { merchant: 'NSDLM0000000022', userName: 'rajesh@diaspay.in', partner: '', txnCount: 19, txnAmount: 6100, interchange: 0, switchingFee: 0, bankShare: 12.2366, platformFee: 57.16, leaHold: 0, crAdjustment: 0, chargeback: 0, chargebackWon: 0, periodLienAmount: 0, netSettlement: 6030.60 },
      { merchant: 'NSDLM0000000043', userName: 'rajesh@diaspay.in', partner: '', txnCount: 4657, txnAmount: 1007358, interchange: 0, switchingFee: 0, bankShare: 2020.760148, platformFee: 12746.99, leaHold: 0, crAdjustment: 0, chargeback: 0, chargebackWon: 0, periodLienAmount: 0, netSettlement: 992590.25 },
    ];
  }

  matchedRecords.forEach((record) => {
    const key = record.agentId || 'AGNT-1024';
    if (!groups[key]) {
      const meta = MERCHANT_CATALOG[key] || {
        merchant: `NSDLM${String(Math.abs(key.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0))).padStart(10, '0').slice(0, 10)}`,
        userName: `${key.toLowerCase()}@fintech.in`,
        partner: ''
      };
      groups[key] = {
        merchant: meta.merchant,
        userName: meta.userName,
        partner: meta.partner,
        count: 0,
        amount: 0
      };
    }
    groups[key].count += 1;
    groups[key].amount += record.amount;
  });

  return Object.values(groups).map((g) => {
    const bankShare = Number((g.amount * 0.002006).toFixed(6));
    const platformFee = Number((g.amount * 0.0101).toFixed(2));
    const netSettlement = Number((g.amount - bankShare - platformFee).toFixed(2));

    return {
      merchant: g.merchant,
      userName: g.userName,
      partner: g.partner,
      txnCount: g.count,
      txnAmount: g.amount,
      interchange: 0,
      switchingFee: 0,
      bankShare,
      platformFee,
      leaHold: 0,
      crAdjustment: 0,
      chargeback: 0,
      chargebackWon: 0,
      periodLienAmount: 0,
      netSettlement
    };
  });
}

export function exportSettlementToExcel(
  matchedRecords: ReconRecord[],
  subProduct: string,
  date: string,
  cycle: string
) {
  const settlementData = generateSettlementData(matchedRecords);

  const formattedRows = settlementData.map((row) => ({
    'MERCHANT': row.merchant,
    'userName': row.userName,
    'PARTNER': row.partner,
    'TXN COUNT': row.txnCount,
    'TXN AMOUNT': row.txnAmount,
    'INTERCHANGE (Incl. Gst)': row.interchange,
    'SWITCHING FEE (Incl. Gst)': row.switchingFee,
    'BANK SHARE (Incl. Gst)': row.bankShare,
    'PLATFORM FEE (Incl. Gst)': row.platformFee,
    'LEA HOLD': row.leaHold,
    'CR. ADJUSTMENT': row.crAdjustment,
    'CHARGEBACK': row.chargeback,
    'CHARGEBACK WON': row.chargebackWon,
    'PERIOD LIEN AMOUNT': row.periodLienAmount,
    'NET SETTLEMENT (E-F-G-H-I-J+K-L)': row.netSettlement
  }));

  // Add Total Row
  const totalCount = settlementData.reduce((acc, r) => acc + r.txnCount, 0);
  const totalAmount = settlementData.reduce((acc, r) => acc + r.txnAmount, 0);
  const totalBankShare = Number(settlementData.reduce((acc, r) => acc + r.bankShare, 0).toFixed(6));
  const totalPlatformFee = Number(settlementData.reduce((acc, r) => acc + r.platformFee, 0).toFixed(2));
  const totalNetSettlement = Number(settlementData.reduce((acc, r) => acc + r.netSettlement, 0).toFixed(2));

  formattedRows.push({
    'MERCHANT': 'TOTAL SUMMARY',
    'userName': '',
    'PARTNER': '',
    'TXN COUNT': totalCount,
    'TXN AMOUNT': totalAmount,
    'INTERCHANGE (Incl. Gst)': 0,
    'SWITCHING FEE (Incl. Gst)': 0,
    'BANK SHARE (Incl. Gst)': totalBankShare,
    'PLATFORM FEE (Incl. Gst)': totalPlatformFee,
    'LEA HOLD': 0,
    'CR. ADJUSTMENT': 0,
    'CHARGEBACK': 0,
    'CHARGEBACK WON': 0,
    'PERIOD LIEN AMOUNT': 0,
    'NET SETTLEMENT (E-F-G-H-I-J+K-L)': totalNetSettlement
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedRows, { header: [
    'MERCHANT', 'userName', 'PARTNER', 'TXN COUNT', 'TXN AMOUNT',
    'INTERCHANGE (Incl. Gst)', 'SWITCHING FEE (Incl. Gst)', 'BANK SHARE (Incl. Gst)', 'PLATFORM FEE (Incl. Gst)',
    'LEA HOLD', 'CR. ADJUSTMENT', 'CHARGEBACK', 'CHARGEBACK WON', 'PERIOD LIEN AMOUNT',
    'NET SETTLEMENT (E-F-G-H-I-J+K-L)'
  ] });

  // Set column widths
  worksheet['!cols'] = [
    { wch: 22 }, // MERCHANT
    { wch: 24 }, // userName
    { wch: 14 }, // PARTNER
    { wch: 12 }, // TXN COUNT
    { wch: 16 }, // TXN AMOUNT
    { wch: 22 }, // INTERCHANGE
    { wch: 24 }, // SWITCHING FEE
    { wch: 22 }, // BANK SHARE
    { wch: 22 }, // PLATFORM FEE
    { wch: 12 }, // LEA HOLD
    { wch: 16 }, // CR ADJUSTMENT
    { wch: 14 }, // CHARGEBACK
    { wch: 18 }, // CHARGEBACK WON
    { wch: 20 }, // PERIOD LIEN
    { wch: 32 }  // NET SETTLEMENT
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SETTLEMENT FILE (0.2006%)');

  const dateFormatted = date.replace(/-/g, '');
  const cycleSlug = cycle.toLowerCase().includes('cycle 1')
    ? 'CYCLE1'
    : cycle.toLowerCase().includes('cycle 2')
    ? 'CYCLE2'
    : cycle.toLowerCase().includes('cycle 3')
    ? 'CYCLE3'
    : 'CONSOLIDATED';
  const sanitizedSubProduct = subProduct.toLowerCase().replace(/[^a-z0-9]/g, '');

  const fileName = `${sanitizedSubProduct}_SETTLEMENT_${dateFormatted}_${cycleSlug}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportToExcel(
  records: ReconRecord[],
  subProduct: string,
  type: 'MATCHED' | 'MISMATCHED' | 'CONSOLIDATED_SUMMARY',
  date: string,
  cycle: string
) {
  // Format clean data rows for Excel export
  const formattedRows = records.map((r, index) => {
    const baseRow: Record<string, any> = {
      'S.No': index + 1,
      'Transaction ID': r.txnId,
      'RRN / Ref No': r.rrn,
      'Agent / Merchant ID': r.agentId,
      'Amount (INR)': r.amount,
      'Timestamp': r.timestamp,
      'Channel / Source': r.channel,
      'NPCI Status': r.npciStatus || 'Success',
      'Switch Status': r.switchStatus || 'Success',
      'Middleware Status': r.middlewareStatus || 'Success',
      'Wallet Status': r.walletStatus || 'Success',
      'Reconciliation Status': r.status.toUpperCase()
    };

    if (type === 'MISMATCHED') {
      baseRow['Action to be taken (Discrepancy Reason)'] = r.actionToBeTaken || r.discrepancyReason || 'Unclassified Mismatch';
    } else {
      baseRow['Action to be taken'] = r.actionToBeTaken || 'No Action';
    }

    return baseRow;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedRows);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 22 }, // Txn ID
    { wch: 18 }, // RRN
    { wch: 16 }, // Agent ID
    { wch: 14 }, // Amount
    { wch: 20 }, // Timestamp
    { wch: 22 }, // Channel
    { wch: 14 }, // NPCI
    { wch: 14 }, // Switch
    { wch: 16 }, // Middleware
    { wch: 14 }, // Wallet
    { wch: 18 }, // Status
    { wch: 42 }  // Action to be taken
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  const sheetName = type === 'MATCHED' ? 'Matched Transactions' : 'Mismatched Exceptions';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Format date string for filename e.g. "2026-07-28" -> "20260728"
  const dateFormatted = date.replace(/-/g, '');
  const cycleSlug = cycle.toLowerCase().includes('cycle 1')
    ? 'CYCLE1'
    : cycle.toLowerCase().includes('cycle 2')
    ? 'CYCLE2'
    : cycle.toLowerCase().includes('cycle 3')
    ? 'CYCLE3'
    : 'CONSOLIDATED';

  // Sanitize subProduct name e.g. "NSDL AEPS" -> "nsdlaeps" or "aadharpay"
  const sanitizedSubProduct = subProduct.toLowerCase().replace(/[^a-z0-9]/g, '');

  const fileName = `${sanitizedSubProduct}_${type}_${dateFormatted}_${cycleSlug}.xlsx`;

  // Trigger file download in browser
  XLSX.writeFile(workbook, fileName);
}

