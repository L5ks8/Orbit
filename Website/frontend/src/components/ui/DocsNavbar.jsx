import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DocsNavbar({ onSearchClick }) {
  const { user } = useAuth();
  return (
    <nav className="navbar" id="main-navbar">
      <Link to="/" className="logo">
        <img src="/logo.png" alt="Orbit Logo" style={{ height: '36px', opacity: 0.9 }} />
        Orbit
      </Link>

      <div className="navbar-search" onClick={onSearchClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span className="search-placeholder">Search</span>
        <div className="search-shortcut">
          <span>Ctrl</span>
          <span>K</span>
        </div>
      </div>

      <div className="nav-right">
        <div className="nav-links">
          <a href="#" className="nav-link">Add to Discord</a>
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
