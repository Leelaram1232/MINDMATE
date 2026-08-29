import { useEffect, useState } from 'react';
import {
  getGameSessions,
  computeProgressSummary,
  computeWeeklyPerformance,
  computeMemoryTrend,
} from '../../lib/db';
import './CognitiveProgress.css';

// Average accuracy per week for the last 4 weeks.
function computeMonthlyAccuracy(sessions) {
  const weeks = [0, 1, 2, 3].map((w) => ({ week: `Week ${4 - w}`, accSum: 0, count: 0 }));
  const now = new Date();
  sessions.forEach((s) => {
    const days = Math.floor((now - new Date(s.created_at)) / (1000 * 60 * 60 * 24));
    const weekIdx = Math.floor(days / 7);
    if (weekIdx >= 0 && weekIdx < 4) {
      const bucket = weeks[3 - weekIdx];
      bucket.accSum += s.accuracy || 0;
      bucket.count += 1;
    }
  });
  return weeks.map((w) => ({ week: w.week, accuracy: w.count ? Math.round(w.accSum / w.count) : 0 }));
}

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

export default function CognitiveProgress({ selectedPatientId, activePatient }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const patientName = activePatient?.full_name?.trim() || 'this patient';

  useEffect(() => {
    if (!selectedPatientId) {
      setSessions([]);
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    getGameSessions(selectedPatientId).then((data) => {
      if (!active) return;
      setSessions(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [selectedPatientId]);

  const summary = computeProgressSummary(sessions);
  const weekly = computeWeeklyPerformance(sessions);
  const monthly = computeMonthlyAccuracy(sessions);
  const trend = computeMemoryTrend(sessions);

  if (!selectedPatientId) {
    return (
      <div className="cognitive-progress page animate-fade-in">
        <h1 className="page-title">Cognitive Progress</h1>
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No patient selected. Link a patient in the Patients tab first.
        </div>
      </div>
    );
  }

  return (
    <div className="cognitive-progress page animate-fade-in">
      <h1 className="page-title">Cognitive Progress</h1>
      <p className="page-subtitle">Detailed analytics for {patientName}.</p>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading progress…
        </div>
      ) : (
        <>
          <div className="card cp-section">
            <div className="cp-section-header">
              <h3>Memory Performance</h3>
              <span className="badge badge-primary">Weekly</span>
            </div>
            <LineChart data={weekly} dataKey="accuracy" label="Accuracy" color="#2F5D50" />
          </div>

          <div className="card cp-section">
            <div className="cp-section-header">
              <h3>Accuracy Trend</h3>
              <span className="badge badge-accent">Monthly</span>
            </div>
            <LineChart data={monthly} dataKey="accuracy" label="Accuracy" color="#C9785D" />
          </div>

          <div className="card cp-section">
            <div className="cp-section-header">
              <h3>Activity Frequency</h3>
              <span className="badge badge-primary">This Week</span>
            </div>
            <BarChart data={weekly} dataKey="games" label="Games" color="#7E9F8B" />
          </div>

          <div className="cp-summary">
            <div className="card stat-card">
              <span className="stat-label">Overall Trend</span>
              <span className="stat-value" style={{ color: 'var(--color-success)' }}>{trend}</span>
            </div>
            <div className="card stat-card">
              <span className="stat-label">Avg. Accuracy</span>
              <span className="stat-value">{summary.avgAccuracy}%</span>
            </div>
            <div className="card stat-card">
              <span className="stat-label">Total Sessions</span>
              <span className="stat-value">{summary.totalGames}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
