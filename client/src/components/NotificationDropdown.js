import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FiBell, FiCheck } from 'react-icons/fi';

function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`).catch(() => {});
    setNotifications(n => n.map(notif => notif._id === id ? { ...notif, read: true } : notif));
  };

  const markAllRead = async () => {
    await api.put('/notifications/mark-all-read').catch(() => {});
    setNotifications(n => n.map(notif => ({ ...notif, read: true })));
  };

  const style = {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: '#161b22', border: '1px solid #30363d',
    borderRadius: 8, width: 340, maxHeight: 440, overflow: 'auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 2000,
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div style={style}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#c9d1d9', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiBell size={15} /> Notifications {unread > 0 && <span style={{ background: '#da3633', color: '#fff', borderRadius: 10, padding: '0 6px', fontSize: 11 }}>{unread}</span>}
        </span>
        {unread > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><FiCheck size={12} /> Mark all read</button>}
      </div>
      {loading && <div style={{ padding: 20, color: '#8b949e', textAlign: 'center', fontSize: 14 }}>Loading...</div>}
      {!loading && notifications.length === 0 && <div style={{ padding: 24, color: '#8b949e', textAlign: 'center', fontSize: 14 }}>No notifications yet</div>}
      {notifications.map(n => (
        <div key={n._id} onClick={() => markRead(n._id)} style={{ padding: '10px 16px', borderBottom: '1px solid #21262d', cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(88,166,255,0.05)', transition: 'background 0.2s' }}>
          <div style={{ color: '#c9d1d9', fontSize: 13 }}>{n.message}</div>
          <div style={{ color: '#8b949e', fontSize: 11, marginTop: 2 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
}

export default NotificationDropdown;
