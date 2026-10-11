from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.models import (
    User, FinancialProfile, BudgetPeriod, Transaction, Commitment,
    SavingsGoal, Subscription, UserChallenge, Notification, BudgetAllocation
)
from app.core.security import get_password_hash

DEMO_USER_ID = "demo-user-0000-0000-000000000001"
DEMO_EMAIL = "demo@rupeewise.ai"

def seed_demo_data(db: Session) -> User:
    # Check if demo user already exists
    existing = db.query(User).filter(User.id == DEMO_USER_ID).first()
    if existing:
        return existing

    # Create demo user
    user = User(
        id=DEMO_USER_ID,
        email=DEMO_EMAIL,
        username="Finora Explorer",
        hashed_password=get_password_hash("demo1234"),
        is_demo=True
    )
    db.add(user)

    # Budget Period (Day 10 of 30 days)
    today = date.today()
    start_d = today - timedelta(days=9) # so today is Day 10
    budget_period = BudgetPeriod(
        user_id=DEMO_USER_ID,
        start_date=start_d,
        total_days=30,
        starting_budget=10000,
        emergency_reserve=1000
    )
    db.add(budget_period)

    # Financial Profile
    profile = FinancialProfile(
        user_id=DEMO_USER_ID,
        hourly_rate=250, # ₹250/hr
        preferred_risk_tolerance="moderate",
        target_emergency_reserve=1500,
        notes="College student & freelancer managing monthly allowance in Bangalore."
    )
    db.add(profile)

    # Completed Transactions so far (Day 1 to 9):
    # Total spent: ₹3,850
    # Total income received: ₹1,200 (freelance graphic design)
    past_txs = [
        Transaction(user_id=DEMO_USER_ID, description="Grocery & Snacks", amount=650, type="expense", category="Food", transaction_date=start_d, payment_method="UPI", is_essential=True),
        Transaction(user_id=DEMO_USER_ID, description="Metro Card Recharge", amount=400, type="expense", category="Transport", transaction_date=start_d + timedelta(days=2), payment_method="UPI", is_essential=True),
        Transaction(user_id=DEMO_USER_ID, description="Freelance Graphic Gig", amount=1200, type="income", category="Other", transaction_date=start_d + timedelta(days=3), payment_method="UPI", is_essential=False),
        Transaction(user_id=DEMO_USER_ID, description="College Study Material & Xerox", amount=350, type="expense", category="Education", transaction_date=start_d + timedelta(days=4), payment_method="UPI", is_essential=True),
        Transaction(user_id=DEMO_USER_ID, description="Weekend Pizza with Roommates", amount=850, type="expense", category="Food", transaction_date=start_d + timedelta(days=5), payment_method="UPI", is_essential=False),
        Transaction(user_id=DEMO_USER_ID, description="Medical Store - Flu Meds", amount=320, type="expense", category="Healthcare", transaction_date=start_d + timedelta(days=6), payment_method="UPI", is_essential=True),
        Transaction(user_id=DEMO_USER_ID, description="Coffee & Bakery study session", amount=280, type="expense", category="Food", transaction_date=start_d + timedelta(days=7), payment_method="UPI", is_essential=False),
        Transaction(user_id=DEMO_USER_ID, description="Campus Cafeteria Lunches", amount=500, type="expense", category="Food", transaction_date=start_d + timedelta(days=8), payment_method="UPI", is_essential=True),
        Transaction(user_id=DEMO_USER_ID, description="Auto Rickshaw rides", amount=500, type="expense", category="Transport", transaction_date=start_d + timedelta(days=9), payment_method="UPI", is_essential=False),
    ]
    for tx in past_txs:
        db.add(tx)

    # Upcoming Commitments (Reserved)
    commitments = [
        Commitment(user_id=DEMO_USER_ID, title="Wi-Fi Broadband Bill", amount=699, due_date=today + timedelta(days=5), category="Bills", is_essential=True, is_paid=False),
        Commitment(user_id=DEMO_USER_ID, title="Hostel Electricity Shared Bill", amount=450, due_date=today + timedelta(days=12), category="Bills", is_essential=True, is_paid=False),
    ]
    for c in commitments:
        db.add(c)

    # Active Subscriptions
    subs = [
        Subscription(user_id=DEMO_USER_ID, name="Spotify Student Duo", amount=66, billing_frequency="monthly", next_renewal_date=today + timedelta(days=4), category="Entertainment", status="active", is_essential=False),
        Subscription(user_id=DEMO_USER_ID, name="Google One Cloud Storage", amount=130, billing_frequency="monthly", next_renewal_date=today + timedelta(days=15), category="Education", status="active", is_essential=True),
    ]
    for s in subs:
        db.add(s)

    # Savings Goal (Headphones / Emergency Fund)
    goals = [
        SavingsGoal(user_id=DEMO_USER_ID, title="Sony ANC Headphones Fund", target_amount=2999, current_amount=1200, target_date=today + timedelta(days=35), category="Gadgets", is_paused=False),
        SavingsGoal(user_id=DEMO_USER_ID, title="Semester Exam Certification", target_amount=1500, current_amount=500, target_date=today + timedelta(days=20), category="Education", is_paused=False),
    ]
    for g in goals:
        db.add(g)

    # Budget Allocations
    allocations = [
        BudgetAllocation(user_id=DEMO_USER_ID, category="Food", allocated_amount=3500),
        BudgetAllocation(user_id=DEMO_USER_ID, category="Transport", allocated_amount=1200),
        BudgetAllocation(user_id=DEMO_USER_ID, category="Bills", allocated_amount=1500),
        BudgetAllocation(user_id=DEMO_USER_ID, category="Education", allocated_amount=1000),
        BudgetAllocation(user_id=DEMO_USER_ID, category="Healthcare", allocated_amount=600),
        BudgetAllocation(user_id=DEMO_USER_ID, category="Entertainment", allocated_amount=800),
        BudgetAllocation(user_id=DEMO_USER_ID, category="Shopping", allocated_amount=600),
        BudgetAllocation(user_id=DEMO_USER_ID, category="Savings", allocated_amount=800),
    ]
    for alloc in allocations:
        db.add(alloc)

    # User Challenges
    challenges = [
        UserChallenge(user_id=DEMO_USER_ID, challenge_id="save_500_7d", title="7-Day Micro Saver", target_amount=500, current_amount=250, duration_days=7, start_date=today - timedelta(days=3), status="in_progress", reward_badge="Micro Saver Bronze"),
        UserChallenge(user_id=DEMO_USER_ID, challenge_id="no_takeout_weekend", title="Zero Zomato Weekend", target_amount=400, current_amount=400, duration_days=2, start_date=today - timedelta(days=1), status="completed", reward_badge="Home Chef Master"),
    ]
    for ch in challenges:
        db.add(ch)

    # Notifications
    notifications = [
        Notification(user_id=DEMO_USER_ID, title="Wi-Fi Bill Due in 5 Days", message="₹699 reserved for broadband. Keep balance untouched.", type="info", link="/budget"),
        Notification(user_id=DEMO_USER_ID, title="Safe Daily Allowance: ₹220/day", message="You are on Day 10 of 30. Your daily spending speed is healthy.", type="success", link="/overview"),
        Notification(user_id=DEMO_USER_ID, title="Spotify Renewal Alert", message="Spotify student renewal ₹66 due in 4 days.", type="warning", link="/subscriptions"),
    ]
    for n in notifications:
        db.add(n)

    db.commit()
    db.refresh(user)
    return user

def reset_demo_data(db: Session) -> User:
    existing = db.query(User).filter(User.id == DEMO_USER_ID).first()
    if existing:
        db.delete(existing)
        db.commit()
    return seed_demo_data(db)
