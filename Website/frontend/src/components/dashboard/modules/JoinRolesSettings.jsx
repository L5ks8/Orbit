import SaveBar from '../../ui/SaveBar';
import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';
import Toggle from '../../ui/Toggle';

export default function JoinRolesSettings({ config, roles, onSave, saving, onReset }) {
  const jrCfg = config?.joinroles || {};

  const [userRolesEnabled, setUserRolesEnabled] = useState(jrCfg.user_roles_enabled || false);
  const [userRoles, setUserRoles] = useState((jrCfg.user_roles || []).map(String));
  
  const [botRolesEnabled, setBotRolesEnabled] = useState(jrCfg.bot_roles_enabled || false);
  const [botRoles, setBotRoles] = useState((jrCfg.bot_roles || []).map(String));

  const [tagRolesEnabled, setTagRolesEnabled] = useState(jrCfg.tag_roles_enabled || false);
  const [tagRole, setTagRole] = useState(jrCfg.tag_role ? String(jrCfg.tag_role) : null);

  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));
  const singleRoleOptions = [...roleOptions];

  const getPayload = () => ({
      joinroles: {
        enabled: jrCfg.enabled || false,
        user_roles_enabled: userRolesEnabled,
        user_roles: userRoles,
        bot_roles_enabled: botRolesEnabled,
        bot_roles: botRoles,
        tag_roles_enabled: tagRolesEnabled,
        tag_role: tagRole
      }
    });

  const [initialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  const handleSave = () => {
    onSave(getPayload());
  };

  return (
    <div className="dash-settings-module">

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>User Roles</h3>
            <span className="form-hint" style={{ fontSize: '13px' }}>Roles given to new members automatically upon joining.</span>
          </div>
          <Toggle checked={userRolesEnabled} onChange={(e) => setUserRolesEnabled(e.target.checked)} />
        </div>
        
        {userRolesEnabled && (
          <div className="form-group" style={{ margin: 0 }}>
            <CustomSelect options={roleOptions} value={userRoles} onChange={setUserRoles} isMulti={true} placeholder="Select Roles..." />
          </div>
        )}
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>Bot Roles</h3>
            <span className="form-hint" style={{ fontSize: '13px' }}>Roles given to new bots automatically upon joining.</span>
          </div>
          <Toggle checked={botRolesEnabled} onChange={(e) => setBotRolesEnabled(e.target.checked)} />
        </div>
        
        {botRolesEnabled && (
          <div className="form-group" style={{ margin: 0 }}>
            <CustomSelect options={roleOptions} value={botRoles} onChange={setBotRoles} isMulti={true} placeholder="Select Roles..." />
          </div>
        )}
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>Tag Roles</h3>
            <span className="form-hint" style={{ fontSize: '13px' }}>If a user wears the Server Tag, they automatically receive this role.</span>
          </div>
          <Toggle checked={tagRolesEnabled} onChange={(e) => setTagRolesEnabled(e.target.checked)} />
        </div>
        
        {tagRolesEnabled && (
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '8px' }}>Assigned Role</label>
            <CustomSelect options={singleRoleOptions} value={tagRole} onChange={setTagRole} isMulti={false} placeholder="Select Role..." />
          </div>
        )}
      </div>
    
      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </div>
  );
}
