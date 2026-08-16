import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function MessageLogsSettings({ config, channels, roles, onSave, saving }) {
  const mlCfg = config?.messagelogs || {};
  const [enabled, setEnabled] = useState(mlCfg.enabled || false);
  const [executorInLogs, setExecutorInLogs] = useState(mlCfg.executor_in_logs || false);
  const [exemptChannels, setExemptChannels] = useState((mlCfg.exempt_channels || []).map(String));
  const [exemptRoles, setExemptRoles] = useState((mlCfg.exempt_roles || []).map(String));

  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));
  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));

  const handleSave = () => {
    onSave({
      messagelogs: {
        enabled,
        executor_in_logs: executorInLogs,
        exempt_channels: exemptChannels,
        exempt_roles: exemptRoles
      }
    });
  };

  // Mock log categories
  const logCategories = [
    {
      title: 'Messages',
      events: ['Message Deleted', 'Message Edited', 'Bulk Messages Deleted']
    },
    {
      title: 'Members',
      events: ['Member Joined', 'Member Left', 'Member Banned', 'Member Kicked', 'Member Timeout']
    },
    {
      title: 'Server',
      events: ['Role Created', 'Role Deleted', 'Role Updated', 'Channel Created', 'Channel Deleted']
    },
    {
      title: 'Voice',
      events: ['Member Joined Voice', 'Member Left Voice', 'Member Moved']
    }
  ];

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Server Logs</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Track and record server activity seamlessly.</p>
          </div>
          <Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '20px' }}>Options</h3>

        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Executor In Logs</label>
            <span className="form-hint" style={{ fontSize: '12px' }}>Logs the person who performed a specific action in the logs (if supported by the API).</span>
          </div>
          <Toggle checked={executorInLogs} onChange={() => setExecutorInLogs(!executorInLogs)} />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '4px' }}>Excluded Channels</label>
          <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Channels where events will not be logged (applies to channels where messages are sent/deleted, etc.).</span>
          <CustomSelect options={channelOptions} value={exemptChannels} onChange={setExemptChannels} isMulti={true} placeholder="Select Channels..." />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '4px' }}>Excluded Roles</label>
          <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Roles whose actions will not be logged.</span>
          <CustomSelect options={roleOptions} value={exemptRoles} onChange={setExemptRoles} isMulti={true} placeholder="Select Roles..." />
        </div>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Log Channels</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {logCategories.map((category, idx) => (
          <div key={idx} className="dash-card settings-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '16px' }}>
              {category.title}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {category.events.map((event, eventIdx) => (
                <div key={eventIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#DBDEE1' }}>{event}</label>
                  <CustomSelect options={channelOptions} placeholder="Select Channel..." />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px' }}>
        <button className="dash-btn primary" style={{ width: '100%', padding: '12px' }} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Log Settings'}</button>
      </div>
    </div>
  );
}
