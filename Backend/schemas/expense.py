from pydantic import BaseModel, Field
from datetime import date
from typing import Optional, Literal

class ExpenseBase(BaseModel):
    title: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1)
    type: Literal["Income", "Expense"]
    date: date
    wallet: str = 'Main Wallet'

class ExpenseCreate(ExpenseBase):
    user_id: int

class ExpenseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1)
    type: Optional[Literal["Income", "Expense"]] = None
    date: Optional[date] = None
    wallet: Optional[str] = None

class ExpenseOut(ExpenseBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True
