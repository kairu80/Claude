import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChoreModal } from '../components/ChoreModal';
import { KidModal } from '../components/KidModal';
import { RewardModal } from '../components/RewardModal';
import { MonthCalendar } from '../components/MonthCalendar';
import { EventModal } from '../components/EventModal';
import { BirthdayCountdown } from '../components/BirthdayBanner';
import {
  CalendarEvent,
  Chore, Kid, Reward, ChoreType, getKidColor, getXPProgress,
  todayStr, getWeekDays, dateToStr, ALL_BADGES, DAY_FULL, MONTH_NAMES,
  getBirthdayInfo, formatAge, formatTime12,
} from '../types';
import {
  LayoutDashboard, ListChecks, Calendar, Gift, Users, LogOut,
  Plus, Pencil, Trash2, CheckCircle, XCircle, ChevronRight, Star, Flame, Settings,
  Download, RotateCcw, ChevronDown, ChevronUp,
} from 'lucide-react';

type ParentTab = 'dashboard' | 'chores' | 'calendar' | 'rewards' | 'kids';

function exportICS(events: CalendarEvent[]) {
  if (!events.length) { alert('No events to export!'); return; }
  const pad = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth()+1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ChoreQuest//Family Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  for (const ev of events) {
    const ds = ev.date.replace(/-/g, '');
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.id}@chorequest.app`);
    lines.push(`DTSTAMP:${stamp}`);
    if (ev.time) {
      const ts = ev.time.replace(':', '') + '00';
      lines.push(`DTSTART:${ds}T${ts}`);
      if (ev.endTime) {
        lines.push(`DTEND:${ds}T${ev.endTime.replace(':', '')}00`);
      } else {
        const [h, m] = ev.time.split(':').map(Number);
        const end = new Date(0); end.setHours(h + 1, m);
        lines.push(`DTEND:${ds}T${pad(end.getHours())}${pad(end.getMinutes())}00`);
      }
    } else {
      const nextDay = new Date(ev.date + 'T12:00:00');
      nextDay.setDate(nextDay.getDate() + 1);
      lines.push(`DTSTART;VALUE=DATE:${ds}`);
      lines.push(`DTEND;VALUE=DATE:${dateToStr(nextDay).replace(/-/g, '')}`);
    }
    lines.push(`SUMMARY:${ev.title.replace(/[,;\\]/g, c => '\\' + c)}`);
    if (ev.description) lines.push(`DESCRIPTION:${ev.description.replace(/[,;\\]/g, c => '\\' + c).replace(/\n/g, '\\n')}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'ChoreQuest-Calendar.ics'; a.click();
  URL.revokeObjectURL(url);
}

