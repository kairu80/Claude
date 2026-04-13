import React, { useEffect, useState, useCallback } from 'react';
import { Confetti } from './Confetti';
import { Kid, getBirthdayInfo, formatAge, getKidTheme } from '../types';

// ─── Birthday Countdown Banner ────────────────────────────────────────────────

export function BirthdayCountdown({ kid }: { kid: Kid }) {
  const info = getBirthdayInfo(kid.birthday);
  const theme = getKidTheme(kid);

  if (!info.isSoon || info.isToday) return null;

  return (
    <div className={`rounded-2xl px-4 py-3 bg-gradient-to-r ${theme.gradient} text-white shadow-md animate-fade-in`}>
      <div className="flex items-center gap-3">
        <div className="text-3xl animate-float">🎂</div>
        <div>
          <p className="font-black text-base">
            {kid.name}'s birthday is in {info.daysUntil} day{info.daysUntil !== 1 ? 's' : ''}!
          </p>
          <p className="text-white/80 text-xs">
            {info.daysUntil === 1 ? '🎉 Tomorrow is the big day!' : `🎈 ${info.daysUntil} more sleeps to go!`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Birthday Celebration Overlay ─────────────────────────────────────────────

export function BirthdayCelebration({ kid, onDone }: { kid: Kid; onDone: () => void }) {
  const [phase, setPhase] = useState<'celebration' | 'fading'>('celebration');
  const info = getBirthdayInfo(kid.birthday);
  const theme = getKidTheme(kid);
  const ageStr = formatAge(info);

  useEffect(() => {
    const t = setTimeout(() => setPhase('fading'), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === 'fading') {
      const t = setTimeout(onDone, 800);
      return () => clearTimeout(t);
    }
  }, [phase, onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-800 ${phase === 'fading' ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.95), rgba(236,72,153,0.95))' }}
      onClick={onDone}
    >
      <Confetti />

      {/* Floating theme emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {theme.birthdayEmojis.map((emoji, i) => (
          <div
            key={i}
            className="absolute text-4xl animate-float"
            style={{
              left: `${5 + (i * 10) % 90}%`,
              top: `${10 + (i * 7) % 70}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + (i % 3)}s`,
              opacity: 0.4,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="relative z-10 text-center px-8 animate-bounce-in">
        {/* Big emoji */}
        <div className="text-8xl mb-4 animate-wiggle">🎂</div>

        {/* Birthday text */}
        <div className="bg-white rounded-3xl shadow-2xl px-10 py-8 max-w-sm mx-auto border-4 border-yellow-400">
          <div className="flex justify-center gap-2 mb-3 text-2xl">
            {theme.birthdayEmojis.slice(0, 5).map((e, i) => (
              <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
            ))}
          </div>
          <h1 className="text-4xl font-black gradient-text mb-2">
            Happy Birthday!
          </h1>
          <h2 className="text-3xl font-black text-purple-700 mb-3">
            {kid.avatar} {kid.name}!
          </h2>

          {info.age > 0 && (
            <div className="bg-yellow-100 text-yellow-700 rounded-2xl px-4 py-2 font-black text-xl mb-3">
              🎉 You are {ageStr}! 🎉
            </div>
          )}

          <p className="text-gray-500 text-sm">{theme.birthdayMessage}</p>

          <div className="mt-4 text-xs text-gray-400">Tap anywhere to continue</div>
        </div>

        {/* Balloon row */}
        <div className="flex justify-center gap-3 mt-6 text-5xl">
          {['🎈','🎊','🎁','🎊','🎈'].map((e, i) => (
            <span key={i} className="animate-float" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Birthday header strip for Kid view ───────────────────────────────────────

export function BirthdayStrip({ kid }: { kid: Kid }) {
  const info = getBirthdayInfo(kid.birthday);
  const theme = getKidTheme(kid);

  if (!info.isToday) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white py-2 px-4 text-center animate-fade-in">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="text-xl animate-wiggle">🎂</span>
        <span className="font-black text-base">
          Happy Birthday, {kid.name}! You're {formatAge(info)} today!
        </span>
        {theme.birthdayEmojis.slice(0, 3).map((e, i) => (
          <span key={i} className="text-lg animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
        ))}
      </div>
    </div>
  );
}
