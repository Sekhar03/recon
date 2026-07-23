import React, { useState } from 'react';
import { RefreshCcw, Upload, Download, CheckCircle2, AlertCircle, FileText, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import { exportMultiSheetExcel } from '../utils/excelWorkbookExporter';

const ModuleAView = () => {
  const [cycle, setCycle] = useState('Cycle_1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('mismatched');

  const [files, setFiles] = useState({
    middleware: null,
    switch: null,
    wallet: null,
    npci: null
  });

  const handleFileUpload = (key, file) => {
    setFiles(prev => ({ ...prev, [key]: file.name }));
  };

  const handleRunRecon = () => {
    setLoading(true);
    axios.post('/api/v1/module-a/run', { cycle })
      .then(res => {
        setResult(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleDownloadExcel = () => {
    if (!result) return;
    const sheetsData = [
      {
        name: 'Summary',
        type: 'summary',
        metrics: result.summary
      },
      {
        name: 'Txn_Matched',
        type: 'data',
        columns: ['Transaction ID', 'RRN', 'Payer VPA', 'Payee VPA', 'Amount', 'NPCI Status', 'Switch Status', 'MW Status', 'Wallet Status', 'Status'],
        data: result.matchedList
      },
      {
        name: 'Txn_Mismatched',
        type: 'data',
        columns: ['Transaction ID', 'RRN', 'Payer VPA', 'Payee VPA', 'Amount', 'NPCI Status', 'Switch Status', 'MW Status', 'Wallet Status', 'Label', 'Notes'],
        data: result.mismatchedList
      }
    ];

    exportMultiSheetExcel(sheetsData, `Transaction_Reconciliation_${cycle}`);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RefreshCcw color="var(--primary)" size={24} />
            Module A — 4-Way Transaction Reconciliation
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Reconciles Middleware, Switch, Wallet, and NPCI reports per cycle. Generates `Transaction_Reconciliation_&lt;cycle&gt;.xlsx`.
          </p>
        </div>

        {result && (
          <button onClick={handleDownloadExcel} className="btn btn-primary" style={{ padding: '12px 24px' }}>
            <FileSpreadsheet size={18} /> Download Transaction_Reconciliation_{cycle}.xlsx
          </button>
        )}
      </div>

      {/* Input File Collectors */}
      <div style={{ background: 'var(--bg-hover)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Input Files Collection</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          {[
            { key: 'middleware', label: 'Middleware Report', source: 'Auto-ingested GCP Bucket' },
            { key: 'switch', label: 'Switch Report', source: 'SFTP Drop' },
            { key: 'wallet', label: 'Wallet Report', source: 'Auto-ingested GCP Bucket' },
            { key: 'npci', label: 'NPCI Report', source: 'NPCI URCS Portal Download' },
          ].map(inp => (
            <div key={inp.key} style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px border var(--border)' }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '13px' }}>{inp.label}</p>
              <p style={{ margin: '2px 0 12px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>{inp.source}</p>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}>
                <Upload size={14} /> {files[inp.key] ? files[inp.key] : 'Select CSV/XLS'}
                <input type="file" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleFileUpload(inp.key, e.target.files[0])} />
              </label>
            </div>
          ))}
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
            {loading ? <RefreshCcw className="spinning" size={16} /> : <RefreshCcw size={16} />}
            {loading ? 'Reconciling 4-Way Data...' : 'Run Transaction Recon'}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            <div style={{ padding: '18px', background: 'white', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Total Processed</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px' }}>{result.summary['Total Transactions']}</h3>
            </div>
            <div style={{ padding: '18px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '14px', border: '1px solid var(--success)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--success)' }}>Matched (Settlement Eligible)</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--success)' }}>{result.summary['Matched Count']}</h3>
            </div>
            <div style={{ padding: '18px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '14px', border: '1px solid var(--danger)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--danger)' }}>Mismatched (Exceptions)</p>
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
