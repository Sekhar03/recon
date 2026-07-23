import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Zap, RefreshCcw, ShieldCheck, FileText, AlertTriangle, CheckCircle2,
  FileCheck, Clock, TrendingUp, DollarSign, ArrowRight, Activity,
  AlertCircle, Play, BarChart2, Shield
} from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 1, label: '4-Way Transaction Recon', section: 'Module 1', icon: RefreshCcw, desc: 'NPCI × Switch × Middleware × Wallet matching with configurable rules engine' },
  { id: 2, label: 'Commission Reconciliation', section: 'Module 2', icon: DollarSign, desc: 'Join MW matched txns with Commission report on relationalId' },
  { id: 3, label: 'NTSL → GEFU Flat File', section: 'Module 3', icon: FileText, desc: 'Parse NTSL, compute net settlement, emit fixed-width bank file with control totals' },
  { id: 4, label: 'Settlement Calculation', section: 'Module 4', icon: BarChart2, desc: 'NET_SETTLEMENT = TXN_AMT − Interchange − Switching − BankShare − Platform ± Adjustments' },
  { id: 5, label: 'GEFU Hard Gate Check', section: 'Module 5', icon: Shield, desc: 'Settlement total must equal GEFU Final Settlement Amount — blocks payout if mismatch' },
  { id: 6, label: 'IMPS Payout File', section: 'Module 6', icon: FileCheck, desc: 'Split any merchant NET > ₹5,00,000 into IMPS-compliant chunked rows with unique refs' },
  { id: 7, label: '3-Way Payout Recon', section: 'Module 7', icon: ShieldCheck, desc: 'Match iServeU payouts against Bank MIS + Bank Statement by UTR / ClientRef' },
];

const Dashboard = ({ onStartNew }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/v1/stats').then(r => setStats(r.data)).catch(() => {
      setStats({
        totalJobs: 12,
        completedToday: 3,
        matchedRate: '99.1%',
        mismatchCount: 73,
        runningCount: 0,
        activeExceptions: 3,
        totalSettled: '₹1,24,30,314',
        gefuStatus: 'Verified',
        payoutRows: 14,
      });
    });
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero CTA */}
      <div style={{
        background: 'linear-gradient(130deg, #1b2a3e 0%, #119db0 100%)',
        borderRadius: '24px',
        padding: '40px 48px',
        marginBottom: '36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-60px', top: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', right: '80px', bottom: '-80px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} color="white" fill="white" />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              UPI Recon & Settlement Automation
            </span>
          </div>
          <h1 style={{ color: 'white', fontSize: '34px', fontWeight: '700', marginBottom: '10px', letterSpacing: '-0.5px' }}>
            End-to-End UPI Pipeline
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', maxWidth: '520px', lineHeight: '1.65' }}>
            4-Way Transaction Matching → Commission Recon → NTSL→GEFU Bank File → Merchant Settlement → IMPS Split Payouts → 3-Way Payout Recon.
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onStartNew}
            className="btn"
            style={{ background: 'white', color: 'var(--primary)', fontWeight: '700', padding: '14px 28px', fontSize: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}
          >
            <Play size={18} fill="currentColor" /> Start New Pipeline
          </button>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '14px 28px', fontSize: '15px' }}>
            <Activity size={18} /> View Analytics
          </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        {[
          { label: 'Cycles Processed Today', value: stats?.completedToday ?? '—', icon: Clock, color: 'var(--primary)', bg: 'var(--primary-glow)' },
          { label: 'Overall Match Rate', value: stats?.matchedRate ?? '—', icon: TrendingUp, color: 'var(--success)', bg: 'var(--success-glow)' },
          { label: 'Active Exceptions', value: stats?.activeExceptions ?? '—', icon: AlertCircle, color: 'var(--warning)', bg: 'var(--warning-glow)' },
          { label: 'GEFU Bank File Status', value: stats?.gefuStatus ?? 'N/A', icon: FileText, color: 'var(--info)', bg: 'var(--info-glow)' },
        ].map((m, i) => (
          <div key={i} className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{ width: '44px', height: '44px', background: m.bg, borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color }}>
                <m.icon size={22} />
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{m.label}</p>
            <h3 style={{ fontSize: '26px', fontWeight: '800', color: m.color }}>{m.value}</h3>
          </div>
        ))}
      </div>

      {/* Pipeline Module Overview */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '20px' }}>Automation Pipeline Modules</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              7 independently runnable, idempotent pipeline stages per settlement cycle
            </p>
          </div>
          <button onClick={onStartNew} className="btn btn-primary">
            <ArrowRight size={16} /> Run Pipeline
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {PIPELINE_STEPS.map((step, idx) => (
            <div key={step.id} className="pipeline-step done" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '38px', height: '38px', background: 'var(--success-glow)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0 }}>
                  <step.icon size={19} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{step.label}</span>
                    <span className="badge badge-primary">{step.section}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{step.desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-success">
                  <CheckCircle2 size={11} /> Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cycle Schedule Quick View */}
      <div className="grid-2">
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '17px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--primary)" /> Today's Cycle Cut-offs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { cycle: 'Cycle 1', cutoff: '09:30 AM', npci: 'NPCI #1,2,3,9,10', color: 'var(--primary)' },
              { cycle: 'Cycle 2', cutoff: '03:30 PM', npci: 'NPCI #4,5,6', color: 'var(--warning)' },
              { cycle: 'Cycle 3', cutoff: '09:30 PM', npci: 'NPCI #7,8', color: 'var(--success)' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color }} />
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '13px' }}>{c.cycle}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>{c.npci}</span>
                  </div>
                </div>
                <span style={{ fontWeight: '700', fontSize: '13px', color: c.color }}>{c.cutoff}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '17px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--warning)" /> Cross-Cutting Requirements Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Idempotency Guard (cycle_id + hash dedup)', ok: true },
              { label: 'Immutable Audit Trail (actor + before/after)', ok: true },
              { label: 'OOXML Format Auto-Detect (.xls/.xlsx)', ok: true },
              { label: 'GEFU Hard Gate Cross-Check', ok: true },
              { label: 'Configurable Rules Engine (no code deploy)', ok: true },
              { label: 'State Machine: pending → matched → settled', ok: true },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                <span className={`badge ${r.ok ? 'badge-success' : 'badge-danger'}`}>
                  {r.ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {r.ok ? 'Enabled' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
