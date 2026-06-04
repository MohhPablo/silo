import { useState, useRef } from 'react';
import { getCategoryColor, getCategoryLabel } from '../lib/categories';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatMonth(monthStr) {
  const [y, m] = monthStr.split('-');
  return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

function getDaysRemaining(currentMonth) {
  const [y, m] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const now = new Date();
  if (now.getFullYear() === y && now.getMonth() === m - 1) {
    return Math.max(daysInMonth - now.getDate(), 1);
  }
  return daysInMonth;
}

export default function Dashboard({ expenses, budget, total, currentMonth, onSetMonth, onUpdateBudget, onViewAll }) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editFixedCosts, setEditFixedCosts] = useState('');
  const budgetInputRef = useRef(null);

  const budgetAmount = budget?.amount ?? 0;
  const fixedCosts = budget?.fixedCosts ?? 0;
  const spentPct = budgetAmount ? Math.min((total / budgetAmount) * 100, 100) : 0;

  const safeToSpend = budgetAmount - fixedCosts - total;
  const daysRemaining = getDaysRemaining(currentMonth);
  const dailyAllowance = safeToSpend > 0 && daysRemaining > 0
    ? safeToSpend / daysRemaining
    : 0;

  const prevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    onSetMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    onSetMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const startEditBudget = () => {
    setEditValue(budgetAmount ? String(budgetAmount) : '');
    setEditFixedCosts(fixedCosts ? String(fixedCosts) : '');
    setIsEditingBudget(true);
    requestAnimationFrame(() => budgetInputRef.current?.focus());
  };

  const commitBudget = () => {
    const num = parseFloat(editValue);
    const fixed = parseFloat(editFixedCosts) || 0;
    if (!isNaN(num) && num >= 0) {
      onUpdateBudget(num, fixed);
    }
    setIsEditingBudget(false);
  };

  const handleBudgetKeyDown = (e) => {
    if (e.key === 'Enter') commitBudget();
    if (e.key === 'Escape') setIsEditingBudget(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Month Picker */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center active:scale-90 transition-transform text-text-secondary text-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          ←
        </button>
        <h2 className="text-sm font-medium text-text-secondary">{formatMonth(currentMonth)}</h2>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center active:scale-90 transition-transform text-text-secondary text-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          →
        </button>
      </div>

      {/* Budget Card */}
      {isEditingBudget ? (
        <div className="w-full bg-surface-elevated rounded-2xl p-5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">
            Set monthly budget
          </label>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-2xl font-semibold">₦</span>
            <input
              ref={budgetInputRef}
              type="number"
              inputMode="decimal"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleBudgetKeyDown}
              placeholder="0"
              className="flex-1 bg-transparent text-3xl font-bold tabular-nums outline-none placeholder:text-text-tertiary"
            />
          </div>

          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mt-4 mb-2 block">
            Fixed costs
          </label>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-lg font-semibold">₦</span>
            <input
              type="number"
              inputMode="decimal"
              value={editFixedCosts}
              onChange={(e) => setEditFixedCosts(e.target.value)}
              onKeyDown={handleBudgetKeyDown}
              placeholder="0"
              className="flex-1 bg-transparent text-xl font-bold tabular-nums outline-none placeholder:text-text-tertiary"
            />
          </div>
          <p className="text-xs text-text-tertiary mt-1">
            Recurring bills, subscriptions, utilities — these are subtracted from your budget automatically.
          </p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={commitBudget}
              className="flex-1 h-10 rounded-xl bg-accent text-surface font-semibold text-sm active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditingBudget(false)}
              className="flex-1 h-10 rounded-xl bg-surface-card text-text-secondary font-medium text-sm active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startEditBudget}
          className="w-full bg-surface-elevated rounded-2xl p-5 active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              {budgetAmount ? 'Budget' : 'Tap to set a budget'}
            </span>
            {budgetAmount > 0 && (
              <span className="text-xs text-text-tertiary">
                ₦{total.toFixed(0)} / ₦{budgetAmount.toFixed(0)}
              </span>
            )}
          </div>

          {budgetAmount > 0 ? (
            <>
              <p className="text-3xl font-bold tabular-nums mb-3">
                ₦{total.toFixed(0)}
              </p>
              <div className="w-full h-2 rounded-full bg-surface-card overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${spentPct}%`,
                    backgroundColor: spentPct > 90 ? '#ff453a' : spentPct > 70 ? '#ff9f0a' : '#30d158',
                  }}
                />
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                {spentPct >= 100
                  ? 'Budget exceeded'
                  : `₦${(budgetAmount - total).toFixed(0)} remaining`}
              </p>

              {/* Safe to Spend */}
              {fixedCosts > 0 && (
                <div className="mt-3 pt-3 border-t border-border-light">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">Fixed costs</span>
                    <span className="text-xs font-medium tabular-nums">-₦{fixedCosts.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-text-secondary">Safe to spend</span>
                    <span className={`text-xs font-bold tabular-nums ${safeToSpend < 0 ? 'text-danger' : 'text-success'}`}>
                      ₦{safeToSpend.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-text-secondary">Daily allowance</span>
                    <span className="text-xs font-semibold tabular-nums">
                      ₦{dailyAllowance.toFixed(0)}/day
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-2xl text-text-tertiary font-medium">₦0.00</p>
          )}
        </button>
      )}

      {/* Recent Expenses Header */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Recent
          </h3>
          {expenses.length > 0 && (
            <button
              onClick={onViewAll}
              className="text-xs font-medium text-accent active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-lg px-1"
            >
              View all →
            </button>
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="bg-surface-elevated rounded-2xl p-8 flex flex-col items-center gap-2">
            <p className="text-text-tertiary text-sm">No expenses yet</p>
            <p className="text-text-tertiary text-xs">Tap + to add one</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {expenses.slice(0, 20).map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExpenseRow({ expense }) {
  const color = getCategoryColor(expense.category);
  const d = new Date(expense.date);
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface-elevated rounded-xl">
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {expense.note || getCategoryLabel(expense.category)}
        </p>
        <p className="text-xs text-text-tertiary">
          {getCategoryLabel(expense.category).toLowerCase()} · {dateStr}
        </p>
      </div>
      <span className="text-sm font-semibold tabular-nums flex-shrink-0">
        -₦{parseFloat(expense.amount).toFixed(2)}
      </span>
    </div>
  );
}
