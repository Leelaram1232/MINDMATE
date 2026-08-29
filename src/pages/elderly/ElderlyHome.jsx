import { useEffect, useState } from 'react';
import { Gamepad2, Bell, TrendingUp, Mic, ArrowRight, LogOut } from 'lucide-react';
import { getGreeting, getFormattedDate } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { getReminders, getGameSessions, computeProgressSummary } from '../../lib/db';
import ConnectCaregiver from './ConnectCaregiver';
import CompanionCoach from '../../components/companion/CompanionCoach';
import './ElderlyHome.css';

export default function ElderlyHome({ onNavigate, patientName = 'Friend' }) {
  const { user } = useAuth();
  const greeting = getGreeting();
  const dateStr = getFormattedDate();

  const [reminders, setReminders] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState({ gamesThisWeek: 0, avgAccuracy: 0, streak: 0 });

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([getReminders(user.id), getGameSessions(user.id)]).then(([rem, gameRows]) => {
      if (!active) return;
      setReminders(rem);
      setSessions(gameRows);
      setSummary(computeProgressSummary(gameRows));
    });
    return () => { active = false; };
  }, [user]);

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
      description: `${summary.gamesThisWeek} activities this week.`,
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

      <CompanionCoach
        name={patientName}
        sessions={sessions}
        recommendedTitle="Memory Match"
        recommendedId="games"
        onPlay={onNavigate}
      />

      {/* Quick Stats */}
      <div className="elderly-quick-stats">
        <div className="elderly-quick-stat">
          <span className="elderly-quick-stat-value">{summary.streak}</span>
          <span className="elderly-quick-stat-label">Day Streak</span>
        </div>
        <div className="elderly-quick-stat-divider" aria-hidden="true"></div>
        <div className="elderly-quick-stat">
          <span className="elderly-quick-stat-value">{summary.avgAccuracy}%</span>
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

      {/* Connect with caregiver */}
      <ConnectCaregiver />

      {/* Motivational Footer */}
      <div className="elderly-motivation">
        <p>🌿 Keep going — every little activity helps your mind stay sharp!</p>
      </div>

      {/* Sign Out */}
      <div className="elderly-signout-area">
        <button
          className="btn btn-secondary elderly-signout-btn"
          onClick={() => onNavigate('exit-role')}
          aria-label="Sign out of your account"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
