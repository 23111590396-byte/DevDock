import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'];

function getLanguage(filename) {
  if (!filename) return 'text';
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
    c: 'c', cpp: 'cpp', cs: 'csharp', php: 'php', html: 'html',
    css: 'css', scss: 'scss', json: 'json', yaml: 'yaml', yml: 'yaml',
    md: 'markdown', sh: 'bash', bash: 'bash', sql: 'sql', xml: 'xml',
    dockerfile: 'docker', toml: 'toml', env: 'bash',
  };
  return map[ext] || 'text';
}

function FileViewer({ file }) {
  if (!file) return <div style={{ color: '#8b949e', padding: 24, textAlign: 'center' }}>Select a file to view</div>;

  const ext = file.name?.split('.').pop().toLowerCase();
  if (IMAGE_EXTS.includes(ext)) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <img src={`data:image/${ext};base64,${file.content}`} alt={file.name} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }} />
      </div>
    );
  }

  const lang = getLanguage(file.name);
  const content = file.content || '';

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #30363d', background: '#161b22', color: '#8b949e', fontSize: 12 }}>
        {file.path || file.name}
      </div>
      <SyntaxHighlighter
        language={lang}
        style={vscDarkPlus}
        showLineNumbers
        customStyle={{ margin: 0, borderRadius: 0, background: '#0d1117', fontSize: 13, minHeight: '100%' }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}

export default FileViewer;
