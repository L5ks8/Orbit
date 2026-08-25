import React, { useState, useEffect } from 'react';
import CustomSelect from '../../ui/CustomSelect';
import { getCache, setCache } from '../../../utils/cache';

export default function Leaderboard({ guildId }) {
  const [sortCategory, setSortCategory] = useState('total_xp');
  const cacheKey = `leaderboard_${guildId}_${sortCategory}`;
  const cachedData = getCache(cacheKey);

  const [data, setData] = useState(cachedData || null);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    if (!guildId) return;
    if (!getCache(cacheKey)) setLoading(true);
    fetch(`/api/public_leaderboard/${guildId}?sort=${sortCategory}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setCache(cacheKey, d);
      })
      .catch(err => console.error("Error fetching leaderboard:", err))
      .finally(() => setLoading(false));
  }, [guildId, sortCategory]);

  const sortOptions = [
    { value: 'total_xp', label: 'Total XP' },
    { value: 'message_count', label: 'Messages' },
    { value: 'voice_minutes', label: 'Voice Time (Hours)' },
    { value: 'reaction_count', label: 'Reactions' },
    { value: 'invites', label: 'Invites' }
  ];

  return (
    <div className="dash-leaderboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="dash-title">Leaderboard</h1>
          <p className="dash-subtitle">See who's the most active in your server.</p>
        </div>
        <div style={{ width: '220px', position: 'relative', zIndex: 10 }}>
          <CustomSelect 
            options={sortOptions} 
            value={sortCategory} 
            onChange={setSortCategory} 
          />
        </div>
      </div>

      <div className="dash-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading Leaderboard...</div>
        ) : data?.error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(239,68,68,0.8)' }}>
            Error: {data.error}
          </div>
        ) : !data?.entries || data.entries.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
            No data available for this category yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '16px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Rank</th>
                <th style={{ padding: '16px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>User</th>
                <th style={{ padding: '16px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, textAlign: 'right' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map(entry => (
                <tr key={entry.rank} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: entry.rank <= 3 ? '#fbbf24' : '#fff' }}>
                    #{entry.rank}
                  </td>
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={entry.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                      alt="" 
                      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                      onError={(e) => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                    />
                    <div>
                      <div style={{ fontWeight: 500 }}>{entry.name}</div>
                      {sortCategory !== 'invites' && (
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Level {entry.level}</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>
                    {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, {maximumFractionDigits: 1}) : entry.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
