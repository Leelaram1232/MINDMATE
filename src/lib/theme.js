import { Capacitor, registerPlugin } from '@capacitor/core';

export const THEMES = ['light', 'dark'];
const STORAGE_KEY = 'mindmate-theme';

const ThemeSync = registerPlugin('ThemeSync');

export const THEME_COLORS = {
  light: {
    background: '#F7F5F0',
    surface: '#FFFFFF',
    primary: '#2F5D50',
  },
  dark: {
    background: '#141916',
    surface: '#1C2320',
    primary: '#1A2A24',
  },
};

export function readStoredTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (THEMES.includes(stored)) return stored;
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function applyTheme(theme) {
  const next = THEMES.includes(theme) ? theme : 'light';
  if (typeof document === 'undefined') return next;
  document.documentElement.setAttribute('data-theme', next);
  document.documentElement.style.colorScheme = next;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[next].background);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, next);
  }
  syncAndroidTheme(next);
  return next;
}

export async function syncAndroidTheme(theme) {
  if (!Capacitor.isNativePlatform()) return;
  const colors = THEME_COLORS[theme] || THEME_COLORS.light;
  try {
    await ThemeSync.apply({
      mode: theme,
      background: colors.background,
      surface: colors.surface,
    });
  } catch (error) {
    console.warn('[theme] Android sync failed:', error);
  }
}
