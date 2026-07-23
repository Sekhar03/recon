import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  CreditCard,
  Calendar,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getStoredJobs } from '../utils/jobHistoryStore';
import { exportMultiSheetExcel } from '../utils/excelWorkbookExporter';
import { exportToExcel } from '../utils/excelExporter';

const HistoryLog = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [expandedJobId, setExpandedJobId] = useState(null);

  useEffect(() => {
    setJobs(getStoredJobs());
  }, []);

  const filteredJobs = jobs.filter(j => 
    j.jobId.toLowerCase().includes(search.toLowerCase()) || 
    j.cycle.toLowerCase().includes(search.toLowerCase()) ||
    j.date.toLowerCase().includes(search.toLowerCase())
  );

  // 6 Download Actions per Job
  const downloadMatchedReport = (job) => {
    exportMultiSheetExcel([
      { name: 'Matched_Transactions', type: 'data', columns: ['Transaction ID', 'RRN', 'Payer VPA', 'Payee VPA', 'Amount', 'NPCI Status', 'Switch Status', 'MW Status', 'Wallet Status', 'Status'], data: job.matchedList || [] }
    ], `Matched_Transactions_Report_${job.jobId}`);
  };

  const downloadMismatchedReport = (job) => {
    exportMultiSheetExcel([
      { name: 'Mismatched_Transactions', type: 'data', columns: ['Transaction ID', 'RRN', 'Payer VPA', 'Payee VPA', 'Amount', 'NPCI Status', 'Switch Status', 'MW Status', 'Wallet Status', 'Label', 'Notes'], data: job.mismatchedList || [] }
    ], `Mismatched_Transactions_Report_${job.jobId}`);
  };

  const downloadGefuFlatFile = (job) => {
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

  const downloadGefuAccounting = (job) => {
    exportToExcel(job.gefuAccountingLedger || [], `GEFU_Accounting_${job.jobId}`);
  };

  const downloadSettlementFile = (job) => {
    exportToExcel(job.settlementRows || [], `Settlement_File_${job.jobId}`);
  };

  const downloadPayoutFile = (job) => {
    exportToExcel(job.payoutRows || [], `Payout_File_${job.jobId}`);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HistoryIcon color="var(--primary)" size={26} />
            Job Archives & Reconciliation History
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14.5px' }}>
            Inspect past reconciliation runs and re-download all 6 generated output files for any historical Job ID.
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by Job ID, Cycle, Date..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="settings-input" 
            style={{ width: '100%', paddingLeft: '38px', borderRadius: '12px' }} 
          />
        </div>
      </div>

      {/* Jobs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredJobs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-hover)', borderRadius: '16px' }}>
            No reconciliation jobs found matching "{search}".
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isExpanded = expandedJobId === job.jobId;

            return (
              <div key={job.jobId} style={{ background: 'white', borderRadius: '18px', border: '1px solid var(--border)', overflow: 'hidden', transition: 'all 0.2s ease' }}>
                {/* Job Card Summary Bar */}
                <div 
                  onClick={() => setExpandedJobId(isExpanded ? null : job.jobId)} 
                  style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: isExpanded ? 'var(--bg-hover)' : 'white' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
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

                  {/* Metrics & Expand Chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Matched / Exceptions</span>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>
                        <span style={{ color: 'var(--success)' }}>{job.matchedCount}</span> / <span style={{ color: 'var(--danger)' }}>{job.mismatchedCount}</span> ({job.matchRate})
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Net Settlement</span>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>
                        ₹{job.netSettlement}
                      </p>
                    </div>

                    <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '10px' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {isExpanded ? 'Hide Downloads' : 'Inspect & Download Files'}
                    </button>
                  </div>
                </div>

                {/* Expanded Output Files Panel */}
                {isExpanded && (
                  <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: '#F8FAFC' }}>
                    <h5 style={{ margin: '0 0 16px 0', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                      Available Output Downloads for {job.jobId}
                    </h5>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                      {/* Matched Report */}
                      <button onClick={() => downloadMatchedReport(job)} className="btn btn-outline" style={{ background: 'white', padding: '12px 16px', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '12px' }}>
                        <CheckCircle2 color="var(--success)" size={18} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px' }}>Matched Transactions Report</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>.XLSX Excel Sheet</div>
                        </div>
                      </button>

                      {/* Mismatched Report */}
                      <button onClick={() => downloadMismatchedReport(job)} className="btn btn-outline" style={{ background: 'white', padding: '12px 16px', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '12px' }}>
                        <AlertCircle color="var(--danger)" size={18} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px' }}>Mismatched Transactions Report</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>.XLSX Excel Sheet</div>
                        </div>
                      </button>

                      {/* GEFU Text File */}
                      <button onClick={() => downloadGefuFlatFile(job)} className="btn btn-outline" style={{ background: 'white', padding: '12px 16px', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '12px' }}>
                        <FileText color="var(--primary)" size={18} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px' }}>GEFU Bank File</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>.TXT Positional Flat File</div>
                        </div>
                      </button>

                      {/* GEFU Accounting Ledger */}
                      <button onClick={() => downloadGefuAccounting(job)} className="btn btn-outline" style={{ background: 'white', padding: '12px 16px', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '12px' }}>
                        <FileSpreadsheet color="var(--primary)" size={18} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px' }}>GEFU Accounting File</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>.XLSX Internal Ledger</div>
                        </div>
                      </button>

                      {/* Settlement File */}
                      <button onClick={() => downloadSettlementFile(job)} className="btn btn-outline" style={{ background: 'white', padding: '12px 16px', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '12px' }}>
                        <DollarSign color="var(--primary)" size={18} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px' }}>Settlement File</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>.XLSX 0.2006% Bank Share</div>
                        </div>
                      </button>

                      {/* Payout File */}
                      <button onClick={() => downloadPayoutFile(job)} className="btn btn-outline" style={{ background: 'white', padding: '12px 16px', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '12px' }}>
                        <CreditCard color="var(--primary)" size={18} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px' }}>IMPS Payout File</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>.XLSX ₹5L Split Chunker</div>
                        </div>
                      </button>
                    </div>
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

export default HistoryLog;
