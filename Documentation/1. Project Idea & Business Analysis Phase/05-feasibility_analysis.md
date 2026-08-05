# Personal Expense Tracker - Feasibility Analysis

## 1. Technical Feasibility
*   **Frontend Tools:** React 18 + Vite — well-documented, widely used, easy to build SPAs.
*   **Backend Tools:** Python FastAPI + Gunicorn — high-performance async API framework ideal for CRUD-based REST APIs.
*   **Database:** MongoDB Atlas — free cloud NoSQL tier, no server setup needed, flexible JSON document storage.
*   **Hosting:** Netlify (Frontend) and Render (Backend) — both offer free tiers with GitHub auto-deploy.
*   **Conclusion:** Technically feasible and fully implemented with all core features working in production.

## 2. Economic Feasibility
*   **Software Cost:** $0. Every tool used is open-source and free.
*   **Hardware Cost:** $0. Development done on personal laptop.
*   **Hosting Cost:** $0. Netlify (free tier) and Render (free tier) used for deployment.
*   **Database Cost:** $0. MongoDB Atlas M0 (512 MB free cluster) used.

## 3. Schedule Feasibility
*   **Week 1:** Setup, Planning & Documentation (**Done ✅**).
*   **Week 2-3:** Build the Backend API with FastAPI (**Done ✅**).
*   **Week 4-5:** Build the Frontend UI with React (**Done ✅**).
*   **Week 6:** MongoDB migration, testing, deployment (**Done ✅**).
*   **Conclusion:** Project completed on schedule and deployed live.

## 4. Risks and Solutions
*   **Risk:** Running out of time. *Solution:* Focused on core CRUD features first, then added charts.
*   **Risk:** Database complexity. *Solution:* Migrated from SQLite → JSON file store → MongoDB Atlas progressively.
*   **Risk:** Data privacy. *Solution:* bcrypt password hashing on every user account; `.env` secrets excluded from git.
*   **Risk:** Deployment cold starts. *Solution:* 60-second axios timeout configured on frontend to handle Render free tier spin-up delays.
