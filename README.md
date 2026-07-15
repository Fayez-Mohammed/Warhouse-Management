# WarehouseOS

> A full-featured warehouse and inventory management system built with React + TypeScript.  
> Handles products, orders, invoices, cheques, expenses, reports, and user management — with full Arabic/English bilingual support and RTL layout.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-private-lightgrey)
![Language](https://img.shields.io/badge/i18n-EN%20%7C%20AR-orange)
![RTL](https://img.shields.io/badge/RTL-supported-blueviolet)

---

## Features

- **Inventory Management** — Add, edit, delete products with stock tracking, low-stock alerts, and supplier returns
- **Sales Orders** — Create direct sales, collect payments, process returns
- **Invoices** — 5 invoice types: Customer, Commission, Supply, Return, Supplier Return
- **Cheques** — Incoming (customer) and outgoing (supplier) bank cheque tracking with status lifecycle
- **Expenses** — Petty cash and miscellaneous cost logging
- **Reports** — Sales report, stock movement, customer/sales-rep/supplier performance reports with charts
- **Inventory Check** — Physical audit tool with financial impact preview before applying adjustments
- **User Management** — Customers, Sales Reps, and Suppliers with account summaries
- **Bilingual UI** — Full EN ↔ AR toggle with RTL layout, Cairo font, and persisted preference
- **Dark / Light Mode** — Theme toggle persisted in localStorage
- **JWT Authentication** — Login with OTP, automatic token refresh, session expiry handling
- **Autocomplete** — Product name, customer, sales rep, and supplier search fields throughout

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Component Primitives | Radix UI (Dialog, Tabs, Accordion, Select, Tooltip…) |
| Charts | Recharts |
| Icons | Lucide React |
| Animations | Motion (Framer Motion v12) |
| Notifications | Sonner |
| Date Utilities | date-fns |
| HTTP | Native `fetch` with JWT + refresh token logic |
| i18n | Custom React Context (`LangProvider` + `useLang`) |
| Fonts | Outfit (EN), Cairo (AR), JetBrains Mono |
| Backend API | ASP.NET Core — `https://warhouse-management.runasp.net` |
| Auth | JWT Bearer + OTP verification |

---

## Project Structure

```
src/
├── app/
│   └── App.tsx                  # Root component, LangProvider + theme wiring
├── components/
│   ├── autocomplete/            # ProductName, Person, Supplier autocomplete inputs
│   ├── reports/                 # ReportCard, InvoiceTable shared components
│   ├── LangSwitcher.tsx         # EN | AR toggle
│   ├── Overlay.tsx              # Modal backdrop
│   └── StatCard.tsx             # Dashboard stat card
├── hooks/
│   └── useTheme.ts              # Dark/light mode toggle with localStorage
├── lib/
│   ├── api.ts                   # apiFetch, authHeaders, token refresh, API base URL
│   ├── i18n.tsx                 # LangProvider, useLang, full EN + AR translation map
│   └── utils.ts                 # formatDate and misc helpers
├── pages/
│   ├── auth/                    # LoginPage, OtpPage
│   ├── dashboard/               # Dashboard shell + sidebar navigation
│   ├── overview/                # OverviewPage (stats + low stock)
│   ├── categories/              # CategoriesPage + modals
│   ├── products/                # ProductsPage + create/edit/delete/stock-in/return modals
│   ├── orders/                  # OrdersPage + direct sale + collect payment modals
│   ├── invoices/                # InvoicesPage + pay supplier + products viewer modals
│   ├── cheques/                 # ChequesPage + cheque create/edit/status modals
│   ├── expenses/                # ExpensesPage (inline modals)
│   ├── reports/                 # ReportsPage + 5 report tab components
│   ├── inventory-check/         # InventoryCheckPage (simulate + apply adjustments)
│   └── users/                   # UsersPage + create/edit/delete/account modals
├── styles/
│   ├── fonts.css                # Google Fonts imports
│   ├── theme.css                # CSS custom properties (light + dark tokens)
│   └── index.css                # Tailwind base + @theme inline token mappings
└── types/                       # Shared TypeScript interfaces and enums
```

---

## Pages & Screens

| Page | Route (sidebar nav) | Description |
|---|---|---|
| Login | — | Username + password, OTP verification |
| Overview | نظرة عامة / Overview | KPI stats (sales, profit, orders) + low-stock table |
| Categories | الفئات / Categories | CRUD for product classification groups |
| Products | المنتجات / Products | Full inventory table, stock-in, return-to-supplier |
| Orders | الطلبات / Orders | Approved sales orders, payment collection, returns |
| Reports | التقارير / Reports | 5 tabbed report views with charts and tables |
| Inventory Check | جرد المخزون | Physical stock audit with adjustment preview |
| Invoices | الفواتير / Invoices | All financial records across 5 invoice types |
| Cheques | الشيكات / Cheques | Bank cheque register (incoming + outgoing) |
| Expenses | المصروفات / Expenses | Petty cash log |
| Users | المستخدمون / Users | Customers, Sales Reps, Suppliers + account details |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm (recommended) or npm

### Install

```bash
pnpm install
```

### Run (development)

This project is built for Figma Make and runs inside the Make sandbox. To develop locally:

```bash
pnpm vite
```

The app will start at `http://localhost:5173`.

### Build

```bash
pnpm build
```

Output goes to `dist/`.

### Environment

The API base URL is hardcoded in `src/lib/api.ts`:

```ts
export const API = "https://warhouse-management.runasp.net";
```

Change this value if pointing at a different backend environment.

### Auth Flow

1. `POST /api/Auth/login` → returns JWT access token + refresh token (or triggers OTP)
2. `POST /api/Auth/verify-otp` → returns tokens after OTP verification
3. All subsequent requests use `Authorization: Bearer <token>`
4. `apiFetch` auto-refreshes via `POST /api/Auth/refresh` when a 401 is received
5. On refresh failure, fires `auth:sessionExpired` window event → app returns to login

---

## Internationalization

The app uses a custom React Context for i18n — no external library.

```ts
// Wrap the app
<LangProvider>
  <App />
</LangProvider>

// Use anywhere
const { t, isRTL, lang, setLang } = useLang();
t("products_title") // → "Products" (EN) or "المنتجات" (AR)
```

- Language preference is persisted in `localStorage("lang")`
- Switching to AR sets `document.documentElement.dir = "rtl"` and loads the Cairo font
- All numeric and code values in RTL tables are wrapped in `<span dir="ltr">` to preserve correct number display

---

## RTL Table Alignment Pattern

To keep table headers and cells perfectly aligned in both LTR and RTL:

```tsx
// Header — always text-start (maps to right in RTL, left in LTR)
<th className="text-start py-3 px-3 ...">...</th>

// Text cell
<td className="text-start py-3 px-3 ...">...</td>

// Numeric / code cell — text-start on td, dir="ltr" only on the inner span
<td className="text-start py-3 px-3 font-mono">
  <span dir="ltr" className="inline-block">${value.toLocaleString()}</span>
</td>
```

> ⚠️ Never put `dir="ltr"` directly on a `<td>` — it overrides `text-start` and breaks alignment with the header.

---

## Contributors

| Name | Role |
|---|---|
| [Your Name] | Full-Stack Developer |
| [Designer Name] | UI/UX Design |
| [Team Member] | Backend / API |

---

## License

Private — internal use only.
