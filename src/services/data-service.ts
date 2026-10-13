import {
  Category,
  Subject,
  Course,
  Module,
  Topic,
  Roadmap,
  RoadmapMilestone,
  Resource,
  ResourceCollection,
  Project,
  ProjectMilestone,
  Task,
  Goal,
  StudySession,
  Note,
  SavedPlaylist,
  ActivityLog,
  UserProfile,
} from '@/types';
import {
  initialUserProfile,
  initialCategories,
  initialSubjects,
  initialCourses,
  initialModules,
  initialTopics,
  initialRoadmaps,
  initialProjects,
  initialTasks,
  initialGoals,
  initialResources,
  initialResourceCollections,
  initialSavedPlaylists,
  initialStudySessions,
  initialNotes,
  initialActivityLog,
} from './mock-seed';
import { isDateInCurrentWeek, isDateToday } from '@/lib/date-utils';

const STORAGE_KEY = 'studyspace_clean_v2';
const LEGACY_STORAGE_KEY = 'studyspace_local_store_v1';

interface AppState {
  profile: UserProfile;
  categories: Category[];
  subjects: Subject[];
  courses: Course[];
  modules: Module[];
  topics: Topic[];
  roadmaps: Roadmap[];
  projects: Project[];
  tasks: Task[];
  goals: Goal[];
  resources: Resource[];
  collections: ResourceCollection[];
  playlists: SavedPlaylist[];
  sessions: StudySession[];
  notes: Note[];
  activity: ActivityLog[];
}

function loadInitialState(): AppState {
  try {
    if (typeof window !== 'undefined' && localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.categories && parsed.topics) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read localStorage state, falling back to seed data:', err);
  }

  return {
    profile: initialUserProfile,
    categories: initialCategories,
    subjects: initialSubjects,
    courses: initialCourses,
    modules: initialModules,
    topics: initialTopics,
    roadmaps: initialRoadmaps,
    projects: initialProjects,
    tasks: initialTasks,
    goals: initialGoals,
    resources: initialResources,
    collections: initialResourceCollections,
    playlists: initialSavedPlaylists,
    sessions: initialStudySessions,
    notes: initialNotes,
    activity: initialActivityLog,
  };
}

class DataService {
  private state: AppState = loadInitialState();
  private listeners: Set<() => void> = new Set();

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Storage persistence error:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // ==================== PROFILE ====================
  public getProfile(): UserProfile {
    return { ...this.state.profile };
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    this.state.profile = { ...this.state.profile, ...updates, updated_at: new Date().toISOString() };
    this.persist();
    return this.getProfile();
  }

  // ==================== CATEGORIES & TAXONOMY ====================
  public getCategories(includeArchived = false): Category[] {
    return this.state.categories.filter((c) => includeArchived || !c.is_archived);
  }

  public getCategoryById(id: string): Category | undefined {
    return this.state.categories.find((c) => c.id === id);
  }

  /**
   * Returns all descendant IDs of a category including itself.
   */
  public getCategoryAndDescendantIds(categoryId: string): string[] {
    const result = new Set<string>([categoryId]);
    let added = true;
    while (added) {
      added = false;
      for (const cat of this.state.categories) {
        if (cat.parent_id && result.has(cat.parent_id) && !result.has(cat.id)) {
          result.add(cat.id);
          added = true;
        }
      }
    }
    return Array.from(result);
  }

