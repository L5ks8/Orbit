import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function Overview() {
  const { guildId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guildId) return;
    
    setLoading(true);
    fetch(`/api/guild_stats/${guildId}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
      })
      .catch(err => console.error("Error fetching overview stats:", err))
      .finally(() => setLoading(false));
  }, [guildId]);

  if (loading) {
    return <div style={{padding: '50px', textAlign: 'center'}}>Loading Overview...</div>;
  }

  const displayStats = [
    { label: 'Total Members', value: stats?.total_members?.toLocaleString() || '0', trend: `${stats?.today_joins || 0} joins today` },
    { label: 'Messages Today', value: stats?.today_messages?.toLocaleString() || '0', trend: 'Activity in 24h' },
    { label: 'Members Left', value: stats?.today_leaves?.toLocaleString() || '0', trend: 'Leaves today' },
  ];

  return (
    <div className="dash-overview">
      <h1 className="dash-title">Overview</h1>
      <p className="dash-subtitle">Welcome back! Here's what's happening in your server today.</p>
      
      <div className="dash-stats-grid">
        {displayStats.map((stat, i) => (
          <div key={i} className="dash-stat-card">
            <h3 className="stat-label">{stat.label}</h3>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-trend">{stat.trend}</div>
          </div>
        ))}
      </div>

      <div className="dash-activity-section" style={{ marginTop: '32px' }}>
        <h2>Activity Graph</h2>
        <div className="dash-card" style={{ padding: '24px', display: 'flex', gap: '8px', alignItems: 'flex-end', height: '200px' }}>
          {stats?.history && stats.history.length > 0 ? (
            stats.history.map((day, i) => {
              const maxMsgs = Math.max(...stats.history.map(d => d.messages || 0), 1);
              const height = `${Math.max(10, ((day.messages || 0) / maxMsgs) * 100)}%`;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '100%', 
                    background: 'var(--primary)', 
                    height: height, 
                    borderRadius: '4px',
                    opacity: 0.8
                  }} title={`${day.messages} messages on ${day.date}`}></div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {day.date.split('-').slice(1).join('/')}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>No historical data available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
