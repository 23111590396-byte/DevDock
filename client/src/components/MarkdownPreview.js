import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';

function MarkdownPreview({ value = '', onChange, readOnly = false }) {
  const [mode, setMode] = useState('split'); // 'edit', 'preview', 'split'

  const btnStyle = (active) => ({
    padding: '4px 12px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 12,
    background: active ? '#238636' : '#21262d', color: active ? '#fff' : '#8b949e',
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderBottom: '1px solid #30363d', background: '#161b22' }}>
        <button style={btnStyle(mode === 'edit')} onClick={() => setMode('edit')}>Edit</button>
        <button style={btnStyle(mode === 'split')} onClick={() => setMode('split')}>Split</button>
        <button style={btnStyle(mode === 'preview')} onClick={() => setMode('preview')}>Preview</button>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {(mode === 'edit' || mode === 'split') && (
          <div style={{ flex: 1, overflow: 'hidden', borderRight: mode === 'split' ? '1px solid #30363d' : 'none' }}>
            <Editor
              height="100%"
              language="markdown"
              value={value}
              onChange={onChange}
              options={{ readOnly, minimap: { enabled: false }, theme: 'vs-dark', fontSize: 14, wordWrap: 'on' }}
            />
          </div>
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div style={{ flex: 1, overflow: 'auto', padding: 20, color: '#c9d1d9', fontSize: 14, lineHeight: 1.7 }}>
            <ReactMarkdown>{value}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default MarkdownPreview;
