import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx';
import MobileNav from './components/MobileNav.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

// Screens
import LoginScreen from './components/LoginScreen.jsx';
import SignUpScreen from './components/SignUpScreen.jsx';
import DeckListScreen from './components/DeckListScreen.jsx';
import DeckDetailScreen from './components/DeckDetailScreen.jsx';
import QuizScreen from './components/QuizScreen.jsx';
import StatsScreen from './components/StatsScreen.jsx';
import UserProfile from './components/UserProfile.jsx';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [quizSettings, setQuizSettings] = useState({ enableAudio: true, audioTiming: 'after' });

  // Manage Routing based on Auth State
  useEffect(() => {
    if (!loading) {
      if (!user && currentScreen !== 'signup') {
        setCurrentScreen('login');
      } else if (user && (currentScreen === 'login' || currentScreen === 'signup')) {
        setCurrentScreen('home');
      }
    }
  }, [user, loading, currentScreen]);

  const navigateTo = (screen, data = null) => {
    setCurrentScreen(screen);
    if (data) {
      if (data.deckId) setSelectedDeckId(data.deckId);
      if (data.quizSettings) setQuizSettings(data.quizSettings);
    }
    // เลื่อนหน้าจอกลับไปบนสุดเมื่อเปลี่ยนหน้า
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // --- Unauthenticated Routes ---
  if (!user) {
    return (
      <div className="max-w-md mx-auto md:max-w-2xl bg-gray-50 min-h-screen shadow-lg relative">
        {currentScreen === 'signup' 
          ? <SignUpScreen onBack={() => navigateTo('login')} />
          : <LoginScreen onSignUp={() => navigateTo('signup')} />
        }
      </div>
    );
  }

  // --- Authenticated Routes ---
  return (
    <div className="max-w-md mx-auto md:max-w-2xl bg-gray-50 min-h-screen shadow-[0_0_20px_rgba(0,0,0,0.05)] relative flex flex-col">
      <PWAInstallPrompt />
      
      {/* Content Area with padding for bottom nav */}
      <div className="flex-1 pb-[60px]">
        {currentScreen === 'home' && (
          <DeckListScreen onDeckSelect={(deckId) => navigateTo('deck-detail', { deckId })} />
        )}
        
        {currentScreen === 'deck-detail' && (
          <DeckDetailScreen 
            deckId={selectedDeckId} 
            onBack={() => navigateTo('home')} 
            onStartQuiz={(deckId, settings) => navigateTo('quiz', { deckId, quizSettings: settings })} 
          />
        )}
        
        {currentScreen === 'quiz' && (
          <QuizScreen 
            deckId={selectedDeckId} 
            settings={quizSettings}
            onBack={() => navigateTo('deck-detail', { deckId: selectedDeckId })} 
            onComplete={() => navigateTo('home')} // SummaryScreen is rendered inside QuizScreen
          />
        )}

        {currentScreen === 'stats' && <StatsScreen />}
        
        {currentScreen === 'profile' && <UserProfile />}
      </div>

      {/* Bottom Navigation */}
      {/* ซ่อน Bottom Nav เมื่ออยู่ในหน้า Quiz หรือกำลังดูรายละเอียด Deck (เพื่อให้โฟกัสกับเนื้อหา) */}
      {!['quiz'].includes(currentScreen) && (
        <MobileNav currentScreen={currentScreen} onNavigate={navigateTo} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
