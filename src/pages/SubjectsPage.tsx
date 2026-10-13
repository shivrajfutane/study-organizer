import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Play,
} from 'lucide-react';
import { dataService } from '@/services/data-service';
import { Subject, Topic } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/badge';
import { useTimer } from '@/context/TimerContext';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';

export const SubjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { startTimer, setActiveTask } = useTimer();
  const [, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [addTopicSubjectId, setAddTopicSubjectId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicMins, setNewTopicMins] = useState(60);

  useEffect(() => {
    return dataService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const categories = dataService.getCategories();
  const allSubjects = dataService.getSubjects();
  const allTopics = dataService.getTopics();

  const filteredSubjects = allSubjects
    .filter((s) => !selectedCatFilter || s.category_id === selectedCatFilter)
    .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()) || (s.description && s.description.toLowerCase().includes(search.toLowerCase())));

  const handleToggleTopic = (topId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    dataService.updateTopic(topId, { status: nextStatus });
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTopicSubjectId || !newTopicTitle.trim()) return;
    const parentSub = allSubjects.find((s) => s.id === addTopicSubjectId);
    dataService.createTopic({
      title: newTopicTitle.trim(),
      subject_id: addTopicSubjectId,
      category_id: parentSub?.category_id || null,
      status: 'not_started',
      estimated_minutes: Number(newTopicMins),
      actual_minutes: 0,
      sort_order: 1,
    });
    setNewTopicTitle('');
    setAddTopicSubjectId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F3F5F7] tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#63D6C5]" />
            Subjects, Courses & Topic Checklists
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Atomic syllabus topics, time tracking, and instant progress toggles.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects or curriculum..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141820] border border-[#272E38] text-sm text-[#F3F5F7] placeholder-zinc-500 focus:outline-none focus:border-[#D6FF62]"
          />
        </div>

        <select
          value={selectedCatFilter}
          onChange={(e) => setSelectedCatFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#141820] border border-[#272E38] text-sm text-[#F3F5F7] focus:outline-none focus:border-[#D6FF62]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subjects Accordion / Card Hierarchy */}
      <div className="space-y-4">
        {filteredSubjects.length === 0 ? (
          <div className="rounded-2xl bg-[#141820] border border-[#272E38] p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1A2029] border border-[#272E38] flex items-center justify-center mx-auto text-[#63D6C5]">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-[#F3F5F7]">No subjects created yet</h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Add subjects to build structured curriculum roadmaps, track granular topic checklists, and record focus hours.
              </p>
            </div>
          </div>
        ) : (
          filteredSubjects.map((sub) => {
            const cat = sub.category_id ? dataService.getCategoryById(sub.category_id) : null;
            const subTopics = allTopics.filter((t) => t.subject_id === sub.id);
            const completedTopics = subTopics.filter((t) => t.status === 'completed').length;
            const progress = subTopics.length > 0 ? Math.round((completedTopics / subTopics.length) * 100) : 0;
            const isExpanded = expandedSubjectId === sub.id;

            return (
              <div
                key={sub.id}
                className="rounded-2xl bg-[#141820] border border-[#272E38] overflow-hidden shadow-sm hover:border-[#384252] transition-all"
              >
                <div
                  onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button className="text-zinc-500 hover:text-white mt-1 shrink-0">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#F3F5F7] text-base tracking-tight truncate">{sub.title}</h3>
                        <Badge priority={sub.priority} />
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{sub.description}</p>
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
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                    <div className="w-32 hidden sm:block">
                      <ProgressBar value={progress} color={cat?.color || '#D6FF62'} size="sm" showLabel />
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-[#F3F5F7]">
                        {completedTopics}/{subTopics.length}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">Topics Done</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddTopicSubjectId(sub.id);
                      }}
                      className="p-2 rounded-xl bg-[#1A2029] hover:bg-[#272E38] text-zinc-300 hover:text-white transition-colors"
                      title="Add Topic to Subject"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Topics Breakdown Checklist */}
                {isExpanded && (
                  <div className="bg-[#0B0D10] border-t border-[#272E38] px-6 py-4 space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-[#272E38]">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Curriculum Topics ({subTopics.length})
                      </span>
                      <button
                        onClick={() => setAddTopicSubjectId(sub.id)}
                        className="text-xs text-[#D6FF62] hover:underline font-medium"
                      >
                        + Add New Topic
                      </button>
                    </div>

                    {subTopics.length === 0 ? (
                      <div className="py-4 text-center text-xs text-zinc-500">
                        No topics added yet. Click "+ Add New Topic" to populate this syllabus.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#272E38]/40">
                        {subTopics.map((top) => {
                          const isDone = top.status === 'completed';
                          return (
                            <div
                              key={top.id}
                              className="py-3 flex items-center justify-between gap-3 text-xs group hover:bg-[#141820] px-2 rounded-lg"
                            >
                              <div
                                onClick={() => handleToggleTopic(top.id, top.status)}
                                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                ) : (
                                  <Circle className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <span
                                    className={`text-sm font-medium block truncate ${
                                      isDone ? 'line-through text-zinc-500' : 'text-zinc-200'
                                    }`}
                                  >
                                    {top.title}
                                  </span>
                                  {top.description && (
                                    <span className="text-xs text-zinc-500 line-clamp-1">{top.description}</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-mono text-zinc-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {top.estimated_minutes}m
                                </span>
                                <Badge status={top.status} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Topic Modal */}
      <Modal
        isOpen={Boolean(addTopicSubjectId)}
        onClose={() => setAddTopicSubjectId(null)}
        title="Add Subject Topic"
      >
        <form onSubmit={handleAddTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Topic Title *</label>
            <input
              type="text"
              required
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="e.g., Dijkstra Shortest Path with Priority Queue"
              className="w-full px-3 py-2 rounded-xl bg-[#141820] border border-[#272E38] text-sm text-white focus:outline-none focus:border-[#D6FF62]"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Estimated Study Minutes</label>
            <input
              type="number"
              min="15"
              step="15"
              value={newTopicMins}
              onChange={(e) => setNewTopicMins(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-[#141820] border border-[#272E38] text-sm text-white focus:outline-none focus:border-[#D6FF62]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-[#272E38]">
            <button
              type="button"
              onClick={() => setAddTopicSubjectId(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:bg-[#1A2029]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-sm shadow-sm"
            >
              Add Topic
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
