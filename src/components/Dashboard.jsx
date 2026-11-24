import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  SquarePen,
  Clapperboard,
  Check,
  ImagePlus,
  Loader2,
  Sparkles,
  Snowflake,
  MoonStar,
  X,
  Cookie,
  Vault,
  ShoppingBag,
  Home,
} from 'lucide-react';
import Snowfall from './Snowfall';
import WatchCalendar from './WatchCalendar';
import TreasuryPage from './TreasuryPage';
import CookieShop from './CookieShop';
import ImageCropModal from './ImageCropModal';

export default function Dashboard({
  user,
  theme = 'default',
  setTheme,
  cookies = 0,
  onSpendCookies,
  onUpdateUser,
  onEnterRoom,
  onLogout,
}) {
  const [section, setSection] = useState('home'); // 'home' | 'treasury' | 'shop'
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  const storageKey = `movie-room-treasury-v2-${user.id}`;

  const loadSavedData = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch {
      // ігноруємо помилку парсингу
    }
    return {
      unlockedIds: ['first-profile'],
      ownedIds: [],
      hasSantaHat: false,
      gifts: [],
    };
  };

  const [stateData, setStateData] = useState(loadSavedData);

  useEffect(() => {
    setStateData(loadSavedData());
    setUsername(user.name || '');
    setAvatarPreview(user.avatar || null);
  }, [user.id]);

  useEffect(() => {
    setUsername(user.name || '');
    setAvatarPreview(user.avatar || null);
  }, [user.name, user.avatar]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(stateData));
  }, [stateData, storageKey]);

  const unlockAchievements = (ids) => {
    setStateData((prev) => {
      const nextIds = Array.from(new Set([...prev.unlockedIds, ...ids]));
      if (nextIds.length === prev.unlockedIds.length) return prev;
      return { ...prev, unlockedIds: nextIds };
    });
  };

  useEffect(() => {
    if (theme === 'christmas') {
      unlockAchievements(['christmas-mood']);
    }
  }, [theme]);

  useEffect(() => {
    if (cookies >= 5) {
      unlockAchievements(['first-20min']);
    }
    if (cookies >= 25) {
      unlockAchievements(['cookie-baker']);
    }
  }, [cookies]);

  const handleBuyItem = (item) => {
    if (stateData.ownedIds.includes(item.id)) return;
    if (cookies < item.price) return;

    const spent = onSpendCookies ? onSpendCookies(item.price) : true;
    if (!spent) return;

    setStateData((prev) => {
      const nextGifts =
        item.type === 'gift'
          ? [
              {
                id: `${item.id}-${Date.now()}`,
                type: 'reward',
                title: item.title,
                message: item.message || item.desc,
                senderName: 'Магазинчик печеньок',
                createdAt: new Date().toLocaleDateString('uk-UA'),
              },
              ...prev.gifts,
            ]
          : prev.gifts;

      const nextUnlocked = [...prev.unlockedIds];
      if (item.type === 'hat') nextUnlocked.push('santa-hat');

      return {
        ...prev,
        ownedIds: [...prev.ownedIds, item.id],
        hasSantaHat: item.type === 'hat' ? true : prev.hasSantaHat,
        gifts: nextGifts,
        unlockedIds: Array.from(new Set(nextUnlocked)),
      };
    });
  };

  const handleToggleSantaHat = () => {
    setStateData((prev) => {
      if (!prev.ownedIds.includes('santa-hat')) return prev;
      const nextHat = !prev.hasSantaHat;
      return {
        ...prev,
        hasSantaHat: nextHat,
        unlockedIds: nextHat
          ? Array.from(new Set([...prev.unlockedIds, 'santa-hat']))
          : prev.unlockedIds,
      };
    });
  };

  const handleSendGift = (newGift) => {
    setStateData((prev) => ({
      ...prev,
      gifts: [newGift, ...prev.gifts],
      unlockedIds: Array.from(new Set([...prev.unlockedIds, 'gift-sender'])),
    }));
  };

  const handleDeleteGift = (giftId) => {
    setStateData((prev) => ({
      ...prev,
      gifts: prev.gifts.filter((g) => g.id !== giftId),
    }));
  };

  const isAdmin = user.email === 'oleg2004do@gmail.com';
  const isChristmas = theme === 'christmas';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropImageSrc(URL.createObjectURL(file));
      e.target.value = '';
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      let avatarUrl = user.avatar;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || 'jpg';
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

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username,
          avatar_url: avatarUrl,
        });

      if (error) throw error;

      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          name: username,
          avatar: avatarUrl,
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

  const navBtnClass = (isActive) =>
    `press-btn py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-1.5 ${
      isActive
        ? isChristmas
          ? 'bg-red-700 border-red-200/55 text-white shadow-md'
          : 'bg-indigo-600 border-indigo-400/55 text-white shadow-md'
        : isChristmas
        ? 'bg-red-950/55 border-red-300/20 text-red-100 hover:bg-red-900/50'
        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
    }`;

  return (
    <div
      className={`min-h-screen text-white flex flex-col items-center justify-center p-4 relative transition-colors duration-300 ${
        isChristmas ? 'christmas-theme-bg' : 'bg-slate-950'
      }`}
    >
      {isChristmas && <Snowfall />}

      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          aspect={1}
          theme={theme}
          onCancel={() => setCropImageSrc(null)}
          onConfirm={({ file, dataUrl }) => {
            setAvatarFile(file);
            setAvatarPreview(dataUrl);
            setCropImageSrc(null);
          }}
        />
      )}

      <div
        className={`max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 border transition-colors duration-300 ${
          isChristmas
            ? 'bg-red-950/75 border-red-300/25 backdrop-blur-md'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        {/* Шапка профілю + лічильник печеньок */}
        <div
          className={`flex items-center justify-between border-b pb-6 gap-3 ${
            isChristmas ? 'border-red-300/20' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-4 min-w-0">
            <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
              {stateData.hasSantaHat && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-3 -right-2 z-20 select-none text-2xl drop-shadow"
                  title="Новорічна шапка"
                >
                  🎅
                </div>
              )}

              <div
                style={{ width: 64, height: 64, minWidth: 64 }}
                className={`rounded-2xl flex items-center overflow-hidden justify-center relative shadow-inner border ${
                  isChristmas
                    ? 'bg-red-900/50 border-red-300/30'
                    : 'bg-indigo-600/20 border-indigo-500/30'
                }`}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    style={{ width: 64, height: 64 }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User
                    className={`w-8 h-8 ${isChristmas ? 'text-red-200' : 'text-indigo-400'}`}
                    strokeWidth={2.2}
                  />
                )}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-xl font-bold truncate">{user.name}</h2>
                {isAdmin && (
                  <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" strokeWidth={2.2} /> Адмін
                  </span>
                )}
              </div>
              <p
                className={`text-xs flex items-center mt-1 truncate ${
                  isChristmas ? 'text-red-200/80' : 'text-slate-400'
                }`}
              >
                <Mail
                  className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${
                    isChristmas ? 'text-red-300/70' : 'text-slate-500'
                  }`}
                  strokeWidth={2.1}
                />{' '}
                <span className="truncate">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div
              className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-300/30 text-amber-200 text-xs font-bold inline-flex items-center space-x-1.5"
              title="Валюта: печеньки (+5 за 20 хв перегляду)"
            >
              <Cookie className="w-4 h-4" strokeWidth={2.2} />
              <span>{cookies}</span>
            </div>

            <button
              onClick={onLogout}
              className="press-btn group p-2.5 bg-red-600/15 hover:bg-red-600 text-red-300 hover:text-white rounded-xl border border-red-400/25"
              title="Вийти з акаунта"
            >
              <LogOut
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.2}
              />
            </button>
          </div>
        </div>

        {/* Головна навігація: Головна / Скарбничка / Магазинчик */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSection('home')}
            className={navBtnClass(section === 'home')}
          >
            <Home className="w-4 h-4" strokeWidth={2.2} />
            <span>Головна</span>
          </button>

          <button
            type="button"
            onClick={() => setSection('treasury')}
            className={navBtnClass(section === 'treasury')}
          >
            <Vault className="w-4 h-4" strokeWidth={2.2} />
            <span>Скарбничка</span>
          </button>

          <button
            type="button"
            onClick={() => setSection('shop')}
            className={navBtnClass(section === 'shop')}
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={2.2} />
            <span>Магазинчик</span>
          </button>
        </div>

        {/* ВКЛАДКА 1: ГОЛОВНА */}
        {section === 'home' && (
          <div className="space-y-5">
            {setTheme && (
              <div
                className={`rounded-xl p-4 space-y-3 border ${
                  isChristmas
                    ? 'bg-red-950/60 border-red-300/20'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider flex items-center ${
                      isChristmas ? 'text-red-200/90' : 'text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.2} /> Тема сайту
                  </span>
                  <span className={`text-xs ${isChristmas ? 'text-red-200' : 'text-slate-400'}`}>
                    {isChristmas ? 'Червона з пряниками та снігом' : 'Класична темна'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTheme('default')}
                    className={`press-btn group py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center space-x-2 ${
                      !isChristmas
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-red-950/40 border-red-300/20 text-red-100 hover:bg-red-900/50'
                    }`}
                  >
                    <MoonStar
                      className="w-4 h-4 transition-transform group-hover:-rotate-12"
                      strokeWidth={2.2}
                    />
                    <span>Звичайна</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('christmas')}
                    className={`press-btn group py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center space-x-2 ${
                      isChristmas
                        ? 'bg-red-700 border-red-200/60 text-white shadow-lg shadow-red-950/50'
                        : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Snowflake
                      className="w-4 h-4 transition-transform group-hover:rotate-45"
                      strokeWidth={2.2}
                    />
                    <span>Новорічна</span>
                  </button>
                </div>
              </div>
            )}

            <div
              className={`rounded-xl p-4 space-y-4 border ${
                isChristmas
                  ? 'bg-red-950/60 border-red-300/20'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center gap-2">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isChristmas ? 'text-red-200/90' : 'text-slate-400'
                  }`}
                >
                  Налаштування профілю
                </span>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`press-btn group text-xs flex items-center px-2.5 py-1.5 rounded-lg ${
                      isChristmas
                        ? 'text-red-200 hover:text-white hover:bg-red-900/50'
                        : 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-900'
                    }`}
                  >
                    <SquarePen
                      className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:scale-110"
                      strokeWidth={2.2}
                    />
                    <span>Редагувати профіль</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setAvatarPreview(user.avatar);
                        setUsername(user.name);
                      }}
                      className="press-btn text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg inline-flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2.2} />
                      <span>Скасувати</span>
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className={`press-btn text-xs text-white px-3 py-1.5 rounded-lg flex items-center shadow-lg ${
                        isChristmas
                          ? 'bg-red-700 hover:bg-red-600 shadow-red-950/40'
                          : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                      }`}
                    >
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" strokeWidth={2.2} />
                      ) : (
                        <Check className="w-3.5 h-3.5 mr-1" strokeWidth={2.4} />
                      )}
                      <span>Зберегти</span>
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 pt-2">
                  <div>
                    <label
                      className={`block text-[11px] mb-1 ${
                        isChristmas ? 'text-red-200/80' : 'text-slate-400'
                      }`}
                    >
                      Нікнейм
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none border ${
                        isChristmas
                          ? 'bg-red-950/80 border-red-300/30 focus:border-red-200'
                          : 'bg-slate-900 border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-[11px] mb-1 ${
                        isChristmas ? 'text-red-200/80' : 'text-slate-400'
                      }`}
                    >
                      Змінити аватарку (з вибором кадру)
                    </label>
                    <label
                      className={`press-btn flex items-center justify-center w-full border border-dashed rounded-lg px-3 py-2.5 cursor-pointer text-xs ${
                        isChristmas
                          ? 'bg-red-950/70 border-red-300/35 hover:border-red-200 text-red-100'
                          : 'bg-slate-900 border-slate-700 hover:border-indigo-500 text-slate-300'
                      }`}
                    >
                      <ImagePlus
                        className={`w-4 h-4 mr-2 ${isChristmas ? 'text-red-200' : 'text-indigo-400'}`}
                        strokeWidth={2.2}
                      />
                      <span>{avatarFile ? avatarFile.name : 'Обрати фото та кадр'}</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-sm py-1 font-medium flex items-center justify-between gap-2">
                  <span className={isChristmas ? 'text-red-100' : 'text-slate-300'}>
                    Нікнейм: <strong className="text-white">{user.name}</strong>
                  </span>
                  <span className="text-xs text-emerald-400 inline-flex items-center shrink-0">
                    <Check className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} /> Збережено в базі
                  </span>
                </div>
              )}
            </div>

            <WatchCalendar user={user} theme={theme} />
          </div>
        )}

        {/* ВКЛАДКА 2: ОКРЕМА СКАРБНИЧКА */}
        {section === 'treasury' && (
          <TreasuryPage
            user={user}
            theme={theme}
            cookies={cookies}
            unlockedIds={stateData.unlockedIds}
            gifts={stateData.gifts}
            onSendGift={handleSendGift}
            onDeleteGift={handleDeleteGift}
          />
        )}

        {/* ВКЛАДКА 3: ОКРЕМИЙ МАГАЗИНЧИК ЗА ПЕЧЕНЬКИ */}
        {section === 'shop' && (
          <CookieShop
            theme={theme}
            cookies={cookies}
            ownedIds={stateData.ownedIds}
            hasSantaHat={stateData.hasSantaHat}
            onToggleSantaHat={handleToggleSantaHat}
            onBuyItem={handleBuyItem}
          />
        )}

        {/* Кнопка переходу в кімнату перегляду */}
        <button
          onClick={onEnterRoom}
          className={`press-btn group w-full text-white font-medium py-3.5 rounded-xl shadow-lg flex items-center justify-center space-x-2.5 text-base ${
            isChristmas
              ? 'bg-red-700 hover:bg-red-600 border border-red-300/30 shadow-red-950/50'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
          }`}
        >
          <Clapperboard
            className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:-rotate-6"
            strokeWidth={2.2}
          />
          <span>Зайти в кімнату перегляду</span>
        </button>
      </div>
    </div>
  );
}