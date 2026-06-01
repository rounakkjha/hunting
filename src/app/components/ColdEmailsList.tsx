import { useState } from 'react';
import { format } from 'date-fns';
import { Mail, Trash2, Reply, ChevronRight, Send } from 'lucide-react';
import type { ColdEmail } from '../App';

interface ColdEmailsListProps {
  coldEmails: ColdEmail[];
  onDelete: (id: string) => void;
  onViewDetails: (email: ColdEmail) => void;
}

const PAGE_SIZE = 10;

export default function ColdEmailsList({ coldEmails, onDelete, onViewDetails }: ColdEmailsListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'initial' | 'followup'>('all');
  const [showAll, setShowAll] = useState(false);

  const initialEmails = coldEmails.filter((email) => !email.isFollowUp);
  const followUpEmails = coldEmails.filter((email) => email.isFollowUp);

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
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
      <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-cyan-500/5 to-transparent px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-2xl ring-1 ring-cyan-500/20">
                <Mail className="w-5 h-5 text-cyan-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Cold Emails</h3>
                <p className="text-sm text-muted-foreground mt-1">{coldEmails.length} total emails</p>
              </div>
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
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 flex items-center justify-center ring-1 ring-cyan-500/20">
                <Send className="w-10 h-10 text-cyan-500/50" />
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
                  className="group/item relative overflow-hidden bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                  onClick={() => onViewDetails(email)}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold truncate text-lg group-hover/item:text-primary transition-colors">
                            {email.company}
                          </h4>
                          {email.isFollowUp && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-semibold">
                              <Reply className="w-3 h-3" />
                              Follow-up
                            </span>
                          )}
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
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
