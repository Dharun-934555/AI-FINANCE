import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import { Bell, Check, AlertTriangle, Info, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (e: any) {
      alert(e.message || 'Action failed');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertOctagon size={18} color="#fb7185" />;
      case 'warning': return <AlertTriangle size={18} color="#fbbf24" />;
      case 'success': return <CheckCircle2 size={18} color="#a3e635" />;
      default: return <Info size={18} color="#38bdf8" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Proactive Financial Notifications</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Automated alerts monitoring bill due dates, daily velocity spikes, and emergency thresholds.
        </p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No notifications found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  background: n.is_read ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getIcon(n.type)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{n.title}</div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px' }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{n.created_at}</div>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    style={{
                      background: 'rgba(163, 230, 53, 0.1)',
                      color: '#a3e635',
                      border: '1px solid rgba(163, 230, 53, 0.3)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
