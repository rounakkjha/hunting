import { FileText, Mail, MessageSquare, Briefcase, LucideIcon, Reply } from 'lucide-react';
import type { UserData } from '../App';

interface StatsOverviewProps {
  userData: UserData;
  onNavigate?: (section: string) => void;
  isLoading?: boolean;
}

interface Stat {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  textColor: string;
  subtitle?: string;
  gradient: string;
  section?: string;
}

export default function StatsOverview({ userData, onNavigate, isLoading }: StatsOverviewProps) {
  // Cold emails = initial (non-follow-up) entries in coldEmails list
  const coldEmailCount = userData.coldEmails.filter((e) => !e.isFollowUp).length;
  // Follow-ups sent = manually logged follow-ups + automation-sent scheduled emails
  const manualFollowUps = userData.coldEmails.filter((e) => e.isFollowUp).length;
  const automationFollowUpsSent = (userData.scheduledEmails || []).filter((s) => s.sent).length;
  const totalFollowUpsSent = manualFollowUps + automationFollowUpsSent;
  // Total emails = cold emails + all follow-ups sent
  const totalEmails = coldEmailCount + totalFollowUpsSent;

  const totalApplied = userData.applications.length;

  // Application IDs linked to an interview (new) OR company name match (legacy)
  const interviewLinkedAppIds = new Set(
    (userData.interviews || []).map((i) => i.sources?.applicationId).filter(Boolean)
  );
  const interviewCompanyNames = new Set(
    (userData.interviews || []).map((i) => i.company.toLowerCase())
  );

  const totalReverts = userData.applications.filter((a) => {
    if (a.isRejected || a.isActive || interviewLinkedAppIds.has(a.id)) return true;
    const appCompany = a.company.toLowerCase();
    return [...interviewCompanyNames].some(
      (ic) => appCompany.includes(ic) || ic.includes(appCompany)
    );
  }).length;
  const revertRate = totalApplied > 0 ? ((totalReverts / totalApplied) * 100).toFixed(1) : '0.0';

  // Skeleton card component
  const SkeletonCard = () => (
    <div className="relative bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
      <div className="relative p-3.5 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted animate-pulse" />
          <div className="w-16 h-3 rounded bg-muted animate-pulse" />
        </div>
        <div className="w-12 h-8 sm:w-16 sm:h-10 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );

  const stats: Stat[] = [
    {
      label: 'Jobs Applied',
      value: userData.applications.length,
      icon: FileText,
      color: 'from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-500',
      gradient: 'from-indigo-500/10 to-indigo-600/5',
      section: 'applications',
    },
    {
      label: 'Emails',
      value: totalEmails,
      icon: Mail,
      color: 'from-indigo-400 to-indigo-500',
      textColor: 'text-indigo-400',
      subtitle: `${coldEmailCount} cold, ${totalFollowUpsSent} follow-ups sent`,
      gradient: 'from-indigo-400/10 to-indigo-500/5',
      section: 'emails',
    },
    {
      label: 'LinkedIn Outreach',
      value: userData.linkedInOutreach.length,
      icon: MessageSquare,
      color: 'from-indigo-500 to-indigo-700',
      textColor: 'text-indigo-500',
      gradient: 'from-indigo-500/10 to-indigo-700/5',
      section: 'linkedin',
    },
    {
      label: 'Interviews',
      value: userData.interviews?.length || 0,
      icon: Briefcase,
      color: 'from-indigo-600 to-primary',
      textColor: 'text-primary',
      gradient: 'from-primary/10 to-indigo-600/5',
      subtitle: `${userData.interviews?.filter(i => i.status === 'active').length || 0} active, ${userData.interviews?.filter(i => i.status === 'rejected').length || 0} rejected`,
      section: 'interviews',
    },
    {
      label: 'Revert Rate',
      value: `${revertRate}%`,
      icon: Reply,
      color: 'from-accent to-accent-light',
      textColor: 'text-accent',
      subtitle: `${totalReverts} of ${totalApplied} got a revert`,
      gradient: 'from-accent/10 to-accent-light/5',
    },
  ];

  // Show skeleton UI while loading
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Loading your data...
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {[...Array(5)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="group relative opacity-0 animate-fade-in-up"
          style={{ animationDelay: `${index * 80}ms` }}
          onClick={() => stat.section && onNavigate?.(stat.section)}
        >
          <div className={`relative bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col ${stat.section ? 'cursor-pointer' : ''}`}>
            <div className="relative p-3.5 sm:p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm`}>
                  <stat.icon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${stat.textColor}`}>
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 sm:mt-1.5 font-medium">{stat.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
