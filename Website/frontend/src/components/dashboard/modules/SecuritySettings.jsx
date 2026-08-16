import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';

export default function SecuritySettings() {
  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Security Settings</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Protect your server with automated anti-nuke and anti-scam features.</p>
          </div>
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: '600' }}>Anti-Nuke System</h3>
            <span className="form-hint" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>Automatically protect your server against rogue administrators deleting channels or roles.</span>
          </div>
          <Toggle defaultChecked={false} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label style={{ color: '#fff' }}>Anti-Nuke Threshold</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>How many destructive actions within the time window will trigger the system?</span>
            <input type="number" className="dash-input" defaultValue={3} />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Time Window (Seconds)</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>The timeframe in which actions are counted. (e.g. 3 actions in 10 seconds)</span>
            <input type="number" className="dash-input" defaultValue={10} />
          </div>
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: '600' }}>Anti-Scam & Phishing</h3>
            <span className="form-hint" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>Automatically detect and delete known phishing and scam links (e.g. fake Discord Nitro links).</span>
          </div>
          <Toggle defaultChecked={false} />
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <button className="dash-btn primary" style={{ width: '100%', padding: '12px' }}>Save Security Settings</button>
      </div>
    </div>
  );
}
