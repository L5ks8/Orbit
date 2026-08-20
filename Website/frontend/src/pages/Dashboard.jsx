import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/Overview';
import Modules from '../components/dashboard/Modules';

import Leaderboard from '../components/dashboard/Leaderboard';
import Settings from '../components/dashboard/Settings';
import ServerSelector from './ServerSelector';
import EmbedBuilder from './dashboard/EmbedBuilder';
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
  const isModules = location.pathname.includes('/modules');

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
        
        const g = guildsArray.find(g => g.id === guildId);
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
  if (!user) return <Navigate to="/" />;

  if (isModules) {
    return (
      <Routes>
        <Route path="modules" element={<Modules guildId={guildId} />} />
        <Route path="modules/:moduleId" element={<Modules guildId={guildId} />} />
      </Routes>
    );
  }

  return (
    <div className="dashboard-grid">
      <Sidebar guildId={guildId} isOpen={sidebarOpen} />
      <div className="dash-main">
        
        <div className="dash-top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            <div style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', background: showServerDropdown ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                onClick={() => setShowServerDropdown(!showServerDropdown)}
              >
                {guildIcon ? (
                  <img src={`https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.png`} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#313338', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                    {guildName.charAt(0)}
                  </div>
                )}
                <span style={{ color: '#F2F3F5', fontSize: '16px', fontWeight: '600' }}>{guildName}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, transform: showServerDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {showServerDropdown && (
                <div style={{ 
                  position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: '#1e1f22', border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '8px', padding: '8px', minWidth: '240px', zIndex: 100, boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                  maxHeight: '400px', display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#949ba4', textTransform: 'uppercase' }}>Your Servers</div>
                  <div style={{ overflowY: 'auto' }}>
                    {allGuilds.map(g => (
                      <div 
                        key={g.id}
                        onClick={() => {
                          setShowServerDropdown(false);
                          navigate(`/dashboard/${g.id}/overview`);
                        }}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', 
                          borderRadius: '4px', cursor: 'pointer', background: g.id === guildId ? 'rgba(255,255,255,0.05)' : 'transparent' 
                        }}
                        onMouseEnter={(e) => { if (g.id !== guildId) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={(e) => { if (g.id !== guildId) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {g.icon ? (
                          <img src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#313338', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                            {g.name.charAt(0)}
                          </div>
                        )}
                        <div style={{ color: '#F2F3F5', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="dash-user-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#F2F3F5', fontSize: '14px', fontWeight: '500' }}>{user ? user.username : 'User'}</span>
              <img src={user ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} alt="User Profile" style={{ width: '36px', height: '36px', borderRadius: '50%' }} onError={(e)=>{e.target.src='https://cdn.discordapp.com/embed/avatars/0.png'}} />
            </div>
          </div>
          
          <div className="dash-content-area">
            <Routes>
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview guildId={guildId} />} />
              <Route path="embed-builder" element={<EmbedBuilder setSidebarOpen={setSidebarOpen} />} />
              <Route path="modules" element={<Modules guildId={guildId} setSidebarOpen={setSidebarOpen} />} />
              <Route path="modules/:moduleId" element={<Modules guildId={guildId} setSidebarOpen={setSidebarOpen} />} />
              <Route path="leaderboard" element={<Leaderboard guildId={guildId} />} />
              <Route path="settings" element={<Settings guildId={guildId} />} />
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
