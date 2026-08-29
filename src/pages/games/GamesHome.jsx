import { ArrowRight, Clock } from 'lucide-react';
import { GAMES_LIST } from '../../data/mockData';
import './GamesHome.css';

export default function GamesHome({ onSelectGame }) {
  return (
    <div className="games-home page animate-fade-in">
      <h1 className="page-title">Cognitive Activities</h1>
      <p className="page-subtitle">Choose an activity to keep your mind active and engaged.</p>

      <div className="games-grid">
        {GAMES_LIST.map(game => (
          <button
            key={game.id}
            className="game-card card card-interactive"
            onClick={() => onSelectGame(game.id)}
            aria-label={`Play ${game.title}`}
          >
            <div className="game-card-header">
              <span className="game-card-icon">{game.icon}</span>
              <span className="badge badge-primary">{game.difficulty}</span>
            </div>

            <h3 className="game-card-title">{game.title}</h3>
            <p className="game-card-desc">{game.description}</p>

            <div className="game-card-meta">
              <div className="game-card-skills">
                {game.skills.map(skill => (
                  <span key={skill} className="game-skill-tag">{skill}</span>
                ))}
              </div>
              <span className="game-card-time">
                <Clock size={14} /> {game.estimatedTime}
              </span>
            </div>

            <div className="game-card-play">
              <span>Play Now</span>
              <ArrowRight size={16} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
