# 17 - Software Requirements Specification (SRS)

## 1. Introduction
The **Personal Expense Tracker** aims to simplify daily financial management for individuals. This document outlines the full functional and technical requirements of the system.

## 2. System Overview
The system is a web-based tool that allows users to record income/expenses, view real-time balances, and analyze spending through interactive charts.

## 3. Requirement References
| Document | Description |
|---|---|
| [13-Functional Requirements](13-functional-requirements.md) | Lists all features the system must perform. |
| [14-Non-Functional Requirements](14-non-functional-requirements.md) | Lists performance and security standards. |
| [15-Use Cases](15-use-cases.md) | Describes step-by-step user interactions. |
| [16-DFD](16-dfd.md) | Visualizes the data flow between User, Engine, and Database. |

## 4. User Classes and Characteristics
- **Standard User:** Individuals looking to track their personal spending categories (Students, Freelancers, etc.).

## 5. Operating Environment
- **Platform:** Web browsers (Chrome, Firefox, Safari).
- **Client:** Mobile-responsive web frontend.
- **Server:** Python-based FastAPI server.

## 6. Constraints
- System requires an active internet connection to save data.
- Data is stored locally on the server in a structured JSON database file (`data.json`) managed by `store.py`.
