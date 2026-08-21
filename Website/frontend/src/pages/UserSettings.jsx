import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Check, Plus, ExternalLink, Globe, ChevronDown, Sparkles, Monitor, MapPin } from 'lucide-react';

export default function UserSettings() {
  const { user } = useAuth();

  if (!user) {
    return <div style={{ color: '#fff', padding: '24px' }}>Loading...</div>;
  }

  const avatarUrl = user.avatar 
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  return (
    <div className="us-page">
      <style>{`
        .us-page {
          min-height: 100vh;
          background-color: #0a0a0a;
          color: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .us-header {
          position: sticky;
          top: 0;
          z-index: 30;
          background-color: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #262626;
        }
        .us-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          padding: 0 16px;
          max-width: 768px;
          margin: 0 auto;
        }
        .us-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .us-back-btn {
          padding: 6px;
          color: #a3a3a3;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .us-back-btn:hover {
          color: #fff;
          background-color: #262626;
        }
        .us-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }
        
        .us-container {
          max-width: 768px;
          margin: 0 auto;
          padding: 32px 16px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        
        .us-section-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #a3a3a3;
          font-weight: 500;
          margin-bottom: 20px;
          margin-top: 0;
        }
        
        .us-card {
          border: 1px solid #262626;
          border-radius: 12px;
          padding: 24px;
          background-color: transparent;
        }
        
        /* Profile */
        .us-profile-row {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .us-profile-avatar {
          width: 72px;
          height: 72px;
          border-radius: 16px;
          border: 1px solid #262626;
          object-fit: cover;
        }
        .us-profile-info {
          flex: 1;
          min-width: 0;
        }
        .us-profile-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .us-profile-name {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .us-badge {
          padding: 2px 10px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          background-color: #262626;
          color: #a3a3a3;
        }
        .us-profile-desc {
          color: #a3a3a3;
          font-size: 14px;
          margin: 4px 0 0 0;
        }
        
        /* Connected Account */
        .us-account-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .us-account-left {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
          flex: 1;
        }
        .us-discord-icon {
          width: 40px;
          height: 40px;
          background-color: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #000;
        }
        .us-account-name {
          font-weight: 500;
          color: #fff;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .us-account-desc {
          font-size: 12px;
          color: #a3a3a3;
          margin: 2px 0 0 0;
        }
        .us-status-connected {
          padding: 6px 12px;
          background-color: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          font-size: 12px;
          font-weight: 500;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          margin-left: 12px;
        }
        
        /* Subscriptions */
        .us-subs-alert {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 20px;
          background-color: rgba(23, 23, 23, 0.4);
          border: 1px solid #262626;
          border-radius: 12px;
          margin-bottom: 12px;
        }
        .us-subs-text {
          font-size: 13px;
          color: #737373;
          margin: 0;
        }
        .us-subs-text span {
          color: #fff;
        }
        .us-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          height: 32px;
          font-size: 12px;
          font-weight: 600;
          background-color: #fff;
          color: #000;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
          flex-shrink: 0;
          text-decoration: none;
        }
        .us-btn-primary:hover {
          background-color: #e5e5e5;
        }
        .us-subs-card {
          background-color: rgba(23, 23, 23, 0.4);
          border: 1px solid #262626;
          border-radius: 12px;
          overflow: hidden;
        }
        .us-subs-inner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border: 2px dashed #262626;
          margin: 8px;
          border-radius: 8px;
        }
        .us-subs-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background-color: #171717;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #a3a3a3;
        }
        .us-subs-inner-text {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
          color: #a3a3a3;
          margin: 0;
        }
        .us-pricing-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #737373;
          text-decoration: none;
          transition: color 0.2s;
          margin-top: 16px;
        }
        .us-pricing-link:hover {
          color: #fff;
        }
        
        /* Language & Region */
        .us-desc {
          font-size: 12px;
          color: #737373;
          margin: 0 0 12px 0;
        }
        .us-lang-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .us-lang-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #262626;
          background-color: transparent;
          color: #a3a3a3;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }
        .us-lang-btn.active {
          background-color: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
          color: #fff;
        }
        .us-lang-btn:hover:not(.active) {
          border-color: #404040;
          color: #fff;
        }
        .us-lang-icon {
          font-size: 18px;
        }
        .us-lang-info {
          flex: 1;
          display: flex;
          align-items: center;
        }
        .us-lang-name {
          font-size: 14px;
          font-weight: 500;
        }
        .us-lang-sub {
          font-size: 12px;
          color: #737373;
          margin-left: 8px;
        }
        
        .us-tz-card {
          position: relative;
          border: 1px solid #262626;
          border-radius: 12px;
          overflow: visible;
        }
        .us-tz-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background-color: rgba(23, 23, 23, 0.4);
          border-bottom: 1px solid #262626;
        }
        .us-tz-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .us-tz-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background-color: #171717;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a3a3a3;
        }
        .us-tz-time {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          margin: 0;
        }
        .us-tz-time span {
          color: #a3a3a3;
          font-weight: 400;
        }
        .us-tz-loc {
          font-size: 11px;
          color: #737373;
          margin: 2px 0 0 0;
        }
        .us-tz-loc span {
          color: #a3a3a3;
          margin-left: 6px;
        }
        .us-tz-body {
          padding: 20px;
        }
        .us-tz-dropdown-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          height: 40px;
          padding: 0 12px;
          background-color: #0a0a0a;
          border: 1px solid #262626;
          border-radius: 12px;
          font-size: 14px;
          color: #fff;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .us-tz-dropdown-btn:hover {
          border-color: #404040;
        }
        .us-tz-note {
          font-size: 11px;
          color: #737373;
          margin: 12px 0 0 0;
        }
        
        /* Security */
        .us-sec-card {
          border: 1px solid #262626;
          border-radius: 12px;
        }
        .us-sec-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
        }
        .us-sec-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .us-sec-icon {
          width: 40px;
          height: 40px;
          background-color: #171717;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a3a3a3;
        }
        .us-sec-title {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .us-sec-current {
          padding: 2px 8px;
          background-color: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          font-size: 10px;
          font-weight: 500;
          border-radius: 6px;
        }
        .us-sec-loc {
          font-size: 12px;
          color: #a3a3a3;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 2px 0 0 0;
        }
        .us-logout-card {
          margin-top: 16px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
        }
        .us-logout-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
        }
        .us-logout-title {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          margin: 0;
        }
        .us-logout-desc {
          font-size: 12px;
          color: #a3a3a3;
          margin: 2px 0 0 0;
        }
        .us-btn-danger {
          padding: 8px 16px;
          color: #dc2626;
          background-color: transparent;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .us-btn-danger:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }
      `}</style>

      {/* Header */}
      <header className="us-header">
        <div className="us-header-content">
          <div className="us-header-left">
            <Link to="/dashboard" className="us-back-btn" aria-label="Go back">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="us-title">Settings</h1>
          </div>
        </div>
      </header>

      {/* Container */}
      <div className="us-container">
        
        {/* Profile */}
        <section>
          <h3 className="us-section-title">Profile</h3>
          <div className="us-card">
            <div className="us-profile-row">
              <img src={avatarUrl} alt={user.username} className="us-profile-avatar" />
              <div className="us-profile-info">
                <div className="us-profile-name-row">
                  <h2 className="us-profile-name">{user.username}</h2>
                  <span className="us-badge">Free</span>
                </div>
                <p className="us-profile-desc">Member since August 20, 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* Connected Account */}
        <section>
          <h3 className="us-section-title">Connected Account</h3>
          <div className="us-card" style={{ padding: '24px' }}>
            <div className="us-account-row">
              <div className="us-account-left">
                <div className="us-discord-icon">
                  <svg className="w-5 h-5 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                  </svg>
                </div>
                <div>
                  <p className="us-account-name">{user.username}</p>
                  <p className="us-account-desc">Discord Account</p>
                </div>
              </div>
              <span className="us-status-connected">
                <Check size={12} /> Connected
              </span>
            </div>
          </div>
        </section>

        {/* Subscriptions */}
        <section>
          <h3 className="us-section-title">Subscriptions</h3>
          
          <div className="us-subs-alert">
            <p className="us-subs-text">
              No active subscription. <span>Buy a slot</span> to unlock Pro.
            </p>
            <button className="us-btn-primary">
              <Plus size={12} /> Buy Slot
            </button>
          </div>
          
          <div className="us-subs-card">
            <div className="us-subs-inner">
              <div className="us-subs-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect><rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect><line x1="6" x2="6.01" y1="6" y2="6"></line><line x1="6" x2="6.01" y1="18" y2="18"></line></svg>
              </div>
              <p className="us-subs-inner-text">Get your first Pro slot</p>
              <button className="us-btn-primary">
                <Plus size={12} /> Buy Slot
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <a href="/pricing" className="us-pricing-link">
              View Pricing <ExternalLink size={12} />
            </a>
          </div>
        </section>

        {/* Language & Region */}
        <section>
          <h3 className="us-section-title">Language & Region</h3>
          
          <div style={{ marginBottom: '40px' }}>
            <p className="us-desc">Choose your display language. Your region is auto-detected from your browser.</p>
            <div className="us-lang-grid">
              <button className="us-lang-btn active">
                <span className="us-lang-icon">🇺🇸</span>
                <div className="us-lang-info">
                  <span className="us-lang-name">English</span>
                </div>
                <Check size={16} color="#4ade80" />
              </button>
              <button className="us-lang-btn">
                <span className="us-lang-icon">🇪🇸</span>
                <div className="us-lang-info">
                  <span className="us-lang-name">Español</span>
                  <span className="us-lang-sub">Spanish</span>
                </div>
              </button>
              <button className="us-lang-btn">
                <span className="us-lang-icon">🇫🇷</span>
                <div className="us-lang-info">
                  <span className="us-lang-name">Français</span>
                  <span className="us-lang-sub">French</span>
                </div>
              </button>
              <button className="us-lang-btn">
                <span className="us-lang-icon">🇩🇪</span>
                <div className="us-lang-info">
                  <span className="us-lang-name">Deutsch</span>
                  <span className="us-lang-sub">German</span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <p className="us-desc">Time zone — auto-detected from your browser, or pick one to override.</p>
            <div className="us-tz-card">
              <div className="us-tz-header">
                <div className="us-tz-left">
                  <div className="us-tz-icon">
                    <Globe size={16} />
                  </div>
                  <div>
                    <p className="us-tz-time">9:20 AM <span>UTC+2</span></p>
                    <p className="us-tz-loc">Europe/Berlin <span>· auto-detected</span></p>
                  </div>
                </div>
              </div>
              <div className="us-tz-body">
                <button className="us-tz-dropdown-btn">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <Sparkles size={14} color="#737373" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Auto-detect (Europe/Berlin)</span>
                  </div>
                  <ChevronDown size={16} color="#737373" />
                </button>
                <p className="us-tz-note">All dates and times across the dashboard will be shown in this zone.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section>
          <h3 className="us-section-title">Security</h3>
          <div className="us-sec-card">
            <div className="us-sec-row">
              <div className="us-sec-left">
                <div className="us-sec-icon">
                  <Monitor size={16} />
                </div>
                <div>
                  <p className="us-sec-title">
                    Chrome on Windows
                    <span className="us-sec-current">Current</span>
                  </p>
                  <p className="us-sec-loc">
                    <MapPin size={12} /> Current Location · Now
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="us-logout-card">
            <div className="us-logout-row">
              <div>
                <p className="us-logout-title">Log Out</p>
                <p className="us-logout-desc">End your current session</p>
              </div>
              <button className="us-btn-danger" onClick={() => window.location.href = '/auth/logout'}>
                Log Out
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
