import React from 'react';
import { Sparkles, Heart, Clapperboard, Snowflake, Check } from 'lucide-react';

export default function WelcomeModal({ user, theme = 'default', onClose }) {
  if (!user) return null;

  const isChristmas = theme === 'christmas';

  // Розпізнаємо Христю за email (якщо ти знаєш її пошту, можеш дописати її сюди) або за іменем
  const normalizedName = (user.name || '').trim().toLowerCase();
  const normalizedEmail = (user.email || '').trim().toLowerCase();
  const isKhrystia =
    normalizedName.includes('христ') ||
    normalizedName.includes('khryst') ||
    normalizedEmail.includes('khryst');

  const greetingTitle = isKhrystia
    ? 'Вітаю найкращу дівчину із створенням профілю ^_^'
    : `Вітаємо в кінокімнаті, ${user.name || 'друже'}!`;

  const greetingSubtitle = isKhrystia
    ? 'Твій профіль готовий. Тепер можна обирати фільми, планувати вечори в календарі та дивитися кіно разом.'
    : 'Профіль успішно створено. Заходь у кабінет, налаштовуй тему та приєднуйся до перегляду.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className={`max-w-md w-full rounded-2xl p-6 sm:p-7 shadow-2xl border space-y-5 relative overflow-hidden transition-all ${
          isChristmas
            ? 'bg-red-950/90 border-red-300/35 text-white'
            : 'bg-slate-900 border-indigo-500/30 text-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
              isChristmas
                ? 'bg-red-800/60 border-red-300/30 text-red-100'
                : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300'
            }`}
          >
            {isChristmas ? (
              <Snowflake className="w-3.5 h-3.5" strokeWidth={2.2} />
            ) : (
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} />
            )}
            <span>Нове досягнення • Перший профіль</span>
          </span>

          <div
            style={{ width: 40, height: 40 }}
            className={`rounded-xl flex items-center justify-center border ${
              isChristmas
                ? 'bg-red-900/60 border-red-300/25 text-rose-200'
                : 'bg-indigo-600/20 border-indigo-500/30 text-rose-400'
            }`}
          >
            <Heart className="w-5 h-5 fill-current" strokeWidth={2} />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold leading-snug text-white">{greetingTitle}</h3>
          <p
            className={`text-xs sm:text-sm leading-relaxed ${
              isChristmas ? 'text-red-100/85' : 'text-slate-300'
            }`}
          >
            {greetingSubtitle}
          </p>
        </div>

        <div
          className={`rounded-xl p-3.5 border text-xs flex items-center justify-between ${
            isChristmas
              ? 'bg-red-950/75 border-red-300/20 text-red-100'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}
        >
          <span className="inline-flex items-center space-x-2">
            <Clapperboard
              className={`w-4 h-4 ${isChristmas ? 'text-red-200' : 'text-indigo-400'}`}
              strokeWidth={2.2}
            />
            <span>Акаунт:</span>
            <strong className="text-white">{user.name || user.email}</strong>
          </span>
          <span className="text-emerald-400 inline-flex items-center font-medium">
            <Check className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} /> Готово
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`press-btn w-full py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-lg flex items-center justify-center space-x-2 border ${
            isChristmas
              ? 'bg-red-700 hover:bg-red-600 border-red-300/35 shadow-red-950/50'
              : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400/40 shadow-indigo-600/25'
          }`}
        >
          <span>Дякую, погнали!</span>
        </button>
      </div>
    </div>
  );
}