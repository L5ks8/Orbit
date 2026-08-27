import React from "react";

export default function AIBuilder({ guildId }) {
  return (
    <>
      <style>{`
        .dash-content-area {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }
      `}</style>
      <div className="p-4 lg:p-6 xl:p-8 flex-1 min-w-0 flex flex-col w-full h-full">
        <div className="relative w-full flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 opacity-0 pointer-events-none"></div>
        <div className="fixed left-0 top-0 h-full w-[90vw] sm:w-[85vw] max-w-80 z-50 lg:hidden transition-transform duration-300 ease-out border-r border-neutral-800 -translate-x-full">
          <div className="flex flex-col h-full bg-neutral-900">
            <div className="px-2 pt-2 pb-1.5 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <button className="flex-1 flex items-center gap-2 px-3 h-9 rounded-lg text-[13.5px] font-medium text-neutral-100 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.06] transition-[background-color,transform] duration-150 ease-out active:scale-[0.99]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-square-pen w-4 h-4 text-neutral-300"
                  >
                    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                  New chat
                </button>
                <button
                  className="grid place-items-center h-9 w-9 rounded-lg hover:bg-white/[0.06] text-neutral-500 transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96]"
                  title="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-x w-4 h-4"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
              <div className="relative mt-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-search absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  placeholder="Search chats…"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-8 pr-8 h-9 text-base sm:text-[13px] text-white placeholder:text-neutral-500 focus:outline-none focus:bg-white/[0.05] focus:border-white/[0.1] transition-[background-color,border-color]"
                  type="text"
                  value=""
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
              <div className="">
                <div className="px-3.5 pb-1">
                  <span className="text-[11px] font-medium text-neutral-500">
                    Today
                  </span>
                </div>
                <div className="px-1.5" style={{ opacity: "1" }}>
                  <div className="group/row relative flex items-center rounded-lg cursor-pointer h-[38px] pl-3 pr-1 transition-colors duration-150 bg-white/[0.08] text-white">
                    <span className="flex-1 min-w-0 truncate text-[13.5px] font-medium pr-1">
                      yo
                    </span>
                    <button
                      className="relative grid place-items-center h-7 w-7 flex-shrink-0 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.1] transition-[opacity,color,background-color,transform] duration-150 active:scale-[0.94] before:absolute before:inset-[-6px] before:content-[''] opacity-100"
                      title="Options"
                      aria-label="Chat options"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-more-horizontal w-4 h-4"
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="19" cy="12" r="1" />
                        <circle cx="5" cy="12" r="1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-2 py-1.5 flex-shrink-0 border-t border-white/[0.05]">
              <button className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-[12px] text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-trash2 w-3.5 h-3.5"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </svg>
                Clear all
              </button>
            </div>
          </div>
        </div>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 2xl:hidden transition-opacity duration-300 opacity-0 pointer-events-none"></div>
        <div className="fixed inset-x-0 bottom-0 top-16 z-50 2xl:hidden transition-transform duration-300 ease-out translate-y-full">
          <div
            data-tour="builder-features-panel"
            className="h-full overflow-hidden rounded-t-2xl border-t border-white/[0.08] bg-neutral-900 shadow-[0_-16px_40px_-12px_rgba(0,0,0,0.6)]"
          >
            <div className="h-full w-full flex flex-col min-h-0 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="flex-shrink-0 flex items-center justify-between px-4 h-12 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-sparkles w-4 h-4 text-neutral-300"
                  >
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    <path d="M5 3v4" />
                    <path d="M19 17v4" />
                    <path d="M3 5h4" />
                    <path d="M17 19h4" />
                  </svg>
                  <span className="text-[13.5px] font-semibold text-neutral-100">
                    Features
                  </span>
                </div>
                <button
                  className="relative grid place-items-center h-8 w-8 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.06] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96] before:absolute before:inset-[-4px] before:content-['']"
                  title="Close features"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-x w-4 h-4"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
                <p className="px-2.5 pt-2 pb-1 text-[12.5px] text-neutral-500 text-pretty">
                  Nothing set up yet. Pick a feature below and the AI will
                  configure it for you.
                </p>
                <div className="pt-2">
                  <div className="px-2.5 pb-1.5">
                    <span className="text-[11px] font-medium text-neutral-500">
                      Add a feature
                    </span>
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-users w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(87, 242, 135)" }}
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Welcome Messages
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Greet new members
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-log-out w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(148, 163, 184)" }}
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" x2="9" y1="12" y2="12" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Goodbye Messages
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Message when members leave
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-volume2 w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(88, 101, 242)" }}
                      >
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Join-to-Create
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Temporary voice channels
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-mouse-pointer-click w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(230, 126, 34)" }}
                      >
                        <path d="m9 9 5 12 1.8-5.2L21 14Z" />
                        <path d="M7.2 2.2 8 5.1" />
                        <path d="m5.1 8-2.9-.8" />
                        <path d="M14 4.1 12 6" />
                        <path d="m6 12-1.9 2" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Reaction Roles
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Roles from reactions
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-ticket w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(235, 69, 158)" }}
                      >
                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                        <path d="M13 5v2" />
                        <path d="M13 17v2" />
                        <path d="M13 11v2" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Tickets
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Private support threads
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-sparkles w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(254, 231, 92)" }}
                      >
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                        <path d="M5 3v4" />
                        <path d="M19 17v4" />
                        <path d="M3 5h4" />
                        <path d="M17 19h4" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          XP &amp; Leveling
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Levels and leaderboards
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-gift w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(46, 204, 113)" }}
                      >
                        <rect x="3" y="8" width="18" height="4" rx="1" />
                        <path d="M12 8v13" />
                        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Giveaways
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Run giveaways
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-scroll-text w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(155, 89, 182)" }}
                      >
                        <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
                        <path d="M19 17V5a2 2 0 0 0-2-2H4" />
                        <path d="M15 8h-5" />
                        <path d="M15 12h-5" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Logging
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Log server events
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-message-square-off w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(52, 152, 219)" }}
                      >
                        <path d="M21 15V5a2 2 0 0 0-2-2H9" />
                        <path d="m2 2 20 20" />
                        <path d="M3.6 3.6c-.4.3-.6.8-.6 1.4v16l4-4h10" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Content Filter
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Block bad words &amp; profanity
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-shield-alert w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(249, 115, 22)" }}
                      >
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Spam Protection
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Stop message flooding
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-link2-off w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(56, 189, 248)" }}
                      >
                        <path d="M9 17H7A5 5 0 0 1 7 7" />
                        <path d="M15 7h2a5 5 0 0 1 4 8" />
                        <line x1="8" x2="12" y1="12" y2="12" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Link Filter
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Control links &amp; invites
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-shield-x w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(220, 38, 38)" }}
                      >
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                        <path d="m14.5 9.5-5 5" />
                        <path d="m9.5 9.5 5 5" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Anti-Raid
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Stop join-raid bursts
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-shield w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(237, 66, 69)" }}
                      >
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Anti-Nuke
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Block mass-delete &amp; ban attacks
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-user-x w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(245, 158, 11)" }}
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="17" x2="22" y1="8" y2="13" />
                        <line x1="22" x2="17" y1="8" y2="13" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Suspicious Accounts
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Flag risky new accounts
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-bot w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(124, 58, 237)" }}
                      >
                        <path d="M12 8V4H8" />
                        <rect width="16" height="12" x="4" y="8" rx="2" />
                        <path d="M2 14h2" />
                        <path d="M20 14h2" />
                        <path d="M15 13v2" />
                        <path d="M9 13v2" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          AI Moderation
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          AI reads &amp; moderates messages (Pro)
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-puzzle w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(128, 132, 142)" }}
                      >
                        <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Image Moderation
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          AI-scan posted images (Pro)
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check-circle2 w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(20, 184, 166)" }}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Verification
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Gate new members
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-file-text w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(52, 211, 153)" }}
                      >
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        <path d="M10 9H8" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Onboarding
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          New-member setup flow
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-user-plus w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(255, 152, 0)" }}
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" x2="19" y1="8" y2="14" />
                        <line x1="22" x2="16" y1="11" y2="11" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Invite Tracker
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Track who invited who
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-bell w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(245, 158, 11)" }}
                      >
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Notifications
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Social &amp; stream alerts
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed="false"
                      className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-user-minus w-[18px] h-[18px] flex-shrink-0 opacity-75"
                        style={{ color: "rgb(100, 116, 139)" }}
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="22" x2="16" y1="11" y2="11" />
                      </svg>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                          Inactive Kick
                        </span>
                        <span className="block text-[12px] text-neutral-500 truncate">
                          Remove inactive members
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex-1 flex gap-2 sm:gap-4 min-h-0">
          <div
            data-tour="builder-chats"
            className="scroll-mt-24 hidden lg:flex shrink-0 overflow-hidden transition-[width] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ width: "296px" }}
          >
            <div className="w-full flex flex-col flex-shrink-0 overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl">
              <div className="px-2 pt-2 pb-1.5 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <button className="flex-1 flex items-center gap-2 px-3 h-9 rounded-lg text-[13.5px] font-medium text-neutral-100 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.06] transition-[background-color,transform] duration-150 ease-out active:scale-[0.99]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-square-pen w-4 h-4 text-neutral-300"
                    >
                      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                    </svg>
                    New chat
                  </button>
                  <button
                    className="grid place-items-center h-9 w-9 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-neutral-300 transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96]"
                    title="Collapse sidebar"
                    aria-label="Collapse sidebar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-panel-left-close w-4 h-4"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M9 3v18" />
                      <path d="m16 15-3-3 3-3" />
                    </svg>
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-search absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    placeholder="Search chats…"
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-8 pr-8 h-9 text-base sm:text-[13px] text-white placeholder:text-neutral-500 focus:outline-none focus:bg-white/[0.05] focus:border-white/[0.1] transition-[background-color,border-color]"
                    type="text"
                    value=""
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
                <div className="">
                  <div className="px-3.5 pb-1">
                    <span className="text-[11px] font-medium text-neutral-500">
                      Today
                    </span>
                  </div>
                  <div className="px-1.5" style={{ opacity: "1" }}>
                    <div className="group/row relative flex items-center rounded-lg cursor-pointer h-[38px] pl-3 pr-1 transition-colors duration-150 bg-white/[0.08] text-white">
                      <span className="flex-1 min-w-0 truncate text-[13.5px] font-medium pr-1">
                        yo
                      </span>
                      <button
                        className="relative grid place-items-center h-7 w-7 flex-shrink-0 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.1] transition-[opacity,color,background-color,transform] duration-150 active:scale-[0.94] before:absolute before:inset-[-6px] before:content-[''] opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100"
                        title="Options"
                        aria-label="Chat options"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-more-horizontal w-4 h-4"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="19" cy="12" r="1" />
                          <circle cx="5" cy="12" r="1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-2 py-1.5 flex-shrink-0 border-t border-white/[0.05]">
                <button className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-[12px] text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-trash2 w-3.5 h-3.5"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                  Clear all
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-0 lg:gap-4 min-h-0">
            <div className="flex lg:hidden gap-1.5 p-1.5 bg-neutral-900 border border-neutral-800 border-b-0 rounded-t-2xl flex-shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
              <button
                className="px-3 py-2.5 text-sm font-medium rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                title="Chat history"
                aria-label="Chat history"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-file-text w-5 h-5"
                >
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="M10 9H8" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                </svg>
              </button>
              <button className="relative flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-[color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-white">
                <span
                  className="absolute inset-0 bg-neutral-700 rounded-lg shadow-sm"
                  style={{ opacity: "1" }}
                ></span>
                <span className="relative z-10">Chat</span>
              </button>
              <button className="relative flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-[color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-neutral-400">
                <span className="relative z-10">Preview</span>
              </button>
            </div>
            <div className="lg:flex-[12] flex flex-col min-h-0 min-w-0 flex-1">
              <div className="relative h-full flex flex-col min-h-0 bg-neutral-900 border border-white/[0.06] ring-1 ring-white/[0.02] rounded-2xl max-lg:rounded-t-none overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <input
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  type="file"
                />
                <div className="flex-shrink-0 flex items-center justify-between px-2 sm:px-4 py-3 min-h-[52px] border-b border-neutral-800">
                  <div></div>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-2.5 sm:p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-[color,background-color,transform] active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
                      title="Undo (Ctrl+Z)"
                      aria-label="Undo (Ctrl+Z)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-undo2 w-5 h-5 sm:w-4 sm:h-4"
                      >
                        <path d="M9 14 4 9l5-5" />
                        <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                      </svg>
                    </button>
                    <button
                      disabled=""
                      className="p-2.5 sm:p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-[color,background-color,transform] active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
                      title="Redo (Ctrl+Y)"
                      aria-label="Redo (Ctrl+Y)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-redo2 w-5 h-5 sm:w-4 sm:h-4"
                      >
                        <path d="m15 14 5-5-5-5" />
                        <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" />
                      </svg>
                    </button>
                    <div className="relative">
                      <button
                        className="p-2.5 sm:p-1.5 rounded-lg transition-[color,background-color,transform] active:scale-[0.96] text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title="Action History"
                        aria-label="Action History"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-history w-5 h-5 sm:w-4 sm:h-4"
                        >
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                          <path d="M12 7v5l4 2" />
                        </svg>
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[8px] font-bold tabular-nums bg-neutral-600 text-white rounded-full flex items-center justify-center">
                          9
                        </span>
                      </button>
                    </div>
                    <button
                      className="p-2.5 sm:p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-[color,background-color,transform] active:scale-[0.96]"
                      title="New chat"
                      aria-label="New chat"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-rotate-ccw w-5 h-5 sm:w-4 sm:h-4"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
                    <div className="w-full my-auto space-y-6 sm:space-y-8">
                      <div className="flex gap-3.5 group flex-row-reverse">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ring-1 ring-white/[0.06] bg-neutral-800">
                          <img
                            src="https://cdn.discordapp.com/avatars/1195055294380781629/07be856d3472ba59bf51e3fa5a77a595.png?size=64"
                            alt="l5ks8"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col items-end">
                          <div className="inline-block max-w-[80%] px-4 py-2.5 rounded-2xl bg-neutral-800/70 ring-1 ring-white/[0.06] text-[15px] font-medium leading-[1.55] text-neutral-100 text-pretty break-words">
                            <div className="">
                              <p className="my-1">yo</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3.5 group ">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ring-1 ring-white/[0.06]">
                          <img
                            src="/logo.png"
                            alt="Peak"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 ">
                          <div className="block max-w-[88%] text-[15px] leading-[1.65] text-neutral-100 text-pretty break-words">
                            <div className="flex flex-col">
                              <button
                                type="button"
                                className="group/se flex min-h-10 items-center gap-2 text-left -ml-0.5 rounded-md px-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15"
                                aria-expanded="true"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-check-circle2 h-[15px] w-[15px] flex-shrink-0 text-neutral-500"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="m9 12 2 2 4-4" />
                                </svg>
                                <span className="truncate text-[13.5px] leading-snug text-neutral-400 transition-colors group-hover/se:text-neutral-300">
                                  Reviewed your server
                                </span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-chevron-down h-3.5 w-3.5 flex-shrink-0 text-neutral-600 transition-transform duration-200 group-hover/se:text-neutral-400 rotate-180"
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </button>
                              <div
                                className="overflow-hidden"
                                style={{ opacity: "1", height: "auto" }}
                              >
                                <div className="pt-1.5 pl-px">
                                  <div className="flex flex-col">
                                    <div
                                      className="relative flex items-stretch gap-2.5"
                                      style={{
                                        opacity: "1",
                                        transform: "none",
                                      }}
                                    >
                                      <div className="relative flex w-4 flex-shrink-0 flex-col items-center">
                                        <span className="mt-px flex h-4 w-4 items-center justify-center text-neutral-500">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-file-text h-[14px] w-[14px]"
                                          >
                                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                            <path d="M10 9H8" />
                                            <path d="M16 13H8" />
                                            <path d="M16 17H8" />
                                          </svg>
                                        </span>
                                        <span className="mb-1 mt-1 w-px flex-1 rounded-full bg-white/[0.08]"></span>
                                      </div>
                                      <div className="min-w-0 pb-2.5">
                                        <div className="text-[13.5px] leading-snug text-pretty text-neutral-400">
                                          Read your request
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className="relative flex items-stretch gap-2.5"
                                      style={{
                                        opacity: "1",
                                        transform: "none",
                                      }}
                                    >
                                      <div className="relative flex w-4 flex-shrink-0 flex-col items-center">
                                        <span className="mt-px flex h-4 w-4 items-center justify-center text-neutral-500">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-layout-grid h-[14px] w-[14px]"
                                          >
                                            <rect
                                              width="7"
                                              height="7"
                                              x="3"
                                              y="3"
                                              rx="1"
                                            />
                                            <rect
                                              width="7"
                                              height="7"
                                              x="14"
                                              y="3"
                                              rx="1"
                                            />
                                            <rect
                                              width="7"
                                              height="7"
                                              x="14"
                                              y="14"
                                              rx="1"
                                            />
                                            <rect
                                              width="7"
                                              height="7"
                                              x="3"
                                              y="14"
                                              rx="1"
                                            />
                                          </svg>
                                        </span>
                                        <span className="mb-1 mt-1 w-px flex-1 rounded-full bg-white/[0.08]"></span>
                                      </div>
                                      <div className="min-w-0 pb-2.5">
                                        <div className="text-[13.5px] leading-snug text-pretty text-neutral-400">
                                          Reviewed your server
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className="relative flex items-stretch gap-2.5"
                                      style={{
                                        opacity: "1",
                                        transform: "none",
                                      }}
                                    >
                                      <div className="relative flex w-4 flex-shrink-0 flex-col items-center">
                                        <span className="mt-px flex h-4 w-4 items-center justify-center text-neutral-500">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-check-circle2 h-[14px] w-[14px]"
                                          >
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="m9 12 2 2 4-4" />
                                          </svg>
                                        </span>
                                      </div>
                                      <div className="min-w-0 pb-0">
                                        <div className="text-[13.5px] leading-snug text-pretty text-neutral-400">
                                          Done
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2.5">
                              <p className="my-1">
                                Hey there! I can help you build out your Discord
                                server. What's the main theme or purpose of your
                                server, like what game or community is it for?
                                Or just say "go for it" and I'll set one up with
                                the usual stuff.
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-1.5 sm:gap-1 transition-opacity duration-150 opacity-100">
                            <button
                              className="p-2.5 sm:p-1.5 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04] transition-[color,background-color,transform] active:scale-[0.96]"
                              title="Copy message"
                              aria-label="Copy message"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-copy w-3.5 h-3.5"
                              >
                                <rect
                                  width="14"
                                  height="14"
                                  x="8"
                                  y="8"
                                  rx="2"
                                  ry="2"
                                />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                              </svg>
                            </button>
                            <button
                              className="p-2.5 sm:p-1.5 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04] transition-[color,background-color,transform] active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                              title="Regenerate response"
                              aria-label="Regenerate response"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-refresh-cw w-3.5 h-3.5"
                              >
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                <path d="M8 16H3v5" />
                              </svg>
                            </button>
                            <button
                              className="p-2.5 sm:p-1.5 rounded-md transition-[color,background-color,transform] active:scale-[0.96] text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]"
                              title="Good response"
                              aria-label="Good response"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-thumbs-up w-3.5 h-3.5"
                              >
                                <path d="M7 10v12" />
                                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                              </svg>
                            </button>
                            <button
                              className="p-2.5 sm:p-1.5 rounded-md transition-[color,background-color,transform] active:scale-[0.96] text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]"
                              title="Bad response"
                              aria-label="Bad response"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-thumbs-down w-3.5 h-3.5"
                              >
                                <path d="M17 14V2" />
                                <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
                              </svg>
                            </button>
                            <button
                              data-tour="builder-report"
                              className="p-2.5 sm:p-1.5 ml-1 rounded-md ring-1 ring-inset transition-[color,background-color,transform] active:scale-[0.96] text-red-400/70 bg-red-500/[0.05] ring-red-500/[0.10] hover:text-red-300 hover:bg-red-500/[0.12]"
                              title="Report a mistake"
                              aria-label="Report a mistake"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-flag w-3.5 h-3.5"
                              >
                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                <line x1="4" x2="4" y1="22" y2="15" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="h-px"></div>
                      <div></div>
                    </div>
                  </div>
                  <button
                    aria-hidden="true"
                    tabIndex="-1"
                    className="absolute left-1/2 -translate-x-1/2 bottom-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/90 ring-1 ring-white/[0.08] text-[11.5px] font-medium text-neutral-200 backdrop-blur-sm shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] hover:bg-neutral-700/90 transition-[transform,opacity] duration-300 ease-out will-change-transform translate-y-[180%] opacity-0 pointer-events-none"
                    title="Scroll to latest message"
                    aria-label="Scroll to latest message"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-chevron-down w-3.5 h-3.5"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                    Jump to latest
                  </button>
                </div>
                <div className="flex-shrink-0 p-2 sm:p-4 border-t border-neutral-800">
                  <div className="w-full">
                    <div className="flex items-stretch gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="rounded-2xl bg-neutral-900/80 border ring-1 transition-[border-color,box-shadow] duration-200 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] border-white/[0.06] ring-white/[0.02] focus-within:border-white/[0.12] focus-within:ring-white/[0.04]">
                          <textarea
                            placeholder="Describe your server..."
                            rows="1"
                            className="w-full px-5 pt-4 pb-2 bg-transparent border-0 text-base sm:text-[15.5px] text-white placeholder-neutral-500 resize-none overflow-hidden focus:outline-none focus:ring-0 "
                          ></textarea>
                          <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <button
                                type="button"
                                className="relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-[color,background-color,transform] active:scale-[0.96] before:absolute before:inset-[-2px] before:content-[''] text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04]"
                                title="Attach an image"
                                aria-label="Attach an image"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-plus w-[18px] h-[18px]"
                                >
                                  <path d="M5 12h14" />
                                  <path d="M12 5v14" />
                                </svg>
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="relative">
                                <button
                                  type="button"
                                  className="hidden sm:inline-flex items-center gap-1 px-2.5 h-9 rounded-lg text-[12.5px] font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                                  title="Select model"
                                  aria-label="Select model"
                                >
                                  Onyx V1
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-chevron-down w-3 h-3 opacity-60 transition-transform duration-150 "
                                  >
                                    <path d="m6 9 6 6 6-6" />
                                  </svg>
                                </button>
                              </div>
                              <button
                                disabled=""
                                className="relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-[color,background-color,box-shadow,transform] before:absolute before:inset-[-2px] before:content-[''] bg-neutral-800 text-neutral-600 cursor-not-allowed"
                                title="Send"
                                aria-label="Send"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-send w-4 h-4"
                                >
                                  <path d="m22 2-7 20-4-9-9-4Z" />
                                  <path d="M22 2 11 13" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-center text-[11px] text-neutral-500">
                      You're chatting with Peak, an AI assistant. AI can make
                      mistakes — review changes before applying.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              data-tour="builder-plan"
              className="scroll-mt-24 min-h-0 min-w-0 lg:flex-[5] lg:min-w-[300px] hidden lg:flex"
            >
              <div className="relative w-full flex flex-col h-full bg-neutral-900 border border-neutral-800 ring-1 ring-white/[0.02] rounded-2xl max-lg:rounded-t-none overflow-hidden shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
                <div className="flex-shrink-0 flex flex-col gap-y-2 px-3 sm:px-5 py-3 border-b border-neutral-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-file-text w-4 h-4 text-neutral-400"
                        >
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                          <path d="M10 9H8" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                        </svg>
                        <span className="text-[15px] font-medium text-white">
                          Plan
                        </span>
                      </div>
                      <span className="text-neutral-700 hidden xl:inline">
                        ·
                      </span>
                      <span className="hidden xl:inline text-[13px] tabular-nums truncate">
                        <span className="text-neutral-200 font-semibold">
                          28
                        </span>
                        <span className="text-neutral-600"> channels · </span>
                        <span className="text-neutral-200 font-semibold">
                          17
                        </span>
                        <span className="text-neutral-600"> roles</span>
                        <span className="text-neutral-600"> · </span>
                        <span className="text-neutral-200 font-semibold">
                          6
                        </span>
                        <span className="text-neutral-600"> categories</span>
                      </span>
                      <span className="xl:hidden text-[12.5px] tabular-nums truncate">
                        <span className="text-neutral-200 font-semibold">
                          28
                        </span>
                        <span className="text-neutral-600"> ch</span>
                        <span className="text-neutral-700"> · </span>
                        <span className="text-neutral-200 font-semibold">
                          17
                        </span>
                        <span className="text-neutral-600"> r</span>
                        <span className="text-neutral-700"> · </span>
                        <span className="text-neutral-200 font-semibold">
                          6
                        </span>
                        <span className="text-neutral-600"> cat</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        className="p-2.5 sm:p-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] transition-colors disabled:opacity-40"
                        title="Reset plan to live server state"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-refresh-cw w-3.5 h-3.5 "
                        >
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                          <path d="M21 3v5h-5" />
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                          <path d="M8 16H3v5" />
                        </svg>
                      </button>
                      <button
                        disabled=""
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-[color,background-color,transform] duration-150 ease-out bg-neutral-800 text-neutral-600 cursor-not-allowed"
                        title="No pending changes to apply"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-rocket w-3 h-3"
                        >
                          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                        </svg>
                        Build
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 px-2.5 pt-3 pb-2 border-b border-neutral-800/80">
                  <div className="relative flex items-center gap-0.5 min-w-0">
                    <button className="relative flex-shrink-0 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                      <span
                        className="absolute inset-0 rounded-lg bg-white shadow-[0_2px_8px_-2px_rgba(255,255,255,0.18)]"
                        style={{
                          transform: "none",
                          transformOrigin: "50% 50% 0px",
                          opacity: "1",
                        }}
                      ></span>
                      <span className="relative z-10 inline-flex items-center gap-1.5 text-black">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-hash w-4 h-4"
                        >
                          <line x1="4" x2="20" y1="9" y2="9" />
                          <line x1="4" x2="20" y1="15" y2="15" />
                          <line x1="10" x2="8" y1="3" y2="21" />
                          <line x1="16" x2="14" y1="3" y2="21" />
                        </svg>
                        Channels
                      </span>
                    </button>
                    <button
                      data-tour="builder-roles-tab"
                      className="relative flex-shrink-0 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                    >
                      <span className="relative z-10 inline-flex items-center gap-1.5 text-neutral-400 hover:text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-users w-4 h-4"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Roles
                      </span>
                    </button>
                    <button
                      aria-label="Features"
                      data-tour="builder-features-tab"
                      className="relative flex-shrink-0 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 hover:bg-white/[0.05]"
                    >
                      <span className="relative z-10 inline-flex items-center gap-1.5 text-neutral-400 hover:text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-sparkles w-4 h-4"
                        >
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                          <path d="M5 3v4" />
                          <path d="M19 17v4" />
                          <path d="M3 5h4" />
                          <path d="M17 19h4" />
                        </svg>
                        Features
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden relative bg-white dark:bg-neutral-900">
                  <div className="h-full overflow-y-auto bg-white dark:bg-neutral-900">
                    <div style={{ opacity: "1", transform: "none" }}>
                      <div className="py-2">
                        <div className="mb-2">
                          <div>
                            <div
                              className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                              role="button"
                              tabIndex="0"
                              aria-disabled="false"
                              aria-roledescription="sortable"
                              aria-describedby="DndDescribedBy-4"
                              style={{ transition: "transform linear" }}
                            >
                              <span className="flex-shrink-0 ">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                >
                                  <line x1="4" x2="20" y1="9" y2="9" />
                                  <line x1="4" x2="20" y1="15" y2="15" />
                                  <line x1="10" x2="8" y1="3" y2="21" />
                                  <line x1="16" x2="14" y1="3" y2="21" />
                                </svg>
                              </span>
                              <span
                                title="verify"
                                className="text-[15px] font-medium truncate min-w-0 leading-5 "
                              >
                                verify
                              </span>
                              <div className="flex-1"></div>
                            </div>
                          </div>
                          <div>
                            <div
                              className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                              role="button"
                              tabIndex="0"
                              aria-disabled="false"
                              aria-roledescription="sortable"
                              aria-describedby="DndDescribedBy-4"
                              style={{ transition: "transform linear" }}
                            >
                              <span className="flex-shrink-0 ">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                >
                                  <line x1="4" x2="20" y1="9" y2="9" />
                                  <line x1="4" x2="20" y1="15" y2="15" />
                                  <line x1="10" x2="8" y1="3" y2="21" />
                                  <line x1="16" x2="14" y1="3" y2="21" />
                                </svg>
                              </span>
                              <span
                                title="moderator-only"
                                className="text-[15px] font-medium truncate min-w-0 leading-5 "
                              >
                                moderator-only
                              </span>
                              <div className="flex-1"></div>
                            </div>
                          </div>
                          <div>
                            <div
                              className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                              role="button"
                              tabIndex="0"
                              aria-disabled="false"
                              aria-roledescription="sortable"
                              aria-describedby="DndDescribedBy-4"
                              style={{ transition: "transform linear" }}
                            >
                              <span className="flex-shrink-0 ">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                >
                                  <line x1="4" x2="20" y1="9" y2="9" />
                                  <line x1="4" x2="20" y1="15" y2="15" />
                                  <line x1="10" x2="8" y1="3" y2="21" />
                                  <line x1="16" x2="14" y1="3" y2="21" />
                                </svg>
                              </span>
                              <span
                                title="transcript"
                                className="text-[15px] font-medium truncate min-w-0 leading-5 "
                              >
                                transcript
                              </span>
                              <div className="flex-1"></div>
                            </div>
                          </div>
                          <div>
                            <div
                              className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                              role="button"
                              tabIndex="0"
                              aria-disabled="false"
                              aria-roledescription="sortable"
                              aria-describedby="DndDescribedBy-4"
                              style={{ transition: "transform linear" }}
                            >
                              <span className="flex-shrink-0 ">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                >
                                  <line x1="4" x2="20" y1="9" y2="9" />
                                  <line x1="4" x2="20" y1="15" y2="15" />
                                  <line x1="10" x2="8" y1="3" y2="21" />
                                  <line x1="16" x2="14" y1="3" y2="21" />
                                </svg>
                              </span>
                              <span
                                title="dont-write-here"
                                className="text-[15px] font-medium truncate min-w-0 leading-5 "
                              >
                                dont-write-here
                              </span>
                              <div className="flex-1"></div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="pt-4 first:pt-0  "
                          style={{ transition: "transform linear" }}
                        >
                          <div
                            className="
          flex items-center gap-1 px-2 py-1.5 mx-1 mt-2 mb-1 rounded-lg
          select-none cursor-pointer group transition-colors
          hover:bg-neutral-100 dark:hover:bg-neutral-800/50
          cursor-grab active:cursor-grabbing
        "
                            role="button"
                            tabIndex="0"
                            aria-disabled="false"
                            aria-roledescription="sortable"
                            aria-describedby="DndDescribedBy-4"
                          >
                            <button className="p-1.5 sm:p-0.5 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-md">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down w-4 h-4 sm:w-3 sm:h-3 transition-transform duration-200 ease-out "
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                            <span className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.02em] truncate group-hover:text-black dark:group-hover:text-white ">
                              Important
                            </span>
                          </div>
                          <div className="mt-[2px]">
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="welcome"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  welcome
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-megaphone w-5 h-5 flex-shrink-0"
                                  >
                                    <path d="m3 11 18-5v12L3 14v-3z" />
                                    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                                  </svg>
                                </span>
                                <span
                                  title="announcements"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  announcements
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="rules"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  rules
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="giveaways"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  giveaways
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="hall-of-gigachads"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  hall-of-gigachads
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="hall-of-shame"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  hall-of-shame
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="updates"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  updates
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="support-ticket"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  support-ticket
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="pt-4 first:pt-0  "
                          style={{ transition: "transform linear" }}
                        >
                          <div
                            className="
          flex items-center gap-1 px-2 py-1.5 mx-1 mt-2 mb-1 rounded-lg
          select-none cursor-pointer group transition-colors
          hover:bg-neutral-100 dark:hover:bg-neutral-800/50
          cursor-grab active:cursor-grabbing
        "
                            role="button"
                            tabIndex="0"
                            aria-disabled="false"
                            aria-roledescription="sortable"
                            aria-describedby="DndDescribedBy-4"
                          >
                            <button className="p-1.5 sm:p-0.5 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-md">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down w-4 h-4 sm:w-3 sm:h-3 transition-transform duration-200 ease-out "
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                            <span className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.02em] truncate group-hover:text-black dark:group-hover:text-white ">
                              General
                            </span>
                          </div>
                          <div className="mt-[2px]">
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="chat"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  chat
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="media"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  media
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="bot-cmd"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  bot-cmd
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="staff-chat"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  staff-chat
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="pt-4 first:pt-0  "
                          style={{ transition: "transform linear" }}
                        >
                          <div
                            className="
          flex items-center gap-1 px-2 py-1.5 mx-1 mt-2 mb-1 rounded-lg
          select-none cursor-pointer group transition-colors
          hover:bg-neutral-100 dark:hover:bg-neutral-800/50
          cursor-grab active:cursor-grabbing
        "
                            role="button"
                            tabIndex="0"
                            aria-disabled="false"
                            aria-roledescription="sortable"
                            aria-describedby="DndDescribedBy-4"
                          >
                            <button className="p-1.5 sm:p-0.5 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-md">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down w-4 h-4 sm:w-3 sm:h-3 transition-transform duration-200 ease-out "
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                            <span className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.02em] truncate group-hover:text-black dark:group-hover:text-white ">
                              Voice
                            </span>
                          </div>
                          <div className="mt-[2px]">
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 text-neutral-500 dark:text-neutral-400">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-volume2 w-5 h-5 flex-shrink-0"
                                  >
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                  </svg>
                                </span>
                                <span
                                  title="Vc 1"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  Vc 1
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 text-neutral-500 dark:text-neutral-400">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-volume2 w-5 h-5 flex-shrink-0"
                                  >
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                  </svg>
                                </span>
                                <span
                                  title="Vc 2"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  Vc 2
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 text-neutral-500 dark:text-neutral-400">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-volume2 w-5 h-5 flex-shrink-0"
                                  >
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                  </svg>
                                </span>
                                <span
                                  title="Join to Create"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  Join to Create
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="pt-4 first:pt-0  "
                          style={{ transition: "transform linear" }}
                        >
                          <div
                            className="
          flex items-center gap-1 px-2 py-1.5 mx-1 mt-2 mb-1 rounded-lg
          select-none cursor-pointer group transition-colors
          hover:bg-neutral-100 dark:hover:bg-neutral-800/50
          cursor-grab active:cursor-grabbing
        "
                            role="button"
                            tabIndex="0"
                            aria-disabled="false"
                            aria-roledescription="sortable"
                            aria-describedby="DndDescribedBy-4"
                          >
                            <button className="p-1.5 sm:p-0.5 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-md">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down w-4 h-4 sm:w-3 sm:h-3 transition-transform duration-200 ease-out "
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                            <span className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.02em] truncate group-hover:text-black dark:group-hover:text-white ">
                              important
                            </span>
                          </div>
                          <div className="mt-[2px]">
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="backups"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  backups
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="errors"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  errors
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="webhooks"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  webhooks
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="appeals"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  appeals
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="pt-4 first:pt-0  "
                          style={{ transition: "transform linear" }}
                        >
                          <div
                            className="
          flex items-center gap-1 px-2 py-1.5 mx-1 mt-2 mb-1 rounded-lg
          select-none cursor-pointer group transition-colors
          hover:bg-neutral-100 dark:hover:bg-neutral-800/50
          cursor-grab active:cursor-grabbing
        "
                            role="button"
                            tabIndex="0"
                            aria-disabled="false"
                            aria-roledescription="sortable"
                            aria-describedby="DndDescribedBy-4"
                          >
                            <button className="p-1.5 sm:p-0.5 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-md">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down w-4 h-4 sm:w-3 sm:h-3 transition-transform duration-200 ease-out "
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                            <span className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.02em] truncate group-hover:text-black dark:group-hover:text-white ">
                              Logs
                            </span>
                          </div>
                          <div className="mt-[2px]">
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="mod-logs"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  mod-logs
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="server-logs"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  server-logs
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="member-logs"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  member-logs
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="role-logs"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  role-logs
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="pt-4 first:pt-0  "
                          style={{ transition: "transform linear" }}
                        >
                          <div
                            className="
          flex items-center gap-1 px-2 py-1.5 mx-1 mt-2 mb-1 rounded-lg
          select-none cursor-pointer group transition-colors
          hover:bg-neutral-100 dark:hover:bg-neutral-800/50
          cursor-grab active:cursor-grabbing
        "
                            role="button"
                            tabIndex="0"
                            aria-disabled="false"
                            aria-roledescription="sortable"
                            aria-describedby="DndDescribedBy-4"
                          >
                            <button className="p-1.5 sm:p-0.5 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-md">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down w-4 h-4 sm:w-3 sm:h-3 transition-transform duration-200 ease-out "
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                            <span className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.02em] truncate group-hover:text-black dark:group-hover:text-white ">
                              Tickets
                            </span>
                          </div>
                          <div className="mt-[2px]">
                            <div>
                              <div
                                className="
        flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg
        select-none group min-h-[40px]
        
        
        text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60
        cursor-grab active:cursor-grabbing
        
      "
                                role="button"
                                tabIndex="0"
                                aria-disabled="false"
                                aria-roledescription="sortable"
                                aria-describedby="DndDescribedBy-4"
                                style={{ transition: "transform linear" }}
                              >
                                <span className="flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-hash w-5 h-5 flex-shrink-0"
                                  >
                                    <line x1="4" x2="20" y1="9" y2="9" />
                                    <line x1="4" x2="20" y1="15" y2="15" />
                                    <line x1="10" x2="8" y1="3" y2="21" />
                                    <line x1="16" x2="14" y1="3" y2="21" />
                                  </svg>
                                </span>
                                <span
                                  title="support-l5ks8"
                                  className="text-[15px] font-medium truncate min-w-0 leading-5 "
                                >
                                  support-l5ks8
                                </span>
                                <div className="flex-1"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div id="DndDescribedBy-4" style={{ display: "none" }}>
                        To pick up a draggable item, press the space bar. While
                        dragging, use the arrow keys to move the item. Press
                        space again to drop the item in its new position, or
                        press escape to cancel.
                      </div>
                      <div
                        id="DndLiveRegion-4"
                        role="status"
                        aria-live="assertive"
                        aria-atomic="true"
                        style={{
                          position: "fixed",
                          top: "0px",
                          left: "0px",
                          width: "1px",
                          height: "1px",
                          margin: "-1px",
                          border: "0px",
                          padding: "0px",
                          overflow: "hidden",
                          clip: "rect(0px, 0px, 0px, 0px)",
                          clipPath: "inset(100%)",
                          whiteSpace: "nowrap",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-neutral-800/80 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    All in sync — nothing pending
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden 2xl:flex min-h-0 min-w-0 overflow-hidden transition-[flex-grow,width,margin] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] w-0 2xl:flex-none -ml-2 sm:-ml-4">
              <div
                data-tour="builder-features-panel"
                className="w-full flex min-w-0 transform-gpu transition-[transform,opacity] duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform translate-x-full opacity-0"
              >
                <div className="h-full w-full flex flex-col min-h-0 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="flex-shrink-0 flex items-center justify-between px-4 h-12 border-b border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-sparkles w-4 h-4 text-neutral-300"
                      >
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                        <path d="M5 3v4" />
                        <path d="M19 17v4" />
                        <path d="M3 5h4" />
                        <path d="M17 19h4" />
                      </svg>
                      <span className="text-[13.5px] font-semibold text-neutral-100">
                        Features
                      </span>
                    </div>
                    <button
                      className="relative grid place-items-center h-8 w-8 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.06] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96] before:absolute before:inset-[-4px] before:content-['']"
                      title="Close features"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-x w-4 h-4"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
                    <p className="px-2.5 pt-2 pb-1 text-[12.5px] text-neutral-500 text-pretty">
                      Nothing set up yet. Pick a feature below and the AI will
                      configure it for you.
                    </p>
                    <div className="pt-2">
                      <div className="px-2.5 pb-1.5">
                        <span className="text-[11px] font-medium text-neutral-500">
                          Add a feature
                        </span>
                      </div>
                      <div className="space-y-1">
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-users w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(87, 242, 135)" }}
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Welcome Messages
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Greet new members
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-log-out w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(148, 163, 184)" }}
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" x2="9" y1="12" y2="12" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Goodbye Messages
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Message when members leave
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-volume2 w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(88, 101, 242)" }}
                          >
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Join-to-Create
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Temporary voice channels
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-mouse-pointer-click w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(230, 126, 34)" }}
                          >
                            <path d="m9 9 5 12 1.8-5.2L21 14Z" />
                            <path d="M7.2 2.2 8 5.1" />
                            <path d="m5.1 8-2.9-.8" />
                            <path d="M14 4.1 12 6" />
                            <path d="m6 12-1.9 2" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Reaction Roles
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Roles from reactions
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-ticket w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(235, 69, 158)" }}
                          >
                            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                            <path d="M13 5v2" />
                            <path d="M13 17v2" />
                            <path d="M13 11v2" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Tickets
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Private support threads
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-sparkles w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(254, 231, 92)" }}
                          >
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                            <path d="M5 3v4" />
                            <path d="M19 17v4" />
                            <path d="M3 5h4" />
                            <path d="M17 19h4" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              XP &amp; Leveling
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Levels and leaderboards
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-gift w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(46, 204, 113)" }}
                          >
                            <rect x="3" y="8" width="18" height="4" rx="1" />
                            <path d="M12 8v13" />
                            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Giveaways
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Run giveaways
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-scroll-text w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(155, 89, 182)" }}
                          >
                            <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
                            <path d="M19 17V5a2 2 0 0 0-2-2H4" />
                            <path d="M15 8h-5" />
                            <path d="M15 12h-5" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Logging
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Log server events
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-message-square-off w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(52, 152, 219)" }}
                          >
                            <path d="M21 15V5a2 2 0 0 0-2-2H9" />
                            <path d="m2 2 20 20" />
                            <path d="M3.6 3.6c-.4.3-.6.8-.6 1.4v16l4-4h10" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Content Filter
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Block bad words &amp; profanity
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-shield-alert w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(249, 115, 22)" }}
                          >
                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                            <path d="M12 8v4" />
                            <path d="M12 16h.01" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Spam Protection
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Stop message flooding
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-link2-off w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(56, 189, 248)" }}
                          >
                            <path d="M9 17H7A5 5 0 0 1 7 7" />
                            <path d="M15 7h2a5 5 0 0 1 4 8" />
                            <line x1="8" x2="12" y1="12" y2="12" />
                            <line x1="2" x2="22" y1="2" y2="22" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Link Filter
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Control links &amp; invites
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-shield-x w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(220, 38, 38)" }}
                          >
                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                            <path d="m14.5 9.5-5 5" />
                            <path d="m9.5 9.5 5 5" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Anti-Raid
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Stop join-raid bursts
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-shield w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(237, 66, 69)" }}
                          >
                            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Anti-Nuke
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Block mass-delete &amp; ban attacks
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-user-x w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(245, 158, 11)" }}
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="17" x2="22" y1="8" y2="13" />
                            <line x1="22" x2="17" y1="8" y2="13" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Suspicious Accounts
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Flag risky new accounts
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-bot w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(124, 58, 237)" }}
                          >
                            <path d="M12 8V4H8" />
                            <rect width="16" height="12" x="4" y="8" rx="2" />
                            <path d="M2 14h2" />
                            <path d="M20 14h2" />
                            <path d="M15 13v2" />
                            <path d="M9 13v2" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              AI Moderation
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              AI reads &amp; moderates messages (Pro)
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-puzzle w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(128, 132, 142)" }}
                          >
                            <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Image Moderation
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              AI-scan posted images (Pro)
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-check-circle2 w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(20, 184, 166)" }}
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Verification
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Gate new members
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-file-text w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(52, 211, 153)" }}
                          >
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                            <path d="M10 9H8" />
                            <path d="M16 13H8" />
                            <path d="M16 17H8" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Onboarding
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              New-member setup flow
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-user-plus w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(255, 152, 0)" }}
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="19" x2="19" y1="8" y2="14" />
                            <line x1="22" x2="16" y1="11" y2="11" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Invite Tracker
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Track who invited who
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-bell w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(245, 158, 11)" }}
                          >
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Notifications
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Social &amp; stream alerts
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-pressed="false"
                          className="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-user-minus w-[18px] h-[18px] flex-shrink-0 opacity-75"
                            style={{ color: "rgb(100, 116, 139)" }}
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="22" x2="16" y1="11" y2="11" />
                          </svg>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium truncate text-neutral-200">
                              Inactive Kick
                            </span>
                            <span className="block text-[12px] text-neutral-500 truncate">
                              Remove inactive members
                            </span>
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
