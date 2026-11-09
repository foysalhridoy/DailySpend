# DailySpend — Premium Personal Finance & Expense Management Platform

DailySpend is a production-quality, cloud-synchronized, mobile-first personal finance platform built for smartphones, tablets, and modern desktops. It combines the sleek aesthetic of Apple Wallet and Google Finance with the flexibility of custom tracking periods, multi-wallet accounts, thermal receipt generation, and offline-first PWA caching.

---

## 🌟 Key Features

### 1. Mobile-First Touch Experience
- **Native-Like Feel**: Tailored for 360px, 390px, 412px Android and iOS viewports.
- **Fixed Bottom Navigation**: Ergonomic one-hand navigation with a prominent Quick Add (+) floating action button.
- **5–10 Second Expense Logging**: Large numeric keypad input, quick amount chips (+20, +50, +100, +200, +500), horizontal category chips, and duplicate submission prevention.
- **Safe Area Insets**: Dynamic viewport height (`100dvh`) and cutout/home-indicator padding.

### 2. Flexible Tracking Periods
- **Start On Any Day**: Never forced into monthly calendar boundaries. Set custom 7-day, 15-day, examination week, or trip cycles (e.g., *Nov 9 – Nov 15, 2026*).
- **Independent Spending Targets**: Target limits are independent of start/end dates.
- **Historical Integrity**: Completed periods can be closed or reopened; historical financial records are never deleted.

### 3. Multi-Wallet Architecture & Reconciled Balances
- **Preconfigured Accounts**: Cash, bKash, Nagad, Rocket, Bank Account, and custom wallets.
- **Strict Financial Integrity**:
  - `Available Balance = Opening Balance + Total Income - Total Expenses`
  - `Wallet Balance = Opening Wallet Balance + Income - Expenses + Transfers In - Transfers Out`
  - **Opening Balance is never counted as income.**
  - **Wallet transfers do not count as income or expenses.**

### 4. Dedicated Receipt Studio
- **Thermal Formats**: Authentic **58mm Thermal**, **80mm Thermal**, and **A4 Statements**.
- **ATM / POS Styling**: Monospace Courier font, receipt numbers, dashed dividers, tabular alignment, and barcode simulators.
- **Export & Print**: Native browser thermal printing with custom print CSS and vector PDF generation via `jsPDF`.

### 5. Progressive Web App (PWA) & Offline Sync
- **Local-First Engine**: Powered by **Dexie.js (IndexedDB)**. The app is 100% operational offline.
- **Offline Mutation Queue**: Creates offline drafts and synchronizes to Supabase when network connectivity returns.
- **Cloud Status Badge**: Real-time visual indicator (`Synced`, `Syncing`, `Offline`, `Sync Failed`).
- **Installable**: Full `manifest.json` and `sw.js` service worker.

### 6. Analytics & Daily Closing
- **Daily Spend Velocity**: 7-day bar chart and category donut distribution via Recharts.
- **Daily Closing**: End-of-day checklist, reconciliation reminders for unrecorded cash payments, and day-review markers.
- **Data Export & Backup**: Complete JSON database backup/restoration with schema validation, plus PapaParse CSV ledger export.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS v4, React Router 7 |
| **Icons & UI** | Lucide React, Framer Motion |
| **Visualizations** | Recharts (Touch-responsive) |
| **Forms & Validation** | React Hook Form, Zod |
| **Local Database & Offline** | Dexie.js (IndexedDB), Service Worker |
| **Cloud Backend** | Supabase (PostgreSQL, Auth, Row Level Security, Realtime) |
| **Export Engines** | jsPDF (Thermal receipts & Statements), PapaParse (CSV) |

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
cd DailySpend
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: DailySpend includes a built-in guest/demo mode and local Dexie.js database. It runs immediately without requiring external API keys.

---

## ☁️ Supabase Cloud Configuration (Optional)

To enable multi-device cloud synchronization and Supabase Auth:

### 1. Run Database Migrations
1. Open your Supabase Project Dashboard.
2. Go to the **SQL Editor**.
3. Paste and execute the contents of `supabase/schema.sql`.
4. This creates all tables (`profiles`, `wallets`, `transactions`, `tracking_periods`, `budgets`, `receipts`, `daily_closings`, `user_settings`) and configures Row Level Security (RLS) policies.

### 2. Set Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_TITLE=DailySpend
```

### 3. Restart Dev Server
```bash
npm run dev
```
DailySpend will automatically detect the Supabase credentials, switch the sync badge to **Synced**, and maintain cloud replication!

---

## 📱 Mobile Testing & Verification

DailySpend was specifically tested and verified for the following viewports:

- **360px** (Small Android: Galaxy A-series, Moto E)
- **390px** (iPhone 12/13/14/15/16)
- **412px** (Pixel 7/8/9, Galaxy S23/S24)
- **768px – 1024px** (Tablets & iPads)
- **1280px+** (Desktop widescreen with collapsible sidebar)

### Verification Checklist:
- [x] Zero horizontal overflow or clipped text.
- [x] Bottom navigation bar respects `safe-area-inset-bottom`.
- [x] Numeric keypad trigger on mobile inputs (`inputMode="decimal"`).
- [x] Thermal receipts render accurately on 58mm and 80mm widths.
- [x] Balances reconcile precisely to 2 decimal places.
- [x] Backup export produces valid JSON and restores cleanly.

---

## 🚢 Deployment

### Deploy to Vercel
```bash
npm run build
npx vercel
```

### Deploy to Netlify
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

---

## 📄 License
MIT © DailySpend Personal Finance Platform.
