import React, { useState } from 'react';
import {
  Cookie,
  Award,
  Gift,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Send,
  Lock,
  CheckCircle2,
  Trash2,
  Star,
} from 'lucide-react';
import ImageCropModal from './ImageCropModal';

const ACHIEVEMENTS_LIST = [
  {
    id: 'first-profile',
    title: 'Перший профіль',
    desc: 'Створено профіль у спільній кінокімнаті.',
    reward: '+10 🍪',
  },
  {
    id: 'first-20min',
    title: 'Перші 20 хвилин разом',
    desc: 'Проведено 20 хвилин у кімнаті та отримано перші печеньки.',
    reward: '+5 🍪',
  },
  {
    id: 'cookie-baker',
    title: 'Печеньковий гурман',
    desc: 'Накопичено або зібрано щонайменше 25 печеньок.',
    reward: 'Значок',
  },
  {
    id: 'christmas-mood',
    title: 'Святковий настрій',
    desc: 'Активовано новорічну тему з пряниками та снігом.',
    reward: 'Стиль',
  },
  {
    id: 'santa-hat',
    title: 'У новорічній шапці',
    desc: 'Придбано та одягнуто святкову шапку на аватарку.',
    reward: 'Образ',
  },
  {
    id: 'gift-sender',
    title: 'Щедре серце',
    desc: 'Надіслано подарунок (фото, відео або нагороду) у скарбничку.',
    reward: 'Нагорода',
  },
];

