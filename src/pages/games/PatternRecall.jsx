import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { PATTERN_SHAPES } from '../../data/mockData';
import './PatternRecall.css';

export default function PatternRecall({ onBack, onBackToGames }) {
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState('ready'); // ready, showing, input, success, fail, complete
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [activeInputId, setActiveInputId] = useState(null);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [readyCountdown, setReadyCountdown] = useState(3);
  const maxLevel = 5;

  const generateSequence = useCallback((len) => {
    const seq = [];
    for (let i = 0; i < len; i++) {
      const idx = Math.floor(Math.random() * PATTERN_SHAPES.length);
      seq.push(PATTERN_SHAPES[idx].id);
    }
    return seq;
  }, []);

  const startLevel = useCallback(() => {
    const seqLength = level + 2;
    const newSeq = generateSequence(seqLength);
    setSequence(newSeq);
    setUserInput([]);
    setPhase('showing');

    let i = 0;
    const interval = setInterval(() => {
      if (i < newSeq.length) {
        setHighlightedId(newSeq[i]);
        setTimeout(() => setHighlightedId(null), 500);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase('input'), 400);
      }
    }, 800);
  }, [level, generateSequence]);

  // Countdown before showing sequence
  useEffect(() => {
    if (phase === 'ready') {
      setReadyCountdown(3);
      const tick = setInterval(() => {
        setReadyCountdown(c => {
          if (c <= 1) { clearInterval(tick); startLevel(); return 0; }
          return c - 1;
        });
      }, 700);
      return () => clearInterval(tick);
    }
  }, [phase, startLevel]);

  const handleShapeTap = (shapeId) => {
    if (phase !== 'input') return;
    setActiveInputId(shapeId);
    setTimeout(() => setActiveInputId(null), 200);

    const newInput = [...userInput, shapeId];
    setUserInput(newInput);
    const currentIdx = newInput.length - 1;

    if (newInput[currentIdx] !== sequence[currentIdx]) {
      setTotalAttempts(t => t + 1);
      setPhase('fail');
      return;
    }

    if (newInput.length === sequence.length) {
      setScore(s => s + 1);
      setTotalAttempts(t => t + 1);
      if (level >= maxLevel) setPhase('complete');
      else setPhase('success');
    }
  };

  const nextLevel = () => { setLevel(l => l + 1); setPhase('ready'); };
  const retryLevel = () => setPhase('ready');
  const resetGame = () => { setLevel(1); setScore(0); setTotalAttempts(0); setPhase('ready'); };
  const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

  return (
    <div className="pattern-recall page animate-fade-in">
      {/* Header */}
      <div className="game-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2>Pattern Recall</h2>
        <button className="btn btn-ghost btn-sm" onClick={resetGame}><RotateCcw size={18} /></button>
      </div>

      {/* Level & Score */}
      <div className="game-stats-bar">
        <div className="game-stat-item">
          <span className="game-stat-label">Level</span>
          <span className="game-stat-val">{level}/{maxLevel}</span>
        </div>
        <div className="game-stat-item">
          <span className="game-stat-label">Score</span>
          <span className="game-stat-val">{score}</span>
        </div>
        <div className="game-stat-item">
          <span className="game-stat-label">Sequence</span>
          <span className="game-stat-val">{level + 2} steps</span>
        </div>
      </div>

      {/* Level Progress Dots */}
      <div className="pr-level-dots">
        {Array.from({ length: maxLevel }).map((_, i) => (
          <div key={i} className={`pr-level-dot ${i < level - 1 ? 'done' : i === level - 1 ? 'current' : ''}`} />
        ))}
      </div>

      {/* Instruction Banner */}
      <div className={`pr-instruction pr-instruction-${phase}`}>
        {phase === 'ready' && <p>🎯 Get ready in <strong>{readyCountdown}</strong>...</p>}
        {phase === 'showing' && <p>👀 Watch the pattern carefully!</p>}
        {phase === 'input' && <p>✋ Your turn! Tap in the same order.</p>}
        {phase === 'success' && <p>✅ Perfect! Level {level} complete!</p>}
        {phase === 'fail' && <p>🔄 Not quite! Watch again and try.</p>}
      </div>

      {/* Sequence display during show phase */}
      {phase === 'showing' && (
        <div className="pr-sequence-display">
          {sequence.map((shapeId, i) => {
            const shape = PATTERN_SHAPES.find(s => s.id === shapeId);
            return (
              <span
                key={i}
                className={`pr-seq-dot ${highlightedId === shapeId ? 'pr-seq-dot-active' : ''}`}
                style={{ color: shape.color }}
              >
                {shape.symbol}
              </span>
            );
          })}
        </div>
      )}

      {/* Input Progress Tracker */}
      {phase === 'input' && (
        <div className="pr-input-progress">
          {sequence.map((shapeId, i) => {
            const shape = PATTERN_SHAPES.find(s => s.id === shapeId);
            const filled = i < userInput.length;
            const userShape = filled ? PATTERN_SHAPES.find(s => s.id === userInput[i]) : null;
            return (
              <div
                key={i}
                className={`pr-progress-slot ${filled ? 'filled' : ''}`}
                style={filled ? { borderColor: userShape?.color, backgroundColor: `${userShape?.color}18` } : {}}
              >
                {filled ? (
                  <span style={{ color: userShape?.color }}>{userShape?.symbol}</span>
                ) : (
                  <span className="pr-slot-empty">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Shape Buttons */}
      <div className="pr-shapes">
        {PATTERN_SHAPES.map(shape => {
          const isHighlighted = highlightedId === shape.id;
          const isActive = activeInputId === shape.id;
          return (
            <button
              key={shape.id}
              className={`pr-shape-btn ${isHighlighted ? 'pr-shape-highlight' : ''} ${isActive ? 'pr-shape-tap' : ''}`}
              style={{ '--shape-color': shape.color }}
              onClick={() => handleShapeTap(shape.id)}
              disabled={phase !== 'input'}
              aria-label={shape.label}
            >
              <span className="pr-shape-symbol">{shape.symbol}</span>
              <span className="pr-shape-label">{shape.label}</span>
            </button>
          );
        })}
      </div>

      {/* Level Result Actions */}
      {phase === 'success' && (
        <div className="pr-level-actions">
          <button className="btn btn-primary btn-lg" onClick={nextLevel}>
            Level {level + 1} →
          </button>
        </div>
      )}
      {phase === 'fail' && (
        <div className="pr-level-actions">
          <button className="btn btn-primary btn-lg" onClick={retryLevel}>Try Again</button>
          <button className="btn btn-secondary" onClick={onBackToGames}>Back to Games</button>
        </div>
      )}

      {/* Completion Modal */}
      {phase === 'complete' && (
        <div className="modal-overlay" role="dialog" aria-label="Game complete">
          <div className="modal-content animate-scale-in">
            <Trophy size={48} className="game-trophy" />
            <h2>Amazing! 🌟</h2>
            <p>You completed all {maxLevel} levels!</p>
            <div className="game-results-grid">
              <div className="game-result-item">
                <span className="game-result-label">Score</span>
                <span className="game-result-value">{score}/{maxLevel}</span>
              </div>
              <div className="game-result-item">
                <span className="game-result-label">Accuracy</span>
                <span className="game-result-value">{accuracy}%</span>
              </div>
            </div>
            <div className="game-result-actions">
              <button className="btn btn-primary btn-lg" onClick={resetGame}>Play Again</button>
              <button className="btn btn-secondary" onClick={onBackToGames}>Back to Games</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
