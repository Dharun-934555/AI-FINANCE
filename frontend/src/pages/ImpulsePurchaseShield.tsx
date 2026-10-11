import React, { useState } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Clock, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

export const ImpulsePurchaseShield: React.FC = () => {
  const [amount, setAmount] = useState(2499);
  const [itemTitle, setItemTitle] = useState("Wireless ANC Headphones");
  const [category, setCategory] = useState("Shopping");
  const [coolingHours, setCoolingHours] = useState(24);
  const [isSaved, setIsSaved] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  React.useEffect(() => {
    api.getDashboardSummary().then(res => setMetrics(res.metrics)).catch(console.error);
  }, []);

  if (!metrics) {
    return <div style={{ color: '#94a3b8', padding: '32px' }}>Loading Purchase Reflection Shield...</div>;
  }

  const spendable = Math.max(1, metrics.available_uncommitted_balance);
  const pctOfSpendable = Math.round((amount / spendable) * 100);
  const remainingDays = Math.max(1, metrics.remaining_days);
  const dailyImpact = amount / remainingDays;
  const hoursOfWork = (amount / metrics.hourly_rate).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Impulse Purchase Shield</h1>
          <span className="badge badge-amber">Mindful Spending</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
          A non-judgmental reflection checkpoint. Convert impulsive wants into real life-energy hours and daily allowance sacrifices before tapping UPI.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Purchase Configuration */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            What are you thinking of buying?
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Item Name</label>
              <input
                type="text"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Price (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Cooling-off Lock Period</label>
              <select
                value={coolingHours}
                onChange={(e) => setCoolingHours(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 14px', background: '#192234', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
              >
                <option value={12}>12 Hours (Quick sanity check)</option>
                <option value={24}>24 Hours (Standard impulse rule)</option>
                <option value={48}>48 Hours (High-ticket contemplation)</option>
                <option value={72}>72 Hours (Weekend reflection)</option>
              </select>
            </div>

            <button
              onClick={() => setIsSaved(true)}
              style={{
                marginTop: '10px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#fff',
                fontWeight: 700,
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Clock size={16} /> Save to {coolingHours}h Cooling Vault
            </button>
            {isSaved && (
              <div style={{ fontSize: '12px', color: '#a3e635', textAlign: 'center', fontWeight: 600 }}>
                ✅ Added to cooling list! We will remind you to reconsider tomorrow.
              </div>
            )}
          </div>
        </div>

        {/* Trade-off Reflection Matrix */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            The Reality Check Matrix
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Life energy hours */}
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
              <div style={{ fontSize: '12px', color: '#c084fc', fontWeight: 700 }}>LIFE ENERGY SACRIFICE</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {hoursOfWork} Hours of Hard Work
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                At your ₹{metrics.hourly_rate}/hour earning rate, buying this costs you almost {hoursOfWork} hours of freelance labor.
              </p>
            </div>

            {/* Share of Spendable */}
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: pctOfSpendable > 40 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '12px', color: pctOfSpendable > 40 ? '#fb7185' : '#cbd5e1', fontWeight: 700 }}>BUDGET IMPACT SHARE</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {pctOfSpendable}% of All Spendable Cash
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Leaves you with only ₹{Math.max(0, spendable - amount)} uncommitted funds for the next {remainingDays} days.
              </p>
            </div>

            {/* Daily reduction */}
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 700 }}>DAILY ALLOWANCE COMPRESSION</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fb7185', marginTop: '4px' }}>
                -₹{dailyImpact.toFixed(0)}/day
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Slices your daily food & travel allowance down to ₹{Math.max(0, metrics.safe_daily_allowance - dailyImpact).toFixed(0)}/day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
