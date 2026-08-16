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
        setSettings({
          manager_roles: s.manager_roles || [],
          autoresponder_enabled: s.autoresponder_enabled || false,
          messages_enabled: s.messages_enabled || false
        });
        setInitialState(JSON.stringify({
          manager_roles: s.manager_roles || [],
          autoresponder_enabled: s.autoresponder_enabled || false,
          messages_enabled: s.messages_enabled || false
        }));
        setRoles(data.roles || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [guildId]);

  const [initialState, setInitialState] = useState('');
  const isDirty = initialState && JSON.stringify(settings) !== initialState;

  const saveSettings = () => {
    setSaving(true);
    fetch(`/api/config/${guildId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ settings })
    })
      .then(res => res.json())
      .then(() => {
        toast("Settings saved!", 'success');
        setInitialState(JSON.stringify(settings));
      })
      .catch(() => toast("Failed to save settings.", 'error'))
      .finally(() => setSaving(false));
  };

  const handleReset = () => {
    if (initialState) {
      setSettings(JSON.parse(initialState));
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading settings...</div>;

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
