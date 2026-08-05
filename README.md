# Personal Expense Tracker 🚀

A modern, full-stack web application designed to help you strictly track your finances. Built with an incredibly premium **Glassmorphism UI** on the frontend and an enterprise-level **Model-View-Controller (MVC)** robust Python backend.

---

## 🔗 Live Links
- **Frontend (Netlify):** [https://personelexpensetracker.netlify.app/](https://personelexpensetracker.netlify.app/)
- **Backend API (Render):** [https://web-development-project-shzj.onrender.com](https://web-development-project-shzj.onrender.com)
- **API Documentation:** [https://web-development-project-shzj.onrender.com/docs](https://web-development-project-shzj.onrender.com/docs)

---

## 🎨 Features
- **Secure User Authentication**: Complete Register & Login flow with strongly encrypted local password hashing (`bcrypt`). Route protected UI.
- **Dynamic Glassmorphism UI**: Beautiful, layered gradients and blurred panes constructed natively with React & CSS.
- **Full Expense CRUD functionality**: Easily Add, Edit, or Delete financial transactions cleanly tracked inside your own private namespace.
- **Data Dashboards & Charts**: Visualize your total balance, aggregated incomes, and spending summaries inside an elegant Recharts pie chart.
- **MongoDB NoSQL Storage**: Production-ready document-based database storage using PyMongo, with atomic sequential IDs for full frontend compatibility.

## 🛠️ Technology Stack
- **Frontend Layer:** React 18, Vite, Recharts, React Router
- **Backend Infrastructure:** Python 3.10+, FastAPI, Gunicorn, PyMongo
- **Database:** MongoDB (local or MongoDB Atlas)
- **Deployment:** Render (Backend), Netlify (Frontend)
- **Design Pattern:** Strict Backend MVC implementation

---

## 🚀 Deployment Config
The project is configured for automated deployment:
- **Backend:** Uses a `render.yaml` blueprint for one-click deployment on Render. Set `MONGO_URI` environment variable in Render dashboard.
- **Frontend:** Connected to GitHub for automated builds on Netlify.
- **CORS:** Configured to allow secure cross-origin requests between the Render API and Netlify UI.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running locally (`mongod`) **OR** a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI

### Step 1: Configure Backend Environment
```bash
cd Backend
cp .env.example .env
# Edit .env and set your MONGO_URI:
# MONGO_URI=mongodb://localhost:27017/      ← for local MongoDB
# MONGO_URI=mongodb+srv://...              ← for MongoDB Atlas
```

### Step 2: Start the Backend (API Server)
```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Step 3: Start the Frontend (User Interface)
```bash
cd Frontend
npm install
npm run dev
```

---

## 📁 Repository Structure

```
├── Backend/                 # Python FastAPI Application
│   ├── controllers/         # Business Logic (MongoDB CRUD)
│   ├── routes/              # Client-Facing Endpoint URLs
│   ├── schemas/             # Pydantic Typing Validation
│   ├── database.py          # PyMongo Client & Sequence Generator
│   ├── .env.example         # Environment variable template
│   └── main.py              # Root Application & CORS
│
├── Frontend/                # Vite + React Interface
│   ├── src/
│   │   ├── components/      # Modular UI Parts
│   │   ├── pages/           # High Level Routes
│   │   ├── api.js           # Central Axios Backend Binding
│   │   ├── dataService.js   # Dual-mode data service (API / mock)
│   │   └── index.css        # Premium Glassmorphism Design
│
├── render.yaml              # Render Deployment Blueprint
├── netlify.toml             # Netlify Deployment Config
└── Documentation/           # PRD, SRS, TDD, ERD, API Design
```

---
Developed by **Nujat11** 💻
