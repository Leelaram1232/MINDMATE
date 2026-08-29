import { useState } from 'react';
import { BookOpen, Download, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguagePicker from '../../components/ui/LanguagePicker';
import ThemeToggle from '../../components/ui/ThemeToggle';
import VoiceSettings from '../../components/ui/VoiceSettings';
import { isValidPhone, normalizePhone } from '../../lib/phone';
import { downloadManualFile } from '../../lib/manuals';
import '../auth/AuthScreen.css';

export default function CaregiverSettings({ onNavigate }) {
  const { profile, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [manualStatus, setManualStatus] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setNotice('');
    setError('');
    if (!isValidPhone(phone)) {
      setError(t('settings.phoneInvalid'));
      return;
    }
    setSaving(true);
    const { error: saveError } = await updateProfile({ phone: normalizePhone(phone) });
    setSaving(false);
    if (saveError) setError(saveError.message);
    else setNotice(t('settings.phoneSaved'));
  };

  return (
    <div className="page animate-fade-in">
      <h1 className="page-title">{t('settings.title')}</h1>
      <p className="page-subtitle">{t('settings.sub')}</p>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3>{t('settings.account')}</h3>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          {profile?.full_name
            ? t('settings.signedIn', { name: profile.full_name })
            : t('settings.signedInGeneric')}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>{t('theme.label')}</h3>
        <ThemeToggle />
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <LanguagePicker />
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>{t('voice.setTitle')}</h3>
        <VoiceSettings />
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3>{t('welcome.manualCaregiver')}</h3>
        <p style={{ margin: 'var(--space-sm) 0 var(--space-md)', color: 'var(--color-text-muted)' }}>
          {t('manual.pdfHint')}
        </p>
        <div className="settings-actions">
          <button type="button" className="btn btn-primary" onClick={() => onNavigate?.('manual')}>
            <BookOpen size={18} /> {t('welcome.viewManual')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={async () => {
              try {
                const result = await downloadManualFile({ role: 'caregiver' });
                setManualStatus(t('manual.saved', { file: result.filename }));
              } catch (error) {
                setManualStatus(error.message || t('manual.saveFail'));
              }
            }}
          >
            <Download size={18} /> {t('manual.downloadPdf')}
          </button>
        </div>
        {manualStatus && <p style={{ marginTop: 'var(--space-sm)', color: 'var(--color-success)' }}>{manualStatus}</p>}
      </div>

      <form className="card" onSubmit={handleSave}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>{t('settings.phoneTitle')}</h3>
        <p style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-muted)' }}>
          {t('settings.phoneHint')}
        </p>
        <label className="auth-field">
          <span className="auth-label">{t('auth.phone')}</span>
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
          {saving ? t('common.saving') : t('settings.savePhone')}
        </button>
      </form>
    </div>
  );
}
