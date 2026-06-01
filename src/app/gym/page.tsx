'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/ui';
import {
  getWorkoutsForWeek,
  saveWorkoutsForWeek,
  getWeekKey,
  addXP,
  WorkoutDay,
} from '@/lib/store';
import { Dumbbell, CheckCircle2, Circle, Flame, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const DAY_LABELS: Record<string, string> = {
  Monday: '🔥 Workout Day',
  Tuesday: '💪 Strength Day',
  Wednesday: '⚡ Core Day',
  Thursday: '🦵 Lower Body Day',
  Friday: '💪 Strength Day',
  Saturday: '🧘 Recovery',
  Sunday: '🧘 Recovery',
};

export default function GymPage() {
  const [mounted, setMounted] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [workouts, setWorkouts] = useState<WorkoutDay[]>([]);

  const getWeekKeyOffset = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset * 7);
    return getWeekKey(d);
  };

  const getWeekDates = (offset: number) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1; // Monday = 0
      d.setDate(d.getDate() - dayIdx + (offset * 7) + i);
      dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
  };

  const weekKey = getWeekKeyOffset(weekOffset);
  const weekDates = getWeekDates(weekOffset);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setWorkouts(getWorkoutsForWeek(weekKey));
    }
  }, [weekKey, mounted]);

  const toggleDay = (dayIdx: number) => {
    const updated = [...workouts];
    updated[dayIdx] = { ...updated[dayIdx], completed: !updated[dayIdx].completed };

    if (updated[dayIdx].completed) {
      addXP(20);
      const allDone = updated.filter(w => !w.title.includes('Rest')).every(w => w.completed);
      if (allDone) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        addXP(100);
      }
    }

    saveWorkoutsForWeek(weekKey, updated);
    setWorkouts(updated);
  };

  if (!mounted) return <div className="skeleton rounded-2xl h-96" />;

  const todayIdx = (new Date().getDay() + 6) % 7;
  const completedDays = workouts.filter(w => w.completed).length;
  const workoutDays = workouts.filter(w => !w.title.includes('Rest'));
  const workoutCompleted = workoutDays.filter(w => w.completed).length;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Dumbbell className="text-primary" size={28} />
              Gym Tracker
            </h1>
            <p className="text-text-muted text-sm mt-1">Weekly Workout Planner</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-xl glass-light hover:bg-white/10 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-text-secondary px-2">{weekKey}</span>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 rounded-xl glass-light hover:bg-white/10 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Summary */}
      <FadeIn delay={0.1}>
        <div className="glass rounded-2xl p-5 flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={18} className="text-orange-400" />
              <span className="text-sm font-semibold">Weekly Progress</span>
            </div>
            <div className="w-full h-3 bg-surface-hover rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(workoutCompleted / Math.max(1, workoutDays.length)) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="text-xs text-text-muted mt-1.5">{workoutCompleted}/{workoutDays.length} workout days completed</p>
          </div>
          <div className="glass-light rounded-xl px-4 py-3 text-center min-w-[70px]">
            <p className="text-2xl font-bold text-primary">{completedDays}</p>
            <p className="text-[10px] text-text-muted">/ 7 days</p>
          </div>
        </div>
      </FadeIn>

      {/* Workout Cards */}
      <div className="space-y-3">
        {workouts.map((workout, i) => {
          const isToday = weekOffset === 0 && i === todayIdx;
          const isRest = workout.title.includes('Rest');

          return (
            <FadeIn key={workout.day} delay={0.15 + i * 0.05}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`glass rounded-2xl p-5 relative overflow-hidden transition-all cursor-pointer ${
                  isToday ? 'ring-2 ring-primary glow-blue' : ''
                } ${workout.completed ? 'border border-success/20' : ''}`}
                onClick={() => toggleDay(i)}
              >
                {isToday && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      TODAY
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Check */}
                  <div className="mt-1">
                    {workout.completed ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                        <CheckCircle2 size={24} className="text-success" />
                      </motion.div>
                    ) : (
                      <Circle size={24} className="text-text-muted" />
                    )}
                  </div>

                  <div className="flex-1">
                    {/* Day Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{workout.emoji}</span>
                      <h3 className="font-bold text-sm">{workout.day}</h3>
                      <span className="text-xs text-text-muted">({weekDates[i]})</span>
                      <span className="text-xs text-text-muted ml-1">·</span>
                      <span className={`text-xs font-medium ${isRest ? 'text-text-muted' : 'text-primary-light'}`}>
                        {workout.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted mb-3">{DAY_LABELS[workout.day]}</p>

                    {/* Exercises */}
                    <div className="flex flex-wrap gap-1.5">
                      {workout.exercises.map(ex => (
                        <span
                          key={ex}
                          className={`text-[10px] px-2.5 py-1 rounded-lg font-medium ${
                            workout.completed
                              ? 'bg-success/10 text-success'
                              : 'glass-light text-text-secondary'
                          }`}
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {workout.completed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-3 right-3 flex items-center gap-1"
                  >
                    <Zap size={12} className="text-gold" />
                    <span className="text-[10px] font-bold text-gold">+20 XP</span>
                  </motion.div>
                )}
              </motion.div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
