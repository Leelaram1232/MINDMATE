import { User, Heart, Stethoscope, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './RoleSelection.css';

export default function RoleSelection({ onSelectRole }) {
  const { t } = useLanguage();
  const roles = [
    {
      id: 'elderly',
      title: t('role.elderly'),
      description: t('role.elderlyDesc'),
      icon: '👤',
      lucideIcon: User,
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
    },
    {
      id: 'caregiver',
      title: t('role.caregiver'),
      description: t('role.caregiverDesc'),
      icon: '💚',
      lucideIcon: Heart,
      color: 'var(--color-accent)',
      bgColor: 'var(--color-accent-lighter)',
    },
    {
      id: 'healthcare',
      title: t('role.health'),
      description: t('role.healthDesc'),
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
          <h1>{t('role.title')}</h1>
          <p>{t('role.sub')}</p>
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
                <span className="badge badge-primary" style={{ marginTop: 'var(--space-sm)' }}>{t('role.soon')}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
