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
  X
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Wizard from './components/Wizard';
import HistoryLog from './components/History';
import ResultsView from './components/ResultsView';
import SettingsView from './components/Settings';
import Visualizations from './components/Visualizations';
import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Reconciliation Success', time: '10m ago', text: 'RECON-10492 matched at 99.2%', read: false },
    { id: 2, title: 'New File Detected', time: '1h ago', text: 'AePS Cycle 4 files are ready.', read: false },
    { id: 3, title: 'System Alert', time: '2h ago', text: 'Disk usage at 85% on prod-mw.', read: true }
  ]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const addNotification = (notif) => {
    setNotifications(prev => [{ id: Date.now(), time: 'Just now', read: false, ...notif }, ...prev]);
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setActiveTab('results');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  const logout = () => {
    setUser(null);
    setActiveTab('dashboard');
    setMobileMenuOpen(false);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onStartNew={() => setActiveTab('new-recon')} />;
      case 'visuals':
        return <Visualizations />;
      case 'new-recon':
        return <Wizard 
          onComplete={(job) => {
            setSelectedJob(job);
            setActiveTab('history');
            addNotification({
              title: 'Reconciliation Success ✅',
              text: `${job.product} (${job.bank}) matched at ${job.results.rate}.`
            });
          }} 
        />;
      case 'history':
        return <HistoryLog onViewJob={handleViewJob} />;
      case 'settings':
        return <SettingsView />;
      case 'results':
        return (
          <ResultsView 
            results={selectedJob?.results} 
            selection={{
              jobId: selectedJob?.jobId || selectedJob?.id,
              product: selectedJob?.product,
              bank: selectedJob?.bank,
              date: selectedJob?.date,
              cycle: selectedJob?.cycle
            }} 
            isHistoryView={true}
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
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div className="brand" style={{ padding: '0 8px' }}>
            <img src="https://iserveu.in/wp-content/uploads/2024/01/ISERVEU-MAIN-LOGO.png" alt="iServeU" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', marginTop: '8px', letterSpacing: '1px' }}>Recon Engine</p>
          </div>
          <button 
            className="mobile-only" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'visuals' ? 'active' : ''}`}
              onClick={() => { setActiveTab('visuals'); setMobileMenuOpen(false); }}
            >
              <PieChart size={20} />
              <span>Analytics</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'new-recon' ? 'active' : ''}`}
              onClick={() => { setActiveTab('new-recon'); setMobileMenuOpen(false); }}
            >
              <RefreshCcw size={20} />
              <span>Start Recon</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
            >
              <History size={20} />
              <span>History Log</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
            >
              <Settings size={20} />
              <span>Settings</span>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '16px' }}>
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <User size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: '500', color: 'white' }}>{user.name}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{user.role}</p>
            </div>
          </div>
          <div className="nav-item-logout" onClick={logout} style={{ color: '#ff8a8a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
            <LogOut size={18} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Logout Session</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="mobile-only btn-icon" 
              onClick={() => setMobileMenuOpen(true)}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--secondary)' }}
            >
              <LayoutDashboard size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: 'var(--title-size, 28px)', marginBottom: '4px' }}>
                {activeTab === 'dashboard' && `Internal Console / ${user.name.split(' ')[0]}`}
                {activeTab === 'visuals' && 'Core Visualizations'}
                {activeTab === 'new-recon' && 'Reconciliation Wizard'}
                {activeTab === 'history' && 'Job Archives'}
                {activeTab === 'results' && `Job: ${selectedJob?.jobId || selectedJob?.id}`}
              </h1>
              <p className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {activeTab === 'dashboard' && 'Welcome back. Select an action to begin.'}
                {activeTab === 'visuals' && 'Key transaction trends and health metrics.'}
                {activeTab === 'new-recon' && 'Trigger a 5-way matching process across financial nodes.'}
                {activeTab === 'history' && 'Audit trail of all previous automated runs.'}
                {activeTab === 'results' && 'Deep-dive analysis of match discrepancies.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1', justifyContent: 'flex-end', minWidth: '280px' }}>
            <div className="glass-card search-bar" style={{ 
              padding: '8px 20px', 
              borderRadius: '50px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              maxWidth: '300px',
              boxShadow: 'none'
            }}>
              <Search size={18} color="var(--text-secondary)" />
              <input type="text" placeholder="Search..." style={{ background: 'transparent', border: 'none', fontSize: '14px', outline: 'none', width: '100%' }} />
            </div>
            
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={24} color="var(--secondary)" onClick={() => setShowNotifications(!showNotifications)} />
              {unreadCount > 0 && (
                <span onClick={() => setShowNotifications(!showNotifications)} style={{ 
                  position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', 
                  color: 'white', fontSize: '10px', borderRadius: '50%', width: '18px', height: '18px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-main)'
                }}>
                  {unreadCount}
                </span>
              )}
              {showNotifications && (
                <div className="glass-card" style={{ 
                  position: 'absolute', top: '40px', right: '0', width: '300px', 
                  zIndex: 100, padding: '16px', borderRadius: '20px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0 }}>Recent Alerts</h4>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer' }} onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}>Mark read</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {notifications.map((n) => (
                      <div key={n.id} style={{ opacity: n.read ? 0.6 : 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: '600' }}>{n.title}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{n.text}</p>
                      </div>
                    ))}
                  </div>
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
          padding: 12px 16px;
          border-radius: 12px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: 0.2s;
          font-weight: 500;
        }
        .nav-item:hover { color: white; background: rgba(255,255,255,0.05); }
        .nav-item.active { color: white; background: var(--primary); }
        .nav-item-logout:hover { background: rgba(255,0,0,0.05); border-radius: 12px; }

        .mobile-only { display: none; }
        
        @media (max-width: 768px) {
          .mobile-only { display: block; }
          .hide-mobile { display: none; }
          :root { --title-size: 20px; }
          .search-bar { max-width: 100% !important; order: 2; }
        }
      `}} />
    </div>
  );
}

export default App;

