import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ArrowRight,
  Activity,
  History,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { dataService } from '@/services/data-service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/date-utils';

export const ActivityAndChartsWidget: React.FC = () => {
  const navigate = useNavigate();
  const activityLogs = dataService.getActivityLog(5);
  const sessions = dataService.getStudySessions({ days: 7 });

  // Generate real daily focus minutes data for last 7 days from actual records
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    let mins = 0;
    sessions.forEach((s) => {
      if (s.started_at.startsWith(dateStr) && s.is_completed) {
        mins += s.duration_minutes;
      }
    });

    return {
      day: dayLabel,
      minutes: mins,
    };
  });

  const totalFocusMinutesWeek = last7DaysData.reduce((acc, curr) => acc + curr.minutes, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      {/* Mini Focus Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-elevated text-primary border border-border">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Study Time (Last 7 Days)
              </CardTitle>
              <p className="text-[11px] text-muted-foreground m-0">
                {totalFocusMinutesWeek === 0
                  ? '0 mins recorded • Ready to track'
                  : `${Math.round((totalFocusMinutesWeek / 60) * 10) / 10} hrs recorded`}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/analytics')}
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            Analytics <ArrowRight className="w-3 h-3" />
          </button>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#929BA8" fontSize={10} tickLine={false} />
                <YAxis stroke="#929BA8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141820',
                    borderColor: '#272E38',
                    borderRadius: '0.375rem',
                    fontSize: '11px',
                    color: '#F3F5F7',
                  }}
                  formatter={(val: any) => [`${val} mins`, 'Focus']}
                />
                <Bar dataKey="minutes" fill="#D6FF62" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chronological Activity Feed */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-elevated text-accent border border-border">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Recent Activity
              </CardTitle>
              <p className="text-[11px] text-muted-foreground m-0">
                Chronological workspace logs
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/analytics')}
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            Full log <ArrowRight className="w-3 h-3" />
          </button>
        </CardHeader>

        <CardContent className="pt-1">
          {activityLogs.length === 0 ? (
            <div className="py-8 text-center space-y-2 border border-dashed border-border/60 rounded-md bg-card/30">
              <div className="w-8 h-8 rounded-md bg-elevated border border-border text-muted-foreground mx-auto flex items-center justify-center">
                <History className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground m-0">No study activity recorded yet.</p>
              <p className="text-[10px] text-muted-foreground m-0">Sessions and task completions will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-foreground font-medium block truncate text-xs">{log.title}</span>
                    <span className="text-muted-foreground text-[10px] font-mono">{formatDate(log.created_at, 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
