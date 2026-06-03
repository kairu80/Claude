import React, { useState } from 'react';
import { CalendarEvent, genId, formatTime12 } from '../types';
import { X, Trash2, Clock } from 'lucide-react';

export const EVENT_COLOR_OPTIONS = [
  { value: 'blue',   label: 'Blue',   cls: 'bg-blue-400'   },
  { value: 'green',  label: 'Green',  cls: 'bg-green-400'  },
  { value: 'red',    label: 'Red',    cls: 'bg-red-400'    },
  { value: 'purple', label: 'Purple', cls: 'bg-purple-400' },
  { value: 'orange', label: 'Orange', cls: 'bg-orange-400' },
  { value: 'pink',   label: 'Pink',   cls: 'bg-pink-400'   },
  { value: 'teal',   label: 'Teal',   cls: 'bg-teal-400'   },
  { value: 'yellow', label: 'Yellow', cls: 'bg-yellow-400' },
];

interface EventModalProps {
  event?: CalendarEvent;
  defaultDate?: string;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
}

export function EventModal({ event, defaultDate, onSave, onDelete, onClose }: EventModalProps) {
  const [title,   setTitle]   = useState(event?.title ?? '');
  const [date,    setDate]    = useState(event?.date ?? defaultDate ?? '');
  const [time,    setTime]    = useState(event?.time ?? '');
  const [endTime, setEndTime] = useState(event?.endTime ?? '');
  const [desc,    setDesc]    = useState(event?.description ?? '');
  const [color,   setColor]   = useState(event?.color ?? 'blue');

  const valid = title.trim().length > 0 && date.length > 0;

  function handleSave() {
    if (!valid) return;
    onSave({ id: event?.id ?? genId(), title: title.trim(), date, time: time||undefined, endTime: endTime||undefined, description: desc.trim()||undefined, color });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b">
          <h2 className="text-lg font-black text-gray-800">{event ? 'Edit Event' : 'Add Event'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={18}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Title *</label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Soccer Practice, Dentist, Library…"
              autoFocus className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-400" />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Date *</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-400" />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5"><Clock size={10} className="inline mr-1"/>Start</label>
              <input type="time" value={time} onChange={e=>setTime(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-400" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">End</label>
              <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-400" />
            </div>
          </div>
          {time && <p className="text-xs text-purple-600 font-semibold -mt-2 pl-1">⏰ {formatTime12(time)}{endTime?` – ${formatTime12(endTime)}`:''}</p>}

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Optional details…" rows={2}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-400 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_COLOR_OPTIONS.map(c => (
                <button key={c.value} onClick={()=>setColor(c.value)} title={c.label}
                  className={`w-9 h-9 rounded-full ${c.cls} transition-all ${color===c.value?'ring-2 ring-offset-2 ring-gray-500 scale-110':'hover:scale-105 opacity-70 hover:opacity-100'}`}/>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t">
          {event && onDelete
            ? <button onClick={()=>{onDelete(event.id);onClose();}} className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm font-bold"><Trash2 size={14}/>Delete</button>
            : <div/>
          }
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
            <button onClick={handleSave} disabled={!valid}
              className="px-5 py-2 text-sm font-black bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
