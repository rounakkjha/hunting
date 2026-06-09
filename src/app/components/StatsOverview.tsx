import { FileText, Mail, MessageSquare, CheckSquare, Briefcase, LucideIcon } from 'lucide-react';
import type { UserData } from '../App';

interface StatsOverviewProps {
  userData: UserData;
  onNavigate?: (section: string) => void;
}

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  textColor: string;
  subtitle?: string;
  gradient: string;
  section?: string;
}

export default function StatsOverview({ userData, onNavigate }: StatsOverviewProps) {
  const initialEmails = userData.coldEmails.filter((e) => !e.isFollowUp).length;
  const followUpEmails = userData.coldEmails.filter((e) => e.isFollowUp).length;
  const followUpsDone = userData.coldEmails.filter((e) => e.followUpDone).length;

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
      label: 'Cold Emails',
      value: userData.coldEmails.length,
      icon: Mail,
      color: 'from-indigo-400 to-indigo-500',
      textColor: 'text-indigo-400',
      subtitle: `${initialEmails} initial, ${followUpsDone}/${followUpEmails} follow-ups done`,
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
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-500',
      gradient: 'from-purple-500/10 to-purple-600/5',
      subtitle: `${userData.interviews?.filter(i => i.status === 'active').length || 0} active`,
      section: 'interviews',
    },
    {
      label: 'Todos Active',
      value: userData.todos.filter((t) => !t.completed).length,
      icon: CheckSquare,
      color: 'from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-500',
      gradient: 'from-indigo-500/10 to-indigo-600/5',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="group relative opacity-0 animate-fade-in-up"
          style={{ animationDelay: `${index * 80}ms` }}
          onClick={() => stat.section && onNavigate?.(stat.section)}
        >
          <div className={`relative bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 ${stat.section ? 'cursor-pointer' : ''}`}>
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm`}>
                  <stat.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
              <p className={`text-3xl font-bold tracking-tight ${stat.textColor}`}>
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">{stat.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
