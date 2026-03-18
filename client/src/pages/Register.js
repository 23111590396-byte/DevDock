import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGithub, FiCode } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const cardStyle = { background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 40, width: '100%', maxWidth: 420 };
  const inputStyle = { background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '10px 12px', color: '#c9d1d9', fontSize: 14, width: '100%', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { color: '#c9d1d9', fontSize: 14, fontWeight: 600, marginBottom: 6, display: 'block' };
  const btnStyle = { background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: 11, fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%' };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <FiCode size={32} color="#58a6ff" />
          <h2 style={{ color: '#c9d1d9', marginTop: 8, marginBottom: 4 }}>Create your account</h2>
        </div>
        {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid #f85149', color: '#f85149', borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: 13 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[['username', 'text', 'Username', 'devdocker'], ['email', 'email', 'Email', 'you@example.com'], ['password', 'password', 'Password', '••••••••']].map(([field, type, label, ph]) => (
            <div key={field}>
              <label style={labelStyle}>{label}</label>
              <input style={inputStyle} type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} required placeholder={ph} />
            </div>
          ))}
          <button type="submit" style={btnStyle} disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        </form>
        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: '#30363d' }} />
          <span style={{ color: '#8b949e', fontSize: 12 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#30363d' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="/auth/github" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#21262d', border: '1px solid #30363d', borderRadius: 6, padding: 10, color: '#c9d1d9', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}><FiGithub size={18} /> Continue with GitHub</a>
          <a href="/auth/google" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#21262d', border: '1px solid #30363d', borderRadius: 6, padding: 10, color: '#c9d1d9', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </a>
        </div>
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#8b949e' }}>
          Already have an account? <Link to="/login" style={{ color: '#58a6ff', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
export default Register;
