import React, { useState } from 'react';
import { Kid, KID_COLORS, KID_THEMES, genId } from '../types';
import { X } from 'lucide-react';

const KID_AVATARS = ['🧒','👧','👦','👶','🧑','👱','🧔','👩','👨','🦸','🧚','🧜','🧙','🐱','🐶','🦊','🐯','🐻','🐼','🦄'];

interface Props {
  kid?: Kid;
  onSave: (kid: Kid) => void;
  onClose: () => void;
}

const blankKid = (): Kid => ({
  id: genId(), name: '', avatar: '🧒', colorName: 'purple',
  pin: '0000', birthday: '', themeId: 'default',
  points: 0, totalXP: 0, streak: 0, lastStreakDate: '', badges: [],
});

export function KidModal({ kid, onSave, onClose }: Props) {
  const [form, setForm] = useState<Kid>(kid ? { ...kid } : blankKid());
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [pinError, setPinError] = useState('');
  const [bdError, setBdError] = useState('');

  function validatePin(pin: string) {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) return 'PIN must be exactly 4 digits';
    return '';
  }

  function validateBirthday(bd: string) {
    if (!bd) return '';
    const re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    if (!re.test(bd)) return 'Format: MM/DD/YYYY';
    return '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pe = validatePin(form.pin);
    const be = validateBirthday(form.birthday);
    if (pe) { setPinError(pe); return; }
    if (be) { setBdError(be); return; }
    if (!form.name.trim()) return;
    onSave({ ...form, name: form.name.trim() });
  }

  const THEME_OPTIONS = [
    { id: 'kai',    label: '⚔️ Anime/Roblox', desc: 'For Kai' },
    { id: 'janel',  label: '🐎 Horse Island',  desc: 'For Janel' },
    { id: 'koa',    label: '🍉 CoComelon',     desc: 'For Koa' },
    { id: 'default', label: '🌟 Classic',       desc: 'General' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto animate-bounce-in">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-black text-gray-800">{kid ? 'Edit Kid' : 'Add New Kid'}</h2>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <button type="button" onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="w-20 h-20 rounded-3xl text-5xl flex items-center justify-center border-4 border-purple-200 bg-purple-50 hover:bg-purple-100 shadow-md">
                {form.avatar}
              </button>
              <span className="absolute -bottom-1 -right-1 text-lg bg-white rounded-full shadow">✏️</span>
              {showAvatarPicker && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-3 grid grid-cols-5 gap-1 z-10 border border-gray-100 w-52">
                  {KID_AVATARS.map(av => (
                    <button key={av} type="button" onClick={() => { setForm(f => ({ ...f, avatar: av })); setShowAvatarPicker(false); }}
                      className={`w-9 h-9 rounded-xl text-2xl flex items-center justify-center hover:bg-purple-50 ${form.avatar === av ? 'bg-purple-100 ring-2 ring-purple-400' : ''}`}>
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
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Kai" required autoFocus
              className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-2.5 text-base font-semibold outline-none text-center" />
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Birthday (MM/DD/YYYY)</label>
            <input type="text" value={form.birthday}
              onChange={e => { setForm(f => ({ ...f, birthday: e.target.value })); setBdError(''); }}
              placeholder="e.g. 9/17/2014"
              className={`w-full border-2 ${bdError ? 'border-red-400' : 'border-gray-200 focus:border-purple-400'} rounded-xl px-4 py-2.5 text-base outline-none text-center`} />
            {bdError && <p className="text-red-500 text-xs mt-1">{bdError}</p>}
            <p className="text-xs text-gray-400 mt-1">🎂 We'll celebrate on their birthday!</p>
          </div>

          {/* PIN */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Login PIN (4 digits)</label>
            <input type="text" value={form.pin} maxLength={4}
              onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setForm(f => ({ ...f, pin: v })); setPinError(''); }}
              placeholder="e.g. 1111"
              className={`w-full border-2 ${pinError ? 'border-red-400' : 'border-gray-200 focus:border-purple-400'} rounded-xl px-4 py-2.5 text-2xl font-black outline-none text-center tracking-widest font-mono`} />
            {pinError && <p className="text-red-500 text-xs mt-1">{pinError}</p>}
            <p className="text-xs text-gray-400 mt-1">🔐 Kid uses this PIN to log in</p>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {THEME_OPTIONS.map(t => {
                const themeObj = KID_THEMES[t.id];
                return (
                  <button key={t.id} type="button" onClick={() => setForm(f => ({ ...f, themeId: t.id }))}
                    className={`py-2 px-3 rounded-xl text-sm font-bold transition-all text-left ${form.themeId === t.id ? 'ring-2 ring-purple-500' : ''}`}
                    style={{ background: form.themeId === t.id ? undefined : 'rgb(243 244 246)' }}>
                    {form.themeId === t.id ? (
                      <div className={`bg-gradient-to-r ${themeObj.gradient} rounded-lg px-2 py-1.5 text-white`}>
                        <div className="text-sm font-black">{t.label}</div>
                        <div className="text-xs opacity-80">{t.desc}</div>
                      </div>
                    ) : (
                      <div className="text-gray-600">
                        <div className="text-sm font-black">{t.label}</div>
                        <div className="text-xs text-gray-400">{t.desc}</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Profile Color</label>
            <div className="flex gap-2 justify-center flex-wrap">
              {KID_COLORS.map(color => (
                <button key={color.name} type="button" onClick={() => setForm(f => ({ ...f, colorName: color.name }))}
                  className={`w-9 h-9 rounded-full ${color.bg} transition-all ${form.colorName === color.name ? 'scale-125 ring-4 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg">
              {kid ? 'Save Changes' : 'Add Kid 🎉'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
