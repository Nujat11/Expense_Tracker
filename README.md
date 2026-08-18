# Personal Expense Tracker 🚀

A modern, full-stack web application to help individuals track daily income and expenses. Built with a premium **Glassmorphism UI** on the frontend and a scalable, secure **MVC-structured Python backend** backed by a cloud **MongoDB Atlas** database.

---

## 🔗 Live Links
- **Frontend (Netlify):** [https://personelexpensetracker.netlify.app/](https://personelexpensetracker.netlify.app/)
- **Backend API (Render):** [https://web-development-project-shzj.onrender.com](https://web-development-project-shzj.onrender.com)
- **API Documentation:** [https://web-development-project-shzj.onrender.com/docs](https://web-development-project-shzj.onrender.com/docs)

---

## 🎨 Features
- **Secure JWT Authentication & Route Guards** — Register & Login with `bcrypt` password hashing. Server-side endpoint protection using signed JWT tokens. Email casing normalization (lowercase transformation) and password length rules are enforced.
- **Auto Session Expiry Handling** — Axios request interceptors automatically inject Bearer tokens, and response interceptors intercept `401 Unauthorized` errors to safely log users out.
- **Dynamic Glassmorphism UI** — Premium layered gradients and blur effects built with React & CSS.
- **Full Expense CRUD** — Add, Edit, and Delete income/expense transactions with instant UI feedback and ownership verification.
- **Persisted Budgets** — Budgets are persisted server-side in MongoDB, ensuring your financial limits are retained across devices and sessions.
- **Dashboard Analytics** — Total balance, income & expense summaries with a Recharts Pie Chart for category-wise spending visualization.
- **Wallet Management & Integrity** — Create and delete multiple wallets, backed by case-insensitive name uniqueness checks and cascading deletes.
- **MongoDB NoSQL Storage** — Production-ready cloud document store via PyMongo + MongoDB Atlas. Atomic sequential IDs maintain full frontend compatibility.

---

## 🛠️ Technology Stack
| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, React Router | SPA framework |
| **Visualization** | Recharts | Pie chart analytics |
| **Backend** | Python 3.10+, FastAPI | REST API server |
| **Server** | Gunicorn + Uvicorn | WSGI/ASGI production server |
| **Database** | MongoDB Atlas (PyMongo) | NoSQL cloud database |
| **Auth & Security** | PyJWT, passlib + bcrypt | JWT creation, verification & hashing |
| **Validation** | Pydantic v2 (email-validator) | Schema constraint enforcement |
| **Testing** | pytest, httpx | Automated integration testing |
| **Frontend Host** | Netlify | Auto-deploy from GitHub |
| **Backend Host** | Render | Auto-deploy from GitHub |

---

## 🚀 Deployment Config
- **Backend:** `render.yaml` blueprint configured for Render auto-deploy. Set `MONGO_URI` and `JWT_SECRET` environment variables in Render dashboard.
- **Frontend:** `netlify.toml` configured for Vite build from `Frontend/` directory with SPA redirect rules.
- **CORS:** Explicit CORS configuration in `main.py` allowing local ports (`localhost:5173`) and dynamic domains via `ALLOWED_ORIGINS` env var (prevents invalid credential-wildcard pairing).

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running locally (`mongod`) **OR** a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) URI

### Step 1: Configure Backend Environment
```bash
cd Backend
cp .env.example .env
# Edit .env — set your variables:
# MONGO_URI=mongodb+srv://...
# JWT_SECRET=your-secure-secret-key
```

### Step 2: Start the Backend
```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Step 3: Run Automated Tests
```bash
cd Backend
python -m pytest tests/
```

### Step 4: Start the Frontend
```bash
cd Frontend
npm install
npm run dev
```

---

## 📁 Repository Structure

```
├── Backend/                        # Python FastAPI Application (MVC)
│   ├── controllers/                # Business Logic — MongoDB CRUD operations
│   │   ├── expense_controller.py   # Expense CRUD via PyMongo
│   │   ├── user_controller.py      # User auth & budget management
│   │   └── wallet_controller.py    # Wallet management & cascading deletes
│   ├── routes/                     # HTTP Route Definitions (JWT guarded)
│   │   ├── expense_routes.py       # /expenses endpoints
│   │   ├── user_routes.py          # /register, /login, /users/me/budget endpoints
│   │   └── wallet_routes.py        # /wallets endpoints
│   ├── schemas/                    # Pydantic Request/Response Models
│   ├── tests/                      # Automated test suite (pytest)
│   │   ├── conftest.py             # Test db setup & client fixtures
│   │   ├── test_auth.py            # Auth & budget unit/integration tests
│   │   └── test_expenses.py        # Expense & wallet security tests
│   ├── auth.py                     # JWT token signing & get_current_user dependency
│   ├── database.py                 # PyMongo client & atomic ID sequence generator
│   ├── main.py                     # FastAPI app root, CORS, router loading
│   ├── .env.example                # Environment variable template
│   └── requirements.txt            # Python dependencies
│
├── Frontend/                       # Vite + React 18 Application
│   ├── src/
│   │   ├── components/             # Reusable UI Components
│   │   │   ├── ExpenseChart.jsx    # Recharts Pie Chart visualization
│   │   │   ├── ExpenseModal.jsx    # Add/Edit transaction modal
│   │   │   └── Navbar.jsx          # Navigation bar
│   │   ├── pages/                  # Full Page Components
│   │   │   ├── Dashboard.jsx       # Main analytics dashboard & budget manager
│   │   │   ├── Login.jsx           # Login page
│   │   │   └── Register.jsx        # Registration page
│   │   ├── api.js                  # Axios instance with JWT interceptors
│   │   ├── dataService.js          # Dual-mode service (API / local storage)
│   │   └── index.css               # Premium Glassmorphism design system
│
├── render.yaml                     # Render Backend deployment blueprint
├── netlify.toml                    # Netlify Frontend deployment config
└── README.md                       # This file
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/register` | Create a new user account | None |
| `POST` | `/login` | Authenticate, sign, and return a JWT access token | None |
| `PUT` | `/users/me/budget` | Update authenticated user's budget limit | JWT Bearer |
| `POST` | `/expenses` | Create a new transaction | JWT Bearer |
| `GET` | `/expenses/{user_id}` | Get all transactions for the authenticated user | JWT Bearer |
| `PUT` | `/expenses/{expense_id}` | Update a specific owned transaction | JWT Bearer |
| `DELETE` | `/expenses/{expense_id}` | Delete a specific owned transaction | JWT Bearer |
| `POST` | `/wallets` | Create a new wallet | JWT Bearer |
| `GET` | `/wallets/{user_id}` | Get wallets for a user | JWT Bearer |
| `DELETE` | `/wallets/{user_id}/{wallet_name}` | Delete a wallet and its transactions | JWT Bearer |

Full interactive documentation is available at `/docs` (Swagger UI).

---
Developed by **Nujat11** 💻
