import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  Play,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { dataService } from '@/services/data-service';
import { useTimer } from '@/context/TimerContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types';

interface TodayPlanWidgetProps {
  onOpenQuickAddTask: () => void;
}

export const TodayPlanWidget: React.FC<TodayPlanWidgetProps> = ({ onOpenQuickAddTask }) => {
  const navigate = useNavigate();
  const { startTimer, setActiveTask } = useTimer();

  const allTasks = dataService.getTasks();
  const todayTasks = allTasks.filter((t) => t.is_today_plan || t.due_date === new Date().toISOString().split('T')[0]);
  const completedTodayCount = todayTasks.filter((t) => t.status === 'completed').length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedTodayCount / todayTasks.length) * 100) : 0;

  const handleToggleTask = (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    dataService.updateTask(task.id, { status: nextStatus });
  };

  const handleStartTaskFocus = (task: Task) => {
    setActiveTask(task.id, task.category_id, task.subject_id);
    startTimer();
    navigate('/focus');
  };

  const getPriorityVariant = (priority: Task['priority']) => {
    switch (priority) {
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

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-elevated text-primary border border-border">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Today's Study Plan
            </CardTitle>
            <p className="text-[11px] text-muted-foreground m-0">
              {completedTodayCount} of {todayTasks.length} tasks completed ({progressPercent}%)
            </p>
          </div>
        </div>

        <Button
          onClick={onOpenQuickAddTask}
          size="sm"
          variant="outline"
          className="h-7 w-7 p-0 border-border hover:border-primary/50 text-foreground"
          title="Add task to today"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3.5 pt-0">
        {/* Daily Completion Meter */}
        <Progress value={progressPercent} className="h-1.5" />

        {/* Task List */}
        <div className="space-y-2">
          {todayTasks.length === 0 ? (
            <div className="py-7 text-center space-y-2 border border-dashed border-border/60 rounded-md bg-card/30">
              <div className="w-8 h-8 rounded-md bg-elevated border border-border text-muted-foreground mx-auto flex items-center justify-center">
                <ListTodo className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground m-0">No study tasks planned for today.</p>
              <Button
                onClick={onOpenQuickAddTask}
                variant="link"
                size="sm"
                className="text-xs text-primary hover:underline h-auto p-0"
              >
                + Plan a task for today
              </Button>
            </div>
          ) : (
            todayTasks.map((task) => {
              const cat = task.category_id ? dataService.getCategoryById(task.category_id) : null;
              const isDone = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  className={`group flex items-center justify-between gap-2.5 p-2.5 rounded-md border transition-colors ${
                    isDone
                      ? 'bg-elevated/30 border-border/40 opacity-60'
                      : 'bg-elevated border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="text-muted-foreground hover:text-primary transition-colors shrink-0 cursor-pointer"
                      title={isDone ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div
                        className={`text-xs font-medium truncate ${
                          isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        {cat && (
                          <span className="font-medium text-foreground">
                            {cat.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {task.estimated_minutes}m
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={getPriorityVariant(task.priority)}>
                      {task.priority}
                    </Badge>

                    {!isDone && (
                      <Button
                        onClick={() => handleStartTaskFocus(task)}
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 border-border hover:border-primary/50 text-primary"
                        title="Start Pomodoro for this task"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
          <span className="text-[11px] text-muted-foreground">Focus timer links directly to tasks</span>
          <button
            onClick={() => navigate('/tasks')}
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            All tasks <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
