import { supabase } from './supabase';

// Local Storage helpers for the entire app
const isBrowser = typeof window !== 'undefined';

export interface HabitItem {
  id: string;
  label: string;
  emoji: string;
  completed: boolean;
}

export interface HabitDay {
  date: string;
  morning: HabitItem[];
  afternoon: HabitItem[];
  night: HabitItem[];
}

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
}

export interface WeekSaving {
  weekNumber: number;
  investAmount: number;
  saveAmount: number;
  completed: boolean;
}

export interface MonthlySaving {
  month: string; // "2026-06"
  weeks: WeekSaving[];
}

export interface WorkoutDay {
  day: string;
  title: string;
  emoji: string;
  exercises: string[];
  completed: boolean;
}

export interface LearningEntry {
  id: string;
  date: string;
  topic: string;
  category: string;
  notes: string[];
}

export interface UserProfile {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  badges: string[];
  name?: string;
  title?: string;
}

const KEYS = {
  HABITS: 'farid_habits',
  TRANSACTIONS: 'farid_transactions',
  SAVINGS: 'farid_savings',
  WORKOUTS: 'farid_workouts',
  LEARNING: 'farid_learning',
  PROFILE: 'farid_profile',
  HABIT_TEMPLATE: 'farid_habit_template',
};

function get<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export async function syncToSupabase() {
  if (!isBrowser) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const allData: Record<string, any> = {};
  for (const key of Object.values(KEYS)) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        allData[key] = JSON.parse(raw);
      } catch (e) {
        // ignore
      }
    }
  }

  const { error } = await supabase.from('user_data').upsert({
    user_id: session.user.id,
    data: allData,
    updated_at: new Date().toISOString()
  });

  if (error) {
    console.error("Supabase sync error:", error);
    return { success: false, error };
  }
  return { success: true };
}

export async function loadFromSupabase() {
  if (!isBrowser) return false;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data || !data.data) return false;

  const userData = data.data as Record<string, any>;
  let updated = false;
  for (const key of Object.values(KEYS)) {
    if (userData[key] !== undefined) {
      const currentRaw = localStorage.getItem(key);
      const newRaw = JSON.stringify(userData[key]);
      if (currentRaw !== newRaw) {
        localStorage.setItem(key, newRaw);
        updated = true;
      }
    }
  }
  return updated;
}

function set<T>(key: string, value: T): void {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
  
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(syncToSupabase, 2000);
}

export function exportData(): string {
  const allData: Record<string, any> = {};
  for (const key of Object.values(KEYS)) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        allData[key] = JSON.parse(raw);
      } catch (e) {}
    }
  }
  return JSON.stringify(allData, null, 2);
}

export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    for (const key of Object.values(KEYS)) {
      if (data[key] !== undefined) {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    }
    syncToSupabase();
    return true;
  } catch (e) {
    console.error("Failed to import data", e);
    return false;
  }
}

// LEVELS
export const LEVELS = [
  { level: 1, name: 'Beginner', minXP: 0, emoji: '🌱' },
  { level: 2, name: 'Hustler', minXP: 500, emoji: '🔥' },
  { level: 3, name: 'Builder', minXP: 1500, emoji: '🏗️' },
  { level: 4, name: 'Entrepreneur', minXP: 4000, emoji: '💼' },
  { level: 5, name: 'CEO', minXP: 10000, emoji: '👑' },
];

export function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }
  const progressToNext = next.level === current.level
    ? 100
    : Math.min(100, ((xp - current.minXP) / (next.minXP - current.minXP)) * 100);
  return { current, next, progressToNext };
}

// PROFILE
export function getProfile(): UserProfile {
  return get<UserProfile>(KEYS.PROFILE, {
    xp: 0, level: 1, streak: 0, lastActiveDate: '', badges: [],
    name: 'Farid', title: 'Entrepreneur'
  });
}

export function saveProfile(profile: UserProfile) {
  set(KEYS.PROFILE, profile);
}

export function addXP(amount: number): UserProfile {
  const profile = getProfile();
  profile.xp += amount;
  const { current } = getLevelInfo(profile.xp);
  profile.level = current.level;
  saveProfile(profile);
  return profile;
}

// HABITS
export function getDefaultHabits(): HabitDay {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    morning: [
      { id: 'm1', label: 'Wake Up Early', emoji: '⏰', completed: false },
      { id: 'm2', label: 'Prayer', emoji: '🤲', completed: false },
      { id: 'm3', label: 'Drink Water', emoji: '💧', completed: false },
      { id: 'm4', label: 'Read Books', emoji: '📖', completed: false },
      { id: 'm5', label: 'Write Goals', emoji: '🎯', completed: false },
      { id: 'm6', label: 'Morning Exercise', emoji: '🏃', completed: false },
    ],
    afternoon: [
      { id: 'a1', label: 'Learn AI', emoji: '🤖', completed: false },
      { id: 'a2', label: 'Follow Up Customers', emoji: '📞', completed: false },
      { id: 'a3', label: 'Upload Content', emoji: '📱', completed: false },
      { id: 'a4', label: 'Read Business Materials', emoji: '📊', completed: false },
    ],
    night: [
      { id: 'n1', label: 'Daily Evaluation', emoji: '📝', completed: false },
      { id: 'n2', label: 'Journal Writing', emoji: '✏️', completed: false },
      { id: 'n3', label: 'Save Money', emoji: '💰', completed: false },
      { id: 'n4', label: 'Sleep On Time', emoji: '🌙', completed: false },
    ],
  };
}

export function getHabitTemplate(): Omit<HabitDay, 'date'> {
  const defaults = getDefaultHabits();
  return get(KEYS.HABIT_TEMPLATE, {
    morning: defaults.morning,
    afternoon: defaults.afternoon,
    night: defaults.night,
  });
}

