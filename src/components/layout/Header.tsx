import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Play,
  Pause,
  Sun,
  Moon,
  ChevronRight,
  Flame,
  User as UserIcon,
  Cloud,
  RefreshCw,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useTimer } from '@/context/TimerContext';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/services/data-service';
import { Button } from '@/components/ui/button';
import { StudySpaceLogo } from '@/components/ui/StudySpaceLogo';
import { AuthModal } from '@/components/auth/AuthModal';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenQuickAdd: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenQuickAdd }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { status, remainingSeconds, mode, startTimer, pauseTimer } = useTimer();
  const { user, isDemoUser, signOut, syncNow } = useAuth();
  const profile = dataService.getProfile();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await syncNow();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2000);
    } finally {
      setIsSyncing(false);
    }
  };

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard', category: null };
    if (path.startsWith('/categories/')) {
      const catId = path.split('/categories/')[1];
      const cat = dataService.getCategoryById(catId);
      return { title: cat?.name || 'Category Details', category: 'Categories', parentUrl: '/categories' };
    }
    if (path === '/categories') return { title: 'Categories', category: null };
    if (path === '/roadmaps') return { title: 'Learning Roadmaps', category: null };
    if (path === '/subjects') return { title: 'Subjects & Courses', category: null };
    if (path === '/resources') return { title: 'Resource Library', category: null };
    if (path === '/projects') return { title: 'Projects', category: null };
    if (path === '/tasks') return { title: 'Tasks', category: null };
    if (path === '/goals') return { title: 'Goals & Targets', category: null };
    if (path === '/focus') return { title: 'Focus Room', category: null };
    if (path === '/calendar') return { title: 'Calendar', category: null };
    if (path === '/analytics') return { title: 'Analytics', category: null };
    if (path === '/notes') return { title: 'Notes', category: null };
    if (path === '/settings') return { title: 'Settings', category: null };
    return { title: 'StudySpace', category: null };
  };

  const pageInfo = getPageInfo();

  const formatTimerShort = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="sticky top-0 z-20 h-14 border-b border-border bg-main/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Title & Breadcrumbs */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link to="/" className="md:hidden shrink-0 hover:opacity-85 transition-opacity" title="StudySpace Home">
          <StudySpaceLogo size={28} showText={false} />
        </Link>
        {pageInfo.category && pageInfo.parentUrl && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to={pageInfo.parentUrl} className="hover:text-foreground transition-colors">
              {pageInfo.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        )}
        <h1 className="text-sm sm:text-base font-semibold text-foreground tracking-tight truncate m-0">
          {pageInfo.title}
        </h1>
      </div>

      {/* Center / Action Toolbar */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-card border border-border hover:border-border/80 text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-elevated rounded border border-border/60">
            ⌘K
          </kbd>
        </button>

        {/* Global Quick Add Button (shadcn Button with lime accent) */}
        <Button
          onClick={onOpenQuickAdd}
          size="sm"
          className="h-8 gap-1.5 px-3 bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48] shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">Quick Add</span>
        </Button>

        {/* Header Pomodoro Pill */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-card border border-border text-xs">
          <Link
            to="/focus"
            className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            <Flame className={`w-3.5 h-3.5 ${status === 'running' ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            <span>{formatTimerShort(remainingSeconds)}</span>
            <span className="text-[10px] text-muted-foreground font-sans uppercase">({mode === 'focus' ? 'Focus' : 'Break'})</span>
          </Link>
          {status === 'running' ? (
            <button
              onClick={pauseTimer}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors cursor-pointer"
              title="Pause timer"
            >
              <Pause className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors cursor-pointer"
              title="Start timer"
            >
              <Play className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-card border border-border/50 transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Cloud Login / Sync Action */}
        {isDemoUser ? (
          <Button
            onClick={() => setAuthModalOpen(true)}
            size="sm"
            className="h-8 gap-1.5 px-3 bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-xs shadow-xs"
          >
            <Cloud className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Log in to Save</span>
            <span className="sm:hidden">Log in</span>
          </Button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg bg-card border border-border hover:border-border/80 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full border border-border overflow-hidden bg-elevated flex items-center justify-center text-muted-foreground relative">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5" />
                )}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-card" />
              </div>
              <span className="hidden xl:inline text-xs font-semibold text-foreground max-w-[100px] truncate">
                {user?.email?.split('@')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#141820] border border-[#272E38] p-3 shadow-2xl z-50 space-y-3">
                <div className="px-1 py-1 border-b border-[#272E38]">
                  <span className="text-[10px] font-mono text-[#929BA8] uppercase tracking-wider block">Connected Account</span>
                  <span className="text-xs font-bold text-[#F3F5F7] truncate block">{user?.email}</span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cloud Sync Active
                  </span>
                </div>

                <Button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  size="sm"
                  variant="outline"
                  className="w-full justify-center gap-2 text-xs border-[#272E38] hover:border-[#D6FF62] text-[#F3F5F7]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#D6FF62] ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>
                    {isSyncing ? 'Syncing Workspace...' : syncSuccess ? 'Synced to Cloud!' : 'Sync All Data Now'}
                  </span>
                </Button>

                <div className="pt-1 border-t border-[#272E38] flex flex-col gap-1 text-xs">
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="px-2 py-1.5 rounded-lg text-[#929BA8] hover:text-[#F3F5F7] hover:bg-[#1A2029] transition-colors"
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Login & Cloud Save Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
};
