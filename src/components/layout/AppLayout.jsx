import { useState } from 'react';
import {
  Home, Gamepad2, Bell, TrendingUp, Mic,
  LayoutDashboard, Users, Activity, BarChart3, Settings,
  Menu, X, ChevronLeft, LogOut
} from 'lucide-react';
import './AppLayout.css';

/* ── Elderly Bottom Navigation ───────────────────────── */
function ElderlyBottomNav({ currentView, onNavigate }) {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {items.map(item => {
        const Icon = item.icon;
        const active = currentView === item.id;
        return (
          <button
            key={item.id}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={active ? 'page' : undefined}
            aria-label={item.label}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ── Caregiver Sidebar Navigation ────────────────────── */
function CaregiverSidebar({ currentView, onNavigate, collapsed, onToggle }) {
  const items = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'patient-activity', label: 'Activity', icon: Activity },
    { id: 'cognitive-progress', label: 'Progress', icon: BarChart3 },
    { id: 'reminder-monitoring', label: 'Reminders', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`} role="navigation" aria-label="Caregiver navigation">
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="sidebar-logo">🧠</span>
            <div>
              <div className="sidebar-brand-name">MINDMATE</div>
              <div className="sidebar-brand-sub">Caregiver Portal</div>
            </div>
          </div>
        )}
        <button className="btn-icon sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {items.map(item => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${active ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <button className="sidebar-nav-item sidebar-exit" onClick={() => onNavigate('exit-role')}>
            <LogOut size={20} />
            <span>Switch Role</span>
          </button>
        </div>
      )}
    </aside>
  );
}

/* ── Mobile Caregiver Top Bar ────────────────────────── */
function CaregiverMobileHeader({ onOpenDrawer, onNavigate }) {
  return (
    <header className="caregiver-mobile-header">
      <button className="btn-icon" onClick={onOpenDrawer} aria-label="Open menu">
        <Menu size={22} />
      </button>
      <div className="mobile-header-brand">
        <span>🧠</span>
        <span className="mobile-header-title">MINDMATE</span>
      </div>
      <button className="btn-icon" onClick={() => onNavigate('exit-role')} aria-label="Switch role">
        <LogOut size={20} />
      </button>
    </header>
  );
}

/* ── Mobile Caregiver Bottom Nav ─────────────────────── */
function CaregiverMobileBottomNav({ currentView, onNavigate }) {
  const items = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'patient-activity', label: 'Activity', icon: Activity },
    { id: 'cognitive-progress', label: 'Progress', icon: BarChart3 },
    { id: 'reminder-monitoring', label: 'Reminders', icon: Bell },
  ];

  return (
    <nav className="bottom-nav caregiver-bottom-nav" role="navigation" aria-label="Caregiver mobile navigation">
      {items.map(item => {
        const Icon = item.icon;
        const active = currentView === item.id;
        return (
          <button
            key={item.id}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={active ? 'page' : undefined}
            aria-label={item.label}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ── Elderly Header ──────────────────────────────────── */
function ElderlyHeader({ onNavigate, currentView }) {
  const showBack = !['home'].includes(currentView);
  return (
    <header className="elderly-header">
      {showBack ? (
        <button className="btn-icon" onClick={() => onNavigate('home')} aria-label="Go back to home">
          <ChevronLeft size={24} />
        </button>
      ) : (
        <span className="elderly-header-logo">🧠</span>
      )}
      <span className="elderly-header-title">MINDMATE</span>
      <button
        className="btn-icon elderly-mic-btn"
        onClick={() => onNavigate('voice')}
        aria-label="Voice assistance"
      >
        <Mic size={20} />
      </button>
    </header>
  );
}

/* ── Main Layout ─────────────────────────────────────── */
export default function AppLayout({ role, currentView, onNavigate, children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (role === 'elderly') {
    return (
      <div className="app-layout elderly-layout">
        <ElderlyHeader onNavigate={onNavigate} currentView={currentView} />
        <main className="app-main elderly-main">{children}</main>
        <ElderlyBottomNav currentView={currentView} onNavigate={onNavigate} />
      </div>
    );
  }

  if (role === 'caregiver') {
    return (
      <div className={`app-layout caregiver-layout ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
        {/* Desktop sidebar */}
        <CaregiverSidebar
          currentView={currentView}
          onNavigate={(id) => { onNavigate(id); setDrawerOpen(false); }}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
        />

        {/* Mobile drawer overlay */}
        {drawerOpen && (
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
            <div className="drawer-content" onClick={e => e.stopPropagation()}>
              <div className="drawer-header">
                <span className="sidebar-brand-name">🧠 MINDMATE</span>
                <button className="btn-icon" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>
              <CaregiverSidebar
                currentView={currentView}
                onNavigate={(id) => { onNavigate(id); setDrawerOpen(false); }}
                collapsed={false}
                onToggle={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Mobile header */}
        <CaregiverMobileHeader
          onOpenDrawer={() => setDrawerOpen(true)}
          onNavigate={onNavigate}
        />

        <main className="app-main caregiver-main">{children}</main>

        {/* Mobile bottom nav */}
        <CaregiverMobileBottomNav currentView={currentView} onNavigate={onNavigate} />
      </div>
    );
  }

  // No role = welcome/onboarding
  return (
    <div className="app-layout welcome-layout">
      <main className="app-main">{children}</main>
    </div>
  );
}
