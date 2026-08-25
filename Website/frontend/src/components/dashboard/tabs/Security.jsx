import React from "react";

export default function Security() {
  return (
    <div className="lg:pl-64 relative">
      <header className="sticky top-0 z-20 h-16 bg-neutral-900/90 backdrop-blur-sm border-b border-neutral-800">
        <div className="flex items-center justify-between h-full px-4 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden transition-colors"
              aria-label="Toggle sidebar"
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
                className="lucide lucide-menu w-5 h-5"
              >
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
            <a
              className="p-1.5 rounded-xl hover:bg-neutral-800 transition-colors group"
              title="Back to Servers"
              href="/dashboard"
            >
              <img
                src="/logo.png"
                alt="Peak"
                width="28"
                height="28"
                className="rounded-xl group-hover:shadow-lg transition-shadow sm:w-8 sm:h-8"
              />
            </a>
            <div className="w-px h-8 bg-neutral-700 hidden sm:block"></div>
            <h1 className="text-sm sm:text-[15px] font-semibold text-white truncate max-w-[100px] sm:max-w-none">
              Orbit Support
            </h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="relative">
              <button
                className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Notifications"
                aria-expanded="false"
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
                  className="lucide lucide-bell w-5 h-5"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
              </button>
            </div>
            <div className="relative">
              <button
                className="flex items-center gap-1.5 sm:gap-3 p-1 sm:p-1.5 pr-1.5 sm:pr-3 rounded-xl hover:bg-neutral-800 transition-colors"
                aria-label="User menu"
                aria-expanded="false"
              >
                <img
                  src="https://cdn.discordapp.com/avatars/1195055294380781629/07be856d3472ba59bf51e3fa5a77a595.png?size=64"
                  alt="l5ks8"
                  className="w-8 h-8 rounded-xl ring-2 ring-neutral-700"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">Lukas</p>
                  <p className="text-[10px] text-neutral-500">Member</p>
                </div>
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
                  className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform "
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto">
        <div>
          <div data-tour="feature-header" className="scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
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
                    className="lucide lucide-shield-check w-5 h-5"
                  >
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </span>
                <h1 className="text-base font-medium text-white truncate">
                  Security
                </h1>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="space-y-3">
              <div className="">
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                  <div className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-red-500/10">
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
                          className="lucide lucide-zap w-4 h-4 text-red-400"
                        >
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-white truncate">
                        Anti-Nuke Protection
                      </span>
                    </div>
                    <div className="shrink-0">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked="true"
                          className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                        >
                          <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid transition-all duration-200 ease-in-out grid-rows-[1fr] opacity-100">
                    <div className="">
                      <div className="px-5 pb-5 pt-4 border-t border-neutral-800">
                        <div className="relative">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                              type="button"
                              className="relative px-4 py-3.5 rounded-xl border text-left transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/80"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-[13px] font-semibold">
                                  Conservative
                                </span>
                              </div>
                              <div className="text-[11px] text-neutral-300 mb-2 font-medium">
                                Strip roles → kick
                              </div>
                              <div className="text-[11px] text-neutral-500 leading-snug">
                                Soft, reversible. Best for established servers
                                where mistakes cost more than missed nukes.
                              </div>
                            </button>
                            <button
                              type="button"
                              className="relative px-4 py-3.5 rounded-xl border text-left transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/80"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-[13px] font-semibold">
                                  Recommended
                                </span>
                                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                                  Default
                                </span>
                              </div>
                              <div className="text-[11px] text-neutral-300 mb-2 font-medium">
                                Strip roles → ban
                              </div>
                              <div className="text-[11px] text-neutral-500 leading-snug">
                                Balanced. Multi-signal required before banning.
                                Right for almost every server.
                              </div>
                            </button>
                            <button
                              type="button"
                              className="relative px-4 py-3.5 rounded-xl border text-left transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-neutral-800 border-neutral-500 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-[13px] font-semibold">
                                  Aggressive
                                </span>
                              </div>
                              <div className="text-[11px] text-neutral-300 mb-2 font-medium">
                                Kick → ban
                              </div>
                              <div className="text-[11px] text-neutral-500 leading-snug">
                                Single signal acts. Highest catch rate, more
                                chance of false positives. High-value servers
                                only.
                              </div>
                            </button>
                          </div>
                          <div className="mt-5 flex items-center justify-between gap-4 py-3.5 border-t border-neutral-800/70">
                            <p className="text-sm font-medium text-white">
                              Test mode
                            </p>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                role="switch"
                                aria-checked="false"
                                className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                              >
                                <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]"></span>
                              </button>
                            </div>
                          </div>
                          <div className="divide-y divide-neutral-800/70 border-y border-neutral-800/70">
                            <div className="flex items-center justify-between gap-4 py-3.5">
                              <p className="text-sm font-medium text-white">
                                Privilege escalation
                              </p>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked="true"
                                  className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                                >
                                  <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black"></span>
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 py-3.5">
                              <p className="text-sm font-medium text-white">
                                Webhook firewall
                              </p>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked="false"
                                  className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                                >
                                  <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]"></span>
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 py-3.5">
                              <p className="text-sm font-medium text-white">
                                Server identity protection
                              </p>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked="false"
                                  className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                                >
                                  <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]"></span>
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 py-3.5">
                              <p className="text-sm font-medium text-white">
                                Block unknown bot joins
                              </p>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked="false"
                                  className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                                >
                                  <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]"></span>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-5">
                            <p className="text-sm font-medium text-white mb-3">
                              Trusted users and roles
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[11px] text-neutral-500 block mb-1.5">
                                  User IDs
                                </label>
                                <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text transition-colors">
                                  <input
                                    placeholder="Add user IDs to exempt..."
                                    title=""
                                    autocomplete="off"
                                    className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5"
                                    value=""
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[11px] text-neutral-500 block mb-1.5">
                                  Roles
                                </label>
                                <div className="jsx-556cf662b09b3c73 w-full">
                                  <div className="jsx-556cf662b09b3c73 relative">
                                    <button
                                      type="button"
                                      className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                                    >
                                      <span className="jsx-556cf662b09b3c73 min-w-0 truncate text-sm text-neutral-500">
                                        Add a trusted role…
                                      </span>
                                      <div className="jsx-556cf662b09b3c73 flex items-center gap-1">
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
                                          className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 "
                                        >
                                          <path d="m6 9 6 6 6-6"></path>
                                        </svg>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 border-t border-neutral-800/70 pt-4">
                            <button
                              type="button"
                              className="flex items-center justify-between gap-3 w-full text-left group transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-lg"
                            >
                              <p className="text-sm font-medium text-white">
                                Advanced detection settings
                              </p>
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
                                className="lucide lucide-chevron-down w-4 h-4 text-neutral-500 shrink-0 transition-transform rotate-180"
                              >
                                <path d="m6 9 6 6 6-6"></path>
                              </svg>
                            </button>
                            <div className="mt-4 space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[11px] text-neutral-500 block mb-1.5">
                                    Permissions to watch when granted
                                  </label>
                                  <div className="jsx-556cf662b09b3c73 w-full">
                                    <div className="jsx-556cf662b09b3c73 relative">
                                      <button
                                        type="button"
                                        className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 min-h-[40px] px-3 py-1.5 bg-neutral-800 border rounded-xl text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer"
                                      >
                                        <div className="jsx-556cf662b09b3c73 flex-1 flex flex-wrap gap-1">
                                          <span className="jsx-556cf662b09b3c73 text-neutral-500 text-sm py-0.5">
                                            Default — all dangerous permissions
                                          </span>
                                        </div>
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
                                          className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform "
                                        >
                                          <path d="m6 9 6 6 6-6"></path>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[11px] text-neutral-500 block mb-1.5">
                                    Permissions to watch when removed
                                  </label>
                                  <div className="jsx-556cf662b09b3c73 w-full">
                                    <div className="jsx-556cf662b09b3c73 relative">
                                      <button
                                        type="button"
                                        className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 min-h-[40px] px-3 py-1.5 bg-neutral-800 border rounded-xl text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer"
                                      >
                                        <div className="jsx-556cf662b09b3c73 flex-1 flex flex-wrap gap-1">
                                          <span className="jsx-556cf662b09b3c73 text-neutral-500 text-sm py-0.5">
                                            Default — all dangerous permissions
                                          </span>
                                        </div>
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
                                          className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform "
                                        >
                                          <path d="m6 9 6 6 6-6"></path>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="max-w-xs">
                                <label className="text-[11px] text-neutral-500 block mb-1.5">
                                  Mass-emoji-delete threshold
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="w-full">
                                    <div className="relative">
                                      <input
                                        autocomplete="off"
                                        title=""
                                        className="w-full px-4 py-3 sm:py-2.5 bg-white dark:bg-neutral-800 border rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600    "
                                        min="2"
                                        max="50"
                                        type="number"
                                        value="3"
                                      />
                                    </div>
                                  </div>
                                  <span className="text-xs text-neutral-500 flex-shrink-0">
                                    emojis / 30s
                                  </span>
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
              <div className="">
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                  <div className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-orange-500/10">
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
                          className="lucide lucide-shield w-4 h-4 text-orange-400"
                        >
                          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-white truncate">
                        Anti-Raid System
                      </span>
                    </div>
                    <div className="shrink-0">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked="true"
                          className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                        >
                          <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid transition-all duration-200 ease-in-out grid-rows-[1fr] opacity-100">
                    <div className="">
                      <div className="px-5 pb-5 pt-4 border-t border-neutral-800">
                        <div className="relative">
                          <div className="mb-4">
                            <label className="text-[11px] text-neutral-500 block mb-1.5">
                              Detection Sensitivity
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <button
                                type="button"
                                className="px-4 py-3 rounded-xl border text-left transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                              >
                                <div className="text-[13px] font-semibold">
                                  Lenient
                                </div>
                                <div className="text-[11px] text-neutral-500 mt-1 leading-snug">
                                  Only confirmed coordinated raids
                                </div>
                              </button>
                              <button
                                type="button"
                                className="px-4 py-3 rounded-xl border text-left transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                              >
                                <div className="text-[13px] font-semibold">
                                  Balanced
                                </div>
                                <div className="text-[11px] text-neutral-500 mt-1 leading-snug">
                                  Moderate — recommended default
                                </div>
                              </button>
                              <button
                                type="button"
                                className="px-4 py-3 rounded-xl border text-left transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-neutral-800 border-neutral-600 text-white"
                              >
                                <div className="text-[13px] font-semibold">
                                  Strict
                                </div>
                                <div className="text-[11px] text-neutral-500 mt-1 leading-snug">
                                  Aggressive — more false positives
                                </div>
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-1.5">
                                Join Limit
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="w-full">
                                  <div className="relative">
                                    <input
                                      autocomplete="off"
                                      title=""
                                      className="w-full px-4 py-3 sm:py-2.5 bg-white dark:bg-neutral-800 border rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600    "
                                      min="3"
                                      max="50"
                                      type="number"
                                      value="10"
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-neutral-500 flex-shrink-0">
                                  joins
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-1.5">
                                Time Window
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="w-full">
                                  <div className="relative">
                                    <input
                                      autocomplete="off"
                                      title=""
                                      className="w-full px-4 py-3 sm:py-2.5 bg-white dark:bg-neutral-800 border rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600    "
                                      min="10"
                                      max="300"
                                      type="number"
                                      value="30"
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-neutral-500 flex-shrink-0">
                                  sec
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-1.5">
                                Young-account cutoff
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="w-full">
                                  <div className="relative">
                                    <input
                                      autocomplete="off"
                                      title=""
                                      className="w-full px-4 py-3 sm:py-2.5 bg-white dark:bg-neutral-800 border rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600    "
                                      min="0"
                                      max="365"
                                      type="number"
                                      value="7"
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-neutral-500 flex-shrink-0">
                                  days
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-1.5">
                                Max Action (ceiling)
                              </label>
                              <div className="jsx-556cf662b09b3c73 w-full">
                                <div className="jsx-556cf662b09b3c73 relative">
                                  <button
                                    type="button"
                                    className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                                  >
                                    <span className="jsx-556cf662b09b3c73 min-w-0 truncate text-sm text-white">
                                      <span className="jsx-556cf662b09b3c73 flex items-center gap-2 min-w-0">
                                        <span className="jsx-556cf662b09b3c73 truncate">
                                          Lockdown
                                        </span>
                                      </span>
                                    </span>
                                    <div className="jsx-556cf662b09b3c73 flex items-center gap-1">
                                      <span
                                        role="button"
                                        tabIndex="0"
                                        aria-label="Clear selection"
                                        className="jsx-556cf662b09b3c73 p-2 -m-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
                                          <path d="M18 6 6 18"></path>
                                          <path d="m6 6 12 12"></path>
                                        </svg>
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
                                        className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 "
                                      >
                                        <path d="m6 9 6 6 6-6"></path>
                                      </svg>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-1.5">
                                Auto-unlock after
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="w-full">
                                  <div className="relative">
                                    <input
                                      autocomplete="off"
                                      title=""
                                      className="w-full px-4 py-3 sm:py-2.5 bg-white dark:bg-neutral-800 border rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600    "
                                      min="1"
                                      max="1440"
                                      type="number"
                                      value="60"
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-neutral-500 flex-shrink-0">
                                  min
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-neutral-800 mt-5 pt-4">
                            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                              Advanced
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[11px] text-neutral-500 block mb-1.5">
                                  Trusted Users (immune)
                                </label>
                                <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text transition-colors">
                                  <input
                                    placeholder="Add user IDs..."
                                    title=""
                                    autocomplete="off"
                                    className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5"
                                    value=""
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[11px] text-neutral-500 block mb-1.5">
                                  Trusted Roles (immune)
                                </label>
                                <div className="jsx-556cf662b09b3c73 w-full">
                                  <div className="jsx-556cf662b09b3c73 relative">
                                    <button
                                      type="button"
                                      className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                                    >
                                      <span className="jsx-556cf662b09b3c73 min-w-0 truncate text-sm text-neutral-500">
                                        Add a trusted role...
                                      </span>
                                      <div className="jsx-556cf662b09b3c73 flex items-center gap-1">
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
                                          className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 "
                                        >
                                          <path d="m6 9 6 6 6-6"></path>
                                        </svg>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-medium text-white">
                                  Verification Challenge
                                </span>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked="false"
                                    className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                                  >
                                    <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]"></span>
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4">
                              <label className="text-[11px] text-neutral-500 block mb-1.5">
                                Raid Alert Channel (optional)
                              </label>
                              <div className="jsx-556cf662b09b3c73 w-full">
                                <div className="jsx-556cf662b09b3c73 relative">
                                  <button
                                    type="button"
                                    className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                                  >
                                    <span className="jsx-556cf662b09b3c73 min-w-0 truncate text-sm text-neutral-500">
                                      Defaults to log channel
                                    </span>
                                    <div className="jsx-556cf662b09b3c73 flex items-center gap-1">
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
                                        className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 "
                                      >
                                        <path d="m6 9 6 6 6-6"></path>
                                      </svg>
                                    </div>
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
              <div className="">
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                  <div className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-amber-500/10">
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
                          className="lucide lucide-user-x w-4 h-4 text-amber-400"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <line x1="17" x2="22" y1="8" y2="13"></line>
                          <line x1="22" x2="17" y1="8" y2="13"></line>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-white truncate">
                        Suspicious Account Detection
                      </span>
                    </div>
                    <div className="shrink-0">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked="true"
                          className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                        >
                          <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid transition-all duration-200 ease-in-out grid-rows-[1fr] opacity-100">
                    <div className="">
                      <div className="px-5 pb-5 pt-4 border-t border-neutral-800">
                        <div className="relative">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-1.5">
                                Account Age
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="w-full">
                                  <div className="relative">
                                    <input
                                      autocomplete="off"
                                      title=""
                                      className="w-full px-4 py-3 sm:py-2.5 bg-white dark:bg-neutral-800 border rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600    "
                                      min="0"
                                      max="365"
                                      type="number"
                                      value="14"
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-neutral-500 flex-shrink-0">
                                  days
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-1.5">
                                No Profile Picture
                              </label>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked="false"
                                  className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                                >
                                  <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]"></span>
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-1.5">
                                Default Username
                              </label>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked="false"
                                  className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                                >
                                  <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]"></span>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-1.5">
                                Action
                              </label>
                              <div className="jsx-556cf662b09b3c73 w-full">
                                <div className="jsx-556cf662b09b3c73 relative">
                                  <button
                                    type="button"
                                    className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                                  >
                                    <span className="jsx-556cf662b09b3c73 min-w-0 truncate text-sm text-white">
                                      <span className="jsx-556cf662b09b3c73 flex items-center gap-2 min-w-0">
                                        <span className="jsx-556cf662b09b3c73 truncate">
                                          Flag Only
                                        </span>
                                      </span>
                                    </span>
                                    <div className="jsx-556cf662b09b3c73 flex items-center gap-1">
                                      <span
                                        role="button"
                                        tabIndex="0"
                                        aria-label="Clear selection"
                                        className="jsx-556cf662b09b3c73 p-2 -m-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
                                          <path d="M18 6 6 18"></path>
                                          <path d="m6 6 12 12"></path>
                                        </svg>
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
                                        className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 "
                                      >
                                        <path d="m6 9 6 6 6-6"></path>
                                      </svg>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-1.5">
                                Alert Channel
                              </label>
                              <div className="jsx-556cf662b09b3c73 w-full">
                                <div className="jsx-556cf662b09b3c73 relative">
                                  <button
                                    type="button"
                                    className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                                  >
                                    <span className="jsx-556cf662b09b3c73 min-w-0 truncate text-sm text-neutral-500">
                                      Select channel...
                                    </span>
                                    <div className="jsx-556cf662b09b3c73 flex items-center gap-1">
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
                                        className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 "
                                      >
                                        <path d="m6 9 6 6 6-6"></path>
                                      </svg>
                                    </div>
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
            </div>
            <div className="mt-3">
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-cyan-500/10">
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
                        className="lucide lucide-webhook w-4 h-4 text-cyan-400"
                      >
                        <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"></path>
                        <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"></path>
                        <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-white truncate">
                      Webhook &amp; App Protection
                    </span>
                  </div>
                  <div className="shrink-0">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked="true"
                        className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                      >
                        <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black"></span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid transition-all duration-200 ease-in-out grid-rows-[1fr] opacity-100">
                  <div className="">
                    <div className="px-5 pb-5 pt-4 border-t border-neutral-800">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-neutral-800/50 rounded-xl">
                            <p className="text-sm font-medium text-white">
                              Block @everyone from webhooks
                            </p>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                role="switch"
                                aria-checked="true"
                                className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                              >
                                <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black"></span>
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-neutral-800/50 rounded-xl">
                            <p className="text-sm font-medium text-white">
                              Block invite links from webhooks
                            </p>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                role="switch"
                                aria-checked="true"
                                className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                              >
                                <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black"></span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-neutral-500 block mb-1.5">
                              Rate limit (messages/min)
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="w-full">
                                <div className="relative">
                                  <input
                                    autocomplete="off"
                                    title=""
                                    className="w-full px-4 py-3 sm:py-2.5 bg-white dark:bg-neutral-800 border rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600    "
                                    min="1"
                                    max="30"
                                    type="number"
                                    value="5"
                                  />
                                </div>
                              </div>
                              <span className="text-xs text-neutral-500 flex-shrink-0">
                                msg/min
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] text-neutral-500 block mb-1.5">
                              Action when triggered
                            </label>
                            <div className="jsx-556cf662b09b3c73 w-full">
                              <div className="jsx-556cf662b09b3c73 relative">
                                <button
                                  type="button"
                                  className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                                >
                                  <span className="jsx-556cf662b09b3c73 min-w-0 truncate text-sm text-white">
                                    <span className="jsx-556cf662b09b3c73 flex items-center gap-2 min-w-0">
                                      <span className="jsx-556cf662b09b3c73 truncate">
                                        Delete messages
                                      </span>
                                    </span>
                                  </span>
                                  <div className="jsx-556cf662b09b3c73 flex items-center gap-1">
                                    <span
                                      role="button"
                                      tabIndex="0"
                                      aria-label="Clear selection"
                                      className="jsx-556cf662b09b3c73 p-2 -m-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                      </svg>
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
                                      className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 "
                                    >
                                      <path d="m6 9 6 6 6-6"></path>
                                    </svg>
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] text-neutral-500 block mb-1.5">
                            Whitelisted webhook/app IDs
                          </label>
                          <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text transition-colors">
                            <input
                              placeholder="Add trusted webhook or app IDs..."
                              title=""
                              autocomplete="off"
                              className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5"
                              value=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 shrink-0">
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
                    className="lucide lucide-alert-triangle w-4 h-4 text-amber-400"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <path d="M12 9v4"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white">Threat Log</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-0.5 p-1 rounded-xl bg-neutral-800/50 border border-neutral-800 w-fit">
                  <button className="relative px-3.5 py-2 rounded-lg text-sm font-medium transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 text-black">
                    <span
                      className="absolute inset-0 bg-white rounded-lg"
                      style="opacity: 1;"
                    ></span>
                    <span className="relative z-10">All</span>
                  </button>
                  <button className="relative px-3.5 py-2 rounded-lg text-sm font-medium transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 text-neutral-400 hover:text-white">
                    <span className="relative z-10">Raids</span>
                  </button>
                  <button className="relative px-3.5 py-2 rounded-lg text-sm font-medium transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 text-neutral-400 hover:text-white">
                    <span className="relative z-10">Nuke Events</span>
                  </button>
                </div>
                <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 ">
                  <div className="relative ">
                    <div className="text-center py-12">
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
                        className="lucide lucide-alert-triangle w-10 h-10 text-neutral-700 mx-auto mb-3"
                      >
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                        <path d="M12 9v4"></path>
                        <path d="M12 17h.01"></path>
                      </svg>
                      <p className="text-neutral-400 text-sm font-medium text-pretty">
                        No threats detected
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
