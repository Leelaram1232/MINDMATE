import { Gamepad2, Bell, TrendingUp, Mic, ArrowRight } from 'lucide-react';
import { getGreeting, getFormattedDate, PROGRESS_SUMMARY, getDefaultReminders } from '../../data/mockData';
import './ElderlyHome.css';

export default function ElderlyHome({ onNavigate, patientName = 'Ramesh' }) {
  const greeting = getGreeting();
  const dateStr = getFormattedDate();
  const reminders = getDefaultReminders();
  const completedReminders = reminders.filter(r => r.status === 'completed').length;

  const actions = [
    {
      id: 'games',
      icon: <Gamepad2 size={28} />,
      emoji: '🎮',
      title: 'Play a Game',
      description: 'Keep your mind active with simple activities.',
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
    },
    {
      id: 'reminders',
      icon: <Bell size={28} />,
      emoji: '🔔',
      title: "Today's Reminders",
      description: `${completedReminders} of ${reminders.length} completed today.`,
      color: 'var(--color-accent)',
      bgColor: 'var(--color-accent-lighter)',
    },
    {
      id: 'progress',
      icon: <TrendingUp size={28} />,
      emoji: '📊',
      title: 'My Progress',
      description: `${PROGRESS_SUMMARY.gamesThisWeek} activities this week.`,
      color: 'var(--color-secondary)',
      bgColor: 'var(--color-primary-lighter)',
    },
    {
      id: 'voice',
      icon: <Mic size={28} />,
      emoji: '🎤',
      title: 'Voice Assistance',
      description: 'Ask me anything or get help.',
      color: 'var(--color-amber)',
      bgColor: 'var(--color-warning-light)',
    },
  ];

  return (
    <div className="elderly-home page animate-fade-in">
      {/* Greeting */}
      <div className="elderly-greeting">
        <h1>{greeting}, {patientName} 👋</h1>
        <p className="elderly-date">{dateStr}</p>
      </div>

      {/* Quick Stats */}
      <div className="elderly-quick-stats">
        <div className="elderly-quick-stat">
          <span className="elderly-quick-stat-value">{PROGRESS_SUMMARY.streak}</span>
          <span className="elderly-quick-stat-label">Day Streak</span>
        </div>
        <div className="elderly-quick-stat-divider" aria-hidden="true"></div>
        <div className="elderly-quick-stat">
          <span className="elderly-quick-stat-value">{PROGRESS_SUMMARY.avgAccuracy}%</span>
          <span className="elderly-quick-stat-label">Accuracy</span>
        </div>
        <div className="elderly-quick-stat-divider" aria-hidden="true"></div>
        <div className="elderly-quick-stat">
          <span className="elderly-quick-stat-value">{completedReminders}/{reminders.length}</span>
          <span className="elderly-quick-stat-label">Reminders</span>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="elderly-actions">
        {actions.map(action => (
          <button
            key={action.id}
            className="elderly-action-card card card-interactive"
            onClick={() => onNavigate(action.id)}
            aria-label={action.title}
          >
            <div className="elderly-action-icon" style={{ backgroundColor: action.bgColor, color: action.color }}>
              {action.icon}
            </div>
            <div className="elderly-action-body">
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>
            <ArrowRight size={18} className="elderly-action-arrow" />
          </button>
        ))}
      </div>

      {/* Motivational Footer */}
      <div className="elderly-motivation">
        <p>🌿 Keep going — every little activity helps your mind stay sharp!</p>
      </div>
    </div>
  );
}
