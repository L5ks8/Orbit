import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/Overview';
import Modules from '../components/dashboard/Modules';
import ModuleSettings from '../components/dashboard/ModuleSettings';
import ServerSelector from './ServerSelector';
import { useAuth } from '../context/AuthContext';

function DashboardInner() {
  const { guildId } = useParams();
  const { user, loading } = useAuth();
  const [guildName, setGuildName] = useState('Loading...');
  const [guildIcon, setGuildIcon] = useState(null);

  useEffect(() => {
    if (!guildId) return;
    fetch('/api/guilds')
      .then(res => res.json())
      .then(data => {
        if (data && data.guilds) {
          const g = data.guilds.find(g => g.id === guildId);
          if (g) {
            setGuildName(g.name);
            setGuildIcon(g.icon);
          }
        }
      });
  }, [guildId]);

  if (loading) return null;
  if (!user) return <Navigate to="/" />;
  return (
    <div className="dash-container">
      <Sidebar guildId={guildId} />
      <div className="dash-main">
        <div className="dash-topbar">
          <div className="dash-server-selector">
            {guildIcon ? (
              <img src={`https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.png`} alt="" className="dash-server-icon" style={{borderRadius: '50%', background: 'none'}} />
            ) : (
              <div className="dash-server-icon">{guildName.charAt(0)}</div>
            )}
            <span className="dash-server-name">{guildName}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div className="dash-user-profile">
            <img src={user ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} alt="User Profile" onError={(e)=>{e.target.src='https://cdn.discordapp.com/embed/avatars/0.png'}} />
          </div>
        </div>
        
        <div className="dash-content-area">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview guildId={guildId} />} />
            <Route path="modules" element={<Modules guildId={guildId} />} />
            <Route path="modules/:moduleId" element={<ModuleSettings guildId={guildId} />} />
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