export function saveHabitTemplate(template: Omit<HabitDay, 'date'>) {
  set(KEYS.HABIT_TEMPLATE, template);
}

export function getHabitsForDate(date: string): HabitDay {
  const all = get<Record<string, HabitDay>>(KEYS.HABITS, {});
  if (all[date]) return all[date];
  const template = getHabitTemplate();
  // We must map to ensure fresh objects without shared references
  return {
    date,
    morning: template.morning.map(h => ({ ...h, completed: false })),
    afternoon: template.afternoon.map(h => ({ ...h, completed: false })),
    night: template.night.map(h => ({ ...h, completed: false })),
  };
}

export function saveHabitsForDate(day: HabitDay) {
  const all = get<Record<string, HabitDay>>(KEYS.HABITS, {});
  all[day.date] = day;
  set(KEYS.HABITS, all);
}

export function getAllHabits(): Record<string, HabitDay> {
  return get<Record<string, HabitDay>>(KEYS.HABITS, {});
}

// TRANSACTIONS
export function getTransactions(): Transaction[] {
  return get<Transaction[]>(KEYS.TRANSACTIONS, []);
}

export function saveTransaction(t: Transaction) {
  const all = getTransactions();
  all.push(t);
  set(KEYS.TRANSACTIONS, all);
}

export function updateTransaction(t: Transaction) {
  const all = getTransactions();
  const idx = all.findIndex(x => x.id === t.id);
  if (idx >= 0) {
    all[idx] = t;
    set(KEYS.TRANSACTIONS, all);
  }
}

export function deleteTransaction(id: string) {
  const all = getTransactions().filter(t => t.id !== id);
  set(KEYS.TRANSACTIONS, all);
}

// SAVINGS
export function getSavings(): Record<string, MonthlySaving> {
  return get<Record<string, MonthlySaving>>(KEYS.SAVINGS, {});
}

export function getSavingsForMonth(monthKey: string): MonthlySaving {
  const all = getSavings();
  if (all[monthKey]) return all[monthKey];
  return {
    month: monthKey,
    weeks: [
      { weekNumber: 1, investAmount: 0, saveAmount: 0, completed: false },
      { weekNumber: 2, investAmount: 0, saveAmount: 0, completed: false },
      { weekNumber: 3, investAmount: 0, saveAmount: 0, completed: false },
      { weekNumber: 4, investAmount: 0, saveAmount: 0, completed: false },
    ],
  };
}

export function saveSavingsForMonth(data: MonthlySaving) {
  const all = getSavings();
  all[data.month] = data;
  set(KEYS.SAVINGS, all);
}

// WORKOUTS
export function getDefaultWorkouts(): WorkoutDay[] {
  return [
    { day: 'Monday', title: 'Chest + Triceps', emoji: '🔥', exercises: ['Bench Press', 'Incline Dumbbell Press', 'Cable Flyes', 'Tricep Pushdown', 'Overhead Extension'], completed: false },
    { day: 'Tuesday', title: 'Back + Biceps', emoji: '💪', exercises: ['Deadlift', 'Pull Ups', 'Barbell Row', 'Barbell Curl', 'Hammer Curl'], completed: false },
    { day: 'Wednesday', title: 'Shoulders + Abs', emoji: '⚡', exercises: ['Overhead Press', 'Lateral Raise', 'Face Pull', 'Plank', 'Crunches'], completed: false },
    { day: 'Thursday', title: 'Leg Day', emoji: '🦵', exercises: ['Squat', 'Leg Press', 'Lunges', 'Leg Curl', 'Calf Raise'], completed: false },
    { day: 'Friday', title: 'Back + Biceps', emoji: '💪', exercises: ['Lat Pulldown', 'Seated Row', 'T-Bar Row', 'Preacher Curl', 'Concentration Curl'], completed: false },
    { day: 'Saturday', title: 'Rest Day', emoji: '🧘', exercises: ['Stretching', 'Light Walk', 'Foam Rolling'], completed: false },
    { day: 'Sunday', title: 'Rest Day', emoji: '🧘', exercises: ['Active Recovery', 'Yoga', 'Meditation'], completed: false },
  ];
}

export function getWorkoutsForWeek(weekKey: string): WorkoutDay[] {
  const all = get<Record<string, WorkoutDay[]>>(KEYS.WORKOUTS, {});
  if (all[weekKey]) return all[weekKey];
  return getDefaultWorkouts();
}

export function saveWorkoutsForWeek(weekKey: string, workouts: WorkoutDay[]) {
  const all = get<Record<string, WorkoutDay[]>>(KEYS.WORKOUTS, {});
  all[weekKey] = workouts;
  set(KEYS.WORKOUTS, all);
}

// LEARNING
export function getLearningEntries(): LearningEntry[] {
  return get<LearningEntry[]>(KEYS.LEARNING, []);
}

export function saveLearningEntry(entry: LearningEntry) {
  const all = getLearningEntries();
  const idx = all.findIndex(e => e.id === entry.id);
  if (idx >= 0) all[idx] = entry;
  else all.push(entry);
  set(KEYS.LEARNING, all);
}

export function deleteLearningEntry(id: string) {
  const all = getLearningEntries().filter(e => e.id !== id);
  set(KEYS.LEARNING, all);
}

// UTILITY
export function formatCurrency(amount: number): string {
  return 'Rp ' + Math.abs(amount).toLocaleString('id-ID');
}

export function getWeekKey(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const start = new Date(year, 0, 1);
  const diff = d.getTime() - start.getTime();
  const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function getMonthKey(date?: Date): string {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}
