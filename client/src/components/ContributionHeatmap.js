import React, { useState } from 'react';

function ContributionHeatmap({ contributions = {} }) {
  const [tooltip, setTooltip] = useState(null);

  // Generate last 364 days (52 weeks)
  const today = new Date();
  const days = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push({ date: key, count: contributions[key] || 0, day: d.getDay() });
  }

  // Pad start so first column begins on Sunday
  const firstDay = days[0];
  const firstDow = new Date(firstDay.date).getDay();
  const paddedDays = [...Array(firstDow).fill(null), ...days];

  // Split into weeks
  const weeks = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  const getColor = count => {
    if (!count || count === 0) return '#161b22';
    if (count <= 2) return '#0e4429';
    if (count <= 5) return '#006d32';
    if (count <= 9) return '#26a641';
    return '#39d353';
  };

  // Month labels
  const months = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstValidDay = week.find(d => d !== null);
    if (firstValidDay) {
      const m = new Date(firstValidDay.date).getMonth();
      if (m !== lastMonth) {
        months.push({ month: new Date(firstValidDay.date).toLocaleString('default', { month: 'short' }), weekIndex: wi });
        lastMonth = m;
      }
    }
  });

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  const totalContributions = Object.values(contributions).reduce((a, b) => a + b, 0);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ color: '#8b949e', fontSize: 13, marginBottom: 8 }}>{totalContributions} contributions in the last year</div>
      <div style={{ position: 'relative', fontSize: 11, color: '#8b949e', marginBottom: 4, paddingLeft: 28, height: 16 }}>
        {months.map((m, i) => (
          <div key={i} style={{ position: 'absolute', left: (m.weekIndex * 13) + 28 }}>{m.month}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 2, position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 4 }}>
          {dayLabels.map((d, i) => (
            <div key={i} style={{ height: 11, fontSize: 9, color: '#8b949e', lineHeight: '11px', textAlign: 'right', minWidth: 24 }}>{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {week.map((day, di) => (
              <div
                key={di}
                style={{ width: 11, height: 11, borderRadius: 2, background: day ? getColor(day.count) : 'transparent', cursor: day ? 'pointer' : 'default', position: 'relative' }}
                onMouseEnter={e => day && setTooltip({ ...day, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        ))}
      </div>
      {tooltip && (
        <div style={{ position: 'fixed', top: tooltip.y - 44, left: tooltip.x - 60, background: '#1b1f23', border: '1px solid #30363d', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#c9d1d9', zIndex: 9999, pointerEvents: 'none' }}>
          <strong>{tooltip.count} contribution{tooltip.count !== 1 ? 's' : ''}</strong> on {tooltip.date}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: '#8b949e' }}>
        <span>Less</span>
        {['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map(c => (
          <div key={c} style={{ width: 11, height: 11, borderRadius: 2, background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default ContributionHeatmap;
