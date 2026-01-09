# 🌐 Cashflow – Frontend

Frontend application for **Cashflow**, a personal finance and cashflow tracking tool.  
Built with **Next.js App Router**, **TypeScript**, and **Tailwind CSS**, and designed to work alongside the Cashflow backend API.

This app handles authentication, account management, transaction tracking, CSV imports, and data visualization.

---

## ⚙️ Technology Stack

- **Framework**: Next.js 16.0.10 (App Router)
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 3.4.18
- **Charts**: Recharts 3.4.1
- **CSV Parsing**: PapaParse 5.5.3
- **Language**: TypeScript 5

---

## 🚀 Development

### Prerequisites

- Node.js 18+
- Backend running locally at **http://localhost:4000**  
  (see `backend/README.md` for setup instructions)

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

> Only `NEXT_PUBLIC_*` variables are exposed to the browser.  
> All secrets must remain in the backend.

### Available Scripts

- `npm run dev` – Start the development server
- `npm run build` – Build for production
- `npm start` – Run production build
- `npm run lint` – Run ESLint checks

---

## 🔐 Authentication Model

- Authentication is **token-based (JWT)**.
- Token is stored in `localStorage` under `cf_token`.
- Requests automatically include:
  ```
  Authorization: Bearer <token>
  ```
- Protected pages are wrapped with `RequireAuth`.

### Auth flow

- `POST /register` → creates user → returns `{ token }`
- `POST /login` → authenticates user → returns `{ token }`
-	`POST /forgot-password` → sends reset email (15 min link)
-	`POST /reset-password` → verifies token + sets new password
- Missing or invalid tokens redirect the user to `/login`

Backend authentication logic lives in `backend/README.md`.

---

## 📁 Project Structure (Pattern Overview)

The frontend follows a **feature-oriented structure**, separating pages, domain components, UI primitives, and shared utilities.

```text
frontend/
├── app/                  # Next.js App Router pages
│   ├── accounts/          # Account-related routes (list, details, import)
│   ├── profile/           # User profile page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── forgot-password/   # Request reset email
│   ├── reset-password/    # Set new password using token
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
│
├── components/
│   ├── layout/            # Shared layout wrappers (auth + nav)
│   ├── accounts/          # Account-specific UI components
│   ├── transactions/      # Transaction & CSV import components
│   └── ui/                # Reusable UI primitives (Button, Modal, Inputs)
│
├── lib/
│   ├── api.ts             # API wrapper (auth headers, error handling)
│   ├── auth.ts            # Token helpers
│   ├── password.ts        # Password helpers
│   ├── csv.ts             # CSV parsing utilities
│   ├── money.ts           # Currency formatting helpers
│   ├── currency.ts        # Currency metadata & symbols
│   ├── categories.ts      # Category lists
│   ├── suggestCategory.ts # Category suggestion helpers
│   └── date.ts            # Date utilities
│
├── types/
│   └── api.ts             # Frontend API response types
│
├── public/                # Static assets
├── tailwind.config.ts
├── postcss.config.mjs
└── package.json
```

The structure is intentionally flexible so new domains (e.g. budgets, reports) can be added without restructuring the app.

---

## 📡 API Integration

The frontend communicates with the backend API at:

```
http://localhost:4000
```

Common endpoints used:

- `GET /accounts` – List user accounts
- `GET /accounts/:id` – Account details
- `POST /transactions` – Create transaction
- `POST /transactions/import` – Import transactions from CSV
- `POST /transactions/suggest-categories` – Category suggestions
- `PATCH /transactions/:id` – Update transaction
- `DELETE /transactions/:id` – Delete transaction

For full API details, see **`backend/README.md`**.

---

## 🧪 Testing

Frontend testing is currently minimal and focused on manual flows during development.  
Automated frontend tests may be added later once UX stabilizes.

---

## 🤝 Contributing

- **Pull requests are required** for all changes
- Branch naming convention:
  ```
  feature/<short-description>
  ```
- Keep commits small and focused
- Ensure `npm run lint` passes before opening a PR

A root-level contribution guide may be added later.

---

## 🗺️ Roadmap

- **Charts & insights**
  - ⏳ Improve balance charts (income vs. expenses over time)
  - ⏳ Add clearer trends and per-account summaries

- **Category suggestions**
  - ✅ Rule-based and history-based suggestions (implemented)
  - ⏳ Optional AI-powered categorization (future enhancement)

- **Financial planning**
  - ⏳ Budgets by category
  - ⏳ Monthly and yearly summaries

- **UX & accessibility**
  - ⏳ Improved mobile layout and responsiveness
  - ⏳ Polished table, modal, and form interactions

- **Authentication**
  - ⏳ Optional cookie-based authentication for better SSR protection

---

## 📄 License

MIT License — see LICENSE for details.