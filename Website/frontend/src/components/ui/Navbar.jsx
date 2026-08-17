import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onSearchClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const timeoutRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (menu) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <nav className={`mega-navbar ${scrolled ? 'scrolled' : ''}`}>
      {/* Left: Logo */}
      <Link to="/" className="mega-navbar-logo">
        <img src="/logo.png" alt="Orbit" />
        <span>Orbit</span>
      </Link>

      {/* Center: Navigation Links */}
      <div className="mega-navbar-links">
        
        {/* Product Dropdown (Placeholder) */}
        <div 
          className="mega-dropdown-container" 
          onMouseEnter={() => handleMouseEnter('product')}
          onMouseLeave={handleMouseLeave}
        >
          <div className={`mega-nav-item ${activeDropdown === 'product' ? 'active' : ''}`}>
            Product <ChevronIcon active={activeDropdown === 'product'} />
          </div>
          <div className={`mega-dropdown-menu ${activeDropdown === 'product' ? 'active' : ''}`} style={{ width: '800px', minWidth: '800px' }}>
            <div className="mega-dropdown-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <Link to="#" className="mega-menu-item">
                <div style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '10px', background: '#ffffff', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheckIcon />
                </div>
                <div className="mega-menu-text">
                  <strong>Auto-Moderation</strong>
                  <span>Advanced filters and chat protection.</span>
                </div>
              </Link>
              
              <Link to="#" className="mega-menu-item">
                <div style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '10px', background: '#4ade80', color: '#042f2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TicketIcon />
                </div>
                <div className="mega-menu-text">
                  <strong>Ticket System</strong>
                  <span>Customizable support panels.</span>
                </div>
              </Link>

              <Link to="#" className="mega-menu-item">
                <div style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '10px', background: '#60a5fa', color: '#172554', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GiftIcon />
                </div>
                <div className="mega-menu-text">
                  <strong>Giveaways</strong>
                  <span>Host events and reward members.</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Solutions Dropdown (Placeholder) */}
        <div 
          className="mega-dropdown-container"
          onMouseEnter={() => handleMouseEnter('solutions')}
          onMouseLeave={handleMouseLeave}
        >
          <div className={`mega-nav-item ${activeDropdown === 'solutions' ? 'active' : ''}`}>
            Solutions <ChevronIcon active={activeDropdown === 'solutions'} />
          </div>
          <div className={`mega-dropdown-menu ${activeDropdown === 'solutions' ? 'active' : ''}`}>
            <div className="mega-dropdown-grid">
              <div className="mega-menu-item">
                <div className="mega-menu-icon"><UsersIcon /></div>
                <div className="mega-menu-text">
                  <strong>Communities</strong>
                  <span>Tools for large servers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Dropdown (Matched from image) */}
        <div 
          className="mega-dropdown-container"
          onMouseEnter={() => handleMouseEnter('resources')}
          onMouseLeave={handleMouseLeave}
        >
          <div className={`mega-nav-item ${activeDropdown === 'resources' ? 'active' : ''}`} style={activeDropdown === 'resources' ? { background: 'rgba(255,255,255,0.05)', borderRadius: '6px' } : {}}>
            Resources <ChevronIcon active={activeDropdown === 'resources'} />
          </div>
          
          <div className={`mega-dropdown-menu ${activeDropdown === 'resources' ? 'active' : ''}`}>
            <div className="mega-dropdown-grid">
              <Link to="/docs" className="mega-menu-item">
                <div className="mega-menu-icon"><DocIcon /></div>
                <div className="mega-menu-text">
                  <strong>Documentation</strong>
                  <span>Guides and references</span>
                </div>
              </Link>
              <Link to="/benchmarks" className="mega-menu-item">
                <div className="mega-menu-icon"><ChartIcon /></div>
                <div className="mega-menu-text">
                  <strong>Benchmarks</strong>
                  <span>Performance comparisons</span>
                </div>
              </Link>
              <a href="https://discord.gg/wekuhwCsUg" target="_blank" rel="noopener noreferrer" className="mega-menu-item" style={{ textDecoration: 'none' }}>
                <div className="mega-menu-icon"><ChatIcon /></div>
                <div className="mega-menu-text">
                  <strong>Community</strong>
                  <span>Join our Discord</span>
                </div>
              </a>
              <Link to="/status" className="mega-menu-item">
                <div className="mega-menu-icon"><ActivityIcon /></div>
                <div className="mega-menu-text">
                  <strong>Status</strong>
                  <span>Live uptime</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mega-navbar-actions">
        <a href="#" className="mega-nav-item" style={{ paddingRight: '8px' }}>Add to Discord</a>
        <a href="https://discord.gg/wekuhwCsUg" target="_blank" rel="noopener noreferrer" className="mega-nav-item" style={{ paddingRight: '16px' }}>Support Server</a>
        {user ? (
          <Link to="/dashboard" className="mega-btn-light" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="" style={{width: '20px', height: '20px', borderRadius: '50%'}} onError={(e)=>{e.target.src='https://cdn.discordapp.com/embed/avatars/0.png'}} />
            Dashboard
          </Link>
        ) : (
          <a href="/auth/login" className="mega-btn-light">
            Login <LoginIcon />
          </a>
        )}
      </div>
    </nav>
  );
}

// Icons
function ChevronIcon({ active }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s ease', transform: active ? 'rotate(180deg)' : 'rotate(0deg)', marginLeft: '4px', opacity: 0.7 }}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.951-1.801"/>
    </svg>
  );
}

function DocIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>; }
function ChartIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>; }
function ChatIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>; }
function ActivityIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>; }
function SearchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>; }
function BoltIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>; }
function UsersIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>; }
function ShieldCheckIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>; }
function TicketIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>; }
function GiftIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>; }
function LoginIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>; }
