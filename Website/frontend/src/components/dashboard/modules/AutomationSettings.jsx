import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function AutomationSettings({ config, channels, roles, onSave, saving }) {
  const autCfg = config?.automation || {};
  
  // States for dynamic lists
  const [fileChannels, setFileChannels] = useState(autCfg.file_channels || []);
  const [reactionChannels, setReactionChannels] = useState(autCfg.reaction_channels || []);
  const [mediaChannels, setMediaChannels] = useState((autCfg.media_only_channels || []).map(String));
  const [cmdChannels, setCmdChannels] = useState((autCfg.command_only_channels || []).map(String));
  const [honeypotChannel, setHoneypotChannel] = useState(autCfg.honeypot_channel_id || '');
  const [honeypotExemptRoles, setHoneypotExemptRoles] = useState((autCfg.honeypot_exempt_roles || []).map(String));
  const [honeypotMsg, setHoneypotMsg] = useState(autCfg.honeypot_message || '');
  const [countingEnabled, setCountingEnabled] = useState(autCfg.counting_enabled || false);
  const [countingChannel, setCountingChannel] = useState(autCfg.counting_channel_id || '');
  const [countingWhitelistRoles, setCountingWhitelistRoles] = useState((autCfg.counting_whitelist_roles || []).map(String));
  const [soloCount, setSoloCount] = useState(autCfg.solo_counting !== false);
  const [mediaBotIgnore, setMediaBotIgnore] = useState(autCfg.media_ignore_bots || false);

  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));
  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));

  const handleSave = () => {
    onSave({
      automation: {
        media_only_channels: mediaChannels,
        command_only_channels: cmdChannels,
        media_ignore_bots: mediaBotIgnore,
        honeypot_channel_id: honeypotChannel,
        honeypot_exempt_roles: honeypotExemptRoles,
        honeypot_message: honeypotMsg,
        file_channels: fileChannels,
        reaction_channels: reactionChannels,
        counting_enabled: countingEnabled,
        counting_channel_id: countingChannel,
        counting_whitelist_roles: countingWhitelistRoles,
        solo_counting: soloCount
      }
    });
  };

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Channel Automation</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Manage automated actions for specific channels.</p>
          </div>
          
        </div>
      </div>
      
      {/* Media & Command Only */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="dash-card settings-card" style={{ padding: '20px' }}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ color: '#fff', fontSize: '15px' }}>Media-Only Channels</label>
            <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Channels where only images, GIFs, and videos can be posted.</span>
            <CustomSelect options={channelOptions} isMulti={true} placeholder="Select Channels..." />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Ignore Bots</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Do not enforce media restriction on messages from bots.</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
        </div>

        <div className="dash-card settings-card" style={{ padding: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ color: '#fff', fontSize: '15px' }}>Command-Only Channels</label>
            <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Channels where regular text messages are deleted to keep chat clean.</span>
            <CustomSelect options={channelOptions} isMulti={true} placeholder="Select Channels..." />
          </div>
        </div>
      </div>

      {/* Auto Ban Channel */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '15px', fontWeight: '600', color: '#EF4444', display: 'block', marginBottom: '4px' }}>Auto Ban Channel (Honeypot)</label>
          <span className="form-hint" style={{ fontSize: '12px', display: 'block' }}>Users posting in this channel will be immediately banned. Ideal for catching compromised accounts.</span>
        </div>
        
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label style={{ color: '#fff' }}>Honeypot Channel</label>
          <CustomSelect options={channelOptions} placeholder="Select Channel..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ color: '#fff' }}>Exempt Roles</label>
            <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Members with these roles will not be banned.</span>
            <CustomSelect options={roleOptions} isMulti={true} placeholder="Select Roles..." />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ color: '#fff' }}>Exempt User IDs</label>
            <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Specific user IDs who will not be banned (comma-separated).</span>
            <input type="text" className="dash-input" placeholder="e.g. 123456789, 987654321" />
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ color: '#fff' }}>Honeypot Warning Message</label>
          <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>The warning message sent by the bot. You can use {'{count}'} to display the number of banned accounts.</span>
          <textarea className="dash-input" style={{ width: '100%', height: '120px', resize: 'vertical', marginBottom: '12px' }} placeholder="# ⚠️ POSTING IN THIS CHANNEL WILL GET YOU BANNED..."></textarea>
          <button className="dash-btn primary">Send Message to Channel</button>
        </div>
      </div>

      {/* File Only Channels */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>File-Only Channels</h3>
        <p className="form-hint" style={{ fontSize: '12px', marginBottom: '16px' }}>Channels where only files can be uploaded.</p>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr auto', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', fontWeight: '600', color: '#949BA4', gap: '16px' }}>
            <span>Channel</span>
            <span>Allowed Extensions</span>
            <span>Ignore Bots</span>
            <span>Action</span>
          </div>
          {fileChannels.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#949BA4', fontSize: '13px' }}>
              No File-Channels found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {fileChannels.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr auto', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '16px', alignItems: 'center' }}>
                  <CustomSelect options={channelOptions} placeholder="Select Channel..." />
                  <input type="text" className="dash-input" placeholder="e.g. png, jpg, pdf" />
                  <Toggle defaultChecked={false} />
                  <button onClick={() => setFileChannels(fileChannels.filter((_, idx) => idx !== i))} className="dash-btn danger" style={{ padding: '8px 12px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setFileChannels([...fileChannels, {}])} className="dash-btn primary">+ Add File-Channel</button>
      </div>

      {/* Auto-Reaction Channels */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>Auto-Reaction Channels</h3>
        <p className="form-hint" style={{ fontSize: '12px', marginBottom: '16px' }}>Automatically add a reaction to messages in specific channels.</p>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', fontWeight: '600', color: '#949BA4', gap: '16px' }}>
            <span>Channel</span>
            <span>Emoji</span>
            <span>Ignore Bots</span>
            <span>Action</span>
          </div>
          {reactionChannels.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#949BA4', fontSize: '13px' }}>
              No Reaction-Channels found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {reactionChannels.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '16px', alignItems: 'center' }}>
                  <CustomSelect options={channelOptions} placeholder="Select Channel..." />
                  <input type="text" className="dash-input" placeholder="e.g. 👍" />
                  <Toggle defaultChecked={false} />
                  <button onClick={() => setReactionChannels(reactionChannels.filter((_, idx) => idx !== i))} className="dash-btn danger" style={{ padding: '8px 12px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setReactionChannels([...reactionChannels, {}])} className="dash-btn primary">+ Add Reaction-Channel</button>
      </div>

      {/* Counting Channel */}
      <div className="dash-card settings-card" style={{ padding: '20px' }}>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '15px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '4px' }}>Counting Channel</label>
            <span className="form-hint" style={{ fontSize: '12px' }}>Enforce consecutive number counting. Messing up locks the channel and resets count to 0.</span>
          </div>
          <Toggle defaultChecked={false} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ color: '#fff' }}>Counting Channel</label>
            <CustomSelect options={channelOptions} placeholder="Select Channel..." />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ color: '#fff' }}>Whitelisted Roles</label>
            <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Members with these roles can chat without breaking count.</span>
            <CustomSelect options={roleOptions} isMulti={true} placeholder="Select Roles..." />
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Allow Solo Counting</label>
            <span className="form-hint" style={{ fontSize: '12px' }}>Allow the same user to count consecutive numbers in a row.</span>
          </div>
          <Toggle defaultChecked={true} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff', display: 'block', marginBottom: '4px' }}>
              Current Count: <span style={{ color: '#5865F2' }}>0</span>
            </span>
            <span style={{ fontSize: '12px', color: '#949BA4' }}>Next number expected: 1</span>
          </div>
          <button className="dash-btn secondary" style={{ fontSize: '12px', padding: '8px 16px' }}>Reset Count to 0</button>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button className="dash-btn primary" style={{ width: '100%', padding: '12px' }} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Automation Settings'}</button>
      </div>
    </div>
  );
}
