'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, ProgressRing } from '@/components/ui';
import {
  getHabitsForDate,
  saveHabitsForDate,
  getHabitTemplate,
  saveHabitTemplate,
  getToday,
  addXP,
  getProfile,
  saveProfile,
  HabitItem,
  HabitDay,
} from '@/lib/store';
import { CheckCircle2, Circle, Sun, CloudSun, Moon, Flame, Award, Edit2, Trash2, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HabitsPage() {
  const [today] = useState(getToday());
  const [habits, setHabits] = useState<HabitDay | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHabits(getHabitsForDate(today));
  }, [today]);

  const toggleHabit = useCallback((section: 'morning' | 'afternoon' | 'night', id: string) => {
    if (!habits || isEditing) return; // Disable toggle in edit mode
    const updated = { ...habits };
    const items = [...updated[section]];
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return;

    const wasCompleted = items[idx].completed;
    items[idx] = { ...items[idx], completed: !wasCompleted };
    updated[section] = items;

    if (!wasCompleted) {
      addXP(10);
      const all = [...updated.morning, ...updated.afternoon, ...updated.night];
      const allDone = all.every(h => h.completed);
      if (allDone && all.length > 0) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        addXP(50); 
        const profile = getProfile();
        profile.streak += 1;
        saveProfile(profile);
      }
    }

    saveHabitsForDate(updated);
    setHabits(updated);
  }, [habits, isEditing]);

  const addHabit = (section: 'morning' | 'afternoon' | 'night') => {
    if (!habits) return;
    const label = prompt('Nama kebiasaan baru:');
    if (!label) return;
    const emoji = prompt('Emoji untuk kebiasaan ini:', '✨') || '✨';
    
    const newItem: HabitItem = {
      id: Date.now().toString(),
      label,
      emoji,
      completed: false
    };

    const updated = { ...habits };
    updated[section] = [...updated[section], newItem];
    
    saveHabitsForDate(updated);
    
    // Update template so tomorrow gets this too
    const template = getHabitTemplate();
    template[section].push(newItem);
    saveHabitTemplate(template);
    
    setHabits(updated);
  };

  const deleteHabit = (section: 'morning' | 'afternoon' | 'night', id: string) => {
    if (!habits) return;
    if (!confirm('Hapus kebiasaan ini?')) return;
    
    const updated = { ...habits };
    updated[section] = updated[section].filter(h => h.id !== id);
    
    saveHabitsForDate(updated);
    
    // Update template
    const template = getHabitTemplate();
    template[section] = template[section].filter(h => h.id !== id);
    saveHabitTemplate(template);
    
    setHabits(updated);
  };

  const editHabitText = (section: 'morning' | 'afternoon' | 'night', id: string) => {
    if (!habits) return;
    const item = habits[section].find(h => h.id === id);
    if (!item) return;
    
    const newLabel = prompt('Edit nama kebiasaan:', item.label);
    if (newLabel === null) return;
    const newEmoji = prompt('Edit emoji:', item.emoji) || item.emoji;

    const updated = { ...habits };
    updated[section] = updated[section].map(h => 
      h.id === id ? { ...h, label: newLabel || h.label, emoji: newEmoji } : h
    );
    
    saveHabitsForDate(updated);
    
    const template = getHabitTemplate();
    template[section] = template[section].map(h => 
      h.id === id ? { ...h, label: newLabel || h.label, emoji: newEmoji } : h
    );
    saveHabitTemplate(template);
    
    setHabits(updated);
  };

  if (!mounted || !habits) return <HabitsSkeleton />;

  const allItems = [...habits.morning, ...habits.afternoon, ...habits.night];
  const completed = allItems.filter(h => h.completed).length;
  const percent = allItems.length > 0 ? Math.round((completed / allItems.length) * 100) : 0;

  const sections: { key: 'morning' | 'afternoon' | 'night'; label: string; icon: React.ReactNode; color: string; items: HabitItem[] }[] = [
    { key: 'morning', label: 'Morning Routine', icon: <Sun size={18} />, color: '#f59e0b', items: habits.morning },
    { key: 'afternoon', label: 'Afternoon Routine', icon: <CloudSun size={18} />, color: '#3b82f6', items: habits.afternoon },
    { key: 'night', label: 'Night Routine', icon: <Moon size={18} />, color: '#8b5cf6', items: habits.night },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="text-primary" size={28} />
              Daily Habits
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {new Date(today).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                isEditing ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-white/5 hover:bg-white/10 text-text-muted'
              }`}
            >
              <Edit2 size={16} />
              {isEditing ? 'Done Editing' : 'Edit Habits'}
            </button>
            <div className="flex items-center gap-3">
              <ProgressRing progress={percent} size={60} strokeWidth={5} color="#2563EB">
                <div className="text-center">
                  <span className="text-sm font-bold">{percent}%</span>
                </div>
              </ProgressRing>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Habit Sections */}
      {sections.map((section, si) => (
        <FadeIn key={section.key} delay={0.1 + si * 0.1}>
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${section.color}20`, color: section.color }}>
                {section.icon}
              </div>
              <h2 className="font-semibold text-sm">{section.label}</h2>
              <span className="ml-auto text-xs text-text-muted">
                {section.items.filter(i => i.completed).length}/{section.items.length}
              </span>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {section.items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group ${
                      item.completed
                        ? 'bg-white/5 border border-success/20'
                        : 'glass-light hover:bg-white/10'
                    }`}
                  >
                    {!isEditing ? (
                      <button onClick={() => toggleHabit(section.key, item.id)} className="flex-1 flex items-center gap-3 text-left">
                        {item.completed ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
                            <CheckCircle2 size={20} className="text-success" />
                          </motion.div>
                        ) : (
                          <Circle size={20} className="text-text-muted group-hover:text-text-secondary" />
                        )}
                        <span className="text-xl">{item.emoji}</span>
                        <span className={`text-sm font-medium flex-1 ${item.completed ? 'text-text-muted line-through' : ''}`}>
                          {item.label}
                        </span>
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center gap-3">
                        <button onClick={() => deleteHabit(section.key, item.id)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                        <button onClick={() => editHabitText(section.key, item.id)} className="flex-1 flex items-center gap-3 text-left px-2 py-1 hover:bg-white/5 rounded-lg">
                          <span className="text-xl">{item.emoji}</span>
                          <span className="text-sm font-medium">{item.label}</span>
                          <Edit2 size={14} className="text-text-muted ml-auto" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isEditing && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => addHabit(section.key)}
                  className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-xl border border-dashed border-white/20 text-text-muted hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  Add Habit to {section.label}
                </motion.button>
              )}
            </div>
          </div>
        </FadeIn>
      ))}

    </div>
  );
}

function HabitsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton rounded-2xl h-20" />
      <div className="skeleton rounded-xl h-12" />
      {[1, 2, 3].map(i => <div key={i} className="skeleton rounded-2xl h-64" />)}
    </div>
  );
}
