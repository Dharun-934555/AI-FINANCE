import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Subscription } from '../types';
import { RefreshCw, Plus, Pause, Play, Trash2, AlertCircle } from 'lucide-react';

export const SubscriptionManager: React.FC = () => {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    billing_frequency: 'monthly',
    next_renewal_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    category: 'Entertainment',
    is_essential: false
  });

  const loadSubs = async () => {
    try {
      setLoading(true);
      const res = await api.getSubscriptions();
      setSubs(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubs();
  }, []);

  const handleToggle = async (id: string, currentStatus: string) => {
    const nextAction = currentStatus === 'active' ? 'pause' : 'activate';
    try {
      await api.toggleSubscriptionStatus(id, nextAction);
      loadSubs();
    } catch (e: any) {
      alert(e.message || 'Action failed');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.name || !newSub.amount) return;
    try {
      await api.createSubscription({
        ...newSub,
        amount: Number(newSub.amount)
      });
      setShowModal(false);
      setNewSub({
        name: '',
        amount: '',
        billing_frequency: 'monthly',
        next_renewal_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        category: 'Entertainment',
        is_essential: false
      });
      loadSubs();
    } catch (e: any) {
      alert(e.message || 'Failed to add subscription');
    }
  };

  const totalMonthlyCost = subs.filter(s => s.status === 'active').reduce((acc, s) => acc + s.monthly_equivalent, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Subscription Leak Detector</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Identify silent recurring drains and simulate pausing non-essential services.
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
          <Plus size={18} /> Add Subscription
        </button>
      </div>

      {/* Summary KPI */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Active Monthly Outflow
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fb7185', marginTop: '4px' }}>
            ₹{totalMonthlyCost.toLocaleString()} <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>/month</span>
          </div>
        </div>
        <div style={{ fontSize: '13px', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '12px 18px', borderRadius: '10px' }}>
          Annualized commitment: <strong style={{ color: '#fff' }}>₹{(totalMonthlyCost * 12).toLocaleString()}/yr</strong>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {subs.map((s) => (
          <div key={s.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge badge-purple">{s.category}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: s.status === 'active' ? '#a3e635' : '#fb7185',
                  background: s.status === 'active' ? 'rgba(163,230,53,0.15)' : 'rgba(244,63,94,0.15)',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}>
                  {s.status.toUpperCase()}
                </span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                {s.name}
              </h3>

              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                ₹{s.amount} <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>/{s.billing_frequency}</span>
              </div>

              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Next renewal: <strong style={{ color: '#cbd5e1' }}>{s.next_renewal_date}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Takes <strong style={{ color: '#c084fc' }}>{s.budget_share_pct}%</strong> of your monthly allowance.
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => handleToggle(s.id, s.status)}
                style={{
                  width: '100%',
                  background: s.status === 'active' ? 'rgba(244,63,94,0.15)' : 'rgba(163,230,53,0.15)',
                  color: s.status === 'active' ? '#fb7185' : '#a3e635',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {s.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                {s.status === 'active' ? 'Simulate Pause Service' : 'Reactivate Service'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel" style={{ width: '400px', padding: '28px', background: '#111622' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Add Subscription</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Spotify"
                  value={newSub.name}
                  onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="199"
                    value={newSub.amount}
                    onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Frequency</label>
                  <select
                    value={newSub.billing_frequency}
                    onChange={(e) => setNewSub({ ...newSub, billing_frequency: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#192234', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Next Renewal Date</label>
                <input
                  type="date"
                  value={newSub.next_renewal_date}
                  onChange={(e) => setNewSub({ ...newSub, next_renewal_date: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#a3e635', color: '#090d16', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Save Subscription
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
