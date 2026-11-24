import React, { useState } from 'react';
import {
  Vault,
  ShoppingBag,
  Sparkles,
  Gift,
  Check,
  Lock,
  Snowflake,
  Star,
  Crown,
} from 'lucide-react';

const SHOP_ITEMS = [
  {
    id: 'santa-hat',
    type: 'hat',
    title: 'Новорічна шапка на профіль',
    description: 'Святкова шапка поверх твоєї аватарки в кабінеті.',
    price: 50,
  },
  {
    id: 'gift-1',
    type: 'gift',
    title: 'Секретний подарунок від Олега #1',
    badge: 'Золотий квиток',
    description: 'Сюрприз усередині: право обрати наступний фільм без черги ^_^',
    message:
      'Офіційний сертифікат від Олега: сьогодні ти сама обираєш фільм або серіал без жодних суперечок ^_^',
    price: 40,
  },
  {
    id: 'gift-2',
    type: 'gift',
    title: 'Секретний подарунок від Олега #2',
    badge: 'Солодкий вечір',
    description: 'Сюрприз усередині: затишний вечірній перегляд зі смаколиками.',
    message:
      'Секретний бонус від Олега: теплий вечір, смачні смаколики та повний релакс під час перегляду!',
    price: 60,
  },
  {
    id: 'gift-3',
    type: 'gift',
    title: 'Секретний подарунок від Олега #3',
    badge: 'Особливе послання',
    description: 'Сюрприз усередині: тепле послання для найкращої дівчини.',
    message:
      'Ти — найкраща напарниця для спільних кіновечорів. Дякую, що ти є ^_^',
    price: 75,
  },
];

const ACHIEVEMENTS_CATALOG = [
  {
    id: 'first-profile',
    title: 'Перший профіль',
    description: 'Успішно створено та відкрито профіль у кінокімнаті.',
  },
  {
    id: 'christmas-spirit',
    title: 'Святковий настрій',
    description: 'Хоча б раз активовано новорічну тему з пряниками та снігом.',
  },
  {
    id: 'santa-hat-style',
    title: 'У новорічній шапці',
    description: 'Придбано та одягнуто новорічну шапку на профіль.',
  },
  {
    id: 'first-purchase',
    title: 'Перша покупка в магазинчику',
    description: 'Придбано будь-який предмет або секретний подарунок за зірки.',
  },
  {
    id: 'gift-collector',
    title: 'Колекціонер сюрпризів',
    description: 'Відкрито секретний подарунок від Олега у скарбничці.',
  },
];

