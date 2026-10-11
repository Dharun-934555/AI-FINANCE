import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const FinancialTimeMachine: React.FC = () => {
  const [forecastData, setForecastData] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    try {
      setLoading(true);
      const res = await api.getForecast();
      setForecastData(res);
      if (res.metrics?.elapsed_days) {
        setSelectedDay(Math.min(30, res.metrics.elapsed_days + 5));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !forecastData) {
    return <div style={{ color: '#94a3b8', padding: '32px' }}>Loading Time Machine Projections...</div>;
  }

  const points = forecastData.forecast_points || [];
  const currentPoint = points.find((p: any) => p.day === selectedDay) || points[0];

  const checkpoints = [1, 3, 7, 15, 21, 30];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Financial Time Machine</h1>
          <span className="badge badge-purple">Temporal Simulation</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
          Scrub across all 30 days to preview your projected balance, upcoming renewals, and cash shortages before they happen.
        </p>
      </div>

      {/* Checkpoint Jump Buttons */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={18} color="#c084fc" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>Jump to Checkpoint:</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {checkpoints.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                background: selectedDay === day ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedDay === day ? '#fff' : '#94a3b8',
                border: selectedDay === day ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Day {day}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Time Scrubber Slider */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
            Time Scrubber: <span style={{ color: '#a3e635' }}>Day {selectedDay} of 30</span> ({currentPoint.date})
          </span>
          {currentPoint.event && (
            <span className="badge badge-rose">{currentPoint.event}</span>
          )}
        </div>
        <input
          type="range"
          min="1"
          max="30"
          value={selectedDay}
          onChange={(e) => setSelectedDay(Number(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            accentColor: '#a855f7',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
          <span>Day 1 (Start)</span>
          <span>Day 15 (Midpoint)</span>
          <span>Day 30 (Final Balance)</span>
        </div>
      </div>

      {/* Selected Day State Snapshot */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Expected Remaining Balance</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#a3e635', marginTop: '6px' }}>
            ₹{currentPoint.expected}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Under regular safe daily pace</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Conservative Scenario</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#06b6d4', marginTop: '6px' }}>
            ₹{currentPoint.conservative}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>If you save 30% on discretionary</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>High Spending Risk</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: currentPoint.high < 1000 ? '#fb7185' : '#fbbf24', marginTop: '6px' }}>
            ₹{currentPoint.high}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>If overspending by 35% on outings</div>
        </div>
      </div>

      {/* Trajectory Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          30-Day Multi-Scenario Balance Trajectory
        </h3>
        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="#64748b" tickFormatter={(v) => `D${v}`} />
              <YAxis stroke="#64748b" tickFormatter={(v) => `₹${v}`} />
              <Tooltip 
                contentStyle={{ background: '#111622', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(val: any) => [`₹${val}`, 'Balance']}
              />
              <Line type="monotone" dataKey="expected" stroke="#a3e635" strokeWidth={3} dot={false} name="Expected" />
              <Line type="monotone" dataKey="conservative" stroke="#06b6d4" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Conservative" />
              <Line type="monotone" dataKey="high" stroke="#f43f5e" strokeWidth={2} dot={false} name="High Spending" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
