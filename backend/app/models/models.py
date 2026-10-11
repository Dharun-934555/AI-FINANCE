import uuid
from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Date, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    profile = relationship("FinancialProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    budget_period = relationship("BudgetPeriod", back_populates="user", uselist=False, cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    budget_allocations = relationship("BudgetAllocation", back_populates="user", cascade="all, delete-orphan")
    commitments = relationship("Commitment", back_populates="user", cascade="all, delete-orphan")
    savings_goals = relationship("SavingsGoal", back_populates="user", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    simulations = relationship("Simulation", back_populates="user", cascade="all, delete-orphan")
    challenges = relationship("UserChallenge", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    hourly_rate = Column(Integer, default=250) # In INR rupees
    preferred_risk_tolerance = Column(String(50), default="moderate") # conservative, moderate, aggressive
    target_emergency_reserve = Column(Integer, default=1500) # In INR rupees
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="profile")

class BudgetPeriod(Base):
    __tablename__ = "budget_periods"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    start_date = Column(Date, default=date.today)
    total_days = Column(Integer, default=30)
    starting_budget = Column(Integer, default=10000) # Stored in INR rupees
    emergency_reserve = Column(Integer, default=1000) # Protected reserve
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="budget_period")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(String(255), nullable=False)
    amount = Column(Integer, nullable=False) # In INR rupees (positive value)
    type = Column(String(20), nullable=False) # 'income', 'expense'
    category = Column(String(50), nullable=False) # 'Food', 'Transport', 'Education', 'Bills', 'Healthcare', 'Shopping', 'Entertainment', 'Subscriptions', 'Savings', 'Other'
    transaction_date = Column(Date, default=date.today)
    payment_method = Column(String(50), default="UPI") # UPI, Card, NetBanking, Cash
    is_essential = Column(Boolean, default=False)
    is_pending = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="transactions")

class BudgetAllocation(Base):
    __tablename__ = "budget_allocations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    allocated_amount = Column(Integer, nullable=False, default=0) # INR
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="budget_allocations")

class Commitment(Base):
    """Upcoming bills, rent, dues that are reserved from spendable money"""
    __tablename__ = "commitments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    amount = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    category = Column(String(50), default="Bills")
    is_essential = Column(Boolean, default=True)
    is_paid = Column(Boolean, default=False)
    paid_transaction_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="commitments")

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    target_amount = Column(Integer, nullable=False)
    current_amount = Column(Integer, default=0)
    target_date = Column(Date, nullable=False)
    category = Column(String(50), default="General") # Emergency fund, Gadgets, Course, Travel
    is_paused = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="savings_goals")
    contributions = relationship("SavingsContribution", back_populates="goal", cascade="all, delete-orphan")

class SavingsContribution(Base):
    __tablename__ = "savings_contributions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    goal_id = Column(String(36), ForeignKey("savings_goals.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)
    contribution_date = Column(Date, default=date.today)
    note = Column(String(255), nullable=True)

    goal = relationship("SavingsGoal", back_populates="contributions")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    amount = Column(Integer, nullable=False)
    billing_frequency = Column(String(20), default="monthly") # monthly, yearly, weekly
    next_renewal_date = Column(Date, nullable=False)
    category = Column(String(50), default="Entertainment")
    status = Column(String(20), default="active") # active, paused, cancelled
    is_essential = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="subscriptions")

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    action_type = Column(String(50), nullable=False) # purchase, subscription, income, emergency, savings_change
    details_json = Column(Text, nullable=False) # JSON encoded details
    is_applied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="simulations")

class UserChallenge(Base):
    __tablename__ = "user_challenges"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_id = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    target_amount = Column(Integer, default=500)
    current_amount = Column(Integer, default=0)
    duration_days = Column(Integer, default=7)
    start_date = Column(Date, default=date.today)
    status = Column(String(20), default="in_progress") # in_progress, completed, paused
    reward_badge = Column(String(100), nullable=True)

    user = relationship("User", back_populates="challenges")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info") # info, warning, danger, success
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    dedup_key = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")
