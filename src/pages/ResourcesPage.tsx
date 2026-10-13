import React, { useState, useEffect } from 'react';
import {
  Library,
  Plus,
  Search,
  Star,
  ExternalLink,
  FileText,
  Video,
  Globe,
  BookOpen,
  UploadCloud,
  Trash2,
  Edit2,
  FolderPlus,
  Filter,
} from 'lucide-react';
import { dataService } from '@/services/data-service';
import { Resource, ResourceType, ResourceStatus, Priority } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/date-utils';

export const ResourcesPage: React.FC = () => {
  const [, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [favOnly, setFavOnly] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ResourceType>('pdf');
  const [catId, setCatId] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('medium' as any);
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<ResourceStatus>('to_learn');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    return dataService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const categories = dataService.getCategories();
  const collections = dataService.getCollections();
  const resources = dataService.getResources();

  const filteredResources = resources
    .filter((r) => !typeFilter || r.type === typeFilter)
    .filter((r) => !statusFilter || r.status === statusFilter)
    .filter((r) => !favOnly || r.is_favorite)
    .filter((r) => r.title.toLowerCase().includes(search.toLowerCase()) || (r.description && r.description.toLowerCase().includes(search.toLowerCase())));

  const toggleFavorite = (res: Resource) => {
    dataService.updateResource(res.id, { is_favorite: !res.is_favorite });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setType('pdf');
    }
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    dataService.createResource({
      title: title.trim(),
      description: desc.trim(),
      url: url.trim() || (uploadedFile ? URL.createObjectURL(uploadedFile) : ''),
      type,
      category_id: catId || null,
      difficulty,
      priority,
      status,
      is_favorite: false,
      tags: [],
      file_path: uploadedFile ? uploadedFile.name : null,
      file_size_bytes: uploadedFile ? uploadedFile.size : null,
    });

    setTitle('');
    setDesc('');
    setUrl('');
    setUploadedFile(null);
    setIsAddOpen(false);
  };

  const getResourceIcon = (t: ResourceType) => {
    switch (t) {
      case 'pdf':
      case 'document':
        return <FileText className="w-4 h-4 text-rose-400" />;
      case 'youtube_video':
      case 'youtube_playlist':
        return <Video className="w-4 h-4 text-pink-400" />;
      case 'website':
      case 'article':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'documentation':
        return <BookOpen className="w-4 h-4 text-[#63D6C5]" />;
      default:
        return <Library className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F3F5F7] tracking-tight flex items-center gap-2.5">
            <Library className="w-6 h-6 text-[#63D6C5]" />
            Resource Library & Docs Vault
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Store whitepapers, PDF books, YouTube study playlists, and API documentation.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources, tags, or links..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141820] border border-[#272E38] text-sm text-[#F3F5F7] placeholder-zinc-500 focus:outline-none focus:border-[#D6FF62]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="pdf">PDFs & Docs</option>
          <option value="website">Websites</option>
          <option value="youtube_video">YouTube Videos</option>
          <option value="youtube_playlist">YouTube Playlists</option>
          <option value="documentation">Documentation</option>
          <option value="article">Articles</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="to_learn">To Learn</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>

        <button
          onClick={() => setFavOnly(!favOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
            favOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4 fill-current" />
          <span>Favorites</span>
        </button>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="rounded-2xl bg-[#141820] border border-[#272E38] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1A2029] border border-[#272E38] flex items-center justify-center mx-auto text-[#63D6C5]">
            <Library className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#F3F5F7]">No resources cataloged yet</h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Curate documentation, research papers, YouTube video channels, and technical references for structured study.
            </p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => {
          const cat = res.category_id ? dataService.getCategoryById(res.category_id) : null;

          return (
            <div
              key={res.id}
              className="rounded-2xl bg-zinc-900/80 border border-zinc-800/90 p-5 shadow-sm hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 shrink-0">
                      {getResourceIcon(res.type)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                        {res.type.replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-white text-base tracking-tight truncate">{res.title}</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFavorite(res)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      res.is_favorite ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {res.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{res.description}</p>
                )}

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {cat && (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800"
                      style={{ color: cat.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                  )}
                  <Badge status={res.status} />
                  <span className="text-[10px] uppercase font-semibold text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    {res.difficulty}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500 text-[11px]">{formatDate(res.created_at, 'MMM d, yyyy')}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dataService.deleteResource(res.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D6FF62]/10 hover:bg-[#D6FF62]/20 text-[#D6FF62] font-semibold border border-[#D6FF62]/30 transition-colors"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Add Resource Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Resource or Upload PDF">
        <form onSubmit={handleCreateResource} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Upload File (PDF / Doc)</label>
            <div className="border-2 border-dashed border-[#272E38] hover:border-[#D6FF62] rounded-2xl p-4 text-center cursor-pointer bg-[#141820] transition-colors">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.epub,.txt"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-1">
                <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto" />
                <span className="text-xs text-[#D6FF62] font-medium block">
                  {uploadedFile ? uploadedFile.name : 'Choose a PDF or Document from your device'}
                </span>
                <span className="text-[11px] text-zinc-500 block">
                  {uploadedFile
                    ? `${Math.round(uploadedFile.size / 1024)} KB`
                    : 'Stores securely in Supabase Storage'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Resource Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AWS Security Best Practices"
              className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">External URL (optional)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ResourceType)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
              >
                <option value="pdf">PDF Document</option>
                <option value="website">Website / Link</option>
                <option value="youtube_video">YouTube Video</option>
                <option value="youtube_playlist">YouTube Playlist</option>
                <option value="documentation">Documentation</option>
                <option value="github_repo">GitHub Repository</option>
                <option value="article">Article</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
              <select
                value={catId}
                onChange={(e) => setCatId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
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

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#D6FF62] hover:bg-[#cbf555] text-black font-semibold text-sm shadow-sm"
            >
              Save Resource
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
