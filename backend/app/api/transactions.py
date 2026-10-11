from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.db.session import get_db
from app.models.models import User, Transaction, Commitment
from app.schemas.schemas import TransactionCreate, TransactionUpdate, TransactionOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("", response_model=List[TransactionOut])
def list_transactions(
    category: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if category:
        query = query.filter(Transaction.category == category)
    if type:
        query = query.filter(Transaction.type == type)
    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))
    
    return query.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc()).all()

@router.post("", response_model=TransactionOut)
def create_transaction(
    tx_in: TransactionCreate,
    commitment_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if tx_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Transaction amount must be strictly positive.")

    # Idempotent commitment release if this transaction fulfills a commitment
    if commitment_id:
        comm = db.query(Commitment).filter(
            Commitment.id == commitment_id,
            Commitment.user_id == current_user.id
        ).first()
        if comm and not comm.is_paid:
            comm.is_paid = True

    tx = Transaction(
        user_id=current_user.id,
        description=tx_in.description,
        amount=tx_in.amount,
        type=tx_in.type,
        category=tx_in.category,
        transaction_date=tx_in.transaction_date,
        payment_method=tx_in.payment_method,
        is_essential=tx_in.is_essential,
        is_pending=tx_in.is_pending,
        notes=tx_in.notes
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    if commitment_id and comm:
        comm.paid_transaction_id = tx.id
        db.commit()

    return tx

@router.patch("/{tx_id}", response_model=TransactionOut)
def update_transaction(
    tx_id: str,
    tx_in: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    update_data = tx_in.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(tx, k, v)

    db.commit()
    db.refresh(tx)
    return tx

@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully"}
