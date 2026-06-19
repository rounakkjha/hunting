import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Minus,
  FileText,
  Mail,
  MessageSquare,
  BookOpen,
  Menu,
  Building2,
  Briefcase,
  Key,
  X,
  Rocket,
  Flame,
  Target,
  TrendingUp,
  Sparkles,
  ChevronRight,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import type { UserData, JobApplication, ColdEmail, LinkedInOutreach, CustomField, TrashItem, TrashItemType, User, Interview, InterviewStatus, InterviewRoundStatus, ReferralStatus } from '../App';
import { updateUserPassword } from '../utils/auth';
import Sidebar from './Sidebar';
import TimeGreeting from './TimeGreeting';
import AdvancedStats from './AdvancedStats';
import StatsOverview from './StatsOverview';
import QuickAddModal from './QuickAddModal';
import ContentLibrary from './ContentLibrary';
import TodoList from './TodoList';
import ApplicationsList from './ApplicationsList';
import ColdEmailsList from './ColdEmailsList';
import LinkedInOutreachList from './LinkedInOutreachList';
import InterviewList from './InterviewList';
import DetailViewModal from './DetailViewModal';
import DateFilter, { getAllTime, type DateRange } from './DateFilter';
import AnimatedBackground from './AnimatedBackground';
import GlobalSearch from './GlobalSearch';
import SavedLinks from './SavedLinks';
import TargetCompanies from './TargetCompanies';
import ConfirmDialog from './ConfirmDialog';
import TrashBin from './TrashBin';
import { useToast } from './Toast';
import StrategyBoard from './StrategyBoard';
import UserManagement from './UserManagement';
import ResumeMatcher from './ResumeMatcher';

interface DashboardProps {
  userData: UserData;
  setUserData: (data: UserData | ((prev: UserData) => UserData)) => void;
  onLogout: () => void;
  currentUser: User | null;
  isTrial?: boolean;
  isLoading?: boolean;
}

type ModalType = 'application' | 'coldEmail' | 'linkedin' | 'content' | 'interview' | null;
type DetailViewType = { type: 'application'; entry: JobApplication } | { type: 'coldEmail'; entry: ColdEmail } | { type: 'linkedin'; entry: LinkedInOutreach } | null;

// Static toast messages - defined outside component to prevent recreation on every render
const quirkyToasts = {
    addApplication: [
      '🎯 Application fired off! Let the games begin.',
      '🚀 One more shot at glory. Application sent!',
      '💼 Resume dropped. Ball is in their court now.',
      '🎪 Another ring in the circus — application added!',
    ],
    addEmail: [
      '📧 Cold email sent. Warming up inboxes!',
      '🧊 Ice breaker deployed. Email logged!',
      '✉️ Sliding into inboxes like a pro.',
      '📬 Message in a bottle — cold email added!',
    ],
    addLinkedin: [
      '💬 LinkedIn outreach locked in!',
      '🤝 Professional stalking initiated. Outreach added!',
      '🔗 Connection request queued. Networking mode ON.',
      '💼 LinkedIn game just leveled up!',
    ],
    addContent: [
      '📝 Content banked for later!',
      '🧠 Big brain content saved.',
      '✍️ Creative genius documented!',
      '📚 Knowledge stashed. Content added!',
    ],
    addTodo: [
      '✅ Task added. Time to crush it!',
      '📋 One more thing on the hustle list.',
      '💪 Added to the grind. Let\'s get it done!',
      '🎯 Target locked. New task on deck.',
    ],
    addLink: [
      '🔗 Link stashed for quick access!',
      '🌐 Bookmarked like a boss.',
      '📌 Pinned! That link isn\'t going anywhere.',
      '⚡ Quick link saved. Speed run ready.',
    ],
    addCompany: [
      '🏢 New target on the radar!',
      '🎯 Company locked in the crosshairs.',
      '🏹 Another one on the hit list. Company added!',
      '🔍 Scouting new territory. Target company logged.',
    ],
    addStrategy: [
      '🎯 Strategy step locked in!',
      '🧠 Master plan updated. You\'re one step ahead.',
      '♟️ Chess move added to the playbook.',
      '📐 Strategy refined. Execution pending.',
    ],
    delete: [
      '🗑️ Poof! Gone but not forgotten (check trash).',
      '💀 Sent to the shadow realm... I mean trash.',
      '🧹 Cleaned up! Moved to trash.',
      '👋 Bye bye! Off to the recycle bin.',
    ],
    edit: [
      '✏️ Edited! Looking sharper already.',
      '🔧 Tweaked to perfection.',
      '✨ Polished and updated!',
      '📝 Quick fix applied. Nailed it.',
    ],
    restore: [
      '♻️ Back from the dead! Restored.',
      '🔄 Second chance granted. Item restored!',
      '🦸 Rescued from the trash! Hero moment.',
      '⏪ Undo master. Successfully restored!',
    ],
    permanentDelete: [
      '💥 Gone forever. No takebacks.',
      '☠️ Permanently obliterated.',
      '🕳️ Into the void. Permanently deleted.',
      '� Burnt to a crisp. No recovery possible.',
    ],
    toggle: [
      '🎉 Task complete! You\'re unstoppable.',
      '✨ Another one bites the dust!',
      '🏆 Done and dusted. Moving on!',
      '⚡ Knocked it out! What\'s next?',
    ],
  };

