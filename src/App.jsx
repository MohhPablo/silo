import { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import InstallGuide from './components/InstallGuide';
import Toast from './components/Toast';
import LoadingPage from './components/LoadingPage';
import PasscodeAuth from './components/PasscodeAuth';
import PasscodeSetup from './components/PasscodeSetup';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import useExpenses from './hooks/useExpenses';
import { usePasscode } from './hooks/usePasscode';

const PAGE_TITLES = {
  dashboard: 'SILO',
  expenses: 'Expenses',
  stats: 'Stats',
  settings: 'Settings',
};

const PAGE_SUBTITLES = {
  dashboard: 'Budget Planner',
  expenses: 'All transactions',
  stats: 'Spending insights',
  settings: 'Preferences',
};

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const { expenses, budget, total, currentMonth, loading, toast, addExpense, removeExpense, undoDelete, dismissToast, updateBudget, setMonth } =
    useExpenses();
  const { isPasscodeEnabled } = usePasscode();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Request notification permission for pace alerts
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        Notification.requestPermission().catch(() => {});
      }, 5000);
    }

    const checkPasscode = async () => {
      const enabled = isPasscodeEnabled();
      if (enabled) {
        setIsAuthenticated(false);
      } else {
        const hasSeenSetup = localStorage.getItem('silo_passcode_setup_seen');
        if (!hasSeenSetup) {
          setShowPasscodeSetup(true);
          localStorage.setItem('silo_passcode_setup_seen', 'true');
        } else {
          setIsAuthenticated(true);
        }
      }
      setAppLoading(false);
    };

    checkPasscode();
  }, [isPasscodeEnabled]);

  const isSubPage = tab === 'expenses' || tab === 'settings';

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-surface">
      {appLoading && loading ? <LoadingPage /> : null}

      {showPasscodeSetup && !loading ? (
        <PasscodeSetup
          onComplete={() => {
            setShowPasscodeSetup(false);
            setIsAuthenticated(true);
          }}
          onSkip={() => {
            setShowPasscodeSetup(false);
            setIsAuthenticated(true);
          }}
        />
      ) : null}

      {!showPasscodeSetup && !appLoading && !isAuthenticated && isPasscodeEnabled() ? (
        <PasscodeAuth onSuccess={() => setIsAuthenticated(true)} />
      ) : null}

      {isAuthenticated && !showPasscodeSetup && (
        <>
          <InstallGuide />
          <Header
            title={PAGE_TITLES[tab]}
            subtitle={PAGE_SUBTITLES[tab]}
            showBack={isSubPage}
            onBack={() => setTab('dashboard')}
            showSettings={tab === 'dashboard'}
            onSettings={() => setTab('settings')}
          />
          <main className="flex-1 ios-scroll px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+80px)]">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-5 h-5 border-2 border-text-tertiary border-t-accent rounded-full animate-spin" />
              </div>
            ) : (
              (() => {
                switch (tab) {
                  case 'dashboard':
                    return (
                      <Dashboard
                        expenses={expenses}
                        budget={budget}
                        total={total}
                        currentMonth={currentMonth}
                        onSetMonth={setMonth}
                        onUpdateBudget={updateBudget}
                        onViewAll={() => setTab('expenses')}
                      />
                    );
                  case 'expenses':
                    return (
                      <Expenses
                        expenses={expenses}
                        total={total}
                        onDelete={removeExpense}
                      />
                    );
                  case 'stats':
                    return (
                      <Stats
                        expenses={expenses}
                        budget={budget}
                        total={total}
                        currentMonth={currentMonth}
                      />
                    );
                  case 'settings':
                    return <Settings />;
                  default:
                    return null;
                }
              })()
            )}
          </main>
          <BottomNav activeTab={tab} onTabChange={setTab} onAdd={addExpense} />
          {toast && (
            <Toast
              message={toast.message}
              undoLabel={toast.undoLabel}
              onUndo={undoDelete}
              onDismiss={dismissToast}
            />
          )}
        </>
      )}
    </div>
  );
}
