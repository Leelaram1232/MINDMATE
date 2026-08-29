import { useEffect, useState } from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { GAMES_LIST } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { gameTitleKey, gameDescKey, difficultyKey } from '../../lib/i18n';
import { getAdaptiveDifficulty, getGameSessions } from '../../lib/db';
import CompanionCoach from '../../components/companion/CompanionCoach';
import './GamesHome.css';

export default function GamesHome({ onSelectGame }) {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [levels, setLevels] = useState({});
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    Promise.all([
      ...GAMES_LIST.map((g) => getAdaptiveDifficulty(user.id, g.id)),
      getGameSessions(user.id),
    ]).then((results) => {
      if (!active) return;
      const next = {};
      GAMES_LIST.forEach((g, i) => {
        next[g.id] = results[i];
      });
      setLevels(next);
      setSessions(results[GAMES_LIST.length] || []);
    });
    return () => { active = false; };
  }, [user]);

  const recommendedId = Object.values(levels).find((level) => level?.recommendedGameId)?.recommendedGameId;
  const recommended = GAMES_LIST.find((g) => g.id === recommendedId)
    || GAMES_LIST.find((g) => levels[g.id]?.tier === 'easy')
    || GAMES_LIST[0];

  return (
    <div className="games-home page animate-fade-in">
      <h1 className="page-title">{t('games.title')}</h1>
      <p className="page-subtitle">{t('games.sub')}</p>

      <CompanionCoach
        name={profile?.full_name}
        sessions={sessions}
        recommendedTitle={recommended ? t(gameTitleKey(recommended.id)) : t('game.memoryMatch')}
        recommendedId={recommended?.id}
        onPlay={onSelectGame}
      />

      <div className="games-grid">
        {GAMES_LIST.map((game) => {
          const adapted = levels[game.id];
          const badge = t(difficultyKey(adapted?.tier || adapted?.label || game.difficulty));
          return (
            <button
              key={game.id}
              className="game-card card card-interactive"
              onClick={() => onSelectGame(game.id)}
              aria-label={`${t('games.playNow')} ${t(gameTitleKey(game.id))}`}
            >
              <div className="game-card-header">
                <span className="game-card-icon">{game.icon}</span>
                <span className="badge badge-primary">
                  {badge}{adapted?.detail ? ` · ${adapted.detail}` : ''}
                </span>
              </div>

              <h3 className="game-card-title">{t(gameTitleKey(game.id))}</h3>
              <p className="game-card-desc">{t(gameDescKey(game.id))}</p>

              <div className="game-card-meta">
                <div className="game-card-skills">
                  {game.skills.map((skill) => (
                    <span key={skill} className="game-skill-tag">{skill}</span>
                  ))}
                </div>
                <span className="game-card-time">
                  <Clock size={14} /> {game.estimatedTime}
                </span>
              </div>

              <div className="game-card-play">
                <span>{t('games.playNow')}</span>
                <ArrowRight size={16} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
