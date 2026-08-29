import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logGameSession, getAdaptiveDifficulty } from '../../lib/db';
import { pickObjectRounds } from '../../lib/gameLevels';
import CompanionCoach, { GameCompanionNudge } from '../../components/companion/CompanionCoach';
import './ObjectRecognition.css';

export default function ObjectRecognition({ onBack, onBackToGames }) {
  const { user, profile } = useAuth();
  const loggedRef = useRef(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [results, setResults] = useState([]);
  const [rounds, setRounds] = useState(() => pickObjectRounds({ rounds: 6, optionCount: 4, pool: 'medium' }));
  const [roundSettings, setRoundSettings] = useState({ rounds: 6, optionCount: 4, pool: 'medium' });
  const [difficultyLabel, setDifficultyLabel] = useState('Medium');
  const [coachNote, setCoachNote] = useState('');

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    getAdaptiveDifficulty(user.id, 'object-recognition').then((settings) => {
      if (!active) return;
      const next = {
        rounds: settings.rounds,
        optionCount: settings.optionCount || 4,
        pool: settings.pool || 'medium',
      };
      setRoundSettings(next);
      setDifficultyLabel(settings.label);
      setCoachNote(settings.coachNote || '');
      setRounds(pickObjectRounds(next));
    });
    return () => { active = false; };
  }, [user]);

  const round = rounds[currentRound];
  const totalRounds = rounds.length;
  const isCorrect = selectedAnswer === round?.correctAnswer;
  const accuracy = Math.round((score / totalRounds) * 100);

  // Persist the session once per completion.
  useEffect(() => {
    if (gameComplete && user && !loggedRef.current) {
      loggedRef.current = true;
      logGameSession({
        userId: user.id,
        gameId: 'object-recognition',
        gameTitle: 'Object Recognition',
        accuracy,
        score,
      });
    }
    if (!gameComplete) loggedRef.current = false;
  }, [gameComplete, user, accuracy, score]);

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);

    const correct = answer === round.correctAnswer;
    if (correct) setScore(s => s + 1);

    setResults(prev => [...prev, {
      round: currentRound + 1,
      object: round.objectName,
      selected: answer,
      correct,
    }]);
  };

  const nextRound = () => {
    if (currentRound + 1 >= totalRounds) {
      setGameComplete(true);
    } else {
      setCurrentRound(r => r + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const resetGame = () => {
    setCurrentRound(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setGameComplete(false);
    setResults([]);
    setRounds(pickObjectRounds(roundSettings));
  };

  if (gameComplete) {
    return (
      <div className="object-recognition page animate-fade-in">
        <div className="modal-overlay" role="dialog" aria-label="Game complete">
          <div className="modal-content animate-scale-in">
            <Trophy size={48} className="game-trophy" />
            <h2>Great Job! 🎉</h2>
            <p>You completed the Object Recognition activity.</p>
            <CompanionCoach
              name={profile?.full_name}
              justFinished={{ accuracy, gameTitle: 'Object Recognition', score }}
              compact
            />

            <div className="game-results-grid">
              <div className="game-result-item">
                <span className="game-result-label">Score</span>
                <span className="game-result-value">{score}/{totalRounds}</span>
              </div>
              <div className="game-result-item">
                <span className="game-result-label">Accuracy</span>
                <span className="game-result-value">{accuracy}%</span>
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
      </div>
    );
  }

  return (
    <div className="object-recognition page animate-fade-in">
      {/* Header */}
      <div className="game-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2>Object Recognition <span className="badge badge-primary">{difficultyLabel}</span></h2>
        <button className="btn btn-ghost btn-sm" onClick={resetGame} aria-label="Restart">
          <RotateCcw size={18} />
        </button>
      </div>

      <GameCompanionNudge note={coachNote} />

      {/* Progress */}
      <div className="game-stats-bar">
        <div className="game-stat-item">
          <span className="game-stat-label">Question</span>
          <span className="game-stat-val">{currentRound + 1}/{totalRounds}</span>
        </div>
        <div className="game-stat-item">
          <span className="game-stat-label">Score</span>
          <span className="game-stat-val">{score}</span>
        </div>
      </div>

      {/* Object Display */}
      <div className="or-object-area">
        <span className="or-object-emoji" role="img" aria-label={round.objectName}>
          {round.object}
        </span>
        <h3 className="or-question">{round.objectLabel}</h3>
      </div>

      {/* Answer Options */}
      <div className="or-options">
        {round.options.map(option => {
          let optionClass = 'or-option';
          if (showFeedback) {
            if (option === round.correctAnswer) {
              optionClass += ' or-option-correct';
            } else if (option === selectedAnswer && !isCorrect) {
              optionClass += ' or-option-wrong';
            }
          }

          return (
            <button
              key={option}
              className={optionClass}
              onClick={() => handleAnswer(option)}
              disabled={showFeedback}
            >
              {showFeedback && option === round.correctAnswer && <CheckCircle size={20} />}
              {showFeedback && option === selectedAnswer && !isCorrect && option !== round.correctAnswer && <XCircle size={20} />}
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`or-feedback ${isCorrect ? 'or-feedback-correct' : 'or-feedback-wrong'}`}>
          {isCorrect ? (
            <p>✅ Correct! Well done!</p>
          ) : (
            <p>Good try! The correct answer is <strong>{round.correctAnswer}</strong>.</p>
          )}
          <button className="btn btn-primary" onClick={nextRound}>
            {currentRound + 1 >= totalRounds ? 'See Results' : 'Next Question →'}
          </button>
        </div>
      )}
    </div>
  );
}
