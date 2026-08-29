import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from './context/AuthContext';
import { getLinkedElderly } from './lib/db';

// Layout
import AppLayout from './components/layout/AppLayout';

// UI
import SplashScreen from './components/ui/SplashScreen';

// Auth
import AuthScreen from './pages/auth/AuthScreen';

// Elderly Pages
import WelcomeScreen from './pages/elderly/WelcomeScreen';
import RoleSelection from './pages/elderly/RoleSelection';
import ElderlyHome from './pages/elderly/ElderlyHome';
import RemindersScreen from './pages/elderly/RemindersScreen';
import VoiceAssistance from './pages/elderly/VoiceAssistance';
import MyProgress from './pages/elderly/MyProgress';

// Games
import GamesHome from './pages/games/GamesHome';
import MemoryMatch from './pages/games/MemoryMatch';
import PatternRecall from './pages/games/PatternRecall';
import ObjectRecognition from './pages/games/ObjectRecognition';

// Caregiver Pages
import CaregiverDashboard from './pages/caregiver/CaregiverDashboard';
import PatientActivity from './pages/caregiver/PatientActivity';
import CognitiveProgress from './pages/caregiver/CognitiveProgress';
import ReminderMonitoring from './pages/caregiver/ReminderMonitoring';
import PatientManagement from './pages/caregiver/PatientManagement';
import CaregiverSettings from './pages/caregiver/CaregiverSettings';

