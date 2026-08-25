import Toggle from '../../ui/Toggle';
import SaveBar from '../../ui/SaveBar';
import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';

export default function ServerStatsSettings({ config, categories, onSave, saving, onReset }) {
  const ssCfg = config?.serverstats || {};
  console.log('[ServerStats] config received:', JSON.stringify(config?.serverstats, null, 2));

  const [usersEnabled, setUsersEnabled] = useState(ssCfg.users_enabled || false);
  const [usersName, setUsersName] = useState(ssCfg.users_name || 'Users: {count}');
  const [boostsEnabled, setBoostsEnabled] = useState(ssCfg.boosts_enabled || false);
  const [boostsName, setBoostsName] = useState(ssCfg.boosts_name || 'Boosts: {count}');
  const [botsEnabled, setBotsEnabled] = useState(ssCfg.bots_enabled || false);
  const [botsName, setBotsName] = useState(ssCfg.bots_name || 'Bots: {count}');
  const [rolesEnabled, setRolesEnabled] = useState(ssCfg.roles_enabled || false);
  const [rolesName, setRolesName] = useState(ssCfg.roles_name || 'Roles: {count}');
  const [categoryId, setCategoryId] = useState(ssCfg.category_id || '');
  const [categoryName, setCategoryName] = useState(ssCfg.category_name || ' Server Stats');

  const categoryOptions = (categories || []).map(c => ({ value: c.id, label: c.name }));

  const getPayload = () => ({
      serverstats: {
        enabled: ssCfg.enabled || false,
        category_id: categoryId,
        category_name: categoryName,
        users_enabled: usersEnabled,
        users_name: usersName,
        boosts_enabled: boostsEnabled,
        boosts_name: boostsName,
        bots_enabled: botsEnabled,
        bots_name: botsName,
        roles_enabled: rolesEnabled,
        roles_name: rolesName
      }
    });

  const [initialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  const handleSave = () => {
    onSave(getPayload());
  };

  return (
    <div className="dash-settings-module">


      <div className="dash-card settings-card" style={{ padding: '24px' }}>
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '15px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '4px' }}>Category <span style={{ color: '#F23F43' }}>*</span></label>
          <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Category in which the channels will be created</span>
          <CustomSelect options={categoryOptions} value={categoryId} onChange={setCategoryId} placeholder="Select category..." />
        </div>

        {/* Users Toggle */}
        <div style={{ marginBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Users</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Show the total number of users on the server</span>
            </div>
            <Toggle checked={usersEnabled} onChange={() => setUsersEnabled(!usersEnabled)} />
          </div>
          <textarea rows="1"  className="dash-input" value={usersName} onChange={e => setUsersName(e.target.value)} placeholder="Users: {count}" style={{ maxWidth: '400px' }} ></textarea>
        </div>

        {/* Boosts Toggle */}
        <div style={{ marginBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Boosts</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Show the total number of boosts on the server</span>
            </div>
            <Toggle checked={boostsEnabled} onChange={() => setBoostsEnabled(!boostsEnabled)} />
          </div>
          <textarea rows="1"  className="dash-input" value={boostsName} onChange={e => setBoostsName(e.target.value)} placeholder="Boosts: {count}" style={{ maxWidth: '400px' }} ></textarea>
        </div>

        {/* Bots Toggle */}
        <div style={{ marginBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Bots</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Show the total number of bots on the server</span>
            </div>
            <Toggle checked={botsEnabled} onChange={() => setBotsEnabled(!botsEnabled)} />
          </div>
          <textarea rows="1"  className="dash-input" value={botsName} onChange={e => setBotsName(e.target.value)} placeholder="Bots: {count}" style={{ maxWidth: '400px' }} ></textarea>
        </div>

        {/* Roles Toggle */}
        <div style={{ marginBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Roles</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Show the total number of roles on the server</span>
            </div>
            <Toggle checked={rolesEnabled} onChange={() => setRolesEnabled(!rolesEnabled)} />
          </div>
          <textarea rows="1"  className="dash-input" value={rolesName} onChange={e => setRolesName(e.target.value)} placeholder="Roles: {count}" style={{ maxWidth: '400px' }} ></textarea>
        </div>

        <div style={{ marginTop: '32px' }}>
          
        </div>
      </div>
    
      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </div>
  );
}
