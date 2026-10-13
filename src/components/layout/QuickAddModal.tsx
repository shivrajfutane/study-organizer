import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/data-service';
import { useTimer } from '@/context/TimerContext';
import {
  FolderTree,
  BookOpen,
  CheckCircle2,
  Library,
  Briefcase,
  CheckSquare,
  Target,
  FileText,
  Flame,
} from 'lucide-react';
import { Priority, ResourceType } from '@/types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'task' | 'category' | 'subject' | 'topic' | 'resource' | 'project' | 'goal' | 'note' | 'focus';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'task',
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const categories = dataService.getCategories();
  const subjects = dataService.getSubjects();
  const { startTimer, setActiveTask } = useTimer();

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCat, setTaskCat] = useState(categories[0]?.id || '');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDuration, setTaskDuration] = useState(30);
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskIsToday, setTaskIsToday] = useState(true);

  // Category form state
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Folder');
  const [catColor, setCatColor] = useState('#D6FF62');
  const [catParent, setCatParent] = useState('');
  const [catWeeklyHours, setCatWeeklyHours] = useState(5);

  // Topic form state
  const [topTitle, setTopTitle] = useState('');
  const [topSubj, setTopSubj] = useState(subjects[0]?.id || '');
  const [topMins, setTopMins] = useState(60);

  // Subject form state
  const [subjTitle, setSubjTitle] = useState('');
  const [subjCat, setSubjCat] = useState(categories[0]?.id || '');
  const [subjPriority, setSubjPriority] = useState<Priority>('medium');

  // Resource form state
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState<ResourceType>('website');
  const [resCat, setResCat] = useState(categories[0]?.id || '');

  // Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState(10);
  const [goalUnit, setGoalUnit] = useState('hours');
  const [goalPeriod, setGoalPeriod] = useState<'weekly' | 'monthly'>('weekly');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const resetForms = () => {
    setTaskTitle('');
    setCatName('');
    setCatDesc('');
    setTopTitle('');
    setSubjTitle('');
    setResTitle('');
    setResUrl('');
    setGoalTitle('');
    setNoteTitle('');
    setNoteContent('');
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    dataService.createTask({
      title: taskTitle.trim(),
      category_id: taskCat || null,
      priority: taskPriority,
      estimated_minutes: Number(taskDuration),
      actual_minutes: 0,
      due_date: taskDueDate || null,
      is_today_plan: taskIsToday,
      status: 'pending',
      tags: [],
    });
    resetForms();
    onClose();
  };

  const handleSubmitCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    dataService.createCategory({
      name: catName.trim(),
      description: catDesc.trim(),
      icon: catIcon,
      color: catColor,
      parent_id: catParent || null,
      daily_target_hours: 1,
      weekly_target_hours: Number(catWeeklyHours),
      is_archived: false,
      sort_order: categories.length + 1,
    });
    resetForms();
    onClose();
  };

  const handleSubmitTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topTitle.trim() || !topSubj) return;
    const parentSubj = dataService.getSubjects().find((s) => s.id === topSubj);
    dataService.createTopic({
      title: topTitle.trim(),
      subject_id: topSubj,
      category_id: parentSubj?.category_id || null,
      status: 'not_started',
      estimated_minutes: Number(topMins),
      actual_minutes: 0,
      sort_order: 1,
    });
    resetForms();
    onClose();
  };

  const handleSubmitSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjTitle.trim()) return;
    dataService.createSubject({
      title: subjTitle.trim(),
      category_id: subjCat || null,
      priority: subjPriority,
      status: 'in_progress',
      estimated_hours: 10,
    });
    resetForms();
    onClose();
  };

  const handleSubmitResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;
    dataService.createResource({
      title: resTitle.trim(),
      url: resUrl.trim(),
      type: resType,
      category_id: resCat || null,
      difficulty: 'intermediate',
      priority: 'medium',
      status: 'to_learn',
      is_favorite: false,
      tags: [],
    });
    resetForms();
    onClose();
  };

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    dataService.createGoal({
      title: goalTitle.trim(),
      category_id: taskCat || null,
      period: goalPeriod,
      priority: 'medium',
      status: 'active',
      measurement_type: 'number',
      target_value: Number(goalTarget),
      current_value: 0,
      unit: goalUnit,
    });
    resetForms();
    onClose();
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    dataService.createNote({
      title: noteTitle.trim(),
      content: noteContent.trim(),
      category_id: taskCat || null,
      tags: [],
      is_pinned: false,
    });
    resetForms();
    onClose();
  };

  const handleStartFocus = () => {
    startTimer();
    onClose();
  };

  const tabs = [
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'category', label: 'Category', icon: FolderTree },
    { id: 'topic', label: 'Topic', icon: CheckCircle2 },
    { id: 'subject', label: 'Subject', icon: BookOpen },
    { id: 'resource', label: 'Resource', icon: Library },
    { id: 'goal', label: 'Goal', icon: Target },
    { id: 'note', label: 'Note', icon: FileText },
    { id: 'focus', label: 'Focus', icon: Flame },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Create" description="Quickly record anything into your learning workspace." maxWidth="lg">
      <div className="space-y-4">
        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#D6FF62] text-black font-semibold shadow-sm'
                  : 'bg-[#1A2029] text-zinc-400 hover:text-zinc-200 hover:bg-[#272E38]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Task Form */}
        {activeTab === 'task' && (
          <form onSubmit={handleSubmitTask} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g., Read AWS VPC Peering vs Transit Gateway"
                className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D6FF62]"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
                <select
                  value={taskCat}
                  onChange={(e) => setTaskCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                >
                  <option value="">None (Uncategorized)</option>
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
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
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
                <label className="block text-xs font-medium text-zinc-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Est. Minutes</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isToday"
                checked={taskIsToday}
                onChange={(e) => setTaskIsToday(e.target.checked)}
                className="rounded border-[#272E38] bg-[#141820] text-[#D6FF62] focus:ring-[#D6FF62]"
              />
              <label htmlFor="isToday" className="text-xs text-zinc-300">
                Add to Today's Study Plan
              </label>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-sm transition-colors mt-2 shadow-sm"
            >
              Create Task
            </button>
          </form>
        )}

        {/* Category Form */}
        {activeTab === 'category' && (
          <form onSubmit={handleSubmitCategory} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g., Artificial Intelligence, Mobile Dev"
                className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
              <input
                type="text"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Brief summary of what you are studying"
                className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Parent (For Subcategory)</label>
                <select
                  value={catParent}
                  onChange={(e) => setCatParent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Weekly Target Hours</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={catWeeklyHours}
                  onChange={(e) => setCatWeeklyHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Icon</label>
                <select
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                >
                  <option value="Folder">Folder</option>
                  <option value="Shield">Shield (Security)</option>
                  <option value="Cloud">Cloud (Cloud/AWS)</option>
                  <option value="Code2">Code (Dev/Programming)</option>
                  <option value="Brain">Brain (DSA/Algorithms)</option>
                  <option value="GraduationCap">Graduation Cap (University)</option>
                  <option value="Cpu">Cpu (AI/Hardware)</option>
                  <option value="Network">Network</option>
                  <option value="Database">Database</option>
                  <option value="Terminal">Terminal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-zinc-400">{catColor}</span>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-sm transition-colors mt-2 shadow-sm"
            >
              Create Category
            </button>
          </form>
        )}

        {/* Topic Form */}
        {activeTab === 'topic' && (
          <form onSubmit={handleSubmitTopic} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Topic Title *</label>
              <input
                type="text"
                required
                value={topTitle}
                onChange={(e) => setTopTitle(e.target.value)}
                placeholder="e.g., Dijkstra Shortest Path"
                className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Subject *</label>
                <select
                  required
                  value={topSubj}
                  onChange={(e) => setTopSubj(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Est. Minutes</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={topMins}
                  onChange={(e) => setTopMins(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-sm transition-colors mt-2 shadow-sm"
            >
              Add Topic
            </button>
          </form>
        )}

        {/* Subject Form */}
        {activeTab === 'subject' && (
          <form onSubmit={handleSubmitSubject} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Subject Title *</label>
              <input
                type="text"
                required
                value={subjTitle}
                onChange={(e) => setSubjTitle(e.target.value)}
                placeholder="e.g., Computer Networks & Sockets"
                className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
                <select
                  value={subjCat}
                  onChange={(e) => setSubjCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                >
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
                  value={subjPriority}
                  onChange={(e) => setSubjPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-sm transition-colors mt-2 shadow-sm"
            >
              Create Subject
            </button>
          </form>
        )}

        {/* Resource Form */}
        {activeTab === 'resource' && (
          <form onSubmit={handleSubmitResource} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Resource Title *</label>
              <input
                type="text"
                required
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                placeholder="e.g., Official RFC 8446 - The TLS Protocol Version 1.3"
                className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">URL / Link</label>
              <input
                type="url"
                value={resUrl}
                onChange={(e) => setResUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Type</label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value as ResourceType)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="website">Website / Link</option>
                  <option value="youtube_video">YouTube Video</option>
                  <option value="youtube_playlist">YouTube Playlist</option>
                  <option value="github_repo">GitHub Repo</option>
                  <option value="documentation">Documentation</option>
                  <option value="article">Article</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
                <select
                  value={resCat}
                  onChange={(e) => setResCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-sm transition-colors mt-2 shadow-sm"
            >
              Add Resource
            </button>
          </form>
        )}

        {/* Goal Form */}
        {activeTab === 'goal' && (
          <form onSubmit={handleSubmitGoal} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Goal Statement *</label>
              <input
                type="text"
                required
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g., Complete 30 LeetCode graph problems"
                className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Target Value</label>
                <input
                  type="number"
                  min="1"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Unit</label>
                <input
                  type="text"
                  value={goalUnit}
                  onChange={(e) => setGoalUnit(e.target.value)}
                  placeholder="hours, problems, modules"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Period</label>
                <select
                  value={goalPeriod}
                  onChange={(e) => setGoalPeriod(e.target.value as 'weekly' | 'monthly')}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-sm transition-colors mt-2 shadow-sm"
            >
              Set Goal
            </button>
          </form>
        )}

        {/* Note Form */}
        {activeTab === 'note' && (
          <form onSubmit={handleSubmitNote} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Note Title *</label>
              <input
                type="text"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g., TCP SYN Cookie Mechanics & Mitigation"
                className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Content (Markdown supported)</label>
              <textarea
                rows={4}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your study notes, formulas, or summaries..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-[#D6FF62] resize-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-sm transition-colors mt-2 shadow-sm"
            >
              Save Note
            </button>
          </form>
        )}

        {/* Start Focus Session */}
        {activeTab === 'focus' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D6FF62]/10 text-[#D6FF62] mx-auto flex items-center justify-center">
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Start 25-Minute Focus Block</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Kick off an authoritative Pomodoro timer synchronized across your dashboard and focus room.
              </p>
            </div>
            <button
              onClick={handleStartFocus}
              className="px-6 py-2.5 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-bold text-sm shadow-lg shadow-black/40 transition-transform active:scale-95"
            >
              Start Focus Session Now
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
