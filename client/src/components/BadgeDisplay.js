import React from 'react';

const BADGE_INFO = {
  'first-repo': { emoji: '🚀', label: 'First Repository' },
  'ten-repos': { emoji: '📦', label: '10 Repositories' },
  'first-star': { emoji: '⭐', label: 'First Star' },
  'hundred-stars': { emoji: '🌟', label: '100 Stars' },
  'first-follower': { emoji: '👥', label: 'First Follower' },
  'popular': { emoji: '🔥', label: 'Popular Developer' },
  'contributor': { emoji: '🤝', label: 'Contributor' },
  'open-source': { emoji: '💻', label: 'Open Source Hero' },
  'early-adopter': { emoji: '🎯', label: 'Early Adopter' },
  'verified': { emoji: '✅', label: 'Verified Developer' },
};

function BadgeDisplay({ badges = [] }) {
  if (!badges || badges.length === 0) {
    return <div style={{ color: '#8b949e', fontSize: 13 }}>No badges yet.</div>;
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {badges.map((badge, i) => {
        const info = BADGE_INFO[badge] || { emoji: '🏅', label: badge };
        return (
          <div key={i} title={info.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 14px', background: '#21262d', border: '1px solid #30363d', borderRadius: 8, cursor: 'default' }}>
            <span style={{ fontSize: 24 }}>{info.emoji}</span>
            <span style={{ fontSize: 11, color: '#8b949e', textAlign: 'center', maxWidth: 70 }}>{info.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default BadgeDisplay;
