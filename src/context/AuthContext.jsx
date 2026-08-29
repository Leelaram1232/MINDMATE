import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { getActiveLanguage } from '../lib/i18n';

const AuthContext = createContext(null);

/**
 * AuthProvider owns all authentication state for the app:
 *  - the current Supabase session + user
 *  - the user's profile row (which carries their role)
 *  - loading state while we restore a persisted session on boot
 * It exposes helper methods for sign up / sign in / sign out.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the profile row (role, name, ...) for a given user id.
  const loadProfile = useCallback(async (userId) => {
    if (!supabase || !userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.warn('[MindMate] Could not load profile:', error.message);
      return null;
    }
    return data;
  }, []);

  useEffect(() => {
    // If Supabase isn't configured we skip auth entirely and stop loading.
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    // Restore any persisted session on first load.
    supabase.auth.getSession().then(async ({ data: { session: existing } }) => {
      if (!active) return;
      setSession(existing);
      if (existing?.user) {
        setProfile(await loadProfile(existing.user.id));
      }
      setLoading(false);
    });

    // React to future auth changes (login, logout, token refresh).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (newSession?.user) {
        setProfile(await loadProfile(newSession.user.id));
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [loadProfile]);

  // ---- Auth actions -------------------------------------------------

  const signUp = useCallback(async ({ email, password, fullName, role, phone, language }) => {
    if (!supabase) return { error: notConfiguredError() };
    const preferred = language || getActiveLanguage();
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role, phone: phone || '', language: preferred },
        emailRedirectTo: window.location.origin,
      },
    });
    if (!result.error && result.data?.user) {
      await supabase.from('profiles').upsert({
        id: result.data.user.id,
        full_name: fullName,
        role,
        role_confirmed: true,
        phone: phone || null,
        language: preferred,
      });
    }
    return result;
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) return { error: notConfiguredError() };
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  const resendConfirmation = useCallback(async (email) => {
    if (!supabase) return { error: notConfiguredError() };
    return supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: window.location.origin },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return { error: notConfiguredError() };
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setSession(null);
      setProfile(null);
    }
    return { error };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      setProfile(await loadProfile(session.user.id));
    }
  }, [session, loadProfile]);

  // Used by the post-OAuth role picker: set the user's role and mark it
  // confirmed so they aren't asked again.
  const updateRole = useCallback(async (role) => {
    if (!supabase || !session?.user) return { error: notConfiguredError() };
    const { error } = await supabase
      .from('profiles')
      .update({ role, role_confirmed: true })
      .eq('id', session.user.id);
    if (!error) {
      setProfile(await loadProfile(session.user.id));
    }
    return { error };
  }, [session, loadProfile]);

  const updateProfile = useCallback(async (patch) => {
    if (!supabase || !session?.user) return { error: notConfiguredError() };
    const { error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', session.user.id);
    if (!error) {
      setProfile(await loadProfile(session.user.id));
    }
    return { error };
  }, [session, loadProfile]);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    roleConfirmed: profile?.role_confirmed ?? false,
    isAuthenticated: Boolean(session?.user),
    isConfigured: isSupabaseConfigured,
    loading,
    signUp,
    signIn,
    resendConfirmation,
    updateRole,
    updateProfile,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function notConfiguredError() {
  return {
    message:
      'Supabase is not configured yet. Add your VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY to the .env file.',
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