export function ParentView() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<ParentTab>('dashboard');
  const [choreFilter, setChoreFilter] = useState<ChoreType | 'all'>('all');
  const [editingChore, setEditingChore] = useState<Chore | null | 'new'>(null);
  const [editingKid, setEditingKid] = useState<Kid | null | 'new'>(null);
  const [editingReward, setEditingReward] = useState<Reward | null | 'new'>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editingParentPin, setEditingParentPin] = useState<{ id: string; pin: string } | null>(null);
  const [confirmResetWeek, setConfirmResetWeek] = useState(false);
  const [showWeekHistory, setShowWeekHistory] = useState(false);

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date());
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null | 'new'>(null);
  const [calDefaultDate, setCalDefaultDate] = useState<string | undefined>();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const todayDate = todayStr();
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const activeParent = state.parents.find(p => p.id === state.activeParentId) ?? state.parents[0];
  const weekCompletions = state.completions.filter(c => new Date(c.date + 'T12:00:00') >= startOfWeek);
  const todayCompletions = state.completions.filter(c => c.date === todayDate);
  const pendingCompletions = state.completions.filter(c => !c.approved);
  const pendingRedemptions = state.redemptions.filter(r => !r.approved && !r.denied);
  const totalAlerts = pendingCompletions.length + pendingRedemptions.length;

  const sortedEvents = [...(state.events ?? [])].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : (a.time ?? '').localeCompare(b.time ?? '');
  });

  const selectedDayEvents = selectedDay ? sortedEvents.filter(e => e.date === selectedDay) : [];

  const TABS = [
    { id: 'dashboard' as ParentTab, label: 'Dashboard', icon: <LayoutDashboard size={18}/> },
    { id: 'chores'    as ParentTab, label: 'Chores',    icon: <ListChecks size={18}/> },
    { id: 'calendar'  as ParentTab, label: 'Calendar',  icon: <Calendar size={18}/> },
    { id: 'rewards'   as ParentTab, label: 'Rewards',   icon: <Gift size={18}/> },
    { id: 'kids'      as ParentTab, label: 'Kids',      icon: <Users size={18}/> },
  ];

  function handleDayClick(ds: string) {
    setSelectedDay(ds);
    setCalDefaultDate(ds);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Modals */}
      {editingChore !== null && (
        <ChoreModal
          chore={editingChore === 'new' ? undefined : editingChore}
          kids={state.kids}
          onSave={chore => { dispatch({ type: editingChore === 'new' ? 'ADD_CHORE' : 'UPDATE_CHORE', chore }); setEditingChore(null); }}
          onClose={() => setEditingChore(null)}
        />
      )}
      {editingKid !== null && (
        <KidModal
          kid={editingKid === 'new' ? undefined : editingKid}
          onSave={kid => { dispatch({ type: editingKid === 'new' ? 'ADD_KID' : 'UPDATE_KID', kid }); setEditingKid(null); }}
          onClose={() => setEditingKid(null)}
        />
      )}
      {editingReward !== null && (
        <RewardModal
          reward={editingReward === 'new' ? undefined : editingReward}
          onSave={reward => { dispatch({ type: editingReward === 'new' ? 'ADD_REWARD' : 'UPDATE_REWARD', reward }); setEditingReward(null); }}
          onClose={() => setEditingReward(null)}
        />
      )}
      {editingEvent !== null && (
        <EventModal
          event={editingEvent === 'new' ? undefined : editingEvent}
          defaultDate={calDefaultDate}
          onSave={event => dispatch({ type: editingEvent === 'new' ? 'ADD_EVENT' : 'UPDATE_EVENT', event })}
          onDelete={editingEvent !== 'new' ? (id) => dispatch({ type: 'DELETE_EVENT', eventId: id }) : undefined}
          onClose={() => setEditingEvent(null)}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${activeParent?.gradient ?? 'from-slate-700 to-slate-900'} text-white px-4 pt-4 pb-0 shadow-xl`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                {activeParent?.avatar ?? '👤'}
              </div>
              <div>
                <h1 className="text-xl font-black">{activeParent?.name ?? 'Parent'}'s Dashboard</h1>
                <p className="text-white/60 text-xs">
                  {DAY_FULL[today.getDay()]}, {MONTH_NAMES[today.getMonth()]} {today.getDate()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSettings(!showSettings)} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Settings size={16} />
              </button>
              <button onClick={() => { dispatch({ type: 'SET_ACTIVE_PARENT', parentId: null }); dispatch({ type: 'SET_VIEW', view: 'home' }); }} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center">
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="bg-white/10 rounded-2xl p-4 mb-3 space-y-3">
              <p className="text-sm font-black text-white/90">⚙️ PIN Settings</p>
              {state.parents.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-lg">{p.avatar}</span>
                  <span className="text-sm font-bold text-white flex-1">{p.name}</span>
                  {editingParentPin?.id === p.id ? (
                    <>
                      <input
                        type="number"
                        maxLength={4}
                        value={editingParentPin.pin}
                        onChange={e => setEditingParentPin({ id: p.id, pin: e.target.value.slice(0, 4) })}
                        placeholder="New PIN"
                        className="w-24 bg-white/20 rounded-lg px-2 py-1 text-sm text-white placeholder-white/40 outline-none text-center"
                      />
                      <button
                        onClick={() => {
                          if (editingParentPin.pin.length === 4) {
                            dispatch({ type: 'UPDATE_PARENT', parent: { ...p, pin: editingParentPin.pin } });
                          }
                          setEditingParentPin(null);
                        }}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg text-xs font-bold"
                      >Save</button>
                    </>
                  ) : (
                    <>
                      <span className="text-white/50 text-sm font-mono">••••</span>
                      <button onClick={() => setEditingParentPin({ id: p.id, pin: '' })} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold">Change</button>
                    </>
                  )}
                </div>
              ))}
              <p className="text-xs text-white/50 mt-1">Kids' PINs can be changed in the Kids tab.</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-bold transition-all relative ${
                  tab === t.id ? 'text-white border-b-2 border-white/80' : 'text-white/50 hover:text-white/80'
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
              {/* Birthday countdowns */}
              {state.kids.map(kid => <BirthdayCountdown key={kid.id} kid={kid} />)}

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Today" value={todayCompletions.length} sub="chores done" icon="✅" color="bg-green-500" />
                <StatCard label="This Week" value={weekCompletions.length} sub="chores done" icon="📅" color="bg-blue-500" />
                <StatCard label="Chores" value={state.chores.length} sub="total set up" icon="📋" color="bg-purple-500" />
                <StatCard label="Rewards" value={state.rewards.length} sub="available" icon="🎁" color="bg-amber-500" />
              </div>

              {/* Weekly scores */}
              <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <h2 className="text-base font-black text-gray-700">⭐ Weekly Scores</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowWeekHistory(v => !v)}
                      className="text-xs text-purple-600 font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-50"
                    >
                      History {showWeekHistory ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                    </button>
                    {confirmResetWeek ? (
                      <div className="flex gap-1">
                        <button onClick={() => { dispatch({ type: 'RESET_WEEKLY_SCORES' }); setConfirmResetWeek(false); }}
                          className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded-lg">Confirm</button>
                        <button onClick={() => setConfirmResetWeek(false)}
                          className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmResetWeek(true)}
                        className="flex items-center gap-1 text-xs text-red-500 font-bold px-2 py-1 rounded-lg hover:bg-red-50">
                        <RotateCcw size={12}/> Reset Week
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-4 space-y-2">
                  {[...state.kids].sort((a, b) => (b.weeklyPoints ?? 0) - (a.weeklyPoints ?? 0)).map((kid, i) => {
                    const color = getKidColor(kid.colorName);
                    const maxPts = Math.max(...state.kids.map(k => k.weeklyPoints ?? 0), 1);
                    const pct = Math.round(((kid.weeklyPoints ?? 0) / maxPts) * 100);
                    return (
                      <div key={kid.id} className="flex items-center gap-3">
                        <span className="text-lg w-6 text-center">{['🥇','🥈','🥉'][i] ?? '🏅'}</span>
                        <span className="text-xl">{kid.avatar}</span>
                        <span className="text-sm font-bold text-gray-700 w-16 flex-shrink-0">{kid.name}</span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${color.gradient} transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-black text-gray-800 w-12 text-right">{kid.weeklyPoints ?? 0} pts</span>
                      </div>
                    );
                  })}
                </div>

                {/* Week history */}
                {showWeekHistory && (state.weeklyScoreHistory ?? []).length > 0 && (
                  <div className="border-t border-gray-100 px-4 py-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Past Weeks</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {[...(state.weeklyScoreHistory ?? [])].reverse().map(rec => {
                        const kid = state.kids.find(k => k.id === rec.kidId);
                        return (
                          <div key={rec.id} className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{kid?.avatar ?? '👤'}</span>
                            <span className="font-semibold">{kid?.name ?? rec.kidId}</span>
                            <span className="text-gray-300">·</span>
                            <span>Week of {rec.weekStart}</span>
                            <span className="ml-auto font-bold text-amber-600">{rec.points} pts</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* Pending approvals */}
              {(pendingCompletions.length > 0 || pendingRedemptions.length > 0) && (
                <section>
                  <h2 className="text-base font-black text-gray-700 mb-3">🔔 Needs Attention</h2>
                  {pendingCompletions.map(c => {
                    const chore = state.chores.find(x => x.id === c.choreId);
                    const kid = state.kids.find(x => x.id === c.kidId);
                    if (!chore || !kid) return null;
                    const color = getKidColor(kid.colorName);
                    return (
                      <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-2 flex items-center gap-3">
                        <div className={`w-10 h-10 ${color.light} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>{chore.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm">{kid.avatar} {kid.name} completed <span className="text-purple-600">{chore.title}</span></p>
                          <p className="text-xs text-gray-500">+{chore.points} pts pending · {c.date}</p>
                        </div>
                        <button onClick={() => dispatch({ type: 'APPROVE_COMPLETION', completionId: c.id })} className="w-9 h-9 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center"><CheckCircle size={18} className="text-green-600"/></button>
                        <button onClick={() => dispatch({ type: 'UNDO_COMPLETION', completionId: c.id })} className="w-9 h-9 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center"><XCircle size={18} className="text-red-500"/></button>
                      </div>
                    );
                  })}
                  {pendingRedemptions.map(r => {
                    const reward = state.rewards.find(x => x.id === r.rewardId);
                    const kid = state.kids.find(x => x.id === r.kidId);
                    if (!reward || !kid) return null;
                    return (
                      <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-amber-200 p-3 mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{reward.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm">{kid.avatar} {kid.name} wants <span className="text-amber-600">{reward.title}</span></p>
                          <p className="text-xs text-gray-500">{reward.pointCost} pts spent</p>
                        </div>
                        <button onClick={() => dispatch({ type: 'APPROVE_REDEMPTION', redemptionId: r.id })} className="w-9 h-9 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center"><CheckCircle size={18} className="text-green-600"/></button>
                        <button onClick={() => dispatch({ type: 'DENY_REDEMPTION', redemptionId: r.id })} className="w-9 h-9 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center"><XCircle size={18} className="text-red-500"/></button>
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Kid leaderboard */}
              <section>
                <h2 className="text-base font-black text-gray-700 mb-3">🏆 Kid Leaderboard</h2>
                <div className="space-y-3">
                  {[...state.kids].sort((a, b) => b.totalXP - a.totalXP).map((kid, i) => {
                    const color = getKidColor(kid.colorName);
                    const xp = getXPProgress(kid.totalXP);
                    const todayDone = state.completions.filter(c => c.kidId === kid.id && c.date === todayDate).length;
                    const bdInfo = getBirthdayInfo(kid.birthday);
                    return (
                      <div key={kid.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 p-3">
                          <div className="text-2xl w-8 text-center">{['🥇','🥈','🥉'][i] ?? `${i+1}`}</div>
                          <div className={`w-12 h-12 bg-gradient-to-br ${color.gradient} rounded-2xl flex items-center justify-center text-2xl shadow-md`}>{kid.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-gray-800">{kid.name}</span>
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{xp.levelEmoji} Lv.{xp.level}</span>
                              {kid.streak > 0 && <span className="text-xs flex items-center gap-0.5 text-orange-600 font-bold"><Flame size={12}/> {kid.streak}</span>}
                              {bdInfo.isToday && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold animate-bounce">🎂 Birthday!</span>}
                              {bdInfo.isSoon && !bdInfo.isToday && <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">🎈 {bdInfo.daysUntil}d to bday</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-amber-600 font-bold flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400"/> {kid.points} pts</span>
                              <span className="text-xs text-gray-400">{kid.totalXP} XP</span>
                              <span className="text-xs text-green-600 font-semibold">✅ {todayDone} today</span>
                              <span className="text-xs text-purple-600 font-semibold">⭐ {kid.weeklyPoints ?? 0} this week</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                              <div className={`h-full bg-gradient-to-r ${color.gradient} rounded-full`} style={{ width: `${xp.percentage}%` }} />
                            </div>
                          </div>
                          <button onClick={() => { setEditingKid(kid); setTab('kids'); }} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center"><ChevronRight size={16} className="text-gray-400"/></button>
                        </div>
                        {kid.badges.length > 0 && (
                          <div className="px-4 pb-3 flex gap-1.5">
                            {kid.badges.slice(0, 8).map(badgeId => {
                              const badge = ALL_BADGES.find(b => b.id === badgeId);
                              return badge ? <span key={badgeId} title={badge.name} className={`w-7 h-7 rounded-lg ${badge.color} flex items-center justify-center text-sm`}>{badge.icon}</span> : null;
                            })}
                            {kid.badges.length > 8 && <span className="text-xs text-gray-400 self-center">+{kid.badges.length - 8}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Recent activity */}
              <section>
                <h2 className="text-base font-black text-gray-700 mb-3">📊 Recent Activity</h2>
                <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
                  {state.completions.slice(-8).reverse().map(c => {
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
                        <span className="text-xs text-gray-400">{c.date}</span>
                        <span className={`text-xs font-bold ${c.approved ? 'text-green-600' : 'text-amber-500'}`}>{c.approved ? `+${chore.points}` : '⏳'}</span>
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
                <button onClick={() => setEditingChore('new')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-colors">
                  <Plus size={16}/> Add Chore
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {(['all','daily','weekly','kindness'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setChoreFilter(f)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold flex-shrink-0 transition-all ${choreFilter === f ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}
                  >
                    {f === 'all' ? '📋 All' : f === 'daily' ? '📅 Daily' : f === 'weekly' ? '📆 Weekly' : '💝 Kindness'}
                    <span className="ml-1 text-xs opacity-70">({state.chores.filter(c => f === 'all' || c.type === f).length})</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {state.chores.filter(c => choreFilter === 'all' || c.type === choreFilter).map(chore => {
                  const completionsThisWeek = state.completions.filter(c2 => c2.choreId === chore.id && new Date(c2.date + 'T12:00:00') >= startOfWeek).length;
                  const assignedKids = chore.assignedTo.length === 0 ? state.kids : state.kids.filter(k => chore.assignedTo.includes(k.id));
                  return (
                    <div key={chore.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${chore.type === 'daily' ? 'bg-blue-50' : chore.type === 'weekly' ? 'bg-purple-50' : 'bg-pink-50'}`}>{chore.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-gray-800 text-sm">{chore.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${chore.type === 'daily' ? 'bg-blue-100 text-blue-700' : chore.type === 'weekly' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'}`}>
                            {chore.type === 'kindness' ? '💝 Kindness' : chore.type}
                          </span>
                          {chore.requiresApproval && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">🔍 approval</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="text-amber-600 font-bold">⭐{chore.points}</span>
                          <span>{completionsThisWeek}× this week</span>
                          <span>{assignedKids.map(k => k.avatar).join('')} {chore.assignedTo.length === 0 ? 'All' : assignedKids.map(k=>k.name).join(', ')}</span>
                        </div>
                        {chore.type !== 'kindness' && (
                          <div className="flex gap-0.5 mt-1">
                            {[0,1,2,3,4,5,6].map(d => (
                              <span key={d} className={`text-xs px-1 rounded ${chore.daysOfWeek.includes(d as any) ? 'bg-purple-100 text-purple-700 font-bold' : 'text-gray-200'}`}>
                                {['S','M','T','W','T','F','S'][d]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => setEditingChore(chore)} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center"><Pencil size={14} className="text-blue-600"/></button>
                        <button onClick={() => { if (confirm(`Delete "${chore.title}"?`)) dispatch({ type: 'DELETE_CHORE', choreId: chore.id }); }} className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center"><Trash2 size={14} className="text-red-500"/></button>
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
                <h2 className="text-xl font-black text-gray-800">Family Calendar</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportICS(state.events ?? [])}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
                  >
                    <Download size={14}/> Export .ics
                  </button>
                  <button
                    onClick={() => { setCalDefaultDate(todayDate); setEditingEvent('new'); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
                  >
                    <Plus size={14}/> Add Event
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-4">
                <MonthCalendar
                  events={state.events ?? []}
                  completions={state.completions}
                  chores={state.chores}
                  kids={state.kids}
                  month={calMonth}
                  onMonthChange={setCalMonth}
                  isParentMode={true}
                  onDayClick={handleDayClick}
                  onEventClick={ev => setEditingEvent(ev)}
                />
              </div>

              {/* Selected day events */}
              {selectedDay && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-black text-gray-700 text-sm">
                      {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => { setCalDefaultDate(selectedDay); setEditingEvent('new'); }}
                      className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:bg-purple-50 px-2 py-1 rounded-lg"
                    >
                      <Plus size={12}/> Add
                    </button>
                  </div>
                  {selectedDayEvents.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-400">
                      <p className="text-sm font-semibold">No events this day</p>
                      <button onClick={() => { setCalDefaultDate(selectedDay); setEditingEvent('new'); }}
                        className="mt-2 text-purple-600 font-bold text-sm">+ Add an event</button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {selectedDayEvents.map(ev => (
                        <div key={ev.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => setEditingEvent(ev)}>
                          <div className={`w-2 rounded-full self-stretch flex-shrink-0 bg-${ev.color}-400`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-800">{ev.title}</p>
                            {ev.time && <p className="text-xs text-gray-500">{formatTime12(ev.time)}{ev.endTime ? ` – ${formatTime12(ev.endTime)}` : ''}</p>}
                            {ev.description && <p className="text-xs text-gray-400 truncate">{ev.description}</p>}
                          </div>
                          <Pencil size={14} className="text-gray-300 flex-shrink-0"/>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Upcoming events list */}
              <section>
                <h3 className="text-sm font-black text-gray-600 mb-2">📅 All Upcoming Events</h3>
                {sortedEvents.filter(e => e.date >= todayDate).length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-gray-400">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="font-semibold text-sm">No upcoming events</p>
                    <button onClick={() => { setCalDefaultDate(todayDate); setEditingEvent('new'); }}
                      className="mt-2 text-purple-600 font-bold text-sm">+ Add your first event</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedEvents.filter(e => e.date >= todayDate).map(ev => (
                      <div key={ev.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 px-4 py-3 hover:border-purple-200 cursor-pointer transition-all"
                        onClick={() => setEditingEvent(ev)}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-${ev.color}-100`}>
                          📅
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800">{ev.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {ev.time ? ` · ${formatTime12(ev.time)}` : ''}
                            {ev.endTime ? ` – ${formatTime12(ev.endTime)}` : ''}
                          </p>
                          {ev.description && <p className="text-xs text-gray-400 truncate">{ev.description}</p>}
                        </div>
                        <Pencil size={14} className="text-gray-300 flex-shrink-0"/>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* ══ REWARDS ══════════════════════════════════════════════════ */}
          {tab === 'rewards' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-800">Rewards</h2>
                <button onClick={() => setEditingReward('new')} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-colors">
                  <Plus size={16}/> Add Reward
                </button>
              </div>

              {pendingRedemptions.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <h3 className="font-black text-amber-700 mb-3 text-sm">⏳ Pending Requests</h3>
                  {pendingRedemptions.map(r => {
                    const reward = state.rewards.find(x => x.id === r.rewardId);
                    const kid = state.kids.find(x => x.id === r.kidId);
                    if (!reward || !kid) return null;
                    return (
                      <div key={r.id} className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{reward.icon}</span>
                        <div className="flex-1"><p className="font-bold text-sm">{kid.avatar} {kid.name}: {reward.title}</p><p className="text-xs text-gray-500">{reward.pointCost} pts</p></div>
                        <button onClick={() => dispatch({ type: 'APPROVE_REDEMPTION', redemptionId: r.id })} className="w-9 h-9 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center"><CheckCircle size={18} className="text-green-600"/></button>
                        <button onClick={() => dispatch({ type: 'DENY_REDEMPTION', redemptionId: r.id })} className="w-9 h-9 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center"><XCircle size={18} className="text-red-500"/></button>
                      </div>
                    );
                  })}
                </div>
              )}

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
              </div>
            </>
          )}

          {/* ══ KIDS ═════════════════════════════════════════════════════ */}
          {tab === 'kids' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-800">Kids</h2>
                <button onClick={() => setEditingKid('new')} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-colors">
                  <Plus size={16}/> Add Kid
                </button>
              </div>

              <div className="space-y-4">
                {state.kids.map(kid => {
                  const color = getKidColor(kid.colorName);
                  const xp = getXPProgress(kid.totalXP);
                  const bdInfo = getBirthdayInfo(kid.birthday);
                  const allTimeCompletions = state.completions.filter(c => c.kidId === kid.id).length;

                  return (
                    <div key={kid.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className={`bg-gradient-to-r ${color.gradient} p-4 text-white`}>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">{kid.avatar}</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-black">{kid.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="bg-white/25 rounded-full px-2 py-0.5 text-xs font-bold">{xp.levelEmoji} Lv.{xp.level} {xp.levelName}</span>
                              {kid.streak > 0 && <span className="text-xs font-bold">🔥 {kid.streak} day streak</span>}
                              {kid.birthday && <span className="text-xs bg-white/25 rounded-full px-2 py-0.5 font-bold">🎂 {formatAge(bdInfo)}</span>}
                              {bdInfo.isToday && <span className="text-xs bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5 font-black animate-bounce">🎉 Birthday!</span>}
                              {bdInfo.isSoon && !bdInfo.isToday && <span className="text-xs bg-white/30 rounded-full px-2 py-0.5 font-bold">🎈 {bdInfo.daysUntil}d to bday!</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingKid(kid)} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center"><Pencil size={15}/></button>
                            <button onClick={() => { if (confirm(`Remove ${kid.name}?`)) dispatch({ type: 'DELETE_KID', kidId: kid.id }); }} className="w-9 h-9 bg-white/20 hover:bg-red-500/50 rounded-xl flex items-center justify-center"><Trash2 size={15}/></button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${xp.percentage}%` }} />
                          </div>
                          <div className="flex justify-between text-xs mt-0.5 font-semibold opacity-70">
                            <span>{xp.current} XP</span>
                            <span>{xp.needed - xp.current} XP to Lv.{Math.min(xp.level+1, 10)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-3 mb-3">
                          <div className="text-center"><div className="text-xl font-black text-amber-500">⭐{kid.points}</div><div className="text-xs text-gray-500">pts left</div></div>
                          <div className="text-center"><div className="text-xl font-black text-purple-600">{kid.weeklyPoints ?? 0}</div><div className="text-xs text-gray-500">this week</div></div>
                          <div className="text-center"><div className="text-xl font-black text-blue-600">{allTimeCompletions}</div><div className="text-xs text-gray-500">all time</div></div>
                          <div className="text-center"><div className="text-xl font-black text-purple-600">{kid.badges.length}</div><div className="text-xs text-gray-500">badges</div></div>
                        </div>

                        {/* Badges */}
                        {kid.badges.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {kid.badges.map(badgeId => {
                              const badge = ALL_BADGES.find(b => b.id === badgeId);
                              return badge ? <span key={badgeId} title={badge.name} className={`w-8 h-8 rounded-xl ${badge.color} flex items-center justify-center text-base`}>{badge.icon}</span> : null;
                            })}
                          </div>
                        )}
                      </div>
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

function StatCard({ label, value, sub, icon, color }: { label: string; value: number; sub: string; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-xl mb-2`}>{icon}</div>
      <div className="text-3xl font-black text-gray-800">{value}</div>
      <div className="text-xs font-bold text-gray-600">{label}</div>
      <div className="text-xs text-gray-400">{sub}</div>
    </div>
  );
}
