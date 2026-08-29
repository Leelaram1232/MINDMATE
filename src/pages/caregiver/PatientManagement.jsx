import { Users, UserCheck } from 'lucide-react';
import { PATIENTS } from '../../data/mockData';
import './PatientManagement.css';

export default function PatientManagement({ selectedPatientId, onSelectPatient }) {
  return (
    <div className="patient-management page animate-fade-in">
      <h1 className="page-title">Patient Management</h1>
      <p className="page-subtitle">View and select active profiles to monitor.</p>

      <div className="pm-grid grid-2">
        {PATIENTS.map(patient => {
          const isSelected = patient.id === selectedPatientId;
          const statusClass = patient.status === 'Active' ? 'badge-success' : 'badge-warning';

          return (
            <div
              key={patient.id}
              className={`pm-card card ${isSelected ? 'pm-card-selected' : ''}`}
            >
              <div className="pm-card-left">
                <span className="pm-avatar">{patient.avatar}</span>
              </div>
              <div className="pm-card-body">
                <div className="pm-card-title-row">
                  <h3>{patient.name}</h3>
                  <span className={`badge ${statusClass}`}>{patient.status}</span>
                </div>
                <p className="pm-info">Age: {patient.age} • Gender: {patient.gender}</p>
                <div className="pm-stats">
                  <div className="pm-stat-item">
                    <span className="pm-stat-lbl">Games</span>
                    <span className="pm-stat-val">{patient.gamesCompleted}</span>
                  </div>
                  <div className="pm-stat-item">
                    <span className="pm-stat-lbl">Avg. Accuracy</span>
                    <span className="pm-stat-val">{patient.avgAccuracy}%</span>
                  </div>
                  <div className="pm-stat-item">
                    <span className="pm-stat-lbl">Memory Trend</span>
                    <span className="pm-stat-val" style={{ color: patient.memoryTrend === 'Declining' ? 'var(--color-error)' : 'var(--color-success)' }}>
                      {patient.memoryTrend}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pm-card-actions">
                {isSelected ? (
                  <span className="pm-active-badge">
                    <UserCheck size={18} /> Selected
                  </span>
                ) : (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onSelectPatient(patient.id)}
                  >
                    Select Profile
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
