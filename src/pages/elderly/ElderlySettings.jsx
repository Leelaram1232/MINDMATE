import { useState } from 'react';
import { BookOpen, Download, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguagePicker from '../../components/ui/LanguagePicker';
import ThemeToggle from '../../components/ui/ThemeToggle';
import VoiceSettings from '../../components/ui/VoiceSettings';
import { downloadManualFile } from '../../lib/manuals';

export default function ElderlySettings({ onNavigate }) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [manualStatus, setManualStatus] = useState('');

  return (
    <div className="page animate-fade-in">
      <h1 className="page-title">{t('settings.title')}</h1>
      <p className="page-subtitle">{t('settings.elderlySub')}</p>

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
        <h3>{t('welcome.manualElderly')}</h3>
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
                const result = await downloadManualFile({ role: 'elderly' });
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

      <button
        className="btn btn-secondary"
        style={{ width: '100%' }}
        onClick={() => onNavigate?.('exit-role')}
      >
        <LogOut size={20} />
        {t('common.signOut')}
      </button>
    </div>
  );
}
