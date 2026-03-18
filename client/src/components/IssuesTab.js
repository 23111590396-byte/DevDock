import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiCircle, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../api/axios';

function IssuesTab({ repoId, canWrite = false }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', labels: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (repoId) fetchIssues();
  }, [repoId, filter]); // eslint-disable-line

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/repos/${repoId}/issues?state=${filter}`);
      setIssues(r.data.issues || r.data || []);
    } catch {}
    setLoading(false);
  };

  const createIssue = async e => {
    e.preventDefault(); setCreating(true);
    try {
      await api.post(`/repos/${repoId}/issues`, { ...form, labels: form.labels.split(',').map(l => l.trim()).filter(Boolean) });
      setShowModal(false);
      setForm({ title: '', body: '', labels: '' });
      fetchIssues();
    } catch {}
    setCreating(false);
  };

  const closeIssue = async (issueId) => {
    try {
      await api.put(`/repos/${repoId}/issues/${issueId}`, { state: 'closed' });
      setIssues(prev => prev.map(i => i._id === issueId ? { ...i, state: 'closed' } : i));
    } catch {}
  };

  const inputStyle = { background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '8px 12px', color: '#c9d1d9', fontSize: 14, width: '100%', outline: 'none', boxSizing: 'border-box' };
  const tabBtn = (active) => ({ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, background: active ? '#21262d' : 'transparent', color: active ? '#c9d1d9' : '#8b949e', fontWeight: active ? 600 : 400 });

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={tabBtn(filter === 'open')} onClick={() => setFilter('open')}><FiCircle size={13} style={{ marginRight: 4 }} />Open</button>
          <button style={tabBtn(filter === 'closed')} onClick={() => setFilter('closed')}><FiCheckCircle size={13} style={{ marginRight: 4 }} />Closed</button>
        </div>
        {canWrite && (
          <button onClick={() => setShowModal(true)} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlus size={14} /> New Issue
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#8b949e', textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : issues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#8b949e' }}>
          <FiAlertCircle size={32} style={{ marginBottom: 12 }} />
          <div>No {filter} issues.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {issues.map((issue, i) => (
            <motion.div key={issue._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              style={{ padding: '14px 16px', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <FiCircle size={16} color={issue.state === 'open' ? '#3fb950' : '#8b949e'} style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#c9d1d9', fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{issue.title}</div>
                <div style={{ color: '#8b949e', fontSize: 12 }}>
                  #{issue.number || i + 1} opened by {issue.author?.username || 'unknown'} · {new Date(issue.createdAt).toLocaleDateString()}
                </div>
                {issue.labels && issue.labels.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    {issue.labels.map((label, li) => (
                      <span key={li} style={{ background: 'rgba(88,166,255,0.15)', color: '#58a6ff', borderRadius: 10, padding: '1px 8px', fontSize: 11 }}>{label}</span>
                    ))}
                  </div>
                )}
              </div>
              {canWrite && issue.state === 'open' && (
                <button onClick={() => closeIssue(issue._id)} style={{ background: 'none', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', cursor: 'pointer', padding: '4px 10px', fontSize: 12 }}>Close</button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 24 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 32, width: '100%', maxWidth: 540 }}>
            <h3 style={{ color: '#c9d1d9', marginBottom: 20, fontSize: 18 }}>New Issue</h3>
            <form onSubmit={createIssue} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ color: '#c9d1d9', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Title *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Issue title" />
              </div>
              <div>
                <label style={{ color: '#c9d1d9', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Describe the issue..." />
              </div>
              <div>
                <label style={{ color: '#c9d1d9', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Labels (comma separated)</label>
                <input style={inputStyle} value={form.labels} onChange={e => setForm(f => ({ ...f, labels: e.target.value }))} placeholder="bug, enhancement, question" />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>{creating ? 'Creating...' : 'Submit issue'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default IssuesTab;