export default function App() {
  const {
    isAuthenticated,
    isConfigured,
    user,
    role: profileRole,
    roleConfirmed,
    profile,
    loading: authLoading,
    updateRole,
    signOut,
  } = useAuth();

  const [showSplash, setShowSplash] = useState(true);
  // Onboarding step for signed-out users: 'welcome' | 'auth'
  const [onboardStep, setOnboardStep] = useState('welcome');
  // Preview role — only used when Supabase is NOT configured yet, so the
  // prototype remains explorable during setup.
  const [previewRole, setPreviewRole] = useState(null);
  const [view, setView] = useState('home');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [linkedPatients, setLinkedPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  // The role that drives the app: real profile role when logged in,
  // otherwise the preview role during setup.
  const effectiveRole = isAuthenticated ? profileRole : previewRole;

  const elderlyName = profile?.full_name?.trim() || 'Friend';
  const activePatient = linkedPatients.find((p) => p.id === selectedPatientId) || null;

  // Load the caregiver's linked elderly users.
  const loadPatients = useCallback(async () => {
    if (!isAuthenticated || profileRole !== 'caregiver' || !user) return;
    setPatientsLoading(true);
    const list = await getLinkedElderly(user.id);
    setLinkedPatients(list);
    setPatientsLoading(false);
    setSelectedPatientId((prev) =>
      prev && list.some((p) => p.id === prev) ? prev : list[0]?.id ?? null
    );
  }, [isAuthenticated, profileRole, user]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // When a role first becomes active, land on its default landing view so the
  // navigation highlights the correct tab (caregiver → dashboard, elderly → home).
  const prevRoleRef = useRef(null);
  useEffect(() => {
    if (effectiveRole && effectiveRole !== prevRoleRef.current) {
      setView(effectiveRole === 'caregiver' ? 'dashboard' : 'home');
    }
    prevRoleRef.current = effectiveRole;
  }, [effectiveRole]);

  // ── Splash on mount ──
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // ── Restoring a persisted session ──
  if (authLoading) {
    return <FullScreenLoader message="Loading MINDMATE…" />;
  }

  // ── Global Navigation Coordinator ──
  const handleNavigate = async (targetView) => {
    if (targetView === 'exit-role') {
      if (isAuthenticated) {
        await signOut();
      }
      setPreviewRole(null);
      setOnboardStep('welcome');
      setView('home');
      return;
    }
    setView(targetView);
  };

  // ── Signed-out onboarding flow ──
  // Only for users who are NOT authenticated and haven't picked a preview
  // role. Authenticated users are handled by the loader / role-picker / app
  // render below (this avoids a flash of the Welcome screen right after login
  // while the profile is still loading).
  if (!isAuthenticated && !previewRole) {
    if (onboardStep === 'welcome') {
      return (
        <AppLayout role={null} currentView={view} onNavigate={handleNavigate}>
          <WelcomeScreen onGetStarted={() => setOnboardStep('auth')} />
        </AppLayout>
      );
    }

    // 'auth' step — real login/signup when configured, otherwise a
    // role-selection preview so the app can still be demoed.
    if (isConfigured) {
      return (
        <AppLayout role={null} currentView={view} onNavigate={handleNavigate}>
          <AuthScreen onBack={() => setOnboardStep('welcome')} />
        </AppLayout>
      );
    }

    return (
      <AppLayout role={null} currentView={view} onNavigate={handleNavigate}>
        <RoleSelection
          onSelectRole={(selectedRole) => {
            setPreviewRole(selectedRole);
            setView(selectedRole === 'elderly' ? 'home' : 'dashboard');
          }}
        />
      </AppLayout>
    );
  }

  // ── Authenticated but profile role not resolved yet ──
  if (isAuthenticated && !profile) {
    return <FullScreenLoader message="Setting up your account…" />;
  }

  // ── Users whose role is not confirmed yet pick it once ──
  if (isAuthenticated && profile && !roleConfirmed) {
    return (
      <AppLayout role={null} currentView={view} onNavigate={handleNavigate}>
        <RoleSelection
          onSelectRole={async (selectedRole) => {
            await updateRole(selectedRole);
            setView(selectedRole === 'elderly' ? 'home' : 'dashboard');
          }}
        />
      </AppLayout>
    );
  }

  // ── Render role-specific views ──
  const renderContent = () => {
    if (effectiveRole === 'elderly') {
      switch (view) {
        case 'home':
          return <ElderlyHome onNavigate={handleNavigate} patientName={elderlyName} />;
        case 'games':
          return (
            <GamesHome
              onSelectGame={(gameId) => {
                if (gameId === 'memory-match') setView('play-memory-match');
                if (gameId === 'pattern-recall') setView('play-pattern-recall');
                if (gameId === 'object-recognition') setView('play-object-recognition');
              }}
            />
          );
        case 'reminders':
          return <RemindersScreen />;
        case 'progress':
          return <MyProgress />;
        case 'voice':
          return <VoiceAssistance onNavigate={handleNavigate} />;
        case 'play-memory-match':
          return (
            <MemoryMatch
              onBack={() => setView('games')}
              onBackToGames={() => setView('games')}
            />
          );
        case 'play-pattern-recall':
          return (
            <PatternRecall
              onBack={() => setView('games')}
              onBackToGames={() => setView('games')}
            />
          );
        case 'play-object-recognition':
          return (
            <ObjectRecognition
              onBack={() => setView('games')}
              onBackToGames={() => setView('games')}
            />
          );
        default:
          return <ElderlyHome onNavigate={handleNavigate} patientName={elderlyName} />;
      }
    }

    if (effectiveRole === 'caregiver') {
      switch (view) {
        case 'dashboard':
          return (
            <CaregiverDashboard
              onNavigate={handleNavigate}
              patients={linkedPatients}
              patientsLoading={patientsLoading}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
              activePatient={activePatient}
            />
          );
        case 'patients':
          return (
            <PatientManagement
              patients={linkedPatients}
              patientsLoading={patientsLoading}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
              onRefreshPatients={loadPatients}
            />
          );
        case 'patient-activity':
          return <PatientActivity selectedPatientId={selectedPatientId} activePatient={activePatient} />;
        case 'cognitive-progress':
          return <CognitiveProgress selectedPatientId={selectedPatientId} activePatient={activePatient} />;
        case 'reminder-monitoring':
          return <ReminderMonitoring selectedPatientId={selectedPatientId} activePatient={activePatient} />;
        case 'settings':
          return <CaregiverSettings />;
        default:
          return (
            <CaregiverDashboard
              onNavigate={handleNavigate}
              patients={linkedPatients}
              patientsLoading={patientsLoading}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
              activePatient={activePatient}
            />
          );
      }
    }

    return null;
  };

  // Default the view sensibly when a role first becomes active.
  const defaultViewForRole = effectiveRole === 'caregiver' ? 'dashboard' : 'home';
  const safeView = view || defaultViewForRole;

  return (
    <AppLayout role={effectiveRole} currentView={safeView} onNavigate={handleNavigate}>
      {renderContent()}
    </AppLayout>
  );
}

function FullScreenLoader({ message }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-md)',
        backgroundColor: 'var(--color-bg-main)',
      }}
    >
      <span style={{ fontSize: '2.5rem' }} role="img" aria-label="Brain">🧠</span>
      <p style={{ color: 'var(--color-text-muted)' }}>{message}</p>
    </div>
  );
}
