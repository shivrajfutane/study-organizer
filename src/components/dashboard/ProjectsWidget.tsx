import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, ExternalLink, Calendar, Plus } from 'lucide-react';
import { dataService } from '@/services/data-service';
import { Badge } from '@/components/ui/badge';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date-utils';

export const ProjectsWidget: React.FC = () => {
  const navigate = useNavigate();
  const projects = dataService.getProjects();
  const activeProjects = projects.filter((p) => p.status === 'in_progress' || p.status === 'planned');

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-elevated text-accent border border-border">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Active Projects
            </CardTitle>
            <p className="text-[11px] text-muted-foreground m-0">
              {activeProjects.length === 0 ? 'No active builds' : `${activeProjects.length} active deliverables`}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/projects')}
          className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {activeProjects.length === 0 ? (
          <div className="py-8 text-center space-y-2 border border-dashed border-border/60 rounded-md bg-card/30">
            <div className="w-8 h-8 rounded-md bg-elevated border border-border text-muted-foreground mx-auto flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground m-0">No active projects yet.</p>
            <Button
              onClick={() => navigate('/projects')}
              variant="link"
              size="sm"
              className="text-xs text-primary hover:underline h-auto p-0 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create your first project</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activeProjects.map((p) => {
              const tasks = dataService.getTasks().filter((t) => t.project_id === p.id);
              const completedTasks = tasks.filter((t) => t.status === 'completed').length;

              return (
                <div
                  key={p.id}
                  onClick={() => navigate('/projects')}
                  className="p-3 rounded-md bg-elevated border border-border hover:border-primary/40 transition-colors cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-foreground text-xs truncate m-0">{p.name}</h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{p.description}</p>
                    </div>
                    <Badge variant={p.status === 'in_progress' ? 'teal' : 'secondary'}>
                      {p.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {p.tech_stack && p.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.tech_stack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-card border border-border/50 text-muted-foreground font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/50 font-mono">
                    <span>
                      {completedTasks}/{tasks.length} tasks
                    </span>
                    <div className="flex items-center gap-2">
                      {p.github_url && (
                        <a
                          href={p.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-foreground text-muted-foreground"
                          title="GitHub Repository"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {p.live_url && (
                        <a
                          href={p.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-foreground text-muted-foreground"
                          title="Live Deployment"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {p.deadline && (
                        <span className="flex items-center gap-1 text-[10px]">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {formatDate(p.deadline, 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
