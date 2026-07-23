import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, BarChart2, CheckCircle2, Clock, DollarSign, Zap, RefreshCcw } from 'lucide-react';
import axios from 'axios';

const BAR_COLORS = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--danger)', 'var(--info)'];

const CYCLE_DATA = [
  { label: 'Cycle 1', txns: 4820, matched: 4790, exceptions: 30, matchRate: 99.4, netSettled: 842000 },
  { label: 'Cycle 2', txns: 4100, matched: 4058, exceptions: 42, matchRate: 99.0, netSettled: 718000 },
  { label: 'Cycle 3', txns: 3530, matched: 3492, exceptions: 38, matchRate: 98.9, netSettled: 612000 },
];

const RULE_BREAKDOWN = [
  { rule: 'RULE_1 — Fully Matched', count: 12340, color: 'var(--success)' },
  { rule: 'RULE_2 — Credit Adjustment', count: 28, color: 'var(--warning)' },
  { rule: 'RULE_3 — MW Sync', count: 14, color: 'var(--info)' },
  { rule: 'RULE_4 — Wallet Op', count: 9, color: 'var(--primary)' },
  { rule: 'RULE_5 — RET in URCS', count: 12, color: 'var(--danger)' },
  { rule: 'RULE_7 — TCC in URCS', count: 5, color: '#8b5cf6' },
];

const WEEK_TRENDS = [
  { day: 'Mon', volume: 11200, rate: 99.2, settled: 2140000 },
  { day: 'Tue', volume: 12450, rate: 99.4, settled: 2310000 },
  { day: 'Wed', volume: 10800, rate: 98.9, settled: 2010000 },
  { day: 'Thu', volume: 13100, rate: 99.6, settled: 2450000 },
  { day: 'Fri', volume: 14200, rate: 99.1, settled: 2680000 },
  { day: 'Sat', volume: 9900, rate: 98.7, settled: 1870000 },
  { day: 'Sun', volume: 10400, rate: 99.0, settled: 1950000 },
];

const maxVol = Math.max(...WEEK_TRENDS.map(t => t.volume));
const maxSettled = Math.max(...WEEK_TRENDS.map(t => t.settled));
const maxCount = Math.max(...RULE_BREAKDOWN.map(r => r.count));

