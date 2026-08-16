import SaveBar from '../../ui/SaveBar';
import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';
import DiscordPreview from '../../ui/DiscordPreview';

export default function GoodbyeMessagesSettings({ config, channels, onSave, saving, onReset }) {
  const gCfg = config?.goodbye || {};

    const [mode, setMode] = useState(gCfg.msg_mode || 'embed');
  const [channel, setChannel] = useState(gCfg.channel_id || '');
  const [content, setContent] = useState(gCfg.message || "We're sad to see you go, {user}!");
  const [embedColor, setEmbedColor] = useState(gCfg.embed_color || '#ED4245');
  const [embedAuthor, setEmbedAuthor] = useState(gCfg.embed_author || '');
  const [embedTitle, setEmbedTitle] = useState(gCfg.embed_title || 'MEMBER LEFT');
  const [embedDesc, setEmbedDesc] = useState(gCfg.embed_description || '');
  const [embedFooter, setEmbedFooter] = useState(gCfg.embed_footer || '');
  const [embedImage, setEmbedImage] = useState(gCfg.embed_image || '');
  const [embedThumbnail, setEmbedThumbnail] = useState(gCfg.embed_thumbnail || '');
  const [bgImageUrl, setBgImageUrl] = useState(gCfg.image_url || '');

  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));

  const getPayload = () => ({
      goodbye: {
        enabled, channel_id: channel, message: content, msg_mode: mode,
        image_url: bgImageUrl, embed_author: embedAuthor, embed_title: embedTitle,
        embed_description: embedDesc, embed_footer: embedFooter, embed_color: embedColor,
        embed_image: embedImage, embed_thumbnail: embedThumbnail,
        embed_author_icon: gCfg.embed_author_icon || '', embed_footer_icon: gCfg.embed_footer_icon || '',
        embed_fields: gCfg.embed_fields || []
      }
    });

  const [initialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  const handleSave = () => {
    onSave(getPayload());
  };

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Goodbye System</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Say farewell to members when they leave the server with a custom goodbye card or embed message!</p>
          </div>
                  </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ color: '#fff' }}>Goodbye Channel</label>
          <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Where should the bot post the goodbye message?</span>
          <CustomSelect options={channelOptions} value={channel} onChange={setChannel} placeholder="Select Channel..." />
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '20px' }}>Message Builder</h3>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button className={`dash-btn ${mode === 'image' ? 'primary' : 'secondary'}`} onClick={() => setMode('image')}>Image Card</button>
          <button className={`dash-btn ${mode === 'embed' ? 'primary' : 'secondary'}`} onClick={() => setMode('embed')}>Embed Message</button>
        </div>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff' }}>Content Text (Outside Embed)</label>
              <textarea className="dash-input" style={{ width: '100%', height: '80px', resize: 'vertical' }} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message outside the embed..." />
            </div>

            {mode === 'embed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff' }}>Embed Color</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input type="color" value={embedColor} onChange={(e) => setEmbedColor(e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
                    <input type="text" className="dash-input" value={embedColor} onChange={(e) => setEmbedColor(e.target.value)} style={{ width: '100px' }} />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}><label style={{ color: '#fff' }}>Author Name</label><input type="text" className="dash-input" placeholder="Author..." value={embedAuthor} onChange={(e) => setEmbedAuthor(e.target.value)} /></div>
                <div className="form-group" style={{ margin: 0 }}><label style={{ color: '#fff' }}>Title</label><input type="text" className="dash-input" placeholder="Title..." value={embedTitle} onChange={(e) => setEmbedTitle(e.target.value)} /></div>
                <div className="form-group" style={{ margin: 0 }}><label style={{ color: '#fff' }}>Description</label><textarea className="dash-input" style={{ width: '100%', height: '100px', resize: 'vertical' }} placeholder="Description..." value={embedDesc} onChange={(e) => setEmbedDesc(e.target.value)} /></div>
                <div className="form-group" style={{ margin: 0 }}><label style={{ color: '#fff' }}>Image URL</label><input type="text" className="dash-input" placeholder="https://..." value={embedImage} onChange={(e) => setEmbedImage(e.target.value)} /></div>
                <div className="form-group" style={{ margin: 0 }}><label style={{ color: '#fff' }}>Footer Text</label><input type="text" className="dash-input" placeholder="Footer..." value={embedFooter} onChange={(e) => setEmbedFooter(e.target.value)} /></div>
                <div className="form-group" style={{ margin: 0 }}><label style={{ color: '#fff' }}>Thumbnail URL</label><input type="text" className="dash-input" placeholder="https://..." value={embedThumbnail} onChange={(e) => setEmbedThumbnail(e.target.value)} /></div>
              </div>
            )}

            {mode === 'image' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff' }}>Background Image URL</label>
                  <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Provide a direct URL to an image (png/jpg/gif).</span>
                  <input type="text" className="dash-input" placeholder="https://example.com/image.png" value={bgImageUrl} onChange={(e) => setBgImageUrl(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: '1 1 400px' }}>
            <DiscordPreview
              content={content}
              embedColor={embedColor}
              embedAuthor={embedAuthor}
              embedTitle={embedTitle}
              embedDesc={embedDesc}
              embedFooter={embedFooter}
              embedImage={embedImage}
              embedThumbnail={embedThumbnail}
              imageUrl={bgImageUrl}
              mode={mode}
              accentColor="#ED4245"
              cardTitle="GOODBYE"
              channels={channels}
            />

            <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', color: '#fff', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ED4245" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Variables You Can Use
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px', fontSize: '12px' }}><code style={{ color: '#ED4245', fontWeight: '600' }}>{'{user}'}</code> <span style={{ color: '#949BA4', float: 'right' }}>@User</span></div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px', fontSize: '12px' }}><code style={{ color: '#ED4245', fontWeight: '600' }}>{'{server}'}</code> <span style={{ color: '#949BA4', float: 'right' }}>Server Name</span></div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px', fontSize: '12px' }}><code style={{ color: '#ED4245', fontWeight: '600' }}>{'{count}'}</code> <span style={{ color: '#949BA4', float: 'right' }}>Member Count</span></div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px', fontSize: '12px' }}><code style={{ color: '#ED4245', fontWeight: '600' }}>{'{id}'}</code> <span style={{ color: '#949BA4', float: 'right' }}>User ID</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-footer" style={{ marginTop: '32px' }}>
          
        </div>
      </div>
    
      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </div>
  );
}
