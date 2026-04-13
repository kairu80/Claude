import React, { useState } from 'react';
import { Chore, ChoreType, DayOfWeek, DAY_NAMES, KID_COLORS, genId } from '../types';
import { X } from 'lucide-react';

interface Props {
  chore?: Chore;
  kids: { id: string; name: string; avatar: string }[];
  onSave: (chore: Chore) => void;
  onClose: () => void;
}

const CHORE_ICONS = ['🛏️','🦷','🧸','🍽️','📚','🧹','👕','🌱','🗑️','🍳','📖','🏃','🌻','🪟','🧽','🐾','🥣','🚿','🪴','🐕','🧴','🧺','🪣','🔧','🌿','🍎','🎨','🎵'];

const blankChore = (): Chore => ({
  id: genId(),
  title: '',
  description: '',
  type: 'daily',
  daysOfWeek: [0,1,2,3,4,5,6],
  points: 15,
  assignedTo: [],
  icon: '🛏️',
  requiresApproval: false,
});

export function ChoreModal({ chore, kids, onSave, onClose }: Props) {
  const [form, setForm] = useState<Chore>(chore ? { ...chore } : blankChore());
  const [showIconPicker, setShowIconPicker] = useState(false);

  function toggleDay(dow: DayOfWeek) {
    setForm(f => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(dow)
        ? f.daysOfWeek.filter(d => d !== dow)
        : [...f.daysOfWeek, dow].sort((a, b) => a - b),
    }));
  }

  function toggleKid(kidId: string) {
    setForm(f => ({
      ...f,
      assignedTo: f.assignedTo.includes(kidId)
        ? f.assignedTo.filter(id => id !== kidId)
        : [...f.assignedTo, kidId],
    }));
  }

  function handleTypeChange(type: ChoreType) {
    const defaultDays: DayOfWeek[] = type === 'daily' ? [0,1,2,3,4,5,6] : type === 'weekly' ? [6] : [];
    setForm(f => ({ ...f, type, daysOfWeek: defaultDays }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim(), description: form.description.trim() });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-bounce-in">
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800">{chore ? 'Edit Chore' : 'Add New Chore'}</h2>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Icon + Title */}
          <div className="flex gap-3 items-start">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-14 h-14 bg-purple-50 hover:bg-purple-100 rounded-2xl text-3xl flex items-center justify-center border-2 border-purple-200 transition-colors"
              >
                {form.icon}
              </button>
              {showIconPicker && (
                <div className="absolute top-16 left-0 bg-white rounded-2xl shadow-2xl p-3 grid grid-cols-6 gap-1 z-10 border border-gray-100 w-52">
                  {CHORE_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => { setForm(f => ({ ...f, icon })); setShowIconPicker(false); }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xl hover:bg-purple-50 transition-colors ${form.icon === icon ? 'bg-purple-100 ring-2 ring-purple-400' : ''}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Chore Name *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Make Bed"
                className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Make your bed neat every morning"
              className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Chore Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'extra'] as ChoreType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`py-2 rounded-xl text-sm font-bold transition-all ${
                    form.type === type
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type === 'daily' ? '📅 Daily' : type === 'weekly' ? '📆 Weekly' : '⭐ Extra'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {form.type === 'daily' ? 'Repeats every selected day' :
               form.type === 'weekly' ? 'Due on specific days of the week' :
               'Optional bonus chore — can be done any day'}
            </p>
          </div>

          {/* Days of week (daily or weekly) */}
          {form.type !== 'extra' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                {form.type === 'daily' ? 'Active Days' : 'Due On'}
              </label>
              <div className="flex gap-1.5">
                {([0,1,2,3,4,5,6] as DayOfWeek[]).map(dow => (
                  <button
                    key={dow}
                    type="button"
                    onClick={() => toggleDay(dow)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      form.daysOfWeek.includes(dow)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {DAY_NAMES[dow]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Points */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
              Points Reward: <span className="text-purple-600 text-base">{form.points} ⭐</span>
            </label>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={form.points}
              onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>5 pts</span>
              <span>100 pts</span>
            </div>
          </div>

          {/* Assigned to */}
          {kids.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                Assign To
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, assignedTo: [] }))}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                    form.assignedTo.length === 0
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  👨‍👩‍👧‍👦 All Kids
                </button>
                {kids.map(kid => (
                  <button
                    key={kid.id}
                    type="button"
                    onClick={() => toggleKid(kid.id)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                      form.assignedTo.includes(kid.id)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {kid.avatar} {kid.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Requires approval */}
          <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3">
            <input
              type="checkbox"
              id="requiresApproval"
              checked={form.requiresApproval}
              onChange={e => setForm(f => ({ ...f, requiresApproval: e.target.checked }))}
              className="w-5 h-5 accent-amber-500"
            />
            <label htmlFor="requiresApproval" className="text-sm font-semibold text-amber-800 cursor-pointer">
              🔍 Requires parent approval before awarding points
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg transition-colors"
            >
              {chore ? 'Save Changes' : 'Add Chore ✨'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
