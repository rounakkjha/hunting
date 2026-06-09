import { useState } from 'react';
import { Link2, Plus, Copy, ExternalLink, Trash2, Check } from 'lucide-react';
import type { SavedLink } from '../App';

interface SavedLinksProps {
  links: SavedLink[];
  onAdd: (link: { name: string; url: string }) => void;
  onDelete: (id: string) => void;
}

export default function SavedLinks({ links, onAdd, onDelete }: SavedLinksProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }
    onAdd({ name: name.trim(), url: finalUrl });
    setName('');
    setUrl('');
    setShowForm(false);
  };

  const handleCopy = (link: SavedLink) => {
    navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
      <div className="relative bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-indigo-500/5 to-transparent px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-2xl ring-1 ring-indigo-500/20">
                <Link2 className="w-5 h-5 text-indigo-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Quick Links</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {links.length} saved link{links.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 sm:gap-2 p-2 sm:px-4 sm:py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg sm:rounded-xl text-sm hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Add Link</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {showForm && (
            <form onSubmit={handleAdd} className="mb-4 p-4 bg-background/50 rounded-2xl border border-border/60 space-y-3 animate-fade-in">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm"
                placeholder="Link name (e.g., My Resume)"
                required
              />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm"
                placeholder="www.example.com or https://..."
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm hover:shadow-lg transition-all"
                >
                  Save Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 bg-muted/50 text-muted-foreground rounded-xl text-sm hover:bg-muted transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {links.length === 0 && !showForm ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 flex items-center justify-center ring-1 ring-indigo-500/20">
                <Link2 className="w-10 h-10 text-indigo-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No links saved yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Save your important links here for quick access — resume, portfolio, LinkedIn, etc.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="group/link flex items-center gap-3 p-3 sm:p-4 bg-background/50 rounded-xl border border-border/60 hover:border-primary/30 transition-all"
                >
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Link2 className="w-4 h-4 text-primary" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{link.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(link)}
                      className={`p-2 rounded-lg border transition-all ${
                        copiedId === link.id
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'text-muted-foreground border-transparent hover:bg-muted/50 hover:border-border/50'
                      }`}
                      title="Copy link"
                    >
                      {copiedId === link.id ? (
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      ) : (
                        <Copy className="w-4 h-4" strokeWidth={2.5} />
                      )}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg border border-transparent hover:border-primary/20 transition-all"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
                    </a>
                    <button
                      onClick={() => onDelete(link.id)}
                      className="sm:opacity-0 sm:group-hover/link:opacity-100 p-2 text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    </button>
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
