import { useState } from 'react';
import { Heart, ArrowRight, ChevronDown, BookOpen, Download } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { downloadManualFile } from '../../lib/manuals';
import './WelcomeScreen.css';

export default function WelcomeScreen({ onGetStarted, onOpenManual }) {
  const { t } = useLanguage();
  const [manualStatus, setManualStatus] = useState('');

  const saveManual = async (role) => {
    setManualStatus('');
    try {
      const result = await downloadManualFile({ role });
      setManualStatus(t('manual.saved', { file: result.filename }));
    } catch (error) {
      setManualStatus(error.message || t('manual.saveFail'));
    }
  };
  const scrollToHow = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="welcome-screen">
      {/* Hero */}
      <section className="welcome-hero">
        <div className="welcome-hero-inner">
          <div className="welcome-logo-area">
            <span className="welcome-brain" role="img" aria-label="Brain">🧠</span>
          </div>

          <h1 className="welcome-title">MINDMATE <span className="welcome-title-accent">NER</span></h1>

          <p className="welcome-tagline">
            {t('welcome.tagline')}
          </p>

          <div className="welcome-actions">
            <button className="btn btn-primary btn-lg welcome-start-btn" onClick={onGetStarted}>
              {t('welcome.start')}
              <ArrowRight size={20} />
            </button>
          </div>

          <button className="welcome-scroll-cta" onClick={scrollToHow} aria-label={t('welcome.how')}>
            <span>{t('welcome.how')}</span>
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Decorative soft shapes */}
        <div className="welcome-deco welcome-deco-1" aria-hidden="true"></div>
        <div className="welcome-deco welcome-deco-2" aria-hidden="true"></div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="welcome-how">
        <div className="welcome-how-inner">
          <h2 className="welcome-how-title">{t('welcome.helps')}</h2>
          <p className="welcome-how-subtitle">{t('welcome.helpsSub')}</p>

          <div className="welcome-steps">
            {[
              { icon: '🎮', title: t('welcome.play'), desc: t('welcome.playDesc') },
              { icon: '📊', title: t('welcome.track'), desc: t('welcome.trackDesc') },
              { icon: '🔔', title: t('welcome.remember'), desc: t('welcome.rememberDesc') },
              { icon: '🤝', title: t('welcome.connect'), desc: t('welcome.connectDesc') },
            ].map((step, i) => (
              <div key={i} className="welcome-step card">
                <span className="welcome-step-icon">{step.icon}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="welcome-how-cta">
            <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
              {t('welcome.start')}
              <ArrowRight size={20} />
            </button>
            <button
              className="btn btn-secondary btn-lg"
              style={{ marginLeft: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <BookOpen size={18} /> {t('welcome.about')}
            </button>
          </div>
        </div>
      </section>

      <section id="about" className="welcome-about">
        <div className="welcome-about-inner">
          <h2 className="welcome-about-title">{t('welcome.about')}</h2>
          <p className="welcome-about-sub">{t('welcome.aboutSub')}</p>
          <div className="welcome-manuals">
            <article className="welcome-manual-card card">
              <h3>{t('welcome.manualElderly')}</h3>
              <p>{t('welcome.manualElderlyDesc')}</p>
              <div className="welcome-manual-actions">
                <button className="btn btn-primary" onClick={() => onOpenManual?.('elderly')}>
                  <BookOpen size={18} /> {t('welcome.viewManual')}
                </button>
                <button className="btn btn-secondary" onClick={() => saveManual('elderly')}>
                  <Download size={18} /> {t('manual.downloadPdf')}
                </button>
              </div>
            </article>
            <article className="welcome-manual-card card">
              <h3>{t('welcome.manualCaregiver')}</h3>
              <p>{t('welcome.manualCaregiverDesc')}</p>
              <div className="welcome-manual-actions">
                <button className="btn btn-primary" onClick={() => onOpenManual?.('caregiver')}>
                  <BookOpen size={18} /> {t('welcome.viewManual')}
                </button>
                <button className="btn btn-secondary" onClick={() => saveManual('caregiver')}>
                  <Download size={18} /> {t('manual.downloadPdf')}
                </button>
              </div>
            </article>
          </div>
          {manualStatus && <p className="welcome-manual-status">{manualStatus}</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        <p>
          {t('welcome.footer')} <Heart size={14} className="welcome-heart" />
        </p>
      </footer>
    </div>
  );
}
