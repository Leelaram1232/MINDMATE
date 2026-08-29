import { useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { downloadManualFile, getDetailedManual } from '../../lib/manuals';
import './UserManual.css';

export default function UserManual({ onBack, initialRole = 'elderly' }) {
  const { t } = useLanguage();
  const role = initialRole === 'caregiver' ? 'caregiver' : 'elderly';
  const manual = getDetailedManual(role);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    setStatus('');
    try {
      const result = await downloadManualFile({ role });
      setStatus(t('manual.saved', { file: result.filename }));
    } catch (error) {
      setStatus(error.message || t('manual.saveFail'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="manual-page page animate-fade-in">
      {onBack && (
        <button className="btn btn-ghost manual-back" onClick={onBack}>
          <ArrowLeft size={18} /> {t('common.back')}
        </button>
      )}
      <h1 className="page-title">{manual.title}</h1>
      <p className="page-subtitle">{manual.subtitle}</p>

      <button className="btn btn-primary" onClick={handleDownload} disabled={busy}>
        <Download size={18} /> {busy ? t('common.pleaseWait') : t('manual.downloadPdf')}
      </button>
      {status && <p className="manual-status">{status}</p>}

      <div className="manual-sections">
        {manual.sections.map((section) => (
          <section key={section.heading} className="card manual-section">
            <h2>{section.heading}</h2>
            {section.intro && <p>{section.intro}</p>}
            <ol>
              {section.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {section.tip && <p className="manual-tip">{section.tip}</p>}
          </section>
        ))}
      </div>
    </div>
  );
}
