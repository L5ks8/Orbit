import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function EconomySettings() {
  const [workResponses, setWorkResponses] = useState([]);
  const [roleBoosters, setRoleBoosters] = useState([]);
  const [channelBoosters, setChannelBoosters] = useState([]);

  const channelOptions = [
    { value: '1', label: '# general' },
    { value: '2', label: '# bot-commands' },
  ];

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Economy System</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Manage server currency, betting limits, daily rewards, and earning options for members.</p>
          </div>
        </div>
      </div>

      {/* Money Options */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Money Options</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <div className="form-group">
            <label style={{ color: '#fff' }}>Currency Symbol</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Used in commands and responses.</span>
            <input type="text" className="dash-input" defaultValue="🪙" />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Money Multiplier</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Global multiplier for all earned money.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="range" min="0.1" max="5.0" step="0.05" defaultValue="1.0" style={{ flex: 1, accentColor: '#fff' }} />
              <span style={{ fontWeight: '600', minWidth: '50px', textAlign: 'right', color: '#fff' }}>x1.00</span>
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Bet Limit</label>
                <span className="form-hint" style={{ fontSize: '12px' }}>Enable maximum amount for gambling bets.</span>
              </div>
              <Toggle defaultChecked={false} />
            </div>
            <input type="number" className="dash-input" defaultValue={10000} />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Reset Money On Leave</label>
                <span className="form-hint" style={{ fontSize: '12px' }}>Members lose all money when leaving.</span>
              </div>
              <Toggle defaultChecked={false} />
            </div>
          </div>

        </div>
      </div>

      {/* Economy Earning Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {/* Message Money */}
        <div className="dash-card settings-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Message Money</h3>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Message Money Enabled</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Earn money by sending text messages.</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ color: '#fff' }}>Amount</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Money granted per message.</span>
            <input type="number" className="dash-input" defaultValue={8} />
          </div>
          
          <div className="form-group">
            <label style={{ color: '#fff' }}>Cooldown (s)</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Cooldown between message rewards.</span>
            <input type="number" className="dash-input" defaultValue={60} />
          </div>
        </div>

        {/* Voice Money */}
        <div className="dash-card settings-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Voice Money</h3>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Voice Money Enabled</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Earn money in voice channels.</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Ignore Muted</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Ignore self-muted/deafened users.</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Ignore Solo</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Ignore users alone in a channel.</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          
          <div className="form-group">
            <label style={{ color: '#fff' }}>Amount per Minute</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Money granted per minute.</span>
            <input type="number" className="dash-input" defaultValue={4} />
          </div>
        </div>

        {/* Command Money */}
        <div className="dash-card settings-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Command Money</h3>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Command Money Enabled</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Earn money when executing commands.</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ color: '#fff' }}>Amount</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Money granted per command.</span>
            <input type="number" className="dash-input" defaultValue={8} />
          </div>
          
          <div className="form-group">
            <label style={{ color: '#fff' }}>Cooldown (s)</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Cooldown between command rewards.</span>
            <input type="number" className="dash-input" defaultValue={60} />
          </div>
        </div>

        {/* Reaction Money */}
        <div className="dash-card settings-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Reaction Money</h3>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Reaction Money Enabled</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Earn money by adding reactions.</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ color: '#fff' }}>Amount</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Money granted per reaction.</span>
            <input type="number" className="dash-input" defaultValue={20} />
          </div>
          
          <div className="form-group">
            <label style={{ color: '#fff' }}>Cooldown (s)</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Cooldown between reaction rewards.</span>
            <input type="number" className="dash-input" defaultValue={300} />
          </div>
        </div>
      </div>

      {/* Work Command */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Work Command Options</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Work Money Range</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '12px', fontSize: '12px' }}>Range of money earned with the work command.</span>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>300</span>
              <input type="range" min="1" max="2000" defaultValue="300" style={{ flex: 1, accentColor: '#fff' }} />
              <input type="range" min="1" max="2000" defaultValue="500" style={{ flex: 1, accentColor: '#fff' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>500</span>
            </div>
          </div>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Work Cooldown</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '12px', fontSize: '12px' }}>Cooldown in minutes.</span>
            <input type="number" className="dash-input" defaultValue={240} />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Default Work Responses</label>
            <span className="form-hint" style={{ fontSize: '12px' }}>Should the default work responses be used?</span>
          </div>
          <Toggle defaultChecked={true} />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          {workResponses.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>No custom responses configured.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {workResponses.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="text" className="dash-input" placeholder="e.g. You worked hard and earned {amount}!" style={{ flex: 1 }} />
                  <button onClick={() => setWorkResponses(workResponses.filter((_, idx) => idx !== i))} className="dash-btn danger" style={{ padding: '12px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setWorkResponses([...workResponses, ''])} className="dash-btn primary">Add Response</button>
      </div>

      {/* Daily Command */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Daily Command Options</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Base Reward</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Fixed reward for day 1. If disabled, tier reward is used.</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Tier Reward</label>
              <span className="form-hint" style={{ fontSize: '12px' }}>Amount added per streak day ramping up to limit.</span>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          
          <div className="form-group">
            <label style={{ color: '#fff' }}>Streak Limit</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Days before primary scaling stops.</span>
            <input type="number" className="dash-input" defaultValue={5} />
          </div>
          
          <div className="form-group">
            <label style={{ color: '#fff' }}>Streak Bonus</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Amount added per day past the limit.</span>
            <input type="number" className="dash-input" defaultValue={10} />
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Money Leaderboard</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Custom URL</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Custom vanity URL for public leaderboard view.</span>
            <input type="text" className="dash-input" placeholder="e.g. noctaly" />
          </div>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Automatic Channel</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Channel where the wealth leaderboard is updated hourly.</span>
            <CustomSelect options={channelOptions} placeholder="Select Channel..." />
          </div>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Embed Color</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Color of the automatic leaderboard embed.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <input type="color" defaultValue="#5865F2" style={{ width: '44px', height: '38px', borderRadius: '4px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }} />
              <input type="text" className="dash-input" defaultValue="#5865F2" style={{ width: '100px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Boosters */}
      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Role & Channel Boosters</h3>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
          <div>
            <label style={{ margin: 0, color: '#fff', display: 'block', marginBottom: '4px' }}>Stack Boosters</label>
            <span className="form-hint" style={{ fontSize: '12px' }}>Should multiple boosters stack (add up)?</span>
          </div>
          <Toggle defaultChecked={true} />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', color: '#fff', marginBottom: '12px' }}>Role Boosters</h4>
          {roleBoosters.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>No role boosters configured.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
              {roleBoosters.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="number" step="0.1" className="dash-input" placeholder="Multiplier (e.g. 1.5)" style={{ width: '150px' }} />
                  <div style={{ flex: 1 }}>
                    <CustomSelect options={[{value: '1', label: '@ VIP'}]} placeholder="Select Role..." />
                  </div>
                  <button onClick={() => setRoleBoosters(roleBoosters.filter((_, idx) => idx !== i))} className="dash-btn danger" style={{ padding: '12px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setRoleBoosters([...roleBoosters, {}])} className="dash-btn primary">+ Add Role Booster</button>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', color: '#fff', marginBottom: '12px' }}>Channel Boosters</h4>
          {channelBoosters.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>No channel boosters configured.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
              {channelBoosters.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="number" step="0.1" className="dash-input" placeholder="Multiplier (e.g. 1.5)" style={{ width: '150px' }} />
                  <div style={{ flex: 1 }}>
                    <CustomSelect options={channelOptions} placeholder="Select Channel..." />
                  </div>
                  <button onClick={() => setChannelBoosters(channelBoosters.filter((_, idx) => idx !== i))} className="dash-btn danger" style={{ padding: '12px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setChannelBoosters([...channelBoosters, {}])} className="dash-btn secondary">+ Add Channel Booster</button>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <button onClick={() => alert('Settings saved!')} className="dash-btn primary" style={{ width: '100%', padding: '12px' }}>Save All Economy Settings</button>
      </div>
    </div>
  );
}
