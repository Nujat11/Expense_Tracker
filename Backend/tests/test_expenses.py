import pytest

def test_expense_route_protection(client):
    # Try fetching expenses without auth token (should return 401)
    res = client.get("/expenses/1")
    assert res.status_code == 401

    # Try creating an expense without auth token (should return 401)
    res_post = client.post("/expenses", json={
        "user_id": 1,
        "title": "Unauthenticated Expense",
        "amount": 100.0,
        "category": "Food",
        "type": "Expense",
        "date": "2026-08-18",
        "wallet": "Main Wallet"
    })
    assert res_post.status_code == 401

def test_expense_ownership_enforcement(client):
    # Register two separate users
    u1 = client.post("/register", json={"name": "User One", "email": "u1@example.com", "password": "password123"}).json()
    u2 = client.post("/register", json={"name": "User Two", "email": "u2@example.com", "password": "password123"}).json()

    # Log in as User One
    u1_login = client.post("/login", json={"email": "u1@example.com", "password": "password123"}).json()
    token1 = u1_login["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Log in as User Two
    u2_login = client.post("/login", json={"email": "u2@example.com", "password": "password123"}).json()
    token2 = u2_login["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # User One tries to read User Two's expenses (should return 403)
    res = client.get(f"/expenses/{u2_login['id']}", headers=headers1)
    assert res.status_code == 403

    # User One tries to create an expense for User Two (should return 403)
    res_post = client.post("/expenses", json={
        "user_id": u2_login['id'],
        "title": "Spoofed Expense",
        "amount": 10.0,
        "category": "Food",
        "type": "Expense",
        "date": "2026-08-18"
    }, headers=headers1)
    assert res_post.status_code == 403

    # User One creates their own expense
    res_create = client.post("/expenses", json={
        "user_id": u1_login['id'],
        "title": "My Expense",
        "amount": 50.0,
        "category": "Food",
        "type": "Expense",
        "date": "2026-08-18"
    }, headers=headers1).json()
    expense_id = res_create["id"]

    # User Two tries to update User One's expense (should return 403)
    res_update = client.put(f"/expenses/{expense_id}", json={
        "title": "Stolen update",
        "amount": 20.0
    }, headers=headers2)
    assert res_update.status_code == 403

    # User Two tries to delete User One's expense (should return 403)
    res_delete = client.delete(f"/expenses/{expense_id}", headers=headers2)
    assert res_delete.status_code == 403

def test_expense_schema_validation(client):
    # Log in User One
    u1_login = client.post("/login", json={"email": "u1@example.com", "password": "password123"}).json()
    token1 = u1_login["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Negative amount (should return 422)
    res1 = client.post("/expenses", json={
        "user_id": u1_login['id'],
        "title": "Negative Amount",
        "amount": -5.0,
        "category": "Food",
        "type": "Expense",
        "date": "2026-08-18"
    }, headers=headers1)
    assert res1.status_code == 422

    # Zero amount (should return 422)
    res2 = client.post("/expenses", json={
        "user_id": u1_login['id'],
        "title": "Zero Amount",
        "amount": 0.0,
        "category": "Food",
        "type": "Expense",
        "date": "2026-08-18"
    }, headers=headers1)
    assert res2.status_code == 422

    # Invalid transaction type (should return 422)
    res3 = client.post("/expenses", json={
        "user_id": u1_login['id'],
        "title": "Invalid Type",
        "amount": 10.0,
        "category": "Food",
        "type": "NotIncomeOrExpense",
        "date": "2026-08-18"
    }, headers=headers1)
    assert res3.status_code == 422

def test_wallet_checks_and_integrity(client):
    # Log in User One
    u1_login = client.post("/login", json={"email": "u1@example.com", "password": "password123"}).json()
    token1 = u1_login["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Try creating custom expense in a wallet that doesn't exist (should return 400)
    res = client.post("/expenses", json={
        "user_id": u1_login['id'],
        "title": "Tech Purchase",
        "amount": 500.0,
        "category": "Entertainment",
        "type": "Expense",
        "date": "2026-08-18",
        "wallet": "Gaming Wallet"
    }, headers=headers1)
    assert res.status_code == 400
    assert "does not exist" in res.json()["detail"]

    # Try creating a wallet with a system default name (should fail with 400)
    res_sys_wallet = client.post("/wallets", json={
        "user_id": u1_login['id'],
        "wallet": "main wallet"
    }, headers=headers1)
    assert res_sys_wallet.status_code == 400

    # Create the custom wallet
    wallet_res = client.post("/wallets", json={
        "user_id": u1_login['id'],
        "wallet": "Gaming Wallet"
    }, headers=headers1)
    assert wallet_res.status_code == 201

    # Try creating it again (case-insensitively, e.g. "gaming wallet") -> should fail with 400
    wallet_res_dup = client.post("/wallets", json={
        "user_id": u1_login['id'],
        "wallet": "gaming wallet"
    }, headers=headers1)
    assert wallet_res_dup.status_code == 400
    assert wallet_res_dup.json()["detail"] == "Wallet already exists"

    # Now create the expense in the newly created custom wallet -> should succeed
    res_ok = client.post("/expenses", json={
        "user_id": u1_login['id'],
        "title": "Tech Purchase",
        "amount": 500.0,
        "category": "Entertainment",
        "type": "Expense",
        "date": "2026-08-18",
        "wallet": "Gaming Wallet"
    }, headers=headers1)
    assert res_ok.status_code == 201
