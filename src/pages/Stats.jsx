const CATEGORY_COLORS = {
  food: '#ff9f0a',
  transport: '#5e5ce6',
  shopping: '#ff375f',
  bills: '#30d158',
  other: '#8e8e93',
};

const CATEGORY_LABELS = {
  food: 'Food',
  transport: 'Transport',
  shopping: 'Shopping',
  bills: 'Bills',
  other: 'Other',
};

export default function Stats({ expenses, budget, total, currentMonth }) {
  const byCategory = expenses.reduce((acc, e) => {
    if (!acc[e.category]) acc[e.category] = 0;
    acc[e.category] += parseFloat(e.amount);
    return acc;
  }, {});

  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const hasData = total > 0;

  const dailyAvg = (() => {
    const [y, m] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const now = new Date();
    const currentDay =
      now.getFullYear() === y && now.getMonth() === m - 1
        ? now.getDate()
        : daysInMonth;
    return total / Math.min(currentDay, daysInMonth);
  })();

  const projectedTotal = (() => {
    const [y, m] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    return dailyAvg * daysInMonth;
  })();

  const projectionPct = budget ? (projectedTotal / budget) * 100 : 0;

  return (
    <div className="flex flex-col gap-5">
      {!hasData ? (
        <div className="bg-surface-elevated rounded-2xl p-8 flex flex-col items-center gap-2">
          <p className="text-text-tertiary text-sm">No data yet</p>
          <p className="text-text-tertiary text-xs">Add expenses to see stats</p>
        </div>
      ) : (
        <>
          {/* Donut Chart */}
          <div className="bg-surface-elevated rounded-2xl p-5">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-4">
              Spending Breakdown
            </p>
            <div className="flex items-center gap-5">
              <div className="relative w-32 h-32 flex-shrink-0">
                <DonutChart categories={categories} total={total} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold tabular-nums">₦{total.toFixed(0)}</span>
                  <span className="text-xs text-text-tertiary">total</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                {categories.map(([cat, amount]) => {
                  const pct = ((amount / total) * 100).toFixed(0);
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      <span className="text-xs text-text-secondary capitalize flex-1 truncate">
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <span className="text-xs font-medium tabular-nums">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Totals */}
          <div className="space-y-1.5">
            {categories.map(([cat, amount]) => (
              <div
                key={cat}
                className="bg-surface-elevated rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[cat]}18`,
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {((amount / total) * 100).toFixed(0)}% of spending
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  ₦{amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Projection */}
          <div className="bg-surface-elevated rounded-2xl p-5">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
              Pace
            </p>
            <p className="text-xs text-text-tertiary mb-4">
              If you keep spending at this rate, here's where you'll end up by the end of the month.
            </p>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-text-tertiary">So far per day</p>
                <p className="text-lg font-semibold tabular-nums">
                  ₦{dailyAvg.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-tertiary">Est. month-end</p>
                <p className="text-lg font-semibold tabular-nums">
                  ₦{projectedTotal.toFixed(2)}
                </p>
              </div>
            </div>
            {budget > 0 && (
              <>
                <div className="w-full h-2 rounded-full bg-surface-card overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(projectionPct, 100)}%`,
                      backgroundColor:
                        projectionPct > 100
                          ? '#ff453a'
                          : projectionPct > 90
                            ? '#ff9f0a'
                            : '#30d158',
                    }}
                  />
                </div>
                <p className="text-xs text-text-tertiary mt-2">
                  {projectionPct > 100
                    ? `On track to overshoot your budget by ${(projectionPct - 100).toFixed(0)}%`
                    : `On track to use ${projectionPct.toFixed(0)}% of your budget`}
                </p>
              </>
            )}
          </div>

          {/* Count + Highest */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-elevated rounded-2xl p-4">
              <p className="text-xs text-text-tertiary mb-1">
                Transactions
              </p>
              <p className="text-xl font-bold tabular-nums">
                {expenses.length}
              </p>
            </div>
            <div className="bg-surface-elevated rounded-2xl p-4">
              <p className="text-xs text-text-tertiary mb-1">
                Highest category
              </p>
              <p className="text-xl font-bold capitalize truncate">
                {categories.length > 0
                  ? CATEGORY_LABELS[categories[0][0]]
                  : '—'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DonutChart({ categories, total }) {
  const radius = 48;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const arcs = categories.map(([cat, amount]) => {
    const pct = amount / total;
    const length = pct * circumference;
    const arc = {
      dashArray: `${length} ${circumference - length}`,
      dashOffset: -offset,
      color: CATEGORY_COLORS[cat],
      category: cat,
      amount,
    };
    offset += length;
    return arc;
  });

  const summary = arcs
    .map((a) => `${CATEGORY_LABELS[a.category]} ${((a.amount / total) * 100).toFixed(0)}%`)
    .join(', ');

  return (
    <svg
      viewBox="0 0 116 116"
      className="w-32 h-32 -rotate-90"
      role="img"
      aria-label={`Spending breakdown: ${summary}`}
    >
      <title>Spending breakdown: {summary}</title>
      <circle
        cx="58"
        cy="58"
        r={radius}
        fill="none"
        stroke="#2c2c2e"
        strokeWidth={strokeWidth}
      />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx="58"
          cy="58"
          r={radius}
          fill="none"
          stroke={arc.color}
          strokeWidth={strokeWidth}
          strokeDasharray={arc.dashArray}
          strokeDashoffset={arc.dashOffset}
          className="transition-all duration-700 ease-out"
        />
      ))}
    </svg>
  );
}
