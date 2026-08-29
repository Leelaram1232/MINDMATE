import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { readVoiceSettings, writeVoiceSettings, VOICE_RATES } from '../../lib/voiceSettings';
import { speak, stopSpeaking, unlockVoice } from '../../lib/voice';
import './VoiceSettings.css';

export default function VoiceSettings() {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(() => readVoiceSettings());

  const update = (patch) => {
    const next = writeVoiceSettings(patch);
    setSettings(next);
    if (next.responsesOn === false) stopSpeaking();
  };

  const preview = async () => {
    unlockVoice();
    await speak(t('voice.setPreview'), { lang: language, force: true });
  };

  return (
    <div className="voice-settings">
      <p className="voice-settings-hint">{t('voice.setHint')}</p>
      <span className="voice-field-label">{t('voice.responses')}</span>
      <div className="voice-choice-row" role="group" aria-label={t('voice.responses')}>
        <button
          type="button"
          className={`voice-choice-btn ${settings.responsesOn ? 'is-active' : ''}`}
          onClick={() => update({ responsesOn: true })}
        >
          {t('voice.responsesOn')}
        </button>
        <button
          type="button"
          className={`voice-choice-btn ${settings.responsesOn ? '' : 'is-active'}`}
          onClick={() => update({ responsesOn: false })}
        >
          {t('voice.responsesOff')}
        </button>
      </div>
      <p className="voice-settings-hint voice-settings-subhint">{t('voice.responsesHint')}</p>
      <span className="voice-field-label">{t('voice.setGender')}</span>
      <div className="voice-choice-row" role="group" aria-label={t('voice.setGender')}>
        <button
          type="button"
          className={`voice-choice-btn ${settings.gender === 'female' ? 'is-active' : ''}`}
          onClick={() => update({ gender: 'female' })}
        >
          {t('voice.female')}
        </button>
        <button
          type="button"
          className={`voice-choice-btn ${settings.gender === 'male' ? 'is-active' : ''}`}
          onClick={() => update({ gender: 'male' })}
        >
          {t('voice.male')}
        </button>
      </div>
      <span className="voice-field-label">{t('voice.setSpeed')}</span>
      <div className="voice-choice-row voice-rate-row" role="group" aria-label={t('voice.setSpeed')}>
        {VOICE_RATES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`voice-choice-btn ${settings.rateId === item.id ? 'is-active' : ''}`}
            onClick={() => update({ rateId: item.id })}
          >
            {t(`voice.rate.${item.id}`)}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-secondary voice-settings-test" onClick={preview}>
        <Volume2 size={18} /> {t('voice.setTest')}
      </button>
    </div>
  );
}
