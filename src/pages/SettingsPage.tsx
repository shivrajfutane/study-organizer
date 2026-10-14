import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Clock,
  Download,
  Trash2,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Cloud,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { dataService } from '@/services/data-service';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { StudySpaceLogo } from '@/components/ui/StudySpaceLogo';
import { AuthModal } from '@/components/auth/AuthModal';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { isConfigured, isDemoUser, user, signOut, syncNow } = useAuth();
  const [, setTick] = useState(0);

  const profile = dataService.getProfile();

  // Form states
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(profile.weekly_goal_hours || 15);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(profile.daily_goal_minutes || 120);

  // Timer defaults
  const [focusMins, setFocusMins] = useState(profile.timer_settings?.focusMinutes || 25);
  const [shortBreakMins, setShortBreakMins] = useState(profile.timer_settings?.shortBreakMinutes || 5);
  const [longBreakMins, setLongBreakMins] = useState(profile.timer_settings?.longBreakMinutes || 15);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await syncNow();
      setSyncMessage('Workspace synchronized with Supabase cloud successfully!');
      setTimeout(() => setSyncMessage(null), 3500);
    } catch (e: any) {
      setSyncMessage(e?.message || 'Sync encountered an error.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    return dataService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.updateProfile({
      full_name: fullName,
      email,
      weekly_goal_hours: Number(weeklyGoalHours),
      daily_goal_minutes: Number(dailyGoalMinutes),
      timer_settings: {
        ...profile.timer_settings,
        focusMinutes: Number(focusMins),
        shortBreakMinutes: Number(shortBreakMins),
        longBreakMinutes: Number(longBreakMins),
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportJSON = () => {
    const jsonStr = dataService.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyspace_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = (entity: 'tasks' | 'topics' | 'sessions') => {
    const csvStr = dataService.exportCSV(entity);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyspace_${entity}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    dataService.resetToDefaultSeed();
    setResetModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#F3F5F7] tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-[#63D6C5]" />
          Settings & Data Management
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Customize workspace parameters, Pomodoro intervals, exports, and backend cloud persistence.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Preferences updated and persisted successfully!</span>
        </div>
      )}

      {/* Cloud & Supabase Diagnostics Section */}
      <div className="rounded-3xl bg-[#141820] border border-[#272E38] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#63D6C5]/10 text-[#63D6C5]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F3F5F7] tracking-tight">Cloud Database & Account Sync</h3>
              <p className="text-xs text-zinc-400">Save all your subjects, topics, roadmaps, and sessions online</p>
            </div>
          </div>

          {isDemoUser ? (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-black" />
              <span>Log in to Save All Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A2029] hover:bg-[#272E38] text-[#F3F5F7] border border-[#272E38] text-xs font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#D6FF62] ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync All Data Now'}</span>
              </button>
              <button
                type="button"
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 text-rose-300 border border-rose-900/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {syncMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-sm font-bold text-white">
                {!isDemoUser
                  ? 'Cloud Synced & Protected'
                  : isConfigured
                  ? 'Supabase Cloud Connected (Guest Mode)'
                  : 'Local Persistence Active'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {!isDemoUser
                ? `Logged in as ${user?.email}. All learning data, sessions, and files automatically sync to your private cloud storage.`
                : 'You are currently using local storage. Log in or create an account to back up and sync your workspace across devices.'}
            </p>
          </div>

          <div className="shrink-0 text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
            {isDemoUser ? 'Status: Guest Mode' : `User: ${user?.email}`}
          </div>
        </div>
      </div>

      {/* Profile & Target Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="rounded-3xl bg-[#141820] border border-[#272E38] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#63D6C5]/10 text-[#63D6C5]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F3F5F7] tracking-tight">Learner Profile</h3>
              <p className="text-xs text-zinc-400">Personalize your name and study targets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] focus:outline-none focus:border-[#D6FF62]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] focus:outline-none focus:border-[#D6FF62]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Weekly Study Target (Hours)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={weeklyGoalHours}
                onChange={(e) => setWeeklyGoalHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] focus:outline-none focus:border-[#D6FF62]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Daily Study Target (Minutes)</label>
              <input
                type="number"
                min="15"
                step="15"
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] focus:outline-none focus:border-[#D6FF62]"
              />
            </div>
          </div>
        </div>

        {/* Pomodoro Timer Defaults */}
        <div className="rounded-3xl bg-[#141820] border border-[#272E38] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D6FF62]/10 text-[#D6FF62]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F3F5F7] tracking-tight">Pomodoro Timer Durations</h3>
              <p className="text-xs text-zinc-400">Configure default intervals for deep work cycles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Focus Block (Minutes)</label>
              <input
                type="number"
                min="10"
                max="120"
                value={focusMins}
                onChange={(e) => setFocusMins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] focus:outline-none focus:border-[#D6FF62]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Short Break (Minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreakMins}
                onChange={(e) => setShortBreakMins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] focus:outline-none focus:border-[#D6FF62]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Long Break (Minutes)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={longBreakMins}
                onChange={(e) => setLongBreakMins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0D10] border border-[#272E38] text-sm text-[#F3F5F7] focus:outline-none focus:border-[#D6FF62]"
              />
            </div>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="rounded-3xl bg-[#141820] border border-[#272E38] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F3F5F7] tracking-tight">Interface Theme</h3>
              <p className="text-xs text-zinc-400">Select your preferred distraction-free aesthetic</p>
            </div>

            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0B0D10] border border-[#272E38] text-xs">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  theme === 'dark' ? 'bg-[#D6FF62] text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  theme === 'light' ? 'bg-[#D6FF62] text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-bold text-sm shadow-md transition-colors"
        >
          Save All Preferences
        </button>
      </form>

      {/* Data Export & Backup Section */}
      <div className="rounded-3xl bg-[#141820] border border-[#272E38] p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F3F5F7] tracking-tight">Export & Local Data Backup</h3>
            <p className="text-xs text-zinc-400">Take complete ownership of your learning telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-1">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B0D10] hover:bg-[#1A2029] text-zinc-200 border border-[#272E38] text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#D6FF62]" />
            <span>Export Full JSON Archive</span>
          </button>
          <button
            onClick={() => handleExportCSV('tasks')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Tasks (CSV)</span>
          </button>
          <button
            onClick={() => handleExportCSV('topics')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Topics (CSV)</span>
          </button>
          <button
            onClick={() => handleExportCSV('sessions')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Focus Logs (CSV)</span>
          </button>
        </div>
      </div>

      {/* About StudySpace & Vector Branding */}
      <div className="rounded-3xl bg-[#141820] border border-[#272E38] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#272E38]">
          <StudySpaceLogo size="lg" showText={true} showSubtitle={true} badge="v2.0" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#1A2029] text-[#63D6C5] border border-[#272E38]">
              React 19 • TypeScript • Tailwind • Supabase
            </span>
          </div>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          StudySpace is an all-in-one personal productivity environment engineered for deep focus, structured curriculum tracking, and milestone-based roadmap management.
        </p>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="rounded-3xl bg-rose-950/20 border border-rose-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-base font-bold">Danger Zone</h3>
        </div>
        <p className="text-xs text-zinc-400">
          Reset all categories, syllabus topics, and study sessions back to the clean default seed state.
        </p>
        <button
          onClick={() => setResetModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Starter Seed Data</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleResetData}
        title="Reset StudySpace to Default Seed?"
        message="This will overwrite current local changes and restore the clean starter categories and modules. Make sure you've exported your JSON backup if needed."
        confirmText="Reset All Data"
      />

      {/* Cloud Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};
