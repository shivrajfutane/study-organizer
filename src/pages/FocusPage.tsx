import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Music2,
  ExternalLink,
  Plus,
  Clock,
  Sliders,
} from 'lucide-react';
import { useTimer } from '@/context/TimerContext';
import { useSound, getYouTubeEmbedSrc } from '@/context/SoundContext';
import { dataService } from '@/services/data-service';
import { ProgressRing } from '@/components/ui/ProgressBar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const FocusPage: React.FC = () => {
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
    setActiveCategory,
    setActiveTask,
  } = useTimer();

  const {
    ambientSounds,
    masterVolume,
    toggleAmbientSound,
    setSoundVolume,
    setMasterVolume,
    stopAllAmbient,
    currentPlaylist,
    setCurrentPlaylist,
    playlists,
    addPlaylist,
  } = useSound();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPlaylistAdd, setShowPlaylistAdd] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');

  const categories = dataService.getCategories();
  const tasks = dataService.getTasks().filter((t) => t.status !== 'completed');
  const activeTask = activeTaskId ? dataService.getTasks().find((t) => t.id === activeTaskId) : null;
  const overallStats = dataService.getOverallStats();

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleAddPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistTitle.trim() || !playlistUrl.trim()) return;
    addPlaylist(playlistTitle.trim(), playlistUrl.trim());
    setPlaylistTitle('');
    setPlaylistUrl('');
    setShowPlaylistAdd(false);
  };

  // Muted neon lime for focus, subtle teal for short break, amber for long break
  const ringColor = mode === 'focus' ? '#D6FF62' : mode === 'short_break' ? '#63D6C5' : '#F59E0B';

  return (
    <div className={`space-y-6 pb-16 ${isFullscreen ? 'p-8 bg-[#0B0D10] min-h-screen fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2 m-0">
            <Flame className="w-5 h-5 text-primary" />
            Focus Room
          </h1>
          <p className="text-xs text-muted-foreground mt-1 m-0">
            Authoritative Pomodoro cycles, procedural ambient synthesis, and study music.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-card border border-border text-xs text-muted-foreground font-mono">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Today: {overallStats.focusMinutesToday}m ({completedSessionsToday} sessions)</span>
          </div>

          <Button
            onClick={handleToggleFullscreen}
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs border-border hover:border-primary/50 text-foreground"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Zen' : 'Zen Mode'}</span>
          </Button>
        </div>
      </div>

      {/* Main Focus Room Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pomodoro Big Stage (7 cols) */}
        <Card className="lg:col-span-7 border-border bg-card p-6 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-md bg-elevated border border-border w-full max-w-sm">
            <button
              onClick={() => setMode('focus')}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                mode === 'focus' ? 'bg-primary text-[#0B0D10] font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Deep Focus (25m)
            </button>
            <button
              onClick={() => setMode('short_break')}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                mode === 'short_break' ? 'bg-accent text-[#0B0D10] font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => setMode('long_break')}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                mode === 'long_break' ? 'bg-[#F59E0B] text-[#0B0D10] font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Large Circular Pomodoro Clock */}
          <div className="py-2">
            <ProgressRing value={progressPercentage} size={240} strokeWidth={10} color={ringColor}>
              <div className="text-center space-y-1">
                <div className="font-mono text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                  {formatTimer(remainingSeconds)}
                </div>
                <div className="text-[10px] uppercase font-mono font-semibold tracking-widest text-muted-foreground">
                  {mode.replace('_', ' ')}
                </div>
              </div>
            </ProgressRing>
          </div>

          {/* Primary Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={resetTimer}
              size="sm"
              variant="outline"
              className="h-10 w-10 p-0 border-border text-muted-foreground hover:text-foreground"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {status === 'running' ? (
              <Button
                onClick={pauseTimer}
                className="h-10 px-6 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm gap-2"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Timer</span>
              </Button>
            ) : status === 'paused' ? (
              <Button
                onClick={resumeTimer}
                className="h-10 px-6 bg-primary hover:bg-[#c2ef48] text-[#0B0D10] font-semibold text-sm gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Resume Session</span>
              </Button>
            ) : (
              <Button
                onClick={startTimer}
                className="h-10 px-6 bg-primary hover:bg-[#c2ef48] text-[#0B0D10] font-semibold text-sm gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Session</span>
              </Button>
            )}

            <Button
              onClick={skipTimer}
              size="sm"
              variant="outline"
              className="h-10 w-10 p-0 border-border text-muted-foreground hover:text-foreground"
              title="Skip Session"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Linked Task & Category Selectors */}
          <div className="w-full max-w-md pt-3 border-t border-border space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] uppercase font-mono font-semibold text-muted-foreground mb-1">
                  Active Domain
                </label>
                <select
                  value={activeCategoryId || ''}
                  onChange={(e) => setActiveCategory(e.target.value || null)}
                  className="w-full px-2.5 py-1.5 rounded bg-elevated border border-border text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="">General Study (No Domain)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-semibold text-muted-foreground mb-1">
                  Target Task
                </label>
                <select
                  value={activeTaskId || ''}
                  onChange={(e) => setActiveTask(e.target.value || null)}
                  className="w-full px-2.5 py-1.5 rounded bg-elevated border border-border text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="">No Specific Task</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeTask && (
              <div className="p-2 rounded bg-elevated border border-border flex items-center justify-between text-xs">
                <span className="text-foreground font-medium truncate pr-2">
                  Task: {activeTask.title}
                </span>
                <span className="font-mono text-primary shrink-0 text-[11px]">
                  {activeTask.estimated_minutes}m est.
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Audio Center (YouTube Streams + Ambient Synthesizer Mixer) (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* YouTube Video Stream Player */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-elevated text-accent border border-border">
                  <Music2 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    YouTube Study Streams
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground m-0">Lo-fi beats, synthwave, classical radio</p>
                </div>
              </div>

              <Button
                onClick={() => setShowPlaylistAdd(!showPlaylistAdd)}
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 border-border text-foreground hover:border-primary/50"
                title="Add YouTube Stream"
              >
                <Plus className="w-3.5 h-3.5 text-primary" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              {showPlaylistAdd && (
                <form onSubmit={handleAddPlaylist} className="p-2.5 rounded bg-elevated border border-border space-y-2 text-xs">
                  <input
                    type="text"
                    required
                    value={playlistTitle}
                    onChange={(e) => setPlaylistTitle(e.target.value)}
                    placeholder="Stream title..."
                    className="w-full px-2.5 py-1.5 rounded bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none text-xs"
                  />
                  <input
                    type="url"
                    required
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-2.5 py-1.5 rounded bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none text-xs"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPlaylistAdd(false)}
                      className="h-7 text-xs text-muted-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-7 text-xs bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48]"
                    >
                      Save Stream
                    </Button>
                  </div>
                </form>
              )}

              {currentPlaylist && (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video border border-border shadow-xs">
                    <iframe
                      src={getYouTubeEmbedSrc(currentPlaylist)}
                      title={currentPlaylist.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 px-0.5">
                    <div className="truncate pr-2">
                      <span className="text-foreground font-semibold truncate block text-xs">{currentPlaylist.name}</span>
                      <span className="text-muted-foreground text-[10px] capitalize font-mono">{currentPlaylist.mood} stream</span>
                    </div>
                    <a
                      href={currentPlaylist.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline px-2 py-1 rounded bg-elevated border border-border shrink-0 transition-colors"
                      title="Open full stream on YouTube"
                    >
                      <span>Open on YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Quick Playlist Switcher */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => setCurrentPlaylist(pl)}
                    className={`p-2 rounded text-left text-xs transition-colors truncate cursor-pointer ${
                      currentPlaylist?.id === pl.id
                        ? 'bg-elevated text-primary border border-primary/40 font-medium'
                        : 'bg-elevated/40 hover:bg-elevated text-foreground border border-border/50'
                    }`}
                  >
                    <span className="truncate block text-xs">{pl.name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize font-mono">{pl.mood}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Procedural Ambient Sound Mixer (Web Audio API) */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-elevated text-accent border border-border">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Ambient Noise Mixer
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground m-0">Procedural Web Audio synthesis • Zero latency</p>
                </div>
              </div>

              <Button
                onClick={stopAllAmbient}
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                Mute All
              </Button>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              {/* Master Volume */}
              <div className="p-2.5 rounded bg-elevated border border-border flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-accent shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Master Ambience</span>
                    <span className="font-mono">{Math.round(masterVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(Number(e.target.value))}
                    className="w-full accent-[#63D6C5] cursor-pointer h-1.5 bg-card rounded"
                  />
                </div>
              </div>

              {/* Individual Procedural Audio Sliders */}
              <div className="space-y-2">
                {ambientSounds.map((snd) => (
                  <div
                    key={snd.id}
                    className={`p-2.5 rounded border transition-colors ${
                      snd.isPlaying
                        ? 'bg-elevated border-accent/40'
                        : 'bg-elevated/40 border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <button
                        onClick={() => toggleAmbientSound(snd.id)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                          snd.isPlaying ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {snd.isPlaying ? <Volume2 className="w-3.5 h-3.5 text-accent" /> : <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />}
                        <span>{snd.name}</span>
                      </button>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {snd.isPlaying ? `${Math.round(snd.volume * 100)}%` : 'Off'}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={snd.volume}
                      disabled={!snd.isPlaying}
                      onChange={(e) => setSoundVolume(snd.id, Number(e.target.value))}
                      className={`w-full cursor-pointer h-1 rounded ${
                        snd.isPlaying ? 'accent-[#63D6C5]' : 'opacity-25'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
