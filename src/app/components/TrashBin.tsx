import { useState } from 'react';
import { Trash2, RotateCcw, FileText, Mail, MessageSquare, BookOpen, CheckSquare, Link2, Building2, Clock } from 'lucide-react';
import type { TrashItem, TrashItemType } from '../App';

interface TrashBinProps {
  items: TrashItem[];
  onRestore: (item: TrashItem) => void;
  onDeletePermanently: (id: string) => void;
}

const typeConfig: Record<TrashItemType, { icon: any; label: string; color: string }> = {
  application: { icon: FileText, label: 'Application', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
  coldEmail: { icon: Mail, label: 'Cold Email', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  linkedin: { icon: MessageSquare, label: 'LinkedIn', color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
  content: { icon: BookOpen, label: 'Content', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  todo: { icon: CheckSquare, label: 'To-Do', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  savedLink: { icon: Link2, label: 'Link', color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
  targetCompany: { icon: Building2, label: 'Company', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  interview: { icon: Clock, label: 'Interview', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
};

function getDaysLeft(deletedAt: string): number {
  const deleted = new Date(deletedAt).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const remaining = sevenDays - (Date.now() - deleted);
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
}

export default function TrashBin({ items, onRestore, onDeletePermanently }: TrashBinProps) {
  const [filter, setFilter] = useState<TrashItemType | 'all'>('all');

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);
  const sortedItems = [...filtered].sort(
    (a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
  );

  const usedTypes = [...new Set(items.map((i) => i.type))];

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
      <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-red-500/5 to-transparent px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl ring-1 ring-red-500/20">
              <Trash2 className="w-5 h-5 text-red-500" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Trash</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {items.length} deleted item{items.length !== 1 ? 's' : ''} · auto-deletes after 7 days
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Filter tabs */}
          {usedTypes.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted/60'
                }`}
              >
                All ({items.length})
              </button>
              {usedTypes.map((type) => {
                const config = typeConfig[type];
                return (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filter === type
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted/60'
                    }`}
                  >
                    {config.label} ({items.filter((i) => i.type === type).length})
                  </button>
                );
              })}
            </div>
          )}

          {sortedItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-red-500/10 to-red-600/5 flex items-center justify-center ring-1 ring-red-500/20">
                <Trash2 className="w-10 h-10 text-red-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Trash is empty</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Deleted items will appear here for 7 days before being permanently removed
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedItems.map((item) => {
                const config = typeConfig[item.type];
                const Icon = config.icon;
                const daysLeft = getDaysLeft(item.deletedAt);

                return (
                  <div
                    key={item.id}
                    className="group/trash flex items-center gap-3 p-3 sm:p-4 bg-background/50 rounded-xl border border-border/60 hover:border-border transition-all"
                  >
                    <div className={`p-2 rounded-lg border shrink-0 ${config.color}`}>
                      <Icon className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onRestore(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition-all"
                        title="Restore"
                      >
                        <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
                        Restore
                      </button>
                      <button
                        onClick={() => onDeletePermanently(item.id)}
                        className="opacity-0 group-hover/trash:opacity-100 p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
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
