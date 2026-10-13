import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, ArrowRight, ExternalLink, Star, FileText, Video, Globe, BookOpen, Plus } from 'lucide-react';
import { dataService } from '@/services/data-service';
import { ResourceType } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date-utils';

export const ResourcePreviewWidget: React.FC = () => {
  const navigate = useNavigate();
  const resources = dataService.getResources().slice(0, 5);

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-accent" />;
      case 'youtube_video':
      case 'youtube_playlist':
        return <Video className="w-3.5 h-3.5 text-primary" />;
      case 'website':
      case 'article':
        return <Globe className="w-3.5 h-3.5 text-accent" />;
      case 'documentation':
        return <BookOpen className="w-3.5 h-3.5 text-primary" />;
      default:
        return <Library className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const toggleFavorite = (e: React.MouseEvent, resId: string, currentFav: boolean) => {
    e.stopPropagation();
    dataService.updateResource(resId, { is_favorite: !currentFav });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-elevated text-accent border border-border">
            <Library className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Resource Library
            </CardTitle>
            <p className="text-[11px] text-muted-foreground m-0">
              {resources.length === 0 ? 'No materials saved' : `${resources.length} study references`}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/resources')}
          className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </CardHeader>

      <CardContent className="space-y-2 pt-0">
        {resources.length === 0 ? (
          <div className="py-8 text-center space-y-2 border border-dashed border-border/60 rounded-md bg-card/30">
            <div className="w-8 h-8 rounded-md bg-elevated border border-border text-muted-foreground mx-auto flex items-center justify-center">
              <Library className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground m-0">No study resources saved yet.</p>
            <Button
              onClick={() => navigate('/resources')}
              variant="link"
              size="sm"
              className="text-xs text-primary hover:underline h-auto p-0 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add your first resource</span>
            </Button>
          </div>
        ) : (
          resources.map((res) => {
            const cat = res.category_id ? dataService.getCategoryById(res.category_id) : null;

            return (
              <div
                key={res.id}
                onClick={() => navigate('/resources')}
                className="flex items-center justify-between gap-3 p-2.5 rounded-md bg-elevated border border-border hover:border-primary/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded bg-card border border-border/50 shrink-0">
                    {getResourceIcon(res.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {res.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground font-mono">
                      <span className="capitalize">{res.type.replace('_', ' ')}</span>
                      {cat && <span>• {cat.name}</span>}
                      <span>• {formatDate(res.created_at, 'MMM d')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => toggleFavorite(e, res.id, res.is_favorite)}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      res.is_favorite ? 'text-amber-400' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title={res.is_favorite ? 'Favorited' : 'Add to favorites'}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                      title="Open external resource"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
