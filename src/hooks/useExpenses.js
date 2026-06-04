import { useState, useEffect, useCallback, useRef } from 'react';
import store from '../lib/store';

export default function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const undoRef = useRef(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    store.init().then(() => loadData());
  }, [currentMonth]);

  const loadData = async () => {
    setLoading(true);
    const [exps, budg] = await Promise.all([
      store.getExpenses(currentMonth),
      store.getBudget(currentMonth),
    ]);
    setExpenses(exps);
    setBudget(budg);
    setLoading(false);
  };

  const computePacing = useCallback(() => {
    const amount = budget?.amount ?? 0;
    if (!amount) return null;

    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const [y, m] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const now = new Date();
    const currentDay =
      now.getFullYear() === y && now.getMonth() === m - 1
        ? now.getDate()
        : daysInMonth;
    const dailyAvg = total / Math.min(currentDay, daysInMonth);
    const projectedTotal = dailyAvg * daysInMonth;
    const projectionPct = (projectedTotal / amount) * 100;

    return { dailyAvg, projectedTotal, projectionPct, daysInMonth, currentDay, total, amount };
  }, [budget, expenses, currentMonth]);

  const checkPacingNotification = useCallback((pacing) => {
    if (!pacing || pacing.projectionPct < 150) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
      new Notification('SILO – Spending Alert', {
        body: `You're on track to overshoot your budget by ${Math.round(pacing.projectionPct - 100)}%. Current pace: ₦${pacing.dailyAvg.toFixed(0)}/day.`,
        icon: '/icons/icon-192.png',
        tag: 'silo-pacing-alert',
      });
    } catch {}
  }, []);

  const addExpense = useCallback(async (expense) => {
    await store.addExpense(expense);
    await loadData();

    // Check pacing after state loads — use a microtask to get fresh state
    setTimeout(() => {
      const pacing = computePacing();
      checkPacingNotification(pacing);
    }, 100);
  }, [currentMonth, computePacing, checkPacingNotification]);

  const removeExpense = useCallback((id) => {
    const deleted = expenses.find((e) => e.id === id);
    if (!deleted) return;

    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setToast({ message: 'Expense deleted', undoLabel: 'Undo' });

    const timer = setTimeout(async () => {
      await store.deleteExpense(id);
      undoRef.current = null;
    }, 4000);

    undoRef.current = {
      id,
      expense: deleted,
      timer,
      run() {
        clearTimeout(timer);
        store.deleteExpense(id);
      },
    };
  }, [expenses]);

  const undoDelete = useCallback(() => {
    if (undoRef.current) {
      clearTimeout(undoRef.current.timer);
      setExpenses((prev) => {
        const item = undoRef.current.expense;
        return [...prev, item].sort((a, b) => new Date(b.date) - new Date(a.date));
      });
      undoRef.current = null;
    }
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const updateBudget = useCallback(async (amount, fixedCosts = 0) => {
    await store.setBudget(currentMonth, amount, fixedCosts);
    setBudget({ amount, fixedCosts });
  }, [currentMonth]);

  const setMonth = useCallback((month) => {
    setCurrentMonth(month);
  }, []);

  return {
    expenses,
    budget,
    loading,
    currentMonth,
    toast,
    addExpense,
    removeExpense,
    undoDelete,
    dismissToast,
    updateBudget,
    setMonth,
    total: expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
  };
}
