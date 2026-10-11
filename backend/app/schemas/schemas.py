from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import date, datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    username: str

class FinancialProfileSchema(BaseModel):
    hourly_rate: int = 250
    preferred_risk_tolerance: str = "moderate"
    target_emergency_reserve: int = 1500
    notes: Optional[str] = None

class BudgetPeriodSchema(BaseModel):
    start_date: date
    total_days: int = 30
    starting_budget: int = 10000
    emergency_reserve: int = 1000

class TransactionBase(BaseModel):
    description: str
    amount: int
    type: str # income or expense
    category: str
    transaction_date: date = Field(default_factory=date.today)
    payment_method: str = "UPI"
    is_essential: bool = False
    is_pending: bool = False
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[int] = None
    type: Optional[str] = None
    category: Optional[str] = None
    transaction_date: Optional[date] = None
    payment_method: Optional[str] = None
    is_essential: Optional[bool] = None
    is_pending: Optional[bool] = None
    notes: Optional[str] = None

class TransactionOut(TransactionBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CommitmentBase(BaseModel):
    title: str
    amount: int
    due_date: date
    category: str = "Bills"
    is_essential: bool = True

class CommitmentCreate(CommitmentBase):
    pass

class CommitmentOut(CommitmentBase):
    id: str
    is_paid: bool
    paid_transaction_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SavingsGoalBase(BaseModel):
    title: str
    target_amount: int
    target_date: date
    category: str = "General"

class SavingsGoalCreate(SavingsGoalBase):
    current_amount: int = 0

class SavingsGoalOut(SavingsGoalBase):
    id: str
    current_amount: int
    is_paused: bool
    achievable: bool = True
    projected_completion_date: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)

class SavingsContributionCreate(BaseModel):
    amount: int
    note: Optional[str] = None

class SubscriptionBase(BaseModel):
    name: str
    amount: int
    billing_frequency: str = "monthly"
    next_renewal_date: date
    category: str = "Entertainment"
    is_essential: bool = False

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionOut(SubscriptionBase):
    id: str
    status: str
    monthly_equivalent: int
    annual_cost: int
    budget_share_pct: float

    model_config = ConfigDict(from_attributes=True)

class BudgetAllocationItem(BaseModel):
    category: str
    allocated_amount: int
    spent_amount: int = 0
    remaining_amount: int = 0

class SimulationRequest(BaseModel):
    action_type: str # purchase, subscription, income, emergency, savings
    title: str
    amount: int
    category: str = "Shopping"
    is_essential: bool = False
    billing_frequency: Optional[str] = "monthly" # for subscriptions
    target_date: Optional[date] = None

class FinancialMetrics(BaseModel):
    starting_budget: int
    current_cash_balance: int
    available_uncommitted_balance: int
    total_completed_expenses: int
    total_received_income: int
    unpaid_essential_commitments: int
    unpaid_other_commitments: int
    protected_savings: int
    emergency_reserve: int
    safe_daily_allowance: float
    remaining_days: int
    elapsed_days: int
    total_days: int
    projected_day30_balance: int
    money_survival_days: int
    survival_status: str # safe, caution, critical
    financial_risk_score: int # 0-100
    financial_risk_band: str # Low, Moderate, High, Critical
    financial_health_score: int # 0-100
    financial_health_band: str # Excellent, Good, Fair, Poor, Critical
    track_status: str # On Track, Needs Attention, At Risk
    track_explanation: str
    hourly_rate: int
    hours_worked_equivalent: Optional[float] = None
