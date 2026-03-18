import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault(); setMsg(''); setError(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setMsg('Reset link sent! Check your email.');
    } catch (err) { setError(err.response?.data?.message || 'Failed to send reset email'); }
    finally { setLoading(false); }
  };

  const cardStyle = { background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 40, width: '100%', maxWidth: 400 };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
        <h2 style={{ color: '#c9d1d9', marginBottom: 8 }}>Reset your password</h2>
        <p style={{ color: '#8b949e', fontSize: 14, marginBottom: 24 }}>Enter your email and we'll send a reset link.</p>
        {msg && <div style={{ background: 'rgba(35,134,54,0.1)', border: '1px solid #238636', color: '#3fb950', borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: 13 }}>{msg}</div>}
        {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid #f85149', color: '#f85149', borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: 13 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
            style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '10px 12px', color: '#c9d1d9', fontSize: 14, outline: 'none' }} />
          <button type="submit" disabled={loading} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: 11, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#8b949e' }}>
          <Link to="/login" style={{ color: '#58a6ff', textDecoration: 'none' }}>Back to sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
export default ForgotPassword;
