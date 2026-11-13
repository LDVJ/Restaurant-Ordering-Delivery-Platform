# CampusBite - Restaurant Ordering & Delivery Platform

CampusBite is a full-stack, role-based restaurant ordering and delivery management system designed for campus food ecosystems. It connects **Customers**, **Restaurant Owners**, and **Delivery Partners** through a unified web interface, backed by an asynchronous FastAPI backend, a relational PostgreSQL database, and AI-powered order analytics.

---

## 1. System Architecture & Tech Stack

```
   ┌──────────────────────────────────────────────────────────────┐
   │                     React.js Frontend (Vite)                 │
   │      - Customer Portal  - Owner Portal  - Delivery Portal    │
   └──────────────────────────────┬───────────────────────────────┘
                                  │ REST API / JWT Bearer
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                     FastAPI Backend (Python)                 │
   │  - Auth (bcrypt / JWT)   - RBAC Guards    - Order State Engine│
   │  - APScheduler           - Gemini Client  - HTTP Middleware  │
   └──────────────────────┬───────────────────────┬───────────────┘
                          │                       │
           SQLAlchemy ORM │ (asyncpg)             │ Google Gemini API
                          ▼                       ▼
   ┌──────────────────────────────┐     ┌─────────────────────────┐
   │      PostgreSQL 16 DB        │     │  AI Order Insights LLM  │
   │  - ACID Transactions         │     │  (gemini-2.5-flash-lite)│
   │  - Payment / Return Ledgers  │     └─────────────────────────┘
   └──────────────────────────────┘
```

### Technology Highlights
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide React, Axios.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy ORM (asyncio / asyncpg), APScheduler, Alembic.
- **Database**: PostgreSQL 16 relational database with relational integrity and foreign keys.
- **AI Integration**: Google Gemini API (`google-genai` SDK) running `gemini-2.5-flash-lite` for contextual customer order analysis.
- **Containerization**: Docker & Docker Compose with multi-stage builds and automated health checks.

---

## 2. User Roles & Core Features

### A. Customer
- **Authentication**: Secure registration and JWT-based login with auto-redirect to `/customer/restaurants`.
- **Explore & Search**: Browse available campus restaurants, filter by cuisine, search dishes by name, and filter by minimum/maximum price.
- **Cart & Dynamic Pricing**: Add, update quantity, or remove dishes in a persistent local cart with delivery fee calculation.
- **Checkout & Multi-Address Support**: Manage multiple delivery addresses, select default delivery location, or add new addresses seamlessly during checkout.
- **Dummy Payment Engine**: Automatic order placement with payment ledger tracking in `MOCK_PAID` status.
- **Order Lifecycle & Tracking**: Real-time order progress timeline with automatic polling termination once the order is `DELIVERED`.
- **Cancellation**: Cancel orders directly from the tracking view while in `PLACED` status.
- **Ratings & Reviews**: Submit star ratings (1–5) and feedback for delivered orders.
- **Returns & Refunds**: File a single return/refund request per delivered order with a custom reason.
- **AI Order Insights**: Ask natural language questions (e.g. *"Summarize my last 5 orders"*, *"How much did I spend this week?"*) powered by LLM order context.

### B. Restaurant Owner
- **Dashboard & KPIs**: Real-time view of total orders, gross revenue, pending orders, and active deliveries.
- **Order Preparation Pipeline**: Accept incoming orders, advance status (`ACCEPTED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY`), and review customer/delivery details.
- **Delivery Partner Assignment**: Assign orders in `READY` status to registered delivery partners (capped at 5 active orders per driver).
- **Menu Management**: Add, update, and manage dishes with 3-second debounced search, availability toggles, and price/category controls.
- **Return & Refund Resolution**: Review customer return requests with order inspection and approve (marking ledger as `REFUNDED`) or reject (`REJECTED`).
- **Inactivity Reminders**: APScheduler background monitor flags orders stuck in `PLACED` or `ACCEPTED` status for $>15$ minutes into owner reminder notifications.

