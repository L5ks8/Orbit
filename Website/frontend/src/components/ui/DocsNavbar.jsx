import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DocsNavbar({ onSearchClick }) {
  const { user } = useAuth();
  return (
    <nav className="navbar" id="main-navbar">
      <Link to="/" className="logo">
        <img src="/img/logo.png" alt="Orbit Logo" style={{ height: '36px', opacity: 0.9 }} />
        Orbit
      </Link>


      <div className="nav-right">
        <div className="nav-links">
          <a href="https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=564430072179839&scope=bot+applications.commands" target="_blank" rel="noopener noreferrer" className="nav-link">Add to Discord</a>
          <a href="#" className="nav-link">Support Server</a>
        </div>
        <div className="nav-user">
          {user ? (
            <Link to="/dashboard" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="" style={{width: '20px', height: '20px', borderRadius: '50%'}} onError={(e)=>{e.target.src='https://cdn.discordapp.com/embed/avatars/0.png'}} />
              Dashboard
            </Link>
          ) : (
            <a href="/auth/login" className="btn-primary" style={{textDecoration: 'none'}}>Login</a>
          )}
        </div>
      </div>
    </nav>
  );
}
