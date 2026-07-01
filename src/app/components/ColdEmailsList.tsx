import { useState, useMemo, useEffect, useRef } from 'react';
import { format, addDays, isAfter, isBefore, isToday } from 'date-fns';
import { Mail, Trash2, Reply, ChevronRight, ChevronDown, Send, MailCheck, Download, AlertCircle, CheckCircle2, Search, X, Pencil, Building2 } from 'lucide-react';
import type { ColdEmail } from '../App';

interface ColdEmailsListProps {
  coldEmails: ColdEmail[];
  onDelete: (id: string) => void;
  onViewDetails: (email: ColdEmail) => void;
  onToggleResponse: (id: string) => void;
  onToggleFollowUpDone?: (id: string) => void;
  onEdit?: (email: ColdEmail) => void;
  highlightedId?: string | null;
  groupByCompany?: boolean;
}

const PAGE_SIZE = 10;

export default function ColdEmailsList({ coldEmails, onDelete, onViewDetails, onToggleResponse, onToggleFollowUpDone, onEdit, highlightedId, groupByCompany = true }: ColdEmailsListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'initial' | 'followup'>('all');
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightedId) {
      const email = coldEmails.find((e) => e.id === highlightedId);
      if (email) {
        const key = email.company?.toLowerCase() || '__unknown__';
        setExpandedCompanies((prev) => new Set([...prev, key]));
        setShowAll(true);
        setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
      }
    }
  }, [highlightedId, coldEmails]);

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
        return filteredEmails;
    }
  };

  const allDisplayEmails = getDisplayEmails();
  const displayEmails = showAll ? allDisplayEmails : allDisplayEmails.slice(0, PAGE_SIZE);

  // Group by company
  const groupedByCompany = useMemo((): Record<string, ColdEmail[]> => {
    const groups: Record<string, ColdEmail[]> = {};
    allDisplayEmails.forEach((email) => {
      const key = email.company?.toLowerCase() || '__unknown__';
      if (!groups[key]) groups[key] = [];
      groups[key].push(email);
    });
    return groups;
  }, [allDisplayEmails]);

  const toggleCompany = (company: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(company)) next.delete(company);
      else next.add(company);
      return next;
    });
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
      <div className="relative bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-indigo-500/5 to-transparent px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-xl sm:rounded-2xl ring-1 ring-indigo-500/20">
                <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold">Cold Emails</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{filteredEmails.length} of {coldEmails.length} emails</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emails..."
                className="w-full sm:w-64 pl-10 pr-10 py-2 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm"
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

          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('all'); setShowAll(false); }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shrink-0 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25'
                  : 'bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/60'
              }`}
            >
              All ({coldEmails.length})
            </button>
            <button
              onClick={() => { setActiveTab('initial'); setShowAll(false); }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shrink-0 ${
                activeTab === 'initial'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25'
                  : 'bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/60'
              }`}
            >
              Initial ({initialEmails.length})
            </button>
            <button
              onClick={() => { setActiveTab('followup'); setShowAll(false); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shrink-0 ${
                activeTab === 'followup'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25'
                  : 'bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/60'
              }`}
            >
              <Reply className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              Follow-ups ({followUpEmails.length})
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          {displayEmails.length === 0 ? (
            <div className="text-center py-10 sm:py-16">
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
            <div className="space-y-2.5">
              {(Object.entries(groupedByCompany) as [string, ColdEmail[]][]).map(([companyKey, emails]) => {
                const company = emails[0].company;
                const isExpanded = expandedCompanies.has(companyKey);
                const hasResponse = emails.some((e) => e.gotResponse);
                const hasHighlight = emails.some((e) => e.id === highlightedId);
                const initials = (company || '?').slice(0, 2).toUpperCase();
                
                // Check for follow-up status in initial emails
                const initialEmails = emails.filter(e => !e.isFollowUp);
                const followUpStatus = initialEmails.length > 0 ? getFollowUpStatus(initialEmails[0]) : null;
                return (
                  <div key={companyKey} className={`rounded-2xl border overflow-hidden transition-all duration-200 ${hasHighlight ? 'border-primary/60 shadow-lg shadow-primary/10' : 'border-border/50 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5'}`}>
                    {/* Company header */}
                    <button
                      type="button"
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 transition-all text-left ${isExpanded ? 'bg-primary/5 border-b border-border/50' : 'bg-card hover:bg-primary/5'}`}
                      onClick={() => toggleCompany(companyKey)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary">{initials}</span>
                        </div>
                        <span className="font-semibold text-sm sm:text-base truncate text-foreground">{company}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground font-medium px-2 py-0.5 bg-muted/60 rounded-full border border-border/40">
                          {emails.length} email{emails.length !== 1 ? 's' : ''}
                        </span>
                        {hasResponse && (
                          <span className="shrink-0 hidden sm:flex items-center gap-1 text-[11px] text-primary font-semibold px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full">
                            <MailCheck className="w-3 h-3" /> Replied
                          </span>
                        )}
                        {followUpStatus && followUpStatus.status !== 'done' && (
                          <span className={`shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            followUpStatus.color === 'overdue' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                            followUpStatus.color === 'due' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                            'text-primary bg-primary/10 border-primary/20'
                          }`}>
                            {followUpStatus.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                            {followUpStatus.status === 'due' && <AlertCircle className="w-3 h-3" />}
                            <span className="hidden sm:inline">{followUpStatus.label}</span>
                            <span className="sm:hidden">
                              {followUpStatus.status === 'overdue' ? 'Overdue' :
                               followUpStatus.status === 'due' ? 'Due Today' :
                               format(addDays(new Date(initialEmails[0].date), 3), 'MMM dd')}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className={`p-1 rounded-lg transition-all ${isExpanded ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </button>
                    {/* Individual entries */}
                    {isExpanded && (
                      <div className="divide-y divide-border/30 bg-background/40">
                        {emails.map((email) => (
                          <div
                            key={email.id}
                            ref={email.id === highlightedId ? highlightRef : null}
                            className={`group/item relative cursor-pointer transition-all ${email.id === highlightedId ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                            onClick={() => onViewDetails(email)}
                          >
                            <div className="px-4 py-3 sm:px-5 sm:py-3.5">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  {/* Badges row */}
                                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                    {email.isFollowUp ? (
                                      <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded-md text-[11px] font-semibold">
                                        <Reply className="w-3 h-3" /> Follow-up
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[11px] font-semibold">
                                        <Send className="w-3 h-3" /> Initial
                                      </span>
                                    )}
                                    {email.gotResponse && (
                                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-md text-[11px] font-semibold">
                                        <MailCheck className="w-3 h-3" /> Replied
                                      </span>
                                    )}
                                    {!email.isFollowUp && (() => {
                                      const status = getFollowUpStatus(email);
                                      const colorClasses = {
                                        green: 'bg-green-500/10 text-green-500 border-green-500/20',
                                        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                                        red: 'bg-red-500/10 text-red-400 border-red-500/20',
                                        blue: 'bg-primary/10 text-primary border-primary/20',
                                      };
                                      return (
                                        <span className={`flex items-center gap-1 px-2 py-0.5 ${colorClasses[status.color as keyof typeof colorClasses]} border rounded-md text-[11px] font-semibold`}>
                                          {status.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                                          {status.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                                          {status.label}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                  {/* Meta row */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {email.role && <span className="text-xs font-medium text-foreground/80">{email.role}</span>}
                                    {email.email && (
                                      <span className="text-[11px] text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-md border border-border/40 truncate max-w-[180px]">
                                        {email.email}
                                      </span>
                                    )}
                                    <span className="text-[11px] text-muted-foreground">{format(new Date(email.date), 'MMM dd, yyyy')}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {!email.isFollowUp && onToggleFollowUpDone && (
                                    <button onClick={(e) => { e.stopPropagation(); onToggleFollowUpDone(email.id); }}
                                      className={`sm:opacity-0 sm:group-hover/item:opacity-100 p-1.5 rounded-lg border transition-all ${email.followUpDone ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10 border-transparent hover:border-green-500/20'}`}
                                      title={email.followUpDone ? 'Mark follow-up as not done' : 'Mark follow-up as done'}>
                                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                                    </button>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); onToggleResponse(email.id); }}
                                    className={`sm:opacity-0 sm:group-hover/item:opacity-100 p-1.5 rounded-lg border transition-all ${email.gotResponse ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10 border-transparent hover:border-green-500/20'}`}
                                    title={email.gotResponse ? 'Mark as no response' : 'Mark as got response'}>
                                    <MailCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                                  </button>
                                  {onEdit && (
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(email); }}
                                      className="sm:opacity-0 sm:group-hover/item:opacity-100 p-1.5 text-primary/70 hover:text-primary hover:bg-primary/10 rounded-lg border border-transparent hover:border-primary/20 transition-all" title="Edit">
                                      <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
                                    </button>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); onDelete(email.id); }}
                                    className="sm:opacity-0 sm:group-hover/item:opacity-100 p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all" title="Delete">
                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                                  </button>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover/item:text-primary transition-all" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
