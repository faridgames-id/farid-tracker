'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/ui';
import {
  getSavingsForMonth,
  saveSavingsForMonth,
  getMonthKey,
  formatCurrency,
  addXP,
  MonthlySaving,
} from '@/lib/store';
import { Wallet, ChevronLeft, ChevronRight, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKLY_TARGET = 100000; // 100k per week
const MONTHLY_TARGET = WEEKLY_TARGET * 4; // 400k per month

export default function SavingsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<MonthlySaving | null>(null);

  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setData(getSavingsForMonth(monthKey));
    }
  }, [monthKey, mounted]);

  const navigateMonth = (dir: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + dir);
    if (d.getFullYear() > 2027) return;
    setCurrentDate(d);
  };

  const handleWeekInput = (weekIdx: number, field: 'investAmount' | 'saveAmount') => {
    if (!data) return;
    const label = field === 'investAmount' ? 'Investasi (Bitcoin)' : 'Tabungan (Sea Bank)';
    const current = data.weeks[weekIdx][field];
    const input = prompt(`Masukkan nominal ${label} Minggu ${weekIdx + 1}:`, String(current || ''));
    if (input === null) return;
    const amount = parseInt(input.replace(/[^0-9]/g, '')) || 0;

    const updated = { ...data, weeks: [...data.weeks] };
    updated.weeks[weekIdx] = { ...updated.weeks[weekIdx], [field]: amount };

    // Check if week completed (invest + save >= 100k each)
    const week = updated.weeks[weekIdx];
    if (week.investAmount >= WEEKLY_TARGET && week.saveAmount >= WEEKLY_TARGET && !week.completed) {
      updated.weeks[weekIdx].completed = true;
      addXP(25);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    }

    saveSavingsForMonth(updated);
    setData(updated);
    addXP(5);
  };

  if (!mounted || !data) return <div className="skeleton rounded-2xl h-96" />;

  const totalInvest = data.weeks.reduce((s, w) => s + w.investAmount, 0);
  const totalSave = data.weeks.reduce((s, w) => s + w.saveAmount, 0);
  const totalAll = totalInvest + totalSave;
  const investPercent = Math.min(100, (totalInvest / MONTHLY_TARGET) * 100);
  const savePercent = Math.min(100, (totalSave / MONTHLY_TARGET) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="text-primary" size={28} />
              Savings & Investment
            </h1>
            <p className="text-text-muted text-sm mt-1">Minimum Rp100,000 per week</p>
          </div>
        </div>
      </FadeIn>

      {/* Month Navigation */}
      <FadeIn delay={0.1}>
        <div className="glass rounded-2xl p-4 flex items-center justify-between">
          <button onClick={() => navigateMonth(-1)} className="p-2 rounded-xl glass-light hover:bg-white/10 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="font-bold text-lg">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
            <p className="text-xs text-text-muted">Target: {formatCurrency(MONTHLY_TARGET * 2)}</p>
          </div>
          <button onClick={() => navigateMonth(1)} className="p-2 rounded-xl glass-light hover:bg-white/10 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </FadeIn>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <FadeIn delay={0.15}>
          <div className="glass rounded-2xl p-4 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-gold/10 rounded-bl-full" />
            <p className="text-2xl mb-1">₿</p>
            <p className="text-xs text-text-muted mb-1">Investasi</p>
            <p className="text-lg font-bold text-gold">{formatCurrency(totalInvest)}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="glass rounded-2xl p-4 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-success/10 rounded-bl-full" />
            <p className="text-2xl mb-1">🏦</p>
            <p className="text-xs text-text-muted mb-1">Tabungan</p>
            <p className="text-lg font-bold text-success">{formatCurrency(totalSave)}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.25}>
          <div className="glass rounded-2xl p-4 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-bl-full" />
            <p className="text-2xl mb-1">💎</p>
            <p className="text-xs text-text-muted mb-1">Total</p>
            <p className="text-lg font-bold text-primary-light">{formatCurrency(totalAll)}</p>
          </div>
        </FadeIn>
      </div>

      {/* Progress Bars */}
      <FadeIn delay={0.3}>
        <div className="glass rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Target size={16} className="text-primary" />
            Monthly Progress
          </h2>
          <ProgressBar label="Investasi (Bitcoin)" progress={investPercent} color="#FBBF24" value={formatCurrency(totalInvest)} target={formatCurrency(MONTHLY_TARGET)} />
          <ProgressBar label="Tabungan (Sea Bank)" progress={savePercent} color="#10b981" value={formatCurrency(totalSave)} target={formatCurrency(MONTHLY_TARGET)} />
        </div>
      </FadeIn>

      {/* Weekly Tracker */}
      <FadeIn delay={0.35}>
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-gold" />
            Weekly Breakdown
          </h2>
          <div className="space-y-3">
            {data.weeks.map((week, i) => {
              const weekTotal = week.investAmount + week.saveAmount;
              const weekPercent = Math.min(100, (weekTotal / (WEEKLY_TARGET * 2)) * 100);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`glass-light rounded-xl p-4 ${week.completed ? 'border border-success/30' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {week.completed ? (
                        <CheckCircle2 size={16} className="text-success" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-border" />
                      )}
                      <span className="text-sm font-semibold">Minggu {i + 1}</span>
                    </div>
                    <span className="text-xs text-text-muted">{Math.round(weekPercent)}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleWeekInput(i, 'investAmount')}
                      className={`p-3 rounded-lg text-left transition-all hover:bg-white/10 ${
                        week.investAmount > 0 ? 'bg-gold/10 border border-gold/20' : 'bg-white/5'
                      }`}
                    >
                      <p className="text-[10px] text-text-muted mb-0.5">₿ Bitcoin</p>
                      <p className={`text-sm font-bold ${week.investAmount >= WEEKLY_TARGET ? 'text-gold' : ''}`}>
                        {week.investAmount > 0 ? formatCurrency(week.investAmount) : 'Tap to add'}
                      </p>
                    </button>
                    <button
                      onClick={() => handleWeekInput(i, 'saveAmount')}
                      className={`p-3 rounded-lg text-left transition-all hover:bg-white/10 ${
                        week.saveAmount > 0 ? 'bg-success/10 border border-success/20' : 'bg-white/5'
                      }`}
                    >
                      <p className="text-[10px] text-text-muted mb-0.5">🏦 Sea Bank</p>
                      <p className={`text-sm font-bold ${week.saveAmount >= WEEKLY_TARGET ? 'text-success' : ''}`}>
                        {week.saveAmount > 0 ? formatCurrency(week.saveAmount) : 'Tap to add'}
                      </p>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

function ProgressBar({ label, progress, color, value, target }: { label: string; progress: number; color: string; value: string; target: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-secondary font-medium">{label}</span>
        <span className="text-xs text-text-muted">{value} / {target}</span>
      </div>
      <div className="w-full h-2.5 bg-surface-hover rounded-full overflow-hidden">
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