// Helper function for random toast selection
const randomPick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// Static collection key mapping
const collectionKeyMap: Record<string, string> = {
    application: 'applications',
    coldEmail: 'coldEmails',
    linkedin: 'linkedInOutreach',
    content: 'contentLibrary',
    todo: 'todos',
    savedLink: 'savedLinks',
    targetCompany: 'targetCompanies',
    interview: 'interviews',
  };

export default function Dashboard({ userData, setUserData, onLogout, currentUser, isTrial, isLoading }: DashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [detailView, setDetailView] = useState<DetailViewType>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getAllTime());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ action: () => void; label: string } | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { showToast } = useToast();

  const softDelete = (type: TrashItemType, id: string, label: string) => {
    setConfirmDelete({
      label,
      action: () => {
        setUserData((prev) => {
          const key = collectionKeyMap[type] as keyof UserData;
          const collection = prev[key] as any[];
          const item = collection.find((i: any) => i.id === id);
          if (!item) return prev;
          const trashItem: TrashItem = {
            id: Date.now().toString(),
            type,
            label,
            deletedAt: new Date().toISOString(),
            data: item,
          };
          return {
            ...prev,
            [key]: collection.filter((i: any) => i.id !== id),
            trash: [trashItem, ...prev.trash],
          };
        });
        showToast(randomPick(quirkyToasts.delete));
        setConfirmDelete(null);
      },
    });
  };

  const handleRestore = (trashItem: TrashItem) => {
    setUserData((prev) => {
      const key = collectionKeyMap[trashItem.type] as keyof UserData;
      const collection = prev[key] as any[];
      return {
        ...prev,
        [key]: [trashItem.data, ...collection],
        trash: prev.trash.filter((t) => t.id !== trashItem.id),
      };
    });
    showToast(randomPick(quirkyToasts.restore));
  };

  const handlePermanentDelete = (trashId: string) => {
    setUserData((prev) => ({
      ...prev,
      trash: prev.trash.filter((t) => t.id !== trashId),
    }));
    showToast(randomPick(quirkyToasts.permanentDelete));
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    
    if (!newPassword.trim()) {
      setPasswordError('Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      return;
    }
    
    if (!currentUser?.id) {
      setPasswordError('User not found');
      return;
    }
    
    const success = await updateUserPassword(currentUser.id, newPassword.trim());
    if (success) {
      showToast('Password changed successfully!');
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError('Failed to change password. Please try again.');
    }
  };

  // Carry forward overdue incomplete todos to today
  const today = format(new Date(), 'yyyy-MM-dd');
  const todosWithCarryForward = useMemo(() => {
    return userData.todos.map((t) => {
      if (!t.completed && t.date < today) {
        return { ...t, date: today, carryForward: true };
      }
      return t;
    });
  }, [userData.todos, today]);

  // Filter all data by date range
  const filteredData = useMemo(() => {
    const { start, end } = dateRange;
    return {
      ...userData,
      // Include quick applies in the count but keep date range filter
      applications: userData.applications.filter((a) => a.date >= start && a.date <= end),
      coldEmails: userData.coldEmails.filter((e) => e.date >= start && e.date <= end),
      linkedInOutreach: userData.linkedInOutreach.filter((l) => l.date >= start && l.date <= end),
      contentLibrary: userData.contentLibrary,
      todos: todosWithCarryForward.filter((t: any) => t.date >= start && t.date <= end),
    };
  }, [userData, dateRange, todosWithCarryForward]);

  const handleUpdateEntry = (id: string, updates: any) => {
    if (!detailView) return;

    setUserData((prev) => {
      switch (detailView.type) {
        case 'application':
          return {
            ...prev,
            applications: prev.applications.map((a) => (a.id === id ? { ...a, ...updates } : a)),
          };
        case 'coldEmail':
          return {
            ...prev,
            coldEmails: prev.coldEmails.map((e) => (e.id === id ? { ...e, ...updates } : e)),
          };
        case 'linkedin':
          return {
            ...prev,
            linkedInOutreach: prev.linkedInOutreach.map((o) => (o.id === id ? { ...o, ...updates } : o)),
          };
        default:
          return prev;
      }
    });
    showToast(randomPick(quirkyToasts.edit));
  };

  const handleAddCustomField = (field: CustomField, applyToAll: boolean) => {
    if (!detailView) return;

    const fieldKey = detailView.type === 'application' ? 'applications' : detailView.type === 'coldEmail' ? 'coldEmails' : 'linkedInOutreach';

    setUserData((prev) => {
      const newCustomFields = {
        ...prev.customFields,
        [fieldKey]: [...prev.customFields[fieldKey], field],
      };

      if (!applyToAll) {
        return { ...prev, customFields: newCustomFields };
      }

      const updatedEntries = prev[fieldKey].map((entry: any) => ({
        ...entry,
        customFields: { ...entry.customFields },
      }));

      return {
        ...prev,
        customFields: newCustomFields,
        [fieldKey]: updatedEntries,
      };
    });
  };

  const quickActions = [
    { type: 'application' as const, icon: FileText, label: 'Job Applied', color: 'from-indigo-500 to-indigo-600' },
    { type: 'coldEmail' as const, icon: Mail, label: 'Cold Email', color: 'from-indigo-400 to-indigo-500' },
    { type: 'linkedin' as const, icon: MessageSquare, label: 'LinkedIn Outreach', color: 'from-indigo-500 to-indigo-700' },
    { type: 'interview' as const, icon: Briefcase, label: 'Interview', color: 'from-purple-500 to-purple-600' },
    { type: 'content' as const, icon: BookOpen, label: 'Add Content', color: 'from-indigo-400 to-indigo-600' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': {
        const totalActivity = userData.applications.length + userData.coldEmails.length + userData.linkedInOutreach.length;
        const isNewUser = totalActivity === 0;

        return (
          <div className="space-y-5 sm:space-y-8">
            <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6 ${isNewUser ? 'hidden sm:flex' : ''}`}>
              <TimeGreeting />
              <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
            </div>

            {/* Desktop: always show search + stats + charts */}
            <div className="hidden sm:block space-y-8">
              <GlobalSearch
                userData={userData}
                onNavigate={setActiveSection}
                onViewApplication={(app) => setDetailView({ type: 'application', entry: app })}
                onViewColdEmail={(email) => setDetailView({ type: 'coldEmail', entry: email })}
                onViewLinkedIn={(outreach) => setDetailView({ type: 'linkedin', entry: outreach })}
              />
              <StatsOverview userData={filteredData} onNavigate={setActiveSection} isLoading={isLoading} />
              <AdvancedStats userData={filteredData} isLoading={isLoading} />
            </div>

            {/* Mobile: conditional content */}
            <div className="sm:hidden space-y-5">
              {isNewUser ? (
                /* New user onboarding - rich & exciting */
                <div className="space-y-4">
                  {/* Hero motivation card */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-purple-500/10 border border-primary/20 rounded-2xl p-5">
                    <div className="absolute top-2 right-2 opacity-10">
                      <Rocket className="w-20 h-20 text-primary" />
                    </div>
                    <div className="relative space-y-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Day 1</span>
                      </div>
                      <h2 className="text-lg font-bold">Your job hunt starts here</h2>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        HuntLog tracks every application, email, and connection — so you never lose momentum.
                      </p>
                    </div>
                  </div>

                  {/* Quick actions - prominent & action-oriented */}
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.slice(0, 4).map((action) => (
                      <button
                        key={action.type}
                        onClick={() => setActiveModal(action.type)}
                        className="relative flex flex-col items-start gap-3 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all active:scale-95 group text-left"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.color} shadow-sm`}>
                            <action.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                          </div>
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Plus className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-foreground/90 block">{action.label}</span>
                          <span className="text-[10px] text-muted-foreground">Tap to add</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* What you'll unlock */}
                  <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">What you'll unlock</span>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { icon: BarChart3, text: 'Weekly activity charts & trends', color: 'text-indigo-500' },
                        { icon: Target, text: 'Response rate tracking', color: 'text-cyan-500' },
                        { icon: TrendingUp, text: 'Activity streaks & momentum', color: 'text-emerald-500' },
                        { icon: CheckCircle, text: 'Follow-up reminders', color: 'text-purple-500' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 ${item.color} shrink-0`} strokeWidth={2.5} />
                          <span className="text-xs text-foreground/70">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro tip */}
                  <div className="flex items-start gap-3 p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg shrink-0 mt-0.5">
                      <Rocket className="w-3.5 h-3.5 text-amber-600" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Pro tip</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        People who track their job search are 3x more likely to land interviews. Start with just one entry today!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Returning user with data */
                <div className="space-y-3">
                  {/* Quick action grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {quickActions.slice(0, 4).map((action) => (
                      <button
                        key={action.type}
                        onClick={() => setActiveModal(action.type)}
                        className="flex flex-col items-center gap-1.5 py-3 bg-card border border-border/50 rounded-xl hover:border-primary/40 transition-all active:scale-95"
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                          <action.icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">{action.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>

                  <StatsOverview userData={filteredData} onNavigate={setActiveSection} isLoading={isLoading} />

                  <button
                    onClick={() => setActiveSection('analytics')}
                    className="w-full py-3 px-4 bg-card border border-border/50 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 rotate-45" />
                    View Full Analytics
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'applications':
        const todayQuickApplies = userData.applications.filter(
          (a) => a.isQuickApply && a.date === format(new Date(), 'yyyy-MM-dd')
        ).length;
        const totalQuickApplies = userData.applications.filter((a) => a.isQuickApply).length;

        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <h2 className="text-xl sm:text-3xl font-bold">Job Applications</h2>
              <button
                onClick={() => setActiveModal('application')}
                className="flex items-center gap-2 p-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl sm:rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                <span className="hidden sm:inline">Add Application</span>
              </button>
            </div>

            {/* Quick Apply Counter */}
            <div className="flex items-center gap-3 bg-card border border-border/60 rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">{todayQuickApplies}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">today</span>
                </div>
                <div className="text-xs text-muted-foreground/70 mt-0.5">
                  {totalQuickApplies} total quick applies
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {totalQuickApplies > 0 && (
                  <button
                    onClick={() => {
                      const quickApplies = userData.applications.filter((a) => a.isQuickApply);
                      const mostRecent = quickApplies[0];
                      if (mostRecent) {
                        setUserData((prev) => ({
                          ...prev,
                          applications: prev.applications.filter((a) => a.id !== mostRecent.id),
                        }));
                      }
                    }}
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-muted hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    title="Undo last"
                  >
                    <Minus className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                )}
                <button
                  onClick={() => {
                    const newApp = {
                      id: Date.now().toString(),
                      date: format(new Date(), 'yyyy-MM-dd'),
                      company: 'Quick Apply',
                      role: 'Quick Apply',
                      isQuickApply: true,
                    };
                    setUserData((prev) => ({
                      ...prev,
                      applications: [newApp, ...prev.applications],
                    }));
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>

            <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
            <ApplicationsList
              applications={filteredData.applications.filter((a) => !a.isQuickApply)}
              onDelete={(id) => {
                const app = userData.applications.find((a) => a.id === id);
                softDelete('application', id, app?.company || 'Application');
              }}
              onViewDetails={(app) => setDetailView({ type: 'application', entry: app })}
              onUpdateTag={(id, tag) => {
                setUserData((prev) => {
                  const updated = {
                    ...prev,
                    applications: prev.applications.map((a) =>
                      a.id === id ? { ...a, emailTag: tag } : a
                    ),
                  };
                  // Auto-add to target companies when marked as "need_to_mail"
                  if (tag === 'need_to_mail') {
                    const app = prev.applications.find((a) => a.id === id);
                    if (app?.company) {
                      const alreadyExists = prev.targetCompanies.some(
                        (tc) => tc.company.toLowerCase() === app.company.toLowerCase()
                      );
                      if (!alreadyExists) {
                        updated.targetCompanies = [
                          {
                            id: Date.now().toString(),
                            date: format(new Date(), 'yyyy-MM-dd'),
                            company: app.company,
                            role: app.role,
                            jobUrl: app.jobUrl,
                            contacts: [],
                          },
                          ...prev.targetCompanies,
                        ];
                        showToast(randomPick(quirkyToasts.addCompany));
                      }
                    }
                  }
                  return updated;
                });
              }}
              onEdit={(app) => {
                setEditingEntry(app);
                setActiveModal('application');
              }}
            />
            {/* Companies needing mail that aren't in target companies */}
            {(() => {
              const needToMailApps = userData.applications.filter((a) => a.emailTag === 'need_to_mail');
              const ignored = userData.ignoredTargetSuggestions || [];
              const missingFromTargets = needToMailApps.filter(
                (app) =>
                  !userData.targetCompanies.some(
                    (tc) => tc.company.toLowerCase() === app.company.toLowerCase()
                  ) &&
                  !ignored.some((ig) => ig.toLowerCase() === app.company.toLowerCase())
              );
              if (missingFromTargets.length === 0) return null;
              return (
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                  <p className="text-sm font-semibold text-amber-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Companies marked &quot;Need to Mail&quot; not in Target Companies
                  </p>
                  <div className="space-y-2">
                    {missingFromTargets.map((app) => (
                      <div key={app.id} className="flex items-center justify-between gap-3 p-2.5 bg-background/50 rounded-xl border border-border/40">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{app.company}</p>
                          {app.role && <p className="text-xs text-muted-foreground">{app.role}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setUserData((prev) => ({
                                ...prev,
                                ignoredTargetSuggestions: [...(prev.ignoredTargetSuggestions || []), app.company],
                              }));
                            }}
                            className="px-3 py-1.5 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-xs font-medium border border-border/40 transition-all"
                          >
                            Ignore
                          </button>
                          <button
                            onClick={() => {
                              setUserData((prev) => ({
                                ...prev,
                                targetCompanies: [
                                  {
                                    id: Date.now().toString() + Math.random().toString(36).slice(2),
                                    date: format(new Date(), 'yyyy-MM-dd'),
                                    company: app.company,
                                    role: app.role,
                                    jobUrl: app.jobUrl,
                                    contacts: [],
                                  },
                                  ...prev.targetCompanies,
                                ],
                              }));
                              showToast(randomPick(quirkyToasts.addCompany));
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all"
                          >
                            + Add to Targets
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        );

      case 'emails':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <h2 className="text-xl sm:text-3xl font-bold">Cold Emails</h2>
              <button
                onClick={() => setActiveModal('coldEmail')}
                className="flex items-center gap-2 p-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl sm:rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                <span className="hidden sm:inline">Add Cold Email</span>
              </button>
            </div>
            <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
            <ColdEmailsList
              coldEmails={filteredData.coldEmails}
              onDelete={(id) => {
                const email = userData.coldEmails.find((e) => e.id === id);
                softDelete('coldEmail', id, email?.company || 'Cold Email');
              }}
              onViewDetails={(email) => setDetailView({ type: 'coldEmail', entry: email })}
              onToggleResponse={(id) =>
                setUserData((prev) => ({
                  ...prev,
                  coldEmails: prev.coldEmails.map((e) =>
                    e.id === id ? { ...e, gotResponse: !e.gotResponse } : e
                  ),
                }))
              }
              onToggleFollowUpDone={(id) =>
                setUserData((prev) => ({
                  ...prev,
                  coldEmails: prev.coldEmails.map((e) =>
                    e.id === id ? { ...e, followUpDone: !e.followUpDone } : e
                  ),
                }))
              }
              onEdit={(email) => {
                setEditingEntry(email);
                setActiveModal('coldEmail');
              }}
            />
          </div>
        );

      case 'linkedin':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <h2 className="text-xl sm:text-3xl font-bold">LinkedIn Outreach</h2>
              <button
                onClick={() => setActiveModal('linkedin')}
                className="flex items-center gap-2 p-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl sm:rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                <span className="hidden sm:inline">Add Outreach</span>
              </button>
            </div>
            <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
            <LinkedInOutreachList
              outreach={filteredData.linkedInOutreach}
              onDelete={(id) => {
                const item = userData.linkedInOutreach.find((o) => o.id === id);
                softDelete('linkedin', id, item?.name || item?.company || 'LinkedIn Outreach');
              }}
              onViewDetails={(item) => setDetailView({ type: 'linkedin', entry: item })}
              onToggleResponse={(id) => {
                setUserData((prev) => ({
                  ...prev,
                  linkedInOutreach: prev.linkedInOutreach.map((o) =>
                    o.id === id ? { ...o, gotResponse: !o.gotResponse } : o
                  ),
                }));
                showToast(randomPick(quirkyToasts.edit));
              }}
              onToggleAlumni={(id) => {
                setUserData((prev) => ({
                  ...prev,
                  linkedInOutreach: prev.linkedInOutreach.map((o) =>
                    o.id === id ? { ...o, isAlumni: !o.isAlumni } : o
                  ),
                }));
                showToast(randomPick(quirkyToasts.edit));
              }}
              onEdit={(item) => {
                setEditingEntry(item);
                setActiveModal('linkedin');
              }}
            />
          </div>
        );

      case 'interviews':
        return (
          <div className="space-y-6">
            <InterviewList
              interviews={userData.interviews}
              onOpenAddModal={() => setActiveModal('interview')}
              onEdit={(interview) => {
                setEditingEntry(interview);
                setActiveModal('interview');
              }}
              onAdd={(data) => {
                const newInterview = {
                  ...data,
                  id: Date.now().toString(),
                  createdAt: format(new Date(), 'yyyy-MM-dd'),
                  updatedAt: format(new Date(), 'yyyy-MM-dd'),
                };
                setUserData((prev) => ({
                  ...prev,
                  interviews: [newInterview, ...prev.interviews],
                }));
                showToast(randomPick(quirkyToasts.addApplication));
              }}
              onDelete={(id) => {
                const interview = userData.interviews.find((i) => i.id === id);
                softDelete('interview', id, interview?.company || 'Interview');
              }}
              onUpdateRound={(interviewId, roundId, updates) => {
                setUserData((prev) => ({
                  ...prev,
                  interviews: prev.interviews.map((i) =>
                    i.id === interviewId
                      ? {
                          ...i,
                          rounds: i.rounds.map((r) =>
                            r.id === roundId ? { ...r, ...updates } : r
                          ),
                          updatedAt: format(new Date(), 'yyyy-MM-dd'),
                        }
                      : i
                  ),
                }));
              }}
              onUpdateStatus={(id, status) => {
                setUserData((prev) => ({
                  ...prev,
                  interviews: prev.interviews.map((i) =>
                    i.id === id
                      ? {
                          ...i,
                          status,
                          updatedAt: format(new Date(), 'yyyy-MM-dd'),
                        }
                      : i
                  ),
                }));
              }}
            />
          </div>
        );

      case 'targets':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Target Companies</h2>
            <TargetCompanies
              companies={userData.targetCompanies}
              onAdd={(company, role, date, jobUrl, referralStatus) => {
                const newTargetId = Date.now().toString();
                const newTarget: UserData['targetCompanies'][number] = {
                  id: newTargetId,
                  date: date || format(new Date(), 'yyyy-MM-dd'),
                  company,
                  role,
                  jobUrl,
                  referralStatus,
                  contacts: [],
                };
                setUserData((prev) => {
                  const shouldCreateApplication = referralStatus === 'done' && !newTarget.referralApplicationCreated;
                  const updatedTargets = [newTarget, ...prev.targetCompanies];
                  if (!shouldCreateApplication) {
                    return { ...prev, targetCompanies: updatedTargets };
                  }
                  const newApp: JobApplication = {
                    id: Date.now().toString(),
                    date: format(new Date(), 'yyyy-MM-dd'),
                    company,
                    role,
                    source: 'referral',
                    jobUrl,
                  };
                  return {
                    ...prev,
                    targetCompanies: updatedTargets.map((t) =>
                      t.id === newTargetId ? { ...t, referralApplicationCreated: true } : t
                    ),
                    applications: [newApp, ...prev.applications],
                  };
                });
                showToast(randomPick(quirkyToasts.addCompany));
                if (referralStatus === 'done') {
                  showToast(randomPick(quirkyToasts.addApplication));
                }
              }}
              onDelete={(id) => {
                const tc = userData.targetCompanies.find((c) => c.id === id);
                softDelete('targetCompany', id, tc?.company || 'Target Company');
              }}
              onAddContact={(companyId, contact) =>
                setUserData((prev) => ({
                  ...prev,
                  targetCompanies: prev.targetCompanies.map((c) =>
                    c.id === companyId
                      ? {
                          ...c,
                          contacts: [
                            ...c.contacts,
                            { ...contact, id: Date.now().toString() },
                          ],
                        }
                      : c
                  ),
                }))
              }
              onDeleteContact={(companyId, contactId) =>
                setUserData((prev) => ({
                  ...prev,
                  targetCompanies: prev.targetCompanies.map((c) =>
                    c.id === companyId
                      ? { ...c, contacts: c.contacts.filter((ct) => ct.id !== contactId) }
                      : c
                  ),
                }))
              }
              onUpdateContact={(companyId, contactId, updates) => {
                setUserData((prev) => ({
                  ...prev,
                  targetCompanies: prev.targetCompanies.map((c) =>
                    c.id === companyId
                      ? { ...c, contacts: c.contacts.map((ct) => ct.id === contactId ? { ...ct, ...updates } : ct) }
                      : c
                  ),
                }));
                showToast(randomPick(quirkyToasts.edit));
              }}
              onUpdateCompany={(companyId, updates) => {
                setUserData((prev) => {
                  const company = prev.targetCompanies.find((c) => c.id === companyId);
                  const isMarkingDone = updates.referralStatus === 'done' && company?.referralStatus !== 'done' && !company?.referralApplicationCreated;
                  const updatedTargets = prev.targetCompanies.map((c) =>
                    c.id === companyId ? { ...c, ...updates } : c
                  );
                  if (!isMarkingDone) {
                    return { ...prev, targetCompanies: updatedTargets };
                  }
                  const updatedCompany = updatedTargets.find((c) => c.id === companyId);
                  const newApp: JobApplication = {
                    id: Date.now().toString(),
                    date: format(new Date(), 'yyyy-MM-dd'),
                    company: updatedCompany?.company || company?.company || '',
                    role: updatedCompany?.role || company?.role,
                    source: 'referral',
                    jobUrl: updatedCompany?.jobUrl || company?.jobUrl,
                  };
                  return {
                    ...prev,
                    targetCompanies: updatedTargets.map((c) =>
                      c.id === companyId ? { ...c, referralApplicationCreated: true } : c
                    ),
                    applications: [newApp, ...prev.applications],
                  };
                });
                showToast(randomPick(quirkyToasts.edit));
                if (updates.referralStatus === 'done') {
                  showToast(randomPick(quirkyToasts.addApplication));
                }
              }}
              onUpdateNotes={(companyId, notes) =>
                setUserData((prev) => ({
                  ...prev,
                  targetCompanies: prev.targetCompanies.map((c) =>
                    c.id === companyId ? { ...c, notes } : c
                  ),
                }))
              }
            />
          </div>
        );

      case 'content':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <h2 className="text-xl sm:text-3xl font-bold">Content Library</h2>
              <button
                onClick={() => setActiveModal('content')}
                className="flex items-center gap-2 p-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl sm:rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                <span className="hidden sm:inline">Add Content</span>
              </button>
            </div>
            <ContentLibrary
              content={userData.contentLibrary}
              onDelete={(id) => {
                const item = userData.contentLibrary.find((c) => c.id === id);
                softDelete('content', id, item?.title || 'Content');
              }}
              onUpdate={(id, updates) => {
                setUserData((prev) => ({
                  ...prev,
                  contentLibrary: prev.contentLibrary.map((c) =>
                    c.id === id ? { ...c, ...updates } : c
                  ),
                }));
                showToast(randomPick(quirkyToasts.edit));
              }}
            />
          </div>
        );

      case 'todos':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">To-Do List</h2>
            <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
            <TodoList
              todos={filteredData.todos}
              onAdd={(text, priority) => {
                setUserData((prev) => ({
                  ...prev,
                  todos: [
                    {
                      id: Date.now().toString(),
                      date: format(new Date(), 'yyyy-MM-dd'),
                      text,
                      completed: false,
                      priority,
                    },
                    ...prev.todos,
                  ],
                }));
                showToast(randomPick(quirkyToasts.addTodo));
              }}
              onToggle={(id) => {
                const todo = userData.todos.find((t) => t.id === id);
                setUserData((prev) => ({
                  ...prev,
                  todos: prev.todos.map((t) =>
                    t.id === id
                      ? {
                          ...t,
                          completed: !t.completed,
                          completedDate: !t.completed ? format(new Date(), 'yyyy-MM-dd') : undefined,
                        }
                      : t
                  ),
                }));
                if (todo && !todo.completed) showToast(randomPick(quirkyToasts.toggle));
              }}
              onDelete={(id) => {
                const todo = userData.todos.find((t) => t.id === id);
                softDelete('todo', id, todo?.text?.slice(0, 40) || 'To-Do');
              }}
              onUpdatePriority={(id, priority) =>
                setUserData((prev) => ({
                  ...prev,
                  todos: prev.todos.map((t) =>
                    t.id === id ? { ...t, priority } : t
                  ),
                }))
              }
              onEdit={(id, text) => {
                setUserData((prev) => ({
                  ...prev,
                  todos: prev.todos.map((t) =>
                    t.id === id ? { ...t, text } : t
                  ),
                }));
                showToast(randomPick(quirkyToasts.edit));
              }}
              onUpdateDate={(id, date) => {
                setUserData((prev) => ({
                  ...prev,
                  todos: prev.todos.map((t) =>
                    t.id === id ? { ...t, date, carryForward: false } : t
                  ),
                }));
                showToast(randomPick(quirkyToasts.edit));
              }}
              onToggleCarryForward={(id) => {
                setUserData((prev) => ({
                  ...prev,
                  todos: prev.todos.map((t) =>
                    t.id === id ? { ...t, carryForward: !t.carryForward } : t
                  ),
                }));
              }}
            />
          </div>
        );

      case 'strategy':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Strategy</h2>
            <StrategyBoard
              items={userData.strategy}
              onAdd={(text) => {
                setUserData((prev) => ({
                  ...prev,
                  strategy: [
                    ...prev.strategy,
                    {
                      id: Date.now().toString(),
                      text,
                      completed: false,
                      order: prev.strategy.length,
                    },
                  ],
                }));
                showToast(randomPick(quirkyToasts.addStrategy));
              }}
              onDelete={(id) =>
                setUserData((prev) => ({
                  ...prev,
                  strategy: prev.strategy.filter((s) => s.id !== id),
                }))
              }
              onToggle={(id) =>
                setUserData((prev) => ({
                  ...prev,
                  strategy: prev.strategy.map((s) =>
                    s.id === id ? { ...s, completed: !s.completed } : s
                  ),
                }))
              }
              onEdit={(id, text) => {
                setUserData((prev) => ({
                  ...prev,
                  strategy: prev.strategy.map((s) =>
                    s.id === id ? { ...s, text } : s
                  ),
                }));
                showToast(randomPick(quirkyToasts.edit));
              }}
              onReorder={(items) =>
                setUserData((prev) => ({
                  ...prev,
                  strategy: items,
                }))
              }
            />
          </div>
        );

      case 'links':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-3xl font-bold">Quick Links</h2>
            <SavedLinks
              links={userData.savedLinks}
              onAdd={({ name, url }) => {
                setUserData((prev) => ({
                  ...prev,
                  savedLinks: [
                    {
                      id: Date.now().toString(),
                      name,
                      url,
                      date: format(new Date(), 'yyyy-MM-dd'),
                    },
                    ...prev.savedLinks,
                  ],
                }));
                showToast(randomPick(quirkyToasts.addLink));
              }}
              onDelete={(id) => {
                const link = userData.savedLinks.find((l) => l.id === id);
                softDelete('savedLink', id, link?.name || 'Link');
              }}
            />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Analytics</h2>
            <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
            <AdvancedStats userData={filteredData} />
          </div>
        );

      case 'matcher':
        return (
          <div className="space-y-6">
            <ResumeMatcher />
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <UserManagement currentUser={currentUser} />
          </div>
        );

      case 'trash':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Trash</h2>
            <TrashBin
              items={userData.trash}
              onRestore={handleRestore}
              onDeletePermanently={handlePermanentDelete}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background-secondary overflow-hidden">
      <AnimatedBackground />

      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} onLogout={onLogout} onChangePassword={() => setShowChangePassword(true)} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} currentUser={currentUser} />

      <main className="flex-1 overflow-y-auto">
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-2 sm:gap-3 overflow-x-auto">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <Menu className="w-5 h-5" strokeWidth={2.5} />
            </button>
            {/* Desktop/Tablet quick actions */}
            <span className="hidden sm:inline text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Quick Add</span>
            {quickActions.map((action) => (
              <button
                key={action.type}
                onClick={() => setActiveModal(action.type)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 sm:px-4 bg-card/80 border border-border/50 rounded-xl text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:shadow-md hover:shadow-primary/10 shrink-0"
              >
                <action.icon className="w-4 h-4 text-primary" strokeWidth={2.5} />
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:p-10 animate-fade-in-up" key={activeSection}>
          {renderContent()}
        </div>
      </main>

      {activeModal && (
        <QuickAddModal
          type={activeModal}
          customFields={
            activeModal === 'application'
              ? userData.customFields.applications
              : activeModal === 'coldEmail'
              ? userData.customFields.coldEmails
              : activeModal === 'linkedin'
              ? userData.customFields.linkedInOutreach
              : []
          }
          knownCompanies={userData.knownCompanies || []}
          editingEntry={editingEntry}
          existingEntries={
            activeModal === 'application' ? userData.applications :
            activeModal === 'coldEmail' ? userData.coldEmails :
            activeModal === 'linkedin' ? userData.linkedInOutreach :
            activeModal === 'interview' ? userData.interviews :
            []
          }
          onAddKnownCompany={(company) => {
            if (!userData.knownCompanies?.includes(company)) {
              setUserData((prev) => ({
                ...prev,
                knownCompanies: [...(prev.knownCompanies || []), company],
              }));
            }
          }}
          onClose={() => {
            setActiveModal(null);
            setEditingEntry(null);
          }}
          onAdd={(data) => {
            // Add company to knownCompanies if it's new
            const companyName = data.company?.trim();
            if (companyName && !userData.knownCompanies?.includes(companyName)) {
              setUserData((prev) => ({
                ...prev,
                knownCompanies: [...(prev.knownCompanies || []), companyName],
              }));
            }
            const { customFields, ...baseData } = data;
            const processedData = { ...baseData };

            if (activeModal === 'coldEmail' && processedData.isFollowUp) {
              processedData.isFollowUp = processedData.isFollowUp === 'true';
            }
            if (activeModal === 'linkedin' && processedData.isAlumni) {
              processedData.isAlumni = processedData.isAlumni === 'true';
            }
            if (activeModal === 'application' && processedData.isGreatLakesAlumni) {
              processedData.isGreatLakesAlumni = processedData.isGreatLakesAlumni === 'true';
            }

            // Handle edit vs add
            if (editingEntry) {
              // Update existing entry
              const collectionKeyMap: Record<string, string> = {
                application: 'applications',
                coldEmail: 'coldEmails',
                linkedin: 'linkedInOutreach',
                interview: 'interviews',
              };
              const collectionKey = collectionKeyMap[activeModal];
              if (collectionKey) {
                setUserData((prev) => ({
                  ...prev,
                  [collectionKey]: (prev as any)[collectionKey].map((e: any) =>
                    e.id === editingEntry.id
                      ? { ...processedData, id: editingEntry.id, createdAt: editingEntry.createdAt, customFields: customFields || {}, updatedAt: format(new Date(), 'yyyy-MM-dd') }
                      : e
                  ),
                }));
              }
              showToast(randomPick(quirkyToasts.edit));
            } else {
              // Add new entry - use date from form if provided, otherwise today
              const newEntry = {
                ...processedData,
                id: Date.now().toString(),
                date: processedData.date || format(new Date(), 'yyyy-MM-dd'),
                customFields: customFields || {},
              };

              setUserData((prev) => {
                switch (activeModal) {
                  case 'application':
                    return { ...prev, applications: [newEntry as any, ...prev.applications] };
                  case 'coldEmail':
                    return { ...prev, coldEmails: [newEntry as any, ...prev.coldEmails] };
                  case 'linkedin':
                    return { ...prev, linkedInOutreach: [newEntry as any, ...prev.linkedInOutreach] };
                  case 'content':
                    return { ...prev, contentLibrary: [newEntry as any, ...prev.contentLibrary] };
                  case 'interview':
                    return { ...prev, interviews: [newEntry as any, ...prev.interviews] };
                  default:
                    return prev;
                }
              });

              const modalToastMap: Record<string, string[]> = {
                application: quirkyToasts.addApplication,
                coldEmail: quirkyToasts.addEmail,
                linkedin: quirkyToasts.addLinkedin,
                content: quirkyToasts.addContent,
                interview: quirkyToasts.addApplication,
              };
              showToast(randomPick(modalToastMap[activeModal] || ['✅ Entry added!']));
              if (isTrial) {
                setTimeout(() => {
                  showToast('⚠️ This is a temporary account, data would be erased.');
                }, 1200);
              }
            }
            setActiveModal(null);
            setEditingEntry(null);
          }}
        />
      )}

      {detailView && (
        <DetailViewModal
          type={detailView.type}
          entry={detailView.entry}
          customFields={
            detailView.type === 'application'
              ? userData.customFields.applications
              : detailView.type === 'coldEmail'
              ? userData.customFields.coldEmails
              : userData.customFields.linkedInOutreach
          }
          onClose={() => setDetailView(null)}
          onUpdate={handleUpdateEntry}
          onAddCustomField={handleAddCustomField}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Item"
        message={confirmDelete ? `Are you sure you want to delete "${confirmDelete.label}"? It will be moved to trash and can be restored within 7 days.` : ''}
        confirmLabel="Move to Trash"
        onConfirm={() => confirmDelete?.action()}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-card border border-border/50 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Change Password</h3>
              </div>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all"
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {passwordError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Change Password
                </button>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  className="px-4 py-3 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-muted/80 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
