import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Briefcase, Plus, Trash2, Building2, Calendar, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import type { Interview, InterviewRoundStatus, InterviewStatus } from '../App';
import { Skeleton } from './ui/skeleton';

interface InterviewListProps {
  interviews: Interview[];
  onAdd: (data: any) => void;
  onOpenAddModal?: () => void;
  onEdit?: (interview: Interview) => void;
  onDelete: (id: string) => void;
  onUpdateRound: (interviewId: string, roundId: string, updates: Partial<{ status: InterviewRoundStatus; date: string; notes: string }>) => void;
  onUpdateStatus: (id: string, status: InterviewStatus) => void;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<InterviewStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
  active: { label: 'Active', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Clock },
  rejected: { label: 'Rejected', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle },
  offered: { label: 'Offered', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: DollarSign },
  accepted: { label: 'Accepted', color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle },
  declined: { label: 'Declined', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: AlertCircle },
};

const ROUND_STATUS_CONFIG: Record<InterviewRoundStatus, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Result Pending', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  selected: { label: 'Selected', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  rejected: { label: 'Rejected', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  scheduled: { label: 'Scheduled', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
};

export default function InterviewList({ interviews, onAdd, onOpenAddModal, onEdit, onDelete, onUpdateRound, onUpdateStatus, isLoading }: InterviewListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Memoized interview filtering for performance
  const activeInterviews = useMemo(() =>
    interviews.filter(i => i.status === 'active'),
    [interviews]
  );

  const completedInterviews = useMemo(() =>
    interviews.filter(i => i.status !== 'active'),
    [interviews]
  );
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const InterviewCard = ({ interview }: { interview: Interview }) => {
    const statusConfig = STATUS_CONFIG[interview.status] || STATUS_CONFIG.active;
    const StatusIcon = statusConfig.icon;
    const isExpanded = expandedId === interview.id;
    const rounds = interview.rounds || [];
    const sources = interview.sources || {};

    return (
      <div className="bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/30 transition-all duration-300">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl ring-1 ring-purple-500/20">
                  <Building2 className="w-4 h-4 text-purple-500" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-base truncate">{interview.company}</h4>
                  <p className="text-sm text-muted-foreground">{interview.role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap mt-3">
                <div className="relative group/tag">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusConfig.color} ${statusConfig.bg} border ${statusConfig.border}`}>
                    <StatusIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {statusConfig.label}
                  </span>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card text-foreground text-xs font-medium rounded-lg border border-border/60 shadow-lg hidden group-hover/tag:block pointer-events-none whitespace-nowrap z-[100]">
                    {interview.status === 'active' ? 'Interview process is ongoing' :
                     interview.status === 'rejected' ? 'Application was rejected' :
                     interview.status === 'offered' ? 'Job offer received' :
                     interview.status === 'accepted' ? 'Offer accepted' :
                     interview.status === 'declined' ? 'Offer declined' : 'Interview status'}
                  </span>
                </div>
                {interview.currentRound && (
                  <div className="relative group/tag">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-muted-foreground bg-muted/50 border border-border/40">
                      <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
                      {interview.currentRound}
                    </span>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card text-foreground text-xs font-medium rounded-lg border border-border/60 shadow-lg hidden group-hover/tag:block pointer-events-none whitespace-nowrap z-[100]">
                      Current interview round
                    </span>
                  </div>
                )}
                {rounds.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {rounds.length} round{rounds.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {interview.offerDetails?.salary && (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 font-medium">
                  <DollarSign className="w-4 h-4" strokeWidth={2.5} />
                  {interview.offerDetails.salary}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleExpand(interview.id)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(interview)}
                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                  title="Edit"
                >
                  <FileText className="w-4 h-4" strokeWidth={2.5} />
                </button>
              )}
              <button
                onClick={() => onDelete(interview.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border/40 space-y-4">
              {/* Sources */}
              {(sources.applicationId || sources.coldEmailIds?.length || sources.linkedinOutreachIds?.length) && (
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sources</h5>
                  <div className="flex flex-wrap gap-2">
                    {sources.applicationId && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-xs font-medium border border-indigo-500/20">
                        <FileText className="w-3 h-3" strokeWidth={2.5} />
                        Application
                      </span>
                    )}
                    {sources.coldEmailIds && sources.coldEmailIds.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-xs font-medium border border-blue-500/20">
                        <FileText className="w-3 h-3" strokeWidth={2.5} />
                        Cold Email ({sources.coldEmailIds.length})
                      </span>
                    )}
                    {sources.linkedinOutreachIds && sources.linkedinOutreachIds.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/10 text-cyan-500 rounded-lg text-xs font-medium border border-cyan-500/20">
                        <FileText className="w-3 h-3" strokeWidth={2.5} />
                        LinkedIn ({sources.linkedinOutreachIds.length})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Rounds Timeline */}
              {rounds.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Interview Rounds</h5>
                  <div className="space-y-3">
                    {rounds.map((round, index) => {
                      const roundConfig = ROUND_STATUS_CONFIG[round.status];
                      return (
                        <div key={round.id} className="relative pl-6 pb-3 last:pb-0">
                          {index !== rounds.length - 1 && (
                            <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-border/40" />
                          )}
                          <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
                            round.status === 'selected' ? 'bg-emerald-500 border-emerald-500' :
                            round.status === 'rejected' ? 'bg-red-500 border-red-500' :
                            round.status === 'scheduled' ? 'bg-blue-500 border-blue-500' :
                            'bg-background border-border/60'
                          }`} />
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{round.roundName}</span>
                                <div className="relative group/tag">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${roundConfig.color} ${roundConfig.bg} border ${roundConfig.border}`}>
                                    {roundConfig.label}
                                  </span>
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card text-foreground text-xs font-medium rounded-lg border border-border/60 shadow-lg hidden group-hover/tag:block pointer-events-none whitespace-nowrap z-[100]">
                                    {round.status === 'pending' ? 'Waiting for interview result' :
                                     round.status === 'selected' ? 'Passed this round' :
                                     round.status === 'rejected' ? 'Did not pass this round' :
                                     round.status === 'scheduled' ? 'Interview is scheduled' : 'Round status'}
                                  </span>
                                </div>
                              </div>
                              {round.date && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" strokeWidth={2.5} />
                                  {format(new Date(round.date), 'MMM dd, yyyy')}
                                </div>
                              )}
                              {round.notes && (
                                <p className="mt-1 text-xs text-muted-foreground">{round.notes}</p>
                              )}
                            </div>
                            {interview.status !== 'rejected' && interview.status !== 'offered' && interview.status !== 'accepted' && interview.status !== 'declined' && (
                              <div className="flex items-center gap-1 shrink-0">
                                <select
                                  value={round.status}
                                  onChange={(e) => onUpdateRound(interview.id, round.id, { status: e.target.value as InterviewRoundStatus })}
                                  className="text-[11px] font-medium px-2 py-1 rounded-md border border-border/60 bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="scheduled">Scheduled</option>
                                  <option value="selected">Selected</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              {/* Notes */}
              {interview.notes && (
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h5>
                  <p className="text-sm text-muted-foreground">{interview.notes}</p>
                </div>
              )}

              {/* Status Change for Active Interviews */}
              {interview.status === 'active' && (
                <div className="pt-3 border-t border-border/40">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Update Status</h5>
                  <div className="flex flex-wrap gap-2">
                    {(['rejected', 'offered'] as InterviewStatus[]).map((status) => {
                      const config = STATUS_CONFIG[status];
                      return (
                        <button
                          key={status}
                          onClick={() => onUpdateStatus(interview.id, status)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${config.color} ${config.bg} ${config.border} hover:scale-105`}
                        >
                          <config.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-1/4" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
      <div className="relative bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-purple-500/5 to-transparent px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl sm:rounded-2xl ring-1 ring-purple-500/20">
                <Briefcase className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold">Interviews</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {activeInterviews.length} active, {completedInterviews.length} completed
                </p>
              </div>
            </div>
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg sm:rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
              >
                <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" strokeWidth={2.5} />
                Add Interview
              </button>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-6">
          {interviews.length === 0 ? (
            <div className="text-center py-10 sm:py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center ring-1 ring-purple-500/20">
                <Briefcase className="w-10 h-10 text-purple-500/50" strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-semibold mb-2">No interviews yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Track your interview progress and rounds here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeInterviews.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">Active Interviews</h4>
                  <div className="space-y-3">
                    {activeInterviews.map((interview) => (
                      <InterviewCard key={interview.id} interview={interview} />
                    ))}
                  </div>
                </div>
              )}
              {completedInterviews.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">Completed Interviews</h4>
                  <div className="space-y-3">
                    {completedInterviews.map((interview) => (
                      <InterviewCard key={interview.id} interview={interview} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
