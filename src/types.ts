// ─── Core types ──────────────────────────────────────────────────────────────

export type ChoreType = 'daily' | 'weekly' | 'kindness';
export type ViewMode = 'home' | 'kid' | 'parent';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Kid {
  id: string;
  name: string;
  avatar: string;
  colorName: string;
  pin: string;             // kid's unique 4-digit PIN
  birthday: string;        // MM/DD/YYYY
  themeId: string;         // 'kai' | 'janel' | 'koa' | 'default'
  points: number;
  totalXP: number;
  streak: number;
  lastStreakDate: string;
  badges: string[];
}

export interface ParentProfile {
  id: string;
  name: string;
  avatar: string;
  pin: string;
  gradient: string;
}

export interface Chore {
  id: string;
  title: string;
  description: string;
  type: ChoreType;
  daysOfWeek: DayOfWeek[];
  points: number;
  assignedTo: string[];
  icon: string;
  requiresApproval: boolean;
}

export interface Completion {
  id: string;
  choreId: string;
  kidId: string;
  date: string;
  completedAt: string;
  approved: boolean;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointCost: number;
  icon: string;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  kidId: string;
  requestedAt: string;
  approved: boolean;
  denied: boolean;
}

export interface AppState {
  kids: Kid[];
  chores: Chore[];
  completions: Completion[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  parents: ParentProfile[];
  currentView: ViewMode;
  selectedKidId: string | null;
  activeParentId: string | null;
}

// ─── Kid Themes ───────────────────────────────────────────────────────────────

export interface KidTheme {
  id: string;
  gradient: string;
  darkGradient: string;
  bgLight: string;
  accentBg: string;
  accentText: string;
  btnClass: string;
  floatingEmojis: string[];
  choreCompleteMessages: string[];
  birthdayMessage: string;
  birthdayEmojis: string[];
  welcomeMessage: (name: string) => string;
  dailyLabel: string;
  weeklyLabel: string;
  kindnessLabel: string;
}

export const KID_THEMES: Record<string, KidTheme> = {
  kai: {
    id: 'kai',
    gradient: 'from-red-600 via-orange-500 to-yellow-500',
    darkGradient: 'from-red-800 via-red-700 to-orange-600',
    bgLight: 'bg-red-50',
    accentBg: 'bg-red-100',
    accentText: 'text-red-700',
    btnClass: 'bg-red-600 hover:bg-red-700',
    floatingEmojis: ['⚔️','🎮','🌸','🔥','⚡','🎌','🦊','🐉','✨','🗡️'],
    choreCompleteMessages: [
      'Sugoi! すごい! 🌟',
      'Nani?! You crushed it! ⚡',
      'Power level RISING! 🔥',
      'Ultra Instinct unlocked! 🐉',
      'Anime protagonist energy! 🎌',
      'Roblox XP gained! 🎮',
      'Kawaii performance! 🌸',
    ],
    birthdayMessage: 'Happy Birthday, Kai-kun! 🎌',
    birthdayEmojis: ['🎌','🎮','⚔️','🔥','🎉','🎂','🎁','⚡','🌸','🐉'],
    welcomeMessage: () => 'ようこそ! Ready to level up? 🎮',
    dailyLabel: '⚔️ Daily Quests',
    weeklyLabel: '🏆 Boss Battles',
    kindnessLabel: '💝 Hero Missions',
  },
  janel: {
    id: 'janel',
    gradient: 'from-amber-700 via-amber-500 to-yellow-400',
    darkGradient: 'from-amber-900 via-amber-800 to-amber-700',
    bgLight: 'bg-amber-50',
    accentBg: 'bg-amber-100',
    accentText: 'text-amber-800',
    btnClass: 'bg-amber-700 hover:bg-amber-800',
    floatingEmojis: ['🐎','🌿','🏇','🌾','🌸','🎠','🐴','🌻','🍂','🌷'],
    choreCompleteMessages: [
      'Giddy up! 🐎',
      'Champion rider! 🏇',
      'Horse Island glory! 🌾',
      'Trot on, superstar! 🌟',
      'Neigh-borly done! 🐴',
      'Stable master skills! 🌸',
      'Full gallop achievement! ⭐',
    ],
    birthdayMessage: 'Happy Birthday, Janel! 🐎🎉',
    birthdayEmojis: ['🐎','🌸','🎉','🎂','🎁','🌻','🏇','🌷','🐴','⭐'],
    welcomeMessage: () => 'Giddy up! Ready to ride? 🐎',
    dailyLabel: '🐎 Daily Rides',
    weeklyLabel: '🏇 Weekly Races',
    kindnessLabel: '🌸 Acts of Kindness',
  },
  koa: {
    id: 'koa',
    gradient: 'from-sky-400 via-teal-400 to-green-400',
    darkGradient: 'from-sky-600 via-teal-600 to-green-600',
    bgLight: 'bg-sky-50',
    accentBg: 'bg-sky-100',
    accentText: 'text-sky-700',
    btnClass: 'bg-sky-500 hover:bg-sky-600',
    floatingEmojis: ['🍉','🌈','🎵','🎶','⭐','🎠','🦋','🌟','🌼','🎪'],
    choreCompleteMessages: [
      'Yay Koa! 🌈',
      'Super Koa! 🍉',
      'Cocomelon magic! 🎵',
      'Rainbow star! 🌟',
      'Baby genius! 🌼',
      'Hooray! 🎶',
      'Amazing little one! ⭐',
    ],
    birthdayMessage: 'Happy Birthday, Baby Koa! 🍉🌈',
    birthdayEmojis: ['🍉','🌈','🎉','🎂','🎁','🎵','⭐','🌸','🦋','🌟'],
    welcomeMessage: () => 'Yay! It\'s Koa time! 🍉',
    dailyLabel: '🌈 Daily Fun',
    weeklyLabel: '🌟 Big Tasks',
    kindnessLabel: '💝 Kind Hearts',
  },
  default: {
    id: 'default',
    gradient: 'from-purple-500 to-indigo-600',
    darkGradient: 'from-purple-700 to-indigo-800',
    bgLight: 'bg-purple-50',
    accentBg: 'bg-purple-100',
    accentText: 'text-purple-700',
    btnClass: 'bg-purple-600 hover:bg-purple-700',
    floatingEmojis: ['⭐','✨','🌟','💫','⚡','🎉','🌈','🏆'],
    choreCompleteMessages: ['Amazing work!', 'You rock!', 'Superstar!', 'Brilliant!', 'Fantastic!'],
    birthdayMessage: 'Happy Birthday! 🎉',
    birthdayEmojis: ['🎉','🎂','🎁','🌈','⭐','🌟','🎊','💫'],
    welcomeMessage: (name) => `Welcome back, ${name}! ✨`,
    dailyLabel: '📅 Daily',
    weeklyLabel: '📆 Weekly',
    kindnessLabel: '⭐ Random Acts of Kindness',
  },
};

export function getKidTheme(kid: Kid): KidTheme {
  return KID_THEMES[kid.themeId] ?? KID_THEMES['default'];
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];
export const LEVEL_NAMES = ['Rookie','Helper','Apprentice','Skilled','Champion','Hero','Legend','Master','Grand Master','Superstar'];
export const LEVEL_EMOJIS = ['🌱','⭐','🌟','💫','🏆','👑','🦁','🔱','💎','🌈'];

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const ALL_BADGES: BadgeDefinition[] = [
  { id: 'first_chore',    name: 'First Steps',     description: 'Complete your very first chore!',            icon: '⭐', color: 'bg-yellow-400' },
  { id: 'daily_hero',     name: 'Daily Hero',       description: 'Complete all daily chores in one day',       icon: '🦸', color: 'bg-blue-500' },
  { id: 'streak_3',       name: 'On a Roll!',       description: '3-day chore streak',                         icon: '🔥', color: 'bg-orange-500' },
  { id: 'streak_7',       name: 'Week Warrior',     description: '7-day chore streak',                         icon: '⚡', color: 'bg-yellow-500' },
  { id: 'kind_heart',     name: 'Kind Heart',       description: 'Complete 3 Random Acts of Kindness',         icon: '💝', color: 'bg-pink-500' },
  { id: 'weekend_worker', name: 'Weekend Worker',   description: 'Complete all weekend chores',                icon: '🌟', color: 'bg-teal-500' },
  { id: 'level_3',        name: 'Rising Star',      description: 'Reach level 3',                              icon: '🚀', color: 'bg-purple-500' },
  { id: 'level_5',        name: 'Champion',         description: 'Reach level 5',                              icon: '🏆', color: 'bg-amber-600' },
  { id: 'level_8',        name: 'Legend',           description: 'Reach level 8',                              icon: '👑', color: 'bg-yellow-500' },
  { id: 'collector_500',  name: 'Point Collector',  description: 'Earn 500 total XP',                          icon: '💎', color: 'bg-cyan-500' },
  { id: 'speed_demon',    name: 'Speed Demon',      description: 'Complete 5 chores in a single day',          icon: '💨', color: 'bg-sky-500' },
  { id: 'birthday_star',  name: 'Birthday Star',    description: 'Logged in on your birthday! 🎂',             icon: '🎂', color: 'bg-rose-500' },
];

// ─── Color palette for kids ───────────────────────────────────────────────────

export interface KidColorScheme {
  name: string;
  bg: string;
  light: string;
  text: string;
  border: string;
  gradient: string;
  ring: string;
}

export const KID_COLORS: KidColorScheme[] = [
  { name: 'red',    bg: 'bg-red-500',    light: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-400',    gradient: 'from-red-500 to-orange-600',   ring: 'ring-red-400' },
  { name: 'purple', bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-400', gradient: 'from-purple-500 to-indigo-600', ring: 'ring-purple-400' },
  { name: 'blue',   bg: 'bg-blue-500',   light: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-400',   gradient: 'from-blue-500 to-cyan-600',     ring: 'ring-blue-400' },
  { name: 'pink',   bg: 'bg-pink-500',   light: 'bg-pink-100',   text: 'text-pink-700',   border: 'border-pink-400',   gradient: 'from-pink-500 to-rose-600',     ring: 'ring-pink-400' },
  { name: 'green',  bg: 'bg-green-500',  light: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-400',  gradient: 'from-green-500 to-teal-600',    ring: 'ring-green-400' },
  { name: 'amber',  bg: 'bg-amber-600',  light: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-400',  gradient: 'from-amber-600 to-yellow-500',  ring: 'ring-amber-400' },
  { name: 'teal',   bg: 'bg-teal-500',   light: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-400',   gradient: 'from-teal-500 to-green-600',    ring: 'ring-teal-400' },
  { name: 'sky',    bg: 'bg-sky-500',    light: 'bg-sky-100',    text: 'text-sky-700',    border: 'border-sky-400',    gradient: 'from-sky-500 to-blue-500',      ring: 'ring-sky-400' },
];

export function getKidColor(colorName: string): KidColorScheme {
  return KID_COLORS.find(c => c.name === colorName) ?? KID_COLORS[0];
}

// ─── Level helpers ────────────────────────────────────────────────────────────

export function getLevel(totalXP: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, LEVEL_THRESHOLDS.length);
}

export function getXPProgress(totalXP: number) {
  const level = getLevel(totalXP);
  const idx = level - 1;
  const currentThreshold = LEVEL_THRESHOLDS[idx] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[idx + 1] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const current = totalXP - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  const percentage = level >= LEVEL_THRESHOLDS.length ? 100 : Math.min((current / needed) * 100, 100);
  return { level, current, needed, percentage, levelName: LEVEL_NAMES[idx] ?? 'Superstar', levelEmoji: LEVEL_EMOJIS[idx] ?? '🌈' };
}

// ─── Birthday helpers ─────────────────────────────────────────────────────────

export interface BirthdayInfo {
  isToday: boolean;
  daysUntil: number;   // 0 = today
  age: number;
  ageMonths?: number;  // months component for babies < 3 years
  isSoon: boolean;     // within 7 days
}

export function getBirthdayInfo(birthday: string, today: Date = new Date()): BirthdayInfo {
  if (!birthday) return { isToday: false, daysUntil: 365, age: 0, isSoon: false };

  const [m, d, y] = birthday.split('/').map(Number);
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isToday = today.getMonth() === m - 1 && today.getDate() === d;

  let nextBday = new Date(today.getFullYear(), m - 1, d);
  if (!isToday && nextBday < todayNorm) {
    nextBday = new Date(today.getFullYear() + 1, m - 1, d);
  }

  const msPerDay = 86400000;
  const daysUntil = isToday ? 0 : Math.ceil((nextBday.getTime() - todayNorm.getTime()) / msPerDay);

  // Age calculation
  let age = today.getFullYear() - y;
  if (today.getMonth() < m - 1 || (today.getMonth() === m - 1 && today.getDate() < d)) age--;

  // Months for babies
  const birthDate = new Date(y, m - 1, d);
  const totalMonths = (today.getFullYear() - y) * 12 + (today.getMonth() - (m - 1));
  const ageMonths = totalMonths % 12;

  return { isToday, daysUntil, age, ageMonths, isSoon: daysUntil > 0 && daysUntil <= 7 };
}

export function formatAge(info: BirthdayInfo): string {
  if (info.age < 3) {
    const months = info.age * 12 + (info.ageMonths ?? 0);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} old`;
    return `${info.age} year${info.age !== 1 ? 's' : ''} ${info.ageMonths ? `& ${info.ageMonths} months` : ''} old`;
  }
  return `${info.age} years old`;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export const DAY_NAMES  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const DAY_FULL   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function strToDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getWeekDays(referenceDate?: Date): Date[] {
  const ref = referenceDate ?? new Date();
  const start = new Date(ref);
  start.setDate(ref.getDate() - ref.getDay());
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function genId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDisplayDate(dateStr: string): string {
  const d = strToDate(dateStr);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}
