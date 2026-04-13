import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  AppState, Kid, Chore, Completion, Reward, RewardRedemption,
  ViewMode, genId, todayStr, getLevel, ALL_BADGES,
} from '../types';

// ─── Action types ─────────────────────────────────────────────────────────────

type Action =
  // Navigation
  | { type: 'SET_VIEW'; view: ViewMode; kidId?: string }
  // Kids
  | { type: 'ADD_KID'; kid: Kid }
  | { type: 'UPDATE_KID'; kid: Kid }
  | { type: 'DELETE_KID'; kidId: string }
  // Chores
  | { type: 'ADD_CHORE'; chore: Chore }
  | { type: 'UPDATE_CHORE'; chore: Chore }
  | { type: 'DELETE_CHORE'; choreId: string }
  // Completions
  | { type: 'COMPLETE_CHORE'; choreId: string; kidId: string; date: string }
  | { type: 'UNDO_COMPLETION'; completionId: string }
  | { type: 'APPROVE_COMPLETION'; completionId: string }
  // Rewards
  | { type: 'ADD_REWARD'; reward: Reward }
  | { type: 'UPDATE_REWARD'; reward: Reward }
  | { type: 'DELETE_REWARD'; rewardId: string }
  // Redemptions
  | { type: 'REDEEM_REWARD'; rewardId: string; kidId: string }
  | { type: 'APPROVE_REDEMPTION'; redemptionId: string }
  | { type: 'DENY_REDEMPTION'; redemptionId: string }
  // Settings
  | { type: 'SET_PARENT_PIN'; pin: string }
  | { type: 'LOAD_STATE'; state: AppState };

// ─── Default sample data ──────────────────────────────────────────────────────

const TODAY = todayStr();

const DEFAULT_KIDS: Kid[] = [
  {
    id: 'kid_emma',
    name: 'Emma',
    avatar: '👧',
    colorName: 'pink',
    points: 245,
    totalXP: 845,
    streak: 4,
    lastStreakDate: TODAY,
    badges: ['first_chore', 'streak_3', 'daily_hero', 'collector_500'],
  },
  {
    id: 'kid_jake',
    name: 'Jake',
    avatar: '👦',
    colorName: 'blue',
    points: 180,
    totalXP: 620,
    streak: 2,
    lastStreakDate: TODAY,
    badges: ['first_chore', 'streak_3'],
  },
  {
    id: 'kid_lily',
    name: 'Lily',
    avatar: '🧒',
    colorName: 'green',
    points: 95,
    totalXP: 310,
    streak: 1,
    lastStreakDate: TODAY,
    badges: ['first_chore'],
  },
];

