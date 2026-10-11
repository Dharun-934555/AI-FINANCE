import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.db.session import get_db
from app.models.models import User, Simulation, Transaction, Subscription, SavingsGoal
from app.schemas.schemas import SimulationRequest
from app.api.deps import get_current_user
from app.services.financial_engine import FinancialEngine

router = APIRouter(prefix="/simulations", tags=["simulations"])

@router.post("/preview")
def preview_simulation(
    req: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes before vs after states without persisting any changes.
    """
    current_metrics = FinancialEngine.calculate_metrics(current_user, db)
    
    sim_delta = {
        "action_type": req.action_type,
        "amount": req.amount,
        "billing_frequency": req.billing_frequency,
        "category": req.category,
        "is_essential": req.is_essential
    }
    
    simulated_metrics = FinancialEngine.calculate_metrics(current_user, db, simulated_delta=sim_delta)

    # Calculate differences
    balance_diff = simulated_metrics["available_uncommitted_balance"] - current_metrics["available_uncommitted_balance"]
    daily_diff = simulated_metrics["safe_daily_allowance"] - current_metrics["safe_daily_allowance"]
    risk_diff = simulated_metrics["financial_risk_score"] - current_metrics["financial_risk_score"]
    health_diff = simulated_metrics["financial_health_score"] - current_metrics["financial_health_score"]

    # Explanatory narrative
    if req.action_type in ["purchase", "entertainment", "food", "transport", "healthcare", "emergency", "unexpected"]:
        if simulated_metrics["available_uncommitted_balance"] < 0:
            explanation = (
                f"Simulating '{req.title}' (₹{req.amount}) pushes your budget into DEFICIT of ₹{abs(simulated_metrics['available_uncommitted_balance'])}. "
                f"Your daily allowance drops to ₹0, risking unpaid essential commitments."
            )
        else:
            explanation = (
                f"Simulating '{req.title}' (₹{req.amount}) reduces available balance by ₹{req.amount} and daily allowance by ₹{abs(daily_diff):.0f}. "
                f"Risk score changes by {'+' if risk_diff>0 else ''}{risk_diff} points."
            )
    elif req.action_type in ["income", "additional_income"]:
        explanation = (
            f"Receiving '{req.title}' (+₹{req.amount}) increases your spendable buffer by ₹{req.amount} and boosts daily allowance by +₹{daily_diff:.0f}/day."
        )
    elif req.action_type == "subscription":
        explanation = (
            f"Starting '{req.title}' adds a recurring obligation of ₹{req.amount}/{req.billing_frequency}. "
            f"Over the remaining days, this permanently ties up ₹{req.amount} of cash flow."
        )
    else:
        explanation = f"Simulated '{req.title}' adjusted your uncommitted buffer by ₹{balance_diff}."

    return {
        "input": req.model_dump(),
        "before": current_metrics,
        "after": simulated_metrics,
        "differences": {
            "balance_diff": balance_diff,
            "daily_allowance_diff": daily_diff,
            "risk_score_diff": risk_diff,
            "health_score_diff": health_diff,
            "survival_days_diff": simulated_metrics["money_survival_days"] - current_metrics["money_survival_days"]
        },
        "explanation": explanation,
        "is_affordable": simulated_metrics["available_uncommitted_balance"] >= 0
    }

@router.post("/apply")
def apply_simulation(
    req: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Applies the simulated financial action permanently to the database exactly once.
    """
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Simulation amount must be positive.")

    if req.action_type in ["purchase", "entertainment", "food", "transport", "healthcare", "emergency", "unexpected"]:
        tx = Transaction(
            user_id=current_user.id,
            description=req.title,
            amount=req.amount,
            type="expense",
            category=req.category,
            transaction_date=date.today(),
            payment_method="UPI",
            is_essential=req.is_essential
        )
        db.add(tx)
    elif req.action_type in ["income", "additional_income"]:
        tx = Transaction(
            user_id=current_user.id,
            description=req.title,
            amount=req.amount,
            type="income",
            category=req.category,
            transaction_date=date.today(),
            payment_method="UPI",
            is_essential=False
        )
        db.add(tx)
    elif req.action_type == "subscription":
        sub = Subscription(
            user_id=current_user.id,
            name=req.title,
            amount=req.amount,
            billing_frequency=req.billing_frequency or "monthly",
            next_renewal_date=date.today(),
            category=req.category,
            status="active",
            is_essential=req.is_essential
        )
        db.add(sub)
        # Record initial subscription payment
        tx = Transaction(
            user_id=current_user.id,
            description=f"Subscription: {req.title}",
            amount=req.amount,
            type="expense",
            category="Subscriptions",
            transaction_date=date.today(),
            payment_method="UPI",
            is_essential=req.is_essential
        )
        db.add(tx)

    # Save to simulation history
    sim_record = Simulation(
        user_id=current_user.id,
        title=req.title,
        action_type=req.action_type,
        details_json=json.dumps(req.dict()),
        is_applied=True
    )
    db.add(sim_record)
    db.commit()

    # Recalculate metrics
    new_metrics = FinancialEngine.calculate_metrics(current_user, db)
    return {
        "message": f"Successfully committed '{req.title}' to actual finances.",
        "updated_metrics": new_metrics
    }
