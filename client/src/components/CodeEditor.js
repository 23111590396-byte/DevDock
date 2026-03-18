import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { FiSave, FiCode } from 'react-icons/fi';
import api from '../api/axios';

function getLanguage(filename) {
  if (!filename) return 'plaintext';
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
    c: 'c', cpp: 'cpp', cs: 'csharp', php: 'php', html: 'html',
    css: 'css', scss: 'scss', json: 'json', yaml: 'yaml', yml: 'yaml',
    md: 'markdown', sh: 'shell', bash: 'shell', sql: 'sql', xml: 'xml',
    toml: 'ini', env: 'shell', dockerfile: 'dockerfile',
  };
  return map[ext] || 'plaintext';
}

function CodeEditor({ file, repoId, onSave, readOnly = false }) {
  const [content, setContent] = useState(file?.content || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = useCallback(async () => {
    if (!repoId || !file) return;
    setSaving(true); setError('');
    try {
      await api.put(`/repos/${repoId}/files`, { path: file.path, content });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onSave) onSave({ ...file, content });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  }, [repoId, file, content, onSave]);

  if (!file) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117', color: '#8b949e' }}>
        <div style={{ textAlign: 'center' }}>
          <FiCode size={48} style={{ marginBottom: 16, color: '#30363d' }} />
          <div>Select a file to edit</div>
        </div>
      </div>
    );
  }

  const lang = getLanguage(file.name);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#161b22', borderBottom: '1px solid #30363d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiCode size={14} color="#8b949e" />
          <span style={{ color: '#c9d1d9', fontSize: 13 }}>{file.path || file.name}</span>
          <span style={{ color: '#8b949e', fontSize: 11, background: '#21262d', padding: '1px 6px', borderRadius: 4 }}>{lang}</span>
        </div>
        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {error && <span style={{ color: '#f85149', fontSize: 12 }}>{error}</span>}
            {saved && <span style={{ color: '#3fb950', fontSize: 12 }}>Saved!</span>}
            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <FiSave size={13} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language={lang}
          value={content}
          onChange={val => setContent(val || '')}
          options={{
            readOnly,
            minimap: { enabled: true },
            theme: 'vs-dark',
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditor;
