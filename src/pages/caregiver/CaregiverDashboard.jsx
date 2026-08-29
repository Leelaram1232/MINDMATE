import { useState } from 'react';
import { Activity, Gamepad2, Target, Bell, TrendingUp, ChevronDown, Sparkles, Brain } from 'lucide-react';
import { PATIENTS, WEEKLY_PERFORMANCE } from '../../data/mockData';
import './CaregiverDashboard.css';

export default function CaregiverDashboard({ onNavigate, selectedPatientId, onSelectPatient }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const patient = PATIENTS.find(p => p.id === selectedPatientId) || PATIENTS[0];

  const stats = [
    { label: 'Games Completed', value: patient.gamesCompleted, subtitle: 'This week', icon: Gamepad2, color: 'var(--color-primary)' },
    { label: 'Avg. Accuracy', value: `${patient.avgAccuracy}%`, subtitle: 'This week', icon: Target, color: 'var(--color-accent)' },
    { label: 'Memory Trend', value: patient.memoryTrend, subtitle: 'Last 4 weeks', icon: TrendingUp, color: 'var(--color-secondary)' },
    { label: 'Reminders Done', value: '3/5', subtitle: 'Today', icon: Bell, color: 'var(--color-amber)' },
  ];

  // Mock AI Insights tailored to patient status
  const getAIInsights = (id) => {
    switch (id) {
      case 'p1': // Ramesh
        return [
          {
            title: 'Peak Focus Window',
            text: 'Ramesh\'s cognitive accuracy is 18% higher during morning sessions (8 AM - 11 AM) compared to evening sessions. Recommend scheduling cognitive activities before noon.',
            type: 'schedule',
          },
          {
            title: 'Adaptive Difficulty Promotion',
            text: 'With a consistent 85% accuracy in Memory Match, the adaptive model recommends promoting difficulty to "Medium" in the next session to sustain cognitive challenge.',
            type: 'game',
          },
        ];
      case 'p2': // Lakshmi
        return [
          {
            title: 'Strong Verbal Recall',
            text: 'Lakshmi maintains a near-perfect accuracy rate (92%) on Object Recognition tasks. This suggests strong verbal and language association memory.',
            type: 'insight',
          },
          {
            title: 'Attention Stability',
            text: 'Pattern Recall completion speed has stabilized. Motor response speed has improved by 0.8s on average, indicating excellent hand-eye coordination.',
            type: 'speed',
          },
        ];
      case 'p3': // Anil
        return [
          {
            title: 'Cognitive Fatigue Alert',
            text: 'Anil is showing a slight decline in attention accuracy towards the end of multi-game sessions. Recommend keeping sessions under 5 minutes with breaks.',
            type: 'alert',
          },
          {
            title: 'Object Association Focus',
            text: 'Anil showed positive response to Object Recognition. Increasing the weight of daily recognition tasks will help reinforce everyday vocabulary.',
            type: 'recommendation',
          },
        ];
      default:
        return [
          {
            title: 'Steady Performance',
            text: 'Patient is showing consistent participation in cognitive activities with healthy memory recall speed.',
            type: 'general',
          },
        ];
    }
  };

  const aiInsights = getAIInsights(patient.id);

  return (
    <div className="caregiver-dash page animate-fade-in">
      <div className="cd-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Overview of patient wellness.</p>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="cd-patient-selector">
        <button
          className="cd-patient-dropdown"
          onClick={() => setDropdownOpen(o => !o)}
          aria-expanded={dropdownOpen}
        >
          <span className="cd-patient-avatar">{patient.avatar}</span>
          <div className="cd-patient-info">
            <strong>{patient.name}</strong>
            <span>Age {patient.age} • {patient.status}</span>
          </div>
          <ChevronDown size={18} className={`cd-chevron ${dropdownOpen ? 'cd-chevron-open' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="cd-patient-list">
            {PATIENTS.map(p => (
              <button
                key={p.id}
                className={`cd-patient-option ${p.id === patient.id ? 'active' : ''}`}
                onClick={() => { onSelectPatient(p.id); setDropdownOpen(false); }}
              >
                <span>{p.avatar}</span>
                <div>
                  <strong>{p.name}</strong>
                  <span>Age {p.age}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Grid */}
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
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
                <span className="stat-subtitle">{stat.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI CLINICAL INSIGHTS BLOCK */}
      <div className="card cd-ai-card">
        <div className="cd-ai-header">
          <div className="cd-ai-title">
            <Sparkles size={20} className="cd-ai-sparkle-icon" />
            <h3>✨ AI Clinical Insights</h3>
          </div>
          <span className="badge badge-accent">Live Predictions</span>
        </div>
        <div className="cd-ai-insights-grid">
          {aiInsights.map((insight, idx) => (
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

      {/* Weekly Activity Chart */}
      <div className="card cd-chart-card">
        <div className="cd-chart-header">
          <h3>Weekly Accuracy</h3>
          <span className="badge badge-primary">This Week</span>
        </div>
        <div className="cd-bar-chart">
          {WEEKLY_PERFORMANCE.map((d, i) => (
            <div key={i} className="cd-bar-col">
              <div className="cd-bar-track">
                <div
                  className="cd-bar-fill"
                  style={{ height: `${d.accuracy}%` }}
                ></div>
              </div>
              <span className="cd-bar-value">{d.accuracy > 0 ? `${d.accuracy}%` : '-'}</span>
              <span className="cd-bar-label">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
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
