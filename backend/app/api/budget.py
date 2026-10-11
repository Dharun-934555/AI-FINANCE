from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import User, BudgetAllocation, Commitment, Transaction
from app.schemas.schemas import CommitmentCreate, CommitmentOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/budget", tags=["budget"])

@router.get("")
def get_budget_allocations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    allocations = db.query(BudgetAllocation).filter(BudgetAllocation.user_id == current_user.id).all()
    txs = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense"
    ).all()

    category_spent = {}
    for t in txs:
        category_spent[t.category] = category_spent.get(t.category, 0) + t.amount

    result = []
    total_allocated = 0
    for a in allocations:
        spent = category_spent.get(a.category, 0)
        rem = a.allocated_amount - spent
        total_allocated += a.allocated_amount
        result.append({
            "id": a.id,
            "category": a.category,
            "allocated_amount": a.allocated_amount,
            "spent_amount": spent,
            "remaining_amount": rem,
            "overspent": spent > a.allocated_amount
        })

    return {
        "allocations": result,
        "total_allocated": total_allocated,
        "starting_budget": current_user.budget_period.starting_budget if current_user.budget_period else 10000
    }

@router.put("/allocations")
def update_allocations(
    allocations_data: List[dict],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for item in allocations_data:
        cat = item.get("category")
        amt = int(item.get("allocated_amount", 0))
        existing = db.query(BudgetAllocation).filter(
            BudgetAllocation.user_id == current_user.id,
            BudgetAllocation.category == cat
        ).first()
        if existing:
            existing.allocated_amount = amt
        else:
            db.add(BudgetAllocation(user_id=current_user.id, category=cat, allocated_amount=amt))
    db.commit()
    return {"message": "Allocations updated successfully"}

@router.get("/commitments", response_model=List[CommitmentOut])
def get_commitments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Commitment).filter(
        Commitment.user_id == current_user.id
    ).order_by(Commitment.due_date.asc()).all()

@router.post("/commitments", response_model=CommitmentOut)
def create_commitment(
    comm_in: CommitmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    c = Commitment(
        user_id=current_user.id,
        title=comm_in.title,
        amount=comm_in.amount,
        due_date=comm_in.due_date,
        category=comm_in.category,
        is_essential=comm_in.is_essential
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c
