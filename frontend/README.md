# 🌐 Cashflow – Frontend (Next.js)

Next.js (App Router) + TypeScript + Tailwind UI for the **Cashflow** app.  
Connects to the backend API for auth, accounts, and transactions.

---

## ⚙️ Stack

- **Next.js 15** (App Router) with **TypeScript**
- **Tailwind CSS**
- **Turbopack** for fast dev (`next dev`)
- **Fetch** + small wrapper (`lib/api.ts`) for API calls
- **LocalStorage** token handling (`lib/auth.ts`)

---

## 🚀 Quick Start

### 1. Install
```bash
cd frontend
npm install
```

### 2. Environment
Create .env.local:
```.env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Only NEXT_PUBLIC_* variables are exposed to the browser.
Keep secrets on the server (backend).

### 3. Dev server (requires backend to be running)
The frontend communicates with the backend API at `http://localhost:4000`.

Before starting the frontend, make sure the backend is running.
Once the backend is running, start the frontend:

```bash 
npm run dev
# http://localhost:3000
```

Frontend is now available at http://localhost:3000

### 4. Build & run production
```bash 
npm run build
npm start
# http://localhost:3000
```

## 📁 Project Structure
```bash
frontend/
├─ app/
│  ├─ layout.tsx                 # Root layout, imports ./globals.css
│  ├─ page.tsx                   # Home (protected)
│  ├─ login/page.tsx             # Login form
│  ├─ register/page.tsx          # Register form
│  └─ accounts/
│     ├─ page.tsx                # Accounts list + create form (protected)
│     └─ [id]/page.tsx           # Account details + transactions (protected)
├─ components/
│  ├─ RequireAuth.tsx            # Client-side route guard
│  ├─ LogoutButton.tsx
│  ├─ accounts/
│  │  ├─ AccountsList.tsx
│  │  ├─ CreateAccountForm.tsx
│  │  ├─ EditAccountForm.tsx
│  │  └─ DeleteAccountButton.tsx
│  └─ transactions/
│     ├─ AddTransactionForm.tsx
│     └─ TransactionsList.tsx
├─ lib/
│  ├─ api.ts                     # fetch wrapper (adds Authorization header)
│  ├─ auth.ts                    # token save/get/clear + helpers
│  └─ error.ts                   # normalize error messages
├─ types/
│  └─ api.ts                     # shared API types (frontend-only)
├─ app/globals.css               # Tailwind base styles
├─ global.d.ts                   # declare module "*.css" (TS hint)
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ next.config.ts
└─ package.json
```
## 🔐 Auth Model

- **Register:** `POST /register` → `{ token }`
- **Login:** `POST /login` → `{ token }`
- Token is stored in **localStorage** under `cf_token`.
- `lib/api.ts` automatically attaches  
  `Authorization: Bearer <token>` (when present).
- `RequireAuth` blocks protected pages and redirects to **/login** when no token exists.

> For server-side protection or middleware-based auth, you can later add a Next.js Middleware or switch to cookies.  
> This initial setup uses localStorage to prioritize speed and simplicity.

---

## 🧩 Key Files

### `lib/api.ts`
- Centralized fetch wrapper
- Sets `Content-Type: application/json`
- Adds `Authorization` header if token exists
- On `401`, clears token and redirects to `/login`

### `lib/auth.ts`
- `saveToken(token)`
- `getToken()`
- `clearToken()`
- `logout()`
- `isLoggedIn()`

### `components/RequireAuth.tsx`
- Client-side guard (never SSRs user content)
- Redirects to `/login` if not authenticated
- Uses `suppressHydrationWarning` pattern to prevent hydration mismatch

---

## 🧪 Manual Testing Flow

1. Register at **/register** (creates user in backend)
2. Redirect to **/**
3. Visit **/accounts** → create an account → verify it appears
4. Open an account → add/edit/delete transactions

### If requests fail, check:
- Backend is running: **http://localhost:4000**
- `NEXT_PUBLIC_API_BASE_URL` in `.env.local` matches backend URL
- Token exists in localStorage (`cf_token`)

## 🧰 Scripts
```bash
npm run dev        # start dev server (Turbopack)
npm run build      # type-check + lint + production build
npm start          # run production build
```

Lint errors can fail builds. If needed, you can relax ESLint during build in next.config.ts with:

```ts
export default { eslint: { ignoreDuringBuilds: true } }
```

## 🗺️ Roadmap (Frontend)
*	Dashboard charts (balances over time, by category/type)
*	CSV import UX
*	Account/user sharing UI (owners vs authorized users)
*	Suspense + server components for data fetching
*	Switch to cookie-based auth for SSR protection (optional)


## 📄 License

MIT — see repository license.