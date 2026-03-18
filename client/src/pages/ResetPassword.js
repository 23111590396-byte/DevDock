import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';

function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setMsg('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setMsg('Password reset! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) { setError(err.response?.data?.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  const inputStyle = { background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '10px 12px', color: '#c9d1d9', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 40, width: '100%', maxWidth: 400 }}>
        <h2 style={{ color: '#c9d1d9', marginBottom: 24 }}>Set new password</h2>
        {msg && <div style={{ background: 'rgba(35,134,54,0.1)', border: '1px solid #238636', color: '#3fb950', borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: 13 }}>{msg}</div>}
        {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid #f85149', color: '#f85149', borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: 13 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="New password" style={inputStyle} />
          <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required placeholder="Confirm password" style={inputStyle} />
          <button type="submit" disabled={loading} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: 11, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13 }}>
          <Link to="/login" style={{ color: '#58a6ff', textDecoration: 'none' }}>Back to sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
export default ResetPassword;
