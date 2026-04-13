import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChoreModal } from '../components/ChoreModal';
import { KidModal } from '../components/KidModal';
import { RewardModal } from '../components/RewardModal';
import { WeekCalendar } from '../components/WeekCalendar';
import {
  Chore, Kid, Reward, ChoreType, getKidColor, getXPProgress,
  todayStr, getWeekDays, dateToStr, ALL_BADGES, DAY_FULL, MONTH_NAMES,
} from '../types';
import {
  LayoutDashboard, ListChecks, Calendar, Gift, Users, LogOut,
  Plus, Pencil, Trash2, CheckCircle, XCircle, ChevronRight, Star, Flame, Settings,
} from 'lucide-react';

type ParentTab = 'dashboard' | 'chores' | 'calendar' | 'rewards' | 'kids';

export function ParentView() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<ParentTab>('dashboard');
  const [choreFilter, setChoreFilter] = useState<ChoreType | 'all'>('all');
  const [editingChore, setEditingChore] = useState<Chore | null | 'new'>(null);
  const [editingKid, setEditingKid] = useState<Kid | null | 'new'>(null);
  const [editingReward, setEditingReward] = useState<Reward | null | 'new'>(null);
  const [calWeekOffset, setCalWeekOffset] = useState(0);
  const [showPinChange, setShowPinChange] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [calFilterKid, setCalFilterKid] = useState<string | null>(null);

  const todayDate = todayStr();

  // ── Pending approvals ──────────────────────────────────────────────────────
  const pendingCompletions = state.completions.filter(c => !c.approved);
  const pendingRedemptions = state.redemptions.filter(r => !r.approved && !r.denied);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weekCompletions = state.completions.filter(c => {
    const d = new Date(c.date + 'T12:00:00');
    return d >= startOfWeek;
  });

  const todayCompletions = state.completions.filter(c => c.date === todayDate);

  const TABS = [
    { id: 'dashboard' as ParentTab, label: 'Dashboard', icon: <LayoutDashboard size={18}/> },
    { id: 'chores'    as ParentTab, label: 'Chores',    icon: <ListChecks size={18}/> },
    { id: 'calendar'  as ParentTab, label: 'Calendar',  icon: <Calendar size={18}/> },
    { id: 'rewards'   as ParentTab, label: 'Rewards',   icon: <Gift size={18}/> },
    { id: 'kids'      as ParentTab, label: 'Kids',      icon: <Users size={18}/> },
  ];

  const totalAlerts = pendingCompletions.length + pendingRedemptions.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {editingChore !== null && (
        <ChoreModal
          chore={editingChore === 'new' ? undefined : editingChore}
          kids={state.kids}
          onSave={(chore) => {
            if (editingChore === 'new') {
              dispatch({ type: 'ADD_CHORE', chore });
            } else {
              dispatch({ type: 'UPDATE_CHORE', chore });
            }
            setEditingChore(null);
          }}
          onClose={() => setEditingChore(null)}
        />
      )}
      {editingKid !== null && (
        <KidModal
          kid={editingKid === 'new' ? undefined : editingKid}
          onSave={(kid) => {
            if (editingKid === 'new') {
              dispatch({ type: 'ADD_KID', kid });
            } else {
              dispatch({ type: 'UPDATE_KID', kid });
            }
            setEditingKid(null);
          }}
          onClose={() => setEditingKid(null)}
        />
      )}
      {editingReward !== null && (
        <RewardModal
          reward={editingReward === 'new' ? undefined : editingReward}
          onSave={(reward) => {
            if (editingReward === 'new') {
              dispatch({ type: 'ADD_REWARD', reward });
            } else {
              dispatch({ type: 'UPDATE_REWARD', reward });
            }
            setEditingReward(null);
          }}
          onClose={() => setEditingReward(null)}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white px-4 pt-4 pb-0 shadow-xl">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h1 className="text-xl font-black">Parent Dashboard</h1>
                <p className="text-white/60 text-xs">
                  {DAY_FULL[today.getDay()]}, {MONTH_NAMES[today.getMonth()]} {today.getDate()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPinChange(!showPinChange)}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                title="Settings"
              >
                <Settings size={16} />
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', view: 'home' })}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* PIN change */}
          {showPinChange && (
            <div className="bg-white/10 rounded-2xl p-3 mb-3 animate-fade-in flex items-center gap-3">
              <span className="text-sm font-bold text-white/80">Change PIN:</span>
              <input
                type="number"
                maxLength={4}
                value={newPin}
                onChange={e => setNewPin(e.target.value.slice(0,4))}
                placeholder="New 4-digit PIN"
                className="flex-1 bg-white/20 rounded-xl px-3 py-1.5 text-sm text-white placeholder-white/40 outline-none"
              />
              <button
                onClick={() => {
                  if (newPin.length === 4) {
                    dispatch({ type: 'SET_PARENT_PIN', pin: newPin });
                    setNewPin('');
                    setShowPinChange(false);
                  }
                }}
                disabled={newPin.length !== 4}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 rounded-xl text-sm font-bold transition-colors"
              >
                Save
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-bold transition-all relative ${
                  tab === t.id
                    ? 'text-white border-b-2 border-purple-400'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {t.icon}
                {t.label}
                {t.id === 'dashboard' && totalAlerts > 0 && (
                  <span className="absolute top-1.5 right-1/4 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-black">
                    {totalAlerts}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-4">

          {/* ══ DASHBOARD ════════════════════════════════════════════════ */}
          {tab === 'dashboard' && (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Today" value={todayCompletions.length} sub="chores done" icon="✅" color="bg-green-500" />
                <StatCard label="This Week" value={weekCompletions.length} sub="chores done" icon="📅" color="bg-blue-500" />
                <StatCard label="Chores" value={state.chores.length} sub="total set up" icon="📋" color="bg-purple-500" />
                <StatCard label="Rewards" value={state.rewards.length} sub="available" icon="🎁" color="bg-amber-500" />
              </div>

              {/* Pending approvals */}
              {(pendingCompletions.length > 0 || pendingRedemptions.length > 0) && (
                <section>
                  <h2 className="text-base font-black text-gray-700 mb-3">
                    🔔 Needs Your Attention
                  </h2>

                  {pendingCompletions.map(c => {
                    const chore = state.chores.find(x => x.id === c.choreId);
                    const kid = state.kids.find(x => x.id === c.kidId);
                    if (!chore || !kid) return null;
                    const color = getKidColor(kid.colorName);
                    return (
                      <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-2 flex items-center gap-3">
                        <div className={`w-10 h-10 ${color.light} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                          {chore.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800">
                            {kid.avatar} {kid.name} completed <span className="text-purple-600">{chore.title}</span>
                          </p>
                          <p className="text-xs text-gray-500">+{chore.points} pts pending · {c.date}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => dispatch({ type: 'APPROVE_COMPLETION', completionId: c.id })}
                            className="w-9 h-9 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors"
                          >
                            <CheckCircle size={18} className="text-green-600" />
                          </button>
                          <button
                            onClick={() => dispatch({ type: 'UNDO_COMPLETION', completionId: c.id })}
                            className="w-9 h-9 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors"
                          >
                            <XCircle size={18} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {pendingRedemptions.map(r => {
                    const reward = state.rewards.find(x => x.id === r.rewardId);
                    const kid = state.kids.find(x => x.id === r.kidId);
                    if (!reward || !kid) return null;
                    const color = getKidColor(kid.colorName);
                    return (
                      <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-amber-200 p-3 mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                          {reward.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800">
                            {kid.avatar} {kid.name} wants <span className="text-amber-600">{reward.title}</span>
                          </p>
                          <p className="text-xs text-gray-500">Reward redemption · {reward.pointCost} pts spent</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => dispatch({ type: 'APPROVE_REDEMPTION', redemptionId: r.id })}
                            className="w-9 h-9 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors"
                          >
                            <CheckCircle size={18} className="text-green-600" />
                          </button>
                          <button
                            onClick={() => dispatch({ type: 'DENY_REDEMPTION', redemptionId: r.id })}
                            className="w-9 h-9 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors"
                          >
                            <XCircle size={18} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Kid leaderboard */}
              <section>
                <h2 className="text-base font-black text-gray-700 mb-3">🏆 Kid Leaderboard</h2>
                <div className="space-y-3">
                  {[...state.kids]
                    .sort((a, b) => b.totalXP - a.totalXP)
                    .map((kid, i) => {
                      const color = getKidColor(kid.colorName);
                      const xp = getXPProgress(kid.totalXP);
                      const todayDone = state.completions.filter(c => c.kidId === kid.id && c.date === todayDate).length;
                      const medals = ['🥇','🥈','🥉'];
                      return (
                        <div key={kid.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                          <div className="flex items-center gap-3 p-3">
                            <div className="text-2xl w-8 text-center">{medals[i] ?? `${i+1}`}</div>
                            <div className={`w-12 h-12 bg-gradient-to-br ${color.gradient} rounded-2xl flex items-center justify-center text-2xl shadow-md`}>
                              {kid.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-gray-800">{kid.name}</span>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{xp.levelEmoji} Lv.{xp.level}</span>
                                {kid.streak > 0 && <span className="text-xs flex items-center gap-0.5 text-orange-600 font-bold"><Flame size={12}/>  {kid.streak}</span>}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-amber-600 font-bold flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400"/> {kid.points} pts</span>
                                <span className="text-xs text-gray-400">{kid.totalXP} XP total</span>
                                <span className="text-xs text-green-600 font-semibold">✅ {todayDone} today</span>
                              </div>
                              {/* XP bar */}
                              <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${color.gradient} rounded-full`} style={{ width: `${xp.percentage}%` }} />
                              </div>
                            </div>
                            <button
                              onClick={() => { setEditingKid(kid); setTab('kids'); }}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <ChevronRight size={16} className="text-gray-400" />
                            </button>
                          </div>
                          {/* Badges row */}
                          {kid.badges.length > 0 && (
                            <div className="px-4 pb-3 flex gap-1.5">
                              {kid.badges.slice(0, 8).map(badgeId => {
                                const badge = ALL_BADGES.find(b => b.id === badgeId);
                                return badge ? (
                                  <span key={badgeId} title={badge.name} className={`w-7 h-7 rounded-lg ${badge.color} flex items-center justify-center text-sm`}>
                                    {badge.icon}
                                  </span>
                                ) : null;
                              })}
                              {kid.badges.length > 8 && <span className="text-xs text-gray-400 self-center">+{kid.badges.length - 8}</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </section>

              {/* Quick recent activity */}
              <section>
                <h2 className="text-base font-black text-gray-700 mb-3">📊 Recent Activity</h2>
                <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
                  {state.completions
                    .slice(-8)
                    .reverse()
                    .map(c => {
                      const chore = state.chores.find(x => x.id === c.choreId);
                      const kid = state.kids.find(x => x.id === c.kidId);
                      if (!chore || !kid) return null;
                      return (
                        <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                          <span className="text-xl">{chore.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-gray-700">{kid.avatar} {kid.name}</span>
                            <span className="text-sm text-gray-500"> — {chore.title}</span>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">{c.date}</span>
                          <span className={`text-xs font-bold ${c.approved ? 'text-green-600' : 'text-amber-500'}`}>
                            {c.approved ? `+${chore.points}` : '⏳'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </section>
            </>
          )}

          {/* ══ CHORES ═══════════════════════════════════════════════════ */}
          {tab === 'chores' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-800">Chores</h2>
                <button
                  onClick={() => setEditingChore('new')}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-colors"
                >
                  <Plus size={16} /> Add Chore
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2">
                {(['all','daily','weekly','extra'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setChoreFilter(f)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${
                      choreFilter === f
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                    }`}
                  >
                    {f === 'all' ? '📋 All' : f === 'daily' ? '📅 Daily' : f === 'weekly' ? '📆 Weekly' : '⭐ Extra'}
                    <span className="ml-1 text-xs opacity-70">
                      ({state.chores.filter(c => f === 'all' || c.type === f).length})
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {state.chores
                  .filter(c => choreFilter === 'all' || c.type === choreFilter)
                  .map(chore => {
                    const completionsThisWeek = state.completions.filter(c2 => {
                      if (c2.choreId !== chore.id) return false;
                      const d = new Date(c2.date + 'T12:00:00');
                      return d >= startOfWeek;
                    }).length;

                    const assignedKids = chore.assignedTo.length === 0
                      ? state.kids
                      : state.kids.filter(k => chore.assignedTo.includes(k.id));

                    return (
                      <div key={chore.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                          chore.type === 'daily' ? 'bg-blue-50' :
                          chore.type === 'weekly' ? 'bg-purple-50' :
                          'bg-amber-50'
                        }`}>
                          {chore.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-gray-800 text-sm">{chore.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              chore.type === 'daily' ? 'bg-blue-100 text-blue-700' :
                              chore.type === 'weekly' ? 'bg-purple-100 text-purple-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {chore.type}
                            </span>
                            {chore.requiresApproval && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">🔍 approval</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="text-amber-600 font-bold">⭐{chore.points}</span>
                            <span>{completionsThisWeek} completions this week</span>
                            <span>{assignedKids.map(k => k.avatar).join('')} {chore.assignedTo.length === 0 ? 'All' : assignedKids.map(k=>k.name).join(', ')}</span>
                          </div>
                          {chore.type !== 'extra' && (
                            <div className="flex gap-0.5 mt-1">
                              {[0,1,2,3,4,5,6].map(d => (
                                <span key={d} className={`text-xs px-1 rounded ${
                                  chore.daysOfWeek.includes(d as any)
                                    ? 'bg-purple-100 text-purple-700 font-bold'
                                    : 'text-gray-200'
                                }`}>
                                  {['S','M','T','W','T','F','S'][d]}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => setEditingChore(chore)}
                            className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Pencil size={14} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => { if (confirm(`Delete "${chore.title}"?`)) dispatch({ type: 'DELETE_CHORE', choreId: chore.id }); }}
                            className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {state.chores.filter(c => choreFilter === 'all' || c.type === choreFilter).length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="font-semibold">No {choreFilter === 'all' ? '' : choreFilter} chores yet</p>
                    <button onClick={() => setEditingChore('new')} className="mt-3 text-purple-600 font-bold text-sm">+ Add one</button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══ CALENDAR ═════════════════════════════════════════════════ */}
          {tab === 'calendar' && (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-black text-gray-800">Chore Calendar</h2>
                <div className="flex gap-2">
                  <button onClick={() => setCalWeekOffset(w => w - 1)} className="w-9 h-9 bg-white rounded-xl shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">‹</button>
                  <button onClick={() => setCalWeekOffset(0)} disabled={calWeekOffset === 0} className="px-3 h-9 bg-white rounded-xl shadow text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40">Today</button>
                  <button onClick={() => setCalWeekOffset(w => w + 1)} className="w-9 h-9 bg-white rounded-xl shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">›</button>
                </div>
              </div>

              {/* Kid filter */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setCalFilterKid(null)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold flex-shrink-0 transition-all ${
                    calFilterKid === null ? 'bg-slate-700 text-white' : 'bg-white text-gray-600 shadow-sm'
                  }`}
                >
                  👨‍👩‍👧‍👦 All Kids
                </button>
                {state.kids.map(kid => {
                  const color = getKidColor(kid.colorName);
                  return (
                    <button
                      key={kid.id}
                      onClick={() => setCalFilterKid(kid.id)}
                      className={`px-4 py-1.5 rounded-xl text-sm font-bold flex-shrink-0 transition-all ${
                        calFilterKid === kid.id ? `${color.bg} text-white` : 'bg-white text-gray-600 shadow-sm'
                      }`}
                    >
                      {kid.avatar} {kid.name}
                    </button>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-3 overflow-x-auto">
                <WeekCalendar
                  chores={state.chores}
                  completions={state.completions}
                  kids={state.kids}
                  filterKidId={calFilterKid}
                  weekOffset={calWeekOffset}
                  isParentView
                />
              </div>

              {/* Per-kid this-week summary */}
              <h3 className="text-sm font-black text-gray-600 mt-2">This Week's Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {state.kids.map(kid => {
                  const color = getKidColor(kid.colorName);
                  const weekDays = getWeekDays();
                  let totalPossible = 0;
                  let totalDone = 0;
                  weekDays.forEach(day => {
                    const dow = day.getDay();
                    const ds = dateToStr(day);
                    state.chores.forEach(c => {
                      if (c.type === 'extra') return;
                      if (c.assignedTo.length > 0 && !c.assignedTo.includes(kid.id)) return;
                      if (!c.daysOfWeek.includes(dow as any)) return;
                      totalPossible++;
                      if (state.completions.some(x => x.choreId === c.id && x.kidId === kid.id && x.date === ds)) totalDone++;
                    });
                  });
                  const pct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
                  return (
                    <div key={kid.id} className="bg-white rounded-2xl shadow-sm p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{kid.avatar}</span>
                        <span className="font-bold text-gray-800">{kid.name}</span>
                        <span className={`ml-auto font-black text-lg ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all bg-gradient-to-r ${color.gradient}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{totalDone}/{totalPossible} chores complete</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ══ REWARDS ══════════════════════════════════════════════════ */}
          {tab === 'rewards' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-800">Rewards</h2>
                <button
                  onClick={() => setEditingReward('new')}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-colors"
                >
                  <Plus size={16}/> Add Reward
                </button>
              </div>

              {/* Pending redemptions */}
              {pendingRedemptions.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <h3 className="font-black text-amber-700 mb-3 text-sm">⏳ Pending Reward Requests</h3>
                  {pendingRedemptions.map(r => {
                    const reward = state.rewards.find(x => x.id === r.rewardId);
                    const kid = state.kids.find(x => x.id === r.kidId);
                    if (!reward || !kid) return null;
                    return (
                      <div key={r.id} className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{reward.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800">{kid.avatar} {kid.name} wants: {reward.title}</p>
                          <p className="text-xs text-gray-500">{reward.pointCost} pts · requested {new Date(r.requestedAt).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => dispatch({ type: 'APPROVE_REDEMPTION', redemptionId: r.id })} className="w-9 h-9 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center">
                          <CheckCircle size={18} className="text-green-600" />
                        </button>
                        <button onClick={() => dispatch({ type: 'DENY_REDEMPTION', redemptionId: r.id })} className="w-9 h-9 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center">
                          <XCircle size={18} className="text-red-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Reward list */}
              <div className="space-y-3">
                {state.rewards.map(reward => (
                  <div key={reward.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{reward.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-gray-800 text-sm">{reward.title}</h3>
                      {reward.description && <p className="text-xs text-gray-500 truncate">{reward.description}</p>}
                      <span className="text-xs font-bold text-amber-600">⭐ {reward.pointCost} pts</span>
                    </div>
                    <button onClick={() => setEditingReward(reward)} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center"><Pencil size={14} className="text-blue-600"/></button>
                    <button onClick={() => { if (confirm(`Delete "${reward.title}"?`)) dispatch({ type: 'DELETE_REWARD', rewardId: reward.id }); }} className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center"><Trash2 size={14} className="text-red-500"/></button>
                  </div>
                ))}
                {state.rewards.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-2">🎁</div>
                    <p className="font-semibold">No rewards yet</p>
                    <button onClick={() => setEditingReward('new')} className="mt-3 text-amber-600 font-bold text-sm">+ Add a reward</button>
                  </div>
                )}
              </div>

              {/* Past redemptions */}
              {state.redemptions.filter(r => r.approved || r.denied).length > 0 && (
                <section>
                  <h3 className="text-sm font-black text-gray-600 mb-2">History</h3>
                  <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
                    {state.redemptions.filter(r => r.approved || r.denied).slice(-10).reverse().map(r => {
                      const reward = state.rewards.find(x => x.id === r.rewardId);
                      const kid = state.kids.find(x => x.id === r.kidId);
                      if (!reward || !kid) return null;
                      return (
                        <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                          <span>{reward.icon}</span>
                          <span className="flex-1">{kid.avatar} {kid.name} — {reward.title}</span>
                          <span className={`font-bold text-xs ${r.approved ? 'text-green-600' : 'text-red-500'}`}>
                            {r.approved ? '✅ Approved' : '❌ Denied'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ══ KIDS ═════════════════════════════════════════════════════ */}
          {tab === 'kids' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-800">Kids</h2>
                <button
                  onClick={() => setEditingKid('new')}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-colors"
                >
                  <Plus size={16}/> Add Kid
                </button>
              </div>

              <div className="space-y-3">
                {state.kids.map(kid => {
                  const color = getKidColor(kid.colorName);
                  const xp = getXPProgress(kid.totalXP);
                  const allTimeCompletions = state.completions.filter(c => c.kidId === kid.id).length;
                  const approvedRedemptions = state.redemptions.filter(r => r.kidId === kid.id && r.approved).length;

                  return (
                    <div key={kid.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className={`bg-gradient-to-r ${color.gradient} p-4 text-white`}>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                            {kid.avatar}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-black">{kid.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="bg-white/25 rounded-full px-2.5 py-0.5 text-xs font-bold">
                                {xp.levelEmoji} Lv.{xp.level} {xp.levelName}
                              </span>
                              {kid.streak > 0 && <span className="text-xs font-bold">🔥 {kid.streak} day streak</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingKid(kid)} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center"><Pencil size={15}/></button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${kid.name} from the app? This will also delete all their completions.`)) {
                                  dispatch({ type: 'DELETE_KID', kidId: kid.id });
                                }
                              }}
                              className="w-9 h-9 bg-white/20 hover:bg-red-500/50 rounded-xl flex items-center justify-center"
                            >
                              <Trash2 size={15}/>
                            </button>
                          </div>
                        </div>
                        {/* XP bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1 font-semibold opacity-80">
                            <span>{xp.current} XP</span>
                            <span>{xp.needed} XP to Lv.{Math.min(xp.level+1, 10)}</span>
                          </div>
                          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${xp.percentage}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="text-2xl font-black text-amber-500">⭐{kid.points}</div>
                          <div className="text-xs text-gray-500 mt-0.5">points left</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-black text-blue-600">{allTimeCompletions}</div>
                          <div className="text-xs text-gray-500 mt-0.5">chores done</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-black text-purple-600">{kid.badges.length}</div>
                          <div className="text-xs text-gray-500 mt-0.5">badges</div>
                        </div>
                      </div>
                      {kid.badges.length > 0 && (
                        <div className="px-4 pb-4 flex gap-1.5 flex-wrap">
                          {kid.badges.map(badgeId => {
                            const badge = ALL_BADGES.find(b => b.id === badgeId);
                            return badge ? (
                              <span key={badgeId} title={badge.name} className={`w-8 h-8 rounded-xl ${badge.color} flex items-center justify-center text-base`}>
                                {badge.icon}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {state.kids.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <div className="text-5xl mb-3">👶</div>
                    <p className="font-semibold text-lg">No kids added yet!</p>
                    <button onClick={() => setEditingKid('new')} className="mt-3 text-purple-600 font-bold">+ Add your first kid</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, color }: { label: string; value: number; sub: string; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-xl mb-2`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-gray-800">{value}</div>
      <div className="text-xs font-bold text-gray-600">{label}</div>
      <div className="text-xs text-gray-400">{sub}</div>
    </div>
  );
}
