import React, { useState } from 'react';
import { 
  RefreshCcw, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Cloud,
  Server,
  Play
} from 'lucide-react';
import axios from 'axios';
import { exportMultiSheetExcel } from '../utils/excelWorkbookExporter';

const ModuleAView = () => {
  const [cycle, setCycle] = useState('Cycle_1');
  const [loading, setLoading] = useState(false);
  const [fetchModalStep, setFetchModalStep] = useState(0);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('mismatched');

  const [files, setFiles] = useState({
    npci: null
  });

  const handleFileUpload = (key, file) => {
    setFiles(prev => ({ ...prev, [key]: file.name }));
  };

  const handleRunRecon = () => {
    setLoading(true);
    setFetchModalStep(1);

    setTimeout(() => setFetchModalStep(2), 600);
    setTimeout(() => setFetchModalStep(3), 1200);

    setTimeout(() => {
      axios.post('/api/v1/module-a/run', { cycle })
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

  const downloadMatchedReport = () => {
    if (!result) return;
    exportMultiSheetExcel([
      { name: 'Txn_Matched', type: 'data', columns: ['Transaction ID', 'RRN', 'Payer VPA', 'Payee VPA', 'Amount', 'NPCI Status', 'Switch Status', 'MW Status', 'Wallet Status', 'Status'], data: result.matchedList }
    ], `Matched_Transactions_Report_${cycle}`);
  };

  const downloadMismatchedReport = () => {
    if (!result) return;
    exportMultiSheetExcel([
      { name: 'Txn_Mismatched', type: 'data', columns: ['Transaction ID', 'RRN', 'Payer VPA', 'Payee VPA', 'Amount', 'NPCI Status', 'Switch Status', 'MW Status', 'Wallet Status', 'Label', 'Notes'], data: result.mismatchedList }
    ], `Mismatched_Transactions_Report_${cycle}`);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px', position: 'relative' }}>
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
          <div className="glass-card animate-fade-in" style={{ background: 'white', padding: '36px', width: '480px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Cloud className="spinning" color="var(--primary)" size={32} />
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Auto-Fetching Module A Logs from GCP Bucket</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Reading <code style={{ color: 'var(--primary)', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>gs://iserveu-recon-bucket/</code> for {cycle}...
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', background: 'var(--bg-hover)', padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                {fetchModalStep >= 1 ? <CheckCircle2 color="var(--success)" size={18} /> : <RefreshCcw className="spinning" size={18} color="var(--text-secondary)" />}
                <span style={{ fontWeight: fetchModalStep >= 1 ? '600' : 'normal' }}>Auto-ingesting Middleware Log from GCP</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                {fetchModalStep >= 2 ? <CheckCircle2 color="var(--success)" size={18} /> : (fetchModalStep === 1 ? <RefreshCcw className="spinning" size={18} color="var(--text-secondary)" /> : <div style={{ width: '18px' }} />)}
                <span style={{ fontWeight: fetchModalStep >= 2 ? '600' : 'normal' }}>Syncing Wallet Ledger & SFTP Switch Extract</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                {fetchModalStep >= 3 ? <CheckCircle2 color="var(--success)" size={18} /> : (fetchModalStep === 2 ? <RefreshCcw className="spinning" size={18} color="var(--text-secondary)" /> : <div style={{ width: '18px' }} />)}
                <span style={{ fontWeight: fetchModalStep >= 3 ? '600' : 'normal' }}>Running 4-Way Match & Formatting Reports...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RefreshCcw color="var(--primary)" size={24} />
            Module A — 4-Way Transaction Reconciliation
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Reconciles Middleware, Switch, Wallet, and NPCI reports. Middleware and Wallet are <b>auto-fetched from GCP Bucket</b>.
          </p>
        </div>
      </div>

      {/* Ingestion Status & Manual Upload */}
      <div style={{ background: 'var(--bg-hover)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Auto-Ingested Files & Manual Upload</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cloud size={14} color="var(--primary)" /> Middleware Log
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--success)', fontWeight: '700' }}>✓ Auto-Ingested GCP Bucket</p>
          </div>

          <div style={{ padding: '16px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Server size={14} color="var(--primary)" /> Switch Report
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--success)', fontWeight: '700' }}>✓ SFTP Auto-Pulled</p>
          </div>

          <div style={{ padding: '16px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cloud size={14} color="var(--primary)" /> Wallet Report
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--success)', fontWeight: '700' }}>✓ Auto-Ingested GCP Bucket</p>
          </div>

          <div style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '13px' }}>NPCI URCS Report</p>
            <p style={{ margin: '2px 0 10px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>URCS Portal Download</p>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}>
              <Upload size={14} /> {files.npci ? files.npci : 'Upload CSV / XLS (Optional)'}
              <input type="file" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleFileUpload('npci', e.target.files[0])} />
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Target Cycle:</span>
            <select value={cycle} onChange={e => setCycle(e.target.value)} className="settings-input" style={{ width: '160px', padding: '6px 12px' }}>
              <option value="Cycle_1">Cycle 1 (09:30 AM)</option>
              <option value="Cycle_2">Cycle 2 (03:30 PM)</option>
              <option value="Cycle_3">Cycle 3 (09:30 PM)</option>
            </select>
          </div>

          <button onClick={handleRunRecon} disabled={loading} className="btn btn-primary" style={{ padding: '12px 32px' }}>
            {loading ? <RefreshCcw className="spinning" size={16} /> : <Play size={16} />}
            {loading ? 'Auto-Fetching GCP Logs...' : 'Run Transaction Recon'}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="animate-fade-in">
          {/* Highlight Card for 2 Generated Recon Files */}
          <div style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(15, 23, 42, 0.04) 100%)', padding: '20px', borderRadius: '16px', border: '2px solid var(--primary)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet color="var(--primary)" size={20} /> 2 Recon Output Files Ready
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Download Matched and Mismatched Excel reports with discrepancy labels and notes.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={downloadMatchedReport} className="btn btn-primary" style={{ background: 'var(--success)' }}>
                <CheckCircle2 size={16} /> Download Matched_Transactions_Report.xlsx
              </button>
              <button onClick={downloadMismatchedReport} className="btn btn-primary" style={{ background: 'var(--danger)' }}>
                <AlertCircle size={16} /> Download Mismatched_Transactions_Report.xlsx
              </button>
            </div>
          </div>

          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            <div style={{ padding: '18px', background: 'white', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Total Processed</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px' }}>{result.summary['Total Transactions']}</h3>
            </div>
            <div style={{ padding: '18px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '14px', border: '1px solid var(--success)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--success)' }}>Matched Count</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--success)' }}>{result.summary['Matched Count']}</h3>
            </div>
            <div style={{ padding: '18px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '14px', border: '1px solid var(--danger)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--danger)' }}>Mismatched Count</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--danger)' }}>{result.summary['Mismatched Count']}</h3>
            </div>
            <div style={{ padding: '18px', background: 'white', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Match Rate</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--primary)' }}>{result.summary['Match Rate']}</h3>
            </div>
          </div>

          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
            <button className={`btn ${activeTab === 'mismatched' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('mismatched')}>
              <AlertCircle size={16} /> Mismatched Rows ({result.mismatchedList.length})
            </button>
            <button className={`btn ${activeTab === 'matched' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('matched')}>
              <CheckCircle2 size={16} /> Matched Rows ({result.matchedList.length})
            </button>
          </div>

          {/* Table Display */}
          <div style={{ overflowX: 'auto' }}>
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
                  <th>{activeTab === 'mismatched' ? 'Label (Mismatch Reason)' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'mismatched' ? result.mismatchedList : result.matchedList).map((row, idx) => (
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
                    <td>
                      {activeTab === 'mismatched' ? (
                        <span style={{ color: 'var(--danger)', fontWeight: '700', fontSize: '12px' }}>{row['Label']}</span>
                      ) : (
                        <span className="badge badge-success">Matched</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleAView;
