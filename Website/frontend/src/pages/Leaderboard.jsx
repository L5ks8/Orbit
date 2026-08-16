import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Trophy, Coins, UserPlus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const { guildId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentSort = searchParams.get('sort') || 'total_xp';
  
  // Normalize the sort to one of our three tabs
  let activeTab = 'level';
  if (currentSort === 'balance') activeTab = 'economy';
  if (currentSort === 'invites') activeTab = 'invites';

  const fetchLeaderboard = (sortType) => {
    setLoading(true);
    fetch(`/api/public_leaderboard/${guildId}?sort=${sortType}`)
      .then(res => res.json())
      .then(d => {
        if (d.error) {
          setError(d.error);
        } else {
          setData(d);
          setError(null);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch leaderboard data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeaderboard(currentSort);
  }, [guildId, currentSort]);

  const handleTabClick = (tab) => {
    let newSort = 'total_xp';
    if (tab === 'economy') newSort = 'balance';
    if (tab === 'invites') newSort = 'invites';
    setSearchParams({ sort: newSort });
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'var(--accent)'; // Gold/Accent
    if (rank === 2) return '#9ca3af'; // Silver
    if (rank === 3) return '#b45309'; // Bronze
    return 'rgba(255,255,255,0.1)';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="dash-container" style={{ minHeight: '100vh', padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        {data?.guild_icon ? (
          <img src={data.guild_icon} alt="Guild Icon" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
        ) : (
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={32} opacity={0.5} />
          </div>
        )}
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: 'var(--text-main)' }}>
            {data ? data.guild_name : 'Server'} Leaderboard
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>Top 100 members</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
        <button 
          onClick={() => handleTabClick('level')}
          className={`dash-btn ${activeTab === 'level' ? 'primary' : 'secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none' }}
        >
          <Trophy size={18} /> Level
        </button>
        <button 
          onClick={() => handleTabClick('economy')}
          className={`dash-btn ${activeTab === 'economy' ? 'primary' : 'secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none' }}
        >
          <Coins size={18} /> Economy
        </button>
        <button 
          onClick={() => handleTabClick('invites')}
          className={`dash-btn ${activeTab === 'invites' ? 'primary' : 'secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none' }}
        >
          <UserPlus size={18} /> Invites
        </button>
      </div>

      {/* Content */}
      <div className="dash-card settings-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="loader" style={{ margin: '0 auto 20px auto', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            Loading leaderboard...
          </div>
        ) : error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#f87171' }}>
            <h2>{error}</h2>
          </div>
        ) : data && data.entries.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>No data found for this category yet.</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.entries.map((entry, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={entry.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px 24px',
                  borderBottom: idx === data.entries.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  background: entry.rank <= 3 ? `linear-gradient(90deg, ${getRankColor(entry.rank)}10, transparent)` : 'transparent',
                  transition: 'background 0.2s',
                }}
                className="leaderboard-row"
              >
                {/* Rank Badge */}
                <div style={{ 
                  width: '50px', 
                  fontSize: entry.rank <= 3 ? '28px' : '20px', 
                  fontWeight: 'bold', 
                  color: entry.rank <= 3 ? getRankColor(entry.rank) : 'var(--text-muted)',
                  textAlign: 'center',
                  marginRight: '20px'
                }}>
                  {getRankBadge(entry.rank)}
                </div>

                {/* Avatar */}
                {entry.avatar ? (
                  <img src={entry.avatar} alt="Avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', marginRight: '16px' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', marginRight: '16px' }}></div>
                )}

                {/* Name */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>{entry.name}</div>
                  {activeTab === 'level' && (
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Level {entry.level}</div>
                  )}
                </div>

                {/* Value */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>
                    {activeTab === 'economy' ? `$${entry.value.toLocaleString()}` : entry.value.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {activeTab === 'level' ? 'XP' : activeTab === 'economy' ? 'Balance' : 'Invites'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
