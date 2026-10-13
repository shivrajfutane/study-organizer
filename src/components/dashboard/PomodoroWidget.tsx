import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Flame,
  Maximize2,
} from 'lucide-react';
import { useTimer } from '@/context/TimerContext';
import { dataService } from '@/services/data-service';
import { ProgressRing } from '@/components/ui/ProgressBar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const PomodoroWidget: React.FC = () => {
  const navigate = useNavigate();
  const {
    mode,
    status,
    remainingSeconds,
    progressPercentage,
    activeTaskId,
    activeCategoryId,
    completedSessionsToday,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    setMode,
  } = useTimer();

  const activeTask = activeTaskId ? dataService.getTasks().find((t) => t.id === activeTaskId) : null;
  const activeCategory = activeCategoryId ? dataService.getCategoryById(activeCategoryId) : null;
  const overallStats = dataService.getOverallStats();

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Muted neon lime for focus, subtle teal for short break, amber for long break
  const ringColor = mode === 'focus' ? '#D6FF62' : mode === 'short_break' ? '#63D6C5' : '#F59E0B';

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-elevated text-primary border border-border">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Pomodoro Timer
            </CardTitle>
            <p className="text-[11px] text-muted-foreground m-0">
              {completedSessionsToday === 0
                ? '0 sessions today • Ready to focus'
                : `${completedSessionsToday} sessions today (${overallStats.focusMinutesToday}m focus)`}
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate('/focus')}
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          title="Open Focus Room"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3.5 pt-0">
        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-md bg-elevated border border-border">
          <button
            onClick={() => setMode('focus')}
            className={`flex-1 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              mode === 'focus' ? 'bg-primary text-[#0B0D10] font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => setMode('short_break')}
            className={`flex-1 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              mode === 'short_break' ? 'bg-accent text-[#0B0D10] font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Short Break
          </button>
          <button
            onClick={() => setMode('long_break')}
            className={`flex-1 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              mode === 'long_break' ? 'bg-[#F59E0B] text-[#0B0D10] font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Long Break
          </button>
        </div>

        {/* Circular Timer Clock */}
        <div className="flex flex-col items-center justify-center py-1">
          <ProgressRing value={progressPercentage} size={140} strokeWidth={8} color={ringColor}>
            <div className="text-center">
              <div className="font-mono text-2xl font-bold text-foreground tracking-tight">
                {formatTimer(remainingSeconds)}
              </div>
              <div className="text-[10px] uppercase font-mono font-medium tracking-wider text-muted-foreground mt-0.5">
                {mode.replace('_', ' ')}
              </div>
            </div>
          </ProgressRing>
        </div>

        {/* Active Context Banner */}
        <div className="p-2 rounded-md bg-elevated border border-border text-xs text-center min-h-[38px] flex items-center justify-center">
          {activeTask ? (
            <div className="truncate text-xs">
              <span className="text-muted-foreground font-medium">Task: </span>
              <span className="text-primary font-medium">{activeTask.title}</span>
            </div>
          ) : activeCategory ? (
            <div className="truncate text-xs">
              <span className="text-muted-foreground font-medium">Category: </span>
              <span className="font-medium text-foreground">
                {activeCategory.name}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-[11px]">General Focus Session</span>
          )}
        </div>

        {/* Control Actions */}
        <div className="flex items-center justify-center gap-2.5">
          <Button
            onClick={resetTimer}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 border-border text-muted-foreground hover:text-foreground"
            title="Reset timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          {status === 'running' ? (
            <Button
              onClick={pauseTimer}
              className="h-8 px-5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs gap-1.5"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </Button>
          ) : status === 'paused' ? (
            <Button
              onClick={resumeTimer}
              className="h-8 px-5 bg-primary hover:bg-[#c2ef48] text-[#0B0D10] font-semibold text-xs gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume</span>
            </Button>
          ) : (
            <Button
              onClick={startTimer}
              className="h-8 px-5 bg-primary hover:bg-[#c2ef48] text-[#0B0D10] font-semibold text-xs gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Focus</span>
            </Button>
          )}

          <Button
            onClick={skipTimer}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 border-border text-muted-foreground hover:text-foreground"
            title="Skip session"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
