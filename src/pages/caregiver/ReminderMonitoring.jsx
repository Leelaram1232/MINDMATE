import { useState, useEffect, useCallback } from 'react';
import { Check, Clock, AlertCircle, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getReminders, subscribeReminders, addReminder } from '../../lib/db';
import './ReminderMonitoring.css';

const statusConfig = {
  completed: { label: 'Completed', icon: Check, className: 'rm-status-completed' },
  pending: { label: 'Pending', icon: AlertCircle, className: 'rm-status-pending' },
  upcoming: { label: 'Upcoming', icon: Clock, className: 'rm-status-upcoming' },
};

export default function ReminderMonitoring({ selectedPatientId, activePatient }) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', time_label: '', type: 'medicine' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const patientName = activePatient?.full_name?.trim() || 'this patient';

  const load = useCallback(async () => {
    if (!selectedPatientId) {
      setReminders([]);
      setLoading(false);
      return;
    }
    setReminders(await getReminders(selectedPatientId));
    setLoading(false);
  }, [selectedPatientId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedPatientId) return undefined;
    return subscribeReminders(selectedPatientId, load);
  }, [selectedPatientId, load]);

  const typeIcons = { medicine: '💊', hydration: '💧', activity: '🚶', appointment: '🏥', other: '🔔' };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) {
      setError('Please enter a title.');
      return;
    }
    setSaving(true);
    const { error: addError } = await addReminder({
      user_id: selectedPatientId,
      created_by: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      time_label: form.time_label.trim(),
      type: form.type,
      icon: typeIcons[form.type] || '🔔',
      status: 'upcoming',
    });
    if (addError) {
      setError(addError.message);
    } else {
      setForm({ title: '', description: '', time_label: '', type: 'medicine' });
      setShowForm(false);
      load();
    }
    setSaving(false);
  };

  const completedCount = reminders.filter((r) => r.status === 'completed').length;

  if (!selectedPatientId) {
    return (
      <div className="reminder-monitoring page animate-fade-in">
        <h1 className="page-title">Reminder Monitoring</h1>
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No patient selected. Link a patient in the Patients tab to monitor their reminders.
        </div>
      </div>
    );
  }

  return (
    <div className="reminder-monitoring page animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Reminder Monitoring</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Today's reminder status for {patientName}.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} /> Add Reminder
        </button>
      </div>

      {showForm && (
        <form className="card rm-add-form" onSubmit={handleAdd}>
          <div className="rm-form-row">
            <input
              className="rm-input"
              placeholder="Title (e.g. Morning Medicine)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <select
              className="rm-input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="medicine">Medicine</option>
              <option value="hydration">Hydration</option>
              <option value="activity">Activity</option>
              <option value="appointment">Appointment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="rm-form-row">
            <input
              className="rm-input"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              className="rm-input"
              placeholder="Time (e.g. 9:00 AM)"
              value={form.time_label}
              onChange={(e) => setForm({ ...form, time_label: e.target.value })}
            />
          </div>
          {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save Reminder'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading reminders…
        </div>
      ) : (
        <>
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

          {reminders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No reminders yet. Add one above — it will appear on {patientName}'s device instantly.
            </div>
          ) : (
            <>
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
                    {reminders.map((reminder) => {
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
                          <td>{reminder.time_label}</td>
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
                {reminders.map((reminder) => {
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
                          <Clock size={14} /> {reminder.time_label}
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
            </>
          )}
        </>
      )}
    </div>
  );
}