### C. Delivery Partner
- **Dedicated Dispatch Board**: Clean view of assigned active deliveries (`ASSIGNED` and `OUT_FOR_DELIVERY`).
- **Status Progression**: Pick up orders (`OUT_FOR_DELIVERY`) and confirm customer dropoff (`DELIVERED`).
- **Order Detail Modal**: Tabbed view separating order item details from a vertical tracking timeline with restaurant and customer contact details.
- **Delivery History**: Dedicated archive tab displaying past completed deliveries with timestamps and total earnings.

---

## 3. Order Lifecycle State Machine

Orders transition strictly through the following validated states:

```
[PLACED] ──(Owner Accept)──► [ACCEPTED] ──(Prep)──► [PREPARING] ──(Ready)──► [READY]
   │                                                                            │
 (Customer Cancel)                                                       (Assign Driver)
   ▼                                                                            ▼
[CANCELLED]                                                                 [ASSIGNED]
                                                                                │
                                                                           (Start Trip)
                                                                                ▼
[REFUNDED] ◄──(Approve Return)── [DELIVERED] ◄──(Dropoff)── [OUT_FOR_DELIVERY]
```

### Transition & Business Rules
1. **Cancellation**: Allowed **only** while order status is `PLACED`. Once `ACCEPTED`, cancellation is locked.
2. **Assignment**: Driver assignment is permitted when the order reaches `READY`. Driver must have $\le 5$ active assigned orders.
3. **Delivery**: Only the assigned delivery partner can transition orders to `OUT_FOR_DELIVERY` and `DELIVERED`.
4. **Returns**: Return requests can only be initiated **after** an order has reached `DELIVERED`. Multiple return requests for the same order are strictly prevented.

---

## 4. Payment & Refund Ledger

The application implements a dummy payment system without external gateway dependencies:
- **Mock Payment**: Orders placed receive a `payment_status` of `mock_paid`, recorded in the `payment_ledgers` table with a mock transaction ID.
- **Refund Ledger**: When a restaurant owner approves a return request, the ledger records a refund transaction, and the order's `payment_status` updates to `refunded`.

---

## 5. Background Tasks & Middleware

### Background Reminders (APScheduler)
- A background worker (`backend/app/tasks/reminder_tasks.py`) scans for orders remaining in `PLACED` or `ACCEPTED` status for $>15$ minutes.
- Unhandled orders automatically generate persistent records in `admin_reminder_logs`, displayed in the owner reminder notification bell.

### Request Timing & Logging Middleware
- FastAPI HTTP middleware intercepts each request to measure elapsed processing time and injects the `X-Process-Time` header.
- Detailed request logs format: `METHOD /path - STATUS (X.XXms)`.

---

## 6. Project Structure

```
Restaurant-Ordering-and-Delivery-Platform/
├── docker-compose.yml              # Container orchestration (DB + FastAPI)
├── .env.example                    # Root environment template
├── backend/
│   ├── Dockerfile                  # Python 3.12-slim container definition
│   ├── alembic.ini                 # DB migration configuration
│   ├── requirements.txt            # Python dependencies
│   ├── migration/                  # Alembic schema versions
│   └── app/
│       ├── main.py                 # FastAPI application & router mounting
│       ├── config.py               # Pydantic BaseSettings & env loading
│       ├── db.py                   # Async SQLAlchemy engine & session factory
│       ├── security.py             # bcrypt hashing & password verification
│       ├── oauth2.py               # JWT decode & RBAC role dependencies
│       ├── models/                 # SQLAlchemy ORM models
│       ├── schemas.py              # Pydantic validation schemas
│       ├── routers/                # API endpoint controllers
│       ├── services/               # Business logic & DB transactions
│       └── tasks/                  # APScheduler background tasks
└── frontend/
    ├── package.json                # React & dependencies
    ├── vite.config.js              # Vite bundler configuration
    ├── index.html                  # HTML5 entry point
    └── src/
        ├── App.jsx                 # Route definitions & Role-based routes
        ├── context/                # AuthContext & CartContext
        ├── components/             # Reusable UI components & Modals
        ├── pages/                  # Customer, Owner, Delivery page views
        └── services/               # API clients (Fetch / Axios wrappers)
```

