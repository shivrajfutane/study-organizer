import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  Check,
  Eye,
  Edit3,
  Calendar,
  Sparkles,
  Tag,
} from 'lucide-react';
import { dataService } from '@/services/data-service';
import { Note } from '@/types';
import { formatDate } from '@/lib/date-utils';

export const NotesPage: React.FC = () => {
  const [, setTick] = useState(0);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Active note editor buffer
  const [activeTitle, setActiveTitle] = useState('');
  const [activeContent, setActiveContent] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('');

  useEffect(() => {
    return dataService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const allNotes = dataService.getNotes();
  const categories = dataService.getCategories();

  // Select first note on initial load if none selected
  useEffect(() => {
    if (!selectedNoteId && allNotes.length > 0) {
      const first = allNotes[0];
      setSelectedNoteId(first.id);
      setActiveTitle(first.title);
      setActiveContent(first.content);
      setActiveCategoryId(first.category_id || '');
    }
  }, [allNotes, selectedNoteId]);

  const selectedNote = allNotes.find((n) => n.id === selectedNoteId);

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setActiveTitle(note.title);
    setActiveContent(note.content);
    setActiveCategoryId(note.category_id || '');
    setIsPreview(false);
  };

  const handleCreateNewNote = () => {
    const created = dataService.createNote({
      title: 'Untitled Study Note',
      content: '# Untitled Note\n\nWrite your thoughts, formulas, or summaries here...',
      category_id: categories[0]?.id || null,
      tags: [],
      is_pinned: false,
    });
    setSelectedNoteId(created.id);
    setActiveTitle(created.title);
    setActiveContent(created.content);
    setActiveCategoryId(created.category_id || '');
    setIsPreview(false);
  };

  // Autosave when user types
  useEffect(() => {
    if (!selectedNoteId) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      dataService.updateNote(selectedNoteId, {
        title: activeTitle,
        content: activeContent,
        category_id: activeCategoryId || null,
      });
      setSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [activeTitle, activeContent, activeCategoryId, selectedNoteId]);

  const handleDeleteNote = (noteId: string) => {
    dataService.deleteNote(noteId);
    if (selectedNoteId === noteId) {
      const remaining = dataService.getNotes();
      if (remaining.length > 0) {
        handleSelectNote(remaining[0]);
      } else {
        setSelectedNoteId(null);
      }
    }
  };

  const togglePin = (note: Note) => {
    dataService.updateNote(note.id, { is_pinned: !note.is_pinned });
  };

  const filteredNotes = allNotes
    .filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F3F5F7] tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#63D6C5]" />
            Study Notes & Markdown Docs
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Capture revision notes, key concepts, formulas, and cheatsheets with autosave.
          </p>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-16rem)] min-h-[500px]">
        {/* Left: Notes Sidebar List (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#141820] border border-[#272E38] p-4 shadow-xl flex flex-col h-full space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0B0D10] border border-[#272E38] text-xs text-[#F3F5F7] focus:outline-none focus:border-[#D6FF62]"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredNotes.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">No notes found.</div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === selectedNoteId;
                const cat = note.category_id ? dataService.getCategoryById(note.category_id) : null;

                return (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#D6FF62]/10 border-[#D6FF62]/40 shadow-md text-white'
                        : 'bg-[#0B0D10] border-[#272E38] hover:bg-[#1A2029] hover:border-[#384252]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-white text-xs truncate flex items-center gap-1.5">
                        {note.is_pinned && <Pin className="w-3 h-3 text-amber-400 fill-current shrink-0" />}
                        <span className="truncate">{note.title || 'Untitled Note'}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {formatDate(note.updated_at, 'MMM d')}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-1">
                      {note.content.replace(/^[#\s*_-]+/, '') || 'Empty content'}
                    </p>

                    {cat && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold mt-1.5"
                        style={{ color: cat.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Markdown Editor & Preview Pane (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-[#141820] border border-[#272E38] p-6 shadow-xl flex flex-col h-full space-y-4">
          {selectedNote ? (
            <>
              {/* Note Header / Meta toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#272E38]">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="text"
                    value={activeTitle}
                    onChange={(e) => setActiveTitle(e.target.value)}
                    placeholder="Note Title..."
                    className="bg-transparent font-extrabold text-xl text-[#F3F5F7] tracking-tight focus:outline-none w-full"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Category Linker */}
                  <select
                    value={activeCategoryId}
                    onChange={(e) => setActiveCategoryId(e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-[#0B0D10] border border-[#272E38] text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="">No Domain</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Autosave Status Pill */}
                  <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1 px-2 py-1 rounded bg-[#0B0D10] border border-[#272E38]">
                    <Check className="w-3 h-3 text-emerald-400" />
                    {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
                  </span>

                  {/* Toggle Preview Button */}
                  <button
                    onClick={() => setIsPreview(!isPreview)}
                    className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isPreview
                        ? 'bg-[#D6FF62] text-black border-[#D6FF62]'
                        : 'bg-[#1A2029] text-zinc-300 border-[#272E38] hover:text-white'
                    }`}
                    title={isPreview ? 'Switch to Edit' : 'Switch to Preview'}
                  >
                    {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isPreview ? 'Edit' : 'Preview'}</span>
                  </button>

                  {/* Pin button */}
                  <button
                    onClick={() => togglePin(selectedNote)}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      selectedNote.is_pinned
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                    }`}
                    title={selectedNote.is_pinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Note Content Area */}
              <div className="flex-1 overflow-y-auto">
                {isPreview ? (
                  <div className="prose prose-invert max-w-none text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed font-sans p-2">
                    {activeContent}
                  </div>
                ) : (
                  <textarea
                    value={activeContent}
                    onChange={(e) => setActiveContent(e.target.value)}
                    placeholder="Write markdown content, cheat sheets, code snippets..."
                    className="w-full h-full bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none font-mono leading-relaxed"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500">
              <FileText className="w-12 h-12 mb-3 text-zinc-600" />
              <p className="text-sm">Select a note from the left or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
