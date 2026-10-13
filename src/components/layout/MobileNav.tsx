import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderTree, BookOpen, Sparkles, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimer } from '@/context/TimerContext';

export const MobileNav: React.FC = () => {
  const { status, mode } = useTimer();

  const links = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Categories', path: '/categories', icon: FolderTree },
    { name: 'Focus', path: '/focus', icon: Sparkles, highlight: true },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0D10]/95 backdrop-blur-lg border-t border-[#272E38] px-2 py-1.5 flex items-center justify-around">
      {links.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-medium transition-colors relative',
              isActive ? 'text-[#D6FF62] font-semibold' : 'text-zinc-400 hover:text-zinc-200',
              item.highlight ? 'text-[#D6FF62]' : ''
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <item.icon className={cn('w-5 h-5 mb-0.5', isActive ? 'text-[#D6FF62]' : 'text-zinc-400')} />
                {item.name === 'Focus' && status === 'running' && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-[#0B0D10] animate-ping',
                      mode === 'focus' ? 'bg-[#D6FF62]' : 'bg-[#63D6C5]'
                    )}
                  />
                )}
              </div>
              <span>{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
