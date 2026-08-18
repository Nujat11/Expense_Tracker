from fastapi import APIRouter, HTTPException, Depends, status
from schemas.user import UserCreate, UserOut, UserLogin, UserBudgetUpdate
from controllers import user_controller
import auth

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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    # Generate access token
    access_token = auth.create_access_token(data={"user_id": db_user["id"]})
    db_user["access_token"] = access_token
    db_user["token_type"] = "bearer"
    return db_user

@router.put("/users/me/budget", response_model=UserOut)
def update_budget(budget_data: UserBudgetUpdate, current_user: dict = Depends(auth.get_current_user)):
    updated_user = user_controller.update_user_budget(current_user["id"], budget_data.budget_limit)
    return updated_user

