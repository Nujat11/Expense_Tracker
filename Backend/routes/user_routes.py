from fastapi import APIRouter, HTTPException
from schemas.user import UserCreate, UserOut, UserLogin
from controllers import user_controller

router = APIRouter(tags=["users"])

@router.post("/register", response_model=UserOut)
def register(user: UserCreate):
    db_user = user_controller.get_user_by_email(email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_controller.create_user(user=user)

@router.post("/login", response_model=UserOut)
def login(user: UserLogin):
    db_user = user_controller.get_user_by_email(email=user.email)
    if not db_user or not user_controller.verify_password(user.password, db_user.get("password", "")):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    return db_user