---

## 7. Environment Configuration

### Root `.env` (for Docker Compose)
```env
POSTGRES_USER=project_user
POSTGRES_PASSWORD=project123456
POSTGRES_DB=project_db
```

### Backend `.env` (`backend/.env`)
```env
DB_URL=postgresql+asyncpg://project_user:project123456@localhost:5432/project_db
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
```
*(When running inside Docker Compose, `DB_URL` host is automatically set to `db:5432`)*.

### Frontend `.env` (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 8. Quick Start & Setup

### Method 1: Running with Docker Compose (Recommended)

1. **Clone the repository and set up environment files**:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. **Launch PostgreSQL and Backend via Docker**:
   ```bash
   docker compose up --build
   ```
   *The backend runs database migrations automatically (`alembic upgrade head`) before starting Uvicorn on port `8000`.*

3. **Start the Frontend development server**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

### Method 2: Manual Local Setup (Without Docker)

1. **Prerequisites**: PostgreSQL 16, Python 3.12+, Node.js 18+.

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 9. API Reference & Documentation

Interactive API documentation is generated by FastAPI:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints Overview

| Module | Method | Endpoint | Description | Access |
|---|---|---|---|---|
| **Auth** | `POST` | `/auth/register` | Register new user with role | Public |
| **Auth** | `POST` | `/auth/login` | Login and receive JWT token | Public |
| **Auth** | `GET` | `/auth/me` | Fetch authenticated user profile | Authenticated |
| **Customer** | `GET` | `/restaurants` | List restaurants (cuisine/search filter) | Customer |
| **Customer** | `GET` | `/restaurants/{id}/menu` | Get restaurant menu with price filters | Customer |
| **Orders** | `POST` | `/orders` | Place new order with mock payment | Customer |
| **Orders** | `GET` | `/orders` | List customer order history | Customer |
| **Orders** | `POST` | `/orders/{id}/cancel` | Cancel order (PLACED status only) | Customer |
| **Orders** | `POST` | `/orders/{id}/review` | Submit rating & review for delivered order | Customer |
| **Orders** | `POST` | `/orders/{id}/return` | File return/refund request | Customer |
| **Addresses** | `GET` | `/addresses` | List addresses (`?is_default=true` supported) | Customer |
| **Addresses** | `POST` | `/addresses` | Add new delivery address | Customer |
| **AI Insights** | `POST` | `/ai/insights` | Query Gemini LLM about order history | Customer |
| **Owner** | `GET` | `/owner/stats` | Restaurant dashboard metrics & KPIs | Owner |
| **Owner** | `GET` | `/owner/orders` | View & filter restaurant orders | Owner |
| **Owner** | `POST` | `/owner/orders/{id}/status` | Advance order status (`ACCEPTED`, `PREPARING`, `READY`) | Owner |
| **Owner** | `POST` | `/owner/orders/{id}/assign` | Assign order to delivery partner | Owner |
| **Owner** | `GET` | `/owner/menu` | List menu items with search/filter | Owner |
| **Owner** | `POST` | `/owner/menu` | Create new dish | Owner |
| **Owner** | `PATCH` | `/owner/menu/{id}` | Update dish / availability toggle | Owner |
| **Owner** | `GET` | `/owner/reminders` | Fetch inactive order reminders | Owner |
| **Owner** | `POST` | `/owner/returns/{id}/status` | Approve or reject return request | Owner |
| **Delivery** | `GET` | `/delivery/orders` | View assigned active deliveries & history | Delivery |
| **Delivery** | `POST` | `/delivery/orders/{id}/status` | Update to `OUT_FOR_DELIVERY` or `DELIVERED` | Delivery |

---

## 10. Verification & Quality Assurance

- **Frontend Build & Linter**: Clean build passing with 0 errors (`npm run lint` and `npm run build`).
- **File Integrity**: All source code conforms to modular design guidelines ($\le 200$ lines per file).
- **Security**: Passwords hashed with `bcrypt`, endpoints protected by JWT OAuth2 bearer token dependencies, and SQL injection protected via SQLAlchemy parameterized queries.
