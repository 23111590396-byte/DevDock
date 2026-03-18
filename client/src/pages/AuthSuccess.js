import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function AuthSuccess() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      api.get('/auth/me').then(res => {
        login(res.data.user, token);
        navigate('/dashboard');
      }).catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, []); // eslint-disable-line

  return <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9d1d9', fontSize: 18 }}>Authenticating...</div>;
}
export default AuthSuccess;
