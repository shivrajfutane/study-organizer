import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderTree,
  Play,
  Plus,
  BookOpen,
  Library,
  Briefcase,
  CheckSquare,
  Target,
  Clock,
  Calendar,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
} from 'lucide-react';
import { dataService } from '@/services/data-service';
import { useTimer } from '@/context/TimerContext';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date-utils';
import { QuickAddModal } from '@/components/layout/QuickAddModal';

export const CategoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'resources' | 'projects' | 'tasks' | 'goals' | 'history'>('overview');
  const [quickAddTab, setQuickAddTab] = useState<any>(null);
  const { startTimer, setActiveCategory } = useTimer();

  useEffect(() => {
    return dataService.subscribe(() => setTick((t) => t + 1));
  }, []);

  if (!id) return <div>Category not found.</div>;
  const category = dataService.getCategoryById(id);
  if (!category) {
    return (
      <div className="p-8 text-center space-y-3">
        <h2 className="text-lg font-bold text-foreground">Category Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested category might have been removed or reassigned.</p>
        <Button
          onClick={() => navigate('/categories')}
          size="sm"
          className="bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48]"
        >
          Return to Categories
        </Button>
      </div>
    );
  }

  const stats = dataService.getCategoryTopicStats(category.id);
  const hours = dataService.getCategoryStudyHours(category.id);
  const subjects = dataService.getSubjects(category.id);
  const topics = dataService.getTopics(undefined, category.id);
  const resources = dataService.getResources(category.id);
  const projects = dataService.getProjects(category.id);
  const tasks = dataService.getTasks({ categoryId: category.id });
  const goals = dataService.getGoals(category.id);
  const sessions = dataService.getStudySessions({ categoryId: category.id });
  const subcategories = dataService.getCategories().filter((c) => c.parent_id === category.id);

  const handleStartFocus = () => {
    setActiveCategory(category.id);
    startTimer();
    navigate('/focus');
  };

  const handleToggleTopic = (topId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    dataService.updateTopic(topId, { status: nextStatus });
  };

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    dataService.updateTask(taskId, { status: nextStatus });
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'subjects', label: `Subjects (${subjects.length})` },
    { id: 'resources', label: `Resources (${resources.length})` },
    { id: 'projects', label: `Projects (${projects.length})` },
    { id: 'tasks', label: `Tasks (${tasks.length})` },
    { id: 'goals', label: `Goals (${goals.length})` },
    { id: 'history', label: `History (${sessions.length})` },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/categories')}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to categories</span>
      </button>

      {/* Header Banner */}
      <div className="rounded-lg bg-card border border-border p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-md bg-elevated border border-border flex items-center justify-center shrink-0 text-primary">
              <CategoryIcon name={category.icon} className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight m-0 truncate">
                {category.name}
              </h1>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed m-0">
                {category.description || 'No description provided'}
              </p>
              {subcategories.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[11px] text-muted-foreground font-mono">Subcategories:</span>
                  {subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/categories/${sub.id}`}
                      className="text-[11px] px-2 py-0.5 rounded bg-elevated text-foreground hover:border-primary/50 font-mono transition-colors border border-border"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              onClick={() => setQuickAddTab('task')}
              size="sm"
              variant="outline"
              className="h-8 gap-1 text-xs border-border text-foreground hover:border-primary/50"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Add Record</span>
            </Button>
            <Button
              onClick={handleStartFocus}
              size="sm"
              className="h-8 gap-1.5 text-xs bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48] shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Focus</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-elevated text-primary border border-border font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-elevated/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-md bg-card border border-border">
              <span className="text-[11px] text-muted-foreground font-mono">Topic Mastery</span>
              <div className="text-xl font-bold text-primary mt-0.5 font-mono">{stats.progressPercentage}%</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono m-0">
                {stats.completedTopics}/{stats.totalTopics} topics
              </p>
            </div>

            <div className="p-3 rounded-md bg-card border border-border">
              <span className="text-[11px] text-muted-foreground font-mono">This Week</span>
              <div className="text-xl font-bold text-foreground mt-0.5 font-mono">
                {hours.thisWeekHours}h / {category.weekly_target_hours}h
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono m-0">
                {Math.max(0, category.weekly_target_hours - hours.thisWeekHours)}h remaining
              </p>
            </div>

            <div className="p-3 rounded-md bg-card border border-border">
              <span className="text-[11px] text-muted-foreground font-mono">Total Tracked</span>
              <div className="text-xl font-bold text-foreground mt-0.5 font-mono">{hours.totalHours}h</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono m-0">{hours.todayHours}h today</p>
            </div>

            <div className="p-3 rounded-md bg-card border border-border">
              <span className="text-[11px] text-muted-foreground font-mono">Pending Tasks</span>
              <div className="text-xl font-bold text-foreground mt-0.5 font-mono">
                {tasks.filter((t) => t.status === 'pending').length}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono m-0">{goals.length} goals</p>
            </div>
          </div>

          {/* Subjects and Topics Preview */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Subjects & Curriculum
              </CardTitle>
              <button
                onClick={() => setActiveTab('subjects')}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                View all subjects
              </button>
            </CardHeader>

            <CardContent className="pt-0">
              {subjects.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No subjects created in this category yet. Click "Add Record" to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subjects.map((s) => {
                    const subTopics = topics.filter((t) => t.subject_id === s.id);
                    const doneTopics = subTopics.filter((t) => t.status === 'completed').length;
                    const p = subTopics.length > 0 ? Math.round((doneTopics / subTopics.length) * 100) : 0;

                    return (
                      <div key={s.id} className="p-3 rounded-md bg-elevated border border-border space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-medium text-foreground text-xs m-0 truncate">{s.title}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 m-0">{s.description}</p>
                          </div>
                          <Badge variant="secondary">{s.priority}</Badge>
                        </div>

                        <Progress value={p} className="h-1.5" />

                        <div className="space-y-1 pt-1">
                          {subTopics.slice(0, 3).map((t) => (
                            <div
                              key={t.id}
                              onClick={() => handleToggleTopic(t.id, t.status)}
                              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer group"
                            >
                              {t.status === 'completed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span className={t.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}>
                                {t.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Subjects */}
      {activeTab === 'subjects' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-foreground m-0">All Subjects in {category.name}</h3>
            <Button
              onClick={() => setQuickAddTab('subject')}
              size="sm"
              className="h-7 text-xs bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48] gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Subject</span>
            </Button>
          </div>

          {subjects.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-md bg-card/30">
              No subjects yet. Click "Add Subject" to begin.
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map((sub) => {
                const subTopics = topics.filter((t) => t.subject_id === sub.id);
                return (
                  <Card key={sub.id} className="border-border bg-card p-4 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground m-0">{sub.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 m-0">{sub.description}</p>
                      </div>
                      <Badge variant="secondary">{sub.status}</Badge>
                    </div>

                    <div className="divide-y divide-border/60 pt-1">
                      {subTopics.map((top) => (
                        <div
                          key={top.id}
                          onClick={() => handleToggleTopic(top.id, top.status)}
                          className="py-2 flex items-center justify-between text-xs cursor-pointer hover:bg-elevated px-1.5 rounded transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {top.status === 'completed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className={top.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}>
                              {top.title}
                            </span>
                          </div>
                          <span className="font-mono text-muted-foreground text-[10px]">{top.estimated_minutes}m</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-foreground m-0">Tasks in {category.name}</h3>
            <Button
              onClick={() => setQuickAddTab('task')}
              size="sm"
              className="h-7 text-xs bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48] gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Task</span>
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-md bg-card/30">
              No tasks linked to this category yet.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-md bg-card border border-border"
                >
                  <div className="flex items-center gap-2.5">
                    <button onClick={() => handleToggleTask(task.id, task.status)} className="cursor-pointer">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-medium ${
                        task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{task.priority}</Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{task.estimated_minutes}m</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-foreground m-0">Resources in {category.name}</h3>
            <Button
              onClick={() => setQuickAddTab('resource')}
              size="sm"
              className="h-7 text-xs bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48] gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Resource</span>
            </Button>
          </div>

          {resources.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-md bg-card/30">
              No resources saved in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {resources.map((r) => (
                <div key={r.id} className="p-3 rounded-md bg-card border border-border space-y-1.5">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-foreground text-xs truncate m-0">{r.title}</h4>
                    <span className="text-[10px] uppercase font-mono text-muted-foreground bg-elevated px-1.5 py-0.5 rounded border border-border/50">
                      {r.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 m-0">{r.description}</p>
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 pt-0.5 font-mono"
                    >
                      Open Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-foreground m-0">Projects in {category.name}</h3>
            <Button
              onClick={() => setQuickAddTab('project')}
              size="sm"
              className="h-7 text-xs bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48] gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Project</span>
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-md bg-card/30">
              No projects linked to this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {projects.map((p) => (
                <div key={p.id} className="p-3 rounded-md bg-card border border-border space-y-1.5">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-foreground text-xs truncate m-0">{p.name}</h4>
                    <Badge variant="teal">{p.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 m-0">{p.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Goals */}
      {activeTab === 'goals' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-foreground m-0">Goals in {category.name}</h3>
            <Button
              onClick={() => setQuickAddTab('goal')}
              size="sm"
              className="h-7 text-xs bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48] gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Set Goal</span>
            </Button>
          </div>

          {goals.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-md bg-card/30">
              No goals set for this category yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {goals.map((g) => {
                const p = Math.min(100, Math.round((g.current_value / g.target_value) * 100));
                return (
                  <div key={g.id} className="p-3 rounded-md bg-card border border-border space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">{g.title}</span>
                      <span className="font-mono text-muted-foreground">
                        {g.current_value} / {g.target_value} {g.unit} ({p}%)
                      </span>
                    </div>
                    <Progress value={p} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Study History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground m-0">Study History in {category.name}</h3>
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-md bg-card/30">
              No completed focus sessions recorded in this category yet.
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((ses) => (
                <div
                  key={ses.id}
                  className="flex items-center justify-between p-2.5 rounded-md bg-card border border-border text-xs"
                >
                  <div>
                    <span className="font-medium text-foreground block capitalize">{ses.session_type.replace('_', ' ')}</span>
                    <span className="text-muted-foreground text-[10px] font-mono">{formatDate(ses.started_at, 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="text-right font-mono font-semibold text-primary">
                    {ses.duration_minutes} mins
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Add Modal */}
      {quickAddTab && (
        <QuickAddModal
          isOpen={Boolean(quickAddTab)}
          onClose={() => setQuickAddTab(null)}
          defaultTab={quickAddTab || 'task'}
        />
      )}
    </div>
  );
};
