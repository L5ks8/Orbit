import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function AutomodSettings() {
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [editingRule, setEditingRule] = useState(null);

  // Mock rules data
  const [rules, setRules] = useState([
    { id: 'banned_words', name: 'Banned Words', desc: 'Block messages containing specific words or phrases.', enabled: true, icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM4.93 4.93l14.14 14.14' },
    { id: 'anti_spam', name: 'Anti Spam', desc: 'Prevent users from sending too many messages in a short time.', enabled: true, icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { id: 'anti_invites', name: 'Anti Invites', desc: 'Prevent the sending of Discord invites.', enabled: false, icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6L12 13 2 6' },
    { id: 'anti_link', name: 'Anti Links', desc: 'Prevent the sending of links.', enabled: false, icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
    { id: 'anti_caps', name: 'Anti Caps', desc: 'Prevent sending messages with exclusively capital letters.', enabled: false, icon: 'M4 7V4h16v3 M9 20h6 M12 4v16' },
    { id: 'mention_spam', name: 'Mention Spam', desc: 'Prevent sending messages with too many mentions.', enabled: false, icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' }, // Modified to a generic user icon
    { id: 'anti_alt', name: 'Anti-Alt Account', desc: 'Automatically act on newly created accounts joining the server.', enabled: false, icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
    { id: 'ai_automod', name: 'AI Content Filter', desc: 'Uses AI to detect context-aware toxicity, slurs, and bypassed insults.', enabled: true, icon: 'M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { id: 'anti_bot', name: 'Anti-Bot Add', desc: 'Automatically blocks unauthorized bots from joining and punishes the inviter.', enabled: true, icon: 'M3 11h18v10H3z M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M12 7v4 M8 16h8' }
  ]);

  const toggleRule = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const channelOptions = [
    { value: '1', label: '# general' },
    { value: '2', label: '# memes' },
    { value: '3', label: '# bot-commands' },
  ];
  const [selectedChannels, setSelectedChannels] = useState([]);

  const roleOptions = [
    { value: '1', label: '@ Admin', color: '#e74c3c' },
    { value: '2', label: '@ Moderator', color: '#3498db' },
    { value: '3', label: '@ VIP', color: '#f1c40f' },
  ];
  const [selectedRoles, setSelectedRoles] = useState([]);

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Auto-Moderation</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Protect your server from spam, links, and malicious accounts.</p>
          </div>
          
        </div>
      </div>

      <h3 className="section-heading">Rules</h3>
      <div className="dash-modules-grid" style={{ marginBottom: '24px' }}>
        {rules.map(rule => (
          <div key={rule.id} className="dash-card module-card">
            <div className="module-card-header">
              <div className="module-card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
                  {rule.icon.split(' M').map((path, i) => {
                    const cleanPath = path.startsWith('M') ? path : 'M' + path;
                    return <path key={i} d={cleanPath} />
                  })}
                </svg>
                <h3>{rule.name}</h3>
              </div>
              <Toggle checked={rule.enabled} onChange={() => toggleRule(rule.id)} />
            </div>
            <p className="module-card-desc">{rule.desc}</p>
            <div className="module-card-actions">
              <button 
                className="dash-btn secondary" 
                style={{ padding: '6px 12px', fontSize: '13px' }}
                onClick={() => setEditingRule(rule)}
              >
                Edit Rule
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-heading">Global Options</h3>
      <div className="dash-card settings-card">
        <div className="settings-form">
          <div className="form-group">
            <label>Allowed Channels</label>
            <span className="form-hint">Channels excluded from all automod rules.</span>
            <CustomSelect 
              options={channelOptions}
              value={selectedChannels}
              onChange={setSelectedChannels}
              placeholder="Select channels..."
              isMulti={true}
            />
          </div>

          <div className="form-group">
            <label>Allowed Roles</label>
            <span className="form-hint">Roles excluded from all automod rules.</span>
            <CustomSelect 
              options={roleOptions}
              value={selectedRoles}
              onChange={setSelectedRoles}
              placeholder="Select roles..."
              isMulti={true}
            />
            <span className="form-hint" style={{ color: '#f59e0b', marginTop: '4px' }}>Members with Administrator or Manage Server permissions are always ignored.</span>
          </div>
        </div>
        
        <div className="settings-footer">
          <button className="dash-btn primary">Save Changes</button>
          <button className="dash-btn secondary">Discard</button>
        </div>
      </div>

      {editingRule && (
        <div className="dash-modal-overlay" onClick={() => setEditingRule(null)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Edit {editingRule.name}</h3>
              <button className="dash-modal-close" onClick={() => setEditingRule(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="settings-form">
              <div className="form-group inline">
                <div className="form-text">
                  <label>Enable {editingRule.name}</label>
                  <span className="form-hint">{editingRule.desc}</span>
                </div>
                <Toggle checked={editingRule.enabled} onChange={() => toggleRule(editingRule.id)} />
              </div>
              
              <div className="form-group">
                <label>Action</label>
                <CustomSelect 
                  options={[
                    { value: 'delete', label: 'Delete Message' },
                    { value: 'warn', label: 'Warn User' },
                    { value: 'timeout', label: 'Timeout User' }
                  ]}
                  value="delete"
                  onChange={() => {}}
                />
              </div>
            </div>

            <div className="settings-footer" style={{ marginTop: '32px', paddingTop: '20px' }}>
              <button className="dash-btn primary" onClick={() => setEditingRule(null)}>Save Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
