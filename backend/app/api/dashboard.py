from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.db.session import get_db
from app.models.models import User, Transaction, Commitment, Subscription, SavingsGoal, BudgetAllocation
from app.api.deps import get_current_user
from app.services.financial_engine import FinancialEngine

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    metrics = FinancialEngine.calculate_metrics(current_user, db)

    # 30-day daily spending history
    txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense"
    ).all()

    category_spending = {}
    for t in txs:
        category_spending[t.category] = category_spending.get(t.category, 0) + t.amount

    # Recent 5 transactions
    recent_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc()).limit(5).all()

    # Upcoming commitments
    commitments = db.query(Commitment).filter(
        Commitment.user_id == current_user.id,
        Commitment.is_paid == False
    ).order_by(Commitment.due_date.asc()).limit(5).all()

    # Subscriptions
    subs = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).order_by(Subscription.next_renewal_date.asc()).limit(5).all()

    # Goals
    goals = db.query(SavingsGoal).filter(
        SavingsGoal.user_id == current_user.id
    ).all()

    return {
        "metrics": metrics,
        "category_spending": [{"category": k, "amount": v} for k, v in category_spending.items()],
        "recent_transactions": [
            {
                "id": t.id,
                "description": t.description,
                "amount": t.amount,
                "type": t.type,
                "category": t.category,
                "transaction_date": str(t.transaction_date),
                "is_essential": t.is_essential
            } for t in recent_transactions
        ],
        "upcoming_commitments": [
            {
                "id": c.id,
                "title": c.title,
                "amount": c.amount,
                "due_date": str(c.due_date),
                "is_essential": c.is_essential
            } for c in commitments
        ],
        "active_subscriptions": [
            {
                "id": s.id,
                "name": s.name,
                "amount": s.amount,
                "billing_frequency": s.billing_frequency,
                "next_renewal_date": str(s.next_renewal_date)
            } for s in subs
        ],
        "savings_goals": [
            {
                "id": g.id,
                "title": g.title,
                "target_amount": g.target_amount,
                "current_amount": g.current_amount,
                "progress_pct": round((g.current_amount / g.target_amount * 100), 1) if g.target_amount > 0 else 0
            } for g in goals
        ]
    }

@router.get("/forecast")
def get_forecast(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    metrics = FinancialEngine.calculate_metrics(current_user, db)
    total_days = metrics["total_days"]
    elapsed_days = metrics["elapsed_days"]
    start_d = current_user.budget_period.start_date if current_user.budget_period else date.today()

    # Build 30-day daily projected trajectory
    # Scenarios: conservative (spends 70% of allowance), expected (spends 100%), high_spending (spends 135%)
    forecast_points = []
    
    current_cash = metrics["current_cash_balance"]
    current_avail = metrics["available_uncommitted_balance"]
    allowance = metrics["safe_daily_allowance"]

    # Upcoming commitment schedule map
    commitments = db.query(Commitment).filter(
        Commitment.user_id == current_user.id,
        Commitment.is_paid == False
    ).all()
    commitment_by_day = {}
    for c in commitments:
        d_idx = (c.due_date - start_d).days + 1
        commitment_by_day[d_idx] = commitment_by_day.get(d_idx, 0) + c.amount

    running_expected = current_avail
    running_conservative = current_avail
    running_high = current_avail

    for day in range(1, total_days + 1):
        actual_date = start_d + timedelta(days=day - 1)
        event = None

        if day == elapsed_days + 1:
            event = "Today"
        elif day in commitment_by_day:
            event = f"Bill Due: ₹{commitment_by_day[day]}"

        if day <= elapsed_days:
            # Past points: display actual
            forecast_points.append({
                "day": day,
                "date": str(actual_date),
                "is_past": True,
                "expected": current_avail,
                "conservative": current_avail,
                "high": current_avail,
                "event": event
            })
        else:
            # Future days projection
            running_expected = max(0, running_expected - allowance)
            running_conservative = max(0, running_conservative - (allowance * 0.7))
            running_high = max(0, running_high - (allowance * 1.35))

            forecast_points.append({
                "day": day,
                "date": str(actual_date),
                "is_past": False,
                "expected": round(running_expected),
                "conservative": round(running_conservative),
                "high": round(running_high),
                "event": event
            })

    return {
        "metrics": metrics,
        "forecast_points": forecast_points,
        "assumptions": {
            "conservative": "Spends 70% of daily allowance, saves additional 30%",
            "expected": "Spends 100% of safe daily allowance, meets all commitments",
            "high": "Overspends by 35% on dining/discretionary expenses"
        }
    }
