import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, parseISO, differenceInDays } from 'date-fns';
import useNow from '../hooks/useNow';
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
import { TrendingUp, TrendingDown, Activity, Clock, Target, Zap, CheckCircle2, Flame, MailCheck, Mail, MessageSquare, Users } from 'lucide-react';
import type { UserData } from '../App';
import type { DateRange } from './DateFilter';

interface AdvancedStatsProps {
  userData: UserData;
  isLoading?: boolean;
  dateRange?: DateRange;
}

export default function AdvancedStats({ userData, isLoading, dateRange }: AdvancedStatsProps) {
  const now = useNow(1000);
  const currentTime = format(now, 'hh:mm a');

  // Determine chart interval from the selected date filter
  const isAllTime = !dateRange || dateRange.label === 'All Time';
  const startDate = isAllTime ? subDays(now, 6) : parseISO(dateRange.start);
  const endDate = isAllTime ? now : parseISO(dateRange.end);
  const chartDays = eachDayOfInterval({ start: startDate, end: endDate });
  const prevPeriodDays = chartDays.length;

  const activityDataChart = chartDays.map((day, index) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const applications = userData.applications.filter((a) => a.date === dayStr).length;
    const coldEmails = userData.coldEmails.filter((e) => e.date === dayStr).length;
    const linkedInOutreach = userData.linkedInOutreach.filter((l) => l.date === dayStr).length;
    const targetCompanies = userData.targetCompanies.filter((t) => t.date === dayStr).length;
    const interviews = userData.interviews.filter((i) => i.createdAt === dayStr).length;

    return {
      name: `${format(day, 'EEE')}-${index}`,
      day: format(day, 'EEE'),
      fullDate: dayStr,
      applications,
      coldEmails,
      linkedInOutreach,
      targetCompanies,
      interviews,
      total: applications + coldEmails + linkedInOutreach + targetCompanies + interviews,
    };
  });

  // Previous period trend comparison (same length as the chart interval)
  const prevPeriodStart = subDays(startDate, prevPeriodDays);
  const prevPeriodEnd = subDays(startDate, 1);
  const prevPeriodDaysArr = eachDayOfInterval({ start: prevPeriodStart, end: prevPeriodEnd });

  const prevPeriodTotal = prevPeriodDaysArr.reduce((sum, day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const applications = userData.applications.filter((a) => a.date === dayStr).length;
    const coldEmails = userData.coldEmails.filter((e) => e.date === dayStr).length;
    const linkedInOutreach = userData.linkedInOutreach.filter((l) => l.date === dayStr).length;
    const targetCompanies = userData.targetCompanies.filter((t) => t.date === dayStr).length;
    const interviews = userData.interviews.filter((i) => i.createdAt === dayStr).length;
    return sum + applications + coldEmails + linkedInOutreach + targetCompanies + interviews;
  }, 0);

  const currentPeriodTotal = activityDataChart.reduce((sum, day) => sum + day.total, 0);
  const avgPerDay = prevPeriodDays > 0 ? (currentPeriodTotal / prevPeriodDays).toFixed(1) : '0.0';
  const weekTrend = prevPeriodTotal > 0
    ? Math.round(((currentPeriodTotal - prevPeriodTotal) / prevPeriodTotal) * 100)
    : currentPeriodTotal > 0 ? 100 : 0;

  // Response rate: cold emails + LinkedIn outreach
  const totalEmails = userData.coldEmails.length;
  const respondedEmails = userData.coldEmails.filter((e) => e.gotResponse).length;
  const totalLinkedIn = userData.linkedInOutreach.length;
  const respondedLinkedIn = userData.linkedInOutreach.filter((l) => l.gotResponse).length;
  const totalOutreach = totalEmails + totalLinkedIn;
  const totalResponded = respondedEmails + respondedLinkedIn;
  const responseRate = totalOutreach > 0 ? Math.round((totalResponded / totalOutreach) * 100) : 0;

  // Todo completion rate
  const totalTodos = userData.todos.length;
  const completedTodos = userData.todos.filter((t) => t.completed).length;
  const todoCompletionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  // Activity streak (consecutive days with any activity)
  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const dayStr = format(subDays(now, i), 'yyyy-MM-dd');
      const hasActivity =
        userData.applications.some((a) => a.date === dayStr) ||
        userData.coldEmails.some((e) => e.date === dayStr) ||
        userData.linkedInOutreach.some((l) => l.date === dayStr) ||
        userData.targetCompanies.some((t) => t.date === dayStr) ||
        userData.interviews.some((i) => i.createdAt === dayStr);
      if (hasActivity) count++;
      else if (i > 0) break; // allow today to have no activity yet
    }
    return count;
  }, [userData]);

  // Application source distribution
  const apps = userData.applications.filter((a) => !a.isQuickApply);
  const sourceLinkedIn = apps.filter((a) => a.source?.toLowerCase() === 'linkedin').length;
  const sourceNaukri = apps.filter((a) => a.source?.toLowerCase() === 'naukri').length;
  const sourceReferral = apps.filter((a) => a.source?.toLowerCase() === 'referral').length;
  const sourceOthers = apps.filter((a) => !['linkedin', 'naukri', 'referral'].includes(a.source?.toLowerCase() ?? '')).length;

  const activityData = [
    { id: 'source-linkedin', name: 'LinkedIn', value: sourceLinkedIn, color: '#4f46e5' },
    { id: 'source-naukri', name: 'Naukri', value: sourceNaukri, color: '#6366f1' },
    { id: 'source-referral', name: 'Referral', value: sourceReferral, color: '#818cf8' },
    { id: 'source-others', name: 'Others', value: sourceOthers, color: '#a5b4fc' },
  ].filter(item => item.value > 0);

  const totalActivity = apps.length;

  // LinkedIn outreach breakdown
  const linkedInAlumni = userData.linkedInOutreach.filter((l) => l.isAlumni).length;
  const linkedInReplied = userData.linkedInOutreach.filter((l) => l.gotResponse).length;
  const linkedInRepliedAlumni = userData.linkedInOutreach.filter((l) => l.gotResponse && l.isAlumni).length;

  // Referral support breakdown
  const referralsAsked = userData.targetCompanies.filter((t) => t.referralStatus === 'asked').length;
  const referralsAwaiting = userData.targetCompanies.filter((t) => t.referralStatus === 'awaiting').length;
  const referralsDone = userData.targetCompanies.filter((t) => t.referralStatus === 'done').length;
  const totalReferrals = referralsAsked + referralsAwaiting + referralsDone;

  // Skeleton card for loading state
  const SkeletonCard = () => (
    <div className="relative bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm p-3.5 sm:p-5">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted animate-pulse" />
        <div className="w-12 h-3 rounded bg-muted animate-pulse" />
      </div>
      <div className="w-20 h-3 rounded bg-muted animate-pulse mb-1" />
      <div className="w-16 h-8 sm:h-10 rounded bg-muted animate-pulse" />
    </div>
  );

  const SkeletonChart = () => (
    <div className="relative bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="w-32 h-4 rounded bg-muted animate-pulse" />
        <div className="w-8 h-8 rounded-xl bg-muted animate-pulse" />
      </div>
      <div className="h-[200px] sm:h-[280px] bg-muted/50 rounded-xl animate-pulse" />
    </div>
  );

  // Show skeleton UI while loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Loading analytics...
        </div>
        {/* Skeleton mini stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        {/* Skeleton chart */}
        <SkeletonChart />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row: Mini Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Response Rate */}
        <div className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-400/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
          <div className="relative bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm p-3.5 sm:p-5 h-full">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-2 sm:p-2.5 bg-indigo-500/10 rounded-xl ring-1 ring-indigo-500/20">
                <MailCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" strokeWidth={2.5} />
              </div>
              {totalOutreach > 0 && (
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                  {totalResponded}/{totalOutreach}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">Response Rate</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-indigo-500">{responseRate}</span>
              <span className="text-sm sm:text-lg text-muted-foreground">%</span>
            </div>
            {totalOutreach > 0 && (
              <div className="mt-3 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-700"
                  style={{ width: `${responseRate}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Activity Streak */}
        <div className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/20 to-indigo-500/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
          <div className="relative bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm p-3.5 sm:p-5 h-full">
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
                  userData.linkedInOutreach.some((l) => l.date === dayStr) ||
                  userData.targetCompanies.some((t) => t.date === dayStr) ||
                  userData.interviews.some((i) => i.createdAt === dayStr);
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
        <div className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 to-accent/40 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500" />
          <div className="relative bg-gradient-to-br from-primary via-primary to-accent rounded-2xl shadow-xl overflow-hidden p-3.5 sm:p-5 text-white h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock className="w-4 h-4" strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight mb-1">
              {currentTime}
            </div>
            <div className="text-xs opacity-75 font-medium">
              {format(now, 'EEE, MMM dd')}
            </div>
          </div>
        </div>
      </div>

      {/* LinkedIn Outreach + Referral Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* LinkedIn Outreach Breakdown */}
        <div className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
          <div className="relative bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm p-3.5 sm:p-5 h-full">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl ring-1 ring-primary/20">
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" strokeWidth={2.5} />
                </div>
                <p className="text-sm font-semibold">LinkedIn Outreach</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">People Reached</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">{totalLinkedIn}</span>
                  <span className="text-xs text-muted-foreground">total</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">Alumni</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-accent">{linkedInAlumni}</span>
                  <span className="text-xs text-muted-foreground">reached</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">Replied</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-indigo-400">{linkedInReplied}</span>
                  <span className="text-xs text-muted-foreground">responses</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">Replied Alumni</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-accent-light">{linkedInRepliedAlumni}</span>
                  <span className="text-xs text-muted-foreground">responses</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Support */}
        <div className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
          <div className="relative bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm p-3.5 sm:p-5 h-full">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl ring-1 ring-primary/20">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" strokeWidth={2.5} />
                </div>
                <p className="text-sm font-semibold">Referral Support</p>
              </div>
              {totalReferrals > 0 && (
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                  {referralsDone}/{totalReferrals} done
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">Asked</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">{referralsAsked}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">Awaiting</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-accent">{referralsAwaiting}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">Done</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-indigo-400">{referralsDone}</span>
                </div>
              </div>
            </div>
            {totalReferrals > 0 && (
              <div className="mt-4 flex h-2 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(referralsAsked / totalReferrals) * 100}%` }} />
                <div className="h-full bg-accent" style={{ width: `${(referralsAwaiting / totalReferrals) * 100}%` }} />
                <div className="h-full bg-accent-light" style={{ width: `${(referralsDone / totalReferrals) * 100}%` }} />
              </div>
            )}
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
                <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#4f46e5' }} />Jobs Applied</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#6366f1' }} />Cold Emails</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#818cf8' }} />LI Outreach</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#a5b4fc' }} />Targets</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#c7d2fe' }} />Interviews</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg ring-1 ring-primary/20">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">{avgPerDay}/day</span>
                </div>
              </div>
            </div>

            {activityDataChart.some(d => d.total > 0) ? (
              <ResponsiveContainer width="100%" height={220} className="sm:!h-[280px]">
                <BarChart data={activityDataChart} id="weekly-bar-chart">
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
                      color: 'hsl(var(--card-foreground))',
                    }}
                    labelStyle={{ color: 'hsl(var(--card-foreground))', fontWeight: 600 }}
                    itemStyle={{ color: 'hsl(var(--card-foreground))' }}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.08)', radius: 8 }}
                  />
                  <Bar dataKey="applications" stackId="a" fill="#4f46e5" radius={[0, 0, 0, 0]} name="Jobs Applied" />
                  <Bar dataKey="coldEmails" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} name="Cold Emails" />
                  <Bar dataKey="linkedInOutreach" stackId="a" fill="#818cf8" radius={[0, 0, 0, 0]} name="LinkedIn Outreach" />
                  <Bar dataKey="targetCompanies" stackId="a" fill="#a5b4fc" radius={[0, 0, 0, 0]} name="Target Companies" />
                  <Bar dataKey="interviews" stackId="a" fill="#c7d2fe" radius={[6, 6, 0, 0]} name="Interviews" />
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
                <h4 className="font-bold">App Sources</h4>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">{totalActivity} apps</span>
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
                        color: 'hsl(var(--card-foreground))',
                      }}
                      labelStyle={{ color: 'hsl(var(--card-foreground))', fontWeight: 600 }}
                      itemStyle={{ color: 'hsl(var(--card-foreground))' }}
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
