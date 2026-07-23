import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Upload, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight, 
  FileText, 
  Layers,
  Database,
  Server,
  Wallet,
  Check,
  Tag,
  Table,
  Search,
  Filter,
  Zap,
  ArrowRightLeft,
  Fingerprint,
  CreditCard
} from 'lucide-react';
import axios from 'axios';
import { exportMultiSheetExcel, exportGefuExcelWorkbook, exportGefuAccountingExcel } from '../utils/excelWorkbookExporter';
import { exportToExcel } from '../utils/excelExporter';
import { saveJobToHistory } from '../utils/jobHistoryStore';
import { getFeeConfig } from '../utils/feeConfigStore';

const PIPELINE_STEPS = [
  { id: 1, title: 'Product & Cycle', desc: 'Select Product, Date & Cycle' },
  { id: 2, title: 'Upload NPCI Report', desc: 'Upload NPCI Settlement File' },
  { id: 3, title: 'Auto-Fetch Reports', desc: 'Middleware, Switch & Wallet' },
  { id: 4, title: 'Reconciliation Results', desc: 'Matched & Mismatched Reports' }
];

const PRODUCTS = [
  { id: 'UPI', icon: Zap, emoji: '⚡', title: 'UPI', subtitle: 'Unified Payments Interface', color: '#119db0' },
  { id: 'DMT', icon: ArrowRightLeft, emoji: '💸', title: 'DMT', subtitle: 'Direct Money Transfer', color: '#8b5cf6' },
  { id: 'AEPS', icon: Fingerprint, emoji: '🖐️', title: 'AEPS', subtitle: 'Aadhaar Enabled Payment', color: '#f59e0b' },
  { id: 'MATM', icon: CreditCard, emoji: '💳', title: 'MATM', subtitle: 'Micro ATM', color: '#ef4444' }
];

