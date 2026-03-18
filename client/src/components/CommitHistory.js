import React, { useState, useEffect } from 'react';
import { FiGitCommit, FiUser, FiCalendar } from 'react-icons/fi';
import api from '../api/axios';

function CommitHistory({ repoId }) {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (repoId) fetchCommits(1);
  }, [repoId]); // eslint-disable-line

  const fetchCommits = async (p) => {
    setLoading(true);
    try {
      const r = await api.get(`/repos/${repoId}/commits?page=${p}&limit=20`);
      const newCommits = r.data.commits || r.data || [];
      if (p === 1) setCommits(newCommits);
      else setCommits(prev => [...prev, ...newCommits]);
      setHasMore(newCommits.length === 20);
      setPage(p);
    } catch {}
    setLoading(false);
  };

  const loadMore = () => fetchCommits(page + 1);

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ color: '#c9d1d9', fontSize: 16, marginBottom: 20 }}>Commit History</h3>
      {commits.length === 0 && !loading && (
        <div style={{ color: '#8b949e', textAlign: 'center', padding: 40 }}>No commits yet.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {commits.map((commit, i) => (
          <div key={commit._id || i} style={{ padding: '12px 16px', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <FiGitCommit size={16} color="#58a6ff" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#c9d1d9', fontSize: 14, fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {commit.message || 'No message'}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ color: '#8b949e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiUser size={11} /> {commit.author?.username || commit.author || 'Unknown'}
                </span>
                <span style={{ color: '#8b949e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiCalendar size={11} /> {new Date(commit.createdAt || commit.date).toLocaleDateString()}
                </span>
              </div>
            </div>
            <span style={{ color: '#8b949e', fontSize: 11, fontFamily: 'monospace', background: '#21262d', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
              {(commit.hash || commit._id || '').substring(0, 7)}
            </span>
          </div>
        ))}
      </div>
      {loading && <div style={{ color: '#8b949e', textAlign: 'center', padding: 20 }}>Loading...</div>}
      {!loading && hasMore && commits.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={loadMore} style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontSize: 13 }}>Load more</button>
        </div>
      )}
    </div>
  );
}

export default CommitHistory;
