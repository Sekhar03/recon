import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Download, Eye, MoreHorizontal, CheckCircle2,
  XCircle, Clock, Loader2, RefreshCcw, FileText, ShieldCheck, Split, AlertCircle
} from 'lucide-react';
import { downloadCSV } from '../utils/csvExport';
import axios from 'axios';

const HistoryLog = ({ onViewJob }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/v1/history');
      setHistory(res.data);
    } catch (err) {
      // Fallback demo data
      setHistory([
        {
          jobId: 'UPI-RECON-20260723-01', product: 'UPI Recon', bank: 'NSDL Payments Bank',
          date: '2026-07-23', internalCycle: 'Cycle 1', status: 'COMPLETED',
          totalTxns: 12450, matchedCount: 12380, exceptionCount: 70, matchRate: '99.4%',
          gefuStatus: 'VERIFIED_GENERATED', gefuFinalSettlement: 1243031.40,
          settlementTotal: 1243031.40, hardGatePassed: true, payoutRowCount: 14,
          createdAt: new Date().toISOString()
        },
        {
          jobId: 'UPI-RECON-20260722-03', product: 'UPI Recon', bank: 'NSDL Payments Bank',
          date: '2026-07-22', internalCycle: 'Cycle 3', status: 'COMPLETED',
          totalTxns: 9820, matchedCount: 9750, exceptionCount: 70, matchRate: '99.3%',
          gefuStatus: 'VERIFIED_GENERATED', gefuFinalSettlement: 921440.00,
          settlementTotal: 921440.00, hardGatePassed: true, payoutRowCount: 11,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          jobId: 'UPI-RECON-20260722-02', product: 'UPI Recon', bank: 'NSDL Payments Bank',
          date: '2026-07-22', internalCycle: 'Cycle 2', status: 'COMPLETED',
          totalTxns: 11200, matchedCount: 11100, exceptionCount: 100, matchRate: '99.1%',
          gefuStatus: 'VERIFIED_GENERATED', gefuFinalSettlement: 1081200.00,
          settlementTotal: 1081200.00, hardGatePassed: true, payoutRowCount: 13,
          createdAt: new Date(Date.now() - 97200000).toISOString()
        },
        {
          jobId: 'UPI-RECON-20260722-01', product: 'UPI Recon', bank: 'NSDL Payments Bank',
          date: '2026-07-22', internalCycle: 'Cycle 1', status: 'FAILED',
          totalTxns: 8400, matchedCount: 0, exceptionCount: 0, matchRate: '0%',
          gefuStatus: 'NOT_GENERATED', hardGatePassed: false, payoutRowCount: 0,
          error: 'NTSL file OOXML parse error — format mismatch flagged',
          createdAt: new Date(Date.now() - 108000000).toISOString()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'completed') return <span className="status-badge success"><CheckCircle2 size={11} /> Completed</span>;
    if (s === 'FAILED'    || s === 'failed')    return <span className="status-badge danger"><XCircle size={11} /> Failed</span>;
    return <span className="status-badge warning"><Clock size={11} /> Running</span>;
  };

  const filteredHistory = history.filter(job => {
    const q = searchTerm.toLowerCase();
    const matchSearch = (job.jobId || '').toLowerCase().includes(q) || (job.bank || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || (job.status || '').toUpperCase() === statusFilter.toUpperCase();
    const matchCycle  = cycleFilter === 'all'  || job.internalCycle === cycleFilter;
    return matchSearch && matchStatus && matchCycle;
  });

  const handleExport = () => {
    downloadCSV(history.map(({ settlementRows, payoutRows, gefuFlatFileContent, ...rest }) => rest), 'UPI_Pipeline_History');
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ padding: '28px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box">
              <Search size={16} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search Job ID or Bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>

            <select className="filter-select" value={cycleFilter} onChange={e => setCycleFilter(e.target.value)}>
              <option value="all">All Cycles</option>
              <option value="Cycle 1">Internal Cycle 1</option>
              <option value="Cycle 2">Internal Cycle 2</option>
              <option value="Cycle 3">Internal Cycle 3</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchHistory} className="btn btn-outline" style={{ fontSize: '13px' }}>
              <RefreshCcw size={14} /> Refresh
            </button>
            <button onClick={handleExport} className="btn btn-outline" style={{ fontSize: '13px' }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Date / Internal Cycle</th>
                <th>Bank</th>
                <th>Status</th>
                <th>4-Way Match Rate</th>
                <th>Txns (Total / Exceptions)</th>
                <th>GEFU Status</th>
                <th>Gate</th>
                <th>Payouts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <Loader2 className="spinning" style={{ display: 'inline', marginRight: '8px' }} size={18} /> Loading pipeline history...
                </td></tr>
              ) : filteredHistory.length === 0 ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No records match your filters.</td></tr>
              ) : filteredHistory.map((job) => (
                <tr key={job.jobId} className="history-row">
                  <td>
                    <div
                      style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '13px', cursor: 'pointer' }}
                      onClick={() => onViewJob(job)}
                    >
                      {job.jobId}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(job.createdAt).toLocaleString('en-IN')}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{job.date}</div>
                    <div style={{ fontSize: '11px' }}><span className="tiny-badge">{job.internalCycle}</span></div>
                  </td>
                  <td style={{ fontSize: '13px', fontWeight: '500' }}>{job.bank}</td>
                  <td>{getStatusBadge(job.status)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '800', fontSize: '14px', color: parseFloat(job.matchRate) >= 99 ? 'var(--success)' : parseFloat(job.matchRate) >= 95 ? 'var(--warning)' : 'var(--danger)' }}>
                        {job.matchRate || '—'}
                      </span>
                      {job.matchRate && (
                        <div style={{ width: '48px', height: '5px', background: 'var(--bg-hover)', borderRadius: '3px' }}>
                          <div style={{ width: job.matchRate, height: '100%', background: parseFloat(job.matchRate) >= 99 ? 'var(--success)' : 'var(--warning)', borderRadius: '3px' }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{(job.totalTxns || 0).toLocaleString()} total</div>
                    {job.exceptionCount > 0 && (
                      <div style={{ fontSize: '11px', color: 'var(--warning)' }}>
                        <AlertCircle size={10} style={{ display: 'inline', marginRight: '3px' }} />
                        {job.exceptionCount} exceptions
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${job.gefuStatus === 'VERIFIED_GENERATED' ? 'badge-success' : job.gefuStatus === 'NOT_GENERATED' ? 'badge-danger' : 'badge-warning'}`}>
                      {job.gefuStatus === 'VERIFIED_GENERATED' ? <><CheckCircle2 size={10} /> Verified</> : <><AlertCircle size={10} /> {job.gefuStatus || 'N/A'}</>}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${job.hardGatePassed ? 'badge-success' : 'badge-danger'}`}>
                      {job.hardGatePassed ? '✓ Passed' : '✗ Failed'}
                    </span>
                  </td>
                  <td>
                    {job.payoutRowCount > 0 ? (
                      <span className="badge badge-primary">
                        <Split size={10} /> {job.payoutRowCount} rows
                      </span>
                    ) : <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="icon-btn" onClick={() => onViewJob(job)} title="View GEFU & Settlement">
                        <Eye size={14} />
                      </button>
                      <button className="icon-btn" onClick={() => downloadCSV([job], `job_${job.jobId}`)} title="Download Job Summary">
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {!loading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>Showing {filteredHistory.length} of {history.length} pipeline runs</span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span>✓ Completed: <strong style={{ color: 'var(--success)' }}>{history.filter(j => (j.status || '').toUpperCase() === 'COMPLETED').length}</strong></span>
              <span>✗ Failed: <strong style={{ color: 'var(--danger)' }}>{history.filter(j => (j.status || '').toUpperCase() === 'FAILED').length}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryLog;
