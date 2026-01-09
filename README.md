# 💰 Cashflow

**Cashflow** is a full-stack personal finance and cashflow tracking application.  
It helps you manage multiple accounts, track income and expenses, visualize balances over time, and import transactions from CSV.

This repository is organized as a **monorepo** with a clear separation between frontend and backend.

---

## 📋 Overview

Cashflow is built with a modern, production-ready stack:

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Auth**: JWT-based authentication
- **Charts**: Recharts
- **CSV Import**: PapaParse with validation and category suggestions

The frontend focuses on UX, editing flows, and visualization.  
The backend focuses on correctness, security, and financial calculations.

---

## ✨ Core Features

- 🔐 **Authentication** – Secure login, registration, and profile management
- 💳 **Multi-Currency Accounts** – Accounts with starting balances and currency support
- 📊 **Transactions** – Income & expense tracking with categories and descriptions
- 📈 **Balance Forecasting** – Current balance vs projected future balance
- 📁 **CSV Import** – Bulk transaction import with review and validation
- 🏷️ **Smart Category Suggestions** – Rule-based and history-based suggestions
- 📱 **Responsive UI** – Designed to work well on desktop and mobile
- 🔑 **Password Reset** – Forgot-password flow via email reset link (expires after 15 minutes)
---

## 📁 Repository Structure

```text
cashflow/
├── backend/          # Express API server
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── helpers/      # Business logic
│   │   ├── authentication/ # JWT helpers
│   │   └── prisma/       # Database client
│   ├── prisma/          # Schema + migrations
│   └── tests/           # Jest unit tests
│
├── frontend/        # Next.js app (UI, charts, CSV import)
│   ├── app/             # Pages (App Router)
│   ├── components/      # React components
│   ├── lib/             # Utilities & API client
│   └── types/           # TypeScript types
├── .github/workflows/     # CI (backend tests)
└── README.md         # This file
```

Each side of the application is documented independently.

## 🚀 Getting Started (Local)

### Backend
- Runs on **http://localhost:4000**
- Requires Docker (PostgreSQL)

📄 Full setup instructions: 
👉 [backend/README.md](backend/README.md)

### Frontend
-	Runs on **http://localhost:3000**
-	Connects to the backend API

📄 Full setup instructions:
👉 [frontend/README.md￼](frontend/README.md)

## 🔁 Development Workflow
-	Default branch: `main`
-	Pull Requests are required
-	Backend tests run automatically via GitHub Actions

## 🗺️ Roadmap
- ✅ Core accounts & transactions
- ✅ CSV import with validation
- 🔄 Category suggestions (rules + history; AI optional later)
- ⏳ Budgets & monthly summaries
- ⏳ Improved mobile layout
- ⏳ Cookie-based auth for SSR



## 📚 Documentation
- 	Frontend details → [frontend/README.md￼](frontend/README.md)
- 	Backend details → [backend/README.md](backend/README.md)

Each README goes deeper into:
- 	Architecture
- 	Project structure
- 	Auth model
- 	Testing strategy
- 	Key helpers and flows



## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/<description>`
2. Make your changes
3. Run tests: `npm test`
4. Run lint: `npm run lint`
5. Submit a pull request

---

## 📄 License

MIT License – see `LICENSE` for details




