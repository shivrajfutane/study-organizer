import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree,
  Plus,
  Play,
  MoreVertical,
  CheckCircle2,
  Clock,
  Target,
  Search,
  Archive,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { Category } from '@/types';
import { dataService } from '@/services/data-service';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTimer } from '@/context/TimerContext';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface CategoryGridProps {
  onOpenAddCategory: () => void;
  onOpenQuickAddWithCat?: (categoryId: string, tab: 'topic' | 'task' | 'resource') => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onOpenAddCategory,
}) => {
  const navigate = useNavigate();
  const { startTimer, setActiveCategory } = useTimer();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'progress' | 'name' | 'hours'>('progress');
  const [activeMenuCatId, setActiveMenuCatId] = useState<string | null>(null);
  const [deleteCatTarget, setDeleteCatTarget] = useState<Category | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('');

  const allCategories = dataService.getCategories();
  // Filter top-level categories
  const topLevelCategories = allCategories.filter((c) => !c.parent_id);

  const filteredCategories = topLevelCategories
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.description && c.description.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'hours') {
        const hA = dataService.getCategoryStudyHours(a.id).totalHours;
        const hB = dataService.getCategoryStudyHours(b.id).totalHours;
        return hB - hA;
      }
      const pA = dataService.getCategoryTopicStats(a.id).progressPercentage;
      const pB = dataService.getCategoryTopicStats(b.id).progressPercentage;
      return pB - pA;
    });

  const handleStartCategoryFocus = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    setActiveCategory(catId);
    startTimer();
    navigate('/focus');
  };

  const handleArchive = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    dataService.updateCategory(cat.id, { is_archived: true });
    setActiveMenuCatId(null);
  };

  const handleDeletePrompt = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    setDeleteCatTarget(cat);
    setActiveMenuCatId(null);
  };

  const confirmDelete = () => {
    if (deleteCatTarget) {
      dataService.deleteCategory(deleteCatTarget.id, reassignTargetId || null);
      setDeleteCatTarget(null);
      setReassignTargetId('');
    }
  };

  const associatedCounts = deleteCatTarget ? dataService.getCategoryAssociatedCounts(deleteCatTarget.id) : null;

  return (
    <section className="space-y-3.5">
      {/* Section Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-elevated text-primary border border-border">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground tracking-tight m-0">
              Study Categories
            </h2>
            <p className="text-[11px] text-muted-foreground m-0">
              {topLevelCategories.length} {topLevelCategories.length === 1 ? 'domain' : 'domains'} organized
            </p>
          </div>
        </div>

        {topLevelCategories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-md bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="progress">By Progress</option>
              <option value="hours">By Study Hours</option>
              <option value="name">Alphabetical</option>
            </select>

            <Button
              onClick={onOpenAddCategory}
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 border-border hover:border-primary/50"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Create Category</span>
            </Button>
          </div>
        )}
      </div>

      {/* Mandatory Empty State when no categories exist */}
      {topLevelCategories.length === 0 ? (
        <Card className="border-dashed border-border bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-lg bg-elevated border border-border flex items-center justify-center mb-3 text-primary">
              <FolderTree className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Your learning journey starts here.
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mb-5 leading-relaxed">
              Create your first category to organize your subjects, courses, and projects.
            </p>
            <Button
              onClick={onOpenAddCategory}
              className="h-9 px-4 gap-2 bg-primary text-[#0B0D10] font-semibold hover:bg-[#c2ef48]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </Button>
          </CardContent>
        </Card>
      ) : filteredCategories.length === 0 ? (
        <Card className="border-border bg-card/40">
          <CardContent className="py-8 text-center text-xs text-muted-foreground">
            No categories match "{search}".
          </CardContent>
        </Card>
      ) : (
        /* Grid of Categories */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCategories.map((cat) => {
            const stats = dataService.getCategoryTopicStats(cat.id);
            const hours = dataService.getCategoryStudyHours(cat.id);
            const activeGoals = dataService.getGoals(cat.id).filter((g) => g.status === 'active').length;
            const activeProjects = dataService.getProjects(cat.id).filter((p) => p.status === 'in_progress').length;
            const subcategories = allCategories.filter((c) => c.parent_id === cat.id);
            const remainingWeeklyHours = Math.max(0, cat.weekly_target_hours - hours.thisWeekHours);

            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/categories/${cat.id}`)}
                className="group relative rounded-lg bg-card border border-border p-4 hover:border-primary/40 hover:bg-elevated/40 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
              >
                {/* Category Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-elevated border border-border flex items-center justify-center shrink-0 text-primary">
                        <CategoryIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-xs sm:text-sm tracking-tight truncate group-hover:text-primary transition-colors">
                          {cat.name}
                        </h3>
                        {subcategories.length > 0 && (
                          <p className="text-[10px] text-muted-foreground truncate font-mono">
                            {subcategories.length} subcategories
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Action Menu Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuCatId(activeMenuCatId === cat.id ? null : cat.id);
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-elevated cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {activeMenuCatId === cat.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-6 z-20 w-44 rounded-md bg-card border border-border p-1 shadow-xl text-xs space-y-0.5"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/categories/${cat.id}`);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors flex items-center gap-2"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={(e) => handleArchive(e, cat)}
                            className="w-full text-left px-2.5 py-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors flex items-center gap-2"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>Archive Category</span>
                          </button>
                          <button
                            onClick={(e) => handleDeletePrompt(e, cat)}
                            className="w-full text-left px-2.5 py-1.5 rounded text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Safely</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {cat.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                      {cat.description}
                    </p>
                  )}

                  {/* Progress Bar & Topic Stats */}
                  <div className="space-y-1.5 mb-3.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                        {stats.completedTopics}/{stats.totalTopics} topics
                      </span>
                      <span className="font-semibold text-foreground font-mono">
                        {stats.progressPercentage}%
                      </span>
                    </div>
                    <Progress value={stats.progressPercentage} />
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="p-2 rounded-md bg-elevated border border-border/50">
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-accent" />
                        This Week
                      </div>
                      <div className="text-xs font-semibold text-foreground mt-0.5 font-mono">
                        {hours.thisWeekHours} / {cat.weekly_target_hours}h
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {remainingWeeklyHours > 0 ? `${remainingWeeklyHours}h left` : 'Goal met'}
                      </div>
                    </div>

                    <div className="p-2 rounded-md bg-elevated border border-border/50">
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1 font-mono">
                        <Target className="w-3 h-3 text-primary" />
                        Active
                      </div>
                      <div className="text-xs font-semibold text-foreground mt-0.5 font-mono">
                        {activeGoals} goals
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {activeProjects} active projects
                      </div>
                    </div>
                  </div>

                  {/* Footer Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                    <Button
                      onClick={(e) => handleStartCategoryFocus(e, cat.id)}
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs gap-1.5 hover:border-primary/50 text-foreground"
                    >
                      <Play className="w-3 h-3 text-primary" />
                      <span>Focus Category</span>
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/categories/${cat.id}`);
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Category Confirmation Dialog */}
      {deleteCatTarget && (
        <ConfirmationModal
          isOpen={Boolean(deleteCatTarget)}
          onClose={() => setDeleteCatTarget(null)}
          onConfirm={confirmDelete}
          title={`Delete Category "${deleteCatTarget.name}"?`}
          message={`This category has ${associatedCounts?.topics || 0} topics, ${
            associatedCounts?.tasks || 0
          } tasks, and ${associatedCounts?.subcategories || 0} subcategories. To protect your study data, choose how to handle associated records.`}
          confirmText="Delete Category"
          extraContent={
            <div className="space-y-2 mt-3 p-3 rounded-md bg-elevated border border-border text-xs">
              <label className="block text-foreground font-medium">Reassign records to another category:</label>
              <select
                value={reassignTargetId}
                onChange={(e) => setReassignTargetId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-card border border-border text-foreground focus:outline-none"
              >
                <option value="">Leave records Uncategorized</option>
                {allCategories
                  .filter((c) => c.id !== deleteCatTarget.id)
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
    </section>
  );
};
