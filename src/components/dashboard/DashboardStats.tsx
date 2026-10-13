import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree,
  TrendingUp,
  Map,
  Briefcase,
  CheckSquare,
  Target,
  Clock,
  Flame,
} from 'lucide-react';
import { dataService } from '@/services/data-service';

export const DashboardStats: React.FC = () => {
  const stats = dataService.getOverallStats();
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Focus Today',
      value: stats.focusMinutesToday > 0 ? `${stats.focusMinutesToday}m` : '0m',
      subtext: stats.studyHoursThisWeek > 0 ? `${stats.studyHoursThisWeek}h this week` : '0h this week',
      icon: Clock,
      highlight: true,
      path: '/focus',
    },
    {
      title: 'Study Streak',
      value: `${stats.currentStreak} Days`,
      subtext: stats.currentStreak > 0 ? 'Consecutive focus' : 'No active streak',
      icon: Flame,
      highlight: stats.currentStreak > 0,
      path: '/analytics',
    },
    {
      title: 'Learning Progress',
      value: `${stats.overallLearningProgress}%`,
      subtext: `${stats.completedTopics}/${stats.totalTopics} topics`,
      icon: TrendingUp,
      highlight: false,
      path: '/subjects',
    },
    {
      title: 'Categories',
      value: stats.activeCategoriesCount,
      subtext: `${stats.activeSubjectsCount} subjects`,
      icon: FolderTree,
      highlight: false,
      path: '/categories',
    },
    {
      title: 'Roadmaps',
      value: stats.activeRoadmaps,
      subtext: 'Curricula tracked',
      icon: Map,
      highlight: false,
      path: '/roadmaps',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      subtext: 'In progress',
      icon: Briefcase,
      highlight: false,
      path: '/projects',
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      subtext: `${stats.completedTasks} completed`,
      icon: CheckSquare,
      highlight: false,
      path: '/tasks',
    },
    {
      title: 'Active Goals',
      value: stats.activeGoals,
      subtext: 'Milestones set',
      icon: Target,
      highlight: false,
      path: '/goals',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
      {cards.map((c) => (
        <div
          key={c.title}
          onClick={() => navigate(c.path)}
          className="group relative rounded-md bg-card border border-border p-3 hover:border-primary/50 hover:bg-elevated transition-colors cursor-pointer shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-muted-foreground truncate">{c.title}</span>
            <div className="p-1 rounded bg-elevated border border-border/50 text-muted-foreground group-hover:text-primary transition-colors">
              <c.icon className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className={`font-mono text-lg font-bold tracking-tight ${c.highlight ? 'text-primary' : 'text-foreground'}`}>
              {c.value}
            </div>
            <div className="text-[10px] text-muted-foreground truncate mt-0.5 font-mono">
              {c.subtext}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
