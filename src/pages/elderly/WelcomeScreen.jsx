import { Heart, ArrowRight, ChevronDown } from 'lucide-react';
import './WelcomeScreen.css';

export default function WelcomeScreen({ onGetStarted }) {
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
            Your companion for everyday memory and wellbeing.
          </p>

          <div className="welcome-actions">
            <button className="btn btn-primary btn-lg welcome-start-btn" onClick={onGetStarted}>
              Get Started
              <ArrowRight size={20} />
            </button>
          </div>

          <button className="welcome-scroll-cta" onClick={scrollToHow} aria-label="Learn how it works">
            <span>How It Works</span>
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
          <h2 className="welcome-how-title">How MINDMATE Helps</h2>
          <p className="welcome-how-subtitle">A simple journey to support cognitive wellness every day.</p>

          <div className="welcome-steps">
            {[
              { icon: '🎮', title: 'Play', desc: 'Enjoy simple, engaging cognitive activities designed for comfort.' },
              { icon: '📊', title: 'Track', desc: 'See your progress with easy-to-read summaries and encouragement.' },
              { icon: '🔔', title: 'Remember', desc: 'Get gentle reminders for medicine, hydration, and daily activities.' },
              { icon: '🤝', title: 'Connect', desc: 'Caregivers stay informed and involved in your wellness journey.' },
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
              Get Started
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        <p>
          Made with <Heart size={14} className="welcome-heart" /> for elderly wellbeing
        </p>
      </footer>
    </div>
  );
}
