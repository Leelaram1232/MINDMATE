import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, ArrowLeft, Trophy, Star } from 'lucide-react';
import { MEMORY_MATCH_SYMBOLS } from '../../data/mockData';
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

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createBoard() {
  const symbols = MEMORY_MATCH_SYMBOLS.slice(0, 6);
  const pairs = [...symbols, ...symbols];
  return shuffleArray(pairs).map((symbol, index) => ({
    id: index,
    symbol,
    flipped: false,
    matched: false,
  }));
}

export default function MemoryMatch({ onBack, onBackToGames }) {
  const [cards, setCards] = useState(createBoard);
  const [flippedIds, setFlippedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongPair, setWrongPair] = useState([]);

  const totalPairs = 6;

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
    if (isChecking) return;
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
        }, 400);
      } else {
        setWrongPair([first, second]);
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second ? { ...c, flipped: false } : c
          ));
          setFlippedIds([]);
          setWrongPair([]);
          setIsChecking(false);
        }, 900);
      }
    }
  }, [cards, flippedIds, isChecking]);

  const resetGame = () => {
    setCards(createBoard());
    setFlippedIds([]);
    setMoves(0);
    setMatches(0);
    setGameComplete(false);
    setIsChecking(false);
    setShowConfetti(false);
    setWrongPair([]);
  };

  const accuracy = moves > 0 ? Math.round((matches / moves) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

  return (
    <div className="memory-match page animate-fade-in">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="game-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2>Memory Match</h2>
        <button className="btn btn-ghost btn-sm" onClick={resetGame} aria-label="Restart game">
          <RotateCcw size={18} />
        </button>
      </div>

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

      {/* Game Board */}
      <div className="mm-board" role="grid" aria-label="Memory match game board">
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
                Play Again
              </button>
              <button className="btn btn-secondary" onClick={onBackToGames}>
                Back to Games
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
