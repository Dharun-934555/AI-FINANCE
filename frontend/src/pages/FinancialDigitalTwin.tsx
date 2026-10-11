import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Cpu, ArrowRight, TrendingUp, Layers, CheckCircle } from 'lucide-react';

export const FinancialDigitalTwin: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading || !data) {
    return <div style={{ color: '#94a3b8', padding: '32px' }}>Loading Financial Digital Twin...</div>;
  }

  const m = data.metrics;

  const flowNodes = [
    { title: "Starting Funds", amount: `₹${m.starting_budget}`, desc: "Initial budget allotment", color: "#38bdf8" },
    { title: "Received Income", amount: `+₹${m.total_received_income}`, desc: "Freelance & earnings", color: "#a3e635" },
    { title: "Completed Expenses", amount: `-₹${m.total_completed_expenses}`, desc: "Food, transport, education", color: "#f43f5e" },
    { title: "Cash Balance", amount: `₹${m.current_cash_balance}`, desc: "Actual liquidity", color: "#fff" },
    { title: "Reserved Dues", amount: `-₹${m.total_unpaid_commitments}`, desc: "Broadband & hostel bills", color: "#fb923c" },
    { title: "Protected Savings", amount: `-₹${m.protected_savings}`, desc: "Headphones & cert fund", color: "#c084fc" },
    { title: "Spendable Buffer", amount: `₹${m.available_uncommitted_balance}`, desc: "True discretionary funds", color: "#a3e635" },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Financial Digital Twin</h1>
          <span className="badge badge-purple">Synchronized Topology</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
          A virtual model of your financial life connecting income, cash, commitments, and daily velocity in real-time.
        </p>
      </div>

      {/* Connected Financial Flow Map */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>
          Real-Time Capital Flow Topology
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          alignItems: 'center'
        }}>
          {flowNodes.map((node, i) => (
            <div key={i} style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '16px',
              position: 'relative',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                {node.title}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: node.color, margin: '8px 0 4px' }}>
                {node.amount}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {node.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Twin Dynamic Indicators & Causality Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
            System Causality Rules
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#cbd5e1' }}>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
              <strong>Commitment Protection:</strong> When you record ₹{m.total_unpaid_commitments} in upcoming bills, the Digital Twin isolates this from your spendable balance so you never bounce a payment.
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
              <strong>Safe Velocity Engine:</strong> Available buffer (₹{m.available_uncommitted_balance}) is distributed across {m.remaining_days} days to yield exactly ₹{m.safe_daily_allowance.toFixed(0)}/day.
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
              <strong>Protected Savings:</strong> Savings (₹{m.protected_savings}) are locked in target vaults and cannot be double-spent on discretionary groceries or entertainment.
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
            Current Twin Health Indices
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#cbd5e1' }}>Health Score</span>
                <span style={{ fontWeight: 700, color: '#a855f7' }}>{m.financial_health_score} / 100 ({m.financial_health_band})</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${m.financial_health_score}%`, height: '100%', background: '#a855f7', borderRadius: '999px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#cbd5e1' }}>Risk Exposure</span>
                <span style={{ fontWeight: 700, color: m.financial_risk_score > 60 ? '#fb7185' : '#a3e635' }}>
                  {m.financial_risk_score} / 100 ({m.financial_risk_band})
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${m.financial_risk_score}%`, height: '100%', background: m.financial_risk_score > 60 ? '#f43f5e' : '#a3e635', borderRadius: '999px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
