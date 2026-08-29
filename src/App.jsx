import { useState } from 'react';

// Layout
import AppLayout from './components/layout/AppLayout';

// UI
import SplashScreen from './components/ui/SplashScreen';

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

import { PATIENTS } from './data/mockData';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [role, setRole] = useState('visitor'); // visitor, role-selection, elderly, caregiver
  const [view, setView] = useState('home'); // home, games, reminders, progress, voice, play-...
  const [selectedPatientId, setSelectedPatientId] = useState('p1'); // default to Ramesh Kumar

  const activePatient = PATIENTS.find(p => p.id === selectedPatientId) || PATIENTS[0];

  // Show Lottie splash on mount
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Global Navigation Coordinator
  const handleNavigate = (targetView) => {
    if (targetView === 'exit-role') {
      setRole('role-selection');
      setView('home');
      return;
    }
    setView(targetView);
  };

  // Render role-specific views
  const renderContent = () => {
    // ── Onboarding / Welcome Journey ──
    if (role === 'visitor') {
      return <WelcomeScreen onGetStarted={() => setRole('role-selection')} />;
    }

    if (role === 'role-selection') {
      return (
        <RoleSelection
          onSelectRole={(selectedRole) => {
            setRole(selectedRole);
            setView(selectedRole === 'elderly' ? 'home' : 'dashboard');
          }}
        />
      );
    }

    // ── Elderly Experience ──
    if (role === 'elderly') {
      switch (view) {
        case 'home':
          return <ElderlyHome onNavigate={handleNavigate} patientName={activePatient.name} />;
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
          return <ElderlyHome onNavigate={handleNavigate} patientName={activePatient.name} />;
      }
    }

    // ── Caregiver Experience ──
    if (role === 'caregiver') {
      switch (view) {
        case 'dashboard':
          return (
            <CaregiverDashboard
              onNavigate={handleNavigate}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
            />
          );
        case 'patients':
          return (
            <PatientManagement
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
            />
          );
        case 'patient-activity':
          return <PatientActivity selectedPatientId={selectedPatientId} />;
        case 'cognitive-progress':
          return <CognitiveProgress selectedPatientId={selectedPatientId} />;
        case 'reminder-monitoring':
          return <ReminderMonitoring selectedPatientId={selectedPatientId} />;
        case 'settings':
          return (
            <div className="page animate-fade-in">
              <h1 className="page-title">Settings</h1>
              <p className="page-subtitle">Configure application settings and notifications.</p>
              <div className="card">
                <h3>Prototype Settings</h3>
                <p style={{ marginTop: 'var(--space-sm)' }}>
                  This is a local UI prototype. Supabase database tables and real-time syncing settings can be configured in Phase 2.
                </p>
              </div>
            </div>
          );
        default:
          return (
            <CaregiverDashboard
              onNavigate={handleNavigate}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
            />
          );
      }
    }

    return <WelcomeScreen onGetStarted={() => setRole('role-selection')} />;
  };

  return (
    <AppLayout role={role} currentView={view} onNavigate={handleNavigate}>
      {renderContent()}
    </AppLayout>
  );
}
