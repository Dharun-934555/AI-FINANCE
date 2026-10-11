import React, { useState } from 'react';
import { api } from '../services/api';
import { SimulationResult } from '../types';
import { Sparkles, ArrowRight, CheckCircle2, XCircle, AlertTriangle, RefreshCw, ShoppingCart, ShieldCheck } from 'lucide-react';

const PRESET_SCENARIOS = [
  { title: "Buy ANC Headphones", amount: 2499, action_type: "purchase", category: "Shopping", desc: "Flagship Gen Z purchase simulation scenario A" },
  { title: "Weekend Cafe Outing", amount: 800, action_type: "entertainment", category: "Entertainment", desc: "Hangout with college circle" },
  { title: "Start Netflix / Prime Sub", amount: 299, action_type: "subscription", category: "Entertainment", desc: "Monthly recurring streaming subscription" },
  { title: "Unexpected Laptop Repair", amount: 2000, action_type: "unexpected", category: "Bills", desc: "Urgent emergency hardware shock" },
  { title: "Save to Certification Goal", amount: 1000, action_type: "savings", category: "Education", desc: "Direct deposit into learning fund" },
  { title: "Freelance UI Project Income", amount: 2500, action_type: "income", category: "Other", desc: "Client milestone payment" },
  { title: "Discretionary Sneaker Purchase", amount: 4000, action_type: "purchase", category: "Shopping", desc: "High discretionary outflow" },
];

export const WhatIfSimulator: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "Buy Headphones",
    amount: 2499,
    action_type: "purchase",
    category: "Shopping",
    is_essential: false,
    billing_frequency: "monthly"
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  const handleSimulate = async (dataToSimulate = formData) => {
    try {
      setLoading(true);
      setAppliedMessage(null);
      const res = await api.previewSimulation(dataToSimulate);
      setSimulationResult(res);
    } catch (err: any) {
      alert(err.message || "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!simulationResult) return;
    try {
      setLoading(true);
      const res = await api.applySimulation(simulationResult.input);
      setAppliedMessage(res.message);
      setSimulationResult(null);
    } catch (err: any) {
      alert(err.message || "Failed to commit decision");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setSimulationResult(null);
    setAppliedMessage(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>What-If Decision Simulator</h1>
          <span className="badge badge-purple">Sandbox Engine</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
          Test every financial decision before you spend. Compare instant vs Day-30 balance, daily burn rate, and savings goal impacts with zero financial risk.
        </p>
      </div>

      {appliedMessage && (
        <div style={{
          background: 'rgba(163, 230, 53, 0.15)',
          border: '1px solid rgba(163, 230, 53, 0.4)',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#a3e635',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={20} />
          {appliedMessage}
        </div>
      )}

      {/* Preset Quick Scenarios */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, marginBottom: '12px' }}>
          Preset Benchmark Scenarios (Prompt Spec)
        </div>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                const updated = {
                  title: preset.title,
                  amount: preset.amount,
                  action_type: preset.action_type,
                  category: preset.category,
                  is_essential: preset.action_type === 'unexpected',
                  billing_frequency: preset.action_type === 'subscription' ? 'monthly' : 'monthly'
                };
                setFormData(updated);
                handleSimulate(updated);
              }}
              style={{
                flexShrink: 0,
                background: formData.title === preset.title ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: formData.title === preset.title ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{preset.title}</div>
              <div style={{ fontSize: '12px', color: '#a3e635', fontWeight: 600, marginTop: '2px' }}>₹{preset.amount}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{preset.category}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Simulator Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Configure Decision
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Decision Title / Description
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#111622',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <option value="Shopping">Shopping</option>
                  <option value="Food">Food</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Transport">Transport</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Bills">Bills</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Action Type
              </label>
              <select
                value={formData.action_type}
                onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#111622',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="purchase">One-time Purchase</option>
                <option value="subscription">Recurring Subscription</option>
                <option value="unexpected">Unexpected / Emergency Expense</option>
                <option value="income">Additional Income</option>
                <option value="savings">Savings Contribution</option>
              </select>
            </div>

            <button
              onClick={() => handleSimulate()}
              disabled={loading}
              style={{
                marginTop: '10px',
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                color: '#fff',
                fontWeight: 700,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(168, 85, 247, 0.35)'
              }}
            >
              <Sparkles size={18} />
              {loading ? 'Running Engine Calculations...' : 'Simulate Consequence'}
            </button>
          </div>
        </div>

        {/* Before vs After Impact Visualizer */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              Impact Matrix (Before vs After)
            </h2>

            {!simulationResult ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                <Sparkles size={32} style={{ marginBottom: '12px', color: '#a855f7', opacity: 0.5 }} />
                <div>Click "Simulate Consequence" to run full calculations on your live budget state.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: simulationResult.is_affordable ? 'rgba(163, 230, 53, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  border: `1px solid ${simulationResult.is_affordable ? 'rgba(163, 230, 53, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                  color: '#fff',
                  fontSize: '13px',
                  lineHeight: 1.5
                }}>
                  {simulationResult.explanation}
                </div>

                {/* Metrics Table */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>Available Spendable</div>
                    <div style={{ fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                      ₹{simulationResult.before.available_uncommitted_balance} → <span style={{ color: simulationResult.after.available_uncommitted_balance >= 0 ? '#a3e635' : '#fb7185' }}>₹{simulationResult.after.available_uncommitted_balance}</span>
                    </div>
                  </div>

                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>Daily Allowance</div>
                    <div style={{ fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                      ₹{simulationResult.before.safe_daily_allowance.toFixed(0)} → <span style={{ color: '#c084fc' }}>₹{simulationResult.after.safe_daily_allowance.toFixed(0)}/d</span>
                    </div>
                  </div>

                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>Risk Score</div>
                    <div style={{ fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                      {simulationResult.before.financial_risk_score} → <span style={{ color: simulationResult.after.financial_risk_score > simulationResult.before.financial_risk_score ? '#fb7185' : '#a3e635' }}>{simulationResult.after.financial_risk_score}/100</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>Health Band</div>
                    <div style={{ fontWeight: 700, color: '#c084fc', marginTop: '4px' }}>
                      {simulationResult.before.financial_health_band} → {simulationResult.after.financial_health_band}
                    </div>
                  </div>

                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>Survival Runway</div>
                    <div style={{ fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                      {simulationResult.before.money_survival_days}d → {simulationResult.after.money_survival_days}d
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {simulationResult && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={handleApply}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)',
                  color: '#090d16',
                  fontWeight: 700,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Apply Decision (Save to DB)
              </button>
              <button
                onClick={handleDiscard}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer'
                }}
              >
                Discard Simulation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
