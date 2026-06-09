import { useState, useMemo } from 'react';
import { format, addDays, isAfter, isBefore, isToday } from 'date-fns';
import { Mail, Trash2, Reply, ChevronRight, Send, MailCheck, Download, AlertCircle, CheckCircle2, Search, X, Pencil } from 'lucide-react';
import type { ColdEmail } from '../App';

interface ColdEmailsListProps {
  coldEmails: ColdEmail[];
  onDelete: (id: string) => void;
  onViewDetails: (email: ColdEmail) => void;
  onToggleResponse: (id: string) => void;
  onToggleFollowUpDone?: (id: string) => void;
  onEdit?: (email: ColdEmail) => void;
}

const PAGE_SIZE = 10;

export default function ColdEmailsList({ coldEmails, onDelete, onViewDetails, onToggleResponse, onToggleFollowUpDone, onEdit }: ColdEmailsListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'initial' | 'followup'>('all');
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized filtered emails for performance
  const filteredEmails = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return coldEmails.filter(email =>
      email.company?.toLowerCase().includes(query) ||
      email.role?.toLowerCase().includes(query) ||
      email.email?.toLowerCase().includes(query)
    );
  }, [coldEmails, searchQuery]);

  const initialEmails = useMemo(() =>
    filteredEmails.filter((email) => !email.isFollowUp),
    [filteredEmails]
  );

  const followUpEmails = useMemo(() =>
    filteredEmails.filter((email) => email.isFollowUp),
    [filteredEmails]
  );

  const getFollowUpStatus = (email: ColdEmail) => {
    if (email.followUpDone) return { status: 'done', label: 'Follow-up Done', color: 'green' };
    
    const entryDate = new Date(email.date);
    const followUpDueDate = addDays(entryDate, 3);
    const today = new Date();
    
    if (isToday(followUpDueDate)) {
      return { status: 'due', label: 'Follow-up Due Today', color: 'amber' };
    } else if (isAfter(today, followUpDueDate)) {
      return { status: 'overdue', label: 'Follow-up Overdue', color: 'red' };
    } else {
      return { status: 'pending', label: `Follow-up Due: ${format(followUpDueDate, 'MMM dd')}`, color: 'blue' };
    }
  };

  const getDisplayEmails = () => {
    switch (activeTab) {
      case 'initial':
        return initialEmails;
      case 'followup':
        return followUpEmails;
      default:
        return coldEmails;
    }
  };

  const allDisplayEmails = getDisplayEmails();
  const displayEmails = showAll ? allDisplayEmails : allDisplayEmails.slice(0, PAGE_SIZE);

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
      <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-indigo-500/5 to-transparent px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-2xl ring-1 ring-indigo-500/20">
                <Mail className="w-5 h-5 text-indigo-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Cold Emails</h3>
                <p className="text-sm text-muted-foreground mt-1">{filteredEmails.length} of {coldEmails.length} emails</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emails..."
                className="w-64 pl-10 pr-10 py-2 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('all'); setShowAll(false); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25'
                  : 'bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/60'
              }`}
            >
              All ({coldEmails.length})
            </button>
            <button
              onClick={() => { setActiveTab('initial'); setShowAll(false); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'initial'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25'
                  : 'bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/60'
              }`}
            >
              Initial ({initialEmails.length})
            </button>
            <button
              onClick={() => { setActiveTab('followup'); setShowAll(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'followup'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25'
                  : 'bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/60'
              }`}
            >
              <Reply className="w-4 h-4" />
              Follow-ups ({followUpEmails.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {displayEmails.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 flex items-center justify-center ring-1 ring-indigo-500/20">
                <Send className="w-10 h-10 text-indigo-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">
                {activeTab === 'all'
                  ? 'No cold emails sent yet'
                  : activeTab === 'initial'
                  ? 'No initial emails sent yet'
                  : 'No follow-up emails sent yet'}
              </h4>
            </div>
          ) : (
            <div className="space-y-3">
              {displayEmails.map((email, index) => (
                <div
                  key={email.id}
                  className="group/item relative bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                  onClick={() => onViewDetails(email)}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold truncate text-lg group-hover/item:text-primary transition-colors">
                            {email.company}
                          </h4>
                          {email.isFollowUp && (
                            <div className="relative group/tag">
                              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-semibold">
                                <Reply className="w-3 h-3" />
                                Follow-up
                              </span>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card text-foreground text-xs font-medium rounded-lg border border-border/60 shadow-lg hidden group-hover/tag:block pointer-events-none whitespace-nowrap z-[100]">
                                This is a follow-up email sent after the initial email
                              </span>
                            </div>
                          )}
                          {email.gotResponse && (
                            <div className="relative group/tag">
                              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-xs font-semibold">
                                <MailCheck className="w-3 h-3" />
                                Replied
                              </span>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card text-foreground text-xs font-medium rounded-lg border border-border/60 shadow-lg hidden group-hover/tag:block pointer-events-none whitespace-nowrap z-[100]">
                                The company has responded to this email
                              </span>
                            </div>
                          )}
                          {!email.isFollowUp && (() => {
                            const status = getFollowUpStatus(email);
                            const colorClasses = {
                              green: 'bg-green-500/10 text-green-500 border-green-500/20',
                              amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                              red: 'bg-red-500/10 text-red-500 border-red-500/20',
                              blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                            };
                            const tooltipText = {
                              done: 'Follow-up email has been sent',
                              due: 'Follow-up email is due today',
                              overdue: 'Follow-up email is overdue - send it now!',
                              pending: 'Follow-up email is scheduled for a future date',
                            };
                            return (
                              <div className="relative group/tag">
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 ${colorClasses[status.color as keyof typeof colorClasses]} border rounded-lg text-xs font-semibold`}>
                                  {status.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                                  {status.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                                  {status.label}
                                </span>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card text-foreground text-xs font-medium rounded-lg border border-border/60 shadow-lg hidden group-hover/tag:block pointer-events-none whitespace-nowrap z-[100]">
                                  {tooltipText[status.status as keyof typeof tooltipText]}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="space-y-2">
                          {email.role && <p className="text-sm text-foreground/70 font-medium">{email.role}</p>}
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            {email.email && (
                              <span className="px-3 py-1.5 bg-muted/80 backdrop-blur-sm rounded-lg font-medium border border-border/50 truncate max-w-[200px]">
                                {email.email}
                              </span>
                            )}
                            <span className="text-muted-foreground font-medium">
                              {format(new Date(email.date), 'MMM dd, yyyy')}
                            </span>
                            {email.resumeName && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (email.resumeData) {
                                    const a = document.createElement('a');
                                    a.href = email.resumeData;
                                    a.download = email.resumeName || 'resume';
                                    a.click();
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20 hover:bg-primary/20 transition-all"
                                title="Download resume"
                              >
                                <Download className="w-3 h-3" strokeWidth={2.5} />
                                <span className="text-[10px] font-semibold">Resume</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!email.isFollowUp && onToggleFollowUpDone && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFollowUpDone(email.id);
                            }}
                            className={`opacity-0 group-hover/item:opacity-100 p-2.5 rounded-xl border transition-all ${
                              email.followUpDone
                                ? 'text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500/20'
                                : 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10 border-transparent hover:border-green-500/20'
                            }`}
                            title={email.followUpDone ? 'Mark follow-up as not done' : 'Mark follow-up as done'}
                          >
                            <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleResponse(email.id);
                          }}
                          className={`opacity-0 group-hover/item:opacity-100 p-2.5 rounded-xl border transition-all ${
                            email.gotResponse
                              ? 'text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500/20'
                              : 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10 border-transparent hover:border-green-500/20'
                          }`}
                          title={email.gotResponse ? 'Mark as no response' : 'Mark as got response'}
                        >
                          <MailCheck className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(email);
                            }}
                            className="opacity-0 group-hover/item:opacity-100 p-2.5 text-blue-400 hover:bg-blue-500/10 rounded-xl border border-transparent hover:border-blue-500/20 transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(email.id);
                          }}
                          className="opacity-0 group-hover/item:opacity-100 p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {allDisplayEmails.length > PAGE_SIZE && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    {showAll
                      ? 'Show less'
                      : `Show all ${allDisplayEmails.length} emails`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
