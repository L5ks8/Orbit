import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ServerSelector() {
  const { user, loading } = useAuth();
  const [guilds, setGuilds] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/api/guilds')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setGuilds(data);
          } else if (data && data.guilds) {
            setGuilds(data.guilds);
          }
        })
        .catch(err => console.error("Failed to load guilds:", err))
        .finally(() => setFetching(false));
    } else {
      setFetching(false);
    }
  }, [user]);

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '16px' }}>Loading...</p>
    </div>
  );
  
  if (!user) {
    window.location.href = '/auth/login?next=/dashboard';
    return <div style={styles.loadingContainer}><p style={{ color: 'rgba(255,255,255,0.5)' }}>Redirecting to login...</p></div>;
  }

  return (
    <div style={styles.page}>
      {/* Background glow effects */}
      <div style={styles.bgGlow1}></div>
      <div style={styles.bgGlow2}></div>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.userRow}>
            <img 
              src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64` : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
              alt="" 
              style={styles.userAvatar}
              onError={(e) => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
            />
            <div>
              <p style={styles.greeting}>Welcome back,</p>
              <h2 style={styles.username}>{user.username}</h2>
            </div>
          </div>
          <a href="/auth/logout" style={styles.logoutBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </a>
        </div>

        <div style={styles.divider}></div>

        {/* Title */}
        <h1 style={styles.title}>Select a Server</h1>
        <p style={styles.subtitle}>Choose a server where Orbit is active to manage its configuration.</p>

        {/* Server Grid */}
        {fetching ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '12px', fontSize: '14px' }}>Loading your servers...</p>
          </div>
        ) : guilds.length === 0 ? (
          <div style={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 15h8M9 9h.01M15 9h.01"></path></svg>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '16px', fontSize: '15px' }}>No servers found where you have admin permissions.</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', marginTop: '4px' }}>Make sure Orbit is invited to your server.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {guilds.map(guild => (
              <Link 
                key={guild.id} 
                to={`/dashboard/${guild.id}/overview`}
                style={styles.card}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <div style={styles.cardInner}>
                  {guild.icon ? (
                    <img 
                      src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`} 
                      alt={guild.name} 
                      style={styles.guildIcon}
                    />
                  ) : (
                    <div style={styles.guildIconPlaceholder}>
                      {guild.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={styles.guildInfo}>
                    <span style={styles.guildName}>{guild.name}</span>
                    {guild.owner && (
                      <span style={styles.ownerBadge}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/></svg>
                        Owner
                      </span>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow1: {
    position: 'absolute',
    top: '-200px',
    left: '-100px',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-150px',
    right: '-100px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  container: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '60px 24px 80px',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  userAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.1)',
  },
  greeting: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  username: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'rgba(255,255,255,0.4)',
    textDecoration: 'none',
    fontSize: '13px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.03)',
    transition: 'all 0.2s',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '15px',
    margin: '0 0 32px',
    lineHeight: '1.5',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  card: {
    display: 'block',
    textDecoration: 'none',
    color: '#fff',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '14px 18px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  guildIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  guildIconPlaceholder: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    flexShrink: 0,
  },
  guildInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  guildName: {
    fontSize: '15px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ownerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#fbbf24',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    minHeight: '60vh',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid rgba(255,255,255,0.1)',
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
};
