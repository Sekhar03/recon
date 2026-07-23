import React from 'react';
import { 
  Plus, 
  Zap,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

const Dashboard = ({ onStartNew }) => {
  return (
    <div className="dashboard-hero animate-fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh',
      textAlign: 'center'
    }}>
      <div style={{ 
        width: '80px', 
        height: '80px', 
        background: 'var(--primary-glow)', 
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
        marginBottom: '24px'
      }}>
        <Zap size={40} fill="currentColor" />
      </div>

      <h1 style={{ fontSize: '42px', marginBottom: '16px', letterSpacing: '-1px' }}>
        Automated Financial Reconciliation
      </h1>
      <p style={{ 
        fontSize: '18px', 
        color: 'var(--text-secondary)', 
        maxWidth: '600px', 
        marginBottom: '48px',
        lineHeight: '1.6'
      }}>
        Streamline your mATM, AePS, and DMT reconciliation processes with iServeU's 5-way matching engine. Extract data, verify settlement reports, and resolve discrepancies in minutes.
      </p>

      <button 
        className="btn btn-primary" 
        onClick={onStartNew}
        style={{ 
          padding: '16px 40px', 
          fontSize: '18px', 
          fontWeight: '600',
          boxShadow: '0 10px 25px rgba(17, 157, 176, 0.4)'
        }}
      >
        <Plus size={22} /> Start New Reconciliation
      </button>

      <div style={{ 
        display: 'flex', 
        gap: '40px', 
        marginTop: '80px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
          <ShieldCheck size={18} color="var(--primary)" />
          <span>BigQuery Secure Extraction</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
          <FileCheck size={18} color="var(--primary)" />
          <span>Multi-Node Matching</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

