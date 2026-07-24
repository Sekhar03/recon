import React, { useState } from 'react';
import { 
  Zap, 
  User, 
  LogOut, 
  X,
  History as HistoryIcon,
  Layers
} from 'lucide-react';
import FullPipelineView from './components/FullPipelineView';
import HistoryLog from './components/History';
import ManualReconView from './components/ManualReconView';
import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('product-recon');
  const [user, setUser] = useState({ name: 'Finance Admin', role: 'Reconciliation Lead' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => {
    setUser(null);
    setActiveTab('product-recon');
  };

  if (!user) {
    return <Login onLogin={(usr) => setUser(usr)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'product-recon':
        return <ManualReconView />;
      case 'job-archives':
        return <HistoryLog />;
      default:
        return <ManualReconView />;
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
              Reconciliation Platform
            </p>
          </div>
          <button className="mobile-only" onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '1px', margin: '0 0 8px 12px' }}>
                Navigation
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li className={`nav-item ${activeTab === 'product-recon' ? 'active' : ''}`} onClick={() => { setActiveTab('product-recon'); setMobileMenuOpen(false); }}>
                  <Layers size={17} />
                  <span>Product Recon</span>
                </li>
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
              {activeTab === 'recon-hub' && 'Reconciliation Hub Pipeline Execution'}
              {activeTab === 'product-recon' && 'Product Reconciliation Engine'}
              {activeTab === 'job-archives' && 'Job Archives & Historical Reconciliation Logs'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {activeTab === 'recon-hub' 
                ? 'Product Selection → NPCI Upload → Automated Report Fetching → Matched & Mismatched Output Reports.'
                : activeTab === 'product-recon'
                ? 'Select Product Category → Upload Source Files → Automated Merge & Compare → Download Match/Mismatch Reports.'
                : 'Inspect past reconciliation runs and re-download generated output files.'}
            </p>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

export default App;
