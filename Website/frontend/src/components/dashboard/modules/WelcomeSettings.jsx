import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function WelcomeSettings() {
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [mode, setMode] = useState('image'); // 'image' or 'embed'
  const [channel, setChannel] = useState('');
  const [welcomeText, setWelcomeText] = useState('Welcome {user} to {server}!');

  const channelOptions = [
    { value: '1', label: '# general' },
    { value: '2', label: '# welcome' },
  ];

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Welcome System</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Greet new members when they join the server with a custom welcome card or embed message!</p>
          </div>
          
        </div>
      </div>

      <div className="dash-card settings-card">
        <div className="settings-form">
          <div className="form-group">
            <label>Welcome Channel</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '12px' }}>Where should the bot post the welcome message?</span>
            <CustomSelect 
              options={channelOptions}
              value={channel}
              onChange={setChannel}
              placeholder="Select a channel..."
            />
          </div>

          <div className="form-group">
            <label>Message Mode</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button 
                className={`dash-btn ${mode === 'image' ? 'primary' : 'secondary'}`} 
                onClick={() => setMode('image')}
              >
                Image Card
              </button>
              <button 
                className={`dash-btn ${mode === 'embed' ? 'primary' : 'secondary'}`} 
                onClick={() => setMode('embed')}
              >
                Embed Message
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Content / Message Text</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '12px' }}>You can use {'{user}'}, {'{server}'}, and {'{count}'} as placeholders.</span>
            <textarea 
              className="dash-input" 
              rows="3" 
              value={welcomeText}
              onChange={(e) => setWelcomeText(e.target.value)}
              placeholder="Welcome {user} to {server}!"
            ></textarea>
          </div>

          {mode === 'image' && (
            <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <label>Background Image</label>
              <span className="form-hint" style={{ display: 'block', marginBottom: '12px' }}>Upload an image (PNG/JPG) or paste a URL to use as the welcome card background.</span>
              <input type="text" className="dash-input" placeholder="https://example.com/image.png" />
            </div>
          )}

          {mode === 'embed' && (
            <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <label>Embed Builder</label>
              <span className="form-hint" style={{ display: 'block', marginBottom: '16px' }}>Customize the embed colors and text.</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" className="dash-input" placeholder="Author Name" />
                <input type="text" className="dash-input" placeholder="Title" />
                <textarea className="dash-input" rows="3" placeholder="Description"></textarea>
                <input type="text" className="dash-input" placeholder="Footer Text" />
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer" style={{ marginTop: '32px' }}>
          <button className="dash-btn primary">Save Settings</button>
        </div>
      </div>
    </div>
  );
}
