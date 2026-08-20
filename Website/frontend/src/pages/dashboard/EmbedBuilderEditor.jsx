import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

function Accordion({ title, isOpen, onToggle, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', 
      borderRadius: '8px', 
      border: '1px solid rgba(255,255,255,0.05)',
      marginBottom: '12px',
      overflow: 'hidden'
    }}>
      <div 
        onClick={onToggle}
        style={{ 
          padding: '16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          background: isOpen ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
          transition: 'background 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = isOpen ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = isOpen ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)'}
      >
        <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '13px', color: 'var(--text-primary)' }}>{title}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', color: 'var(--text-secondary)' }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      {isOpen && (
        <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ marginTop: '16px' }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmbedBuilderEditor({ 
  setSidebarOpen, 
  initialEmbed, 
  onBack, 
  onSave 
}) {
  const { guildId } = useParams();
  
  // Settings
  const [channelId, setChannelId] = useState(initialEmbed?.channel_id || '');
  const [embedColor, setEmbedColor] = useState(initialEmbed?.color || '#5865F2');
  
  // Message & Embed Data
  const [content, setContent] = useState(initialEmbed?.content || '');
  
  const [authorName, setAuthorName] = useState(initialEmbed?.author_name || '');
  const [authorUrl, setAuthorUrl] = useState(initialEmbed?.author_url || '');
  const [authorIcon, setAuthorIcon] = useState(initialEmbed?.author_icon || '');
  
  const [embedTitle, setEmbedTitle] = useState(initialEmbed?.title || '');
  const [embedUrl, setEmbedUrl] = useState(initialEmbed?.url || '');
  
  const [embedDescription, setEmbedDescription] = useState(initialEmbed?.description || '');
  
  const [fields, setFields] = useState(initialEmbed?.fields || []);
  
  const [embedImage, setEmbedImage] = useState(initialEmbed?.image || '');
  const [embedThumbnail, setEmbedThumbnail] = useState(initialEmbed?.thumbnail || '');
  
  const [footerText, setFooterText] = useState(initialEmbed?.footer_text || '');
  const [footerIcon, setFooterIcon] = useState(initialEmbed?.footer_icon || '');
  
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState(null);
  
  const [openSection, setOpenSection] = useState('description');
  
  // Ref to hold current state for auto-save on unmount
  const stateRef = useRef({
    id: initialEmbed?.id,
    name: initialEmbed?.name || 'Neue Nachricht',
    channel_id: channelId,
    content: content,
    title: embedTitle,
    url: embedUrl,
    description: embedDescription,
    color: embedColor,
    author_name: authorName,
    author_url: authorUrl,
    author_icon: authorIcon,
    fields: fields,
    image: embedImage,
    thumbnail: embedThumbnail,
    footer_text: footerText,
    footer_icon: footerIcon
  });

  useEffect(() => {
    stateRef.current = {
      id: initialEmbed?.id,
      name: initialEmbed?.name || 'Neue Nachricht',
      channel_id: channelId,
      content, title: embedTitle, url: embedUrl, description: embedDescription, color: embedColor,
      author_name: authorName, author_url: authorUrl, author_icon: authorIcon,
      fields, image: embedImage, thumbnail: embedThumbnail, footer_text: footerText, footer_icon: footerIcon
    };
  }, [
    channelId, content, embedTitle, embedUrl, embedDescription, embedColor,
    authorName, authorUrl, authorIcon, fields, embedImage, embedThumbnail,
    footerText, footerIcon
  ]);

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(stateRef.current, false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [
    channelId, content, embedTitle, embedUrl, embedDescription, embedColor,
    authorName, authorUrl, authorIcon, fields, embedImage, embedThumbnail,
    footerText, footerIcon
  ]);

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
    
    // Auto-save before sending
    await onSave(stateRef.current, false);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/action/send_custom_embed/${guildId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stateRef.current)
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

  const addField = () => {
    setFields([...fields, { name: 'New Field', value: 'Field value', inline: false }]);
  };
  
  const updateField = (index, key, val) => {
    const newFields = [...fields];
    newFields[index][key] = val;
    setFields(newFields);
  };
  
  const removeField = (index) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const handleBack = () => {
    onSave(stateRef.current, true);
    onBack();
  };

  return (
    <div style={{ padding: '24px', animation: 'fadeIn 0.2s ease-out', maxWidth: '1600px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={handleBack}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Back to Messages
        </button>
        <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {initialEmbed?.name || 'New Message'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(500px, 1fr)', gap: '32px', alignItems: 'start' }}>
        
        {/* LEFT PANEL: Editor */}
        <div 
          onClick={() => {
            if (setSidebarOpen) setSidebarOpen(false);
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
        >
          
          <Accordion 
            title="SETTINGS" 
            isOpen={openSection === 'settings'} 
            onToggle={() => setOpenSection(openSection === 'settings' ? '' : 'settings')}
          >
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
            <div className="dash-form-group" style={{ marginTop: '16px' }}>
              <label style={{ fontWeight: 500 }}>Embed Color</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={embedColor} 
                  onChange={e => setEmbedColor(e.target.value)}
                  style={{ width: '44px', height: '44px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
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
          </Accordion>

          <Accordion 
            title="MESSAGE CONTENT" 
            isOpen={openSection === 'content'} 
            onToggle={() => setOpenSection(openSection === 'content' ? '' : 'content')}
          >
            <div className="dash-form-group">
              <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)}
                className="dash-input"
                rows="3"
                placeholder="Message outside the embed..."
                style={{ resize: 'vertical', padding: '12px' }}
              />
            </div>
          </Accordion>

          <Accordion 
            title="AUTHOR" 
            isOpen={openSection === 'author'} 
            onToggle={() => setOpenSection(openSection === 'author' ? '' : 'author')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="dash-form-group">
                <label>Author Name</label>
                <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} className="dash-input" />
              </div>
              <div className="dash-form-group">
                <label>Author URL</label>
                <input type="text" value={authorUrl} onChange={e => setAuthorUrl(e.target.value)} className="dash-input" />
              </div>
              <div className="dash-form-group">
                <label>Author Icon URL</label>
                <input type="text" value={authorIcon} onChange={e => setAuthorIcon(e.target.value)} className="dash-input" />
              </div>
            </div>
          </Accordion>

          <Accordion 
            title="TITLE" 
            isOpen={openSection === 'title'} 
            onToggle={() => setOpenSection(openSection === 'title' ? '' : 'title')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="dash-form-group">
                <label>Title</label>
                <input type="text" value={embedTitle} onChange={e => setEmbedTitle(e.target.value)} className="dash-input" />
              </div>
              <div className="dash-form-group">
                <label>Title URL</label>
                <input type="text" value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} className="dash-input" />
              </div>
            </div>
          </Accordion>

          <Accordion 
            title="DESCRIPTION" 
            isOpen={openSection === 'description'} 
            onToggle={() => setOpenSection(openSection === 'description' ? '' : 'description')}
          >
            <div className="dash-form-group">
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
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Variables</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => insertText(setEmbedDescription, '{user}')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer' }}>{"{user}"}</button>
                <button onClick={() => insertText(setEmbedDescription, '{server}')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer' }}>{"{server}"}</button>
                <button onClick={() => insertText(setEmbedDescription, '{membercount}')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer' }}>{"{membercount}"}</button>
                <button onClick={() => insertText(setEmbedDescription, '<#123456>')} style={{ background: 'rgba(88, 101, 242, 0.2)', color: '#c9cdfb', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer' }}>Channel Mention</button>
              </div>
              
              {emojis.length > 0 && (
                <>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '16px 0 12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Server Emojis</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                    {emojis.map(e => (
                      <div 
                        key={e.id}
                        title={`:${e.name}:`}
                        onClick={() => insertText(setEmbedDescription, `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`)}
                        style={{ width: '32px', height: '32px', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}
                      >
                        <img src={`https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}`} alt={e.name} style={{ width: '24px', height: '24px' }} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Accordion>

          <Accordion 
            title={`FIELDS (${fields.length})`} 
            isOpen={openSection === 'fields'} 
            onToggle={() => setOpenSection(openSection === 'fields' ? '' : 'fields')}
          >
            {fields.map((field, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                <button 
                  onClick={() => removeField(idx)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  title="Remove Field"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="dash-form-group">
                    <label>Name</label>
                    <input type="text" value={field.name} onChange={e => updateField(idx, 'name', e.target.value)} className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label>Value</label>
                    <textarea value={field.value} onChange={e => updateField(idx, 'value', e.target.value)} className="dash-input" rows="2" style={{ resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={field.inline} onChange={e => updateField(idx, 'inline', e.target.checked)} id={`inline-${idx}`} />
                    <label htmlFor={`inline-${idx}`} style={{ margin: 0, cursor: 'pointer' }}>Inline</label>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addField} className="dash-btn" style={{ width: '100%', padding: '12px', borderStyle: 'dashed' }}>
              + Add Field
            </button>
          </Accordion>

          <Accordion 
            title="IMAGES" 
            isOpen={openSection === 'images'} 
            onToggle={() => setOpenSection(openSection === 'images' ? '' : 'images')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="dash-form-group">
                <label>Image URL</label>
                <input type="text" value={embedImage} onChange={e => setEmbedImage(e.target.value)} className="dash-input" />
              </div>
              <div className="dash-form-group">
                <label>Thumbnail URL</label>
                <input type="text" value={embedThumbnail} onChange={e => setEmbedThumbnail(e.target.value)} className="dash-input" />
              </div>
            </div>
          </Accordion>

          <Accordion 
            title="FOOTER" 
            isOpen={openSection === 'footer'} 
            onToggle={() => setOpenSection(openSection === 'footer' ? '' : 'footer')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="dash-form-group">
                <label>Footer Text</label>
                <input type="text" value={footerText} onChange={e => setFooterText(e.target.value)} className="dash-input" />
              </div>
              <div className="dash-form-group">
                <label>Footer Icon URL</label>
                <input type="text" value={footerIcon} onChange={e => setFooterIcon(e.target.value)} className="dash-input" />
              </div>
            </div>
          </Accordion>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
            <button 
              className="dash-btn primary" 
              onClick={handleSend}
              disabled={isSubmitting}
              style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 600, borderRadius: '8px' }}
            >
              {isSubmitting ? 'Sending...' : 'Send to Channel'}
            </button>
            {statusMsg && (
              <span style={{ color: statusMsg.includes('Error') ? '#ef4444' : '#10b981', fontSize: '14px', whiteSpace: 'nowrap', fontWeight: 500 }}>
                {statusMsg}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Live Preview */}
        <div>
          <div style={{ position: 'sticky', top: '24px' }}>
            
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
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginTop: '4px' }} 
                  alt="Bot Avatar"
                  onError={(e) => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png' }}
                />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: '#f2f3f5', fontSize: '16px' }}>Orbit</span>
                    <span style={{ background: '#5865F2', color: '#fff', fontSize: '10px', padding: '0 4px', borderRadius: '4px', height: '15px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>APP</span>
                    <span style={{ color: '#949ba4', fontSize: '12px' }}>Today at 12:00 PM</span>
                  </div>
                  
                  {/* Message Content */}
                  {content && (
                    <div style={{ color: '#dbdee1', fontSize: '15px', lineHeight: '1.375', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
                      {content}
                    </div>
                  )}

                  {(!embedTitle && !embedDescription && !embedImage && !embedThumbnail && !authorName && fields.length === 0 && !footerText) ? (
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
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          
                          {/* Author */}
                          {authorName && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {authorIcon && <img src={authorIcon} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} onError={e => e.target.style.display='none'} />}
                              <span style={{ color: '#f2f3f5', fontWeight: 600, fontSize: '14px' }}>
                                {authorUrl ? <a href={authorUrl} style={{ color: '#f2f3f5', textDecoration: 'none' }} target="_blank" rel="noreferrer">{authorName}</a> : authorName}
                              </span>
                            </div>
                          )}

                          {/* Title */}
                          {embedTitle && (
                            <div style={{ color: embedUrl ? '#00a8fc' : '#f2f3f5', fontWeight: 600, fontSize: '16px' }}>
                              {embedUrl ? <a href={embedUrl} style={{ color: '#00a8fc', textDecoration: 'none' }} target="_blank" rel="noreferrer">{embedTitle}</a> : embedTitle}
                            </div>
                          )}
                          
                          {/* Description */}
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

                          {/* Fields */}
                          {fields.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                              {fields.map((f, i) => (
                                <div key={i} style={{ minWidth: f.inline ? '150px' : '100%', flex: f.inline ? '1 1 calc(33% - 8px)' : '1 1 100%' }}>
                                  <div style={{ color: '#f2f3f5', fontSize: '14px', fontWeight: 600, marginBottom: '2px', wordBreak: 'break-word' }}>{f.name || '​'}</div>
                                  <div style={{ color: '#dbdee1', fontSize: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{f.value || '​'}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Image */}
                          {embedImage && (
                            <div style={{ marginTop: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                              <img src={embedImage} alt="Embed" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                            </div>
                          )}
                        </div>
                        
                        {/* Thumbnail */}
                        {embedThumbnail && (
                          <div style={{ flexShrink: 0 }}>
                            <img src={embedThumbnail} alt="Thumbnail" style={{ width: '80px', height: '80px', borderRadius: '4px', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {footerText && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                          {footerIcon && <img src={footerIcon} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} onError={e => e.target.style.display='none'} />}
                          <span style={{ color: '#f2f3f5', fontSize: '12px', fontWeight: 500 }}>{footerText}</span>
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
    </div>
  );
}
