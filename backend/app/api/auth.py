from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, FinancialProfile, BudgetPeriod
from app.schemas.schemas import UserCreate, UserLogin, Token, UserBase
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user
from app.services.demo_service import seed_demo_data, reset_demo_data, DEMO_USER_ID

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        is_demo=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Setup default profile & budget period
    profile = FinancialProfile(user_id=user.id, hourly_rate=250, preferred_risk_tolerance="moderate")
    budget = BudgetPeriod(user_id=user.id, total_days=30, starting_budget=10000, emergency_reserve=1000)
    db.add(profile)
    db.add(budget)
    db.commit()

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password.")
    
    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "is_demo": current_user.is_demo,
        "hourly_rate": current_user.profile.hourly_rate if current_user.profile else 250,
        "preferred_risk_tolerance": current_user.profile.preferred_risk_tolerance if current_user.profile else "moderate",
        "starting_budget": current_user.budget_period.starting_budget if current_user.budget_period else 10000,
        "emergency_reserve": current_user.budget_period.emergency_reserve if current_user.budget_period else 1000
    }

@router.post("/demo-login", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    user = seed_demo_data(db)
    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }

@router.post("/demo-reset")
def demo_reset(db: Session = Depends(get_db)):
    reset_demo_data(db)
    return {"message": "Demo data successfully reset to clean default state"}
