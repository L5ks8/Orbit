import Toggle from '../../ui/Toggle';
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
    { id: 'anti_bot', name: 'Anti-Bot Add', desc: 'Automatically blocks unauthorized bots from joining and punishes the inviter.', icon: 'M3 11h18v10H3z M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M12 7v4 M8 16h8' }
  ];

  // Build rules state from config
  const [rules, setRules] = useState(
    rulesDef.map(r => {
      const cfg = amCfg[r.id] || {};
      return {
        ...r,
        enabled: cfg.enabled || false,
        action: cfg.action || 'warn',
        timeout_duration_min: cfg.timeout_duration_min || 5,
        words: cfg.words || [],
        max_messages: cfg.max_messages || 5,
        time_window_sec: cfg.time_window_sec || 3,
        blocked_domains: cfg.blocked_domains || ["discord.gg/", "discord.com/invite/"],
        max_mentions: cfg.max_mentions || 4,
        min_age_days: cfg.min_age_days || 3,
        exempt_channels: (cfg.exempt_channels || []).map(String),
        exempt_roles: (cfg.exempt_roles || []).map(String)
      };
    })
  );

  const [editingForm, setEditingForm] = useState(null);

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
    setEditingForm({ ...rule });
  };

  const saveEditRule = () => {
    setRules(rules.map(r => r.id === editingForm.id ? { ...editingForm } : r));
    setEditingForm(null);
  };

  const getPayload = () => {
    const payload = { enabled: amCfg?.enabled || false };
    payload.exempt_channels = selectedChannels;
    payload.exempt_roles = selectedRoles;

    rules.forEach(r => {
      const ruleData = { ...r };
      delete ruleData.name;
      delete ruleData.desc;
      delete ruleData.icon;
      payload[r.id] = ruleData;
    });

    return { automod: payload };
  };

  const [initialState, setInitialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  React.useEffect(() => {
    setInitialState(JSON.stringify(getPayload()));
  }, [config]);

  const handleSave = () => {
    onSave(getPayload(), true);
  };

  React.useEffect(() => {
    if (isDirty) {
      const timeout = setTimeout(() => {
        handleSave();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isDirty]);

  return (
    <div className="dash-settings-module">


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

      {editingForm && (
        <div className="dash-modal-overlay" onClick={() => setEditingForm(null)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Edit {editingForm.name}</h3>
              <button className="dash-modal-close" onClick={() => setEditingForm(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="settings-form" style={{ paddingRight: '4px' }}>
              
              {/* BANNED WORDS */}
              {editingForm.id === 'banned_words' && (
                <div className="form-group">
                  <label>Banned Words</label>
                  <span className="form-hint">Words or phrases to block. Separate with commas.</span>
                  <textarea rows="1"  className="dash-input" value={(editingForm.words || []).join(', ')} onChange={e => setEditingForm({...editingForm, words: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} placeholder="badword1, badword2" ></textarea>
                  <span className="form-hint" style={{ color: '#6366f1', marginTop: '4px' }}>Use * at the start, end, or both for partial matches.</span>
                </div>
              )}

              {/* ANTI SPAM */}
              {editingForm.id === 'anti_spam' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Message Count</label>
                    <span className="form-hint">Messages to trigger the rule.</span>
                    <input type="number" className="dash-input" value={editingForm.max_messages} onChange={e => setEditingForm({...editingForm, max_messages: parseInt(e.target.value) || 5})} min="2" max="100" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Time Window</label>
                    <span className="form-hint">Time window in seconds.</span>
                    <input type="number" className="dash-input" value={editingForm.time_window_sec} onChange={e => setEditingForm({...editingForm, time_window_sec: parseInt(e.target.value) || 3})} min="1" max="60" />
                  </div>
                </div>
              )}

              {/* ANTI LINK */}
              {editingForm.id === 'anti_link' && (
                <div className="form-group">
                  <label>Blocked Links</label>
                  <span className="form-hint">The domains to block. Separate with commas.</span>
                  <textarea rows="1"  className="dash-input" value={(editingForm.blocked_domains || []).join(', ')} onChange={e => setEditingForm({...editingForm, blocked_domains: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} ></textarea>
                </div>
              )}

              {/* MENTION SPAM */}
              {editingForm.id === 'mention_spam' && (
                <div className="form-group">
                  <label>Max Mentions</label>
                  <span className="form-hint">Maximum mentions allowed per message.</span>
                  <input type="number" className="dash-input" value={editingForm.max_mentions} onChange={e => setEditingForm({...editingForm, max_mentions: parseInt(e.target.value) || 4})} min="2" max="50" />
                </div>
              )}

              {/* ANTI ALT */}
              {editingForm.id === 'anti_alt' && (
                <div className="form-group">
                  <label>Minimum Account Age (days)</label>
                  <span className="form-hint">Accounts younger than this will be flagged.</span>
                  <input type="number" className="dash-input" value={editingForm.min_age_days} onChange={e => setEditingForm({...editingForm, min_age_days: parseInt(e.target.value) || 3})} min="1" max="365" />
                </div>
              )}

              {/* ACTION DROPDOWN */}
              <div className="form-group">
                <label>Punishment</label>
                <span className="form-hint">Action applied when the rule is triggered.</span>
                <CustomSelect 
                  options={editingForm.id === 'anti_alt' 
                    ? [
                        { value: 'kick', label: 'Kick' },
                        { value: 'softban', label: 'Softban' },
                        { value: 'ban', label: 'Ban' },
                        { value: 'verify', label: 'Force Verify (Quarantine Role)' }
                      ]
                    : [
                        { value: 'warn', label: 'Warning' },
                        { value: 'timeout', label: 'Timeout' },
                        { value: 'kick', label: 'Kick' },
                        { value: 'softban', label: 'Softban' },
                        { value: 'ban', label: 'Ban' },
                        { value: 'delete', label: 'Delete Message Only' }
                      ]
                  }
                  value={editingForm.action}
                  onChange={v => setEditingForm({...editingForm, action: v})}
                />
              </div>

              {/* TIMEOUT DURATION */}
              {editingForm.action === 'timeout' && (
                <div className="form-group">
                  <label>Timeout (Minutes)</label>
                  <input type="number" className="dash-input" value={editingForm.timeout_duration_min} onChange={e => setEditingForm({...editingForm, timeout_duration_min: parseInt(e.target.value) || 5})} min="1" />
                </div>
              )}

              {/* EXCEPTIONS */}
              {editingForm.id !== 'anti_alt' && editingForm.id !== 'anti_bot'  && (
                <>
                  <div className="form-group" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <label>Allowed Channels</label>
                    <span className="form-hint">Channels excluded from THIS rule.</span>
                    <CustomSelect 
                      options={channelOptions}
                      value={editingForm.exempt_channels}
                      onChange={v => setEditingForm({...editingForm, exempt_channels: v})}
                      placeholder="Select channels..."
                      isMulti={true}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Allowed Roles</label>
                    <span className="form-hint">Roles excluded from THIS rule.</span>
                    <CustomSelect 
                      options={roleOptions}
                      value={editingForm.exempt_roles}
                      onChange={v => setEditingForm({...editingForm, exempt_roles: v})}
                      placeholder="Select roles..."
                      isMulti={true}
                    />
                    <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '8px', marginBottom: 0 }}>Members with Administrator or Manage Server permissions are always ignored.</p>
                  </div>
                </>
              )}

            </div>

            <div className="settings-footer" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button className="dash-btn primary" onClick={saveEditRule} style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: '600', background: '#23a559' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
