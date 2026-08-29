export default function CompanionAvatar({ mood = 'idle', size = 72 }) {
  return (
    <div
      className={`mate-avatar mate-mood-${mood}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <circle cx="40" cy="40" r="38" className="mate-skin" />
        <ellipse cx="40" cy="22" rx="18" ry="10" className="mate-leaf" />
        <circle cx="28" cy="38" r="7" className="mate-eye-white" />
        <circle cx="52" cy="38" r="7" className="mate-eye-white" />
        <circle cx="28" cy="39" r="3.2" className="mate-pupil" />
        <circle cx="52" cy="39" r="3.2" className="mate-pupil" />
        <path className="mate-mouth" d={mouthPath(mood)} />
        <circle cx="20" cy="48" r="4" className="mate-blush" />
        <circle cx="60" cy="48" r="4" className="mate-blush" />
      </svg>
    </div>
  );
}

function mouthPath(mood) {
  if (mood === 'proud' || mood === 'cheer') return 'M28 54 Q40 64 52 54';
  if (mood === 'gentle') return 'M32 56 Q40 60 48 56';
  return 'M30 55 Q40 61 50 55';
}
