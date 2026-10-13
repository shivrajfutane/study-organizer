import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Plus,
  Calendar,
} from 'lucide-react';
import { dataService } from '@/services/data-service';
import { useTimer } from '@/context/TimerContext';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { CategoryGrid } from '@/components/dashboard/CategoryGrid';
import { TodayPlanWidget } from '@/components/dashboard/TodayPlanWidget';
import { PomodoroWidget } from '@/components/dashboard/PomodoroWidget';
import { MusicWidget } from '@/components/dashboard/MusicWidget';
import { RoadmapOverviewWidget } from '@/components/dashboard/RoadmapOverviewWidget';
import { GoalsWidget } from '@/components/dashboard/GoalsWidget';
import { ProjectsWidget } from '@/components/dashboard/ProjectsWidget';
import { ResourcePreviewWidget } from '@/components/dashboard/ResourcePreviewWidget';
import { ActivityAndChartsWidget } from '@/components/dashboard/ActivityAndChartsWidget';
import { QuickAddModal } from '@/components/layout/QuickAddModal';
import { Button } from '@/components/ui/button';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { startTimer } = useTimer();
  const [, setTick] = useState(0);
  const [quickAddModal, setQuickAddModal] = useState<{ isOpen: boolean; defaultTab?: any }>({
    isOpen: false,
  });

  // Re-render when data service changes
  useEffect(() => {
    const unsub = dataService.subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  const profile = dataService.getProfile();
  const stats = dataService.getOverallStats();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleStartSession = () => {
    startTimer();
    navigate('/focus');
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Welcome Banner & Command Actions */}
      <div className="rounded-lg bg-card border border-border p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{todayDateFormatted}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight m-0">
              {getGreeting()}, {profile.full_name || 'Student'}
            </h1>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed m-0">
              {stats.focusMinutesToday === 0 ? (
                <>0 tracked hours today. Start a focus session to build your study habit.</>
              ) : (
                <>
                  You've logged <span className="text-primary font-semibold font-mono">{stats.focusMinutesToday}m</span> of deep focus today.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={() => setQuickAddModal({ isOpen: true, defaultTab: 'task' })}
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs border-border hover:border-primary/50 text-foreground"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Quick Add</span>
            </Button>

            <Button
              onClick={handleStartSession}
              size="sm"
              className="h-8 gap-1.5 text-xs bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48] shadow-xs"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Start Focus Session</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Strip */}
      <DashboardStats />

      {/* Categories & Learning Domains */}
      <CategoryGrid
        onOpenAddCategory={() => setQuickAddModal({ isOpen: true, defaultTab: 'category' })}
        onOpenQuickAddWithCat={(catId, tab) => setQuickAddModal({ isOpen: true, defaultTab: tab })}
      />

      {/* Daily Focus Workflow & Audio Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TodayPlanWidget onOpenQuickAddTask={() => setQuickAddModal({ isOpen: true, defaultTab: 'task' })} />
        </div>
        <div className="space-y-4">
          <PomodoroWidget />
          <MusicWidget />
        </div>
      </div>

      {/* Curriculum Roadmaps & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RoadmapOverviewWidget />
        <ProjectsWidget />
      </div>

      {/* Goals & Resource Library Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GoalsWidget onOpenQuickAddGoal={() => setQuickAddModal({ isOpen: true, defaultTab: 'goal' })} />
        <ResourcePreviewWidget />
      </div>

      {/* Analytics & Chronological Event Feeds */}
      <ActivityAndChartsWidget />

      {/* Quick Add Universal Modal */}
      {quickAddModal.isOpen && (
        <QuickAddModal
          isOpen={quickAddModal.isOpen}
          onClose={() => setQuickAddModal({ isOpen: false })}
          defaultTab={quickAddModal.defaultTab}
        />
      )}
    </div>
  );
};
