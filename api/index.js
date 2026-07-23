import express from 'express';
import cors from 'cors';
import { getInternalCycleForNpci, getCycleScheduleStatus, CYCLE_MAPPINGS, INTERNAL_CYCLES } from '../server/cycleScheduler.js';
import { run4WayReconciliation, RECON_RULES } from '../server/reconEngine.js';
import { generateGefuFile, detectOOXMLFormat } from '../server/gefuGenerator.js';
import { runCommissionReconciliation } from '../server/commissionRecon.js';
import { generateSettlementAndPayoutFiles } from '../server/settlementPayoutEngine.js';
import { runPayoutReconciliation } from '../server/payoutRecon.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory Audit Trail store
let auditLogs = [
  { id: 'AUD-1001', actor: 'Finance Admin', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'CREDIT_ADJUSTMENT_APPROVED', target: 'TXN-98124', reason: 'Verified with URCS portal statement', beforeVal: 'IN_PROGRESS', afterVal: 'SETTLED' },
  { id: 'AUD-1000', actor: 'System Auto-Rule', timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'STATUS_SYNC', target: 'TXN-98120', reason: 'Auto-action Rule #3 triggered', beforeVal: 'IN_PROGRESS', afterVal: 'SUCCESS' }
];

// Active/Historical Jobs Store
let pipelineJobs = [
  {
    jobId: 'UPI-RECON-20260723-01',
    product: 'UPI Recon',
    bank: 'NSDL Payments Bank',
    date: '2026-07-23',
    internalCycle: 'Cycle 1',
    status: 'COMPLETED',
    totalTxns: 12450,
    matchedCount: 12380,
    exceptionCount: 70,
    matchRate: '99.4%',
    gefuStatus: 'VERIFIED_GENERATED',
    gefuFinalSettlement: 1243031.40,
    settlementTotal: 1243031.40,
    hardGatePassed: true,
    payoutRowCount: 14,
    createdAt: new Date().toISOString()
  }
];

// Active Mismatch Queue Store
let activeExceptions = [
  { id: 'NPCI991001', rrn: '612345009901', payerVpa: 'user@upi', payeeVpa: 'merchant@iserveu', amount: 4500.00, userName: 'merchant_01', npciStatus: 'Success', switchStatus: 'Success', mwStatus: 'In Progress', walletStatus: 'N/A', ruleId: 'RULE_2', actionRequired: 'Raise credit adjustment', state: 'exception' },
  { id: 'NPCI991002', rrn: '612345009902', payerVpa: 'buyer@okaxis', payeeVpa: 'retailer@iserveu', amount: 12500.00, userName: 'merchant_02', npciStatus: 'Pending', switchStatus: 'Pending', mwStatus: 'In Progress', walletStatus: 'N/A', ruleId: 'RULE_5', actionRequired: 'Raise RET in URCS portal', state: 'exception' },
  { id: 'NPCI991003', rrn: '612345009903', payerVpa: 'payer@ybl', payeeVpa: 'store@iserveu', amount: 9800.00, userName: 'merchant_03', npciStatus: 'Pending', switchStatus: 'Success', mwStatus: 'Success', walletStatus: 'Success', ruleId: 'RULE_7', actionRequired: 'Raise TCC in URCS portal', state: 'exception' }
];

// Active Payout Exception Store
let activePayoutExceptions = [
  { clientReferenceNo: 'PO_merchant_03_1782910293_01', username: 'merchant_03', beneName: 'MERCHANT STORE ENTERPRISES', payoutAmount: 429156.36, bankMisAmount: 429156.36, bankStmtAmount: null, payoutStatus: 'INITIATED', bankMisStatus: 'SUCCESS', bankStmtStatus: 'MISSING_IN_STMT', utr: 'UTR992819201', failureReason: 'Missing in Bank Statement', actionRequired: 'Escalate to Bank Ops', dispositionStatus: 'PENDING_REVIEW' }
];

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', engine: 'UPI Reconciliation & Settlement Automation Engine v2.0', timestamp: new Date().toISOString() });
});

// Dashboard Stats Summary
app.get('/api/v1/stats', (req, res) => {
  const completedJobs = pipelineJobs.filter(j => (j.status || '').toUpperCase() === 'COMPLETED');
  const totalTxns = completedJobs.reduce((s, j) => s + (j.totalTxns || 0), 0);
  const matchedTxns = completedJobs.reduce((s, j) => s + (j.matchedCount || 0), 0);
  const payoutCount = completedJobs.reduce((s, j) => s + (j.payoutRowCount || 0), 0);
  const openExceptions = activeExceptions.filter(e => e.state !== 'resolved').length;
  const totalSettled = completedJobs.reduce((s, j) => s + (j.settlementTotal || j.gefuFinalSettlement || 0), 0);
  const lastGefuPassed = completedJobs.find(j => j.hardGatePassed);

  res.json({
    totalJobs: pipelineJobs.length,
    completedToday: completedJobs.length,
    matchedRate: totalTxns > 0 ? ((matchedTxns / totalTxns) * 100).toFixed(1) + '%' : 'N/A',
    mismatchCount: totalTxns - matchedTxns,
    runningCount: pipelineJobs.filter(j => (j.status || '').toUpperCase() === 'RUNNING').length,
    activeExceptions: openExceptions,
    totalSettled: totalSettled > 0 ? `₹${(totalSettled / 100000).toFixed(2)}L` : 'N/A',
    gefuStatus: lastGefuPassed ? 'Verified' : 'Pending',
    payoutRows: payoutCount,
    failureReasons: {
      'Status Mismatch (RULE_2)': activeExceptions.filter(e => e.ruleId === 'RULE_2').length,
      'RET Required (RULE_5)': activeExceptions.filter(e => e.ruleId === 'RULE_5').length,
      'TCC Required (RULE_7)': activeExceptions.filter(e => e.ruleId === 'RULE_7').length,
      'Custom Exception': activeExceptions.filter(e => e.ruleId === 'CUSTOM_EXCEPTION').length,
    }
  });
});

