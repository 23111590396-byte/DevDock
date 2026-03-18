import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiMessageSquare, FiSearch, FiUser, FiSettings, FiLogOut, FiCode, FiChevronDown, FiCompass } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/explore?q=${encodeURIComponent(searchQ.trim())}`);
  };

  const navStyle = {
    background: '#161b22', borderBottom: '1px solid #30363d',
    position: 'sticky', top: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', padding: '0 24px',
    height: 64, gap: 16,
  };

  const linkStyle = {
    color: '#c9d1d9', textDecoration: 'none', display: 'flex',
    alignItems: 'center', gap: 6, padding: '6px 10px',
    borderRadius: 6, transition: 'background 0.2s',
    fontSize: 14,
  };

  const btnStyle = {
    background: '#238636', color: '#fff', border: 'none',
    borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
    fontSize: 14, fontWeight: 600, textDecoration: 'none',
    display: 'inline-flex', alignItems: 'center',
  };

  const avatarStyle = {
    width: 32, height: 32, borderRadius: '50%',
    background: '#238636', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    border: '2px solid #30363d',
    overflow: 'hidden',
  };

  const dropdownStyle = {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: '#161b22', border: '1px solid #30363d',
    borderRadius: 8, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    zIndex: 2000,
  };

  const dropItemStyle = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', color: '#c9d1d9', textDecoration: 'none',
    fontSize: 14, cursor: 'pointer', border: 'none', background: 'none',
    width: '100%', textAlign: 'left', transition: 'background 0.2s',
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 8 }}>
        <FiCode size={24} color="#58a6ff" />
        <span style={{ color: '#c9d1d9', fontWeight: 700, fontSize: 18 }}>DevDock</span>
      </Link>

      <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '0 10px', flex: 1, maxWidth: 340 }}>
        <FiSearch color="#8b949e" size={14} />
        <input
          value={searchQ} onChange={e => setSearchQ(e.target.value)}
          placeholder="Search users, repos..."
          style={{ background: 'none', border: 'none', outline: 'none', color: '#c9d1d9', padding: '6px 8px', fontSize: 14, width: '100%' }}
        />
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
        <Link to="/explore" style={linkStyle} onMouseEnter={e => e.currentTarget.style.background = '#21262d'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <FiCompass size={16} /><span>Explore</span>
        </Link>

        {user && (
          <>
            <Link to="/messages" style={linkStyle} onMouseEnter={e => e.currentTarget.style.background = '#21262d'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <FiMessageSquare size={16} /><span>Messages</span>
            </Link>

            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(o => !o)} style={{ ...linkStyle, background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiBell size={18} />
              </button>
              {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
            </div>

            <div ref={userMenuRef} style={{ position: 'relative', marginLeft: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setUserMenuOpen(o => !o)}>
                <div style={avatarStyle}>
                  {user.avatar ? <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.username?.charAt(0).toUpperCase()}
                </div>
                <FiChevronDown color="#8b949e" size={14} />
              </div>
              {userMenuOpen && (
                <div style={dropdownStyle}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid #30363d' }}>
                    <div style={{ color: '#c9d1d9', fontWeight: 600, fontSize: 14 }}>{user.username}</div>
                    <div style={{ color: '#8b949e', fontSize: 12 }}>{user.email}</div>
                  </div>
                  <Link to={`/${user.username}`} style={dropItemStyle} onClick={() => setUserMenuOpen(false)} onMouseEnter={e => e.currentTarget.style.background = '#21262d'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <FiUser size={14} /> Profile
                  </Link>
                  <Link to="/dashboard" style={dropItemStyle} onClick={() => setUserMenuOpen(false)} onMouseEnter={e => e.currentTarget.style.background = '#21262d'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <FiCode size={14} /> Dashboard
                  </Link>
                  <Link to="/settings" style={dropItemStyle} onClick={() => setUserMenuOpen(false)} onMouseEnter={e => e.currentTarget.style.background = '#21262d'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <FiSettings size={14} /> Settings
                  </Link>
                  <div style={{ borderTop: '1px solid #30363d' }}>
                    <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }} style={{ ...dropItemStyle, color: '#f85149' }} onMouseEnter={e => e.currentTarget.style.background = '#21262d'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <FiLogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!user && (
          <>
            <Link to="/login" style={{ ...linkStyle }} onMouseEnter={e => e.currentTarget.style.background = '#21262d'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Sign in</Link>
            <Link to="/register" style={btnStyle}>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
