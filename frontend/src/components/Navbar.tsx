import React from 'react';
import { RotateCcw, Sparkles, Moon, Sun, Bell, LogIn, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  onResetDemo: () => void;
  unreadCount?: number;
  currentUser?: any;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  darkMode, 
  setDarkMode, 
  onResetDemo, 
  unreadCount = 0,
  currentUser,
  onLogout
}) => {
  const navigate = useNavigate();

  return (
    <header style={{
      height: '64px',
      borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
      background: darkMode ? 'rgba(10, 13, 20, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      transition: 'background 0.2s ease, border-color 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          background: darkMode ? 'rgba(163, 230, 53, 0.12)' : 'rgba(101, 163, 13, 0.1)',
          color: darkMode ? '#a3e635' : '#4d7c0f',
          border: darkMode ? '1px solid rgba(163, 230, 53, 0.25)' : '1px solid rgba(101, 163, 13, 0.3)',
          padding: '4px 10px',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: darkMode ? '#a3e635' : '#4d7c0f', display: 'inline-block' }} />
          LIVE DEMO MODE · 30-DAY ₹10K SIMULATOR
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => navigate('/simulator')}
          style={{
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)'
              : 'linear-gradient(135deg, rgba(126, 34, 206, 0.12) 0%, rgba(79, 70, 229, 0.12) 100%)',
            border: darkMode ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(126, 34, 206, 0.3)',
            color: darkMode ? '#e9d5ff' : '#6b21a8',
            padding: '7px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={16} color={darkMode ? '#c084fc' : '#7e22ce'} />
          Simulate Purchase
        </button>

        <button
          onClick={onResetDemo}
          title="Reset to clean initial ₹10k demo state"
          style={{
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
            color: darkMode ? '#cbd5e1' : '#475569',
            padding: '7px 12px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RotateCcw size={14} />
          Reset Demo
        </button>

        <button
          onClick={() => navigate('/notifications')}
          style={{
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
            color: darkMode ? '#cbd5e1' : '#475569',
            padding: '8px',
            borderRadius: '10px',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '14px',
              height: '14px',
              background: '#f43f5e',
              borderRadius: '50%',
              fontSize: '9px',
              fontWeight: 800,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Light/Dark Mode Switcher */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
          style={{
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
            color: darkMode ? '#cbd5e1' : '#475569',
            padding: '8px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {darkMode ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#475569" />}
        </button>

        {/* User / Sign In Button */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => navigate('/settings')}
              style={{
                background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                color: darkMode ? '#cbd5e1' : '#1e293b',
                padding: '6px 10px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <User size={14} color="#a3e635" />
              <span>{currentUser.username || 'Explorer'}</span>
            </button>
            <button
              onClick={onLogout}
              title="Sign out or switch user"
              style={{
                background: 'transparent',
                border: 'none',
                color: darkMode ? '#94a3b8' : '#64748b',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            style={{
              background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)',
              border: 'none',
              color: '#090d16',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogIn size={15} />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
