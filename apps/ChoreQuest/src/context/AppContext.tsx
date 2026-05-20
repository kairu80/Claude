import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  AppState, Kid, Chore, Completion, Reward, RewardRedemption, ParentProfile,
  ViewMode, genId, todayStr, getLevel, ALL_BADGES,
} from '../types';

// ─── Action types ─────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_VIEW'; view: ViewMode; kidId?: string }
  | { type: 'SET_ACTIVE_PARENT'; parentId: string | null }
  | { type: 'ADD_KID'; kid: Kid }
  | { type: 'UPDATE_KID'; kid: Kid }
  | { type: 'DELETE_KID'; kidId: string }
  | { type: 'ADD_CHORE'; chore: Chore }
  | { type: 'UPDATE_CHORE'; chore: Chore }
  | { type: 'DELETE_CHORE'; choreId: string }
  | { type: 'COMPLETE_CHORE'; choreId: string; kidId: string; date: string }
  | { type: 'UNDO_COMPLETION'; completionId: string }
  | { type: 'APPROVE_COMPLETION'; completionId: string }
  | { type: 'ADD_REWARD'; reward: Reward }
  | { type: 'UPDATE_REWARD'; reward: Reward }
  | { type: 'DELETE_REWARD'; rewardId: string }
  | { type: 'REDEEM_REWARD'; rewardId: string; kidId: string }
  | { type: 'APPROVE_REDEMPTION'; redemptionId: string }
  | { type: 'DENY_REDEMPTION'; redemptionId: string }
  | { type: 'UPDATE_PARENT'; parent: ParentProfile }
  | { type: 'AWARD_BADGE'; kidId: string; badgeId: string };

// ─── Default data ─────────────────────────────────────────────────────────────

const TODAY = todayStr();

const DEFAULT_PARENTS: ParentProfile[] = [
  { id: 'parent_mommy', name: 'Mommy', avatar: '👩', pin: '1234', gradient: 'from-rose-500 to-pink-600' },
  { id: 'parent_dada',  name: 'Dada',  avatar: '👨', pin: '5678', gradient: 'from-blue-600 to-indigo-700' },
];

const DEFAULT_KIDS: Kid[] = [
  {
    id: 'kid_kai',
    name: 'Kai',
    avatar: '🧒',
    colorName: 'red',
    pin: '1111',
    birthday: '9/17/2014',
    themeId: 'kai',
    points: 320,
    totalXP: 980,
    streak: 5,
    lastStreakDate: TODAY,
    badges: ['first_chore', 'streak_3', 'daily_hero', 'collector_500', 'level_3'],
  },
  {
    id: 'kid_janel',
    name: 'Janel',
    avatar: '👧',
    colorName: 'amber',
    pin: '2222',
    birthday: '4/16/2014',
    themeId: 'janel',
    points: 245,
    totalXP: 845,
    streak: 4,
    lastStreakDate: TODAY,
    badges: ['first_chore', 'streak_3', 'daily_hero', 'collector_500'],
  },
  {
    id: 'kid_koa',
    name: 'Koa',
    avatar: '👶',
    colorName: 'sky',
    pin: '3333',
    birthday: '10/26/2024',
    themeId: 'koa',
    points: 60,
    totalXP: 180,
    streak: 2,
    lastStreakDate: TODAY,
    badges: ['first_chore'],
  },
];

