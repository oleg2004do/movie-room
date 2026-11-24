import React, { useState, useEffect } from 'react';
import {
  Trophy,
  ShoppingBag,
  Sparkles,
  Gift,
  Check,
  Lock,
  Snowflake,
  Crown,
} from 'lucide-react';

const SECRET_GIFTS_FROM_OLEG = [
  {
    id: 'gift-movie-pick',
    title: 'Секретний подарунок від Олега #1',
    badge: 'Золотий квиток',
    message:
      'Офіційний сертифікат: сьогодні ти сама обираєш фільм або серіал без жодних суперечок ^_^',
  },
  {
    id: 'gift-cozy-treat',
    title: 'Секретний подарунок від Олега #2',
    badge: 'Солодкий вечір',
    message:
      'Сюрприз від Олега: домашні смаколики або затишний вечірній перегляд під пледом гарантовано!',
  },
  {
    id: 'gift-warm-note',
    title: 'Секретний подарунок від Олега #3',
    badge: 'Особливе послання',
    message:
      'Ти — найкраща напарниця для спільних кіновечорів. Дякую, що ти поруч ^_^',
  },
];

export default function AchievementsAndShop({
  user,
  theme = 'default',
  hasSantaHat,
  onToggleSantaHat,
  unlockedGifts = [],
  onUnlockGift,
  hasCalendarPlan = false,
}) {
  const [activeTab, setActiveTab] = useState('achievements'); // 'achievements' | 'shop'
  const [openedGiftId, setOpenedGiftId] = useState(null);

  const isChristmas = theme === 'christmas';

  // Перевіряємо досягнення користувача
  const achievements = [
    {
      id: 'first-profile',
      title: 'Перший профіль',
      description: 'Успішно створено та відкрито профіль у кінокімнаті.',
      unlocked: true,
    },
    {
      id: 'christmas-spirit',
      title: 'Святковий настрій',
      description: 'Активовано новорічну тему з пряниками та снігом.',
      unlocked: isChristmas,
    },
    {
      id: 'santa-hat-style',
      title: 'У новорічній шапці',
      description: 'Одягнуто святкову шапку на аватарку профілю.',
      unlocked: Boolean(hasSantaHat),
    },
    {
      id: 'planner-pro',
      title: 'Кінопланувальник',
      description: 'Додано запис у календар спільних переглядів.',
      unlocked: Boolean(hasCalendarPlan),
    },
    {
      id: 'gift-hunter',
      title: 'Шукач сюрпризів',
      description: 'Відкрито хоча б один секретний подарунок від Олега.',
      unlocked: unlockedGifts.length > 0,
    },
  ];

  useEffect(() => {
    if (unlockedGifts.length > 0 && !openedGiftId) {
      setOpenedGiftId(unlockedGifts[unlockedGifts.length - 1]);
    }
  }, [unlockedGifts, openedGiftId]);

  const boxClass = isChristmas
    ? 'bg-red-950/60 border-red-300/20'
    : 'bg-slate-950 border-slate-800';

  const itemCardClass = isChristmas
    ? 'bg-red-950/80 border-red-300/20'
    : 'bg-slate-900/90 border-slate-800';

  const activeTabClass = isChristmas
    ? 'bg-red-700 border-red-200/50 text-white shadow-md'
    : 'bg-indigo-600 border-indigo-400/50 text-white shadow-md';

  const inactiveTabClass = isChristmas
    ? 'bg-red-950/50 border-red-300/15 text-red-100 hover:bg-red-900/50'
    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

  const activeOpenedGift = SECRET_GIFTS_FROM_OLEG.find((g) => g.id === openedGiftId);

  return (
    <div className={`rounded-xl p-4 space-y-4 border ${boxClass}`}>
      {/* Вкладки: Досягнення та Магазин */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className={`press-btn py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 ${
            activeTab === 'achievements' ? activeTabClass : inactiveTabClass
          }`}
        >
          <Trophy className="w-4 h-4" strokeWidth={2.2} />
          <span>
            Досягнення ({achievements.filter((a) => a.unlocked).length}/{achievements.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shop')}
          className={`press-btn py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 ${
            activeTab === 'shop' ? activeTabClass : inactiveTabClass
          }`}
        >
          <ShoppingBag className="w-4 h-4" strokeWidth={2.2} />
          <span>Магазин подарунків</span>
        </button>
      </div>

      {/* ВМІСТ ВКЛАДКИ: ДОСЯГНЕННЯ */}
      {activeTab === 'achievements' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold opacity-75">
            <span>Отримані досягнення</span>
            <span>{user?.name}</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`rounded-xl p-3 border flex items-start justify-between gap-3 text-xs ${itemCardClass} ${
                  ach.unlocked ? '' : 'opacity-65'
                }`}
              >
                <div className="flex items-start space-x-2.5 min-w-0">
                  <div
                    style={{ width: 34, height: 34 }}
                    className={`rounded-xl flex items-center justify-center shrink-0 border ${
                      ach.unlocked
                        ? isChristmas
                          ? 'bg-amber-500/20 border-amber-300/40 text-amber-200'
                          : 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {ach.unlocked ? (
                      <Trophy className="w-4 h-4" strokeWidth={2.2} />
                    ) : (
                      <Lock className="w-4 h-4" strokeWidth={2.2} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{ach.title}</span>
                    </div>
                    <p
                      className={`mt-0.5 text-[11px] ${
                        isChristmas ? 'text-red-200/80' : 'text-slate-400'
                      }`}
                    >
                      {ach.description}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    ach.unlocked
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {ach.unlocked ? 'Отримано' : 'Заблоковано'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ВМІСТ ВКЛАДКИ: МАГАЗИН ПОДАРУНКІВ */}
      {activeTab === 'shop' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold opacity-75">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} /> Крамничка сюрпризів
            </span>
            <span>Безкоштовно для вас</span>
          </div>

          {/* Товар 1: Новорічна шапка на аватарку */}
          <div className={`rounded-xl p-3 border flex items-center justify-between gap-3 ${itemCardClass}`}>
            <div className="flex items-center space-x-3 min-w-0">
              <div
                style={{ width: 40, height: 40 }}
                className="rounded-xl bg-red-600/25 border border-red-300/30 flex items-center justify-center text-red-200 shrink-0"
              >
                <Snowflake className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Новорічна шапка на профіль</span>
                </div>
                <p
                  className={`text-[11px] mt-0.5 ${
                    isChristmas ? 'text-red-200/80' : 'text-slate-400'
                  }`}
                >
                  Одягає святкову шапку поверх твоєї аватарки в кабінеті.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleSantaHat}
              className={`press-btn px-3 py-2 rounded-xl text-xs font-semibold shrink-0 border ${
                hasSantaHat
                  ? 'bg-emerald-600/25 border-emerald-400/40 text-emerald-200'
                  : isChristmas
                  ? 'bg-red-700 hover:bg-red-600 border-red-200/40 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400/40 text-white'
              }`}
            >
              {hasSantaHat ? 'Надіто ✓' : 'Одягнути'}
            </button>
          </div>

          {/* Товар 2: Секретні подарунки від Олега */}
          <div className="space-y-2">
            <div className="text-xs font-semibold flex items-center gap-1.5 text-white pt-1">
              <Gift className="w-4 h-4 text-rose-400" strokeWidth={2.2} />
              <span>Секретні подарунки від Олега</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SECRET_GIFTS_FROM_OLEG.map((gift, index) => {
                const isUnlocked = unlockedGifts.includes(gift.id);
                const isSelected = openedGiftId === gift.id;

                return (
                  <button
                    key={gift.id}
                    type="button"
                    onClick={() => {
                      if (!isUnlocked && onUnlockGift) {
                        onUnlockGift(gift.id);
                      }
                      setOpenedGiftId(gift.id);
                    }}
                    className={`press-btn rounded-xl p-3 border text-left flex flex-col justify-between gap-2 ${
                      isSelected
                        ? isChristmas
                          ? 'bg-red-700/75 border-amber-300/60 text-white'
                          : 'bg-indigo-600/30 border-indigo-400 text-white'
                        : itemCardClass
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Gift className="w-4 h-4 text-rose-300" strokeWidth={2.2} />
                      {isUnlocked ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
                      ) : (
                        <Crown className="w-3.5 h-3.5 text-amber-300" strokeWidth={2.2} />
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold">Сюрприз #{index + 1}</div>
                      <div className="text-[10px] opacity-75">
                        {isUnlocked ? 'Відкрито — натисни щоб прочитати' : 'Натисни, щоб розпакувати'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Розпакований секретний подарунок */}
            {activeOpenedGift && (
              <div
                className={`rounded-xl p-3.5 border text-xs space-y-1 ${
                  isChristmas
                    ? 'bg-amber-500/15 border-amber-300/35 text-amber-100'
                    : 'bg-indigo-950/50 border-indigo-500/30 text-indigo-100'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>{activeOpenedGift.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10">
                    {activeOpenedGift.badge}
                  </span>
                </div>
                <p className="leading-relaxed opacity-95">{activeOpenedGift.message}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}