const Visualizations = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="animate-fade-in">
      {/* Top KPIs */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        {[
          { label: 'Weekly Transactions', value: '82,050', sub: '+6.2% vs last week', icon: Zap,         color: 'var(--primary)',  bg: 'var(--primary-glow)' },
          { label: 'Avg Match Rate', value: '99.1%',    sub: 'All 3 internal cycles',  icon: TrendingUp,  color: 'var(--success)', bg: 'var(--success-glow)' },
          { label: 'Total Net Settled', value: '₹1.73Cr', sub: 'This week',             icon: DollarSign,  color: 'var(--info)',    bg: 'var(--info-glow)' },
          { label: 'Open Exceptions', value: '73',       sub: '3 require URCS action',  icon: AlertCircle, color: 'var(--warning)', bg: 'var(--warning-glow)' },
        ].map((m, i) => (
          <div key={i} className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: m.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color }}>
                <m.icon size={20} />
              </div>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>{m.label}</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: m.color, marginBottom: '4px' }}>{m.value}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['overview', 'cycle-breakdown', 'rules', 'settlement'].map(tab => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '13px', padding: '9px 18px' }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && 'Weekly Match Trend'}
            {tab === 'cycle-breakdown' && 'Cycle Breakdown'}
            {tab === 'rules' && 'Rule Distribution'}
            {tab === 'settlement' && 'Settlement vs GEFU'}
          </button>
        ))}
      </div>

      {/* ── WEEKLY TREND ── */}
      {activeTab === 'overview' && (
        <div className="grid-2">
          {/* Transaction Volume Bar Chart */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>Daily Transaction Volume</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>Across all 3 internal cycles per day</p>
            <div style={{ display: 'flex', gap: '10px', height: '180px', alignItems: 'flex-end' }}>
              {WEEK_TRENDS.map((t, i) => {
                const h = (t.volume / maxVol) * 160;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{(t.volume/1000).toFixed(1)}K</span>
                    <div style={{ width: '100%', height: `${h}px`, background: `linear-gradient(180deg, var(--primary-light) 0%, var(--primary) 100%)`, borderRadius: '6px 6px 0 0', transition: '0.3s' }} title={`${t.volume} transactions`} />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>{t.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Match Rate Line */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>4-Way Match Rate Trend</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>NPCI × Switch × Middleware × Wallet</p>
            <div style={{ height: '200px', position: 'relative' }}>
              <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[98, 98.5, 99, 99.5, 100].map((v, i) => {
                  const y = 80 - ((v - 97.5) / 2.5) * 75;
                  return (
                    <g key={i}>
                      <line x1="0" y1={y} x2="200" y2={y} stroke="var(--border)" strokeWidth="0.5" />
                      <text x="-2" y={y + 2} fontSize="5" fill="var(--text-secondary)" textAnchor="end">{v}%</text>
                    </g>
                  );
                })}
                <path
                  d={`M 0 ${80 - ((WEEK_TRENDS[0].rate - 97.5) / 2.5) * 75} ${WEEK_TRENDS.map((t, i) => `L ${i * 33.33} ${80 - ((t.rate - 97.5) / 2.5) * 75}`).join(' ')} L ${(WEEK_TRENDS.length - 1) * 33.33} 80 L 0 80 Z`}
                  fill="url(#lineGrad)"
                />
                <path
                  d={WEEK_TRENDS.map((t, i) => `${i === 0 ? 'M' : 'L'} ${i * 33.33} ${80 - ((t.rate - 97.5) / 2.5) * 75}`).join(' ')}
                  fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                />
                {WEEK_TRENDS.map((t, i) => (
                  <circle key={i} cx={i * 33.33} cy={80 - ((t.rate - 97.5) / 2.5) * 75} r="2.5" fill="white" stroke="var(--primary)" strokeWidth="1.5" />
                ))}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                {WEEK_TRENDS.map((t, i) => (
                  <span key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>{t.day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CYCLE BREAKDOWN ── */}
      {activeTab === 'cycle-breakdown' && (
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Internal Cycle Performance Breakdown</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>NPCI → 3 internal cycle aggregation — today</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {CYCLE_DATA.map((c, i) => (
              <div key={i} style={{ padding: '20px 24px', border: '1.5px solid var(--border)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: `${BAR_COLORS[i]}20`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: BAR_COLORS[i] }}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <span style={{ fontWeight: '800', fontSize: '16px' }}>{c.label}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '10px' }}>{c.txns.toLocaleString()} transactions</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>MATCHED</p>
                      <p style={{ fontWeight: '800', color: 'var(--success)' }}>{c.matched.toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>EXCEPTIONS</p>
                      <p style={{ fontWeight: '800', color: 'var(--warning)' }}>{c.exceptions}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>NET SETTLED</p>
                      <p style={{ fontWeight: '800', color: 'var(--primary)' }}>₹{(c.netSettled / 100000).toFixed(2)}L</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Match Rate</span>
                    <strong style={{ color: BAR_COLORS[i] }}>{c.matchRate}%</strong>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-hover)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${c.matchRate}%`, height: '100%', background: BAR_COLORS[i], borderRadius: '8px', transition: '0.8s ease' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RULE DISTRIBUTION ── */}
      {activeTab === 'rules' && (
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Adjustment Rule Distribution</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>How 4-way match rule engine classified transactions today</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {RULE_BREAKDOWN.map((r, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600' }}>{r.rule}</span>
                  <span style={{ color: 'var(--text-secondary)' }}><strong style={{ color: r.color }}>{r.count.toLocaleString()}</strong> transactions</span>
                </div>
                <div style={{ height: '10px', background: 'var(--bg-hover)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${(r.count / maxCount) * 100}%`, height: '100%', background: r.color, borderRadius: '10px', transition: '0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SETTLEMENT vs GEFU ── */}
      {activeTab === 'settlement' && (
        <div className="grid-2">
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>Settlement Total vs GEFU Final Amount</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Hard Gate Validation — must match exactly (≤ ₹1 variance allowed)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {CYCLE_DATA.map((c, i) => {
                const gefuAmt = c.netSettled * 0.998; // slight simulated difference
                const variance = Math.abs(c.netSettled - gefuAmt).toFixed(2);
                const passed = parseFloat(variance) < 100;
                return (
                  <div key={i} style={{ padding: '14px 16px', border: `1.5px solid ${passed ? 'var(--success)' : 'var(--danger)'}`, borderRadius: '12px', background: passed ? 'var(--success-glow)' : 'var(--danger-glow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700' }}>{c.label}</span>
                      <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>
                        {passed ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                        {passed ? 'Gate Passed' : 'MISMATCH'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '10px', fontSize: '12px' }}>
                      <span>Settlement: <strong>₹{c.netSettled.toLocaleString()}</strong></span>
                      <span>GEFU: <strong>₹{Math.round(gefuAmt).toLocaleString()}</strong></span>
                      <span>Variance: <strong style={{ color: passed ? 'var(--success)' : 'var(--danger)' }}>₹{variance}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>Weekly Net Settlement Amount</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Daily totals across all cycles after GEFU gate</p>
            <div style={{ display: 'flex', gap: '10px', height: '180px', alignItems: 'flex-end' }}>
              {WEEK_TRENDS.map((t, i) => {
                const h = (t.settled / maxSettled) * 160;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>₹{(t.settled/100000).toFixed(0)}L</span>
                    <div style={{ width: '100%', height: `${h}px`, background: `linear-gradient(180deg, #34d399 0%, var(--success) 100%)`, borderRadius: '6px 6px 0 0', transition: '0.3s' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>{t.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualizations;
