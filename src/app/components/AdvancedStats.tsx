import { useState, useEffect, useMemo } from 'react';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
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
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock, Target, Zap } from 'lucide-react';
import type { UserData } from '../App';

interface AdvancedStatsProps {
  userData: UserData;
}

export default function AdvancedStats({ userData }: AdvancedStatsProps) {
  const [currentTime, setCurrentTime] = useState(format(new Date(), 'HH:mm:ss'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm:ss'));
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

  // Calculate trends
  const thisWeekTotal = weeklyData.reduce((sum, day) => sum + day.total, 0);
  const avgPerDay = (thisWeekTotal / 7).toFixed(1);

  // Response rate calculation (mock for now)
  const totalEmails = userData.coldEmails.length;
  const responseRate = useMemo(
    () => (totalEmails > 0 ? Math.floor(Math.random() * 30 + 15) : 0),
    [totalEmails],
  );

  // Activity distribution
  const activityData = [
    { id: 'activity-applications', name: 'Applications', value: userData.applications.length, color: '#3b82f6' },
    { id: 'activity-emails', name: 'Cold Emails', value: userData.coldEmails.length, color: '#06b6d4' },
    { id: 'activity-linkedin', name: 'LinkedIn', value: userData.linkedInOutreach.length, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Weekly Activity Chart */}
      <div className="lg:col-span-2 relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
        <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold">Weekly Activity</h3>
              <p className="text-sm text-muted-foreground mt-1">Your job search momentum</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl ring-1 ring-primary/20">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{avgPerDay} avg/day</span>
            </div>
          </div>

          {weeklyData.some(d => d.total > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData} id="weekly-bar-chart">
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/50" vertical={false} />
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
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                  cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                />
                <Bar dataKey="applications" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Applications" />
                <Bar dataKey="emails" stackId="a" fill="#06b6d4" radius={[0, 0, 0, 0]} name="Emails" />
                <Bar dataKey="linkedin" stackId="a" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="LinkedIn" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center">
              <p className="text-muted-foreground">No activity data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column Stats */}
      <div className="space-y-6">
        {/* Current Time Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-500" />
          <div className="relative bg-gradient-to-br from-primary via-primary-dark to-accent rounded-3xl shadow-xl overflow-hidden p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Clock className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold opacity-90">Current Time</span>
            </div>
            <div className="text-5xl font-bold tabular-nums tracking-tight mb-2">
              {currentTime}
            </div>
            <div className="text-sm opacity-75">
              {format(new Date(), 'EEEE, MMMM dd, yyyy')}
            </div>
          </div>
        </div>

        {/* Response Rate Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
          <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl ring-1 ring-green-500/20">
                <Target className="w-5 h-5 text-green-500" strokeWidth={2.5} />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-semibold">
                <TrendingUp className="w-4 h-4" />
                +12%
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Response Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-green-500">{responseRate}</span>
                <span className="text-2xl text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Distribution */}
        {activityData.length > 0 && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
            <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-xl ring-1 ring-purple-500/20">
                  <Activity className="w-4 h-4 text-purple-500" strokeWidth={2.5} />
                </div>
                <h4 className="font-semibold">Distribution</h4>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart id="activity-pie-chart">
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
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
                      padding: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {activityData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