  /**
   * Calculates category progress: Unique completed topics / Unique total topics * 100
   * Accounts for subcategories without double-counting topics.
   */
  public getCategoryTopicStats(categoryId: string): {
    totalTopics: number;
    completedTopics: number;
    progressPercentage: number;
    hasTopics: boolean;
  } {
    const allCatIds = this.getCategoryAndDescendantIds(categoryId);
    // Find all unique topics belonging directly or via subject to these categories
    const matchingTopics = this.state.topics.filter((t) => {
      if (t.category_id && allCatIds.includes(t.category_id)) return true;
      const subj = this.state.subjects.find((s) => s.id === t.subject_id);
      return subj && subj.category_id && allCatIds.includes(subj.category_id);
    });

    // Unique topics by ID
    const uniqueTopicsMap = new Map<string, Topic>();
    matchingTopics.forEach((t) => uniqueTopicsMap.set(t.id, t));
    const uniqueTopics = Array.from(uniqueTopicsMap.values());

    const totalTopics = uniqueTopics.length;
    const completedTopics = uniqueTopics.filter((t) => t.status === 'completed').length;
    const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      totalTopics,
      completedTopics,
      progressPercentage,
      hasTopics: totalTopics > 0,
    };
  }

  /**
   * Calculates study hours spent in category (overall, this week, today)
   */
  public getCategoryStudyHours(categoryId: string): {
    totalHours: number;
    thisWeekHours: number;
    todayHours: number;
  } {
    const allCatIds = this.getCategoryAndDescendantIds(categoryId);
    const sessions = this.state.sessions.filter((s) => {
      if (!s.is_completed) return false;
      if (s.category_id && allCatIds.includes(s.category_id)) return true;
      if (s.subject_id) {
        const sub = this.state.subjects.find((sub) => sub.id === s.subject_id);
        if (sub && sub.category_id && allCatIds.includes(sub.category_id)) return true;
      }
      return false;
    });

    let totalMins = 0;
    let weekMins = 0;
    let todayMins = 0;

    sessions.forEach((s) => {
      totalMins += s.duration_minutes;
      if (isDateInCurrentWeek(s.started_at)) {
        weekMins += s.duration_minutes;
      }
      if (isDateToday(s.started_at)) {
        todayMins += s.duration_minutes;
      }
    });

    return {
      totalHours: Math.round((totalMins / 60) * 10) / 10,
      thisWeekHours: Math.round((weekMins / 60) * 10) / 10,
      todayHours: Math.round((todayMins / 60) * 10) / 10,
    };
  }

  public createCategory(input: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Category {
    const newCat: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: this.state.profile.id,
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.categories.push(newCat);
    this.logActivity('created', 'category', `Created category: ${newCat.name}`, newCat.id);
    this.persist();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.state.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    // Prevent circular parent hierarchy:
    if (updates.parent_id) {
      if (updates.parent_id === id) {
        throw new Error('A category cannot be its own parent.');
      }
      const descendantIds = this.getCategoryAndDescendantIds(id);
      if (descendantIds.includes(updates.parent_id)) {
        throw new Error('Circular dependency: cannot set a subcategory as parent.');
      }
    }

    this.state.categories[index] = {
      ...this.state.categories[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.state.categories[index];
  }

  public deleteCategory(id: string, reassignToId: string | null = null): void {
    const target = this.getCategoryById(id);
    if (!target) return;

    // Handle subcategories: lift them to target's parent or set parent to null
    this.state.categories = this.state.categories.map((c) => {
      if (c.parent_id === id) {
        return { ...c, parent_id: target.parent_id || null };
      }
      return c;
    });

    // Reassign or uncategorize linked records
    this.state.subjects = this.state.subjects.map((s) => (s.category_id === id ? { ...s, category_id: reassignToId } : s));
    this.state.topics = this.state.topics.map((t) => (t.category_id === id ? { ...t, category_id: reassignToId } : t));
    this.state.tasks = this.state.tasks.map((t) => (t.category_id === id ? { ...t, category_id: reassignToId } : t));
    this.state.projects = this.state.projects.map((p) => (p.category_id === id ? { ...p, category_id: reassignToId } : p));
    this.state.goals = this.state.goals.map((g) => (g.category_id === id ? { ...g, category_id: reassignToId } : g));
    this.state.resources = this.state.resources.map((r) => (r.category_id === id ? { ...r, category_id: reassignToId } : r));
    this.state.roadmaps = this.state.roadmaps.map((rm) => (rm.category_id === id ? { ...rm, category_id: reassignToId } : rm));
    this.state.notes = this.state.notes.map((n) => (n.category_id === id ? { ...n, category_id: reassignToId } : n));
    this.state.sessions = this.state.sessions.map((ses) => (ses.category_id === id ? { ...ses, category_id: reassignToId } : ses));

    this.state.categories = this.state.categories.filter((c) => c.id !== id);
    this.logActivity('deleted', 'category', `Deleted category: ${target.name}`, id);
    this.persist();
  }

  public getCategoryAssociatedCounts(id: string): {
    subcategories: number;
    subjects: number;
    topics: number;
    tasks: number;
    projects: number;
    goals: number;
    resources: number;
  } {
    return {
      subcategories: this.state.categories.filter((c) => c.parent_id === id).length,
      subjects: this.state.subjects.filter((s) => s.category_id === id).length,
      topics: this.state.topics.filter((t) => t.category_id === id).length,
      tasks: this.state.tasks.filter((t) => t.category_id === id).length,
      projects: this.state.projects.filter((p) => p.category_id === id).length,
      goals: this.state.goals.filter((g) => g.category_id === id).length,
      resources: this.state.resources.filter((r) => r.category_id === id).length,
    };
  }

  // ==================== SUBJECTS & COURSES ====================
  public getSubjects(categoryId?: string): Subject[] {
    if (!categoryId) return [...this.state.subjects];
    const catIds = this.getCategoryAndDescendantIds(categoryId);
    return this.state.subjects.filter((s) => s.category_id && catIds.includes(s.category_id));
  }

  public createSubject(input: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Subject {
    const newSubject: Subject = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: this.state.profile.id,
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.subjects.push(newSubject);
    this.logActivity('created', 'subject', `Added subject: ${newSubject.title}`, newSubject.id);
    this.persist();
    return newSubject;
  }

  public updateSubject(id: string, updates: Partial<Subject>): Subject | null {
    const idx = this.state.subjects.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.state.subjects[idx] = { ...this.state.subjects[idx], ...updates, updated_at: new Date().toISOString() };
    this.persist();
    return this.state.subjects[idx];
  }

  public deleteSubject(id: string): void {
    const sub = this.state.subjects.find((s) => s.id === id);
    this.state.subjects = this.state.subjects.filter((s) => s.id !== id);
    // Unlink topics or remove
    this.state.topics = this.state.topics.filter((t) => t.subject_id !== id);
    if (sub) this.logActivity('deleted', 'subject', `Removed subject: ${sub.title}`, id);
    this.persist();
  }

  // ==================== TOPICS ====================
  public getTopics(subjectId?: string, categoryId?: string): Topic[] {
    let list = [...this.state.topics];
    if (subjectId) {
      list = list.filter((t) => t.subject_id === subjectId);
    }
    if (categoryId) {
      const catIds = this.getCategoryAndDescendantIds(categoryId);
      list = list.filter((t) => (t.category_id && catIds.includes(t.category_id)) || (
        this.state.subjects.some((s) => s.id === t.subject_id && s.category_id && catIds.includes(s.category_id))
      ));
    }
    return list;
  }

  public createTopic(input: Omit<Topic, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Topic {
    const newTopic: Topic = {
      id: `top-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: this.state.profile.id,
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.topics.push(newTopic);
    this.logActivity('created', 'topic', `Added topic: ${newTopic.title}`, newTopic.id);
    this.persist();
    return newTopic;
  }

  public updateTopic(id: string, updates: Partial<Topic>): Topic | null {
    const idx = this.state.topics.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const oldStatus = this.state.topics[idx].status;
    const nextStatus = updates.status !== undefined ? updates.status : oldStatus;

    const completed_at =
      nextStatus === 'completed' && oldStatus !== 'completed'
        ? new Date().toISOString()
        : nextStatus !== 'completed'
        ? null
        : this.state.topics[idx].completed_at;

    this.state.topics[idx] = {
      ...this.state.topics[idx],
      ...updates,
      completed_at,
      updated_at: new Date().toISOString(),
    };

    if (oldStatus !== 'completed' && nextStatus === 'completed') {
      this.logActivity('completed', 'topic', `Completed topic: ${this.state.topics[idx].title}`, id);
    }

    this.persist();
    return this.state.topics[idx];
  }

  public deleteTopic(id: string): void {
    const t = this.state.topics.find((item) => item.id === id);
    this.state.topics = this.state.topics.filter((item) => item.id !== id);
    if (t) this.logActivity('deleted', 'topic', `Deleted topic: ${t.title}`, id);
    this.persist();
  }

  // ==================== ROADMAPS ====================
  public getRoadmaps(categoryId?: string): Roadmap[] {
    if (!categoryId) return [...this.state.roadmaps];
    const catIds = this.getCategoryAndDescendantIds(categoryId);
    return this.state.roadmaps.filter((r) => r.category_id && catIds.includes(r.category_id));
  }

  public createRoadmap(input: Omit<Roadmap, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Roadmap {
    const newRoadmap: Roadmap = {
      id: `rdm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: this.state.profile.id,
      ...input,
      milestones: input.milestones || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.roadmaps.push(newRoadmap);
    this.logActivity('created', 'roadmap', `Created roadmap: ${newRoadmap.title}`, newRoadmap.id);
    this.persist();
    return newRoadmap;
  }

  public updateRoadmap(id: string, updates: Partial<Roadmap>): Roadmap | null {
    const idx = this.state.roadmaps.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.state.roadmaps[idx] = { ...this.state.roadmaps[idx], ...updates, updated_at: new Date().toISOString() };
    this.persist();
    return this.state.roadmaps[idx];
  }

  public deleteRoadmap(id: string): void {
    this.state.roadmaps = this.state.roadmaps.filter((r) => r.id !== id);
    this.persist();
  }

  public toggleMilestone(roadmapId: string, milestoneId: string): void {
    const rdm = this.state.roadmaps.find((r) => r.id === roadmapId);
    if (!rdm || !rdm.milestones) return;
    const ms = rdm.milestones.find((m) => m.id === milestoneId);
    if (!ms) return;
    ms.is_completed = !ms.is_completed;
    ms.completed_at = ms.is_completed ? new Date().toISOString() : null;
    if (ms.is_completed) {
      this.logActivity('completed', 'milestone', `Completed milestone: ${ms.title}`, ms.id);
    }
    this.persist();
  }

  public addMilestone(roadmapId: string, title: string, targetDate?: string): void {
    const rdm = this.state.roadmaps.find((r) => r.id === roadmapId);
    if (!rdm) return;
    if (!rdm.milestones) rdm.milestones = [];
    const newMs: RoadmapMilestone = {
      id: `ms-${Date.now()}`,
      roadmap_id: roadmapId,
      user_id: this.state.profile.id,
      title,
      is_completed: false,
      target_date: targetDate || null,
      sort_order: rdm.milestones.length + 1,
      created_at: new Date().toISOString(),
    };
    rdm.milestones.push(newMs);
    this.persist();
  }

  // ==================== PROJECTS ====================
  public getProjects(categoryId?: string): Project[] {
    if (!categoryId) return [...this.state.projects];
    const catIds = this.getCategoryAndDescendantIds(categoryId);
    return this.state.projects.filter((p) => p.category_id && catIds.includes(p.category_id));
  }

  public createProject(input: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Project {
    const newProj: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: this.state.profile.id,
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.projects.push(newProj);
    this.logActivity('created', 'project', `Started project: ${newProj.name}`, newProj.id);
    this.persist();
    return newProj;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | null {
    const idx = this.state.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.state.projects[idx] = { ...this.state.projects[idx], ...updates, updated_at: new Date().toISOString() };
    this.persist();
    return this.state.projects[idx];
  }

  public deleteProject(id: string): void {
    this.state.projects = this.state.projects.filter((p) => p.id !== id);
    this.persist();
  }

  // ==================== TASKS ====================
  public getTasks(filters?: { categoryId?: string; isTodayPlan?: boolean; status?: string }): Task[] {
    let list = [...this.state.tasks];
    if (filters?.categoryId) {
      const catIds = this.getCategoryAndDescendantIds(filters.categoryId);
      list = list.filter((t) => t.category_id && catIds.includes(t.category_id));
    }
    if (filters?.isTodayPlan !== undefined) {
      list = list.filter((t) => t.is_today_plan === filters.isTodayPlan);
    }
    if (filters?.status) {
      list = list.filter((t) => t.status === filters.status);
    }
    return list;
  }

  public createTask(input: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Task {
    const newTask: Task = {
      id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: this.state.profile.id,
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.tasks.push(newTask);
    this.logActivity('created', 'task', `Created task: ${newTask.title}`, newTask.id);
    this.persist();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const idx = this.state.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const oldStatus = this.state.tasks[idx].status;
    const nextStatus = updates.status !== undefined ? updates.status : oldStatus;

    const completed_at =
      nextStatus === 'completed' && oldStatus !== 'completed'
        ? new Date().toISOString()
        : nextStatus !== 'completed'
        ? null
        : this.state.tasks[idx].completed_at;

    this.state.tasks[idx] = {
      ...this.state.tasks[idx],
      ...updates,
      completed_at,
      updated_at: new Date().toISOString(),
    };

    if (oldStatus !== 'completed' && nextStatus === 'completed') {
      this.logActivity('completed', 'task', `Completed task: ${this.state.tasks[idx].title}`, id);
    }

    this.persist();
    return this.state.tasks[idx];
  }

  public deleteTask(id: string): void {
    this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
    this.persist();
  }

  // ==================== GOALS ====================
  public getGoals(categoryId?: string): Goal[] {
    if (!categoryId) return [...this.state.goals];
    const catIds = this.getCategoryAndDescendantIds(categoryId);
    return this.state.goals.filter((g) => g.category_id && catIds.includes(g.category_id));
  }

  public createGoal(input: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Goal {
    const newGoal: Goal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: this.state.profile.id,
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.goals.push(newGoal);
    this.logActivity('created', 'goal', `Set new goal: ${newGoal.title}`, newGoal.id);
    this.persist();
    return newGoal;
  }

  public updateGoal(id: string, updates: Partial<Goal>): Goal | null {
    const idx = this.state.goals.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    this.state.goals[idx] = { ...this.state.goals[idx], ...updates, updated_at: new Date().toISOString() };
    this.persist();
    return this.state.goals[idx];
  }

  public deleteGoal(id: string): void {
    this.state.goals = this.state.goals.filter((g) => g.id !== id);
    this.persist();
  }

  // ==================== RESOURCES & COLLECTIONS ====================
  public getResources(categoryId?: string): Resource[] {
    if (!categoryId) return [...this.state.resources];
    const catIds = this.getCategoryAndDescendantIds(categoryId);
    return this.state.resources.filter((r) => r.category_id && catIds.includes(r.category_id));
  }

  public createResource(input: Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Resource {
    const newRes: Resource = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: this.state.profile.id,
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.resources.push(newRes);
    this.logActivity('created', 'resource', `Added resource: ${newRes.title}`, newRes.id);
    this.persist();
    return newRes;
  }

  public updateResource(id: string, updates: Partial<Resource>): Resource | null {
    const idx = this.state.resources.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.state.resources[idx] = { ...this.state.resources[idx], ...updates, updated_at: new Date().toISOString() };
    this.persist();
    return this.state.resources[idx];
  }

  public deleteResource(id: string): void {
    this.state.resources = this.state.resources.filter((r) => r.id !== id);
    this.persist();
  }

  public getCollections(): ResourceCollection[] {
    return [...this.state.collections];
  }

  public createCollection(title: string, description?: string, color?: string): ResourceCollection {
    const col: ResourceCollection = {
      id: `col-${Date.now()}`,
      user_id: this.state.profile.id,
      title,
      description,
      color: color || '#D6FF62',
      created_at: new Date().toISOString(),
    };
    this.state.collections.push(col);
    this.persist();
    return col;
  }

  public deleteCollection(id: string): void {
    this.state.collections = this.state.collections.filter((c) => c.id !== id);
    this.persist();
  }

  // ==================== STUDY SESSIONS ====================
  public getStudySessions(filters?: { categoryId?: string; days?: number }): StudySession[] {
    let list = [...this.state.sessions];
    if (filters?.categoryId) {
      const catIds = this.getCategoryAndDescendantIds(filters.categoryId);
      list = list.filter((s) => s.category_id && catIds.includes(s.category_id));
    }
    if (filters?.days) {
      const cutoff = new Date(Date.now() - filters.days * 86400000);
      list = list.filter((s) => new Date(s.started_at) >= cutoff);
    }
    return list.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }

  public recordStudySession(session: Omit<StudySession, 'id' | 'user_id' | 'created_at'>): StudySession {
    const newSession: StudySession = {
      id: `ses-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: this.state.profile.id,
      ...session,
      created_at: new Date().toISOString(),
    };
    this.state.sessions.push(newSession);

    // If linked to a task, update actual_minutes
    if (newSession.task_id) {
      const t = this.state.tasks.find((task) => task.id === newSession.task_id);
      if (t) {
        t.actual_minutes += newSession.duration_minutes;
      }
    }
    // If linked to a topic, update actual_minutes
    if (newSession.topic_id) {
      const top = this.state.topics.find((topic) => topic.id === newSession.topic_id);
      if (top) {
        top.actual_minutes += newSession.duration_minutes;
      }
    }

    this.logActivity('session_finished', 'study_session', `Completed ${newSession.duration_minutes}m ${newSession.session_type} session`, newSession.id);
    this.persist();
    return newSession;
  }

  // ==================== NOTES ====================
  public getNotes(categoryId?: string): Note[] {
    if (!categoryId) return [...this.state.notes];
    const catIds = this.getCategoryAndDescendantIds(categoryId);
    return this.state.notes.filter((n) => n.category_id && catIds.includes(n.category_id));
  }

  public createNote(input: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Note {
    const newNote: Note = {
      id: `nt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: this.state.profile.id,
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.notes.push(newNote);
    this.logActivity('created', 'note', `Created note: ${newNote.title}`, newNote.id);
    this.persist();
    return newNote;
  }

  public updateNote(id: string, updates: Partial<Note>): Note | null {
    const idx = this.state.notes.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    this.state.notes[idx] = { ...this.state.notes[idx], ...updates, updated_at: new Date().toISOString() };
    this.persist();
    return this.state.notes[idx];
  }

  public deleteNote(id: string): void {
    this.state.notes = this.state.notes.filter((n) => n.id !== id);
    this.persist();
  }

  // ==================== PLAYLISTS ====================
  public getPlaylists(): SavedPlaylist[] {
    return [...this.state.playlists];
  }

  public savePlaylist(input: Omit<SavedPlaylist, 'id' | 'user_id' | 'created_at'>): SavedPlaylist {
    const pl: SavedPlaylist = {
      id: `pl-${Date.now()}`,
      user_id: this.state.profile.id,
      ...input,
      created_at: new Date().toISOString(),
    };
    this.state.playlists.push(pl);
    this.persist();
    return pl;
  }

  public deletePlaylist(id: string): void {
    this.state.playlists = this.state.playlists.filter((p) => p.id !== id);
    this.persist();
  }

  // ==================== ACTIVITY LOG ====================
  public getActivityLog(limit = 20): ActivityLog[] {
    return [...this.state.activity]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  private logActivity(action_type: string, entity_type: string, title: string, entity_id?: string) {
    const entry: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      user_id: this.state.profile.id,
      action_type,
      entity_type,
      entity_id,
      title,
      created_at: new Date().toISOString(),
    };
    this.state.activity.unshift(entry);
    if (this.state.activity.length > 100) {
      this.state.activity = this.state.activity.slice(0, 100);
    }
  }

  // ==================== OVERALL METRICS & CALCULATIONS ====================
  public getOverallStats() {
    const activeCategories = this.state.categories.filter((c) => !c.is_archived);
    const activeSubjects = this.state.subjects.filter((s) => s.status !== 'completed');
    const totalCourses = this.state.courses.length;

    // Unique topics count
    const uniqueTopicsMap = new Map<string, Topic>();
    this.state.topics.forEach((t) => uniqueTopicsMap.set(t.id, t));
    const uniqueTopics = Array.from(uniqueTopicsMap.values());
    const totalTopics = uniqueTopics.length;
    const completedTopics = uniqueTopics.filter((t) => t.status === 'completed').length;
    const overallLearningProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const activeRoadmaps = this.state.roadmaps.filter((r) => r.status === 'in_progress').length;
    const activeProjects = this.state.projects.filter((p) => p.status === 'in_progress').length;
    const pendingTasks = this.state.tasks.filter((t) => t.status === 'pending').length;
    const completedTasks = this.state.tasks.filter((t) => t.status === 'completed').length;
    const activeGoals = this.state.goals.filter((g) => g.status === 'active').length;

    // Focus minutes today & study hours this week
    let focusMinutesToday = 0;
    let weekStudyMinutes = 0;
    const studyDays = new Set<string>();

    this.state.sessions.forEach((s) => {
      if (!s.is_completed) return;
      if (isDateToday(s.started_at)) {
        focusMinutesToday += s.duration_minutes;
      }
      if (isDateInCurrentWeek(s.started_at)) {
        weekStudyMinutes += s.duration_minutes;
      }
      studyDays.add(s.started_at.split('T')[0]);
    });

    // Calculate current study streak
    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const checkDate = new Date();
    // If studied today, start from today, else start from yesterday
    if (!studyDays.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (studyDays.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      activeCategoriesCount: activeCategories.length,
      activeSubjectsCount: activeSubjects.length,
      totalCourses,
      totalTopics,
      completedTopics,
      overallLearningProgress,
      activeRoadmaps,
      activeProjects,
      pendingTasks,
      completedTasks,
      activeGoals,
      focusMinutesToday,
      studyHoursThisWeek: Math.round((weekStudyMinutes / 60) * 10) / 10,
      currentStreak: streak,
    };
  }

  // ==================== EXPORT & BACKUP ====================
  public exportJSON(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public exportCSV(entityType: 'tasks' | 'topics' | 'sessions'): string {
    if (entityType === 'tasks') {
      const headers = ['id', 'title', 'category_id', 'status', 'priority', 'due_date', 'estimated_minutes', 'actual_minutes'];
      const rows = this.state.tasks.map((t) => [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        t.category_id || '',
        t.status,
        t.priority,
        t.due_date || '',
        t.estimated_minutes,
        t.actual_minutes,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }
    if (entityType === 'topics') {
      const headers = ['id', 'title', 'category_id', 'subject_id', 'status', 'estimated_minutes', 'actual_minutes', 'completed_at'];
      const rows = this.state.topics.map((t) => [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        t.category_id || '',
        t.subject_id,
        t.status,
        t.estimated_minutes,
        t.actual_minutes,
        t.completed_at || '',
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }
    const headers = ['id', 'session_type', 'duration_minutes', 'started_at', 'ended_at', 'category_id', 'subject_id', 'notes'];
    const rows = this.state.sessions.map((s) => [
      s.id,
      s.session_type,
      s.duration_minutes,
      s.started_at,
      s.ended_at,
      s.category_id || '',
      s.subject_id || '',
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public resetToDefaultSeed(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.state = loadInitialState();
    this.persist();
  }
}

export const dataService = new DataService();
