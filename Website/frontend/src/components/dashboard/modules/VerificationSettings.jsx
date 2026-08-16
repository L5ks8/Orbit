import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function VerificationSettings() {
  const roleOptions = [
    { value: '1', label: '@ Verified' },
    { value: '2', label: '@ Unverified' },
  ];
  const channelOptions = [
    { value: '1', label: '# verify-here' }
  ];

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Verification</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Require users to solve a CAPTCHA or click to verify before accessing channels.</p>
          </div>
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <div className="form-group">
            <label style={{ color: '#fff' }}>Verification Mode</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Choose how users verify. One-Click is faster, CAPTCHA is more secure.</span>
            <CustomSelect 
              options={[
                { value: 'web_captcha', label: 'Web CAPTCHA (Browser)' },
                { value: 'captcha', label: 'Discord CAPTCHA (Image)' },
                { value: 'oneclick', label: 'One-Click (Instant Verify)' }
              ]} 
              placeholder="Select Mode..." 
            />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Verified Role (Add)</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>The role granted upon successful verification.</span>
            <CustomSelect options={roleOptions} placeholder="Select role..." />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Unverified Role (Remove)</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Optional: A role that is REMOVED when the user verifies.</span>
            <CustomSelect options={roleOptions} placeholder="Select role..." />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Timeout Penalty</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Action to take if the user fails to verify within a specific timeframe.</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <CustomSelect 
                  options={[
                    { value: 'none', label: 'None (Stay in server)' },
                    { value: 'kick', label: 'Kick User' },
                    { value: 'ban', label: 'Ban User' }
                  ]} 
                  placeholder="Select Penalty..." 
                />
              </div>
              <input type="number" className="dash-input" placeholder="Minutes" style={{ width: '100px' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Verification Panel</h3>
        <p className="form-hint" style={{ fontSize: '12px', marginBottom: '20px' }}>Design the embed that users will see when they need to verify.</p>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="color" defaultValue="#5865F2" style={{ width: '44px', height: '38px', borderRadius: '4px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }} />
              <input type="text" className="dash-input" defaultValue="#5865F2" style={{ width: '100px' }} />
            </div>
            <input type="text" className="dash-input" placeholder="Title" />
            <textarea className="dash-input" rows="4" defaultValue="This server requires you to verify yourself to get access to other channels, you can simply verify by clicking on the verify button." placeholder="Description"></textarea>
            <div style={{ width: '100%', height: '120px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', cursor: 'pointer' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Click to upload Image</span>
            </div>
          </div>

          <div style={{ flex: '1 1 300px', background: '#313338', borderRadius: '8px', padding: '16px', display: 'flex', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#5865F2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>O</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#F2F3F5', fontWeight: '500' }}>Orbit</span>
                <span style={{ background: '#5865F2', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold' }}>BOT</span>
              </div>
              <div style={{ background: '#2B2D31', borderRadius: '4px', borderLeft: '4px solid #5865F2', padding: '12px 16px', color: '#DBDEE1', fontSize: '14px' }}>
                <div style={{ fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Verification Required</div>
                This server requires you to verify yourself to get access to other channels, you can simply verify by clicking on the verify button.
              </div>
              <button style={{ background: '#248046', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '3px', fontWeight: '500', fontSize: '14px', marginTop: '8px' }}>Verify</button>
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <label style={{ color: '#fff' }}>Send Verification Panel</label>
          <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Deploy the verification message to a channel so users can click it.</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <CustomSelect options={channelOptions} placeholder="Select Channel..." />
            </div>
            <button className="dash-btn secondary">Send Panel</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <button className="dash-btn primary" style={{ width: '100%', padding: '12px' }}>Save Verification Settings</button>
      </div>
    </div>
  );
}
