import React, { useState, useEffect } from 'react';
import { FiGithub, FiUploadCloud, FiDownloadCloud, FiLink, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import api from '../api/axios';

function GitHubSyncPanel({ repoId, githubUrl: initialUrl }) {
  const [githubUrl, setGithubUrl] = useState(initialUrl || '');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    if (repoId) fetchStatus();
  }, [repoId]); // eslint-disable-line

  const fetchStatus = async () => {
    try {
      const r = await api.get(`/repos/${repoId}/github/status`);
      setStatus(r.data);
      setGithubUrl(r.data.githubUrl || initialUrl || '');
    } catch {}
  };

  const addLog = (msg, type = 'info') => setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);

  const performAction = async (action, label, payload = {}) => {
    setLoading(true);
    addLog(`Starting ${label}...`);
    try {
      const r = await api.post(`/repos/${repoId}/github/${action}`, payload);
      addLog(`✓ ${label} successful: ${r.data.message || 'Done'}`, 'success');
      fetchStatus();
    } catch (err) {
      addLog(`✗ ${label} failed: ${err.response?.data?.message || err.message}`, 'error');
    }
    setLoading(false);
  };

  const logColor = type => ({ success: '#3fb950', error: '#f85149', info: '#8b949e' }[type] || '#8b949e');

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <FiGithub size={20} color="#c9d1d9" />
        <h3 style={{ color: '#c9d1d9', fontSize: 16, margin: 0 }}>GitHub Sync</h3>
        {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" style={{ color: '#58a6ff', fontSize: 12 }}>{githubUrl}</a>}
      </div>

      {!githubUrl && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ color: '#c9d1d9', fontSize: 13, marginBottom: 10 }}>Link to a GitHub repository:</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://github.com/user/repo"
              style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '8px 12px', color: '#c9d1d9', fontSize: 13, outline: 'none' }}
            />
            <button
              onClick={() => performAction('link', 'Link', { githubUrl: urlInput })}
              disabled={loading || !urlInput}
              style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <FiLink size={13} /> Link
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { action: 'push', label: 'Push to GitHub', icon: FiUploadCloud, color: '#238636' },
          { action: 'pull', label: 'Pull from GitHub', icon: FiDownloadCloud, color: '#0075ca' },
          { action: 'import', label: 'Import from GitHub', icon: FiRefreshCw, color: '#e3b341' },
        ].map(({ action, label, icon: Icon, color }) => (
          <button
            key={action}
            onClick={() => performAction(action, label)}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', color: '#c9d1d9', fontSize: 14, transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#21262d'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#161b22'; }}
          >
            <Icon size={18} color={color} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {status && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13 }}>
          <div style={{ color: '#c9d1d9', fontWeight: 600, marginBottom: 8 }}>Sync Status</div>
          <div style={{ color: '#8b949e' }}>Last sync: {status.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never'}</div>
          <div style={{ color: status.synced ? '#3fb950' : '#f85149', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {status.synced ? <FiCheck size={12} /> : <FiX size={12} />}
            {status.synced ? 'Up to date' : 'Out of sync'}
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 12, maxHeight: 200, overflow: 'auto' }}>
          <div style={{ color: '#8b949e', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sync Log</div>
          {logs.map((log, i) => (
            <div key={i} style={{ fontSize: 12, color: logColor(log.type), marginBottom: 4, fontFamily: 'monospace' }}>
              <span style={{ color: '#30363d' }}>[{log.time}] </span>{log.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GitHubSyncPanel;
