import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

function Accordion({ title, count, isOpen, onToggle, children }) {
  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden transition-all mb-3.5">
      <div 
        onClick={onToggle}
        className={`px-4 sm:px-5 py-3.5 flex items-center justify-between cursor-pointer select-none transition-colors hover:bg-white/[0.02] ${isOpen ? 'border-b border-neutral-800' : ''}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            {title}
          </span>
          {count !== undefined && (
            <span className="text-[11px] font-semibold text-neutral-500 px-2 py-0.5 rounded-md bg-neutral-800">
              {count}
            </span>
          )}
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4">
          {children}
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
  const [savedStatus, setSavedStatus] = useState('All changes saved');
  
  const [openSection, setOpenSection] = useState('settings');
  
  const stateRef = useRef({
    id: initialEmbed?.id,
    name: initialEmbed?.name || 'New Message',
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
      name: initialEmbed?.name || 'New Message',
      channel_id: channelId,
      content, title: embedTitle, url: embedUrl, description: embedDescription, color: embedColor,
      author_name: authorName, author_url: authorUrl, author_icon: authorIcon,
      fields, image: embedImage, thumbnail: embedThumbnail, footer_text: footerText, footer_icon: footerIcon
    };
  }, [
    channelId, content, embedTitle, embedUrl, embedDescription, embedColor,
    authorName, authorUrl, authorIcon, fields, embedImage, embedThumbnail,
    footerText, footerIcon, initialEmbed
  ]);

  useEffect(() => {
    setSavedStatus('Saving changes...');
    const timer = setTimeout(() => {
      onSave(stateRef.current, false);
      setSavedStatus('All changes saved');
    }, 2000);
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
      setStatusMsg('Please select a target channel first.');
      return;
    }
    
    setIsSubmitting(true);
    setStatusMsg('Sending message...');
    
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
        setStatusMsg('Message sent successfully!');
      } else {
        setStatusMsg(`Error: ${data.error || 'Failed to send'}`);
      }
      
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setStatusMsg('Error: Network error occurred.');
      setTimeout(() => setStatusMsg(''), 4000);
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
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1400px] mx-auto flex flex-col gap-6 font-sans">
      {/* Top action header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleBack}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <div>
            <h1 className="text-sm font-semibold text-white">
              {initialEmbed?.name || 'New Message'}
            </h1>
            <p className="text-[11px] text-neutral-500">
              {savedStatus}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin text-black" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send to Channel
            </>
          )}
        </button>
      </div>

      {/* Editor & Preview 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_540px] gap-6 items-start">
        
        {/* LEFT COLUMN: Controls */}
        <div 
          onClick={() => {
            if (setSidebarOpen) setSidebarOpen(false);
          }}
          className="flex flex-col min-w-0"
        >
          {/* Section: Settings */}
          <Accordion 
            title="Target & Color" 
            isOpen={openSection === 'settings'} 
            onToggle={() => setOpenSection(openSection === 'settings' ? '' : 'settings')}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Target Channel <span className="text-neutral-500">*</span>
                </label>
                <select 
                  value={channelId} 
                  onChange={e => setChannelId(e.target.value)}
                  className="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white outline-none transition-all cursor-pointer"
                >
                  <option value="">-- Select Channel --</option>
                  {channels.map(c => (
                    <option key={c.id} value={c.id}>#{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Embed Accent Color
                </label>
                <div className="flex gap-2.5 items-center">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-neutral-700 flex-shrink-0">
                    <input 
                      type="color" 
                      value={embedColor} 
                      onChange={e => setEmbedColor(e.target.value)}
                      className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={embedColor} 
                    onChange={e => setEmbedColor(e.target.value)}
                    placeholder="#5865F2"
                    className="flex-1 h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white font-mono placeholder-neutral-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </Accordion>

          {/* Section: Message Content */}
          <Accordion 
            title="Message Text (Outside Embed)" 
            isOpen={openSection === 'content'} 
            onToggle={() => setOpenSection(openSection === 'content' ? '' : 'content')}
          >
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Plain Text
              </label>
              <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)}
                rows={3}
                placeholder="Mention roles (@everyone) or write introductory text outside the card..."
                className="w-full bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl p-3 text-sm text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-white/10 transition-all resize-y min-h-[80px]"
              />
            </div>
          </Accordion>

          {/* Section: Author */}
          <Accordion 
            title="Author" 
            isOpen={openSection === 'author'} 
            onToggle={() => setOpenSection(openSection === 'author' ? '' : 'author')}
          >
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Author Name
                </label>
                <input 
                  type="text" 
                  value={authorName} 
                  onChange={e => setAuthorName(e.target.value)} 
                  placeholder="e.g. Server Announcements"
                  className="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Author URL
                </label>
                <input 
                  type="text" 
                  value={authorUrl} 
                  onChange={e => setAuthorUrl(e.target.value)} 
                  placeholder="https://..."
                  className="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Author Icon URL
                </label>
                <input 
                  type="text" 
                  value={authorIcon} 
                  onChange={e => setAuthorIcon(e.target.value)} 
                  placeholder="https://... (image url)"
                  className="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>
            </div>
          </Accordion>

          {/* Section: Title */}
          <Accordion 
            title="Title" 
            isOpen={openSection === 'title'} 
            onToggle={() => setOpenSection(openSection === 'title' ? '' : 'title')}
          >
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Embed Title
                </label>
                <input 
                  type="text" 
                  value={embedTitle} 
                  onChange={e => setEmbedTitle(e.target.value)} 
                  placeholder="Header title..."
                  className="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Title Link URL
                </label>
                <input 
                  type="text" 
                  value={embedUrl} 
                  onChange={e => setEmbedUrl(e.target.value)} 
                  placeholder="https://..."
                  className="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>
            </div>
          </Accordion>

          {/* Section: Description */}
          <Accordion 
            title="Description" 
            isOpen={openSection === 'description'} 
            onToggle={() => setOpenSection(openSection === 'description' ? '' : 'description')}
          >
            <div className="space-y-3.5">
              <textarea 
                value={embedDescription} 
                onChange={e => setEmbedDescription(e.target.value)} 
                rows={5}
                placeholder="Type your embed body text here... (supports Discord Markdown)"
                className="w-full bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl p-3.5 text-sm text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-white/10 transition-all resize-y min-h-[120px]"
              />
              
              {/* Variable Pills */}
              <div className="p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-800 space-y-2.5">
                <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Insert Variables
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '{user}', val: '{user}' },
                    { label: '{server}', val: '{server}' },
                    { label: '{membercount}', val: '{membercount}' },
                    { label: '#channel', val: '<#channel_id>' }
                  ].map(v => (
                    <button
                      key={v.label}
                      type="button"
                      onClick={() => insertText(setEmbedDescription, v.val)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono transition-all active:scale-95"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                {emojis.length > 0 && (
                  <div className="pt-2 border-t border-neutral-800/80">
                    <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Server Emojis
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {emojis.map(e => (
                        <button
                          key={e.id}
                          type="button"
                          title={`:${e.name}:`}
                          onClick={() => insertText(setEmbedDescription, `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`)}
                          className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 flex items-center justify-center transition-all active:scale-90"
                        >
                          <img
                            src={`https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}`}
                            alt={e.name}
                            className="w-5 h-5 object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Accordion>

          {/* Section: Fields */}
          <Accordion 
            title="Fields" 
            count={fields.length}
            isOpen={openSection === 'fields'} 
            onToggle={() => setOpenSection(openSection === 'fields' ? '' : 'fields')}
          >
            <div className="space-y-3.5">
              {fields.map((field, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-800 relative space-y-3"
                >
                  <button 
                    type="button"
                    onClick={() => removeField(idx)}
                    className="absolute top-3 right-3 text-neutral-500 hover:text-rose-400 transition-colors"
                    title="Remove Field"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                      Field Title
                    </label>
                    <input 
                      type="text" 
                      value={field.name} 
                      onChange={e => updateField(idx, 'name', e.target.value)} 
                      className="w-full h-9 px-3 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-lg text-xs text-white placeholder-neutral-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                      Field Value
                    </label>
                    <textarea 
                      value={field.value} 
                      onChange={e => updateField(idx, 'value', e.target.value)} 
                      rows={2} 
                      className="w-full bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-all resize-y"
                    />
                  </div>

                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={field.inline} 
                      onChange={e => updateField(idx, 'inline', e.target.checked)} 
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-white focus:ring-0 cursor-pointer accent-neutral-300"
                    />
                    <span className="text-xs text-neutral-400 font-medium">Display Inline (side-by-side)</span>
                  </label>
                </div>
              ))}

              <button 
                type="button"
                onClick={addField}
                className="w-full py-2.5 rounded-xl border border-dashed border-neutral-700 hover:border-neutral-500 text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Field
              </button>
            </div>
          </Accordion>

          {/* Section: Images */}
          <Accordion 
            title="Images & Thumbnails" 
            isOpen={openSection === 'images'} 
            onToggle={() => setOpenSection(openSection === 'images' ? '' : 'images')}
          >
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Main Big Image URL
                </label>
                <input 
                  type="text" 
                  value={embedImage} 
                  onChange={e => setEmbedImage(e.target.value)} 
                  placeholder="https://... (banner or graphic image)"
                  className="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Small Thumbnail URL
                </label>
                <input 
                  type="text" 
                  value={embedThumbnail} 
                  onChange={e => setEmbedThumbnail(e.target.value)} 
                  placeholder="https://... (top-right corner icon)"
                  className="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>
            </div>
          </Accordion>

          {/* Section: Footer */}
          <Accordion 
            title="Footer" 
            isOpen={openSection === 'footer'} 
            onToggle={() => setOpenSection(openSection === 'footer' ? '' : 'footer')}
          >
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Footer Text
                </label>
                <input 
                  type="text" 
                  value={footerText} 
                  onChange={e => setFooterText(e.target.value)} 
                  placeholder="Footer note..."
                  className="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Footer Icon URL
                </label>
                <input 
                  type="text" 
                  value={footerIcon} 
                  onChange={e => setFooterIcon(e.target.value)} 
                  placeholder="https://..."
                  className="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 rounded-xl text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>
            </div>
          </Accordion>
        </div>

        {/* RIGHT COLUMN: Live Discord Preview */}
        <div className="sticky top-6">
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Live Discord Preview
              </span>
              <span className="w-2 h-2 rounded-full bg-neutral-400" />
            </div>

            {/* Authentic Discord Message Box */}
            <div className="bg-[#313338] rounded-xl p-4 text-[#dbdee1] font-sans border border-neutral-800/80 shadow-md">
              <div className="flex gap-3.5 mb-2">
                <img 
                  src="/img/logo.png" 
                  alt="Bot Avatar"
                  className="w-10 h-10 rounded-full object-cover mt-0.5 flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">Orbit</span>
                    <span className="bg-[#5865F2] text-white text-[10px] px-1 py-0.5 rounded font-bold uppercase tracking-wider leading-none">
                      APP
                    </span>
                    <span className="text-[11px] text-[#949ba4]">Today at 12:00 PM</span>
                  </div>
                  
                  {/* Outside Message Content */}
                  {content && (
                    <div className="text-[#dbdee1] text-sm leading-relaxed mb-2.5 whitespace-pre-wrap break-words">
                      {content}
                    </div>
                  )}

                  {/* Empty embed state notice */}
                  {(!embedTitle && !embedDescription && !embedImage && !embedThumbnail && !authorName && fields.length === 0 && !footerText) ? (
                    <div className="text-xs text-[#949ba4] italic py-1">
                      Start filling out the sections on the left to see your embed preview...
                    </div>
                  ) : (
                    /* The Embed Box */
                    <div 
                      className="bg-[#2b2d31] rounded p-4 max-w-[500px] flex flex-col gap-2 border-l-4"
                      style={{ borderLeftColor: embedColor || '#202225' }}
                    >
                      <div className="flex gap-4">
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                          {/* Author */}
                          {authorName && (
                            <div className="flex items-center gap-2">
                              {authorIcon && (
                                <img 
                                  src={authorIcon} 
                                  alt="" 
                                  className="w-5 h-5 rounded-full object-cover flex-shrink-0" 
                                  onError={e => e.target.style.display='none'} 
                                />
                              )}
                              <span className="text-white font-semibold text-xs truncate">
                                {authorUrl ? (
                                  <a href={authorUrl} target="_blank" rel="noreferrer" className="text-white hover:underline">
                                    {authorName}
                                  </a>
                                ) : authorName}
                              </span>
                            </div>
                          )}

                          {/* Title */}
                          {embedTitle && (
                            <div className="font-semibold text-sm">
                              {embedUrl ? (
                                <a href={embedUrl} target="_blank" rel="noreferrer" className="text-[#00a8fc] hover:underline">
                                  {embedTitle}
                                </a>
                              ) : (
                                <span className="text-white">{embedTitle}</span>
                              )}
                            </div>
                          )}
                          
                          {/* Description */}
                          {embedDescription && (
                            <div className="text-[#dbdee1] text-xs leading-relaxed whitespace-pre-wrap break-words">
                              {embedDescription.split(/(<@[!&]?\d+>|<#\d+>)/g).map((part, i) => {
                                if (part.startsWith('<#') || part.startsWith('<@')) {
                                  return (
                                    <span key={i} className="bg-[#5865f2]/30 text-[#c9cdfb] px-1 rounded text-xs">
                                      {part}
                                    </span>
                                  );
                                }
                                return part.split(/(<a?:[a-zA-Z0-9_]+:\d+>)/g).map((subpart, j) => {
                                  const emojiMatch = subpart.match(/<a?:([a-zA-Z0-9_]+):(\d+)>/);
                                  if (emojiMatch) {
                                    const isAnim = subpart.startsWith('<a:');
                                    return (
                                      <img 
                                        key={`${i}-${j}`} 
                                        src={`https://cdn.discordapp.com/emojis/${emojiMatch[2]}.${isAnim ? 'gif' : 'png'}`} 
                                        alt={emojiMatch[1]} 
                                        className="w-5 h-5 inline-block align-middle mx-0.5" 
                                      />
                                    );
                                  }
                                  return <span key={`${i}-${j}`}>{subpart}</span>;
                                });
                              })}
                            </div>
                          )}

                          {/* Fields Grid */}
                          {fields.length > 0 && (
                            <div className="flex flex-wrap gap-2.5 mt-1">
                              {fields.map((f, i) => (
                                <div 
                                  key={i} 
                                  className={f.inline ? "min-w-[120px] flex-1" : "w-full"}
                                >
                                  <div className="text-white text-xs font-semibold break-words">
                                    {f.name || '\u200B'}
                                  </div>
                                  <div className="text-[#dbdee1] text-xs whitespace-pre-wrap break-words">
                                    {f.value || '\u200B'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Big Image */}
                          {embedImage && (
                            <div className="mt-2 rounded overflow-hidden max-h-72">
                              <img 
                                src={embedImage} 
                                alt="Embed" 
                                className="w-full object-contain max-h-72" 
                                onError={(e) => e.target.style.display = 'none'} 
                              />
                            </div>
                          )}
                        </div>
                        
                        {/* Thumbnail */}
                        {embedThumbnail && (
                          <div className="flex-shrink-0">
                            <img 
                              src={embedThumbnail} 
                              alt="Thumbnail" 
                              className="w-16 h-16 rounded object-cover" 
                              onError={(e) => e.target.style.display = 'none'} 
                            />
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {footerText && (
                        <div className="flex items-center gap-2 mt-2 pt-1">
                          {footerIcon && (
                            <img 
                              src={footerIcon} 
                              alt="" 
                              className="w-4 h-4 rounded-full object-cover flex-shrink-0" 
                              onError={e => e.target.style.display='none'} 
                            />
                          )}
                          <span className="text-[#949ba4] text-[11px] font-medium">
                            {footerText}
                          </span>
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

      {/* Floating Status Notification */}
      {statusMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2 ${
          statusMsg.startsWith('Error') 
            ? 'bg-rose-950/90 border-rose-800 text-rose-200' 
            : 'bg-neutral-900 border-neutral-800 text-white'
        }`}>
          <span>{statusMsg}</span>
          <button 
            type="button"
            onClick={() => setStatusMsg('')}
            className="text-neutral-500 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
