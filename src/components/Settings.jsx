import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Database, Globe, Bell, Shield, Save,
  Plus, Trash2, Edit3, Check, X, RefreshCcw, Table2, Percent
} from 'lucide-react';
// Rules defined locally to avoid importing Node.js server module in browser context

// We re-define the default rules here for frontend display since server modules are not imported in browser
const INITIAL_RULES = [
  { id: 'RULE_1', npci: 'Success', switch: 'Success', middleware: 'Success',    wallet: 'Success',    action: 'No action (matched)',                     isMatched: true,  autoActionable: true  },
  { id: 'RULE_2', npci: 'Success', switch: 'Success', middleware: 'In Progress', wallet: 'N/A',       action: 'Raise credit adjustment',                 isMatched: false, autoActionable: false },
  { id: 'RULE_3', npci: 'Success', switch: 'Success', middleware: 'In Progress', wallet: 'Success',   action: 'Update Middleware status → Success',       isMatched: false, autoActionable: true  },
  { id: 'RULE_4', npci: 'Success', switch: 'Success', middleware: 'Success',    wallet: 'N/A',        action: 'Process wallet operation → Success',       isMatched: false, autoActionable: true  },
  { id: 'RULE_5', npci: 'Pending', switch: 'Pending', middleware: 'In Progress', wallet: 'N/A',       action: 'Raise RET in URCS portal',                isMatched: false, autoActionable: false },
  { id: 'RULE_6', npci: 'Success', switch: 'Failed',  middleware: 'Failed',     wallet: 'N/A',        action: 'Raise RET in URCS portal',                isMatched: false, autoActionable: false },
  { id: 'RULE_7', npci: 'Pending', switch: 'Success', middleware: 'Success',    wallet: 'Success',    action: 'Raise TCC in URCS portal',                isMatched: false, autoActionable: false },
  { id: 'RULE_8', npci: 'Success', switch: 'Pending', middleware: 'Success',    wallet: 'Success',    action: 'No action',                               isMatched: false, autoActionable: true  },
];

const GEFU_ACCOUNT_CONFIG = [
  { entryType: 'Net Settlement Amount',       accountNumber: '9908123456789012', accountName: 'NPCI UPI Settlement Pool A/C',   drCr: 'CR', description: 'UPI Net Settlement Credit to Pool' },
  { entryType: 'NPCI Switching Fee',          accountNumber: '9908123456789013', accountName: 'NPCI Switching Fee Expense A/C', drCr: 'DR', description: 'NPCI Switching Fee Debit' },
  { entryType: 'GST on Switching Fee',        accountNumber: '9908123456789014', accountName: 'Input GST Receivable A/C',       drCr: 'DR', description: 'GST on NPCI Switching Fee' },
  { entryType: 'Bank Share Commission',       accountNumber: '9908123456789015', accountName: 'Bank UPI Revenue A/C',           drCr: 'CR', description: 'Bank Share @ 0.2006%' },
  { entryType: 'GST on Bank Share',           accountNumber: '9908123456789016', accountName: 'GST on Bank Share A/C',          drCr: 'DR', description: 'GST on Bank Commission' },
  { entryType: 'ISU Revenue',                 accountNumber: '9908123456789017', accountName: 'ISU Platform Revenue A/C',       drCr: 'CR', description: 'iServeU Platform Fee' },
  { entryType: 'Final Merchant Settlement',   accountNumber: '9908123456789018', accountName: 'Merchant Settlement Clearing',   drCr: 'DR', description: 'Final Allocation to Merchants' },
];

