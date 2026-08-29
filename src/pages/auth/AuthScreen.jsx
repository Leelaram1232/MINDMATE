import { useState } from 'react';
import { Mail, Lock, User, Heart, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { isValidPhone, normalizePhone } from '../../lib/phone';
import './AuthScreen.css';

const MODES = { LOGIN: 'login', SIGNUP: 'signup' };

// Turn Supabase's terse error strings into friendly, actionable guidance.
function friendlyError(message = '') {
  const m = message.toLowerCase();
  if (m.includes('email not confirmed')) {
    return 'Your email is not confirmed yet. Check your inbox for the confirmation link, or resend it below.';
  }
  if (m.includes('invalid login credentials')) {
    return 'Incorrect email or password. If you just signed up, you may need to confirm your email first.';
  }
  if (m.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  return message || 'Something went wrong. Please try again.';
}

export default function AuthScreen({ initialMode = MODES.LOGIN, onBack }) {
  const { signIn, signUp, resendConfirmation, isConfigured } = useAuth();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState('elderly');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const isSignup = mode === MODES.SIGNUP;

  const resetMessages = () => {
    setError('');
    setNotice('');
    setNeedsConfirm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!isConfigured) {
      setError(t('auth.needKeys'));
      return;
    }
    if (isSignup && !fullName.trim()) {
      setError(t('auth.needName'));
      return;
    }
    if (!email.trim() || !password) {
      setError(t('auth.needEmail'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.needPassword'));
      return;
    }
    if (isSignup && role === 'caregiver' && !isValidPhone(phone)) {
      setError(t('auth.needPhone'));
      return;
    }

    setSubmitting(true);
    try {
      if (isSignup) {
        const { data, error: signUpError } = await signUp({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          role,
          phone: role === 'caregiver' ? normalizePhone(phone) : '',
          language,
        });
        if (signUpError) {
          setError(friendlyError(signUpError.message));
        } else if (data?.user && !data.session) {
          setNotice('Account created. Please check your email to confirm your account, then sign in.');
          setMode(MODES.LOGIN);
        }
        // If a session is returned, the auth listener will navigate automatically.
      } else {
        const { error: signInError } = await signIn({ email: email.trim(), password });
        if (signInError) {
          setError(friendlyError(signInError.message));
          if (signInError.message?.toLowerCase().includes('email not confirmed')) {
            setNeedsConfirm(true);
          }
        }
        // On success the auth listener handles the transition.
      }
    } catch (err) {
      setError(friendlyError(err?.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    resetMessages();
    setSubmitting(true);
    const { error: resendError } = await resendConfirmation(email.trim());
    if (resendError) {
      setError(friendlyError(resendError.message));
    } else {
      setNotice('Confirmation email sent. Please check your inbox (and spam folder).');
    }
    setSubmitting(false);
  };

  const switchMode = (nextMode) => {
    resetMessages();
    setMode(nextMode);
  };

  return (
    <div className="auth-screen animate-fade-in">
      <div className="auth-card card">
        <div className="auth-header">
          <span className="auth-logo" role="img" aria-label="Brain">🧠</span>
          <h1 className="auth-title">
            {isSignup ? t('auth.createTitle') : t('auth.welcomeTitle')}
          </h1>
          <p className="auth-subtitle">
            {isSignup ? t('auth.createSub') : t('auth.welcomeSub')}
          </p>
        </div>

        {/* Role picker (signup only) */}
        {isSignup && (
          <div className="auth-role-toggle" role="group" aria-label="Choose account type">
            <button
              type="button"
              className={`auth-role-btn ${role === 'elderly' ? 'is-active' : ''}`}
              onClick={() => setRole('elderly')}
              aria-pressed={role === 'elderly'}
            >
              <User size={20} />
              <span>{t('auth.roleElderly')}</span>
            </button>
            <button
              type="button"
              className={`auth-role-btn ${role === 'caregiver' ? 'is-active' : ''}`}
              onClick={() => setRole('caregiver')}
              aria-pressed={role === 'caregiver'}
            >
              <Heart size={20} />
              <span>{t('auth.roleCaregiver')}</span>
            </button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <label className="auth-field">
              <span className="auth-label">{t('auth.fullName')}</span>
              <span className="auth-input-wrap">
                <User size={18} className="auth-input-icon" />
                <input
                  type="text"
                  className="auth-input"
                  placeholder={t('auth.namePh')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </span>
            </label>
          )}

          {isSignup && role === 'caregiver' && (
            <label className="auth-field">
              <span className="auth-label">{t('auth.phone')}</span>
              <span className="auth-input-wrap">
                <Phone size={18} className="auth-input-icon" />
                <input
                  type="tel"
                  className="auth-input"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </span>
            </label>
          )}

          <label className="auth-field">
              <span className="auth-label">{t('auth.email')}</span>
            <span className="auth-input-wrap">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </span>
          </label>

          <label className="auth-field">
              <span className="auth-label">{t('auth.password')}</span>
            <span className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder={isSignup ? t('auth.passwordNew') : t('auth.passwordPh')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          {needsConfirm && (
            <button
              type="button"
              className="auth-link-btn auth-resend-btn"
              onClick={handleResend}
              disabled={submitting}
            >
              {t('auth.resend')}
            </button>
          )}
          {notice && (
            <div className="auth-alert auth-alert-success" role="status">
              <CheckCircle2 size={18} />
              <span>{notice}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={submitting}>
            {submitting ? t('common.pleaseWait') : isSignup ? t('auth.create') : t('auth.signIn')}
            {!submitting && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
          <button
            type="button"
            className="auth-link-btn"
            onClick={() => switchMode(isSignup ? MODES.LOGIN : MODES.SIGNUP)}
          >
            {isSignup ? t('auth.signIn') : t('auth.createOne')}
          </button>
        </p>

        {onBack && (
          <button type="button" className="auth-back-btn" onClick={onBack}>
            ← {t('common.back')}
          </button>
        )}
      </div>
    </div>
  );
}
