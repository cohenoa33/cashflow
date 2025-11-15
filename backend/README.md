# Cashflow – Backend

Backend API for **Cashflow**, a lightweight personal finance and cashflow tracking service.  
Built with **Node.js (Express)**, **TypeScript**, **Prisma**, and **PostgreSQL**.

---

## ⚙️ Tech Stack

- **Node.js + Express** – API framework  
- **TypeScript** – static typing and safer code  
- **Prisma ORM** – database access layer  
- **PostgreSQL** – relational database  
- **JWT Auth** – secure authentication  
- **Docker Compose** – local database in development  
- **Jest + SWC** – unit testing (with Prisma mocks)  

---

## 🚀 Quick Start (Development)

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash 
cp .env.example .env
```

**Example .env**
```env
DATABASE_URL="postgresql://cashflow:cashflow@localhost:5433/cashflow_dev?schema=public"
PORT=4000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=supersecret_dev_key
```

### 3. Ensure Docker Desktop is running
The backend uses **PostgreSQL via Docker Compose** in development.

You do not need to run docker compose up manually.

The dev script will:
* Start Docker Compose automatically
* Wait until Postgres is reachable
* Then start the backend server

Just make sure **Docker Desktop is running** in the background.


### 4. Apply migrations and generate Prisma client
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Run the development server
```bash
npm run dev
```
This will:
* Start Docker Compose (docker compose up -d)
* Wait for Postgres (localhost:5433)
* Launch the backend with hot reload (ts-node-dev)

The API will be live at: http://localhost:4000


## 🧩 Project Structure
```bash
backend/
├── src/
│   ├── app.ts               
│   ├── index.ts             
│   ├── authentication.ts     
│   ├── routes/
│   │   ├── accounts.ts       
│   │   ├── transactions.ts 
│   │   ├── login.ts         
│   │   └── register.ts       
│   ├── prisma/
│   │   └── client.ts         
│   └── types/
│       └── express.d.ts      
│
├── prisma/
│   └── schema.prisma         
│
├── tests/
│   ├── __mocks__/prisma.ts   
│   ├── jest-prisma-mock.js  
│   ├── setup.ts              
│   ├── login.test.ts         
│   ├── register.test.ts     
│   ├── accounts.test.ts     
│   └── transactions.test.ts  

├── docker-compose.yml       
├── jest.config.cjs           
├── tsconfig.json             
├── tsconfig.build.json      
├── package.json
└── .env.example
```

## 🧪 Testing

This project uses Jest + SWC for fast TypeScript tests with mocked Prisma.

**Run all tests**
```bash
npm test
```
**Run in watch mode**
```bash
npm run test:watch
```
**Example Output**
```bash
PASS  tests/login.test.ts
PASS  tests/register.test.ts
PASS  tests/accounts.test.ts
PASS  tests/transactions.test.ts
```

**GitHub Actions**
CI runs all tests automatically on every push/PR through
```
.github/workflows/ci.yml.
```

## 🗃️ Database (Docker)
```yaml
version: "3.9"
services:
  cashflow-db:
    image: postgres:16
    container_name: cashflow-db
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: cashflow
      POSTGRES_PASSWORD: cashflow
      POSTGRES_DB: cashflow_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
  ```

**Common Commands**
```bash
docker compose up -d         # start db
docker compose ps            # check containers
docker exec -it cashflow-db psql -U cashflow -d cashflow_dev
docker compose down          # stop (keep data)
docker compose down -v       # stop + delete data volume
```

## 🔑 Authentication


* POST /register → create new user → returns { token }
* POST /login → verify credentials → returns { token }
* All protected routes require header:
```http
Authorization: Bearer <token>
```

## 📚 API Overview

### Accounts
| Method | Endpoint | Description |
|---------|-----------|-------------|
| **POST** | `/accounts` | Create a new account (owner = requester) |
| **GET** | `/accounts` | List all accounts for the logged-in user (owner or authorized) |
| **GET** | `/accounts/:id` | Get details of a single account |
| **PATCH** | `/accounts/:id` | Edit an account (owner only) |
| **DELETE** | `/accounts/:id` | Delete an account (owner only) |

### Transactions
| Method | Endpoint | Description |
|---------|-----------|-------------|
| **POST** | `/transactions` | Create a new transaction for an account |
| **GET** | `/transactions/by-account/:id` | List all transactions for a specific account |
| **GET** | `/transactions/:id` | Retrieve a single transaction by ID |
| **PATCH** | `/transactions/:id` | Update a transaction |
| **DELETE** | `/transactions/:id` | Delete a transaction |


## 🧰 Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Run the development server with hot reload (Nodemon) |
| `npm run build` | Compile TypeScript using `tsconfig.build.json` |
| `npm start` | Run the compiled JavaScript from the `dist/` folder |
| `npm test` | Run Jest unit tests |
| `npm run test:watch` | Run Jest in watch mode |



> 💡 Prisma commands are run directly:
> - `npx prisma generate`
> - `npx prisma migrate dev`

---

## ⚖️ License

MIT License — free for personal and commercial use.  
See the [LICENSE](../LICENSE) file for full text.

## 🗺️ Roadmap
* CSV data import (v2)
* Dashboards by transaction type and date
* AI-based spending categorization
* Deployment workflow (Render / Railway / Fly.io)