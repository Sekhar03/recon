import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ExternalLink,
  Loader2
} from 'lucide-react';

import { downloadCSV } from '../utils/csvExport';
import axios from 'axios';

const HistoryLog = ({ onViewJob }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/v1/history');
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
        setHistory([
          { jobId: 'RECON-10492', product: 'mATM', bank: 'NSDL', date: '2026-04-07', cycle: '3', status: 'completed', progress: 100, user: 'Finance Exec', rate: '98.7%', results: { total: 10240, matched: 10105, mismatched: 135, rate: '98.7%' } },
          { jobId: 'RECON-10491', product: 'AePS', bank: 'IPPB', date: '2026-04-07', cycle: '2', status: 'completed', progress: 100, user: 'Logic Engineer', rate: '98.9%', results: { total: 8500, matched: 8410, mismatched: 90, rate: '98.9%' } },
          { jobId: 'RECON-10490', product: 'DMT', bank: 'Airtel', date: '2026-04-07', cycle: 'N/A', status: 'failed', progress: 45, user: 'Finance Exec', rate: '0%', error: 'Upstream Timeout (MN)' },
          { jobId: 'RECON-10489', product: 'mATM', bank: 'IPPB', date: '2026-04-06', cycle: '10', status: 'completed', progress: 100, user: 'system', rate: '99.8%', results: { total: 12000, matched: 11980, mismatched: 20, rate: '99.8%' } },
          { jobId: 'RECON-10488', product: 'AePS', bank: 'NSDL', date: '2026-04-06', cycle: '1', status: 'completed', progress: 100, user: 'Finance Exec', rate: '97.4%', results: { total: 15400, matched: 15000, mismatched: 400, rate: '97.4%' } }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="status-badge success"><CheckCircle2 size={12} /> Completed</span>;
      case 'failed':
        return <span className="status-badge danger"><XCircle size={12} /> Failed</span>;
      default:
        return <span className="status-badge warning"><Clock size={12} /> Running</span>;
    }
  };

  const filteredHistory = history.filter(job => {
    const matchesSearch = 
      (job.jobId || job.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.product || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.bank || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesProduct = productFilter === 'all' || job.product === productFilter;
    
    return matchesSearch && matchesStatus && matchesProduct;
  });

  const handleExportHistory = () => {
    downloadCSV(history.map(({ results, ...rest }) => rest), 'recon_history_export');
  };

  const handleDownloadJob = (job) => {
    const data = job.results?.mismatchedData || [];
    downloadCSV(data, `mismatches_${job.id || job.jobId}`);
  };

  return (
    <div className="history-container">
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search Job ID, product..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
            </select>

            <select 
              className="filter-select"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            >
              <option value="all">All Products</option>
              <option value="mATM">mATM</option>
              <option value="AePS">AePS</option>
              <option value="DMT">DMT</option>
            </select>
          </div>
          <button onClick={handleExportHistory} className="btn btn-outline">
            <Download size={18} />
            Export History
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <th style={{ padding: '16px' }}>Job ID</th>
                <th style={{ padding: '16px' }}>Product</th>
                <th style={{ padding: '16px' }}>Bank</th>
                <th style={{ padding: '16px' }}>Date / Cycle</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Match Rate</th>
                <th style={{ padding: '16px' }}>Run By</th>
                <th style={{ padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="spinning" /> Loading history...</td></tr>
              ) : filteredHistory.map((job) => (
                <tr key={job.jobId || job.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="history-row">
                  <td 
                    style={{ padding: '16px', fontWeight: '600', color: 'var(--primary)', fontSize: '14px', cursor: 'pointer' }}
                    onClick={() => onViewJob(job)}
                  >
                    {job.jobId || job.id}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="tiny-badge">{job.product}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{job.bank}</td>
                  <td style={{ padding: '16px' }}>
                    <p style={{ fontSize: '14px' }}>{job.date}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cycle {job.cycle}</p>
                  </td>
                  <td style={{ padding: '16px' }}>{getStatusBadge(job.status)}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700' }}>{job.rate}</span>
                      <div style={{ width: '60px', height: '4px', background: 'var(--bg-hover)', borderRadius: '2px' }}>
                        <div style={{ 
                          width: job.rate || '0%', 
                          height: '100%', 
                          background: parseFloat(job.rate) > 99 ? 'var(--success)' : (parseFloat(job.rate) > 95 ? 'var(--primary)' : 'var(--warning)'),
                          borderRadius: '2px'
                        }}></div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{job.user || 'system'}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => onViewJob(job)}><Eye size={16} /></button>
                      <button className="icon-btn" onClick={() => handleDownloadJob(job)}><Download size={16} /></button>
                      <button 
                        className="icon-btn" 
                        onClick={() => alert(`Details for ${job.jobId || job.id}:\nProduct: ${job.product}\nBank: ${job.bank}\nUser: ${job.user || 'system'}`)}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .search-box {
          display: flex; align-items: center; gap: 10px; padding: 0 16px;
          background: var(--bg-hover); border: 1px solid var(--border);
          border-radius: 10px; width: 300px;
        }
        .search-box input {
          background: transparent; border: none; outline: none; color: white;
          padding: 10px 0; font-size: 14px; width: 100%;
        }
        
        .filter-select {
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: white;
          padding: 0 16px;
          font-size: 14px;
          outline: none;
          cursor: pointer;
        }
        .filter-select:focus { border-color: var(--primary); }
        
        .status-badge {
          display: flex; align-items: center; gap: 6px; padding: 4px 10px;
          border-radius: 6px; font-size: 12px; font-weight: 600; width: fit-content;
        }
        .status-badge.success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .status-badge.danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .status-badge.warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
        
        .tiny-badge {
          background: var(--bg-hover); padding: 2px 8px; border-radius: 4px;
          font-size: 11px; font-weight: 600; color: var(--text-secondary);
        }
        
        .icon-btn {
          width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--border);
          background: transparent; color: var(--text-secondary); cursor: pointer;
          display: flex; alignItems: center; justifyContent: center; transition: 0.2s;
        }
        .icon-btn:hover { background: var(--bg-hover); color: var(--text-primary); border-color: var(--text-secondary); }
        
        .history-row:hover { background: rgba(255,255,255,0.02); }
      `}} />
    </div>
  );
};

export default HistoryLog;
