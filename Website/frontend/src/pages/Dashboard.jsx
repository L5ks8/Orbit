import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/Overview';
import Modules from '../components/dashboard/Modules';
import Analytics from '../components/dashboard/Analytics';
import Leaderboard from '../components/dashboard/Leaderboard';
import Settings from '../components/dashboard/Settings';
import ServerSelector from './ServerSelector';
import EmbedBuilder from './dashboard/EmbedBuilder';
import Moderation from '../components/dashboard/Moderation';
import BotProfile from '../components/dashboard/BotProfile';
import { useAuth } from '../context/AuthContext';

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
    if (!guildId) return;
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
        
        <div className="dash-top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px 24px 0 24px' }}>
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                  width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                title="Open Sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          
          <div className="dash-content-area">
            <Routes>
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview guildId={guildId} />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="bot-profile" element={<BotProfile guildId={guildId} />} />
              <Route path="embed-builder" element={<EmbedBuilder setSidebarOpen={setSidebarOpen} />} />
              <Route path="leaderboard" element={<Leaderboard guildId={guildId} />} />
              <Route path="settings" element={<Settings guildId={guildId} />} />
              <Route path="automod" element={<Moderation guildId={guildId} />} />
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
