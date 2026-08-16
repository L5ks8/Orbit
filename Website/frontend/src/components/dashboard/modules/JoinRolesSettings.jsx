import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function JoinRolesSettings() {
  const [enabled, setEnabled] = useState(false);

  const roleOptions = [
    { value: '1', label: '@ Member' },
    { value: '2', label: '@ Bot' },
    { value: '3', label: '@ DJ' }
  ];

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
          <CustomSelect options={roleOptions} isMulti={true} placeholder="Select Roles..." />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '4px' }}>Bot Roles</label>
          <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Roles given to new bots automatically.</span>
          <CustomSelect options={roleOptions} isMulti={true} placeholder="Select Roles..." />
        </div>
      </div>
    </div>
  );
}
