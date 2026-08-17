import SaveBar from '../../ui/SaveBar';
import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';

export default function TempVoiceSettings({ config, voiceChannels, categories, onSave, saving, onReset }) {
  const tvCfg = config?.tempvoice || {};

    const [hubs, setHubs] = useState(
    (tvCfg.hubs || []).map((h, i) => ({
      hub_channel_id: String(h.hub_channel_id || ''),
      category_id: String(h.category_id || ''),
      default_user_limit: h.default_user_limit || 0
    }))
  );

  const categoryOptions = (categories || []).map(c => ({ value: c.id, label: c.name }));
  const voiceChannelOptions = (voiceChannels || []).map(c => ({ value: c.id, label: `🔊 ${c.name}` }));

  const updateHub = (index, key, value) => {
    setHubs(prev => prev.map((h, i) => i === index ? { ...h, [key]: value } : h));
  };

  const getPayload = () => ({
      tempvoice: {
        enabled: tvCfg.enabled || false,
        hubs: hubs.filter(h => h.hub_channel_id)
      }
    });

  const [initialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  const handleSave = () => {
    onSave(getPayload());
  };

  return (
    <div className="dash-settings-module">


      <div className="dash-card settings-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: 0 }}>Voice Hubs</h3>
          <button onClick={() => setHubs([...hubs, { hub_channel_id: '', category_id: '', default_user_limit: 0 }])} className="dash-btn primary">+ Add Hub</button>
        </div>

        {hubs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p style={{ color: '#949BA4', fontSize: '14px', marginBottom: '16px' }}>No Temporary Voice Hubs configured.</p>
            <button onClick={() => setHubs([...hubs, { hub_channel_id: '', category_id: '', default_user_limit: 0 }])} className="dash-btn primary">+ Add Hub</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {hubs.map((hub, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 }}>Hub #{i + 1}</h4>
                  <button onClick={() => setHubs(hubs.filter((_, idx) => idx !== i))} className="dash-btn danger" style={{ padding: '6px 12px' }}>
                    Delete Hub
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ color: '#fff' }}>Hub Category</label>
                    <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>The category where temporary channels will be created.</span>
                    <CustomSelect options={categoryOptions} value={hub.category_id} onChange={v => updateHub(i, 'category_id', v)} placeholder="Select Category..." />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ color: '#fff' }}>Generator Channel</label>
                    <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>The voice channel users join to create a temporary channel.</span>
                    <CustomSelect options={voiceChannelOptions} value={hub.hub_channel_id} onChange={v => updateHub(i, 'hub_channel_id', v)} placeholder="Select Channel..." />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
                  <label style={{ color: '#fff' }}>Default User Limit</label>
                  <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Set to 0 for no limit.</span>
                  <input type="number" className="dash-input" value={hub.default_user_limit} onChange={e => updateHub(i, 'default_user_limit', parseInt(e.target.value) || 0)} min="0" style={{ maxWidth: '200px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '24px' }}>
          
        </div>
      </div>
    
      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </div>
  );
}
