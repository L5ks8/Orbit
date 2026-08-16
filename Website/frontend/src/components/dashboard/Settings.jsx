import React, { useState, useEffect } from 'react';

export default function Settings({ guildId }) {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!guildId) return;
    fetch(`/api/config/${guildId}`)
      .then(res => res.json())
      .then(data => setConfig(data.config))
      .catch(err => console.error(err));
  }, [guildId]);

  const saveSettings = () => {
    setSaving(true);
    fetch(`/api/config/${guildId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: config.settings })
    })
      .then(res => res.json())
      .then(() => alert("Settings saved!"))
      .catch(() => alert("Failed to save settings."))
      .finally(() => setSaving(false));
  };

  if (!config) return <div style={{padding: '50px', textAlign: 'center'}}>Loading settings...</div>;

  return (
    <div className="dash-settings">
      <h1 className="dash-title">Server Settings</h1>
      <p className="dash-subtitle">Configure basic Orbit behavior for this server.</p>

      <div className="dash-card">
        <h3>Manager Roles</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '16px' }}>
          Users with these roles can access this dashboard and configure Orbit, even if they don't have Administrator permissions in Discord.
        </p>
        
        {/* Placeholder for actual role multi-select. In a real app, you'd use a dropdown populated from data.roles */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: 'var(--primary)', fontSize: '14px' }}>
            Current Manager Roles: {config.settings?.manager_roles?.length > 0 ? config.settings.manager_roles.join(", ") : "None"}
          </p>
        </div>

        <button 
          onClick={saveSettings} 
          disabled={saving}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