export default function TreasuryPage({
  user,
  theme = 'default',
  cookies = 0,
  unlockedIds = [],
  gifts = [],
  onSendGift,
  onDeleteGift,
}) {
  const [subTab, setSubTab] = useState('gifts'); // 'gifts' | 'achievements'
  const [giftType, setGiftType] = useState('reward'); // 'reward' | 'photo' | 'video'
  const [giftTitle, setGiftTitle] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFileName, setMediaFileName] = useState('');
  const [cropPhotoSrc, setCropPhotoSrc] = useState(null);

  const isChristmas = theme === 'christmas';

  const boxClass = isChristmas
    ? 'bg-red-950/65 border-red-300/20'
    : 'bg-slate-950/85 border-slate-800';

  const cardClass = isChristmas
    ? 'bg-red-950/80 border-red-300/20'
    : 'bg-slate-900/90 border-slate-800';

  const inputClass = isChristmas
    ? 'bg-red-950/85 border-red-300/25 focus:border-red-200 placeholder:text-red-200/50'
    : 'bg-slate-900 border-slate-700 focus:border-indigo-500 placeholder:text-slate-500';

  const activePillClass = isChristmas
    ? 'bg-red-700 border-red-200/50 text-white'
    : 'bg-indigo-600 border-indigo-400/50 text-white';

  const inactivePillClass = isChristmas
    ? 'bg-red-950/50 border-red-300/15 text-red-100 hover:bg-red-900/50'
    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFileName(file.name);

    if (giftType === 'photo') {
      setCropPhotoSrc(URL.createObjectURL(file));
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitGift = (e) => {
    e.preventDefault();
    if (!giftTitle.trim() && !giftMessage.trim() && !mediaUrl.trim()) return;

    onSendGift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: giftType,
      title:
        giftTitle.trim() ||
        (giftType === 'photo'
          ? 'Фото-сюрприз'
          : giftType === 'video'
          ? 'Відео-подарунок'
          : 'Особлива нагорода'),
      message: giftMessage.trim(),
      mediaUrl: mediaUrl.trim(),
      mediaFileName,
      senderName: user?.name || 'Oleg',
      createdAt: new Date().toLocaleDateString('uk-UA'),
    });

    setGiftTitle('');
    setGiftMessage('');
    setMediaUrl('');
    setMediaFileName('');
    setSubTab('gifts');
  };

  return (
    <div className="space-y-4">
      {cropPhotoSrc && (
        <ImageCropModal
          imageSrc={cropPhotoSrc}
          aspect={4 / 3}
          allowAspectSwitch={true}
          theme={theme}
          onCancel={() => setCropPhotoSrc(null)}
          onConfirm={({ dataUrl }) => {
            setMediaUrl(dataUrl);
            setCropPhotoSrc(null);
          }}
        />
      )}

      {/* Верхня панель скарбнички */}
      <div className={`rounded-2xl p-4 border flex flex-wrap items-center justify-between gap-3 ${boxClass}`}>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setSubTab('gifts')}
            className={`press-btn px-3.5 py-2 rounded-xl text-xs font-semibold border inline-flex items-center space-x-2 ${
              subTab === 'gifts' ? activePillClass : inactivePillClass
            }`}
          >
            <Gift className="w-4 h-4" strokeWidth={2.2} />
            <span>Подарунки ({gifts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('achievements')}
            className={`press-btn px-3.5 py-2 rounded-xl text-xs font-semibold border inline-flex items-center space-x-2 ${
              subTab === 'achievements' ? activePillClass : inactivePillClass
            }`}
          >
            <Award className="w-4 h-4" strokeWidth={2.2} />
            <span>
              Досягнення ({unlockedIds.length}/{ACHIEVEMENTS_LIST.length})
            </span>
          </button>
        </div>

        <div
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center space-x-1.5 ${
            isChristmas
              ? 'bg-amber-500/15 border-amber-300/35 text-amber-200'
              : 'bg-amber-500/10 border-amber-400/25 text-amber-300'
          }`}
        >
          <Cookie className="w-4 h-4" strokeWidth={2.2} />
          <span>{cookies} печеньок</span>
        </div>
      </div>

      {/* Форма відправлення подарунка */}
      <form onSubmit={handleSubmitGift} className={`rounded-2xl p-4 border space-y-3 ${boxClass}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-85">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} />
            Відправити подарунок у скарбничку
          </span>
          <span className="text-[11px] opacity-70">Зберігається назавжди</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setGiftType('reward')}
            className={`press-btn py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 ${
              giftType === 'reward' ? activePillClass : inactivePillClass
            }`}
          >
            <Star className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Нагорода</span>
          </button>

          <button
            type="button"
            onClick={() => setGiftType('photo')}
            className={`press-btn py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 ${
              giftType === 'photo' ? activePillClass : inactivePillClass
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Фото</span>
          </button>

          <button
            type="button"
            onClick={() => setGiftType('video')}
            className={`press-btn py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 ${
              giftType === 'video' ? activePillClass : inactivePillClass
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Відео</span>
          </button>
        </div>

        <input
          type="text"
          value={giftTitle}
          onChange={(e) => setGiftTitle(e.target.value)}
          placeholder="Назва подарунка або нагороди (наприклад: «Найкращий глядач вечора»)"
          className={`w-full rounded-xl px-3 py-2 text-xs text-white focus:outline-none border ${inputClass}`}
        />

        <textarea
          rows={2}
          value={giftMessage}
          onChange={(e) => setGiftMessage(e.target.value)}
          placeholder="Тепле побажання або опис сюрпризу..."
          className={`w-full rounded-xl px-3 py-2 text-xs text-white focus:outline-none border resize-none ${inputClass}`}
        />

        {(giftType === 'photo' || giftType === 'video') && (
          <div className="space-y-2">
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={
                giftType === 'photo'
                  ? 'Встав посилання на фото (https://...) або обери файл нижче'
                  : 'Встав посилання на відео (.mp4 / https://...) або обери файл нижче'
              }
              className={`w-full rounded-xl px-3 py-2 text-xs text-white focus:outline-none border ${inputClass}`}
            />

            <label
              className={`press-btn flex items-center justify-center w-full border border-dashed rounded-xl px-3 py-2 cursor-pointer text-xs ${inactivePillClass}`}
            >
              <span>
                {mediaFileName
                  ? `Обрано файл: ${mediaFileName}`
                  : giftType === 'photo'
                  ? 'Обрати фото та налаштувати кадр'
                  : 'Обрати відео з пристрою'}
              </span>
              <input
                type="file"
                accept={giftType === 'photo' ? 'image/*' : 'video/*'}
                onChange={handleFilePick}
                className="hidden"
              />
            </label>
          </div>
        )}

        <button
          type="submit"
          className={`press-btn w-full py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 shadow-md ${activePillClass}`}
        >
          <Send className="w-4 h-4" strokeWidth={2.2} />
          <span>Покласти подарунок у скарбничку</span>
        </button>
      </form>

      {/* Підвкладка ПОДАРУНКИ */}
      {subTab === 'gifts' && (
        <div className={`rounded-2xl p-4 border space-y-3 ${boxClass}`}>
          <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Колекція подарунків та нагород
          </div>

          {gifts.length === 0 ? (
            <p className="text-xs italic opacity-65 py-4 text-center">
              Поки що подарунків немає. Відправ перший сюрприз або нагороду вище!
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {gifts.map((gift) => (
                <div
                  key={gift.id}
                  className={`rounded-xl p-3.5 border space-y-2.5 ${cardClass}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-300/25">
                          {gift.type === 'photo'
                            ? 'Фото-подарунок'
                            : gift.type === 'video'
                            ? 'Відео-подарунок'
                            : 'Нагорода'}
                        </span>
                        <span className="text-[11px] opacity-65">
                          від {gift.senderName} • {gift.createdAt}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{gift.title}</h4>
                    </div>

                    {onDeleteGift && (
                      <button
                        type="button"
                        onClick={() => onDeleteGift(gift.id)}
                        className="press-btn p-1.5 rounded-lg text-red-300 hover:bg-red-500/20 shrink-0"
                        title="Видалити подарунок"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                      </button>
                    )}
                  </div>

                  {gift.message && (
                    <p className="text-xs leading-relaxed opacity-90">{gift.message}</p>
                  )}

                  {gift.type === 'photo' && gift.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 max-h-64 flex items-center justify-center">
                      <img
                        src={gift.mediaUrl}
                        alt={gift.title}
                        className="w-full max-h-64 object-contain"
                      />
                    </div>
                  )}

                  {gift.type === 'video' && gift.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/60">
                      <video
                        src={gift.mediaUrl}
                        controls
                        playsInline
                        className="w-full max-h-64 object-contain"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Підвкладка ДОСЯГНЕННЯ */}
      {subTab === 'achievements' && (
        <div className={`rounded-2xl p-4 border space-y-2.5 ${boxClass}`}>
          <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Усі досягнення скарбнички
          </div>

          <div className="space-y-2">
            {ACHIEVEMENTS_LIST.map((ach) => {
              const unlocked = unlockedIds.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`rounded-xl p-3 border flex items-center justify-between gap-3 text-xs ${cardClass} ${
                    unlocked ? '' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <div
                      style={{ width: 34, height: 34 }}
                      className={`rounded-xl flex items-center justify-center shrink-0 border ${
                        unlocked
                          ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {unlocked ? (
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2.2} />
                      ) : (
                        <Lock className="w-4 h-4" strokeWidth={2.2} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white">{ach.title}</div>
                      <div className="text-[11px] opacity-75 mt-0.5">{ach.desc}</div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 shrink-0">
                    {ach.reward}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}