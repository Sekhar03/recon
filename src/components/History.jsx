import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  Filter,
  X
} from 'lucide-react';
import { getStoredJobs } from '../utils/jobHistoryStore';
import { exportMultiSheetExcel } from '../utils/excelWorkbookExporter';

const HistoryLog = () => {
  const [jobs, setJobs] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterCycle, setFilterCycle] = useState('');
  const [expandedJobId, setExpandedJobId] = useState(null);

  useEffect(() => {
    setJobs(getStoredJobs());
  }, []);

  // Get unique cycles from stored jobs for the dropdown
  const uniqueCycles = [...new Set(jobs.map(j => j.cycle).filter(Boolean))];

  const filteredJobs = jobs.filter(j => {
    const matchDate = !filterDate || j.date === filterDate;
    const matchCycle = !filterCycle || j.cycle === filterCycle;
    return matchDate && matchCycle;
  });

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

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HistoryIcon color="var(--primary)" size={26} />
          Job Archives & Reconciliation History
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14.5px' }}>
          Inspect past reconciliation runs and re-download all 6 generated output files.
        </p>
      </div>

      {/* Filter Bar: Date & Cycle */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '16px', 
        marginBottom: '28px', 
        padding: '18px 22px', 
        background: 'var(--bg-hover)', 
        borderRadius: '14px', 
        border: '1px solid var(--border)',
        flexWrap: 'wrap'
      }}>
        <Filter size={18} color="var(--primary)" style={{ marginBottom: '10px' }} />

        <div style={{ minWidth: '180px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            <Calendar size={12} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
            Filter by Date
          </label>
          <input 
            type="date" 
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)} 
            className="settings-input" 
            style={{ padding: '9px 14px', borderRadius: '10px', fontSize: '13px', width: '100%' }} 
          />
        </div>

        <div style={{ minWidth: '240px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            <Clock size={12} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
            Filter by Cycle
          </label>
          <select 
            value={filterCycle} 
            onChange={e => setFilterCycle(e.target.value)} 
            className="settings-input" 
            style={{ padding: '9px 14px', borderRadius: '10px', fontSize: '13px', width: '100%', fontWeight: '600' }}
          >
            <option value="">All Cycles</option>
            {uniqueCycles.map(c => (
              <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(filterDate || filterCycle) && (
          <button 
            onClick={() => { setFilterDate(''); setFilterCycle(''); }} 
            className="btn btn-outline" 
            style={{ padding: '9px 16px', fontSize: '12.5px', borderRadius: '10px', fontWeight: '700', marginBottom: '0' }}
          >
            <X size={14} /> Clear Filters
          </button>
        )}

        {/* Results count */}
        <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '10px' }}>
          {filteredJobs.length} of {jobs.length} jobs
        </div>
      </div>

      {/* Jobs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredJobs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-hover)', borderRadius: '16px' }}>
            No reconciliation jobs found matching your filters.
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
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
