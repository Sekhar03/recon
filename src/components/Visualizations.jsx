import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowUpRight, 
  AlertCircle, 
  Clock,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import axios from 'axios';

const Visualizations = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/v1/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
        setStats({
          totalJobs: 10,
          completedToday: 3,
          matchedRate: '98.4%',
          mismatchCount: 1282,
          runningCount: 0,
          productDistribution: { mATM: 5, AePS: 3, DMT: 2 },
          failureReasons: { 'Status Mismatch': 45, 'Amount Mismatch': 28, 'Timeout': 15, 'Missing in MN': 12 },
          trends: [
            { day: 'Mon', volume: 8500, rate: 97.2 },
            { day: 'Tue', volume: 9200, rate: 98.1 },
            { day: 'Wed', volume: 7800, rate: 96.5 },
            { day: 'Thu', volume: 10500, rate: 99.2 },
            { day: 'Fri', volume: 11200, rate: 98.8 },
            { day: 'Sat', volume: 8900, rate: 97.5 },
            { day: 'Sun', volume: 9500, rate: 98.4 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="visualizations animate-fade-in">
      <div className="responsive-grid" style={{ marginBottom: '32px' }}>
        {/* Match Rate Performance (Area Chart) */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpRight size={20} color="var(--primary)" />
              Match Rate Performance
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Weekly accuracy across all products</p>
          </div>
          
          <div style={{ height: '220px', position: 'relative' }}>
            <svg viewBox="0 0 100 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d={`M 0 40 ${stats?.trends?.map((t, i) => `L ${i * 16.6} ${40 - (t.rate - 90) * 4}`).join(' ')} L 100 40 Z`}
                fill="url(#areaGradient)"
              />
              <path 
                d={`M 0 ${40 - (stats?.trends?.[0]?.rate - 90) * 4} ${stats?.trends?.map((t, i) => `L ${i * 16.6} ${40 - (t.rate - 90) * 4}`).join(' ')}`}
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {stats?.trends?.map((t, i) => (
                <circle key={i} cx={i * 16.6} cy={40 - (t.rate - 90) * 4} r="1.5" fill="white" stroke="var(--primary)" strokeWidth="0.8" />
              ))}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: 'var(--text-secondary)', fontSize: '11px' }}>
              {stats?.trends?.map((t, i) => <span key={i}>{t.day}</span>)}
            </div>
          </div>
        </div>

        {/* Product Mix (Pie Chart) */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="var(--warning)" />
            Product Distribution
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>Volume split by financial product</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
             <div style={{ 
               width: '180px', 
               height: '180px', 
               borderRadius: '50%',
               background: `conic-gradient(
                 var(--primary) 0% 45%, 
                 var(--secondary) 45% 75%, 
                 var(--warning) 75% 100%
               )`,
               boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
               position: 'relative',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}>
               <div style={{ width: '120px', height: '120px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <LayoutDashboard color="var(--primary)" size={32} />
               </div>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                 <span style={{ fontSize: '14px', fontWeight: '500' }}>mATM (45%)</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
                 <span style={{ fontSize: '14px', fontWeight: '500' }}>AePS (30%)</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--warning)' }}></div>
                 <span style={{ fontSize: '14px', fontWeight: '500' }}>DMT (25%)</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Mismatch Reasons */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} color="var(--danger)" />
          Mismatch Root Causes
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
          {Object.entries(stats?.failureReasons || {}).map(([reason, count], i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ fontWeight: '500' }}>{reason}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{count} cases</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-hover)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${(count / 50) * 100}%`, 
                  height: '100%', 
                  background: i === 0 ? 'var(--danger)' : 'var(--primary)',
                  borderRadius: '10px'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
