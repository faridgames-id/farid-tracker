'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  Dumbbell,
  BookOpen,
  DollarSign,
  BarChart3,
  Crown,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getProfile, getLevelInfo, LEVELS } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/finance', label: 'Finance', icon: DollarSign },
  { href: '/savings', label: 'Savings', icon: Wallet },
  { href: '/gym', label: 'Gym', icon: Dumbbell },
  { href: '/learning', label: 'Learning', icon: BookOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState({ xp: 0, level: 1 });

  useEffect(() => {
    const p = getProfile();
    setProfile({ xp: p.xp, level: p.level });
    
    // Auth check
    if (pathname !== '/login') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          router.push('/login');
        }
      });
    }
  }, [pathname, router]);

  const levelInfo = getLevelInfo(profile.xp);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear(); // Clear local data on logout for safety
    router.push('/login');
  };

  if (pathname === '/login') return null;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <span className="font-bold text-lg text-gradient">Farid</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl glass-light hover:bg-white/10 transition-colors"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-full z-50 w-[260px] glass flex flex-col py-6 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-xl shadow-lg">
              🚀
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">Farid</h1>
              <p className="text-[10px] text-text-secondary tracking-wider uppercase">Entrepreneur</p>
            </div>
          </div>
        </div>

        {/* Level Badge */}
        <div className="px-4 mb-6">
          <div className="glass-light rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={14} className="text-gold" />
              <span className="text-xs font-semibold text-gold">{levelInfo.current.emoji} {levelInfo.current.name}</span>
              <span className="text-[10px] text-text-muted ml-auto">Lv.{levelInfo.current.level}</span>
            </div>
            <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full gradient-gold"
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progressToNext}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-text-muted mt-1">{profile.xp} / {levelInfo.next.minXP} XP</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'text-white bg-primary/20'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon size={18} className={isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 pt-4 border-t border-border flex items-center justify-between">
          <p className="text-[10px] text-text-muted">
            Build Your Future 🌟
          </p>
          <button onClick={handleLogout} className="text-text-muted hover:text-danger p-2 rounded-lg hover:bg-white/5 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${
                  isActive ? 'text-primary' : 'text-text-muted'
                }`}
              >
                <item.icon size={18} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
