import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import './ThemeToggle.css';

export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${compact ? 'is-icon' : ''}`}
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
      title={isDark ? t('theme.toLight') : t('theme.toDark')}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
      {!compact && <span className="theme-toggle-label">{isDark ? t('theme.light') : t('theme.dark')}</span>}
    </button>
  );
}
