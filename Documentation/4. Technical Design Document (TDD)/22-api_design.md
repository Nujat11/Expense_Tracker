# 22 - API Design (REST Endpoints)

All API requests and responses will be in **JSON** format.

## Auth Endpoints
| Method | Endpoint | Description |
|---|---|---|
| **POST** | `/register` | Create a new user account. Returns user details. |
| **POST** | `/login` | Verify credentials. Returns user session details (No JWT token, session is persisted on client side). |

## Expense Endpoints
| Method | Endpoint | Description |
|---|---|---|
| **POST** | `/expenses` | Create a new transaction record. |
| **GET** | `/expenses/{user_id}` | Get all transaction records belonging to a user ID. |
| **PUT** | `/expenses/{expense_id}`| Update details of a specific transaction by its ID. |
| **DELETE** | `/expenses/{expense_id}`| Delete a transaction by its ID. |

## Dashboard & Analytics
There are no dedicated backend endpoints for dashboard summary metrics or chart calculations. The Frontend React dashboard retrieves all transaction data via `GET /expenses/{user_id}` and calculates totals, balances, and category breakdowns dynamically in client-side memory.
