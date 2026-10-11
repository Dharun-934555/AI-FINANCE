import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PieChart, Sliders, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';

export const BudgetPlanner: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    try {
      setLoading(true);
      const res = await api.getBudget();
      setData(res);
      setAllocations(res.allocations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocationChange = (id: string, amount: number) => {
    setAllocations(allocations.map(a => a.id === id ? { ...a, allocated_amount: amount } : a));
  };

  const handleSaveAllocations = async () => {
    try {
      setIsSaving(true);
      await api.updateAllocations(allocations);
      alert('Allocations updated successfully');
      loadBudget();
    } catch (e: any) {
      alert(e.message || 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !data) {
    return <div style={{ color: '#94a3b8', padding: '32px' }}>Loading Budget Planner...</div>;
  }

  const totalAllocated = allocations.reduce((acc, curr) => acc + Number(curr.allocated_amount || 0), 0);
  const startingBudget = data.starting_budget || 10000;
  const isOverallocated = totalAllocated > startingBudget;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Category Budget Planner</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Allocate limits across essential and discretionary spending pillars for your 30-day window.
          </p>
        </div>
        <button
          onClick={handleSaveAllocations}
          disabled={isSaving}
          style={{
            background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)',
            color: '#090d16',
            fontWeight: 700,
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isSaving ? 'Saving...' : 'Save Category Allocations'}
        </button>
      </div>

      {/* Allocation Summary Card */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            Allocated vs Total Starting Budget
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: isOverallocated ? '#fb7185' : '#a3e635', marginTop: '4px' }}>
            ₹{totalAllocated.toLocaleString()} / ₹{startingBudget.toLocaleString()}
          </div>
        </div>
        {isOverallocated && (
          <div style={{ color: '#fb7185', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            Total allocations exceed starting budget by ₹{(totalAllocated - startingBudget).toLocaleString()}!
          </div>
        )}
      </div>

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {allocations.map((a) => {
          const pctSpent = a.allocated_amount > 0 ? Math.min(100, Math.round((a.spent_amount / a.allocated_amount) * 100)) : 0;
          return (
            <div key={a.id} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{a.category}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: a.overspent ? '#fb7185' : '#a3e635',
                  background: a.overspent ? 'rgba(244,63,94,0.15)' : 'rgba(163,230,53,0.15)',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}>
                  {a.overspent ? 'Over Budget' : `${pctSpent}% Spent`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                <span>Spent: ₹{a.spent_amount}</span>
                <span>Remaining: ₹{a.remaining_amount}</span>
              </div>

              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{
                  width: `${pctSpent}%`,
                  height: '100%',
                  background: a.overspent ? '#f43f5e' : 'linear-gradient(90deg, #a3e635, #06b6d4)',
                  borderRadius: '999px'
                }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Target Limit (₹)
                </label>
                <input
                  type="number"
                  value={a.allocated_amount}
                  onChange={(e) => handleAllocationChange(a.id, Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
