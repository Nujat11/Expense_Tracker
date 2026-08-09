from fastapi import APIRouter, HTTPException, status
from typing import List
from schemas.wallet import WalletCreate, WalletOut
from controllers import wallet_controller

router = APIRouter(tags=["wallets"])

@router.post("/wallets", response_model=WalletOut, status_code=status.HTTP_201_CREATED, summary="Create a new wallet")
def create_wallet(wallet: WalletCreate):
    existing = wallet_controller.get_wallet_by_name(wallet.user_id, wallet.wallet)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wallet already exists")
    return wallet_controller.create_wallet(wallet=wallet)

@router.get("/wallets/{user_id}", response_model=List[WalletOut], summary="Get wallets for a user")
def get_wallets(user_id: int):
    return wallet_controller.get_wallets_by_user(user_id=user_id)

@router.delete("/wallets/{user_id}/{wallet_name}", summary="Delete a wallet and its transactions")
def delete_wallet(user_id: int, wallet_name: str):
    if wallet_name == 'Main Wallet':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Main Wallet cannot be deleted")
    deleted = wallet_controller.delete_wallet(user_id=user_id, wallet_name=wallet_name)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found or cannot be deleted")
    return {"detail": "Wallet deleted successfully"}
