from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.db.session import get_db
from app.models.models import User, Notification, UserChallenge, Subscription, Commitment
from app.api.deps import get_current_user
from app.services.financial_engine import FinancialEngine

router = APIRouter(prefix="/intelligence", tags=["intelligence"])

@router.get("/health-center")
def get_health_center(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    metrics = FinancialEngine.calculate_metrics(current_user, db)

    # Score breakdown factors
    # 1. Budget adherence (0-25)
    spend_rate = (metrics["total_completed_expenses"] / metrics["starting_budget"]) if metrics["starting_budget"] > 0 else 0
    time_rate = (metrics["elapsed_days"] / metrics["total_days"]) if metrics["total_days"] > 0 else 0
    adherence_score = 25 if spend_rate <= time_rate else max(5, int(25 - (spend_rate - time_rate) * 50))

    # 2. Essential commitments coverage (0-25)
    comm_coverage = 25 if metrics["current_cash_balance"] >= metrics["unpaid_essential_commitments"] else max(0, int(25 * (metrics["current_cash_balance"] / max(1, metrics["unpaid_essential_commitments"]))))

    # 3. Emergency reserve adequacy (0-25)
    res_score = 25 if metrics["available_uncommitted_balance"] >= metrics["emergency_reserve"] else max(5, int(25 * (max(0, metrics["available_uncommitted_balance"]) / max(1, metrics["emergency_reserve"]))))

    # 4. Savings progress & runway (0-25)
    runway_score = 25 if metrics["money_survival_days"] >= metrics["remaining_days"] else max(5, int(25 * (metrics["money_survival_days"] / max(1, metrics["remaining_days"]))))

    breakdown = [
        {"factor": "Budget Pace Adherence", "score": adherence_score, "max": 25, "status": "Strong" if adherence_score > 18 else "Fair"},
        {"factor": "Essential Commitment Coverage", "score": comm_coverage, "max": 25, "status": "Safe" if comm_coverage > 20 else "At Risk"},
        {"factor": "Emergency Buffer Security", "score": res_score, "max": 25, "status": "Protected" if res_score > 18 else "Exposed"},
        {"factor": "Runway Feasibility (Survival)", "score": runway_score, "max": 25, "status": "Positive" if runway_score > 18 else "Attention Needed"}
    ]

    action_plan = []
    if metrics["available_uncommitted_balance"] < metrics["emergency_reserve"]:
        action_plan.append("Replenish emergency buffer by curtailing unallocated discretionary food and shopping outings.")
    if metrics["unpaid_essential_commitments"] > 0:
        action_plan.append(f"Keep ₹{metrics['unpaid_essential_commitments']} strictly reserved for pending utility / hostel bills.")
    if metrics["safe_daily_allowance"] < 150:
        action_plan.append("Lock discretionary allowance to maximum ₹150/day until Day 20.")
    if not action_plan:
        action_plan.append("Your financial velocity is healthy! Consider dedicating ₹200 to a micro-savings goal.")

    return {
        "metrics": metrics,
        "health_score": metrics["financial_health_score"],
        "health_band": metrics["financial_health_band"],
        "risk_score": metrics["financial_risk_score"],
        "risk_band": metrics["financial_risk_band"],
        "breakdown": breakdown,
        "action_plan": action_plan
    }

@router.post("/stress-test")
def run_stress_test(
    test_type: str, # 'unexpected_1000', 'unexpected_2000', 'income_loss', 'essential_surge', 'multi_emergency'
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    base_metrics = FinancialEngine.calculate_metrics(current_user, db)

    sim_delta = {}
    test_title = ""
    scenario_desc = ""

    if test_type == "unexpected_1000":
        test_title = "Sudden Urgent Medical / Repair Bill (₹1,000)"
        scenario_desc = "Instant unexpected cash outflow of ₹1,000."
        sim_delta = {"action_type": "purchase", "amount": 1000}
    elif test_type == "unexpected_2000":
        test_title = "Major Emergency (₹2,000 Outflow)"
        scenario_desc = "Instant unexpected expense of ₹2,000 consuming primary buffer."
        sim_delta = {"action_type": "purchase", "amount": 2000}
    elif test_type == "essential_surge":
        test_title = "Essential Utilities Surge (+15%)"
        scenario_desc = "Bills and grocery staples increase in price by 15%."
        surge_amt = round(base_metrics["unpaid_essential_commitments"] * 0.15) or 300
        sim_delta = {"action_type": "commitment_add", "amount": surge_amt}
    elif test_type == "multi_emergency":
        test_title = "Dual Shock: ₹1,500 Repair + Simultaneous Bill"
        scenario_desc = "₹1,500 equipment repair paired with extra unplanned expense."
        sim_delta = {"action_type": "purchase", "amount": 2200}
    else:
        test_title = "Standard ₹800 Stress Test"
        scenario_desc = "₹800 discretionary shock."
        sim_delta = {"action_type": "purchase", "amount": 800}

    stressed_metrics = FinancialEngine.calculate_metrics(current_user, db, simulated_delta=sim_delta)

    is_survivable = stressed_metrics["available_uncommitted_balance"] >= 0
    resilience_rating = "Resilient" if is_survivable and stressed_metrics["safe_daily_allowance"] >= 100 else ("Strained" if is_survivable else "Critical Deficit")

    return {
        "test_type": test_type,
        "test_title": test_title,
        "scenario_desc": scenario_desc,
        "base_metrics": base_metrics,
        "stressed_metrics": stressed_metrics,
        "is_survivable": is_survivable,
        "resilience_rating": resilience_rating,
        "shortfall_amount": abs(min(0, stressed_metrics["available_uncommitted_balance"])),
        "allowance_drop": base_metrics["safe_daily_allowance"] - stressed_metrics["safe_daily_allowance"]
    }

@router.get("/crisis-recovery")
def get_crisis_recovery(
    emergency_amount: int = 2000,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes a 7-step prioritized triage plan to recover from any simulated emergency.
    """
    base_metrics = FinancialEngine.calculate_metrics(current_user, db)
    sim_delta = {"action_type": "purchase", "amount": emergency_amount}
    crisis_metrics = FinancialEngine.calculate_metrics(current_user, db, simulated_delta=sim_delta)

    # Subscriptions that can be paused to save money
    subs = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active",
        Subscription.is_essential == False
    ).all()
    sub_savings = sum(s.amount for s in subs)

    # Recovered scenario if non-essential subscriptions paused and allowance lowered
    recovered_balance = crisis_metrics["available_uncommitted_balance"] + sub_savings
    remaining_days = max(1, crisis_metrics["remaining_days"])
    recovered_allowance = max(0.0, round(recovered_balance / remaining_days, 2)) if recovered_balance > 0 else 0.0

    steps = [
        {
            "priority": 1,
            "title": "Ringfence Essential Commitments",
            "action": f"Protect ₹{base_metrics['unpaid_essential_commitments']} reserved for Wi-Fi and electricity bills without touching.",
            "impact": "Eliminates utility penalty risks."
        },
        {
            "priority": 2,
            "title": "Freeze Non-Essential Subscriptions",
            "action": f"Temporarily pause {len(subs)} optional subscriptions to free ₹{sub_savings}/mo in immediate cash flow.",
            "impact": f"+₹{sub_savings} restored to budget buffer."
        },
        {
            "priority": 3,
            "title": "Recalculate Safe Daily Burn",
            "action": f"Shift from ₹{base_metrics['safe_daily_allowance']:.0f}/day to ₹{recovered_allowance:.0f}/day for {remaining_days} days.",
            "impact": "Prevents month-end insolvency."
        },
        {
            "priority": 4,
            "title": "Protect Base Emergency Cushion",
            "action": "Avoid tapping below ₹500 hard floor for medical emergencies.",
            "impact": "Maintains baseline safety net."
        }
    ]

    return {
        "emergency_amount": emergency_amount,
        "base_metrics": base_metrics,
        "crisis_metrics": crisis_metrics,
        "recovered_allowance": recovered_allowance,
        "steps": steps,
        "is_shortfall": crisis_metrics["available_uncommitted_balance"] < 0,
        "shortfall_amount": abs(min(0, crisis_metrics["available_uncommitted_balance"]))
    }

@router.get("/ai-coach")
def get_ai_coach_insights(query: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    metrics = FinancialEngine.calculate_metrics(current_user, db)
    
    # Generate explainable, grounded rule-based responses
    q = (query or "").lower()

    if "headphone" in q or "buy" in q or "afford" in q:
        target_amt = 2499
        affordable = metrics["available_uncommitted_balance"] >= target_amt
        new_balance = metrics["available_uncommitted_balance"] - target_amt
        remaining_days = max(1, metrics["remaining_days"])
        new_allowance = max(0.0, round(new_balance / remaining_days, 2))
        
        reply = (
            f"Analysis for purchase of ₹{target_amt}:\n"
            f"• Current available spendable: ₹{metrics['available_uncommitted_balance']}\n"
            f"• Remaining days: {metrics['remaining_days']}\n"
            f"• New daily allowance: ₹{new_allowance}/day (down from ₹{metrics['safe_daily_allowance']:.0f}/day)\n\n"
            f"Verdict: {'✅ Technically affordable, but reduces your safety buffer significantly.' if affordable else '⚠️ Not recommended right now. This purchase creates a deficit of ₹' + str(abs(new_balance)) + '.'} "
            f"Recommendation: Consider our 7-Day Micro Saver challenge or simulate in the What-If Simulator before committing."
        )
        action_link = "/simulator"
    elif "risk" in q or "why" in q:
        reply = (
            f"Your Risk Score is currently {metrics['financial_risk_score']}/100 ({metrics['financial_risk_band']} Risk).\n"
            f"Key driving factors:\n"
            f"1. Spendable buffer is ₹{metrics['available_uncommitted_balance']}.\n"
            f"2. Daily safe allowance is ₹{metrics['safe_daily_allowance']:.0f}/day across {metrics['remaining_days']} remaining days.\n"
            f"3. Reserved essential commitments stand at ₹{metrics['unpaid_essential_commitments']}.\n\n"
            f"To reduce your risk score into the Low band (<30), maintain your daily spending under ₹{metrics['safe_daily_allowance']:.0f} and avoid taking on new subscriptions."
        )
        action_link = "/health-center"
    elif "subscription" in q:
        subs = db.query(Subscription).filter(Subscription.user_id == current_user.id).all()
        total_sub = sum(s.amount for s in subs)
        reply = (
            f"You have {len(subs)} active subscriptions costing ₹{total_sub}/month.\n"
            f"That accounts for {round(total_sub / metrics['starting_budget'] * 100, 1)}% of your starting ₹{metrics['starting_budget']} budget.\n"
            f"Pausing non-essential streaming or music services could immediately free up ₹{total_sub} for your savings goals."
        )
        action_link = "/subscriptions"
    else:
        reply = (
            f"Hello {current_user.username}! I am your RupeeWise Coach.\n\n"
            f"• Financial Health: {metrics['financial_health_score']}/100 ({metrics['financial_health_band']})\n"
            f"• Safe Daily Allowance: ₹{metrics['safe_daily_allowance']:.0f}/day\n"
            f"• Runway Survival: {metrics['money_survival_days']} days (Status: {metrics['survival_status'].title()})\n"
            f"• Unpaid Essential Commitments: ₹{metrics['unpaid_essential_commitments']}\n\n"
            f"Ask me questions like:\n"
            f"- 'Can I afford headphones for ₹2,499?'\n"
            f"- 'Why is my risk status changing?'\n"
            f"- 'How do I handle an unexpected ₹2,000 emergency?'"
        )
        action_link = "/simulator"

    return {
        "reply": reply,
        "action_link": action_link,
        "current_metrics": metrics
    }

@router.get("/challenges")
def get_challenges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    challenges = db.query(UserChallenge).filter(UserChallenge.user_id == current_user.id).all()
    return challenges

@router.post("/challenges/{ch_id}/join")
def join_challenge(ch_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ch = db.query(UserChallenge).filter(UserChallenge.id == ch_id, UserChallenge.user_id == current_user.id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found")
    ch.status = "in_progress"
    db.commit()
    return {"message": "Joined challenge successfully", "challenge": ch}

@router.get("/notifications")
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()

@router.patch("/notifications/{n_id}/read")
def mark_notification_read(n_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == n_id, Notification.user_id == current_user.id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"status": "ok"}
