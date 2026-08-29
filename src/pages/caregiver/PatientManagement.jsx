import { useState } from 'react';
import { UserCheck, UserPlus, Copy, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { generateInviteCode } from '../../lib/db';
import './PatientManagement.css';

export default function PatientManagement({
  patients = [],
  patientsLoading,
  selectedPatientId,
  onSelectPatient,
  onRefreshPatients,
}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    setCopied(false);
    setGenerating(true);
    const { code: newCode, error: genError } = await generateInviteCode(user.id);
    if (genError) setError(genError.message);
    else setCode(newCode);
    setGenerating(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy — please copy the code manually.');
    }
  };

  return (
    <div className="patient-management page animate-fade-in">
      <h1 className="page-title">{t('care.patients')}</h1>
      <p className="page-subtitle">Connect with the people you care for and monitor their progress.</p>

      {/* Link a new patient */}
      <div className="card pm-invite-card">
        <div className="pm-invite-head">
          <div className="pm-invite-icon"><UserPlus size={22} /></div>
          <div>
            <h3>Link a new patient</h3>
            <p className="pm-invite-sub">
              Generate a code and ask the person using MindMate to enter it in their app
              (Home → Connect Caregiver).
            </p>
          </div>
        </div>

        {code ? (
          <div className="pm-code-display">
            <span className="pm-code" aria-label="Invite code">{code}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleGenerate} disabled={generating}>
              <RefreshCw size={16} /> New code
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate invite code'}
          </button>
        )}
        {code && <p className="pm-code-hint">This code expires in 7 days and can be used once.</p>}
        {error && <p className="pm-error">{error}</p>}
      </div>

      {/* Linked patients */}
      <div className="section-header" style={{ marginTop: 'var(--space-xl)' }}>
        <h3>Linked patients</h3>
        <button className="btn btn-ghost btn-sm" onClick={onRefreshPatients} aria-label="Refresh">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {patientsLoading ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading patients…
        </div>
      ) : patients.length === 0 ? (
        <div className="card pm-empty">
          <p>No patients linked yet. Generate an invite code above and share it with the person you care for.</p>
        </div>
      ) : (
        <div className="pm-grid grid-2">
          {patients.map((patient) => {
            const isSelected = patient.id === selectedPatientId;
            const name = patient.full_name?.trim() || 'MindMate User';
            return (
              <div key={patient.id} className={`pm-card card ${isSelected ? 'pm-card-selected' : ''}`}>
                <div className="pm-card-left">
                  <span className="pm-avatar">🧑</span>
                </div>
                <div className="pm-card-body">
                  <div className="pm-card-title-row">
                    <h3>{name}</h3>
                    <span className="badge badge-success">Linked</span>
                  </div>
                  <p className="pm-info">
                    Connected {new Date(patient.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="pm-card-actions">
                  {isSelected ? (
                    <span className="pm-active-badge">
                      <UserCheck size={18} /> Selected
                    </span>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => onSelectPatient(patient.id)}>
                      Select Profile
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
