from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.db.session import get_db
from app.models.models import User, SavingsGoal, SavingsContribution
from app.schemas.schemas import SavingsGoalCreate, SavingsGoalOut, SavingsContributionCreate
from app.api.deps import get_current_user
from app.services.financial_engine import FinancialEngine

router = APIRouter(prefix="/savings", tags=["savings"])

@router.get("/goals", response_model=List[SavingsGoalOut])
def get_savings_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    metrics = FinancialEngine.calculate_metrics(current_user, db)
    goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).all()
    
    result = []
    for g in goals:
        needed = g.target_amount - g.current_amount
        # Feasible if available balance + current safe pace allows saving needed
        achievable = (metrics["available_uncommitted_balance"] >= needed) or (metrics["safe_daily_allowance"] > 50)
        result.append(SavingsGoalOut(
            id=g.id,
            title=g.title,
            target_amount=g.target_amount,
            current_amount=g.current_amount,
            target_date=g.target_date,
            category=g.category,
            is_paused=g.is_paused,
            achievable=achievable,
            projected_completion_date=g.target_date
        ))
    return result

@router.post("/goals", response_model=SavingsGoalOut)
def create_savings_goal(
    goal_in: SavingsGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    g = SavingsGoal(
        user_id=current_user.id,
        title=goal_in.title,
        target_amount=goal_in.target_amount,
        current_amount=goal_in.current_amount,
        target_date=goal_in.target_date,
        category=goal_in.category
    )
    db.add(g)
    db.commit()
    db.refresh(g)
    return SavingsGoalOut(
        id=g.id,
        title=g.title,
        target_amount=g.target_amount,
        current_amount=g.current_amount,
        target_date=g.target_date,
        category=g.category,
        is_paused=g.is_paused,
        achievable=True
    )

@router.patch("/goals/{goal_id}/pause")
def toggle_pause_goal(goal_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    g = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    g.is_paused = not g.is_paused
    db.commit()
    return {"id": g.id, "is_paused": g.is_paused}

@router.post("/goals/{goal_id}/contributions")
def add_contribution(
    goal_id: str,
    contrib: SavingsContributionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    g = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")

    metrics = FinancialEngine.calculate_metrics(current_user, db)
    if contrib.amount > metrics["available_uncommitted_balance"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot contribute ₹{contrib.amount}. Only ₹{metrics['available_uncommitted_balance']} uncommitted spendable balance is available."
        )

    g.current_amount += contrib.amount
    c = SavingsContribution(goal_id=g.id, amount=contrib.amount, note=contrib.note)
    db.add(c)
    db.commit()
    db.refresh(g)
    return {"message": "Contribution added successfully", "current_amount": g.current_amount}
