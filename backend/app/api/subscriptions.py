from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import User, Subscription
from app.schemas.schemas import SubscriptionCreate, SubscriptionOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.get("", response_model=List[SubscriptionOut])
def get_subscriptions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subs = db.query(Subscription).filter(Subscription.user_id == current_user.id).all()
    starting_budget = current_user.budget_period.starting_budget if current_user.budget_period else 10000

    result = []
    for s in subs:
        if s.billing_frequency == "monthly":
            m_cost = s.amount
            a_cost = s.amount * 12
        elif s.billing_frequency == "yearly":
            m_cost = round(s.amount / 12)
            a_cost = s.amount
        elif s.billing_frequency == "weekly":
            m_cost = round(s.amount * 4.33)
            a_cost = round(s.amount * 52)
        else:
            m_cost = s.amount
            a_cost = s.amount * 12

        share = round((m_cost / starting_budget) * 100, 1) if starting_budget > 0 else 0.0

        result.append(SubscriptionOut(
            id=s.id,
            name=s.name,
            amount=s.amount,
            billing_frequency=s.billing_frequency,
            next_renewal_date=s.next_renewal_date,
            category=s.category,
            is_essential=s.is_essential,
            status=s.status,
            monthly_equivalent=m_cost,
            annual_cost=a_cost,
            budget_share_pct=share
        ))
    return result

@router.post("", response_model=SubscriptionOut)
def create_subscription(
    sub_in: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    s = Subscription(
        user_id=current_user.id,
        name=sub_in.name,
        amount=sub_in.amount,
        billing_frequency=sub_in.billing_frequency,
        next_renewal_date=sub_in.next_renewal_date,
        category=sub_in.category,
        is_essential=sub_in.is_essential,
        status="active"
    )
    db.add(s)
    db.commit()
    db.refresh(s)

    m_cost = s.amount if s.billing_frequency == "monthly" else round(s.amount / 12)
    a_cost = s.amount * 12 if s.billing_frequency == "monthly" else s.amount
    starting_budget = current_user.budget_period.starting_budget if current_user.budget_period else 10000
    share = round((m_cost / starting_budget) * 100, 1)

    return SubscriptionOut(
        id=s.id,
        name=s.name,
        amount=s.amount,
        billing_frequency=s.billing_frequency,
        next_renewal_date=s.next_renewal_date,
        category=s.category,
        is_essential=s.is_essential,
        status=s.status,
        monthly_equivalent=m_cost,
        annual_cost=a_cost,
        budget_share_pct=share
    )

@router.patch("/{sub_id}/toggle-status")
def toggle_subscription_status(
    sub_id: str,
    action: str, # pause, cancel, activate
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    s = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == current_user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if action in ["pause", "paused"]:
        s.status = "paused"
    elif action in ["cancel", "cancelled"]:
        s.status = "cancelled"
    elif action in ["activate", "active"]:
        s.status = "active"

    db.commit()
    return {"id": s.id, "status": s.status}
