import React, { useState } from 'react';
import { 
  Zap, 
  FileText, 
  FileSpreadsheet, 
  DollarSign, 
  CreditCard, 
  User, 
  LogOut, 
  X,
  Settings,
  History as HistoryIcon
} from 'lucide-react';
import FullPipelineView from './components/FullPipelineView';
import GefuView from './components/GefuView';
import SettlementPayoutView from './components/SettlementPayoutView';
import HistoryLog from './components/History';
import FeeConfigView from './components/FeeConfigView';
import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('upi-recon');
  const [user, setUser] = useState({ name: 'Finance Admin', role: 'Reconciliation Lead' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => {
    setUser(null);
    setActiveTab('upi-recon');
  };

  if (!user) {
    return <Login onLogin={(usr) => setUser(usr)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'upi-recon':
        return <FullPipelineView />;
      case 'gefu-file':
        return <GefuView viewMode="flat" />;
      case 'gefu-accounting':
        return <GefuView viewMode="accounting" />;
      case 'settlement-file':
        return <SettlementPayoutView viewMode="settlement" />;
      case 'payout-file':
        return <SettlementPayoutView viewMode="payout" />;
      case 'fee-config':
        return <FeeConfigView />;
      case 'job-archives':
        return <HistoryLog />;
      default:
        return <FullPipelineView />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{ width: '260px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div className="brand" style={{ padding: '0 8px' }}>
            <img src="https://iserveu.in/wp-content/uploads/2024/01/ISERVEU-MAIN-LOGO.png" alt="iServeU" style={{ height: '30px', filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', marginTop: '6px', letterSpacing: '1px' }}>
              UPI Recon & Settlement
            </p>
          </div>
          <button className="mobile-only" onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Primary Module */}
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '1px', margin: '0 0 8px 12px' }}>
                Reconciliation Hub
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li className={`nav-item ${activeTab === 'upi-recon' ? 'active' : ''}`} onClick={() => { setActiveTab('upi-recon'); setMobileMenuOpen(false); }}>
                  <Zap size={17} />
                  <span>UPI Reconciliation</span>
                </li>
              </ul>
            </div>

            {/* Output Modules */}
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '1px', margin: '0 0 8px 12px' }}>
                Output Files
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li className={`nav-item ${activeTab === 'gefu-file' ? 'active' : ''}`} onClick={() => { setActiveTab('gefu-file'); setMobileMenuOpen(false); }}>
                  <FileText size={17} />
                  <span>GEFU File</span>
                </li>
                <li className={`nav-item ${activeTab === 'gefu-accounting' ? 'active' : ''}`} onClick={() => { setActiveTab('gefu-accounting'); setMobileMenuOpen(false); }}>
                  <FileSpreadsheet size={17} />
                  <span>GEFU Accounting File</span>
                </li>
                <li className={`nav-item ${activeTab === 'settlement-file' ? 'active' : ''}`} onClick={() => { setActiveTab('settlement-file'); setMobileMenuOpen(false); }}>
                  <DollarSign size={17} />
                  <span>Settlement File</span>
                </li>
                <li className={`nav-item ${activeTab === 'payout-file' ? 'active' : ''}`} onClick={() => { setActiveTab('payout-file'); setMobileMenuOpen(false); }}>
                  <CreditCard size={17} />
                  <span>Payout File</span>
                </li>
              </ul>
            </div>

            {/* Configuration & Settings */}
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '1px', margin: '0 0 8px 12px' }}>
                Configuration
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li className={`nav-item ${activeTab === 'fee-config' ? 'active' : ''}`} onClick={() => { setActiveTab('fee-config'); setMobileMenuOpen(false); }}>
                  <Settings size={17} />
                  <span>Fee & Tax Settings</span>
                </li>
              </ul>
            </div>

            {/* Archives Module */}
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '1px', margin: '0 0 8px 12px' }}>
                Archives
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li className={`nav-item ${activeTab === 'job-archives' ? 'active' : ''}`} onClick={() => { setActiveTab('job-archives'); setMobileMenuOpen(false); }}>
                  <HistoryIcon size={17} />
                  <span>Job Archives</span>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} />
            </div>
            <div>
              <p style={{ fontSize: '12.5px', fontWeight: '500', color: 'white', margin: 0 }}>{user.name}</p>
              <p style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{user.role}</p>
            </div>
          </div>
          <div className="nav-item-logout" onClick={logout} style={{ color: '#ff8a8a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
            <LogOut size={15} />
            <span style={{ fontSize: '12.5px', fontWeight: '500' }}>Logout Session</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>
              {activeTab === 'upi-recon' && 'UPI Reconciliation Pipeline Execution'}
              {activeTab === 'gefu-file' && 'GEFU File (Positional Bank Flat File)'}
              {activeTab === 'gefu-accounting' && 'GEFU Accounting File (Internal Ledger)'}
              {activeTab === 'settlement-file' && 'Merchant Settlement File'}
              {activeTab === 'payout-file' && 'IMPS Payout File (₹500,000 Split)'}
              {activeTab === 'fee-config' && 'Fee & Tax Settings'}
              {activeTab === 'job-archives' && 'Job Archives & Historical Reconciliation Logs'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {activeTab === 'upi-recon' 
                ? 'Automated 4-Way Matching → GEFU Flat File → Settlement Gate → IMPS Payout Split.'
                : (activeTab === 'job-archives'
                    ? 'Inspect past reconciliation runs and re-download generated output files.'
                    : (activeTab === 'fee-config'
                        ? 'Configure system-wide GST, Bank Share, switching fees, and payout limits.'
                        : 'Inspect and download output files generated by the reconciliation pipeline.'))}
            </p>
          </div>
        </header>

        <section className="animate-fade-in">
          {renderContent()}
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: 0.2s;
          font-weight: 500;
          font-size: 13.5px;
        }
        .nav-item:hover { color: white; background: rgba(255,255,255,0.08); }
        .nav-item.active { color: white; background: var(--primary); font-weight: 700; }
        .mobile-only { display: none; }
        @media (max-width: 768px) {
          .mobile-only { display: block; }
        }
      `}} />
    </div>
  );
}

export default App;
