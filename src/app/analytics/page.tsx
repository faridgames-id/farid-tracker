'use client';

import { useEffect, useState } from 'react';
import { FadeIn } from '@/components/ui';
import {
  getAllHabits,
  getTransactions,
  getLearningEntries,
  getSavings,
  getWorkoutsForWeek,
  getWeekKey,
  formatCurrency,
} from '@/lib/store';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart as RPie, Pie, Cell,
  ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const COLORS = ['#2563EB', '#FBBF24', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [habitData, setHabitData] = useState<{ day: string; percent: number }[]>([]);
  const [incomeData, setIncomeData] = useState<{ month: string; income: number; expense: number }[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [learningData, setLearningData] = useState<{ category: string; count: number }[]>([]);
  const [savingData, setSavingData] = useState<{ month: string; invest: number; save: number }[]>([]);
  const [gymData, setGymData] = useState<{ day: string; completed: number }[]>([]);

  useEffect(() => {
    setMounted(true);

    // Habits - last 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const allHabits = getAllHabits();
    const hd = days.map((day, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const h = allHabits[key];
      if (!h) return { day, percent: 0 };
      const all = [...h.morning, ...h.afternoon, ...h.night];
      const comp = all.filter(x => x.completed).length;
      return { day, percent: all.length > 0 ? Math.round((comp / all.length) * 100) : 0 };
    });
    setHabitData(hd);

    // Income - last 6 months
    const transactions = getTransactions();
    const months: { month: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mLabel = d.toLocaleDateString('en-US', { month: 'short' });
      const inc = transactions.filter(t => t.type === 'income' && t.date.startsWith(mk)).reduce((s, t) => s + t.amount, 0);
      const exp = transactions.filter(t => t.type === 'expense' && t.date.startsWith(mk)).reduce((s, t) => s + t.amount, 0);
      months.push({ month: mLabel, income: inc, expense: exp });
    }
    setIncomeData(months);

    // Expense breakdown
    const expenseTx = transactions.filter(t => t.type === 'expense');
    const catMap: Record<string, number> = {};
    expenseTx.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
    setExpenseBreakdown(Object.entries(catMap).map(([name, value]) => ({ name, value })));

    // Learning
    const learn = getLearningEntries();
    const lcMap: Record<string, number> = {};
    learn.forEach(l => { lcMap[l.category] = (lcMap[l.category] || 0) + 1; });
    setLearningData(Object.entries(lcMap).map(([category, count]) => ({ category, count })));

    // Savings - last 4 months
    const savings = getSavings();
    const sv: { month: string; invest: number; save: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mLabel = d.toLocaleDateString('en-US', { month: 'short' });
      const s = savings[mk];
      sv.push({
        month: mLabel,
        invest: s ? s.weeks.reduce((a, w) => a + w.investAmount, 0) : 0,
        save: s ? s.weeks.reduce((a, w) => a + w.saveAmount, 0) : 0,
      });
    }
    setSavingData(sv);

    // Gym - this week
    const workouts = getWorkoutsForWeek(getWeekKey());
    setGymData(workouts.map(w => ({ day: w.day.slice(0, 3), completed: w.completed ? 1 : 0 })));
  }, []);

  if (!mounted) return <div className="space-y-6">{[1, 2, 3].map(i => <div key={i} className="skeleton rounded-2xl h-64" />)}</div>;

  const customTooltipStyle = {
    contentStyle: {
      background: 'rgba(30, 41, 59, 0.95)',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      borderRadius: '12px',
      fontSize: '12px',
      color: '#f8fafc',
    },
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="text-primary" size={28} />
          Analytics
        </h1>
        <p className="text-text-muted text-sm mt-1">Visual overview of your progress</p>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Completion Curve */}
        <FadeIn delay={0.1}>
          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" /> Habit Completion (7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={habitData}>
                <defs>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip {...customTooltipStyle} />
                <Area type="monotone" dataKey="percent" stroke="#2563EB" strokeWidth={2} fill="url(#gradBlue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        {/* Income Growth */}
        <FadeIn delay={0.15}>
          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-success" /> Income vs Expense (6 Months)
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        {/* Expense Breakdown Pie */}
        <FadeIn delay={0.2}>
          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <PieChart size={16} className="text-warning" /> Expense Breakdown
            </h2>
            {expenseBreakdown.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-12">No expense data yet</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <RPie>
                    <Pie
                      data={expenseBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {expenseBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...customTooltipStyle} />
                  </RPie>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {expenseBreakdown.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-text-secondary">{item.name}</span>
                      <span className="text-xs font-bold ml-auto">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Learning Progress */}
        <FadeIn delay={0.25}>
          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-400" /> Learning Distribution
            </h2>
            {learningData.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-12">No learning data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={learningData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip {...customTooltipStyle} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </FadeIn>

        {/* Saving Progress */}
        <FadeIn delay={0.3}>
          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-gold" /> Saving Progress (4 Months)
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={savingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Bar dataKey="invest" fill="#FBBF24" radius={[4, 4, 0, 0]} name="Investasi" />
                <Bar dataKey="save" fill="#10b981" radius={[4, 4, 0, 0]} name="Tabungan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        {/* Gym Consistency */}
        <FadeIn delay={0.35}>
          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-danger" /> Gym Consistency (This Week)
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {gymData.map((d, i) => (
                <div key={d.day} className="text-center">
                  <p className="text-[10px] text-text-muted mb-2">{d.day}</p>
                  <div
                    className={`w-full aspect-square rounded-xl flex items-center justify-center text-lg transition-all ${
                      d.completed ? 'bg-success/20 border border-success/30' : 'bg-white/5'
                    }`}
                  >
                    {d.completed ? '✅' : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
