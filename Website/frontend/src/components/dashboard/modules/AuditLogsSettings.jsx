import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

const LOGS_CATEGORIES = [
    { id: "moderation_action", title: "Moderation Action", icon: "shield" },
    { id: "auto_moderation", title: "Auto Moderation", icon: "bot" },
    { id: "member_banned", title: "Member Banned", icon: "hammer" },
    { id: "member_unbanned", title: "Member Unbanned", icon: "check-circle" },
    { id: "member_kicked", title: "Member Kicked", icon: "user-minus" },
    { id: "message_deleted", title: "Message Deleted", icon: "trash-2" },
    { id: "message_edited", title: "Message Edited", icon: "edit-2" },
    { id: "bulk_message_delete", title: "Bulk Message Delete", icon: "trash" },
    { id: "member_joined", title: "Member Joined", icon: "user-plus" },
    { id: "member_left", title: "Member Left", icon: "user-minus" },
    { id: "member_joined_voice", title: "Joined Voice Channel", icon: "mic" },
    { id: "member_left_voice", title: "Left Voice Channel", icon: "mic-off" },
    { id: "member_moved_voice", title: "Moved Voice Channel", icon: "headphones" },
    { id: "voice_mute", title: "Voice Muted", icon: "volume-x" },
    { id: "voice_unmute", title: "Voice Unmuted", icon: "volume-2" },
    { id: "voice_deafen", title: "Server Deafened", icon: "ear-off" },
    { id: "voice_undeafen", title: "Server Undeafened", icon: "ear" },
    { id: "role_created", title: "Role Created", icon: "plus-circle" },
    { id: "role_deleted", title: "Role Deleted", icon: "minus-circle" },
    { id: "role_updated", title: "Role Updated", icon: "settings" },
    { id: "channel_created", title: "Channel Created", icon: "folder-plus" },
    { id: "channel_deleted", title: "Channel Deleted", icon: "folder-minus" },
    { id: "channel_updated", title: "Channel Updated", icon: "refresh-cw" },
    { id: "scheduled_event_created", title: "Event Created", icon: "calendar-plus" },
    { id: "scheduled_event_deleted", title: "Event Deleted", icon: "calendar-minus" },
    { id: "scheduled_event_updated", title: "Event Updated", icon: "calendar" },
    { id: "mod_command_used", title: "Mod Command Used", icon: "terminal" },
    { id: "invite_tracking", title: "Invite Tracking", icon: "link" },
    { id: "invite_created", title: "Invite Created", icon: "link-2" }
];

// Simple icon mapper to keep it clean (placeholder SVG for all since lucide isn't available as components here yet)
const getIcon = (name) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export default function AuditLogsSettings() {
  const channelOptions = [
    { value: '1', label: '# general' },
    { value: '2', label: '# bot-logs' },
  ];
  
  const roleOptions = [
    { value: '1', label: '@ admin' },
    { value: '2', label: '@ mod' },
  ];

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Server Logs</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Track and record server activity seamlessly.</p>
          </div>
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Global Options</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label style={{ margin: 0, color: '#fff' }}>Executor In Logs</label>
              <span className="form-hint" style={{ display: 'block', fontSize: '12px' }}>Logs the person who performed a specific action in the logs.</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Excluded Channels</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Channels where events will not be logged.</span>
            <CustomSelect options={channelOptions} isMulti placeholder="Select channels..." />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Excluded Roles</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Roles whose actions will not be logged.</span>
            <CustomSelect options={roleOptions} isMulti placeholder="Select roles..." />
          </div>

        </div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px', marginTop: '24px' }}>Log Channels</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {LOGS_CATEGORIES.map(cat => (
          <div key={cat.id} className="dash-card settings-card" style={{ padding: '16px', background: 'var(--bg-elevated)' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                <span style={{ color: 'var(--accent-primary)', display: 'flex' }}>
                  {getIcon(cat.icon)}
                </span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{cat.title}</span>
              </div>
              <Toggle defaultChecked={false} />
            </div>
            
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Log Channel</label>
              <CustomSelect options={channelOptions} placeholder="Select channel..." />
            </div>
            
            <div className="form-group">
              <label style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Ping Role</label>
              <CustomSelect options={roleOptions} placeholder="Select role..." />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '32px' }}>
        <button className="dash-btn primary" style={{ width: '100%', padding: '12px' }}>Save Log Settings</button>
      </div>
    </div>
  );
}
