import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function EmbedBuilder() {
  const { guildId } = useParams();
  
  const [channelId, setChannelId] = useState('');
  const [embedTitle, setEmbedTitle] = useState('');
  const [embedDescription, setEmbedDescription] = useState('');
  const [embedColor, setEmbedColor] = useState('#5865F2');
  const [embedImage, setEmbedImage] = useState('');
  const [embedThumbnail, setEmbedThumbnail] = useState('');
  
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch(`/api/config/${guildId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setConfig(data);
      })
      .catch(err => console.error(err));
  }, [guildId]);

  const channels = config?.channels || [];
  const emojis = config?.emojis || [];

  const handleSend = async () => {
    if (!channelId) {
      setStatusMsg('Please select a channel first.');
      return;
    }
    
    setIsSubmitting(true);
    setStatusMsg('Sending...');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/action/send_custom_embed/${guildId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel_id: channelId,
          title: embedTitle,
          description: embedDescription,
          color: embedColor,
          image: embedImage,
          thumbnail: embedThumbnail
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('Embed sent successfully!');
      } else {
        setStatusMsg(`Error: ${data.error || 'Failed to send'}`);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const insertText = (setter, textToInsert) => {
    setter(prev => prev + textToInsert);
  };

  return (
    <div style={{ padding: '24px', animation: 'fadeIn 0.2s ease-out', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Custom Embed Builder</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Design and send beautiful rich embed messages directly to your server. 
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* LEFT PANEL: Editor */}
        <div style={{ 
          background: 'var(--bg-secondary)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)', 
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)' }}>Editor</h2>
          
          <div className="dash-form-group">
            <label style={{ fontWeight: 500 }}>Target Channel</label>
            <select 
              value={channelId} 
              onChange={e => setChannelId(e.target.value)}
              className="dash-input"
              style={{ padding: '10px 12px', cursor: 'pointer' }}
            >
              <option value="">-- Select a Channel --</option>
              {channels.map(c => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>
          </div>

          <div className="dash-form-group">
            <label style={{ fontWeight: 500 }}>Title</label>
            <input 
              type="text" 
              value={embedTitle} 
              onChange={e => setEmbedTitle(e.target.value)} 
              className="dash-input"
              placeholder="My Awesome Announcement"
              style={{ padding: '10px 12px' }}
            />
          </div>

          <div className="dash-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ margin: 0, fontWeight: 500 }}>Description</label>
            </div>
            <textarea 
              value={embedDescription} 
              onChange={e => setEmbedDescription(e.target.value)}
              className="dash-input"
              rows="6"
              placeholder="Type your message here..."
              style={{ resize: 'vertical', padding: '12px' }}
            />
          </div>

          <div className="dash-form-group" style={{ marginTop: '20px', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Insert Variables</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => insertText(setEmbedDescription, '{user}')}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >{"{user}"}</button>
              <button 
                onClick={() => insertText(setEmbedDescription, '{server}')}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >{"{server}"}</button>
              <button 
                onClick={() => insertText(setEmbedDescription, '{membercount}')}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >{"{membercount}"}</button>
              <button 
                onClick={() => insertText(setEmbedDescription, '<#123456>')}
                style={{ background: 'rgba(88, 101, 242, 0.2)', color: '#c9cdfb', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = 'rgba(88, 101, 242, 0.3)'}
                onMouseLeave={e => e.target.style.background = 'rgba(88, 101, 242, 0.2)'}
              >Channel Mention</button>
            </div>
            
            {emojis.length > 0 && (
              <>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '16px 0 12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Server Emojis</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                  {emojis.map(e => (
                    <div 
                      key={e.id}
                      title={`:${e.name}:`}
                      onClick={() => insertText(setEmbedDescription, `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`)}
                      style={{ 
                        width: '32px', height: '32px', cursor: 'pointer', borderRadius: '6px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s' 
                      }}
                      onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.15)'; ev.currentTarget.style.transform = 'scale(1.1)'; }}
                      onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.05)'; ev.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <img 
                        src={`https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}`}
                        alt={e.name}
                        style={{ width: '24px', height: '24px' }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
            <div className="dash-form-group">
              <label style={{ fontWeight: 500 }}>Embed Color</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={embedColor} 
                  onChange={e => setEmbedColor(e.target.value)}
                  style={{ 
                    width: '44px', height: '44px', padding: '0', border: 'none', 
                    borderRadius: '8px', cursor: 'pointer', background: 'transparent' 
                  }}
                />
                <input 
                  type="text" 
                  value={embedColor} 
                  onChange={e => setEmbedColor(e.target.value)}
                  className="dash-input"
                  style={{ flexGrow: 1, padding: '10px 12px', fontFamily: 'monospace', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          <div className="dash-form-group">
            <label style={{ fontWeight: 500 }}>Image URL (Optional)</label>
            <input 
              type="text" 
              value={embedImage} 
              onChange={e => setEmbedImage(e.target.value)} 
              className="dash-input"
              placeholder="https://example.com/image.png"
              style={{ padding: '10px 12px' }}
            />
          </div>

          <div className="dash-form-group">
            <label style={{ fontWeight: 500 }}>Thumbnail URL (Optional)</label>
            <input 
              type="text" 
              value={embedThumbnail} 
              onChange={e => setEmbedThumbnail(e.target.value)} 
              className="dash-input"
              placeholder="https://example.com/thumb.png"
              style={{ padding: '10px 12px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
            <button 
              className="dash-btn primary" 
              onClick={handleSend}
              disabled={isSubmitting}
              style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 600, borderRadius: '8px' }}
            >
              {isSubmitting ? 'Sending...' : 'Send to Channel'}
            </button>
            {statusMsg && (
              <span style={{ 
                color: statusMsg.includes('Error') ? '#ef4444' : '#10b981', 
                fontSize: '14px', whiteSpace: 'nowrap', fontWeight: 500 
              }}>
                {statusMsg}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Live Preview */}
        <div>
          <div style={{ position: 'sticky', top: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)' }}>Live Preview</h2>
            
            <div style={{
              background: '#313338',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: '"gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
              color: '#dbdee1',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                <img 
                  src="/img/logo.png" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                  alt="Bot Avatar"
                  onError={(e) => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png' }}
                />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500, color: '#f2f3f5', fontSize: '16px' }}>Orbit</span>
                    <span style={{ background: '#5865F2', color: '#fff', fontSize: '10px', padding: '0 4px', borderRadius: '4px', height: '15px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>APP</span>
                    <span style={{ color: '#949ba4', fontSize: '12px' }}>Today at 12:00 PM</span>
                  </div>
                </div>
              </div>

              <div style={{ marginLeft: '56px' }}>
                {(!embedTitle && !embedDescription && !embedImage && !embedThumbnail) ? (
                  <div style={{ color: '#949ba4', fontStyle: 'italic', fontSize: '14px', marginTop: '4px' }}>
                    Start typing to see your embed preview...
                  </div>
                ) : (
                  <div style={{ 
                    background: '#2b2d31', 
                    borderRadius: '4px', 
                    borderLeft: `4px solid ${embedColor || '#202225'}`,
                    padding: '16px',
                    maxWidth: '520px',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '16px'
                  }}>
                    <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                      {embedTitle && (
                        <div style={{ color: '#f2f3f5', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
                          {embedTitle}
                        </div>
                      )}
                      {embedDescription && (
                        <div style={{ 
                          color: '#dbdee1', 
                          fontSize: '14px', 
                          lineHeight: '1.375',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {embedDescription.split(/(<@[!&]?\d+>|<#\d+>)/g).map((part, i) => {
                            if (part.startsWith('<#') || part.startsWith('<@')) {
                              return <span key={i} style={{ background: 'rgba(88, 101, 242, 0.3)', color: '#c9cdfb', padding: '0 2px', borderRadius: '3px' }}>{part}</span>;
                            }
                            return part.split(/(<a?:[a-zA-Z0-9_]+:\d+>)/g).map((subpart, j) => {
                              const emojiMatch = subpart.match(/<a?:([a-zA-Z0-9_]+):(\d+)>/);
                              if (emojiMatch) {
                                const isAnim = subpart.startsWith('<a:');
                                return <img key={`${i}-${j}`} src={`https://cdn.discordapp.com/emojis/${emojiMatch[2]}.${isAnim ? 'gif' : 'png'}`} alt={emojiMatch[1]} style={{ width: '22px', height: '22px', verticalAlign: 'middle', display: 'inline-block', margin: '0 1px' }} />;
                              }
                              return <span key={`${i}-${j}`}>{subpart}</span>;
                            });
                          })}
                        </div>
                      )}
                      {embedImage && (
                        <div style={{ marginTop: '16px', borderRadius: '4px', overflow: 'hidden' }}>
                          <img src={embedImage} alt="Embed" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      )}
                    </div>
                    {embedThumbnail && (
                      <div style={{ flexShrink: 0 }}>
                        <img src={embedThumbnail} alt="Thumbnail" style={{ width: '80px', height: '80px', borderRadius: '4px', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
