import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FinancialMetrics } from '../types';
import { 
  TrendingUp, AlertTriangle, CheckCircle, Shield, Wallet, Sparkles, 
  ArrowUpRight, ArrowDownRight, Calendar, HeartPulse, ChevronRight 
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#a3e635', '#a855f7', '#06b6d4', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899', '#10b981'];

export const OverviewDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading RupeeWise Intelligence Hub...</div>
      </div>
    );
  }

  const m: FinancialMetrics = data.metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(163, 230, 53, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
        border: '1px solid rgba(163, 230, 53, 0.2)',
        borderRadius: '20px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Financial Intelligence Overview
            </h1>
            <span style={{
              background: m.track_status === 'On Track' ? 'rgba(163, 230, 53, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              color: m.track_status === 'On Track' ? '#a3e635' : '#fb7185',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              {m.track_status}
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '650px', lineHeight: 1.5 }}>
            {m.track_explanation}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/simulator')}
            style={{
              background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)',
              color: '#090d16',
              fontWeight: 700,
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(163, 230, 53, 0.3)'
            }}
          >
            <Sparkles size={16} /> Simulate a Purchase
          </button>
          <button
            onClick={() => navigate('/health-center')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              fontWeight: 600,
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer'
            }}
          >
            Health Diagnostics
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Available Uncommitted Balance */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            Available Spendable
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: m.available_uncommitted_balance >= 0 ? '#a3e635' : '#f43f5e' }}>
            ₹{m.available_uncommitted_balance.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            Cash: ₹{m.current_cash_balance.toLocaleString()} (₹{m.total_unpaid_commitments} reserved)
          </div>
        </div>

        {/* Safe Daily Allowance */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            Safe Daily Allowance
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
            ₹{m.safe_daily_allowance.toFixed(0)} <span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>/day</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            Across {m.remaining_days} remaining days
          </div>
        </div>

        {/* Money Survival Runway */}
        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => navigate('/survival-meter')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Survival Runway</span>
            <span style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: m.survival_status === 'safe' ? 'rgba(163, 230, 53, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              color: m.survival_status === 'safe' ? '#a3e635' : '#fb7185',
              fontWeight: 700
            }}>
              {m.survival_status.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
            {m.money_survival_days} <span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>days</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            Target: {m.remaining_days} days to month completion
          </div>
        </div>

        {/* Health Score */}
        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => navigate('/health-center')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Financial Health</span>
            <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: 700 }}>{m.financial_health_band}</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#c084fc' }}>
            {m.financial_health_score}<span style={{ fontSize: '16px', color: '#94a3b8' }}>/100</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            Risk Score: {m.financial_risk_score} ({m.financial_risk_band})
          </div>
        </div>
      </div>

      {/* Middle Row: Spending Distribution & Upcoming Commitments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Spending Category Donut */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Spending Breakdown</h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total: ₹{m.total_completed_expenses}</span>
          </div>
          <div style={{ height: '220px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={data.category_spending}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {data.category_spending.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`₹${val}`, 'Spent']}
                  contentStyle={{ background: '#111622', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              {data.category_spending.slice(0, 5).map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: '#cbd5e1' }}>{item.category}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#fff' }}>₹{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reserved Commitments & Subscriptions */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Upcoming Reserved Commitments</h3>
            <span style={{ fontSize: '12px', color: '#a3e635' }}>Protected from spendable</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.upcoming_commitments.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '13px' }}>No pending commitments.</div>
            ) : (
              data.upcoming_commitments.map((c: any) => (
                <div key={c.id} style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff' }}>{c.title}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Due: {c.due_date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#fb7185' }}>₹{c.amount}</div>
                    <span style={{ fontSize: '10px', color: '#a3e635' }}>Reserved</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions & Savings Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Recent Activity */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Recent Transactions</h3>
            <button
              onClick={() => navigate('/transactions')}
              style={{ background: 'none', border: 'none', color: '#a3e635', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
            >
              View All →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.recent_transactions.map((tx: any) => (
              <div key={tx.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff' }}>{tx.description}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{tx.category} · {tx.transaction_date}</div>
                </div>
                <div style={{
                  fontWeight: 700,
                  fontSize: '14px',
                  color: tx.type === 'income' ? '#a3e635' : '#f8fafc'
                }}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Goals Widget */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Protected Savings Goals</h3>
            <button
              onClick={() => navigate('/savings')}
              style={{ background: 'none', border: 'none', color: '#c084fc', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
            >
              Manage Goals →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data.savings_goals.map((g: any) => (
              <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{g.title}</span>
                  <span style={{ color: '#a3e635', fontWeight: 700 }}>₹{g.current_amount} / ₹{g.target_amount}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, g.progress_pct)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #a3e635 0%, #06b6d4 100%)',
                    borderRadius: '999px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
