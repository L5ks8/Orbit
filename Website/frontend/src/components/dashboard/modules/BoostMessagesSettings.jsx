import SaveBar from '../../ui/SaveBar';
import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';
import DiscordPreview from '../../ui/DiscordPreview';

export default function BoostMessagesSettings({ config, channels, roles, onSave, saving, onReset }) {
  const bCfg = config?.boost || {};
  const [mode, setMode] = useState(bCfg.msg_mode || 'embed');
  const [channel, setChannel] = useState(bCfg.channel_id || '');
  const [rewardRole, setRewardRole] = useState(bCfg.reward_role_id || '');
  
  // Message State
  const [content, setContent] = useState(bCfg.message || 'Thank you for boosting the server, {user}!');
  
  // Embed State
  const [embedColor, setEmbedColor] = useState(bCfg.embed_color || '#EB459E');
  const [embedAuthor, setEmbedAuthor] = useState(bCfg.embed_author || '');
  const [embedTitle, setEmbedTitle] = useState(bCfg.embed_title || 'SERVER BOOST');
  const [embedDesc, setEmbedDesc] = useState(bCfg.embed_description || '');
  const [embedFooter, setEmbedFooter] = useState(bCfg.embed_footer || '');

  // Image Card State
  const [bgImageUrl, setBgImageUrl] = useState(bCfg.image_url || '');

  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));
  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));

  const getPayload = () => ({
      boost: {
        enabled: bCfg.enabled || false,
        channel_id: channel,
        reward_role_id: rewardRole,
        message: content,
        msg_mode: mode,
        image_url: bgImageUrl,
        embed_author: embedAuthor,
        embed_title: embedTitle,
        embed_description: embedDesc,
        embed_footer: embedFooter,
        embed_color: embedColor
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
            <h1 className="dash-title">Boost Messages</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Celebrate when members boost your server with a custom card or embed message!</p>
          </div>
                  </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="dash-card settings-card" style={{ padding: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ color: '#fff' }}>Boost Channel</label>
            <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Where should the bot post the boost message?</span>
            <CustomSelect options={channelOptions} value={channel} onChange={setChannel} placeholder="Select Channel..." />
          </div>
        </div>

        <div className="dash-card settings-card" style={{ padding: '20px', position: 'relative', zIndex: 10, overflow: 'visible' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ color: '#fff' }}>Reward Role</label>
            <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Give this role to users when they boost the server.</span>
            <CustomSelect options={roleOptions} value={rewardRole} onChange={setRewardRole} placeholder="No reward role" />
          </div>
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '20px' }}>Message Builder</h3>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
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

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {/* Builder Form (Left Column) */}
          <div style={{ flex: '1 1 400px' }}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff' }}>Content Text (Outside Embed)</label>
              <textarea 
                className="dash-input" 
                style={{ width: '100%', height: '80px', resize: 'vertical' }} 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Message outside the embed..."
              />
            </div>

            {mode === 'embed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff' }}>Embed Color</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input 
                      type="color" 
                      value={embedColor} 
                      onChange={(e) => setEmbedColor(e.target.value)}
                      style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                    />
                    <input 
                      type="text" 
                      className="dash-input" 
                      value={embedColor}
                      onChange={(e) => setEmbedColor(e.target.value)}
                      style={{ width: '100px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff' }}>Author Name</label>
                  <input type="text" className="dash-input" placeholder="Author..." value={embedAuthor} onChange={(e) => setEmbedAuthor(e.target.value)} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff' }}>Title</label>
                  <input type="text" className="dash-input" placeholder="Title..." value={embedTitle} onChange={(e) => setEmbedTitle(e.target.value)} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff' }}>Description</label>
                  <textarea className="dash-input" style={{ width: '100%', height: '100px', resize: 'vertical' }} placeholder="Description..." value={embedDesc} onChange={(e) => setEmbedDesc(e.target.value)} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff' }}>Footer Text</label>
                  <input type="text" className="dash-input" placeholder="Footer..." value={embedFooter} onChange={(e) => setEmbedFooter(e.target.value)} />
                </div>
              </div>
            )}

            {mode === 'image' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff' }}>Background Image URL</label>
                  <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Provide a direct URL to an image (png/jpg/gif).</span>
                  <input 
                    type="text" 
                    className="dash-input" 
                    placeholder="https://example.com/image.png" 
                    value={bgImageUrl}
                    onChange={(e) => setBgImageUrl(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Preview (Right Column) */}
          <div style={{ flex: '1 1 400px' }}>
            <DiscordPreview
              content={content}
              embedColor={embedColor}
              embedAuthor={embedAuthor}
              embedTitle={embedTitle}
              embedDesc={embedDesc}
              embedFooter={embedFooter}
              imageUrl={bgImageUrl}
              mode={mode}
              accentColor="#EB459E"
              cardTitle="SERVER BOOST"
              channels={channels}
              roles={roles}
            />

            {/* Helper Variables Box */}
            <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', color: '#fff', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EB459E" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Variables You Can Use
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px', fontSize: '12px' }}><code style={{ color: '#EB459E', fontWeight: '600' }}>{'{user}'}</code> <span style={{ color: '#949BA4', float: 'right' }}>@User</span></div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px', fontSize: '12px' }}><code style={{ color: '#EB459E', fontWeight: '600' }}>{'{server}'}</code> <span style={{ color: '#949BA4', float: 'right' }}>Server Name</span></div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px', fontSize: '12px' }}><code style={{ color: '#EB459E', fontWeight: '600' }}>{'{count}'}</code> <span style={{ color: '#949BA4', float: 'right' }}>Boost Count</span></div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px', fontSize: '12px' }}><code style={{ color: '#EB459E', fontWeight: '600' }}>{'{id}'}</code> <span style={{ color: '#949BA4', float: 'right' }}>User ID</span></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        
      </div>
    
      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </div>
  );
}
