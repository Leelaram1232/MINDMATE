import { useEffect, useState } from 'react';
import { getActivityFeed, groupActivityByDay } from '../../lib/db';
import './PatientActivity.css';

export default function PatientActivity({ selectedPatientId, activePatient }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const patientName = activePatient?.full_name?.trim() || 'this patient';

  useEffect(() => {
    if (!selectedPatientId) {
      setGroups([]);
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    getActivityFeed(selectedPatientId).then((events) => {
      if (!active) return;
      setGroups(groupActivityByDay(events));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [selectedPatientId]);

  if (!selectedPatientId) {
    return (
      <div className="patient-activity page animate-fade-in">
        <h1 className="page-title">Activity Timeline</h1>
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No patient selected. Link a patient in the Patients tab first.
        </div>
      </div>
    );
  }

  return (
    <div className="patient-activity page animate-fade-in">
      <h1 className="page-title">Activity Timeline</h1>
      <p className="page-subtitle">Recent activities for {patientName}.</p>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading activity…
        </div>
      ) : groups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No recent games or completed reminders yet. Activity will appear here as {patientName} uses the app.
        </div>
      ) : (
        groups.map((day) => (
          <div key={day.date} className="pa-day-group">
            <h3 className="pa-day-label">{day.date}</h3>
            <div className="timeline">
              {day.events.map((event, i) => (
                <div key={`${day.date}-${i}`} className="timeline-item">
                  <span className="timeline-time">{event.time}</span>
                  <div className="timeline-content">
                    <div className="pa-event-row">
                      <span className="pa-event-icon">{event.icon}</span>
                      <div className="pa-event-body">
                        <strong>{event.title}</strong>
                        <span className="pa-event-detail">{event.detail}</span>
                      </div>
                      <span className={`badge ${event.type === 'game' ? 'badge-primary' : 'badge-success'}`}>
                        {event.type === 'game' ? 'Game' : 'Reminder'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
