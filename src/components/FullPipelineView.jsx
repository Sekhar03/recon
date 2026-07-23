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
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { exportMultiSheetExcel } from '../utils/excelWorkbookExporter';
import { exportToExcel } from '../utils/excelExporter';

const FullPipelineView = () => {
  const [cycle, setCycle] = useState('Cycle_1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('matched');

  const [files, setFiles] = useState({
    ntsl: null,
    npci: null,
    switch: null,
    middleware: null,
    wallet: null,
    commission: null
  });

  const handleFileUpload = (key, file) => {
    setFiles(prev => ({ ...prev, [key]: file.name }));
  };

  const handleRunPipeline = () => {
    setLoading(true);
    axios.post('/api/v1/full-pipeline/run', { cycle })
      .then(res => {
        setResult(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Download Helpers for 6 Output Files
  const downloadMatchedReport = () => {
    if (!result) return;
    exportMultiSheetExcel([
      { name: 'Matched_Transactions', type: 'data', columns: ['Transaction ID', 'RRN', 'Payer VPA', 'Payee VPA', 'Amount', 'NPCI Status', 'Switch Status', 'MW Status', 'Wallet Status', 'Status'], data: result.matchedList }
    ], `Matched_Transactions_${cycle}`);
  };

  const downloadMismatchedReport = () => {
    if (!result) return;
    exportMultiSheetExcel([
      { name: 'Mismatched_Transactions', type: 'data', columns: ['Transaction ID', 'RRN', 'Payer VPA', 'Payee VPA', 'Amount', 'NPCI Status', 'Switch Status', 'MW Status', 'Wallet Status', 'Label', 'Notes'], data: result.mismatchedList }
    ], `Mismatched_Transactions_${cycle}`);
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
    exportToExcel(result.gefuAccountingLedger, `GEFU_Accounting_Ledger_${cycle}`);
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
    <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers color="var(--primary)" size={24} />
          Complete UPI Reconciliation & Settlement Pipeline
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
          Collect 6 Input Files → Run 4-Way Match & Commission Recon → Generate 6 Output Files (2 Recon Reports + 4 Bank Settlement Files).
        </p>
      </div>

      {/* Input Files Collector Panel (6 Inputs) */}
      <div style={{ background: 'var(--bg-hover)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={16} /> Step 1: Upload 6 Input Files (or Use Instant Sample Data)
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { key: 'ntsl', label: '1. NTSL Report', source: 'Downloaded from NPCI' },
            { key: 'npci', label: '2. NPCI Report', source: 'NPCI URCS Portal Download' },
            { key: 'switch', label: '3. Switch Report', source: 'Switching System SFTP' },
            { key: 'middleware', label: '4. Middleware Report', source: 'Internal iSU System (GCP Bucket)' },
            { key: 'wallet', label: '5. Wallet Report', source: 'Wallet System (GCP Bucket)' },
            { key: 'commission', label: '6. Commission Report', source: 'Internal Commission System' },
          ].map(inp => (
            <div key={inp.key} style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '13px' }}>{inp.label}</p>
              <p style={{ margin: '2px 0 12px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>{inp.source}</p>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}>
                <Upload size={14} /> {files[inp.key] ? files[inp.key] : 'Select File (.csv / .xls)'}
                <input type="file" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleFileUpload(inp.key, e.target.files[0])} />
              </label>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Internal Settlement Cycle:</span>
            <select value={cycle} onChange={e => setCycle(e.target.value)} className="settings-input" style={{ width: '160px', padding: '6px 12px' }}>
              <option value="Cycle_1">Cycle 1 (09:30 AM)</option>
              <option value="Cycle_2">Cycle 2 (03:30 PM)</option>
              <option value="Cycle_3">Cycle 3 (09:30 PM)</option>
            </select>
          </div>

          <button onClick={handleRunPipeline} disabled={loading} className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '14px', fontWeight: '700' }}>
            {loading ? <Play className="spinning" size={18} /> : <Play size={18} />}
            {loading ? 'Processing Reconciliation & Generating Outputs...' : 'Run Complete Pipeline'}
          </button>
        </div>
      </div>

      {/* Output Files Download Panel (6 Outputs) */}
      {result && (
        <div className="animate-fade-in">
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 color="var(--success)" size={20} /> Generated Output Files (6 Reports & Files Ready)
          </h3>

          {/* KPI Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            <div style={{ padding: '18px', background: 'white', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Total Processed</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px' }}>{result.summary.totalProcessed}</h3>
            </div>
            <div style={{ padding: '18px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '14px', border: '1px solid var(--success)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--success)' }}>Matched Txns</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--success)' }}>{result.summary.matchedCount}</h3>
            </div>
            <div style={{ padding: '18px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '14px', border: '1px solid var(--danger)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--danger)' }}>Mismatched Exceptions</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--danger)' }}>{result.summary.mismatchedCount}</h3>
            </div>
            <div style={{ padding: '18px', background: 'white', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Net Settlement Total</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--primary)' }}>₹{parseFloat(result.summary.totalSettlement).toLocaleString('en-IN')}</h3>
            </div>
          </div>

          {/* 6 Download Action Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            {/* Recon Files Group */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={16} /> Reconciliation Output Files (2 Reports)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={downloadMatchedReport} className="btn btn-outline" style={{ justifyContent: 'space-between', width: '100%', padding: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <CheckCircle2 size={16} color="var(--success)" /> Matched Transactions File
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>Download Matched_Transactions.xlsx</span>
                </button>

                <button onClick={downloadMismatchedReport} className="btn btn-outline" style={{ justifyContent: 'space-between', width: '100%', padding: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <AlertCircle size={16} color="var(--danger)" /> Mismatched Transactions File
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>Download Mismatched_Transactions.xlsx</span>
                </button>
              </div>
            </div>

            {/* Settlement Files Group */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} /> Settlement & Bank Output Files (4 Files)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={downloadGefuFlatFile} className="btn btn-outline" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>GEFU Bank File</span>
                  <span style={{ fontSize: '11px', color: 'var(--primary)' }}><Download size={12} /> GEFU_File.txt</span>
                </button>

                <button onClick={downloadGefuAccountingLedger} className="btn btn-outline" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>GEFU Accounting File</span>
                  <span style={{ fontSize: '11px', color: 'var(--primary)' }}><Download size={12} /> GEFU_Accounting.xlsx</span>
                </button>

                <button onClick={downloadSettlementFile} className="btn btn-outline" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>Settlement File</span>
                  <span style={{ fontSize: '11px', color: 'var(--primary)' }}><Download size={12} /> Settlement_File.xlsx</span>
                </button>

                <button onClick={downloadPayoutFile} className="btn btn-outline" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>IMPS Payout File (₹5L Split)</span>
                  <span style={{ fontSize: '11px', color: 'var(--primary)' }}><Download size={12} /> Payout_File.xlsx</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sub-tabs to preview records */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
            <button className={`btn ${activeTab === 'matched' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('matched')}>
              <CheckCircle2 size={16} /> Matched Records ({result.matchedList.length})
            </button>
            <button className={`btn ${activeTab === 'mismatched' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('mismatched')}>
              <AlertCircle size={16} /> Mismatched Exceptions ({result.mismatchedList.length})
            </button>
            <button className={`btn ${activeTab === 'settlement' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('settlement')}>
              <DollarSign size={16} /> Merchant Settlement Rows ({result.settlementRows.length})
            </button>
            <button className={`btn ${activeTab === 'payout' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('payout')}>
              <CreditCard size={16} /> IMPS Payout Split Rows ({result.payoutRows.length})
            </button>
          </div>

          {/* Record Table Preview */}
          <div style={{ overflowX: 'auto' }}>
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
                    <th>Label (Discrepancy Reason)</th>
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

            {activeTab === 'payout' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client Ref No</th>
                    <th>Merchant User</th>
                    <th>Bene Name</th>
                    <th>Account No</th>
                    <th>IFSC</th>
                    <th>Split Cap Tag</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {result.payoutRows.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{row.clientReferenceNo}</td>
                      <td>{row.username}</td>
                      <td>{row.beneName}</td>
                      <td style={{ fontFamily: 'monospace' }}>{row.beneAccountNo}</td>
                      <td>{row.beneifsc}</td>
                      <td>
                        <span className={`badge ${row.paramA === 'UPI_SETTL_MAX' ? 'badge-warning' : 'badge-success'}`}>
                          {row.paramA}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FullPipelineView;
