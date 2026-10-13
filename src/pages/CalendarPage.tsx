import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
  Target,
  Briefcase,
  Flame,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { dataService } from '@/services/data-service';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';

export const CalendarPage: React.FC = () => {
  const [, setTick] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedEventModal, setSelectedEventModal] = useState<any>(null);

  useEffect(() => {
    return dataService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const tasks = dataService.getTasks();
  const goals = dataService.getGoals();
  const projects = dataService.getProjects();
  const sessions = dataService.getStudySessions();

  // Map events for selected day
  const selectedDayStr = format(selectedDay, 'yyyy-MM-dd');

  const dayTasks = tasks.filter((t) => t.due_date === selectedDayStr);
  const dayGoals = goals.filter((g) => g.target_date === selectedDayStr);
  const dayProjects = projects.filter((p) => p.deadline === selectedDayStr);
  const daySessions = sessions.filter((s) => s.started_at.startsWith(selectedDayStr));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F3F5F7] tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-[#63D6C5]" />
            Study Schedule & Milestone Calendar
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Deadlines, scheduled study sessions, and milestone dates across all domains.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-white text-base font-mono px-3">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDay(new Date());
            }}
            className="px-3 py-1.5 rounded-xl bg-[#D6FF62]/10 text-[#D6FF62] border border-[#D6FF62]/30 text-xs font-semibold"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Month Grid (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-[#141820] border border-[#272E38] p-6 shadow-xl">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider pb-3 border-b border-[#272E38]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2 pt-3">
            {/* Blank offset days for start of month */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`blank-${i}`} className="h-20 rounded-xl bg-zinc-950/20 opacity-30" />
            ))}

            {daysInMonth.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const hasTask = tasks.some((t) => t.due_date === dayStr);
              const hasGoal = goals.some((g) => g.target_date === dayStr);
              const hasProject = projects.some((p) => p.deadline === dayStr);
              const hasSession = sessions.some((s) => s.started_at.startsWith(dayStr));

              const isSelected = isSameDay(day, selectedDay);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`h-20 rounded-xl p-2 border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#D6FF62]/10 border-[#D6FF62] text-white shadow-lg'
                      : isCurrentDay
                      ? 'bg-[#1A2029] border-[#63D6C5] text-[#63D6C5]'
                      : 'bg-[#0B0D10] border-[#272E38] hover:border-[#384252] text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isCurrentDay ? 'text-[#63D6C5]' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {isCurrentDay && <span className="w-1.5 h-1.5 rounded-full bg-[#63D6C5]" />}
                  </div>

                  {/* Indicator Dots */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {hasTask && <span className="w-2 h-2 rounded-full bg-[#63D6C5]" title="Task due" />}
                    {hasGoal && <span className="w-2 h-2 rounded-full bg-rose-500" title="Goal deadline" />}
                    {hasProject && <span className="w-2 h-2 rounded-full bg-blue-500" title="Project deadline" />}
                    {hasSession && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Study session recorded" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#141820] border border-[#272E38] p-6 shadow-xl space-y-5">
          <div className="pb-3 border-b border-[#272E38]">
            <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Selected Day Agenda</span>
            <h3 className="text-lg font-bold text-[#F3F5F7] mt-0.5">
              {format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </h3>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {/* Tasks */}
            {dayTasks.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold text-[#63D6C5] flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" /> Tasks Due ({dayTasks.length})
                </span>
                {dayTasks.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs">
                    <div className="font-semibold text-white">{t.title}</div>
                    <div className="text-zinc-500 text-[11px] mt-1 flex items-center gap-2">
                      <Badge priority={t.priority} />
                      <span>{t.estimated_minutes}m est.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Goals */}
            {dayGoals.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold text-rose-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Goal Targets ({dayGoals.length})
                </span>
                {dayGoals.map((g) => (
                  <div key={g.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs">
                    <div className="font-semibold text-white">{g.title}</div>
                    <div className="text-zinc-500 text-[11px] mt-1">
                      {g.current_value} / {g.target_value} {g.unit}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Project Deadlines */}
            {dayProjects.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold text-blue-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Project Deadlines ({dayProjects.length})
                </span>
                {dayProjects.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs">
                    <div className="font-semibold text-white">{p.name}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Recorded Study Sessions */}
            {daySessions.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Focus Sessions ({daySessions.length})
                </span>
                {daySessions.map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs flex justify-between">
                    <div>
                      <span className="text-white font-medium capitalize block">{s.session_type}</span>
                      <span className="text-zinc-500 text-[11px]">{s.notes || 'Focus block'}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">{s.duration_minutes}m</span>
                  </div>
                ))}
              </div>
            )}

            {dayTasks.length === 0 && dayGoals.length === 0 && dayProjects.length === 0 && daySessions.length === 0 && (
              <div className="py-8 text-center text-xs text-zinc-500">
                No events or study sessions scheduled for this day.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
