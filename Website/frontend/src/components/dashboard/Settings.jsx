import React, { useState, useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';
import Toggle from '../ui/Toggle';
import SaveBar from '../ui/SaveBar';
import { useToast } from '../ui/Toast';

export default function Settings({ guildId }) {
  const toast = useToast();
  const [settings, setSettings] = useState({
    manager_roles: [],
    autoresponder_enabled: false,
    messages_enabled: false
  });
  const [extraSettings, setExtraSettings] = useState({
    ai_enabled: true,
    bot_roles: [],
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
          autoresponder_enabled: s.autoresponder_enabled || false,
          messages_enabled: s.messages_enabled || false
        });
        setExtraSettings({
          ai_enabled: ext.ai_enabled ?? true,
          bot_roles: ext.bot_roles || [],
          prefix: ext.prefix || '-'
        });

        setInitialState(JSON.stringify({
          settings: {
            manager_roles: s.manager_roles || [],
            autoresponder_enabled: s.autoresponder_enabled || false,
            messages_enabled: s.messages_enabled || false
          },
          extraSettings: {
            ai_enabled: ext.ai_enabled ?? true,
            bot_roles: ext.bot_roles || [],
            prefix: ext.prefix || '-'
          }
        }));
        setRoles(data.roles || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [guildId]);

  const [initialState, setInitialState] = useState('');
  const isDirty = initialState && JSON.stringify({ settings, extraSettings }) !== initialState;

  const saveSettings = () => {
    setSaving(true);
    fetch(`/api/config/${guildId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ settings, extra_settings: extraSettings })
    })
      .then(res => res.json())
      .then(() => {
        toast("Settings saved!", 'success');
        setInitialState(JSON.stringify({ settings, extraSettings }));
      })
      .catch(() => toast("Failed to save settings.", 'error'))
      .finally(() => setSaving(false));
  };

  const handleReset = () => {
    if (initialState) {
      const parsed = JSON.parse(initialState);
      setSettings(parsed.settings);
      setExtraSettings(parsed.extraSettings);
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

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>Bot Auto-Roles</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '12px' }}>
              Roles automatically given to bots when they join the server.
            </p>
            <CustomSelect 
              isMulti
              options={roleOptions}
              value={extraSettings.bot_roles}
              onChange={(val) => setExtraSettings({...extraSettings, bot_roles: val})}
              placeholder="Select Bot Roles..."
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
