import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { soundEngine } from '@/lib/audio-synth';
import { dataService } from '@/services/data-service';
import confetti from 'canvas-confetti';

export type TimerMode = 'focus' | 'short_break' | 'long_break';
export type TimerStatus = 'idle' | 'running' | 'paused';

interface TimerPersistedState {
  mode: TimerMode;
  status: TimerStatus;
  targetEndTime: number | null; // epoch ms
  remainingSeconds: number;
  totalDurationSeconds: number;
  activeTaskId: string | null;
  activeCategoryId: string | null;
  activeSubjectId: string | null;
  sessionStartedAt: string | null; // ISO string
  completedSessionsToday: number;
}

interface TimerContextType {
  mode: TimerMode;
  status: TimerStatus;
  remainingSeconds: number;
  totalDurationSeconds: number;
  progressPercentage: number;
  activeTaskId: string | null;
  activeCategoryId: string | null;
  activeSubjectId: string | null;
  completedSessionsToday: number;
  focusMinutesSetting: number;
  shortBreakMinutesSetting: number;
  longBreakMinutesSetting: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  setMode: (mode: TimerMode) => void;
  setActiveTask: (taskId: string | null, categoryId?: string | null, subjectId?: string | null) => void;
  setActiveCategory: (categoryId: string | null) => void;
}

