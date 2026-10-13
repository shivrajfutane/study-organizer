import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FolderTree,
  BookOpen,
  Map,
  Library,
  Briefcase,
  CheckSquare,
  Target,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';
import { dataService } from '@/services/data-service';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  type: 'category' | 'subject' | 'topic' | 'roadmap' | 'resource' | 'project' | 'task' | 'goal' | 'note';
  title: string;
  subtitle?: string;
  path: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Reset query on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger handled in parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items: SearchItem[] = useMemo(() => {
    const result: SearchItem[] = [];

    // Categories
    dataService.getCategories().forEach((c) => {
      result.push({
        id: c.id,
        type: 'category',
        title: c.name,
        subtitle: c.description || 'Study Category',
        path: `/categories/${c.id}`,
      });
    });

    // Subjects
    dataService.getSubjects().forEach((s) => {
      result.push({
        id: s.id,
        type: 'subject',
        title: s.title,
        subtitle: s.description || 'Learning Subject',
        path: '/subjects',
      });
    });

    // Topics
    dataService.getTopics().forEach((t) => {
      result.push({
        id: t.id,
        type: 'topic',
        title: t.title,
        subtitle: `Topic (${t.status.replace('_', ' ')})`,
        path: '/subjects',
      });
    });

    // Roadmaps
    dataService.getRoadmaps().forEach((r) => {
      result.push({
        id: r.id,
        type: 'roadmap',
        title: r.title,
        subtitle: r.description || 'Learning Roadmap',
        path: '/roadmaps',
      });
    });

    // Projects
    dataService.getProjects().forEach((p) => {
      result.push({
        id: p.id,
        type: 'project',
        title: p.name,
        subtitle: p.description || 'Project Repository',
        path: '/projects',
      });
    });

    // Tasks
    dataService.getTasks().forEach((t) => {
      result.push({
        id: t.id,
        type: 'task',
        title: t.title,
        subtitle: `Task - Priority: ${t.priority}`,
        path: '/tasks',
      });
    });

    // Goals
    dataService.getGoals().forEach((g) => {
      result.push({
        id: g.id,
        type: 'goal',
        title: g.title,
        subtitle: `Goal - ${g.period} target`,
        path: '/goals',
      });
    });

    // Resources
    dataService.getResources().forEach((r) => {
      result.push({
        id: r.id,
        type: 'resource',
        title: r.title,
        subtitle: `Resource (${r.type})`,
        path: '/resources',
      });
    });

    // Notes
    dataService.getNotes().forEach((n) => {
      result.push({
        id: n.id,
        type: 'note',
        title: n.title,
        subtitle: 'Note / Document',
        path: '/notes',
      });
    });

    return result;
  }, []);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items.slice(0, 8);
    const q = query.toLowerCase();
    return items
      .filter((i) => i.title.toLowerCase().includes(q) || (i.subtitle && i.subtitle.toLowerCase().includes(q)))
      .slice(0, 15);
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const handleSelect = (item: SearchItem) => {
    onClose();
    navigate(item.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  const getTypeIcon = (type: SearchItem['type']) => {
    switch (type) {
      case 'category':
        return <FolderTree className="w-4 h-4 text-pink-400" />;
      case 'subject':
      case 'topic':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'roadmap':
        return <Map className="w-4 h-4 text-[#D6FF62]" />;
      case 'resource':
        return <Library className="w-4 h-4 text-emerald-400" />;
      case 'project':
        return <Briefcase className="w-4 h-4 text-[#63D6C5]" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-amber-400" />;
      case 'goal':
        return <Target className="w-4 h-4 text-rose-400" />;
      case 'note':
        return <FileText className="w-4 h-4 text-[#63D6C5]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#141820] border border-[#272E38] shadow-2xl overflow-hidden z-10"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#272E38] bg-[#0F1217]">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories, topics, roadmaps, tasks, projects, notes..."
            className="flex-1 bg-transparent text-sm text-[#F3F5F7] placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-zinc-500 hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1A2029] text-zinc-400 border border-[#272E38]">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#272E38]/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              No matching records found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                  idx === selectedIndex ? 'bg-[#D6FF62]/10 text-white border border-[#D6FF62]/20' : 'text-zinc-300 hover:bg-[#1A2029]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-zinc-800/80 shrink-0">{getTypeIcon(item.type)}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    {item.subtitle && <div className="text-xs text-zinc-400 truncate">{item.subtitle}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {item.type}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 opacity-60" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Navigate with ↑ and ↓</span>
          <span>Press Enter to open</span>
        </div>
      </div>
    </div>
  );
};
