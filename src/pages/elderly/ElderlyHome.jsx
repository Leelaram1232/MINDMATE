import { useEffect, useState } from 'react';
import { Gamepad2, Bell, TrendingUp, Mic, ArrowRight, Settings } from 'lucide-react';
import { getFormattedDate } from '../../data/mockData';
import { greetingKey } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getReminders, getGameSessions, computeProgressSummary } from '../../lib/db';
import ConnectCaregiver from './ConnectCaregiver';
import CompanionCoach from '../../components/companion/CompanionCoach';
import './ElderlyHome.css';

export default function ElderlyHome({ onNavigate, patientName = 'Friend' }) {
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const greeting = t(greetingKey());
  const dateStr = getFormattedDate(locale);
  const displayName = patientName || t('common.friend');

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
      title: t('home.play'),
      description: t('home.playDesc'),
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
    },
    {
      id: 'reminders',
      icon: <Bell size={28} />,
      emoji: '🔔',
      title: t('home.reminders'),
      description: t('home.remindersDesc', { done: completedReminders, total: reminders.length }),
      color: 'var(--color-accent)',
      bgColor: 'var(--color-accent-lighter)',
    },
    {
      id: 'progress',
      icon: <TrendingUp size={28} />,
      emoji: '📊',
      title: t('home.progress'),
      description: t('home.progressDesc', { count: summary.gamesThisWeek }),
      color: 'var(--color-secondary)',
      bgColor: 'var(--color-primary-lighter)',
    },
    {
      id: 'voice',
      icon: <Mic size={28} />,
      emoji: '🎤',
      title: t('home.voice'),
      description: t('home.voiceDesc'),
      color: 'var(--color-amber)',
      bgColor: 'var(--color-warning-light)',
    },
    {
      id: 'settings',
      icon: <Settings size={28} />,
      emoji: '⚙️',
      title: t('settings.title'),
      description: t('settings.elderlySub'),
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-lighter)',
    },
  ];

  return (
    <div className="elderly-home page animate-fade-in">
      {/* Greeting */}
      <div className="elderly-greeting">
        <h1>{greeting}, {displayName} 👋</h1>
        <p className="elderly-date">{dateStr}</p>
      </div>

      <CompanionCoach
        name={displayName}
        sessions={sessions}
        recommendedTitle={t('game.memoryMatch')}
        recommendedId="games"
        onPlay={onNavigate}
      />

      {/* Quick Stats */}
      <div className="elderly-quick-stats">
        <div className="elderly-quick-stat">
          <span className="elderly-quick-stat-value">{summary.streak}</span>
          <span className="elderly-quick-stat-label">{t('home.streak')}</span>
        </div>
        <div className="elderly-quick-stat-divider" aria-hidden="true"></div>
        <div className="elderly-quick-stat">
          <span className="elderly-quick-stat-value">{summary.avgAccuracy}%</span>
          <span className="elderly-quick-stat-label">{t('home.accuracy')}</span>
        </div>
        <div className="elderly-quick-stat-divider" aria-hidden="true"></div>
        <div className="elderly-quick-stat">
          <span className="elderly-quick-stat-value">{completedReminders}/{reminders.length}</span>
          <span className="elderly-quick-stat-label">{t('nav.reminders')}</span>
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
        <p>🌿 {t('home.motivation')}</p>
      </div>
    </div>
  );
}
