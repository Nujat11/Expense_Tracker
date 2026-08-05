# 19 - System Design (Architecture)

The **Personal Expense Tracker** follows a classic 3-tier architecture with an MVC pattern in the backend.

```mermaid
graph TD
    subgraph Client_Layer
        Web[React SPA]
    end
    subgraph Server_Layer_MVC
        Router[Routers / Controllers]
        Schema[Pydantic / Views]
        CRUD[CRUD Operations / Logic]
        PyMongo[PyMongo Client / database.py]
    end
    subgraph Data_Layer
        DB[(MongoDB Database)]
    end

    Web -- "HTTP/JSON" --> Router
    Router -- "Validates with" --> Schema
    Router -- "Calls" --> CRUD
    CRUD -- "Uses" --> PyMongo
    PyMongo -- "MongoDB driver" --> DB
```

### Components:
1. **Frontend (React):** Handles the user interface, routing, budget settings, local storage configurations, and data visualization (Recharts Pie Charts).
2. **Backend (FastAPI - MVC Pattern):** 
   - **Controllers (Routers):** Handles incoming HTTP requests and directs them to business logic controller methods.
   - **Views (Schemas):** Validates and serializes HTTP request and response structures using Pydantic schemas.
   - **CRUD / Database Logic:** Manages database persistence layer operations using PyMongo client collections and helper sequence generators.
3. **Database (MongoDB):** Stores users, expenses, and ID counter collections persistently.
4. **Authentication:** Uses hashed passwords (via `bcrypt` hashing) on registration/login and persists authenticated user details in the client browser's `localStorage` session.
