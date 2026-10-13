export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Status = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'planned' | 'paused' | 'archived';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'canceled';

export type ResourceType =
  | 'pdf'
  | 'document'
  | 'youtube_video'
  | 'youtube_playlist'
  | 'website'
  | 'article'
  | 'github_repo'
  | 'course'
  | 'documentation'
  | 'other';

export type ResourceStatus = 'to_learn' | 'in_progress' | 'completed' | 'archived';

export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export type GoalMeasurement = 'number' | 'hours' | 'topics' | 'tasks' | 'percentage';

export type SessionType = 'pomodoro' | 'short_break' | 'long_break' | 'manual_study' | 'deep_work';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  timezone: string;
  week_start: 'monday' | 'sunday';
  daily_goal_minutes: number;
  weekly_goal_hours: number;
  dashboard_layout: {
    showStats: boolean;
    showCategories: boolean;
    showTodayPlan: boolean;
    showPomodoro: boolean;
    showMusic: boolean;
    showRoadmaps: boolean;
    showGoals: boolean;
    showProjects: boolean;
    showResources: boolean;
    showActivity: boolean;
  };
  timer_settings: {
    focusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    longBreakInterval: number;
    autoStartBreaks: boolean;
    autoStartFocus: boolean;
    soundEnabled: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  user_id: string;
  parent_id?: string | null;
  name: string;
  description?: string;
  icon: string;
  color: string;
  daily_target_hours: number;
  weekly_target_hours: number;
  target_date?: string | null;
  is_archived: boolean;
  sort_order: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  category_id?: string | null;
  title: string;
  description?: string;
  priority: Priority;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  target_date?: string | null;
  estimated_hours: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  platform?: string;
  url?: string;
  instructor?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  user_id: string;
  subject_id: string;
  course_id?: string | null;
  title: string;
  sort_order: number;
  created_at: string;
}

export interface Topic {
  id: string;
  user_id: string;
  category_id?: string | null;
  subject_id: string;
  module_id?: string | null;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  estimated_minutes: number;
  actual_minutes: number;
  completed_at?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  category_id?: string | null;
  title: string;
  description?: string;
  priority: Priority;
  status: 'planned' | 'in_progress' | 'completed' | 'paused';
  start_date?: string | null;
  target_date?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
  milestones?: RoadmapMilestone[];
}

export interface RoadmapMilestone {
  id: string;
  roadmap_id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  sort_order: number;
  created_at: string;
}

export interface Resource {
  id: string;
  user_id: string;
  category_id?: string | null;
  subject_id?: string | null;
  topic_id?: string | null;
  project_id?: string | null;
  title: string;
  description?: string;
  type: ResourceType;
  url?: string;
  file_path?: string | null;
  file_size_bytes?: number | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  priority: Priority;
  status: ResourceStatus;
  is_favorite: boolean;
  tags: string[];
  notes?: string;
  last_accessed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResourceCollection {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  color: string;
  created_at: string;
}

export interface ResourceCollectionItem {
  collection_id: string;
  resource_id: string;
  added_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  category_id?: string | null;
  name: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'paused' | 'completed' | 'archived';
  priority: Priority;
  start_date?: string | null;
  deadline?: string | null;
  github_url?: string;
  live_url?: string;
  docs_url?: string;
  tech_stack: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  deadline?: string | null;
  sort_order: number;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  category_id?: string | null;
  subject_id?: string | null;
  project_id?: string | null;
  roadmap_id?: string | null;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  due_date?: string | null;
  scheduled_time?: string | null;
  estimated_minutes: number;
  actual_minutes: number;
  is_today_plan: boolean;
  tags: string[];
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  category_id?: string | null;
  title: string;
  description?: string;
  period: GoalPeriod;
  target_date?: string | null;
  priority: Priority;
  status: 'active' | 'completed' | 'abandoned';
  measurement_type: GoalMeasurement;
  target_value: number;
  current_value: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  category_id?: string | null;
  subject_id?: string | null;
  topic_id?: string | null;
  task_id?: string | null;
  project_id?: string | null;
  session_type: SessionType;
  duration_minutes: number;
  started_at: string;
  ended_at: string;
  notes?: string;
  is_completed: boolean;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  category_id?: string | null;
  subject_id?: string | null;
  topic_id?: string | null;
  project_id?: string | null;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedPlaylist {
  id: string;
  user_id: string;
  category_id?: string | null;
  name: string;
  url: string;
  video_or_playlist_id: string;
  type: 'video' | 'playlist';
  mood: string;
  is_favorite: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id?: string;
  title: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}
