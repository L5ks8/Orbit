import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Bot, User, Activity, 
  MessageSquare, Users, UserPlus, Shield, 
  ShieldAlert, ShieldCheck, Ticket, Zap, 
  Settings, BarChart3, Database, FileText,
  Volume2
} from 'lucide-react';

export default function Sidebar({ guildId, isOpen = true }) {
  const sections = [
    {
      title: 'MAIN AREA',
      links: [
        { name: 'Overview', path: `/dashboard/${guildId}/overview`, icon: <LayoutDashboard size={18} /> },
        { name: 'AI Builder', path: `/dashboard/${guildId}/ai-builder`, icon: <Bot size={18} /> },
        { name: 'Bot Profile', path: `/dashboard/${guildId}/bot-profile`, icon: <User size={18} /> },
        { name: 'Analytics', path: `/dashboard/${guildId}/analytics`, icon: <Activity size={18} /> },
      ]
    },
    {
      title: 'WELCOME & ONBOARDING',
      links: [
        { name: 'Welcome', path: `/dashboard/${guildId}/welcome`, icon: <MessageSquare size={18} /> },
        { name: 'Roles', path: `/dashboard/${guildId}/joinroles`, icon: <Users size={18} /> },
        { name: 'Invite Tracker', path: `/dashboard/${guildId}/invites`, icon: <UserPlus size={18} /> },
      ]
    },
    {
      title: 'MODERATION',
      links: [
        { name: 'Auto-Moderation', path: `/dashboard/${guildId}/automod`, icon: <Shield size={18} /> },
        { name: 'Ban Appeals', path: `/dashboard/${guildId}/appeals`, icon: <ShieldAlert size={18} /> },
        { name: 'Security', path: `/dashboard/${guildId}/security`, icon: <ShieldCheck size={18} /> },
        { name: 'Verification', path: `/dashboard/${guildId}/verify`, icon: <ShieldCheck size={18} /> },
        { name: 'Logs', path: `/dashboard/${guildId}/logs`, icon: <FileText size={18} /> },
      ]
    },
    {
      title: 'ENGAGEMENT',
      links: [
        { name: 'Leveling System', path: `/dashboard/${guildId}/level`, icon: <Activity size={18} /> },
        { name: 'Leaderboard', path: `/dashboard/${guildId}/leaderboard`, icon: <BarChart3 size={18} /> },
        { name: 'Boost Messages', path: `/dashboard/${guildId}/boost`, icon: <Zap size={18} /> },
        { name: 'Economy', path: `/dashboard/${guildId}/economy`, icon: <Database size={18} /> },
        { name: 'Server Stats', path: `/dashboard/${guildId}/serverstats`, icon: <BarChart3 size={18} /> },
      ]
    },
    {
      title: 'UTILITY',
      links: [
        { name: 'Support Tickets', path: `/dashboard/${guildId}/tickets`, icon: <Ticket size={18} /> },
        { name: 'Automation', path: `/dashboard/${guildId}/automation`, icon: <Zap size={18} /> },
        { name: 'Auto Responder', path: `/dashboard/${guildId}/autoresponder`, icon: <MessageSquare size={18} /> },
        { name: 'Embed Builder', path: `/dashboard/${guildId}/embed-builder`, icon: <MessageSquare size={18} /> },
        { name: 'Temp Voice', path: `/dashboard/${guildId}/tempvoice`, icon: <Volume2 size={18} /> },
      ]
    },
    {
      title: 'SYSTEM',
      links: [
        { name: 'Settings', path: `/dashboard/${guildId}/settings`, icon: <Settings size={18} /> },
      ]
    }
  ];

  return (
    <div className={`dash-sidebar ${!isOpen ? 'closed' : ''}`}>
      <Link to="/" className="dash-sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
        <img src="/img/logo.png" alt="Orbit Logo" style={{ height: '32px' }} />
        <span style={{ fontWeight: '600', fontSize: '20px', color: '#fff' }}>Orbit</span>
      </Link>
      <nav className="dash-sidebar-nav" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
        {sections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: '#52525b', 
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              padding: '0 12px',
              marginBottom: '8px'
            }}>
              {section.title}
            </div>
            {section.links.map((link) => (
              <NavLink 
                key={link.name} 
                to={link.path} 
                className={({ isActive }) => `dash-nav-link ${isActive ? 'active' : ''}`}
                style={{ padding: '8px 12px', margin: '2px 0' }}
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="dash-sidebar-footer" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
