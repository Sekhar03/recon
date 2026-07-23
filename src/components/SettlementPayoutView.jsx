import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Download, Tag, Calendar, Clock, ChevronDown, ChevronUp, Split, CheckCircle2 } from 'lucide-react';
import { getStoredJobs } from '../utils/jobHistoryStore';
import { exportToExcel } from '../utils/excelExporter';

const SettlementPayoutView = ({ viewMode = 'settlement' }) => {
  const [jobs, setJobs] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);

  useEffect(() => {
    const loadedJobs = getStoredJobs();
    setJobs(loadedJobs);
    if (loadedJobs.length > 0) {
      setExpandedJobId(loadedJobs[0].jobId);
    }
  }, []);

  const handleDownloadSettlement = (job) => {
    exportToExcel(job.settlementRows || [], `Settlement_File_${job.jobId}`);
  };

  const handleDownloadPayout = (job) => {
    exportToExcel(job.payoutRows || [], `Payout_File_${job.jobId}`);
  };

  const isSettlementMode = viewMode === 'settlement';

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isSettlementMode ? <DollarSign color="var(--primary)" size={26} /> : <CreditCard color="var(--primary)" size={26} />}
          {isSettlementMode ? 'Merchant Settlement Files (0.2006% Bank Share Formula)' : 'IMPS Payout Files (₹500,000 Split Chunker)'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14.5px' }}>
          {isSettlementMode 
            ? 'Merchant net settlement breakdowns calculated per job using the formula: NET = TXN - INTERCHANGE - SWITCHING - BANK_SHARE(0.2006%) - PLATFORM - LEA_HOLD - PERIOD_LIEN + CR_ADJ - CHARGEBACK + CHARGEBACK_WON.'
            : 'Bank payout rows generated per job with IMPS ₹500,000 split chunking rules (remainder row first, ₹500,000 max row last).'}
        </p>
      </div>

      {/* Detailed Tabular Jobs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {jobs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-hover)', borderRadius: '16px' }}>
            No reconciliation jobs found. Run a reconciliation on the <strong>UPI Reconciliation</strong> module to generate settlement & payout files.
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
                    {isSettlementMode ? (
                      <button onClick={(e) => { e.stopPropagation(); handleDownloadSettlement(job); }} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700' }}>
                        <Download size={15} /> Download Settlement_File.xlsx
                      </button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); handleDownloadPayout(job); }} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '700' }}>
                        <Split size={15} /> Download Payout_File.xlsx
                      </button>
                    )}

                    <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {isExpanded ? 'Hide Table' : 'View Detailed Table'}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Tabular View */}
                {isExpanded && (
                  <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: '#F8FAFC' }}>
                    {isSettlementMode ? (
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                          Merchant Settlement Breakdown Table for {job.jobId}
                        </span>
                        <div style={{ overflowX: 'auto' }}>
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Merchant User</th>
                                <th>Txn Count</th>
                                <th>Gross Amount</th>
                                <th>Interchange</th>
                                <th>Switching Fee</th>
                                <th>Bank Share (0.2006%)</th>
                                <th>Net Settlement</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(job.settlementRows || []).map((row, idx) => (
                                <tr key={idx}>
                                  <td style={{ fontWeight: '700' }}>{row.userName || row.merchant}</td>
                                  <td>{row.count || row.txnCount} txns</td>
                                  <td>₹{parseFloat(row.txnAmount || 0).toFixed(2)}</td>
                                  <td>₹{parseFloat(row.interchange || 0).toFixed(2)}</td>
                                  <td>₹{parseFloat(row.switchingFee || 0).toFixed(2)}</td>
                                  <td style={{ color: 'var(--warning)', fontWeight: '700' }}>₹{parseFloat(row.bankShare || 0).toFixed(2)}</td>
                                  <td style={{ fontWeight: '700', color: 'var(--success)' }}>₹{parseFloat(row.netSettlement || 0).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                          IMPS Payout Split Table for {job.jobId}
                        </span>
                        <div style={{ overflowX: 'auto' }}>
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Client Ref No</th>
                                <th>Username</th>
                                <th>Bene Name</th>
                                <th>Bene Account</th>
                                <th>IFSC</th>
                                <th>Split Parameter</th>
                                <th>Payout Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(job.payoutRows || []).map((row, idx) => (
                                <tr key={idx}>
                                  <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{row.clientReferenceNo}</td>
                                  <td>{row.username}</td>
                                  <td>{row.beneName}</td>
                                  <td style={{ fontFamily: 'monospace' }}>{row.beneAccountNo}</td>
                                  <td style={{ fontFamily: 'monospace' }}>{row.beneifsc || row.beneIfsc}</td>
                                  <td>
                                    <span className={`badge ${row.paramA === 'UPI_SETTL_MAX' ? 'badge-warning' : 'badge-primary'}`}>
                                      {row.paramA || 'IMPS'}
                                    </span>
                                  </td>
                                  <td style={{ fontWeight: '700', color: 'var(--success)' }}>₹{parseFloat(row.amount || 0).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
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

export default SettlementPayoutView;
