import Toggle from '../../ui/Toggle';
import SaveBar from '../../ui/SaveBar';
import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';

export default function LevelingSystemSettings({ config, channels, roles, onSave, saving, onReset }) {
  const lvlCfg = config?.level || {};
  // Local state for tabs and inputs to make the UI interactive
  const [statTab, setStatTab] = useState('messages'); // 'messages', 'voice', 'reactions'
  const [levelUpMode, setLevelUpMode] = useState(lvlCfg.level_up_mode || 'blacklist');
  const [levelRoleMode, setLevelRoleMode] = useState(lvlCfg.level_role_mode || 'blacklist');
  const [levelRoles, setLevelRoles] = useState(lvlCfg.level_roles || []);
  const [statRoles, setStatRoles] = useState(lvlCfg.stat_roles || []);
  const [msgXpEnabled, setMsgXpEnabled] = useState(lvlCfg.msg_xp_enabled !== false);
  const [voiceXpEnabled, setVoiceXpEnabled] = useState(lvlCfg.voice_xp_enabled || false);
  const [reactionXpEnabled, setReactionXpEnabled] = useState(lvlCfg.reaction_xp_enabled || false);
  

  const [msgXpAmount, setMsgXpAmount] = useState(lvlCfg.msg_xp_amount || 20);
  const [msgXpCooldown, setMsgXpCooldown] = useState(lvlCfg.msg_xp_cooldown || 60);
  
  const [voiceXpAmount, setVoiceXpAmount] = useState(lvlCfg.voice_xp_amount || 6);
  const [voiceXpIgnoreMuted, setVoiceXpIgnoreMuted] = useState(lvlCfg.voice_xp_ignore_muted !== false);
  const [voiceXpIgnoreSolo, setVoiceXpIgnoreSolo] = useState(lvlCfg.voice_xp_ignore_solo || false);
  
  const [cmdXpEnabled, setCmdXpEnabled] = useState(lvlCfg.cmd_xp_enabled !== false);
  const [cmdXpAmount, setCmdXpAmount] = useState(lvlCfg.cmd_xp_amount || 15);
  const [cmdXpCooldown, setCmdXpCooldown] = useState(lvlCfg.cmd_xp_cooldown || 60);
  
  const [reactXpEnabled, setReactXpEnabled] = useState(lvlCfg.react_xp_enabled !== false);
  const [reactXpAmount, setReactXpAmount] = useState(lvlCfg.react_xp_amount || 15);
  const [reactXpCooldown, setReactXpCooldown] = useState(lvlCfg.react_xp_cooldown || 300);
  
  const [resetOnLeave, setResetOnLeave] = useState(lvlCfg.reset_on_leave || false);
  const [resetOnBan, setResetOnBan] = useState(lvlCfg.reset_on_ban || false);
  const [voteBoost, setVoteBoost] = useState(lvlCfg.vote_boost !== false);
  const [xpMultiplier, setXpMultiplier] = useState(lvlCfg.xp_multiplier || 1.0);
  
  const [blockedChannels, setBlockedChannels] = useState(lvlCfg.blocked_channels || []);
  const [blockedRoles, setBlockedRoles] = useState(lvlCfg.blocked_roles || []);
  
  const [levelupChannel, setLevelupChannel] = useState(lvlCfg.levelup_channel || 'current');
  const [leaderboardUrl, setLeaderboardUrl] = useState(lvlCfg.leaderboard_url || '');
  const [leaderboardChannel, setLeaderboardChannel] = useState(lvlCfg.leaderboard_channel || '');
  const [leaderboardColor, setLeaderboardColor] = useState(lvlCfg.leaderboard_color || '#3B82F6');
  
  const [levelupMessageContent, setLevelupMessageContent] = useState(lvlCfg.levelup_message_content || '{user_mention}');
  const [levelupEmbedAuthor, setLevelupEmbedAuthor] = useState(lvlCfg.levelup_embed_author || '');
  const [levelupEmbedTitle, setLevelupEmbedTitle] = useState(lvlCfg.levelup_embed_title || 'Level Up!');
  const [levelupEmbedDescription, setLevelupEmbedDescription] = useState(lvlCfg.levelup_embed_description || '');
  const [levelupEmbedFooter, setLevelupEmbedFooter] = useState(lvlCfg.levelup_embed_footer || '');
  const [levelupEmbedImage, setLevelupEmbedImage] = useState(lvlCfg.levelup_embed_image || '');
  const [levelupShowAvatar, setLevelupShowAvatar] = useState(lvlCfg.levelup_show_avatar !== false);
  const [levelupConditional, setLevelupConditional] = useState(lvlCfg.levelup_conditional || '');

  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));
  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));

  const getPayload = () => ({
      level: {
        level_up_mode: levelUpMode,
        level_role_mode: levelRoleMode,
        level_roles: levelRoles,
        stat_roles: statRoles,
        msg_xp_enabled: msgXpEnabled,
        voice_xp_enabled: voiceXpEnabled,
        reaction_xp_enabled: reactionXpEnabled,
        msg_xp_amount: parseInt(msgXpAmount),
        msg_xp_cooldown: parseInt(msgXpCooldown),
        voice_xp_amount: parseInt(voiceXpAmount),
        voice_xp_ignore_muted: voiceXpIgnoreMuted,
        voice_xp_ignore_solo: voiceXpIgnoreSolo,
        cmd_xp_enabled: cmdXpEnabled,
        cmd_xp_amount: parseInt(cmdXpAmount),
        cmd_xp_cooldown: parseInt(cmdXpCooldown),
        react_xp_amount: parseInt(reactXpAmount),
        react_xp_cooldown: parseInt(reactXpCooldown),
        reset_on_leave: resetOnLeave,
        reset_on_ban: resetOnBan,
        vote_boost: voteBoost,
        xp_multiplier: parseFloat(xpMultiplier),
        blocked_channels: blockedChannels,
        blocked_roles: blockedRoles,
        levelup_channel: levelupChannel,
        leaderboard_url: leaderboardUrl,
        leaderboard_channel: leaderboardChannel,
        leaderboard_color: leaderboardColor,
        levelup_message_content: levelupMessageContent,
        levelup_embed_author: levelupEmbedAuthor,
        levelup_embed_title: levelupEmbedTitle,
        levelup_embed_description: levelupEmbedDescription,
        levelup_embed_footer: levelupEmbedFooter,
        levelup_embed_image: levelupEmbedImage,
        levelup_show_avatar: levelupShowAvatar,
        levelup_conditional: levelupConditional
      }
    });

  const [initialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  const handleSave = () => {
    onSave(getPayload());
  };

  return (
    <div className="dash-settings-module">


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Message XP Card */}
        <div className="dash-card settings-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Message XP</h3>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Message XP Enabled</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Should members earn XP for sending messages?</span>
            </div>
            <Toggle checked={msgXpEnabled} onChange={() => setMsgXpEnabled(!msgXpEnabled)} />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ color: '#fff' }}>Message XP Amount</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Amount of XP per message.</span>
            <input type="number" className="dash-input" value={msgXpAmount} onChange={e => setMsgXpAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Message Cooldown</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Cooldown in seconds between messages.</span>
            <input type="number" className="dash-input" value={msgXpCooldown} onChange={e => setMsgXpCooldown(e.target.value)} />
          </div>
        </div>

        {/* Voice XP Card */}
        <div className="dash-card settings-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Voice XP</h3>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Voice XP Enabled</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Should members earn XP while in a voice channel?</span>
            </div>
            <Toggle checked={voiceXpEnabled} onChange={() => setVoiceXpEnabled(!voiceXpEnabled)} />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Ignore Muted/Deafened</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Ignore members who are muted or deafened.</span>
            </div>
            <Toggle checked={voiceXpIgnoreMuted} onChange={() => setVoiceXpIgnoreMuted(!voiceXpIgnoreMuted)} />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Ignore Solo Members</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Ignore members alone in a voice channel.</span>
            </div>
            <Toggle checked={voiceXpIgnoreSolo} onChange={() => setVoiceXpIgnoreSolo(!voiceXpIgnoreSolo)} />
          </div>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Voice XP Amount</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Amount of XP per minute in voice channels.</span>
            <input type="number" className="dash-input" value={voiceXpAmount} onChange={e => setVoiceXpAmount(e.target.value)} />
          </div>
        </div>

        {/* Command XP Card */}
        <div className="dash-card settings-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Command XP</h3>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Command XP Enabled</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Should members earn XP for using commands?</span>
            </div>
            <Toggle checked={cmdXpEnabled} onChange={() => setCmdXpEnabled(!cmdXpEnabled)} />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ color: '#fff' }}>Command XP Amount</label>
            <input type="number" className="dash-input" value={cmdXpAmount} onChange={e => setCmdXpAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Command Cooldown</label>
            <input type="number" className="dash-input" value={cmdXpCooldown} onChange={e => setCmdXpCooldown(e.target.value)} />
          </div>
        </div>

        {/* Reaction XP Card */}
        <div className="dash-card settings-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Reaction XP</h3>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Reaction XP Enabled</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Earn XP when adding reactions to messages.</span>
            </div>
            <Toggle checked={reactXpEnabled} onChange={() => setReactXpEnabled(!reactXpEnabled)} />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ color: '#fff' }}>Reaction XP Amount</label>
            <input type="number" className="dash-input" value={reactXpAmount} onChange={e => setReactXpAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Reaction Cooldown</label>
            <input type="number" className="dash-input" value={reactXpCooldown} onChange={e => setReactXpCooldown(e.target.value)} />
          </div>
        </div>
      </div>

      {/* XP Options */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>XP Options</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Reset XP on Leave</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Members lose XP when leaving.</span>
            </div>
            <Toggle checked={resetOnLeave} onChange={() => setResetOnLeave(!resetOnLeave)} />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Reset XP on Ban</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Members lose XP when banned.</span>
            </div>
            <Toggle checked={resetOnBan} onChange={() => setResetOnBan(!resetOnBan)} />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Vote Boost</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>XP boost for voting for Orbit.</span>
            </div>
            <Toggle checked={voteBoost} onChange={() => setVoteBoost(!voteBoost)} />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label style={{ color: '#fff' }}>Multiplier</label>
          <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Global multiplier for all earned XP.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input type="range" min="0.1" max="5" step="0.05" value={xpMultiplier} onChange={e => setXpMultiplier(e.target.value)} style={{ flex: 1, accentColor: '#fff' }} />
            <span style={{ fontWeight: '600', minWidth: '50px', textAlign: 'right', color: '#fff' }}>{`x${parseFloat(xpMultiplier || 1).toFixed(2)}`}</span>
          </div>
        </div>
      </div>

      {/* Channels & Roles */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Channels & Roles Restrictions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Blocked XP Channels</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button className={`dash-btn ${levelUpMode === 'blacklist' ? 'primary' : 'secondary'}`} onClick={() => setLevelUpMode('blacklist')}>Blacklist</button>
              <button className={`dash-btn ${levelUpMode === 'whitelist' ? 'primary' : 'secondary'}`} onClick={() => setLevelUpMode('whitelist')}>Whitelist</button>
            </div>
            <CustomSelect options={channelOptions} isMulti placeholder="Select channels..." value={blockedChannels} onChange={setBlockedChannels} />
          </div>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Blocked XP Roles</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button className="dash-btn primary">Blacklist</button>
              <button className="dash-btn secondary">Whitelist</button>
            </div>
            <CustomSelect options={roleOptions} isMulti placeholder="Select roles..." value={blockedRoles} onChange={setBlockedRoles} />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label style={{ color: '#fff' }}>Level Up Channel</label>
          <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Channel where level up messages are sent.</span>
          <CustomSelect options={[{ value: 'current', label: 'Current Channel' }, ...channelOptions]} value={levelupChannel} onChange={setLevelupChannel} />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Leaderboard</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Custom URL</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>The custom URL for the leaderboard. Must be unique.</span>
            <input type="text" className="dash-input" value={leaderboardUrl} onChange={e => setLeaderboardUrl(e.target.value)} placeholder="my-server" />
          </div>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Auto Leaderboard Channel</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Automatically updated every hour.</span>
            <CustomSelect options={channelOptions} value={leaderboardChannel} onChange={setLeaderboardChannel} placeholder="Select Channel..." />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label style={{ color: '#fff' }}>Embed Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <input type="color" value={leaderboardColor} onChange={e => setLeaderboardColor(e.target.value)} style={{ width: '44px', height: '38px', borderRadius: '4px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }} />
            <input type="text" className="dash-input" value={leaderboardColor} onChange={e => setLeaderboardColor(e.target.value)} style={{ width: '100px' }} />
          </div>
        </div>
      </div>

      {/* Level Up Message */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginTop: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 }}>Level Up Message</h3>
          <button className="dash-btn secondary">Test Message</button>
        </div>
        
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ color: '#fff' }}>Conditional Message</label>
          <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Conditional scripts: {'{earned: Text}'} (any role earned), {'{level[X]: Text}'} (only Level X).</span>
          <input type="text" className="dash-input" value={levelupConditional} onChange={e => setLevelupConditional(e.target.value)} placeholder="{earned: You earned {roles}!} {level[10]: Milestone Level 10!}" />
        </div>

        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Show Avatar in Thumbnail</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Display user avatar in the embed thumbnail.</span>
            </div>
          <Toggle checked={levelupShowAvatar} onChange={() => setLevelupShowAvatar(!levelupShowAvatar)} />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ color: '#fff' }}>Message Content</label>
          <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Text outside the embed (e.g. {'{user_mention}'}).</span>
          <input type="text" className="dash-input" value={levelupMessageContent} onChange={e => setLevelupMessageContent(e.target.value)} />
        </div>

        <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <label style={{ color: '#fff' }}>Embed Builder</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            <input type="text" className="dash-input" placeholder="Author Name" />
            <input type="text" className="dash-input" defaultValue="Level Up!" placeholder="Title" />
            <textarea className="dash-input" rows="3" defaultValue="Congratulations **{user_globalname}**!\nYou reached **Level {level}**." placeholder="Description"></textarea>
            <input type="text" className="dash-input" value={levelupEmbedImage} onChange={e => setLevelupEmbedImage(e.target.value)} placeholder="Image URL" />
            <input type="text" className="dash-input" placeholder="Footer Text" />
          </div>
        </div>
      </div>

      {/* Level Roles */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Level Roles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Stack Roles</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Keep roles below their level.</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Re-add on Rejoin</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Get role back when rejoining.</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', fontWeight: '600', color: '#949BA4', gap: '16px' }}>
            <span>Level</span>
            <span>Role</span>
            <span>Action</span>
          </div>
          {levelRoles.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#949BA4', fontSize: '13px' }}>
              No rewards configured.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {levelRoles.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '16px', alignItems: 'center' }}>
                  <input type="number" className="dash-input" placeholder="Level (e.g. 10)" />
                  <CustomSelect options={[{value: '1', label: '@ Elite'}]} placeholder="Select Role..." />
                  <button onClick={() => setLevelRoles(levelRoles.filter((_, idx) => idx !== i))} className="dash-btn danger" style={{ padding: '8px 12px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setLevelRoles([...levelRoles, {}])} className="dash-btn primary">+ Add Role</button>
      </div>

      {/* Stat Roles */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Stat Roles</h3>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button className={`dash-btn ${statTab === 'messages' ? 'primary' : 'secondary'}`} onClick={() => setStatTab('messages')}>Messages</button>
          <button className={`dash-btn ${statTab === 'voice' ? 'primary' : 'secondary'}`} onClick={() => setStatTab('voice')}>Voice Hours</button>
          <button className={`dash-btn ${statTab === 'reactions' ? 'primary' : 'secondary'}`} onClick={() => setStatTab('reactions')}>Reactions</button>
        </div>

        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Stack Stat Roles</label>
            <span className="form-hint" style={{ fontSize: '12px' }}>Keep stat roles below count.</span>
          </div>
          <Toggle defaultChecked={false} />
        </div>
        
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ color: '#fff' }}>Stat Cooldown</label>
          <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Cooldown between stat increments.</span>
          <input type="number" className="dash-input" defaultValue={5} />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', fontWeight: '600', color: '#949BA4', gap: '16px' }}>
            <span>Count</span>
            <span>Role</span>
            <span>Action</span>
          </div>
          {statRoles.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#949BA4', fontSize: '13px' }}>
              No rewards configured.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {statRoles.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '16px', alignItems: 'center' }}>
                  <input type="number" className="dash-input" placeholder="Count (e.g. 500)" />
                  <CustomSelect options={[{value: '1', label: '@ Active'}]} placeholder="Select Role..." />
                  <button onClick={() => setStatRoles(statRoles.filter((_, idx) => idx !== i))} className="dash-btn danger" style={{ padding: '8px 12px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setStatRoles([...statRoles, {}])} className="dash-btn primary">+ Add Role</button>
      </div>

      <div style={{ marginTop: '32px' }}>
        
      </div>
    
      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </div>
  );
}
