import { useState } from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { PATIENTS, getDefaultReminders } from '../../data/mockData';
import './ReminderMonitoring.css';

export default function ReminderMonitoring({ selectedPatientId }) {
  const patient = PATIENTS.find(p => p.id === selectedPatientId) || PATIENTS[0];
  const [reminders] = useState(getDefaultReminders);

  const statusConfig = {
    completed: { label: 'Completed', icon: Check, className: 'rm-status-completed' },
    pending: { label: 'Pending', icon: AlertCircle, className: 'rm-status-pending' },
    upcoming: { label: 'Upcoming', icon: Clock, className: 'rm-status-upcoming' },
  };

  const completedCount = reminders.filter(r => r.status === 'completed').length;

  return (
    <div className="reminder-monitoring page animate-fade-in">
      <h1 className="page-title">Reminder Monitoring</h1>
      <p className="page-subtitle">Today's reminder status for {patient.name}.</p>

      {/* Summary */}
      <div className="rm-summary card">
        <div className="rm-summary-row">
          <span className="rm-summary-label">Total Reminders</span>
          <span className="rm-summary-value">{reminders.length}</span>
        </div>
        <div className="rm-summary-row">
          <span className="rm-summary-label">Completed</span>
          <span className="rm-summary-value" style={{ color: 'var(--color-success)' }}>{completedCount}</span>
        </div>
        <div className="rm-summary-row">
          <span className="rm-summary-label">Remaining</span>
          <span className="rm-summary-value" style={{ color: 'var(--color-warning)' }}>{reminders.length - completedCount}</span>
        </div>
      </div>

      {/* Table (Desktop) */}
      <div className="rm-table-container card">
        <table className="data-table rm-table">
          <thead>
            <tr>
              <th>Reminder</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map(reminder => {
              const config = statusConfig[reminder.status];
              const StatusIcon = config.icon;
              return (
                <tr key={reminder.id}>
                  <td>
                    <div className="rm-reminder-cell">
                      <span className="rm-reminder-icon">{reminder.icon}</span>
                      <div>
                        <strong>{reminder.title}</strong>
                        <span className="rm-reminder-desc">{reminder.description}</span>
                      </div>
                    </div>
                  </td>
                  <td>{reminder.time}</td>
                  <td>
                    <span className={`rm-status ${config.className}`}>
                      <StatusIcon size={14} />
                      {config.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards (Mobile) */}
      <div className="rm-card-list">
        {reminders.map(reminder => {
          const config = statusConfig[reminder.status];
          const StatusIcon = config.icon;
          return (
            <div key={reminder.id} className="rm-card card">
              <div className="rm-card-top">
                <span className="rm-reminder-icon">{reminder.icon}</span>
                <div className="rm-card-info">
                  <strong>{reminder.title}</strong>
                  <span>{reminder.description}</span>
                </div>
              </div>
              <div className="rm-card-bottom">
                <span className="rm-card-time">
                  <Clock size={14} /> {reminder.time}
                </span>
                <span className={`rm-status ${config.className}`}>
                  <StatusIcon size={14} />
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
