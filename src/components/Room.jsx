import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, LogOut, Send, RefreshCw
} from 'lucide-react';

export default function Room({ user, onLeave }) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (фронтальна) або 'environment' (основна)
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);

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

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col lg:flex-row gap-4">
      
      {/* ЛІВА ЧАСТИНА: Головний екран перегляду та нижня панель керування */}
      <div className="flex-1 flex flex-col justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        
        {/* Область плеєра / демонстрації екрана */}
        <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-center relative overflow-hidden min-h-[360px]">
          {screenStream ? (
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-6 max-w-md space-y-3">
              <MonitorUp className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">Ніхто зараз не транслює екран</h3>
              {canShareScreen ? (
                <>
                  <p className="text-xs text-slate-400">
                    Ти чи Христя можете у будь-який момент запустити фільм чи відео з ютубу.
                  </p>
                  <button
                    onClick={toggleScreenShare}
                    className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl inline-flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <MonitorUp className="w-4 h-4" />
                    <span>Поділитися своїм екраном</span>
                  </button>
                </>
              ) : (
                <p className="text-xs text-slate-400">
                  Трансляцію екрана можна запустити з ноутбука або ПК. З телефона зручно дивитися стрім і вмикати камеру.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Нижня панель кнопок */}
        <div className="pt-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            {/* Кнопка мікрофона */}
            <button
              onClick={toggleMic}
              className={`p-3 rounded-xl border transition-colors ${
                isMicOn
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
              title={isMicOn ? 'Вимкнути мікрофон' : 'Увімкнути мікрофон'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Кнопка камери */}
            <button
              onClick={() => toggleCamera()}
              className={`p-3 rounded-xl border transition-colors ${
                isCamOn
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
              title={isCamOn ? 'Вимкнути камеру' : 'Увімкнути камеру'}
            >
              {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Кнопка перемикання камери (зручно на телефоні) */}
            {isCamOn && (
              <button
                onClick={switchPhoneCamera}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors"
                title="Перемкнути камеру (фронтальна / основна)"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {canShareScreen && (
              <button
                onClick={toggleScreenShare}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-3 rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
              >
                <MonitorUp className="w-4 h-4" />
                <span>{screenStream ? 'Зупинити показ' : 'Поділитися екраном'}</span>
              </button>
            )}

            <button
              onClick={onLeave}
              className="p-3 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl border border-red-500/20 transition-colors"
              title="Вийти в меню"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ПРАВА ЧАСТИНА: Камери учасників + Чат */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        
        {/* Блок камер учасників */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Камери учасників
          </h4>

          {/* Картка ТВОЄЇ камери (показує відео або аватарку, коли камера вимкнена) */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-xl aspect-video overflow-hidden flex items-center justify-center">
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
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/60 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg font-bold text-indigo-400">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}

            <div className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-medium text-white">{user.name} (Ти)</span>
            </div>
          </div>

          {/* Картка другого учасника */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-xl aspect-video overflow-hidden flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-sm font-bold text-slate-400">
              Х
            </div>
            <div className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-300">Очікування учасника...</span>
            </div>
          </div>
        </div>

        {/* Чат кімнати */}
        <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[260px]">
          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Чат кімнати
          </h4>

          <div className="flex-1 overflow-y-auto space-y-2 my-2 pr-1">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center my-auto pt-12">
                Тут будуть повідомлення...
              </p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 text-xs">
                  <span className="font-semibold text-indigo-400 block mb-0.5">{msg.sender}</span>
                  <span className="text-slate-200">{msg.text}</span>
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
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}