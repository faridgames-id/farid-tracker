'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/ui';
import {
  getTransactions,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  formatCurrency,
  addXP,
  Transaction,
} from '@/lib/store';
import { DollarSign, Plus, Trash2, Edit2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar, X } from 'lucide-react';

export default function FinancePage() {
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setTransactions(getTransactions());
  }, []);

  const handleAdd = () => {
    if (!amount || !desc) return;
    const t: Transaction = {
      id: editingId || Date.now().toString(),
      date: selectedDate, // Use selected date instead of strictly today
      type: formType,
      amount: parseInt(amount.replace(/[^0-9]/g, '')) || 0,
      description: desc,
      category: category || (formType === 'income' ? 'Sales' : 'Other'),
    };
    
    if (editingId) {
      updateTransaction(t);
    } else {
      saveTransaction(t);
      if (formType === 'income') addXP(15);
    }
    
    setTransactions(getTransactions());
    setAmount('');
    setDesc('');
    setCategory('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (t: Transaction) => {
    setFormType(t.type);
    setAmount(t.amount.toString());
    setDesc(t.description);
    setCategory(t.category);
    setSelectedDate(t.date);
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setTransactions(getTransactions());
  };

  if (!mounted) return <div className="skeleton rounded-2xl h-96" />;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthTx = transactions.filter(t => t.date.startsWith(monthKey));
  const totalIncome = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const profit = totalIncome - totalExpense;

  const dayTx = transactions.filter(t => t.date === selectedDate);

  const incomeCategories = ['Sales', 'Service', 'Commission', 'Investment', 'Other'];
  const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Other'];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="text-primary" size={28} />
              Income & Expenses
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="gradient-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus size={16} /> Add
          </motion.button>
        </div>
      </FadeIn>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <FadeIn delay={0.1}>
          <div className="glass rounded-2xl p-4 text-center">
            <ArrowUpRight size={18} className="text-success mx-auto mb-1" />
            <p className="text-xs text-text-muted mb-1">Income</p>
            <p className="text-lg font-bold text-success">{formatCurrency(totalIncome)}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="glass rounded-2xl p-4 text-center">
            <ArrowDownRight size={18} className="text-danger mx-auto mb-1" />
            <p className="text-xs text-text-muted mb-1">Expenses</p>
            <p className="text-lg font-bold text-danger">{formatCurrency(totalExpense)}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="glass rounded-2xl p-4 text-center">
            <TrendingUp size={18} className={`mx-auto mb-1 ${profit >= 0 ? 'text-success' : 'text-danger'}`} />
            <p className="text-xs text-text-muted mb-1">Profit</p>
            <p className={`text-lg font-bold ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
              {profit >= 0 ? '+' : '-'}{formatCurrency(profit)}
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Today's Transactions */}
      <FadeIn delay={0.25}>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              Daily Tracker
            </h2>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-surface-light border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary text-text transition-colors"
            />
          </div>
          {dayTx.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">No transactions on this date.</p>
          ) : (
            <div className="space-y-2">
              {dayTx.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 glass-light rounded-xl group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                    t.type === 'income' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.description}</p>
                    <p className="text-[10px] text-text-muted">{t.category}</p>
                  </div>
                  <p className={`text-sm font-bold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all flex items-center">
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-text-muted hover:text-white transition-colors p-1"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-text-muted hover:text-danger transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {/* Monthly Transactions */}
      <FadeIn delay={0.3}>
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4">Monthly History</h2>
          {monthTx.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-4">No transactions this month.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {[...monthTx].reverse().map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                    t.type === 'income' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                  }`}>
                    {t.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{t.description}</p>
                    <p className="text-[10px] text-text-muted">{t.date} · {t.category}</p>
                  </div>
                  <p className={`text-xs font-bold ${t.type === 'income' ? 'text-success' : 'text-danger'} mr-2`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <div className="flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                    <button onClick={() => handleEdit(t)} className="text-text-muted hover:text-white p-1">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-text-muted hover:text-danger p-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

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
                <h3 className="font-bold text-lg">{editingId ? 'Edit Transaction' : 'Add Transaction'}</h3>
                <button onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setAmount('');
                  setDesc('');
                }} className="text-text-muted hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              {/* Type Toggle */}
              <div className="flex gap-2 mb-4">
                {(['income', 'expense'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFormType(type)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      formType === type
                        ? type === 'income'
                          ? 'bg-success/20 text-success border border-success/30'
                          : 'bg-danger/20 text-danger border border-danger/30'
                        : 'glass-light text-text-muted'
                    }`}
                  >
                    {type === 'income' ? '↑ Income' : '↓ Expense'}
                  </button>
                ))}
              </div>

              {/* Date */}
              <div className="mb-3">
                <label className="text-xs text-text-muted mb-1 block">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Amount */}
              <div className="mb-3">
                <label className="text-xs text-text-muted mb-1 block">Amount (Rp)</label>
                <input
                  type="text"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="150000"
                  className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="text-xs text-text-muted mb-1 block">Description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Account Sales"
                  className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="text-xs text-text-muted mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {(formType === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        category === cat
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'glass-light text-text-muted hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                className="w-full gradient-primary text-white py-3 rounded-xl font-semibold text-sm shadow-lg"
              >
                {editingId ? 'Update Transaction' : 'Save Transaction'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
