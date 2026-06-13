import { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Trash2, ChevronRight, Users, MailCheck, GraduationCap, Search, X, Pencil } from 'lucide-react';
import type { LinkedInOutreach } from '../App';

interface LinkedInOutreachListProps {
  outreach: LinkedInOutreach[];
  onDelete: (id: string) => void;
  onViewDetails: (item: LinkedInOutreach) => void;
  onToggleResponse?: (id: string) => void;
  onToggleAlumni?: (id: string) => void;
  onEdit?: (item: LinkedInOutreach) => void;
}

const PAGE_SIZE = 10;

export default function LinkedInOutreachList({ outreach, onDelete, onViewDetails, onToggleResponse, onToggleAlumni, onEdit }: LinkedInOutreachListProps) {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'alumni' | 'replied' | 'noReply'>('all');

  const filteredOutreach = outreach.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(query) ||
      item.company?.toLowerCase().includes(query) ||
      item.role?.toLowerCase().includes(query)
    );
  });

  const tabFilteredOutreach = filteredOutreach.filter(item => {
    switch (activeTab) {
      case 'alumni':
        return item.isAlumni;
      case 'replied':
        return item.gotResponse;
      case 'noReply':
        return !item.gotResponse;
      default:
        return true;
    }
  });

  const displayOutreach = showAll ? tabFilteredOutreach : tabFilteredOutreach.slice(0, PAGE_SIZE);

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
      <div className="relative bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-indigo-500/5 to-transparent px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-xl sm:rounded-2xl ring-1 ring-indigo-500/20">
                <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold">LinkedIn Outreach</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {filteredOutreach.length} of {outreach.length} connection{outreach.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search connections..."
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
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mt-3">
            {[
              { key: 'all', label: 'All', count: filteredOutreach.length },
              { key: 'alumni', label: 'Alumni', count: filteredOutreach.filter(i => i.isAlumni).length },
              { key: 'replied', label: 'Replied', count: filteredOutreach.filter(i => i.gotResponse).length },
              { key: 'noReply', label: 'No Reply', count: filteredOutreach.filter(i => !i.gotResponse).length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 scale-105'
                    : 'bg-background/60 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/50 hover:border-primary/30'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 opacity-75">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 sm:p-6">
          {outreach.length === 0 ? (
            <div className="text-center py-10 sm:py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 flex items-center justify-center ring-1 ring-indigo-500/20">
                <Users className="w-10 h-10 text-indigo-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No LinkedIn outreach yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Start building your network by adding your first connection
              </p>
            </div>
          ) : tabFilteredOutreach.length === 0 ? (
            <div className="text-center py-10 sm:py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h4 className="text-base font-semibold mb-2 text-muted-foreground">
                No {activeTab === 'alumni' ? 'alumni' : activeTab === 'replied' ? 'replies' : activeTab === 'noReply' ? 'pending replies' : 'connections'} found
              </h4>
              <p className="text-sm text-muted-foreground/70 max-w-sm mx-auto">
                Try selecting a different filter or add new connections
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayOutreach.map((item, index) => (
                <div
                  key={item.id}
                  className="group/item relative bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                  onClick={() => onViewDetails(item)}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-3.5 sm:p-5">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                          <h4 className="font-semibold truncate text-sm sm:text-lg group-hover/item:text-primary transition-colors">
                            {item.name || item.company || 'LinkedIn Contact'}
                          </h4>
                          {item.isAlumni && (
                            <div className="relative group/tag">
                              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-lg text-xs font-semibold">
                                <GraduationCap className="w-3 h-3" />
                                Alumni
                              </span>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card text-foreground text-xs font-medium rounded-lg border border-border/60 shadow-lg hidden group-hover/tag:block pointer-events-none whitespace-nowrap z-[100]">
                                This person is an alumnus of your institution
                              </span>
                            </div>
                          )}
                          {item.gotResponse && (
                            <div className="relative group/tag">
                              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-xs font-semibold">
                                <MailCheck className="w-3 h-3" />
                                Replied
                              </span>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card text-foreground text-xs font-medium rounded-lg border border-border/60 shadow-lg hidden group-hover/tag:block pointer-events-none whitespace-nowrap z-[100]">
                                The person has responded to your message
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            {item.role && (
                              <span className="px-3 py-1.5 bg-muted/80 backdrop-blur-sm rounded-lg font-medium border border-border/50">
                                {item.role}
                              </span>
                            )}
                            {item.company && item.name && (
                              <span className="px-3 py-1.5 bg-muted/80 backdrop-blur-sm rounded-lg font-medium border border-border/50">
                                {item.company}
                              </span>
                            )}
                            <span className="text-muted-foreground font-medium">
                              {format(new Date(item.date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        {onToggleAlumni && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleAlumni(item.id);
                            }}
                            className={`sm:opacity-0 sm:group-hover/item:opacity-100 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all ${
                              item.isAlumni
                                ? 'text-purple-500 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20'
                                : 'text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10 border-transparent hover:border-purple-500/20'
                            }`}
                            title={item.isAlumni ? 'Mark as not alumni' : 'Mark as alumni'}
                          >
                            <GraduationCap className="w-3.5 sm:w-4 h-3.5 sm:h-4" strokeWidth={2.5} />
                          </button>
                        )}
                        {onToggleResponse && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleResponse(item.id);
                            }}
                            className={`sm:opacity-0 sm:group-hover/item:opacity-100 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all ${
                              item.gotResponse
                                ? 'text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500/20'
                                : 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10 border-transparent hover:border-green-500/20'
                            }`}
                            title={item.gotResponse ? 'Mark as no response' : 'Mark as got response'}
                          >
                            <MailCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4" strokeWidth={2.5} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(item);
                            }}
                            className="sm:opacity-0 sm:group-hover/item:opacity-100 p-1.5 sm:p-2.5 text-blue-400 hover:bg-blue-500/10 rounded-lg sm:rounded-xl border border-transparent hover:border-blue-500/20 transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 sm:w-4 h-3.5 sm:h-4" strokeWidth={2.5} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          className="sm:opacity-0 sm:group-hover/item:opacity-100 p-1.5 sm:p-2.5 text-red-400 hover:bg-red-500/10 rounded-lg sm:rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" strokeWidth={2.5} />
                        </button>
                        <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {tabFilteredOutreach.length > PAGE_SIZE && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    {showAll
                      ? 'Show less'
                      : `Show all ${tabFilteredOutreach.length} connections`}
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
