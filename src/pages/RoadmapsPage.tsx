import React, { useState, useEffect } from 'react';
import {
  Map,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Layers,
  ChevronRight,
  MoreVertical,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { dataService } from '@/services/data-service';
import { Roadmap, RoadmapMilestone } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date-utils';
import { Modal } from '@/components/ui/Modal';

export const RoadmapsPage: React.FC = () => {
  const [, setTick] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [addMilestoneRoadmapId, setAddMilestoneRoadmapId] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    return dataService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const roadmaps = dataService.getRoadmaps();
  const categories = dataService.getCategories();

  const handleCreateRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    dataService.createRoadmap({
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId || null,
      priority: 'high',
      status: 'in_progress',
      target_date: targetDate || null,
      milestones: [],
    });
    setTitle('');
    setDescription('');
    setIsCreateOpen(false);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMilestoneRoadmapId || !newMilestoneTitle.trim()) return;
    dataService.addMilestone(addMilestoneRoadmapId, newMilestoneTitle.trim());
    setNewMilestoneTitle('');
    setAddMilestoneRoadmapId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F3F5F7] tracking-tight flex items-center gap-2.5">
            <Map className="w-6 h-6 text-[#D6FF62]" />
            Learning Roadmaps
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Structured tracks, milestones, and target timelines for masteries.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Roadmap</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {roadmaps.length === 0 ? (
          <div className="rounded-2xl bg-[#141820] border border-[#272E38] p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1A2029] border border-[#272E38] flex items-center justify-center mx-auto text-[#D6FF62]">
              <Map className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-[#F3F5F7]">No roadmaps created yet</h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Create structured multi-phase tracks, outline milestones, and maintain accountability towards deep learning objectives.
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-xs shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Roadmap</span>
            </button>
          </div>
        ) : (
          roadmaps.map((rm) => {
            const milestones = rm.milestones || [];
            const completedCount = milestones.filter((m) => m.is_completed).length;
            const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;
            const cat = rm.category_id ? dataService.getCategoryById(rm.category_id) : null;

            return (
              <div
                key={rm.id}
                className="rounded-2xl bg-[#141820] border border-[#272E38] p-6 shadow-sm space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg font-bold text-[#F3F5F7] tracking-tight">{rm.title}</h2>
                      <Badge status={rm.status} />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{rm.description}</p>
                    {cat && (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold mt-1"
                        style={{ color: cat.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-medium text-zinc-400 block">Progress</span>
                      <span className="font-mono text-base font-bold text-[#F3F5F7]">{progress}%</span>
                    </div>
                    <button
                      onClick={() => setAddMilestoneRoadmapId(rm.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1A2029] hover:bg-[#272E38] text-zinc-200 text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Milestone</span>
                    </button>
                  </div>
                </div>

                <ProgressBar value={progress} color={cat?.color || '#D6FF62'} size="md" />

                {/* Milestones Stepper Timeline */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                    Milestone Track ({completedCount}/{milestones.length})
                  </span>

                  <div className="divide-y divide-[#272E38]/80 bg-[#0B0D10] rounded-xl border border-[#272E38] px-4 py-1">
                    {milestones.length === 0 ? (
                      <div className="py-4 text-center text-xs text-zinc-500">
                        No milestones added to this roadmap yet.
                      </div>
                    ) : (
                      milestones.map((ms, idx) => (
                        <div
                          key={ms.id}
                          onClick={() => dataService.toggleMilestone(rm.id, ms.id)}
                          className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#141820] px-2 rounded-lg transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {ms.is_completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-500 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span
                                className={`text-sm font-medium block truncate ${
                                  ms.is_completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                                }`}
                              >
                                {idx + 1}. {ms.title}
                              </span>
                              {ms.description && (
                                <span className="text-xs text-zinc-500 line-clamp-1">{ms.description}</span>
                              )}
                            </div>
                          </div>

                          {ms.target_date && (
                            <span className="text-xs text-zinc-500 flex items-center gap-1 shrink-0 font-mono">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(ms.target_date, 'MMM d')}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Roadmap Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Learning Roadmap">
        <form onSubmit={handleCreateRoadmap} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Roadmap Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cloud Architect 2026 Mastery"
              className="w-full px-3 py-2 rounded-xl bg-[#141820] border border-[#272E38] text-sm text-white focus:outline-none focus:border-[#D6FF62]"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Target goals, certifications, and expected outcome"
              className="w-full px-3 py-2 rounded-xl bg-[#141820] border border-[#272E38] text-sm text-white focus:outline-none focus:border-[#D6FF62]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141820] border border-[#272E38] text-sm text-white focus:outline-none focus:border-[#D6FF62]"
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
              <label className="block text-xs font-medium text-zinc-300 mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141820] border border-[#272E38] text-sm text-white focus:outline-none focus:border-[#D6FF62]"
              />
            </div>
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
              Create Roadmap
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal
        isOpen={Boolean(addMilestoneRoadmapId)}
        onClose={() => setAddMilestoneRoadmapId(null)}
        title="Add Milestone"
      >
        <form onSubmit={handleAddMilestone} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Milestone Title *</label>
            <input
              type="text"
              required
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              placeholder="e.g., Deploy High-Availability Multi-AZ VPC"
              className="w-full px-3 py-2 rounded-xl bg-[#141820] border border-[#272E38] text-sm text-white focus:outline-none focus:border-[#D6FF62]"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-[#272E38]">
            <button
              type="button"
              onClick={() => setAddMilestoneRoadmapId(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:bg-[#1A2029]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-sm shadow-sm"
            >
              Add Milestone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
