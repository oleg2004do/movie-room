import React from 'react';
import { Cookie, Snowflake, Gift, Check, Sparkles } from 'lucide-react';

const SHOP_ITEMS = [
  {
    id: 'santa-hat',
    type: 'hat',
    title: 'Новорічна шапка на профіль',
    desc: 'Одягає святкову шапку поверх аватарки в кабінеті.',
    price: 10,
  },
  {
    id: 'gift-pass-movie',
    type: 'gift',
    title: 'Квиток «Вибір фільму без черги»',
    desc: 'Кладе в скарбничку особливу нагороду на вибір наступного фільму.',
    message: 'Офіційна нагорода: сьогодні ти обираєш наступний фільм або серіал сама ^_^',
    price: 15,
  },
  {
    id: 'gift-cozy-evening',
    type: 'gift',
    title: 'Нагорода «Затишний вечір»',
    desc: 'Додає у скарбничку теплий вечірній сертифікат зі смаколиками.',
    message: 'Сюрприз у скарбничці: затишний кіновечір і смаколики чекають на тебе!',
    price: 20,
  },
];

export default function CookieShop({
  theme = 'default',
  cookies = 0,
  ownedIds = [],
  hasSantaHat = false,
  onToggleSantaHat,
  onBuyItem,
}) {
  const isChristmas = theme === 'christmas';

  const boxClass = isChristmas
    ? 'bg-red-950/65 border-red-300/20'
    : 'bg-slate-950/85 border-slate-800';

  const itemClass = isChristmas
    ? 'bg-red-950/80 border-red-300/20'
    : 'bg-slate-900/90 border-slate-800';

  const buyBtnClass = isChristmas
    ? 'bg-red-700 hover:bg-red-600 border-red-200/40 text-white'
    : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400/40 text-white';

  return (
    <div className={`rounded-2xl p-4 border space-y-4 ${boxClass}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-85">
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} />
          Магазинчик за печеньки
        </span>

        <div className="px-3 py-1.5 rounded-xl border border-amber-300/30 bg-amber-500/15 text-amber-200 text-xs font-bold inline-flex items-center space-x-1.5">
          <Cookie className="w-4 h-4" strokeWidth={2.2} />
          <span>{cookies}</span>
        </div>
      </div>

      <p className="text-xs opacity-75">
        Заробляйте по <strong>5 печеньок</strong> за кожні <strong>20 хвилин</strong> перегляду в кімнаті!
      </p>

      <div className="space-y-2.5">
        {SHOP_ITEMS.map((item) => {
          const owned = ownedIds.includes(item.id);
          const affordable = cookies >= item.price;

          return (
            <div
              key={item.id}
              className={`rounded-xl p-3.5 border flex items-center justify-between gap-3 ${itemClass}`}
            >
              <div className="flex items-start space-x-3 min-w-0">
                <div
                  style={{ width: 40, height: 40 }}
                  className="rounded-xl bg-amber-500/15 border border-amber-300/25 flex items-center justify-center text-amber-200 shrink-0"
                >
                  {item.type === 'hat' ? (
                    <Snowflake className="w-5 h-5" strokeWidth={2.2} />
                  ) : (
                    <Gift className="w-5 h-5" strokeWidth={2.2} />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-white">{item.title}</div>
                  <div className="text-[11px] opacity-75 mt-0.5">{item.desc}</div>
                  <div className="mt-1.5 inline-flex items-center space-x-1 text-xs font-bold text-amber-300">
                    <Cookie className="w-3.5 h-3.5" strokeWidth={2.2} />
                    <span>{item.price} печеньок</span>
                  </div>
                </div>
              </div>

              {owned ? (
                item.type === 'hat' ? (
                  <button
                    type="button"
                    onClick={onToggleSantaHat}
                    className={`press-btn px-3 py-2 rounded-xl text-xs font-semibold shrink-0 border ${
                      hasSantaHat
                        ? 'bg-emerald-600/25 border-emerald-400/40 text-emerald-200'
                        : 'bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    {hasSantaHat ? 'Надіто ✓' : 'Одягнути'}
                  </button>
                ) : (
                  <span className="px-3 py-2 rounded-xl text-xs font-semibold shrink-0 border bg-emerald-600/20 border-emerald-400/35 text-emerald-200 inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.4} />
                    <span>У скарбничці</span>
                  </span>
                )
              ) : (
                <button
                  type="button"
                  disabled={!affordable}
                  onClick={() => onBuyItem(item)}
                  className={`press-btn px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 border disabled:opacity-45 ${buyBtnClass}`}
                >
                  {affordable ? 'Купити' : 'Мало 🍪'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}