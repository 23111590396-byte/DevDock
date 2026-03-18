import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCode, FiUsers, FiZap, FiGitBranch, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: FiGitBranch, title: 'Repository Management', desc: 'Create, manage, and collaborate on code repositories with a powerful file editor and version control.' },
  { icon: FiZap, title: 'AI Assistant', desc: 'Integrated AI powered by Groq — get code suggestions, explanations, reviews, and improvements.' },
  { icon: FiUsers, title: 'Real-time Collaboration', desc: 'Work together with live messaging, notifications, and presence indicators.' },
  { icon: FiStar, title: 'Social Network', desc: 'Follow developers, star repos, earn achievements, and build your dev community.' },
];

function Home() {
  const { user } = useAuth();
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', padding: '100px 24px 60px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <FiCode size={48} color="#58a6ff" />
          <h1 style={{ fontSize: 48, fontWeight: 800, color: '#c9d1d9', margin: 0 }}>DevDock</h1>
        </div>
        <p style={{ fontSize: 22, color: '#8b949e', maxWidth: 600, margin: '0 auto 16px' }}>A unified developer workspace</p>
        <p style={{ fontSize: 16, color: '#8b949e', maxWidth: 500, margin: '0 auto 40px' }}>Manage repositories, collaborate in real-time, get AI assistance, and connect with developers worldwide.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link to="/dashboard" style={{ background: '#238636', color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/register" style={{ background: '#238636', color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>Get Started Free</Link>
              <Link to="/login" style={{ background: 'transparent', color: '#c9d1d9', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 16, border: '1px solid #30363d' }}>Sign in</Link>
            </>
          )}
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.3, duration: 0.5 }} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 28 }}>
            <f.icon size={28} color="#58a6ff" style={{ marginBottom: 16 }} />
            <h3 style={{ color: '#c9d1d9', marginBottom: 8, fontSize: 18 }}>{f.title}</h3>
            <p style={{ color: '#8b949e', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '60px 24px 80px', borderTop: '1px solid #21262d' }}>
        <h2 style={{ color: '#c9d1d9', fontSize: 32, marginBottom: 16 }}>Ready to dock in?</h2>
        <p style={{ color: '#8b949e', marginBottom: 32, fontSize: 16 }}>Join thousands of developers building amazing things.</p>
        {!user && <Link to="/register" style={{ background: '#238636', color: '#fff', padding: '14px 36px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>Create your account</Link>}
      </div>
    </div>
  );
}
export default Home;
