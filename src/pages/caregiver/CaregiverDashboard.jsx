import { useEffect, useState } from 'react';
import { Activity, Gamepad2, Target, Bell, TrendingUp, ChevronDown, Sparkles } from 'lucide-react';
import {
  getGameSessions,
  getReminders,
  computeProgressSummary,
  computeWeeklyPerformance,
  computeMemoryTrend,
} from '../../lib/db';
import { generateCareInsights } from '../../lib/ai';
import './CaregiverDashboard.css';

export default function CaregiverDashboard({
  onNavigate,
  patients = [],
  patientsLoading,
  selectedPatientId,
  onSelectPatient,
  activePatient,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const patientName = activePatient?.full_name?.trim() || 'this patient';

  useEffect(() => {
    if (!selectedPatientId) {
      setSessions([]);
      setReminders([]);
      return undefined;
    }
    let active = true;
    setLoading(true);
    Promise.all([getGameSessions(selectedPatientId), getReminders(selectedPatientId)]).then(
      async ([gameRows, reminderRows]) => {
        if (!active) return;
        setSessions(gameRows);
        setReminders(reminderRows);
        setLoading(false);
        setInsightsLoading(true);
        const nextSummary = computeProgressSummary(gameRows);
        const nextTrend = computeMemoryTrend(gameRows);
        const nextInsights = await generateCareInsights({
          patientName: activePatient?.full_name?.trim() || 'this patient',
          summary: nextSummary,
          trend: nextTrend,
          reminders: reminderRows,
        });
        if (!active) return;
        setInsights(nextInsights);
        setInsightsLoading(false);
      }
    );
    return () => {
      active = false;
    };
  }, [selectedPatientId, activePatient]);

  const summary = computeProgressSummary(sessions);
  const weekly = computeWeeklyPerformance(sessions);
  const trend = computeMemoryTrend(sessions);
  const completedReminders = reminders.filter((r) => r.status === 'completed').length;

  const stats = [
    { label: 'Games Completed', value: summary.gamesThisWeek, subtitle: 'This week', icon: Gamepad2, color: 'var(--color-primary)' },
    { label: 'Avg. Accuracy', value: `${summary.avgAccuracy}%`, subtitle: 'All sessions', icon: Target, color: 'var(--color-accent)' },
    { label: 'Memory Trend', value: trend, subtitle: 'Recent vs earlier', icon: TrendingUp, color: 'var(--color-secondary)' },
    { label: 'Reminders Done', value: `${completedReminders}/${reminders.length}`, subtitle: 'Current list', icon: Bell, color: 'var(--color-amber)' },
  ];

  if (patientsLoading) {
    return (
      <div className="caregiver-dash page animate-fade-in">
        <h1 className="page-title">Dashboard</h1>
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading linked patients…
        </div>
      </div>
    );
  }

  if (!selectedPatientId || !activePatient) {
    return (
      <div className="caregiver-dash page animate-fade-in">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of patient wellness.</p>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 'var(--space-md)' }}>
            No patients linked yet. Generate an invite code and ask them to enter it on Home.
          </p>
          <button className="btn btn-primary" onClick={() => onNavigate('patients')}>
            Link a patient
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="caregiver-dash page animate-fade-in">
      <div className="cd-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Overview of patient wellness.</p>
        </div>
      </div>

      <div className="cd-patient-selector">
        <button
          className="cd-patient-dropdown"
          onClick={() => setDropdownOpen((o) => !o)}
          aria-expanded={dropdownOpen}
        >
          <span className="cd-patient-avatar">🧑</span>
          <div className="cd-patient-info">
            <strong>{patientName}</strong>
            <span>Linked • {trend}</span>
          </div>
          <ChevronDown size={18} className={`cd-chevron ${dropdownOpen ? 'cd-chevron-open' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="cd-patient-list">
            {patients.map((p) => (
              <button
                key={p.id}
                className={`cd-patient-option ${p.id === selectedPatientId ? 'active' : ''}`}
                onClick={() => {
                  onSelectPatient(p.id);
                  setDropdownOpen(false);
                }}
              >
                <span>🧑</span>
                <div>
                  <strong>{p.full_name?.trim() || 'MindMate User'}</strong>
                  <span>Linked</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="cd-stats grid-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card cd-stat-card">
              <div className="cd-stat-header">
                <div className="cd-stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-value">{loading ? '…' : stat.value}</span>
                <span className="stat-label">{stat.label}</span>
                <span className="stat-subtitle">{stat.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card cd-ai-card">
        <div className="cd-ai-header">
          <div className="cd-ai-title">
            <Sparkles size={20} className="cd-ai-sparkle-icon" />
            <h3>Care insights</h3>
          </div>
          <span className="badge badge-accent">{insightsLoading ? 'Thinking…' : 'AI + live data'}</span>
        </div>
        <div className="cd-ai-insights-grid">
          {(insightsLoading && insights.length === 0
            ? [{ title: 'Generating insights', text: 'Looking at recent games and reminders…' }]
            : insights
          ).map((insight, idx) => (
            <div key={idx} className="cd-ai-insight-item">
              <div className="cd-ai-insight-dot-col">
                <div className="cd-ai-insight-bullet"></div>
              </div>
              <div className="cd-ai-insight-body">
                <strong>{insight.title}</strong>
                <p>{insight.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card cd-chart-card">
        <div className="cd-chart-header">
          <h3>Weekly Accuracy</h3>
          <span className="badge badge-primary">This Week</span>
        </div>
        <div className="cd-bar-chart">
          {weekly.map((d, i) => (
            <div key={i} className="cd-bar-col">
              <div className="cd-bar-track">
                <div className="cd-bar-fill" style={{ height: `${d.accuracy}%` }}></div>
              </div>
              <span className="cd-bar-value">{d.accuracy > 0 ? `${d.accuracy}%` : '-'}</span>
              <span className="cd-bar-label">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cd-quick-links">
        <button className="cd-quick-link card card-interactive" onClick={() => onNavigate('patient-activity')}>
          <Activity size={20} />
          <span>View Activity</span>
        </button>
        <button className="cd-quick-link card card-interactive" onClick={() => onNavigate('cognitive-progress')}>
          <TrendingUp size={20} />
          <span>Full Progress</span>
        </button>
        <button className="cd-quick-link card card-interactive" onClick={() => onNavigate('reminder-monitoring')}>
          <Bell size={20} />
          <span>Reminders</span>
        </button>
      </div>
    </div>
  );
}
