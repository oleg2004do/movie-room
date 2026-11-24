import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Film,
  Loader2,
} from 'lucide-react';

const MONTHS_UA = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
];

const WEEKDAYS_UA = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function WatchCalendar({ user, theme = 'default' }) {
  const todayISO = formatDateISO(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [plans, setPlans] = useState([]);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isChristmas = theme === 'christmas';

  const loadPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('watch_plans')
      .select('*')
      .order('plan_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (!error && data) {
      setPlans(data);
    } else if (error) {
      console.error('Помилка завантаження планів:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleAddPlan = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedDate) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('watch_plans')
        .insert({
          user_id: user.id,
          author_name: user.name || user.email,
          plan_date: selectedDate,
          title: title.trim(),
          note: note.trim(),
          is_done: false,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setPlans((prev) => [...prev, data]);
      }
      setTitle('');
      setNote('');
    } catch (err) {
      console.error('Помилка додавання плану:', err);
      alert('Не вдалося зберегти план: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDone = async (plan) => {
    const nextDone = !plan.is_done;
    setPlans((prev) =>
      prev.map((item) => (item.id === plan.id ? { ...item, is_done: nextDone } : item))
    );

    const { error } = await supabase
      .from('watch_plans')
      .update({ is_done: nextDone })
      .eq('id', plan.id);

    if (error) {
      console.error('Помилка оновлення статусу:', error);
      loadPlans();
    }
  };

  const handleDeletePlan = async (id) => {
    setPlans((prev) => prev.filter((item) => item.id !== id));

    const { error } = await supabase.from('watch_plans').delete().eq('id', id);
    if (error) {
      console.error('Помилка видалення плану:', error);
      loadPlans();
    }
  };

  // Сітка днів поточного місяця (починається з понеділка)
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Пн ... 6 = Нд
    const days = [];

    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const dateObj = new Date(year, month, day);
      days.push({
        day,
        iso: formatDateISO(dateObj),
      });
    }

    return days;
  }, [currentMonth]);

  const plansByDate = useMemo(() => {
    const map = {};
    for (const plan of plans) {
      if (!map[plan.plan_date]) map[plan.plan_date] = [];
      map[plan.plan_date].push(plan);
    }
    return map;
  }, [plans]);

  const selectedDayPlans = plansByDate[selectedDate] || [];

  const boxClass = isChristmas
    ? 'bg-red-950/60 border-red-300/20'
    : 'bg-slate-950 border-slate-800';

  const primaryBtnClass = isChristmas
    ? 'bg-red-700 hover:bg-red-600 border-red-300/30 text-white'
    : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white';

  return (
    <div className={`rounded-xl p-4 space-y-4 border ${boxClass}`}>
      {/* Заголовок і перемикання місяця */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs font-semibold uppercase tracking-wider flex items-center ${
            isChristmas ? 'text-red-200/90' : 'text-slate-400'
          }`}
        >
          <CalendarDays className="w-4 h-4 mr-1.5" strokeWidth={2.2} />
          Календар переглядів
        </span>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
              )
            }
            className={`press-btn p-1.5 rounded-lg border ${
              isChristmas
                ? 'bg-red-950/80 border-red-300/20 text-red-100 hover:bg-red-900/70'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Попередній місяць"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.2} />
          </button>

          <span className="text-xs font-semibold min-w-[110px] text-center">
            {MONTHS_UA[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
              )
            }
            className={`press-btn p-1.5 rounded-lg border ${
              isChristmas
                ? 'bg-red-950/80 border-red-300/20 text-red-100 hover:bg-red-900/70'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Наступний місяць"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Дні тижня */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium opacity-70">
        {WEEKDAYS_UA.map((wd) => (
          <div key={wd} className="py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Сітка днів */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((item, idx) => {
          if (!item) {
            return <div key={`empty-${idx}`} className="h-9" />;
          }

          const hasPlans = Boolean(plansByDate[item.iso]?.length);
          const isSelected = item.iso === selectedDate;
          const isToday = item.iso === todayISO;

          return (
            <button
              key={item.iso}
              type="button"
              onClick={() => setSelectedDate(item.iso)}
              className={`press-btn h-9 rounded-lg text-xs font-medium flex flex-col items-center justify-center relative border ${
                isSelected
                  ? `${primaryBtnClass} shadow-md`
                  : isChristmas
                  ? 'bg-red-950/50 border-red-300/15 text-red-100 hover:bg-red-900/50'
                  : 'bg-slate-900/80 border-slate-800/80 text-slate-200 hover:bg-slate-800'
              } ${isToday && !isSelected ? 'ring-1 ring-emerald-400/70' : ''}`}
            >
              <span>{item.day}</span>
              {hasPlans && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? 'bg-white' : isChristmas ? 'bg-amber-300' : 'bg-indigo-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Форма додавання плану на обрану дату */}
      <form onSubmit={handleAddPlan} className="space-y-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-[11px]">
          <span className={isChristmas ? 'text-red-200/80' : 'text-slate-400'}>
            Дата: <strong className="text-white">{selectedDate}</strong>
          </span>
          <button
            type="button"
            onClick={() => setSelectedDate(todayISO)}
            className={`underline ${isChristmas ? 'text-red-200' : 'text-indigo-400'}`}
          >
            Сьогодні
          </button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Що хочемо подивитися? (наприклад: фільм або серіал)"
          className={`w-full rounded-lg px-3 py-2 text-xs text-white focus:outline-none border ${
            isChristmas
              ? 'bg-red-950/85 border-red-300/25 focus:border-red-200 placeholder:text-red-200/50'
              : 'bg-slate-900 border-slate-700 focus:border-indigo-500 placeholder:text-slate-500'
          }`}
        />

        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Нотатка (о котрій, сезон, платформа...)"
            className={`flex-1 rounded-lg px-3 py-2 text-xs text-white focus:outline-none border ${
              isChristmas
                ? 'bg-red-950/85 border-red-300/25 focus:border-red-200 placeholder:text-red-200/50'
                : 'bg-slate-900 border-slate-700 focus:border-indigo-500 placeholder:text-slate-500'
            }`}
          />

          <button
            type="submit"
            disabled={saving || !title.trim()}
            className={`press-btn px-3.5 py-2 rounded-lg text-xs font-medium inline-flex items-center space-x-1 border disabled:opacity-50 ${primaryBtnClass}`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.2} />
            ) : (
              <Plus className="w-4 h-4" strokeWidth={2.4} />
            )}
            <span>Додати</span>
          </button>
        </div>
      </form>

      {/* Список планів на обраний день */}
      <div className="space-y-2 pt-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider opacity-75">
          Плани на {selectedDate}
        </div>

        {loading ? (
          <div className="py-4 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin opacity-70" strokeWidth={2.2} />
          </div>
        ) : selectedDayPlans.length === 0 ? (
          <p className={`text-xs italic py-2 ${isChristmas ? 'text-red-200/60' : 'text-slate-500'}`}>
            На цей день ще нічого не заплановано.
          </p>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {selectedDayPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl p-2.5 border flex items-start justify-between gap-2 text-xs ${
                  isChristmas
                    ? 'bg-red-950/80 border-red-300/20'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleDone(plan)}
                  className="press-btn mt-0.5 shrink-0 text-emerald-400"
                  title={plan.is_done ? 'Позначити як непереглянуте' : 'Позначити як переглянуте'}
                >
                  {plan.is_done ? (
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2.2} />
                  ) : (
                    <Circle className="w-4 h-4 opacity-70" strokeWidth={2.2} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold flex items-center gap-1.5 ${
                      plan.is_done ? 'line-through opacity-60' : 'text-white'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5 shrink-0 opacity-80" strokeWidth={2.2} />
                    <span className="truncate">{plan.title}</span>
                  </div>
                  {plan.note && (
                    <p className={`mt-0.5 text-[11px] ${isChristmas ? 'text-red-200/80' : 'text-slate-400'}`}>
                      {plan.note}
                    </p>
                  )}
                  <span className="block mt-1 text-[10px] opacity-60">
                    Додав(-ла): {plan.author_name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePlan(plan.id)}
                  className="press-btn p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 shrink-0"
                  title="Видалити план"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}