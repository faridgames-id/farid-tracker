'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronUp,
  UserPlus,
  Pencil,
  Check,
  Download,
  Upload,
  CloudUpload,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getProfile, saveProfile, getLevelInfo, LEVELS, loadFromSupabase, exportData, importData, syncToSupabase } from '@/lib/store';
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
  const [profile, setProfile] = useState<any>({ xp: 0, level: 1, name: 'Farid', title: 'Entrepreneur' });
  const [user, setUser] = useState<any>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Edit mode state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('Farid');
  const [editTitle, setEditTitle] = useState('Entrepreneur');

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    setEditName(p.name || 'Farid');
    setEditTitle(p.title || 'Entrepreneur');
    
    // Auth check
    if (pathname !== '/login') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          router.push('/login');
        } else {
          setUser(session.user);
          loadFromSupabase().then(updated => {
            if (updated) {
              window.location.reload();
            }
          });
        }
      });
    }
  }, [pathname, router]);

  const handleSaveName = () => {
    const newProfile = { ...profile, name: editName, title: editTitle };
    saveProfile(newProfile);
    setProfile(newProfile);
    setIsEditingName(false);
  };

  const levelInfo = getLevelInfo(profile.xp);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farid_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsProfileDropdownOpen(false);
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importData(content)) {
        window.location.reload();
      } else {
        alert("Failed to import data. Invalid file format.");
      }
    };
    reader.readAsText(file);
    setIsProfileDropdownOpen(false);
  };

  const handleSaveToCloud = async () => {
    setIsSyncing(true);
    await syncToSupabase();
    setIsSyncing(false);
    setIsProfileDropdownOpen(false);
    alert("Data successfully saved to cloud!");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear(); // Clear local data on logout for safety
    router.push('/login');
  };

  const handleSwitchAccount = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
  };

  if (pathname === '/login') return null;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-md object-cover" />
          <span className="font-bold text-lg text-gradient">{profile.name || 'Farid'}</span>
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
        <div className="px-6 mb-8 group relative">
          <div className="flex items-center gap-3 mb-1">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl shadow-lg object-cover" />
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-surface-hover/50 text-white text-sm font-bold rounded px-2 py-1 border border-border focus:border-primary outline-none w-full"
                    placeholder="Name"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-surface-hover/50 text-text-secondary text-[10px] uppercase tracking-wider rounded px-2 py-1 border border-border focus:border-primary outline-none flex-1"
                      placeholder="Title"
                    />
                    <button onClick={handleSaveName} className="p-1 rounded bg-primary/20 text-primary hover:bg-primary/40 transition-colors">
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div>
                    <h1 className="font-bold text-lg text-white leading-tight">{profile.name || 'Farid'}</h1>
                    <p className="text-[10px] text-text-secondary tracking-wider uppercase">{profile.title || 'Entrepreneur'}</p>
                  </div>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-all ml-auto"
                    title="Edit Name"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
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

        {/* User Profile Footer */}
        <div className="mt-auto px-4 pt-4 pb-6 border-t border-white/5 relative">
          <AnimatePresence>
            {isProfileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-4 right-4 mb-2 p-2 rounded-2xl glass border border-white/10 shadow-xl flex flex-col gap-1 z-50"
              >
                <button
                  onClick={handleSwitchAccount}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                >
                  <UserPlus size={16} />
                  Switch Account
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={handleSaveToCloud}
                  disabled={isSyncing}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-50"
                >
                  {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                  {isSyncing ? 'Saving...' : 'Save to Cloud'}
                </button>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Download size={16} />
                  Export Data
                </button>
                <button
                  onClick={handleImportData}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Upload size={16} />
                  Import Data
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json" 
                  onChange={handleFileChange} 
                />
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors"
          >
            {user?.user_metadata?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-bold text-white truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] font-medium mt-0.5">
                <svg viewBox="0 0 24 24" width="10" height="10" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-[#00d4ff]">Google Account</span>
              </div>
            </div>
            <div className="text-text-muted p-1">
              <ChevronUp size={16} className={`transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
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
