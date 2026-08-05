# Personal Expense Tracker 🚀

A modern, full-stack web application to help individuals track daily income and expenses. Built with a premium **Glassmorphism UI** on the frontend and a scalable **MVC-structured Python backend** backed by a cloud **MongoDB Atlas** database.

---

## 🔗 Live Links
- **Frontend (Netlify):** [https://personelexpensetracker.netlify.app/](https://personelexpensetracker.netlify.app/)
- **Backend API (Render):** [https://web-development-project-shzj.onrender.com](https://web-development-project-shzj.onrender.com)
- **API Documentation:** [https://web-development-project-shzj.onrender.com/docs](https://web-development-project-shzj.onrender.com/docs)

---

## 🎨 Features
- **Secure User Authentication** — Register & Login with `bcrypt` hashed passwords. Route-protected UI with `localStorage` session persistence.
- **Dynamic Glassmorphism UI** — Premium layered gradients and blur effects built with React & CSS.
- **Full Expense CRUD** — Add, Edit, and Delete income/expense transactions with instant UI feedback.
- **Dashboard Analytics** — Total balance, income & expense summaries with a Recharts Pie Chart for category-wise spending visualization.
- **Budget Tracking** — Category budget progress bars to monitor spending limits.
- **MongoDB NoSQL Storage** — Production-ready cloud document store via PyMongo + MongoDB Atlas. Atomic sequential IDs maintain full frontend compatibility.

---

## 🛠️ Technology Stack
| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, React Router | SPA framework |
| **Visualization** | Recharts | Pie chart analytics |
| **Backend** | Python 3.10+, FastAPI | REST API server |
| **Server** | Gunicorn + Uvicorn | WSGI/ASGI production server |
| **Database** | MongoDB Atlas (PyMongo) | NoSQL cloud document store |
| **Auth** | passlib + bcrypt | Password hashing |
| **Frontend Host** | Netlify | Auto-deploy from GitHub |
| **Backend Host** | Render | Auto-deploy from GitHub |

---

## 🚀 Deployment Config
- **Backend:** `render.yaml` blueprint configured for Render auto-deploy. Set `MONGO_URI` environment variable in Render dashboard to connect MongoDB Atlas.
- **Frontend:** `netlify.toml` configured for Vite build from `Frontend/` directory with SPA redirect rules.
- **CORS:** Configured to allow all origins for seamless cross-platform API access.

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
# Edit .env — set your MONGO_URI:
# Local:  MONGO_URI=mongodb://localhost:27017/
# Atlas:  MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/expense_tracker
```

### Step 2: Start the Backend
```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Step 3: Start the Frontend
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
│   │   └── user_controller.py      # User auth via PyMongo + bcrypt
│   ├── routes/                     # HTTP Route Definitions
│   │   ├── expense_routes.py       # /expenses endpoints
│   │   └── user_routes.py          # /register, /login endpoints
│   ├── schemas/                    # Pydantic Request/Response Models
│   ├── database.py                 # PyMongo client & atomic ID sequence generator
│   ├── main.py                     # FastAPI app root, CORS, dotenv loader
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
│   │   │   ├── Dashboard.jsx       # Main analytics dashboard
│   │   │   ├── Login.jsx           # Login page
│   │   │   └── Register.jsx        # Registration page
│   │   ├── api.js                  # Axios instance with backend URL config
│   │   ├── dataService.js          # Dual-mode service (API / mock)
│   │   └── index.css               # Premium Glassmorphism design system
│
├── Documentation/                  # Full project documentation
│   ├── 1. Project Idea & Business Analysis Phase/
│   ├── 2. Product Requirement Document/
│   ├── 3. Software Requirements Specification (SRS)/
│   └── 4. Technical Design Document (TDD)/
│
├── render.yaml                     # Render Backend deployment blueprint
├── netlify.toml                    # Netlify Frontend deployment config
└── README.md                       # This file
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Create a new user account |
| `POST` | `/login` | Authenticate and return user session |
| `POST` | `/expenses` | Create a new transaction |
| `GET` | `/expenses/{user_id}` | Get all transactions for a user |
| `PUT` | `/expenses/{expense_id}` | Update a specific transaction |
| `DELETE` | `/expenses/{expense_id}` | Delete a specific transaction |

Full interactive docs available at `/docs` (Swagger UI).

---
Developed by **Nujat11** 💻
