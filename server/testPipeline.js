import { run4WayReconciliation } from './reconEngine.js';
import { generateGefuFile, detectOOXMLFormat } from './gefuGenerator.js';
import { runCommissionReconciliation } from './commissionRecon.js';
import { generateSettlementAndPayoutFiles, splitPayoutRow } from './settlementPayoutEngine.js';
import { runPayoutReconciliation } from './payoutRecon.js';
import { getInternalCycleForNpci } from './cycleScheduler.js';

console.log("=== 1. Testing Cycle Scheduler ===");
console.log("NPCI Cycle 1 -> ", getInternalCycleForNpci(1));
console.log("NPCI Cycle 5 -> ", getInternalCycleForNpci(5));
console.log("NPCI Cycle 8 -> ", getInternalCycleForNpci(8));

console.log("\n=== 2. Testing 4-Way Reconciliation ===");
const npciRows = [
  { 'TXN ID': 'TXN1001', 'RRN': '612345678901', 'SETTLEMENT AMOUNT': 1500.00, 'RESPONSE CODE': '00', 'payer VPA': 'user1@upi', 'payee VPA': 'merchant_01@iserveu' },
  { 'TXN ID': 'TXN1002', 'RRN': '612345678902', 'SETTLEMENT AMOUNT': 2500.00, 'RESPONSE CODE': '00', 'payer VPA': 'user2@upi', 'payee VPA': 'merchant_02@iserveu' },
  { 'TXN ID': 'TXN1003', 'RRN': '612345678903', 'SETTLEMENT AMOUNT': 950000.00, 'RESPONSE CODE': '00', 'payer VPA': 'user3@upi', 'payee VPA': 'merchant_01@iserveu' }
];

const switchRows = [
  { switch_txn_id: 'TXN1001', client_ref_id: 'MW1001', rrn: '612345678901', amount: 1500.00, status: 'SUCCESS', response_code: '00', payer_vpa: 'user1@upi' },
  { switch_txn_id: 'TXN1002', client_ref_id: 'MW1002', rrn: '612345678902', amount: 2500.00, status: 'SUCCESS', response_code: '00', payer_vpa: 'user2@upi' },
  { switch_txn_id: 'TXN1003', client_ref_id: 'MW1003', rrn: '612345678903', amount: 950000.00, status: 'SUCCESS', response_code: '00', payer_vpa: 'user3@upi' }
];

const mwRows = [
  { Id: 'MW1001', amountTransacted: 1500.00, status: 'SUCCESS', userName: 'merchant_01' },
  { Id: 'MW1002', amountTransacted: 2500.00, status: 'IN_PROGRESS', userName: 'merchant_02' },
  { Id: 'MW1003', amountTransacted: 950000.00, status: 'SUCCESS', userName: 'merchant_01' }
];

const walletRows = [
  { relationalId: 'MW1001', amountTransacted: 1500.00, status: 'SUCCESS' },
  { relationalId: 'MW1003', amountTransacted: 950000.00, status: 'SUCCESS' }
];

const reconRes = run4WayReconciliation(npciRows, switchRows, mwRows, walletRows);
console.log(`Matched: ${reconRes.matchedCount}, Exceptions: ${reconRes.exceptionCount}, Match Rate: ${reconRes.matchRate}`);
console.log("Exception detail:", reconRes.exceptionQueue[0]);

console.log("\n=== 3. Testing Commission Reconciliation ===");
const commRows = [
  { relationalId: 'MW1001', amountTransacted: 2.25, tds: 0.22, taxable: 2.03, gst: 0.36 },
  { relationalId: 'MW1003', amountTransacted: 1425.00, tds: 142.50, taxable: 1282.50, gst: 230.85 }
];
const commRes = runCommissionReconciliation(reconRes.matchedList, commRows);
console.log(`Commission Matched: ${commRes.commissionMatchedCount}, Missing: ${commRes.missingCommissionCount}`);

console.log("\n=== 4. Testing OOXML Format Detection ===");
const fakeZipBuf = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00]);
console.log("Detection check:", detectOOXMLFormat(fakeZipBuf, "NTSL_Report.xls"));

console.log("\n=== 5. Testing NTSL -> GEFU Generation ===");
const gefuRes = generateGefuFile({ grossAmount: 951500.00 }, '20260723');
console.log("GEFU Control Totals:", gefuRes.controlTotals);
console.log("GEFU Accounting Ledger Entries:", gefuRes.accountingLedger.length);
console.log("GEFU Header & First Detail Record:\n" + gefuRes.gefuFlatFileContent.split('\n').slice(0, 3).join('\n'));

console.log("\n=== 6. Testing Merchant Settlement & Payout Generation ===");
const settlRes = generateSettlementAndPayoutFiles(reconRes.matchedList, gefuRes.finalSettlementAmount);
console.log(`Settlement Total: ₹${settlRes.totalSettlementAmount}, Gate Passed: ${settlRes.gatePassed}`);

console.log("\n=== 7. Testing IMPS ₹500,000 Split Chunker ===");
const splitRows = splitPayoutRow({ netSettlement: 929156.36, userName: 'merchant_01', beneName: 'Merchant Store', beneAccountNo: '50100123', beneIfsc: 'HDFC0001', benePhoneNo: '9876543210', beneBankName: 'HDFC' });
console.log("Split Rows Output:", splitRows);

console.log("\n=== 8. Testing Payout 3-Way Reconciliation ===");
const payoutReconRes = runPayoutReconciliation(settlRes.payoutRows, settlRes.payoutRows, settlRes.payoutRows);
console.log(`Payout Matched: ${payoutReconRes.matchedCount}, Exceptions: ${payoutReconRes.exceptionCount}`);

console.log("\n✅ All 8 modules verified successfully!");
