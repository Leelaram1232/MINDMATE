import { useState } from 'react';
import {
  Home, Gamepad2, Bell, TrendingUp, Mic,
  LayoutDashboard, Users, Activity, BarChart3, Settings,
  Menu, X, ChevronLeft, LogOut
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './AppLayout.css';

/* ── Elderly Bottom Navigation ───────────────────────── */
function ElderlyBottomNav({ currentView, onNavigate }) {
  const { t } = useLanguage();
  const items = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'games', label: t('nav.games'), icon: Gamepad2 },
    { id: 'reminders', label: t('nav.reminders'), icon: Bell },
    { id: 'progress', label: t('nav.progress'), icon: TrendingUp },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label={t('nav.main')}>
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
  const { t } = useLanguage();
  const items = [
    { id: 'dashboard', label: t('nav.overview'), icon: LayoutDashboard },
    { id: 'patients', label: t('nav.patients'), icon: Users },
    { id: 'patient-activity', label: t('nav.activity'), icon: Activity },
    { id: 'cognitive-progress', label: t('nav.progress'), icon: BarChart3 },
    { id: 'reminder-monitoring', label: t('nav.reminders'), icon: Bell },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`} role="navigation" aria-label="Caregiver navigation">
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="sidebar-logo">🧠</span>
            <div>
              <div className="sidebar-brand-name">MINDMATE</div>
              <div className="sidebar-brand-sub">{t('nav.portal')}</div>
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
            <span>{t('common.signOut')}</span>
          </button>
        </div>
      )}
    </aside>
  );
}

/* ── Mobile Caregiver Top Bar ────────────────────────── */
function CaregiverMobileHeader({ onOpenDrawer, onNavigate }) {
  const { t } = useLanguage();
  return (
    <header className="caregiver-mobile-header">
      <button className="btn-icon" onClick={onOpenDrawer} aria-label="Open menu">
        <Menu size={22} />
      </button>
      <div className="mobile-header-brand">
        <span>🧠</span>
        <span className="mobile-header-title">MINDMATE</span>
      </div>
      <div className="mobile-header-actions">
        <button className="btn-icon" onClick={() => onNavigate('settings')} aria-label={t('nav.settings')}>
          <Settings size={20} />
        </button>
        <button className="btn-icon" onClick={() => onNavigate('exit-role')} aria-label="Sign out">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

/* ── Mobile Caregiver Bottom Nav ─────────────────────── */
function CaregiverMobileBottomNav({ currentView, onNavigate }) {
  const { t } = useLanguage();
  const items = [
    { id: 'dashboard', label: t('nav.overview'), icon: LayoutDashboard },
    { id: 'patients', label: t('nav.patients'), icon: Users },
    { id: 'patient-activity', label: t('nav.activity'), icon: Activity },
    { id: 'cognitive-progress', label: t('nav.progress'), icon: BarChart3 },
    { id: 'reminder-monitoring', label: t('nav.reminders'), icon: Bell },
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
  const { t } = useLanguage();
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
      <div className="elderly-header-actions">
        <button
          className="btn-icon elderly-settings-btn"
          onClick={() => onNavigate('settings')}
          aria-label={t('nav.settings')}
        >
          <Settings size={22} />
        </button>
        <button
          className="btn-icon elderly-mic-btn"
          onClick={() => onNavigate('voice')}
          aria-label={t('home.voice')}
        >
          <Mic size={20} />
        </button>
      </div>
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
