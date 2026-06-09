import { useState } from 'react';
import { format } from 'date-fns';
import { BookOpen, Copy, Check, Trash2, FileText, Search, Pencil, X } from 'lucide-react';
import type { ContentItem } from '../App';
import { copyToClipboard } from '../utils/clipboard';

interface ContentLibraryProps {
  content: ContentItem[];
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<ContentItem>) => void;
}

export default function ContentLibrary({ content, onDelete, onUpdate }: ContentLibraryProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const filteredContent = searchQuery.trim()
    ? content.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : content;

  const handleCopy = async (id: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
      <div className="relative bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-indigo-500/5 to-transparent px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-2xl ring-1 ring-indigo-500/20">
                <BookOpen className="w-5 h-5 text-indigo-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Content Library</h3>
                <p className="text-sm text-muted-foreground mt-1">{filteredContent.length} of {content.length} items</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search content..."
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-background/60 rounded-xl border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {content.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 flex items-center justify-center ring-1 ring-indigo-500/20">
                <FileText className="w-10 h-10 text-indigo-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No content saved yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Save your email templates and messages for quick access
              </p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No matching content found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredContent.map((item, index) => (
                <div
                  key={item.id}
                  className="group/item relative overflow-hidden bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-5">
                    {editingId === item.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm font-medium"
                          placeholder="Title"
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm resize-none"
                          placeholder="Content"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (editTitle.trim() && onUpdate) {
                                onUpdate(item.id, { title: editTitle.trim(), content: editContent.trim() });
                              }
                              setEditingId(null);
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 bg-muted/50 text-muted-foreground rounded-lg text-xs font-medium hover:bg-muted transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                                <Check className="w-4 h-4 text-indigo-500" strokeWidth={2.5} />
                              ) : (
                                <Copy className="w-4 h-4" strokeWidth={2.5} />
                              )}
                            </button>
                            {onUpdate && (
                              <button
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditTitle(item.title);
                                  setEditContent(item.content);
                                }}
                                className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl border border-transparent hover:border-primary/20 transition-all"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" strokeWidth={2.5} />
                              </button>
                            )}
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
                      </>
                    )}
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
