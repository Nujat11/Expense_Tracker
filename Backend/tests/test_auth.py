import pytest

def test_register_and_login_success(client):
    # Test mixed-case email registration
    reg_data = {
        "name": "Test User",
        "email": "Test.User@Example.Com",
        "password": "strongpassword123"
    }
    response = client.post("/register", json=reg_data)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["email"] == "test.user@example.com"  # Must be automatically lowercased
    assert res_json["name"] == "Test User"
    assert "password" not in res_json

    # Test login with lowercase email
    login_data = {
        "email": "test.user@example.com",
        "password": "strongpassword123"
    }
    login_response = client.post("/login", json=login_data)
    assert login_response.status_code == 200
    login_res = login_response.json()
    assert "access_token" in login_res
    assert login_res["token_type"] == "bearer"
    assert login_res["budget_limit"] == 2000.0

def test_login_failed_unauthorized(client):
    login_data = {
        "email": "test.user@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/login", json=login_data)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"

def test_register_invalid_inputs(client):
    # Password too short (less than 6 chars)
    reg_data = {
        "name": "Short Pass User",
        "email": "shortpass@example.com",
        "password": "123"
    }
    response = client.post("/register", json=reg_data)
    assert response.status_code == 422

    # Invalid email syntax
    reg_data_2 = {
        "name": "Bad Email User",
        "email": "not-an-email",
        "password": "validpassword123"
    }
    response2 = client.post("/register", json=reg_data_2)
    assert response2.status_code == 422

def test_update_budget_limit(client):
    login_data = {
        "email": "test.user@example.com",
        "password": "strongpassword123"
    }
    login_res = client.post("/login", json=login_data).json()
    token = login_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update budget limit to 1500
    update_res = client.put("/users/me/budget", json={"budget_limit": 1500.0}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["budget_limit"] == 1500.0

    # Test update with invalid negative budget limit (should fail validation)
    update_res_neg = client.put("/users/me/budget", json={"budget_limit": -10.0}, headers=headers)
    assert update_res_neg.status_code == 422
