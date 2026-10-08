# Sales & Inventory Management System

A full-stack web app to manage products and customers, create sales orders, keep inventory up to date, and run a manager approval workflow for large orders.

**Stack:** React (Vite, Tailwind CSS) · FastAPI (Python) · MySQL (SQLAlchemy)

---

## Features

- **Authentication:** JWT login with two roles, `user` and `manager`
- **Products and customers:** list, add and edit
- **Sales orders:** validated on creation (customer exists, products exist, quantity above zero, enough stock)
- **Approval workflow:** orders above the approval threshold wait for a manager
- **Email notifications:** the manager is emailed when approval is needed, and the user is emailed the decision
- **Inventory:** stock is updated inside a database transaction, and every change is written to an audit table
- **Dashboard:** total sales, orders by status, pending approvals, inventory summary, low-stock list and recent orders

---

## How the order workflow works

| Situation | Result |
|---|---|
| Order total is at or below the threshold (default ₹50,000) | Order is `COMPLETED` immediately and stock is deducted |
| Order total is above the threshold | Order is `PENDING_APPROVAL`, stock is **not** touched, managers are emailed |
| Manager approves | Stock is checked again and deducted, the order becomes `COMPLETED`, the user is emailed |
| Manager rejects | Order becomes `REJECTED`, stock is unchanged, the user is emailed |

The threshold is a single constant in `backend/config.py` (`APPROVAL_THRESHOLD`).

### Design decisions

- **Stock is checked twice.** Once when the order is created, and again at approval time, because stock can change while an order waits for approval.
- **One transaction per action.** Creating an order, approving it, and the stock deduction each commit once at the end, and roll back completely on any error.
- **Row locks.** Products and orders are read with `SELECT ... FOR UPDATE`, so two requests cannot deduct the same stock, or decide the same order, at the same time.
- **Price snapshot.** `order_items` stores the unit price at the time of the order, so later price edits do not change old orders.
- **Audit log.** Every stock change (initial stock, manual edit, order completion) is recorded in `inventory_movements`.
- **Emails are background tasks.** A failing mail server never breaks an order. Errors are only logged.
- **Role rules.** Users see only their own orders and the dashboard for their own orders. Managers see all orders and are the only ones who can approve or reject.

---

## Project structure

```
backend/
  main.py              App setup, CORS, routers
  database.py          Engine and session (reads DATABASE_URL from .env)
  config.py            Approval and low-stock thresholds
  models.py            SQLAlchemy tables
  schemas.py           Pydantic request/response models
  auth.py              Password hashing, JWT, role checks
  routers/             API routes (auth, products, customers, orders, approvals, dashboard)
  services/            Business logic (order_service, approval_service, email_service)
frontend/
  src/                 React app (pages, layout, auth context, API client)
```

### Database tables

`users`, `customers`, `products`, `orders`, `order_items`, `approvals`, `inventory_movements`. They are created automatically when the backend starts.

---

## Setup

### Prerequisites

- Python 3.11 or newer
- Node.js 18 or newer
- MySQL 8

### 1. Database

Create an empty database:

```sql
CREATE DATABASE sales_inventory CHARACTER SET utf8mb4;
```

### 2. Backend

```bash
cd backend
python -m venv venv

# activate the virtual environment
#   Windows (Git Bash):    source venv/Scripts/activate
#   Windows (cmd/PowerShell): venv\Scripts\activate
#   macOS / Linux:         source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/` (copy `.env.example`) and fill it in:

```
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/sales_inventory
DB_SSL_CA=
SECRET_KEY=any-long-random-string

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

- Leave `DB_SSL_CA` empty for a local MySQL. Set it to the path of a CA certificate only for a cloud MySQL that requires SSL.
- If `DATABASE_URL` is not set, the app falls back to a local SQLite file. That is only for a quick trial. Use MySQL for real runs.

Start the API:

```bash
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`, and the interactive docs are at `http://127.0.0.1:8000/docs`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend expects the API at `http://127.0.0.1:8000` (set in `frontend/src/api.js`), and the backend allows the origin `http://localhost:5173`.

### 4. Email (optional)

- **Without SMTP settings**, emails are printed in the backend console, so the whole flow can still be tested.
- **With Gmail:** turn on 2-step verification, create an **App Password**, and put your address in `SMTP_USER` and the 16-character password in `SMTP_PASSWORD`.
- Approval emails go to **every user with the manager role**, so register the manager with an email address you can read.

---

## Trying it out

1. Open `/register` and create a **manager** and a **user** (the role is selectable on the form, see the notes below).
2. Add a customer and a few products (for example a product at ₹30,000 with stock 10).
3. As the **user**, create an order below the threshold. It completes immediately and stock goes down.
4. Create an order above the threshold (for example quantity 2 of the ₹30,000 product). It goes to `PENDING_APPROVAL`, stock is unchanged, and the manager gets an email.
5. Log in as the **manager**, open **Approvals**, and approve or reject it with a remark. The user gets an email, and the dashboard numbers update.
6. Try an order for more than the available stock. It is rejected with a clear error.

---

## API overview

| Method and path | Purpose | Access |
|---|---|---|
| `POST /register`, `POST /login`, `GET /me` | Account and session | Public / logged in |
| `GET, POST /products`, `PUT /products/{id}` | List, add, edit products | Logged in |
| `GET, POST /customers`, `PUT /customers/{id}` | List, add, edit customers | Logged in |
| `GET /orders/config` | Approval threshold | Logged in |
| `POST /orders`, `GET /orders`, `GET /orders/{id}` | Create and view orders | Logged in (users see only their own) |
| `GET /approvals/pending` | Orders waiting for approval | Manager |
| `POST /approvals/{id}/approve`, `POST /approvals/{id}/reject` | Decide an order | Manager |
| `GET /dashboard` | Sales, order, approval and inventory summary | Logged in |

---

## Notes and assumptions

- **Role selection on the register form is open on purpose**, so the workflow can be tested without a seeded admin. In a real system, managers would be created by an admin.
- Products and customers cannot be deleted, so order history always stays intact.
- An order needs approval when its total is **strictly above** the threshold.


