import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiSearch, FiMessageSquare } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

function Messenger() {
  const { user } = useAuth();
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) fetchMessages(selectedConv._id || selectedConv.userId);
  }, [selectedConv]); // eslint-disable-line

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    socket.on('message', (msg) => {
      setMessages(prev => {
        if (selectedConv && (msg.sender === selectedConv._id || msg.sender?._id === selectedConv._id)) {
          return [...prev, msg];
        }
        return prev;
      });
      fetchConversations();
    });
    return () => socket.off('message');
  }, [socket, selectedConv]); // eslint-disable-line

  const fetchConversations = async () => {
    setLoadingConvs(true);
    try {
      const r = await api.get('/messages/conversations');
      setConversations(r.data.conversations || r.data || []);
    } catch {}
    setLoadingConvs(false);
  };

  const fetchMessages = async (userId) => {
    setLoadingMsgs(true);
    try {
      const r = await api.get(`/messages/${userId}`);
      setMessages(r.data.messages || r.data || []);
    } catch {}
    setLoadingMsgs(false);
  };

  const sendMessage = async e => {
    e.preventDefault();
    if (!input.trim() || !selectedConv || sending) return;
    setSending(true);
    const recipientId = selectedConv._id || selectedConv.userId;
    try {
      const r = await api.post('/messages', { recipientId, content: input });
      setMessages(prev => [...prev, r.data.message || r.data]);
      setInput('');
      fetchConversations();
    } catch {}
    setSending(false);
  };

  const handleSearch = async (q) => {
    setSearch(q);
    if (!q.trim()) { setSearchResults([]); return; }
    
    try {
      const r = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
      setSearchResults(r.data.users || r.data || []);
    } catch {}
    
  };

  const startConversation = (u) => {
    setSelectedConv({ _id: u._id, username: u.username, avatar: u.avatar });
    setSearch(''); setSearchResults([]);
    fetchMessages(u._id);
  };

  const Avatar = ({ user: u, size = 36 }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#238636', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.4, overflow: 'hidden', flexShrink: 0 }}>
      {u?.avatar ? <img src={u.avatar} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u?.username?.charAt(0).toUpperCase() || '?'}
    </div>
  );

  const isOwnMsg = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    return senderId === user?._id || senderId === user?.id;
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', background: '#0d1117' }}>
      {/* Sidebar */}
      <div style={{ width: 300, borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column', background: '#161b22' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #30363d' }}>
          <h2 style={{ color: '#c9d1d9', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <FiSearch size={14} color="#8b949e" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search users..."
              style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '7px 10px 7px 30px', color: '#c9d1d9', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {searchResults.length > 0 && (
            <div style={{ marginTop: 4, background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, overflow: 'hidden' }}>
              {searchResults.slice(0, 5).map(u => (
                <div key={u._id} onClick={() => startConversation(u)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#21262d'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Avatar user={u} size={28} />
                  <span style={{ color: '#c9d1d9', fontSize: 13 }}>{u.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {loadingConvs ? <div style={{ padding: 20, color: '#8b949e', textAlign: 'center', fontSize: 13 }}>Loading...</div> :
            conversations.length === 0 ? <div style={{ padding: 24, color: '#8b949e', textAlign: 'center', fontSize: 13 }}><FiMessageSquare size={24} style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />No conversations yet</div> :
            conversations.map(conv => {
              const other = conv.participants?.find(p => p._id !== user?._id) || conv;
              const isSelected = selectedConv?._id === (other._id || conv.userId);
              return (
                <div key={conv._id} onClick={() => setSelectedConv(other)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer', background: isSelected ? '#21262d' : 'transparent', borderBottom: '1px solid #21262d' }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#1c2128'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
                  <Avatar user={other} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#c9d1d9', fontSize: 14, fontWeight: 500 }}>{other.username}</div>
                    <div style={{ color: '#8b949e', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage?.content || 'No messages yet'}</div>
                  </div>
                  {conv.unreadCount > 0 && <span style={{ background: '#238636', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{conv.unreadCount}</span>}
                </div>
              );
            })
          }
        </div>
      </div>

      {/* Message thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selectedConv ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e', flexDirection: 'column', gap: 12 }}>
            <FiMessageSquare size={48} color="#30363d" />
            <div style={{ fontSize: 16 }}>Select a conversation</div>
            <div style={{ fontSize: 13, color: '#484f58' }}>or search for a user to start messaging</div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #30363d', background: '#161b22', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#238636', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, overflow: 'hidden' }}>
                {selectedConv.avatar ? <img src={selectedConv.avatar} alt={selectedConv.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedConv.username?.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: '#c9d1d9', fontWeight: 600, fontSize: 15 }}>{selectedConv.username}</span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loadingMsgs ? <div style={{ color: '#8b949e', textAlign: 'center', padding: 20 }}>Loading messages...</div> :
                messages.length === 0 ? <div style={{ color: '#8b949e', textAlign: 'center', padding: 40 }}>No messages yet. Say hello!</div> :
                messages.map((msg, i) => {
                  const own = isOwnMsg(msg);
                  return (
                    <motion.div key={msg._id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: own ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{ background: own ? '#238636' : '#21262d', border: own ? 'none' : '1px solid #30363d', borderRadius: own ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px', color: '#c9d1d9', fontSize: 14, lineHeight: 1.5 }}>
                          {msg.content}
                        </div>
                        <div style={{ color: '#8b949e', fontSize: 11, marginTop: 4, textAlign: own ? 'right' : 'left' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              }
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ padding: '12px 20px', borderTop: '1px solid #30363d', background: '#161b22', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input value={input} onChange={e => setInput(e.target.value)} placeholder={`Message @${selectedConv.username}...`} disabled={sending}
                style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: '10px 14px', color: '#c9d1d9', fontSize: 14, outline: 'none' }} />
              <button type="submit" disabled={sending || !input.trim()} style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 8, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiSend size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Messenger;
