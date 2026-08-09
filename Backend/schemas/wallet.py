from pydantic import BaseModel
from typing import Optional

class WalletBase(BaseModel):
    user_id: int
    wallet: str

class WalletCreate(WalletBase):
    pass

class WalletOut(WalletBase):
    id: int

    class Config:
        from_attributes = True
