export interface FinancialMetrics {
  starting_budget: number;
  current_cash_balance: number;
  available_uncommitted_balance: number;
  total_completed_expenses: number;
  total_received_income: number;
  unpaid_essential_commitments: number;
  unpaid_other_commitments: number;
  total_unpaid_commitments: number;
  protected_savings: number;
  emergency_reserve: number;
  safe_daily_allowance: number;
  remaining_days: number;
  elapsed_days: number;
  total_days: number;
  projected_day30_balance: number;
  money_survival_days: number;
  survival_status: 'safe' | 'caution' | 'critical';
  financial_risk_score: number;
  financial_risk_band: 'Low' | 'Moderate' | 'High' | 'Critical';
  financial_health_score: number;
  financial_health_band: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  track_status: 'On Track' | 'Needs Attention' | 'At Risk';
  track_explanation: string;
  hourly_rate: number;
  hours_worked_equivalent: number;
  monthly_subscriptions: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  transaction_date: string;
  payment_method: string;
  is_essential: boolean;
  is_pending?: boolean;
  notes?: string;
}

export interface Commitment {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  category: string;
  is_essential: boolean;
  is_paid?: boolean;
}

export interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  is_paused: boolean;
  achievable?: boolean;
  progress_pct?: number;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billing_frequency: string;
  next_renewal_date: string;
  category: string;
  status: 'active' | 'paused' | 'cancelled';
  is_essential: boolean;
  monthly_equivalent: number;
  annual_cost: number;
  budget_share_pct: number;
}

export interface BudgetAllocation {
  id: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  overspent: boolean;
}

export interface SimulationResult {
  input: {
    action_type: string;
    title: string;
    amount: number;
    category: string;
    is_essential: boolean;
    billing_frequency?: string;
  };
  before: FinancialMetrics;
  after: FinancialMetrics;
  differences: {
    balance_diff: number;
    daily_allowance_diff: number;
    risk_score_diff: number;
    health_score_diff: number;
    survival_days_diff: number;
  };
  explanation: string;
  is_affordable: boolean;
}

export interface StressTestResult {
  test_type: string;
  test_title: string;
  scenario_desc: string;
  base_metrics: FinancialMetrics;
  stressed_metrics: FinancialMetrics;
  is_survivable: boolean;
  resilience_rating: string;
  shortfall_amount: number;
  allowance_drop: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  challenge_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  duration_days: number;
  status: 'in_progress' | 'completed' | 'paused';
  reward_badge: string;
}
