import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiGithub, FiAlertTriangle, FiSave, FiCheck } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'security', label: 'Security', icon: FiLock },
  { id: 'github', label: 'GitHub', icon: FiGithub },
  { id: 'account', label: 'Account', icon: FiAlertTriangle },
];

function Settings() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.bio || '', location: user?.location || '', website: user?.website || '', avatar: user?.avatar || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };
  const showErr = (e) => { setError(e); setTimeout(() => setError(''), 4000); };

  const saveProfile = async e => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const r = await api.put('/users/profile', profile);
      const updatedUser = r.data.user || r.data;
      login(updatedUser, localStorage.getItem('token'));
      showMsg('Profile updated successfully!');
    } catch (err) { showErr(err.response?.data?.message || 'Failed to save profile'); }
    setSaving(false);
  };

  const changePassword = async e => {
    e.preventDefault(); setError('');
    if (passwords.newPass !== passwords.confirm) { showErr('New passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      setPasswords({ current: '', newPass: '', confirm: '' });
      showMsg('Password changed successfully!');
    } catch (err) { showErr(err.response?.data?.message || 'Failed to change password'); }
    setSaving(false);
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== user?.username) { showErr(`Type your username "${user?.username}" to confirm`); return; }
    try {
      await api.delete('/users/account');
      logout();
      navigate('/');
    } catch (err) { showErr(err.response?.data?.message || 'Failed to delete account'); }
  };

  const inputStyle = { background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '9px 12px', color: '#c9d1d9', fontSize: 14, width: '100%', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { color: '#c9d1d9', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 };
  const sectionStyle = { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 24, marginBottom: 20 };

  const tabStyle = active => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', cursor: 'pointer', borderRadius: 8,
    background: active ? '#21262d' : 'none', color: active ? '#c9d1d9' : '#8b949e', border: 'none', fontSize: 14, width: '100%', textAlign: 'left',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 28 }}>
        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <h1 style={{ color: '#c9d1d9', fontSize: 20, marginBottom: 20 }}>Settings</h1>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {TABS.map(t => (
              <button key={t.id} style={tabStyle(tab === t.id)} onClick={() => setTab(t.id)}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {(msg || error) && (
            <div style={{ background: msg ? 'rgba(35,134,54,0.1)' : 'rgba(248,81,73,0.1)', border: `1px solid ${msg ? '#238636' : '#f85149'}`, color: msg ? '#3fb950' : '#f85149', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              {msg ? <FiCheck size={14} /> : <FiAlertTriangle size={14} />} {msg || error}
            </div>
          )}

          {tab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={sectionStyle}>
                <h2 style={{ color: '#c9d1d9', fontSize: 16, marginBottom: 20 }}>Public Profile</h2>
                <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Display Name</label>
                    <input style={inputStyle} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
                  </div>
                  <div>
                    <label style={labelStyle}>Bio</label>
                    <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us a bit about yourself" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Location</label>
                      <input style={inputStyle} value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} placeholder="City, Country" />
                    </div>
                    <div>
                      <label style={labelStyle}>Website</label>
                      <input style={inputStyle} value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://yoursite.com" />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Avatar URL</label>
                    <input style={inputStyle} value={profile.avatar} onChange={e => setProfile(p => ({ ...p, avatar: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div>
                    <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                      <FiSave size={14} /> {saving ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {tab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={sectionStyle}>
                <h2 style={{ color: '#c9d1d9', fontSize: 16, marginBottom: 20 }}>Change Password</h2>
                <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Current Password</label>
                    <input style={inputStyle} type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} required placeholder="••••••••" />
                  </div>
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <input style={inputStyle} type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} required placeholder="••••••••" />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <input style={inputStyle} type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} required placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600, width: 'fit-content' }}>
                    <FiLock size={14} /> {saving ? 'Changing...' : 'Change password'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {tab === 'github' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={sectionStyle}>
                <h2 style={{ color: '#c9d1d9', fontSize: 16, marginBottom: 8 }}>GitHub Integration</h2>
                <p style={{ color: '#8b949e', fontSize: 14, marginBottom: 20 }}>Connect your GitHub account to sync repositories and enable OAuth login.</p>
                {user?.githubId ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(35,134,54,0.1)', border: '1px solid #238636', borderRadius: 8 }}>
                    <FiGithub size={20} color="#3fb950" />
                    <div>
                      <div style={{ color: '#3fb950', fontWeight: 600, fontSize: 14 }}>GitHub Connected</div>
                      <div style={{ color: '#8b949e', fontSize: 12 }}>@{user.githubUsername || user.username}</div>
                    </div>
                  </div>
                ) : (
                  <a href="/auth/github" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#21262d', border: '1px solid #30363d', borderRadius: 8, padding: '10px 20px', color: '#c9d1d9', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                    <FiGithub size={18} /> Connect GitHub Account
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {tab === 'account' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ ...sectionStyle, border: '1px solid #f85149' }}>
                <h2 style={{ color: '#f85149', fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><FiAlertTriangle size={18} /> Delete Account</h2>
                <p style={{ color: '#8b949e', fontSize: 14, marginBottom: 20 }}>
                  Once you delete your account, there is no going back. All your repositories, messages, and data will be permanently deleted.
                </p>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ ...labelStyle, color: '#8b949e' }}>Type <strong style={{ color: '#c9d1d9' }}>{user?.username}</strong> to confirm deletion:</label>
                  <input style={{ ...inputStyle, borderColor: '#f85149' }} value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={user?.username} />
                </div>
                <button onClick={deleteAccount} style={{ background: '#da3633', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  Delete my account permanently
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
