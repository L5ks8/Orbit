import React from 'react';

const OldPreviewEmbed = () => (
  <div className="mx-4 sm:mx-5 mb-4 sm:mb-5">
    <div className="rounded-xl overflow-hidden border border-neutral-700/30">
      <div className="bg-[#2f3136] px-4 py-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hash w-3.5 h-3.5 text-neutral-400">
          <line x1="4" x2="20" y1="9" y2="9"></line>
          <line x1="4" x2="20" y1="15" y2="15"></line>
          <line x1="10" x2="8" y1="3" y2="21"></line>
          <line x1="16" x2="14" y1="3" y2="21"></line>
        </svg>
        <span className="text-xs font-semibold text-white">welcome</span>
      </div>
      <div className="bg-[#313338] px-4 pt-3 pb-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" className="text-green-500 flex-shrink-0">
            <path fill="currentColor" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.5 7.5h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0v3h3a.5.5 0 0 1 0 1z"></path>
          </svg>
          <p className="text-xs text-neutral-500">
            <span className="font-medium text-white hover:underline cursor-pointer">@user</span> joined the server.
          </p>
        </div>
        <div className="flex gap-2.5 opacity-40 transition-opacity">
          <img src="/logo.png" alt="Peak Bot" className="w-8 h-8 rounded-full flex-shrink-0 object-cover mt-0.5" />
          <div className="w-8 h-8 rounded-full flex-shrink-0 bg-[#5865F2] items-center justify-center text-white text-xs font-bold hidden mt-0.5" aria-hidden="true">P</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
              <span className="text-xs font-semibold text-indigo-400 whitespace-nowrap">Peak Bot</span>
              <span className="inline-flex flex-shrink-0 items-center gap-[0.15em] px-1 py-px text-[10px] font-bold bg-[#5865F2] text-white rounded leading-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-[0.85em] w-[0.85em]">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>APP
              </span>
              <span className="text-xs text-neutral-500 truncate">Today at 12:00 PM</span>
            </div>
            <div style={{ borderColor: 'rgb(88, 101, 242)' }} className="border-l-[3px] rounded-r bg-[#2b2d31] max-w-full sm:max-w-[380px]">
              <div className="p-2.5 flex gap-2.5">
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs font-semibold text-white leading-snug">
                    <span>Welcome to </span><span className="bg-green-500/30 text-green-300 rounded-[3px] px-[2px]">My Server</span><span>!</span>
                  </p>
                  <p className="text-xs text-neutral-300 leading-relaxed break-all">
                    <span>Welcome </span><span className="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">@user</span><span>! We're glad to have you here.</span>
                  </p>
                  <p className="text-xs text-neutral-600 italic">Start typing to customize...</p>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-700 grid place-items-center">
                  <span className="text-[9px] font-semibold text-neutral-400">USER</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const OldPreviewText = () => (
  <div className="mx-4 sm:mx-5 mb-4 sm:mb-5">
    <div className="rounded-xl overflow-hidden border border-neutral-700/30">
      <div className="bg-[#2f3136] px-4 py-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hash w-3.5 h-3.5 text-neutral-400">
          <line x1="4" x2="20" y1="9" y2="9"></line>
          <line x1="4" x2="20" y1="15" y2="15"></line>
          <line x1="10" x2="8" y1="3" y2="21"></line>
          <line x1="16" x2="14" y1="3" y2="21"></line>
        </svg>
        <span className="text-xs font-semibold text-white">welcome</span>
      </div>
      <div className="bg-[#313338] px-4 pt-3 pb-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" className="text-green-500 flex-shrink-0">
            <path fill="currentColor" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.5 7.5h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0v3h3a.5.5 0 0 1 0 1z"></path>
          </svg>
          <p className="text-xs text-neutral-500">
            <span className="font-medium text-white hover:underline cursor-pointer">@user</span> joined the server.
          </p>
        </div>
        <div className="flex gap-2.5 transition-opacity">
          <img src="/logo.png" alt="Peak Bot" className="w-8 h-8 rounded-full flex-shrink-0 object-cover mt-0.5" />
          <div className="w-8 h-8 rounded-full flex-shrink-0 bg-[#5865F2] items-center justify-center text-white text-xs font-bold hidden mt-0.5" aria-hidden="true">P</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
              <span className="text-xs font-semibold text-indigo-400 whitespace-nowrap">Peak Bot</span>
              <span className="inline-flex flex-shrink-0 items-center gap-[0.15em] px-1 py-px text-[10px] font-bold bg-[#5865F2] text-white rounded leading-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-[0.85em] w-[0.85em]">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>APP
              </span>
              <span className="text-xs text-neutral-500 truncate">Today at 12:00 PM</span>
            </div>
            <div style={{}}>
              <p className="text-sm text-neutral-200 leading-relaxed break-all">
                <span>Welcome </span><span className="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">@user</span><span> to </span><span className="bg-green-500/30 text-green-300 rounded-[3px] px-[2px]">My Server</span><span>!</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
