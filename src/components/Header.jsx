import { ChevronLeft, Settings } from 'lucide-react';

export default function Header({ title, subtitle, showBack, onBack, showSettings, onSettings }) {
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-border-light pt-[env(safe-area-inset-top,0px)]">
      <div className="flex items-center justify-between px-5 h-12">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack && (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-8 h-8 -ml-2 rounded-full flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <ChevronLeft size={20} className="text-text-secondary" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-text-primary select-none truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-text-secondary -mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {showSettings && (
          <button
            onClick={onSettings}
            aria-label="Settings"
            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Settings size={18} className="text-text-tertiary" />
          </button>
        )}
      </div>
    </header>
  );
}
