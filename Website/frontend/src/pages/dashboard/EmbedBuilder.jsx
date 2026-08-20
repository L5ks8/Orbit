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
          padding: '24px' 
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Editor</h2>
          
          <div className="dash-form-group">
            <label>Target Channel</label>
            <select 
              value={channelId} 
              onChange={e => setChannelId(e.target.value)}
              className="dash-input"
            >
              <option value="">-- Select a Channel --</option>
              {channels.map(c => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>
          </div>

          <div className="dash-form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={embedTitle} 
              onChange={e => setEmbedTitle(e.target.value)} 
              className="dash-input"
              placeholder="My Awesome Announcement"
            />
          </div>

          <div className="dash-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ margin: 0 }}>Description</label>
            </div>
            <textarea 
              value={embedDescription} 
              onChange={e => setEmbedDescription(e.target.value)}
              className="dash-input"
              rows="6"
              placeholder="Type your message here..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="dash-form-group" style={{ marginTop: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Quick Insert Variables</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                className="dash-btn" 
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => insertText(setEmbedDescription, '{user}')}
              >{"{user}"}</button>
              <button 
                className="dash-btn" 
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => insertText(setEmbedDescription, '{server}')}
              >{"{server}"}</button>
              <button 
                className="dash-btn" 
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => insertText(setEmbedDescription, '{membercount}')}
              >{"{membercount}"}</button>
              <button 
                className="dash-btn" 
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => insertText(setEmbedDescription, '<#123456> (Channel Mention)')}
              >Channel Mention</button>
            </div>
            
            {emojis.length > 0 && (
              <>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '12px 0 8px', fontWeight: 600 }}>Server Emojis (Click to insert)</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxHeight: '100px', overflowY: 'auto' }}>
                  {emojis.map(e => (
                    <img 
                      key={e.id}
                      src={`https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}`}
                      alt={e.name}
                      title={`:${e.name}:`}
                      onClick={() => insertText(setEmbedDescription, `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`)}
                      style={{ width: '24px', height: '24px', cursor: 'pointer', borderRadius: '4px' }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="dash-form-group">
              <label>Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={embedColor} 
                  onChange={e => setEmbedColor(e.target.value)}
                  style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                />
                <input 
                  type="text" 
                  value={embedColor} 
                  onChange={e => setEmbedColor(e.target.value)}
                  className="dash-input"
                  style={{ flexGrow: 1 }}
                />
              </div>
            </div>
          </div>

          <div className="dash-form-group">
            <label>Image URL (Optional)</label>
            <input 
              type="text" 
              value={embedImage} 
              onChange={e => setEmbedImage(e.target.value)} 
              className="dash-input"
              placeholder="https://example.com/image.png"
            />
          </div>

          <div className="dash-form-group">
            <label>Thumbnail URL (Optional)</label>
            <input 
              type="text" 
              value={embedThumbnail} 
              onChange={e => setEmbedThumbnail(e.target.value)} 
              className="dash-input"
              placeholder="https://example.com/thumb.png"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
            <button 
              className="dash-btn primary" 
              onClick={handleSend}
              disabled={isSubmitting}
              style={{ width: '100%', padding: '12px' }}
            >
              {isSubmitting ? 'Sending...' : 'Send to Channel'}
            </button>
            {statusMsg && (
              <span style={{ color: statusMsg.includes('Error') ? '#ef4444' : '#10b981', fontSize: '14px', whiteSpace: 'nowrap' }}>
                {statusMsg}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Live Preview */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-secondary)' }}>Live Preview</h2>
          
          <div style={{
            background: '#313338',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: '"gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
            color: '#dbdee1'
          }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
              <img 
                src="/img/logo.png" 
                style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
                alt="Bot Avatar"
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 500, color: '#f2f3f5', fontSize: '16px' }}>Orbit</span>
                  <span style={{ background: '#5865F2', color: '#fff', fontSize: '10px', padding: '0 4px', borderRadius: '4px', height: '15px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>APP</span>
                  <span style={{ color: '#949ba4', fontSize: '12px' }}>Today at 12:00 PM</span>
                </div>
              </div>
            </div>

            <div style={{ marginLeft: '56px' }}>
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
                            return <img key={`${i}-${j}`} src={`https://cdn.discordapp.com/emojis/${emojiMatch[2]}.${isAnim ? 'gif' : 'png'}`} alt={emojiMatch[1]} style={{ width: '22px', height: '22px', verticalAlign: 'middle', display: 'inline-block' }} />;
                          }
                          return <span key={`${i}-${j}`}>{subpart}</span>;
                        });
                      })}
                    </div>
                  )}
                  {embedImage && (
                    <div style={{ marginTop: '16px', borderRadius: '4px', overflow: 'hidden' }}>
                      <img src={embedImage} alt="Embed" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                    </div>
                  )}
                </div>
                {embedThumbnail && (
                  <div style={{ flexShrink: 0 }}>
                    <img src={embedThumbnail} alt="Thumbnail" style={{ width: '80px', height: '80px', borderRadius: '4px', objectFit: 'cover' }} />
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
