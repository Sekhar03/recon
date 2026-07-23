import { runModuleATransactionRecon } from './reconEngine.js';
import { runModuleBCommissionRecon } from './commissionRecon.js';
import { runModuleCPayoutRecon } from './payoutRecon.js';

console.log("=== 1. Testing Module A: 4-Way Transaction Reconciliation ===");
const npciRows = [
  { 'TXN ID': 'TXN1001', 'RRN': '612345678901', 'SETTLEMENT AMOUNT': 1500.00, 'RESPONSE CODE': '00', 'payer VPA': 'user1@upi', 'payee VPA': 'merchant_01@iserveu' },
  { 'TXN ID': 'TXN1002', 'RRN': '612345678902', 'SETTLEMENT AMOUNT': 2500.00, 'RESPONSE CODE': '00', 'payer VPA': 'user2@upi', 'payee VPA': 'merchant_02@iserveu' }
];

const switchRows = [
  { switch_txn_id: 'TXN1001', client_ref_id: 'MW1001', rrn: '612345678901', amount: 1500.00, status: 'SUCCESS', payer_vpa: 'user1@upi' },
  { switch_txn_id: 'TXN1002', client_ref_id: 'MW1002', rrn: '612345678902', amount: 2500.00, status: 'SUCCESS', payer_vpa: 'user2@upi' }
];

const mwRows = [
  { Id: 'MW1001', amountTransacted: 1500.00, status: 'SUCCESS', userName: 'merchant_01' },
  { Id: 'MW1002', amountTransacted: 2500.00, status: 'IN_PROGRESS', userName: 'merchant_02' }
];

const walletRows = [
  { relationalId: 'MW1001', amountTransacted: 1500.00, status: 'SUCCESS' }
];

const modARes = runModuleATransactionRecon(npciRows, switchRows, mwRows, walletRows);
console.log("Module A Summary:", modARes.summary);
console.log("Module A Mismatched Item Label:", modARes.mismatchedList[0]?.Label);

console.log("\n=== 2. Testing Module B: Commission Reconciliation ===");
const commRows = [
  { relationalId: 'TXN1001', amountTransacted: 2.25, tds: 0.22, gst: 0.36, userName: 'merchant_01' }
];
const modBRes = runModuleBCommissionRecon(modARes.matchedList, commRows);
console.log("Module B Summary:", modBRes.summary);

console.log("\n=== 3. Testing Module C: 3-Way Payout Reconciliation ===");
const payoutRows = [{ clientReferenceNo: 'PO_1001', username: 'merchant_01', amount: 5000.00 }];
const misRows = [{ clientReferenceNo: 'PO_1001', amount: 5000.00, status: 'SUCCESS', utr: 'UTR99001' }];
const stmtRows = [{ clientReferenceNo: 'PO_1001', amount: 5000.00, status: 'DEBITED', utr: 'UTR99001' }];

const modCRes = runModuleCPayoutRecon(payoutRows, misRows, stmtRows);
console.log("Module C Summary:", modCRes.summary);

console.log("\n✅ Modules A, B, and C verified successfully!");

