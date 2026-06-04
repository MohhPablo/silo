import { useState, useEffect } from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

function isIOS() {
  return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
}

function wasDismissed() {
  try {
    return localStorage.getItem('silo_install_dismissed') === 'true';
  } catch {
    return false;
  }
}

export default function InstallGuide() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isIOS() && !isStandalone() && !wasDismissed()) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem('silo_install_dismissed', 'true');
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[60] pt-[calc(env(safe-area-inset-top,0px)+8px)] animate-slide-up px-3">
      <div className="bg-surface-elevated/95 backdrop-blur-xl rounded-2xl border border-border p-4 shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-surface font-bold text-sm">S</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Install SILO</p>
              <p className="text-xs text-text-secondary">Add to Home Screen for the best experience</p>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="w-7 h-7 rounded-full bg-surface-card flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <X size={13} className="text-text-secondary" />
          </button>
        </div>

        <div className="flex items-center gap-3 px-2 py-3 bg-surface-card rounded-xl">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center">
              <Share size={18} className="text-accent" />
            </div>
            <span className="text-xs text-text-tertiary">Share</span>
          </div>

          <div className="w-px h-8 bg-border" />

          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center">
              <PlusSquare size={18} className="text-accent" />
            </div>
            <span className="text-xs text-text-tertiary">Add to</span>
            <span className="text-xs text-text-tertiary -mt-1.5">Home Screen</span>
          </div>
        </div>

        <p className="text-xs text-text-tertiary text-center mt-3 leading-relaxed">
          Tap <span className="text-text-secondary font-medium">Share</span> in Safari, scroll down, then tap{' '}
          <span className="text-text-secondary font-medium">Add to Home Screen</span>
        </p>

        <button
          onClick={dismiss}
          className="w-full mt-3 h-9 rounded-lg bg-surface-card text-text-secondary text-xs font-medium active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
