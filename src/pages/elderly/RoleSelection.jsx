import { User, Heart, Stethoscope, ArrowRight } from 'lucide-react';
import './RoleSelection.css';

export default function RoleSelection({ onSelectRole }) {
  const roles = [
    {
      id: 'elderly',
      title: 'I am using MindMate',
      description: 'Play games, get reminders, and track your daily wellness activities.',
      icon: '👤',
      lucideIcon: User,
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
    },
    {
      id: 'caregiver',
      title: 'I am a Caregiver',
      description: 'Monitor progress, manage reminders, and stay connected with your loved one.',
      icon: '💚',
      lucideIcon: Heart,
      color: 'var(--color-accent)',
      bgColor: 'var(--color-accent-lighter)',
    },
    {
      id: 'healthcare',
      title: 'Healthcare Worker',
      description: 'View patient reports and cognitive health summaries.',
      icon: '🩺',
      lucideIcon: Stethoscope,
      color: 'var(--color-secondary)',
      bgColor: 'var(--color-primary-lighter)',
      disabled: true,
    },
  ];

  return (
    <div className="role-screen animate-fade-in">
      <div className="role-screen-inner">
        <div className="role-header">
          <span className="role-logo">🧠</span>
          <h1>Welcome to MINDMATE</h1>
          <p>Choose how you would like to use the app today.</p>
        </div>

        <div className="role-cards">
          {roles.map(role => (
            <button
              key={role.id}
              className={`role-card card card-interactive ${role.disabled ? 'role-card-disabled' : ''}`}
              onClick={() => !role.disabled && onSelectRole(role.id)}
              disabled={role.disabled}
              aria-label={role.title}
            >
              <div className="role-card-icon" style={{ backgroundColor: role.bgColor, color: role.color }}>
                <span className="role-card-emoji">{role.icon}</span>
              </div>
              <div className="role-card-body">
                <h3>{role.title}</h3>
                <p>{role.description}</p>
              </div>
              {!role.disabled && (
                <div className="role-card-arrow" style={{ color: role.color }}>
                  <ArrowRight size={20} />
                </div>
              )}
              {role.disabled && (
                <span className="badge badge-primary" style={{ marginTop: 'var(--space-sm)' }}>Coming Soon</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
