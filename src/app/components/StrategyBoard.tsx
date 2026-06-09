import { useState } from 'react';
import { Crosshair, Plus, Trash2, GripVertical, Check, Pencil, X } from 'lucide-react';
import type { StrategyItem } from '../App';

interface StrategyBoardProps {
  items: StrategyItem[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onReorder: (items: StrategyItem[]) => void;
}

export default function StrategyBoard({ items, onAdd, onDelete, onToggle, onEdit, onReorder }: StrategyBoardProps) {
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem('');
    }
  };

  const startEdit = (item: StrategyItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      onEdit(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    onReorder(newItems.map((item, i) => ({ ...item, order: i })));
  };

  const moveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    onReorder(newItems.map((item, i) => ({ ...item, order: i })));
  };

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-violet-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
      <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-violet-500/5 to-transparent px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-500/10 to-violet-600/5 rounded-2xl ring-1 ring-violet-500/20">
              <Crosshair className="w-5 h-5 text-violet-500" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold">My Strategy</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {sorted.length} step{sorted.length !== 1 ? 's' : ''} in your daily game plan
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleAdd} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add a strategy step..."
                className="flex-1 px-4 py-3 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm placeholder:text-muted-foreground/50 font-medium"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
          </form>

          {sorted.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 flex items-center justify-center ring-1 ring-violet-500/20">
                <Crosshair className="w-10 h-10 text-violet-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No strategy yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Plan your job hunt strategy step by step
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((item, index) => (
                <div
                  key={item.id}
                  className="group/item relative overflow-hidden bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="relative flex items-center gap-3 p-4">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all"
                      >
                        <GripVertical className="w-3.5 h-3.5 rotate-90" strokeWidth={2.5} />
                      </button>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground/50 w-6 text-center shrink-0">
                      {index + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setEditingId(null); setEditText(''); } }}
                            className="flex-1 px-3 py-1.5 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                            autoFocus
                          />
                          <button onClick={saveEdit} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all">
                            <Check className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                          <button onClick={() => { setEditingId(null); setEditText(''); }} className="p-1.5 text-muted-foreground hover:bg-muted/50 rounded-lg transition-all">
                            <X className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-foreground">
                          {item.text}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {editingId !== item.id && (
                        <button
                          onClick={() => startEdit(item)}
                          className="opacity-0 group-hover/item:opacity-100 p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(item.id)}
                        className="opacity-0 group-hover/item:opacity-100 p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
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
