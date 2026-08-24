import React from 'react';

export default function BotProfile({ guildId }) {
  return (
    <div className="pb-overview-container" style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
      <div data-tour="feature-header" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot w-5 h-5">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
            </span>
            <h1 className="text-base font-medium text-white truncate">Bot Profile</h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-600">Auto-saved</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="space-y-4">
          {/* Peak Bot Card */}
          <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-[#1e1f22] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div className="relative h-[120px] w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/40 via-indigo-600/30 to-blue-600/40"></div>
              <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-horizontal w-4 h-4 text-white">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
                </div>
              </div>
            </div>
            <div className="px-5 pb-4 -mt-9 flex items-end gap-3">
              <div className="relative w-[72px] h-[72px] flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden ring-[5px] ring-[#1e1f22] bg-neutral-900">
                  <img src="/logo.png" alt="" className="w-full h-full object-cover opacity-90" />
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-[2.5px] ring-[#1e1f22]"></div>
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[18px] font-bold text-white truncate max-w-full leading-tight">Orbit Bot</span>
                  <span className="inline-flex items-center gap-0.5 pl-1 pr-1.5 py-0.5 rounded bg-[#5865F2] text-white text-[10px] font-bold uppercase tracking-wide">
                    <svg viewBox="0 0 16 16" className="w-3 h-3">
                      <path d="M5 8.5l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    App
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* Identity */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col h-full">
              <div className="px-5 py-3 border-b border-neutral-800">
                <h3 className="text-[13px] font-semibold text-white">Identity</h3>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex flex-col h-full gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-1.5">Nickname</label>
                    <div className="relative">
                      <input placeholder="Orbit Bot" maxLength="36" className="w-full bg-neutral-950 border rounded-xl px-3.5 py-2.5 pr-14 text-[14px] text-white placeholder:text-neutral-600 outline-none transition-colors border-neutral-800 hover:border-neutral-700 focus:border-neutral-600" type="text" defaultValue="" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] tabular-nums text-neutral-600">0/32</span>
                    </div>
                  </div>
                  <div className="border-t border-neutral-800/60 pt-4 flex-1 flex flex-col">
                    <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-1.5">Avatar</label>
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 group cursor-pointer transition-[border-color,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 border-[1.5px] border-dashed bg-neutral-950 border-neutral-700 hover:border-neutral-600" role="button" tabIndex="0" title="Click to upload">
                          <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-plus w-5 h-5 text-neutral-500">
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                              <line x1="16" x2="22" y1="5" y2="5"></line>
                              <line x1="19" x2="19" y1="2" y2="8"></line>
                              <circle cx="9" cy="9" r="2"></circle>
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-0">
                          <button type="button" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/60 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload w-3.5 h-3.5">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" x2="12" y1="3" y2="15"></line>
                            </svg>
                            <span>Upload</span>
                          </button>
                          <button type="button" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/60 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link2 w-3.5 h-3.5">
                              <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
                              <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
                              <line x1="8" x2="16" y1="12" y2="12"></line>
                            </svg>
                            <span>URL</span>
                          </button>
                        </div>
                      </div>
                      <input accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" type="file" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Banner */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col h-full">
              <div className="px-5 py-3 border-b border-neutral-800">
                <h3 className="text-[13px] font-semibold text-white">Banner</h3>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex flex-col h-full">
                  <div className="relative w-full aspect-[16/7] max-h-[150px] rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group transition-[border-color,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 border-[1.5px] border-dashed bg-neutral-950 border-neutral-700 hover:border-neutral-600" role="button" tabIndex="0" title="Click to upload">
                    <div className="flex flex-col items-center text-neutral-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-plus w-6 h-6 mb-1">
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                        <line x1="16" x2="22" y1="5" y2="5"></line>
                        <line x1="19" x2="19" y1="2" y2="8"></line>
                        <circle cx="9" cy="9" r="2"></circle>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                      </svg>
                      <span className="text-xs font-medium text-neutral-400">Drop or click to upload</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button type="button" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/60 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload w-3.5 h-3.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" x2="12" y1="3" y2="15"></line>
                      </svg>
                      <span>Upload</span>
                    </button>
                    <button type="button" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/60 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link2 w-3.5 h-3.5">
                        <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
                        <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
                        <line x1="8" x2="16" y1="12" y2="12"></line>
                      </svg>
                      <span>URL</span>
                    </button>
                  </div>
                  <input accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" type="file" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Bio */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col h-full">
            <div className="px-5 py-3 border-b border-neutral-800">
              <h3 className="text-[13px] font-semibold text-white">Bio</h3>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <textarea placeholder="A few words about what your server does, or what people should ask the bot for." maxLength="210" rows="3" className="w-full min-h-[86px] bg-neutral-950 border rounded-xl px-3.5 py-2.5 pr-14 text-[14px] text-white placeholder:text-neutral-600 outline-none transition-colors resize-y border-neutral-800 hover:border-neutral-700 focus:border-neutral-600"></textarea>
                  <span className="absolute right-3 top-3 text-[11px] tabular-nums text-neutral-600">0/190</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
