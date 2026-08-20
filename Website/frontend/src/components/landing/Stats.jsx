import React, { useState, useEffect } from 'react';

export default function Stats() {
  const [stats, setStats] = useState({ servers: '0', users: '0', ping: '0' });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        // Format large numbers
        const formatNum = (num) => {
          if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
          if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
          return num.toString();
        };
        setStats({
          servers: formatNum(data.servers),
          users: formatNum(data.users),
          ping: data.ping.toString()
        });
      })
      .catch(err => console.error("Failed to load stats:", err));
  }, []);

  return (
    <div className="lp-stats-row">
      <div className="lp-stat reveal" style={{ '--i': 0 }}>
        <span className="lp-stat-val">{stats.servers}</span>
        <span className="lp-stat-lbl">Servers</span>
      </div>
      <div className="lp-stat reveal" style={{ '--i': 1 }}>
        <span className="lp-stat-val">{stats.users}</span>
        <span className="lp-stat-lbl">Users Protected</span>
      </div>
      <div className="lp-stat reveal" style={{ '--i': 2 }}>
        <span className="lp-stat-val">{stats.ping}</span>
        <span className="lp-stat-lbl">ms Latency</span>
      </div>
    </div>
  );
}
