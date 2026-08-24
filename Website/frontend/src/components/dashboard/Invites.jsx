import React, { useState, useEffect } from "react";
import { useToast } from "../ui/Toast";
import { useParams } from "react-router-dom";

export default function Invites() {
  const { guildId } = useParams();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    const toastId = toast.loading("Saving...");
    setIsSaving(true);
    setTimeout(() => {
      toast.success("Settings saved", { id: toastId });
      setIsSaving(false);
    }, 1000);
  };

  return (
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
                  className="lucide lucide-user-plus w-5 h-5"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
              </span>
              <h1 className="text-base font-medium text-white truncate">
                Invite Tracker
              </h1>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[340px,1fr] gap-4 lg:items-stretch">
            <div className="lg:order-2 lg:relative flex flex-col">
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col lg:absolute lg:inset-0">
                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
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
                      className="lucide lucide-medal w-4 h-4 text-neutral-500"
                    >
                      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
                      <path d="M11 12 5.12 2.2" />
                      <path d="m13 12 5.88-9.8" />
                      <path d="M8 7h8" />
                      <circle cx="12" cy="17" r="5" />
                      <path d="M12 18v-2h-.5" />
                    </svg>
                    <span className="text-sm font-medium text-white">
                      Top Inviters
                    </span>
                  </div>
                </div>
                <div className="relative flex items-end justify-center px-4 pt-8 pb-0">
                  <div className="absolute bottom-0 left-4 right-4 h-px bg-neutral-800"></div>
                  <div className="flex flex-col items-center flex-1 max-w-[160px] relative z-10">
                    <div className="h-6 flex items-end justify-center"></div>
                    <div className="w-12 h-12 rounded-full animate-pulse bg-neutral-800/60"></div>
                    <div className="h-3 w-14 rounded bg-neutral-800/40 animate-pulse mt-2"></div>
                    <div className="h-3.5 w-8 rounded bg-neutral-800/30 animate-pulse mt-1"></div>
                    <div className="mb-1 mt-0.5 h-3"></div>
                    <div className="w-[85%] h-16 bg-neutral-800/15 rounded-t-xl mt-1 flex items-end justify-center pb-3">
                      <span className="text-2xl font-black text-neutral-800/15">
                        2
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center flex-1 max-w-[160px] relative z-10">
                    <div className="h-6 flex items-end justify-center"></div>
                    <div className="w-16 h-16 rounded-full animate-pulse bg-neutral-800/60"></div>
                    <div className="h-3 w-14 rounded bg-neutral-800/40 animate-pulse mt-2"></div>
                    <div className="h-3.5 w-8 rounded bg-neutral-800/30 animate-pulse mt-1"></div>
                    <div className="mb-1 mt-0.5 h-3"></div>
                    <div className="w-[85%] h-24 bg-neutral-800/15 rounded-t-xl mt-1 flex items-end justify-center pb-3">
                      <span className="text-2xl font-black text-neutral-800/15">
                        1
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center flex-1 max-w-[160px] relative z-10">
                    <div className="h-6 flex items-end justify-center"></div>
                    <div className="w-11 h-11 rounded-full animate-pulse bg-neutral-800/60"></div>
                    <div className="h-3 w-14 rounded bg-neutral-800/40 animate-pulse mt-2"></div>
                    <div className="h-3.5 w-8 rounded bg-neutral-800/30 animate-pulse mt-1"></div>
                    <div className="mb-1 mt-0.5 h-3"></div>
                    <div className="w-[85%] h-12 bg-neutral-800/15 rounded-t-xl mt-1 flex items-end justify-center pb-3">
                      <span className="text-2xl font-black text-neutral-800/15">
                        3
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-neutral-800 flex-1 min-h-0 overflow-y-auto max-h-[55vh] lg:max-h-none scrollbar-thin">
                  <div
                    className="flex items-center gap-3 px-5 py-2.5"
                    style={{ opacity: "0.15" }}
                  >
                    <span className="text-xs font-semibold text-neutral-500 w-7 text-right tabular-nums flex-shrink-0">
                      #4
                    </span>
                    <div className="w-7 h-7 rounded-full bg-neutral-700 flex-shrink-0"></div>
                    <div className="h-3 rounded-sm bg-neutral-700 w-28"></div>
                    <div className="h-3 w-8 rounded-sm bg-neutral-700 flex-shrink-0 ml-auto"></div>
                  </div>
                  <div
                    className="flex items-center gap-3 px-5 py-2.5"
                    style={{ opacity: "0.12" }}
                  >
                    <span className="text-xs font-semibold text-neutral-500 w-7 text-right tabular-nums flex-shrink-0">
                      #5
                    </span>
                    <div className="w-7 h-7 rounded-full bg-neutral-700 flex-shrink-0"></div>
                    <div className="h-3 rounded-sm bg-neutral-700 w-20"></div>
                    <div className="h-3 w-8 rounded-sm bg-neutral-700 flex-shrink-0 ml-auto"></div>
                  </div>
                  <div
                    className="flex items-center gap-3 px-5 py-2.5"
                    style={{ opacity: "0.09" }}
                  >
                    <span className="text-xs font-semibold text-neutral-500 w-7 text-right tabular-nums flex-shrink-0">
                      #6
                    </span>
                    <div className="w-7 h-7 rounded-full bg-neutral-700 flex-shrink-0"></div>
                    <div className="h-3 rounded-sm bg-neutral-700 w-24"></div>
                    <div className="h-3 w-8 rounded-sm bg-neutral-700 flex-shrink-0 ml-auto"></div>
                  </div>
                  <div
                    className="flex items-center gap-3 px-5 py-2.5"
                    style={{ opacity: "0.06" }}
                  >
                    <span className="text-xs font-semibold text-neutral-500 w-7 text-right tabular-nums flex-shrink-0">
                      #7
                    </span>
                    <div className="w-7 h-7 rounded-full bg-neutral-700 flex-shrink-0"></div>
                    <div className="h-3 rounded-sm bg-neutral-700 w-16"></div>
                    <div className="h-3 w-8 rounded-sm bg-neutral-700 flex-shrink-0 ml-auto"></div>
                  </div>
                  <div
                    className="flex items-center gap-3 px-5 py-2.5"
                    style={{ opacity: "0.03" }}
                  >
                    <span className="text-xs font-semibold text-neutral-500 w-7 text-right tabular-nums flex-shrink-0">
                      #8
                    </span>
                    <div className="w-7 h-7 rounded-full bg-neutral-700 flex-shrink-0"></div>
                    <div className="h-3 rounded-sm bg-neutral-700 w-22"></div>
                    <div className="h-3 w-8 rounded-sm bg-neutral-700 flex-shrink-0 ml-auto"></div>
                  </div>
                  <div className="flex flex-col items-center justify-center py-4 px-6 text-center">
                    <p className="text-sm font-medium text-neutral-400 text-pretty">
                      The podium is empty
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:order-1">
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col flex-1">
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-neutral-800">
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
                      className="lucide lucide-settings w-4 h-4 text-blue-400"
                    >
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <h3 className="text-sm font-medium text-white text-balance">
                      Invite Tracking
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={true}
                      onClick={() => handleSave()}
                      className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                    >
                      <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black"></span>
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-neutral-800/50">
                  <div className="flex items-center justify-between gap-3 px-4 py-2">
                    <span className="text-sm text-neutral-300">
                      Track leaves
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={true}
                        onClick={() => handleSave()}
                        className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                      >
                        <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black"></span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-2">
                    <span className="text-sm text-neutral-300">
                      Count rejoins
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={false}
                        onClick={() => handleSave()}
                        className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                      >
                        <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]"></span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-2">
                    <span className="text-sm text-neutral-300">
                      Show inviter count
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={true}
                        onClick={() => handleSave()}
                        className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                      >
                        <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black"></span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-2">
                    <span className="text-sm text-neutral-300">
                      Count vanity URL joins (discord.gg/yourvanity)
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={false}
                        onClick={() => handleSave()}
                        className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                      >
                        <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]"></span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="border-t border-neutral-800 px-4 pt-3 pb-2">
                  <div className="flex items-center gap-2 mb-1">
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
                      className="lucide lucide-gift w-3.5 h-3.5 text-neutral-500"
                    >
                      <rect x="3" y="8" width="18" height="4" rx="1" />
                      <path d="M12 8v13" />
                      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                    </svg>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Rewards
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs tabular-nums text-neutral-500">
                      0/999 rewards
                    </span>
                    <div className="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all bg-white/60"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2 space-y-1 min-h-[200px] max-h-[200px] overflow-y-auto scrollbar-thin">
                  <div className="flex flex-col items-center gap-1 py-3 text-center">
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
                      className="lucide lucide-gift w-4 h-4 text-neutral-800"
                    >
                      <rect x="3" y="8" width="18" height="4" rx="1" />
                      <path d="M12 8v13" />
                      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                    </svg>
                    <p className="text-xs text-neutral-600 leading-snug max-w-[200px] text-pretty">
                      Auto-assign roles when members hit an invite milestone.
                    </p>
                  </div>
                </div>
                <div className="px-3 pb-3 pt-2 border-t border-neutral-800/40 flex gap-2">
                  <input
                    min="1"
                    aria-label="Number of invites required"
                    placeholder="Invites"
                    className="w-16 flex-shrink-0 px-2 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs text-center placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600/30 transition-colors duration-100 [appearance:textfield] [&amp;::-webkit-outer-spin-button]:appearance-none [&amp;::-webkit-inner-spin-button]:appearance-none"
                    type="number"
                    value=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="jsx-556cf662b09b3c73 w-full">
                      <div className="jsx-556cf662b09b3c73 relative">
                        <button
                          type="button"
                          className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                        >
                          <span className="jsx-556cf662b09b3c73 min-w-0 truncate text-sm text-neutral-500">
                            Role...
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
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={true}
                    className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-white text-black text-xs font-medium hover:bg-neutral-200 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-[transform,background-color,color] duration-150 ease-out flex-shrink-0"
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
                      className="lucide lucide-plus w-3 h-3"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Add
                  </button>
                </div>
                <div className="border-t border-neutral-800">
                  <div
                    className="relative flex flex-col !rounded-none !border-0 [&amp;&gt;div:last-child]:!rounded-none"
                    role="button"
                    tabIndex="0"
                    style={{ cursor: "default" }}
                  >
                    <div className="pointer-events-none select-none flex flex-col flex-1">
                      <div className="flex items-center justify-between px-4 pt-3 pb-3">
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
                            className="lucide lucide-send w-3.5 h-3.5 text-neutral-500"
                          >
                            <path d="m22 2-7 20-4-9-9-4Z" />
                            <path d="M22 2 11 13" />
                          </svg>
                          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Auto Post
                          </span>
                          <span className="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-[0_1px_2px_-0.5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-emerald-400 border-emerald-500/20 bg-gradient-to-b from-emerald-400/25 to-emerald-600/10 h-[19px] pl-[5px] pr-[6.5px] gap-[3px] rounded-[6px] text-[9.5px]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-sparkles shrink-0 -ml-px opacity-90"
                              aria-hidden="true"
                            >
                              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                              <path d="M5 3v4" />
                              <path d="M19 17v4" />
                              <path d="M3 5h4" />
                              <path d="M17 19h4" />
                            </svg>
                            Starter
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={false}
                            className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                          >
                            <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]"></span>
                          </button>
                        </div>
                      </div>
                      <div className="px-4 pb-3 space-y-2.5">
                        <div className="jsx-556cf662b09b3c73 w-full">
                          <div className="jsx-556cf662b09b3c73 relative">
                            <button
                              type="button"
                              className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                            >
                              <span className="jsx-556cf662b09b3c73 min-w-0 truncate text-sm text-neutral-500">
                                # post to channel
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
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </div>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            placeholder="Embed title"
                            className="flex-1 min-w-0 px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                            type="text"
                            value="Invite Leaderboard"
                          />
                          <div className="relative flex flex-col">
                            <button
                              type="button"
                              className="w-8 h-8 rounded-lg border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer flex-shrink-0"
                              style={{ backgroundColor: "rgb(88, 101, 242)" }}
                            ></button>
                          </div>
                        </div>
                        <div className="pt-1">
                          <span className="text-sm text-neutral-300 block mb-1.5">
                            Update every
                          </span>
                          <div className="flex gap-1 p-0.5 rounded-xl bg-neutral-800">
                            <button
                              type="button"
                              className="flex-1 py-2 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 text-neutral-700 hover:text-neutral-500"
                            >
                              5m
                            </button>
                            <button
                              type="button"
                              className="flex-1 py-2 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 text-neutral-700 hover:text-neutral-500"
                            >
                              15m
                            </button>
                            <button
                              type="button"
                              className="flex-1 py-2 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 text-neutral-700 hover:text-neutral-500"
                            >
                              30m
                            </button>
                            <button
                              type="button"
                              className="flex-1 py-2 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 bg-neutral-700 text-white"
                            >
                              1h
                            </button>
                            <button
                              type="button"
                              className="flex-1 py-2 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 text-neutral-500 hover:text-neutral-300"
                            >
                              6h
                            </button>
                            <button
                              type="button"
                              className="flex-1 py-2 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 text-neutral-500 hover:text-neutral-300"
                            >
                              12h
                            </button>
                            <button
                              type="button"
                              className="flex-1 py-2 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 text-neutral-500 hover:text-neutral-300"
                            >
                              24h
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 pt-0.5">
                          <span className="text-sm text-neutral-300">
                            Show top
                          </span>
                          <div className="flex gap-0.5 p-0.5 rounded-xl bg-neutral-800">
                            <button
                              type="button"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-neutral-500 hover:text-neutral-300"
                            >
                              5
                            </button>
                            <button
                              type="button"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-neutral-700 text-white"
                            >
                              10
                            </button>
                            <button
                              type="button"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-neutral-500 hover:text-neutral-300"
                            >
                              15
                            </button>
                            <button
                              type="button"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-neutral-500 hover:text-neutral-300"
                            >
                              20
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-neutral-300">
                            Show podium
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={true}
                              className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                            >
                              <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black"></span>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-neutral-300">
                            Show counts
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={true}
                              className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                            >
                              <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black"></span>
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={true}
                          className="mt-1 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"
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
                            className="lucide lucide-send w-3 h-3"
                          >
                            <path d="m22 2-7 20-4-9-9-4Z" />
                            <path d="M22 2 11 13" />
                          </svg>{" "}
                          Post Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 pb-4">
            <div className="bg-neutral-900 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
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
                    className="lucide lucide-link2 w-5 h-5 text-neutral-500"
                  >
                    <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                    <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
                    <line x1="8" x2="16" y1="12" y2="12" />
                  </svg>
                  <h3 className="text-white font-semibold">Source Tracker</h3>
                </div>
                <div className="flex items-center gap-3"></div>
              </div>
              <div className="p-4">
                <div className="relative">
                  <div
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pointer-events-none select-none"
                    aria-hidden="true"
                  >
                    <div className="rounded-xl border border-neutral-800/50 overflow-hidden opacity-[0.3]">
                      <div
                        className="h-1"
                        style={{ backgroundColor: "rgb(239, 68, 68)" }}
                      ></div>
                      <div className="pl-4 pr-3 py-5 space-y-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="w-20 h-4 rounded bg-neutral-700/60"></div>
                            <div className="w-32 h-3 rounded bg-neutral-800/40"></div>
                          </div>
                          <div className="w-5 h-5 rounded bg-neutral-800/50"></div>
                        </div>
                        <div className="flex items-baseline gap-4 pt-1">
                          <div className="flex items-baseline gap-1.5">
                            <div className="w-12 h-7 rounded bg-neutral-700/50"></div>
                            <div className="w-8 h-3.5 rounded bg-neutral-800/50"></div>
                          </div>
                          <div className="w-10 h-4.5 rounded bg-neutral-800/40"></div>
                          <div className="flex items-baseline gap-1 ml-auto">
                            <div className="w-9 h-4 rounded bg-neutral-800/50"></div>
                            <div className="w-12 h-3 rounded bg-neutral-800/30"></div>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full rounded-full opacity-40"
                            style={{
                              width: "75%",
                              backgroundColor: "rgb(239, 68, 68)",
                            }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-3 rounded bg-neutral-800/40"></div>
                            <div className="w-12 h-3 rounded bg-neutral-800/35"></div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded bg-neutral-800/30"></div>
                            <div className="w-28 h-3 rounded bg-neutral-800/25"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-neutral-800/50 overflow-hidden opacity-[0.3]">
                      <div
                        className="h-1"
                        style={{ backgroundColor: "rgb(59, 130, 246)" }}
                      ></div>
                      <div className="pl-4 pr-3 py-5 space-y-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="w-16 h-4 rounded bg-neutral-700/60"></div>
                            <div className="w-32 h-3 rounded bg-neutral-800/40"></div>
                          </div>
                          <div className="w-5 h-5 rounded bg-neutral-800/50"></div>
                        </div>
                        <div className="flex items-baseline gap-4 pt-1">
                          <div className="flex items-baseline gap-1.5">
                            <div className="w-10 h-7 rounded bg-neutral-700/50"></div>
                            <div className="w-8 h-3.5 rounded bg-neutral-800/50"></div>
                          </div>
                          <div className="w-10 h-4.5 rounded bg-neutral-800/40"></div>
                          <div className="flex items-baseline gap-1 ml-auto">
                            <div className="w-9 h-4 rounded bg-neutral-800/50"></div>
                            <div className="w-12 h-3 rounded bg-neutral-800/30"></div>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full rounded-full opacity-40"
                            style={{
                              width: "55%",
                              backgroundColor: "rgb(59, 130, 246)",
                            }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-3 rounded bg-neutral-800/40"></div>
                            <div className="w-12 h-3 rounded bg-neutral-800/35"></div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded bg-neutral-800/30"></div>
                            <div className="w-28 h-3 rounded bg-neutral-800/25"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-neutral-800/50 overflow-hidden opacity-[0.3]">
                      <div
                        className="h-1"
                        style={{ backgroundColor: "rgb(249, 115, 22)" }}
                      ></div>
                      <div className="pl-4 pr-3 py-5 space-y-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="w-14 h-4 rounded bg-neutral-700/60"></div>
                            <div className="w-32 h-3 rounded bg-neutral-800/40"></div>
                          </div>
                          <div className="w-5 h-5 rounded bg-neutral-800/50"></div>
                        </div>
                        <div className="flex items-baseline gap-4 pt-1">
                          <div className="flex items-baseline gap-1.5">
                            <div className="w-11 h-7 rounded bg-neutral-700/50"></div>
                            <div className="w-8 h-3.5 rounded bg-neutral-800/50"></div>
                          </div>
                          <div className="w-10 h-4.5 rounded bg-neutral-800/40"></div>
                          <div className="flex items-baseline gap-1 ml-auto">
                            <div className="w-9 h-4 rounded bg-neutral-800/50"></div>
                            <div className="w-12 h-3 rounded bg-neutral-800/30"></div>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full rounded-full opacity-40"
                            style={{
                              width: "35%",
                              backgroundColor: "rgb(249, 115, 22)",
                            }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-3 rounded bg-neutral-800/40"></div>
                            <div className="w-12 h-3 rounded bg-neutral-800/35"></div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded bg-neutral-800/30"></div>
                            <div className="w-28 h-3 rounded bg-neutral-800/25"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/60 backdrop-blur-[2px] rounded-xl">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-3">
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
                        className="lucide lucide-link2 w-5 h-5 text-neutral-500"
                      >
                        <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                        <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
                        <line x1="8" x2="16" y1="12" y2="12" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">
                      Track your invite sources
                    </h3>
                    <p className="text-[11px] text-neutral-500 text-center max-w-xs mb-4 leading-relaxed">
                      Create unique invite links for YouTube, Twitter, Reddit,
                      and more.
                    </p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-neutral-200 transition-colors">
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
                        className="lucide lucide-plus w-3.5 h-3.5"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      Create Source
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
