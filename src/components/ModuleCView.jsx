import React, { useState } from 'react';
import { FileCheck, Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import { exportMultiSheetExcel } from '../utils/excelWorkbookExporter';

const ModuleCView = () => {
  const [cycle, setCycle] = useState('Cycle_1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('mismatched');

  const [files, setFiles] = useState({
    payout: null,
    bankMis: null,
    bankStmt: null
  });

  const handleFileUpload = (key, file) => {
    setFiles(prev => ({ ...prev, [key]: file.name }));
  };

  const handleRunRecon = () => {
    setLoading(true);
    axios.post('/api/v1/module-c/run', { cycle })
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
        name: 'Payout_Matched',
        type: 'data',
        columns: ['Client Reference No', 'User Name', 'Payout Amount', 'Bank MIS Amount', 'Bank Statement Amount', 'Bank MIS Status', 'Bank Statement Status', 'UTR', 'Status'],
        data: result.matchedList
      },
      {
        name: 'Payout_Mismatched',
        type: 'data',
        columns: ['Client Reference No', 'User Name', 'Payout Amount', 'Bank MIS Amount', 'Bank Statement Amount', 'Bank MIS Status', 'Bank Statement Status', 'UTR', 'Label', 'Notes'],
        data: result.mismatchedList
      }
    ];

    exportMultiSheetExcel(sheetsData, `Payout_Reconciliation_${cycle}`);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCheck color="var(--primary)" size={24} />
            Module C — Payout Reconciliation (3-Way)
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Matches iServeU Payout Report, Bank MIS Report, and Bank Statement. Generates `Payout_Reconciliation_&lt;cycle&gt;.xlsx`.
          </p>
        </div>

        {result && (
          <button onClick={handleDownloadExcel} className="btn btn-primary" style={{ padding: '12px 24px' }}>
            <FileSpreadsheet size={18} /> Download Payout_Reconciliation_{cycle}.xlsx
          </button>
        )}
      </div>

      {/* Input File Collectors */}
      <div style={{ background: 'var(--bg-hover)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Input Files Collection</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          {[
            { key: 'payout', label: 'iServeU Payout Report', source: 'Internal record of payouts sent' },
            { key: 'bankMis', label: 'Bank MIS Report', source: 'Bank payout processing record' },
            { key: 'bankStmt', label: 'Bank Statement', source: 'Bank actual account statement' },
          ].map(inp => (
            <div key={inp.key} style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
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
            {loading ? <FileCheck className="spinning" size={16} /> : <FileCheck size={16} />}
            {loading ? 'Reconciling 3-Way Payouts...' : 'Run Payout Recon'}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            <div style={{ padding: '18px', background: 'white', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Total Payouts Analyzed</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px' }}>{result.summary['Total Payouts Analyzed']}</h3>
            </div>
            <div style={{ padding: '18px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '14px', border: '1px solid var(--success)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--success)' }}>Payout Matched</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--success)' }}>{result.summary['Payout Matched Count']}</h3>
            </div>
            <div style={{ padding: '18px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '14px', border: '1px solid var(--danger)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--danger)' }}>Payout Mismatched</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--danger)' }}>{result.summary['Payout Mismatched Count']}</h3>
            </div>
            <div style={{ padding: '18px', background: 'white', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Match Rate</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--primary)' }}>{result.summary['Payout Match Rate']}</h3>
            </div>
          </div>

          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
            <button className={`btn ${activeTab === 'mismatched' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('mismatched')}>
              <AlertCircle size={16} /> Payout Mismatches ({result.mismatchedList.length})
            </button>
            <button className={`btn ${activeTab === 'matched' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('matched')}>
              <CheckCircle2 size={16} /> Payout Matched ({result.matchedList.length})
            </button>
          </div>

          {/* Table Display */}
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client Ref No</th>
                  <th>User Name</th>
                  <th>Payout Amount</th>
                  <th>Bank MIS Amt</th>
                  <th>Bank Stmt Amt</th>
                  <th>MIS Status</th>
                  <th>Stmt Status</th>
                  <th>UTR</th>
                  <th>{activeTab === 'mismatched' ? 'Label (Mismatch Reason)' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'mismatched' ? result.mismatchedList : result.matchedList).map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{row['Client Reference No']}</td>
                    <td>{row['User Name']}</td>
                    <td style={{ fontWeight: '700' }}>₹{row['Payout Amount']}</td>
                    <td>{row['Bank MIS Amount'] !== 'N/A' ? `₹${row['Bank MIS Amount']}` : 'N/A'}</td>
                    <td>{row['Bank Statement Amount'] !== 'N/A' ? `₹${row['Bank Statement Amount']}` : 'N/A'}</td>
                    <td><span className={`badge ${row['Bank MIS Status'] === 'SUCCESS' ? 'badge-success' : 'badge-warning'}`}>{row['Bank MIS Status']}</span></td>
                    <td><span className={`badge ${row['Bank Statement Status'] === 'DEBITED' ? 'badge-success' : 'badge-warning'}`}>{row['Bank Statement Status']}</span></td>
                    <td style={{ fontFamily: 'monospace' }}>{row['UTR']}</td>
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

export default ModuleCView;
