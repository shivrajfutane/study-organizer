import React, { useState } from 'react';
import {
  Music2,
  ExternalLink,
  Plus,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useSound } from '@/context/SoundContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const MusicWidget: React.FC = () => {
  const {
    currentPlaylist,
    setCurrentPlaylist,
    playlists,
    addPlaylist,
    ambientSounds,
    toggleAmbientSound,
  } = useSound();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    addPlaylist(newTitle.trim(), newUrl.trim());
    setNewTitle('');
    setNewUrl('');
    setShowAddModal(false);
  };

  const activeAmbientCount = ambientSounds.filter((s) => s.isPlaying).length;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-elevated text-accent border border-border">
            <Music2 className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Study Audio & Ambience
            </CardTitle>
            <p className="text-[11px] text-muted-foreground m-0">
              YouTube study streams & procedural sound mixer
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddModal(!showAddModal)}
          size="sm"
          variant="outline"
          className="h-7 w-7 p-0 border-border hover:border-primary/50 text-foreground"
          title="Add custom stream"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3.5 pt-0">
        {/* Add Custom Playlist inline form */}
        {showAddModal && (
          <form onSubmit={handleAddSubmit} className="p-2.5 rounded-md bg-elevated border border-border space-y-2 text-xs">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Stream name..."
              className="w-full px-2.5 py-1.5 rounded bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
            <input
              type="url"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-2.5 py-1.5 rounded bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
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

        {/* Embedded YouTube Player Preview */}
        {currentPlaylist && (
          <div className="space-y-1.5">
            <div className="relative rounded-md overflow-hidden bg-black aspect-video border border-border shadow-xs">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${currentPlaylist.video_or_playlist_id}?enablejsapi=1`}
                title={currentPlaylist.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="truncate pr-2">
                <span className="text-foreground font-medium truncate block text-xs">{currentPlaylist.name}</span>
                <span className="text-muted-foreground text-[10px] capitalize">{currentPlaylist.mood} stream</span>
              </div>
              <a
                href={currentPlaylist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-elevated shrink-0 transition-colors"
                title="Open stream in YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Quick Stream Picker */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-muted-foreground block">
            Curated Study Streams
          </label>
          <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-1">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => setCurrentPlaylist(pl)}
                className={`flex items-center justify-between p-2 rounded-md text-left text-xs transition-colors cursor-pointer ${
                  currentPlaylist?.id === pl.id
                    ? 'bg-elevated text-primary border border-primary/40 font-medium'
                    : 'bg-elevated/40 hover:bg-elevated text-foreground border border-border/50'
                }`}
              >
                <span className="truncate pr-2 text-xs">{pl.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-card text-muted-foreground shrink-0 capitalize border border-border/40 font-mono">
                  {pl.mood}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Ambient Sound Generator Toggles */}
        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-xs">
              <Volume2 className="w-3.5 h-3.5 text-accent" />
              Procedural Ambient Mixer
            </span>
            {activeAmbientCount > 0 && (
              <span className="text-[10px] font-mono font-medium text-primary">
                {activeAmbientCount} active
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {ambientSounds.slice(0, 3).map((sound) => (
              <button
                key={sound.id}
                onClick={() => toggleAmbientSound(sound.id)}
                className={`py-1 px-2 rounded-md text-[11px] font-medium text-center transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  sound.isPlaying
                    ? 'bg-accent/20 text-accent border border-accent/40 font-semibold shadow-xs'
                    : 'bg-elevated/40 hover:bg-elevated text-muted-foreground border border-border/50'
                }`}
              >
                {sound.isPlaying ? <Volume2 className="w-3 h-3 text-accent" /> : <VolumeX className="w-3 h-3 text-muted-foreground" />}
                <span className="truncate">{sound.name}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
