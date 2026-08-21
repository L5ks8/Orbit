import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, ChevronDown, RefreshCw, Search, Crown, Bot, Pin, ArrowRight, Plus } from 'lucide-react';

export default function ServerSelector() {
  const { user, loading } = useAuth();
  const [guilds, setGuilds] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadGuilds = () => {
    setFetching(true);
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
  };

  useEffect(() => {
    if (user) {
      loadGuilds();
    } else {
      setFetching(false);
    }
  }, [user]);

  if (loading) return (
    <div className="selector-page flex-center">
      <div className="spinner"></div>
    </div>
  );
  
  if (!user) {
    const openLoginPopup = () => {
      const loginUrl = '/auth/login?next=/dashboard&popup=1';
      const w = 500, h = 700;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top = window.screenY + (window.outerHeight - h) / 2;
      const popup = window.open(loginUrl, 'orbitlogin', `width=${w},height=${h},left=${left},top=${top},popup=yes`);
      if (popup) {
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            window.location.reload();
          }
        }, 500);
      }
    };
    return (
      <div className="selector-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ 
          background: '#171717', border: '1px solid #262626', borderRadius: '20px', 
          padding: '48px 40px', textAlign: 'center', maxWidth: '380px', width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', background: '#262626',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" x2="3" y1="12" y2="12"></line>
            </svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 8px' }}>Login Required</h2>
          <p style={{ fontSize: '14px', color: '#737373', margin: '0 0 24px', lineHeight: '1.5' }}>Sign in with Discord to access your dashboard.</p>
          <button 
            onClick={openLoginPopup}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '12px 28px', background: '#5865F2', color: '#fff',
              border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s', width: '100%', justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#4752C4'}
            onMouseLeave={e => e.currentTarget.style.background = '#5865F2'}
          >
            <svg width="20" height="20" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1 58.4 58.4 0 00-14.7 4.6.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.9 58.9 0 0018 9.1.2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.7.2.2 0 01 0-.4 31 31 0 001.1-.9.2.2 0 01.2 0 42 42 0 0035.8 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.4 36.4 0 01-5.5 2.7.2.2 0 00-.1.4 47.2 47.2 0 003.6 5.8.2.2 0 00.2.1 58.7 58.7 0 0018-9.1v-.1c1.4-14.8-2.3-27.7-9.9-39.1a.2.2 0 00-.1-.1zM23.7 37.3c-3.4 0-6.2-3.1-6.2-7s2.8-7 6.2-7 6.3 3.2 6.2 7-2.7 7-6.2 7zm22.9 0c-3.4 0-6.2-3.1-6.2-7s2.7-7 6.2-7 6.3 3.2 6.2 7-2.7 7-6.2 7z"/>
            </svg>
            Login with Discord
          </button>
        </div>
      </div>
    );
  }

  // Filter based on search query
  const filteredGuilds = guilds.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // A guild is active if bot_in_server is explicitly NOT false (handles missing fields as active)
  // or if isActive is explicitly NOT false.
  const activeGuilds = filteredGuilds.filter(g => g.bot_in_server !== false && g.isActive !== false);
  
  // A guild is inactive if bot_in_server is explicitly false, or isActive is explicitly false.
  // We only show inactive servers where the user is the owner.
  const inactiveGuilds = filteredGuilds.filter(g => (g.bot_in_server === false || g.isActive === false) && g.owner);

  return (
    <div className="selector-page">
      <style>{`
        .selector-page {
          min-height: 100vh;
          background-color: #0a0a0a;
          color: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .flex-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top-color: rgba(255,255,255,0.5);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .header {
          position: sticky;
          top: 0;
          z-index: 20;
          height: 64px;
          background-color: rgba(23, 23, 23, 0.9);
          backdrop-filter: blur(4px);
          border-bottom: 1px solid #262626;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
        }
        
        .header-btn {
          padding: 8px;
          border-radius: 12px;
          color: #a3a3a3;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .header-btn:hover {
          color: #fff;
          background-color: #262626;
        }
        
        .main-container {
          max-width: 1152px;
          margin: 0 auto;
          padding: 32px 16px;
        }
        
        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #a3a3a3;
          background-color: #171717;
          border: 1px solid #262626;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .refresh-btn:hover {
          background-color: #262626;
          border-color: #404040;
        }
        
        .search-container {
          position: relative;
          margin-bottom: 32px;
        }
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px !important;
          background-color: #171717;
          border: 1px solid #262626;
          border-radius: 12px;
          color: #fff;
          font-size: 16px;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .search-input:focus {
          border-color: #fff;
        }
        
        .profile-dropdown {
          position: absolute;
          top: 64px;
          right: 32px;
          width: 224px;
          background-color: #171717;
          border: 1px solid #262626;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
          z-index: 60;
          overflow: hidden;
        }
        .profile-dropdown-header {
          padding: 12px 16px;
          border-bottom: 1px solid #262626;
        }
        .profile-dropdown-name {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }
        .profile-dropdown-id {
          font-size: 12px;
          color: #737373;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 2px 0 0 0;
        }
        .profile-dropdown-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          font-size: 14px;
          color: #a3a3a3;
          text-decoration: none;
          transition: all 0.2s;
        }
        .profile-dropdown-link:hover {
          color: #fff;
          background-color: #262626;
        }
        .profile-dropdown-logout {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 16px;
          font-size: 14px;
          color: #f87171;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .profile-dropdown-logout:hover {
          color: #fca5a5;
          background-color: rgba(239, 68, 68, 0.1);
        }
        .profile-dropdown-divider {
          border-top: 1px solid #262626;
          padding-top: 4px;
          margin-top: 4px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 12px;
          font-weight: 500;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 16px;
        }
        @media (min-width: 640px) {
          .grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .grid { grid-template-columns: repeat(3, 1fr); }
        }
        
        .server-card {
          position: relative;
          background-color: #171717;
          border: 1px solid #262626;
          border-radius: 16px;
          padding: 20px;
          text-align: left;
          text-decoration: none;
          color: #fff;
          display: block;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s;
          overflow: hidden;
          cursor: pointer;
        }
        .server-card:hover {
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .server-card-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom right, #0a0a0a, #262626);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .server-card:hover .server-card-bg {
          opacity: 1;
        }
        
        .card-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 10;
        }
        
        .server-icon-container {
          position: relative;
          flex-shrink: 0;
        }
        .server-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          object-fit: cover;
          transition: transform 0.3s;
          box-shadow: 0 0 0 2px #262626;
        }
        .server-card:hover .server-icon {
          transform: scale(1.05);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.3);
        }
        .server-icon.inactive {
          filter: grayscale(100%);
        }
        .server-card:hover .server-icon.inactive {
          filter: grayscale(0%);
        }
        
        .bot-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          background-color: #22c55e;
          border-radius: 50%;
          border: 2px solid #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.5);
        }
        
        .server-info {
          flex: 1;
          min-width: 0;
        }
        .server-name {
          font-size: 16px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
          transition: color 0.2s;
        }
        .server-card:hover .server-name {
          color: #d4d4d4;
        }
        
        .pin-btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #737373;
          background: transparent;
          border: none;
          opacity: 0;
          transition: all 0.2s;
          margin: -8px;
        }
        .server-card:hover .pin-btn {
          opacity: 1;
        }
        .pin-btn:hover {
          color: #fff;
        }
        
        .status-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }
        .status-active {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: #22c55e;
        }
        .pulse-dot {
          width: 6px;
          height: 6px;
          background-color: #22c55e;
          border-radius: 50%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        
        .badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 500;
          border-radius: 9999px;
        }
        .badge-free {
          background-color: #262626;
          color: #a3a3a3;
        }
        .badge-owner {
          background-color: rgba(234, 179, 8, 0.2);
          color: #eab308;
        }
        
        .action-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: #0a0a0a;
          color: #737373;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .server-card:hover .action-arrow {
          background-color: #fff;
          color: #000;
          transform: scale(1.1);
        }
        
        .action-add-bot {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: transparent;
          border: 1px solid #404040;
          color: #a3a3a3;
          font-size: 13px;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .server-card:hover .action-add-bot {
          background-color: #fff;
          color: #000;
          border-color: #fff;
        }
        
        /* Notifications Dropdown */
        .notifications-dropdown {
          position: absolute;
          top: 64px;
          right: 32px;
          width: 320px;
          background-color: #171717;
          border: 1px solid #262626;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
          z-index: 60;
          overflow: hidden;
        }
        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid #262626;
        }
        .notif-title {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }
        .notif-clear {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #737373;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .notif-clear:hover {
          color: #fff;
        }
        .notif-body {
          padding: 48px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .notif-icon-wrap {
          width: 56px;
          height: 56px;
          background-color: #262626;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #737373;
          margin-bottom: 20px;
        }
        .notif-empty-title {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 6px 0;
        }
        .notif-empty-desc {
          font-size: 13px;
          color: #737373;
          margin: 0;
        }

        
        .divider-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 32px 0 16px;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background-color: #262626;
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '8px' }} className="header-btn">
            <img src="/img/logo.png" alt="Orbit" width="28" height="28" style={{ borderRadius: '8px' }} />
          </Link>
          <div style={{ width: '1px', height: '32px', backgroundColor: '#404040' }}></div>
          <h1 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 }}>Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <button 
            className="header-btn" 
            aria-label="Notifications" 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileDropdown(false); }}
          >
            <Bell size={20} />
          </button>
          <button 
            className="header-btn" 
            aria-label="User menu" 
            style={{ padding: '4px 6px' }}
            onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifications(false); }}
          >
            <img 
              src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64` : '/img/logo.png'} 
              alt={user.username} 
              style={{ width: '32px', height: '32px', borderRadius: '12px', border: '2px solid #404040' }}
              onError={(e) => { e.target.src = '/img/logo.png'; }}
            />
            <div style={{ textAlign: 'left', marginLeft: '8px' }} className="hidden sm:block">
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#fff', margin: 0 }}>{user.username}</p>
              <p style={{ fontSize: '10px', color: '#737373', margin: 0 }}>Member</p>
            </div>
            <ChevronDown size={16} style={{ marginLeft: '8px' }} />
          </button>
          
          {showProfileDropdown && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <p className="profile-dropdown-name">{user.username}</p>
                <p className="profile-dropdown-id">ID: {user.id || '1195055294380781629'}</p>
              </div>
              <div style={{ padding: '4px 0' }}>
                <a href="/" className="profile-dropdown-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  Home
                </a>
                <a href="/dashboard" className="profile-dropdown-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect><rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect><line x1="6" x2="6.01" y1="6" y2="6"></line><line x1="6" x2="6.01" y1="18" y2="18"></line></svg>
                  My Servers
                </a>
                <a href="/settings" className="profile-dropdown-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  Settings
                </a>
              </div>
              <div className="profile-dropdown-divider">
                <button className="profile-dropdown-logout" onClick={() => window.location.href = '/auth/logout'}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                  Logout
                </button>
              </div>
            </div>
          )}

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <h3 className="notif-title">Notifications</h3>
                <button className="notif-clear">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"></path><path d="m22 10-7.5 7.5L13 16"></path></svg>
                  Clear all
                </button>
              </div>
              <div className="notif-body">
                <div className="notif-icon-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                </div>
                <h4 className="notif-empty-title">You're all caught up</h4>
                <p className="notif-empty-desc">Milestones, recaps and alerts will show up here.</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="main-container">
        {/* Title & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Your Servers</h1>
            <p style={{ fontSize: '14px', color: '#737373', margin: '4px 0 0' }}>{activeGuilds.length} active server{activeGuilds.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="refresh-btn" onClick={loadGuilds}>
            <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="search-container">
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#737373' }} />
          <input 
            type="text" 
            placeholder="Search servers..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {fetching ? (
          <div className="flex-center" style={{ height: '200px' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Owned / Active */}
            {activeGuilds.length > 0 && (
              <div>
                <div className="section-title">
                  <Crown size={14} />
                  <span>Owned</span>
                </div>
                <div className="grid">
                  {activeGuilds.map(guild => (
                    <Link key={guild.id} to={`/dashboard/${guild.id}/overview`} className="server-card">
                      <div className="server-card-bg"></div>
                      <div className="card-content">
                        <div className="server-icon-container">
                          {guild.icon ? (
                            <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`} alt={guild.name} className="server-icon" onError={(e) => { e.target.src = '/img/logo.png'; }} />
                          ) : (
                            <div className="server-icon" style={{ backgroundColor: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                              {guild.name.charAt(0)}
                            </div>
                          )}
                          <div className="bot-badge">
                            <Bot size={10} color="#fff" />
                          </div>
                        </div>
                        <div className="server-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <h3 className="server-name">{guild.name}</h3>
                            <button className="pin-btn" onClick={(e) => { e.preventDefault(); }}>
                              <Pin size={12} />
                            </button>
                          </div>
                          <div className="status-row">
                            <div className="status-active">
                              <span className="pulse-dot"></span>
                              <span>Active</span>
                            </div>
                          </div>
                          <div className="badge-row">
                            <span className="badge badge-free">Free</span>
                            {guild.owner && (
                              <span className="badge badge-owner">
                                <Crown size={12} />
                                Owner
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="action-arrow">
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Not yet added */}
            {inactiveGuilds.length > 0 && (
              <div>
                <div className="divider-row">
                  <div className="divider-line"></div>
                  <span className="section-title" style={{ margin: 0 }}>
                    <Plus size={12} />
                    Not yet added
                  </span>
                  <div className="divider-line"></div>
                </div>
                
                <div className="grid">
                  {inactiveGuilds.map(guild => (
                    <button 
                      key={guild.id} 
                      className="server-card" 
                      onClick={() => {
                        const url = `https://discord.com/api/oauth2/authorize?client_id=1480221897131299037&permissions=564430072179839&scope=bot%20applications.commands&guild_id=${guild.id}`;
                        const w = 500, h = 750;
                        const left = window.screenX + (window.outerWidth - w) / 2;
                        const top = window.screenY + (window.outerHeight - h) / 2;
                        const popup = window.open(url, 'addbot', `width=${w},height=${h},left=${left},top=${top},popup=yes`);
                        if (popup) {
                          const timer = setInterval(() => {
                            if (popup.closed) { clearInterval(timer); loadGuilds(); }
                          }, 500);
                        }
                      }}
                    >
                      <div className="server-card-bg"></div>
                      <div className="card-content">
                        <div className="server-icon-container">
                          {guild.icon ? (
                            <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`} alt={guild.name} className="server-icon inactive" onError={(e) => { e.target.src = '/img/logo.png'; }} />
                          ) : (
                            <div className="server-icon inactive" style={{ backgroundColor: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', border: '2px dashed #404040' }}>
                              {guild.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="server-info">
                          <h3 className="server-name">{guild.name}</h3>
                          <p style={{ fontSize: '14px', color: '#737373', margin: '2px 0 0' }}>Bot not installed</p>
                          <div className="badge-row">
                            {guild.owner && (
                              <span className="badge badge-owner">
                                <Crown size={12} />
                                Owner
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="action-add-bot">
                          <Bot size={16} />
                          <span className="hidden sm:inline">Add Bot</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeGuilds.length === 0 && inactiveGuilds.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ color: '#737373', fontSize: '16px' }}>No servers found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
