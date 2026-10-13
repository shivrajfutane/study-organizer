import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Sparkles,
  Award,
} from 'lucide-react';
import { dataService } from '@/services/data-service';
import { Goal, GoalPeriod, Priority, GoalMeasurement } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/badge';
import { formatDate, isDatePast } from '@/lib/date-utils';
import { Modal } from '@/components/ui/Modal';

export const GoalsPage: React.FC = () => {
  const [, setTick] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [period, setPeriod] = useState<GoalPeriod>('monthly');
  const [targetValue, setTargetValue] = useState(10);
  const [unit, setUnit] = useState('hours');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    return dataService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const goals = dataService.getGoals();
  const categories = dataService.getCategories();

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    dataService.createGoal({
      title: title.trim(),
      description: desc.trim(),
      category_id: categoryId || null,
      period,
      priority: 'high',
      status: 'active',
      measurement_type: 'number',
      target_value: Number(targetValue),
      current_value: 0,
      unit: unit.trim() || 'units',
      target_date: targetDate || null,
    });

    setTitle('');
    setDesc('');
    setIsCreateOpen(false);
  };

  const handleIncrement = (goal: Goal, amount: number) => {
    const nextVal = Math.max(0, goal.current_value + amount);
    const nextStatus = nextVal >= goal.target_value ? 'completed' : 'active';
    dataService.updateGoal(goal.id, { current_value: nextVal, status: nextStatus });
  };

  const filteredGoals = goals.filter((g) => periodFilter === 'all' || g.period === periodFilter);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F3F5F7] tracking-tight flex items-center gap-2.5">
            <Target className="w-6 h-6 text-[#63D6C5]" />
            Study Goals & Quantitative Targets
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Set and track measured learning milestones by study hours, completed topics, or problems solved.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#272E38]">
        {['all', 'weekly', 'monthly', 'quarterly', 'yearly'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriodFilter(p)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
              periodFilter === p
                ? 'bg-[#D6FF62] text-black shadow-sm font-bold'
                : 'bg-[#141820] text-zinc-400 hover:text-white hover:bg-[#1A2029]'
            }`}
          >
            {p === 'all' ? `All Goals (${goals.length})` : `${p} Goals`}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="rounded-2xl bg-[#141820] border border-[#272E38] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1A2029] border border-[#272E38] flex items-center justify-center mx-auto text-[#63D6C5]">
            <Target className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#F3F5F7]">No goals established yet</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Define measurable weekly or monthly targets (such as focus hours, topic counts, or review milestones) to track study consistency.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Set New Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((g) => {
            const cat = g.category_id ? dataService.getCategoryById(g.category_id) : null;
            const progress = Math.min(100, Math.round((g.current_value / g.target_value) * 100));
            const isCompleted = g.status === 'completed' || progress >= 100;
            const isOverdue = g.target_date && isDatePast(g.target_date) && !isCompleted;

            return (
              <div
                key={g.id}
                className={`rounded-2xl border p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                  isCompleted
                    ? 'bg-[#141820]/60 border-emerald-900/50'
                    : 'bg-[#141820] border-[#272E38] hover:border-[#384252]'
                }`}
              >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                      {g.period} Target
                    </span>
                    <h3 className="font-bold text-white text-base tracking-tight truncate">{g.title}</h3>
                  </div>
                  {isCompleted ? (
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Award className="w-4 h-4" />
                    </span>
                  ) : (
                    <Badge priority={g.priority} />
                  )}
                </div>

                {g.description && <p className="text-xs text-zinc-400 line-clamp-2">{g.description}</p>}

                {cat && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: cat.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                )}

                {/* Quantitative Progress */}
                <div className="pt-1">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="font-mono text-xl font-extrabold text-white">
                      {g.current_value} <span className="text-xs font-normal text-zinc-400">/ {g.target_value} {g.unit}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-300">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} color={isCompleted ? '#10b981' : cat?.color || '#f43f5e'} size="md" />
                </div>
              </div>

              {/* Action Buttons & Incrementers */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  {g.target_date && (
                    <span
                      className={`flex items-center gap-1 text-[11px] font-mono ${
                        isOverdue ? 'text-rose-400 font-bold' : 'text-zinc-500'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(g.target_date, 'MMM d, yyyy')}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => handleIncrement(g, 1)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-zinc-200 transition-colors"
                      title="Log +1 progress"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleIncrement(g, 5)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-zinc-200 transition-colors"
                      title="Log +5 progress"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => dataService.deleteGoal(g.id)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* New Goal Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Set Study Goal">
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Goal Statement *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Solve 50 LeetCode Medium/Hard Questions"
              className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Why this goal matters and your action plan"
              className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Target Value *</label>
              <input
                type="number"
                min="1"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="hours, questions, modules"
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Target Deadline</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-[#272E38]">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:bg-[#1A2029]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-sm shadow-sm"
            >
              Set Goal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
