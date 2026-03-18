import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiBook, FiStar, FiMapPin, FiLink, FiCalendar, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ContributionHeatmap from '../components/ContributionHeatmap';
import BadgeDisplay from '../components/BadgeDisplay';

function UserProfile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [contributions, setContributions] = useState({});
  const [activeTab, setActiveTab] = useState('repos');

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]); // eslint-disable-line

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/users/${username}`);
      const u = r.data.user || r.data;
      setProfile(u);
      setFollowing(u.isFollowing || false);
      // Fetch repos
      const reposRes = await api.get(`/repos/public?owner=${username}`).catch(() => ({ data: [] }));
      setRepos(reposRes.data.repos || reposRes.data || []);
      // Fetch contributions
      const contribRes = await api.get(`/users/${username}/contributions`).catch(() => ({ data: {} }));
      setContributions(contribRes.data.contributions || contribRes.data || {});
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleFollow = async () => {
    if (!currentUser) return;
    setFollowLoading(true);
    try {
      if (following) {
        await api.delete(`/users/${username}/follow`);
        setProfile(p => ({ ...p, followersCount: (p.followersCount || 1) - 1 }));
      } else {
        await api.post(`/users/${username}/follow`);
        setProfile(p => ({ ...p, followersCount: (p.followersCount || 0) + 1 }));
      }
      setFollowing(f => !f);
    } catch {}
    setFollowLoading(false);
  };

  const tabStyle = active => ({
    padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14,
    background: active ? '#21262d' : 'transparent', color: active ? '#c9d1d9' : '#8b949e',
    fontWeight: active ? 600 : 400, display: 'inline-flex', alignItems: 'center', gap: 6,
  });

  if (loading) return <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>Loading profile...</div>;
  if (!profile) return <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>User not found.</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ width: 260, flexShrink: 0 }}>
          <div style={{ width: 200, height: 200, borderRadius: '50%', overflow: 'hidden', border: '4px solid #30363d', margin: '0 auto 20px', background: '#238636', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profile.avatar ? <img src={profile.avatar} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 72, fontWeight: 700, color: '#fff' }}>{profile.username?.charAt(0).toUpperCase()}</span>}
          </div>

          <h1 style={{ color: '#c9d1d9', fontSize: 22, margin: '0 0 4px' }}>{profile.name || profile.username}</h1>
          <div style={{ color: '#8b949e', fontSize: 15, marginBottom: 16 }}>@{profile.username}</div>

          {profile.bio && <p style={{ color: '#c9d1d9', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{profile.bio}</p>}

          {!isOwnProfile && currentUser && (
            <button onClick={toggleFollow} disabled={followLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px', background: following ? '#21262d' : '#238636', color: '#fff', border: following ? '1px solid #30363d' : 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              {following ? <FiUserCheck size={15} /> : <FiUserPlus size={15} />}
              {followLoading ? '...' : following ? 'Following' : 'Follow'}
            </button>
          )}

          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#c9d1d9', fontSize: 13 }}>
              <FiUsers size={14} color="#8b949e" />
              <strong>{profile.followersCount || 0}</strong> <span style={{ color: '#8b949e' }}>followers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#c9d1d9', fontSize: 13 }}>
              <strong>{profile.followingCount || 0}</strong> <span style={{ color: '#8b949e' }}>following</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profile.location && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8b949e', fontSize: 13 }}><FiMapPin size={13} /> {profile.location}</div>}
            {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#58a6ff', fontSize: 13 }}><FiLink size={13} /> {profile.website}</a>}
            {profile.createdAt && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8b949e', fontSize: 13 }}><FiCalendar size={13} /> Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>}
          </div>

          {profile.badges && profile.badges.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ color: '#c9d1d9', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Achievements</div>
              <BadgeDisplay badges={profile.badges} />
            </div>
          )}
        </motion.div>

        {/* Main content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ flex: 1, minWidth: 0 }}>
          {/* Contribution heatmap */}
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 20, marginBottom: 24 }}>
            <ContributionHeatmap contributions={contributions} />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #30363d', paddingBottom: 12 }}>
            <button style={tabStyle(activeTab === 'repos')} onClick={() => setActiveTab('repos')}><FiBook size={14} /> Repositories <span style={{ background: '#21262d', color: '#8b949e', borderRadius: 10, padding: '0 7px', fontSize: 11 }}>{repos.length}</span></button>
            <button style={tabStyle(activeTab === 'stars')} onClick={() => setActiveTab('stars')}><FiStar size={14} /> Starred</button>
          </div>

          {activeTab === 'repos' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {repos.length === 0 ? (
                <div style={{ color: '#8b949e', textAlign: 'center', padding: 40 }}>No public repositories.</div>
              ) : repos.map((repo, i) => (
                <motion.div key={repo._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Link to={`/repos/${repo._id}`} style={{ color: '#58a6ff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>{repo.name}</Link>
                    <span style={{ color: '#58a6ff', border: '1px solid rgba(88,166,255,0.3)', borderRadius: 10, padding: '1px 8px', fontSize: 11 }}>Public</span>
                  </div>
                  {repo.description && <p style={{ color: '#8b949e', fontSize: 13, margin: '0 0 10px' }}>{repo.description}</p>}
                  <div style={{ display: 'flex', gap: 16 }}>
                    {repo.language && <span style={{ color: '#8b949e', fontSize: 12 }}>● {repo.language}</span>}
                    <span style={{ color: '#8b949e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><FiStar size={12} /> {repo.starsCount || 0}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'stars' && (
            <div style={{ color: '#8b949e', textAlign: 'center', padding: 40 }}>No starred repositories.</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default UserProfile;
