import { useLanguage } from '../../context/LanguageContext';
import './LanguageDownload.css';

export default function LanguageDownload({ progress }) {
  const { t } = useLanguage();
  if (!progress) return null;

  const percent = Math.max(0, Math.min(100, progress.percent || 0));
  const stageKey = {
    download: 'lang.stageDownload',
    save: 'lang.stageSave',
    android: 'lang.stageAndroid',
    ready: 'lang.stageReady',
  }[progress.stage] || 'lang.downloading';

  return (
    <div className="lang-dl-overlay" role="alertdialog" aria-live="polite" aria-busy="true">
      <div className="lang-dl-card card">
        <div className="lang-dl-visual">
          <div className="lang-dl-ring" style={{ '--pct': percent }} />
          <span className="lang-dl-percent">{percent}%</span>
        </div>
        <h3 className="lang-dl-title">{t('lang.downloading')} {progress.detail || ''}</h3>
        <p className="lang-dl-status">{t(stageKey)}</p>
        <div className="lang-dl-bar" aria-hidden="true">
          <div className="lang-dl-bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}
