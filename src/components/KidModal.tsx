import React, { useState } from 'react';
import { Kid, KID_COLORS, genId } from '../types';
import { X } from 'lucide-react';

const KID_AVATARS = ['👧','👦','🧒','👶','🧑','👱','🧔','👩','👨','🦸','🧚','🧜','🧙','🐱','🐶','🦊','🐯','🐻','🐼','🦄'];

interface Props {
  kid?: Kid;
  onSave: (kid: Kid) => void;
  onClose: () => void;
}

const blankKid = (): Kid => ({
  id: genId(),
  name: '',
  avatar: '👧',
  colorName: 'purple',
  points: 0,
  totalXP: 0,
  streak: 0,
  lastStreakDate: '',
  badges: [],
});

export function KidModal({ kid, onSave, onClose }: Props) {
  const [form, setForm] = useState<Kid>(kid ? { ...kid } : blankKid());
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, name: form.name.trim() });
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm animate-bounce-in">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800">{kid ? 'Edit Kid' : 'Add New Kid'}</h2>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar + Name */}
          <div className="flex gap-3 items-center justify-center flex-col">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="w-20 h-20 rounded-3xl text-5xl flex items-center justify-center border-4 border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors shadow-md"
              >
                {form.avatar}
              </button>
              <span className="absolute -bottom-1 -right-1 text-lg bg-white rounded-full shadow">✏️</span>
              {showAvatarPicker && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-3 grid grid-cols-5 gap-1 z-10 border border-gray-100 w-48">
                  {KID_AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => { setForm(f => ({ ...f, avatar: av })); setShowAvatarPicker(false); }}
                      className={`w-9 h-9 rounded-xl text-2xl flex items-center justify-center hover:bg-purple-50 transition-colors ${form.avatar === av ? 'bg-purple-100 ring-2 ring-purple-400' : ''}`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Kid's Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Emma"
              className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-2.5 text-base font-semibold outline-none transition-colors text-center"
              required
              autoFocus
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Theme Color</label>
            <div className="flex gap-2 justify-center">
              {KID_COLORS.map(color => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, colorName: color.name }))}
                  className={`w-9 h-9 rounded-full ${color.bg} transition-all ${
                    form.colorName === color.name
                      ? 'scale-125 ring-4 ring-offset-2 ring-gray-400'
                      : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg transition-colors">
              {kid ? 'Save Changes' : 'Add Kid 🎉'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
