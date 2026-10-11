from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "operational"

def test_auth_demo_login():
    response = client.post("/api/auth/demo-login")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user_id" in data
    assert "username" in data
    token = data["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # Test dashboard metrics
    dash_resp = client.get("/api/dashboard/summary", headers=headers)
    assert dash_resp.status_code == 200
    data_summary = dash_resp.json()
    assert "metrics" in data_summary
    metrics = data_summary["metrics"]
    assert "current_cash_balance" in metrics
    assert "health_score" in metrics

    # Test simulation
    sim_resp = client.post("/api/simulations/preview", json={"action_type": "purchase", "amount": 1500, "category": "Shopping", "title": "Headphones"}, headers=headers)
    assert sim_resp.status_code == 200
    sim_data = sim_resp.json()
    assert "differences" in sim_data
    assert "before" in sim_data
    assert "after" in sim_data
