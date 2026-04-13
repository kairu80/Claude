import React, { useState } from 'react';
import { Reward, genId } from '../types';
import { X } from 'lucide-react';

const REWARD_ICONS = ['📱','🌙','🎬','🍕','🍦','🛌','🎁','🎮','🎪','🎠','🎡','🏖️','🚴','⛷️','🏊','🍫','🍰','🎂','🎈','🎀','🏆','💐','🌈','✈️','🎭','🎨','🎵','📚','🎯','🎲'];

interface Props {
  reward?: Reward;
  onSave: (reward: Reward) => void;
  onClose: () => void;
}

const blank = (): Reward => ({
  id: genId(),
  title: '',
  description: '',
  pointCost: 100,
  icon: '🎁',
});

export function RewardModal({ reward, onSave, onClose }: Props) {
  const [form, setForm] = useState<Reward>(reward ? { ...reward } : blank());
  const [showIconPicker, setShowIconPicker] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim(), description: form.description.trim() });
  }

  const tiers = [
    { label: 'Small', cost: 50, color: 'bg-green-100 text-green-700' },
    { label: 'Medium', cost: 150, color: 'bg-blue-100 text-blue-700' },
    { label: 'Large', cost: 300, color: 'bg-purple-100 text-purple-700' },
    { label: 'Epic', cost: 500, color: 'bg-amber-100 text-amber-700' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm animate-bounce-in">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800">{reward ? 'Edit Reward' : 'Add New Reward'}</h2>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center">
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
                className="w-14 h-14 bg-amber-50 hover:bg-amber-100 rounded-2xl text-3xl flex items-center justify-center border-2 border-amber-200"
              >
                {form.icon}
              </button>
              {showIconPicker && (
                <div className="absolute top-16 left-0 bg-white rounded-2xl shadow-2xl p-3 grid grid-cols-6 gap-1 z-10 border border-gray-100 w-52">
                  {REWARD_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => { setForm(f => ({ ...f, icon })); setShowIconPicker(false); }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xl hover:bg-amber-50 ${form.icon === icon ? 'bg-amber-100 ring-2 ring-amber-400' : ''}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Reward Name *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Movie Night Pick"
                className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors"
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
              placeholder="e.g. Choose any movie for family night"
              className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
            />
          </div>

          {/* Cost presets */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Point Cost</label>
            <div className="flex gap-2 mb-3 flex-wrap">
              {tiers.map(t => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, pointCost: t.cost }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${t.color} hover:opacity-80 ${form.pointCost === t.cost ? 'ring-2 ring-offset-1 ring-amber-400' : ''}`}
                >
                  {t.label} ({t.cost})
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={25}
                max={1000}
                step={25}
                value={form.pointCost}
                onChange={e => setForm(f => ({ ...f, pointCost: Number(e.target.value) }))}
                className="flex-1 accent-amber-500"
              />
              <span className="font-black text-amber-600 text-lg w-16 text-right">⭐{form.pointCost}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg transition-colors">
              {reward ? 'Save Changes' : 'Add Reward 🎁'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
