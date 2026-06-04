import { useEffect, useRef } from 'react';
import { Undo } from 'lucide-react';

export default function Toast({ message, undoLabel, onUndo, onDismiss, duration = 4000 }) {
  const timerRef = useRef(null);
  const dismissedRef = useRef(false);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      dismissedRef.current = true;
      onDismiss();
    }, duration);
    return () => clearTimeout(timerRef.current);
  }, [duration, onDismiss]);

  const handleUndo = () => {
    clearTimeout(timerRef.current);
    dismissedRef.current = true;
    onUndo();
    onDismiss();
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[70] animate-slide-up">
      <div className="bg-surface-elevated border border-border rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3">
        <p className="flex-1 text-sm text-text-primary">{message}</p>
        {undoLabel && onUndo && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-muted text-accent text-sm font-semibold active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Undo size={14} />
            {undoLabel}
          </button>
        )}
      </div>
    </div>
  );
}
