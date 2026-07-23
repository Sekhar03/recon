import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  RefreshCcw, 
  DollarSign,
  FileCheck,
  User, 
  LogOut, 
  X,
  Layers
} from 'lucide-react';
import FullPipelineView from './components/FullPipelineView';
import ModuleAView from './components/ModuleAView';
import ModuleBView from './components/ModuleBView';
import ModuleCView from './components/ModuleCView';
import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('full-pipeline');
  const [user, setUser] = useState({ name: 'Finance Admin', role: 'Reconciliation Lead' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => {
    setUser(null);
    setActiveTab('full-pipeline');
  };

  if (!user) {
    return <Login onLogin={(usr) => setUser(usr)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'full-pipeline':
        return <FullPipelineView />;
      case 'module-a':
        return <ModuleAView />;
      case 'module-b':
        return <ModuleBView />;
      case 'module-c':
        return <ModuleCView />;
      default:
        return <FullPipelineView />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div className="brand" style={{ padding: '0 8px' }}>
            <img src="https://iserveu.in/wp-content/uploads/2024/01/ISERVEU-MAIN-LOGO.png" alt="iServeU" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', marginTop: '8px', letterSpacing: '1px' }}>
              Reconciliation & Settlement
            </p>
          </div>
          <button className="mobile-only" onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li className={`nav-item ${activeTab === 'full-pipeline' ? 'active' : ''}`} onClick={() => { setActiveTab('full-pipeline'); setMobileMenuOpen(false); }}>
              <Layers size={18} />
              <span>Full Pipeline (6 In / 6 Out)</span>
            </li>
            <li className={`nav-item ${activeTab === 'module-a' ? 'active' : ''}`} onClick={() => { setActiveTab('module-a'); setMobileMenuOpen(false); }}>
              <RefreshCcw size={18} />
              <span>Module A — Txn Recon</span>
            </li>
            <li className={`nav-item ${activeTab === 'module-b' ? 'active' : ''}`} onClick={() => { setActiveTab('module-b'); setMobileMenuOpen(false); }}>
              <DollarSign size={18} />
              <span>Module B — Comm Recon</span>
            </li>
            <li className={`nav-item ${activeTab === 'module-c' ? 'active' : ''}`} onClick={() => { setActiveTab('module-c'); setMobileMenuOpen(false); }}>
              <FileCheck size={18} />
              <span>Module C — Payout Recon</span>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: 'white', margin: 0 }}>{user.name}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{user.role}</p>
            </div>
          </div>
          <div className="nav-item-logout" onClick={logout} style={{ color: '#ff8a8a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
            <LogOut size={16} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Logout Session</span>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>
              {activeTab === 'full-pipeline' && 'UPI Reconciliation & Settlement Automation Pipeline'}
              {activeTab === 'module-a' && 'Module A — 4-Way Transaction Reconciliation'}
              {activeTab === 'module-b' && 'Module B — Commission Reconciliation'}
              {activeTab === 'module-c' && 'Module C — 3-Way Payout Reconciliation'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Ingest input reports, execute reconciliation & settlement, and download generated output files.
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
          gap: 12px;
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

