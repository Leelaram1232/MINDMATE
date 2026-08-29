import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  LANGUAGES,
  LANG_CODES,
  readStoredLanguage,
  setActiveLanguage,
  t as translate,
  getLanguageMeta,
} from '../lib/i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { profile, isAuthenticated, updateProfile } = useAuth();
  const [language, setLanguageState] = useState(() => readStoredLanguage());

  useEffect(() => {
    setActiveLanguage(language);
  }, [language]);

  useEffect(() => {
    if (profile?.language && LANG_CODES.includes(profile.language) && profile.language !== language) {
      setLanguageState(profile.language);
      setActiveLanguage(profile.language);
    }
  }, [profile?.language]);

  const setLanguage = useCallback(async (code) => {
    const next = setActiveLanguage(code);
    setLanguageState(next);
    if (isAuthenticated) {
      const { error } = await updateProfile({ language: next });
      if (error) console.warn('[MindMate] Could not save language:', error.message);
    }
    return next;
  }, [isAuthenticated, updateProfile]);

  const t = useCallback((key, vars) => translate(key, vars, language), [language]);

  return (
    <LanguageContext.Provider value={{ language, locale: getLanguageMeta(language).locale, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a <LanguageProvider>');
  return ctx;
}
