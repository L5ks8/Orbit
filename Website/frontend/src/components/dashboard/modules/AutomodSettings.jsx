import Toggle from '../../ui/Toggle';
import SaveBar from '../../ui/SaveBar';
import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';

export default function AutomodSettings({ config, channels, roles, onSave, saving, onReset }) {
  const amCfg = config?.automod || {};

  const rulesDef = [
    { id: 'banned_words', name: 'Banned Words', desc: 'Block messages containing specific words or phrases.', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM4.93 4.93l14.14 14.14' },
    { id: 'anti_spam', name: 'Anti Spam', desc: 'Prevent users from sending too many messages in a short time.', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    { id: 'anti_invites', name: 'Anti Invites', desc: 'Prevent the sending of Discord invites.', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6L12 13 2 6' },
    { id: 'anti_link', name: 'Anti Links', desc: 'Prevent the sending of links.', icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
    { id: 'anti_caps', name: 'Anti Caps', desc: 'Prevent sending messages with exclusively capital letters.', icon: 'M4 7V4h16v3 M9 20h6 M12 4v16' },
    { id: 'mention_spam', name: 'Mention Spam', desc: 'Prevent sending messages with too many mentions.', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
    { id: 'anti_alt', name: 'Anti-Alt Account', desc: 'Automatically act on newly created accounts joining the server.', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
    { id: 'ai_automod', name: 'AI Content Filter', desc: 'Uses AI to detect context-aware toxicity, slurs, and bypassed insults.', icon: 'M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { id: 'anti_bot', name: 'Anti-Bot Add', desc: 'Automatically blocks unauthorized bots from joining and punishes the inviter.', icon: 'M3 11h18v10H3z M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M12 7v4 M8 16h8' }
  ];

  // Build rules state from config
  const [rules, setRules] = useState(
    rulesDef.map(r => ({
      ...r,
      enabled: amCfg[r.id]?.enabled || false,
      action: amCfg[r.id]?.action || 'warn',
      timeout_duration_min: amCfg[r.id]?.timeout_duration_min || 5
    }))
  );

  const [editingRule, setEditingRule] = useState(null);
  const [editAction, setEditAction] = useState('warn');
  const [editTimeout, setEditTimeout] = useState(5);

  // Global exempt channels/roles from config
  const [selectedChannels, setSelectedChannels] = useState(
    (amCfg.exempt_channels || []).map(String)
  );
  const [selectedRoles, setSelectedRoles] = useState(
    (amCfg.exempt_roles || []).map(String)
  );

  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));
  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));

  const toggleRule = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const openEditRule = (rule) => {
    setEditAction(rule.action);
    setEditTimeout(rule.timeout_duration_min);
    setEditingRule(rule);
  };

  const saveEditRule = () => {
    setRules(rules.map(r => r.id === editingRule.id ? { ...r, action: editAction, timeout_duration_min: editTimeout } : r));
    setEditingRule(null);
  };

  const getPayload = () => {
    const payload = { enabled: amCfg?.enabled || false };
    payload.exempt_channels = selectedChannels;
    payload.exempt_roles = selectedRoles;

    rules.forEach(r => {
      payload[r.id] = {
        enabled: r.enabled,
        action: r.action,
        timeout_duration_min: r.timeout_duration_min,
        ...(amCfg[r.id] || {}) // preserve extra fields like words, max_messages etc.
      };
      // Override the fields we manage
      payload[r.id].enabled = r.enabled;
      payload[r.id].action = r.action;
      payload[r.id].timeout_duration_min = r.timeout_duration_min;
    });

    return { automod: payload };
  };

  const [initialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  const handleSave = () => {
    onSave(getPayload());
  };

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
                onClick={() => openEditRule(rule)}
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
                    { value: 'timeout', label: 'Timeout User' },
                    { value: 'kick', label: 'Kick User' },
                    { value: 'ban', label: 'Ban User' }
                  ]}
                  value={editAction}
                  onChange={setEditAction}
                />
              </div>

              {editAction === 'timeout' && (
                <div className="form-group">
                  <label>Timeout Duration (minutes)</label>
                  <input type="number" className="dash-input" value={editTimeout} onChange={e => setEditTimeout(parseInt(e.target.value) || 5)} min="1" />
                </div>
              )}
            </div>

            <div className="settings-footer" style={{ marginTop: '32px', paddingTop: '20px' }}>
              <button className="dash-btn primary" onClick={saveEditRule}>Save Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
