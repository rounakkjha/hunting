import { FileText, Mail, MessageSquare, BookOpen, CheckSquare, TrendingUp, LucideIcon } from 'lucide-react';
import type { UserData } from '../App';

interface StatsOverviewProps {
  userData: UserData;
}

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  textColor: string;
  subtitle?: string;
  gradient: string;
}

export default function StatsOverview({ userData }: StatsOverviewProps) {
  const initialEmails = userData.coldEmails.filter((e) => !e.isFollowUp).length;
  const followUpEmails = userData.coldEmails.filter((e) => e.isFollowUp).length;

  const stats: Stat[] = [
    {
      label: 'Jobs Applied',
      value: userData.applications.length,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-500',
      gradient: 'from-blue-500/10 to-blue-600/5',
    },
    {
      label: 'Cold Emails',
      value: userData.coldEmails.length,
      icon: Mail,
      color: 'from-cyan-500 to-cyan-600',
      textColor: 'text-cyan-500',
      subtitle: `${initialEmails} initial, ${followUpEmails} follow-ups`,
      gradient: 'from-cyan-500/10 to-cyan-600/5',
    },
    {
      label: 'LinkedIn Outreach',
      value: userData.linkedInOutreach.length,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-500',
      gradient: 'from-purple-500/10 to-purple-600/5',
    },
    {
      label: 'Content Saved',
      value: userData.contentLibrary.length,
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-500',
      gradient: 'from-green-500/10 to-green-600/5',
    },
    {
      label: 'Todos Active',
      value: userData.todos.filter((t) => !t.completed).length,
      icon: CheckSquare,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-500',
      gradient: 'from-amber-500/10 to-amber-600/5',
    },
    {
      label: 'Total Activity',
      value:
        userData.applications.length +
        userData.coldEmails.length +
        userData.linkedInOutreach.length,
      icon: TrendingUp,
      color: 'from-primary to-accent',
      textColor: 'text-primary',
      gradient: 'from-primary/10 to-accent/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="group relative"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300`} />
          <div className="relative bg-card border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <stat.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">{stat.label}</p>
                <p className={`text-4xl font-bold tracking-tight ${stat.textColor} transition-colors`}>
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-2 font-medium">{stat.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
