import React from 'react';
import { Chore, Completion, Kid, DAY_NAMES, MONTH_NAMES, getWeekDays, dateToStr, getKidColor } from '../types';

interface WeekCalendarProps {
  chores: Chore[];
  completions: Completion[];
  kids: Kid[];
  filterKidId?: string | null;
  weekOffset?: number;   // 0 = this week, -1 = last week, +1 = next week
  onComplete?: (choreId: string, kidId: string, date: string) => void;
  isParentView?: boolean;
}

export function WeekCalendar({
  chores,
  completions,
  kids,
  filterKidId,
  weekOffset = 0,
  onComplete,
  isParentView = false,
}: WeekCalendarProps) {
  const ref = new Date();
  ref.setDate(ref.getDate() + weekOffset * 7);
  const days = getWeekDays(ref);
  const todayStr = dateToStr(new Date());

  const activeKids = filterKidId
    ? kids.filter(k => k.id === filterKidId)
    : kids;

  function choreIsForKid(chore: Chore, kidId: string): boolean {
    return chore.assignedTo.length === 0 || chore.assignedTo.includes(kidId);
  }

  function choresForDayAndKid(day: Date, kidId: string): Chore[] {
    const dow = day.getDay() as 0|1|2|3|4|5|6;
    return chores.filter(c => {
      if (!choreIsForKid(c, kidId)) return false;
      if (c.type === 'daily') return c.daysOfWeek.includes(dow);
      if (c.type === 'weekly') return c.daysOfWeek.includes(dow);
      // kindness chores don't appear on the weekly calendar grid
      return false;
    });
  }

  function isCompleted(choreId: string, kidId: string, date: string): boolean {
    return completions.some(c => c.choreId === choreId && c.kidId === kidId && c.date === date);
  }

  const monthLabel = (() => {
    const months = new Set(days.map(d => d.getMonth()));
    if (months.size === 1) {
      const d = days[0];
      return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    }
    const first = days[0];
    const last = days[6];
    return `${MONTH_NAMES[first.getMonth()]} – ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`;
  })();

  return (
    <div className="w-full">
      <p className="text-center text-sm text-gray-500 mb-3 font-medium">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {days.map(day => {
          const ds = dateToStr(day);
          const isToday = ds === todayStr;
          return (
            <div
              key={ds}
              className={`text-center p-1 rounded-lg ${isToday ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              <div className="text-xs font-bold">{DAY_NAMES[day.getDay()]}</div>
              <div className={`text-sm font-black ${isToday ? 'text-white' : 'text-gray-700'}`}>{day.getDate()}</div>
            </div>
          );
        })}

        {/* Chore cells per kid */}
        {activeKids.map(kid => {
          const color = getKidColor(kid.colorName);
          return days.map(day => {
            const ds = dateToStr(day);
            const isToday = ds === todayStr;
            const isFuture = ds > todayStr;
            const dayChores = choresForDayAndKid(day, kid.id);
            const completedCount = dayChores.filter(c => isCompleted(c.id, kid.id, ds)).length;
            const total = dayChores.length;
            const allDone = total > 0 && completedCount === total;
            const someDone = completedCount > 0 && completedCount < total;
            const noDone = completedCount === 0;

            return (
              <div
                key={`${kid.id}-${ds}`}
                className={`min-h-[70px] rounded-lg p-1 transition-all ${
                  isToday ? 'ring-2 ring-purple-400' : ''
                } ${
                  allDone ? 'bg-green-50 border border-green-300' :
                  someDone ? 'bg-yellow-50 border border-yellow-300' :
                  isFuture ? 'bg-gray-50 border border-gray-200' :
                  'bg-red-50 border border-red-200'
                }`}
              >
                {/* Kid avatar (only in multi-kid view) */}
                {!filterKidId && activeKids.length > 1 && (
                  <div className={`text-xs font-bold mb-1 ${color.text}`}>
                    {kid.avatar} {kid.name}
                  </div>
                )}

                {/* Completion badge */}
                {total > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    <div className={`text-xs font-bold ${
                      allDone ? 'text-green-700' : someDone ? 'text-yellow-700' : isFuture ? 'text-gray-400' : 'text-red-700'
                    }`}>
                      {allDone ? '✅' : someDone ? '⏳' : isFuture ? '' : '❌'} {completedCount}/{total}
                    </div>
                    {dayChores.slice(0, 3).map(chore => {
                      const done = isCompleted(chore.id, kid.id, ds);
                      return (
                        <div
                          key={chore.id}
                          title={chore.title}
                          onClick={() => {
                            if (!done && !isFuture && onComplete) {
                              onComplete(chore.id, kid.id, ds);
                            }
                          }}
                          className={`text-xs rounded px-1 truncate cursor-default ${
                            done
                              ? 'bg-green-200 text-green-800 line-through'
                              : isFuture
                              ? 'bg-gray-100 text-gray-400'
                              : onComplete
                              ? 'bg-white text-gray-700 hover:bg-purple-100 cursor-pointer'
                              : 'bg-white text-gray-700'
                          }`}
                        >
                          {chore.icon} {chore.title}
                        </div>
                      );
                    })}
                    {dayChores.length > 3 && (
                      <div className="text-xs text-gray-400">+{dayChores.length - 3} more</div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-300 text-center mt-2">—</div>
                )}
              </div>
            );
          });
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 justify-center flex-wrap text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 inline-block"/><span>All done</span></span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-200 inline-block"/><span>In progress</span></span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block"/><span>Not done</span></span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block"/><span>Upcoming</span></span>
      </div>
    </div>
  );
}
