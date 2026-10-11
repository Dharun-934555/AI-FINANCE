from datetime import date, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import (
    User, BudgetPeriod, Transaction, Commitment, SavingsGoal, Subscription, FinancialProfile
)

class FinancialEngine:
    """
    Authoritative Central Financial Calculation Engine for Finora / RupeeWise AI.
    Calculations strictly follow product specifications:
    - Current cash balance = starting funds + received income - completed expenses
    - Available uncommitted balance = current cash balance - unpaid reserved commitments - protected savings
    - Safe daily allowance = available uncommitted balance / remaining days
    - Money survival runway in days
    - Financial Risk score (0-100) and Financial Health score (0-100)
    """

    @staticmethod
    def calculate_metrics(user: User, db: Session, simulated_delta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        budget_period = user.budget_period
        if not budget_period:
            start_d = date.today()
            total_days = 30
            starting_budget = 10000
            emergency_reserve = 1000
        else:
            start_d = budget_period.start_date
            total_days = budget_period.total_days
            starting_budget = budget_period.starting_budget
            emergency_reserve = budget_period.emergency_reserve

        profile = user.profile
        hourly_rate = profile.hourly_rate if profile else 250

        # Elapsed and remaining days
        today = date.today()
        elapsed_days = (today - start_d).days
        if elapsed_days < 0:
            elapsed_days = 0
        remaining_days = max(0, total_days - elapsed_days)

        # Base database items
        transactions = db.query(Transaction).filter(
            Transaction.user_id == user.id,
            Transaction.is_pending == False
        ).all()

        commitments = db.query(Commitment).filter(
            Commitment.user_id == user.id,
            Commitment.is_paid == False
        ).all()

        savings_goals = db.query(SavingsGoal).filter(
            SavingsGoal.user_id == user.id,
            SavingsGoal.is_paused == False
        ).all()

        subscriptions = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == "active"
        ).all()

        # Compute totals from completed transactions
        completed_expenses = sum(t.amount for t in transactions if t.type == "expense")
        received_income = sum(t.amount for t in transactions if t.type == "income")

        # Unpaid commitments
        unpaid_essential_commitments = sum(c.amount for c in commitments if c.is_essential)
        unpaid_other_commitments = sum(c.amount for c in commitments if not c.is_essential)
        total_unpaid_commitments = unpaid_essential_commitments + unpaid_other_commitments

        # Protected savings
        protected_savings = sum(g.current_amount for g in savings_goals)

        # Active subscriptions monthly total
        monthly_subscriptions = 0
        for s in subscriptions:
            if s.billing_frequency == "monthly":
                monthly_subscriptions += s.amount
            elif s.billing_frequency == "yearly":
                monthly_subscriptions += round(s.amount / 12)
            elif s.billing_frequency == "weekly":
                monthly_subscriptions += round(s.amount * 4.33)

        # Apply simulation delta if provided
        sim_expense_delta = 0
        sim_income_delta = 0
        sim_commitment_delta = 0
        sim_savings_delta = 0
        sim_monthly_sub_delta = 0

        if simulated_delta:
            action = simulated_delta.get("action_type")
            amt = int(simulated_delta.get("amount", 0))
            if action in ["purchase", "entertainment", "food", "transport", "healthcare", "emergency", "unexpected"]:
                sim_expense_delta += amt
            elif action in ["income", "additional_income"]:
                sim_income_delta += amt
            elif action == "subscription":
                freq = simulated_delta.get("billing_frequency", "monthly")
                if freq == "monthly":
                    sim_monthly_sub_delta += amt
                elif freq == "yearly":
                    sim_monthly_sub_delta += round(amt / 12)
                elif freq == "weekly":
                    sim_monthly_sub_delta += round(amt * 4.33)
                sim_expense_delta += amt # immediate first payment
            elif action == "cancel_subscription":
                sub_id = simulated_delta.get("subscription_id")
                sub = next((s for s in subscriptions if s.id == sub_id), None)
                if sub:
                    sim_monthly_sub_delta -= sub.amount
            elif action in ["savings", "savings_contribution"]:
                sim_savings_delta += amt
            elif action == "savings_withdrawal":
                sim_savings_delta -= min(amt, protected_savings)
            elif action == "commitment_add":
                sim_commitment_delta += amt

        effective_completed_expenses = completed_expenses + sim_expense_delta
        effective_received_income = received_income + sim_income_delta
        effective_unpaid_commitments = total_unpaid_commitments + sim_commitment_delta
        effective_protected_savings = max(0, protected_savings + sim_savings_delta)

        # Core formulas
        current_cash_balance = starting_budget + effective_received_income - effective_completed_expenses
        available_uncommitted_balance = current_cash_balance - effective_unpaid_commitments - effective_protected_savings

        # Safe daily allowance
        if remaining_days > 0:
            if available_uncommitted_balance > 0:
                safe_daily_allowance = round(available_uncommitted_balance / remaining_days, 2)
            else:
                safe_daily_allowance = 0.0
        else:
            safe_daily_allowance = 0.0

        # Projected Day 30 balance
        # Assuming current daily spending pace or safe allowance
        projected_day30_balance = available_uncommitted_balance

        # Money survival calculation
        # Spending pace per day based on elapsed days or essential daily requirements
        past_daily_burn = (effective_completed_expenses / elapsed_days) if elapsed_days > 0 else 0
        min_daily_burn = 150 # Estimated minimum food/transit daily requirement
        assumed_daily_rate = max(past_daily_burn, min_daily_burn)

        if assumed_daily_rate > 0 and available_uncommitted_balance > 0:
            money_survival_days = int(available_uncommitted_balance / assumed_daily_rate)
        elif available_uncommitted_balance <= 0:
            money_survival_days = 0
        else:
            money_survival_days = remaining_days

        # Survival status
        if money_survival_days >= remaining_days:
            survival_status = "safe"
        elif money_survival_days >= (remaining_days * 0.6):
            survival_status = "caution"
        else:
            survival_status = "critical"

        # Risk score calculation (0 - 100, where 0 is safest, 100 is critical risk)
        risk_score = 0
        if available_uncommitted_balance < 0:
            risk_score += 60
        elif available_uncommitted_balance < 1000:
            risk_score += 35
        elif available_uncommitted_balance < 2500:
            risk_score += 15

        if safe_daily_allowance < 100 and remaining_days > 0:
            risk_score += 25
        elif safe_daily_allowance < 200 and remaining_days > 0:
            risk_score += 10

        if effective_unpaid_commitments > current_cash_balance:
            risk_score += 30

        if money_survival_days < remaining_days:
            gap = remaining_days - money_survival_days
            risk_score += min(30, gap * 2)

        risk_score = max(5, min(98, risk_score))

        if risk_score <= 29:
            risk_band = "Low"
        elif risk_score <= 59:
            risk_band = "Moderate"
        elif risk_score <= 79:
            risk_band = "High"
        else:
            risk_band = "Critical"

        # Health score calculation (0 - 100, where 100 is excellent health)
        health_score = 100 - int(risk_score * 0.8)
        if effective_protected_savings >= 1000:
            health_score += 10
        if emergency_reserve >= 1000 and available_uncommitted_balance > emergency_reserve:
            health_score += 10
        if current_cash_balance >= (starting_budget * 0.4) and elapsed_days <= 15:
            health_score += 5

        health_score = max(5, min(99, health_score))

        if health_score >= 80:
            health_band = "Excellent"
        elif health_score >= 65:
            health_band = "Good"
        elif health_score >= 45:
            health_band = "Fair"
        elif health_score >= 25:
            health_band = "Poor"
        else:
            health_band = "Critical"

        # Tracking summary
        if risk_score <= 30 and available_uncommitted_balance > 1500:
            track_status = "On Track"
            track_explanation = f"Your daily allowance is ₹{safe_daily_allowance:.0f}. All essential bills (₹{effective_unpaid_commitments}) are covered with ₹{available_uncommitted_balance} spendable buffer."
        elif risk_score <= 60 and available_uncommitted_balance > 0:
            track_status = "Needs Attention"
            track_explanation = f"Remaining daily allowance is ₹{safe_daily_allowance:.0f}. Discretionary spending should be throttled to preserve ₹{emergency_reserve} emergency buffer."
        else:
            track_status = "At Risk"
            track_explanation = f"Deficit warning: Uncommitted funds are low (₹{available_uncommitted_balance}). Essential commitments or upcoming renewals risk depletion before Day {total_days}."

        hours_worked_equivalent = round(effective_completed_expenses / hourly_rate, 1) if hourly_rate > 0 else 0.0

        return {
            "starting_budget": starting_budget,
            "current_cash_balance": current_cash_balance,
            "available_uncommitted_balance": available_uncommitted_balance,
            "total_completed_expenses": effective_completed_expenses,
            "total_received_income": effective_received_income,
            "unpaid_essential_commitments": unpaid_essential_commitments,
            "unpaid_other_commitments": unpaid_other_commitments,
            "total_unpaid_commitments": effective_unpaid_commitments,
            "protected_savings": effective_protected_savings,
            "emergency_reserve": emergency_reserve,
            "safe_daily_allowance": safe_daily_allowance,
            "remaining_days": remaining_days,
            "elapsed_days": elapsed_days,
            "total_days": total_days,
            "projected_day30_balance": projected_day30_balance,
            "money_survival_days": money_survival_days,
            "survival_status": survival_status,
            "financial_risk_score": risk_score,
            "financial_risk_band": risk_band,
            "financial_health_score": health_score,
            "health_score": health_score,
            "financial_health_band": health_band,
            "track_status": track_status,
            "track_explanation": track_explanation,
            "hourly_rate": hourly_rate,
            "hours_worked_equivalent": hours_worked_equivalent,
            "monthly_subscriptions": monthly_subscriptions + sim_monthly_sub_delta
        }
