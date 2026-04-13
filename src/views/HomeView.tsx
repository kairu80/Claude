import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getKidColor } from '../types';
import { Shield, Users, Star } from 'lucide-react';

type HomeStep = 'landing' | 'kid-select' | 'parent-pin';

export function HomeView() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<HomeStep>('landing');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  function handleKidSelect(kidId: string) {
    dispatch({ type: 'SET_VIEW', view: 'kid', kidId });
  }

  function handleParentLogin() {
    if (pin === state.parentPin) {
      dispatch({ type: 'SET_VIEW', view: 'parent' });
    } else {
      setPinError(true);
      setPin('');
      setTimeout(() => setPinError(false), 1500);
    }
  }

  const totalChoresThisWeek = state.completions.filter(c => {
    const d = new Date(c.date);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0,0,0,0);
    return d >= startOfWeek;
  }).length;

  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 flex flex-col items-center justify-center p-6">
        {/* Floating stars decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['top-10 left-10', 'top-20 right-20', 'top-1/3 left-5', 'bottom-1/4 right-10', 'bottom-20 left-1/4'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} text-white/20 text-4xl animate-float`} style={{ animationDelay: `${i * 0.5}s` }}>
              {['⭐','✨','🌟','💫','⚡'][i]}
            </div>
          ))}
        </div>

        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in relative z-10">
          <div className="text-8xl mb-2 animate-float">🏆</div>
          <h1 className="text-6xl font-black text-white drop-shadow-lg tracking-tight">
            ChoreQuest
          </h1>
          <p className="text-white/80 text-xl mt-2 font-medium">
            Turn chores into adventures! ✨
          </p>
        </div>

        {/* Stats pill */}
        {totalChoresThisWeek > 0 && (
          <div className="flex items-center gap-2 bg-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm animate-slide-up">
            <Star size={16} className="fill-yellow-300 text-yellow-300" />
            <span>{totalChoresThisWeek} chores completed this week!</span>
            <Star size={16} className="fill-yellow-300 text-yellow-300" />
          </div>
        )}

        {/* Role selection cards */}
        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md animate-slide-up relative z-10">
          {/* Kids button */}
          <button
            onClick={() => setStep('kid-select')}
            className="flex-1 bg-white rounded-3xl p-6 text-center shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:animate-wiggle">🧒</div>
            <h2 className="text-2xl font-black text-purple-700">I'm a Kid!</h2>
            <p className="text-gray-500 text-sm mt-1">Check your chores & earn rewards</p>
            <div className="mt-3 flex justify-center gap-1">
              {state.kids.map(kid => (
                <span key={kid.id} className="text-xl">{kid.avatar}</span>
              ))}
            </div>
          </button>

          {/* Parent button */}
          <button
            onClick={() => setStep('parent-pin')}
            className="flex-1 bg-white rounded-3xl p-6 text-center shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:animate-wiggle">
              <Shield className="mx-auto text-purple-600" size={48} />
            </div>
            <h2 className="text-2xl font-black text-purple-700">Parent</h2>
            <p className="text-gray-500 text-sm mt-1">Manage chores & rewards</p>
            <div className="mt-3 flex justify-center">
              <span className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-semibold">PIN protected 🔒</span>
            </div>
          </button>
        </div>

        {/* Kid leaderboard preview */}
        {state.kids.length > 0 && (
          <div className="mt-8 w-full max-w-md animate-slide-up relative z-10">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-white" />
                <span className="text-white font-bold text-sm">Leaderboard</span>
              </div>
              {[...state.kids]
                .sort((a, b) => b.totalXP - a.totalXP)
                .map((kid, i) => {
                  const color = getKidColor(kid.colorName);
                  return (
                    <div key={kid.id} className="flex items-center gap-3 mb-2">
                      <span className="text-white font-black text-lg w-6">{['🥇','🥈','🥉'][i] ?? `${i+1}.`}</span>
                      <span className="text-2xl">{kid.avatar}</span>
                      <span className="text-white font-bold flex-1">{kid.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white`}>
                        ⭐ {kid.totalXP} XP
                      </span>
                      {kid.streak > 1 && (
                        <span className="text-sm">🔥{kid.streak}</span>
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

  if (step === 'kid-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 flex flex-col items-center justify-center p-6">
        <button
          onClick={() => setStep('landing')}
          className="absolute top-6 left-6 text-white/80 hover:text-white text-sm font-semibold flex items-center gap-1"
        >
          ← Back
        </button>

        <div className="text-center mb-8 animate-fade-in">
          <div className="text-5xl mb-3">👋</div>
          <h2 className="text-4xl font-black text-white">Who are you?</h2>
          <p className="text-white/70 mt-1">Pick your profile to get started!</p>
        </div>

        {state.kids.length === 0 ? (
          <div className="bg-white/20 rounded-2xl p-8 text-center text-white max-w-sm">
            <div className="text-4xl mb-3">🤔</div>
            <p className="font-bold text-lg">No kids added yet!</p>
            <p className="text-white/70 text-sm mt-1">Ask a parent to set up your profile first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-lg animate-slide-up">
            {state.kids.map(kid => {
              const color = getKidColor(kid.colorName);
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
              const todayDone = state.completions.filter(c => c.kidId === kid.id && c.date === todayStr).length;

              return (
                <button
                  key={kid.id}
                  onClick={() => handleKidSelect(kid.id)}
                  className="bg-white rounded-3xl p-5 text-center shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer group"
                >
                  <div className="text-5xl mb-2 group-hover:animate-wiggle">{kid.avatar}</div>
                  <div className="font-black text-xl text-gray-800">{kid.name}</div>
                  <div className={`text-sm font-bold mt-1 ${color.text}`}>Lv. {Math.min(10, Math.max(1, Math.floor(kid.totalXP / 100) + 1))}</div>
                  <div className="flex justify-center gap-2 mt-2 text-xs">
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">⭐ {kid.points}</span>
                    {kid.streak > 0 && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">🔥 {kid.streak}</span>}
                  </div>
                  {todayDone > 0 && (
                    <div className="mt-2 text-xs text-green-600 font-semibold">✅ {todayDone} done today</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Parent PIN screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
      <button
        onClick={() => setStep('landing')}
        className="absolute top-6 left-6 text-white/60 hover:text-white text-sm font-semibold flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="text-center mb-8 animate-fade-in">
        <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Shield size={40} className="text-white" />
        </div>
        <h2 className="text-4xl font-black text-white">Parent Login</h2>
        <p className="text-white/60 mt-1">Enter your 4-digit PIN</p>
      </div>

      <div className={`bg-white rounded-3xl p-8 shadow-2xl w-full max-w-xs animate-slide-up ${pinError ? 'animate-wiggle' : ''}`}>
        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-6">
          {[0,1,2,3].map(i => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                pin.length > i ? 'bg-purple-600 border-purple-600 scale-110' : 'border-gray-300'
              }`}
            />
          ))}
        </div>

        {pinError && (
          <p className="text-center text-red-500 text-sm font-bold mb-3 animate-bounce-in">
            ❌ Wrong PIN, try again!
          </p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((num, i) => (
            <button
              key={i}
              disabled={num === ''}
              onClick={() => {
                if (num === '⌫') {
                  setPin(p => p.slice(0, -1));
                } else if (typeof num === 'number' && pin.length < 4) {
                  const newPin = pin + num;
                  setPin(newPin);
                  if (newPin.length === 4) {
                    if (newPin === state.parentPin) {
                      dispatch({ type: 'SET_VIEW', view: 'parent' });
                    } else {
                      setPinError(true);
                      setTimeout(() => { setPin(''); setPinError(false); }, 1000);
                    }
                  }
                }
              }}
              className={`h-14 rounded-2xl text-xl font-black transition-all active:scale-90 ${
                num === ''
                  ? 'invisible'
                  : num === '⌫'
                  ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 active:bg-purple-200'
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs mt-4">Default PIN: 1234</p>
      </div>
    </div>
  );
}