const DEFAULT_CHORES: Chore[] = [
  // ── Daily ──
  { id: 'c_bed',      title: 'Make Bed',           description: 'Make your bed neat and tidy every morning',         type: 'daily',    daysOfWeek: [0,1,2,3,4,5,6], points: 15, assignedTo: [],              icon: '🛏️',  requiresApproval: false },
  { id: 'c_teeth',    title: 'Brush Teeth',         description: 'Brush teeth morning and evening for 2 minutes',     type: 'daily',    daysOfWeek: [0,1,2,3,4,5,6], points: 10, assignedTo: [],              icon: '🦷',  requiresApproval: false },
  { id: 'c_dishes',   title: 'Clear Your Dishes',   description: 'Take dishes to the sink after every meal',          type: 'daily',    daysOfWeek: [0,1,2,3,4,5,6], points: 10, assignedTo: [],              icon: '🥣',  requiresApproval: false },
  { id: 'c_table',    title: 'Set the Table',        description: 'Help set the dinner table each evening',            type: 'daily',    daysOfWeek: [0,1,2,3,4,5,6], points: 20, assignedTo: [],              icon: '🍽️', requiresApproval: false },
  { id: 'c_toys',     title: 'Pick Up Toys',         description: 'Put all toys away before bedtime',                  type: 'daily',    daysOfWeek: [0,1,2,3,4,5,6], points: 15, assignedTo: [],              icon: '🧸',  requiresApproval: false },
  { id: 'c_homework', title: 'Complete Homework',    description: 'Finish all homework before screen time',            type: 'daily',    daysOfWeek: [1,2,3,4,5],     points: 25, assignedTo: ['kid_kai','kid_janel'], icon: '📚', requiresApproval: false },
  { id: 'c_koa_eat',  title: 'Eat Your Veggies 🥕', description: 'Try a bite of veggies at mealtime',                 type: 'daily',    daysOfWeek: [0,1,2,3,4,5,6], points: 15, assignedTo: ['kid_koa'],     icon: '🥕',  requiresApproval: false },
  { id: 'c_koa_nap',  title: 'Nap Time',             description: 'Rest time — sleep tight little one!',               type: 'daily',    daysOfWeek: [0,1,2,3,4,5,6], points: 10, assignedTo: ['kid_koa'],     icon: '😴',  requiresApproval: false },

  // ── Weekly ──
  { id: 'c_room',     title: 'Clean Room',           description: 'Vacuum, dust, and organise your whole room',        type: 'weekly',   daysOfWeek: [0,6],            points: 40, assignedTo: [],              icon: '🧹',  requiresApproval: true  },
  { id: 'c_laundry',  title: 'Fold Laundry',         description: 'Fold your clean clothes and put them away',         type: 'weekly',   daysOfWeek: [0],              points: 30, assignedTo: [],              icon: '👕',  requiresApproval: false },
  { id: 'c_plants',   title: 'Water Plants',         description: 'Water all indoor and outdoor plants',               type: 'weekly',   daysOfWeek: [6],              points: 20, assignedTo: [],              icon: '🌱',  requiresApproval: false },
  { id: 'c_trash',    title: 'Take Out Trash',        description: 'Empty all bins and put bags outside',               type: 'weekly',   daysOfWeek: [5],              points: 25, assignedTo: [],              icon: '🗑️', requiresApproval: false },
  { id: 'c_vacuum',   title: 'Vacuum Living Room',   description: 'Vacuum the entire living room and hallway',         type: 'weekly',   daysOfWeek: [6],              points: 35, assignedTo: ['kid_kai','kid_janel'], icon: '🧽', requiresApproval: true },

  // ── Random Acts of Kindness ──
  { id: 'k_sibling',  title: 'Help a Sibling',        description: 'Help a brother or sister with something',           type: 'kindness', daysOfWeek: [],               points: 30, assignedTo: [],              icon: '🤝',  requiresApproval: false },
  { id: 'k_note',     title: 'Write a Kind Note',     description: 'Write a thank-you note or kind message to someone', type: 'kindness', daysOfWeek: [],               points: 25, assignedTo: [],              icon: '📝',  requiresApproval: false },
  { id: 'k_koa',      title: 'Play with Baby Koa',    description: 'Spend 10 minutes playing with baby Koa',            type: 'kindness', daysOfWeek: [],               points: 30, assignedTo: ['kid_kai','kid_janel'], icon: '👶', requiresApproval: false },
  { id: 'k_read_koa', title: 'Read to Koa',           description: 'Read a book out loud to baby Koa',                  type: 'kindness', daysOfWeek: [],               points: 35, assignedTo: ['kid_kai','kid_janel'], icon: '📖', requiresApproval: false },
  { id: 'k_share',    title: 'Share Your Toys',       description: 'Let someone else choose what to play first',         type: 'kindness', daysOfWeek: [],               points: 20, assignedTo: [],              icon: '🎁',  requiresApproval: false },
  { id: 'k_clean_up', title: 'Clean Up Unprompted',   description: 'Clean up a mess without being asked',               type: 'kindness', daysOfWeek: [],               points: 40, assignedTo: [],              icon: '✨',  requiresApproval: false },
  { id: 'k_cook',     title: 'Help Cook a Meal',      description: 'Help Mommy or Dada prepare a full meal',            type: 'kindness', daysOfWeek: [],               points: 50, assignedTo: ['kid_kai','kid_janel'], icon: '🍳', requiresApproval: true  },
  { id: 'k_exercise', title: 'Exercise Together',     description: 'Go for a walk, run, or play sports with the family', type: 'kindness', daysOfWeek: [],              points: 40, assignedTo: [],              icon: '🏃',  requiresApproval: false },
];

