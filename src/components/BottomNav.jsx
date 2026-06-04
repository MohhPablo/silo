import { useState, useCallback } from 'react';
import { Home, Plus, PieChart } from 'lucide-react';
import BottomSheet from './BottomSheet';

export default function BottomNav({ activeTab, onTabChange, onAdd }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'add', icon: Plus },
    { id: 'stats', icon: PieChart, label: 'Stats' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-elevated border-t border-border pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-around h-14">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isAdd = tab.id === 'add';
            const Icon = tab.icon;

            if (isAdd) {
              return (
                <button
                  key={tab.id}
                  onClick={() => { try { navigator.vibrate?.(10); } catch {} setSheetOpen(true); }}
                  className="flex flex-col items-center justify-center -mt-5 active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-xl"
                  aria-label="Add expense"
                >
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/25">
                    <Icon size={24} className="text-surface" strokeWidth={2.5} />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-label={`${tab.label}`}
                className="flex flex-col items-center justify-center px-5 h-full active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <Icon
                  size={22}
                  strokeWidth={2}
                  className={isActive ? 'text-accent' : 'text-text-tertiary'}
                />
                {tab.label && (
                  <span
                    className={`text-xs mt-0.5 font-medium ${
                      isActive ? 'text-accent' : 'text-text-tertiary'
                    }`}
                  >
                    {tab.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSave={onAdd} />
    </>
  );
}
