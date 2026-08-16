import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function GoodbyeMessagesSettings() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState('embed'); // 'image' or 'embed'
  
  // Message State
  const [content, setContent] = useState("We're sad to see you go, {user}!");
  
  // Embed State
  const [embedColor, setEmbedColor] = useState('#ED4245');
  const [embedAuthor, setEmbedAuthor] = useState('');
  const [embedTitle, setEmbedTitle] = useState('MEMBER LEFT');
  const [embedDesc, setEmbedDesc] = useState('');
  const [embedFooter, setEmbedFooter] = useState('');

  // Image Card State
  const [bgImageUrl, setBgImageUrl] = useState('');

  const channelOptions = [
    { value: '1', label: '# general' },
    { value: '2', label: '# goodbye' }
  ];

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Goodbye System</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Say farewell to members when they leave the server with a custom goodbye card or embed message!</p>
          </div>
          <Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ color: '#fff' }}>Goodbye Channel</label>
          <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Where should the bot post the goodbye message?</span>
          <CustomSelect options={channelOptions} placeholder="Select Channel..." />
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
            <label style={{ color: '#fff', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Live Discord Preview</label>
            <div style={{ background: '#313338', borderRadius: '8px', padding: '16px', display: 'flex', gap: '16px', fontFamily: '"gg sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#5865F2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                O
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#F2F3F5', fontWeight: '500', fontSize: '16px' }}>Orbit</span>
                  <span style={{ background: '#5865F2', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>Bot</span>
                  <span style={{ color: '#949BA4', fontSize: '12px' }}>Today at 12:00 PM</span>
                </div>

                {content && (
                  <div style={{ color: '#DBDEE1', fontSize: '14px', marginBottom: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {content}
                  </div>
                )}

                {mode === 'embed' && (embedAuthor || embedTitle || embedDesc || embedFooter) && (
                  <div style={{ background: '#2B2D31', borderRadius: '4px', borderLeft: `4px solid ${embedColor}`, padding: '12px 16px', maxWidth: '432px' }}>
                    {embedAuthor && (
                      <div style={{ color: '#F2F3F5', fontSize: '13.5px', fontWeight: '600', marginBottom: '8px' }}>
                        {embedAuthor}
                      </div>
                    )}
                    {embedTitle && (
                      <div style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
                        {embedTitle}
                      </div>
                    )}
                    {embedDesc && (
                      <div style={{ color: '#DBDEE1', fontSize: '13.5px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '8px' }}>
                        {embedDesc}
                      </div>
                    )}
                    {embedFooter && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <span style={{ color: '#949BA4', fontSize: '11px' }}>{embedFooter}</span>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'image' && (
                  <div style={{ maxWidth: '400px', borderRadius: '8px', overflow: 'hidden', position: 'relative', background: '#2B2D31', minHeight: '150px' }}>
                    {bgImageUrl ? (
                      <img src={bgImageUrl} style={{ width: '100%', display: 'block', objectFit: 'cover' }} alt="Goodbye Card Background" onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                      <div style={{ width: '100%', height: '200px', background: 'linear-gradient(45deg, #1f2023, #2b2d31)' }}></div>
                    )}
                    
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.2))', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '30px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#313338', marginBottom: '12px', border: '3px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src="https://cdn.discordapp.com/embed/avatars/0.png" style={{ width: '100%' }} alt="User Avatar" />
                      </div>
                      <div style={{ color: '#fff', fontSize: '24px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '1px' }}>GOODBYE</div>
                      <div style={{ color: '#fff', fontSize: '14px', opacity: 0.9 }}>@user</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Helper Variables Box */}
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
      </div>
    </div>
  );
}
