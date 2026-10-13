import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, ArrowRight, Circle, Calendar, Plus } from 'lucide-react';
import { dataService } from '@/services/data-service';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date-utils';

export const RoadmapOverviewWidget: React.FC = () => {
  const navigate = useNavigate();
  const roadmaps = dataService.getRoadmaps();

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-elevated text-primary border border-border">
            <Map className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Learning Roadmaps
            </CardTitle>
            <p className="text-[11px] text-muted-foreground m-0">
              {roadmaps.length === 0 ? 'No active roadmaps' : `${roadmaps.length} active roadmaps`}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/roadmaps')}
          className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {roadmaps.length === 0 ? (
          <div className="py-8 text-center space-y-2 border border-dashed border-border/60 rounded-md bg-card/30">
            <div className="w-8 h-8 rounded-md bg-elevated border border-border text-muted-foreground mx-auto flex items-center justify-center">
              <Map className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground m-0">No learning roadmaps created yet.</p>
            <Button
              onClick={() => navigate('/roadmaps')}
              variant="link"
              size="sm"
              className="text-xs text-primary hover:underline h-auto p-0 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create your first roadmap</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {roadmaps.map((rm) => {
              const milestones = rm.milestones || [];
              const completedCount = milestones.filter((m) => m.is_completed).length;
              const totalCount = milestones.length;
              const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
              const nextMilestone = milestones.find((m) => !m.is_completed);
              const cat = rm.category_id ? dataService.getCategoryById(rm.category_id) : null;

              return (
                <div
                  key={rm.id}
                  onClick={() => navigate('/roadmaps')}
                  className="p-3 rounded-md bg-elevated border border-border hover:border-primary/40 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-foreground text-xs truncate m-0">{rm.title}</h4>
                      {cat && (
                        <span className="text-[10px] text-muted-foreground font-mono truncate block mt-0.5">
                          {cat.name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-primary font-mono shrink-0">{progress}%</span>
                  </div>

                  <Progress value={progress} className="h-1.5" />

                  <div className="text-[11px] text-muted-foreground flex items-center justify-between font-mono">
                    <span>
                      {completedCount}/{totalCount} milestones
                    </span>
                    {rm.target_date && (
                      <span className="flex items-center gap-1 text-[10px]">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {formatDate(rm.target_date, 'MMM d')}
                      </span>
                    )}
                  </div>

                  {nextMilestone && (
                    <div className="p-1.5 rounded bg-card border border-border/60 text-[10px] flex items-center gap-1.5 text-muted-foreground">
                      <Circle className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">Next: {nextMilestone.title}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
