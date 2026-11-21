import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, Upload, ArrowRight, Loader2 } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Функція входу або реєстрації
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Реєстрація нового користувача
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        let avatarUrl = '';

        // Якщо вибрали аватарку, завантажуємо її у Supabase Storage
        if (avatarFile && authData.user) {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${authData.user.id}-${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            avatarUrl = publicUrlData.publicUrl;
          }
        }

        // Зберігаємо профіль користувача у базу даних
        if (authData.user) {
          await supabase.from('profiles').insert([
            { 
              id: authData.user.id, 
              username: username || email.split('@')[0], 
              avatar_url: avatarUrl 
            }
          ]);
        }

        alert('Реєстрація успішна! Увійди під своїми даними.');
        setIsSignUp(false);
      } else {
        // Звичайний вхід
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;

        // Отримуємо додаткові дані профілю
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        onLoginSuccess({
          id: data.user.id,
          name: profile?.username || email.split('@')[0],
          avatar: profile?.avatar_url || null
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Наш Кінотеатр 🎬</h1>
          <p className="text-slate-400 text-sm">
            {isSignUp ? 'Створи свій акаунт із аватаркою' : 'Увійди, щоб приєднатися до перегляду'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-500/30 text-red-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Ім'я / Нікнейм</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Олег або Христя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-11 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Електронна пошта</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-11 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-11 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Фото профілю (Аватарка)</label>
              <label className="flex items-center justify-center w-full bg-slate-950 border border-dashed border-slate-800 hover:border-indigo-500 rounded-xl px-4 py-3 cursor-pointer transition-colors text-slate-400 text-sm">
                <Upload className="w-4 h-4 mr-2 text-indigo-400" />
                <span>{avatarFile ? avatarFile.name : 'Обрати файл фото'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setAvatarFile(e.target.files[0])} 
                  className="hidden" 
                />
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 mt-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Створити акаунт' : 'Увійти в кімнату'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
          >
            {isSignUp ? 'Вже є акаунт? Увійти' : 'Немає акаунта? Зареєструватися'}
          </button>
        </div>

      </div>
    </div>
  );
}