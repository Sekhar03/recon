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
  X,
  Search,
  Layers,
  FileText
} from 'lucide-react';
import { getStoredJobs } from '../utils/jobHistoryStore';
import { getCategories, getAllProducts } from '../utils/productConfigs';
import { exportMatchedFile, exportMismatchedFile } from '../utils/manualReconEngine';

const HistoryLog = () => {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProductsList, setAllProductsList] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCycle, setFilterCycle] = useState('');
  const [expandedJobId, setExpandedJobId] = useState(null);

  useEffect(() => {
    setJobs(getStoredJobs() || []);
    try {
      setCategories(getCategories() || []);
      setAllProductsList(getAllProducts() || []);
    } catch (e) {
      console.warn("Failed to load category configs for filters", e);
    }
  }, []);

  // Get unique cycles from stored jobs
  const uniqueCycles = [...new Set(jobs.map(j => j.cycle).filter(Boolean))];

  // Filtering Logic
  const filteredJobs = jobs.filter(j => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !searchQuery || 
      (j.jobId || '').toLowerCase().includes(q) || 
      (j.productName || '').toLowerCase().includes(q) || 
      (j.category || '').toLowerCase().includes(q);

    const matchCategory = !filterCategory || (j.category || '').toLowerCase() === filterCategory.toLowerCase();
    const matchProduct = !filterProduct || (j.productId || '').toLowerCase() === filterProduct.toLowerCase() || (j.productName || '').toLowerCase() === filterProduct.toLowerCase();
    const matchDate = !filterDate || j.date === filterDate;
    const matchCycle = !filterCycle || j.cycle === filterCycle;

    return matchSearch && matchCategory && matchProduct && matchDate && matchCycle;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('');
    setFilterProduct('');
    setFilterDate('');
    setFilterCycle('');
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HistoryIcon color="var(--primary)" size={26} />
            Job Archives & Reconciliation History
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
            Audit trail of all executed reconciliations across all product categories.
          </p>
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', background: 'rgba(17, 157, 176, 0.08)', padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(17, 157, 176, 0.15)', fontWeight: '600' }}>
          Total Saved Runs: <strong>{jobs.length}</strong>
        </div>
      </div>

      {/* Dynamic Filter Controls Bar */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '14px', 
        marginBottom: '28px', 
        padding: '20px', 
        background: '#F8FAFC', 
        borderRadius: '16px', 
        border: '1px solid var(--border)'
      }}>
        {/* Search Query Input */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Search Job / Product
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search Job ID, Product..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="settings-input"
              style={{ paddingLeft: '32px', width: '100%', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Filter by Category */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Category
          </label>
          <select 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)}
            className="settings-input"
            style={{ width: '100%', fontSize: '0.85rem', fontWeight: '500' }}
          >
            <option value="">All Categories (14)</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Filter by Product */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Sub-Product
          </label>
          <select 
            value={filterProduct} 
            onChange={e => setFilterProduct(e.target.value)}
            className="settings-input"
            style={{ width: '100%', fontSize: '0.85rem', fontWeight: '500' }}
          >
            <option value="">All Products</option>
            {allProductsList.map(prod => (
              <option key={prod.id} value={prod.id}>{prod.name}</option>
            ))}
          </select>
        </div>

        {/* Filter by Date */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Business Date
          </label>
          <input 
            type="date" 
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)} 
            className="settings-input" 
            style={{ width: '100%', fontSize: '0.85rem' }} 
          />
        </div>

        {/* Filter by Cycle */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Settlement Cycle
          </label>
          <select 
            value={filterCycle} 
            onChange={e => setFilterCycle(e.target.value)} 
            className="settings-input" 
            style={{ width: '100%', fontSize: '0.85rem', fontWeight: '500' }}
          >
            <option value="">All Cycles</option>
            {uniqueCycles.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filter Button Banner */}
      {(searchQuery || filterCategory || filterProduct || filterDate || filterCycle) && (
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredJobs.length}</strong> of {jobs.length} jobs matching filters
          </span>
          <button 
            onClick={clearFilters} 
            className="btn btn-outline" 
            style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <X size={14} /> Clear All Filters
          </button>
        </div>
      )}

      {/* Jobs History List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredJobs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed var(--border)' }}>
            No reconciliation jobs found matching your selected filters.
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isExpanded = expandedJobId === job.jobId;
            const pConfig = job.productConfig || { id: job.productId || 'RECON', name: job.productName || 'Product' };

            return (
              <div key={job.jobId} style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                {/* Job Card Header */}
                <div 
                  onClick={() => setExpandedJobId(isExpanded ? null : job.jobId)} 
                  style={{ padding: '18px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: isExpanded ? '#F8FAFC' : 'white' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(17, 157, 176, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Tag size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                          {job.productName || job.productId || 'Reconciliation Job'}
                        </h4>
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{job.jobId}</span>
                        <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ {job.status}</span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span><Calendar size={13} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} /> {job.date} ({job.time})</span>
                        <span><Clock size={13} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} /> {job.cycle}</span>
                      </p>
                    </div>
                  </div>

                  {/* Summary Metrics & Expand Trigger */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Matched / Exceptions</span>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>
                        <span style={{ color: 'var(--success)' }}>{job.matchedCount?.toLocaleString() || 0}</span> / <span style={{ color: 'var(--danger)' }}>{job.mismatchedCount?.toLocaleString() || 0}</span> ({job.matchRate || '0%'})
                      </p>
                    </div>

                    <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '10px' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {isExpanded ? 'Hide Downloads' : 'Download Reports'}
                    </button>
                  </div>
                </div>

                {/* Expanded Download Options Bar (Exactly 2 Output Files) */}
                {isExpanded && (
                  <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', background: '#F8FAFC' }}>
                    <h5 style={{ margin: '0 0 14px 0', fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                      Generated Output Files for {job.jobId} ({job.productName})
                    </h5>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                      {/* Matched File Download */}
                      <button 
                        onClick={() => exportMatchedFile(job.matchedList || [], pConfig, job.date, job.cycle)}
                        className="btn btn-outline" 
                        style={{ background: 'white', padding: '12px 16px', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '10px', borderColor: 'var(--success)', color: 'var(--success)' }}
                      >
                        <CheckCircle2 color="var(--success)" size={20} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>🟢 Download Matched File</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{job.matchedCount || 0} Matched Records (.xlsx)</div>
                        </div>
                      </button>

                      {/* Mismatched File Download */}
                      <button 
                        onClick={() => exportMismatchedFile(job.mismatchedList || [], pConfig, job.date, job.cycle)}
                        className="btn btn-primary" 
                        style={{ padding: '12px 16px', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '10px', backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white' }}
                      >
                        <Download color="white" size={20} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>🔴 Download Mismatched File</div>
                          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)' }}>{job.mismatchedCount || 0} Exception Records (.xlsx)</div>
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
