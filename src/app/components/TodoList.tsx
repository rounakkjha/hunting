import { useState } from 'react';
import { format } from 'date-fns';
import { CheckSquare, Plus, Trash2, Sparkles, Flag, Pencil, Check, X, FastForward, Calendar } from 'lucide-react';
import type { Todo, TodoPriority } from '../App';

interface TodoListProps {
  todos: Todo[];
  onAdd: (text: string, priority: TodoPriority) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdatePriority: (id: string, priority: TodoPriority) => void;
  onEdit: (id: string, text: string) => void;
  onUpdateDate?: (id: string, date: string) => void;
  onToggleCarryForward?: (id: string) => void;
}

const PRIORITY_CONFIG: Record<TodoPriority, { label: string; color: string; bg: string; border: string; ring: string }> = {
  high: { label: 'High', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', ring: 'ring-red-500/20' },
  medium: { label: 'Med', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', ring: 'ring-amber-500/20' },
  low: { label: 'Low', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', ring: 'ring-emerald-500/20' },
};

const PRIORITY_ORDER: TodoPriority[] = ['high', 'medium', 'low'];

export default function TodoList({ todos, onAdd, onToggle, onDelete, onUpdatePriority, onEdit, onUpdateDate, onToggleCarryForward }: TodoListProps) {
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState<TodoPriority>('medium');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editingDateId, setEditingDateId] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      onEdit(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAdd(newTodo.trim(), newPriority);
      setNewTodo('');
      setNewPriority('medium');
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
      <div className="relative bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-indigo-500/5 to-transparent px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-xl sm:rounded-2xl ring-1 ring-indigo-500/20">
              <CheckSquare className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-500" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-bold">To-Do List</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {todos.filter((t) => !t.completed).length} active task{todos.filter((t) => !t.completed).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <form onSubmit={handleSubmit} className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-background/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm placeholder:text-muted-foreground/50 font-medium"
              />
              <div className="flex items-center gap-1.5 sm:gap-1">
                {PRIORITY_ORDER.map((p) => {
                  const cfg = PRIORITY_CONFIG[p];
                  const isSelected = newPriority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border text-xs font-semibold transition-all duration-200 ${cfg.color} ${
                        isSelected
                          ? `${cfg.bg} ${cfg.border} ring-2 ${cfg.ring} scale-105`
                          : 'border-border/40 opacity-40 hover:opacity-70'
                      }`}
                      title={`${cfg.label} priority`}
                    >
                      <Flag className="w-3.5 sm:w-4 h-3.5 sm:h-4" strokeWidth={2.5} />
                    </button>
                  );
                })}
                <button
                  type="submit"
                  className="relative group/btn overflow-hidden px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl sm:rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 ml-auto sm:ml-0"
                >
                  <Plus className="w-4 sm:w-5 h-4 sm:h-5" strokeWidth={2.5} />
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>
          </form>

          {todos.length === 0 ? (
            <div className="text-center py-10 sm:py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 flex items-center justify-center ring-1 ring-indigo-500/20">
                <Sparkles className="w-10 h-10 text-indigo-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No tasks yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Add your first task to get started with your to-do list
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {[...todos].sort((a, b) => Number(a.completed) - Number(b.completed)).map((todo, index) => (
                <div
                  key={todo.id}
                  className={`group/item relative overflow-hidden bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/30 transition-all duration-300 ${
                    todo.completed ? 'opacity-60' : ''
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-start gap-2.5 sm:gap-4 p-3 sm:p-4">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => onToggle(todo.id)}
                      className="mt-0.5 w-5 h-5 rounded-lg border-2 border-border/60 text-primary focus:ring-4 focus:ring-primary/20 cursor-pointer transition-all hover:border-primary"
                    />
                    <div className="flex-1 min-w-0">
                      {editingId === todo.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                            className="flex-1 px-3 py-1.5 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                            autoFocus
                          />
                          <button onClick={saveEdit} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Save">
                            <Check className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 text-muted-foreground hover:bg-muted/50 rounded-lg transition-all" title="Cancel">
                            <X className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium leading-relaxed ${
                            todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}>
                            {todo.text}
                          </p>
                          {(() => {
                            const pri = todo.priority || 'medium';
                            const cfg = PRIORITY_CONFIG[pri];
                            return (
                              <button
                                onClick={() => {
                                  const nextIdx = (PRIORITY_ORDER.indexOf(pri) + 1) % PRIORITY_ORDER.length;
                                  onUpdatePriority(todo.id, PRIORITY_ORDER[nextIdx]);
                                }}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide ${cfg.color} ${cfg.bg} border ${cfg.border} transition-all duration-200 hover:scale-110 cursor-pointer shrink-0`}
                                title={`${cfg.label} priority — click to change`}
                              >
                                <Flag className="w-3 h-3" strokeWidth={3} />
                                {cfg.label}
                              </button>
                            );
                          })()}
                          {todo.carryForward && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide text-orange-500 bg-orange-500/10 border border-orange-500/30 shrink-0 group/tag">
                              <FastForward className="w-3 h-3" strokeWidth={3} />
                              Carried
                              {onToggleCarryForward && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleCarryForward(todo.id);
                                  }}
                                  className="ml-1 opacity-0 group-hover/tag:opacity-100 hover:bg-orange-500/20 rounded p-0.5 transition-all"
                                  title="Remove carried tag"
                                >
                                  <X className="w-2.5 h-2.5" strokeWidth={3} />
                                </button>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground font-medium">
                        {editingDateId === todo.id ? (
                          <input
                            type="date"
                            defaultValue={todo.date}
                            onChange={(e) => {
                              if (e.target.value && onUpdateDate) {
                                onUpdateDate(todo.id, e.target.value);
                              }
                              setEditingDateId(null);
                            }}
                            onBlur={() => setEditingDateId(null)}
                            className="px-2 py-0.5 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-xs"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => !todo.completed && setEditingDateId(todo.id)}
                            className={`flex items-center gap-1 hover:text-primary transition-colors ${todo.completed ? 'cursor-default' : 'cursor-pointer'}`}
                            title={todo.completed ? undefined : 'Click to change date'}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(todo.date), 'MMM dd, yyyy')}</span>
                          </button>
                        )}
                        {todo.completedDate && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                            <span>Completed {format(new Date(todo.completedDate), 'MMM dd')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!todo.completed && editingId !== todo.id && (
                        <button
                          onClick={() => startEdit(todo)}
                          className="sm:opacity-0 sm:group-hover/item:opacity-100 p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg sm:rounded-xl border border-transparent hover:border-primary/20 transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 sm:w-4 h-3.5 sm:h-4" strokeWidth={2.5} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(todo.id)}
                        className="sm:opacity-0 sm:group-hover/item:opacity-100 p-1.5 sm:p-2 text-red-400 hover:bg-red-500/10 rounded-lg sm:rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" strokeWidth={2.5} />
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
