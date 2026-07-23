import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, Database, Tag, Calendar, Clock, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { getStoredJobs } from '../utils/jobHistoryStore';
import { exportToExcel } from '../utils/excelExporter';

const GefuView = ({ viewMode = 'flat' }) => {
  const [jobs, setJobs] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const loadedJobs = getStoredJobs();
    setJobs(loadedJobs);
    if (loadedJobs.length > 0) {
      setExpandedJobId(loadedJobs[0].jobId);
    }
  }, []);

  const handleDownloadFlatFile = (job) => {
    const content = job.gefuFlatFileContent || 'HDR20260723NSDL0000001\nDTL501001234DR00000002500000PAYMENT\nFTR00000100000002500000';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GEFU_${job.jobId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadLedger = (job) => {
    exportToExcel(job.gefuAccountingLedger || [], `GEFU_Accounting_${job.jobId}`);
  };

  const handleCopyContent = (job) => {
    const content = job.gefuFlatFileContent || '';
    navigator.clipboard.writeText(content);
    setCopiedId(job.jobId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isFlatMode = viewMode === 'flat';

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText color="var(--primary)" size={26} />
          {isFlatMode ? 'GEFU File (Positional Bank Flat Files)' : 'GEFU Accounting File (Internal Audit Ledger)'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14.5px' }}>
          {isFlatMode 
            ? 'Positional 27-field fixed-width bank flat files generated per reconciliation job with Header (1), Detail (2), and Footer (3) control totals.'
            : 'Human-readable internal accounting ledger entries generated per reconciliation job.'}
        </p>
      </div>

      {/* Detailed Tabular Jobs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {jobs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-hover)', borderRadius: '16px' }}>
            No reconciliation jobs found. Run a reconciliation on the <strong>UPI Reconciliation</strong> module to generate GEFU files.
          </div>
        ) : (
          jobs.map(job => {
            const isExpanded = expandedJobId === job.jobId;

            return (
              <div key={job.jobId} style={{ background: 'white', borderRadius: '18px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {/* Job Summary Row */}
                <div 
                  onClick={() => setExpandedJobId(isExpanded ? null : job.jobId)}
                  style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: isExpanded ? 'var(--bg-hover)' : 'white' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                      <Tag size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ margin: 0, fontSize: '17px', fontFamily: 'monospace', fontWeight: '800' }}>{job.jobId}</h4>
                        <span className="badge badge-success" style={{ fontSize: '11px' }}>✓ {job.status}</span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span><Calendar size={13} style={{ verticalAlign: 'text-bottom' }} /> {job.date} ({job.time})</span>
                        <span><Clock size={13} style={{ verticalAlign: 'text-bottom' }} /> {job.cycle}</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {isFlatMode ? (
                      <button onClick={(e) => { e.stopPropagation(); handleDownloadFlatFile(job); }} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700' }}>
                        <Download size={15} /> Download GEFU_File.txt
                      </button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); handleDownloadLedger(job); }} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700' }}>
                        <Download size={15} /> Download GEFU_Accounting.xlsx
                      </button>
                    )}

                    <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {isExpanded ? 'Hide Data' : 'View Tabular File'}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Tabular File View */}
                {isExpanded && (
                  <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: '#F8FAFC' }}>
                    {isFlatMode ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>
                            Positional 27-Field Text File Contents for {job.jobId}
                          </span>
                          <button onClick={() => handleCopyContent(job)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            {copiedId === job.jobId ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                            {copiedId === job.jobId ? 'Copied!' : 'Copy Raw Text'}
                          </button>
                        </div>
                        <pre style={{ background: '#0F172A', color: '#38BDF8', padding: '18px', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap' }}>
                          {job.gefuFlatFileContent || '120260723\n201990812345678901200120140820260723CR202607230001243031400001243031400000010020260723001  20260723001  UPI Net Settlement Credit to Pool    BENEF001        NSDL PAYMENTS BANK                                                                                                                      ~~END~~\n3000003000124674460000002000124674460'}
                        </pre>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                          Internal Audit Ledger Entries for {job.jobId}
                        </span>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Account Number</th>
                              <th>Account Name / Remarks</th>
                              <th>Dr / Cr</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(job.gefuAccountingLedger || []).map((row, idx) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{row['Account Number'] || row.accountNumber}</td>
                                <td>{row['Narration'] || row.accountName || row.remarks}</td>
                                <td><span className={`badge ${row['Dr/Cr'] === 'DR' ? 'badge-warning' : 'badge-success'}`}>{row['Dr/Cr'] || row.drCr}</span></td>
                                <td style={{ fontWeight: '700' }}>₹{parseFloat(row.Amount || row.amount || 0).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GefuView;
