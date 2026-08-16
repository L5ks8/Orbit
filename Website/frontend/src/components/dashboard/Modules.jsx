import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Toggle from '../ui/Toggle';

export default function Modules({ guildId }) {
  const modulesList = [
    { id: 'automod', category: 'Moderation', name: 'Auto-Moderation', desc: 'Automatically filter spam, bad words, and malicious links.', iconColor: 'rgba(239, 68, 68, 0.2)', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
    { id: 'appeals', category: 'Moderation', name: 'Ban Appeals', desc: 'Allow banned users to appeal their punishments.', iconColor: 'rgba(139, 92, 246, 0.2)', icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" /> },
    { id: 'security', category: 'Moderation', name: 'Security', desc: 'Advanced server protection and verification.', iconColor: 'rgba(239, 68, 68, 0.2)', icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
    { id: 'verify', category: 'Moderation', name: 'Verification', desc: 'Require users to verify before accessing the server.', iconColor: 'rgba(16, 185, 129, 0.2)', icon: <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" /> },

    { id: 'welcome', category: 'Engagement', name: 'Welcome Messages', desc: 'Greet new users with custom text and image cards.', iconColor: 'rgba(59, 130, 246, 0.2)', icon: <path d="M14 22v-4a2 2 0 1 0-4 0v4M12 14v4M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M14.83 9.17l2.83-2.83M6.34 17.66l-2.83 2.83" /> },
    { id: 'level', category: 'Engagement', name: 'Leveling System', desc: 'Reward active members with XP and roles.', iconColor: 'rgba(16, 185, 129, 0.2)', icon: <path d="M12 15l-2 5l9-5l-5-5L12 15z M2 15l9-5-2-5L2 15z" /> },
    { id: 'boost', category: 'Engagement', name: 'Boost Messages', desc: 'Announce when someone boosts your server.', iconColor: 'rgba(244, 63, 94, 0.2)', icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01" /> },
    { id: 'economy', category: 'Engagement', name: 'Economy', desc: 'Global server currency, shops, and gambling.', iconColor: 'rgba(234, 179, 8, 0.2)', icon: <><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8 M12 18V6" /></> },
    { id: 'goodbye', category: 'Engagement', name: 'Goodbye Messages', desc: 'Send a message when a user leaves the server.', iconColor: 'rgba(100, 116, 139, 0.2)', icon: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" /> },
    { id: 'serverstats', category: 'Engagement', name: 'Server Stats', desc: 'Display member counts in voice channels.', iconColor: 'rgba(6, 182, 212, 0.2)', icon: <path d="M18 20V10 M12 20V4 M6 20v-6" /> },

    { id: 'tickets', category: 'Utility', name: 'Support Tickets', desc: 'Allow users to open private tickets for support.', iconColor: 'rgba(245, 158, 11, 0.2)', icon: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /> },
    { id: 'automation', category: 'Utility', name: 'Automation', desc: 'Create custom triggers and actions for your server.', iconColor: 'rgba(236, 72, 153, 0.2)', icon: <path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
    { id: 'autoresponder', category: 'Utility', name: 'Auto Responder', desc: 'Automatically reply to specific keywords.', iconColor: 'rgba(14, 165, 233, 0.2)', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
    { id: 'joinroles', category: 'Utility', name: 'Join Roles', desc: 'Automatically assign roles to new members.', iconColor: 'rgba(34, 197, 94, 0.2)', icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" /> },
    { id: 'tempvoice', category: 'Utility', name: 'Temp Voice', desc: 'Allow users to create their own voice channels.', iconColor: 'rgba(249, 115, 22, 0.2)', icon: <path d="M12 2c-1.7 0-3 1.2-3 2.6v6.8c0 1.4 1.3 2.6 3 2.6s3-1.2 3-2.6V4.6C15 3.2 13.7 2 12 2z M19 10v1.6c0 3.6-3.1 6.4-7 6.4s-7-2.8-7-6.4V10 M12 18v4 M8 22h8" /> },

    { id: 'logs', category: 'Logging', name: 'Logs', desc: 'Track everything that happens in your server.', iconColor: 'rgba(99, 102, 241, 0.2)', icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-6 M9 15h6" /> },
  ];

  const [enabledModules, setEnabledModules] = useState({});
  const [config, setConfig] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Moderation', 'Engagement', 'Utility', 'Logging'];

  useEffect(() => {
    if (!guildId) return;
    fetch(`/api/config/${guildId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        const cfg = data.config || {};
        setEnabledModules({
          automod: cfg.automod?.enabled || false,
          welcome: cfg.welcome?.enabled || false,
          level: cfg.level?.enabled || false,
          tickets: cfg.ticket?.enabled || false,
          appeals: cfg.appeals?.enabled || false,
          automation: cfg.automation?.enabled || false,
          autoresponder: cfg.autoresponder_enabled || false,
          boost: cfg.boost?.enabled || false,
          economy: cfg.economy?.enabled || false,
          goodbye: cfg.goodbye?.enabled || false,
          joinroles: cfg.joinroles?.enabled || false,
          logs: cfg.logs?.enabled || false,
          messages: cfg.messages_enabled || false,
          security: cfg.security?.enabled || false,
          serverstats: cfg.serverstats?.enabled || false,
          tempvoice: cfg.tempvoice?.enabled || false,
          verify: cfg.verify?.enabled || false,
        });
      });
  }, [guildId]);

  const toggleModule = (id) => {
    if (!config) return;

    const newState = !enabledModules[id];
    setEnabledModules(prev => ({ ...prev, [id]: newState }));

    let backendKey = id;
    if (id === 'tickets') backendKey = 'ticket';

    let payload = {};

    if (id === 'autoresponder' || id === 'messages') {
      payload = {
        settings: config.settings || {},
        autoresponder_enabled: id === 'autoresponder' ? newState : (enabledModules.autoresponder || false),
        messages_enabled: id === 'messages' ? newState : (enabledModules.messages || false)
      };
    } else {
      const currentModConfig = config[backendKey] || {};
      payload[backendKey] = {
        ...currentModConfig,
        enabled: newState
      };
    }

    fetch(`/api/config/${guildId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error("Failed to save:", data.error);
          setEnabledModules(prev => ({ ...prev, [id]: !newState }));
        } else {
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

  const filteredModules = modulesList.filter(mod => {
    const matchesCategory = activeCategory === 'All' || mod.category === activeCategory;
    const matchesSearch = mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="dash-modules">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '20px' }}>
        <div>
          <h1 className="dash-title">Modules</h1>
          <p className="dash-subtitle">Enable and configure the features you want to use in your server.</p>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            placeholder="Search modules..."
            className="dash-input"
            style={{ paddingLeft: '38px', borderRadius: '8px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: activeCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
              fontWeight: activeCategory === cat ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredModules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#fff' }}>No modules found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search query or changing the category filter.</p>
        </div>
      ) : (
        <div className="dash-modules-grid">
          {filteredModules.map((mod) => (
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
      )}
    </div>
  );
}
