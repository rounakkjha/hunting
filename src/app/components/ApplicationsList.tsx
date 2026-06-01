import { useState } from 'react';
import { format } from 'date-fns';
import { FileText, Trash2, Briefcase, ChevronRight } from 'lucide-react';
import type { JobApplication } from '../App';

interface ApplicationsListProps {
  applications: JobApplication[];
  onDelete: (id: string) => void;
  onViewDetails: (app: JobApplication) => void;
}

const PAGE_SIZE = 10;

export default function ApplicationsList({ applications, onDelete, onViewDetails }: ApplicationsListProps) {
  const [showAll, setShowAll] = useState(false);
  const displayApplications = showAll ? applications : applications.slice(0, PAGE_SIZE);

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
      <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-blue-500/5 to-transparent px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl ring-1 ring-blue-500/20">
              <FileText className="w-5 h-5 text-blue-500" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Job Applications</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {applications.length} total application{applications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 flex items-center justify-center ring-1 ring-blue-500/20">
                <Briefcase className="w-10 h-10 text-blue-500/50" />
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
                  className="group/item relative overflow-hidden bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                  onClick={() => onViewDetails(app)}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
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
                              <span className="px-3 py-1.5 bg-muted/80 backdrop-blur-sm rounded-lg font-medium border border-border/50">
                                {app.source}
                              </span>
                            )}
                            {app.location && (
                              <span className="px-3 py-1.5 bg-muted/80 backdrop-blur-sm rounded-lg font-medium border border-border/50">
                                {app.location}
                              </span>
                            )}
                            <span className="text-muted-foreground font-medium">
                              {format(new Date(app.date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(app.id);
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