const DEFAULT_REWARDS: Reward[] = [
  { id: 'r1', title: '30 Min Extra Screen Time',  description: 'Extra device time on any screen',                   pointCost: 100, icon: '📱' },
  { id: 'r2', title: 'Stay Up 30 Min Later',      description: 'Push bedtime back 30 minutes tonight',             pointCost: 150, icon: '🌙' },
  { id: 'r3', title: 'Movie Night Pick',           description: 'YOU choose the family movie night film',           pointCost: 200, icon: '🎬' },
  { id: 'r4', title: 'Choose Dinner Tonight',      description: 'Pick what the whole family eats',                  pointCost: 250, icon: '🍕' },
  { id: 'r5', title: 'Roblox Robux',              description: '400 Robux for Kai or Janel',                       pointCost: 400, icon: '🎮' },
  { id: 'r6', title: 'Ice Cream Trip',             description: 'Special trip to the ice cream shop',               pointCost: 300, icon: '🍦' },
  { id: 'r7', title: 'Sleepover with a Friend',   description: 'Invite one friend for a weekend sleepover',        pointCost: 400, icon: '🛌' },
  { id: 'r8', title: 'New Book or Small Toy',     description: 'Pick any book or small toy (up to $15)',           pointCost: 500, icon: '🎁' },
];

function buildSampleCompletions(): Completion[] {
  const completions: Completion[] = [];
  const today = new Date();

  for (let daysAgo = 6; daysAgo >= 1; daysAgo--) {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const dow = d.getDay();

    const kaiChores = ['c_bed', 'c_teeth', 'c_dishes', 'c_table'];
    if (dow >= 1 && dow <= 5) kaiChores.push('c_homework');
    for (const cid of kaiChores.slice(0, 3 + Math.floor(Math.random() * 2))) {
      completions.push({ id: genId(), choreId: cid, kidId: 'kid_kai', date: dateStr, completedAt: new Date(d).toISOString(), approved: true });
    }

    const janelChores = ['c_bed', 'c_teeth', 'c_toys'];
    if (dow >= 1 && dow <= 5) janelChores.push('c_homework');
    for (const cid of janelChores.slice(0, 2 + Math.floor(Math.random() * 2))) {
      completions.push({ id: genId(), choreId: cid, kidId: 'kid_janel', date: dateStr, completedAt: new Date(d).toISOString(), approved: true });
    }

    const koaChores = ['c_koa_eat', 'c_koa_nap'];
    for (const cid of koaChores.slice(0, 1 + Math.floor(Math.random() * 2))) {
      completions.push({ id: genId(), choreId: cid, kidId: 'kid_koa', date: dateStr, completedAt: new Date(d).toISOString(), approved: true });
    }
  }

  completions.push(
    { id: genId(), choreId: 'c_bed',    kidId: 'kid_kai',   date: TODAY, completedAt: new Date().toISOString(), approved: true },
    { id: genId(), choreId: 'c_teeth',  kidId: 'kid_kai',   date: TODAY, completedAt: new Date().toISOString(), approved: true },
    { id: genId(), choreId: 'c_bed',    kidId: 'kid_janel', date: TODAY, completedAt: new Date().toISOString(), approved: true },
    { id: genId(), choreId: 'c_koa_eat',kidId: 'kid_koa',   date: TODAY, completedAt: new Date().toISOString(), approved: true },
  );

  return completions;
}

const DEFAULT_STATE: AppState = {
  kids: DEFAULT_KIDS,
  chores: DEFAULT_CHORES,
  completions: buildSampleCompletions(),
  rewards: DEFAULT_REWARDS,
  redemptions: [],
  parents: DEFAULT_PARENTS,
  currentView: 'home',
  selectedKidId: null,
  activeParentId: null,
};

// ─── Badge checker ────────────────────────────────────────────────────────────

