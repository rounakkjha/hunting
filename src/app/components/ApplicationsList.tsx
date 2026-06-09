import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { FileText, Trash2, Briefcase, ChevronRight, Mail, MailCheck, Tag, Users, Download, ExternalLink, Hash, Search, X, Filter, Pencil } from 'lucide-react';
import type { JobApplication } from '../App';

function SourceBadge({ source }: { source: string }) {
  const s = source.toLowerCase();

  if (s === 'linkedin') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0A66C2]/10 rounded-lg font-medium border border-[#0A66C2]/20 text-[#0A66C2]">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        <span className="text-[11px]">in</span>
      </span>
    );
  }

  if (s === 'naukri') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#4A90D9]/10 rounded-lg font-medium border border-[#4A90D9]/20 text-[#4A90D9]">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
        <span className="text-[11px]">Naukri</span>
      </span>
    );
  }

  if (s === 'referral') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-500/10 rounded-lg font-medium border border-violet-500/20 text-violet-500">
        <Users className="w-3.5 h-3.5" strokeWidth={2.5} />
        <span className="text-[11px]">Referral</span>
      </span>
    );
  }

  return (
    <span className="px-3 py-1.5 bg-muted/80 backdrop-blur-sm rounded-lg font-medium border border-border/50 text-xs">
      {source}
    </span>
  );
}

interface ApplicationsListProps {
  applications: JobApplication[];
  onDelete: (id: string) => void;
  onViewDetails: (app: JobApplication) => void;
  onUpdateTag?: (id: string, tag: string) => void;
  onEdit?: (app: JobApplication) => void;
}

const PAGE_SIZE = 10;

const TAG_CYCLE = ['', 'need_to_mail', 'already_mailed', 'ghost'];

export default function ApplicationsList({ applications, onDelete, onViewDetails, onUpdateTag, onEdit }: ApplicationsListProps) {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  
  // Get unique sources (case-insensitive) - memoized for performance
  const uniqueSources = useMemo(() =>
    Array.from(
      new Set(
        applications
          .map(app => app.source?.toLowerCase())
          .filter((s): s is string => Boolean(s))
      )
    ).sort(),
    [applications]
  );

  // Memoized filtered applications for performance
  const filteredApplications = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return applications.filter(app => {
      const matchesSearch = (
        app.company?.toLowerCase().includes(query) ||
        app.role?.toLowerCase().includes(query) ||
        app.source?.toLowerCase().includes(query)
      );
      const matchesSource = sourceFilter === 'all' || app.source?.toLowerCase() === sourceFilter;
      return matchesSearch && matchesSource;
    });
  }, [applications, searchQuery, sourceFilter]);
  
  const displayApplications = showAll ? filteredApplications : filteredApplications.slice(0, PAGE_SIZE);

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
      <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-indigo-500/5 to-transparent px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-2xl ring-1 ring-indigo-500/20">
                <FileText className="w-5 h-5 text-indigo-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Job Applications</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredApplications.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-48 pl-10 pr-4 py-2 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="all">All Sources</option>
                  {uniqueSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applications..."
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
          </div>
        </div>

        <div className="p-6">
          {applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 flex items-center justify-center ring-1 ring-indigo-500/20">
                <Briefcase className="w-10 h-10 text-indigo-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No applications yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Start tracking your job search by adding your first application
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayApplications.map((app, index) => (
                <div
                  key={app.id}
                  className="group/item relative bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 overflow-hidden"
                  onClick={() => onViewDetails(app)}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  {/* Ribbon tag - always visible */}
                  {app.emailTag && app.emailTag !== '' && (
                    <div
                      className={`absolute top-0 right-0 flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-bl-xl rounded-tr-2xl z-10 ${
                        app.emailTag === 'need_to_mail'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-b border-l border-amber-500/30'
                          : app.emailTag === 'already_mailed'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-b border-l border-emerald-500/30'
                          : 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-b border-l border-purple-500/30'
                      }`}
                    >
                      {app.emailTag === 'need_to_mail' ? (
                        <><Mail className="w-3 h-3" strokeWidth={2.5} /> Need to Contact</>
                      ) : app.emailTag === 'already_mailed' ? (
                        <><MailCheck className="w-3 h-3" strokeWidth={2.5} /> Contacted</>
                      ) : (
                        <>👻 Ghosted</>
                      )}
                    </div>
                  )}
                  <div className="relative p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-2 truncate text-lg group-hover/item:text-primary transition-colors">
                          {app.company}
                        </h4>
                        <div className="space-y-2">
                          {app.role && (
                            <p className="text-sm text-foreground/70 font-medium">{app.role}</p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            {app.source && (
                              <SourceBadge source={app.source} />
                            )}
                            {app.location && (
                              <span className="px-3 py-1.5 bg-muted/80 backdrop-blur-sm rounded-lg font-medium border border-border/50">
                                {app.location}
                              </span>
                            )}
                            <span className="text-muted-foreground font-medium">
                              {format(new Date(app.date), 'MMM dd, yyyy')}
                            </span>
                            {app.resumeName && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (app.resumeData) {
                                    const a = document.createElement('a');
                                    a.href = app.resumeData;
                                    a.download = app.resumeName || 'resume';
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
                            {app.jobUrl && (
                              <a
                                href={app.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                                title="Open job posting"
                              >
                                <ExternalLink className="w-3 h-3" strokeWidth={2.5} />
                                <span className="text-[10px] font-semibold">Job Link</span>
                              </a>
                            )}
                            {app.jobId && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg border border-amber-500/20">
                                <Hash className="w-3 h-3" strokeWidth={2.5} />
                                <span className="text-[10px] font-semibold">{app.jobId}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="relative group/tag">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentTag = app.emailTag || '';
                              const currentIdx = TAG_CYCLE.indexOf(currentTag);
                              const nextTag = TAG_CYCLE[(currentIdx + 1) % TAG_CYCLE.length];
                              onUpdateTag?.(app.id, nextTag);
                            }}
                            className="opacity-0 group-hover/item:opacity-100 p-2 sm:p-2.5 rounded-xl border border-transparent text-muted-foreground hover:bg-muted/50 hover:border-border/50 transition-all"
                            title="Cycle email tag"
                          >
                            <Tag className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                          <span className="pointer-events-none absolute top-full right-0 mt-2 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap hidden group-hover/tag:block bg-foreground text-background shadow-lg z-[100]">
                            Click to cycle email tag
                          </span>
                        </div>
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(app);
                            }}
                            className="opacity-0 group-hover/item:opacity-100 p-2 sm:p-2.5 text-blue-400 hover:bg-blue-500/10 rounded-xl border border-transparent hover:border-blue-500/20 transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(app.id);
                          }}
                          className="opacity-0 group-hover/item:opacity-100 p-2 sm:p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
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
              {applications.length > PAGE_SIZE && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    {showAll
                      ? 'Show less'
                      : `Show all ${applications.length} applications`}
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
