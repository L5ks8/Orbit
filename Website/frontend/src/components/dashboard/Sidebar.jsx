import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Bot, User, Activity,
  MessageSquare, Users, UserPlus, Shield,
  ShieldAlert, ShieldCheck, Ticket, Zap,
  Settings, BarChart3, Database, FileText,
  Volume2, ChevronLeft, ExternalLink
} from 'lucide-react';

import { getCache, setCache } from '../../utils/cache';

export default function Sidebar({ guildId, isOpen = true }) {
  const [guildInfo, setGuildInfo] = useState(() => getCache(`sidebar_guild_${guildId}`) || null);

  useEffect(() => {
    if (!guildId) return;
    if (!guildInfo) {
      fetch('/api/guilds', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        .then(res => res.json())
        .then(data => {
          const guildsArray = Array.isArray(data) ? data : (data.guilds || []);
          const g = guildsArray.find(g => String(g.id) === String(guildId));
          if (g) {
            setGuildInfo(g);
            setCache(`sidebar_guild_${guildId}`, g);
          }
        })
        .catch(console.error);
    }
  }, [guildId]);

  const serverName = guildInfo ? guildInfo.name : 'Loading...';
  const serverIconUrl = guildInfo?.icon
    ? `https://cdn.discordapp.com/icons/${guildInfo.id}/${guildInfo.icon}.png?size=128`
    : '/img/logo.png';
  const sections = [
    {
      title: 'MAIN',
      links: [
        { name: 'Overview', path: `/dashboard/${guildId}/overview`, icon: <LayoutDashboard size={16} /> },
        { name: 'AI Builder', path: `/dashboard/${guildId}/ai-builder`, icon: <Bot size={16} /> },
        { name: 'Bot Profile', path: `/dashboard/${guildId}/bot-profile`, icon: <User size={16} /> },
        { name: 'Analytics', path: `/dashboard/${guildId}/analytics`, icon: <Activity size={16} /> },
      ]
    },
    {
      title: 'WELCOME & ONBOARDING',
      links: [
        { name: 'Welcome', path: `/dashboard/${guildId}/welcome`, icon: <MessageSquare size={16} /> },
        { name: 'Roles', path: `/dashboard/${guildId}/roles`, icon: <Users size={16} /> },
        { name: 'Invite Tracker', path: `/dashboard/${guildId}/invites`, icon: <UserPlus size={16} /> },
      ]
    },
    {
      title: 'MODERATION',
      links: [
        { name: 'Auto-Moderation', path: `/dashboard/${guildId}/automod`, icon: <Shield size={16} /> },
        { name: 'Ban Appeals', path: `/dashboard/${guildId}/appeals`, icon: <ShieldAlert size={16} /> },
        { name: 'Security', path: `/dashboard/${guildId}/security`, icon: <ShieldCheck size={16} /> },
        { name: 'Verification', path: `/dashboard/${guildId}/verify`, icon: <ShieldCheck size={16} /> }
      ]
    },
    {
      title: 'ENGAGEMENT',
      links: [
        { name: 'Leveling System', path: `/dashboard/${guildId}/level`, icon: <Activity size={16} /> },
        { name: 'Leaderboard', path: `/dashboard/${guildId}/leaderboard`, icon: <BarChart3 size={16} /> },
        { name: 'Boost Messages', path: `/dashboard/${guildId}/boost`, icon: <Zap size={16} /> },
        { name: 'Economy', path: `/dashboard/${guildId}/economy`, icon: <Database size={16} /> },
        { name: 'Server Stats', path: `/dashboard/${guildId}/serverstats`, icon: <BarChart3 size={16} /> },
      ]
    },
    {
      title: 'UTILITY',
      links: [
        { name: 'Support Tickets', path: `/dashboard/${guildId}/tickets`, icon: <Ticket size={16} /> },
        { name: 'Automation', path: `/dashboard/${guildId}/automation`, icon: <Zap size={16} /> },
        { name: 'Auto Responder', path: `/dashboard/${guildId}/autoresponder`, icon: <MessageSquare size={16} /> },
        { name: 'Embed Builder', path: `/dashboard/${guildId}/embed-builder`, icon: <MessageSquare size={16} /> },
        { name: 'Temp Voice', path: `/dashboard/${guildId}/tempvoice`, icon: <Volume2 size={16} /> },
      ]
    },
    {
      title: 'SYSTEM',
      links: [
        { name: 'Settings', path: `/dashboard/${guildId}/settings`, icon: <Settings size={16} /> },
      ]
    }
  ];

  return (
    <>
      <style>{`
        .custom-sidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: #171717;
          border-right: 1px solid #262626;
          width: 100%;
        }
        .custom-sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #262626;
        }
        .custom-sidebar-server {
          padding: 16px;
        }
        .custom-server-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          background-color: #262626;
          border: 1px solid #404040;
          text-decoration: none;
          transition: all 0.2s;
        }
        .custom-server-btn:hover {
          background-color: #404040;
        }
        .custom-sidebar-nav {
          flex: 1;
          padding: 0 12px 16px 12px;
          overflow-y: auto;
        }
        
        /* Custom Scrollbar for Nav */
        .custom-sidebar-nav::-webkit-scrollbar { width: 4px; }
        .custom-sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .custom-sidebar-nav::-webkit-scrollbar-thumb { background: #404040; border-radius: 4px; }
        
        .custom-nav-group {
          margin-bottom: 16px;
        }
        .custom-nav-title {
          padding: 0 12px;
          margin-bottom: 6px;
          font-size: 10px;
          font-weight: 600;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .custom-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          width: 100%;
          color: #a3a3a3;
          margin-bottom: 2px;
          box-sizing: border-box;
        }
        .custom-nav-link svg {
          color: inherit;
        }
        .custom-nav-link:hover:not(.active) {
          color: #fff;
          background-color: #262626;
        }
        .custom-nav-link.active {
          background-color: #fff;
          color: #000;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .custom-nav-link.active svg {
          color: #000;
        }
        .custom-sidebar-footer {
          padding: 16px;
          border-top: 1px solid #262626;
        }
        .custom-footer-links {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }
        .custom-footer-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #a3a3a3;
          text-decoration: none;
          transition: color 0.2s;
        }
        .custom-footer-link:hover {
          color: #fff;
        }
      `}</style>

      {/* We keep dash-sidebar for responsive toggling behavior but override its base styling internally */}
      <div className={`dash-sidebar ${!isOpen ? 'closed' : ''}`} style={{ padding: 0, backgroundColor: '#171717', borderRight: 'none' }}>
        <div className="custom-sidebar">
          {/* Header */}
          <div className="custom-sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <div style={{ position: 'relative' }}>
                  <img src="/img/logo.png" alt="Orbit" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '50%', border: '2px solid #171717' }}></div>
                </div>
                <div>
                  <span style={{ fontWeight: '700', color: '#fff', fontSize: '18px' }}>Orbit Bot</span>
                  <p style={{ fontSize: '10px', color: '#737373', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Dashboard</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Server Selector */}
          <div className="custom-sidebar-server">
            <Link to="/dashboard" className="custom-server-btn">
              <img src={serverIconUrl} alt="Server" style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }} onError={(e) => { e.target.src = '/img/logo.png'; }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{serverName}</p>
                <p style={{ fontSize: '12px', color: '#737373', margin: 0 }}>Click to switch</p>
              </div>
              <ChevronLeft size={16} color="#a3a3a3" />
            </Link>
          </div>

          {/* Nav */}
          <nav className="custom-sidebar-nav">
            {sections.map((section, idx) => (
              <div key={idx} className="custom-nav-group">
                <p className="custom-nav-title">{section.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {section.links.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      className={({ isActive }) => `custom-nav-link ${isActive ? 'active' : ''}`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer (No Plan Ad, just links) */}
          <div className="custom-sidebar-footer">
            <div className="custom-footer-links">
              <a href="https://discord.gg/peak" target="_blank" rel="noopener noreferrer" className="custom-footer-link">
                Support <ExternalLink size={12} />
              </a>
              <Link to="/" className="custom-footer-link">Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
