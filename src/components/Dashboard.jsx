import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Mail, Shield, LogOut, Edit2, Play, Save, Upload, Loader2 } from 'lucide-react';

export default function Dashboard({ user, onUpdateUser, onEnterRoom, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const [loading, setLoading] = useState(false);

  const isAdmin = user.email === 'oleg2004do@gmail.com';

  // Синхронізуємо поля, якщо дані користувача підвантажилися з бази
  useEffect(() => {
    setUsername(user.name || '');
    setAvatarPreview(user.avatar || null);
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      let avatarUrl = user.avatar;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        avatarUrl = publicUrlData.publicUrl;
      }

      // upsert створить запис, якщо його ще немає в таблиці, або оновить існуючий
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username,
          avatar_url: avatarUrl
        });

      if (error) throw error;

      // Оновлюємо глобальний стан користувача в App.jsx
      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          name: username,
          avatar: avatarUrl
        });
      }

      setIsEditing(false);
      setAvatarFile(null);
      alert('Профіль назавжди збережено!');
    } catch (err) {
      console.error('Помилка оновлення:', err);
      alert('Не вдалося оновити профіль: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        
        {/* Шапка профілю */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center overflow-hidden justify-center relative shadow-inner">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-indigo-400" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">{user.name}</h2>
                {isAdmin && (
                  <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center">
                    <Shield className="w-3 h-3 mr-1" /> Адмін (Головний)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center mt-1">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {user.email}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="p-2.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition-colors border border-red-500/20"
            title="Вийти з акаунта"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Налаштування профілю */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Налаштування профілю</span>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" /> Редагувати профіль
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => { setIsEditing(false); setAvatarPreview(user.avatar); setUsername(user.name); }}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg"
                >
                  Скасувати
                </button>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg flex items-center shadow-lg shadow-indigo-600/20"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                  Зберегти
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Нікнейм</label>
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Змінити аватарку</label>
                <label className="flex items-center justify-center w-full bg-slate-900 border border-dashed border-slate-700 hover:border-indigo-500 rounded-lg px-3 py-2 cursor-pointer transition-colors text-slate-300 text-xs">
                  <Upload className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                  <span>{avatarFile ? avatarFile.name : 'Обрати нове фото'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-300 py-1 font-medium flex items-center justify-between">
              <span>Нікнейм: <strong className="text-white">{user.name}</strong></span>
              <span className="text-xs text-emerald-400">Збережено в базі ✓</span>
            </div>
          )}
        </div>

        {/* Адмін-панель */}
        {isAdmin && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300 space-y-1">
            <strong className="block font-semibold flex items-center">
              <Shield className="w-4 h-4 mr-1.5" /> Панель Головного Адміністратора
            </strong>
            <p className="text-amber-400/80">Повний доступ до кімнати, управління підключеннями та налаштування сервера активовано для oleg2004do@gmail.com.</p>
          </div>
        )}

        {/* Кнопка переходу в кімнату перегляду */}
        <button
          onClick={onEnterRoom}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 text-base"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Зайти в кімнату перегляду</span>
        </button>

      </div>
    </div>
  );
}