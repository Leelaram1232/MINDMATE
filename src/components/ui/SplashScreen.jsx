import { useState, useEffect, useRef } from 'react';
import { useLottie } from 'lottie-react';
import './SplashScreen.css';

function LottiePlayer({ animationData }) {
  const { View } = useLottie({
    animationData,
    loop: true,
    autoplay: true,
    style: { width: 220, height: 220 },
  });
  return View;
}

export default function SplashScreen({ onComplete }) {
  const [animationData, setAnimationData] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading, reveal, exit

  useEffect(() => {
    fetch('/brain-animation.json')
      .then(r => r.json())
      .then(data => {
        setAnimationData(data);
        setPhase('reveal');
        setTimeout(() => setPhase('exit'), 3200);
        setTimeout(() => onComplete(), 3700);
      })
      .catch(() => {
        // Fallback if fetch fails
        setPhase('reveal');
        setTimeout(() => setPhase('exit'), 1800);
        setTimeout(() => onComplete(), 2200);
      });
  }, [onComplete]);

  return (
    <div className={`splash-screen ${phase === 'exit' ? 'splash-exit' : ''}`}>
      <div className="splash-inner">
        {/* Lottie Brain Animation */}
        <div className={`splash-lottie ${phase === 'reveal' ? 'splash-lottie-visible' : ''}`}>
          {animationData ? (
            <LottiePlayer animationData={animationData} />
          ) : (
            <div className="splash-fallback-brain">🧠</div>
          )}
        </div>

        {/* Brand Name */}
        <div className={`splash-brand ${phase === 'reveal' ? 'splash-brand-visible' : ''}`}>
          <h1 className="splash-title">
            MIND<span className="splash-title-accent">MATE</span>
          </h1>
          <span className="splash-ner">NER</span>
        </div>

        {/* Tagline */}
        <p className={`splash-tagline ${phase === 'reveal' ? 'splash-tagline-visible' : ''}`}>
          Cognitive Wellness Companion
        </p>

        {/* Loading bar */}
        <div className={`splash-loader ${phase === 'reveal' ? 'splash-loader-active' : ''}`}>
          <div className="splash-loader-fill"></div>
        </div>
      </div>

      {/* Background rings */}
      <div className="splash-ring splash-ring-1" aria-hidden="true"></div>
      <div className="splash-ring splash-ring-2" aria-hidden="true"></div>
      <div className="splash-ring splash-ring-3" aria-hidden="true"></div>
    </div>
  );
}
