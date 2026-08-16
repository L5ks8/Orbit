import React, { useState, useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';
import Toggle from '../ui/Toggle';

export default function Settings({ guildId }) {
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
    fetch(`/api/config/${guildId}`)
      .then(res => res.json())
      .then(data => {
        const s = data.config?.settings || {};
        setSettings({
          manager_roles: s.manager_roles || [],
          autoresponder_enabled: s.autoresponder_enabled || false,
          messages_enabled: s.messages_enabled || false
        });
        setRoles(data.roles || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [guildId]);

  const saveSettings = () => {
    setSaving(true);
    fetch(`/api/config/${guildId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings })
    })
      .then(res => res.json())
      .then(() => alert("Settings saved!"))
      .catch(() => alert("Failed to save settings."))
      .finally(() => setSaving(false));
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading settings...</div>;

  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));

  return (
    <div className="dash-settings">
      <h1 className="dash-title">Server Settings</h1>
      <p className="dash-subtitle">Configure basic Orbit behavior for this server.</p>

      <div className="dash-card settings-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Manager Roles</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
          Users with these roles can access this dashboard and configure Orbit, even if they don't have Administrator permissions in Discord.
        </p>
        
        <div style={{ marginBottom: '16px' }}>
          <CustomSelect 
            isMulti
            options={roleOptions}
            value={settings.manager_roles}
            onChange={(val) => setSettings({...settings, manager_roles: val})}
            placeholder="Select Manager Roles..."
          />
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>General Features</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Autoresponder Module</label>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enable or disable the custom autoresponder system.</span>
          </div>
          <Toggle 
            checked={settings.autoresponder_enabled} 
            onChange={() => setSettings({...settings, autoresponder_enabled: !settings.autoresponder_enabled})} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Messages Tracking</label>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Should Orbit track and log message counts for statistics?</span>
          </div>
          <Toggle 
            checked={settings.messages_enabled} 
            onChange={() => setSettings({...settings, messages_enabled: !settings.messages_enabled})} 
          />
        </div>
      </div>

      <div>
        <button 
          onClick={saveSettings} 
          disabled={saving}
          className="dash-btn primary"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
