# SILO

Minimalist budget planner — a mobile-first PWA optimized for iOS.

Track your spending by category against a monthly budget. All data stays on your device.

## Features

- **Expense tracking** — add expenses with amount, category, note, and date
- **Monthly budget** — set a budget and see your progress in real time
- **Stats dashboard** — spending breakdown with donut chart, category totals, and monthly projections
- **Data portability** — export/import all data as JSON backups
- **Offline-first** — IndexedDB storage with localStorage fallback, works without internet
- **PWA installable** — add to your iOS home screen for a native app experience

## Setup

```bash
npm install
npm run dev        # start dev server
npm run build      # production build
npm run preview    # preview production build
```

After building, generate app icons:
```bash
node scripts/generate-icons.mjs
```

## Tech

React 19, Vite 6, Tailwind CSS 4, lucide-react, IndexedDB.