const DEFAULT_CHORES: Chore[] = [
  // Daily
  { id: 'c_bed',      title: 'Make Bed',           description: 'Make your bed neat and tidy every morning',       type: 'daily',  daysOfWeek: [0,1,2,3,4,5,6], points: 15, assignedTo: [], icon: '🛏️',  requiresApproval: false },
  { id: 'c_teeth',    title: 'Brush Teeth',         description: 'Brush teeth morning and evening for 2 minutes',   type: 'daily',  daysOfWeek: [0,1,2,3,4,5,6], points: 10, assignedTo: [], icon: '🦷',  requiresApproval: false },
  { id: 'c_toys',     title: 'Pick Up Toys',        description: 'Put all toys away before bedtime',                type: 'daily',  daysOfWeek: [0,1,2,3,4,5,6], points: 15, assignedTo: [], icon: '🧸',  requiresApproval: false },
  { id: 'c_table',    title: 'Set the Table',       description: 'Help set the dinner table each evening',          type: 'daily',  daysOfWeek: [0,1,2,3,4,5,6], points: 20, assignedTo: [], icon: '🍽️', requiresApproval: false },
  { id: 'c_homework', title: 'Complete Homework',   description: 'Finish all homework before screen time',          type: 'daily',  daysOfWeek: [1,2,3,4,5],     points: 25, assignedTo: [], icon: '📚',  requiresApproval: false },
  { id: 'c_dishes',   title: 'Clear Your Dishes',   description: 'Take your dishes to the sink after every meal',   type: 'daily',  daysOfWeek: [0,1,2,3,4,5,6], points: 10, assignedTo: [], icon: '🥣',  requiresApproval: false },
  // Weekly
  { id: 'c_room',     title: 'Clean Room',          description: 'Vacuum, dust, and organise your whole room',      type: 'weekly', daysOfWeek: [0,6],            points: 40, assignedTo: [], icon: '🧹',  requiresApproval: true  },
  { id: 'c_laundry',  title: 'Fold Laundry',        description: 'Fold your clean clothes and put them away',       type: 'weekly', daysOfWeek: [0],              points: 30, assignedTo: [], icon: '👕',  requiresApproval: false },
  { id: 'c_plants',   title: 'Water Plants',        description: 'Water all indoor and outdoor plants',             type: 'weekly', daysOfWeek: [6],              points: 20, assignedTo: [], icon: '🌱',  requiresApproval: false },
  { id: 'c_trash',    title: 'Take Out Trash',      description: 'Empty all bins and put bags outside',             type: 'weekly', daysOfWeek: [5],              points: 25, assignedTo: [], icon: '🗑️', requiresApproval: false },
  { id: 'c_vacuum',   title: 'Vacuum Living Room',  description: 'Vacuum the entire living room and hallway',       type: 'weekly', daysOfWeek: [6],              points: 35, assignedTo: [], icon: '🧽',  requiresApproval: true  },
  { id: 'c_pets',     title: 'Feed & Water Pets',   description: 'Give the pets fresh food and clean water',        type: 'weekly', daysOfWeek: [0,3,6],          points: 20, assignedTo: [], icon: '🐾',  requiresApproval: false },
  // Extra Credit
  { id: 'c_cook',     title: 'Help Cook Dinner',    description: 'Help prepare and cook a full meal',               type: 'extra',  daysOfWeek: [],               points: 50, assignedTo: [], icon: '🍳',  requiresApproval: true  },
  { id: 'c_read',     title: 'Read for 30 Minutes', description: 'Read any book of your choice for 30 min',        type: 'extra',  daysOfWeek: [],               points: 30, assignedTo: [], icon: '📖',  requiresApproval: false },
  { id: 'c_exercise', title: 'Exercise 20 Minutes', description: 'Go for a walk, run, bike ride, or play sports',  type: 'extra',  daysOfWeek: [],               points: 40, assignedTo: [], icon: '🏃',  requiresApproval: false },
  { id: 'c_garden',   title: 'Help in the Garden',  description: 'Weed, plant, or tend to the garden',             type: 'extra',  daysOfWeek: [],               points: 45, assignedTo: [], icon: '🌻',  requiresApproval: true  },
  { id: 'c_windows',  title: 'Clean Windows',       description: 'Wipe down all the windows and glass doors',      type: 'extra',  daysOfWeek: [],               points: 35, assignedTo: [], icon: '🪟',  requiresApproval: true  },
];

const DEFAULT_REWARDS: Reward[] = [
  { id: 'r1', title: '30 Min Extra Screen Time', description: 'Extra device time — any screen of your choice!',      pointCost: 100, icon: '📱' },
  { id: 'r2', title: 'Stay Up 30 Min Later',     description: 'Push bedtime back 30 minutes on a school night',      pointCost: 150, icon: '🌙' },
  { id: 'r3', title: 'Movie Night Pick',          description: 'YOU choose the movie for the next family movie night', pointCost: 200, icon: '🎬' },
  { id: 'r4', title: 'Choose Dinner Tonight',     description: 'Pick what the whole family eats for dinner',          pointCost: 250, icon: '🍕' },
  { id: 'r5', title: 'Ice Cream Trip',            description: 'A special trip to the ice cream shop',                pointCost: 300, icon: '🍦' },
  { id: 'r6', title: 'Sleepover with a Friend',   description: 'Invite one friend for a sleepover on the weekend',    pointCost: 400, icon: '🛌' },
  { id: 'r7', title: 'New Book or Small Toy',     description: 'Pick a new book or small toy (up to $15)',            pointCost: 500, icon: '🎁' },
];

