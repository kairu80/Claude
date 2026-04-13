// ─── Core types ──────────────────────────────────────────────────────────────

export type ChoreType = 'daily' | 'weekly' | 'extra';
export type ViewMode = 'home' | 'kid' | 'parent';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Kid {
  id: string;
  name: string;
  avatar: string;        // emoji
  colorName: string;     // one of KID_COLOR_NAMES
  points: number;        // spendable points
  totalXP: number;       // cumulative XP (never decreases)
  streak: number;        // current day streak
  lastStreakDate: string; // YYYY-MM-DD last day with ≥1 chore done
  badges: string[];      // badge ids earned
}

export interface Chore {
  id: string;
  title: string;
  description: string;
  type: ChoreType;
  daysOfWeek: DayOfWeek[]; // daily = [0-6], weekly = specific days, extra = []
  points: number;
  assignedTo: string[];    // kid ids; empty = all kids
  icon: string;            // emoji
  requiresApproval: boolean;
}

export interface Completion {
  id: string;
  choreId: string;
  kidId: string;
  date: string;          // YYYY-MM-DD
  completedAt: string;   // ISO timestamp
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
  currentView: ViewMode;
  selectedKidId: string | null;
  parentPin: string;
}

// ─── Gamification constants ───────────────────────────────────────────────────

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];

export const LEVEL_NAMES = [
  'Rookie',
  'Helper',
  'Apprentice',
  'Skilled',
  'Champion',
  'Hero',
  'Legend',
  'Master',
  'Grand Master',
  'Superstar',
];

export const LEVEL_EMOJIS = ['🌱','⭐','🌟','💫','🏆','👑','🦁','🔱','💎','🌈'];

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;  // tailwind bg color
}

export const ALL_BADGES: BadgeDefinition[] = [
  { id: 'first_chore',      name: 'First Steps',      description: 'Complete your very first chore!',          icon: '⭐', color: 'bg-yellow-400' },
  { id: 'daily_hero',       name: 'Daily Hero',        description: 'Complete all daily chores in one day',      icon: '🦸', color: 'bg-blue-500' },
  { id: 'streak_3',         name: 'On a Roll!',        description: '3-day chore streak',                        icon: '🔥', color: 'bg-orange-500' },
  { id: 'streak_7',         name: 'Week Warrior',      description: '7-day chore streak',                        icon: '⚡', color: 'bg-yellow-500' },
  { id: 'extra_mile',       name: 'Extra Mile',        description: 'Complete 3 extra credit chores',            icon: '🏅', color: 'bg-amber-500' },
  { id: 'weekend_worker',   name: 'Weekend Worker',    description: 'Complete all weekend chores',               icon: '🌟', color: 'bg-teal-500' },
  { id: 'level_3',          name: 'Rising Star',       description: 'Reach level 3',                             icon: '🚀', color: 'bg-purple-500' },
  { id: 'level_5',          name: 'Champion',          description: 'Reach level 5',                             icon: '🏆', color: 'bg-amber-600' },
  { id: 'level_8',          name: 'Legend',            description: 'Reach level 8',                             icon: '👑', color: 'bg-yellow-500' },
  { id: 'collector_500',    name: 'Point Collector',   description: 'Earn 500 total XP',                         icon: '💎', color: 'bg-cyan-500' },
  { id: 'speed_demon',      name: 'Speed Demon',       description: 'Complete 5 chores in a single day',         icon: '💨', color: 'bg-sky-500' },
  { id: 'clean_sweep',      name: 'Clean Sweep',       description: 'Complete every chore in one week',          icon: '🧹', color: 'bg-green-500' },
];

// ─── Color palette for kids ──────────────────────────────────────────────────

export interface KidColorScheme {
  name: string;
  bg: string;
  light: string;
  text: string;
  border: string;
  gradient: string;
  ring: string;
  btn: string;
}

export const KID_COLORS: KidColorScheme[] = [
  { name: 'purple', bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-400', gradient: 'from-purple-500 to-indigo-600', ring: 'ring-purple-400', btn: 'bg-purple-600 hover:bg-purple-700' },
  { name: 'blue',   bg: 'bg-blue-500',   light: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-400',   gradient: 'from-blue-500 to-cyan-600',    ring: 'ring-blue-400',   btn: 'bg-blue-600 hover:bg-blue-700' },
  { name: 'pink',   bg: 'bg-pink-500',   light: 'bg-pink-100',   text: 'text-pink-700',   border: 'border-pink-400',   gradient: 'from-pink-500 to-rose-600',    ring: 'ring-pink-400',   btn: 'bg-pink-600 hover:bg-pink-700' },
  { name: 'green',  bg: 'bg-green-500',  light: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-400',  gradient: 'from-green-500 to-teal-600',   ring: 'ring-green-400',  btn: 'bg-green-600 hover:bg-green-700' },
  { name: 'orange', bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-400', gradient: 'from-orange-500 to-red-500',   ring: 'ring-orange-400', btn: 'bg-orange-600 hover:bg-orange-700' },
  { name: 'teal',   bg: 'bg-teal-500',   light: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-400',   gradient: 'from-teal-500 to-green-600',   ring: 'ring-teal-400',   btn: 'bg-teal-600 hover:bg-teal-700' },
];

export function getKidColor(colorName: string): KidColorScheme {
  return KID_COLORS.find(c => c.name === colorName) ?? KID_COLORS[0];
}

// ─── Gamification helpers ────────────────────────────────────────────────────

export function getLevel(totalXP: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, LEVEL_THRESHOLDS.length);
}

export function getXPProgress(totalXP: number): {
  level: number;
  current: number;
  needed: number;
  percentage: number;
  levelName: string;
  levelEmoji: string;
} {
  const level = getLevel(totalXP);
  const idx = level - 1;
  const currentThreshold = LEVEL_THRESHOLDS[idx] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[idx + 1] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const current = totalXP - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  const percentage = level >= LEVEL_THRESHOLDS.length ? 100 : Math.min((current / needed) * 100, 100);
  return { level, current, needed, percentage, levelName: LEVEL_NAMES[idx] ?? 'Superstar', levelEmoji: LEVEL_EMOJIS[idx] ?? '🌈' };
}

// ─── Date helpers ────────────────────────────────────────────────────────────

export const DAY_NAMES  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_FULL   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
  start.setDate(ref.getDate() - ref.getDay()); // Sunday
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
