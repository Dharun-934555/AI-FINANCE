import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldCheck, AlertTriangle, CheckCircle, TrendingUp, HeartPulse } from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export const HealthCenter: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const res = await api.getHealthCenter();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div style={{ color: '#94a3b8', padding: '32px' }}>Loading Financial Health Center...</div>;
  }

  const { metrics, health_components, risk_breakdown, recommendations } = data;

  const scoreData = [
    { name: 'Health', value: metrics.financial_health_score, fill: '#a855f7' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Financial Health & Risk Center</h1>
          <span className="badge badge-purple">Diagnostic Hub</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
          Comprehensive diagnostic scorecard tracking budget pacing, commitment coverage, savings rate, and vulnerability vectors.
        </p>
      </div>

      {/* Main Scores Top Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Health Score Card */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '130px', height: '130px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="75%" outerRadius="100%" barSize={12} data={scoreData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>{metrics.financial_health_score}</span>
              <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>/100</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Overall Health Rating
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
              {metrics.financial_health_band}
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
              Pacing aligns smoothly with the 30-day target timeline.
            </p>
          </div>
        </div>

        {/* Risk Score Card */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Financial Risk Exposure
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: metrics.financial_risk_score > 60 ? '#fb7185' : '#a3e635', marginTop: '4px' }}>
              {metrics.financial_risk_score} <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 500 }}>/100</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              Risk Band: <span style={{ color: metrics.financial_risk_band === 'Low' ? '#a3e635' : '#fb7185' }}>{metrics.financial_risk_band}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              Calculated from commitment obligations and daily burn velocity.
            </p>
          </div>
        </div>
      </div>

      {/* Health Components Breakdown */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '18px' }}>
          4-Pillar Diagnostic Matrix
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {health_components.map((comp: any, i: number) => {
            const pct = Math.round((comp.score / comp.max_score) * 100);
            return (
              <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{comp.pillar}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#a3e635' }}>{comp.score}/{comp.max_score}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#a3e635', borderRadius: '999px' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{comp.status}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          Personalized Prescriptions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recommendations.map((rec: string, idx: number) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#cbd5e1' }}>
              <CheckCircle size={16} color="#a3e635" style={{ flexShrink: 0 }} />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
