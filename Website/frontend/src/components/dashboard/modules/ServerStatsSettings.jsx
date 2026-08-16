import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function ServerStatsSettings() {
  const [enabled, setEnabled] = useState(false);

  const categoryOptions = [
    { value: '1', label: 'SERVER STATS' },
    { value: '2', label: 'IMPORTANT' }
  ];

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Server Stats</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Select Server Data to display in voice channels.</p>
          </div>
          <Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '24px' }}>
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '15px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '4px' }}>Category <span style={{ color: '#F23F43' }}>*</span></label>
          <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Category in which the channels will be created</span>
          <CustomSelect options={categoryOptions} placeholder="Select category..." />
        </div>

        {/* Users Toggle */}
        <div style={{ marginBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Users</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Show the total number of users on the server</span>
            </div>
            <Toggle defaultChecked={true} />
          </div>
          <input type="text" className="dash-input" placeholder="Users: {count}" defaultValue="Users: {count}" style={{ maxWidth: '400px' }} />
        </div>

        {/* Boosts Toggle */}
        <div style={{ marginBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Boosts</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Show the total number of boosts on the server</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          <input type="text" className="dash-input" placeholder="Boosts: {count}" defaultValue="Boosts: {count}" style={{ maxWidth: '400px' }} />
        </div>

        {/* Bots Toggle */}
        <div style={{ marginBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Bots</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Show the total number of bots on the server</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          <input type="text" className="dash-input" placeholder="Bots: {count}" defaultValue="Bots: {count}" style={{ maxWidth: '400px' }} />
        </div>

        {/* Roles Toggle */}
        <div style={{ marginBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Roles</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Show the total number of roles on the server</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          <input type="text" className="dash-input" placeholder="Roles: {count}" defaultValue="Roles: {count}" style={{ maxWidth: '400px' }} />
        </div>

        <div style={{ marginTop: '32px' }}>
          <button className="dash-btn primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Create Channels
          </button>
        </div>
      </div>
    </div>
  );
}
