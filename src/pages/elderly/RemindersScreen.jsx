import { useState, useEffect, useCallback } from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getReminders,
  seedDefaultReminders,
  setReminderStatus,
  subscribeReminders,
} from '../../lib/db';
import './RemindersScreen.css';

export default function RemindersScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    let data = await getReminders(user.id);
    // First-time users get the starter set so the screen isn't empty.
    if (data.length === 0) {
      data = await seedDefaultReminders(user.id);
    }
    setReminders(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Live updates — reflects caregiver edits in real time.
  useEffect(() => {
    if (!user) return undefined;
    return subscribeReminders(user.id, load);
  }, [user, load]);

  const completedCount = reminders.filter(r => r.status === 'completed').length;
  const totalCount = reminders.length || 1;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const markAsDone = async (id) => {
    // Optimistic update; realtime + reload will reconcile.
    setReminders(prev => prev.map(r => (r.id === id ? { ...r, status: 'completed' } : r)));
    await setReminderStatus(id, 'completed');
  };

  const statusConfig = {
    completed: { label: 'Completed', icon: Check, className: 'status-completed', color: 'var(--color-success)' },
    pending: { label: 'Pending', icon: AlertCircle, className: 'status-pending', color: 'var(--color-warning)' },
    upcoming: { label: 'Upcoming', icon: Clock, className: 'status-upcoming', color: 'var(--color-text-light)' },
  };

  return (
    <div className="reminders-page page animate-fade-in">
      <h1 className="page-title">{t('reminders.title')}</h1>
      <p className="page-subtitle">{t('reminders.sub')}</p>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading your reminders…
        </div>
      ) : (
      <>
      {/* Progress Bar */}
      <div className="reminder-progress-card card">
        <div className="reminder-progress-info">
          <span className="reminder-progress-text">
            {completedCount} of {totalCount} completed
          </span>
          <span className="reminder-progress-pct">{progressPct}%</span>
        </div>
        <div className="reminder-progress-bar">
          <div
            className="reminder-progress-fill"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>

      {/* Reminder List */}
      <div className="reminder-list">
        {reminders.map(reminder => {
          const config = statusConfig[reminder.status];
          const StatusIcon = config.icon;
          const isCompleted = reminder.status === 'completed';

          return (
            <div
              key={reminder.id}
              className={`reminder-card card ${isCompleted ? 'reminder-completed' : ''}`}
            >
              <div className="reminder-card-icon">{reminder.icon}</div>
              <div className="reminder-card-body">
                <h3 className="reminder-card-title">{reminder.title}</h3>
                <p className="reminder-card-desc">{reminder.description}</p>
                <div className="reminder-card-meta">
                  <span className="reminder-card-time">
                    <Clock size={14} /> {reminder.time_label}
                  </span>
                  <span className={`reminder-status ${config.className}`}>
                    <StatusIcon size={14} /> {config.label}
                  </span>
                </div>
              </div>
              {!isCompleted && (
                <button
                  className="btn btn-primary btn-sm reminder-done-btn"
                  onClick={() => markAsDone(reminder.id)}
                  aria-label={`Mark ${reminder.title} as done`}
                >
                  <Check size={18} />
                  Done
                </button>
              )}
            </div>
          );
        })}
      </div>
      </>
      )}
    </div>
  );
}
