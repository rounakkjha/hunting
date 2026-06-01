import { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Trash2, ChevronRight, Users } from 'lucide-react';
import type { LinkedInOutreach } from '../App';

interface LinkedInOutreachListProps {
  outreach: LinkedInOutreach[];
  onDelete: (id: string) => void;
  onViewDetails: (item: LinkedInOutreach) => void;
}

const PAGE_SIZE = 10;

export default function LinkedInOutreachList({ outreach, onDelete, onViewDetails }: LinkedInOutreachListProps) {
  const [showAll, setShowAll] = useState(false);
  const displayOutreach = showAll ? outreach : outreach.slice(0, PAGE_SIZE);

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
      <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-purple-500/5 to-transparent px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl ring-1 ring-purple-500/20">
              <MessageSquare className="w-5 h-5 text-purple-500" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold">LinkedIn Outreach</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {outreach.length} connection{outreach.length !== 1 ? 's' : ''} made
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {outreach.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center ring-1 ring-purple-500/20">
                <Users className="w-10 h-10 text-purple-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No LinkedIn outreach yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Start building your network by adding your first connection
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayOutreach.map((item, index) => (
                <div
                  key={item.id}
                  className="group/item relative overflow-hidden bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                  onClick={() => onViewDetails(item)}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate text-lg mb-2 group-hover/item:text-primary transition-colors">
                          {item.name || item.company || 'LinkedIn Contact'}
                        </h4>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
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
              {outreach.length > PAGE_SIZE && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    {showAll
                      ? 'Show less'
                      : `Show all ${outreach.length} connections`}
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
