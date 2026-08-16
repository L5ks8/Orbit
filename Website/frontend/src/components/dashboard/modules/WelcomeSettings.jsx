import React, { useState, useEffect } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function WelcomeSettings({ config, channels, onSave, saving }) {
  const wCfg = config?.welcome || {};
  
  const [enabled, setEnabled] = useState(wCfg.enabled || false);
  const [mode, setMode] = useState(wCfg.msg_mode || 'image');
  const [channel, setChannel] = useState(wCfg.channel_id || '');
  const [welcomeText, setWelcomeText] = useState(wCfg.message || '');
  
  // Image mode state
  const [imageUrl, setImageUrl] = useState(wCfg.image_url || '');
  
  // Embed mode state
  const [embedAuthor, setEmbedAuthor] = useState(wCfg.embed_author || '');
  const [embedTitle, setEmbedTitle] = useState(wCfg.embed_title || '');
  const [embedDescription, setEmbedDescription] = useState(wCfg.embed_description || '');
  const [embedFooter, setEmbedFooter] = useState(wCfg.embed_footer || '');
  const [embedColor, setEmbedColor] = useState(wCfg.embed_color || '#5865F2');
  const [embedThumbnail, setEmbedThumbnail] = useState(wCfg.embed_thumbnail || '');

  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));

  const handleSave = () => {
    onSave({
      welcome: {
        enabled,
        channel_id: channel,
        message: welcomeText,
        msg_mode: mode,
        image_url: imageUrl,
        embed_author: embedAuthor,
        embed_title: embedTitle,
        embed_description: embedDescription,
        embed_footer: embedFooter,
        embed_color: embedColor,
        embed_thumbnail: embedThumbnail,
        // Preserve other fields we aren't editing yet
        embed_image: wCfg.embed_image || '',
        embed_author_icon: wCfg.embed_author_icon || '',
        embed_footer_icon: wCfg.embed_footer_icon || '',
        embed_fields: wCfg.embed_fields || []
      }
    });
  };

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Welcome System</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Greet new members when they join the server with a custom welcome card or embed message!</p>
          </div>
          <Toggle checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
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
              <label>Background Image URL</label>
              <span className="form-hint" style={{ display: 'block', marginBottom: '12px' }}>Paste a URL to use as the welcome card background.</span>
              <input type="text" className="dash-input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" />
            </div>
          )}

          {mode === 'embed' && (
            <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <label>Embed Builder</label>
              <span className="form-hint" style={{ display: 'block', marginBottom: '16px' }}>Customize the embed colors and text.</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="color" value={embedColor} onChange={e => setEmbedColor(e.target.value)} style={{ width: '40px', height: '40px', padding: '0', background: 'none', border: 'none', cursor: 'pointer' }} />
                  <input type="text" className="dash-input" value={embedColor} onChange={e => setEmbedColor(e.target.value)} style={{ width: '120px' }} />
                </div>
                <input type="text" className="dash-input" value={embedAuthor} onChange={e => setEmbedAuthor(e.target.value)} placeholder="Author Name" />
                <input type="text" className="dash-input" value={embedTitle} onChange={e => setEmbedTitle(e.target.value)} placeholder="Title" />
                <textarea className="dash-input" rows="3" value={embedDescription} onChange={e => setEmbedDescription(e.target.value)} placeholder="Description"></textarea>
                <input type="text" className="dash-input" value={embedFooter} onChange={e => setEmbedFooter(e.target.value)} placeholder="Footer Text" />
                <input type="text" className="dash-input" value={embedThumbnail} onChange={e => setEmbedThumbnail(e.target.value)} placeholder="Thumbnail URL" />
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer" style={{ marginTop: '32px' }}>
          <button className="dash-btn primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</button>
        </div>
      </div>
    </div>
  );
}
