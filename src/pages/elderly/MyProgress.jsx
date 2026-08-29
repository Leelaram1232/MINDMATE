import { PROGRESS_SUMMARY, WEEKLY_PERFORMANCE } from '../../data/mockData';
import './MyProgress.css';

function ProgressRing({ value, max = 100, size = 100, strokeWidth = 8, color = 'var(--color-primary)' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${value} of ${max}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border-light)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="progress-ring-label">{value}{max === 100 ? '%' : ''}</span>
    </div>
  );
}

function WeekBar({ data }) {
  const maxGames = Math.max(...data.map(d => d.games), 1);
  return (
    <div className="week-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="week-bar-col">
          <div className="week-bar-track">
            <div
              className="week-bar-fill"
              style={{
                height: `${(d.games / maxGames) * 100}%`,
                backgroundColor: d.games > 0 ? 'var(--color-primary)' : 'var(--color-border-light)',
              }}
            ></div>
          </div>
          <span className="week-bar-label">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function MyProgress() {
  const p = PROGRESS_SUMMARY;

  return (
    <div className="progress-page page animate-fade-in">
      <h1 className="page-title">My Progress</h1>
      <p className="page-subtitle">Keep up the great work! Here's how you've been doing.</p>

      {/* Summary Rings */}
      <div className="progress-rings">
        <div className="progress-ring-item">
          <ProgressRing value={p.avgAccuracy} />
          <span className="progress-ring-desc">Avg. Accuracy</span>
        </div>
        <div className="progress-ring-item">
          <ProgressRing value={p.activeDays} max={7} color="var(--color-accent)" />
          <span className="progress-ring-desc">Active Days</span>
        </div>
        <div className="progress-ring-item">
          <ProgressRing value={p.gamesThisWeek} max={10} color="var(--color-secondary)" />
          <span className="progress-ring-desc">Games Played</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="progress-stats grid-3">
        <div className="card stat-card">
          <span className="stat-label">Total Games</span>
          <span className="stat-value">{p.totalGames}</span>
          <span className="stat-subtitle">All time</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Best Accuracy</span>
          <span className="stat-value">{p.bestAccuracy}%</span>
          <span className="stat-subtitle">Personal best</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Favorite Game</span>
          <span className="stat-value" style={{ fontSize: 'var(--font-size-lg)' }}>{p.favoriteGame}</span>
          <span className="stat-subtitle">Most played</span>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="progress-weekly card">
        <h3>This Week's Activity</h3>
        <WeekBar data={WEEKLY_PERFORMANCE} />
      </div>

      {/* Streak */}
      <div className="progress-streak">
        <span className="progress-streak-icon">🔥</span>
        <div>
          <strong>{p.streak}-day streak!</strong>
          <p>You completed {p.gamesThisWeek} activities this week. Keep going!</p>
        </div>
      </div>
    </div>
  );
}
