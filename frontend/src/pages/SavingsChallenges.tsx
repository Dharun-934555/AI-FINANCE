import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserChallenge } from '../types';
import { Award, CheckCircle, ShieldCheck, Plus, Flame } from 'lucide-react';

export const SavingsChallenges: React.FC = () => {
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const res = await api.getChallenges();
      setChallenges(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleJoin = async (id: string) => {
    try {
      await api.joinChallenge(id);
      loadChallenges();
    } catch (e: any) {
      alert(e.message || 'Failed to update challenge');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Savings Challenges & Streaks</h1>
          <span className="badge badge-lime">Gamification Hub</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Commit to bite-sized money streaks to build mindful spending habits and earn fintech credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {challenges.map((c) => {
          const pct = Math.min(100, Math.round((c.current_amount / c.target_amount) * 100));
          return (
            <div key={c.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-purple">{c.reward_badge}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#a3e635' }}>{c.duration_days} Days Streak</span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  {c.title}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#a3e635' }}>₹{c.current_amount}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Target: ₹{c.target_amount}</span>
                </div>

                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #a3e635, #06b6d4)', borderRadius: '999px' }} />
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => handleJoin(c.id)}
                  style={{
                    width: '100%',
                    background: c.status === 'in_progress' ? 'rgba(163,230,53,0.12)' : 'linear-gradient(135deg, #a3e635, #84cc16)',
                    color: c.status === 'in_progress' ? '#a3e635' : '#090d16',
                    border: c.status === 'in_progress' ? '1px solid rgba(163,230,53,0.3)' : 'none',
                    padding: '10px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {c.status === 'in_progress' ? 'Active in Challenge' : 'Accept Challenge'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
