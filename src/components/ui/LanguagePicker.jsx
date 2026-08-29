import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  downloadLanguagePack,
  isPackInstalled,
  previewPackVoice,
  subscribeInstalledPacks,
} from '../../lib/languagePacks';
import LanguageDownload from './LanguageDownload';
import './LanguagePicker.css';
import './LanguageDownload.css';

export default function LanguagePicker({ compact = false }) {
  const { language, setLanguage, languages, t } = useLanguage();
  const [installed, setInstalled] = useState(() => ['en']);
  const [busyCode, setBusyCode] = useState(null);
  const [progress, setProgress] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => subscribeInstalledPacks(setInstalled), []);

  const choose = async (code) => {
    if (busyCode) return;
    setNotice('');
    if (code === 'en' || installed.includes(code) || isPackInstalled(code)) {
      await setLanguage(code);
      return;
    }

    setBusyCode(code);
    setProgress({ stage: 'download', percent: 4, detail: languages.find((l) => l.code === code)?.name });
    try {
      await downloadLanguagePack(code, {
        onProgress: (next) => setProgress(next),
      });
      await setLanguage(code);
      await previewPackVoice(code);
      setNotice(t('lang.installedOk', { name: languages.find((l) => l.code === code)?.name }));
    } catch (error) {
      setNotice(error.message || t('lang.downloadFail'));
    } finally {
      setBusyCode(null);
      window.setTimeout(() => setProgress(null), 400);
    }
  };

  return (
    <div className={`lang-picker ${compact ? 'is-compact' : ''}`}>
      {!compact && <p className="lang-picker-label">{t('lang.choose')}</p>}
      <div className="lang-picker-row" role="group" aria-label={t('lang.label')}>
        {languages.map((item) => {
          const ready = item.code === 'en' || installed.includes(item.code);
          const busy = busyCode === item.code;
          return (
            <button
              key={item.code}
              type="button"
              className={`lang-picker-btn ${language === item.code ? 'is-active' : ''} ${ready ? 'is-ready' : ''} ${busy ? 'is-busy' : ''}`}
              onClick={() => choose(item.code)}
              aria-pressed={language === item.code}
            >
              <span className="lang-picker-native">{item.native}</span>
              <span className="lang-picker-name">{item.name}</span>
              <span className="lang-picker-status">
                {busy ? t('lang.downloading') : ready ? t('lang.ready') : t('lang.download')}
              </span>
            </button>
          );
        })}
      </div>
      {!compact && <p className="lang-picker-hint">{t('lang.downloadHint')}</p>}
      {notice && <p className="lang-picker-hint">{notice}</p>}
      <LanguageDownload progress={progress} />
    </div>
  );
}
