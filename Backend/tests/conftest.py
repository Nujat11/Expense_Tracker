import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add Backend directory to sys.path to resolve imports correctly
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import database
# Override standard database with test database
database.db = database.client["expense_tracker_test"]

from main import app

@pytest.fixture(scope="session", autouse=True)
def clean_test_db():
    # Clear test database before starting session
    database.client.drop_database("expense_tracker_test")
    yield
    # Clean up after all tests finish
    database.client.drop_database("expense_tracker_test")

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
