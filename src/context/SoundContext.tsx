import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundEngine } from '@/lib/audio-synth';
import { dataService } from '@/services/data-service';
import { SavedPlaylist } from '@/types';

export interface AmbientSoundState {
  id: string;
  name: string;
  icon: string;
  isPlaying: boolean;
  volume: number; // 0 to 1
}

interface SoundContextType {
  ambientSounds: AmbientSoundState[];
  masterVolume: number;
  toggleAmbientSound: (id: string) => void;
  setSoundVolume: (id: string, vol: number) => void;
  setMasterVolume: (vol: number) => void;
  stopAllAmbient: () => void;
  currentPlaylist: SavedPlaylist | null;
  setCurrentPlaylist: (pl: SavedPlaylist | null) => void;
  isMusicPlaying: boolean;
  setIsMusicPlaying: (playing: boolean) => void;
  playlists: SavedPlaylist[];
  addPlaylist: (name: string, url: string, mood?: string) => SavedPlaylist;
  deletePlaylist: (id: string) => void;
}

const defaultSounds: AmbientSoundState[] = [
  { id: 'rain', name: 'Rainfall', icon: 'CloudRain', isPlaying: false, volume: 0.5 },
  { id: 'ocean', name: 'Ocean Waves', icon: 'Waves', isPlaying: false, volume: 0.5 },
  { id: 'forest', name: 'Forest Breeze', icon: 'Trees', isPlaying: false, volume: 0.5 },
  { id: 'fireplace', name: 'Cozy Fireplace', icon: 'Flame', isPlaying: false, volume: 0.5 },
  { id: 'binaural', name: 'Alpha Beats (432Hz)', icon: 'Headphones', isPlaying: false, volume: 0.4 },
  { id: 'brown_noise', name: 'Brown Noise', icon: 'Volume2', isPlaying: false, volume: 0.4 },
  { id: 'white_noise', name: 'White Noise', icon: 'Radio', isPlaying: false, volume: 0.3 },
];

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function parseYouTubeVideoOrPlaylistId(url: string): { id: string; type: 'video' | 'playlist' } | null {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has('list')) {
      return { id: parsed.searchParams.get('list')!, type: 'playlist' };
    }
    if (parsed.searchParams.has('v')) {
      return { id: parsed.searchParams.get('v')!, type: 'video' };
    }
    if (parsed.hostname === 'youtu.be') {
      return { id: parsed.pathname.slice(1), type: 'video' };
    }
    if (parsed.pathname.includes('/embed/')) {
      const parts = parsed.pathname.split('/embed/');
      return { id: parts[1], type: 'video' };
    }
  } catch {
    // not valid URL
  }
  return null;
}

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ambientSounds, setAmbientSounds] = useState<AmbientSoundState[]>(defaultSounds);
  const [masterVolume, setMasterVolumeState] = useState<number>(0.8);
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>(() => dataService.getPlaylists());
  const [currentPlaylist, setCurrentPlaylist] = useState<SavedPlaylist | null>(() => {
    const list = dataService.getPlaylists();
    return list.find((p) => p.is_favorite) || list[0] || null;
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setPlaylists(dataService.getPlaylists());
    });
    return unsubscribe;
  }, []);

  const toggleAmbientSound = (id: string) => {
    setAmbientSounds((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextPlaying = !s.isPlaying;
          if (nextPlaying) {
            soundEngine.startSound(s.id, s.volume);
          } else {
            soundEngine.stopSound(s.id);
          }
          return { ...s, isPlaying: nextPlaying };
        }
        return s;
      })
    );
  };

  const setSoundVolume = (id: string, vol: number) => {
    setAmbientSounds((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          soundEngine.setSoundVolume(id, vol);
          return { ...s, volume: vol };
        }
        return s;
      })
    );
  };

  const setMasterVolume = (vol: number) => {
    setMasterVolumeState(vol);
    soundEngine.setMasterVolume(vol);
  };

  const stopAllAmbient = () => {
    soundEngine.stopAll();
    setAmbientSounds((prev) => prev.map((s) => ({ ...s, isPlaying: false })));
  };

  const addPlaylist = (name: string, url: string, mood = 'focus'): SavedPlaylist => {
    const parsed = parseYouTubeVideoOrPlaylistId(url);
    const video_or_playlist_id = parsed ? parsed.id : '4xDzrJKXOOY';
    const type = parsed?.type || 'video';
    const created = dataService.savePlaylist({
      name,
      url,
      video_or_playlist_id,
      type,
      mood,
      category_id: null,
      is_favorite: false,
    });
    setCurrentPlaylist(created);
    return created;
  };

  const deletePlaylist = (id: string) => {
    dataService.deletePlaylist(id);
    if (currentPlaylist?.id === id) {
      const remaining = dataService.getPlaylists();
      setCurrentPlaylist(remaining[0] || null);
    }
  };

  return (
    <SoundContext.Provider
      value={{
        ambientSounds,
        masterVolume,
        toggleAmbientSound,
        setSoundVolume,
        setMasterVolume,
        stopAllAmbient,
        currentPlaylist,
        setCurrentPlaylist,
        isMusicPlaying,
        setIsMusicPlaying,
        playlists,
        addPlaylist,
        deletePlaylist,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within SoundProvider');
  return ctx;
};
