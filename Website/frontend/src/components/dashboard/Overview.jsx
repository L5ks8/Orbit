import React from 'react';

export default function Overview() {
  const stats = [
    { label: 'Total Members', value: '45,231', trend: '+12% this week' },
    { label: 'Messages Sent', value: '1.2M', trend: '+5% this week' },
    { label: 'Commands Used', value: '8,409', trend: '+2% this week' },
    { label: 'Active Modules', value: '4/12', trend: 'Stable' },
  ];

  return (
    <div className="dash-overview">
      <h1 className="dash-title">Overview</h1>
      <p className="dash-subtitle">Welcome back! Here's what's happening in your server today.</p>
      
      <div className="dash-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="dash-stat-card">
            <h3 className="stat-label">{stat.label}</h3>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-trend">{stat.trend}</div>
          </div>
        ))}
      </div>

      <div className="dash-activity-section">
        <h2>Recent Activity</h2>
        <div className="dash-card">
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon mod"></div>
              <div className="activity-details">
                <span className="activity-title">Auto-Moderation</span>
                <span className="activity-desc">Deleted a message from user123 for swearing.</span>
              </div>
              <div className="activity-time">2m ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon welcome"></div>
              <div className="activity-details">
                <span className="activity-title">Welcome</span>
                <span className="activity-desc">Sent welcome card to new_user_99.</span>
              </div>
              <div className="activity-time">15m ago</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon level"></div>
              <div className="activity-details">
                <span className="activity-title">Leveling</span>
                <span className="activity-desc">cool_guy leveled up to level 15.</span>
              </div>
              <div className="activity-time">1h ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
