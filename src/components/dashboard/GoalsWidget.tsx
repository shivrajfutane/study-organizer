import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, Calendar, Plus } from 'lucide-react';
import { dataService } from '@/services/data-service';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date-utils';

interface GoalsWidgetProps {
  onOpenQuickAddGoal?: () => void;
}

export const GoalsWidget: React.FC<GoalsWidgetProps> = ({ onOpenQuickAddGoal }) => {
  const navigate = useNavigate();
  const goals = dataService.getGoals();
  const activeGoals = goals.filter((g) => g.status === 'active');

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-elevated text-primary border border-border">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Goals & Targets
            </CardTitle>
            <p className="text-[11px] text-muted-foreground m-0">
              {activeGoals.length === 0 ? 'No active targets' : `${activeGoals.length} active objectives`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenQuickAddGoal && (
            <Button
              onClick={onOpenQuickAddGoal}
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 border-border hover:border-primary/50 text-foreground"
              title="Add goal"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
            </Button>
          )}
          <button
            onClick={() => navigate('/goals')}
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer ml-1"
          >
            All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-0">
        {activeGoals.length === 0 ? (
          <div className="py-8 text-center space-y-2 border border-dashed border-border/60 rounded-md bg-card/30">
            <div className="w-8 h-8 rounded-md bg-elevated border border-border text-muted-foreground mx-auto flex items-center justify-center">
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground m-0">No active goals set yet.</p>
            <Button
              onClick={onOpenQuickAddGoal || (() => navigate('/goals'))}
              variant="link"
              size="sm"
              className="text-xs text-primary hover:underline h-auto p-0 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Define your first goal</span>
            </Button>
          </div>
        ) : (
          activeGoals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
            const cat = goal.category_id ? dataService.getCategoryById(goal.category_id) : null;

            return (
              <div
                key={goal.id}
                onClick={() => navigate('/goals')}
                className="p-3 rounded-md bg-elevated border border-border hover:border-primary/40 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-medium text-foreground text-xs truncate m-0">{goal.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span className="capitalize px-1 rounded bg-card border border-border/40 font-mono">
                        {goal.period}
                      </span>
                      {cat && <span>{cat.name}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-foreground font-mono">
                      {goal.current_value} / {goal.target_value}{' '}
                      <span className="text-[10px] font-normal text-muted-foreground">{goal.unit}</span>
                    </div>
                    <div className="text-[10px] text-primary font-mono">{progress}%</div>
                  </div>
                </div>

                <Progress value={progress} className="h-1.5" />

                {goal.target_date && (
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      Target: {formatDate(goal.target_date, 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
