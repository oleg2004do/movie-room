import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Cast,
  LogOut,
  SendHorizontal,
  SwitchCamera,
  Snowflake,
  MoonStar,
  Film,
} from 'lucide-react';
import Snowfall from './Snowfall';

export default function Room({ user, theme = 'default', setTheme, onLeave }) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (фронтальна) або 'environment' (основна)
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);

  const isChristmas = theme === 'christmas';

  // Перевірка, чи підтримує пристрій і браузер демонстрацію екрана
  const canShareScreen =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function';

  // Прив'язка потоку камери до <video>
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isCamOn]);

  // Прив'язка потоку демонстрації екрана до головного плеєра
  useEffect(() => {
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Очищення потоків при виході з кімнати
  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      screenStream?.getTracks().forEach((track) => track.stop());
    };
  }, [localStream, screenStream]);

  const toggleTheme = () => {
    if (!setTheme) return;
    setTheme(isChristmas ? 'default' : 'christmas');
  };

  // Увімкнення / вимкнення камери
  const toggleCamera = async (customFacingMode = facingMode) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Браузер заблокував доступ до камери. Відкрий сайт у звичайному браузері по HTTPS.');
      return;
    }

    if (isCamOn && customFacingMode === facingMode) {
      localStream?.getVideoTracks().forEach((track) => track.stop());
      setIsCamOn(false);
    } else {
      try {
        localStream?.getVideoTracks().forEach((track) => track.stop());

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: customFacingMode },
          audio: isMicOn,
        });

        setLocalStream(stream);
        setFacingMode(customFacingMode);
        setIsCamOn(true);
      } catch (err) {
        console.error('Помилка доступу до камери:', err);
        alert('Не вдалося отримати доступ до камери. Перевір дозволи у налаштуваннях браузера.');
      }
    }
  };

  // Перемикання фронтальної / основної камери на телефоні
  const switchPhoneCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    toggleCamera(nextMode);
  };

  // Увімкнення / вимкнення мікрофона
  const toggleMic = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Мікрофон доступний лише у захищеному браузері по HTTPS.');
      return;
    }

    if (isMicOn) {
      localStream?.getAudioTracks().forEach((track) => track.stop());
      setIsMicOn(false);
    } else {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (localStream) {
          audioStream.getAudioTracks().forEach((track) => localStream.addTrack(track));
        } else {
          setLocalStream(audioStream);
        }
        setIsMicOn(true);
      } catch (err) {
        alert('Не вдалося увімкнути мікрофон: ' + err.message);
      }
    }
  };

  // Демонстрація екрана (працює на ПК/ноутбуці)
  const toggleScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      return;
    }

    if (!canShareScreen) return;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      stream.getVideoTracks()[0].onended = () => setScreenStream(null);
      setScreenStream(stream);
    } catch (err) {
      console.error('Трансляцію скасовано:', err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: user.name, text: newMessage }]);
    setNewMessage('');
  };

  const panelClass = isChristmas
    ? 'bg-red-950/70 border-red-300/25 backdrop-blur-md'
    : 'bg-slate-900/60 border-slate-800';

  const innerSurfaceClass = isChristmas
    ? 'bg-red-950/85 border-red-300/20'
    : 'bg-slate-950 border-slate-800';

  const primaryBtnClass = isChristmas
    ? 'bg-red-700 hover:bg-red-600 border-red-300/30 text-white shadow-lg shadow-red-950/40'
    : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-600/20';

  const idleBtnClass = isChristmas
    ? 'bg-red-950/70 border-red-300/20 text-red-100 hover:bg-red-900/70'
    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

  return (
    <div
      className={`min-h-screen text-white p-4 flex flex-col lg:flex-row gap-4 relative transition-colors duration-300 ${
        isChristmas ? 'christmas-theme-bg' : 'bg-slate-950'
      }`}
    >
      {isChristmas && <Snowfall />}

      {/* ЛІВА ЧАСТИНА: Головний екран перегляду та нижня панель керування */}
      <div className={`flex-1 flex flex-col justify-between border rounded-2xl p-4 relative z-10 ${panelClass}`}>
        {/* Область плеєра / демонстрації екрана */}
        <div
          className={`flex-1 border rounded-xl flex items-center justify-center relative overflow-hidden min-h-[360px] ${innerSurfaceClass}`}
        >
          {screenStream ? (
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-6 max-w-md space-y-3">
              <div
                className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border ${
                  isChristmas
                    ? 'bg-red-900/45 border-red-300/25 text-red-200'
                    : 'bg-slate-900 border-slate-800 text-indigo-400/80'
                }`}
              >
                <Film className="w-8 h-8" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-white">Ніхто зараз не транслює екран</h3>
              {canShareScreen ? (
                <>
                  <p className={`text-xs ${isChristmas ? 'text-red-200/80' : 'text-slate-400'}`}>
                    Ти чи Христя можете у будь-який момент запустити фільм чи відео з ютубу.
                  </p>
                  <button
                    onClick={toggleScreenShare}
                    className={`press-btn group mt-2 text-xs font-medium px-4 py-2.5 rounded-xl inline-flex items-center space-x-2 border ${primaryBtnClass}`}
                  >
                    <Cast className="w-4 h-4 transition-transform group-hover:scale-110" strokeWidth={2.2} />
                    <span>Поділитися своїм екраном</span>
                  </button>
                </>
              ) : (
                <p className={`text-xs ${isChristmas ? 'text-red-200/80' : 'text-slate-400'}`}>
                  Трансляцію екрана можна запустити з ноутбука або ПК. З телефона зручно дивитися стрім і вмикати камеру.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Нижня панель кнопок */}
        <div className="pt-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Кнопка мікрофона */}
            <button
              onClick={toggleMic}
              className={`press-btn group p-3 rounded-xl border ${
                isMicOn ? primaryBtnClass : idleBtnClass
              }`}
              title={isMicOn ? 'Вимкнути мікрофон' : 'Увімкнути мікрофон'}
            >
              {isMicOn ? (
                <Mic className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={2.2} />
              ) : (
                <MicOff className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={2.2} />
              )}
            </button>

            {/* Кнопка камери */}
            <button
              onClick={() => toggleCamera()}
              className={`press-btn group p-3 rounded-xl border ${
                isCamOn ? primaryBtnClass : idleBtnClass
              }`}
              title={isCamOn ? 'Вимкнути камеру' : 'Увімкнути камеру'}
            >
              {isCamOn ? (
                <Video className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={2.2} />
              ) : (
                <VideoOff className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={2.2} />
              )}
            </button>

            {/* Кнопка перемикання камери (зручно на телефоні) */}
            {isCamOn && (
              <button
                onClick={switchPhoneCamera}
                className={`press-btn group p-3 rounded-xl border ${idleBtnClass}`}
                title="Перемкнути камеру (фронтальна / основна)"
              >
                <SwitchCamera className="w-5 h-5 transition-transform group-hover:rotate-180 duration-300" strokeWidth={2.2} />
              </button>
            )}

            {/* Швидкий перемикач теми прямо в кімнаті */}
            {setTheme && (
              <button
                type="button"
                onClick={toggleTheme}
                className={`press-btn group px-3.5 py-2.5 rounded-xl border text-xs font-medium inline-flex items-center space-x-2 ${idleBtnClass}`}
                title="Перемкнути тему оформлення"
              >
                {isChristmas ? (
                  <>
                    <Snowflake className="w-4 h-4 transition-transform group-hover:rotate-45" strokeWidth={2.2} />
                    <span>Новорічна</span>
                  </>
                ) : (
                  <>
                    <MoonStar className="w-4 h-4 transition-transform group-hover:-rotate-12" strokeWidth={2.2} />
                    <span>Звичайна</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {canShareScreen && (
              <button
                onClick={toggleScreenShare}
                className={`press-btn group text-xs font-medium px-4 py-3 rounded-xl flex items-center space-x-2 border ${primaryBtnClass}`}
              >
                <Cast className="w-4 h-4 transition-transform group-hover:scale-110" strokeWidth={2.2} />
                <span>{screenStream ? 'Зупинити показ' : 'Поділитися екраном'}</span>
              </button>
            )}

            <button
              onClick={onLeave}
              className="press-btn group p-3 bg-red-600/15 hover:bg-red-600 text-red-300 hover:text-white rounded-xl border border-red-400/25"
              title="Вийти в меню"
            >
              <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      {/* ПРАВА ЧАСТИНА: Камери учасників + Чат */}
      <div className="w-full lg:w-80 flex flex-col gap-4 relative z-10">
        {/* Блок камер учасників */}
        <div className={`border rounded-2xl p-4 space-y-3 ${panelClass}`}>
          <h4
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isChristmas ? 'text-red-200/85' : 'text-slate-400'
            }`}
          >
            Камери учасників
          </h4>

          {/* Картка ТВОЄЇ камери (показує відео або аватарку, коли камера вимкнена) */}
          <div
            className={`relative border rounded-xl aspect-video overflow-hidden flex items-center justify-center ${innerSurfaceClass}`}
          >
            {isCamOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
            ) : user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className={`w-20 h-20 rounded-full object-cover border-2 shadow-lg ${
                  isChristmas ? 'border-red-200/80' : 'border-indigo-500/60'
                }`}
              />
            ) : (
              <div
                className={`w-16 h-16 rounded-full border flex items-center justify-center text-lg font-bold ${
                  isChristmas
                    ? 'bg-red-800/40 border-red-300/30 text-red-100'
                    : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                }`}
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}

            <div
              className={`absolute bottom-2 left-2 backdrop-blur-sm px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                isChristmas ? 'bg-red-950/90 border-red-300/25' : 'bg-slate-950/85 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-medium text-white">{user.name} (Ти)</span>
            </div>
          </div>

          {/* Картка другого учасника */}
          <div
            className={`relative border rounded-xl aspect-video overflow-hidden flex items-center justify-center ${innerSurfaceClass}`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold ${
                isChristmas ? 'bg-red-900/60 text-red-200' : 'bg-slate-800/80 text-slate-400'
              }`}
            >
              Х
            </div>
            <div
              className={`absolute bottom-2 left-2 backdrop-blur-sm px-2.5 py-1 rounded-lg border ${
                isChristmas ? 'bg-red-950/90 border-red-300/25' : 'bg-slate-950/85 border-slate-800'
              }`}
            >
              <span className={`text-[11px] font-medium ${isChristmas ? 'text-red-100' : 'text-slate-300'}`}>
                Очікування учасника...
              </span>
            </div>
          </div>
        </div>

        {/* Чат кімнати */}
        <div className={`flex-1 border rounded-2xl p-4 flex flex-col justify-between min-h-[260px] ${panelClass}`}>
          <h4
            className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${
              isChristmas ? 'text-red-200/85' : 'text-slate-400'
            }`}
          >
            Чат кімнати
          </h4>

          <div className="flex-1 overflow-y-auto space-y-2 my-2 pr-1">
            {messages.length === 0 ? (
              <p
                className={`text-xs italic text-center my-auto pt-12 ${
                  isChristmas ? 'text-red-200/60' : 'text-slate-500'
                }`}
              >
                Тут будуть повідомлення...
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`border rounded-xl p-2.5 text-xs ${
                    isChristmas ? 'bg-red-950/85 border-red-300/20' : 'bg-slate-950 border-slate-800/80'
                  }`}
                >
                  <span
                    className={`font-semibold block mb-0.5 ${
                      isChristmas ? 'text-red-200' : 'text-indigo-400'
                    }`}
                  >
                    {msg.sender}
                  </span>
                  <span className={isChristmas ? 'text-red-50' : 'text-slate-200'}>{msg.text}</span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-2">
            <input
              type="text"
              placeholder="Написати повідомлення..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={`flex-1 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                isChristmas
                  ? 'bg-red-950/85 border-red-300/25 focus:border-red-200'
                  : 'bg-slate-950 border-slate-800 focus:border-indigo-500'
              }`}
            />
            <button
              type="submit"
              className={`press-btn group p-2.5 rounded-xl ${primaryBtnClass}`}
              title="Надіслати повідомлення"
            >
              <SendHorizontal className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}