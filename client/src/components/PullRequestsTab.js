import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiGitPullRequest, FiGitMerge, FiXCircle } from 'react-icons/fi';
import api from '../api/axios';

function PullRequestsTab({ repoId, canWrite = false, defaultBranch = 'main' }) {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', head: '', base: defaultBranch });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (repoId) fetchPRs();
  }, [repoId, filter]); // eslint-disable-line

  const fetchPRs = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/repos/${repoId}/pulls?state=${filter}`);
      setPrs(r.data.pullRequests || r.data.prs || r.data || []);
    } catch {}
    setLoading(false);
  };

  const createPR = async e => {
    e.preventDefault(); setCreating(true);
    try {
      await api.post(`/repos/${repoId}/pulls`, form);
      setShowModal(false);
      setForm({ title: '', body: '', head: '', base: defaultBranch });
      fetchPRs();
    } catch {}
    setCreating(false);
  };

  const mergePR = async (prId) => {
    try {
      await api.post(`/repos/${repoId}/pulls/${prId}/merge`);
      setPrs(prev => prev.map(p => p._id === prId ? { ...p, state: 'merged' } : p));
    } catch {}
  };

  const closePR = async (prId) => {
    try {
      await api.put(`/repos/${repoId}/pulls/${prId}`, { state: 'closed' });
      setPrs(prev => prev.map(p => p._id === prId ? { ...p, state: 'closed' } : p));
    } catch {}
  };

  const inputStyle = { background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '8px 12px', color: '#c9d1d9', fontSize: 14, width: '100%', outline: 'none', boxSizing: 'border-box' };
  const tabBtn = (active) => ({ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, background: active ? '#21262d' : 'transparent', color: active ? '#c9d1d9' : '#8b949e', fontWeight: active ? 600 : 400, display: 'inline-flex', alignItems: 'center', gap: 6 });

  const prStateColor = state => ({ open: '#3fb950', merged: '#a371f7', closed: '#f85149' }[state] || '#8b949e');
  const prStateIcon = state => state === 'merged' ? <FiGitMerge size={16} /> : state === 'closed' ? <FiXCircle size={16} /> : <FiGitPullRequest size={16} />;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['open', 'closed', 'merged'].map(f => (
            <button key={f} style={tabBtn(filter === f)} onClick={() => setFilter(f)}>
              {prStateIcon(f)} {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {canWrite && (
          <button onClick={() => setShowModal(true)} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlus size={14} /> New Pull Request
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#8b949e', textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : prs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#8b949e' }}>
          <FiGitPullRequest size={32} style={{ marginBottom: 12 }} />
          <div>No {filter} pull requests.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {prs.map((pr, i) => (
            <motion.div key={pr._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              style={{ padding: '14px 16px', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ color: prStateColor(pr.state), marginTop: 2, flexShrink: 0 }}>{prStateIcon(pr.state)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#c9d1d9', fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{pr.title}</div>
                <div style={{ color: '#8b949e', fontSize: 12 }}>
                  #{pr.number || i + 1} · {pr.head} → {pr.base} · by {pr.author?.username || 'unknown'} · {new Date(pr.createdAt).toLocaleDateString()}
                </div>
              </div>
              {canWrite && pr.state === 'open' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => mergePR(pr._id)} style={{ background: 'rgba(163,113,247,0.1)', border: '1px solid #a371f7', color: '#a371f7', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Merge</button>
                  <button onClick={() => closePR(pr._id)} style={{ background: 'none', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Close</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 24 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 32, width: '100%', maxWidth: 540 }}>
            <h3 style={{ color: '#c9d1d9', marginBottom: 20, fontSize: 18 }}>New Pull Request</h3>
            <form onSubmit={createPR} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ color: '#c9d1d9', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Title *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="PR title" />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#c9d1d9', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Head branch *</label>
                  <input style={inputStyle} value={form.head} onChange={e => setForm(f => ({ ...f, head: e.target.value }))} required placeholder="feature-branch" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#c9d1d9', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Base branch</label>
                  <input style={inputStyle} value={form.base} onChange={e => setForm(f => ({ ...f, base: e.target.value }))} placeholder="main" />
                </div>
              </div>
              <div>
                <label style={{ color: '#c9d1d9', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Describe your changes..." />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>{creating ? 'Creating...' : 'Create PR'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default PullRequestsTab;
