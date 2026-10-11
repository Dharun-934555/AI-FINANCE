import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AlertOctagon, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const CrisisRecovery: React.FC = () => {
  const [emergencyAmount, setEmergencyAmount] = useState(2000);
  const [crisisData, setCrisisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadCrisis = async (amt = emergencyAmount) => {
    try {
      setLoading(true);
      const res = await api.getCrisisRecovery(amt);
      setCrisisData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrisis();
  }, []);

  const handleSelectAmount = (amt: number) => {
    setEmergencyAmount(amt);
    loadCrisis(amt);
  };

  if (loading || !crisisData) {
    return <div style={{ color: '#94a3b8', padding: '32px' }}>Simulating Crisis Recovery Protocols...</div>;
  }

  const { base_metrics, crisis_metrics, recovered_allowance, steps, is_shortfall, shortfall_amount } = crisisData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Emergency & Crisis Recovery Mode</h1>
          <span className="badge badge-rose">Triage Engine</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
          When financial shocks hit, calculate a prioritized 7-step recovery plan without predatory borrowing or sacrificing healthcare and food.
        </p>
      </div>

      {/* Preset Emergency Buttons */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>
          Select Simulated Emergency Shock Outflow:
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[500, 1000, 2000, 3000].map((amt) => (
            <button
              key={amt}
              onClick={() => handleSelectAmount(amt)}
              style={{
                background: emergencyAmount === amt ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' : 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: emergencyAmount === amt ? '1px solid #fb7185' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              ₹{amt} Emergency Shock
            </button>
          ))}
        </div>
      </div>

      {/* Immediate Shock Consequence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Uncommitted Spendable After Shock</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: crisis_metrics.available_uncommitted_balance >= 0 ? '#a3e635' : '#fb7185', marginTop: '6px' }}>
            ₹{crisis_metrics.available_uncommitted_balance}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Down from ₹{base_metrics.available_uncommitted_balance}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Adjusted Daily Discretionary Burn</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#c084fc', marginTop: '6px' }}>
            ₹{recovered_allowance.toFixed(0)} <span style={{ fontSize: '13px', color: '#94a3b8' }}>/day</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Recalculated with optional subscriptions frozen
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Risk Score Surge</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#fb7185', marginTop: '6px' }}>
            {crisis_metrics.financial_risk_score} / 100
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            +{crisis_metrics.financial_risk_score - base_metrics.financial_risk_score} points under stress
          </div>
        </div>
      </div>

      {/* Prioritized Action Plan */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '18px' }}>
          Prioritized Action Steps (Crisis Recovery Protocol)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {steps.map((s: any, idx: number) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '16px',
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#fb7185',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
                flexShrink: 0
              }}>
                {s.priority}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{s.title}</div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px' }}>{s.action}</div>
                <div style={{ fontSize: '12px', color: '#a3e635', marginTop: '4px', fontWeight: 600 }}>{s.impact}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
