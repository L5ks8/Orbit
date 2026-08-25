import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/tabs/Overview';
import Modules from '../components/dashboard/Modules';
import Analytics from '../components/dashboard/tabs/Analytics';
import Leaderboard from '../components/dashboard/tabs/Leaderboard';
import Settings from '../components/dashboard/tabs/Settings';
import ServerSelector from './ServerSelector';
import EmbedBuilder from './dashboard/EmbedBuilder';
import Moderation from '../components/dashboard/tabs/Moderation';
import BotProfile from '../components/dashboard/tabs/BotProfile';
import Invites from '../components/dashboard/tabs/Invites';
import Roles from '../components/dashboard/tabs/Roles';
import TopNav from '../components/dashboard/TopNav';
import Security from '../components/dashboard/tabs/Security';
import { useAuth } from '../context/AuthContext';
import { getCache, setCache } from '../utils/cache';

function DashboardInner() {
  const { guildId } = useParams();
  const { user, loading } = useAuth();
  const [guildName, setGuildName] = useState('Loading...');
  const [guildIcon, setGuildIcon] = useState(null);
  const [allGuilds, setAllGuilds] = useState([]);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!guildId || !user) return;
    fetch('/api/guilds')
      .then(res => res.json())
      .then(data => {
        let guildsArray = [];
        if (Array.isArray(data)) {
          guildsArray = data;
        } else if (data && data.guilds) {
          guildsArray = data.guilds;
        }
        setAllGuilds(guildsArray);
        
        const g = guildsArray.find(g => String(g.id) === String(guildId));
        if (g) {
          setGuildName(g.name);
          setGuildIcon(g.icon);
        } else {
          setGuildName('Unknown Server');
        }
      })
      .catch(err => {
        console.error("Error loading guild info:", err);
        setGuildName('Error');
      });

    // Preload critical dashboard data in background
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    if (!getCache(`modules_config_${guildId}`)) {
      fetch(`/api/config/${guildId}`, { headers })
        .then(res => res.json())
        .then(data => setCache(`modules_config_${guildId}`, data))
        .catch(() => {});
    }
    if (!getCache(`roles_${guildId}`)) {
      fetch(`/api/roles/${guildId}`, { headers })
        .then(res => res.json())
        .then(data => setCache(`roles_${guildId}`, data))
        .catch(() => {});
    }
    if (!getCache(`botprofile_${guildId}`)) {
      fetch(`/api/botprofile/${guildId}`)
        .then(res => res.json())
        .then(data => setCache(`botprofile_${guildId}`, data))
        .catch(() => {});
    }
    if (!getCache(`mod_activity_${guildId}`)) {
      fetch(`/api/mod_activity/${guildId}`, { headers })
        .then(res => res.json())
        .then(data => setCache(`mod_activity_${guildId}`, data))
        .catch(() => {});
    }
  }, [guildId]);

  if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Loading...</div>;
  if (!user) {
    const openLoginPopup = () => {
      const loginUrl = `/auth/login?next=${encodeURIComponent(location.pathname)}&popup=1`;
      const w = 500, h = 700;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top = window.screenY + (window.outerHeight - h) / 2;
      const popup = window.open(loginUrl, 'orbitlogin', `width=${w},height=${h},left=${left},top=${top},popup=yes`);
      if (popup) {
        const timer = setInterval(() => {
          if (popup.closed) { clearInterval(timer); window.location.reload(); }
        }, 500);
      }
    };
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0a' }}>
        <div style={{ 
          background: '#171717', border: '1px solid #262626', borderRadius: '20px', 
          padding: '48px 40px', textAlign: 'center', maxWidth: '380px', width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 8px' }}>Login Required</h2>
          <p style={{ fontSize: '14px', color: '#737373', margin: '0 0 24px' }}>Sign in with Discord to continue.</p>
          <button 
            onClick={openLoginPopup}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '12px 28px', background: '#5865F2', color: '#fff',
              border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer', width: '100%', justifyContent: 'center'
            }}
          >Login with Discord</button>
        </div>
      </div>
    );
  }


  return (
    <div className="dashboard-grid">
      <Sidebar guildId={guildId} isOpen={sidebarOpen} />
      <div className="dash-main">
        
        <div className="dash-top-nav-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <TopNav guildName={guildName} setSidebarOpen={setSidebarOpen} />
          
          <div className="dash-content-area">
            <Routes>
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview guildId={guildId} />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="roles" element={<Roles guildId={guildId} />} />
              <Route path="bot-profile" element={<BotProfile guildId={guildId} />} />
              <Route path="invites" element={<Invites />} />
              <Route path="embed-builder" element={<EmbedBuilder setSidebarOpen={setSidebarOpen} />} />
              <Route path="leaderboard" element={<Leaderboard guildId={guildId} />} />
              <Route path="settings" element={<Settings guildId={guildId} />} />
              <Route path="automod" element={<Moderation guildId={guildId} />} />
              <Route path="security" element={<Security guildId={guildId} />} />
              <Route path=":moduleId" element={<Modules guildId={guildId} />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Routes>
      <Route path="/" element={<ServerSelector />} />
      <Route path="/:guildId/*" element={<DashboardInner />} />
    </Routes>
  );
}