const Settings = () => {
  const [activeSection, setActiveSection] = useState('reconciliation');
  const [bankShareRate, setBankShareRate] = useState('0.2006');
  const [impsLimit, setImpsLimit] = useState('500000');
  const [fundTransferType, setFundTransferType] = useState('IMPS');
  const [autoActionFlag, setAutoActionFlag] = useState(false);
  const [strictAmtThreshold, setStrictAmtThreshold] = useState('0.05');
  const [rules, setRules] = useState(INITIAL_RULES);
  const [gefuConfig, setGefuConfig] = useState(GEFU_ACCOUNT_CONFIG);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const statusOptions = ['Success', 'Pending', 'Failed', 'In Progress', 'N/A'];

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '28px', alignItems: 'start' }}>
      {/* Sidebar Nav */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px', paddingLeft: '14px' }}>Settings</p>
        <ul style={{ listStyle: 'none' }}>
          {[
            { id: 'reconciliation', label: 'Reconciliation Config', icon: RefreshCcw },
            { id: 'rules',          label: '4-Way Rules Engine',    icon: Table2 },
            { id: 'gefu',           label: 'GEFU Account Config',   icon: Database },
            { id: 'settlement',     label: 'Settlement & Payout',   icon: Percent },
            { id: 'security',       label: 'Account & Security',    icon: Shield },
            { id: 'notifications',  label: 'Notifications',         icon: Bell },
          ].map(s => (
            <li key={s.id} className={`settings-nav-item ${activeSection === s.id ? 'active' : ''}`} onClick={() => setActiveSection(s.id)}>
              <s.icon size={16} /> {s.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="glass-card" style={{ padding: '36px' }}>
        {/* ── Reconciliation Config ── */}
        {activeSection === 'reconciliation' && (
          <div>
            <h3 style={{ marginBottom: '6px' }}>Reconciliation Configuration</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>Configure matching engine parameters and amount tolerance settings.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label className="input-label">Match Tolerance Threshold (₹)</label>
                  <input type="number" step="0.01" value={strictAmtThreshold} onChange={e => setStrictAmtThreshold(e.target.value)} className="settings-input" />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>Discrepancies below this amount are ignored during matching.</p>
                </div>
                <div>
                  <label className="input-label">Mismatch Rate Alert Threshold (%)</label>
                  <input type="number" step="0.1" defaultValue="2.5" className="settings-input" />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>Alert Finance team if mismatch rate exceeds this value.</p>
                </div>
              </div>

              <div style={{ padding: '20px', background: 'var(--bg-hover)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '14px' }}>Auto-Execute Rules (Config Flag)</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>When ON, auto-actionable rules (RULE_3, RULE_4) execute without reviewer approval.</p>
                </div>
                <button
                  onClick={() => setAutoActionFlag(!autoActionFlag)}
                  style={{ width: '52px', height: '28px', borderRadius: '20px', background: autoActionFlag ? 'var(--success)' : 'var(--border)', border: 'none', cursor: 'pointer', transition: '0.3s', position: 'relative' }}
                >
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: autoActionFlag ? '27px' : '3px', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </button>
              </div>

              <div>
                <label className="input-label">GCP Bucket Path (Middleware / Wallet auto-ingest)</label>
                <input type="text" defaultValue="gs://iserveu-recon-prod/middleware/" className="settings-input" />
              </div>
              <div>
                <label className="input-label">SFTP Host (Switch Report auto-ingest)</label>
                <input type="text" defaultValue="sftp.iserveu.in:22 /switch_reports/" className="settings-input" />
              </div>
            </div>
          </div>
        )}

        {/* ── 4-Way Rules Engine ── */}
        {activeSection === 'rules' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ marginBottom: '4px' }}>4-Way Reconciliation Rules Engine</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>DB-backed configurable rule table. Add/edit rows without code deployment.</p>
              </div>
              <button
                className="btn btn-primary"
                style={{ fontSize: '13px' }}
                onClick={() => setRules(prev => [...prev, {
                  id: `RULE_${prev.length + 1}`,
                  npci: 'Success', switch: 'Success', middleware: 'Success', wallet: 'N/A',
                  action: 'New custom action', isMatched: false, autoActionable: false
                }])}
              >
                <Plus size={15} /> Add Rule Row
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rule ID</th>
                    <th>NPCI</th>
                    <th>Switch</th>
                    <th>MW</th>
                    <th>Wallet</th>
                    <th>Action Required</th>
                    <th>State</th>
                    <th>Auto</th>
                    <th>Ops</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map(rule => (
                    <tr key={rule.id}>
                      <td style={{ fontWeight: '700', fontSize: '13px' }}>{rule.id}</td>
                      <td><span className={`badge ${rule.npci === 'Success' ? 'badge-success' : 'badge-warning'}`}>{rule.npci}</span></td>
                      <td><span className={`badge ${rule.switch === 'Success' ? 'badge-success' : 'badge-warning'}`}>{rule.switch}</span></td>
                      <td><span className={`badge ${rule.middleware === 'Success' ? 'badge-success' : 'badge-warning'}`}>{rule.middleware}</span></td>
                      <td><span className={`badge ${rule.wallet === 'Success' ? 'badge-success' : rule.wallet === 'N/A' ? 'badge-neutral' : 'badge-warning'}`}>{rule.wallet}</span></td>
                      <td style={{ fontSize: '13px', fontWeight: '500' }}>{rule.action}</td>
                      <td><span className={`badge ${rule.isMatched ? 'badge-success' : 'badge-danger'}`}>{rule.isMatched ? 'MATCHED' : 'EXCEPTION'}</span></td>
                      <td>{rule.autoActionable ? <CheckCircle2 size={16} color="var(--success)" /> : <Clock size={16} color="var(--text-secondary)" />}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="icon-btn" onClick={() => setRules(prev => prev.filter(r => r.id !== rule.id))}><Trash2 size={14} color="var(--danger)" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── GEFU Account Configuration ── */}
        {activeSection === 'gefu' && (
          <div>
            <h3 style={{ marginBottom: '6px' }}>GEFU Bank Account Configuration</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
              Maps each GEFU entry type to its predefined bank account number. A bank-side spec change is a config update here — no code deploy required.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Entry Type</th>
                    <th>Account Number</th>
                    <th>Account Name</th>
                    <th>Dr / Cr</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {gefuConfig.map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '700', fontSize: '13px' }}>{row.entryType}</td>
                      <td>
                        <input
                          value={row.accountNumber}
                          onChange={e => setGefuConfig(prev => prev.map((r, ri) => ri === i ? { ...r, accountNumber: e.target.value } : r))}
                          className="settings-input"
                          style={{ padding: '6px 10px', fontSize: '12px', fontFamily: 'monospace' }}
                        />
                      </td>
                      <td style={{ fontSize: '12px' }}>{row.accountName}</td>
                      <td><span className={`badge ${row.drCr === 'CR' ? 'badge-success' : 'badge-danger'}`}>{row.drCr}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Settlement & Payout Config ── */}
        {activeSection === 'settlement' && (
          <div>
            <h3 style={{ marginBottom: '6px' }}>Settlement & Payout Configuration</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '32px' }}>
              Controls Bank Share rate, IMPS split threshold, and fund transfer rail configuration.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="input-label">Bank Share Rate (%)</label>
                  <input type="number" step="0.0001" value={bankShareRate} onChange={e => setBankShareRate(e.target.value)} className="settings-input" />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    Confirmed current rate: 0.2006%. BANK_SHARE = TXN_AMOUNT × rate. Confirm with Finance before changing.
                  </p>
                </div>
                <div>
                  <label className="input-label">IMPS Per-Row Limit (₹)</label>
                  <input type="number" value={impsLimit} onChange={e => setImpsLimit(e.target.value)} className="settings-input" />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    Any merchant NET_SETTLEMENT above this is chunked. Confirmed pattern: ₹9,29,156.36 → ₹4,29,156.36 + ₹5,00,000.
                  </p>
                </div>
              </div>

              <div>
                <label className="input-label">Fund Transfer Rail</label>
                <select value={fundTransferType} onChange={e => setFundTransferType(e.target.value)} className="settings-input">
                  <option value="IMPS">IMPS (Current — up to ₹5L per row)</option>
                  <option value="NEFT">NEFT</option>
                  <option value="RTGS">RTGS</option>
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  fundTransferType is always IMPS in current data. Keep as config in case NEFT/RTGS rails are added.
                </p>
              </div>

              <div style={{ padding: '20px', background: 'var(--bg-hover)', borderRadius: '14px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>NET SETTLEMENT Formula</h4>
                <pre style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--secondary)', lineHeight: '1.8', background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', overflowX: 'auto' }}>
{`NET_SETTLEMENT = TXN_AMOUNT
    − INTERCHANGE (incl. GST)
    − SWITCHING_FEE (incl. GST)
    − BANK_SHARE (${bankShareRate}% of TXN_AMOUNT, incl. GST)
    − PLATFORM_FEE (incl. GST)
    − LEA_HOLD
    − PERIOD_LIEN_AMOUNT
    + CR_ADJUSTMENT
    − CHARGEBACK
    + CHARGEBACK_WON`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ── Account & Security ── */}
        {activeSection === 'security' && (
          <div>
            <h3 style={{ marginBottom: '24px' }}>Account & Security</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label className="input-label">Username</label>
                <input type="text" defaultValue="finance_admin_01" className="settings-input" />
              </div>
              <div>
                <label className="input-label">Display Name</label>
                <input type="text" defaultValue="Finance Admin" className="settings-input" />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" defaultValue="finance@iserveu.in" className="settings-input" />
              </div>
              <div>
                <label className="input-label">Current Role</label>
                <input type="text" defaultValue="Reconciliation Lead" className="settings-input" readOnly />
              </div>
            </div>
            <div style={{ padding: '16px 20px', background: 'var(--warning-glow)', border: '1px solid var(--warning)', borderRadius: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--warning)' }}>Audit Note:</strong> All disposition actions, rule changes, and file generations are logged immutably with actor ID, timestamp, and before/after values.
            </div>
          </div>
        )}

        {/* ── Notifications ── */}
        {activeSection === 'notifications' && (
          <div>
            <h3 style={{ marginBottom: '24px' }}>Notification Rules</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {[
                { label: 'Email on GEFU Hard Gate Failure', sub: 'Sent immediately when Settlement Total ≠ GEFU Final Settlement', default: true },
                { label: 'Email on New Exception Queue Items', sub: 'Alert reviewer when new RULE_2 / RULE_5 / RULE_7 exceptions appear', default: true },
                { label: 'Daily Cycle Summary Report (08:00 IST)', sub: 'Per-cycle matched %, commission total, GEFU variance', default: true },
                { label: 'OOXML Format Mismatch Alert', sub: 'When NTSL .xls file is detected as actual OOXML .xlsx binary', default: true },
                { label: 'Slack Webhook (@recon-alerts)', sub: 'Real-time push for critical failures and payout blocks', default: false },
                { label: 'Bank File Rejection Notification', sub: 'When bank system rejects GEFU flat file due to control total mismatch', default: true },
              ].map((n, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '13.5px' }}>{n.label}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.sub}</p>
                  </div>
                  <input type="checkbox" defaultChecked={n.default} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button (shared) */}
        <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
          </button>
          <button className="btn btn-outline">Reset to Defaults</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
