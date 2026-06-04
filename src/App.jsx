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

    // Check passcode on app load
    const checkPasscode = async () => {
      const enabled = isPasscodeEnabled();
      if (enabled) {
        setIsAuthenticated(false);
      } else {
        // Check if user should see passcode setup (first time)
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

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-surface">
      {/* Show loading page during initial app load or data fetch */}
      {appLoading && loading ? <LoadingPage /> : null}

      {/* Show passcode setup on first launch */}
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

      {/* Show passcode auth if needed */}
      {!showPasscodeSetup && !appLoading && !isAuthenticated && isPasscodeEnabled() ? (
        <PasscodeAuth onSuccess={() => setIsAuthenticated(true)} />
      ) : null}

      {/* Main app content */}
      {isAuthenticated && !showPasscodeSetup && (
        <>
          <InstallGuide />
          <Header title={PAGE_TITLES[tab]} subtitle={PAGE_SUBTITLES[tab]} />
          <main className="flex-1 ios-scroll px-4 pt-3 pb-24">
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
