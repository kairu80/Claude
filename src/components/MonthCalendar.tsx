import React from 'react';
import { CalendarEvent, Chore, Completion, Kid, dateToStr, todayStr, MONTH_FULL, DAY_NAMES, formatTime12 } from '../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export const EVENT_COLORS: Record<string, { bg: string; text: string }> = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-800'   },
  green:  { bg: 'bg-green-100',  text: 'text-green-800'  },
  red:    { bg: 'bg-red-100',    text: 'text-red-800'    },
  purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-800' },
  pink:   { bg: 'bg-pink-100',   text: 'text-pink-800'   },
  teal:   { bg: 'bg-teal-100',   text: 'text-teal-800'   },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
};

interface MonthCalendarProps {
  events: CalendarEvent[];
  completions: Completion[];
  chores: Chore[];
  kids: Kid[];
  month: Date;
  onMonthChange: (d: Date) => void;
  isParentMode?: boolean;
  onDayClick?: (dateStr: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function MonthCalendar({ events, completions, chores, kids, month, onMonthChange, isParentMode = false, onDayClick, onEventClick }: MonthCalendarProps) {
  const today    = todayStr();
  const year     = month.getFullYear();
  const monthIdx = month.getMonth();
  const padStart = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const totalCells = Math.ceil((padStart + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(year, monthIdx, 1 - padStart + i);
    return { date: d, inMonth: d.getMonth() === monthIdx };
  });

  function eventsForDay(ds: string) {
    return (events ?? []).filter(e => e.date === ds).sort((a,b) => (a.time??'').localeCompare(b.time??''));
  }

  function choreStatus(ds: string): 'all'|'some'|'missed'|'future'|'none' {
    const dow = new Date(ds+'T12:00:00').getDay() as 0|1|2|3|4|5|6;
    let total = 0, done = 0;
    for (const kid of kids) {
      const kc = chores.filter(c => (c.assignedTo.length===0||c.assignedTo.includes(kid.id)) && (c.type==='daily'||c.type==='weekly') && c.daysOfWeek.includes(dow));
      total += kc.length;
      done  += kc.filter(c => completions.some(co => co.choreId===c.id && co.kidId===kid.id && co.date===ds)).length;
    }
    if (total === 0) return 'none';
    if (ds > today)  return 'future';
    if (done === total) return 'all';
    if (done > 0)    return 'some';
    return 'missed';
  }

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => onMonthChange(new Date(year, monthIdx-1, 1))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-lg font-black text-gray-800">{MONTH_FULL[monthIdx]} {year}</h2>
        <button onClick={() => onMonthChange(new Date(year, monthIdx+1, 1))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map(({ date, inMonth }) => {
          const ds       = dateToStr(date);
          const isToday  = ds === today;
          const dayEvts  = inMonth ? eventsForDay(ds) : [];
          const status   = inMonth ? choreStatus(ds) : 'none';

          return (
            <div
              key={ds}
              onClick={() => isParentMode && inMonth && onDayClick?.(ds)}
              className={`rounded-xl overflow-hidden border transition-all ${
                !inMonth        ? 'opacity-20 border-transparent bg-gray-50'
                : isToday       ? 'border-purple-400 ring-2 ring-purple-300 ring-offset-1'
                : isParentMode  ? 'border-gray-100 bg-white hover:border-purple-300 hover:bg-purple-50 cursor-pointer'
                : 'border-gray-100 bg-white'
              }`}
              style={{ minHeight: 72 }}
            >
              {/* Date number */}
              <div className={`px-1.5 pt-1.5 pb-0.5 flex items-center justify-between ${isToday ? 'bg-purple-600' : ''}`}>
                <span className={`text-sm font-black w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'text-white' : inMonth ? 'text-gray-700' : 'text-gray-400'
                }`}>{date.getDate()}</span>

                {/* Chore dot */}
                {inMonth && status !== 'none' && status !== 'future' && (
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    status==='all' ? 'bg-green-400' : status==='some' ? 'bg-yellow-400' : 'bg-red-300'
                  }`} />
                )}
                {isParentMode && inMonth && (
                  <button onClick={e=>{e.stopPropagation();onDayClick?.(ds);}} className="w-4 h-4 rounded-full bg-gray-200 hover:bg-purple-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Plus size={8} className="text-gray-600" />
                  </button>
                )}
              </div>

              {/* Events */}
              <div className={`px-1 pb-1 space-y-0.5 ${isToday ? 'bg-purple-50' : ''}`}>
                {dayEvts.slice(0, 2).map(ev => {
                  const cs = EVENT_COLORS[ev.color] ?? EVENT_COLORS.blue;
                  return (
                    <div key={ev.id} onClick={e=>{e.stopPropagation();onEventClick?.(ev);}}
                      title={`${ev.title}${ev.time?' @ '+formatTime12(ev.time):''}`}
                      className={`text-xs px-1 py-0.5 rounded truncate font-medium ${cs.bg} ${cs.text} ${onEventClick?'cursor-pointer hover:opacity-80':''}`}
                    >
                      {ev.time && <span className="font-bold">{formatTime12(ev.time)} </span>}{ev.title}
                    </div>
                  );
                })}
                {dayEvts.length > 2 && (
                  <div onClick={e=>{e.stopPropagation();onDayClick?.(ds);}} className="text-xs text-purple-500 font-bold px-1 cursor-pointer">
                    +{dayEvts.length-2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-3 justify-center flex-wrap text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>All done</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/>In progress</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-300 inline-block"/>Missed</span>
      </div>
    </div>
  );
}