export default function TreasuryAndShop({
  user,
  theme = 'default',
  coins = 0,
  unlockedAchievementIds = [],
  ownedItemIds = [],
  hasSantaHat = false,
  onToggleSantaHat,
  onBuyItem,
}) {
  const [activeTab, setActiveTab] = useState('treasury'); // 'treasury' | 'shop'
  const [selectedGiftId, setSelectedGiftId] = useState(() => {
    const firstOwnedGift = SHOP_ITEMS.find(
      (item) => item.type === 'gift' && ownedItemIds.includes(item.id)
    );
    return firstOwnedGift ? firstOwnedGift.id : null;
  });

  const isChristmas = theme === 'christmas';

  const ownedGifts = SHOP_ITEMS.filter(
    (item) => item.type === 'gift' && ownedItemIds.includes(item.id)
  );
  const activeGift =
    ownedGifts.find((g) => g.id === selectedGiftId) || ownedGifts[ownedGifts.length - 1] || null;

  const boxClass = isChristmas
    ? 'bg-red-950/60 border-red-300/20'
    : 'bg-slate-950 border-slate-800';

  const cardClass = isChristmas
    ? 'bg-red-950/80 border-red-300/20'
    : 'bg-slate-900/90 border-slate-800';

  const activeTabClass = isChristmas
    ? 'bg-red-700 border-red-200/50 text-white shadow-md'
    : 'bg-indigo-600 border-indigo-400/50 text-white shadow-md';

  const inactiveTabClass = isChristmas
    ? 'bg-red-950/50 border-red-300/15 text-red-100 hover:bg-red-900/50'
    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

  const handleBuyClick = (item) => {
    if (!onBuyItem) return;
    const bought = onBuyItem(item);
    if (bought && item.type === 'gift') {
      setSelectedGiftId(item.id);
    }
  };

  return (
    <div className={`rounded-xl p-4 space-y-4 border ${boxClass}`}>
      {/* Верхній рядок: Вкладки + Баланс валюти */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="grid grid-cols-2 gap-2 flex-1">
          <button
            type="button"
            onClick={() => setActiveTab('treasury')}
            className={`press-btn py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 ${
              activeTab === 'treasury' ? activeTabClass : inactiveTabClass
            }`}
          >
            <Vault className="w-4 h-4" strokeWidth={2.2} />
            <span>
              Скарбничка ({unlockedAchievementIds.length}/{ACHIEVEMENTS_CATALOG.length})
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
            <span>Магазинчик</span>
          </button>
        </div>

        <div
          className={`px-3 py-2 rounded-xl border text-xs font-bold inline-flex items-center justify-center space-x-1.5 shrink-0 ${
            isChristmas
              ? 'bg-amber-500/15 border-amber-300/35 text-amber-200'
              : 'bg-amber-500/10 border-amber-400/25 text-amber-300'
          }`}
          title="Валюта для покупок у магазинчику"
        >
          <Star className="w-4 h-4 fill-current" strokeWidth={2} />
          <span>{coins}</span>
        </div>
      </div>

      {/* ВКЛАДКА 1: СКАРБНИЧКА (збережені досягнення та відкриті подарунки) */}
      {activeTab === 'treasury' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold opacity-75">
            <span>Збережені досягнення</span>
            <span>{user?.name}</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {ACHIEVEMENTS_CATALOG.map((ach) => {
              const isUnlocked = unlockedAchievementIds.includes(ach.id);

              return (
                <div
                  key={ach.id}
                  className={`rounded-xl p-3 border flex items-start justify-between gap-3 text-xs ${cardClass} ${
                    isUnlocked ? '' : 'opacity-65'
                  }`}
                >
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <div
                      style={{ width: 34, height: 34 }}
                      className={`rounded-xl flex items-center justify-center shrink-0 border ${
                        isUnlocked
                          ? isChristmas
                            ? 'bg-amber-500/20 border-amber-300/40 text-amber-200'
                            : 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {isUnlocked ? (
                        <Crown className="w-4 h-4" strokeWidth={2.2} />
                      ) : (
                        <Lock className="w-4 h-4" strokeWidth={2.2} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-white">{ach.title}</div>
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
                      isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isUnlocked ? 'Збережено' : 'Закрито'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Відкриті секретні подарунки у скарбничці */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="text-[11px] uppercase tracking-wider font-semibold opacity-75 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-rose-400" strokeWidth={2.2} />
              <span>Відкриті подарунки від Олега ({ownedGifts.length})</span>
            </div>

            {ownedGifts.length === 0 ? (
              <p className={`text-xs italic ${isChristmas ? 'text-red-200/65' : 'text-slate-500'}`}>
                Тут з'являться куплені в магазинчику секретні подарунки.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {ownedGifts.map((gift) => (
                    <button
                      key={gift.id}
                      type="button"
                      onClick={() => setSelectedGiftId(gift.id)}
                      className={`press-btn px-2.5 py-1.5 rounded-lg text-[11px] font-medium border ${
                        activeGift?.id === gift.id
                          ? activeTabClass
                          : inactiveTabClass
                      }`}
                    >
                      {gift.title}
                    </button>
                  ))}
                </div>

                {activeGift && (
                  <div
                    className={`rounded-xl p-3 border text-xs space-y-1 ${
                      isChristmas
                        ? 'bg-amber-500/15 border-amber-300/35 text-amber-100'
                        : 'bg-indigo-950/50 border-indigo-500/30 text-indigo-100'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{activeGift.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10">
                        {activeGift.badge}
                      </span>
                    </div>
                    <p className="leading-relaxed opacity-95">{activeGift.message}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ВКЛАДКА 2: МАГАЗИНЧИК (покупки за валюту) */}
      {activeTab === 'shop' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold opacity-75">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} /> Вітрина магазинчика
            </span>
            <span>Система заробітку — згодом</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {SHOP_ITEMS.map((item) => {
              const isOwned = ownedItemIds.includes(item.id);
              const canAfford = coins >= item.price;

              return (
                <div
                  key={item.id}
                  className={`rounded-xl p-3 border flex items-center justify-between gap-3 ${cardClass}`}
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div
                      style={{ width: 40, height: 40 }}
                      className={`rounded-xl flex items-center justify-center shrink-0 border ${
                        item.type === 'hat'
                          ? 'bg-red-600/25 border-red-300/30 text-red-200'
                          : 'bg-rose-500/20 border-rose-300/30 text-rose-200'
                      }`}
                    >
                      {item.type === 'hat' ? (
                        <Snowflake className="w-5 h-5" strokeWidth={2.2} />
                      ) : (
                        <Gift className="w-5 h-5" strokeWidth={2.2} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">{item.title}</div>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          isChristmas ? 'text-red-200/80' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </p>
                      <div className="mt-1.5 inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-current" strokeWidth={2} />
                        <span>{item.price} зірок</span>
                      </div>
                    </div>
                  </div>

                  {isOwned ? (
                    item.type === 'hat' ? (
                      <button
                        type="button"
                        onClick={onToggleSantaHat}
                        className={`press-btn px-3 py-2 rounded-xl text-xs font-semibold shrink-0 border ${
                          hasSantaHat
                            ? 'bg-emerald-600/25 border-emerald-400/40 text-emerald-200'
                            : inactiveTabClass
                        }`}
                      >
                        {hasSantaHat ? 'Надіто ✓' : 'Одягнути'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGiftId(item.id);
                          setActiveTab('treasury');
                        }}
                        className="press-btn px-3 py-2 rounded-xl text-xs font-semibold shrink-0 border bg-emerald-600/20 border-emerald-400/35 text-emerald-200 inline-flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={2.4} />
                        <span>У скарбничці</span>
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleBuyClick(item)}
                      className={`press-btn px-3 py-2 rounded-xl text-xs font-semibold shrink-0 border disabled:opacity-45 ${
                        isChristmas
                          ? 'bg-red-700 hover:bg-red-600 border-red-200/40 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400/40 text-white'
                      }`}
                    >
                      {canAfford ? 'Купити' : 'Мало зірок'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}