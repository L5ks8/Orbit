import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div>
          <div className="lp-footer-brand">
            <img src="/img/logo.png" alt="Orbit" style={{ height: '28px', opacity: 0.8 }} />
            <span>Orbit</span>
          </div>
          <p className="lp-footer-brand-desc">The all-in-one Discord bot for community management. Free forever.</p>
          <div className="lp-footer-social">
            <a href="#" title="Discord" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#111', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <svg viewBox="0 0 127.14 96.36" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.62,67.62,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c0,0,.04-.06.05-.09A71.09,71.09,0,0,0,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91,65.69,84.69,65.69Z"/>
              </svg>
            </a>
          </div>
        </div>
        <div className="lp-footer-col">
          <h4>Product</h4>
          <div className="lp-footer-links">
            <Link to="/docs">Documentation</Link>
            <a href="https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=564430072179839&scope=bot+applications.commands" target="_blank" rel="noopener noreferrer">Add to Discord</a>
            <a href="/auth/login" className="lp-footer-login" style={{ textDecoration: 'none', background: 'none', border: 'none', padding: 0 }}>Dashboard</a>
          </div>
        </div>
        <div className="lp-footer-col">
          <h4>Legal</h4>
          <div className="lp-footer-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>
      <div className="lp-footer-bottom">
        <div className="lp-footer-bottom-left">
          <div className="lp-footer-status">
            <span className="status-dot"></span>
            All systems operational
          </div>
        </div>
        <div className="lp-footer-copy">&copy; 2026 Orbit Bot. All rights reserved.</div>
        <div className="theme-toggle-group">
          <button className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} title="Light mode">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>
          <button className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} title="Dark mode">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
