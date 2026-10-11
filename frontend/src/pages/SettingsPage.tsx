import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Settings, User, Sliders, Shield, RotateCcw, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyIncome, setMonthlyIncome] = useState(10000);
  const [emergencyBuffer, setEmergencyBuffer] = useState(1500);

  useEffect(() => {
    api.getDashboardSummary().then((res) => {
      setProfile(res.profile);
      setMonthlyIncome(res.metrics.starting_budget || 10000);
      setEmergencyBuffer(res.metrics.emergency_reserve || 1500);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset all demo transactions and return to clean 30-day ₹10,000 state?")) {
      await api.resetDemo();
      window.location.reload();
    }
  };

  if (loading) return <div style={{ color: '#94a3b8', padding: '32px' }}>Loading settings...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Profile & Simulation Preferences</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Tune baseline salary rates, emergency reserve thresholds, and reset demo data.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* User Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #a3e635, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '24px', color: '#090d16'
            }}>
              {profile?.full_name ? profile.full_name[0] : 'G'}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{profile?.full_name || 'Gen Z Explorer'}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>demo_user@finora.ai</div>
              <span className="badge badge-lime" style={{ marginTop: '4px', display: 'inline-block' }}>Demo Active</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span>Base Currency</span>
              <strong style={{ color: '#fff' }}>INR (₹)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span>Budget Cycle</span>
              <strong style={{ color: '#fff' }}>30 Days Window</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span>Hourly Labor Rate</span>
              <strong style={{ color: '#a3e635' }}>₹125/hr</strong>
            </div>
          </div>
        </div>

        {/* Engine Parameters & Demo Reset */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              Simulation Engine Controls
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Starting Monthly Budget (₹)
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Emergency Reserve Threshold (₹)
                </label>
                <input
                  type="number"
                  value={emergencyBuffer}
                  onChange={(e) => setEmergencyBuffer(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={handleReset}
              style={{
                width: '100%',
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#fb7185',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RotateCcw size={16} /> Reset Demo Simulation to Day 1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
