import { PATIENTS, WEEKLY_PERFORMANCE, MONTHLY_ACCURACY } from '../../data/mockData';
import './CognitiveProgress.css';

function LineChart({ data, dataKey, label, color = 'var(--color-primary)' }) {
  const maxVal = Math.max(...data.map(d => d[dataKey]), 1);
  const width = 500;
  const height = 200;
  const padding = 40;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartW;
    const y = padding + chartH - (d[dataKey] / maxVal) * chartH;
    return { x, y, value: d[dataKey] };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding + chartH} L ${points[0].x} ${padding + chartH} Z`;

  return (
    <div className="cp-chart-wrapper">
      <svg viewBox={`0 0 ${width} ${height}`} className="cp-chart-svg">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => {
          const y = padding + chartH - (pct / 100) * chartH;
          return (
            <g key={pct}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--color-border-light)" strokeWidth="1" />
              <text x={padding - 8} y={y + 4} textAnchor="end" fill="var(--color-text-light)" fontSize="11">
                {Math.round((pct / 100) * maxVal)}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * chartW;
          return (
            <text key={i} x={x} y={height - 8} textAnchor="middle" fill="var(--color-text-muted)" fontSize="11">
              {d.day || d.week}
            </text>
          );
        })}

        {/* Area */}
        <path d={areaPath} fill={color} opacity="0.08" />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--color-bg-card)" stroke={color} strokeWidth="2.5" />
            {p.value > 0 && (
              <text x={p.x} y={p.y - 12} textAnchor="middle" fill={color} fontSize="11" fontWeight="600">
                {p.value}%
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function BarChart({ data, dataKey, label, color = 'var(--color-accent)' }) {
  const maxVal = Math.max(...data.map(d => d[dataKey]), 1);

  return (
    <div className="cp-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="cp-bar-item">
          <span className="cp-bar-val">{d[dataKey]}</span>
          <div className="cp-bar-track">
            <div
              className="cp-bar-fill"
              style={{
                height: `${(d[dataKey] / maxVal) * 100}%`,
                backgroundColor: d[dataKey] > 0 ? color : 'var(--color-border-light)',
              }}
            ></div>
          </div>
          <span className="cp-bar-label">{d.day || d.week}</span>
        </div>
      ))}
    </div>
  );
}

export default function CognitiveProgress({ selectedPatientId }) {
  const patient = PATIENTS.find(p => p.id === selectedPatientId) || PATIENTS[0];

  return (
    <div className="cognitive-progress page animate-fade-in">
      <h1 className="page-title">Cognitive Progress</h1>
      <p className="page-subtitle">Detailed analytics for {patient.name}.</p>

      {/* Memory Performance */}
      <div className="card cp-section">
        <div className="cp-section-header">
          <h3>Memory Performance</h3>
          <span className="badge badge-primary">Weekly</span>
        </div>
        <LineChart data={WEEKLY_PERFORMANCE} dataKey="accuracy" label="Accuracy" color="#2F5D50" />
      </div>

      {/* Accuracy Trend */}
      <div className="card cp-section">
        <div className="cp-section-header">
          <h3>Accuracy Trend</h3>
          <span className="badge badge-accent">Monthly</span>
        </div>
        <LineChart data={MONTHLY_ACCURACY} dataKey="accuracy" label="Accuracy" color="#C9785D" />
      </div>

      {/* Activity Frequency */}
      <div className="card cp-section">
        <div className="cp-section-header">
          <h3>Activity Frequency</h3>
          <span className="badge badge-primary">This Week</span>
        </div>
        <BarChart data={WEEKLY_PERFORMANCE} dataKey="games" label="Games" color="#7E9F8B" />
      </div>

      {/* Summary */}
      <div className="cp-summary">
        <div className="card stat-card">
          <span className="stat-label">Overall Trend</span>
          <span className="stat-value" style={{ color: 'var(--color-success)' }}>↗ {patient.memoryTrend}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Avg. Accuracy</span>
          <span className="stat-value">{patient.avgAccuracy}%</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Total Sessions</span>
          <span className="stat-value">{patient.gamesCompleted}</span>
        </div>
      </div>
    </div>
  );
}
