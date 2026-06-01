'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/ui';
import {
  getLearningEntries,
  saveLearningEntry,
  deleteLearningEntry,
  addXP,
  LearningEntry,
} from '@/lib/store';
import { BookOpen, Plus, Trash2, Edit2, Search, Tag, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = ['AI', 'Business', 'Marketing', 'Coding', 'Finance', 'Entrepreneurship'];
const CATEGORY_COLORS: Record<string, string> = {
  AI: '#3b82f6',
  Business: '#f59e0b',
  Marketing: '#ec4899',
  Coding: '#10b981',
  Finance: '#8b5cf6',
  Entrepreneurship: '#ef4444',
};

export default function LearningPage() {
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<LearningEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form state
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('AI');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setMounted(true);
    setEntries(getLearningEntries());
  }, []);

  const handleAdd = () => {
    if (!topic) return;
    const entry: LearningEntry = {
      id: editingId || Date.now().toString(),
      date: selectedDate,
      topic,
      category,
      notes: notes.split('\n').filter(n => n.trim()),
    };
    saveLearningEntry(entry);
    if (!editingId) addXP(15);
    setEntries(getLearningEntries());
    
    // Reset form
    setTopic('');
    setNotes('');
    setEditingId(null);
    setSelectedDate(new Date().toISOString().slice(0, 10));
    setShowForm(false);
  };

  const handleEdit = (e: LearningEntry) => {
    setTopic(e.topic);
    setCategory(e.category);
    setNotes(e.notes.join('\n'));
    setSelectedDate(e.date);
    setEditingId(e.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteLearningEntry(id);
    setEntries(getLearningEntries());
  };

  if (!mounted) return <div className="skeleton rounded-2xl h-96" />;

  const filtered = entries.filter(e => {
    if (search && !e.topic.toLowerCase().includes(search.toLowerCase()) && !e.notes.some(n => n.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterCat && e.category !== filterCat) return false;
    return true;
  });

  // Calendar helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthEntries = entries.filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const entryDates = new Set(monthEntries.map(e => parseInt(e.date.split('-')[2])));

  const categoryCounts = CATEGORIES.map(c => ({
    name: c,
    count: entries.filter(e => e.category === c).length,
    color: CATEGORY_COLORS[c],
  }));

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="text-primary" size={28} />
              Learning Journal
            </h1>
            <p className="text-text-muted text-sm mt-1">{entries.length} entries · Keep growing!</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="gradient-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus size={16} /> Add Note
          </motion.button>
        </div>
      </FadeIn>

      {/* Search & Filter */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-surface-light border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterCat('')}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                !filterCat ? 'bg-primary/20 text-primary' : 'glass-light text-text-muted'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filterCat === cat ? 'text-white' : 'glass-light text-text-muted'
                }`}
                style={filterCat === cat ? { background: CATEGORY_COLORS[cat] + '30', color: CATEGORY_COLORS[cat] } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entries List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <FadeIn delay={0.2}>
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-4xl mb-3">📝</p>
                <p className="text-text-muted text-sm">No entries yet. Start learning!</p>
              </div>
            </FadeIn>
          ) : (
            [...filtered].reverse().map((entry, i) => (
              <FadeIn key={entry.id} delay={0.15 + i * 0.03}>
                <div className="glass rounded-2xl p-5 card-hover group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm">{entry.topic}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ background: CATEGORY_COLORS[entry.category] + '20', color: CATEGORY_COLORS[entry.category] }}>
                          {entry.category}
                        </span>
                        <span className="text-[10px] text-text-muted flex items-center gap-1">
                          <Calendar size={10} /> {entry.date}
                        </span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-text-muted hover:text-white transition-colors p-1"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-text-muted hover:text-danger transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {entry.notes.length > 0 && (
                    <ul className="space-y-1.5">
                      {entry.notes.map((note, ni) => (
                        <li key={ni} className="flex items-start gap-2 text-xs text-text-secondary">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </FadeIn>
            ))
          )}
        </div>

        {/* Sidebar: Calendar + Stats */}
        <div className="space-y-4">
          {/* Mini Calendar */}
          <FadeIn delay={0.2}>
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setCurrentMonth(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <p className="text-xs font-semibold">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <button onClick={() => setCurrentMonth(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <span key={i} className="text-[10px] text-text-muted py-1">{d}</span>
                ))}
                {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                  <div
                    key={day}
                    className={`text-[10px] py-1 rounded-md transition-colors ${
                      entryDates.has(day)
                        ? 'bg-primary/30 text-primary font-bold'
                        : 'text-text-muted'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Category Stats */}
          <FadeIn delay={0.3}>
            <div className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                <Tag size={12} className="text-primary" /> Categories
              </h3>
              <div className="space-y-2">
                {categoryCounts.map(cat => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                    <span className="text-xs text-text-secondary flex-1">{cat.name}</span>
                    <span className="text-xs font-bold">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">{editingId ? 'Edit Note' : 'Add Learning Note'}</h3>
                <button onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setTopic('');
                  setNotes('');
                  setSelectedDate(new Date().toISOString().slice(0, 10));
                }} className="text-text-muted hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="mb-3">
                <label className="text-xs text-text-muted mb-1 block">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="mb-3">
                <label className="text-xs text-text-muted mb-1 block">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="AI Prompt Engineering"
                  className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="mb-3">
                <label className="text-xs text-text-muted mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        category === cat ? 'text-white' : 'glass-light text-text-muted'
                      }`}
                      style={category === cat ? { background: CATEGORY_COLORS[cat] + '40', color: CATEGORY_COLORS[cat] } : {}}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs text-text-muted mb-1 block">Notes (one per line)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={"Prompt Optimization\nLanding Page Creation\nAutomation Concepts"}
                  rows={4}
                  className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                className="w-full gradient-primary text-white py-3 rounded-xl font-semibold text-sm shadow-lg"
              >
                {editingId ? 'Update Note' : 'Save Note'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
