import { useState, useEffect, useCallback } from 'react';
import { Link2, CheckCircle2, Users, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { redeemInviteCode, getMyCaregivers } from '../../lib/db';
import { callPhone } from '../../lib/phone';
import './ConnectCaregiver.css';

export default function ConnectCaregiver() {
  const { user } = useAuth();
  const [caregivers, setCaregivers] = useState([]);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);

  const loadCaregivers = useCallback(async () => {
    if (!user) return;
    setCaregivers(await getMyCaregivers(user.id));
  }, [user]);

  useEffect(() => {
    loadCaregivers();
  }, [loadCaregivers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!code.trim()) {
      setError('Please enter the code from your caregiver.');
      return;
    }
    setSubmitting(true);
    const { error: redeemError } = await redeemInviteCode(code, user.id);
    if (redeemError) {
      setError(redeemError.message);
    } else {
      setSuccess('Connected! Your caregiver can now support you.');
      setCode('');
      setOpen(false);
      loadCaregivers();
    }
    setSubmitting(false);
  };

  const connected = caregivers.length > 0;

  return (
    <div className="connect-caregiver card">
      <div className="cc-head">
        <div className="cc-icon"><Users size={22} /></div>
        <div className="cc-head-text">
          <h3>Your Caregiver</h3>
          {connected ? (
            <p className="cc-connected">
              <CheckCircle2 size={16} /> Connected with{' '}
              {caregivers.map((c) => c.full_name?.trim() || 'your caregiver').join(', ')}
            </p>
          ) : (
            <p className="cc-sub">Connect with a family member or caregiver to share your progress.</p>
          )}
        </div>
      </div>

      {!open && (
        <div className="cc-actions">
          {caregivers.filter((c) => c.phone).map((c) => (
            <button
              key={c.id}
              className="btn btn-primary btn-sm"
              onClick={() => callPhone(c.phone)}
            >
              <Phone size={16} /> Call {c.full_name?.trim() || 'caregiver'}
            </button>
          ))}
          <button className="btn btn-secondary btn-sm cc-toggle" onClick={() => setOpen(true)}>
            <Link2 size={16} /> {connected ? 'Add another caregiver' : 'Enter caregiver code'}
          </button>
        </div>
      )}

      {open && (
        <form className="cc-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="cc-input"
            placeholder="Enter code (e.g. ABC123)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            autoFocus
            aria-label="Caregiver invite code"
          />
          <div className="cc-form-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Connecting…' : 'Connect'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); setError(''); }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && <p className="cc-error">{error}</p>}
      {success && <p className="cc-success">{success}</p>}
    </div>
  );
}
