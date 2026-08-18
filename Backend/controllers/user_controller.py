import bcrypt
from database import db, get_next_sequence_value
from schemas.user import UserCreate

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    pwd_bytes = password.encode('utf-8')
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_user_by_email(email: str):
    return db["users"].find_one({"email": email.lower()})

def create_user(user: UserCreate):
    hashed_password = get_password_hash(user.password)
    user_id = get_next_sequence_value("user_id")
    user_dict = {
        "id": user_id,
        "name": user.name,
        "email": user.email.lower(),
        "password": hashed_password,
        "budget_limit": 2000.0
    }
    db["users"].insert_one(user_dict)
    
    # Seed default wallets for the user
    db["wallets"].insert_many([
        {"id": get_next_sequence_value("wallet_id"), "user_id": user_id, "wallet": "Main Wallet"},
        {"id": get_next_sequence_value("wallet_id"), "user_id": user_id, "wallet": "Savings Wallet"}
    ])
    
    return user_dict

def update_user_budget(user_id: int, budget_limit: float):
    db["users"].update_one(
        {"id": user_id},
        {"$set": {"budget_limit": budget_limit}}
    )
    return db["users"].find_one({"id": user_id}, {"_id": 0})

