from dotenv import load_dotenv
import os
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

load_dotenv(os.path.join(backend_dir, ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import user_routes, expense_routes, wallet_routes


app = FastAPI(
    title="Personal Expense Tracker API",
    description="Backend API for managing personal expenses, budgets, and transactions.",
    version="1.0.0"
)

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    allowed_origins.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_routes.router)
app.include_router(expense_routes.router)
app.include_router(wallet_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Personal Expense Tracker API. Visit /docs for the API documentation."}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
