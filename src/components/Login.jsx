import React, { useState } from 'react';
import { ShieldCheck, UserCheck, RefreshCcw, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [role, setRole] = useState('finance_admin');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({
        name: role === 'finance_admin' ? 'Finance Exec' : 'Logic Engineer',
        role: role === 'finance_admin' ? 'Finance Admin' : 'Product Manager',
        id: role
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #1b2a3e 0%, #119db0 100%)', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{ 
        padding: 'var(--login-padding, 48px)', 
        width: '100%', 
        maxWidth: '440px', 
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        borderRadius: '24px'
      }}>
        {/* Logo Section */}
        <div style={{ marginBottom: '32px' }}>
          <img 
            src="https://iserveu.in/wp-content/uploads/2024/01/ISERVEU-MAIN-LOGO.png" 
            alt="iServeU Logo" 
            style={{ height: '40px', marginBottom: '16px' }} 
          />
          <h2 style={{ fontSize: '24px', letterSpacing: '-0.5px' }}>Recon Platform</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Automated Reconciliation Suite</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Role Selection */}
          <div style={{ textAlign: 'left', marginBottom: '32px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: '700', 
              color: 'var(--secondary)', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              marginBottom: '16px'
            }}>
              Select Access Role
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label 
                className={`role-choice ${role === 'product_engineer' ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '2px solid var(--border)',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="product_engineer" 
                  checked={role === 'product_engineer'}
                  onChange={() => setRole('product_engineer')}
                  style={{ display: 'none' }}
                />
                <div style={{ 
                  width: '40px', height: '40px', background: 'var(--bg-hover)', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                }}>
                  <ShieldCheck size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '15px', fontWeight: '600' }}>Product Manager</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>System config & monitoring</p>
                </div>
                {role === 'product_engineer' && <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />}
              </label>

              <label 
                className={`role-choice ${role === 'finance_admin' ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '2px solid var(--border)',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="finance_admin" 
                  checked={role === 'finance_admin'}
                  onChange={() => setRole('finance_admin')}
                  style={{ display: 'none' }}
                />
                <div style={{ 
                  width: '40px', height: '40px', background: 'var(--bg-hover)', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                }}>
                  <UserCheck size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '15px', fontWeight: '600' }}>Finance Admin</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Audit, report & verify</p>
                </div>
                {role === 'finance_admin' && <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />}
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', height: '52px', fontSize: '16px' }}
            disabled={loading}
          >
            {loading ? (
              <RefreshCcw className="spinning" size={20} />
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Powered by iServeU Technology Private Limited
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .role-choice:hover { border-color: var(--primary); background: var(--bg-hover); }
        .role-choice.active { border-color: var(--primary); background: var(--primary-glow); }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @media (max-width: 480px) {
          :root { --login-padding: 32px 24px; }
        }
      `}} />
    </div>
  );
};

export default Login;
