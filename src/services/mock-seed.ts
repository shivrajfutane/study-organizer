import {
  Category,
  Subject,
  Course,
  Module,
  Topic,
  Roadmap,
  Resource,
  ResourceCollection,
  Project,
  Task,
  Goal,
  StudySession,
  Note,
  SavedPlaylist,
  ActivityLog,
  UserProfile,
} from '@/types';

export const initialUserProfile: UserProfile = {
  id: '',
  email: '',
  full_name: 'Student',
  avatar_url: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  week_start: 'monday',
  daily_goal_minutes: 60,
  weekly_goal_hours: 10,
  dashboard_layout: {
    showStats: true,
    showCategories: true,
    showTodayPlan: true,
    showPomodoro: true,
    showMusic: true,
    showRoadmaps: true,
    showGoals: true,
    showProjects: true,
    showResources: true,
    showActivity: true,
  },
  timer_settings: {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
    soundEnabled: true,
  },
};

// Pure empty initial states — NO MOCK DATA OR PLACEHOLDERS
export const initialCategories: Category[] = [];
export const initialSubjects: Subject[] = [];
export const initialCourses: Course[] = [];
export const initialModules: Module[] = [];
export const initialTopics: Topic[] = [];
export const initialRoadmaps: Roadmap[] = [];
export const initialProjects: Project[] = [];
export const initialTasks: Task[] = [];
export const initialGoals: Goal[] = [];
export const initialResources: Resource[] = [];
export const initialResourceCollections: ResourceCollection[] = [];
export const initialStudySessions: StudySession[] = [];
export const initialNotes: Note[] = [];
export const initialActivityLog: ActivityLog[] = [];

// Valid curated YouTube study streams
export const initialSavedPlaylists: SavedPlaylist[] = [
  {
    id: 'stream-lofi',
    user_id: '',
    name: 'Lofi Girl — Beats to relax/study to',
    url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    video_or_playlist_id: '5qap5aO4i9A',
    type: 'video',
    mood: 'lofi',
    is_favorite: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'stream-synth',
    user_id: '',
    name: 'Synthwave Radio — Chill Synth',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    video_or_playlist_id: '4xDzrJKXOOY',
    type: 'video',
    mood: 'ambient',
    is_favorite: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'stream-classical',
    user_id: '',
    name: 'Classical Piano Focus (3 Hours)',
    url: 'https://www.youtube.com/watch?v=fLoWzp8gRK4',
    video_or_playlist_id: 'fLoWzp8gRK4',
    type: 'video',
    mood: 'classical',
    is_favorite: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'stream-chillhop',
    user_id: '',
    name: 'Chillhop Radio — Jazzy & Lofi Beats',
    url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
    video_or_playlist_id: 'DWcJFNfaw9c',
    type: 'video',
    mood: 'lofi',
    is_favorite: false,
    created_at: new Date().toISOString(),
  },
];
