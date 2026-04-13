import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WeekCalendar } from '../components/WeekCalendar';
import { CelebrationOverlay } from '../components/Confetti';
import { BirthdayStrip, BirthdayCountdown } from '../components/BirthdayBanner';
import {
  getKidTheme, getXPProgress, ALL_BADGES,
  todayStr, Chore, getBirthdayInfo,
  DAY_FULL, MONTH_NAMES,
} from '../types';
import { LogOut, Star, Flame, Gift, Award, Calendar, CheckCircle, Circle } from 'lucide-react';

type KidTab = 'today' | 'week' | 'rewards' | 'badges';

interface Celebration {
  message: string;
  subMessage?: string;
  points: number;
}

export function KidView() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<KidTab>('today');
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const kid = state.kids.find(k => k.id === state.selectedKidId);
  if (!kid) {
    dispatch({ type: 'SET_VIEW', view: 'home' });
    return null;
  }

  const theme = getKidTheme(kid);
  const xp = getXPProgress(kid.totalXP);
  const bdInfo = getBirthdayInfo(kid.birthday);

  const today = new Date();
  const todayDate = todayStr();
  const dow = today.getDay() as 0|1|2|3|4|5|6;

  function choreIsForKid(chore: Chore): boolean {
    return chore.assignedTo.length === 0 || chore.assignedTo.includes(kid.id);
  }

  const dailyChores  = state.chores.filter(c => choreIsForKid(c) && c.type === 'daily'    && c.daysOfWeek.includes(dow));
  const weeklyChores = state.chores.filter(c => choreIsForKid(c) && c.type === 'weekly'   && c.daysOfWeek.includes(dow));
  const kindnessChores = state.chores.filter(c => choreIsForKid(c) && c.type === 'kindness');
  const todayChores  = [...dailyChores, ...weeklyChores];

  function isCompleted(choreId: string): boolean {
    return state.completions.some(c => c.choreId === choreId && c.kidId === kid.id && c.date === todayDate);
  }

  function completeChore(choreId: string) {
    const chore = state.chores.find(c => c.id === choreId);
    if (!chore || isCompleted(choreId)) return;
    dispatch({ type: 'COMPLETE_CHORE', choreId, kidId: kid.id, date: todayDate });
    const msgs = theme.choreCompleteMessages;
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    setCelebration({ message: msg, subMessage: `${chore.icon} ${chore.title}`, points: chore.points });
  }

  const completedToday = todayChores.filter(c => isCompleted(c.id)).length;
  const totalToday = todayChores.length;
  const allDoneToday = totalToday > 0 && completedToday === totalToday;
  const pendingRedemptions = state.redemptions.filter(r => r.kidId === kid.id && !r.approved && !r.denied);
  const todayLabel = `${DAY_FULL[dow]}, ${MONTH_NAMES[today.getMonth()]} ${today.getDate()}`;

  const TABS = [
    { id: 'today'   as KidTab, label: 'Today',   icon: <CheckCircle size={18}/> },
    { id: 'week'    as KidTab, label: 'Week',     icon: <Calendar size={18}/> },
    { id: 'rewards' as KidTab, label: 'Rewards',  icon: <Gift size={18}/> },
    { id: 'badges'  as KidTab, label: 'Badges',   icon: <Award size={18}/> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {celebration && (
        <CelebrationOverlay
          message={celebration.message}
          subMessage={celebration.subMessage}
          points={celebration.points}
          onDone={() => setCelebration(null)}
        />
      )}

      {/* Birthday strip */}
      <BirthdayStrip kid={kid} />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${theme.gradient} text-white px-4 pb-0 shadow-lg relative overflow-hidden`}>
        {/* Floating theme emojis */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
          {theme.floatingEmojis.slice(0, 6).map((e, i) => (
            <span key={i} className="absolute text-2xl animate-float" style={{ left: `${8 + i * 16}%`, top: `${10 + (i % 2) * 50}%`, animationDelay: `${i * 0.4}s` }}>{e}</span>
          ))}
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                {kid.avatar}
              </div>
              <div>
                <h1 className="text-2xl font-black leading-tight">{kid.name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="bg-white/25 rounded-full px-2.5 py-0.5 text-xs font-bold">
                    {xp.levelEmoji} Lv.{xp.level} {xp.levelName}
                  </span>
                  {kid.streak > 0 && (
                    <span className="flex items-center gap-1 bg-orange-400/80 rounded-full px-2 py-0.5 text-xs font-bold">
                      <Flame size={12} className="fill-white" /> {kid.streak} day streak!
                    </span>
                  )}
                  {bdInfo.isToday && (
                    <span className="bg-yellow-400/90 text-yellow-900 rounded-full px-2 py-0.5 text-xs font-black animate-bounce">
                      🎂 Birthday!
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'home' })}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Points + XP bar */}
          <div className="bg-white/20 rounded-2xl p-3 backdrop-blur-sm mb-0">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <Star size={16} className="fill-yellow-300 text-yellow-300" />
                <span>{kid.points} pts available</span>
              </div>
              <div className="text-xs font-semibold opacity-80">
                {xp.current}/{xp.needed} XP → Lv.{Math.min(xp.level + 1, 10)}
              </div>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full xp-bar-fill rounded-full transition-all duration-1000" style={{ width: `${xp.percentage}%` }} />
            </div>
            {allDoneToday && (
              <div className="mt-2 text-center text-sm font-black animate-bounce-in">
                🎉 All chores done today! {theme.choreCompleteMessages[0]}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto flex mt-3">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-bold transition-all relative ${
                tab === t.id ? 'text-white border-b-2 border-white bg-white/15' : 'text-white/60 hover:text-white/90'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-4">

          {/* Birthday countdown banner */}
          <BirthdayCountdown kid={kid} />

          {/* ── TODAY ──────────────────────────────────────────────── */}
          {tab === 'today' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-800">Today's Chores</h2>
                  <p className="text-sm text-gray-500">{todayLabel}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-gray-800">{completedToday}/{totalToday}</div>
                  <div className="text-xs text-gray-500">done</div>
                </div>
              </div>

              {totalToday > 0 && (
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${theme.gradient}`}
                    style={{ width: `${(completedToday / totalToday) * 100}%` }}
                  />
                </div>
              )}

              {dailyChores.length > 0 && (
                <section>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{theme.dailyLabel}</h3>
                  <div className="space-y-3">
                    {dailyChores.map(chore => (
                      <ChoreCard key={chore.id} chore={chore} done={isCompleted(chore.id)} onComplete={() => completeChore(chore.id)} theme={theme} />
                    ))}
                  </div>
                </section>
              )}

              {weeklyChores.length > 0 && (
                <section>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{theme.weeklyLabel}</h3>
                  <div className="space-y-3">
                    {weeklyChores.map(chore => (
                      <ChoreCard key={chore.id} chore={chore} done={isCompleted(chore.id)} onComplete={() => completeChore(chore.id)} theme={theme} />
                    ))}
                  </div>
                </section>
              )}

              {totalToday === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3 animate-float">{theme.floatingEmojis[0]}</div>
                  <h3 className="text-xl font-black text-gray-600">No chores today!</h3>
                  <p className="text-gray-400 mt-1">Enjoy your day — or do a Random Act of Kindness! 💝</p>
                </div>
              )}

              {/* Kindness section */}
              {kindnessChores.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xs font-black text-pink-500 uppercase tracking-widest">{theme.kindnessLabel}</h3>
                    <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold">Optional · Bonus Points!</span>
                  </div>
                  <div className="space-y-3">
                    {kindnessChores.map(chore => (
                      <ChoreCard key={chore.id} chore={chore} done={isCompleted(chore.id)} onComplete={() => completeChore(chore.id)} theme={theme} isKindness />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ── WEEK ───────────────────────────────────────────────── */}
          {tab === 'week' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-800">Weekly Calendar</h2>
                <div className="flex gap-2">
                  <button onClick={() => setWeekOffset(w => w - 1)} className="w-9 h-9 bg-white rounded-xl shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">‹</button>
                  <button onClick={() => setWeekOffset(0)} disabled={weekOffset === 0} className="px-3 h-9 bg-white rounded-xl shadow text-xs font-bold text-gray-600 disabled:opacity-40">Today</button>
                  <button onClick={() => setWeekOffset(w => w + 1)} className="w-9 h-9 bg-white rounded-xl shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">›</button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-3">
                <WeekCalendar
                  chores={state.chores}
                  completions={state.completions}
                  kids={state.kids}
                  filterKidId={kid.id}
                  weekOffset={weekOffset}
                  onComplete={(choreId, _, date) => { if (date === todayDate) completeChore(choreId); }}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {(() => {
                  const today2 = new Date();
                  const startOfWeek = new Date(today2);
                  startOfWeek.setDate(today2.getDate() - today2.getDay());
                  startOfWeek.setHours(0, 0, 0, 0);
                  const weekCompletions = state.completions.filter(c => {
                    if (c.kidId !== kid.id) return false;
                    const d = new Date(c.date + 'T12:00:00');
                    return d >= startOfWeek;
                  });
                  const pointsThisWeek = weekCompletions.reduce((sum, c) => {
                    const ch = state.chores.find(x => x.id === c.choreId);
                    return sum + (ch?.points ?? 0);
                  }, 0);
                  return (
                    <>
                      <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                        <div className="text-3xl font-black text-purple-600">{weekCompletions.length}</div>
                        <div className="text-xs text-gray-500">Chores Done</div>
                        <div className="text-xs text-gray-400">this week</div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                        <div className="text-3xl font-black text-amber-500">⭐{pointsThisWeek}</div>
                        <div className="text-xs text-gray-500">Points Earned</div>
                        <div className="text-xs text-gray-400">this week</div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                        <div className="text-3xl font-black text-orange-500">🔥{kid.streak}</div>
                        <div className="text-xs text-gray-500">Day Streak</div>
                        <div className="text-xs text-gray-400">keep going!</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </>
          )}

          {/* ── REWARDS ────────────────────────────────────────────── */}
          {tab === 'rewards' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-800">Rewards Shop</h2>
                <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full font-bold text-sm">
                  <Star size={16} className="fill-yellow-500 text-yellow-500" />
                  {kid.points} pts
                </div>
              </div>

              {pendingRedemptions.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <h3 className="font-bold text-amber-700 mb-2 text-sm">⏳ Waiting for Approval</h3>
                  {pendingRedemptions.map(r => {
                    const reward = state.rewards.find(x => x.id === r.rewardId);
                    return reward ? (
                      <div key={r.id} className="flex items-center gap-2 text-sm text-amber-700">
                        <span>{reward.icon}</span><span className="font-semibold">{reward.title}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {state.rewards.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">{theme.floatingEmojis[0]}</div>
                  <p className="text-gray-400 font-semibold">No rewards set up yet.</p>
                  <p className="text-gray-300 text-sm">Ask Mommy or Dada to add rewards!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...state.rewards].sort((a, b) => a.pointCost - b.pointCost).map(reward => {
                    const canAfford = kid.points >= reward.pointCost;
                    const alreadyPending = state.redemptions.some(r => r.rewardId === reward.id && r.kidId === kid.id && !r.approved && !r.denied);
                    return (
                      <div key={reward.id} className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${canAfford ? 'border-amber-200 hover:border-amber-400' : 'border-gray-100 opacity-70'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${canAfford ? 'bg-amber-50' : 'bg-gray-50'}`}>{reward.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-gray-800">{reward.title}</h3>
                            {reward.description && <p className="text-gray-500 text-xs truncate">{reward.description}</p>}
                            <div className="flex items-center gap-1.5 mt-1">
                              <Star size={14} className="fill-yellow-400 text-yellow-400" />
                              <span className="font-black text-yellow-600 text-sm">{reward.pointCost} pts</span>
                              {!canAfford && <span className="text-xs text-red-400 font-semibold">(need {reward.pointCost - kid.points} more)</span>}
                            </div>
                          </div>
                          <button
                            disabled={!canAfford || alreadyPending}
                            onClick={() => dispatch({ type: 'REDEEM_REWARD', rewardId: reward.id, kidId: kid.id })}
                            className={`px-4 py-2 rounded-xl font-bold text-sm flex-shrink-0 transition-all ${
                              alreadyPending ? 'bg-gray-100 text-gray-400' :
                              canAfford ? `${theme.btnClass} text-white shadow-md active:scale-95` :
                              'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {alreadyPending ? '⏳' : canAfford ? 'Redeem!' : '🔒'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── BADGES ─────────────────────────────────────────────── */}
          {tab === 'badges' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-800">My Badges</h2>
                <span className="text-sm text-gray-500">{kid.badges.length}/{ALL_BADGES.length} earned</span>
              </div>

              {/* Level journey */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-black text-gray-600 mb-3">Level Journey</h3>
                <div className="flex items-end gap-1 justify-between">
                  {Array.from({ length: 10 }, (_, i) => {
                    const lvl = i + 1;
                    const reached = xp.level >= lvl;
                    const current = xp.level === lvl;
                    return (
                      <div key={lvl} className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className={`w-full rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                            current ? `bg-gradient-to-br ${theme.gradient} text-white shadow-lg scale-110` :
                            reached ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-400'
                          }`}
                          style={{ height: `${8 + lvl * 4}px` }}
                        >
                          {current ? xp.levelEmoji : reached ? '✓' : ''}
                        </div>
                        <span className="text-xs font-bold text-gray-400">{lvl}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-sm font-bold text-gray-600 mt-3">
                  {xp.levelEmoji} Lv.{xp.level}: <span style={{ backgroundImage: `linear-gradient(135deg, #7c3aed, #ec4899)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{xp.levelName}</span>
                  {xp.level < 10 && <span className="text-gray-400"> · {xp.needed - xp.current} XP to next level</span>}
                </p>
              </div>

              {/* Birthday age card */}
              {kid.birthday && (
                <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-4 text-white`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎂</span>
                    <div>
                      <p className="font-black">
                        {bdInfo.isToday ? `🎉 Happy Birthday, ${kid.name}!` : `Next birthday in ${bdInfo.daysUntil} days!`}
                      </p>
                      <p className="text-white/80 text-sm">{formatAge2(bdInfo)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Badges grid */}
              <div className="grid grid-cols-2 gap-3">
                {ALL_BADGES.map(badge => {
                  const earned = kid.badges.includes(badge.id);
                  return (
                    <div key={badge.id} className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${earned ? 'border-yellow-300' : 'border-gray-100 opacity-60'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${earned ? badge.color : 'bg-gray-200'} ${earned ? '' : 'grayscale opacity-50'}`}>
                          {earned ? badge.icon : '🔒'}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`font-black text-sm ${earned ? 'text-gray-800' : 'text-gray-400'}`}>{badge.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5 leading-tight">{badge.description}</p>
                          {earned && <span className="text-xs text-yellow-600 font-bold">✨ Earned!</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Local helper ─────────────────────────────────────────────────────────────

import { formatAge } from '../types';
function formatAge2(info: ReturnType<typeof getBirthdayInfo>) { return formatAge(info); }

// ─── Chore Card ───────────────────────────────────────────────────────────────

function ChoreCard({
  chore, done, onComplete, theme, isKindness = false,
}: {
  chore: Chore;
  done: boolean;
  onComplete: () => void;
  theme: ReturnType<typeof getKidTheme>;
  isKindness?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 transition-all overflow-hidden ${
      done ? 'border-green-300 bg-green-50' : isKindness ? 'border-pink-200' : 'border-gray-100 hover:border-purple-200'
    }`}>
      <div className="flex items-center gap-3 p-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${done ? 'bg-green-100' : isKindness ? 'bg-pink-50' : 'bg-gray-50'}`}>
          {done ? <span className="check-pop">✅</span> : chore.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-black text-base ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{chore.title}</h3>
          {chore.description && <p className="text-xs text-gray-500 truncate mt-0.5">{chore.description}</p>}
          <div className="flex items-center gap-2 mt-1">
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isKindness ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}`}>
              ⭐ {chore.points} pts
            </span>
            {chore.requiresApproval && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">🔍 Needs approval</span>}
          </div>
        </div>
        <button
          onClick={done ? undefined : onComplete}
          disabled={done}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all active:scale-90 flex-shrink-0 ${
            done ? 'bg-green-100 cursor-default' :
            isKindness ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md hover:scale-105' :
            `bg-gradient-to-br ${theme.gradient} text-white shadow-md hover:scale-105`
          }`}
        >
          {done ? <CheckCircle size={24} className="text-green-600" /> : <Circle size={24} className="text-white" />}
        </button>
      </div>
      {done && <div className="h-1.5 bg-green-400 w-full" />}
    </div>
  );
}
