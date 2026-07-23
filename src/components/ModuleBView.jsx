import React, { useState } from 'react';
import { DollarSign, Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import { exportMultiSheetExcel } from '../utils/excelWorkbookExporter';

const ModuleBView = () => {
  const [cycle, setCycle] = useState('Cycle_1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('mismatched');

  const [files, setFiles] = useState({
    mwMatched: null,
    commission: null
  });

  const handleFileUpload = (key, file) => {
    setFiles(prev => ({ ...prev, [key]: file.name }));
  };

  const handleRunRecon = () => {
    setLoading(true);
    axios.post('/api/v1/module-b/run', { cycle })
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
        name: 'Commission_Matched',
        type: 'data',
        columns: ['Transaction ID', 'RRN', 'User Name', 'Transaction Amount', 'Commission Amount', 'TDS', 'GST', 'Status'],
        data: result.matchedList
      },
      {
        name: 'Commission_Mismatched',
        type: 'data',
        columns: ['Transaction ID', 'RRN', 'User Name', 'Transaction Amount', 'Commission Amount', 'TDS', 'GST', 'Label', 'Notes'],
        data: result.mismatchedList
      }
    ];

    exportMultiSheetExcel(sheetsData, `Commission_Reconciliation_${cycle}`);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign color="var(--primary)" size={24} />
            Module B — Commission Reconciliation
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Matches Matched Middleware Transactions against Commission Report. Generates `Commission_Reconciliation_&lt;cycle&gt;.xlsx`.
          </p>
        </div>

        {result && (
          <button onClick={handleDownloadExcel} className="btn btn-primary" style={{ padding: '12px 24px' }}>
            <FileSpreadsheet size={18} /> Download Commission_Reconciliation_{cycle}.xlsx
          </button>
        )}
      </div>

      {/* Input File Collectors */}
      <div style={{ background: 'var(--bg-hover)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Input Files Collection</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {[
            { key: 'mwMatched', label: 'Middleware Matched Transactions', source: 'Output from Module A (Txn_Matched)' },
            { key: 'commission', label: 'Commission Report', source: 'Exported from internal Commission System' },
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
            {loading ? <DollarSign className="spinning" size={16} /> : <DollarSign size={16} />}
            {loading ? 'Reconciling Commissions...' : 'Run Commission Recon'}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            <div style={{ padding: '18px', background: 'white', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Total Txns Analyzed</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px' }}>{result.summary['Total Transactions Analyzed']}</h3>
            </div>
            <div style={{ padding: '18px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '14px', border: '1px solid var(--success)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--success)' }}>Commission Matched</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--success)' }}>{result.summary['Commission Matched Count']}</h3>
            </div>
            <div style={{ padding: '18px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '14px', border: '1px solid var(--danger)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--danger)' }}>Commission Mismatched</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--danger)' }}>{result.summary['Commission Mismatched Count']}</h3>
            </div>
            <div style={{ padding: '18px', background: 'white', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Match Rate</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', color: 'var(--primary)' }}>{result.summary['Commission Match Rate']}</h3>
            </div>
          </div>

          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
            <button className={`btn ${activeTab === 'mismatched' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('mismatched')}>
              <AlertCircle size={16} /> Commission Mismatches ({result.mismatchedList.length})
            </button>
            <button className={`btn ${activeTab === 'matched' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('matched')}>
              <CheckCircle2 size={16} /> Commission Matched ({result.matchedList.length})
            </button>
          </div>

          {/* Table Display */}
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>RRN</th>
                  <th>User Name</th>
                  <th>Txn Amount</th>
                  <th>Comm Amount</th>
                  <th>TDS</th>
                  <th>GST</th>
                  <th>{activeTab === 'mismatched' ? 'Label (Mismatch Reason)' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'mismatched' ? result.mismatchedList : result.matchedList).map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{row['Transaction ID']}</td>
                    <td style={{ fontFamily: 'monospace' }}>{row['RRN']}</td>
                    <td>{row['User Name']}</td>
                    <td style={{ fontWeight: '700' }}>₹{row['Transaction Amount']}</td>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{row['Commission Amount']}</td>
                    <td>₹{row['TDS']}</td>
                    <td>₹{row['GST']}</td>
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

export default ModuleBView;
