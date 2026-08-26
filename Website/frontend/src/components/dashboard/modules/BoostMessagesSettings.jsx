import React, { useState, useEffect } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';
import DiscordPreview, { parseDiscordMarkdown, replaceVariables } from '../../ui/DiscordPreview';

export default function BoostMessagesSettings({ config, channels, roles, onSave, saving, onReset }) {
  const bCfg = config?.boost || {};
  
  const [boostEnabled, setBoostEnabled] = useState(bCfg.enabled || false);
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
      enabled: boostEnabled,
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

  const [initialStateStr] = useState(() => JSON.stringify(getPayload()));
  const currentPayloadStr = JSON.stringify(getPayload());
  const isDirty = initialStateStr && currentPayloadStr !== initialStateStr;

  useEffect(() => {
    if (!initialStateStr || !isDirty) return;
    const timeoutId = setTimeout(() => {
      onSave(getPayload(), true);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentPayloadStr, initialStateStr, isDirty, onSave]);

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5 w-full">
      <div data-tour="feature-header" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gem w-5 h-5">
                <polygon points="6 3 18 3 22 9 12 22 2 9" />
                <path d="M11.7 22 8 9" />
                <path d="M12.3 22 16 9" />
                <path d="M2 9h20" />
                <path d="M6 3v6" />
                <path d="M18 3v6" />
              </svg>
            </span>
            <h1 className="text-base font-medium text-white truncate">
              Boost Messages
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-900/30 text-pink-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gem">
                  <polygon points="6 3 18 3 22 9 12 22 2 9" />
                  <path d="M11.7 22 8 9" />
                  <path d="M12.3 22 16 9" />
                  <path d="M2 9h20" />
                  <path d="M6 3v6" />
                  <path d="M18 3v6" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-semibold text-white truncate">Boost Messages</span>
                <span className="text-[13px] text-neutral-400 truncate">Announce when someone boosts the server.</span>
              </div>
            </div>
            <Toggle checked={boostEnabled} onChange={setBoostEnabled} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] p-5">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-neutral-300">Boost Channel</label>
            <span className="text-xs text-neutral-500">Where should the bot post the boost message?</span>
            <div className="w-full relative z-50">
              <CustomSelect options={channelOptions} value={channel} onChange={setChannel} placeholder="Select Channel..." />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] p-5">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-neutral-300">Reward Role</label>
            <span className="text-xs text-neutral-500">Give this role to users when they boost the server.</span>
            <div className="w-full relative z-40">
              <CustomSelect options={roleOptions} value={rewardRole} onChange={setRewardRole} placeholder="No reward role" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT COLUMN: Message Builder */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col h-full">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-800">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pen-tool w-4 h-4 text-blue-400">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">Message Builder</h3>
          </div>
          
          <div className="p-5 flex flex-col gap-6">
            <div className="flex gap-2">
              <button 
                className={`h-9 px-4 rounded-lg text-[13px] font-medium transition-colors ${mode === 'image' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`} 
                onClick={() => setMode('image')}
              >
                Image Card
              </button>
              <button 
                className={`h-9 px-4 rounded-lg text-[13px] font-medium transition-colors ${mode === 'embed' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`} 
                onClick={() => setMode('embed')}
              >
                Embed Message
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-neutral-300">Content Text</label>
              <span className="text-[11px] text-neutral-500 mb-1">Text outside the embed (e.g. {'{user}'}).</span>
              <textarea 
                className="w-full px-4 py-3 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600 resize-y" 
                rows="2" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Thank you for boosting, {user}!"
              ></textarea>
            </div>

            {mode === 'embed' && (
              <div className="bg-neutral-800/50 border border-neutral-800/50 rounded-xl p-4 flex flex-col gap-4">
                <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Embed Builder</label>
                
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-neutral-700 shrink-0">
                    <input type="color" value={embedColor} onChange={e => setEmbedColor(e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer bg-transparent border-none" />
                  </div>
                  <input type="text" className="w-32 px-4 py-2 bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700/50 font-mono text-sm uppercase" value={embedColor} onChange={e => setEmbedColor(e.target.value)} />
                </div>

                <div className="space-y-3">
                  <input type="text" className="w-full px-4 py-2 bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 focus:outline-none border-neutral-700/50" placeholder="Author Name" value={embedAuthor} onChange={e => setEmbedAuthor(e.target.value)} />
                  <input type="text" className="w-full px-4 py-2 bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 focus:outline-none border-neutral-700/50 font-semibold" placeholder="Title" value={embedTitle} onChange={e => setEmbedTitle(e.target.value)} />
                  <textarea className="w-full px-4 py-3 bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 focus:outline-none border-neutral-700/50 resize-y" rows="3" placeholder="Description" value={embedDesc} onChange={e => setEmbedDesc(e.target.value)}></textarea>
                  <input type="text" className="w-full px-4 py-2 bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 focus:outline-none border-neutral-700/50 text-xs" placeholder="Footer Text" value={embedFooter} onChange={e => setEmbedFooter(e.target.value)} />
                </div>
              </div>
            )}

            {mode === 'image' && (
              <div className="bg-neutral-800/50 border border-neutral-800/50 rounded-xl p-4 flex flex-col gap-2">
                <label className="text-[13px] font-medium text-neutral-300">Background Image URL</label>
                <span className="text-[11px] text-neutral-500 mb-1">Provide a direct URL to an image (png/jpg/gif).</span>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 focus:outline-none border-neutral-700/50" 
                  placeholder="https://example.com/image.png" 
                  value={bgImageUrl}
                  onChange={(e) => setBgImageUrl(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview & Variables as a single Tile */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-800 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye w-5 h-5 text-neutral-400">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-sm font-semibold text-white">Live Preview</span>
          </div>
          
          <div className="p-5 bg-[#313338] flex flex-col gap-6 flex-1">
            <div className="flex-1">
              {/* Note: DiscordPreview wraps itself in a block, we keep it as is, or remove its internal header since we have our own now */}
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
            </div>

            {/* Helper Variables Box */}
            <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-4 mt-auto">
              <h4 className="text-[13px] text-white font-semibold mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#EB459E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
                Variables You Can Use
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-neutral-800/50 border border-neutral-700/50 px-3 py-2 rounded-lg text-xs flex justify-between items-center"><code className="text-pink-400 font-semibold">{'{user}'}</code> <span className="text-neutral-500">@User</span></div>
                <div className="bg-neutral-800/50 border border-neutral-700/50 px-3 py-2 rounded-lg text-xs flex justify-between items-center"><code className="text-pink-400 font-semibold">{'{server}'}</code> <span className="text-neutral-500">Server Name</span></div>
                <div className="bg-neutral-800/50 border border-neutral-700/50 px-3 py-2 rounded-lg text-xs flex justify-between items-center"><code className="text-pink-400 font-semibold">{'{count}'}</code> <span className="text-neutral-500">Boost Count</span></div>
                <div className="bg-neutral-800/50 border border-neutral-700/50 px-3 py-2 rounded-lg text-xs flex justify-between items-center"><code className="text-pink-400 font-semibold">{'{id}'}</code> <span className="text-neutral-500">User ID</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