// Build some completions for today and past days so the app looks alive
function buildSampleCompletions(): Completion[] {
  const completions: Completion[] = [];
  const today = new Date();

  // Past 5 days — add a few completions per kid
  for (let daysAgo = 5; daysAgo >= 1; daysAgo--) {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const dow = d.getDay();

    // Emma
    const emmaChores = ['c_bed', 'c_teeth', 'c_toys', 'c_table'];
    if (dow >= 1 && dow <= 5) emmaChores.push('c_homework');
    for (const cid of emmaChores.slice(0, 3 + Math.floor(Math.random() * 2))) {
      completions.push({
        id: genId(),
        choreId: cid,
        kidId: 'kid_emma',
        date: dateStr,
        completedAt: new Date(d.setHours(16, 0, 0, 0)).toISOString(),
        approved: true,
      });
    }

    // Jake
    const jakeChores = ['c_bed', 'c_teeth', 'c_dishes'];
    for (const cid of jakeChores.slice(0, 2 + Math.floor(Math.random() * 2))) {
      completions.push({
        id: genId(),
        choreId: cid,
        kidId: 'kid_jake',
        date: dateStr,
        completedAt: new Date(d.setHours(17, 0, 0, 0)).toISOString(),
        approved: true,
      });
    }
  }

  // Today — some already done
  completions.push(
    { id: genId(), choreId: 'c_bed',   kidId: 'kid_emma', date: TODAY, completedAt: new Date().toISOString(), approved: true },
    { id: genId(), choreId: 'c_teeth', kidId: 'kid_emma', date: TODAY, completedAt: new Date().toISOString(), approved: true },
    { id: genId(), choreId: 'c_bed',   kidId: 'kid_jake', date: TODAY, completedAt: new Date().toISOString(), approved: true },
  );

  return completions;
}

const DEFAULT_STATE: AppState = {
  kids: DEFAULT_KIDS,
  chores: DEFAULT_CHORES,
  completions: buildSampleCompletions(),
  rewards: DEFAULT_REWARDS,
  redemptions: [],
  currentView: 'home',
  selectedKidId: null,
  parentPin: '1234',
};

// ─── Gamification helpers ─────────────────────────────────────────────────────

function checkAndAwardBadges(kid: Kid, allCompletions: Completion[], allChores: Chore[]): string[] {
  const earned = new Set(kid.badges);
  const todayCompletions = allCompletions.filter(c => c.kidId === kid.id && c.date === todayStr());
  const allKidCompletions = allCompletions.filter(c => c.kidId === kid.id);
  const totalCompleted = allKidCompletions.length;

  // First chore
  if (totalCompleted >= 1) earned.add('first_chore');

  // Speed demon — 5 in one day
  if (todayCompletions.length >= 5) earned.add('speed_demon');

  // Daily hero — all daily chores for today
  const today = new Date();
  const dow = today.getDay();
  const dailyToday = allChores.filter(c => c.type === 'daily' && c.daysOfWeek.includes(dow as any));
  const doneChoreIds = new Set(todayCompletions.map(c => c.choreId));
  if (dailyToday.length > 0 && dailyToday.every(c => doneChoreIds.has(c.id))) earned.add('daily_hero');

  // Streak badges
  if (kid.streak >= 3) earned.add('streak_3');
  if (kid.streak >= 7) earned.add('streak_7');

  // Extra mile — 3 extra credit chores ever
  const extraDone = allKidCompletions.filter(c => {
    const ch = allChores.find(x => x.id === c.choreId);
    return ch?.type === 'extra';
  });
  if (extraDone.length >= 3) earned.add('extra_mile');

  // Level badges
  const level = getLevel(kid.totalXP);
  if (level >= 3) earned.add('level_3');
  if (level >= 5) earned.add('level_5');
  if (level >= 8) earned.add('level_8');

  // Point collector
  if (kid.totalXP >= 500) earned.add('collector_500');

  // Weekend worker — all weekend chores done this weekend
  const weekendChores = allChores.filter(c => c.type === 'weekly' && (c.daysOfWeek.includes(0) || c.daysOfWeek.includes(6)));
  const today2 = new Date();
  const sat = new Date(today2); sat.setDate(today2.getDate() - today2.getDay() + 6);
  const sun = new Date(today2); sun.setDate(today2.getDate() - today2.getDay());
  const satStr = `${sat.getFullYear()}-${String(sat.getMonth()+1).padStart(2,'0')}-${String(sat.getDate()).padStart(2,'0')}`;
  const sunStr = `${sun.getFullYear()}-${String(sun.getMonth()+1).padStart(2,'0')}-${String(sun.getDate()).padStart(2,'0')}`;
  const weekendDone = allKidCompletions.filter(c => c.date === satStr || c.date === sunStr);
  const weekendDoneIds = new Set(weekendDone.map(c => c.choreId));
  if (weekendChores.length > 0 && weekendChores.every(c => weekendDoneIds.has(c.id))) earned.add('weekend_worker');

  return Array.from(earned);
}

