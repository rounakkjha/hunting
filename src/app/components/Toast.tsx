import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

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
      <div className="fixed top-4 sm:top-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
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

  const isWarning = toast.text.startsWith('\u26a0\ufe0f');

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, isWarning ? 5000 : 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove, isWarning]);

  return (
    <div
      className={`pointer-events-auto flex items-start sm:items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-card border rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 w-full sm:w-auto sm:max-w-md ${
        isWarning ? 'border-amber-500/40' : 'border-border/60'
      } ${
        visible && !exiting
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-4 scale-95'
      }`}
    >
      <div className={`p-1 rounded-lg shrink-0 mt-0.5 sm:mt-0 ${isWarning ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
        {isWarning ? (
          <AlertTriangle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-500" strokeWidth={2.5} />
        ) : (
          <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-500" strokeWidth={2.5} />
        )}
      </div>
      <p className="text-xs sm:text-sm font-medium flex-1 leading-relaxed">{toast.text}</p>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all shrink-0"
      >
        <X className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
      </button>
    </div>
  );
}
