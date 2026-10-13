import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  PieChart as PieIcon,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { dataService } from '@/services/data-service';
import { formatMinutes } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';

export const AnalyticsPage: React.FC = () => {
  const [, setTick] = useState(0);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('7');

  useEffect(() => {
    return dataService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const overall = dataService.getOverallStats();
  const categories = dataService.getCategories();
  const sessions = dataService.getStudySessions({ days: Number(dateRange) });

  // 1. Daily Study Focus (last 7 or 14 days)
  const numDays = Number(dateRange) === 7 ? 7 : 14;
  const dailyFocusData = Array.from({ length: numDays }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (numDays - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    let mins = 0;
    sessions.forEach((s) => {
      if (s.started_at.startsWith(dateStr) && s.is_completed) {
        mins += s.duration_minutes;
      }
    });

    return {
      date: dayLabel,
      minutes: mins,
      hours: Math.round((mins / 60) * 10) / 10,
    };
  });

  // 2. Study Distribution by Category
  const categoryDistributionData = categories
    .map((c) => {
      const hours = dataService.getCategoryStudyHours(c.id).totalHours;
      return {
        name: c.name,
        value: hours,
        color: c.color,
      };
    })
    .filter((c) => c.value > 0);

  // 3. Category Topic Completion Comparison
  const categoryTopicData = categories.map((c) => {
    const stats = dataService.getCategoryTopicStats(c.id);
    return {
      category: c.name,
      completed: stats.completedTopics,
      total: stats.totalTopics,
      percentage: stats.progressPercentage,
      color: c.color,
    };
  });

  // Calculate average session length
  const totalSessionMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const avgSessionLength = sessions.length > 0 ? Math.round(totalSessionMinutes / sessions.length) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F3F5F7] tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#D6FF62]" />
            Study Analytics & Productivity Insights
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real performance telemetry calculated strictly from your study logs and topic achievements.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-[#141820] border border-[#272E38] rounded-xl p-1 text-xs">
          <button
            onClick={() => setDateRange('7')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              dateRange === '7' ? 'bg-[#D6FF62] text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange('30')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              dateRange === '30' ? 'bg-[#D6FF62] text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange('90')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              dateRange === '90' ? 'bg-[#D6FF62] text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Quarter
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#141820] border border-[#272E38] space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Study Streak</span>
          <div className="text-2xl font-black text-amber-400 flex items-center gap-1.5">
            <Flame className="w-6 h-6" />
            <span>{overall.currentStreak} Days</span>
          </div>
          <span className="text-[11px] text-zinc-500">Consistent daily study</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141820] border border-[#272E38] space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Focus This Range</span>
          <div className="text-2xl font-black text-[#F3F5F7] font-mono">
            {formatMinutes(totalSessionMinutes)}
          </div>
          <span className="text-[11px] text-zinc-500">{sessions.length} sessions finished</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141820] border border-[#272E38] space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Avg Session Length</span>
          <div className="text-2xl font-black text-[#63D6C5] font-mono">{avgSessionLength} mins</div>
          <span className="text-[11px] text-zinc-500">Deep concentration blocks</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141820] border border-[#272E38] space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Unique Topics Mastered</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {overall.completedTopics} / {overall.totalTopics}
          </div>
          <span className="text-[11px] text-zinc-500">{overall.overallLearningProgress}% syllabus completion</span>
        </div>
      </div>

      {/* Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Focus Bar Chart (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-[#141820] border border-[#272E38] p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-bold text-[#F3F5F7] text-base tracking-tight">Daily Focus Minutes Trend</h3>
            <p className="text-xs text-zinc-400">Total deep focus minutes recorded per day</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyFocusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D6FF62" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#D6FF62" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141820',
                    borderColor: '#272E38',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="minutes" stroke="#D6FF62" strokeWidth={2.5} fill="url(#focusGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Distribution Donut Chart (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#141820] border border-[#272E38] p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#F3F5F7] text-base tracking-tight">Time by Domain</h3>
            <p className="text-xs text-zinc-400">Proportional hours across top categories</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {categoryDistributionData.length === 0 ? (
              <div className="text-xs text-zinc-500">No session hours recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistributionData}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141820',
                      borderColor: '#272E38',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {categoryDistributionData.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 truncate text-zinc-300">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="truncate">{c.name}</span>
                </span>
                <span className="font-mono text-zinc-400 font-bold">{c.value}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Topic Completion Comparison */}
      <div className="rounded-3xl bg-[#141820] border border-[#272E38] p-6 shadow-xl space-y-4">
        <div>
          <h3 className="font-bold text-[#F3F5F7] text-base tracking-tight">Topic Completion by Category</h3>
          <p className="text-xs text-zinc-400">Completed topics vs total curriculum scope</p>
        </div>

        {categoryTopicData.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            No categories available to display topic completion metrics.
          </div>
        ) : (
          <div className="space-y-4">
            {categoryTopicData.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{item.category}</span>
                  <span className="font-mono text-zinc-400">
                    {item.completed} / {item.total} topics ({item.percentage}%)
                  </span>
                </div>
                <ProgressBar value={item.percentage} color={item.color || '#D6FF62'} size="md" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
