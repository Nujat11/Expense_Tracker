from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut
from controllers import expense_controller, wallet_controller
from database import db
import auth

router = APIRouter(tags=["expenses"])

@router.post("/expenses", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED, summary="Create a new expense or income record")
def create_expense(expense: ExpenseCreate, current_user: dict = Depends(auth.get_current_user)):
    """
    Create a new transaction (Expense or Income) for a user.
    """
    if expense.user_id != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create expense for another user")
    
    # Wallet integrity check
    if expense.wallet not in ["Main Wallet", "Savings Wallet"]:
        existing_wallet = wallet_controller.get_wallet_by_name(user_id=expense.user_id, wallet_name=expense.wallet)
        if not existing_wallet:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Wallet '{expense.wallet}' does not exist for this user")
            
    return expense_controller.create_expense(expense=expense)

@router.get("/expenses/{user_id}", response_model=List[ExpenseOut], summary="Retrieve all transactions for a specific user")
def read_user_expenses(user_id: int, current_user: dict = Depends(auth.get_current_user)):
    """
    Fetch all expense and income records belonging to a user ID.
    """
    if user_id != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view these expenses")
    return expense_controller.get_expenses_by_user(user_id=user_id)

@router.put("/expenses/{expense_id}", response_model=ExpenseOut, summary="Update an existing transaction")
def update_expense(expense_id: int, expense: ExpenseUpdate, current_user: dict = Depends(auth.get_current_user)):
    """
    Update details of a transaction by its expense ID.
    """
    db_expense = db["expenses"].find_one({"id": expense_id})
    if not db_expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
        
    if db_expense["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this expense")
        
    # Wallet integrity check if updating wallet
    if expense.wallet is not None and expense.wallet not in ["Main Wallet", "Savings Wallet"]:
        existing_wallet = wallet_controller.get_wallet_by_name(user_id=current_user["id"], wallet_name=expense.wallet)
        if not existing_wallet:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Wallet '{expense.wallet}' does not exist for this user")

    updated_expense = expense_controller.update_expense(expense_id, expense)
    if not updated_expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return updated_expense

@router.delete("/expenses/{expense_id}", summary="Delete a transaction")
def delete_expense(expense_id: int, current_user: dict = Depends(auth.get_current_user)):
    """
    Remove a transaction record from the database by its ID.
    """
    db_expense = db["expenses"].find_one({"id": expense_id})
    if not db_expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
        
    if db_expense["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this expense")
        
    deleted = expense_controller.delete_expense(expense_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return {"detail": "Expense deleted successfully"}

