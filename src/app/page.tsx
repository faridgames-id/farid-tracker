'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FadeIn, StatCard, ProgressRing } from '@/components/ui';
import {
  getProfile,
  getLevelInfo,
  getHabitsForDate,
  getToday,
  getTransactions,
  getLearningEntries,
  getWorkoutsForWeek,
  getMonthKey,
  formatCurrency,
  LEVELS,
} from '@/lib/store';
import { Flame, TrendingUp, TrendingDown, BookOpen, Dumbbell, Trophy, Target, Zap, Star, DollarSign, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [stats, setStats] = useState({
    streak: 0,
    xp: 0,
    habitsPercent: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    learningCount: 0,
    gymDays: 0,
    name: 'Farid',
  });

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate + 'T12:00:00Z');
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  useEffect(() => {
    setMounted(true);
    const profile = getProfile();
    const habits = getHabitsForDate(selectedDate);
    const allItems = [...habits.morning, ...habits.afternoon, ...habits.night];
    const completed = allItems.filter(h => h.completed).length;
    const percent = allItems.length > 0 ? Math.round((completed / allItems.length) * 100) : 0;

    const transactions = getTransactions();
    const d = new Date(selectedDate + 'T12:00:00Z');
    const monthKey = getMonthKey(d);
    
    const monthlyIncome = transactions
      .filter(t => t.type === 'income' && t.date.startsWith(monthKey))
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
      .reduce((sum, t) => sum + t.amount, 0);

    const learning = getLearningEntries();
    const workouts = getWorkoutsForWeek(getWeekKey(d));
    const gymDays = workouts.filter(w => w.completed).length;

    setStats({
      streak: profile.streak,
      xp: profile.xp,
      habitsPercent: percent,
      monthlyIncome: monthlyIncome,
      monthlyExpense: monthlyExpense,
      learningCount: learning.length,
      gymDays,
      name: profile.name || 'Farid',
    });
  }, [selectedDate]);

  if (!mounted) return <DashboardSkeleton />;

  const levelInfo = getLevelInfo(stats.xp);
  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? 'Good Morning' : greetHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-8">
      {/* Hero Greeting */}
      <FadeIn>
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="absolute top-6 right-6 z-20 hidden sm:block">
            <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10">
              <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-white/10 rounded-md text-text-muted hover:text-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <div className="relative flex items-center group px-2">
                <Calendar size={14} className="text-primary absolute left-2 pointer-events-none" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm font-medium outline-none cursor-pointer hover:text-primary transition-colors text-white pl-6"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-white/10 rounded-md text-text-muted hover:text-white transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-text-secondary text-sm mb-1">{greeting} 👋</p>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Welcome Back, <span className="text-gradient">{stats.name}</span>
            </h1>
            <p className="text-text-muted text-sm max-w-lg mb-4 sm:mb-0">
              Track Your Habits. Grow Your Income. Build Your Future.
            </p>
            
            <div className="sm:hidden mt-4 mb-2">
              <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-lg p-1 w-fit border border-white/10">
                <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-white/10 rounded-md text-text-muted hover:text-white transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <div className="relative flex items-center group px-2">
                  <Calendar size={14} className="text-primary absolute left-2 pointer-events-none" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-sm font-medium outline-none cursor-pointer hover:text-primary transition-colors text-white pl-6"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-white/10 rounded-md text-text-muted hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Level Bar */}
            <div className="mt-6 flex items-center gap-4 flex-wrap">
              <div className="glass-light rounded-2xl px-4 py-2 flex items-center gap-3">
                <span className="text-2xl">{levelInfo.current.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-gold">{levelInfo.current.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-24 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                      <motion.div
                        className="h-full gradient-gold rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${levelInfo.progressToNext}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted">{stats.xp} XP</span>
                  </div>
                </div>
              </div>
              <div className="glass-light rounded-2xl px-4 py-2 flex items-center gap-2">
                <Flame size={16} className="text-orange-400" />
                <span className="text-sm font-semibold">{stats.streak} Day Streak</span>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🔥" label="Habit Streak" value={`${stats.streak} Days`} subtitle="Keep going!" color="#ef4444" delay={0.1} />
        <StatCard icon="💰" label="Monthly Income" value={formatCurrency(stats.monthlyIncome)} subtitle="This month" color="#2563EB" delay={0.2} />
        <StatCard icon="📚" label="Learning" value={`${stats.learningCount} Notes`} subtitle="Knowledge is power" color="#8b5cf6" delay={0.3} />
        <StatCard icon="🏋️" label="Gym Progress" value={`${stats.gymDays}/7 Days`} subtitle="This week" color="#10b981" delay={0.4} />
      </div>

      {/* Progress + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Daily Progress Ring */}
          <FadeIn delay={0.3}>
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Target size={20} className="text-primary" />
                Daily Progress
              </h2>
              <div className="flex items-center justify-center gap-8">
                <ProgressRing progress={stats.habitsPercent} size={140} color="#2563EB">
                  <div className="text-center">
                    <span className="text-3xl font-bold">{stats.habitsPercent}%</span>
                    <p className="text-[10px] text-text-muted mt-0.5">Complete</p>
                  </div>
                </ProgressRing>
                <div className="space-y-3">
                  <ProgressItem label="Morning" progress={60} color="#f59e0b" />
                  <ProgressItem label="Afternoon" progress={40} color="#3b82f6" />
                  <ProgressItem label="Night" progress={20} color="#8b5cf6" />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Monthly Finance Stats */}
          <FadeIn delay={0.35}>
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <DollarSign size={20} className="text-success" />
                Monthly Finance
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10 border-l-4 border-l-success">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-success" />
                    <span className="text-sm font-medium">Income</span>
                  </div>
                  <span className="font-bold text-success">{formatCurrency(stats.monthlyIncome)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10 border-l-4 border-l-danger">
                  <div className="flex items-center gap-2">
                    <TrendingDown size={16} className="text-danger" />
                    <span className="text-sm font-medium">Expense</span>
                  </div>
                  <span className="font-bold text-danger">{formatCurrency(stats.monthlyExpense)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10 border-l-4 border-l-primary mt-4">
                  <span className="text-sm font-bold text-white">Net Balance</span>
                  <span className={`font-bold ${stats.monthlyIncome - stats.monthlyExpense >= 0 ? 'text-primary' : 'text-danger'}`}>
                    {formatCurrency(stats.monthlyIncome - stats.monthlyExpense)}
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Achievements / Level Roadmap */}
        <FadeIn delay={0.4}>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Trophy size={20} className="text-gold" />
              Entrepreneur Roadmap
            </h2>
            <div className="space-y-3">
              {LEVELS.map((lv, i) => {
                const isUnlocked = stats.xp >= lv.minXP;
                const isCurrent = levelInfo.current.level === lv.level;
                return (
                  <motion.div
                    key={lv.level}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isCurrent
                        ? 'glass-light border border-gold/30 glow-gold'
                        : isUnlocked
                        ? 'bg-white/5'
                        : 'opacity-40'
                    }`}
                  >
                    <span className="text-2xl">{lv.emoji}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isCurrent ? 'text-gold' : ''}`}>
                        Level {lv.level} — {lv.name}
                      </p>
                      <p className="text-[10px] text-text-muted">{lv.minXP} XP required</p>
                    </div>
                    {isUnlocked && (
                      <Star size={14} className="text-gold" fill="currentColor" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Quick Actions */}
      <FadeIn delay={0.5}>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap size={20} className="text-gold" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/habits', emoji: '✅', label: 'Check Habits', color: '#10b981' },
              { href: '/finance', emoji: '💰', label: 'Add Income', color: '#2563EB' },
              { href: '/gym', emoji: '💪', label: 'Log Workout', color: '#ef4444' },
              { href: '/learning', emoji: '📝', label: 'Add Notes', color: '#8b5cf6' },
            ].map((action, i) => (
              <motion.a
                key={action.href}
                href={action.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass-light rounded-xl p-4 text-center card-hover cursor-pointer block"
              >
                <span className="text-2xl block mb-2">{action.emoji}</span>
                <p className="text-xs font-medium text-text-secondary">{action.label}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

function ProgressItem({ label, progress, color }: { label: string; progress: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="text-xs font-semibold">{progress}%</span>
      </div>
      <div className="w-32 h-1.5 bg-surface-hover rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="skeleton rounded-3xl h-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton rounded-2xl h-32" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="skeleton rounded-2xl h-64" />
        <div className="skeleton rounded-2xl h-64" />
      </div>
    </div>
  );
}
