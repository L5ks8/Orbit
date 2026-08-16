import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function TempVoiceSettings() {
  const [enabled, setEnabled] = useState(false);
  const [hubs, setHubs] = useState([]);

  const categoryOptions = [
    { value: '1', label: 'VOICE CHANNELS' }
  ];
  
  const channelOptions = [
    { value: '1', label: '➕ Join to Create' }
  ];

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Temporary Voice Channels</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Allow users to create their own temporary voice channels.</p>
          </div>
          <Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: 0 }}>Voice Hubs</h3>
          <button onClick={() => setHubs([...hubs, {}])} className="dash-btn primary">+ Add Hub</button>
        </div>

        {hubs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p style={{ color: '#949BA4', fontSize: '14px', marginBottom: '16px' }}>No Temporary Voice Hubs configured.</p>
            <button onClick={() => setHubs([...hubs, {}])} className="dash-btn primary">+ Add Hub</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {hubs.map((hub, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 }}>Hub #{i + 1}</h4>
                  <button onClick={() => setHubs(hubs.filter((_, idx) => idx !== i))} className="dash-btn danger" style={{ padding: '6px 12px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    Delete Hub
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ color: '#fff' }}>Hub Category</label>
                    <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>The category where temporary channels will be created.</span>
                    <CustomSelect options={categoryOptions} placeholder="Select Category..." />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ color: '#fff' }}>Generator Channel</label>
                    <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>The voice channel users join to create a temporary channel.</span>
                    <CustomSelect options={channelOptions} placeholder="Select Channel..." />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
                  <label style={{ color: '#fff' }}>Temporary Channel Name Format</label>
                  <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Use {'{user}'} for the creator's name.</span>
                  <input type="text" className="dash-input" defaultValue="{user}'s Channel" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
