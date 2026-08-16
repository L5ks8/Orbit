import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function JoinRolesSettings({ config, roles, onSave, saving }) {
  const jrCfg = config?.joinroles || {};

  const [enabled, setEnabled] = useState(jrCfg.enabled || false);
  const [userRoles, setUserRoles] = useState((jrCfg.user_roles || []).map(String));
  const [botRoles, setBotRoles] = useState((jrCfg.bot_roles || []).map(String));

  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));

  const handleSave = () => {
    onSave({
      joinroles: {
        enabled,
        user_roles: userRoles,
        bot_roles: botRoles
      }
    });
  };

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Auto-Roles</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Automatically assign roles when users or bots join.</p>
          </div>
          <Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Roles on Join</h3>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '4px' }}>User Roles</label>
          <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Roles given to new members automatically.</span>
          <CustomSelect options={roleOptions} value={userRoles} onChange={setUserRoles} isMulti={true} placeholder="Select Roles..." />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '4px' }}>Bot Roles</label>
          <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Roles given to new bots automatically.</span>
          <CustomSelect options={roleOptions} value={botRoles} onChange={setBotRoles} isMulti={true} placeholder="Select Roles..." />
        </div>

        <div className="settings-footer" style={{ marginTop: '24px' }}>
          <button className="dash-btn primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
        </div>
      </div>
    </div>
  );
}
