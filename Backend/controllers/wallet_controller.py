from database import db, get_next_sequence_value
from schemas.wallet import WalletCreate

def get_wallets_by_user(user_id: int):
    wallets = list(db["wallets"].find({"user_id": user_id}, {"_id": 0}))
    return wallets

def create_wallet(wallet: WalletCreate):
    wallet_id = get_next_sequence_value("wallet_id")
    wallet_dict = {
        "id": wallet_id,
        **wallet.model_dump(mode="json")
    }
    db["wallets"].insert_one(wallet_dict)
    wallet_dict.pop("_id", None)
    return wallet_dict

def get_wallet_by_name(user_id: int, wallet_name: str):
    import re
    return db["wallets"].find_one({
        "user_id": user_id,
        "wallet": {"$regex": f"^{re.escape(wallet_name)}$", "$options": "i"}
    }, {"_id": 0})

def delete_wallet(user_id: int, wallet_name: str):
    if wallet_name.lower() == 'main wallet':
        return False
    wallet = get_wallet_by_name(user_id, wallet_name)
    if not wallet:
        return False
    # Use the exact casing stored in database
    actual_name = wallet["wallet"]
    result = db["wallets"].delete_one({"user_id": user_id, "wallet": actual_name})
    if result.deleted_count > 0:
        db["expenses"].delete_many({"user_id": user_id, "wallet": actual_name})
        return True
    return False

