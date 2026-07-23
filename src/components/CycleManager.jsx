import React, { useState } from 'react';
import { Clock, RefreshCcw, CheckCircle2, AlertTriangle, Calendar, ArrowRight, ShieldCheck, Play } from 'lucide-react';
import { NPCI_SUB_CYCLES, INTERNAL_CYCLES } from '../utils/constants';

const CycleManager = ({ onTriggerRun }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCycle, setSelectedCycle] = useState('Cycle 1');
  const [isReRunning, setIsReRunning] = useState(false);

  const handleRunCycle = (cycleId) => {
    setIsReRunning(true);
    setTimeout(() => {
      setIsReRunning(false);
      if (onTriggerRun) {
        onTriggerRun(cycleId, selectedDate);
      }
    }, 800);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock className="icon-pulse" color="var(--primary)" size={24} />
            NPCI → Internal Cycle Scheduler (§3.1)
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            Automated ingestion and cut-off orchestration mapping 10 daily NPCI sub-cycles into 3 internal settlement cycles.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-hover)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Calendar size={18} color="var(--primary)" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '14px', fontWeight: '600', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Internal Cycles Executive Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {INTERNAL_CYCLES.map((c) => (
          <div 
            key={c.id}
            className={`glass-card ${selectedCycle === c.id ? 'active-cycle' : ''}`}
            style={{ 
              padding: '24px', 
              borderRadius: '20px',
              border: selectedCycle === c.id ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: selectedCycle === c.id ? 'var(--primary-glow)' : 'var(--bg-card)',
              cursor: 'pointer',
              transition: '0.3s'
            }}
            onClick={() => setSelectedCycle(c.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>
                  GEFU Cut-off: {c.gefuCutoff}
                </span>
                <h3 style={{ fontSize: '20px', marginTop: '4px' }}>{c.label}</h3>
              </div>
              <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> Ready
              </span>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>{c.time}</p>

            <button 
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '13px' }}
              onClick={(e) => {
                e.stopPropagation();
                handleRunCycle(c.id);
              }}
              disabled={isReRunning}
            >
              {isReRunning ? <RefreshCcw size={16} className="spinning" /> : <Play size={16} fill="currentColor" />}
              Re-run Cycle on Demand
            </button>
          </div>
        ))}
      </div>

      {/* 10 NPCI Sub-Cycle Detailed Mapping Table */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>NPCI Sub-Cycle Mapping Matrix</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px' }}>NPCI Cycle #</th>
                <th style={{ padding: '14px' }}>Mapped Internal Cycle</th>
                <th style={{ padding: '14px' }}>IST Time Window</th>
                <th style={{ padding: '14px' }}>Settlement Timing</th>
                <th style={{ padding: '14px' }}>GEFU Cut-Off</th>
                <th style={{ padding: '14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {NPCI_SUB_CYCLES.map((row) => {
                const isSelected = row.internalCycle === selectedCycle;
                return (
                  <tr 
                    key={row.npciCycle} 
                    style={{ 
                      borderBottom: '1px solid var(--border)', 
                      fontSize: '14px',
                      background: isSelected ? 'rgba(17, 157, 176, 0.05)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                      NPCI Cycle #{row.npciCycle}
                    </td>
                    <td style={{ padding: '14px', fontWeight: '600' }}>
                      <span className="pill-tag">{row.internalCycle}</span>
                    </td>
                    <td style={{ padding: '14px', fontFamily: 'monospace' }}>{row.timeWindow}</td>
                    <td style={{ padding: '14px' }}>{row.settlesOn}</td>
                    <td style={{ padding: '14px', fontWeight: '600', color: 'var(--secondary)' }}>{row.cutoff}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--success)', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
                        ● Active Window
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pill-tag {
          background: var(--bg-hover);
          padding: 4px 12px;
          border-radius: 50px;
          border: 1px solid var(--border);
          font-size: 12px;
        }
      `}} />
    </div>
  );
};

export default CycleManager;
