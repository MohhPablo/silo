import { Trash2 } from 'lucide-react';

const CATEGORY_COLORS = {
  food: 'bg-[#ff9f0a]',
  transport: 'bg-[#5e5ce6]',
  shopping: 'bg-[#ff375f]',
  bills: 'bg-[#30d158]',
  other: 'bg-[#8e8e93]',
};

const CATEGORY_BG = {
  food: 'bg-[#ff9f0a]/10',
  transport: 'bg-[#5e5ce6]/10',
  shopping: 'bg-[#ff375f]/10',
  bills: 'bg-[#30d158]/10',
  other: 'bg-[#8e8e93]/10',
};

export default function Expenses({ expenses, total, onDelete }) {
  const byCategory = expenses.reduce((acc, e) => {
    if (!acc[e.category]) acc[e.category] = { total: 0, items: [] };
    acc[e.category].total += parseFloat(e.amount);
    acc[e.category].items.push(e);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      {/* Total */}
      <div className="bg-surface-elevated rounded-2xl p-5">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
          Total Spent
        </p>
        <p className="text-3xl font-bold tabular-nums">₦{total.toFixed(2)}</p>
      </div>

      {/* By Category */}
      {Object.keys(byCategory).length === 0 ? (
        <div className="bg-surface-elevated rounded-2xl p-8 flex flex-col items-center gap-2">
          <p className="text-text-tertiary text-sm">No expenses yet</p>
          <p className="text-text-tertiary text-xs">Tap + to add one</p>
        </div>
      ) : (
        Object.entries(byCategory).map(([cat, data]) => (
          <div key={cat} className="bg-surface-elevated rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border-light">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat]}`} />
                <span className="text-sm font-medium capitalize">{cat}</span>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                ₦{data.total.toFixed(2)}
              </span>
            </div>
            {data.items.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-surface-card/50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${CATEGORY_BG[cat]} flex items-center justify-center`}>
                  <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[cat]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.note || 'No note'}</p>
                  <p className="text-xs text-text-tertiary">
                    {new Date(e.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums mr-2">
                  ₦{parseFloat(e.amount).toFixed(2)}
                </span>
                <button
                  onClick={() => onDelete(e.id)}
                  aria-label={`Delete ${e.note || e.category} expense`}
                  className="w-7 h-7 rounded-full bg-danger-muted flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <Trash2 size={13} className="text-danger" />
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
