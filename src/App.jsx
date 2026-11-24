import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Room from './components/Room';
import Snowfall from './components/Snowfall';
import WelcomeModal from './components/WelcomeModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInRoom, setIsInRoom] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('movie-room-theme') || 'default';
  });
  const [cookies, setCookies] = useState(() => {
    const saved = localStorage.getItem('movie-room-cookies');
    return saved !== null ? Number(saved) : 10;
  });

  useEffect(() => {
    localStorage.setItem('movie-room-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('movie-room-cookies', String(cookies));
  }, [cookies]);

  const handleEarnCookies = useCallback((amount) => {
    setCookies((prev) => prev + amount);
  }, []);

  const handleSpendCookies = useCallback((amount) => {
    let success = false;
    setCookies((prev) => {
      if (prev < amount) return prev;
      success = true;
      return prev - amount;
    });
    return success;
  }, []);

  const loadUserProfile = async (authUser) => {
    if (!authUser) {
      setCurrentUser(null);
      setShowWelcome(false);
      setLoadingSession(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    const loadedUser = {
      id: authUser.id,
      email: authUser.email,
      name: profile?.username || authUser.email.split('@')[0],
      avatar: profile?.avatar_url || null,
    };

    setCurrentUser(loadedUser);

    const welcomeKey = `movie-room-welcomed-${authUser.id}`;
    if (!localStorage.getItem(welcomeKey)) {
      setShowWelcome(true);
    }

    setLoadingSession(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserProfile(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserProfile(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCloseWelcome = () => {
    if (currentUser?.id) {
      localStorage.setItem(`movie-room-welcomed-${currentUser.id}`, 'true');
    }
    setShowWelcome(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsInRoom(false);
    setShowWelcome(false);
  };

  const isChristmas = theme === 'christmas';

  if (loadingSession) {
    return (
      <div
        className={`min-h-screen text-white flex items-center justify-center relative ${
          isChristmas ? 'christmas-theme-bg' : 'bg-slate-950'
        }`}
      >
        {isChristmas && <Snowfall />}
        <Loader2 className="w-9 h-9 animate-spin text-indigo-400" strokeWidth={2.2} />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div
        className={
          isChristmas ? 'christmas-theme-bg min-h-screen relative' : 'min-h-screen bg-slate-950 relative'
        }
      >
        {isChristmas && <Snowfall />}
        <Auth onLoginSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  return (
    <>
      {showWelcome && (
        <WelcomeModal user={currentUser} theme={theme} onClose={handleCloseWelcome} />
      )}

      {!isInRoom ? (
        <Dashboard
          user={currentUser}
          theme={theme}
          setTheme={setTheme}
          cookies={cookies}
          onSpendCookies={handleSpendCookies}
          onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
          onEnterRoom={() => setIsInRoom(true)}
          onLogout={handleLogout}
        />
      ) : (
        <Room
          user={currentUser}
          theme={theme}
          setTheme={setTheme}
          cookies={cookies}
          onEarnCookies={handleEarnCookies}
          onLeave={() => setIsInRoom(false)}
        />
      )}
    </>
  );
}