import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/Overview';
import Modules from '../components/dashboard/Modules';
import ModuleSettings from '../components/dashboard/ModuleSettings';
import Leaderboard from '../components/dashboard/Leaderboard';
import Settings from '../components/dashboard/Settings';
import ServerSelector from './ServerSelector';
import { useAuth } from '../context/AuthContext';

function DashboardInner() {
  const { guildId } = useParams();
  const { user, loading } = useAuth();
  const [guildName, setGuildName] = useState('Loading...');
  const [guildIcon, setGuildIcon] = useState(null);
  const [allGuilds, setAllGuilds] = useState([]);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const navigate = useNavigate();

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

  if (loading) return null;
  if (!user) return <Navigate to="/" />;
  return (
    <div className="dash-container">
      <Sidebar guildId={guildId} />
      <div className="dash-main">
        <div className="dash-topbar" style={{ zIndex: 50, position: 'relative' }}>
          <div className="dash-server-selector" onClick={() => setShowServerDropdown(!showServerDropdown)} style={{ position: 'relative', cursor: 'pointer' }}>
            {guildIcon ? (
              <img src={`https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.png`} alt="" className="dash-server-icon" style={{borderRadius: '50%', background: 'none'}} />
            ) : (
              <div className="dash-server-icon">{guildName.charAt(0)}</div>
            )}
            <span className="dash-server-name">{guildName}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showServerDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            
            {showServerDropdown && (
              <div className="dash-server-dropdown" style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, 
                background: '#2B2D31', borderRadius: '8px', padding: '8px', 
                minWidth: '240px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 100, border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ padding: '8px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#949BA4' }}>Your Servers</div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {allGuilds.map(g => (
                    <div 
                      key={g.id} 
                      onClick={(e) => { e.stopPropagation(); setShowServerDropdown(false); navigate(`/dashboard/${g.id}`); }}
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
            <Route path="modules" element={<Modules guildId={guildId} />} />
            <Route path="modules/:moduleId" element={<ModuleSettings guildId={guildId} />} />
            <Route path="leaderboard" element={<Leaderboard guildId={guildId} />} />
            <Route path="settings" element={<Settings guildId={guildId} />} />
          </Routes>
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
