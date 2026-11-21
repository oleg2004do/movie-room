import React from 'react';
import { User } from 'lucide-react';

export default function ProfileSelect({ onSelectProfile }) {
  const profiles = [
    { id: 'oleh', name: 'Олег (Стрімер)', role: 'Головний компʼютер / Трансляція екрана' },
    { id: 'khrystia', name: 'Христя', role: 'Глядач / Спільний перегляд' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-3xl font-bold mb-2">Наш Кінотеатр 🎬</h1>
        <p className="text-slate-400 mb-8">Обери свій профіль, щоб зайти в кімнату</p>

        <div className="space-y-4">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProfile(p)}
              className="w-full flex items-center p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group text-left"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold group-hover:scale-105 transition-transform">
                {p.name[0]}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-xs text-slate-400">{p.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}