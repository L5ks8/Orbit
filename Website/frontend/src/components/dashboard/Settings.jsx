import React, { useState, useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';
import Toggle from '../ui/Toggle';
import SaveBar from '../ui/SaveBar';
import { useToast } from '../ui/Toast';

export default function Settings({ guildId }) {
  const toast = useToast();
  const [settings, setSettings] = useState({
    manager_roles: [],
    immune_roles: [],
    autoresponder_enabled: false,
    messages_enabled: false
  });
  const [immuneUsers, setImmuneUsers] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [fetchingUser, setFetchingUser] = useState(false);
  
  const [extraSettings, setExtraSettings] = useState({
    ai_enabled: true,
    prefix: '-'
  });
  const [roles, setRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guildId) return;
    setLoading(true);
    fetch(`/api/config/${guildId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const s = data.config?.settings || {};
        const ext = data.config?.extra_settings || {};
        
        setSettings({
          manager_roles: s.manager_roles || [],
          immune_roles: s.immune_roles || [],
          autoresponder_enabled: s.autoresponder_enabled || false,
          messages_enabled: s.messages_enabled || false
        });
        setImmuneUsers(s.immune_users || []);
        
        setExtraSettings({
          ai_enabled: ext.ai_enabled ?? true,
          prefix: ext.prefix || '-'
        });

        setInitialState(JSON.stringify(getPayload(
          { ...s, manager_roles: s.manager_roles || [], immune_roles: s.immune_roles || [] }, 
          s.immune_users || [], 
          { ...ext, prefix: ext.prefix || '-' }
        )));
        setRoles(data.roles || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [guildId]);

  const getPayload = (s = settings, iu = immuneUsers, ext = extraSettings) => ({
    settings: {
      ...s,
      immune_users: iu.map(u => String(u.id))
    },
    extra_settings: ext
  });

  const [initialState, setInitialState] = useState('');
  const isDirty = initialState && JSON.stringify(getPayload()) !== initialState;

  const saveSettings = () => {
    setSaving(true);
    fetch(`/api/config/${guildId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(getPayload())
    })
      .then(res => res.json())
      .then(() => {
        toast("Settings saved!", 'success');
        setInitialState(JSON.stringify(getPayload()));
      })
      .catch(() => toast("Failed to save settings.", 'error'))
      .finally(() => setSaving(false));
  };

  const handleReset = () => {
    if (initialState) {
      const parsed = JSON.parse(initialState);
      const parsedS = parsed.settings || {};
      setSettings({
        manager_roles: parsedS.manager_roles || [],
        immune_roles: parsedS.immune_roles || [],
        autoresponder_enabled: parsedS.autoresponder_enabled || false,
        messages_enabled: parsedS.messages_enabled || false
      });
      // the initialState payload has immune_users as array of IDs, but we can't easily fetch their objects synchronously here.
      // however, resetting from dirty state usually just means reloading the page or trusting the old objects. 
      // We can just keep the old objects that match the old IDs.
      const oldIds = parsedS.immune_users || [];
      setImmuneUsers(prev => prev.filter(u => oldIds.includes(String(u.id))));
      
      setExtraSettings(parsed.extra_settings || {});
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', background: '#09090b', color: '#949ba4' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#5865F2', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
      <div style={{ fontSize: '15px', fontWeight: 500 }}>Loading settings...</div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));

  return (
    <div className="dash-settings">
      <h1 className="dash-title">Server Settings</h1>
      <p className="dash-subtitle">Configure basic Orbit behavior for this server.</p>

      <div style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '8px', 
        padding: '24px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '24px' }}>Server Configuration</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>Command Prefix</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '12px' }}>
              The symbol used to trigger bot commands.
            </p>
            <input 
              type="text" 
              className="dash-input" 
              style={{ width: '100px' }}
              value={extraSettings.prefix}
              onChange={(e) => setExtraSettings({...extraSettings, prefix: e.target.value.slice(0, 3)})}
            />
          </div>

        </div>
      </div>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '8px', 
        padding: '24px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Anti-Ban & Kick Immunity</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>
          Users in this list, or users possessing these roles, are immune to the bot's moderation commands (like ban, kick, timeout).
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>Immune Roles</h3>
            <CustomSelect 
              isMulti
              options={roleOptions}
              value={settings.immune_roles}
              onChange={(val) => setSettings({...settings, immune_roles: val})}
              placeholder="Select Immune Roles..."
            />
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>Immune Users</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text" 
                className="dash-input" 
                placeholder="User ID (e.g. 123456789)"
                value={newUserId}
                onChange={e => setNewUserId(e.target.value)}
                style={{ flex: 1 }}
              />
              <button 
                className="dash-btn" 
                style={{ background: '#5865F2', color: '#fff', padding: '0 16px' }}
                disabled={fetchingUser || !newUserId}
                onClick={() => {
                  if (!newUserId) return;
                  if (immuneUsers.find(u => u.id === newUserId)) {
                    toast("User already added", "error");
                    return;
                  }
                  setFetchingUser(true);
                  fetch(`/api/user/${newUserId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
                    .then(r => r.json())
                    .then(d => {
                      if (d.error) {
                        toast(d.error, 'error');
                      } else {
                        setImmuneUsers([...immuneUsers, d]);
                        setNewUserId('');
                      }
                    })
                    .catch(() => toast("Failed to fetch user", "error"))
                    .finally(() => setFetchingUser(false));
                }}
              >
                {fetchingUser ? '...' : 'Add User'}
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {immuneUsers.map(user => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={user.avatar} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{user.name}</span>
                  </div>
                  <button 
                    onClick={() => setImmuneUsers(immuneUsers.filter(u => u.id !== user.id))}
                    style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}
              {immuneUsers.length === 0 && (
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontStyle: 'italic' }}>No immune users added yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '8px', 
        padding: '24px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Manager Roles</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>
          Users with these roles can access this dashboard and configure Orbit, even if they don't have Administrator permissions in Discord.
        </p>
        
        <div>
          <CustomSelect 
            isMulti
            options={roleOptions}
            value={settings.manager_roles}
            onChange={(val) => setSettings({...settings, manager_roles: val})}
            placeholder="Select Manager Roles..."
          />
        </div>
      </div>

      <div style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '8px', 
        padding: '24px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '24px' }}>General Features</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <label style={{ margin: 0, color: '#fff', display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>AI Chatbot Responses</label>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Allow the bot to use AI to respond to mentions and replies.</span>
          </div>
          <Toggle 
            checked={extraSettings.ai_enabled} 
            onChange={() => setExtraSettings({...extraSettings, ai_enabled: !extraSettings.ai_enabled})} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <label style={{ margin: 0, color: '#fff', display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Autoresponder Module</label>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Enable or disable the custom autoresponder system.</span>
          </div>
          <Toggle 
            checked={settings.autoresponder_enabled} 
            onChange={() => setSettings({...settings, autoresponder_enabled: !settings.autoresponder_enabled})} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label style={{ margin: 0, color: '#fff', display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Messages Tracking</label>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Should Orbit track and log message counts for statistics?</span>
          </div>
          <Toggle 
            checked={settings.messages_enabled} 
            onChange={() => setSettings({...settings, messages_enabled: !settings.messages_enabled})} 
          />
        </div>
      </div>

      <SaveBar show={isDirty} onReset={handleReset} onSave={saveSettings} saving={saving} />
    </div>
  );
}
