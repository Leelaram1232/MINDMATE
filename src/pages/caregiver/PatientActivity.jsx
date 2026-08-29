import { ACTIVITY_TIMELINE, PATIENTS } from '../../data/mockData';
import './PatientActivity.css';

export default function PatientActivity({ selectedPatientId }) {
  const patient = PATIENTS.find(p => p.id === selectedPatientId) || PATIENTS[0];

  return (
    <div className="patient-activity page animate-fade-in">
      <h1 className="page-title">Activity Timeline</h1>
      <p className="page-subtitle">Recent activities for {patient.name}.</p>

      {ACTIVITY_TIMELINE.map(day => (
        <div key={day.id} className="pa-day-group">
          <h3 className="pa-day-label">{day.date}</h3>
          <div className="timeline">
            {day.events.map((event, i) => (
              <div key={i} className="timeline-item">
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
      ))}
    </div>
  );
}
