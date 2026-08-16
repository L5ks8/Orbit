import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function BanAppealsSettings() {
  const [questions, setQuestions] = useState([]);

  const roleOptions = [
    { value: '1', label: '@ Admin' },
    { value: '2', label: '@ Mod' },
  ];
  const channelOptions = [
    { value: '1', label: '# appeals' }
  ];
  const punishmentOptions = [
    { value: 'ban', label: 'Ban' },
    { value: 'timeout', label: 'Timeout' },
    { value: 'kick', label: 'Kick' },
    { value: 'warn', label: 'Warn' },
  ];

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
            <CustomSelect options={channelOptions} placeholder="Select channel..." />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Moderator Roles</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Roles allowed to decide on appeals.</span>
            <CustomSelect options={roleOptions} isMulti placeholder="Select roles..." />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Allowed Punishments</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Which types of punishments can be appealed?</span>
            <CustomSelect options={punishmentOptions} isMulti placeholder="Select punishments..." defaultValue={[punishmentOptions[0]]} />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Custom URL</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>The URL where the appeal form for this server is accessible.</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '9px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRight: 'none', borderRadius: '4px 0 0 4px', fontSize: '13px' }}>orbit-bot.com/appeal/</span>
              <input type="text" className="dash-input" placeholder="orbit" style={{ borderRadius: '0 4px 4px 0' }} />
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
            <Toggle defaultChecked={false} />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Anonymous Moderators</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Should moderators remain anonymous when processing appeals?</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Multiple Submissions</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Should users be able to submit multiple appeals?</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Invite Unbanned Members</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Send invite when ban appeal is accepted?</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Submission Cooldown (Days)</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Wait time before submitting another appeal.</span>
            <input type="number" className="dash-input" defaultValue={3} />
          </div>

        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 }}>Form <span style={{ color: 'var(--status-danger)' }}>*</span></h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="dash-btn secondary">Show Appeal Page</button>
            <button className="dash-btn secondary">View Appeal</button>
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
                <input type="text" className="dash-input" placeholder="Enter question..." style={{ flex: 1 }} />
                <button onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))} className="dash-btn danger" style={{ padding: '12px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>
        
        <button onClick={() => setQuestions([...questions, {}])} className="dash-btn primary">+ Add Question</button>
      </div>

      <div style={{ marginTop: '32px' }}>
        <button onClick={() => alert('Settings saved!')} className="dash-btn primary" style={{ width: '100%', padding: '12px' }}>Save Appeals Settings</button>
      </div>
    </div>
  );
}
