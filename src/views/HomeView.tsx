import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getKidColor, getKidTheme, getBirthdayInfo, formatAge, ParentProfile, Kid } from '../types';
import { BirthdayCelebration } from '../components/BirthdayBanner';
import { Users, Star } from 'lucide-react';

type HomeStep = 'landing' | 'kid-select' | 'kid-pin' | 'parent-select' | 'parent-pin';

export function HomeView() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<HomeStep>('landing');
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [selectedParent, setSelectedParent] = useState<ParentProfile | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [birthdayKid, setBirthdayKid] = useState<Kid | null>(null);

  const totalChoresThisWeek = state.completions.filter(c => {
    const d = new Date(c.date + 'T12:00:00');
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
  }).length;

  function resetToLanding() {
    setStep('landing');
    setSelectedKid(null);
    setSelectedParent(null);
    setPin('');
    setPinError(false);
  }

  function handleKidSelect(kid: Kid) {
    setSelectedKid(kid);
    setPin('');
    setPinError(false);
    setStep('kid-pin');
  }

  function handleParentSelect(parent: ParentProfile) {
    setSelectedParent(parent);
    setPin('');
    setPinError(false);
    setStep('parent-pin');
  }

  function submitKidPin(fullPin: string) {
    if (!selectedKid) return;
    if (fullPin === selectedKid.pin) {
      const bdInfo = getBirthdayInfo(selectedKid.birthday);
      if (bdInfo.isToday) {
        // Award birthday badge and show celebration
        dispatch({ type: 'AWARD_BADGE', kidId: selectedKid.id, badgeId: 'birthday_star' });
        setBirthdayKid(selectedKid);
      } else {
        dispatch({ type: 'SET_VIEW', view: 'kid', kidId: selectedKid.id });
      }
    } else {
      setPinError(true);
      setTimeout(() => { setPin(''); setPinError(false); }, 1000);
    }
  }

  function submitParentPin(fullPin: string) {
    if (!selectedParent) return;
    if (fullPin === selectedParent.pin) {
      dispatch({ type: 'SET_ACTIVE_PARENT', parentId: selectedParent.id });
      dispatch({ type: 'SET_VIEW', view: 'parent' });
    } else {
      setPinError(true);
      setTimeout(() => { setPin(''); setPinError(false); }, 1000);
    }
  }

  function handlePinDigit(digit: number | '⌫') {
    if (digit === '⌫') {
      setPin(p => p.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      if (step === 'kid-pin') submitKidPin(newPin);
      if (step === 'parent-pin') submitParentPin(newPin);
    }
  }

  // ── Landing ────────────────────────────────────────────────────────────────
  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { emoji: '⭐', pos: 'top-8 left-8', delay: '0s' },
            { emoji: '✨', pos: 'top-16 right-16', delay: '0.5s' },
            { emoji: '🎮', pos: 'top-1/3 left-4', delay: '1s' },
            { emoji: '🐎', pos: 'bottom-1/3 right-8', delay: '0.3s' },
            { emoji: '🍉', pos: 'bottom-20 left-1/4', delay: '0.8s' },
            { emoji: '🏆', pos: 'top-1/4 right-1/3', delay: '1.2s' },
          ].map((item, i) => (
            <div key={i} className={`absolute ${item.pos} text-white/20 text-3xl animate-float`} style={{ animationDelay: item.delay }}>
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in relative z-10">
          <div className="text-8xl mb-2 animate-float">🏆</div>
          <h1 className="text-6xl font-black text-white drop-shadow-lg">ChoreQuest</h1>
          <p className="text-white/80 text-xl mt-2 font-medium">Turn chores into adventures! ✨</p>
        </div>

        {/* Weekly stats pill */}
        {totalChoresThisWeek > 0 && (
          <div className="flex items-center gap-2 bg-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm animate-slide-up">
            <Star size={16} className="fill-yellow-300 text-yellow-300" />
            <span>{totalChoresThisWeek} chores completed this week!</span>
            <Star size={16} className="fill-yellow-300 text-yellow-300" />
          </div>
        )}

        {/* Role cards */}
        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md animate-slide-up relative z-10">
          <button
            onClick={() => setStep('kid-select')}
            className="flex-1 bg-white rounded-3xl p-6 text-center shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer group"
          >
            <div className="text-5xl mb-3 group-hover:animate-wiggle">🧒</div>
            <h2 className="text-2xl font-black text-purple-700">I'm a Kid!</h2>
            <p className="text-gray-500 text-sm mt-1">Check your chores & earn rewards</p>
            <div className="mt-3 flex justify-center gap-1">
              {state.kids.map(kid => <span key={kid.id} className="text-xl">{kid.avatar}</span>)}
            </div>
          </button>

          <button
            onClick={() => setStep('parent-select')}
            className="flex-1 bg-white rounded-3xl p-6 text-center shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer group"
          >
            <div className="flex justify-center gap-1 mb-3 group-hover:animate-wiggle">
              {state.parents.map(p => (
                <span key={p.id} className="text-4xl">{p.avatar}</span>
              ))}
            </div>
            <h2 className="text-2xl font-black text-purple-700">Parents</h2>
            <p className="text-gray-500 text-sm mt-1">Manage chores & rewards</p>
            <div className="mt-3 flex justify-center gap-2">
              {state.parents.map(p => (
                <span key={p.id} className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-semibold">{p.name}</span>
              ))}
            </div>
          </button>
        </div>

        {/* Leaderboard */}
        {state.kids.length > 0 && (
          <div className="mt-8 w-full max-w-md animate-slide-up relative z-10">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-white" />
                <span className="text-white font-bold text-sm">Family Leaderboard</span>
              </div>
              {[...state.kids].sort((a, b) => b.totalXP - a.totalXP).map((kid, i) => {
                const bdInfo = getBirthdayInfo(kid.birthday);
                return (
                  <div key={kid.id} className="flex items-center gap-3 mb-2">
                    <span className="text-white font-black text-lg w-6">{['🥇','🥈','🥉'][i] ?? `${i+1}.`}</span>
                    <span className="text-2xl">{kid.avatar}</span>
                    <span className="text-white font-bold flex-1">
                      {kid.name}
                      {bdInfo.isToday && <span className="ml-1">🎂</span>}
                      {bdInfo.isSoon && !bdInfo.isToday && <span className="ml-1 text-xs bg-yellow-400/80 text-yellow-900 px-1.5 py-0.5 rounded-full">{bdInfo.daysUntil}d 🎂</span>}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">⭐ {kid.totalXP} XP</span>
                    {kid.streak > 1 && <span className="text-sm">🔥{kid.streak}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Kid selection ──────────────────────────────────────────────────────────
  if (step === 'kid-select') {
    const today = new Date();
    const todayDateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 flex flex-col items-center justify-center p-6">
        <button onClick={resetToLanding} className="absolute top-6 left-6 text-white/80 hover:text-white text-sm font-semibold">← Back</button>

        <div className="text-center mb-8 animate-fade-in">
          <div className="text-5xl mb-3">👋</div>
          <h2 className="text-4xl font-black text-white">Who are you?</h2>
          <p className="text-white/70 mt-1">Pick your name to log in!</p>
        </div>

        {state.kids.length === 0 ? (
          <div className="bg-white/20 rounded-2xl p-8 text-white text-center">
            <div className="text-4xl mb-2">🤔</div>
            <p className="font-bold">No kids added yet!</p>
            <p className="text-white/70 text-sm mt-1">Ask a parent to add your profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl animate-slide-up">
            {state.kids.map(kid => {
              const theme = getKidTheme(kid);
              const bdInfo = getBirthdayInfo(kid.birthday);
              const todayDone = state.completions.filter(c => c.kidId === kid.id && c.date === todayDateStr).length;
              const ageStr = formatAge(bdInfo);

              return (
                <button
                  key={kid.id}
                  onClick={() => handleKidSelect(kid)}
                  className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:scale-105 active:scale-95 transition-transform group text-left"
                >
                  {/* Theme header */}
                  <div className={`bg-gradient-to-r ${theme.gradient} p-4 text-center relative overflow-hidden`}>
                    {/* Floating mini emojis */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                      {theme.floatingEmojis.slice(0,4).map((e, i) => (
                        <span key={i} className="absolute text-lg animate-float" style={{ left: `${15 + i*20}%`, top: `${20 + (i%2)*40}%`, animationDelay: `${i*0.4}s` }}>{e}</span>
                      ))}
                    </div>
                    <div className="relative text-6xl mb-1 group-hover:animate-wiggle">{kid.avatar}</div>
                    {bdInfo.isToday && (
                      <div className="absolute top-2 right-2 text-2xl animate-bounce">🎂</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-2xl font-black text-gray-800">{kid.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{ageStr}</p>

                    {bdInfo.isToday && (
                      <div className="bg-yellow-100 text-yellow-700 rounded-xl px-3 py-1.5 text-xs font-black mb-2 text-center animate-bounce-in">
                        🎂 It's your birthday today!
                      </div>
                    )}
                    {bdInfo.isSoon && !bdInfo.isToday && (
                      <div className="bg-purple-100 text-purple-700 rounded-xl px-3 py-1.5 text-xs font-bold mb-2 text-center">
                        🎈 Birthday in {bdInfo.daysUntil} days!
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold">⭐ {kid.points} pts</span>
                      {kid.streak > 0 && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold">🔥 {kid.streak}</span>}
                      {todayDone > 0 && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">✅ {todayDone} today</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Kid PIN ────────────────────────────────────────────────────────────────
  if (step === 'kid-pin' && selectedKid) {
    const theme = getKidTheme(selectedKid);
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center p-6`}>
        <button onClick={() => { setStep('kid-select'); setPin(''); }} className="absolute top-6 left-6 text-white/80 hover:text-white text-sm font-semibold">← Back</button>

        {/* Birthday celebration overlay */}
        {birthdayKid && (
          <BirthdayCelebration
            kid={birthdayKid}
            onDone={() => {
              setBirthdayKid(null);
              dispatch({ type: 'SET_VIEW', view: 'kid', kidId: birthdayKid.id });
            }}
          />
        )}

        <div className="text-center mb-6 animate-fade-in">
          <div className="text-7xl mb-3 animate-wiggle">{selectedKid.avatar}</div>
          <h2 className="text-4xl font-black text-white">Hi, {selectedKid.name}!</h2>
          <p className="text-white/80 mt-1">{theme.welcomeMessage(selectedKid.name)}</p>
        </div>

        <div className={`bg-white rounded-3xl p-7 shadow-2xl w-full max-w-xs animate-slide-up ${pinError ? 'animate-wiggle' : ''}`}>
          <p className="text-center font-black text-gray-700 mb-4">Enter your PIN</p>

          {/* PIN dots */}
          <div className="flex justify-center gap-3 mb-5">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                pin.length > i ? `scale-110 border-transparent bg-gradient-to-br ${theme.gradient}` : 'border-gray-300'
              }`} />
            ))}
          </div>

          {pinError && <p className="text-center text-red-500 text-sm font-bold mb-3 animate-bounce-in">❌ Wrong PIN!</p>}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((num, i) => (
              <button
                key={i}
                disabled={num === ''}
                onClick={() => typeof num === 'number' ? handlePinDigit(num) : num === '⌫' ? handlePinDigit('⌫') : undefined}
                className={`h-14 rounded-2xl text-xl font-black transition-all active:scale-90 ${
                  num === '' ? 'invisible' :
                  num === '⌫' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' :
                  `bg-gradient-to-br ${theme.gradient} text-white shadow-md hover:opacity-90`
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Floating theme emojis hint */}
          <div className="flex justify-center gap-2 mt-4 text-xl opacity-50">
            {theme.floatingEmojis.slice(0, 4).map((e, i) => <span key={i}>{e}</span>)}
          </div>
        </div>
      </div>
    );
  }

  // ── Parent selection ───────────────────────────────────────────────────────
  if (step === 'parent-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
        <button onClick={resetToLanding} className="absolute top-6 left-6 text-white/60 hover:text-white text-sm font-semibold">← Back</button>

        <div className="text-center mb-8 animate-fade-in">
          <div className="text-5xl mb-3">🏠</div>
          <h2 className="text-4xl font-black text-white">Parent Login</h2>
          <p className="text-white/60 mt-1">Who's logging in today?</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-slide-up">
          {state.parents.map(parent => (
            <button
              key={parent.id}
              onClick={() => handleParentSelect(parent)}
              className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden hover:scale-105 active:scale-95 transition-transform group"
            >
              <div className={`bg-gradient-to-r ${parent.gradient} py-6 text-center`}>
                <div className="text-6xl group-hover:animate-wiggle">{parent.avatar}</div>
              </div>
              <div className="p-4 text-center">
                <h3 className="text-2xl font-black text-gray-800">{parent.name}</h3>
                <p className="text-gray-400 text-sm mt-0.5">PIN protected 🔒</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Parent PIN ─────────────────────────────────────────────────────────────
  if (step === 'parent-pin' && selectedParent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
        <button onClick={() => { setStep('parent-select'); setPin(''); }} className="absolute top-6 left-6 text-white/60 hover:text-white text-sm font-semibold">← Back</button>

        <div className="text-center mb-6 animate-fade-in">
          <div className={`w-24 h-24 bg-gradient-to-br ${selectedParent.gradient} rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-xl`}>
            <span className="text-5xl">{selectedParent.avatar}</span>
          </div>
          <h2 className="text-4xl font-black text-white">Hi, {selectedParent.name}!</h2>
          <p className="text-white/60 mt-1">Enter your 4-digit PIN</p>
        </div>

        <div className={`bg-white rounded-3xl p-7 shadow-2xl w-full max-w-xs animate-slide-up ${pinError ? 'animate-wiggle' : ''}`}>
          {/* PIN dots */}
          <div className="flex justify-center gap-3 mb-5">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                pin.length > i ? 'bg-purple-600 border-purple-600 scale-110' : 'border-gray-300'
              }`} />
            ))}
          </div>

          {pinError && <p className="text-center text-red-500 text-sm font-bold mb-3 animate-bounce-in">❌ Wrong PIN!</p>}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((num, i) => (
              <button
                key={i}
                disabled={num === ''}
                onClick={() => typeof num === 'number' ? handlePinDigit(num) : num === '⌫' ? handlePinDigit('⌫') : undefined}
                className={`h-14 rounded-2xl text-xl font-black transition-all active:scale-90 ${
                  num === '' ? 'invisible' :
                  num === '⌫' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' :
                  'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <p className="text-center text-gray-400 text-xs mt-4">
            Mommy: 1234 · Dada: 5678
          </p>
        </div>
      </div>
    );
  }

  return null;
}
