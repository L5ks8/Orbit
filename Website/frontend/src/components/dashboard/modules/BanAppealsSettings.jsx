import Toggle from '../../ui/Toggle';
import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';

export default function BanAppealsSettings({ config, channels, roles, onSave, saving }) {
  const aCfg = config?.appeals || {};
  const [questions, setQuestions] = useState(aCfg.questions || []);
  const [appealChannel, setAppealChannel] = useState(aCfg.channel_id || '');
  const [modRoles, setModRoles] = useState((aCfg.mod_roles || []).map(String));
  const [allowedPunishments, setAllowedPunishments] = useState(aCfg.allowed_punishments || ['ban']);
  const [mentionMods, setMentionMods] = useState(aCfg.mention_mods || false);
  const [anonymousMods, setAnonymousMods] = useState(aCfg.anonymous_mods || false);
  const [multipleSubmissions, setMultipleSubmissions] = useState(aCfg.multiple_submissions || false);
  const [inviteUnbanned, setInviteUnbanned] = useState(aCfg.invite_unbanned || false);
  const [cooldownDays, setCooldownDays] = useState(aCfg.cooldown_days || 3);
  const [customUrl, setCustomUrl] = useState(aCfg.custom_url || '');

  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));
  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));
  const punishmentOptions = [
    { value: 'ban', label: 'Ban' },
    { value: 'timeout', label: 'Timeout' },
    { value: 'kick', label: 'Kick' },
    { value: 'warn', label: 'Warn' },
  ];

  const handleSave = () => {
    onSave({
      appeals: {
        channel_id: appealChannel,
        mod_roles: modRoles,
        allowed_punishments: allowedPunishments,
        mention_mods: mentionMods,
        anonymous_mods: anonymousMods,
        multiple_submissions: multipleSubmissions,
        invite_unbanned: inviteUnbanned,
        cooldown_days: cooldownDays,
        custom_url: customUrl,
        questions: questions
      }
    });
  };

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Appeals System</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Allow banned or muted users to submit an appeal via the web dashboard.</p>
          </div>
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>General</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <div className="form-group">
            <label style={{ color: '#fff' }}>Appeal Channel <span style={{ color: 'var(--status-danger)' }}>*</span></label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>The channel where new appeals will be sent with Accept/Deny buttons.</span>
            <CustomSelect options={channelOptions} value={appealChannel} onChange={setAppealChannel} placeholder="Select channel..." />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Moderator Roles</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Roles allowed to decide on appeals.</span>
            <CustomSelect options={roleOptions} value={modRoles} onChange={setModRoles} isMulti placeholder="Select roles..." />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Allowed Punishments</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Which types of punishments can be appealed?</span>
            <CustomSelect options={punishmentOptions} isMulti placeholder="Select punishments..." value={allowedPunishments} onChange={setAllowedPunishments} />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Custom URL</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>The URL where the appeal form for this server is accessible.</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '9px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRight: 'none', borderRadius: '4px 0 0 4px', fontSize: '13px' }}>orbit-bot.com/appeal/</span>
              <input type="text" className="dash-input" placeholder="orbit" style={{ borderRadius: '0 4px 4px 0' }} value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} />
            </div>
          </div>
          
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Options</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Mention Moderators</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Should moderators be mentioned when a new appeal is submitted?</span>
            </div>
            <Toggle checked={mentionMods} onChange={() => setMentionMods(!mentionMods)} />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Anonymous Moderators</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Should moderators remain anonymous when processing appeals?</span>
            </div>
            <Toggle checked={anonymousMods} onChange={() => setAnonymousMods(!anonymousMods)} />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Multiple Submissions</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Should users be able to submit multiple appeals?</span>
            </div>
            <Toggle checked={multipleSubmissions} onChange={() => setMultipleSubmissions(!multipleSubmissions)} />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Invite Unbanned Members</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Send invite when ban appeal is accepted?</span>
            </div>
            <Toggle checked={inviteUnbanned} onChange={() => setInviteUnbanned(!inviteUnbanned)} />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Submission Cooldown (Days)</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Wait time before submitting another appeal.</span>
            <input type="number" className="dash-input" value={cooldownDays} onChange={e => setCooldownDays(parseInt(e.target.value) || 3)} />
          </div>

        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 }}>Form <span style={{ color: 'var(--status-danger)' }}>*</span></h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="dash-btn secondary" onClick={() => window.open(`${window.location.origin}/appeal/${customUrl || 'my-server'}`, '_blank')}>Show Appeal Page</button>
            <button className="dash-btn secondary" onClick={() => window.open(`${window.location.origin}/appeal/${customUrl || 'my-server'}`, '_blank')}>View Appeal</button>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
          {questions.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>No questions configured.</p>
            </div>
          ) : (
            questions.map((q, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="dash-input" 
                  placeholder="Enter question..." 
                  style={{ flex: 1 }} 
                  value={typeof q === 'string' ? q : ''} 
                  onChange={(e) => {
                    const newQs = [...questions];
                    newQs[i] = e.target.value;
                    setQuestions(newQs);
                  }}
                />
                <button onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))} className="dash-btn danger" style={{ padding: '12px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>
        
        <button onClick={() => setQuestions([...questions, ''])} className="dash-btn primary">+ Add Question</button>
      </div>

      <div style={{ marginTop: '32px' }}>
        <button onClick={handleSave} className="dash-btn primary" style={{ width: '100%', padding: '12px' }} disabled={saving}>{saving ? 'Saving...' : 'Save Appeals Settings'}</button>
      </div>
    </div>
  );
}
