# 20 - Technical Design Document (TDD)

## 1. Introduction
This document provides the technical roadmap for building the **Personal Expense Tracker**. It covers the architecture, data models, and API definitions.

## 2. Technology Choices
- **Frontend Stack:** React, CSS, Recharts (for visualization).
- **Backend Stack:** Python, FastAPI, PyMongo (NoSQL client).
- **Database:** MongoDB (NoSQL Database).
- **Hosting:** Netlify (Frontend) and Render (Backend).

## 3. Design Principles
- **Clean API:** Strictly RESTful endpoints with consistent JSON responses.
- **Security First:** No plain-text passwords; use password hashing (bcrypt).
- **Responsiveness:** Mobile-first design for logging on the go.

## 4. Technical References
| Document | Description |
|---|---|
| [18-ERD](18-erd.md) | Database relationship schema. |
| [19-System Design](19-system-design.md) | High-level architecture diagram. |
| [21-Database Design](21-database-design.md) | Detailed table schemas. |
| [22-API Design](22-api-design.md) | List of API endpoints. |
