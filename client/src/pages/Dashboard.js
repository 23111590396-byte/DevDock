import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiStar, FiGitBranch, FiLock, FiGlobe, FiBook, FiUsers } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRepo, setNewRepo] = useState({ name: '', description: '', visibility: 'public' });
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState({ repos: 0, stars: 0, followers: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRepos();
    api.get(`/users/${user?.username}`).then(r => {
      const u = r.data.user || r.data;
      setStats({ repos: u.repoCount || 0, stars: u.totalStars || 0, followers: u.followersCount || 0 });
    }).catch(() => {});
  }, []); // eslint-disable-line

  const fetchRepos = () => {
    setLoading(true);
    api.get('/repos').then(r => setRepos(r.data.repos || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  const createRepo = async e => {
    e.preventDefault(); setCreating(true); setError('');
    try {
      await api.post('/repos', newRepo);
      setShowModal(false);
      setNewRepo({ name: '', description: '', visibility: 'public' });
      fetchRepos();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create repo'); }
    finally { setCreating(false); }
  };

  const inputStyle = { background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '8px 12px', color: '#c9d1d9', fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { color: '#c9d1d9', fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ color: '#c9d1d9', fontSize: 24, marginBottom: 4 }}>Dashboard</h1>
            <p style={{ color: '#8b949e', fontSize: 14 }}>Welcome back, {user?.username}!</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlus size={16} /> New Repository
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { icon: FiBook, label: 'Repositories', value: stats.repos || repos.length },
            { icon: FiStar, label: 'Total Stars', value: stats.stars },
            { icon: FiUsers, label: 'Followers', value: stats.followers },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <s.icon size={24} color="#58a6ff" />
              <div>
                <div style={{ color: '#c9d1d9', fontSize: 22, fontWeight: 700 }}>{s.value}</div>
                <div style={{ color: '#8b949e', fontSize: 12 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ color: '#c9d1d9', fontSize: 18 }}>Your Repositories</h2>
          <Link to={`/${user?.username}`} style={{ color: '#58a6ff', textDecoration: 'none', fontSize: 13 }}>View profile →</Link>
        </div>

        {loading ? (
          <div style={{ color: '#8b949e', textAlign: 'center', padding: 40 }}>Loading repositories...</div>
        ) : repos.length === 0 ? (
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 40, textAlign: 'center' }}>
            <FiBook size={32} color="#8b949e" style={{ marginBottom: 12 }} />
            <p style={{ color: '#8b949e', marginBottom: 16 }}>No repositories yet.</p>
            <button onClick={() => setShowModal(true)} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Create your first repo</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {repos.map((repo, i) => (
              <motion.div key={repo._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <Link to={`/${user?.username}/${repo.name}`} state={{ repoId: repo._id }} style={{ color: '#58a6ff', textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>{repo.name}</Link>
                    <span style={{ background: 'rgba(88,166,255,0.1)', border: '1px solid rgba(88,166,255,0.3)', color: '#58a6ff', borderRadius: 10, padding: '1px 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {repo.visibility === 'private' ? <><FiLock size={10} /> Private</> : <><FiGlobe size={10} /> Public</>}
                    </span>
                  </div>
                  {repo.description && <p style={{ color: '#8b949e', fontSize: 13, margin: 0 }}>{repo.description}</p>}
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    {repo.language && <span style={{ color: '#8b949e', fontSize: 12 }}>● {repo.language}</span>}
                    <span style={{ color: '#8b949e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><FiStar size={12} /> {repo.starsCount || 0}</span>
                    <span style={{ color: '#8b949e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><FiGitBranch size={12} /> {repo.defaultBranch || 'main'}</span>
                  </div>
                </div>
                <Link to={`/repos/${repo._id}`} style={{ color: '#8b949e', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid #30363d', borderRadius: 6 }}>Open</Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 24 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 32, width: '100%', maxWidth: 480 }}>
            <h3 style={{ color: '#c9d1d9', marginBottom: 24, fontSize: 18 }}>Create new repository</h3>
            {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid #f85149', color: '#f85149', borderRadius: 6, padding: '8px 12px', marginBottom: 16, fontSize: 13 }}>{error}</div>}
            <form onSubmit={createRepo} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={labelStyle}>Repository name *</label><input style={inputStyle} value={newRepo.name} onChange={e => setNewRepo(n => ({ ...n, name: e.target.value }))} required placeholder="my-awesome-repo" /></div>
              <div><label style={labelStyle}>Description</label><input style={inputStyle} value={newRepo.description} onChange={e => setNewRepo(n => ({ ...n, description: e.target.value }))} placeholder="Optional description" /></div>
              <div>
                <label style={labelStyle}>Visibility</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={newRepo.visibility} onChange={e => setNewRepo(n => ({ ...n, visibility: e.target.value }))}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>{creating ? 'Creating...' : 'Create repository'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
export default Dashboard;
