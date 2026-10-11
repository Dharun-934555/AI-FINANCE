import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Sparkles, Lock, Mail, User, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
  darkMode?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, darkMode = true }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({ email, password });
        api.setToken(res.access_token);
        onLoginSuccess({ id: res.user_id, username: res.username });
        navigate('/overview');
      } else {
        if (!username.trim()) {
          throw new Error('Please enter a username');
        }
        const res = await api.register({ email, username, password });
        api.setToken(res.access_token);
        onLoginSuccess({ id: res.user_id, username: res.username });
        navigate('/overview');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.demoLogin();
      api.setToken(res.access_token);
      onLoginSuccess({ id: 'demo-user-0000-0000-000000000001', username: res.username });
      navigate('/overview');
    } catch (err: any) {
      setError(err.message || 'Failed to start demo session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: darkMode 
        ? 'radial-gradient(circle at 50% 10%, rgba(163, 230, 53, 0.08) 0%, rgba(10, 13, 20, 0.98) 70%)'
        : 'radial-gradient(circle at 50% 10%, rgba(101, 163, 13, 0.1) 0%, rgba(241, 245, 249, 1) 70%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: darkMode ? 'rgba(17, 24, 39, 0.85)' : '#ffffff',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '36px 32px',
        boxShadow: darkMode 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(163, 230, 53, 0.1)'
          : '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #a3e635 0%, #4ade80 50%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(163, 230, 53, 0.4)',
            marginBottom: '16px'
          }}>
            <span style={{ color: '#090d16', fontSize: '28px', fontWeight: 800 }}>₹</span>
          </div>

          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: darkMode ? '#ffffff' : '#0f172a',
            margin: '0 0 6px 0'
          }}>
            Finora <span style={{ color: '#a3e635', fontSize: '13px', background: 'rgba(163, 230, 53, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>AI</span>
          </h1>
          <p style={{
            fontSize: '13px',
            color: darkMode ? '#94a3b8' : '#64748b',
            margin: 0
          }}>
            Your money. Your decisions. Your future.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: '9px',
              border: 'none',
              background: isLogin ? (darkMode ? 'rgba(255, 255, 255, 0.12)' : '#ffffff') : 'transparent',
              color: isLogin ? (darkMode ? '#ffffff' : '#0f172a') : (darkMode ? '#94a3b8' : '#64748b'),
              fontWeight: isLogin ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: isLogin && !darkMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: '9px',
              border: 'none',
              background: !isLogin ? (darkMode ? 'rgba(255, 255, 255, 0.12)' : '#ffffff') : 'transparent',
              color: !isLogin ? (darkMode ? '#ffffff' : '#0f172a') : (darkMode ? '#94a3b8' : '#64748b'),
              fontWeight: !isLogin ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: !isLogin && !darkMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#fb7185',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: darkMode ? '#cbd5e1' : '#334155', marginBottom: '6px' }}>
                Full Name or Nickname
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color={darkMode ? '#94a3b8' : '#64748b'} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '12px',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                    background: darkMode ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                    color: darkMode ? '#ffffff' : '#0f172a',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: darkMode ? '#cbd5e1' : '#334155', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color={darkMode ? '#94a3b8' : '#64748b'} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  borderRadius: '12px',
                  border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                  background: darkMode ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                  color: darkMode ? '#ffffff' : '#0f172a',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: darkMode ? '#cbd5e1' : '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color={darkMode ? '#94a3b8' : '#64748b'} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  borderRadius: '12px',
                  border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                  background: darkMode ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                  color: darkMode ? '#ffffff' : '#0f172a',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)',
              color: '#090d16',
              fontWeight: 700,
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              boxShadow: '0 4px 15px rgba(163, 230, 53, 0.3)',
              transition: 'transform 0.15s ease'
            }}
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In to Finora' : 'Start My 30-Day Simulation')}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '22px 0 18px 0',
          color: darkMode ? '#64748b' : '#94a3b8',
          fontSize: '12px'
        }}>
          <div style={{ flex: 1, height: '1px', background: darkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0' }} />
          <span>OR QUICK EXPLORE</span>
          <div style={{ flex: 1, height: '1px', background: darkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0' }} />
        </div>

        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: darkMode ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(126, 34, 206, 0.3)',
            background: darkMode ? 'rgba(168, 85, 247, 0.12)' : 'rgba(126, 34, 206, 0.06)',
            color: darkMode ? '#e9d5ff' : '#7e22ce',
            fontWeight: 700,
            fontSize: '13px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Zap size={16} color={darkMode ? '#c084fc' : '#7e22ce'} />
          Instant Demo Mode (₹10,000 / 30 Days)
        </button>

        <div style={{
          marginTop: '22px',
          padding: '12px',
          borderRadius: '10px',
          background: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: darkMode ? '#94a3b8' : '#64748b'
        }}>
          <ShieldCheck size={16} color="#a3e635" style={{ flexShrink: 0 }} />
          <span>Pre-loaded with 30-day simulated Gen Z transactions, impulse shields, and AI decision models.</span>
        </div>
      </div>
    </div>
  );
};
