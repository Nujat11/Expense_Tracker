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
    user = db["users"].find_one({"email": email})
    return user

def create_user(user: UserCreate):
    hashed_password = get_password_hash(user.password)
    user_id = get_next_sequence_value("user_id")
    user_dict = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }
    db["users"].insert_one(user_dict)
    return user_dict
