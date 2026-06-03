import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Kid, Chore, getKidTheme, getXPProgress, todayStr, dateToStr } from '../types';
import { CelebrationOverlay } from './Confetti';
import { X, CheckCircle, Circle, Flame, Star, ChevronRight } from 'lucide-react';

interface Props { kid: Kid; onClose: () => void; onFullView: () => void; }
interface Celebration { message: string; subMessage?: string; points: number; }

export function KidChorePanel({ kid, onClose, onFullView }: Props) {
  const { state, dispatch } = useApp();
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  const theme   = getKidTheme(kid);
  const xp      = getXPProgress(kid.totalXP);
  const today   = new Date();
  const todayDate = todayStr();
  const dow     = today.getDay() as 0|1|2|3|4|5|6;

  function forKid(c: Chore) { return c.assignedTo.length===0 || c.assignedTo.includes(kid.id); }

  const todayChores    = state.chores.filter(c => forKid(c) && (c.type==='daily'||c.type==='weekly') && c.daysOfWeek.includes(dow));
  const kindnessChores = state.chores.filter(c => forKid(c) && c.type==='kindness');

  function isCompleted(id: string) { return state.completions.some(c=>c.choreId===id&&c.kidId===kid.id&&c.date===todayDate); }
  function isPending(id: string)   { return state.completions.some(c=>c.choreId===id&&c.kidId===kid.id&&c.date===todayDate&&!c.approved); }

  function complete(choreId: string) {
    const chore = state.chores.find(c=>c.id===choreId);
    if (!chore || isCompleted(choreId)) return;
    dispatch({ type:'COMPLETE_CHORE', choreId, kidId:kid.id, date:todayDate });
    const msgs = theme.choreCompleteMessages;
    setCelebration({ message: msgs[Math.floor(Math.random()*msgs.length)], subMessage:`${chore.icon} ${chore.title}`, points: chore.requiresApproval?0:chore.points });
  }

  const done  = todayChores.filter(c=>isCompleted(c.id)).length;
  const total = todayChores.length;
  const allDone = total>0 && done===total;

  // Weekly progress
  const sow = new Date(today); sow.setDate(today.getDate()-today.getDay()); sow.setHours(0,0,0,0);
  let wPoss=0, wDone=0;
  for (let i=0; i<=today.getDay(); i++) {
    const d = new Date(sow); d.setDate(sow.getDate()+i);
    const ds = dateToStr(d); const dDow = d.getDay() as 0|1|2|3|4|5|6;
    const dc = state.chores.filter(c=>forKid(c)&&(c.type==='daily'||c.type==='weekly')&&c.daysOfWeek.includes(dDow));
    wPoss += dc.length;
    wDone += dc.filter(c=>state.completions.some(co=>co.choreId===c.id&&co.kidId===kid.id&&co.date===ds)).length;
  }
  const weekPct = wPoss>0 ? Math.round((wDone/wPoss)*100) : 0;

  return (
    <>
      {celebration && <CelebrationOverlay message={celebration.message} subMessage={celebration.subMessage} points={celebration.points} onDone={()=>setCelebration(null)}/>}

      <div className="fixed inset-0 bg-black/50 z-40 flex items-end justify-center" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
        <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] animate-slide-up">

          {/* Header */}
          <div className={`bg-gradient-to-r ${theme.gradient} rounded-t-3xl px-5 pt-4 pb-5 text-white flex-shrink-0`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center text-3xl">{kid.avatar}</div>
                <div>
                  <h2 className="text-2xl font-black leading-none">{kid.name}'s Chores</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="bg-white/25 text-xs font-bold px-2 py-0.5 rounded-full">{xp.levelEmoji} Lv.{xp.level} {xp.levelName}</span>
                    {kid.streak>0 && <span className="bg-white/25 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"><Flame size={11}/>{kid.streak}d streak</span>}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"><X size={18}/></button>
            </div>

            <div className="flex gap-2 mb-3">
              <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Star size={11} className="fill-yellow-300 text-yellow-300"/>{kid.points} pts available</span>
              <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full">⭐ {kid.weeklyPoints??0} this week</span>
            </div>

            {total > 0 && (
              <div>
                <div className="flex justify-between text-xs font-semibold opacity-80 mb-1"><span>Today</span><span>{done}/{total} done</span></div>
                <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-500" style={{width:`${total>0?Math.round(done/total*100):0}%`}}/>
                </div>
                {allDone && <p className="text-center text-xs font-black mt-1.5 animate-bounce-in">🎉 All done today! You're amazing!</p>}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">

              {/* Today's chores */}
              {todayChores.length > 0 ? (
                <section>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">📅 Today's Chores</h3>
                  <div className="space-y-2">
                    {todayChores.map(chore => {
                      const done2   = isCompleted(chore.id);
                      const pending = isPending(chore.id);
                      return (
                        <button key={chore.id} onClick={()=>!done2&&complete(chore.id)} disabled={done2}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${done2?'bg-green-50 border-green-200':'bg-white border-gray-100 hover:border-purple-200 hover:bg-purple-50 active:scale-[0.98] cursor-pointer shadow-sm'}`}
                        >
                          <span className={`text-2xl flex-shrink-0 ${done2?'grayscale opacity-60':''}`}>{chore.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm leading-tight ${done2?'line-through text-gray-400':'text-gray-800'}`}>{chore.title}</p>
                            {!done2 && chore.description && <p className="text-xs text-gray-400 truncate mt-0.5">{chore.description}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-xs font-black ${done2?'text-green-500':pending?'text-amber-500':'text-amber-500'}`}>{pending?'⏳':done2?`+${chore.points}`:`+${chore.points}`}</span>
                            {done2 ? <CheckCircle size={22} className="text-green-500"/> : <Circle size={22} className="text-gray-200"/>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="font-black text-gray-700 text-lg">No chores today!</p>
                  <p className="text-gray-400 text-sm mt-1">Enjoy your free time!</p>
                </div>
              )}

              {/* Kindness bonus */}
              {kindnessChores.length > 0 && (
                <section>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">💝 Bonus Kindness Chores</h3>
                  <div className="space-y-2">
                    {kindnessChores.slice(0,4).map(chore => {
                      const done2 = isCompleted(chore.id);
                      return (
                        <button key={chore.id} onClick={()=>!done2&&complete(chore.id)} disabled={done2}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${done2?'bg-pink-50 border-pink-200 opacity-70':'bg-white border-pink-100 hover:border-pink-300 hover:bg-pink-50 cursor-pointer'}`}
                        >
                          <span className="text-2xl flex-shrink-0">{chore.icon}</span>
                          <div className="flex-1 min-w-0"><p className={`font-bold text-sm ${done2?'line-through text-gray-400':'text-gray-800'}`}>{chore.title}</p></div>
                          <span className="text-xs font-black text-pink-500 flex-shrink-0">+{chore.points}</span>
                          {done2 ? <CheckCircle size={18} className="text-pink-400 flex-shrink-0"/> : <Circle size={18} className="text-pink-200 flex-shrink-0"/>}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Weekly summary */}
              <section className={`rounded-2xl p-4 ${theme.bgLight}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">📊 This Week</h3>
                  <span className={`text-sm font-black ${theme.accentText}`}>{weekPct}%</span>
                </div>
                <div className="h-3 bg-white/70 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-700`} style={{width:`${weekPct}%`}}/>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{wDone}/{wPoss} chores done this week</p>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
            <button onClick={onFullView}
              className={`w-full py-3 rounded-2xl font-black text-white text-sm bg-gradient-to-r ${theme.gradient} hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2`}
            >
              Full Dashboard — Rewards &amp; Badges <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