function updateStreak(kid: Kid, dateStr: string): { streak: number; lastStreakDate: string } {
  const last = kid.lastStreakDate;
  if (!last || last === dateStr) return { streak: kid.streak, lastStreakDate: dateStr };

  const lastDate = new Date(last + 'T12:00:00');
  const thisDate = new Date(dateStr + 'T12:00:00');
  const diffDays = Math.round((thisDate.getTime() - lastDate.getTime()) / 86400000);

  if (diffDays === 1) {
    return { streak: kid.streak + 1, lastStreakDate: dateStr };
  } else if (diffDays > 1) {
    return { streak: 1, lastStreakDate: dateStr };
  }
  return { streak: kid.streak, lastStreakDate: dateStr };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'LOAD_STATE':
      return action.state;

    case 'SET_VIEW':
      return { ...state, currentView: action.view, selectedKidId: action.kidId ?? state.selectedKidId };

    // ── Kids ──
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

    // ── Chores ──
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

    // ── Completions ──
    case 'COMPLETE_CHORE': {
      const { choreId, kidId, date } = action;

      // Check not already completed today
      const already = state.completions.some(c => c.choreId === choreId && c.kidId === kidId && c.date === date);
      if (already) return state;

      const chore = state.chores.find(c => c.id === choreId);
      if (!chore) return state;

      const newCompletion: Completion = {
        id: genId(),
        choreId,
        kidId,
        date,
        completedAt: new Date().toISOString(),
        approved: !chore.requiresApproval,
      };

      const newCompletions = [...state.completions, newCompletion];

      // Award points to kid
      const pointsToAdd = chore.requiresApproval ? 0 : chore.points; // pending approval = no points yet
      const kid = state.kids.find(k => k.id === kidId);
      if (!kid) return { ...state, completions: newCompletions };

      const { streak, lastStreakDate } = updateStreak(kid, date);
      const updatedKid: Kid = {
        ...kid,
        points: kid.points + pointsToAdd,
        totalXP: kid.totalXP + pointsToAdd,
        streak,
        lastStreakDate,
      };

      const newKids = state.kids.map(k => k.id === kidId ? updatedKid : k);

      // Check badges
      const newBadges = checkAndAwardBadges(updatedKid, newCompletions, state.chores);
      const finalKid: Kid = { ...updatedKid, badges: newBadges };
      const finalKids = newKids.map(k => k.id === kidId ? finalKid : k);

      return { ...state, completions: newCompletions, kids: finalKids };
    }

    case 'UNDO_COMPLETION': {
      const completion = state.completions.find(c => c.id === action.completionId);
      if (!completion) return state;

      const chore = state.chores.find(c => c.id === completion.choreId);
      const pointsToRemove = chore && completion.approved ? chore.points : 0;

      const kid = state.kids.find(k => k.id === completion.kidId);
      const updatedKid = kid
        ? { ...kid, points: Math.max(0, kid.points - pointsToRemove), totalXP: Math.max(0, kid.totalXP - pointsToRemove) }
        : null;

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
      const updatedKid = kid
        ? { ...kid, points: kid.points + pointsToAdd, totalXP: kid.totalXP + pointsToAdd }
        : null;

      return {
        ...state,
        completions: state.completions.map(c => c.id === action.completionId ? { ...c, approved: true } : c),
        kids: updatedKid ? state.kids.map(k => k.id === updatedKid.id ? updatedKid : k) : state.kids,
      };
    }

    // ── Rewards ──
    case 'ADD_REWARD':
      return { ...state, rewards: [...state.rewards, action.reward] };

    case 'UPDATE_REWARD':
      return { ...state, rewards: state.rewards.map(r => r.id === action.reward.id ? action.reward : r) };

    case 'DELETE_REWARD':
      return { ...state, rewards: state.rewards.filter(r => r.id !== action.rewardId) };

    // ── Redemptions ──
    case 'REDEEM_REWARD': {
      const { rewardId, kidId } = action;
      const reward = state.rewards.find(r => r.id === rewardId);
      const kid = state.kids.find(k => k.id === kidId);
      if (!reward || !kid || kid.points < reward.pointCost) return state;

      const redemption: RewardRedemption = {
        id: genId(),
        rewardId,
        kidId,
        requestedAt: new Date().toISOString(),
        approved: false,
        denied: false,
      };

      // Deduct points immediately (parent approves the physical reward)
      const updatedKid = { ...kid, points: kid.points - reward.pointCost };

      return {
        ...state,
        redemptions: [...state.redemptions, redemption],
        kids: state.kids.map(k => k.id === kidId ? updatedKid : k),
      };
    }

    case 'APPROVE_REDEMPTION':
      return {
        ...state,
        redemptions: state.redemptions.map(r => r.id === action.redemptionId ? { ...r, approved: true } : r),
      };

    case 'DENY_REDEMPTION': {
      // Refund points
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

    case 'SET_PARENT_PIN':
      return { ...state, parentPin: action.pin };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'chorequest_v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE, (initial) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AppState;
        // Merge with defaults to pick up any new chores/rewards
        return {
          ...parsed,
          currentView: 'home' as const,
          selectedKidId: null,
        };
      }
    } catch {
      // ignore
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

// ─── Convenience action creators ─────────────────────────────────────────────

export function useActions() {
  const { dispatch } = useApp();
  return {
    setView: (view: ViewMode, kidId?: string) => dispatch({ type: 'SET_VIEW', view, kidId }),
    addKid: (kid: Omit<Kid, 'id'>) => dispatch({ type: 'ADD_KID', kid: { ...kid, id: genId() } }),
    updateKid: (kid: Kid) => dispatch({ type: 'UPDATE_KID', kid }),
    deleteKid: (kidId: string) => dispatch({ type: 'DELETE_KID', kidId }),
    addChore: (chore: Omit<Chore, 'id'>) => dispatch({ type: 'ADD_CHORE', chore: { ...chore, id: genId() } }),
    updateChore: (chore: Chore) => dispatch({ type: 'UPDATE_CHORE', chore }),
    deleteChore: (choreId: string) => dispatch({ type: 'DELETE_CHORE', choreId }),
    completeChore: (choreId: string, kidId: string, date: string) => dispatch({ type: 'COMPLETE_CHORE', choreId, kidId, date }),
    undoCompletion: (completionId: string) => dispatch({ type: 'UNDO_COMPLETION', completionId }),
    approveCompletion: (completionId: string) => dispatch({ type: 'APPROVE_COMPLETION', completionId }),
    addReward: (reward: Omit<Reward, 'id'>) => dispatch({ type: 'ADD_REWARD', reward: { ...reward, id: genId() } }),
    updateReward: (reward: Reward) => dispatch({ type: 'UPDATE_REWARD', reward }),
    deleteReward: (rewardId: string) => dispatch({ type: 'DELETE_REWARD', rewardId }),
    redeemReward: (rewardId: string, kidId: string) => dispatch({ type: 'REDEEM_REWARD', rewardId, kidId }),
    approveRedemption: (redemptionId: string) => dispatch({ type: 'APPROVE_REDEMPTION', redemptionId }),
    denyRedemption: (redemptionId: string) => dispatch({ type: 'DENY_REDEMPTION', redemptionId }),
    setParentPin: (pin: string) => dispatch({ type: 'SET_PARENT_PIN', pin }),
  };
}
