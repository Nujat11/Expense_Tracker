from database import db, get_next_sequence_value
from schemas.expense import ExpenseCreate, ExpenseUpdate

def get_expenses_by_user(user_id: int):
    # Retrieve all expenses for the user and exclude MongoDB's _id field
    expenses = list(db["expenses"].find({"user_id": user_id}, {"_id": 0}))
    return expenses

def create_expense(expense: ExpenseCreate):
    expense_id = get_next_sequence_value("expense_id")
    # Use mode="json" to serialize datetime.date into ISO string for MongoDB storage
    exp_dict = {
        "id": expense_id,
        **expense.model_dump(mode="json")
    }
    db["expenses"].insert_one(exp_dict)
    # Remove _id if present in exp_dict before returning (pymongo adds _id in-place)
    exp_dict.pop("_id", None)
    return exp_dict

def update_expense(expense_id: int, expense: ExpenseUpdate):
    update_data = expense.model_dump(mode="json", exclude_unset=True)
    if not update_data:
        return db["expenses"].find_one({"id": expense_id}, {"_id": 0})
        
    result = db["expenses"].find_one_and_update(
        {"id": expense_id},
        {"$set": update_data},
        return_document=True,
        projection={"_id": 0}
    )
    return result

def delete_expense(expense_id: int):
    result = db["expenses"].delete_one({"id": expense_id})
    return result.deleted_count > 0
