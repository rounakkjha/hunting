import { useState, useEffect, useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock, Target, Zap, CheckCircle2, Flame, MailCheck, Mail } from 'lucide-react';
import type { UserData } from '../App';

interface AdvancedStatsProps {
  userData: UserData;
}

export default function AdvancedStats({ userData }: AdvancedStatsProps) {
  const [currentTime, setCurrentTime] = useState(format(new Date(), 'hh:mm a'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), 'hh:mm a'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Weekly activity data
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const weeklyData = last7Days.map((day, index) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const apps = userData.applications.filter((a) => a.date === dayStr).length;
    const emails = userData.coldEmails.filter((e) => e.date === dayStr).length;
    const linkedin = userData.linkedInOutreach.filter((l) => l.date === dayStr).length;

    return {
      name: `${format(day, 'EEE')}-${index}`,
      day: format(day, 'EEE'),
      fullDate: dayStr,
      applications: apps,
      emails: emails,
      linkedin: linkedin,
      total: apps + emails + linkedin,
    };
  });

  // Previous week data for trend comparison
  const prev7Days = eachDayOfInterval({
    start: subDays(new Date(), 13),
    end: subDays(new Date(), 7),
  });

  const prevWeekTotal = prev7Days.reduce((sum, day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const apps = userData.applications.filter((a) => a.date === dayStr).length;
    const emails = userData.coldEmails.filter((e) => e.date === dayStr).length;
    const linkedin = userData.linkedInOutreach.filter((l) => l.date === dayStr).length;
    return sum + apps + emails + linkedin;
  }, 0);

  const thisWeekTotal = weeklyData.reduce((sum, day) => sum + day.total, 0);
  const avgPerDay = (thisWeekTotal / 7).toFixed(1);
  const weekTrend = prevWeekTotal > 0
    ? Math.round(((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100)
    : thisWeekTotal > 0 ? 100 : 0;

  // Real response rate from cold emails
  const totalEmails = userData.coldEmails.length;
  const respondedEmails = userData.coldEmails.filter((e) => e.gotResponse).length;
  const responseRate = totalEmails > 0 ? Math.round((respondedEmails / totalEmails) * 100) : 0;

  // Todo completion rate
  const totalTodos = userData.todos.length;
  const completedTodos = userData.todos.filter((t) => t.completed).length;
  const todoCompletionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  // Activity streak (consecutive days with any activity)
  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const dayStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const hasActivity =
        userData.applications.some((a) => a.date === dayStr) ||
        userData.coldEmails.some((e) => e.date === dayStr) ||
        userData.linkedInOutreach.some((l) => l.date === dayStr);
      if (hasActivity) count++;
      else if (i > 0) break; // allow today to have no activity yet
    }
    return count;
  }, [userData]);

  // Activity distribution
  const activityData = [
    { id: 'activity-applications', name: 'Applications', value: userData.applications.length, color: '#6366f1' },
    { id: 'activity-emails', name: 'Cold Emails', value: userData.coldEmails.length, color: '#818cf8' },
    { id: 'activity-linkedin', name: 'LinkedIn', value: userData.linkedInOutreach.length, color: '#a5b4fc' },
  ].filter(item => item.value > 0);

  const totalActivity = userData.applications.length + userData.coldEmails.length + userData.linkedInOutreach.length;

  return (
    <div className="space-y-6">
      {/* Top Row: Mini Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Response Rate */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-400/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
          <div className="relative bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm p-3.5 sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-2 sm:p-2.5 bg-indigo-500/10 rounded-xl ring-1 ring-indigo-500/20">
                <MailCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" strokeWidth={2.5} />
              </div>
              {totalEmails > 0 && (
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                  {respondedEmails}/{totalEmails}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">Response Rate</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-indigo-500">{responseRate}</span>
              <span className="text-sm sm:text-lg text-muted-foreground">%</span>
            </div>
            {totalEmails > 0 && (
              <div className="mt-3 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-700"
                  style={{ width: `${responseRate}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Todo Completion */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400/20 to-indigo-300/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
          <div className="relative bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm p-3.5 sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-2 sm:p-2.5 bg-indigo-400/10 rounded-xl ring-1 ring-indigo-400/20">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" strokeWidth={2.5} />
              </div>
              {totalTodos > 0 && (
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                  {completedTodos}/{totalTodos}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">Tasks Done</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-indigo-400">{todoCompletionRate}</span>
              <span className="text-sm sm:text-lg text-muted-foreground">%</span>
            </div>
            {totalTodos > 0 && (
              <div className="mt-3 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-indigo-300 rounded-full transition-all duration-700"
                  style={{ width: `${todoCompletionRate}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Activity Streak */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/20 to-indigo-500/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
          <div className="relative bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm p-3.5 sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-2 sm:p-2.5 bg-indigo-600/10 rounded-xl ring-1 ring-indigo-600/20">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" strokeWidth={2.5} />
              </div>
              {weekTrend !== 0 && (
                <div className={`flex items-center gap-0.5 text-xs font-semibold ${weekTrend > 0 ? 'text-indigo-500' : 'text-red-400'}`}>
                  {weekTrend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {weekTrend > 0 ? '+' : ''}{weekTrend}%
                </div>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">Day Streak</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-indigo-500">{streak}</span>
              <span className="text-sm sm:text-lg text-muted-foreground">days</span>
            </div>
            <div className="mt-3 flex gap-0.5">
              {last7Days.map((day, i) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const hasActivity =
                  userData.applications.some((a) => a.date === dayStr) ||
                  userData.coldEmails.some((e) => e.date === dayStr) ||
                  userData.linkedInOutreach.some((l) => l.date === dayStr);
                return (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      hasActivity ? 'bg-gradient-to-r from-indigo-500 to-indigo-400' : 'bg-muted/50'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Time */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 to-accent/40 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500" />
          <div className="relative bg-gradient-to-br from-primary via-primary to-accent rounded-2xl shadow-xl overflow-hidden p-3.5 sm:p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock className="w-4 h-4" strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight mb-1">
              {currentTime}
            </div>
            <div className="text-xs opacity-75 font-medium">
              {format(new Date(), 'EEE, MMM dd')}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Chart + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
          <div className="relative bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Weekly Activity</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Your job search momentum</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />Apps</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-400" />Emails</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-300" />LinkedIn</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg ring-1 ring-primary/20">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">{avgPerDay}/day</span>
                </div>
              </div>
            </div>

            {weeklyData.some(d => d.total > 0) ? (
              <ResponsiveContainer width="100%" height={220} className="sm:!h-[280px]">
                <BarChart data={weeklyData} id="weekly-bar-chart">
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/30" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="currentColor"
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '16px',
                      padding: '12px 16px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    }}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.08)', radius: 8 }}
                  />
                  <Bar dataKey="applications" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} name="Applications" />
                  <Bar dataKey="emails" stackId="a" fill="#818cf8" radius={[0, 0, 0, 0]} name="Emails" />
                  <Bar dataKey="linkedin" stackId="a" fill="#a5b4fc" radius={[6, 6, 0, 0]} name="LinkedIn" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center gap-3">
                <div className="p-4 bg-muted/30 rounded-2xl">
                  <Activity className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium">No activity this week</p>
                <p className="text-xs text-muted-foreground/70">Start adding applications to see your chart</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Distribution */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-400/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
          <div className="relative bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl ring-1 ring-indigo-500/20">
                  <Activity className="w-4 h-4 text-indigo-500" strokeWidth={2.5} />
                </div>
                <h4 className="font-bold">Distribution</h4>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">{totalActivity} total</span>
            </div>

            {activityData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart id="activity-pie-chart">
                    <Pie
                      data={activityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                      nameKey="name"
                    >
                      {activityData.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        padding: '8px 12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {activityData.map((item) => {
                    const pct = totalActivity > 0 ? Math.round((item.value / totalActivity) * 100) : 0;
                    return (
                      <div key={item.id}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-muted-foreground font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{item.value}</span>
                            <span className="text-xs text-muted-foreground">({pct}%)</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center gap-3">
                <div className="p-4 bg-muted/30 rounded-2xl">
                  <Activity className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">No data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