const TIMER_STORAGE_KEY = 'studyspace_active_pomodoro_v1';

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const profile = dataService.getProfile();
  const focusMinutesSetting = profile.timer_settings?.focusMinutes || 25;
  const shortBreakMinutesSetting = profile.timer_settings?.shortBreakMinutes || 5;
  const longBreakMinutesSetting = profile.timer_settings?.longBreakMinutes || 15;

  const getDurationForMode = (m: TimerMode): number => {
    switch (m) {
      case 'focus':
        return focusMinutesSetting * 60;
      case 'short_break':
        return shortBreakMinutesSetting * 60;
      case 'long_break':
        return longBreakMinutesSetting * 60;
    }
  };

  const [timerState, setTimerState] = useState<TimerPersistedState>(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const parsed: TimerPersistedState = JSON.parse(saved);
        if (parsed.status === 'running' && parsed.targetEndTime) {
          const now = Date.now();
          const diffSeconds = Math.max(0, Math.round((parsed.targetEndTime - now) / 1000));
          if (diffSeconds > 0) {
            return {
              ...parsed,
              remainingSeconds: diffSeconds,
            };
          } else {
            // Already expired while away
            return {
              ...parsed,
              status: 'idle',
              targetEndTime: null,
              remainingSeconds: getDurationForMode(parsed.mode),
            };
          }
        }
        return parsed;
      }
    } catch {
      // fallback
    }

    return {
      mode: 'focus',
      status: 'idle',
      targetEndTime: null,
      remainingSeconds: focusMinutesSetting * 60,
      totalDurationSeconds: focusMinutesSetting * 60,
      activeTaskId: null,
      activeCategoryId: null,
      activeSubjectId: null,
      sessionStartedAt: null,
      completedSessionsToday: 0,
    };
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState));
    } catch {
      // ignore
    }
  }, [timerState]);

  const handleSessionComplete = React.useCallback(() => {
    // Play sound & confetti
    try {
      soundEngine.playChime();
      if (timerState.mode === 'focus') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D6FF62', '#63D6C5', '#F59E0B', '#10B981'],
        });
      }
    } catch {
      // audio context or confetti fallback
    }

    // Save accurate study session in data service if focus mode
    if (timerState.mode === 'focus') {
      const durationMins = Math.round(timerState.totalDurationSeconds / 60);
      dataService.recordStudySession({
        session_type: 'pomodoro',
        duration_minutes: durationMins,
        started_at: timerState.sessionStartedAt || new Date(Date.now() - timerState.totalDurationSeconds * 1000).toISOString(),
        ended_at: new Date().toISOString(),
        task_id: timerState.activeTaskId,
        category_id: timerState.activeCategoryId,
        subject_id: timerState.activeSubjectId,
        project_id: null,
        topic_id: null,
        notes: 'Pomodoro focus cycle completed',
        is_completed: true,
      });

      const nextCompleted = timerState.completedSessionsToday + 1;
      const nextMode: TimerMode = nextCompleted % 4 === 0 ? 'long_break' : 'short_break';
      const nextDuration = getDurationForMode(nextMode);

      setTimerState((prev) => ({
        ...prev,
        mode: nextMode,
        status: 'idle',
        targetEndTime: null,
        remainingSeconds: nextDuration,
        totalDurationSeconds: nextDuration,
        sessionStartedAt: null,
        completedSessionsToday: nextCompleted,
      }));
    } else {
      // Break ended -> return to focus
      const nextDuration = getDurationForMode('focus');
      setTimerState((prev) => ({
        ...prev,
        mode: 'focus',
        status: 'idle',
        targetEndTime: null,
        remainingSeconds: nextDuration,
        totalDurationSeconds: nextDuration,
        sessionStartedAt: null,
      }));
    }
  }, [timerState, getDurationForMode]);

  // Authoritative timestamp ticker
  useEffect(() => {
    if (timerState.status === 'running' && timerState.targetEndTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.round((timerState.targetEndTime! - now) / 1000));

        if (diffSeconds <= 0) {
          // Finished!
          clearInterval(intervalRef.current!);
          handleSessionComplete();
        } else {
          setTimerState((prev) => ({
            ...prev,
            remainingSeconds: diffSeconds,
          }));
        }
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState.status, timerState.targetEndTime, handleSessionComplete]);

  const startTimer = () => {
    const now = Date.now();
    const duration = timerState.remainingSeconds > 0 ? timerState.remainingSeconds : getDurationForMode(timerState.mode);
    setTimerState((prev) => ({
      ...prev,
      status: 'running',
      targetEndTime: now + duration * 1000,
      totalDurationSeconds: prev.remainingSeconds === getDurationForMode(prev.mode) ? duration : prev.totalDurationSeconds,
      remainingSeconds: duration,
      sessionStartedAt: prev.sessionStartedAt || new Date().toISOString(),
    }));
  };

  const pauseTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const now = Date.now();
    const remaining = timerState.targetEndTime ? Math.max(0, Math.round((timerState.targetEndTime - now) / 1000)) : timerState.remainingSeconds;

    setTimerState((prev) => ({
      ...prev,
      status: 'paused',
      targetEndTime: null,
      remainingSeconds: remaining,
    }));
  };

  const resumeTimer = () => {
    const now = Date.now();
    setTimerState((prev) => ({
      ...prev,
      status: 'running',
      targetEndTime: now + prev.remainingSeconds * 1000,
    }));
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const duration = getDurationForMode(timerState.mode);
    setTimerState((prev) => ({
      ...prev,
      status: 'idle',
      targetEndTime: null,
      remainingSeconds: duration,
      totalDurationSeconds: duration,
      sessionStartedAt: null,
    }));
  };

  const skipTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const nextMode: TimerMode = timerState.mode === 'focus' ? 'short_break' : 'focus';
    const duration = getDurationForMode(nextMode);
    setTimerState((prev) => ({
      ...prev,
      mode: nextMode,
      status: 'idle',
      targetEndTime: null,
      remainingSeconds: duration,
      totalDurationSeconds: duration,
      sessionStartedAt: null,
    }));
  };

  const setMode = (mode: TimerMode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const duration = getDurationForMode(mode);
    setTimerState((prev) => ({
      ...prev,
      mode,
      status: 'idle',
      targetEndTime: null,
      remainingSeconds: duration,
      totalDurationSeconds: duration,
      sessionStartedAt: null,
    }));
  };

  const setActiveTask = (taskId: string | null, categoryId?: string | null, subjectId?: string | null) => {
    setTimerState((prev) => ({
      ...prev,
      activeTaskId: taskId,
      activeCategoryId: categoryId !== undefined ? categoryId : prev.activeCategoryId,
      activeSubjectId: subjectId !== undefined ? subjectId : prev.activeSubjectId,
    }));
  };

  const setActiveCategory = (categoryId: string | null) => {
    setTimerState((prev) => ({
      ...prev,
      activeCategoryId: categoryId,
    }));
  };

  const progressPercentage =
    timerState.totalDurationSeconds > 0
      ? Math.max(0, Math.min(100, Math.round(((timerState.totalDurationSeconds - timerState.remainingSeconds) / timerState.totalDurationSeconds) * 100)))
      : 0;

  return (
    <TimerContext.Provider
      value={{
        mode: timerState.mode,
        status: timerState.status,
        remainingSeconds: timerState.remainingSeconds,
        totalDurationSeconds: timerState.totalDurationSeconds,
        progressPercentage,
        activeTaskId: timerState.activeTaskId,
        activeCategoryId: timerState.activeCategoryId,
        activeSubjectId: timerState.activeSubjectId,
        completedSessionsToday: timerState.completedSessionsToday,
        focusMinutesSetting,
        shortBreakMinutesSetting,
        longBreakMinutesSetting,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        skipTimer,
        setMode,
        setActiveTask,
        setActiveCategory,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
};
