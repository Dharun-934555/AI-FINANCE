import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import Base
from app.models.models import User, BudgetPeriod, Transaction, Commitment, SavingsGoal
from app.services.financial_engine import FinancialEngine

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture
def db_session():
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_starting_budget_and_duration(db_session):
    user = User(id="test_u1", email="u1@test.com", username="tester", hashed_password="pw")
    db_session.add(user)
    bp = BudgetPeriod(user_id=user.id, start_date=date.today(), total_days=30, starting_budget=10000, emergency_reserve=1000)
    db_session.add(bp)
    db_session.commit()

    metrics = FinancialEngine.calculate_metrics(user, db_session)
    assert metrics["starting_budget"] == 10000
    assert metrics["total_days"] == 30
    assert metrics["current_cash_balance"] == 10000
    assert metrics["available_uncommitted_balance"] == 10000

def test_expense_and_income_arithmetic(db_session):
    user = User(id="test_u2", email="u2@test.com", username="tester2", hashed_password="pw")
    db_session.add(user)
    bp = BudgetPeriod(user_id=user.id, start_date=date.today(), total_days=30, starting_budget=10000)
    db_session.add(bp)
    
    # Completed expense of 500
    t1 = Transaction(user_id=user.id, description="Food", amount=500, type="expense", category="Food")
    # Received income of 1000
    t2 = Transaction(user_id=user.id, description="Freelance", amount=1000, type="income", category="Other")
    db_session.add_all([t1, t2])
    db_session.commit()

    metrics = FinancialEngine.calculate_metrics(user, db_session)
    # Cash = 10000 + 1000 - 500 = 10500
    assert metrics["current_cash_balance"] == 10500
    assert metrics["total_completed_expenses"] == 500
    assert metrics["total_received_income"] == 1000

def test_unpaid_commitments_and_savings_protection(db_session):
    user = User(id="test_u3", email="u3@test.com", username="tester3", hashed_password="pw")
    db_session.add(user)
    bp = BudgetPeriod(user_id=user.id, start_date=date.today(), total_days=30, starting_budget=10000)
    db_session.add(bp)

    # Reserved commitment ₹1200
    comm = Commitment(user_id=user.id, title="Wi-Fi", amount=1200, due_date=date.today(), is_essential=True, is_paid=False)
    # Protected savings goal ₹800
    goal = SavingsGoal(user_id=user.id, title="Laptop", target_amount=5000, current_amount=800, target_date=date.today())
    db_session.add_all([comm, goal])
    db_session.commit()

    metrics = FinancialEngine.calculate_metrics(user, db_session)
    # Cash is 10000 (no completed expense yet)
    assert metrics["current_cash_balance"] == 10000
    # Available = 10000 - 1200 - 800 = 8000
    assert metrics["available_uncommitted_balance"] == 8000
    assert metrics["unpaid_essential_commitments"] == 1200
    assert metrics["protected_savings"] == 800

def test_simulation_preview_does_not_mutate_records(db_session):
    user = User(id="test_u4", email="u4@test.com", username="tester4", hashed_password="pw")
    db_session.add(user)
    bp = BudgetPeriod(user_id=user.id, start_date=date.today(), total_days=30, starting_budget=10000)
    db_session.add(bp)
    db_session.commit()

    sim_delta = {"action_type": "purchase", "amount": 2499}
    sim_metrics = FinancialEngine.calculate_metrics(user, db_session, simulated_delta=sim_delta)
    
    assert sim_metrics["available_uncommitted_balance"] == 10000 - 2499

    # Verify actual database records remained unchanged
    tx_count = db_session.query(Transaction).filter(Transaction.user_id == user.id).count()
    assert tx_count == 0
    actual_metrics = FinancialEngine.calculate_metrics(user, db_session)
    assert actual_metrics["available_uncommitted_balance"] == 10000
