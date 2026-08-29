import { useState } from 'react';
import { Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isValidPhone, normalizePhone } from '../../lib/phone';
import '../auth/AuthScreen.css';

export default function CaregiverSettings() {
  const { profile, updateProfile } = useAuth();
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setNotice('');
    setError('');
    if (!isValidPhone(phone)) {
      setError('Enter a valid phone number (10–15 digits).');
      return;
    }
    setSaving(true);
    const { error: saveError } = await updateProfile({ phone: normalizePhone(phone) });
    setSaving(false);
    if (saveError) setError(saveError.message);
    else setNotice('Phone number saved. Linked patients can call you from MindMate.');
  };

  return (
    <div className="page animate-fade-in">
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Your account and the number patients use to call you.</p>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3>Account</h3>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          {profile?.full_name ? `Signed in as ${profile.full_name}.` : 'You are signed in.'}
        </p>
      </div>

      <form className="card" onSubmit={handleSave}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>Call-back number</h3>
        <p style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-muted)' }}>
          When someone you care for says “call my caregiver”, MindMate opens this number on their phone.
        </p>
        <label className="auth-field">
          <span className="auth-label">Phone number</span>
          <span className="auth-input-wrap">
            <Phone size={18} className="auth-input-icon" />
            <input
              type="tel"
              className="auth-input"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </span>
        </label>
        {error && <p style={{ color: 'var(--color-error)', marginTop: 'var(--space-sm)' }}>{error}</p>}
        {notice && <p style={{ color: 'var(--color-success)', marginTop: 'var(--space-sm)' }}>{notice}</p>}
        <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }} disabled={saving}>
          {saving ? 'Saving…' : 'Save number'}
        </button>
      </form>
    </div>
  );
}
