import { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import InstallGuide from './components/InstallGuide';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import useExpenses from './hooks/useExpenses';

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
  const { expenses, budget, total, currentMonth, loading, toast, addExpense, removeExpense, undoDelete, dismissToast, updateBudget, setMonth } =
    useExpenses();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 border-2 border-text-tertiary border-t-accent rounded-full animate-spin" />
        </div>
      );
    }

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
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-surface">
      <InstallGuide />
      <Header title={PAGE_TITLES[tab]} subtitle={PAGE_SUBTITLES[tab]} />
      <main className="flex-1 ios-scroll px-4 pt-3 pb-24">
        {renderPage()}
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
    </div>
  );
}
