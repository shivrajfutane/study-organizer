import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Map,
  BookOpen,
  Library,
  Briefcase,
  CheckSquare,
  Target,
  Sparkles,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimer } from '@/context/TimerContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { status, remainingSeconds, mode } = useTimer();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Categories', path: '/categories', icon: FolderTree },
    { name: 'Roadmaps', path: '/roadmaps', icon: Map },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Resources', path: '/resources', icon: Library },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Focus Room', path: '/focus', icon: Sparkles },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const formatTimerShort = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col border-r border-border bg-sidebar h-screen sticky top-0 transition-all duration-200 z-30 select-none text-foreground',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3.5 h-14 border-b border-border">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
            <span className="font-mono font-bold text-sm text-primary tracking-tighter">S*</span>
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-foreground">
                StudySpace
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-elevated text-primary border border-border font-medium">
                v2
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors group relative cursor-pointer',
                isActive
                  ? 'bg-elevated text-foreground font-semibold border border-border shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-elevated/60'
              )
            }
            title={isCollapsed ? item.name : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}

                {/* Focus mode live pulsing badge */}
                {item.name === 'Focus Room' && status === 'running' && (
                  <span
                    className={cn(
                      'ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1.5 border',
                      isCollapsed ? 'absolute -top-1 -right-1 p-1' : '',
                      mode === 'focus'
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-accent/10 text-accent border-accent/30'
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {!isCollapsed && formatTimerShort(remainingSeconds)}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Active Session Footer Card */}
      {!isCollapsed && status !== 'idle' && (
        <div className="p-3 mx-2 mb-3 rounded-lg bg-card border border-border text-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="flex items-center gap-1.5 font-medium uppercase text-[10px] tracking-wider text-primary">
              <Flame className="w-3 h-3 text-primary" />
              {mode === 'focus' ? 'Focus Session' : 'Rest Break'}
            </span>
            <span className="font-mono text-foreground font-semibold">{formatTimerShort(remainingSeconds)}</span>
          </div>
          <NavLink
            to="/focus"
            className="block text-center mt-2 py-1 bg-elevated hover:bg-elevated/80 text-foreground rounded text-[11px] font-medium transition-colors border border-border hover:border-primary/40"
          >
            Open Focus Room
          </NavLink>
        </div>
      )}
    </aside>
  );
};
