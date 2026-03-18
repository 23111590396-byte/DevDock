import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';

import { FiStar, FiGitBranch, FiCode, FiAlertCircle, FiGitPullRequest, FiZap, FiActivity, FiBarChart2, FiGithub, FiEye, FiLock, FiGlobe, FiSettings } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import FileTreeSidebar from '../components/FileTreeSidebar';
import CodeEditor from '../components/CodeEditor';
import FileViewer from '../components/FileViewer';
import CommitHistory from '../components/CommitHistory';
import IssuesTab from '../components/IssuesTab';
import PullRequestsTab from '../components/PullRequestsTab';
import AIAssistant from '../components/AIAssistant';
import GitHubSyncPanel from '../components/GitHubSyncPanel';
import QATester from '../components/QATester';

const TABS = [
  { id: 'code', label: 'Code', icon: FiCode },
  { id: 'issues', label: 'Issues', icon: FiAlertCircle },
  { id: 'prs', label: 'Pull Requests', icon: FiGitPullRequest },
  { id: 'ai', label: 'AI Assistant', icon: FiZap },
  { id: 'qa', label: 'QA', icon: FiActivity },
  { id: 'insights', label: 'Insights', icon: FiBarChart2 },
];

function RepositoryPage() {
  const { repoId, username, repoName } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('code');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [starred, setStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [loadingFile, setLoadingFile] = useState(false);
  const [showGithubSync, setShowGithubSync] = useState(false);

  const effectiveRepoId = repoId || location.state?.repoId;

  useEffect(() => {
    fetchRepo();
  }, [effectiveRepoId, username, repoName]); // eslint-disable-line

  const fetchRepo = async () => {
    setLoading(true);
    try {
      let r;
      if (effectiveRepoId) {
        r = await api.get(`/repos/${effectiveRepoId}`);
      } else if (username && repoName) {
        r = await api.get(`/repos/by-name/${username}/${repoName}`);
      } else {
        setLoading(false);
        return;
      }
      const repoData = r.data.repo || r.data;
      setRepo(repoData);
      setStarred(repoData.isStarred || false);
      setStarCount(repoData.starsCount || 0);
      fetchFiles(repoData._id);
    } catch {}
    setLoading(false);
  };

  const fetchFiles = async (id) => {
    try {
      const r = await api.get(`/repos/${id}/files`);
      const fileList = r.data.files || r.data || [];
      setFiles(buildTree(fileList));
    } catch {}
  };

  const buildTree = (flatFiles) => {
    if (!Array.isArray(flatFiles)) return [];
    // If files already have children structure, return as-is
    if (flatFiles.length > 0 && 'children' in flatFiles[0]) return flatFiles;
    // Build tree from flat path list
    const root = [];
    flatFiles.forEach(f => {
      const parts = (f.path || f.name || '').split('/').filter(Boolean);
      let current = root;
      parts.forEach((part, i) => {
        const isLast = i === parts.length - 1;
        const existing = current.find(n => n.name === part);
        if (existing) {
          if (!isLast) current = existing.children || (existing.children = []);
        } else {
          const node = { name: part, path: parts.slice(0, i + 1).join('/'), type: isLast ? (f.type || 'file') : 'dir', children: isLast ? undefined : [] };
          if (isLast) { node.content = f.content; node._id = f._id; }
          current.push(node);
          if (!isLast) current = node.children;
        }
      });
    });
    return root;
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setFileContent(null);
    if (file.type === 'file' || !file.children) {
      setLoadingFile(true);
      try {
        const r = await api.get(`/repos/${repo._id}/files/${encodeURIComponent(file.path)}`);
        setFileContent(r.data.file || r.data);
      } catch {
        setFileContent({ ...file, content: file.content || '' });
      }
      setLoadingFile(false);
    }
  };

  const toggleStar = async () => {
    try {
      if (starred) {
        await api.delete(`/repos/${repo._id}/star`);
        setStarCount(c => c - 1);
      } else {
        await api.post(`/repos/${repo._id}/star`);
        setStarCount(c => c + 1);
      }
      setStarred(s => !s);
    } catch {}
  };

  const isOwner = user && repo && (repo.owner?._id === user._id || repo.owner === user._id || repo.owner?.username === user.username);

  const tabStyle = active => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: active ? 600 : 400,
    color: active ? '#c9d1d9' : '#8b949e', background: 'none', border: 'none',
    borderBottom: active ? '2px solid #f78166' : '2px solid transparent',
    transition: 'color 0.2s', marginBottom: -1,
  });

  if (loading) return <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>Loading repository...</div>;
  if (!repo) return <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>Repository not found.</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>
      {/* Repo header */}
      <div style={{ background: '#161b22', borderBottom: '1px solid #30363d', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <Link to={`/${repo.owner?.username}`} style={{ color: '#58a6ff', textDecoration: 'none', fontSize: 18 }}>{repo.owner?.username}</Link>
            <span style={{ color: '#8b949e', fontSize: 18 }}>/</span>
            <span style={{ color: '#c9d1d9', fontWeight: 700, fontSize: 20 }}>{repo.name}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#8b949e', border: '1px solid #30363d', borderRadius: 12, padding: '1px 8px', fontSize: 12 }}>
              {repo.visibility === 'private' ? <><FiLock size={11} /> Private</> : <><FiGlobe size={11} /> Public</>}
            </span>
          </div>

          {repo.description && <p style={{ color: '#8b949e', fontSize: 14, marginBottom: 14 }}>{repo.description}</p>}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {user && (
              <button onClick={toggleStar} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '5px 12px', cursor: 'pointer', fontSize: 13 }}>
                <FiStar size={14} color={starred ? '#e3b341' : undefined} fill={starred ? '#e3b341' : 'none'} /> {starred ? 'Starred' : 'Star'} <span style={{ background: '#30363d', borderRadius: 10, padding: '0 6px', fontSize: 11 }}>{starCount}</span>
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b949e', fontSize: 13 }}>
              <FiGitBranch size={14} /> {repo.defaultBranch || 'main'}
            </div>
            {repo.githubUrl && (
              <button onClick={() => setShowGithubSync(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '5px 12px', cursor: 'pointer', fontSize: 13 }}>
                <FiGithub size={14} /> GitHub Sync
              </button>
            )}
            {isOwner && (
              <Link to={`/repos/${repo._id}/settings`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '5px 12px', textDecoration: 'none', fontSize: 13 }}>
                <FiSettings size={14} /> Settings
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* GitHub Sync Panel */}
      {showGithubSync && (
        <div style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <GitHubSyncPanel repoId={repo._id} githubUrl={repo.githubUrl} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 4, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} style={tabStyle(tab === t.id)} onClick={() => setTab(t.id)}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0' }}>
        {tab === 'code' && (
          <div style={{ display: 'flex', height: 'calc(100vh - 220px)', minHeight: 500 }}>
            <div style={{ width: 260, flexShrink: 0 }}>
              <FileTreeSidebar
                files={files}
                onSelect={handleFileSelect}
                selectedFile={selectedFile}
                onAddFile={isOwner ? () => {} : undefined}
                onAddFolder={isOwner ? () => {} : undefined}
              />
            </div>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {loadingFile ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>Loading file...</div>
              ) : fileContent ? (
                isOwner ? (
                  <CodeEditor file={fileContent} repoId={repo._id} readOnly={!isOwner} />
                ) : (
                  <FileViewer file={fileContent} />
                )
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8b949e', gap: 12 }}>
                  <FiCode size={48} color="#30363d" />
                  <div style={{ fontSize: 16 }}>Select a file from the tree</div>
                  {files.length === 0 && <div style={{ fontSize: 13 }}>This repository is empty</div>}
                </div>
              )}
            </div>
            <div style={{ width: 360, borderLeft: '1px solid #30363d' }}>
              <AIAssistant repoContext={repo.name} />
            </div>
          </div>
        )}

        {tab === 'issues' && (
          <IssuesTab repoId={repo._id} canWrite={!!user && (isOwner || repo.collaborators?.includes(user._id))} />
        )}

        {tab === 'prs' && (
          <PullRequestsTab repoId={repo._id} canWrite={isOwner} defaultBranch={repo.defaultBranch || 'main'} />
        )}

        {tab === 'ai' && (
          <div style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
            <AIAssistant repoContext={`Repository: ${repo.name}\nDescription: ${repo.description || ''}\nLanguage: ${repo.language || 'Not specified'}`} />
          </div>
        )}

        {tab === 'qa' && (
          <QATester repoId={repo._id} />
        )}

        {tab === 'insights' && (
          <div style={{ padding: 32 }}>
            <h2 style={{ color: '#c9d1d9', fontSize: 20, marginBottom: 24 }}>Repository Insights</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Stars', value: repo.starsCount || 0, icon: FiStar, color: '#e3b341' },
                { label: 'Forks', value: repo.forksCount || 0, icon: FiGitBranch, color: '#58a6ff' },
                { label: 'Watchers', value: repo.watchersCount || 0, icon: FiEye, color: '#3fb950' },
                { label: 'Commits', value: repo.commitCount || 0, icon: FiGitBranch, color: '#a371f7' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <s.icon size={24} color={s.color} />
                  <div>
                    <div style={{ color: '#c9d1d9', fontSize: 24, fontWeight: 700 }}>{s.value}</div>
                    <div style={{ color: '#8b949e', fontSize: 12 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 20 }}>
              <CommitHistory repoId={repo._id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RepositoryPage;
