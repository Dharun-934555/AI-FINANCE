import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HeartPulse, AlertTriangle, ShieldCheck, TrendingDown, DollarSign } from 'lucide-react';

export const MoneySurvivalMeter: React.FC = () => {
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
    return <div style={{ color: '#94a3b8', padding: '32px' }}>Computing Survival Runway...</div>;
  }

  const m = data.metrics;
  const runway = m.money_survival_days;
  const remaining = m.remaining_days;
  const gap = runway - remaining;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Money Survival Meter</h1>
          <span className={`badge ${m.survival_status === 'safe' ? 'badge-lime' : 'badge-rose'}`}>
            Runway Intelligence
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
          Estimates how many days your cash will last based on transparent essential commitments and baseline spending rates.
        </p>
      </div>

      {/* Runway Gauge Card */}
      <div className="glass-panel" style={{
        padding: '36px',
        textAlign: 'center',
        background: m.survival_status === 'safe'
          ? 'radial-gradient(circle at 50% 20%, rgba(163, 230, 53, 0.12) 0%, rgba(17, 22, 34, 0.8) 70%)'
          : 'radial-gradient(circle at 50% 20%, rgba(244, 63, 94, 0.12) 0%, rgba(17, 22, 34, 0.8) 70%)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
          <HeartPulse size={18} color={m.survival_status === 'safe' ? '#a3e635' : '#fb7185'} />
          Projected Cash Runway
        </div>

        <div style={{
          fontSize: '72px',
          fontWeight: 900,
          color: m.survival_status === 'safe' ? '#a3e635' : '#fb7185',
          lineHeight: 1.1,
          marginTop: '12px'
        }}>
          {runway} <span style={{ fontSize: '28px', color: '#cbd5e1', fontWeight: 600 }}>Days</span>
        </div>

        <div style={{
          maxWidth: '500px',
          margin: '16px auto 0',
          fontSize: '15px',
          color: '#cbd5e1',
          lineHeight: 1.5
        }}>
          {gap >= 0 ? (
            <span style={{ color: '#a3e635' }}>
              ✅ Your funds cover the entire 30-day budget period with a {gap}-day surplus safety cushion!
            </span>
          ) : (
            <span style={{ color: '#fb7185' }}>
              ⚠️ Deficit Alert: Your money is projected to run out in {runway} days, but you have {remaining} days remaining in this budget cycle ({Math.abs(gap)} day shortfall).
            </span>
          )}
        </div>

        {/* Progress bar comparison */}
        <div style={{ maxWidth: '600px', margin: '30px auto 0', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
            <span>Runway Progress</span>
            <span>{runway} / {remaining} Days needed</span>
          </div>
          <div style={{ width: '100%', height: '14px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, Math.round((runway / Math.max(1, remaining)) * 100))}%`,
              height: '100%',
              background: m.survival_status === 'safe' ? 'linear-gradient(90deg, #a3e635, #10b981)' : 'linear-gradient(90deg, #f43f5e, #f59e0b)',
              borderRadius: '999px'
            }} />
          </div>
        </div>
      </div>

      {/* Runway Assumptions & Stress Scenarios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Conservative Pace
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#06b6d4', marginTop: '6px' }}>
            {Math.round(runway * 1.4)} Days
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            If dining out is limited and discretionary spending is cut by 30%.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Baseline Expected Pace
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            {runway} Days
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            At current safe allowance of ₹{m.safe_daily_allowance.toFixed(0)}/day.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            High Spending Stress
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#fb7185', marginTop: '6px' }}>
            {Math.max(1, Math.round(runway * 0.7))} Days
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            If frequent party/shopping outings accelerate burn rate by 35%.
          </p>
        </div>
      </div>
    </div>
  );
};
