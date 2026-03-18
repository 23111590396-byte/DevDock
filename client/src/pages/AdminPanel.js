import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCheck, FiX, FiTrash2, FiShield, FiSearch, FiRefreshCw } from 'react-icons/fi';
import api from '../api/axios';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, verifiedUsers: 0, totalRepos: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const PER_PAGE = 20;

  useEffect(() => {
    fetchData();
  }, [page, search]); // eslint-disable-line

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get(`/admin/users?page=${page}&limit=${PER_PAGE}&search=${encodeURIComponent(search)}`),
        api.get('/admin/stats').catch(() => ({ data: {} })),
      ]);
      setUsers(usersRes.data.users || usersRes.data || []);
      setTotal(usersRes.data.total || 0);
      if (statsRes.data) setStats(s => ({ ...s, ...statsRes.data }));
    } catch {}
    setLoading(false);
  };

  const verifyUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerified: true } : u));
    } catch {}
  };

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      setTotal(t => t - 1);
      setConfirmDelete(null);
    } catch {}
  };

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
    } catch {}
  };

  const filteredUsers = users.filter(u => !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <FiShield size={24} color="#e3b341" />
          <h1 style={{ color: '#c9d1d9', fontSize: 24, margin: 0 }}>Admin Panel</h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Users', value: stats.totalUsers || total, icon: FiUsers, color: '#58a6ff' },
            { label: 'Verified Users', value: stats.verifiedUsers || 0, icon: FiCheck, color: '#3fb950' },
            { label: 'Total Repos', value: stats.totalRepos || 0, icon: FiShield, color: '#a371f7' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <s.icon size={22} color={s.color} />
              <div>
                <div style={{ color: '#c9d1d9', fontSize: 22, fontWeight: 700 }}>{s.value}</div>
                <div style={{ color: '#8b949e', fontSize: 12 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Users table */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #30363d', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '0 12px' }}>
              <FiSearch size={14} color="#8b949e" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..."
                style={{ background: 'none', border: 'none', outline: 'none', color: '#c9d1d9', padding: '8px 0', fontSize: 14, width: '100%' }} />
            </div>
            <button onClick={fetchData} style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <FiRefreshCw size={13} /> Refresh
            </button>
          </div>

          {loading ? <div style={{ padding: 40, color: '#8b949e', textAlign: 'center' }}>Loading users...</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #30363d' }}>
                    {['User', 'Email', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#8b949e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #21262d' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1c2128'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#238636', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, overflow: 'hidden', flexShrink: 0 }}>
                            {u.avatar ? <img src={u.avatar} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.username?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ color: '#c9d1d9', fontSize: 14, fontWeight: 500 }}>{u.username}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#8b949e', fontSize: 13 }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <select value={u.role || 'user'} onChange={e => changeRole(u._id, e.target.value)}
                          style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 4, color: u.role === 'admin' ? '#e3b341' : '#c9d1d9', fontSize: 12, padding: '3px 8px', cursor: 'pointer' }}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="moderator">Moderator</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, fontSize: 11, background: u.isVerified ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.1)', color: u.isVerified ? '#3fb950' : '#f85149', border: `1px solid ${u.isVerified ? '#238636' : '#f85149'}` }}>
                          {u.isVerified ? <FiCheck size={10} /> : <FiX size={10} />} {u.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#8b949e', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {!u.isVerified && (
                            <button onClick={() => verifyUser(u._id)} title="Verify user" style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid #238636', color: '#3fb950', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <FiCheck size={12} /> Verify
                            </button>
                          )}
                          <button onClick={() => setConfirmDelete(u)} title="Delete user" style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid #f85149', color: '#f85149', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiTrash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {total > PER_PAGE && (
            <div style={{ padding: '14px 20px', borderTop: '1px solid #30363d', display: 'flex', gap: 8, justifyContent: 'center' }}>
              {Array.from({ length: Math.ceil(total / PER_PAGE) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #30363d', background: page === i + 1 ? '#238636' : '#21262d', color: page === i + 1 ? '#fff' : '#c9d1d9', cursor: 'pointer', fontSize: 13 }}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#161b22', border: '1px solid #f85149', borderRadius: 12, padding: 28, maxWidth: 420, width: '90%' }}>
            <h3 style={{ color: '#f85149', marginBottom: 12, fontSize: 18 }}>Delete User</h3>
            <p style={{ color: '#c9d1d9', fontSize: 14, marginBottom: 24 }}>Are you sure you want to delete <strong>{confirmDelete.username}</strong>? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={() => deleteUser(confirmDelete._id)} style={{ background: '#da3633', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
