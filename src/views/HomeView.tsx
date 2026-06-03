import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  getKidTheme, getBirthdayInfo, CalendarEvent,
  todayStr, dateToStr, MONTH_FULL, MONTH_NAMES, DAY_NAMES,
  ParentProfile, Kid, formatTime12,
} from '../types';
import { BirthdayCelebration } from '../components/BirthdayBanner';
import { KidChorePanel } from '../components/KidChorePanel';
import { EVENT_COLORS } from '../components/MonthCalendar';
import { Settings, Bell, ChevronLeft, ChevronRight } from 'lucide-react';

type LoginStep = 'none' | 'select' | 'pin';

export function HomeView() {
  const { state, dispatch } = useApp();

  const [loginStep, setLoginStep]           = useState<LoginStep>('none');
  const [selectedParent, setSelectedParent] = useState<ParentProfile | null>(null);
  const [pin, setPin]                       = useState('');
  const [pinError, setPinError]             = useState(false);
  const [currentMonth, setCurrentMonth]     = useState(new Date());
  const [activeKid, setActiveKid]           = useState<Kid | null>(null);
  const [birthdayKid, setBirthdayKid]       = useState<Kid | null>(null);

  const todayDate = todayStr();
  const now = new Date();

  // Next upcoming event
  const nextEvent = [...(state.events ?? [])]
    .filter(e => e.date >= todayDate)
    .sort((a,b) => { const d=a.date.localeCompare(b.date); return d!==0?d:(a.time??'23:59').localeCompare(b.time??'23:59'); })[0] ?? null;

  function eventLabel(ev: CalendarEvent): string {
    if (ev.date === todayDate) return 'Today';
    const tmr = new Date(now); tmr.setDate(now.getDate()+1);
    if (ev.date === dateToStr(tmr)) return 'Tomorrow';
    const d = new Date(ev.date+'T12:00:00');
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  }

  function handleKidClick(kid: Kid) {
    const bd = getBirthdayInfo(kid.birthday);
    if (bd.isToday) {
      dispatch({ type:'AWARD_BADGE', kidId:kid.id, badgeId:'birthday_star' });
      setBirthdayKid(kid);
    } else {
      setActiveKid(kid);
    }
  }

  function selectParent(p: ParentProfile) { setSelectedParent(p); setPin(''); setPinError(false); setLoginStep('pin'); }

  function handlePinDigit(digit: number|'⌫') {
    if (digit==='⌫') { setPin(p=>p.slice(0,-1)); return; }
    if (pin.length>=4) return;
    const np = pin+digit;
    setPin(np);
    if (np.length===4) {
      if (selectedParent && np===selectedParent.pin) {
        dispatch({ type:'SET_ACTIVE_PARENT', parentId:selectedParent.id });
        dispatch({ type:'SET_VIEW', view:'parent' });
      } else {
        setPinError(true);
        setTimeout(()=>{ setPin(''); setPinError(false); }, 900);
      }
    }
  }

  function closeLogin() { setLoginStep('none'); setSelectedParent(null); setPin(''); setPinError(false); }

  // Calendar grid
  const year=currentMonth.getFullYear(), mIdx=currentMonth.getMonth();
  const pad = new Date(year,mIdx,1).getDay();
  const dim = new Date(year,mIdx+1,0).getDate();
  const cells = Array.from({length: Math.ceil((pad+dim)/7)*7}, (_,i) => {
    const d = new Date(year,mIdx,1-pad+i);
    return { date:d, inMonth: d.getMonth()===mIdx };
  });

  function eventsForDay(ds: string) {
    return (state.events??[]).filter(e=>e.date===ds).sort((a,b)=>(a.time??'').localeCompare(b.time??''));
  }

  function choreDot(ds: string): 'all'|'some'|'missed'|null {
    if (ds > todayDate) return null;
    const dow = new Date(ds+'T12:00:00').getDay() as 0|1|2|3|4|5|6;
    let tot=0, done=0;
    for (const kid of state.kids) {
      const kc = state.chores.filter(c=>(c.assignedTo.length===0||c.assignedTo.includes(kid.id))&&(c.type==='daily'||c.type==='weekly')&&c.daysOfWeek.includes(dow));
      tot+=kc.length;
      done+=kc.filter(c=>state.completions.some(co=>co.choreId===c.id&&co.kidId===kid.id&&co.date===ds)).length;
    }
    if (tot===0) return null;
    return done===tot?'all':done>0?'some':'missed';
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {birthdayKid && (
        <BirthdayCelebration kid={birthdayKid} onDone={()=>{ const k=birthdayKid; setBirthdayKid(null); setActiveKid(k); }}/>
      )}

      {activeKid && (
        <KidChorePanel kid={activeKid} onClose={()=>setActiveKid(null)}
          onFullView={()=>{ setActiveKid(null); dispatch({type:'SET_VIEW',view:'kid',kidId:activeKid.id}); }}/>
      )}

      {/* Parent login modal */}
      {loginStep!=='none' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e=>{if(e.target===e.currentTarget)closeLogin();}}>
          {loginStep==='select' && (
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
              <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6 text-center">
                <div className="text-5xl mb-2">🏠</div>
                <h2 className="text-2xl font-black text-white">Parent Login</h2>
                <p className="text-white/60 text-sm mt-1">Who's managing today?</p>
              </div>
              <div className="p-5 space-y-3">
                {state.parents.map(p => (
                  <button key={p.id} onClick={()=>selectParent(p)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${p.gradient} text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-md`}>
                    <span className="text-4xl">{p.avatar}</span>
                    <div className="text-left"><div className="font-black text-xl">{p.name}</div><div className="text-white/60 text-xs">PIN protected 🔒</div></div>
                  </button>
                ))}
                <button onClick={closeLogin} className="w-full text-gray-400 text-sm py-2 hover:text-gray-600">Cancel</button>
              </div>
            </div>
          )}
          {loginStep==='pin' && selectedParent && (
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-slide-up">
              <div className={`bg-gradient-to-r ${selectedParent.gradient} p-5 text-center`}>
                <div className="text-5xl mb-1">{selectedParent.avatar}</div>
                <h2 className="text-xl font-black text-white">Hi, {selectedParent.name}!</h2>
                <p className="text-white/70 text-xs mt-1">Enter your 4-digit PIN</p>
              </div>
              <div className={`p-5 ${pinError?'animate-wiggle':''}`}>
                <div className="flex justify-center gap-3 mb-4">
                  {[0,1,2,3].map(i=>(
                    <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${pin.length>i?`scale-110 border-transparent bg-gradient-to-br ${selectedParent.gradient}`:'border-gray-300'}`}/>
                  ))}
                </div>
                {pinError && <p className="text-center text-red-500 text-xs font-bold mb-3 animate-bounce-in">❌ Wrong PIN!</p>}
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((num,i)=>(
                    <button key={i} disabled={num===''}
                      onClick={()=>typeof num==='number'?handlePinDigit(num):num==='⌫'?handlePinDigit('⌫'):undefined}
                      className={`h-12 rounded-xl text-lg font-black transition-all active:scale-90 ${num===''?'invisible':num==='⌫'?'bg-gray-100 text-gray-500':'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                    >{num}</button>
                  ))}
                </div>
                <button onClick={()=>setLoginStep('select')} className="w-full text-gray-400 text-xs mt-3 py-1">← Back</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-sm">🏆</div>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-none">ChoreQuest</h1>
              <p className="text-xs text-gray-400 font-medium">Family Calendar</p>
            </div>
          </div>
          <button onClick={()=>setLoginStep('select')}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-600 px-3 py-2 rounded-xl text-sm font-semibold transition-colors">
            <Settings size={14}/> Parents
          </button>
        </div>
      </header>

      {/* Next event banner */}
      {nextEvent && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <Bell size={14} className="flex-shrink-0"/>
            <span className="font-black text-sm flex-shrink-0">{eventLabel(nextEvent)}:</span>
            <span className="font-semibold text-sm flex-1 truncate">{nextEvent.title}</span>
            {nextEvent.time && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0">{formatTime12(nextEvent.time)}</span>}
          </div>
        </div>
      )}

      {/* Calendar */}
      <main className="flex-1 overflow-auto bg-white">
        <div className="max-w-3xl mx-auto p-3">

          {/* Month nav */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button onClick={()=>setCurrentMonth(new Date(year,mIdx-1,1))}
              className="w-9 h-9 rounded-xl hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 transition-colors">
              <ChevronLeft size={18}/>
            </button>
            <h2 className="text-xl font-black text-gray-800">{MONTH_FULL[mIdx]} {year}</h2>
            <button onClick={()=>setCurrentMonth(new Date(year,mIdx+1,1))}
              className="w-9 h-9 rounded-xl hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 transition-colors">
              <ChevronRight size={18}/>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map(d=><div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>)}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map(({date, inMonth})=>{
              const ds      = dateToStr(date);
              const isToday = ds===todayDate;
              const dayEvts = inMonth ? eventsForDay(ds) : [];
              const dot     = inMonth ? choreDot(ds) : null;

              return (
                <div key={ds} className={`rounded-xl overflow-hidden transition-all ${!inMonth?'opacity-20':''} ${isToday?'ring-2 ring-purple-400 ring-offset-1':''}`} style={{minHeight:76}}>
                  <div className={`px-1.5 pt-1.5 pb-0.5 ${isToday?'bg-purple-600':inMonth?'bg-gray-50':'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-black leading-none ${isToday?'text-white':inMonth?'text-gray-800':'text-gray-400'}`}>{date.getDate()}</span>
                      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot==='all'?'bg-green-400':dot==='some'?'bg-yellow-400':'bg-red-300'}`}/>}
                    </div>
                  </div>
                  <div className={`px-1 pb-1 space-y-0.5 ${isToday?'bg-purple-50':'bg-white'}`}>
                    {dayEvts.slice(0,2).map(ev=>{
                      const cs = EVENT_COLORS[ev.color]??EVENT_COLORS.blue;
                      return (
                        <div key={ev.id} title={`${ev.title}${ev.time?' @ '+formatTime12(ev.time):''}`}
                          className={`text-xs px-1 py-0.5 rounded-md truncate font-semibold ${cs.bg} ${cs.text}`}>
                          {ev.time?`${formatTime12(ev.time)} `:''}{ev.title}
                        </div>
                      );
                    })}
                    {dayEvts.length>2 && <div className="text-xs text-purple-400 font-bold px-1">+{dayEvts.length-2}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 justify-center mt-3 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>All chores done</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/>Some done</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-300 inline-block"/>Missed</span>
          </div>
        </div>
      </main>

      {/* Kids bar */}
      <footer className="bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 pt-2 pb-safe-bottom pb-3">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tap your name to see your chores</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {state.kids.length===0
              ? <p className="text-gray-400 text-xs py-3">No kids yet — log in as a parent to add them.</p>
              : state.kids.map(kid=>{
                  const theme  = getKidTheme(kid);
                  const bd     = getBirthdayInfo(kid.birthday);
                  const wPts   = kid.weeklyPoints??0;
                  return (
                    <button key={kid.id} onClick={()=>handleKidClick(kid)} className="flex flex-col items-center gap-1 group">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-3xl shadow-md group-hover:scale-110 group-active:scale-95 transition-transform relative`}>
                        {kid.avatar}
                        {bd.isToday && <span className="absolute -top-1 -right-1 text-base animate-bounce">🎂</span>}
                      </div>
                      <span className="text-sm font-black text-gray-800">{kid.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${wPts>0?'bg-purple-100 text-purple-600':'bg-gray-100 text-gray-400'}`}>⭐ {wPts} pts</span>
                      {bd.isSoon&&!bd.isToday&&<span className="text-xs bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full font-bold">🎈 {bd.daysUntil}d</span>}
                    </button>
                  );
                })
            }
          </div>
        </div>
      </footer>
    </div>
  );
}
