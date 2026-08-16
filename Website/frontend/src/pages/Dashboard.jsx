import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/Overview';
import Modules from '../components/dashboard/Modules';
import ModuleSettings from '../components/dashboard/ModuleSettings';

export default function Dashboard() {
  return (
    <div className="dash-container">
      <Sidebar />
      <div className="dash-main">
        <div className="dash-topbar">
          <div className="dash-server-selector">
            <div className="dash-server-icon">O</div>
            <span className="dash-server-name">Orbit Support Server</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div className="dash-user-profile">
            <img src="https://cdn.discordapp.com/embed/avatars/0.png" alt="User Profile" />
          </div>
        </div>
        
        <div className="dash-content-area">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="modules" element={<Modules />} />
            <Route path="modules/:moduleId" element={<ModuleSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
