import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Room from './components/Room';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInRoom, setIsInRoom] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  // Функція завантаження даних профілю з таблиці profiles
  const loadUserProfile = async (authUser) => {
    if (!authUser) {
      setCurrentUser(null);
      setLoadingSession(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    setCurrentUser({
      id: authUser.id,
      email: authUser.email,
      name: profile?.username || authUser.email.split('@')[0],
      avatar: profile?.avatar_url || null,
    });
    setLoadingSession(false);
  };

  useEffect(() => {
    // Перевіряємо активну сесію при завантаженні сторінки
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserProfile(session?.user || null);
    });

    // Слухаємо зміни стану входу/виходу
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserProfile(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsInRoom(false);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  if (!isInRoom) {
    return (
      <Dashboard
        user={currentUser}
        onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
        onEnterRoom={() => setIsInRoom(true)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <Room
      user={currentUser}
      onLeave={() => setIsInRoom(false)}
    />
  );
}