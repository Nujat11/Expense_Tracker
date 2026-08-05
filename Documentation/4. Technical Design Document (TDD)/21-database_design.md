# 21 - Database Design

## JSON Storage Format (`data.json`)
The application uses a local JSON file to store all records in structured arrays.

### Entity: `users`
Stores user profile information.

| Property | Type | Description / Constraints |
|---|---|---|
| `id` | Integer | Unique identifier (Auto-incremented locally) |
| `name` | String | User's full name |
| `email` | String | User's email address (Unique constraint verified in controller) |
| `password` | String | Salted & hashed password (via `bcrypt`) |

### Entity: `expenses` (Transactions)
Stores spending and income records.

| Property | Type | Description / Constraints |
|---|---|---|
| `id` | Integer | Unique identifier (Auto-incremented locally) |
| `user_id` | Integer | Links transaction to `users.id` |
| `title` | String | Title or description of the transaction |
| `amount` | Float | Transaction value (Must be non-negative) |
| `category` | String | Category label (e.g., Food, Transport, Rent, Entertainment, Salary, Other) |
| `type` | String | Transaction type (`Income` or `Expense`) |
| `date` | Date | Transaction date (Format: YYYY-MM-DD) |
