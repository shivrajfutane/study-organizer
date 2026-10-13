import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit2,
  FileText,
} from 'lucide-react';
import { dataService } from '@/services/data-service';
import { Project, Priority } from '@/types';
import { Badge } from '@/components/ui/badge';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/date-utils';

export const ProjectsPage: React.FC = () => {
  const [, setTick] = useState(0);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  useEffect(() => {
    return dataService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const projects = dataService.getProjects();
  const categories = dataService.getCategories();

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const stack = techStackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    dataService.createProject({
      name: name.trim(),
      description: description.trim(),
      category_id: categoryId || null,
      status: 'in_progress',
      priority,
      github_url: githubUrl.trim(),
      live_url: liveUrl.trim(),
      tech_stack: stack.length > 0 ? stack : ['React', 'TypeScript'],
      deadline: deadline || null,
    });

    setName('');
    setDescription('');
    setGithubUrl('');
    setLiveUrl('');
    setTechStackInput('');
    setIsCreateOpen(false);
  };

  const handleStatusChange = (projId: string, nextStatus: Project['status']) => {
    dataService.updateProject(projId, { status: nextStatus });
  };

  const kanbanColumns: { id: Project['status']; title: string; color: string }[] = [
    { id: 'planned', title: 'Planned', color: '#64748b' },
    { id: 'in_progress', title: 'In Progress', color: '#63D6C5' },
    { id: 'paused', title: 'On Hold / Paused', color: '#f59e0b' },
    { id: 'completed', title: 'Completed', color: '#10b981' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F3F5F7] tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-[#63D6C5]" />
            Project & Repository Manager
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Build tracks, GitHub integrations, Kanban boards, and milestone deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-xl bg-[#141820] border border-[#272E38] text-xs flex">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                viewMode === 'kanban' ? 'bg-[#D6FF62] text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                viewMode === 'list' ? 'bg-[#D6FF62] text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl bg-[#141820] border border-[#272E38] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1A2029] border border-[#272E38] flex items-center justify-center mx-auto text-[#63D6C5]">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#F3F5F7]">No projects created yet</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Track software applications, research repositories, and coursework implementations across structured Kanban stages.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {kanbanColumns.map((col) => {
                const colProjects = projects.filter((p) => p.status === col.id);

                return (
                  <div key={col.id} className="rounded-2xl bg-[#141820] border border-[#272E38] p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#272E38]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                        <h3 className="font-bold text-[#F3F5F7] text-sm">{col.title}</h3>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#929BA8] bg-[#1A2029] border border-[#272E38] px-2 py-0.5 rounded-full">
                        {colProjects.length}
                      </span>
                    </div>

                    <div className="space-y-3 min-h-[300px]">
                      {colProjects.length === 0 ? (
                        <div className="py-8 text-center text-xs text-zinc-500 italic">No projects</div>
                      ) : (
                        colProjects.map((p) => {
                          const cat = p.category_id ? dataService.getCategoryById(p.category_id) : null;
                          const tasks = dataService.getTasks().filter((t) => t.project_id === p.id);
                          const doneTasks = tasks.filter((t) => t.status === 'completed').length;
                          const taskProgress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

                          return (
                            <div
                              key={p.id}
                              className="rounded-xl bg-[#1A2029] border border-[#272E38] p-4 space-y-3 hover:border-[#63D6C5]/50 transition-all shadow-sm"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-[#F3F5F7] text-sm tracking-tight truncate">{p.name}</h4>
                                  <Badge priority={p.priority} />
                                </div>
                                <p className="text-xs text-[#929BA8] line-clamp-2 mt-1">{p.description}</p>
                              </div>

                              {cat && (
                                <span
                                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
                                  style={{ color: cat.color }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                  {cat.name}
                                </span>
                              )}

                              {p.tech_stack && p.tech_stack.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {p.tech_stack.slice(0, 3).map((tech) => (
                                    <span
                                      key={tech}
                                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#141820] border border-[#272E38] text-[#929BA8] font-mono"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <ProgressBar value={taskProgress} color={col.color} size="sm" showLabel />

                              {/* Quick Status Mover Dropdown */}
                              <div className="pt-2 border-t border-[#272E38] flex items-center justify-between text-xs">
                                <select
                                  value={p.status}
                                  onChange={(e) => handleStatusChange(p.id, e.target.value as any)}
                                  className="bg-[#141820] text-[#F3F5F7] border border-[#272E38] rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                                >
                                  <option value="planned">Planned</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="paused">Paused</option>
                                  <option value="completed">Completed</option>
                                </select>

                                <div className="flex items-center gap-1.5">
                                  {p.github_url && (
                                    <a
                                      href={p.github_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#929BA8] hover:text-[#F3F5F7] p-1"
                                    >
                                      <GithubIcon className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  {p.live_url && (
                                    <a
                                      href={p.live_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#929BA8] hover:text-[#F3F5F7] p-1"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-[#141820] border border-[#272E38] flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-[#F3F5F7] text-base">{p.name}</h3>
                      <Badge status={p.status} />
                      <Badge priority={p.priority} />
                    </div>
                    <p className="text-xs text-[#929BA8] mt-1">{p.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {p.deadline && (
                      <span className="text-xs text-[#929BA8] font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due {formatDate(p.deadline, 'MMM d, yyyy')}
                      </span>
                    )}
                    <button
                      onClick={() => dataService.deleteProject(p.id)}
                      className="p-2 rounded-xl bg-[#1A2029] border border-[#272E38] hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., PacketSentinel or Cloud Infrastructure"
              className="w-full px-3 py-2 rounded-xl bg-[#1A2029] border border-[#272E38] text-sm text-[#F3F5F7] focus:border-[#D6FF62] focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Architecture, requirements, or problem solved"
              className="w-full px-3 py-2 rounded-xl bg-[#1A2029] border border-[#272E38] text-sm text-[#F3F5F7] focus:border-[#D6FF62] focus:outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1A2029] border border-[#272E38] text-sm text-[#F3F5F7] focus:border-[#D6FF62] focus:outline-none"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-[#1A2029] border border-[#272E38] text-sm text-[#F3F5F7] focus:border-[#D6FF62] focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">GitHub URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 rounded-xl bg-[#1A2029] border border-[#272E38] text-sm text-[#F3F5F7] focus:border-[#D6FF62] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Live Demo / Docs URL</label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-[#1A2029] border border-[#272E38] text-sm text-[#F3F5F7] focus:border-[#D6FF62] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Tech Stack (comma-separated)</label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="e.g., Rust, Tokio, eBPF, Docker"
              className="w-full px-3 py-2 rounded-xl bg-[#1A2029] border border-[#272E38] text-sm text-[#F3F5F7] focus:border-[#D6FF62] focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Target Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1A2029] border border-[#272E38] text-sm text-[#F3F5F7] focus:border-[#D6FF62] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-[#272E38]">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:bg-[#1A2029]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-sm shadow-sm"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
