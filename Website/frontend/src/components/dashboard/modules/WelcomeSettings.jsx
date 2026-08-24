import React, { useState } from 'react';
import SaveBar from '../../ui/SaveBar';
import CustomSelect from '../../ui/CustomSelect';
import DiscordPreview from '../../ui/DiscordPreview';

const TailwindToggle = ({ checked, onChange }) => (
    <button 
      type="button" 
      role="switch" 
      aria-checked={checked} 
      onClick={onChange}
      className={`relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 ${checked ? 'bg-white' : 'bg-neutral-800'}`}
    >
      <span className={`pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-all duration-300 ease-out will-change-transform ${checked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-400'}`} />
    </button>
);

const ModuleHeader = ({ title, description, enabled, onToggle, hasToggle = true }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <h2 className="text-2xl font-bold text-white tracking-tight mb-1">{title}</h2>
      <p className="text-neutral-400 text-sm">{description}</p>
    </div>
    {hasToggle && (
      <div className="flex items-center gap-3 px-4 py-2 bg-neutral-800/50 rounded-xl border border-neutral-800">
        <span className="text-sm font-medium text-neutral-300">
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
        <TailwindToggle checked={enabled} onChange={onToggle} />
      </div>
    )}
  </div>
);

export default function WelcomeSettings({ config, channels, onSave, saving, onReset }) {
  const wCfg = config?.welcome || {};

  const [enabled, setEnabled] = useState(wCfg.enabled || false);
  const [mode, setMode] = useState(wCfg.msg_mode || 'image');
  const [channel, setChannel] = useState(wCfg.channel_id || '');
  const [welcomeText, setWelcomeText] = useState(wCfg.message || '');
  
  const [imageUrl, setImageUrl] = useState(wCfg.image_url || '');
  const [embedAuthor, setEmbedAuthor] = useState(wCfg.embed_author || '');
  const [embedTitle, setEmbedTitle] = useState(wCfg.embed_title || '');
  const [embedDescription, setEmbedDescription] = useState(wCfg.embed_description || '');
  const [embedFooter, setEmbedFooter] = useState(wCfg.embed_footer || '');
  const [embedColor, setEmbedColor] = useState(wCfg.embed_color || '#5865F2');
  const [embedThumbnail, setEmbedThumbnail] = useState(wCfg.embed_thumbnail || '');
  const [embedImage, setEmbedImage] = useState(wCfg.embed_image || '');

  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));

  const getPayload = () => ({
      welcome: {
        enabled: enabled,
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
        embed_image: embedImage,
        embed_author_icon: wCfg.embed_author_icon || '',
        embed_footer_icon: wCfg.embed_footer_icon || '',
        embed_fields: wCfg.embed_fields || []
      }
    });

  const [initialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  const handleSave = () => {
    onSave(getPayload());
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ModuleHeader 
        title="Welcome System" 
        description="Greet new members when they join your server with a customized message or image card."
        enabled={enabled}
        onToggle={() => setEnabled(!enabled)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
        
        {/* Main Settings Column */}
        <div className="flex flex-col gap-6">
          
          {/* Channel Selection */}
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-white">Target Channel</h3>
            <p className="text-sm text-neutral-400">Select the channel where the bot should send the welcome messages.</p>
            <div className="w-full">
              <CustomSelect options={channelOptions} value={channel} onChange={setChannel} placeholder="Select Channel..." />
            </div>
          </div>

          {/* Message Builder */}
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Message Builder</h3>
              <p className="text-sm text-neutral-400">Choose between an Image Card or an Embed Message and customize the content.</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'image' ? 'bg-white text-black shadow-sm' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}
                onClick={() => setMode('image')}
              >
                Image Card
              </button>
              <button 
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'embed' ? 'bg-white text-black shadow-sm' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}
                onClick={() => setMode('embed')}
              >
                Embed Message
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-neutral-300">Content Text (Outside Embed/Image)</label>
              <textarea 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all resize-y min-h-[80px]"
                value={welcomeText} 
                onChange={(e) => setWelcomeText(e.target.value)} 
                placeholder="Welcome {user} to {server}!" 
              />
            </div>

            {mode === 'embed' && (
              <div className="flex flex-col gap-4 p-5 bg-neutral-950/50 rounded-xl border border-neutral-800/50">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-300">Embed Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={embedColor} onChange={(e) => setEmbedColor(e.target.value)} className="w-10 h-10 p-1 bg-neutral-950 border border-neutral-800 rounded-lg cursor-pointer" />
                    <input type="text" className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none w-32" value={embedColor} onChange={(e) => setEmbedColor(e.target.value)} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-300">Author Name</label>
                    <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-all" placeholder="Author..." value={embedAuthor} onChange={(e) => setEmbedAuthor(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-300">Title</label>
                    <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-all" placeholder="Title..." value={embedTitle} onChange={(e) => setEmbedTitle(e.target.value)} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-300">Description</label>
                  <textarea className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-all resize-y min-h-[100px]" placeholder="Description..." value={embedDescription} onChange={(e) => setEmbedDescription(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-300">Image URL</label>
                    <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-all" placeholder="https://..." value={embedImage} onChange={(e) => setEmbedImage(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-300">Thumbnail URL</label>
                    <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-all" placeholder="https://..." value={embedThumbnail} onChange={(e) => setEmbedThumbnail(e.target.value)} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-300">Footer Text</label>
                  <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-all" placeholder="Footer..." value={embedFooter} onChange={(e) => setEmbedFooter(e.target.value)} />
                </div>
              </div>
            )}

            {mode === 'image' && (
              <div className="flex flex-col gap-4 p-5 bg-neutral-950/50 rounded-xl border border-neutral-800/50">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-neutral-300">Background Image URL</label>
                  <p className="text-xs text-neutral-500">Provide a direct URL to an image (png/jpg/gif).</p>
                  <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-all" placeholder="https://example.com/image.png" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Sidebar Column (Preview & Variables) */}
        <div className="flex flex-col gap-6">
          <div className="sticky top-[100px] flex flex-col gap-6">
            <DiscordPreview
              content={welcomeText}
              embedColor={embedColor}
              embedAuthor={embedAuthor}
              embedTitle={embedTitle}
              embedDesc={embedDescription}
              embedFooter={embedFooter}
              embedImage={embedImage}
              embedThumbnail={embedThumbnail}
              imageUrl={imageUrl}
              mode={mode}
              accentColor="#5865F2"
              cardTitle="WELCOME"
              channels={channels}
            />

            {/* Variables Guide */}
            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Variables Guide
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-lg border border-neutral-800/50">
                  <code className="text-xs font-semibold text-blue-400">{'{user}'}</code>
                  <span className="text-xs text-neutral-500">@User</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-lg border border-neutral-800/50">
                  <code className="text-xs font-semibold text-blue-400">{'{server}'}</code>
                  <span className="text-xs text-neutral-500">Server Name</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-lg border border-neutral-800/50">
                  <code className="text-xs font-semibold text-blue-400">{'{count}'}</code>
                  <span className="text-xs text-neutral-500">Member Count</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-lg border border-neutral-800/50">
                  <code className="text-xs font-semibold text-blue-400">{'{id}'}</code>
                  <span className="text-xs text-neutral-500">User ID</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </div>
  );
}
