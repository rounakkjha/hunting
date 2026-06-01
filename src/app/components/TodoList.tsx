import { useState } from 'react';
import { format } from 'date-fns';
import { CheckSquare, Plus, Trash2, Sparkles } from 'lucide-react';
import type { Todo } from '../App';

interface TodoListProps {
  todos: Todo[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoList({ todos, onAdd, onToggle, onDelete }: TodoListProps) {
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAdd(newTodo.trim());
      setNewTodo('');
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
      <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-amber-500/5 to-transparent px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl ring-1 ring-amber-500/20">
              <CheckSquare className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold">To-Do List</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {todos.filter((t) => !t.completed).length} active task{todos.filter((t) => !t.completed).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-3 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm placeholder:text-muted-foreground/50 font-medium"
              />
              <button
                type="submit"
                className="relative group/btn overflow-hidden px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </form>

          {todos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 flex items-center justify-center ring-1 ring-amber-500/20">
                <Sparkles className="w-10 h-10 text-amber-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No tasks yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Add your first task to get started with your to-do list
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {todos.map((todo, index) => (
                <div
                  key={todo.id}
                  className={`group/item relative overflow-hidden bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/30 transition-all duration-300 ${
                    todo.completed ? 'opacity-60' : ''
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-start gap-4 p-4">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => onToggle(todo.id)}
                      className="mt-0.5 w-5 h-5 rounded-lg border-2 border-border/60 text-primary focus:ring-4 focus:ring-primary/20 cursor-pointer transition-all hover:border-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-relaxed ${
                        todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}>
                        {todo.text}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground font-medium">
                        <span>{format(new Date(todo.date), 'MMM dd, yyyy')}</span>
                        {todo.completedDate && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                            <span>Completed {format(new Date(todo.completedDate), 'MMM dd')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(todo.id)}
                      className="opacity-0 group-hover/item:opacity-100 p-2 text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
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
