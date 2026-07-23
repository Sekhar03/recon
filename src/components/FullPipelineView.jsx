import React, { useState } from 'react';
import { 
  Play, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  FileText, 
  Layers, 
  DollarSign, 
  CreditCard,
  Cloud,
  Server,
  RefreshCcw,
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { exportMultiSheetExcel } from '../utils/excelWorkbookExporter';
import { exportToExcel } from '../utils/excelExporter';

const FullPipelineView = () => {
  const [cycle, setCycle] = useState('Cycle_1');
  const [loading, setLoading] = useState(false);
  const [fetchModalStep, setFetchModalStep] = useState(0);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('mismatched');

  const [files, setFiles] = useState({
    ntsl: null,
    npci: null,
    commission: null
  });

  const handleFileUpload = (key, file) => {
    setFiles(prev => ({ ...prev, [key]: file.name }));
  };

  const handleRunPipeline = () => {
    setLoading(true);
    setFetchModalStep(1);

    setTimeout(() => setFetchModalStep(2), 600);
    setTimeout(() => setFetchModalStep(3), 1200);

    setTimeout(() => {
      axios.post('/api/v1/full-pipeline/run', { cycle })
        .then(res => {
          setResult(res.data);
          setLoading(false);
          setFetchModalStep(0);
        })
        .catch(() => {
          setLoading(false);
          setFetchModalStep(0);
        });
    }, 1800);
  };

  // 6 Download Handlers
  const downloadMatchedReport = () => {
    if (!result) return;
    exportMultiSheetExcel([
      { name: 'Matched_Transactions', type: 'data', columns: ['Transaction ID', 'RRN', 'Payer VPA', 'Payee VPA', 'Amount', 'NPCI Status', 'Switch Status', 'MW Status', 'Wallet Status', 'Status'], data: result.matchedList }
    ], `Matched_Transactions_Report_${cycle}`);
  };

  const downloadMismatchedReport = () => {
    if (!result) return;
    exportMultiSheetExcel([
      { name: 'Mismatched_Transactions', type: 'data', columns: ['Transaction ID', 'RRN', 'Payer VPA', 'Payee VPA', 'Amount', 'NPCI Status', 'Switch Status', 'MW Status', 'Wallet Status', 'Label', 'Notes'], data: result.mismatchedList }
    ], `Mismatched_Transactions_Report_${cycle}`);
  };

  const downloadGefuFlatFile = () => {
    if (!result) return;
    const blob = new Blob([result.gefuFlatFileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GEFU_${cycle}_NTSL.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadGefuAccountingLedger = () => {
    if (!result) return;
    exportToExcel(result.gefuAccountingLedger, `GEFU_Accounting_File_${cycle}`);
  };

  const downloadSettlementFile = () => {
    if (!result) return;
    exportToExcel(result.settlementRows, `Merchant_Settlement_File_${cycle}`);
  };

  const downloadPayoutFile = () => {
    if (!result) return;
    exportToExcel(result.payoutRows, `IMPS_Payout_File_${cycle}`);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px', position: 'relative' }}>
      {/* GCP Fetching Modal */}
      {fetchModalStep > 0 && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="glass-card animate-fade-in" style={{ background: 'white', padding: '36px', width: '460px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Cloud className="spinning" color="var(--primary)" size={32} />
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Auto-Fetching Input Logs</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Connecting to GCP Bucket <code style={{ color: 'var(--primary)', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>gs://iserveu-recon-bucket/</code>...
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', background: 'var(--bg-hover)', padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                {fetchModalStep >= 1 ? <CheckCircle2 color="var(--success)" size={18} /> : <RefreshCcw className="spinning" size={18} color="var(--text-secondary)" />}
                <span style={{ fontWeight: fetchModalStep >= 1 ? '600' : 'normal' }}>1. Middleware Report Auto-Ingested</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                {fetchModalStep >= 2 ? <CheckCircle2 color="var(--success)" size={18} /> : (fetchModalStep === 1 ? <RefreshCcw className="spinning" size={18} color="var(--text-secondary)" /> : <div style={{ width: '18px' }} />)}
                <span style={{ fontWeight: fetchModalStep >= 2 ? '600' : 'normal' }}>2. Wallet System Log Synced</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                {fetchModalStep >= 3 ? <CheckCircle2 color="var(--success)" size={18} /> : (fetchModalStep === 2 ? <RefreshCcw className="spinning" size={18} color="var(--text-secondary)" /> : <div style={{ width: '18px' }} />)}
                <span style={{ fontWeight: fetchModalStep >= 3 ? '600' : 'normal' }}>3. Switch SFTP Log Pulled & Matched</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', margin: 0, fontWeight: '800', letterSpacing: '-0.5px' }}>
            UPI Reconciliation & Output Downloads
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14.5px' }}>
            Run cycle reconciliation to generate the <b>2 Reconciliation Reports</b> and <b>4 Settlement & Bank Output Files</b>.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-hover)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Settlement Cycle:</span>
          <select value={cycle} onChange={e => setCycle(e.target.value)} className="settings-input" style={{ width: '150px', padding: '6px 10px', fontWeight: '700' }}>
            <option value="Cycle_1">Cycle 1 (09:30 AM)</option>
            <option value="Cycle_2">Cycle 2 (03:30 PM)</option>
            <option value="Cycle_3">Cycle 3 (09:30 PM)</option>
          </select>
        </div>
      </div>

      {/* STEP 1: Input Status Banner */}
      <div style={{ background: 'var(--bg-hover)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>
              Step 1 — Automatic Report Ingestion
            </span>
            <h4 style={{ margin: '4px 0 0 0', fontSize: '17px' }}>
              Input Sources: Middleware, Wallet, and Switch are Auto-Fetched
            </h4>
          </div>

          <button onClick={handleRunPipeline} disabled={loading} className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '15px', fontWeight: '700', borderRadius: '12px' }}>
            {loading ? <RefreshCcw className="spinning" size={18} /> : <Play size={18} fill="currentColor" />}
            {loading ? 'Reconciling Data...' : 'Run Reconciliation Now'}
          </button>
        </div>

        {/* Status badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
          <div style={{ padding: '12px 16px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>Middleware Report</span>
            <span className="badge badge-success" style={{ fontSize: '11px' }}>✓ Auto-Fetched GCP</span>
          </div>

          <div style={{ padding: '12px 16px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>Wallet Report</span>
            <span className="badge badge-success" style={{ fontSize: '11px' }}>✓ Auto-Fetched GCP</span>
          </div>

          <div style={{ padding: '12px 16px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>Switch Report</span>
            <span className="badge badge-success" style={{ fontSize: '11px' }}>✓ Auto-Pulled SFTP</span>
          </div>
        </div>
      </div>

      {/* STEP 2: Download Output Files Section */}
      {result && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--success)', letterSpacing: '1px' }}>
              Step 2 — Direct Downloads Ready
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 color="var(--success)" size={24} />
              Reconciliation & Settlement Output Files
            </h3>
          </div>

          {/* Section A: 2 Core Reconciliation Excel Files */}
          <div style={{ marginBottom: '36px' }}>
            <h4 style={{ fontSize: '15px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              Part 1: Reconciliation Reports (2 Files)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Matched File Card */}
              <div style={{ background: 'rgba(34, 197, 94, 0.04)', padding: '24px', borderRadius: '20px', border: '2px solid var(--success)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(34, 197, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 color="var(--success)" size={26} />
                    </div>
                    <span className="badge badge-success" style={{ fontWeight: '700' }}>.XLSX EXCEL</span>
                  </div>

                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>Matched Transactions Report</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Contains all 4-way matched transactions across NPCI, Switch, Middleware, and Wallet ({result.matchedList.length} records).
                  </p>
                </div>

                <button onClick={downloadMatchedReport} className="btn btn-primary" style={{ background: 'var(--success)', marginTop: '24px', padding: '14px', width: '100%', fontWeight: '700', fontSize: '14px' }}>
                  <Download size={18} /> Download Matched_Transactions_Report.xlsx
                </button>
              </div>

              {/* Mismatched File Card */}
              <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '24px', borderRadius: '20px', border: '2px solid var(--danger)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertCircle color="var(--danger)" size={26} />
                    </div>
                    <span className="badge badge-danger" style={{ fontWeight: '700' }}>.XLSX EXCEL</span>
                  </div>

                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>Mismatched Transactions Report</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Contains all exception rows labeled with exact discrepancy reasons ({result.mismatchedList.length} exceptions).
                  </p>
                </div>

                <button onClick={downloadMismatchedReport} className="btn btn-primary" style={{ background: 'var(--danger)', marginTop: '24px', padding: '14px', width: '100%', fontWeight: '700', fontSize: '14px' }}>
                  <Download size={18} /> Download Mismatched_Transactions_Report.xlsx
                </button>
              </div>
            </div>
          </div>

          {/* Section B: 4 Bank & Settlement Files */}
          <div style={{ marginBottom: '36px' }}>
            <h4 style={{ fontSize: '15px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              Part 2: Bank & Settlement Output Files (4 Files)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {/* GEFU Text File */}
              <div style={{ background: 'white', padding: '20px', borderRadius: '18px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <FileText color="var(--primary)" size={20} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>.TXT TEXT FILE</span>
                  <h4 style={{ margin: '4px 0 6px 0', fontSize: '15px' }}>GEFU Bank File</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Positional 27-field flat file layout for NSDL Payments Bank.
                  </p>
                </div>

                <button onClick={downloadGefuFlatFile} className="btn btn-outline" style={{ marginTop: '20px', padding: '10px', width: '100%', fontSize: '12.5px', fontWeight: '700' }}>
                  <Download size={14} /> Download GEFU_File.txt
                </button>
              </div>

              {/* GEFU Accounting Ledger */}
              <div style={{ background: 'white', padding: '20px', borderRadius: '18px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <FileSpreadsheet color="var(--primary)" size={20} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>.XLSX EXCEL</span>
                  <h4 style={{ margin: '4px 0 6px 0', fontSize: '15px' }}>GEFU Accounting File</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Simplified internal accounting ledger entries.
                  </p>
                </div>

                <button onClick={downloadGefuAccountingLedger} className="btn btn-outline" style={{ marginTop: '20px', padding: '10px', width: '100%', fontSize: '12.5px', fontWeight: '700' }}>
                  <Download size={14} /> GEFU_Accounting.xlsx
                </button>
              </div>

              {/* Merchant Settlement File */}
              <div style={{ background: 'white', padding: '20px', borderRadius: '18px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <DollarSign color="var(--primary)" size={20} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>.XLSX EXCEL</span>
                  <h4 style={{ margin: '4px 0 6px 0', fontSize: '15px' }}>Settlement File</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Merchant net settlement breakdown with 0.2006% bank share.
                  </p>
                </div>

                <button onClick={downloadSettlementFile} className="btn btn-outline" style={{ marginTop: '20px', padding: '10px', width: '100%', fontSize: '12.5px', fontWeight: '700' }}>
                  <Download size={14} /> Settlement_File.xlsx
                </button>
              </div>

              {/* IMPS Payout Split File */}
              <div style={{ background: 'white', padding: '20px', borderRadius: '18px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <CreditCard color="var(--primary)" size={20} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>.XLSX EXCEL</span>
                  <h4 style={{ margin: '4px 0 6px 0', fontSize: '15px' }}>IMPS Payout File</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Merchant payout rows with IMPS ₹5L split chunking.
                  </p>
                </div>

                <button onClick={downloadPayoutFile} className="btn btn-outline" style={{ marginTop: '20px', padding: '10px', width: '100%', fontSize: '12.5px', fontWeight: '700' }}>
                  <Download size={14} /> Payout_File.xlsx
                </button>
              </div>
            </div>
          </div>

          {/* Records Table Preview */}
          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
              <button className={`btn ${activeTab === 'mismatched' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('mismatched')}>
                <AlertCircle size={16} /> Mismatched Exceptions ({result.mismatchedList.length})
              </button>
              <button className={`btn ${activeTab === 'matched' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('matched')}>
                <CheckCircle2 size={16} /> Matched Records ({result.matchedList.length})
              </button>
              <button className={`btn ${activeTab === 'settlement' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('settlement')}>
                <DollarSign size={16} /> Settlement Breakdown ({result.settlementRows.length})
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              {activeTab === 'mismatched' && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Txn ID</th>
                      <th>RRN</th>
                      <th>Payer VPA</th>
                      <th>Payee VPA</th>
                      <th>Amount</th>
                      <th>NPCI</th>
                      <th>Switch</th>
                      <th>MW</th>
                      <th>Wallet</th>
                      <th>Discrepancy Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.mismatchedList.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{row['Transaction ID']}</td>
                        <td style={{ fontFamily: 'monospace' }}>{row['RRN']}</td>
                        <td>{row['Payer VPA']}</td>
                        <td>{row['Payee VPA']}</td>
                        <td style={{ fontWeight: '700' }}>₹{row['Amount']}</td>
                        <td><span className={`badge ${row['NPCI Status'] === 'Success' ? 'badge-success' : 'badge-warning'}`}>{row['NPCI Status']}</span></td>
                        <td><span className={`badge ${row['Switch Status'] === 'Success' ? 'badge-success' : 'badge-warning'}`}>{row['Switch Status']}</span></td>
                        <td><span className={`badge ${row['MW Status'] === 'Success' ? 'badge-success' : 'badge-warning'}`}>{row['MW Status']}</span></td>
                        <td><span className={`badge ${row['Wallet Status'] === 'Success' ? 'badge-success' : 'badge-neutral'}`}>{row['Wallet Status']}</span></td>
                        <td><span style={{ color: 'var(--danger)', fontWeight: '700', fontSize: '12px' }}>{row['Label']}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'matched' && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Txn ID</th>
                      <th>RRN</th>
                      <th>Payer VPA</th>
                      <th>Payee VPA</th>
                      <th>Amount</th>
                      <th>NPCI</th>
                      <th>Switch</th>
                      <th>MW</th>
                      <th>Wallet</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.matchedList.map((row, idx) => (
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
                        <td><span className="badge badge-success">Matched</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'settlement' && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Merchant User</th>
                      <th>Txn Volume</th>
                      <th>Gross Amount</th>
                      <th>Interchange</th>
                      <th>Switch Fee</th>
                      <th>Bank Share (0.2006%)</th>
                      <th>Net Settlement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.settlementRows.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '700' }}>{row.userName}</td>
                        <td>{row.count} txns</td>
                        <td>₹{row.txnAmount.toFixed(2)}</td>
                        <td>₹{row.interchange.toFixed(2)}</td>
                        <td>₹{row.switchingFee.toFixed(2)}</td>
                        <td style={{ color: 'var(--warning)', fontWeight: '700' }}>₹{row.bankShare.toFixed(2)}</td>
                        <td style={{ fontWeight: '700', color: 'var(--success)' }}>₹{row.netSettlement.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullPipelineView;
