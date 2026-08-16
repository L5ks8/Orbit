import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ guildId }) {
  const links = [
    { name: 'Overview', path: `/dashboard/${guildId}/overview`, icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { name: 'Modules', path: `/dashboard/${guildId}/modules`, icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' },
    { name: 'Leaderboard', path: `/dashboard/${guildId}/leaderboard`, icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { name: 'Settings', path: `/dashboard/${guildId}/settings`, icon: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' },
  ];

  return (
    <div className="dash-sidebar">
      <div className="dash-sidebar-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
        <span>Orbit</span>
      </div>
      <nav className="dash-sidebar-nav">
        {links.map((link) => (
          <NavLink 
            key={link.name} 
            to={link.path} 
            className={({ isActive }) => `dash-nav-link ${isActive ? 'active' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {link.name === 'Overview' && <path d={link.icon} />}
              {link.name === 'Overview' && <polyline points="9 22 9 12 15 12 15 22"></polyline>}
              
              {link.name === 'Modules' && <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>}
              {link.name === 'Modules' && <line x1="3" y1="9" x2="21" y2="9"></line>}
              {link.name === 'Modules' && <line x1="9" y1="21" x2="9" y2="9"></line>}

              {link.name === 'Leaderboard' && <path d={link.icon}></path>}

              {link.name === 'Settings' && <path d={link.icon}></path>}
              {link.name === 'Settings' && <circle cx="12" cy="12" r="3"></circle>}
            </svg>
            {link.name}
          </NavLink>
        ))}
      </nav>
      <div className="dash-sidebar-footer">
        <NavLink to="/dashboard" className="dash-nav-link back-to-home">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Exit Dashboard
        </NavLink>
      </div>
    </div>
  );
}
