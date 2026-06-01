import { useState } from 'react';
import { format } from 'date-fns';
import { BookOpen, Copy, Check, Trash2, FileText } from 'lucide-react';
import type { ContentItem } from '../App';
import { copyToClipboard } from '../utils/clipboard';

interface ContentLibraryProps {
  content: ContentItem[];
  onDelete: (id: string) => void;
}

export default function ContentLibrary({ content, onDelete }: ContentLibraryProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
      <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-green-500/5 to-transparent px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl ring-1 ring-green-500/20">
              <BookOpen className="w-5 h-5 text-green-500" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Content Library</h3>
              <p className="text-sm text-muted-foreground mt-1">{content.length} saved item{content.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {content.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-green-500/10 to-green-600/5 flex items-center justify-center ring-1 ring-green-500/20">
                <FileText className="w-10 h-10 text-green-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No content saved yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Save your email templates and messages for quick access
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {content.map((item, index) => (
                <div
                  key={item.id}
                  className="group/item relative overflow-hidden bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate mb-2">{item.title}</h4>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-3 py-1 bg-muted/80 backdrop-blur-sm rounded-lg font-medium border border-border/50">
                            {item.type}
                          </span>
                          <span className="text-muted-foreground font-medium">
                            {format(new Date(item.date), 'MMM dd')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(item.id, item.content)}
                          className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl border border-transparent hover:border-border/60 transition-all"
                          title="Copy content"
                        >
                          {copied === item.id ? (
                            <Check className="w-4 h-4 text-green-500" strokeWidth={2.5} />
                          ) : (
                            <Copy className="w-4 h-4" strokeWidth={2.5} />
                          )}
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/60 line-clamp-2 leading-relaxed">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
