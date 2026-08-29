import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, ArrowLeft, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { logGameSession, getAdaptiveDifficulty } from '../../lib/db';
import { createMemoryBoard } from '../../lib/gameLevels';
import CompanionCoach, { GameCompanionNudge } from '../../components/companion/CompanionCoach';
import './MemoryMatch.css';

/* ── Confetti burst (pure CSS-driven, no library) ── */
function Confetti({ active }) {
  const colors = ['#2F5D50','#C9785D','#D9A441','#7E9F8B','#E9B49E','#DCE8DF'];
  if (!active) return null;
  return (
    <div className="confetti-container" aria-hidden="true">
      {Array.from({ length: 48 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${0.8 + Math.random() * 0.8}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}


export default function MemoryMatch({ onBack, onBackToGames }) {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const loggedRef = useRef(false);
  const [pairCount, setPairCount] = useState(6);
  const [columns, setColumns] = useState(4);
  const [previewMs, setPreviewMs] = useState(0);
  const [flipBackMs, setFlipBackMs] = useState(850);
  const [boardId, setBoardId] = useState(0);
  const [peeking, setPeeking] = useState(false);
  const [difficultyLabel, setDifficultyLabel] = useState('Medium');
  const [cards, setCards] = useState(() => createMemoryBoard(6));
  const [flippedIds, setFlippedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongPair, setWrongPair] = useState([]);
  const [coachNote, setCoachNote] = useState('');

  const totalPairs = pairCount;

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    getAdaptiveDifficulty(user.id, 'memory-match').then((settings) => {
      if (!active) return;
      setPairCount(settings.pairCount);
      setColumns(settings.columns || 4);
      setPreviewMs(settings.previewMs || 0);
      setFlipBackMs(settings.flipBackMs || 850);
      setDifficultyLabel(settings.label);
      setCoachNote(settings.coachNote || '');
      setCards(createMemoryBoard(settings.pairCount));
      setBoardId((id) => id + 1);
    });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!previewMs || !boardId) return undefined;
    setPeeking(true);
    setCards((prev) => prev.map((c) => ({ ...c, flipped: true })));
    const timer = setTimeout(() => {
      setCards((prev) => prev.map((c) => (c.matched ? c : { ...c, flipped: false })));
      setPeeking(false);
    }, previewMs);
    return () => clearTimeout(timer);
  }, [boardId, previewMs]);

  useEffect(() => {
    if (gameComplete) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, gameComplete]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCardClick = useCallback((cardId) => {
    if (isChecking || peeking) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    if (flippedIds.length >= 2) return;

    const newCards = cards.map(c => c.id === cardId ? { ...c, flipped: true } : c);
    const newFlipped = [...flippedIds, cardId];
    setCards(newCards);
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);
      const [first, second] = newFlipped;
      const card1 = newCards.find(c => c.id === first);
      const card2 = newCards.find(c => c.id === second);

      if (card1.symbol === card2.symbol) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second ? { ...c, matched: true } : c
          ));
          setMatches(m => {
            const newM = m + 1;
            if (newM === totalPairs) {
              setGameComplete(true);
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 2500);
            }
            return newM;
          });
          setFlippedIds([]);
          setIsChecking(false);
        }, Math.min(400, flipBackMs));
      } else {
        setWrongPair([first, second]);
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second ? { ...c, flipped: false } : c
          ));
          setFlippedIds([]);
          setWrongPair([]);
          setIsChecking(false);
        }, flipBackMs);
      }
    }
  }, [cards, flippedIds, isChecking, peeking, flipBackMs, totalPairs]);

  const resetGame = () => {
    setCards(createMemoryBoard(pairCount));
    setFlippedIds([]);
    setMoves(0);
    setMatches(0);
    setGameComplete(false);
    setIsChecking(false);
    setShowConfetti(false);
    setWrongPair([]);
    setBoardId((id) => id + 1);
  };

  const accuracy = moves > 0 ? Math.round((matches / moves) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

  // Persist the session once per completion.
  useEffect(() => {
    if (gameComplete && user && !loggedRef.current) {
      loggedRef.current = true;
      logGameSession({
        userId: user.id,
        gameId: 'memory-match',
        gameTitle: 'Memory Match',
        accuracy,
        score: matches,
        durationSeconds: elapsedTime,
      });
    }
    if (!gameComplete) loggedRef.current = false;
  }, [gameComplete, user, accuracy, matches, elapsedTime]);

  return (
    <div className="memory-match page animate-fade-in">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="game-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2>Memory Match <span className="badge badge-primary">{difficultyLabel}</span></h2>
        <button className="btn btn-ghost btn-sm" onClick={resetGame} aria-label="Restart game">
          <RotateCcw size={18} />
        </button>
      </div>

      <GameCompanionNudge note={coachNote} />

      {/* Stats Bar */}
      <div className="game-stats-bar">
        <div className="game-stat-item">
          <span className="game-stat-label">Matches</span>
          <span className="game-stat-val">{matches}/{totalPairs}</span>
        </div>
        <div className="game-stat-item">
          <span className="game-stat-label">Moves</span>
          <span className="game-stat-val">{moves}</span>
        </div>
        <div className="game-stat-item">
          <span className="game-stat-label">Time</span>
          <span className="game-stat-val">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Match Progress */}
      <div className="mm-progress">
        {Array.from({ length: totalPairs }).map((_, i) => (
          <div key={i} className={`mm-progress-dot ${i < matches ? 'mm-progress-dot-filled' : ''}`} />
        ))}
      </div>

      {peeking && (
        <p className="mm-peek-hint" role="status">Look once, then the cards will hide.</p>
      )}

      {/* Game Board */}
      <div
        className="mm-board"
        style={{ '--mm-cols': columns }}
        role="grid"
        aria-label="Memory match game board"
      >
        {cards.map(card => {
          const isWrong = wrongPair.includes(card.id);
          return (
            <button
              key={card.id}
              className={`mm-card ${card.flipped || card.matched ? 'mm-card-flipped' : ''} ${card.matched ? 'mm-card-matched' : ''} ${isWrong ? 'mm-card-wrong' : ''}`}
              onClick={() => handleCardClick(card.id)}
              disabled={card.matched || card.flipped}
              aria-label={card.flipped || card.matched ? card.symbol : 'Hidden card'}
            >
              <div className="mm-card-inner">
                <div className="mm-card-front">
                  <span className="mm-card-question">?</span>
                </div>
                <div className="mm-card-back">
                  <span>{card.symbol}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Completion Modal */}
      {gameComplete && (
        <div className="modal-overlay" role="dialog" aria-label="Game complete">
          <div className="modal-content animate-scale-in mm-result-modal">
            <div className="mm-result-stars">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  size={32}
                  className={`mm-star ${i < stars ? 'mm-star-filled' : 'mm-star-empty'}`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <h2>Wonderful Work! 🎉</h2>
            <p>You matched all the pairs!</p>
            <CompanionCoach
              name={profile?.full_name}
              justFinished={{ accuracy, gameTitle: 'Memory Match', score: matches }}
              compact
            />

            <div className="game-results-grid">
              <div className="game-result-item">
                <span className="game-result-label">Score</span>
                <span className="game-result-value">{accuracy}%</span>
              </div>
              <div className="game-result-item">
                <span className="game-result-label">Moves</span>
                <span className="game-result-value">{moves}</span>
              </div>
              <div className="game-result-item">
                <span className="game-result-label">Time</span>
                <span className="game-result-value">{formatTime(elapsedTime)}</span>
              </div>
              <div className="game-result-item">
                <span className="game-result-label">Stars</span>
                <span className="game-result-value">{'⭐'.repeat(stars)}</span>
              </div>
            </div>

            <div className="game-result-actions">
              <button className="btn btn-primary btn-lg" onClick={resetGame}>
                {t('game.playAgain')}
              </button>
              <button className="btn btn-secondary" onClick={onBackToGames}>
                {t('game.backToGames')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
