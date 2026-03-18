import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiStar, FiGitBranch, FiUser, FiBook } from 'react-icons/fi';
import api from '../api/axios';

function Explore() {
  const [tab, setTab] = useState('repos');
  const [repos, setRepos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState('stars');

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setQ(query);
    if (query) {
      if (tab === 'repos') searchRepos(query);
      else searchUsers(query);
    } else {
      if (tab === 'repos') fetchRepos();
      else fetchUsers();
    }
  }, [tab, sort, searchParams]); // eslint-disable-line

  const fetchRepos = () => {
    setLoading(true);
    api.get(`/repos/public?sort=${sort}`).then(r => setRepos(r.data.repos || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users').then(r => setUsers(r.data.users || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  const searchRepos = async (query) => {
    setLoading(true);
    try {
      const r = await api.get(`/repos/public?q=${encodeURIComponent(query)}&sort=${sort}`);
      setRepos(r.data.repos || r.data || []);
    } catch {}
    setLoading(false);
  };

  const searchUsers = async (query) => {
    setLoading(true);
    try {
      const r = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      setUsers(r.data.users || r.data || []);
    } catch {}
    setLoading(false);
  };

  const handleSearch = e => {
    e.preventDefault();
    setSearchParams(q ? { q } : {});
    if (tab === 'repos') searchRepos(q);
    else searchUsers(q);
  };

  const tabStyle = active => ({ padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: active ? 600 : 400, background: active ? '#238636' : 'transparent', color: active ? '#fff' : '#8b949e', display: 'inline-flex', alignItems: 'center', gap: 6 });

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ color: '#c9d1d9', fontSize: 24, marginBottom: 24 }}>Explore</h1>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '0 12px' }}>
              <FiSearch color="#8b949e" size={16} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${tab === 'repos' ? 'repositories' : 'users'}...`}
                style={{ background: 'none', border: 'none', outline: 'none', color: '#c9d1d9', padding: '10px 10px', fontSize: 14, width: '100%' }} />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '0 12px', fontSize: 14, cursor: 'pointer' }}>
              <option value="stars">Most Stars</option>
              <option value="recent">Most Recent</option>
              <option value="name">Name</option>
            </select>
            <button type="submit" style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '0 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Search</button>
          </form>

          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button style={tabStyle(tab === 'repos')} onClick={() => setTab('repos')}><FiBook size={14} />Repositories</button>
            <button style={tabStyle(tab === 'users')} onClick={() => setTab('users')}><FiUser size={14} />Users</button>
          </div>

          {loading && <div style={{ color: '#8b949e', textAlign: 'center', padding: 40 }}>Loading...</div>}

          {!loading && tab === 'repos' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {repos.length === 0 ? <div style={{ color: '#8b949e', textAlign: 'center', padding: 40 }}>No repositories found.</div> :
                repos.map((repo, i) => (
                  <motion.div key={repo._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '18px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <Link to={`/repos/${repo._id}`} style={{ color: '#58a6ff', textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>
                          {repo.owner?.username}/{repo.name}
                        </Link>
                        {repo.description && <p style={{ color: '#8b949e', fontSize: 13, margin: '4px 0 0' }}>{repo.description}</p>}
                        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                          {repo.language && <span style={{ color: '#8b949e', fontSize: 12 }}>● {repo.language}</span>}
                          <span style={{ color: '#8b949e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><FiStar size={12} /> {repo.starsCount || 0}</span>
                          <span style={{ color: '#8b949e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><FiGitBranch size={12} /> {repo.forksCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              }
            </div>
          )}

          {!loading && tab === 'users' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {users.length === 0 ? <div style={{ color: '#8b949e', textAlign: 'center', padding: 40, gridColumn: '1/-1' }}>No users found.</div> :
                users.map((u, i) => (
                  <motion.div key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                    style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#238636', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, overflow: 'hidden', flexShrink: 0 }}>
                        {u.avatar ? <img src={u.avatar} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link to={`/${u.username}`} style={{ color: '#c9d1d9', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>{u.username}</Link>
                        {u.name && <div style={{ color: '#8b949e', fontSize: 12 }}>{u.name}</div>}
                      </div>
                    </div>
                    {u.bio && <p style={{ color: '#8b949e', fontSize: 13, margin: '0 0 8px' }}>{u.bio}</p>}
                    <div style={{ color: '#8b949e', fontSize: 12 }}>{u.followersCount || 0} followers · {u.repoCount || 0} repos</div>
                  </motion.div>
                ))
              }
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
export default Explore;
