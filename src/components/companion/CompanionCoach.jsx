import { useEffect, useState } from 'react';
import CompanionAvatar from './CompanionAvatar';
import { coachWithMira, getCoachFallback } from '../../lib/ai';
import { useLanguage } from '../../context/LanguageContext';
import './CompanionCoach.css';

export default function CompanionCoach({
  name,
  sessions = [],
  recommendedTitle,
  recommendedId,
  justFinished,
  onPlay,
  compact = false,
}) {
  const { t, language } = useLanguage();
  const [coach, setCoach] = useState(() =>
    getCoachFallback({ name, sessions, recommendedTitle, justFinished })
  );

  const finishedKey = justFinished
    ? `${justFinished.gameTitle || ''}:${justFinished.accuracy ?? ''}:${justFinished.score ?? ''}`
    : '';
  const sessionKey = sessions
    .slice(0, 6)
    .map((s) => `${s.id || s.game_id}:${s.accuracy}`)
    .join('|');

  useEffect(() => {
    let active = true;
    setCoach(getCoachFallback({ name, sessions, recommendedTitle, justFinished }));
    coachWithMira({ name, sessions, recommendedTitle, justFinished, language }).then((next) => {
      if (active && next?.line) setCoach(next);
    });
    return () => { active = false; };
    // Primitive keys avoid refetching when parents pass a new object each render.
  }, [name, recommendedTitle, finishedKey, sessionKey, language]);

  const { mood, line, tip } = coach;

  return (
    <div className={`companion-card card ${compact ? 'is-compact' : ''}`}>
      <CompanionAvatar mood={mood} size={compact ? 56 : 76} />
      <div className="companion-body">
        <strong className="companion-name">Mira</strong>
        <span className="companion-role">{t('voice.role')}</span>
        <p className="companion-line">{line}</p>
        {tip && <p className="companion-tip">{tip}</p>}
        {onPlay && recommendedId && (
          <button className="btn btn-primary btn-sm" onClick={() => onPlay(recommendedId)}>
            {t('voice.playWithMe')}
          </button>
        )}
      </div>
    </div>
  );
}

export function GameCompanionNudge({ note }) {
  if (!note) return null;
  return (
    <p className="game-companion-nudge" role="status">
      <strong>Mira:</strong> {note}
    </p>
  );
}
