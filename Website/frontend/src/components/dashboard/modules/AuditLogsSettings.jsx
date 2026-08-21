import Toggle from '../../ui/Toggle';
import SaveBar from '../../ui/SaveBar';
import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';

const LOGS_CATEGORIES = [
    { id: "moderation_action", title: "Moderation Action" },
    { id: "auto_moderation", title: "Auto Moderation" },
    { id: "member_banned", title: "Member Banned" },
    { id: "member_unbanned", title: "Member Unbanned" },
    { id: "member_kicked", title: "Member Kicked" },
    { id: "message_deleted", title: "Message Deleted" },
    { id: "message_edited", title: "Message Edited" },
    { id: "bulk_message_delete", title: "Bulk Message Delete" },
    { id: "member_joined", title: "Member Joined" },
    { id: "member_left", title: "Member Left" },
    { id: "member_joined_voice", title: "Joined Voice Channel" },
    { id: "member_left_voice", title: "Left Voice Channel" },
    { id: "member_moved_voice", title: "Moved Voice Channel" },
    { id: "voice_mute", title: "Voice Muted" },
    { id: "voice_unmute", title: "Voice Unmuted" },
    { id: "voice_deafen", title: "Server Deafened" },
    { id: "voice_undeafen", title: "Server Undeafened" },
    { id: "role_created", title: "Role Created" },
    { id: "role_deleted", title: "Role Deleted" },
    { id: "role_updated", title: "Role Updated" },
    { id: "channel_created", title: "Channel Created" },
    { id: "channel_deleted", title: "Channel Deleted" },
    { id: "channel_updated", title: "Channel Updated" },
    { id: "scheduled_event_created", title: "Event Created" },
    { id: "scheduled_event_deleted", title: "Event Deleted" },
    { id: "scheduled_event_updated", title: "Event Updated" },
    { id: "mod_command_used", title: "Mod Command Used" },
    { id: "invite_tracking", title: "Invite Tracking" },
    { id: "invite_created", title: "Invite Created" }
];

export default function AuditLogsSettings({ config, channels, roles, onSave, saving, onReset }) {
  const logsCfg = config?.logs || {};

    const [executorInLogs, setExecutorInLogs] = useState(logsCfg.executor_in_logs || false);
  const [exemptChannels, setExemptChannels] = useState((logsCfg.global_exempt_channels || []).map(String));
  const [exemptRoles, setExemptRoles] = useState((logsCfg.global_exempt_roles || []).map(String));

  // Per-category state: { category_id: { enabled, channel, role } }
  const [catState, setCatState] = useState(() => {
    const state = {};
    LOGS_CATEGORIES.forEach(cat => {
      state[cat.id] = {
        enabled: logsCfg.categories?.[cat.id] || false,
        channel: logsCfg.channels?.[cat.id] || '',
        role: logsCfg.roles?.[cat.id] || ''
      };
    });
    return state;
  });

  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));
  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));

  const updateCat = (catId, key, value) => {
    setCatState(prev => ({ ...prev, [catId]: { ...prev[catId], [key]: value } }));
  };

  const getPayload = () => {
    const catChannels = {};
    const catRoles = {};
    const catEnabled = {};
    LOGS_CATEGORIES.forEach(cat => {
      catChannels[cat.id] = catState[cat.id].channel || null;
      catRoles[cat.id] = catState[cat.id].role || null;
      catEnabled[cat.id] = catState[cat.id].enabled;
    });

    return {
      logs: {
        enabled: logsCfg.enabled || false,
        executor_in_logs: executorInLogs,
        global_exempt_channels: exemptChannels,
        global_exempt_roles: exemptRoles,
        channels: catChannels,
        roles: catRoles,
        categories: catEnabled
      }
    };
  };

  const [initialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  const handleSave = () => {
    onSave(getPayload());
  };

  return (
    <div className="dash-settings-module">


      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Global Options</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label style={{ margin: 0, color: '#fff' }}>Executor In Logs</label>
              <span className="form-hint" style={{ display: 'block', fontSize: '12px' }}>Logs the person who performed a specific action in the logs.</span>
            </div>
            <Toggle checked={executorInLogs} onChange={() => setExecutorInLogs(!executorInLogs)} />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Excluded Channels</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Channels where events will not be logged.</span>
            <CustomSelect options={channelOptions} value={exemptChannels} onChange={setExemptChannels} isMulti placeholder="Select channels..." />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Excluded Roles</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Roles whose actions will not be logged.</span>
            <CustomSelect options={roleOptions} value={exemptRoles} onChange={setExemptRoles} isMulti placeholder="Select roles..." />
          </div>

        </div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px', marginTop: '24px' }}>Log Channels</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {LOGS_CATEGORIES.map(cat => (
          <div key={cat.id} className="dash-card settings-card" style={{ padding: '16px', background: 'var(--bg-elevated)' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{cat.title}</span>
              </div>
              <Toggle checked={catState[cat.id].enabled} onChange={() => updateCat(cat.id, 'enabled', !catState[cat.id].enabled)} />
            </div>
            
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Log Channel</label>
              <CustomSelect options={channelOptions} value={catState[cat.id].channel} onChange={v => updateCat(cat.id, 'channel', v)} placeholder="Select channel..." />
            </div>
            
            <div className="form-group">
              <label style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Ping Role</label>
              <CustomSelect options={roleOptions} value={catState[cat.id].role} onChange={v => updateCat(cat.id, 'role', v)} placeholder="Select role..." />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '32px' }}>
        
      </div>
      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </div>
  );
}
