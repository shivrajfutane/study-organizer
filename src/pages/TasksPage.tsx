import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Play,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Trash2,
  Search,
} from 'lucide-react';
import { dataService } from '@/services/data-service';
import { useTimer } from '@/context/TimerContext';
import { Task, Priority } from '@/types';
import { formatDate, isDatePast, isDateToday } from '@/lib/date-utils';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { startTimer, setActiveTask } = useTimer();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterView, setFilterView] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [selectedCatFilter, setSelectedCatFilter] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [estMins, setEstMins] = useState(30);
  const [isTodayPlan, setIsTodayPlan] = useState(false);

  const tasks = dataService.getTasks();
  const categories = dataService.getCategories();

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    dataService.createTask({
      title: title.trim(),
      description: desc.trim() || undefined,
      category_id: categoryId || null,
      subject_id: null,
      project_id: null,
      priority,
      status: 'pending',
      due_date: dueDate || null,
      estimated_minutes: Number(estMins),
      actual_minutes: 0,
      is_today_plan: isTodayPlan,
      tags: [],
    });

    setTitle('');
    setDesc('');
    setCategoryId('');
    setDueDate('');
    setEstMins(30);
    setIsTodayPlan(false);
    setIsCreateOpen(false);
  };

  const handleToggleTask = (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    dataService.updateTask(task.id, { status: nextStatus });
    if (nextStatus === 'completed') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }
  };

  const handleStartTaskFocus = (task: Task) => {
    setActiveTask(task.id, task.category_id, task.subject_id);
    startTimer();
    navigate('/focus');
  };

  const getPriorityVariant = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'amber';
      case 'medium':
        return 'teal';
      default:
        return 'secondary';
    }
  };

  const filteredTasks = tasks
    .filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCatFilter && t.category_id !== selectedCatFilter) return false;

      if (filterView === 'today') return t.is_today_plan || isDateToday(t.due_date);
      if (filterView === 'completed') return t.status === 'completed';
      if (filterView === 'overdue') return t.status !== 'completed' && isDatePast(t.due_date);
      if (filterView === 'upcoming') return t.status !== 'completed' && t.due_date && !isDatePast(t.due_date);

      return true;
    });

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2 m-0">
            <CheckSquare className="w-5 h-5 text-primary" />
            Task Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-1 m-0">
            Track daily schedules, deadlines, estimated effort, and launch focus sessions.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          size="sm"
          className="h-8 gap-1.5 text-xs bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48] shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border">
        {[
          { id: 'all', label: `All (${tasks.length})` },
          { id: 'today', label: `Today's Plan (${tasks.filter((t) => t.is_today_plan || isDateToday(t.due_date)).length})` },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'overdue', label: `Overdue (${tasks.filter((t) => t.status !== 'completed' && isDatePast(t.due_date)).length})` },
          { id: 'completed', label: `Completed (${tasks.filter((t) => t.status === 'completed').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterView(tab.id as any)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              filterView === tab.id
                ? 'bg-elevated text-primary border border-border shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-elevated/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task titles..."
            className="pl-9 h-8 text-xs bg-card border-border"
          />
        </div>

        <select
          value={selectedCatFilter}
          onChange={(e) => setSelectedCatFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-md bg-card border border-border text-xs text-foreground focus:outline-none cursor-pointer h-8"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center rounded-lg border border-dashed border-border/60 bg-card/30 text-muted-foreground text-xs space-y-2">
            <CheckSquare className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="m-0">No tasks found in this view.</p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="link"
              size="sm"
              className="text-xs text-primary hover:underline h-auto p-0"
            >
              + Create a new task
            </Button>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const cat = t.category_id ? dataService.getCategoryById(t.category_id) : null;
            const isDone = t.status === 'completed';

            return (
              <div
                key={t.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-md border transition-colors ${
                  isDone
                    ? 'bg-elevated/20 border-border/40 opacity-60'
                    : 'bg-card border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleToggleTask(t)}
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0 cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <h3
                      className={`text-xs font-medium truncate m-0 ${
                        isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {t.title}
                    </h3>
                    <div className="flex items-center gap-2.5 mt-0.5 text-[10px] text-muted-foreground flex-wrap font-mono">
                      {cat && (
                        <span className="font-medium text-foreground">
                          {cat.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {t.estimated_minutes}m (spent {t.actual_minutes}m)
                      </span>
                      {t.due_date && (
                        <span
                          className={`flex items-center gap-1 ${
                            isDatePast(t.due_date) && !isDone ? 'text-destructive font-semibold' : ''
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          Due {formatDate(t.due_date, 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={getPriorityVariant(t.priority)}>
                    {t.priority}
                  </Badge>

                  {!isDone && (
                    <Button
                      onClick={() => handleStartTaskFocus(t)}
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 border-border text-primary hover:border-primary/50"
                      title="Start Pomodoro linked to this task"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  )}

                  <Button
                    onClick={() => dataService.deleteTask(t.id)}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Task Dialog (shadcn Dialog) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Create New Task</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Task Title *</label>
              <Input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Implement Dijkstra shortest path"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Description</label>
              <Textarea
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Context or acceptance criteria"
                className="min-h-[60px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-card border border-border text-xs text-foreground focus:outline-none"
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
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-card border border-border text-xs text-foreground focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Estimated Minutes</label>
                <Input
                  type="number"
                  min="5"
                  step="5"
                  value={estMins}
                  onChange={(e) => setEstMins(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="todayCheck"
                checked={isTodayPlan}
                onChange={(e) => setIsTodayPlan(e.target.checked)}
                className="rounded border-border bg-card accent-[#D6FF62] cursor-pointer"
              />
              <label htmlFor="todayCheck" className="text-xs text-muted-foreground cursor-pointer">
                Include in Today's Study Plan
              </label>
            </div>
            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48]"
              >
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
