import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SavingsGoal } from '../types';
import { PiggyBank, Plus, CheckCircle, PauseCircle, PlayCircle, Target } from 'lucide-react';

export const SavingsGoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [contribGoalId, setContribGoalId] = useState<string | null>(null);
  const [contribAmount, setContribAmount] = useState('');

  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    current_amount: '0',
    target_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    category: 'Gadgets'
  });

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await api.getSavingsGoals();
      setGoals(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target_amount) return;
    try {
      await api.createSavingsGoal({
        ...newGoal,
        target_amount: Number(newGoal.target_amount),
        current_amount: Number(newGoal.current_amount)
      });
      setShowModal(false);
      setNewGoal({
        title: '',
        target_amount: '',
        current_amount: '0',
        target_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        category: 'Gadgets'
      });
      loadGoals();
    } catch (err: any) {
      alert(err.message || 'Failed to create savings goal');
    }
  };

  const handleTogglePause = async (id: string) => {
    try {
      await api.togglePauseGoal(id);
      loadGoals();
    } catch (e: any) {
      alert(e.message || 'Failed to toggle pause');
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribGoalId || !contribAmount) return;
    try {
      await api.addSavingsContribution(contribGoalId, Number(contribAmount), "App Deposit");
      setContribGoalId(null);
      setContribAmount('');
      loadGoals();
    } catch (err: any) {
      alert(err.message || 'Contribution failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Protected Savings Goals</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Funds deposited into goals are ringfenced from your daily spendable allowance.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
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
            gap: '8px'
          }}
        >
          <Plus size={18} /> New Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
          return (
            <div key={g.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-purple">{g.category}</span>
                  <button
                    onClick={() => handleTogglePause(g.id)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                  >
                    {g.is_paused ? <PlayCircle size={14} color="#a3e635" /> : <PauseCircle size={14} />}
                    {g.is_paused ? 'Resume' : 'Pause'}
                  </button>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  {g.title}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#a3e635' }}>₹{g.current_amount.toLocaleString()}</span>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Target: ₹{g.target_amount.toLocaleString()}</span>
                </div>

                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #a3e635, #06b6d4)',
                    borderRadius: '999px'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                  <span>{pct}% Completed</span>
                  <span>Target Date: {g.target_date}</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => setContribGoalId(g.id)}
                  style={{
                    width: '100%',
                    background: 'rgba(163, 230, 53, 0.12)',
                    color: '#a3e635',
                    border: '1px solid rgba(163, 230, 53, 0.3)',
                    padding: '8px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Deposit Funds (+₹)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribution Modal */}
      {contribGoalId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel" style={{ width: '380px', padding: '24px', background: '#111622' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Deposit to Goal</h3>
            <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="number"
                placeholder="Amount (₹)"
                required
                min="1"
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" style={{ flex: 1, background: '#a3e635', color: '#090d16', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Confirm Deposit
                </button>
                <button type="button" onClick={() => setContribGoalId(null)} style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel" style={{ width: '420px', padding: '28px', background: '#111622' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Create Savings Goal</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony ANC Headphones"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Target (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2500"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#192234', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  >
                    <option value="Gadgets">Gadgets</option>
                    <option value="Education">Education</option>
                    <option value="Travel">Travel</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Target Date</label>
                <input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#a3e635', color: '#090d16', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Create Goal
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
