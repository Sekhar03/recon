import React from 'react';
import { 
  CheckCircle2, 
  Share2, 
  Download, 
  AlertCircle,
  Clock,
  ChevronLeft
} from 'lucide-react';
import { downloadCSV } from '../utils/csvExport';

const ResultsView = ({ results, selection, onBack, isHistoryView = false }) => {
  if (!results) {
     return (
       <div className="glass-card animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
         <h2 style={{ marginBottom: '16px' }}>Preparing Report...</h2>
         <p style={{ color: 'var(--text-secondary)' }}>The reconciliation data for this job is being loaded.</p>
         <button onClick={onBack} className="btn btn-outline" style={{ marginTop: '32px' }}>Go Back</button>
       </div>
     );
  }

  const handleDownload = (isMismatched) => {
    const filename = isMismatched ? `mismatched_report_${selection.date}` : `matched_report_${selection.date}`;
    const data = isMismatched ? (results.mismatchedData || []) : [
      { rrn: '712345000001', date: selection.date, amount: '100.00', status: 'SUCCESS', matchType: 'Exact' },
      { rrn: '712345000002', date: selection.date, amount: '200.00', status: 'SUCCESS', matchType: 'Exact' },
      { rrn: '712345000003', date: selection.date, amount: '50.00', status: 'SUCCESS', matchType: 'Exact' },
    ];
    downloadCSV(data, filename);
  };

  const handleShare = async () => {
    const shareText = `Reconciliation Result for ${selection.product?.name || selection.product} (${selection.bank})\nDate: ${selection.date}\nMatch Rate: ${results.rate}\nTotal Transactions: ${results.total}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Reconciliation Report',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Result summary copied to clipboard!');
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '40px', minHeight: '500px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 color="var(--success)" size={28} />
            Reconciliation Complete
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Job ID: {selection.jobId || `#RECON-${Date.now()}`}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleShare} className="btn btn-outline"><Share2 size={18} /> Share Result</button>
          <button onClick={onBack} className="btn btn-primary">Done</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div className="stat-box">
          <p>Total Transactions</p>
          <h3>{results.total}</h3>
        </div>
        <div className="stat-box" style={{ borderLeftColor: 'var(--success)' }}>
          <p>Matched</p>
          <h3 style={{ color: 'var(--success)' }}>{results.matched}</h3>
        </div>
        <div className="stat-box" style={{ borderLeftColor: 'var(--danger)' }}>
          <p>Mismatched</p>
          <h3 style={{ color: 'var(--danger)' }}>{results.mismatched}</h3>
        </div>
        <div className="stat-box" style={{ borderLeftColor: 'var(--primary)' }}>
          <p>Match Rate</p>
          <h3 style={{ color: 'var(--primary)' }}>{results.rate}</h3>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} color="var(--danger)" />
          Mismatch Preview (Top 5)
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '13px', background: 'var(--bg-hover)' }}>
                <th style={{ padding: '12px' }}>RRN / ID</th>
                <th style={{ padding: '12px' }}>Amount</th>
                <th style={{ padding: '12px' }}>Bank Status</th>
                <th style={{ padding: '12px' }}>MW Status</th>
                <th style={{ padding: '12px' }}>Failure Reason</th>
              </tr>
            </thead>
            <tbody>
              {results.mismatchedData?.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>{row.rrn}</td>
                  <td style={{ padding: '12px' }}>₹{row.amount}</td>
                  <td style={{ padding: '12px', color: row.bankStatus === 'SUCCESS' ? 'var(--success)' : (row.bankStatus === 'FAILED' ? 'var(--danger)' : 'var(--warning)') }}>{row.bankStatus}</td>
                  <td style={{ padding: '12px', color: row.mwStatus === 'SUCCESS' ? 'var(--success)' : (row.mwStatus === 'FAILED' ? 'var(--danger)' : (row.mwStatus === 'NOT_FOUND' ? 'var(--text-secondary)' : 'var(--warning)')) }}>{row.mwStatus}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {row.reason}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <div className="download-card">
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Download size={18} /> Matched Entries</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All transactions where amounts and statuses align across all systems.</p>
          </div>
          <button onClick={() => handleDownload(false)} className="btn btn-outline" style={{ border: 'none', background: 'var(--bg-hover)' }}>Download CSV</button>
        </div>
        <div className="download-card">
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}><Download size={18} /> Mismatched Entries</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Detailed breakdown of discrepancies for dispute resolution.</p>
          </div>
          <button onClick={() => handleDownload(true)} className="btn btn-outline" style={{ border: 'none', background: 'var(--bg-hover)' }}>Download CSV</button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .stat-box { padding: 16px; background: var(--bg-hover); border-radius: 12px; border-left: 4px solid var(--border); }
        .stat-box p { font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; }
        .download-card {
          padding: 20px; border: 1px solid var(--border); border-radius: 12px; display: flex; 
          justify-content: space-between; alignItems: center; gap: 20px;
        }
      `}} />
    </div>
  );
};

export default ResultsView;
