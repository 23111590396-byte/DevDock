import React, { useState } from 'react';
import { FiFolder, FiFile, FiFilePlus, FiFolderPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function TreeNode({ node, depth = 0, onSelect, selectedFile }) {
  const [open, setOpen] = useState(depth < 2);
  const isDir = node.type === 'dir' || node.type === 'folder' || (node.children && node.children.length >= 0);
  const isSelected = selectedFile && selectedFile.path === node.path;

  const handleClick = () => {
    if (isDir) setOpen(o => !o);
    else onSelect(node);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: `4px 8px 4px ${depth * 16 + 8}px`,
          cursor: 'pointer', borderRadius: 4,
          background: isSelected ? 'rgba(88,166,255,0.1)' : 'transparent',
          color: isSelected ? '#58a6ff' : '#c9d1d9',
          fontSize: 13, userSelect: 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#21262d'; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
      >
        {isDir ? (open ? <FiFolder size={14} color="#58a6ff" /> : <FiFolder size={14} color="#e3b341" />) : <FiFile size={14} color="#8b949e" />}
        <span>{node.name}</span>
      </div>
      {isDir && (
        <AnimatePresence>
          {open && node.children && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              {node.children.map((child, i) => (
                <TreeNode key={i} node={child} depth={depth + 1} onSelect={onSelect} selectedFile={selectedFile} />
              ))}
              {node.children.length === 0 && (
                <div style={{ paddingLeft: (depth + 1) * 16 + 8, color: '#8b949e', fontSize: 12, padding: `2px 8px 2px ${(depth + 1) * 16 + 8}px` }}>Empty folder</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

function FileTreeSidebar({ files = [], onSelect, selectedFile, onAddFile, onAddFolder }) {
  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#161b22', borderRight: '1px solid #30363d' }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#c9d1d9', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Files</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {onAddFile && (
            <button onClick={onAddFile} title="New file" style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
              <FiFilePlus size={14} />
            </button>
          )}
          {onAddFolder && (
            <button onClick={onAddFolder} title="New folder" style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
              <FiFolderPlus size={14} />
            </button>
          )}
        </div>
      </div>
      {files.length === 0 ? (
        <div style={{ padding: 20, color: '#8b949e', fontSize: 12, textAlign: 'center' }}>
          <FiFile size={24} style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
          No files yet
        </div>
      ) : (
        <div style={{ padding: '4px 0' }}>
          {files.map((f, i) => <TreeNode key={i} node={f} onSelect={onSelect} selectedFile={selectedFile} />)}
        </div>
      )}
    </div>
  );
}

export default FileTreeSidebar;
