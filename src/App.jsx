import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  RefreshCcw, 
  DollarSign,
  FileCheck,
  User, 
  LogOut, 
  X,
  Layers,
  Clock,
  FileText,
  ShieldAlert,
  History,
  PieChart,
  Settings,
  Play
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import CycleManager from './components/CycleManager';
import FullPipelineView from './components/FullPipelineView';
import ModuleAView from './components/ModuleAView';
import ModuleBView from './components/ModuleBView';
import ModuleCView from './components/ModuleCView';
import GefuView from './components/GefuView';
import SettlementPayoutView from './components/SettlementPayoutView';
import ExceptionReviewer from './components/ExceptionReviewer';
import HistoryLog from './components/History';
import Visualizations from './components/Visualizations';
import SettingsView from './components/Settings';
import Wizard from './components/Wizard';
import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState({ name: 'Finance Admin', role: 'Reconciliation Lead' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const logout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <Login onLogin={(usr) => setUser(usr)} />;
  }

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setActiveTab('gefu-settlement');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onStartNew={() => setActiveTab('full-pipeline')} />;
      case 'cycles':
        return <CycleManager onTriggerRun={() => setActiveTab('full-pipeline')} />;
      case 'full-pipeline':
        return <FullPipelineView />;
      case 'module-a':
        return <ModuleAView />;
      case 'module-b':
        return <ModuleBView />;
      case 'module-c':
        return <ModuleCView />;
      case 'gefu-settlement':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <GefuView jobId={selectedJob?.jobId} />
            <SettlementPayoutView jobId={selectedJob?.jobId} />
          </div>
        );
      case 'wizard':
        return (
          <Wizard 
            onComplete={(job) => {
              setSelectedJob(job);
              setActiveTab('gefu-settlement');
            }} 
          />
        );
      case 'exceptions':
        return <ExceptionReviewer />;
      case 'history':
        return <HistoryLog onViewJob={handleViewJob} />;
      case 'visuals':
        return <Visualizations />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard onStartNew={() => setActiveTab('full-pipeline')} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{ width: '270px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="brand" style={{ padding: '0 8px' }}>
            <img src="https://iserveu.in/wp-content/uploads/2024/01/ISERVEU-MAIN-LOGO.png" alt="iServeU" style={{ height: '30px', filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', marginTop: '6px', letterSpacing: '1px' }}>
              Reconciliation & Settlement Platform
            </p>
          </div>
          <button className="mobile-only" onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Group 1: Core Dashboard */}
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '1px', margin: '0 0 8px 12px' }}>
                Main Dashboard
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}>
                  <LayoutDashboard size={17} />
                  <span>Overview (UPI / DMT / MATM)</span>
                </li>
                <li className={`nav-item ${activeTab === 'cycles' ? 'active' : ''}`} onClick={() => { setActiveTab('cycles'); setMobileMenuOpen(false); }}>
                  <Clock size={17} />
                  <span>NPCI Sub-Cycle Scheduler</span>
                </li>
              </ul>
            </div>

            {/* Group 2: Reconciliation Tools */}
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '1px', margin: '0 0 8px 12px' }}>
                Reconciliation Tools
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li className={`nav-item ${activeTab === 'full-pipeline' ? 'active' : ''}`} onClick={() => { setActiveTab('full-pipeline'); setMobileMenuOpen(false); }}>
                  <Layers size={17} />
                  <span>6-In / 6-Out Pipeline</span>
                </li>
                <li className={`nav-item ${activeTab === 'module-a' ? 'active' : ''}`} onClick={() => { setActiveTab('module-a'); setMobileMenuOpen(false); }}>
                  <RefreshCcw size={17} />
                  <span>Module A — Txn Recon</span>
                </li>
                <li className={`nav-item ${activeTab === 'module-b' ? 'active' : ''}`} onClick={() => { setActiveTab('module-b'); setMobileMenuOpen(false); }}>
                  <DollarSign size={17} />
                  <span>Module B — Comm Recon</span>
                </li>
                <li className={`nav-item ${activeTab === 'module-c' ? 'active' : ''}`} onClick={() => { setActiveTab('module-c'); setMobileMenuOpen(false); }}>
                  <FileCheck size={17} />
                  <span>Module C — Payout Recon</span>
                </li>
              </ul>
            </div>

            {/* Group 3: Bank & Settlement Engines */}
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '1px', margin: '0 0 8px 12px' }}>
                Settlement & Bank Engines
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li className={`nav-item ${activeTab === 'gefu-settlement' ? 'active' : ''}`} onClick={() => { setActiveTab('gefu-settlement'); setMobileMenuOpen(false); }}>
                  <FileText size={17} />
                  <span>GEFU & Merchant Settlement</span>
                </li>
                <li className={`nav-item ${activeTab === 'wizard' ? 'active' : ''}`} onClick={() => { setActiveTab('wizard'); setMobileMenuOpen(false); }}>
                  <Play size={17} />
                  <span>Pipeline Execution Wizard</span>
                </li>
              </ul>
            </div>

            {/* Group 4: Audit & Review */}
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '1px', margin: '0 0 8px 12px' }}>
                Audit & Review
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li className={`nav-item ${activeTab === 'exceptions' ? 'active' : ''}`} onClick={() => { setActiveTab('exceptions'); setMobileMenuOpen(false); }}>
                  <ShieldAlert size={17} />
                  <span>Exception Reviewer Console</span>
                </li>
                <li className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}>
                  <History size={17} />
                  <span>Job Archives</span>
                </li>
                <li className={`nav-item ${activeTab === 'visuals' ? 'active' : ''}`} onClick={() => { setActiveTab('visuals'); setMobileMenuOpen(false); }}>
                  <PieChart size={17} />
                  <span>Analytics</span>
                </li>
                <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}>
                  <Settings size={17} />
                  <span>Rules & System Settings</span>
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
              {activeTab === 'dashboard' && 'UPI Reconciliation & Settlement Console'}
              {activeTab === 'cycles' && 'NPCI Sub-Cycle Scheduler & Cut-off Management'}
              {activeTab === 'full-pipeline' && '6-Input File → 6-Output File Reconciliation & Settlement Pipeline'}
              {activeTab === 'module-a' && 'Module A — 4-Way Transaction Reconciliation'}
              {activeTab === 'module-b' && 'Module B — Commission Reconciliation'}
              {activeTab === 'module-c' && 'Module C — 3-Way Payout Reconciliation'}
              {activeTab === 'gefu-settlement' && 'NTSL → GEFU Generator & Merchant Settlement Engine'}
              {activeTab === 'wizard' && 'Pipeline Execution Wizard'}
              {activeTab === 'exceptions' && 'Reviewer Exception Console & Audit Trail'}
              {activeTab === 'history' && 'Reconciliation Job Archives'}
              {activeTab === 'visuals' && 'System Performance Analytics'}
              {activeTab === 'settings' && 'Rules Matrix & System Settings'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Comprehensive UPI transaction reconciliation, settlement generation, and reporting platform.
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
          padding: 8.5px 12px;
          border-radius: 9px;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: 0.2s;
          font-weight: 500;
          font-size: 13px;
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