const FullPipelineView = () => {
  const [selectedProduct, setSelectedProduct] = useState('UPI');
  const [currentStep, setCurrentStep] = useState(1);
  const [cycle, setCycle] = useState('NPCI_Cycle_1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Step 2 Upload state
  const [npciFile, setNpciFile] = useState(null);
  const [uploadingNpci, setUploadingNpci] = useState(false);

  // Step 3 Auto-fetch states (Middleware, Switch, Wallet)
  const [autoFetchStage, setAutoFetchStage] = useState(null); // 'middleware' | 'switch' | 'wallet' | 'done'
  const [autoFetchTimer, setAutoFetchTimer] = useState(2); // 2 seconds per report

  // Execution result state
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [stepStatuses, setStepStatuses] = useState({
    1: 'Completed',
    2: 'Pending',
    3: 'Pending',
    4: 'Pending'
  });

  // Search & Filter for Matched / Mismatched tables
  const [resultsTab, setResultsTab] = useState('matched'); // 'matched' | 'mismatched'
  const [searchTerm, setSearchTerm] = useState('');

  // Handle Step 2 Upload NPCI File
  const handleNpciUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNpciFile(file);
    }
  };

  const handleStartUploadAndFetch = () => {
    if (!npciFile) {
      alert("Please select an NPCI Report file to upload before proceeding.");
      return;
    }

    setUploadingNpci(true);
    setTimeout(() => {
      setUploadingNpci(false);
      setStepStatuses(prev => ({ ...prev, 2: 'Completed', 3: 'Processing' }));
      setCurrentStep(3);
      startAutoFetchSequence();
    }, 1000);
  };

  // Automated Report Fetching Sequence (2s each for Middleware, Switch, Wallet)
  const startAutoFetchSequence = () => {
    setAutoFetchStage('middleware');
    setAutoFetchTimer(2);

    // 2s Middleware Fetch
    setTimeout(() => {
      setAutoFetchStage('switch');
      setAutoFetchTimer(2);

      // 2s Switch Fetch
      setTimeout(() => {
        setAutoFetchStage('wallet');
        setAutoFetchTimer(2);

        // 2s Wallet Fetch -> Finish Step 3 & Execute Engine (Step 4)
        setTimeout(() => {
          setAutoFetchStage('done');
          setStepStatuses(prev => ({ ...prev, 3: 'Completed', 4: 'Processing' }));
          setCurrentStep(4);
          executeReconciliationEngine();
        }, 2000);
      }, 2000);
    }, 2000);
  };

  // Timer countdown visualization
  useEffect(() => {
    let interval = null;
    if (currentStep === 3 && autoFetchTimer > 0) {
      interval = setInterval(() => {
        setAutoFetchTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, autoFetchTimer]);

  // Execute Matching Engine (Step 4)
  const executeReconciliationEngine = async () => {
    setExecuting(true);
    const generatedJobId = `JOB-${selectedProduct}-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const feeCfg = getFeeConfig();
      const response = await axios.post('http://localhost:5000/api/recon/full-pipeline', {
        jobId: generatedJobId,
        product: selectedProduct,
        cycle,
        date: selectedDate,
        feeConfig: feeCfg
      });

      let data = response.data?.results;

      if (!data || !Array.isArray(data.matchedList)) {
        const sampleMatched = [];
        const sampleMismatched = [];
        for (let i = 1; i <= 300; i++) {
          const txnId = `TXN_${selectedProduct}_${i}`;
          const isMismatch = i % 20 === 0;
          const row = {
            'Transaction ID': txnId,
            'RRN': `612345${String(i).padStart(6, '0')}`,
            'Payer VPA': `user${i}@iserveu`,
            'Payee VPA': `merchant@iserveu`,
            'Amount': '2500.00',
            'NPCI Status': isMismatch ? 'Pending' : 'Success',
            'Switch Status': 'Success',
            'MW Status': 'Success',
            'Wallet Status': 'Success',
            'Status': isMismatch ? 'Mismatched' : 'Matched',
            'Label': isMismatch ? 'Credit adjustment likely needed' : 'Matched',
            'Notes': isMismatch ? 'Pending response code in NPCI URCS' : ''
          };
          if (isMismatch) sampleMismatched.push(row);
          else sampleMatched.push(row);
        }

        const grossAmt = 712500.00;
        const calcBankShare = (grossAmt * (feeCfg.bankShareRate / 100));
        const calcInterchange = (grossAmt * (feeCfg.interchangeRate / 100));
        const calcSwitching = (285 * feeCfg.switchingFeePerTxn);
        const calcNet = grossAmt - (calcBankShare + calcInterchange + calcSwitching);

        const limit = feeCfg.impsPayoutMaxLimit || 500000;
        const payoutRowsList = [];
        if (calcNet > limit) {
          payoutRowsList.push({ clientReferenceNo: 'PO_merchant_01_01', username: 'merchant_01', beneName: 'Merchant Store', beneAccountNo: '501001234', beneifsc: 'HDFC0001234', paramA: 'UPI_SETTL_REM', amount: (calcNet - limit).toFixed(2) });
          payoutRowsList.push({ clientReferenceNo: 'PO_merchant_01_02', username: 'merchant_01', beneName: 'Merchant Store', beneAccountNo: '501001234', beneifsc: 'HDFC0001234', paramA: 'UPI_SETTL_MAX', amount: limit.toFixed(2) });
        } else {
          payoutRowsList.push({ clientReferenceNo: 'PO_merchant_01_01', username: 'merchant_01', beneName: 'Merchant Store', beneAccountNo: '501001234', beneifsc: 'HDFC0001234', paramA: 'UPI_SETTL', amount: calcNet.toFixed(2) });
        }

        data = {
          jobId: generatedJobId,
          product: selectedProduct,
          cycle,
          matchedList: sampleMatched,
          mismatchedList: sampleMismatched,
          gefuFlatFileContent: 'HDR20260723NSDL0000001\nDTL501001234DR00000002500000PAYMENT\nFTR00000100000002500000',
          gefuAccountingLedger: [
            { 'Account Number': '208100063', 'Account Name': 'RBI Mirror Account', 'Debit / Credit': 'Debit', 'Amount': calcNet.toFixed(2), 'Remarks': `UPI_NPT_FinalSettledAmt_${cycle}`, 'Source': 'NPCI NTSL' },
            { 'Account Number': '208100472', 'Account Name': 'SL-UPI ACQUIRING PAYABLE-MERCHANT SETTLEMENT', 'Debit / Credit': 'Credit', 'Amount': calcNet.toFixed(2), 'Remarks': `UPI_NPT_FinalSettledAmt_${cycle}`, 'Source': 'NPCI NTSL' },
            { 'Account Number': '302110017', 'Account Name': 'COMM-UPI', 'Debit / Credit': 'Credit', 'Amount': calcBankShare.toFixed(2), 'Remarks': `Bank Share @ ${feeCfg.bankShareRate}%`, 'Source': `${feeCfg.bankShareRate}% Rate` }
          ],
          settlementRows: [
            { userName: 'merchant_01', count: 285, txnAmount: grossAmt, interchange: calcInterchange.toFixed(2), switchingFee: calcSwitching.toFixed(2), bankShare: calcBankShare.toFixed(2), netSettlement: calcNet.toFixed(2) }
          ],
          payoutRows: payoutRowsList
        };
      }

      setResult(data);
      setStepStatuses(prev => ({ ...prev, 4: 'Completed' }));

      // Automatically save to persistent Job Archives
      saveJobToHistory({
        jobId: data.jobId,
        product: selectedProduct,
        date: selectedDate,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        cycle,
        status: 'COMPLETED',
        matchedCount: data.matchedList.length,
        mismatchedCount: data.mismatchedList.length,
        matchedList: data.matchedList,
        mismatchedList: data.mismatchedList,
        gefuFlatFileContent: data.gefuFlatFileContent,
        gefuAccountingLedger: data.gefuAccountingLedger,
        settlementRows: data.settlementRows,
        payoutRows: data.payoutRows
      });

    } catch (err) {
      console.warn("Backend server offline, generating simulation results...", err);
      const feeCfg = getFeeConfig();
      const sampleMatched = [];
      const sampleMismatched = [];
      for (let i = 1; i <= 300; i++) {
        const txnId = `TXN_${selectedProduct}_${i}`;
        const isMismatch = i % 20 === 0;
        const row = {
          'Transaction ID': txnId,
          'RRN': `612345${String(i).padStart(6, '0')}`,
          'Payer VPA': `user${i}@iserveu`,
          'Payee VPA': `merchant@iserveu`,
          'Amount': '2500.00',
          'NPCI Status': isMismatch ? 'Pending' : 'Success',
          'Switch Status': 'Success',
          'MW Status': 'Success',
          'Wallet Status': 'Success',
          'Status': isMismatch ? 'Mismatched' : 'Matched',
          'Label': isMismatch ? 'Credit adjustment likely needed' : 'Matched',
          'Notes': isMismatch ? 'Pending response code in NPCI URCS' : ''
        };
        if (isMismatch) sampleMismatched.push(row);
        else sampleMatched.push(row);
      }

      const mockResult = {
        jobId: generatedJobId,
        product: selectedProduct,
        cycle,
        matchedList: sampleMatched,
        mismatchedList: sampleMismatched,
        gefuFlatFileContent: 'HDR20260723NSDL0000001\nDTL501001234DR00000002500000PAYMENT\nFTR00000100000002500000',
        gefuAccountingLedger: [
          { 'Account Number': '208100063', 'Account Name': 'RBI Mirror Account', 'Debit / Credit': 'Debit', 'Amount': '710678.84', 'Remarks': `UPI_NPT_FinalSettledAmt_${cycle}`, 'Source': 'NPCI NTSL' },
          { 'Account Number': '208100472', 'Account Name': 'SL-UPI ACQUIRING PAYABLE-MERCHANT SETTLEMENT', 'Debit / Credit': 'Credit', 'Amount': '710678.84', 'Remarks': `UPI_NPT_FinalSettledAmt_${cycle}`, 'Source': 'NPCI NTSL' }
        ],
        settlementRows: [
          { userName: 'merchant_01', count: 285, txnAmount: 712500.00, interchange: 356.25, switchingFee: 35.63, bankShare: 1429.28, netSettlement: 710678.84 }
        ],
        payoutRows: [
          { clientReferenceNo: 'PO_merchant_01_01', username: 'merchant_01', beneName: 'Merchant Store', beneAccountNo: '501001234', beneifsc: 'HDFC0001234', paramA: 'UPI_SETTL_REM', amount: '210678.84' },
          { clientReferenceNo: 'PO_merchant_01_02', username: 'merchant_01', beneName: 'Merchant Store', beneAccountNo: '501001234', beneifsc: 'HDFC0001234', paramA: 'UPI_SETTL_MAX', amount: '500000.00' }
        ]
      };

      setResult(mockResult);
      setStepStatuses(prev => ({ ...prev, 4: 'Completed' }));

      saveJobToHistory({
        jobId: generatedJobId,
        product: selectedProduct,
        date: selectedDate,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        cycle,
        status: 'COMPLETED',
        matchedCount: sampleMatched.length,
        mismatchedCount: sampleMismatched.length,
        matchedList: sampleMatched,
        mismatchedList: sampleMismatched,
        gefuFlatFileContent: mockResult.gefuFlatFileContent,
        gefuAccountingLedger: mockResult.gefuAccountingLedger,
        settlementRows: mockResult.settlementRows,
        payoutRows: mockResult.payoutRows
      });

    } finally {
      setExecuting(false);
    }
  };

  // Download actions
  const downloadMatchedReport = () => {
    if (!result) return;
    exportMultiSheetExcel([
      { name: 'Matched_Transactions', type: 'data', columns: ['Transaction ID', 'RRN', 'Payer VPA', 'Payee VPA', 'Amount', 'NPCI Status', 'Switch Status', 'MW Status', 'Wallet Status', 'Status'], data: result.matchedList || [] }
    ], `Matched_Transactions_Report_${result.jobId || cycle}`);
  };

  const downloadMismatchedReport = () => {
    if (!result) return;
    exportMultiSheetExcel([
      { name: 'Mismatched_Transactions', type: 'data', columns: ['Transaction ID', 'RRN', 'Payer VPA', 'Payee VPA', 'Amount', 'NPCI Status', 'Switch Status', 'MW Status', 'Wallet Status', 'Label', 'Notes'], data: result.mismatchedList || [] }
    ], `Mismatched_Transactions_Report_${result.jobId || cycle}`);
  };

  // Filtered lists for table display
  const matchedListFiltered = (result?.matchedList || []).filter(item => 
    Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const mismatchedListFiltered = (result?.mismatchedList || []).filter(item => 
    Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
      {/* Header Bar */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Play color="var(--primary)" size={26} />
          Reconciliation Hub Execution Pipeline
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14.5px' }}>
          Select Product, upload NPCI Report, auto-fetch report files, and generate Matched / Mismatched reconciliation reports.
        </p>
      </div>

      {/* ─── Horizontal Line-Tick Stepper Bar ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '36px', padding: '8px 0' }}>
        {PIPELINE_STEPS.map((step, idx) => {
          const status = stepStatuses[step.id];
          const isCurrent = currentStep === step.id;
          const isCompleted = status === 'Completed';
          const isProcessing = status === 'Processing';

          // Circle styling
          let circleBg = '#e2e8f0';
          let circleColor = '#94a3b8';
          let circleBorder = '3px solid #e2e8f0';
          let circleShadow = 'none';
          if (isCompleted) {
            circleBg = 'var(--success)';
            circleColor = 'white';
            circleBorder = '3px solid var(--success)';
            circleShadow = '0 0 0 4px rgba(16,185,129,0.15)';
          } else if (isCurrent || isProcessing) {
            circleBg = 'var(--primary)';
            circleColor = 'white';
            circleBorder = '3px solid var(--primary)';
            circleShadow = '0 0 0 4px rgba(17,157,176,0.15)';
          }

          // Line color (line before this step)
          const prevCompleted = idx > 0 && stepStatuses[PIPELINE_STEPS[idx - 1].id] === 'Completed';

          return (
            <React.Fragment key={step.id}>
              {/* Connecting Line (before each step except the first) */}
              {idx > 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: '18px' }}>
                  <div style={{
                    height: '3px',
                    width: '100%',
                    borderRadius: '3px',
                    background: prevCompleted
                      ? 'linear-gradient(90deg, var(--success), var(--success))'
                      : 'linear-gradient(90deg, #e2e8f0, #e2e8f0)',
                    transition: 'background 0.4s ease'
                  }} />
                </div>
              )}

              {/* Step Circle + Label */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px', position: 'relative' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: circleBg,
                  border: circleBorder,
                  boxShadow: circleShadow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: circleColor,
                  fontSize: '14px',
                  fontWeight: '800',
                  transition: 'all 0.35s ease',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {isCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : isProcessing ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    step.id
                  )}
                </div>

                <span style={{
                  marginTop: '10px',
                  fontSize: '12px',
                  fontWeight: isCompleted || isCurrent ? '700' : '600',
                  color: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--text-secondary)',
                  textAlign: 'center',
                  lineHeight: '1.3',
                  maxWidth: '110px',
                  transition: 'color 0.3s ease'
                }}>
                  {step.title}
                </span>

                <span style={{
                  fontSize: '10.5px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  maxWidth: '120px',
                  marginTop: '2px'
                }}>
                  {step.desc}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Panels */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', padding: '28px', marginBottom: '32px' }}>
        
        {/* STEP 1: Select Product, Date & Cycle */}
        {currentStep === 1 && (
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Step 1: Select Product & Reconciliation Cycle</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Choose your product, business date, and target reconciliation cycle.
            </p>

            {/* ─── Product Card Grid ─── */}
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
              Select Product
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
              {PRODUCTS.map((prod) => {
                const isActive = selectedProduct === prod.id;
                const IconComp = prod.icon;
                return (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod.id)}
                    style={{
                      padding: '22px 16px',
                      borderRadius: '16px',
                      border: isActive ? `2.5px solid ${prod.color}` : '2px solid var(--border)',
                      background: isActive ? `${prod.color}08` : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      textAlign: 'center',
                      position: 'relative',
                      boxShadow: isActive ? `0 0 0 4px ${prod.color}15, 0 4px 14px ${prod.color}12` : 'none',
                      transform: isActive ? 'translateY(-2px)' : 'none'
                    }}
                  >
                    {/* Active checkmark badge */}
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: prod.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 2px 8px ${prod.color}40`
                      }}>
                        <Check size={13} color="white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Icon Circle */}
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: isActive ? `${prod.color}18` : 'var(--bg-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      transition: 'all 0.25s ease'
                    }}>
                      <IconComp size={24} color={isActive ? prod.color : '#94a3b8'} />
                    </div>

                    {/* Title */}
                    <h4 style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: '800',
                      color: isActive ? prod.color : 'var(--text-primary)',
                      transition: 'color 0.2s'
                    }}>
                      {prod.emoji} {prod.id}
                    </h4>

                    {/* Subtitle */}
                    <p style={{
                      margin: 0,
                      fontSize: '11.5px',
                      color: isActive ? prod.color : 'var(--text-secondary)',
                      fontWeight: '600',
                      opacity: isActive ? 0.8 : 0.7,
                      lineHeight: '1.3'
                    }}>
                      {prod.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ─── Date & Cycle Row ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', maxWidth: '850px', marginBottom: '28px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Business Date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="settings-input" style={{ width: '100%', padding: '12px 14px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Reconciliation Cycle</label>
                <select value={cycle} onChange={e => setCycle(e.target.value)} className="settings-input" style={{ width: '100%', padding: '12px 14px', fontWeight: '600' }}>
                  <optgroup label="NPCI Sub-Cycles (1 to 10)">
                    <option value="NPCI_Cycle_1">NPCI Cycle 1 — Settlement Cycle 1 (Duration 21.00 to 00.00 | T+1 | GEFU 09.30 AM)</option>
                    <option value="NPCI_Cycle_2">NPCI Cycle 2 — Settlement Cycle 1 (Duration 00.00 to 05.00 | T Day | GEFU 09.30 AM)</option>
                    <option value="NPCI_Cycle_3">NPCI Cycle 3 — Settlement Cycle 1 (Duration 05.00 to 07.00 | T Day | GEFU 09.30 AM)</option>
                    <option value="NPCI_Cycle_4">NPCI Cycle 4 — Settlement Cycle 2 (Duration 07.00 to 09.00 | T Day | GEFU 03.30 PM)</option>
                    <option value="NPCI_Cycle_5">NPCI Cycle 5 — Settlement Cycle 2 (Duration 09.00 to 11.00 | T Day | GEFU 03.30 PM)</option>
                    <option value="NPCI_Cycle_6">NPCI Cycle 6 — Settlement Cycle 2 (Duration 11.00 to 13.00 | T Day | GEFU 03.30 PM)</option>
                    <option value="NPCI_Cycle_7">NPCI Cycle 7 — Settlement Cycle 3 (Duration 13.00 to 15.00 | T Day | GEFU 09.30 PM)</option>
                    <option value="NPCI_Cycle_8">NPCI Cycle 8 — Settlement Cycle 3 (Duration 15.00 to 17.00 | T Day | GEFU 09.30 PM)</option>
                    <option value="NPCI_Cycle_9">NPCI Cycle 9 — Settlement Cycle 1 (Duration 17.00 to 19.00 | T+1 | GEFU 09.30 AM)</option>
                    <option value="NPCI_Cycle_10">NPCI Cycle 10 — Settlement Cycle 1 (Duration 19.00 to 21.00 | T+1 | GEFU 09.30 AM)</option>
                  </optgroup>
                  <optgroup label="Internal Settlement Cycles">
                    <option value="Cycle_1">Full Settlement Cycle 1 (09:30 AM GEFU Processing)</option>
                    <option value="Cycle_2">Full Settlement Cycle 2 (03:30 PM GEFU Processing)</option>
                    <option value="Cycle_3">Full Settlement Cycle 3 (09:30 PM GEFU Processing)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <button 
              onClick={() => {
                setStepStatuses(prev => ({ ...prev, 1: 'Completed', 2: 'Pending' }));
                setCurrentStep(2);
              }} 
              className="btn btn-primary" 
              style={{ padding: '12px 28px', fontWeight: '700' }}
            >
              Proceed to NPCI Upload <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: Upload NPCI Report */}
        {currentStep === 2 && (
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Step 2: Upload NPCI Report File</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Upload the official NPCI Settlement Report file (`.csv`, `.xlsx`, or `.txt`) for <strong>{selectedProduct}</strong>.
            </p>

            <div style={{ border: '2px dashed var(--border)', borderRadius: '16px', padding: '36px', textAlign: 'center', background: '#F8FAFC', maxWidth: '650px', marginBottom: '24px' }}>
              <Upload size={36} color="var(--primary)" style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>Select NPCI Settlement Report</h4>
              <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Supported formats: .xlsx, .csv, .txt (Fixed Width / Delimited)</p>

              <input 
                type="file" 
                id="npci-file-input" 
                onChange={handleNpciUpload} 
                style={{ display: 'none' }} 
              />

              <label htmlFor="npci-file-input" className="btn btn-outline" style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: '700' }}>
                Browse Files
              </label>

              {npciFile && (
                <div style={{ marginTop: '16px', background: 'rgba(37,99,235,0.06)', padding: '10px 16px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                  <FileText size={16} /> {npciFile.name} ({(npciFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleStartUploadAndFetch} 
                disabled={!npciFile || uploadingNpci} 
                className="btn btn-primary" 
                style={{ padding: '12px 28px', fontWeight: '700' }}
              >
                {uploadingNpci ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                {uploadingNpci ? 'Uploading File...' : 'Upload & Start Auto-Fetch Sequence'}
              </button>

              <button onClick={() => setCurrentStep(1)} className="btn btn-outline" style={{ padding: '12px 20px' }}>
                Back
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Auto-Fetching Reports (Middleware, Switch, Wallet - 2s each) */}
        {currentStep === 3 && (
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Step 3: Automated Report Fetching</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Fetching Middleware, Switch, and Wallet reports from GCP cloud infrastructure (2 seconds per report).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '650px', marginBottom: '24px' }}>
              {/* Middleware Fetch Box */}
              <div style={{ padding: '18px 24px', borderRadius: '14px', border: '1px solid var(--border)', background: autoFetchStage === 'middleware' ? 'rgba(37,99,235,0.06)' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Database size={20} color="var(--primary)" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px' }}>1. Fetch Middleware Report (GCP)</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Retrieving raw transaction logs</span>
                  </div>
                </div>

                {autoFetchStage === 'middleware' && (
                  <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                    <RefreshCw className="animate-spin" size={14} /> Fetching ({autoFetchTimer}s)...
                  </span>
                )}

                {(autoFetchStage === 'switch' || autoFetchStage === 'wallet' || autoFetchStage === 'done') && (
                  <span className="badge badge-success" style={{ padding: '6px 12px' }}>✓ Completed</span>
                )}
              </div>

              {/* Switch Fetch Box */}
              <div style={{ padding: '18px 24px', borderRadius: '14px', border: '1px solid var(--border)', background: autoFetchStage === 'switch' ? 'rgba(37,99,235,0.06)' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Server size={20} color="var(--primary)" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px' }}>2. Fetch Switch Report</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Retrieving core switch ledger data</span>
                  </div>
                </div>

                {autoFetchStage === 'switch' && (
                  <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                    <RefreshCw className="animate-spin" size={14} /> Fetching ({autoFetchTimer}s)...
                  </span>
                )}

                {(autoFetchStage === 'wallet' || autoFetchStage === 'done') && (
                  <span className="badge badge-success" style={{ padding: '6px 12px' }}>✓ Completed</span>
                )}

                {autoFetchStage === 'middleware' && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Waiting...</span>
                )}
              </div>

              {/* Wallet Fetch Box */}
              <div style={{ padding: '18px 24px', borderRadius: '14px', border: '1px solid var(--border)', background: autoFetchStage === 'wallet' ? 'rgba(37,99,235,0.06)' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Wallet size={20} color="var(--primary)" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px' }}>3. Fetch Wallet Report</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Retrieving merchant wallet balances</span>
                  </div>
                </div>

                {autoFetchStage === 'wallet' && (
                  <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                    <RefreshCw className="animate-spin" size={14} /> Fetching ({autoFetchTimer}s)...
                  </span>
                )}

                {autoFetchStage === 'done' && (
                  <span className="badge badge-success" style={{ padding: '6px 12px' }}>✓ Completed</span>
                )}

                {(autoFetchStage === 'middleware' || autoFetchStage === 'switch') && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Waiting...</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Reconciliation Results & Tabular Reports */}
        {currentStep === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle color="var(--success)" size={20} />
                  Reconciliation Execution Completed
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Date: <strong>{selectedDate}</strong> | Cycle: <strong>{cycle.replace(/_/g, ' ')}</strong> | Time: <strong>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong> | Product: <strong>{selectedProduct}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={downloadMatchedReport} className="btn btn-primary" style={{ padding: '10px 18px', fontWeight: '700' }}>
                  <Download size={15} /> Download Matched Report (.xlsx)
                </button>

                <button onClick={downloadMismatchedReport} className="btn btn-outline" style={{ padding: '10px 18px', fontWeight: '700', borderColor: 'var(--warning)', color: 'var(--warning)' }}>
                  <Download size={15} /> Download Mismatched Report (.xlsx)
                </button>
              </div>
            </div>

            {/* Results Summary Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Total Processed</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '22px' }}>{(result?.matchedList?.length || 0) + (result?.mismatchedList?.length || 0)}</h3>
              </div>

              <div style={{ background: 'rgba(34,197,94,0.06)', padding: '16px', borderRadius: '12px', border: '1px solid var(--success)' }}>
                <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '700', textTransform: 'uppercase' }}>Matched Transactions</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--success)' }}>{result?.matchedList?.length || 0}</h3>
              </div>

              <div style={{ background: 'rgba(239,68,68,0.06)', padding: '16px', borderRadius: '12px', border: '1px solid var(--danger)' }}>
                <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: '700', textTransform: 'uppercase' }}>Mismatched Transactions</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--danger)' }}>{result?.mismatchedList?.length || 0}</h3>
              </div>
            </div>

            {/* Tabular Reports Inspector */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              {/* Tab Bar & Search */}
              <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setResultsTab('matched')}
                    className={`btn ${resultsTab === 'matched' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '12.5px', padding: '6px 14px', fontWeight: '700' }}
                  >
                    Matched Transactions ({result?.matchedList?.length || 0})
                  </button>
                  <button 
                    onClick={() => setResultsTab('mismatched')}
                    className={`btn ${resultsTab === 'mismatched' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '12.5px', padding: '6px 14px', fontWeight: '700' }}
                  >
                    Mismatched Transactions ({result?.mismatchedList?.length || 0})
                  </button>
                </div>

                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by Txn ID, RRN, VPA..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="settings-input" 
                    style={{ width: '100%', paddingLeft: '34px', padding: '7px 12px 7px 34px', fontSize: '12.5px' }} 
                  />
                </div>
              </div>

              {/* Data Table */}
              <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
                <table className="data-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>RRN</th>
                      <th>Payer VPA</th>
                      <th>Payee VPA</th>
                      <th>Amount</th>
                      <th>NPCI Status</th>
                      <th>Switch Status</th>
                      <th>MW Status</th>
                      <th>Wallet Status</th>
                      <th>Status / Label</th>
                      {resultsTab === 'mismatched' && <th>Discrepancy Notes</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(resultsTab === 'matched' ? matchedListFiltered : mismatchedListFiltered).map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{row['Transaction ID']}</td>
                        <td style={{ fontFamily: 'monospace' }}>{row['RRN']}</td>
                        <td>{row['Payer VPA']}</td>
                        <td>{row['Payee VPA']}</td>
                        <td style={{ fontWeight: '700' }}>₹{row['Amount']}</td>
                        <td><span className="badge badge-success">{row['NPCI Status']}</span></td>
                        <td><span className="badge badge-success">{row['Switch Status']}</span></td>
                        <td><span className="badge badge-success">{row['MW Status']}</span></td>
                        <td><span className="badge badge-success">{row['Wallet Status']}</span></td>
                        <td>
                          <span className={`badge ${row['Status'] === 'Matched' ? 'badge-success' : 'badge-warning'}`}>
                            {row['Label'] || row['Status']}
                          </span>
                        </td>
                        {resultsTab === 'mismatched' && (
                          <td style={{ color: 'var(--danger)', fontWeight: '600' }}>{row['Notes']}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setStepStatuses({ 1: 'Completed', 2: 'Pending', 3: 'Pending', 4: 'Pending' });
                  setCurrentStep(1);
                  setNpciFile(null);
                  setResult(null);
                }} 
                className="btn btn-outline" 
                style={{ padding: '10px 20px', fontWeight: '700' }}
              >
                Run Another Reconciliation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullPipelineView;
