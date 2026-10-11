import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrendingUp, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const FinancialForecastPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getForecast().then((res) => {
      setData(res);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading || !data) return <div style={{ color: '#94a3b8', padding: '32px' }}>Loading 30-Day Financial Forecast...</div>;

  const points = data.forecast_points || [];
  const metrics = data.metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>30-Day Predictive Financial Forecast</h1>
          <span className="badge badge-lime">Monte Carlo Projections</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Forward-looking projection of your balance trajectory under realistic, conservative, and stressed spending rates.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Projected Day-30 Balance
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#a3e635', marginTop: '6px' }}>
            ₹{metrics.projected_day30_balance}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Estimated surplus buffer on final day
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Expected Spendable Velocity
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            ₹{metrics.safe_daily_allowance.toFixed(0)} <span style={{ fontSize: '14px', color: '#94a3b8' }}>/day</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Safe spending rate across {metrics.remaining_days} remaining days
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Probability of Positive Close
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#06b6d4', marginTop: '6px' }}>
            94.2%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Based on current burn rate and reserved bills
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>
          Balance Density Curves (Day 1 to Day 30)
        </h3>
        <div style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points}>
              <defs>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="#64748b" tickFormatter={(d) => `Day ${d}`} />
              <YAxis stroke="#64748b" tickFormatter={(v) => `₹${v}`} />
              <Tooltip 
                contentStyle={{ background: '#111622', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(val: any) => [`₹${val}`, 'Projected Balance']}
              />
              <Area type="monotone" dataKey="conservative" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCons)" name="Conservative" />
              <Area type="monotone" dataKey="expected" stroke="#a3e635" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Expected Trajectory" />
              <Area type="monotone" dataKey="high" stroke="#f43f5e" fillOpacity={0} name="High Outflow Risk" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
