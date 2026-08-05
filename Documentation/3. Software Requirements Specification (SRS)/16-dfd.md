# 16 - Data Flow Diagram (DFD)

This diagram shows how data flows through the **Personal Expense Tracker** system.

```mermaid
graph TD
    User((User)) -- 1. Credentials --> Auth[Authentication Service]
    Auth -- 2. User Session Info --> User
    User -- 3. Expense Data --> Backend[FastAPI Server]
<<<<<<< HEAD
    Backend -- 4. Save Record --> DB[(MongoDB NoSQL Database)]
=======
    Backend -- 4. Save Record --> DB[(JSON File Storage)]
>>>>>>> main
    DB -- 5. Transaction History --> Backend
    Backend -- 6. Transaction Data --> User
    User -- 7. Client-side Chart & Balance calculation --> User
```

### Flow Explanation:
1. **User Auth:** User provides login info; system verifies credentials and returns user details for local session persistence.
2. **Transaction Entry:** User sends expense details (Amount, Category).
<<<<<<< HEAD
3. **Data Storage:** Backend controller saves the data into the MongoDB database.
4. **Data Retrieval:** Backend retrieves user transaction history from MongoDB records.
=======
3. **Data Storage:** Backend controller saves the data into the `data.json` database file.
4. **Data Retrieval:** Backend retrieves user transaction history from `data.json` records.
>>>>>>> main
5. **UI Update & Calculation:** React Frontend calculates the current balance, aggregates category percentages, renders the Recharts Pie Chart, and updates the user's dashboard.
