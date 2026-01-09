# 🧠 Cashflow – Backend

The backend API for **Cashflow**, a personal finance and cashflow tracking app.

This service is responsible for **authentication**, **accounts**, **transactions**, **balance calculations**, and **CSV imports**.  
It is designed to be **predictable, explicit, and easy to extend**, with most business logic living in small helpers rather than large controllers.

Runs locally at:  
👉 **http://localhost:4000**

---

## ⚙️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (Bearer tokens)
- **Testing**: Jest + mocked Prisma
- **Dev DB**: Docker Compose

---

## 🚀 Quick Start

### 1. Install
```bash
cd backend
npm install
```

### 2. Environment
```bash
cp .env.example .env
```

Example .env:
```.env
DATABASE_URL="postgresql://cashflow:cashflow@localhost:5433/cashflow_dev?schema=public"
PORT=4000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET="CHANGE_ME_TO_A_SECURE_RANDOM_32+_CHAR_SECRET"
RESEND_API_KEY=re_...
RESEND_FROM=verified-domain-email
```

### 3. Start database + server
Make sure Docker Desktop is running, then:

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

The dev script will:
- Start PostgreSQL via Docker Compose
- Wait until the DB is reachable
- Start the API with hot reload

## 🔐 Authentication Model

- **Register** → `POST /register` → `{ token }`
- **Login** → `POST /login` → `{ token }`
- **Forgot Password** →	`POST /forgot-password` → email reset link (expires in 15 minutes)
- **Reset Password** →	`POST /reset-password` → validates reset token + updates password
- Token is a **JWT**
- Protected routes require:
``` http
Authorization: Bearer <token>
```

Authentication logic is centralized and reused across routes.

## 📦 Core Capabilities
### Accounts
- Multi-currency accounts
- Starting balance support
- Ownership-based access control
- Computed:
  - `currentBalance` (up to today)
  - `forecastBalance` (including future transactions)
  - `dailySeries` (used for charts)

### Transactions
- Income / expense transactions
- Categories, descriptions, and dates
- CSV import with validation
- Balance recalculation handled server-side

### Category Suggestions
- Rule-based suggestions
- Token stored on user (`resetToken`, `resetTokenExpiry`)
- 15-minute expiry window

### Authentication
- Password reset via email
- History-based matching from user transactions
- Designed to support future AI integration (optional)

## 📁 Project Structure

The backend follows a **thin-routes / rich-helpers** pattern:

backend/
├── src/
│   ├── routes/        # HTTP endpoints
│   ├── helpers/       # Business logic (balances, categories, CSV)
│   ├── authentication # JWT helpers + middleware
│   ├── prisma/        # Prisma client
│   ├── types/         # Shared TypeScript types
│   └── utils/         # Small utilities
├── prisma/            # Schema + migrations
├── tests/             # Jest unit tests (mocked Prisma)
└── docker-compose.yml # Local PostgreSQL

Routes stay intentionally small; helpers do the heavy lifting.


## 🧪 Testing
```bash 
npm test
npm run test:watch
```
- Fast unit tests
- Prisma is mocked
- No database required for test runs

## 🗺️ Roadmap
- ⏳ Deployment guide (Railway / Render / Fly.io)
- ⏳ API rate limiting
- ⏳ More analytics helpers
- ⏳ Optional AI-powered category suggestions



## 📄 License

MIT — see LICENSE for details.