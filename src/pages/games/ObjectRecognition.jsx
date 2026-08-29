import { useState } from 'react';
import { ArrowLeft, RotateCcw, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { OBJECT_RECOGNITION_ROUNDS } from '../../data/mockData';
import './ObjectRecognition.css';

export default function ObjectRecognition({ onBack, onBackToGames }) {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [results, setResults] = useState([]);

  const round = OBJECT_RECOGNITION_ROUNDS[currentRound];
  const totalRounds = OBJECT_RECOGNITION_ROUNDS.length;
  const isCorrect = selectedAnswer === round?.correctAnswer;

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
  };

  const accuracy = Math.round((score / totalRounds) * 100);

  if (gameComplete) {
    return (
      <div className="object-recognition page animate-fade-in">
        <div className="modal-overlay" role="dialog" aria-label="Game complete">
          <div className="modal-content animate-scale-in">
            <Trophy size={48} className="game-trophy" />
            <h2>Great Job! 🎉</h2>
            <p>You completed the Object Recognition activity.</p>

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
        <h2>Object Recognition</h2>
        <button className="btn btn-ghost btn-sm" onClick={resetGame} aria-label="Restart">
          <RotateCcw size={18} />
        </button>
      </div>

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
