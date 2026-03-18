import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiZap } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../api/axios';

const MODES = [
  { id: 'chat', label: 'Chat', placeholder: 'Ask anything about your code...' },
  { id: 'suggest', label: 'Suggest', placeholder: 'Describe what you need...' },
  { id: 'explain', label: 'Explain', placeholder: 'Paste code to explain...' },
  { id: 'improve', label: 'Improve', placeholder: 'Paste code to improve...' },
];

function AIAssistant({ repoContext = '' }) {
  const [mode, setMode] = useState('chat');
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Hi! I'm your AI assistant. Ask me anything about your code or project." }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async e => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const r = await api.post('/ai/groq', { mode, prompt: input, context: repoContext });
      const aiContent = r.data.response || r.data.result || r.data.message || 'No response received.';
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ AI service unavailable. ' + (err.response?.data?.message || 'Please try again.') }]);
    }
    setLoading(false);
  };

  const modeStyle = active => ({ padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: active ? 600 : 400, background: active ? '#238636' : '#21262d', color: active ? '#fff' : '#8b949e', transition: 'all 0.2s' });

  const currentMode = MODES.find(m => m.id === mode);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #30363d', background: '#161b22', display: 'flex', alignItems: 'center', gap: 8 }}>
        <FiZap size={16} color="#e3b341" />
        <span style={{ color: '#c9d1d9', fontWeight: 600, fontSize: 14 }}>AI Assistant</span>
        <div style={{ display: 'flex', gap: 6, marginLeft: 8, flexWrap: 'wrap' }}>
          {MODES.map(m => <button key={m.id} style={modeStyle(mode === m.id)} onClick={() => setMode(m.id)}>{m.label}</button>)}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.role === 'user' ? '#238636' : '#e3b341', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {msg.role === 'user' ? 'U' : 'AI'}
            </div>
            <div style={{ maxWidth: '80%', background: msg.role === 'user' ? '#238636' : '#161b22', border: `1px solid ${msg.role === 'user' ? '#238636' : '#30363d'}`, borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', padding: '10px 14px', fontSize: 13, color: '#c9d1d9', lineHeight: 1.6 }}>
              <ReactMarkdown
                components={{
                  code({ inline, className, children }) {
                    const lang = (className || '').replace('language-', '');
                    return inline ? (
                      <code style={{ background: '#21262d', padding: '1px 5px', borderRadius: 3, fontSize: 12, fontFamily: 'monospace' }}>{children}</code>
                    ) : (
                      <SyntaxHighlighter language={lang || 'text'} style={vscDarkPlus} customStyle={{ borderRadius: 6, fontSize: 12, margin: '8px 0' }}>{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                    );
                  }
                }}
              >{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e3b341', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>AI</div>
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px 12px 12px 4px', padding: '10px 14px', display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#58a6ff', display: 'inline-block', animation: `bounce 0.8s ${i * 0.15}s infinite alternate` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid #30363d', background: '#161b22', display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={currentMode?.placeholder || 'Ask anything...'}
          disabled={loading}
          style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: '10px 14px', color: '#c9d1d9', fontSize: 14, outline: 'none' }}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}>
          <FiSend size={14} />
        </button>
      </form>
      <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }`}</style>
    </div>
  );
}

export default AIAssistant;
