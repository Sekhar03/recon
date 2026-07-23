import React from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Globe, 
  Bell, 
  Shield, 
  Save,
  Trash2
} from 'lucide-react';

const Settings = () => {
  return (
    <div className="settings-container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Navigation */}
        <div className="glass-card" style={{ padding: '24px', height: 'fit-content' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li className="settings-nav-item active">
              <Shield size={18} /> Account & Security
            </li>
            <li className="settings-nav-item">
              <Database size={18} /> Product Configurations
            </li>
            <li className="settings-nav-item">
              <Globe size={18} /> API & Webhooks
            </li>
            <li className="settings-nav-item">
              <Bell size={18} /> Notification Rules
            </li>
          </ul>
        </div>

        {/* Content */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ margin: 0 }}>System Settings</h3>
            <span className="tiny-badge" style={{ padding: '4px 12px' }}>v1.4.2-Stable</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Account Section */}
            <section>
              <h4 style={{ marginBottom: '16px', color: 'var(--primary)', fontSize: '13px', textTransform: 'uppercase' }}>Profile Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="input-label">Username</label>
                  <input type="text" defaultValue="finance_admin_01" className="settings-input" />
                </div>
                <div>
                  <label className="input-label">Display Name</label>
                  <input type="text" defaultValue="Finance Executive" className="settings-input" />
                </div>
              </div>
            </section>

            {/* Reconciliation Config */}
            <section style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--primary)', fontSize: '13px', textTransform: 'uppercase' }}>Reconciliation Rules</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>Auto-Trigger Threshold</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Automatically flag jobs if mismatch rate exceeds this value.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="number" defaultValue="2.5" className="settings-input" style={{ width: '80px', textAlign: 'center' }} />
                    <span style={{ fontSize: '14px' }}>%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>Strict Match (Amount)</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ignore discrepancies below a certain paise threshold.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>₹</span>
                    <input type="number" defaultValue="0.05" className="settings-input" style={{ width: '80px', textAlign: 'center' }} />
                  </div>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--primary)', fontSize: '13px', textTransform: 'uppercase' }}>Notification Channels</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" defaultChecked />
                  <span style={{ fontSize: '14px' }}>Email Summary (Daily at 08:00 IST)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" defaultChecked />
                  <span style={{ fontSize: '14px' }}>Immediate Alerts for Failed Jobs</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" />
                  <span style={{ fontSize: '14px' }}>Slack Integration (@recon-alerts)</span>
                </div>
              </div>
            </section>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <button className="btn btn-primary">
                <Save size={18} /> Save All Changes
              </button>
              <button className="btn btn-outline" color="var(--text-secondary)">
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .settings-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-secondary);
          font-weight: 500;
          transition: 0.2s;
        }
        .settings-nav-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .settings-nav-item.active {
          background: var(--primary-glow);
          color: var(--primary);
        }
        .settings-input {
          width: 100%;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          color: white;
          padding: 12px;
          border-radius: 8px;
          outline: none;
        }
        .settings-input:focus { border-color: var(--primary); }
      `}} />
    </div>
  );
};

export default Settings;
