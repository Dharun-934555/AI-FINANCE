import React, { useState } from 'react';
import { api } from '../services/api';
import { StressTestResult } from '../types';
import { Activity, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export const FinancialStressTest: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState('unexpected_1000');
  const [result, setResult] = useState<StressTestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const tests = [
    { id: 'unexpected_1000', title: 'Unexpected ₹1,000 Outflow', desc: 'Medical emergency or quick device repair' },
    { id: 'unexpected_2000', title: 'Major ₹2,000 Crisis Outflow', desc: 'Large security deposit or urgent hospital bill' },
    { id: 'essential_surge', title: '+15% Utility & Grocery Surge', desc: 'Price hike on mandatory essentials' },
    { id: 'multi_emergency', title: 'Dual Shock (₹2,200 Shock)', desc: 'Multiple concurrent unplanned expenses' },
  ];

  const runTest = async (testId = selectedTest) => {
    try {
      setLoading(true);
      const res = await api.runStressTest(testId);
      setResult(res);
    } catch (e: any) {
      alert(e.message || 'Stress test failed');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runTest('unexpected_1000');
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Financial Stress Test Engine</h1>
          <span className="badge badge-rose">Resilience Diagnostics</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
          Subject your finances to extreme macro and personal shocks to measure vulnerability before real-life surprises occur.
        </p>
      </div>

      {/* Preset Test Chooser */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        {tests.map((t) => (
          <div
            key={t.id}
            onClick={() => {
              setSelectedTest(t.id);
              runTest(t.id);
            }}
            className="glass-card-interactive"
            style={{
              padding: '18px',
              cursor: 'pointer',
              border: selectedTest === t.id ? '1px solid #a3e635' : '1px solid rgba(255,255,255,0.08)',
              background: selectedTest === t.id ? 'rgba(163,230,53,0.08)' : 'rgba(255,255,255,0.03)'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{t.title}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Results Matrix */}
      {result && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{result.test_title}</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>{result.scenario_desc}</p>
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              padding: '6px 14px',
              borderRadius: '999px',
              background: result.is_survivable ? 'rgba(163,230,53,0.15)' : 'rgba(244,63,94,0.15)',
              color: result.is_survivable ? '#a3e635' : '#fb7185'
            }}>
              {result.resilience_rating.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Initial Spendable</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                ₹{result.base_metrics.available_uncommitted_balance}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Post-Shock Spendable</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: result.stressed_metrics.available_uncommitted_balance >= 0 ? '#a3e635' : '#fb7185', marginTop: '4px' }}>
                ₹{result.stressed_metrics.available_uncommitted_balance}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Daily Allowance Drop</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#fb7185', marginTop: '4px' }}>
                -₹{result.allowance_drop.toFixed(0)}/day
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Post-Shock Risk Score</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: result.stressed_metrics.financial_risk_score > 60 ? '#fb7185' : '#fbbf24', marginTop: '4px' }}>
                {result.stressed_metrics.financial_risk_score} / 100
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
