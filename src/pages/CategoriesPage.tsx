import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree,
  Plus,
  Search,
  Archive,
  Trash2,
  Edit2,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react';
import { dataService } from '@/services/data-service';
import { Category } from '@/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Progress } from '@/components/ui/progress';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [filterArchived, setFilterArchived] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [reassignId, setReassignId] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Folder');
  const [formColor, setFormColor] = useState('#D6FF62');
  const [formParent, setFormParent] = useState('');
  const [formWeeklyHours, setFormWeeklyHours] = useState(6);

  useEffect(() => {
    return dataService.subscribe(() => setTick((t) => t + 1));
  }, []);

  const allCategories = dataService.getCategories(true);
  const displayedCategories = allCategories
    .filter((c) => (filterArchived ? c.is_archived : !c.is_archived))
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.description && c.description.toLowerCase().includes(search.toLowerCase())));

  const topLevel = displayedCategories.filter((c) => !c.parent_id);

  const openCreateModal = (parentId = '') => {
    setFormName('');
    setFormDesc('');
    setFormIcon('Folder');
    setFormColor('#D6FF62');
    setFormParent(parentId);
    setFormWeeklyHours(6);
    setIsCreateOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDesc(cat.description || '');
    setFormIcon(cat.icon);
    setFormColor(cat.color);
    setFormParent(cat.parent_id || '');
    setFormWeeklyHours(cat.weekly_target_hours || 5);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCategory) {
      dataService.updateCategory(editingCategory.id, {
        name: formName.trim(),
        description: formDesc.trim(),
        icon: formIcon,
        color: formColor,
        parent_id: formParent || null,
        weekly_target_hours: Number(formWeeklyHours),
      });
      setEditingCategory(null);
    } else {
      dataService.createCategory({
        name: formName.trim(),
        description: formDesc.trim(),
        icon: formIcon,
        color: formColor,
        parent_id: formParent || null,
        daily_target_hours: 1,
        weekly_target_hours: Number(formWeeklyHours),
        is_archived: false,
        sort_order: allCategories.length + 1,
      });
      setIsCreateOpen(false);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      dataService.deleteCategory(deleteTarget.id, reassignId || null);
      setDeleteTarget(null);
      setReassignId('');
    }
  };

  const associatedCounts = deleteTarget ? dataService.getCategoryAssociatedCounts(deleteTarget.id) : null;

  return (
    <div className="space-y-5 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2 m-0">
            <FolderTree className="w-5 h-5 text-primary" />
            Study Categories
          </h1>
          <p className="text-xs text-muted-foreground mt-1 m-0">
            Organize learning domains, subcategories, weekly targets, and recursive topic progress.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setFilterArchived(!filterArchived)}
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs border-border text-muted-foreground hover:text-foreground"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{filterArchived ? 'Showing Archived' : 'Show Archived'}</span>
          </Button>

          <Button
            onClick={() => openCreateModal()}
            size="sm"
            className="h-8 gap-1.5 text-xs bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48] shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories or subcategories..."
          className="pl-9 h-8 text-xs bg-card border-border"
        />
      </div>

      {/* Category Tree Hierarchy List */}
      <div className="space-y-3">
        {topLevel.length === 0 ? (
          <Card className="border-dashed border-border bg-card/40">
            <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-10 h-10 rounded-md bg-elevated border border-border flex items-center justify-center mb-3 text-primary">
                <FolderTree className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Your learning journey starts here.
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mb-4 leading-relaxed">
                Create your first category to organize your subjects, courses, and projects.
              </p>
              <Button
                onClick={() => openCreateModal()}
                className="h-8 px-4 gap-2 bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48] text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Category</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          topLevel.map((cat) => {
            const subcats = displayedCategories.filter((c) => c.parent_id === cat.id);
            const stats = dataService.getCategoryTopicStats(cat.id);
            const hours = dataService.getCategoryStudyHours(cat.id);

            return (
              <div
                key={cat.id}
                className="rounded-lg bg-card border border-border overflow-hidden shadow-xs hover:border-primary/40 transition-colors"
              >
                {/* Parent Category Row */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-elevated border border-border flex items-center justify-center shrink-0 mt-0.5 text-primary">
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          onClick={() => navigate(`/categories/${cat.id}`)}
                          className="font-semibold text-foreground text-sm tracking-tight hover:text-primary transition-colors cursor-pointer truncate m-0"
                        >
                          {cat.name}
                        </h3>
                        {cat.is_archived && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-elevated text-muted-foreground border border-border">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 m-0">{cat.description || 'No description'}</p>

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground font-mono">
                        <span>
                          {stats.completedTopics}/{stats.totalTopics} topics ({stats.progressPercentage}%)
                        </span>
                        <span>•</span>
                        <span>
                          {hours.thisWeekHours}h / {cat.weekly_target_hours}h target
                        </span>
                        {subcats.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-medium">{subcats.length} subcategories</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      onClick={() => openCreateModal(cat.id)}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-border text-foreground hover:border-primary/50"
                      title="Add subcategory"
                    >
                      <Plus className="w-3 h-3 text-primary" />
                      <span>Subcategory</span>
                    </Button>
                    <Button
                      onClick={() => openEditModal(cat)}
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      onClick={() => setDeleteTarget(cat)}
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      onClick={() => navigate(`/categories/${cat.id}`)}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-border text-foreground hover:border-primary/50"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="px-4 pb-3">
                  <Progress value={stats.progressPercentage} className="h-1" />
                </div>

                {/* Subcategories Tree Section */}
                {subcats.length > 0 && (
                  <div className="border-t border-border bg-elevated/40 p-3 space-y-2">
                    <div className="text-[10px] uppercase font-mono font-semibold text-muted-foreground flex items-center gap-1.5 px-1">
                      <Layers className="w-3 h-3 text-primary" />
                      Subcategories
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {subcats.map((sc) => {
                        const scStats = dataService.getCategoryTopicStats(sc.id);
                        return (
                          <div
                            key={sc.id}
                            className="p-2.5 rounded bg-card border border-border flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CategoryIcon name={sc.icon} className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <div className="min-w-0">
                                <span
                                  onClick={() => navigate(`/categories/${sc.id}`)}
                                  className="text-xs font-medium text-foreground hover:text-primary transition-colors cursor-pointer truncate block"
                                >
                                  {sc.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {scStats.completedTopics}/{scStats.totalTopics} topics ({scStats.progressPercentage}%)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                onClick={() => openEditModal(sc)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => setDeleteTarget(sc)}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Dialog (shadcn Dialog) */}
      <Dialog open={isCreateOpen || Boolean(editingCategory)} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingCategory(null);
        }
      }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-3 pt-2">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Category Name *</label>
              <Input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Cybersecurity, Cloud Architecture"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Description</label>
              <Textarea
                rows={2}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Detailed description of what this domain entails"
                className="min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Parent Category</label>
                <select
                  value={formParent}
                  onChange={(e) => setFormParent(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-card border border-border text-xs text-foreground focus:outline-none"
                >
                  <option value="">None (Top-Level)</option>
                  {allCategories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Weekly Target Hours</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formWeeklyHours}
                  onChange={(e) => setFormWeeklyHours(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Icon</label>
                <select
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-card border border-border text-xs text-foreground focus:outline-none"
                >
                  <option value="Folder">Folder</option>
                  <option value="Shield">Shield</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Code2">Code</option>
                  <option value="Brain">Brain</option>
                  <option value="GraduationCap">Graduation Cap</option>
                  <option value="Cpu">Cpu</option>
                  <option value="Network">Network</option>
                  <option value="Database">Database</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-8 h-8 rounded bg-transparent border border-border cursor-pointer"
                  />
                  <span className="font-mono text-xs text-muted-foreground">{formColor}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCategory(null);
                }}
                className="text-xs text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48]"
              >
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Safe Delete Category Modal */}
      {deleteTarget && (
        <ConfirmationModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title={`Delete Category "${deleteTarget.name}"?`}
          message={`This category has ${associatedCounts?.topics || 0} topics, ${
            associatedCounts?.tasks || 0
          } tasks, and ${associatedCounts?.subcategories || 0} subcategories. To protect your study records, specify how to handle associated learning data:`}
          confirmText="Confirm Delete"
          extraContent={
            <div className="space-y-2 mt-3 p-3 rounded-md bg-elevated border border-border text-xs">
              <label className="block text-foreground font-medium">Reassign records to another category:</label>
              <select
                value={reassignId}
                onChange={(e) => setReassignId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-card border border-border text-foreground focus:outline-none"
              >
                <option value="">Leave records Uncategorized</option>
                {allCategories
                  .filter((c) => c.id !== deleteTarget.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      Reassign to: {c.name}
                    </option>
                  ))}
              </select>
            </div>
          }
        />
      )}
    </div>
  );
};
