import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Toggle from '../ui/Toggle';

export default function Modules({ guildId }) {
  const modulesList = [
    { id: 'automod', name: 'Auto-Moderation', desc: 'Automatically filter spam, bad words, and malicious links.', iconColor: 'rgba(239, 68, 68, 0.2)', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
    { id: 'welcome', name: 'Welcome Messages', desc: 'Greet new users with custom text and image cards.', iconColor: 'rgba(59, 130, 246, 0.2)', icon: <path d="M14 22v-4a2 2 0 1 0-4 0v4M12 14v4M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M14.83 9.17l2.83-2.83M6.34 17.66l-2.83 2.83"/> },
    { id: 'level', name: 'Leveling System', desc: 'Reward active members with XP and roles.', iconColor: 'rgba(16, 185, 129, 0.2)', icon: <path d="M12 15l-2 5l9-5l-5-5L12 15z M2 15l9-5-2-5L2 15z"/> },
    { id: 'tickets', name: 'Support Tickets', desc: 'Allow users to open private tickets for support.', iconColor: 'rgba(245, 158, 11, 0.2)', icon: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/> },
    { id: 'appeals', name: 'Ban Appeals', desc: 'Allow banned users to appeal their punishments.', iconColor: 'rgba(139, 92, 246, 0.2)', icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"/> },
    { id: 'automation', name: 'Automation', desc: 'Create custom triggers and actions for your server.', iconColor: 'rgba(236, 72, 153, 0.2)', icon: <path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/> },
    { id: 'autoresponder', name: 'Auto Responder', desc: 'Automatically reply to specific keywords.', iconColor: 'rgba(14, 165, 233, 0.2)', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/> },
    { id: 'boost', name: 'Boost Messages', desc: 'Announce when someone boosts your server.', iconColor: 'rgba(244, 63, 94, 0.2)', icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01"/> },
    { id: 'economy', name: 'Economy', desc: 'Global server currency, shops, and gambling.', iconColor: 'rgba(234, 179, 8, 0.2)', icon: <><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8 M12 18V6"/></> },
    { id: 'goodbye', name: 'Goodbye Messages', desc: 'Send a message when a user leaves the server.', iconColor: 'rgba(100, 116, 139, 0.2)', icon: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9"/> },
    { id: 'joinroles', name: 'Join Roles', desc: 'Automatically assign roles to new members.', iconColor: 'rgba(34, 197, 94, 0.2)', icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75"/> },
    { id: 'logs', name: 'Audit Logs', desc: 'Track everything that happens in your server.', iconColor: 'rgba(99, 102, 241, 0.2)', icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-6 M9 15h6"/> },
    { id: 'messages', name: 'Message Logs', desc: 'Log deleted and edited messages separately.', iconColor: 'rgba(168, 85, 247, 0.2)', icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/> },
    { id: 'security', name: 'Security', desc: 'Advanced server protection and verification.', iconColor: 'rgba(239, 68, 68, 0.2)', icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> },
    { id: 'serverstats', name: 'Server Stats', desc: 'Display member counts in voice channels.', iconColor: 'rgba(6, 182, 212, 0.2)', icon: <path d="M18 20V10 M12 20V4 M6 20v-6"/> },
    { id: 'tempvoice', name: 'Temp Voice', desc: 'Allow users to create their own voice channels.', iconColor: 'rgba(249, 115, 22, 0.2)', icon: <path d="M12 2c-1.7 0-3 1.2-3 2.6v6.8c0 1.4 1.3 2.6 3 2.6s3-1.2 3-2.6V4.6C15 3.2 13.7 2 12 2z M19 10v1.6c0 3.6-3.1 6.4-7 6.4s-7-2.8-7-6.4V10 M12 18v4 M8 22h8"/> },
    { id: 'verify', name: 'Verification', desc: 'Require users to verify before accessing the server.', iconColor: 'rgba(16, 185, 129, 0.2)', icon: <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3"/> },
  ];

  const [enabledModules, setEnabledModules] = useState({});
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (!guildId) return;
    fetch(`/api/config/${guildId}`)
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setEnabledModules({
          automod: data.automod?.enabled || false,
          welcome: data.welcome?.enabled || false,
          level: data.level?.enabled || false,
          tickets: data.ticket?.enabled || false,
          appeals: data.appeals?.enabled || false,
          automation: data.automation?.enabled || false,
          autoresponder: data.autoresponder_enabled || false,
          boost: data.boost?.enabled || false,
          economy: data.economy?.enabled || false,
          goodbye: data.goodbye?.enabled || false,
          joinroles: data.joinroles?.enabled || false,
          logs: data.logs?.enabled || false,
          messages: data.messages_enabled || false,
          security: data.security?.enabled || false,
          serverstats: data.serverstats?.enabled || false,
          tempvoice: data.tempvoice?.enabled || false,
          verify: data.verify?.enabled || false,
        });
      });
  }, [guildId]);

  const toggleModule = (id) => {
    if (!config) return;

    const newState = !enabledModules[id];
    setEnabledModules(prev => ({ ...prev, [id]: newState }));

    // Map frontend ID to backend key
    let backendKey = id;
    if (id === 'tickets') backendKey = 'ticket';

    let payload = {};

    if (id === 'autoresponder' || id === 'messages') {
      // These are saved under settings in the backend
      payload = {
        settings: config.settings || {},
        autoresponder_enabled: id === 'autoresponder' ? newState : (enabledModules.autoresponder || false),
        messages_enabled: id === 'messages' ? newState : (enabledModules.messages || false)
      };
    } else {
      // Normal module, must send full current config so we don't wipe it
      const currentModConfig = config[backendKey] || {};
      payload[backendKey] = {
        ...currentModConfig,
        enabled: newState
      };
    }

    fetch(`/api/config/${guildId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.error("Failed to save:", data.error);
        // Revert UI state on failure
        setEnabledModules(prev => ({ ...prev, [id]: !newState }));
      } else {
        // Update local config cache with the new state
        setConfig(prev => ({
          ...prev,
          ...payload,
          [backendKey]: payload[backendKey] ? payload[backendKey] : prev[backendKey]
        }));
      }
    })
    .catch(err => {
      console.error(err);
      setEnabledModules(prev => ({ ...prev, [id]: !newState }));
    });
  };

  return (
    <div className="dash-modules">
      <h1 className="dash-title">Modules</h1>
      <p className="dash-subtitle">Enable and configure the features you want to use in your server.</p>
      
      <div className="dash-modules-grid">
        {modulesList.map((mod) => (
          <div key={mod.id} className="dash-card module-card">
            <div className="module-card-header">
              <div className="module-card-title">
                <div className="module-icon" style={{ background: mod.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
                    {mod.icon}
                  </svg>
                </div>
                <h3>{mod.name}</h3>
              </div>
              <Toggle checked={enabledModules[mod.id] || false} onChange={() => toggleModule(mod.id)} />
            </div>
            <p className="module-card-desc">{mod.desc}</p>
            <div className="module-card-actions">
              <Link to={`/dashboard/${guildId}/modules/${mod.id}`} className="module-config-btn">
                Configure
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
