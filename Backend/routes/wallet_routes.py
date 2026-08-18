from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from schemas.wallet import WalletCreate, WalletOut
from controllers import wallet_controller
import auth

router = APIRouter(tags=["wallets"])

@router.post("/wallets", response_model=WalletOut, status_code=status.HTTP_201_CREATED, summary="Create a new wallet")
def create_wallet(wallet: WalletCreate, current_user: dict = Depends(auth.get_current_user)):
    if wallet.user_id != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create wallet for another user")
        
    if wallet.wallet.lower() in ["main wallet", "savings wallet"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot create system default wallets")
        
    existing = wallet_controller.get_wallet_by_name(wallet.user_id, wallet.wallet)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet already exists")
    return wallet_controller.create_wallet(wallet=wallet)

@router.get("/wallets/{user_id}", response_model=List[WalletOut], summary="Get wallets for a user")
def get_wallets(user_id: int, current_user: dict = Depends(auth.get_current_user)):
    if user_id != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view these wallets")
    return wallet_controller.get_wallets_by_user(user_id=user_id)

@router.delete("/wallets/{user_id}/{wallet_name}", summary="Delete a wallet and its transactions")
def delete_wallet(user_id: int, wallet_name: str, current_user: dict = Depends(auth.get_current_user)):
    if user_id != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this wallet")
        
    # Delegate deletion to controller. Controller prevents deleting 'Main Wallet'.
    deleted = wallet_controller.delete_wallet(user_id=user_id, wallet_name=wallet_name)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to delete wallet (may be protected or not found)")
    return {"detail": "Wallet deleted"}