// Settlement detail for a specific job
app.get('/api/v1/settlement/:jobId', (req, res) => {
  const job = pipelineJobs.find(j => j.jobId === req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({
    jobId: job.jobId,
    settlementRows: job.settlementRows || [],
    payoutRows: job.payoutRows || [],
    gatePassed: job.hardGatePassed,
    totalSettlementAmount: job.settlementTotal,
    gefuFinalSettlementAmount: job.gefuFinalSettlement,
    variance: Math.abs((job.settlementTotal || 0) - (job.gefuFinalSettlement || 0)).toFixed(2),
    payoutRowCount: job.payoutRowCount || 0
  });
});

// 3.1 Cycle Schedule & Cut-off Status
app.get('/api/v1/cycles/schedule', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  res.json({
    date,
    cycleMappings: CYCLE_MAPPINGS,
    internalCycles: getCycleScheduleStatus(date)
  });
});

// Dynamic Rules Matrix Configuration
app.get('/api/v1/rules', (req, res) => {
  res.json(RECON_RULES);
});

// Trigger End-to-End UPI Recon & Settlement Pipeline
app.post('/api/v1/pipeline/run', (req, res) => {
  const { internalCycle = 'Cycle 1', date = new Date().toISOString().split('T')[0], mockTxnCount = 500, bankShareRate = 0.002006 } = req.body;
  const jobId = `UPI-RECON-${date.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;

  // Generate synthetic 4-source transaction data for testing
  const npciRows = [];
  const switchRows = [];
  const mwRows = [];
  const walletRows = [];
  const commissionRows = [];

  const merchants = ['merchant_01', 'merchant_02', 'merchant_03', 'merchant_04'];

  for (let i = 1; i <= mockTxnCount; i++) {
    const txnId = `TXN${Date.now()}${String(i).padStart(4, '0')}`;
    const rrn = `6123450${String(i).padStart(5, '0')}`;
    const isException = i % 20 === 0; // ~5% exception rate
    const merchant = merchants[i % merchants.length];

    const npciAmt = (Math.random() * 8000 + 100).toFixed(2);

    npciRows.push({
      'TXN ID': txnId,
      'RRN': rrn,
      'SETTLEMENT AMOUNT': npciAmt,
      'RESPONSE CODE': isException && i % 40 === 0 ? 'PENDING' : '00',
      'payer VPA': `customer${i}@upi`,
      'payee VPA': `${merchant}@iserveu`,
      'TXN DATE': date
    });

    switchRows.push({
      switch_txn_id: txnId,
      rrn: rrn,
      amount: npciAmt,
      client_ref_id: `MW_REF_${txnId}`,
      status: isException && i % 60 === 0 ? 'FAILED' : 'SUCCESS',
      response_code: '00'
    });

    mwRows.push({
      Id: `MW_REF_${txnId}`,
      amountTransacted: npciAmt,
      status: isException && i % 20 === 0 ? 'IN_PROGRESS' : 'SUCCESS',
      userName: merchant
    });

    walletRows.push({
      relationalId: `MW_REF_${txnId}`,
      amountTransacted: npciAmt,
      status: 'SUCCESS'
    });

    if (!isException) {
      commissionRows.push({
        relationalId: `MW_REF_${txnId}`,
        relationalAmount: npciAmt,
        amountTransacted: (parseFloat(npciAmt) * 0.0015).toFixed(2),
        tds: (parseFloat(npciAmt) * 0.00015).toFixed(2),
        taxable: (parseFloat(npciAmt) * 0.00135).toFixed(2),
        gst: (parseFloat(npciAmt) * 0.000243).toFixed(2)
      });
    }
  }

  // 1. Run 4-Way Match Engine
  const reconResult = run4WayReconciliation(npciRows, switchRows, mwRows, walletRows);

  // 2. Run Commission Recon
  const commResult = runCommissionReconciliation(reconResult.matchedList, commissionRows);

  // 3. Generate GEFU File & Control Totals
  const gefuResult = generateGefuFile({
    grossAmount: reconResult.matchedList.reduce((acc, t) => acc + t.amount, 0),
    switchingFee: reconResult.matchedList.reduce((acc, t) => acc + t.amount, 0) * 0.0005,
    switchingFeeGst: reconResult.matchedList.reduce((acc, t) => acc + t.amount, 0) * 0.00009,
    surchargeFee: 250.00
  }, date.replace(/-/g, ''));

  // 4. Run Merchant Settlement Calculation & Payout Split Engine
  const settlementResult = generateSettlementAndPayoutFiles(reconResult.matchedList, gefuResult.finalSettlementAmount);

  // 5. Run 3-Way Payout Match Engine
  const payoutReconResult = runPayoutReconciliation(settlementResult.payoutRows, settlementResult.payoutRows.slice(0, -1), settlementResult.payoutRows.slice(0, -1));

  // Store exceptions for dashboard review
  activeExceptions.unshift(...reconResult.exceptionQueue);
  activePayoutExceptions.unshift(...payoutReconResult.payoutExceptions);

  const jobRecord = {
    jobId,
    product: 'UPI Recon',
    bank: 'NSDL Payments Bank',
    date,
    internalCycle,
    status: 'COMPLETED',
    totalTxns: reconResult.totalProcessed,
    matchedCount: reconResult.matchedCount,
    exceptionCount: reconResult.exceptionCount,
    matchRate: reconResult.matchRate,
    gefuStatus: gefuResult.controlTotals.verified ? 'VERIFIED_GENERATED' : 'CONTROL_TOTAL_MISMATCH',
    gefuFinalSettlement: gefuResult.finalSettlementAmount,
    settlementTotal: parseFloat(settlementResult.totalSettlementAmount),
    hardGatePassed: settlementResult.gatePassed,
    payoutRowCount: settlementResult.payoutRowCount,
    payoutMatchRate: payoutReconResult.payoutMatchRate,
    gefuFlatFileContent: gefuResult.gefuFlatFileContent,
    gefuAccountingLedger: gefuResult.accountingLedger,
    settlementRows: settlementResult.settlementRows,
    payoutRows: settlementResult.payoutRows,
    createdAt: new Date().toISOString()
  };

  pipelineJobs.unshift(jobRecord);

  res.status(201).json({
    job: jobRecord,
    reconResult,
    commResult,
    gefuResult: {
      processDate: gefuResult.processDate,
      controlTotals: gefuResult.controlTotals,
      finalSettlementAmount: gefuResult.finalSettlementAmount,
      stagingTable: gefuResult.stagingTable
    },
    settlementResult,
    payoutReconResult
  });
});

// Get GEFU File Content
app.get('/api/v1/gefu/:jobId', (req, res) => {
  const job = pipelineJobs.find(j => j.jobId === req.params.jobId);
  if (!job) {
    const defaultGefu = generateGefuFile({ grossAmount: 5000000 });
    return res.json({
      processDate: defaultGefu.processDate,
      controlTotals: defaultGefu.controlTotals,
      gefuFlatFileContent: defaultGefu.gefuFlatFileContent,
      accountingLedger: defaultGefu.accountingLedger
    });
  }
  res.json({
    jobId: job.jobId,
    processDate: job.date.replace(/-/g, ''),
    gefuStatus: job.gefuStatus,
    gefuFlatFileContent: job.gefuFlatFileContent,
    accountingLedger: job.gefuAccountingLedger
  });
});

// Check OOXML format helper endpoint
app.post('/api/v1/files/validate-ooxml', (req, res) => {
  const { fileName = 'NTSL_Report.xls' } = req.body;
  // Simulating detection logic
  const check = detectOOXMLFormat(Buffer.from([0x50, 0x4B, 0x03, 0x04]), fileName);
  res.json({
    fileName,
    ...check,
    note: check.isMismatch ? 'NTSL file arrives with .xls extension but is actual OOXML (.xlsx). Auto-parser enabled.' : 'Valid format.'
  });
});

// Exceptions List & Disposition Action
app.get('/api/v1/exceptions', (req, res) => {
  res.json({
    transactionExceptions: activeExceptions,
    payoutExceptions: activePayoutExceptions
  });
});

app.post('/api/v1/exceptions/disposition', (req, res) => {
  const { exceptionId, action, actor = 'Reviewer Ops', reason = 'Manual review completed' } = req.body;
  const index = activeExceptions.findIndex(e => e.id === exceptionId);

  if (index !== -1) {
    const item = activeExceptions[index];
    const prevVal = item.state;
    item.state = 'resolved';
    item.dispositionAction = action;

    auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      actor,
      timestamp: new Date().toISOString(),
      action: action || 'DISPOSITION_APPROVED',
      target: item.id || item.rrn,
      reason,
      beforeVal: prevVal,
      afterVal: 'RESOLVED'
    });

    return res.json({ success: true, item, message: `Exception ${exceptionId} dispositioned as ${action}` });
  }

  res.status(404).json({ error: 'Exception record not found' });
});

// Audit Log endpoint
app.get('/api/v1/audit-logs', (req, res) => {
  res.json(auditLogs);
});

// List pipeline history jobs
app.get('/api/v1/history', (req, res) => {
  res.json(pipelineJobs);
});

export default app;
