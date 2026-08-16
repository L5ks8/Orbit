import React from 'react';
import { Link } from 'react-router-dom';

export default function DocsNavbar({ onSearchClick }) {
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
          <button className="btn-primary">Login</button>
        </div>
      </div>
    </nav>
  );
}
