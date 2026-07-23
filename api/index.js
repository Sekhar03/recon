import express from 'express';
import cors from 'cors';
import { getInternalCycleForNpci, getCycleScheduleStatus, CYCLE_MAPPINGS, INTERNAL_CYCLES } from '../server/cycleScheduler.js';
import { runModuleATransactionRecon } from '../server/reconEngine.js';
import { runModuleBCommissionRecon } from '../server/commissionRecon.js';
import { runModuleCPayoutRecon } from '../server/payoutRecon.js';
import { generateGefuFile, detectOOXMLFormat } from '../server/gefuGenerator.js';
import { generateSettlementAndPayoutFiles } from '../server/settlementPayoutEngine.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Reconciliation Report Tool v3.0', timestamp: new Date().toISOString() });
});

// Module A: 4-Way Transaction Recon Endpoint
app.post('/api/v1/module-a/run', (req, res) => {
  const { npciRows = [], switchRows = [], mwRows = [], walletRows = [], cycle = 'Cycle 1' } = req.body;

  // Fallback to sample data if empty arrays uploaded
  let sampleNpci = npciRows;
  let sampleSwitch = switchRows;
  let sampleMw = mwRows;
  let sampleWallet = walletRows;

  if (sampleNpci.length === 0) {
    for (let i = 1; i <= 200; i++) {
      const txnId = `TXN_MOD_A_${i}`;
      const rrn = `612345${String(i).padStart(6, '0')}`;
      const isMismatched = i % 15 === 0;

      sampleNpci.push({
        'TXN ID': txnId,
        'RRN': rrn,
        'SETTLEMENT AMOUNT': 150000,
        'RESPONSE CODE': isMismatched && i % 30 === 0 ? 'PENDING' : '00',
        'payer VPA': `payer${i}@upi`,
        'payee VPA': `merchant@iserveu`
      });

      sampleSwitch.push({
        switch_txn_id: txnId,
        client_ref_id: `MW_${txnId}`,
        rrn,
        amount: 1500.00,
        status: isMismatched && i % 45 === 0 ? 'FAILED' : 'SUCCESS',
        payer_vpa: `payer${i}@upi`
      });

      sampleMw.push({
        Id: `MW_${txnId}`,
        amountTransacted: 1500.00,
        status: isMismatched && i % 15 === 0 ? 'IN_PROGRESS' : 'SUCCESS',
        userName: i % 2 === 0 ? 'merchant_01' : 'merchant_02'
      });

      sampleWallet.push({
        relationalId: `MW_${txnId}`,
        amountTransacted: 1500.00,
        status: 'SUCCESS'
      });
    }
  }

  const result = runModuleATransactionRecon(sampleNpci, sampleSwitch, sampleMw, sampleWallet);
  res.json({ cycle, ...result });
});

// Module B: Commission Recon Endpoint
app.post('/api/v1/module-b/run', (req, res) => {
  const { matchedMwTxns = [], commissionRows = [], cycle = 'Cycle 1' } = req.body;

  let sampleMw = matchedMwTxns;
  let sampleComm = commissionRows;

  if (sampleMw.length === 0) {
    for (let i = 1; i <= 100; i++) {
      const txnId = `TXN_MOD_A_${i}`;
      const isMissing = i % 10 === 0;
      const user = i % 2 === 0 ? 'merchant_01' : 'merchant_02';

      sampleMw.push({
        'Transaction ID': txnId,
        'RRN': `612345${String(i).padStart(6, '0')}`,
        'userName': user,
        'Amount': '1500.00'
      });

      if (!isMissing) {
        sampleComm.push({
          relationalId: txnId,
          relationalAmount: 1500.00,
          amountTransacted: 2.25,
          userName: user,
          tds: 0.22,
          gst: 0.36
        });
      }
    }
  }

  const result = runModuleBCommissionRecon(sampleMw, sampleComm);
  res.json({ cycle, ...result });
});

// Module C: 3-Way Payout Recon Endpoint
app.post('/api/v1/module-c/run', (req, res) => {
  const { payoutRows = [], bankMisRows = [], bankStatementRows = [], cycle = 'Cycle 1' } = req.body;

  let samplePayout = payoutRows;
  let sampleMis = bankMisRows;
  let sampleStmt = bankStatementRows;

  if (samplePayout.length === 0) {
    for (let i = 1; i <= 50; i++) {
      const refNo = `PO_REF_${i}`;
      const isMis = i % 12 === 0;

      samplePayout.push({
        clientReferenceNo: refNo,
        username: `merchant_0${(i % 3) + 1}`,
        amount: 25000.00
      });

      if (i !== 12) {
        sampleMis.push({
          clientReferenceNo: refNo,
          amount: 25000.00,
          status: 'SUCCESS',
          utr: `UTR99001122${i}`
        });
      }

      if (i !== 24) {
        sampleStmt.push({
          clientReferenceNo: refNo,
          amount: 25000.00,
          status: 'DEBITED',
          utr: `UTR99001122${i}`
        });
      }
    }
  }

  const result = runModuleCPayoutRecon(samplePayout, sampleMis, sampleStmt);
  res.json({ cycle, ...result });
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