function checkAndAwardBadges(kid: Kid, allCompletions: Completion[], allChores: Chore[]): string[] {
  const earned = new Set(kid.badges);
  const todayStr2 = todayStr();
  const todayCompletions = allCompletions.filter(c => c.kidId === kid.id && c.date === todayStr2);
  const allKidCompletions = allCompletions.filter(c => c.kidId === kid.id);

  if (allKidCompletions.length >= 1) earned.add('first_chore');
  if (todayCompletions.length >= 5) earned.add('speed_demon');

  const today = new Date();
  const dow = today.getDay();
  const dailyToday = allChores.filter(c => c.type === 'daily' && c.daysOfWeek.includes(dow as any) &&
    (c.assignedTo.length === 0 || c.assignedTo.includes(kid.id)));
  const doneChoreIds = new Set(todayCompletions.map(c => c.choreId));
  if (dailyToday.length > 0 && dailyToday.every(c => doneChoreIds.has(c.id))) earned.add('daily_hero');

  if (kid.streak >= 3) earned.add('streak_3');
  if (kid.streak >= 7) earned.add('streak_7');

  const kindnessDone = allKidCompletions.filter(c => {
    const ch = allChores.find(x => x.id === c.choreId);
    return ch?.type === 'kindness';
  });
  if (kindnessDone.length >= 3) earned.add('kind_heart');

  const level = getLevel(kid.totalXP);
  if (level >= 3) earned.add('level_3');
  if (level >= 5) earned.add('level_5');
  if (level >= 8) earned.add('level_8');
  if (kid.totalXP >= 500) earned.add('collector_500');

  // Weekend worker
  const weekendChores = allChores.filter(c => c.type === 'weekly' &&
    (c.daysOfWeek.includes(0) || c.daysOfWeek.includes(6)) &&
    (c.assignedTo.length === 0 || c.assignedTo.includes(kid.id)));
  const sat = new Date(today); sat.setDate(today.getDate() - today.getDay() + 6);
  const sun = new Date(today); sun.setDate(today.getDate() - today.getDay());
  const satStr = dateToStr(sat);
  const sunStr = dateToStr(sun);
  const weekendDoneIds = new Set(allKidCompletions.filter(c => c.date === satStr || c.date === sunStr).map(c => c.choreId));
  if (weekendChores.length > 0 && weekendChores.every(c => weekendDoneIds.has(c.id))) earned.add('weekend_worker');

  return Array.from(earned);
}

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function updateStreak(kid: Kid, dateStr: string): { streak: number; lastStreakDate: string } {
  const last = kid.lastStreakDate;
  if (!last || last === dateStr) return { streak: Math.max(kid.streak, 1), lastStreakDate: dateStr };
  const lastDate = new Date(last + 'T12:00:00');
  const thisDate = new Date(dateStr + 'T12:00:00');
  const diffDays = Math.round((thisDate.getTime() - lastDate.getTime()) / 86400000);
  if (diffDays === 1) return { streak: kid.streak + 1, lastStreakDate: dateStr };
  if (diffDays > 1) return { streak: 1, lastStreakDate: dateStr };
  return { streak: kid.streak, lastStreakDate: dateStr };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'SET_VIEW':
      return { ...state, currentView: action.view, selectedKidId: action.kidId ?? state.selectedKidId };

    case 'SET_ACTIVE_PARENT':
      return { ...state, activeParentId: action.parentId };

    case 'ADD_KID':
      return { ...state, kids: [...state.kids, action.kid] };

    case 'UPDATE_KID':
      return { ...state, kids: state.kids.map(k => k.id === action.kid.id ? action.kid : k) };

    case 'DELETE_KID': {
      const { kidId } = action;
      return {
        ...state,
        kids: state.kids.filter(k => k.id !== kidId),
        completions: state.completions.filter(c => c.kidId !== kidId),
        redemptions: state.redemptions.filter(r => r.kidId !== kidId),
      };
    }

    case 'ADD_CHORE':
      return { ...state, chores: [...state.chores, action.chore] };

    case 'UPDATE_CHORE':
      return { ...state, chores: state.chores.map(c => c.id === action.chore.id ? action.chore : c) };

    case 'DELETE_CHORE':
      return {
        ...state,
        chores: state.chores.filter(c => c.id !== action.choreId),
        completions: state.completions.filter(c => c.choreId !== action.choreId),
      };

    case 'COMPLETE_CHORE': {
      const { choreId, kidId, date } = action;
      const already = state.completions.some(c => c.choreId === choreId && c.kidId === kidId && c.date === date);
      if (already) return state;

      const chore = state.chores.find(c => c.id === choreId);
      if (!chore) return state;

      const newCompletion: Completion = {
        id: genId(), choreId, kidId, date,
        completedAt: new Date().toISOString(),
        approved: !chore.requiresApproval,
      };

      const newCompletions = [...state.completions, newCompletion];
      const pointsToAdd = chore.requiresApproval ? 0 : chore.points;
      const kid = state.kids.find(k => k.id === kidId);
      if (!kid) return { ...state, completions: newCompletions };

      const { streak, lastStreakDate } = updateStreak(kid, date);
      const updatedKid: Kid = { ...kid, points: kid.points + pointsToAdd, totalXP: kid.totalXP + pointsToAdd, streak, lastStreakDate };
      const newBadges = checkAndAwardBadges(updatedKid, newCompletions, state.chores);
      const finalKid: Kid = { ...updatedKid, badges: newBadges };
      return { ...state, completions: newCompletions, kids: state.kids.map(k => k.id === kidId ? finalKid : k) };
    }

    case 'UNDO_COMPLETION': {
      const completion = state.completions.find(c => c.id === action.completionId);
      if (!completion) return state;
      const chore = state.chores.find(c => c.id === completion.choreId);
      const pointsToRemove = chore && completion.approved ? chore.points : 0;
      const kid = state.kids.find(k => k.id === completion.kidId);
      const updatedKid = kid ? { ...kid, points: Math.max(0, kid.points - pointsToRemove), totalXP: Math.max(0, kid.totalXP - pointsToRemove) } : null;
      return {
        ...state,
        completions: state.completions.filter(c => c.id !== action.completionId),
        kids: updatedKid ? state.kids.map(k => k.id === updatedKid.id ? updatedKid : k) : state.kids,
      };
    }

    case 'APPROVE_COMPLETION': {
      const completion = state.completions.find(c => c.id === action.completionId);
      if (!completion || completion.approved) return state;
      const chore = state.chores.find(c => c.id === completion.choreId);
      const pointsToAdd = chore ? chore.points : 0;
      const kid = state.kids.find(k => k.id === completion.kidId);
      const updatedKid = kid ? { ...kid, points: kid.points + pointsToAdd, totalXP: kid.totalXP + pointsToAdd } : null;
      return {
        ...state,
        completions: state.completions.map(c => c.id === action.completionId ? { ...c, approved: true } : c),
        kids: updatedKid ? state.kids.map(k => k.id === updatedKid.id ? updatedKid : k) : state.kids,
      };
    }

    case 'ADD_REWARD':
      return { ...state, rewards: [...state.rewards, action.reward] };

    case 'UPDATE_REWARD':
      return { ...state, rewards: state.rewards.map(r => r.id === action.reward.id ? action.reward : r) };

    case 'DELETE_REWARD':
      return { ...state, rewards: state.rewards.filter(r => r.id !== action.rewardId) };

    case 'REDEEM_REWARD': {
      const { rewardId, kidId } = action;
      const reward = state.rewards.find(r => r.id === rewardId);
      const kid = state.kids.find(k => k.id === kidId);
      if (!reward || !kid || kid.points < reward.pointCost) return state;
      const redemption: RewardRedemption = { id: genId(), rewardId, kidId, requestedAt: new Date().toISOString(), approved: false, denied: false };
      const updatedKid = { ...kid, points: kid.points - reward.pointCost };
      return { ...state, redemptions: [...state.redemptions, redemption], kids: state.kids.map(k => k.id === kidId ? updatedKid : k) };
    }

    case 'APPROVE_REDEMPTION':
      return { ...state, redemptions: state.redemptions.map(r => r.id === action.redemptionId ? { ...r, approved: true } : r) };

    case 'DENY_REDEMPTION': {
      const redemption = state.redemptions.find(r => r.id === action.redemptionId);
      if (!redemption) return state;
      const reward = state.rewards.find(r => r.id === redemption.rewardId);
      const kid = state.kids.find(k => k.id === redemption.kidId);
      const updatedKid = reward && kid ? { ...kid, points: kid.points + reward.pointCost } : kid;
      return {
        ...state,
        redemptions: state.redemptions.map(r => r.id === action.redemptionId ? { ...r, denied: true } : r),
        kids: updatedKid ? state.kids.map(k => k.id === updatedKid.id ? updatedKid : k) : state.kids,
      };
    }

    case 'UPDATE_PARENT':
      return { ...state, parents: state.parents.map(p => p.id === action.parent.id ? action.parent : p) };

    case 'AWARD_BADGE': {
      const kid = state.kids.find(k => k.id === action.kidId);
      if (!kid || kid.badges.includes(action.badgeId)) return state;
      const updatedKid = { ...kid, badges: [...kid.badges, action.badgeId] };
      return { ...state, kids: state.kids.map(k => k.id === action.kidId ? updatedKid : k) };
    }

    default:
      return state;
  }
}

// ─── Context & Provider ───────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);
const STORAGE_KEY = 'chorequest_v2';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE, (initial) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AppState;
        return {
          ...parsed,
          // Always ensure parents array exists (migration safety)
          parents: parsed.parents?.length ? parsed.parents : initial.parents,
          currentView: 'home' as const,
          selectedKidId: null,
          activeParentId: null,
        };
      }
    } catch { /* ignore */ }
    return initial;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
