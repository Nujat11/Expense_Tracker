from pydantic import BaseModel
from datetime import date
from typing import Optional

class ExpenseBase(BaseModel):
    title: str
    amount: float
    category: str
    type: str
    date: date
    wallet: str = 'Main Wallet'

class ExpenseCreate(ExpenseBase):
    user_id: int

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    type: Optional[str] = None
    date: Optional[date] = None
    wallet: Optional[str] = None

class ExpenseOut(ExpenseBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True
