import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastMessage {
  id: number;
  text: string;
}

interface ToastContextType {
  showToast: (text: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string) => {
    const id = Date.now();
    setToasts((prev: ToastMessage[]) => [...prev, { id, text }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev: ToastMessage[]) => prev.filter((t: ToastMessage) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast: ToastMessage) => (
          <ToastItem key={toast.id} toast={toast as ToastMessage} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: number) => void }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 bg-card border border-border/60 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 ${
        visible && !exiting
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-4 scale-95'
      }`}
    >
      <div className="p-1 bg-emerald-500/10 rounded-lg">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
      </div>
      <p className="text-sm font-medium">{toast.text}</p>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all ml-2"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
