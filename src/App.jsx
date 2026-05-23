import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx';
import MobileNav from './components/MobileNav.jsx';

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
  const { isDarkMode } = useTheme();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [quizSettings, setQuizSettings] = useState({ enableAudio: true, audioTiming: 'after', playMode: 'standard', timeLimit: 5 });

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
      <div className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // --- Unauthenticated Routes ---
  if (!user) {
    return (
      <div className={`max-w-md mx-auto md:max-w-2xl min-h-screen shadow-2xl relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100 shadow-none border-x border-slate-900' : 'bg-white text-slate-900 shadow-slate-200'}`}>
        {currentScreen === 'signup' 
          ? <SignUpScreen onBack={() => navigateTo('login')} />
          : <LoginScreen onSignUp={() => navigateTo('signup')} />
        }
      </div>
    );
  }

  // --- Authenticated Routes ---
  return (
    <div className={`max-w-md mx-auto md:max-w-2xl min-h-screen shadow-2xl relative flex flex-col overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100 shadow-none border-x border-slate-900' : 'bg-[#fafafa] text-slate-900 shadow-slate-200 border-x border-slate-100/50'}`}>
      <PWAInstallPrompt />
      
      {/* Content Area with padding for bottom nav */}
      <div className="flex-1 pb-[60px]">
        {currentScreen === 'home' && (
          <DeckListScreen 
            onDeckSelect={(deckId) => navigateTo('deck-detail', { deckId })} 
            onStartQuiz={(deckId, settings) => navigateTo('quiz', { deckId, quizSettings: settings })}
          />
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
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
