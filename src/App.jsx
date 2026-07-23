import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  RefreshCcw, 
  History, 
  Settings, 
  Bell, 
  User, 
  Search, 
  PieChart, 
  LogOut, 
  X,
  Clock,
  FileText,
  Layers,
  ShieldAlert,
  FileCheck
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Wizard from './components/Wizard';
import HistoryLog from './components/History';
import ResultsView from './components/ResultsView';
import SettingsView from './components/Settings';
import Visualizations from './components/Visualizations';
import Login from './components/Login';
import CycleManager from './components/CycleManager';
import GefuView from './components/GefuView';
import SettlementPayoutView from './components/SettlementPayoutView';
import ExceptionReviewer from './components/ExceptionReviewer';
import PayoutReconView from './components/PayoutReconView';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState({ name: 'Finance Admin', role: 'Reconciliation Lead' });
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'GEFU Control Totals Verified', time: '10m ago', text: 'Cycle 1 GEFU file generated with 0 variance.', read: false },
    { id: 2, title: 'IMPS ₹5L Split Executed', time: '1h ago', text: 'Merchant settlement ₹9.46L chunked into 2 payout rows.', read: false },
    { id: 3, title: 'Exception Queue Alert', time: '2h ago', text: '3 new RULE_2 credit adjustments pending disposition.', read: true }
  ]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const addNotification = (notif) => {
    setNotifications(prev => [{ id: Date.now(), time: 'Just now', read: false, ...notif }, ...prev]);
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setActiveTab('gefu-settlement');
  };

  const logout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <Login onLogin={(usr) => setUser(usr)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onStartNew={() => setActiveTab('new-recon')} />;
      case 'cycles':
        return <CycleManager onTriggerRun={() => setActiveTab('new-recon')} />;
      case 'new-recon':
        return <Wizard 
          onComplete={(job) => {
            setSelectedJob(job);
            setActiveTab('gefu-settlement');
            addNotification({
              title: 'Pipeline Executed ✅',
              text: `${job.product} (${job.bank}) matched at ${job.matchRate || job.rate}.`
            });
          }} 
        />;
      case 'gefu-settlement':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <GefuView jobId={selectedJob?.jobId} />
            <SettlementPayoutView jobId={selectedJob?.jobId} />
          </div>
        );
      case 'exceptions':
        return <ExceptionReviewer />;
      case 'payout-recon':
        return <PayoutReconView />;
      case 'history':
        return <HistoryLog onViewJob={handleViewJob} />;
      case 'visuals':
        return <Visualizations />;
      case 'settings':
        return <SettingsView />;
      case 'results':
        return (
          <ResultsView 
            results={selectedJob?.results} 
            selection={selectedJob}
            onBack={() => setActiveTab('history')} 
          />
        );
      default:
        return <Dashboard onStartNew={() => setActiveTab('new-recon')} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div className="brand" style={{ padding: '0 8px' }}>
            <img src="https://iserveu.in/wp-content/uploads/2024/01/ISERVEU-MAIN-LOGO.png" alt="iServeU" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', marginTop: '8px', letterSpacing: '1px' }}>
              UPI Recon & Settlement
            </p>
          </div>
          <button className="mobile-only" onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </li>
            <li className={`nav-item ${activeTab === 'cycles' ? 'active' : ''}`} onClick={() => { setActiveTab('cycles'); setMobileMenuOpen(false); }}>
              <Clock size={18} />
              <span>Cycle Scheduler</span>
            </li>
            <li className={`nav-item ${activeTab === 'new-recon' ? 'active' : ''}`} onClick={() => { setActiveTab('new-recon'); setMobileMenuOpen(false); }}>
              <RefreshCcw size={18} />
              <span>Start Pipeline</span>
            </li>
            <li className={`nav-item ${activeTab === 'gefu-settlement' ? 'active' : ''}`} onClick={() => { setActiveTab('gefu-settlement'); setMobileMenuOpen(false); }}>
              <FileText size={18} />
              <span>GEFU & Settlement</span>
            </li>
            <li className={`nav-item ${activeTab === 'exceptions' ? 'active' : ''}`} onClick={() => { setActiveTab('exceptions'); setMobileMenuOpen(false); }}>
              <ShieldAlert size={18} />
              <span>Exception Console</span>
            </li>
            <li className={`nav-item ${activeTab === 'payout-recon' ? 'active' : ''}`} onClick={() => { setActiveTab('payout-recon'); setMobileMenuOpen(false); }}>
              <FileCheck size={18} />
              <span>Payout 3-Way Recon</span>
            </li>
            <li className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}>
              <History size={18} />
              <span>Job Archives</span>
            </li>
            <li className={`nav-item ${activeTab === 'visuals' ? 'active' : ''}`} onClick={() => { setActiveTab('visuals'); setMobileMenuOpen(false); }}>
              <PieChart size={18} />
              <span>Analytics</span>
            </li>
            <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}>
              <Settings size={18} />
              <span>Settings</span>
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
              {activeTab === 'dashboard' && 'UPI Recon & Settlement Console'}
              {activeTab === 'cycles' && 'NPCI Sub-Cycle Scheduler & Cut-off Management'}
              {activeTab === 'new-recon' && 'Full Automation Pipeline Execution Wizard'}
              {activeTab === 'gefu-settlement' && 'NTSL → GEFU Generator & Merchant Settlement Engine'}
              {activeTab === 'exceptions' && 'Reviewer Exception Console & Audit Logs'}
              {activeTab === 'payout-recon' && 'Payout 3-Way Reconciliation Console'}
              {activeTab === 'history' && 'Reconciliation Job Archives'}
              {activeTab === 'visuals' && 'System Performance Analytics'}
              {activeTab === 'settings' && 'System & Rules Engine Settings'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={22} color="var(--secondary)" onClick={() => setShowNotifications(!showNotifications)} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white', fontSize: '10px', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount}
                </span>
              )}
              {showNotifications && (
                <div className="glass-card" style={{ position: 'absolute', top: '40px', right: '0', width: '320px', zIndex: 100, padding: '16px', borderRadius: '16px', background: 'white' }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>Notifications</h4>
                  {notifications.map(n => (
                    <div key={n.id} style={{ marginBottom: '10px', fontSize: '12px' }}>
                      <p style={{ margin: 0, fontWeight: '600' }}>{n.title}</p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{n.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
