import React, { useState, useEffect, useRef } from "react";

export default function WelcomeSettings({
  config,
  channels,
  onSave,
  saving,
  onReset,
}) {
  const wCfg = config?.welcome || {};
  const gCfg = config?.goodbye || {};

  const [welcomeEnabled, setWelcomeEnabled] = useState(wCfg.enabled || false);
  const [welcomeChannel, setWelcomeChannel] = useState(wCfg.channel_id || "");
  const [welcomeText, setWelcomeText] = useState(wCfg.message || "");

  const [dmJoinEnabled, setDmJoinEnabled] = useState(wCfg.dm_enabled || false);
  const [dmJoinText, setDmJoinText] = useState(wCfg.dm_message || "");

  const [goodbyeEnabled, setGoodbyeEnabled] = useState(gCfg.enabled || false);
  const [goodbyeChannel, setGoodbyeChannel] = useState(gCfg.channel_id || "");
  const [goodbyeText, setGoodbyeText] = useState(gCfg.message || "");

  const [dmLeaveEnabled, setDmLeaveEnabled] = useState(
    gCfg.dm_enabled || false,
  );
  const [dmLeaveText, setDmLeaveText] = useState(gCfg.dm_message || "");

  const isFirstRender = useRef(true);

  const getPayload = () => ({
    welcome: {
      ...wCfg,
      enabled: welcomeEnabled,
      channel_id: welcomeChannel,
      message: welcomeText,
      dm_enabled: dmJoinEnabled,
      dm_message: dmJoinText,
    },
    goodbye: {
      ...gCfg,
      enabled: goodbyeEnabled,
      channel_id: goodbyeChannel,
      message: goodbyeText,
      dm_enabled: dmLeaveEnabled,
      dm_message: dmLeaveText,
    },
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handler = setTimeout(() => {
      onSave(getPayload());
    }, 50); // fast autosave
    return () => clearTimeout(handler);
  }, [
    welcomeEnabled,
    welcomeChannel,
    welcomeText,
    dmJoinEnabled,
    dmJoinText,
    goodbyeEnabled,
    goodbyeChannel,
    goodbyeText,
    dmLeaveEnabled,
    dmLeaveText,
  ]);

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto">
      <div>
        <div data-tour="feature-header" className="scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-message-square w-5 h-5"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <h1 className="text-base font-medium text-white truncate">
                Welcome Messages
              </h1>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-5 min-w-0">
            <div className="flex flex-col gap-5 min-w-0">
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-message-square w-4 h-4 flex-shrink-0 text-neutral-500"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-white truncate">
                      Welcome Message
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div
                      data-tour="welcome-channel"
                      className="w-36 sm:w-52 rounded-xl scroll-mt-24 transition-[box-shadow] "
                    >
                      <div className="jsx-556cf662b09b3c73 w-full">
                        <div className="jsx-556cf662b09b3c73 relative">
                          <button
                            type="button"
                            className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                          >
                            <span className="jsx-556cf662b09b3c73 min-w-0 truncate text-sm text-neutral-500">
                              # select channel
                            </span>
                            <div className="jsx-556cf662b09b3c73 flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
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
                    <span
                      data-tour="feature-toggle"
                      className="inline-flex scroll-mt-24"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked="false"
                          className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                        >
                          <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]" />
                        </button>
                      </div>
                    </span>
                  </div>
                </div>
                <div
                  data-tour="welcome-message"
                  className="scroll-mt-24 p-4 sm:p-5 space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-stretch gap-2">
                      <div className="flex-1 min-w-0">
                        <div
                          className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors "
                          style={{ minHeight: 42 }}
                        >
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white h-full text-[16px] leading-6 sm:text-[13px] sm:leading-5"
                            style={{
                              fontFamily:
                                '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
                              padding: "10px 14px",
                              letterSpacing: 0,
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "nowrap",
                              boxSizing: "border-box",
                              margin: 0,
                              overflow: "hidden",
                              zIndex: 1,
                            }}
                          >
                            <span style={{ color: "rgba(115, 115, 115, 0.8)" }}>
                              Welcome! (default)
                            </span>
                          </div>
                          <textarea
                            rows={1}
                            className="relative block w-full resize-none focus:outline-none bg-transparent  text-[16px] leading-6 sm:text-[13px] sm:leading-5"
                            style={{
                              fontFamily:
                                '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
                              padding: "10px 14px",
                              letterSpacing: 0,
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              whiteSpace: "nowrap",
                              boxSizing: "border-box",
                              margin: 0,
                              overflow: "hidden",
                              zIndex: 2,
                              boxShadow: "none",
                              color: "transparent",
                              WebkitTextFillColor: "transparent",
                              caretColor: "white",
                            }}
                            defaultValue={""}
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="relative flex flex-col">
                          <button
                            type="button"
                            className="w-[42px] h-[42px] rounded-xl shadow-sm border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer flex-shrink-0"
                            style={{ backgroundColor: "rgb(88, 101, 242)" }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors "
                      style={{ minHeight: 84 }}
                    >
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white h-full text-[16px] leading-6 sm:text-[13px] sm:leading-5"
                        style={{
                          fontFamily:
                            '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
                          padding: "12px 16px",
                          letterSpacing: 0,
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "pre-wrap",
                          boxSizing: "border-box",
                          margin: 0,
                          zIndex: 1,
                          height: 84,
                        }}
                      >
                        <span style={{ color: "rgba(115, 115, 115, 0.8)" }}>
                          Welcome {"{"}user{"}"} to {"{"}server{"}"}! (default)
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        className="relative block w-full resize-none focus:outline-none bg-transparent  text-[16px] leading-6 sm:text-[13px] sm:leading-5"
                        style={{
                          fontFamily:
                            '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
                          padding: "12px 16px",
                          letterSpacing: 0,
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "pre-wrap",
                          boxSizing: "border-box",
                          margin: 0,
                          zIndex: 2,
                          boxShadow: "none",
                          color: "transparent",
                          WebkitTextFillColor: "transparent",
                          caretColor: "white",
                          height: 84,
                        }}
                        defaultValue={""}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        title="Insert {user}"
                        className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                      >
                        @user
                      </button>
                      <button
                        type="button"
                        title="Insert {user.displayName}"
                        className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                      >
                        @display name
                      </button>
                      <button
                        type="button"
                        title="Insert {server}"
                        className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-green-500/20 text-green-300 hover:bg-green-500/25 border border-green-500/20"
                      >
                        @server
                      </button>
                      <button
                        type="button"
                        title="Insert {invite}"
                        className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/20"
                      >
                        @invite
                      </button>
                      <button
                        type="button"
                        title="Insert {memberCount}"
                        className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20"
                      >
                        @members
                      </button>
                    </div>
                    <span className="text-[11px] tabular-nums flex-shrink-0 ml-2 text-neutral-600">
                      0/2000
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-neutral-800/60">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <span className="text-[12px] text-neutral-300">
                        Embed
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked="true"
                          className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                        >
                          <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black" />
                        </button>
                      </div>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <span className="text-[12px] text-neutral-300">
                        User avatar
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked="true"
                          className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                        >
                          <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black" />
                        </button>
                      </div>
                    </label>
                    <label
                      className="inline-flex items-center gap-2 cursor-pointer"
                      title="Unlocks {inviter}, {inviter.name}, {inviter.count}, {invite.code} and {account.age}. Needs Invite Tracking on."
                    >
                      <span className="text-[12px] text-neutral-300">
                        Inviter variables
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked="false"
                          className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                        >
                          <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]" />
                        </button>
                      </div>
                    </label>
                  </div>
                  <div
                    className="relative  "
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "default" }}
                  >
                    <div className="pointer-events-none select-none flex flex-col flex-1">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                            Embed Image
                          </label>
                          <span className="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-[0_1px_2px_-0.5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-emerald-400 border-emerald-500/20 bg-gradient-to-b from-emerald-400/25 to-emerald-600/10 h-[19px] pl-[5px] pr-[6.5px] gap-[3px] rounded-[6px] text-[9.5px]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={10}
                              height={10}
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
                        <div className="space-y-1.5">
                          <div className="relative rounded-xl border border-dashed transition-all overflow-hidden h-24 flex flex-col items-center justify-center border-neutral-700 hover:border-neutral-600 bg-neutral-800/40">
                            <div className="flex flex-col items-center justify-center cursor-pointer">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-upload w-5 h-5 text-neutral-500 mb-1.5"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1={12} x2={12} y1={3} y2={15} />
                              </svg>
                              <span className="text-sm font-medium text-neutral-300">
                                Click or drop an image
                              </span>
                              <span className="text-[10px] text-neutral-500 mt-0.5">
                                PNG ┬À JPG ┬À WebP ┬À GIF ┬À up to 4 MB
                              </span>
                            </div>
                            <button
                              type="button"
                              className="absolute bottom-2 right-2.5 inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-md bg-neutral-700/50 hover:bg-neutral-700 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-link w-3 h-3"
                              >
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                              Use URL
                            </button>
                            <input
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              className="hidden"
                              type="file"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-neutral-800">
                  <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">
                      Preview
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 focus-visible:ring-green-500/40 "
                      disabled
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-send w-3 h-3"
                      >
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                      Send Test
                    </button>
                  </div>
                  <div className="mx-4 sm:mx-5 mb-4 sm:mb-5">
                    <div className="rounded-xl overflow-hidden border border-neutral-700/30">
                      <div className="bg-[#2f3136] px-4 py-2 flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-hash w-3.5 h-3.5 text-neutral-400"
                        >
                          <line x1={4} x2={20} y1={9} y2={9} />
                          <line x1={4} x2={20} y1={15} y2={15} />
                          <line x1={10} x2={8} y1={3} y2={21} />
                          <line x1={16} x2={14} y1={3} y2={21} />
                        </svg>
                        <span className="text-xs font-semibold text-white">
                          welcome
                        </span>
                      </div>
                      <div className="bg-[#313338] px-4 pt-3 pb-4 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <svg
                            width={14}
                            height={14}
                            viewBox="0 0 16 16"
                            className="text-green-500 flex-shrink-0"
                          >
                            <path
                              fill="currentColor"
                              d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.5 7.5h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0v3h3a.5.5 0 0 1 0 1z"
                            />
                          </svg>
                          <p className="text-xs text-neutral-500">
                            <span className="font-medium text-white hover:underline cursor-pointer">
                              @user
                            </span>{" "}
                            joined the server.
                          </p>
                        </div>
                        <div className="flex gap-2.5 opacity-40 transition-opacity">
                          <img
                            src="/logo.png"
                            alt="Peak Bot"
                            className="w-8 h-8 rounded-full flex-shrink-0 object-cover mt-0.5"
                          />
                          <div
                            className="w-8 h-8 rounded-full flex-shrink-0 bg-[#5865F2] items-center justify-center text-white text-xs font-bold hidden mt-0.5"
                            aria-hidden="true"
                          >
                            P
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
                              <span className="text-xs font-semibold text-indigo-400 whitespace-nowrap">
                                Peak Bot
                              </span>
                              <span className="inline-flex flex-shrink-0 items-center gap-[0.15em] px-1 py-px text-[10px] font-bold bg-[#5865F2] text-white rounded leading-none">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={4}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-[0.85em] w-[0.85em]"
                                >
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                                APP
                              </span>
                              <span className="text-xs text-neutral-500 truncate">
                                Today at 12:00 PM
                              </span>
                            </div>
                            <div
                              className="border-l-[3px] rounded-r bg-[#2b2d31] max-w-full sm:max-w-[380px]"
                              style={{ borderColor: "rgb(88, 101, 242)" }}
                            >
                              <div className="p-2.5 flex gap-2.5">
                                <div className="flex-1 min-w-0 space-y-1">
                                  <p className="text-xs font-semibold text-white leading-snug">
                                    <span>Welcome to </span>
                                    <span className="bg-green-500/30 text-green-300 rounded-[3px] px-[2px]">
                                      My Server
                                    </span>
                                    <span>!</span>
                                  </p>
                                  <p className="text-xs text-neutral-300 leading-relaxed break-all">
                                    <span>Welcome </span>
                                    <span className="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">
                                      @user
                                    </span>
                                    <span>! We're glad to have you here.</span>
                                  </p>
                                  <p className="text-xs text-neutral-600 italic">
                                    Start typing to customize...
                                  </p>
                                </div>
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-700 grid place-items-center">
                                  <span className="text-[9px] font-semibold text-neutral-400">
                                    USER
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
            </div>
            <div className="lg:order-last flex flex-col">
              <div className="flex flex-col gap-5 flex-1">
                <div
                  className="relative flex flex-col rounded-2xl flex-1"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "default" }}
                >
                  <div className="pointer-events-none select-none flex flex-col flex-1">
                    <div
                      data-tour="welcome-dm"
                      className="rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] p-4 scroll-mt-24 flex-1 flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-mail w-4 h-4 text-neutral-400"
                          >
                            <rect width={20} height={16} x={2} y={4} rx={2} />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                          <span className="text-sm font-medium text-white">
                            DM on Join
                          </span>
                          <span className="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-[0_1px_2px_-0.5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-emerald-400 border-emerald-500/20 bg-gradient-to-b from-emerald-400/25 to-emerald-600/10 h-[19px] pl-[5px] pr-[6.5px] gap-[3px] rounded-[6px] text-[9.5px]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={10}
                              height={10}
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
                            aria-checked="false"
                            className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                          >
                            <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]" />
                          </button>
                        </div>
                      </div>
                      <div className="transition-all duration-200 flex-1 flex flex-col min-h-0">
                        <div className="flex-1 min-h-0 flex flex-col">
                          <div
                            className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors h-full flex flex-col"
                            style={{ minHeight: 104 }}
                          >
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white h-full text-[16px] leading-6 sm:text-[13px] sm:leading-5"
                              style={{
                                fontFamily:
                                  '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
                                padding: "12px 16px",
                                letterSpacing: 0,
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "pre-wrap",
                                boxSizing: "border-box",
                                margin: 0,
                                zIndex: 1,
                              }}
                            >
                              <span
                                style={{ color: "rgba(115, 115, 115, 0.8)" }}
                              >
                                ­ƒæï Welcome to {"{"}server{"}"} (default)
                              </span>
                            </div>
                            <textarea
                              rows={4}
                              className="relative block w-full resize-none focus:outline-none bg-transparent flex-1 overflow-y-auto text-[16px] leading-6 sm:text-[13px] sm:leading-5"
                              style={{
                                fontFamily:
                                  '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
                                padding: "12px 16px",
                                letterSpacing: 0,
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "pre-wrap",
                                boxSizing: "border-box",
                                margin: 0,
                                zIndex: 2,
                                boxShadow: "none",
                                color: "transparent",
                                WebkitTextFillColor: "transparent",
                                caretColor: "white",
                              }}
                              defaultValue={""}
                            />
                          </div>
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            title="Insert {user}"
                            className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                          >
                            @user
                          </button>
                          <button
                            type="button"
                            title="Insert {user.displayName}"
                            className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                          >
                            @display name
                          </button>
                          <button
                            type="button"
                            title="Insert {server}"
                            className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-green-500/20 text-green-300 hover:bg-green-500/25 border border-green-500/20"
                          >
                            @server
                          </button>
                          <button
                            type="button"
                            title="Insert {invite}"
                            className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/20"
                          >
                            @invite
                          </button>
                          <button
                            type="button"
                            title="Insert {memberCount}"
                            className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20"
                          >
                            @members
                          </button>
                        </div>
                        <div className="mt-2.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between gap-3">
                          <span className="text-[10px] text-neutral-600 italic truncate min-w-0">
                            Auto-appended:{" "}
                            <span className="not-italic text-neutral-500">
                              -# Sent from {"{"}server{"}"}
                            </span>
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[11px] tabular-nums text-neutral-600">
                              0/2000
                            </span>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 focus-visible:ring-purple-500/40 "
                              disabled
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-send w-3 h-3"
                              >
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                              </svg>
                              Test DM
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
          <div className="mt-5 pt-5 border-t border-neutral-800">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-5 min-w-0">
              <div className="space-y-5 min-w-0">
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800">
                  <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-user-minus w-4 h-4 flex-shrink-0 text-neutral-500"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx={9} cy={7} r={4} />
                        <line x1={22} x2={16} y1={11} y2={11} />
                      </svg>
                      <span className="text-sm font-medium text-white truncate">
                        Goodbye Messages
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <div className="w-36 sm:w-52 rounded-xl transition-all ">
                        <div className="jsx-556cf662b09b3c73 w-full">
                          <div className="jsx-556cf662b09b3c73 relative">
                            <button
                              type="button"
                              className="jsx-556cf662b09b3c73 w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer "
                            >
                              <span className="jsx-556cf662b09b3c73 min-w-0 truncate text-sm text-neutral-500">
                                # select channel
                              </span>
                              <div className="jsx-556cf662b09b3c73 flex items-center gap-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={24}
                                  height={24}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
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
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked="false"
                          className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                        >
                          <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="space-y-2.5">
                      <div className="flex items-stretch gap-2">
                        <div className="flex-1 min-w-0">
                          <div
                            className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors "
                            style={{ minHeight: 42 }}
                          >
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white h-full text-[16px] leading-6 sm:text-[13px] sm:leading-5"
                              style={{
                                fontFamily:
                                  '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
                                padding: "10px 14px",
                                letterSpacing: 0,
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "nowrap",
                                boxSizing: "border-box",
                                margin: 0,
                                overflow: "hidden",
                                zIndex: 1,
                              }}
                            >
                              {"{"}user.name{"}"} has left
                            </div>
                            <textarea
                              rows={1}
                              className="relative block w-full resize-none focus:outline-none bg-transparent  text-[16px] leading-6 sm:text-[13px] sm:leading-5"
                              style={{
                                fontFamily:
                                  '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
                                padding: "10px 14px",
                                letterSpacing: 0,
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "nowrap",
                                boxSizing: "border-box",
                                margin: 0,
                                overflow: "hidden",
                                zIndex: 2,
                                boxShadow: "none",
                                color: "transparent",
                                WebkitTextFillColor: "transparent",
                                caretColor: "white",
                              }}
                              defaultValue={"{user.name} has left"}
                            />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="relative flex flex-col">
                            <button
                              type="button"
                              className="w-[42px] h-[42px] rounded-xl shadow-sm border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer flex-shrink-0"
                              style={{ backgroundColor: "rgb(237, 66, 69)" }}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors "
                        style={{ minHeight: 84 }}
                      >
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white h-full text-[16px] leading-6 sm:text-[13px] sm:leading-5"
                          style={{
                            fontFamily:
                              '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
                            padding: "12px 16px",
                            letterSpacing: 0,
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            whiteSpace: "pre-wrap",
                            boxSizing: "border-box",
                            margin: 0,
                            zIndex: 1,
                            height: 84,
                          }}
                        >
                          <span style={{ color: "rgba(115, 115, 115, 0.8)" }}>
                            {"{"}user{"}"} has left {"{"}server{"}"}. (empty =
                            no text)
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          className="relative block w-full resize-none focus:outline-none bg-transparent  text-[16px] leading-6 sm:text-[13px] sm:leading-5"
                          style={{
                            fontFamily:
                              '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
                            padding: "12px 16px",
                            letterSpacing: 0,
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            whiteSpace: "pre-wrap",
                            boxSizing: "border-box",
                            margin: 0,
                            zIndex: 2,
                            boxShadow: "none",
                            color: "transparent",
                            WebkitTextFillColor: "transparent",
                            caretColor: "white",
                            height: 84,
                          }}
                          defaultValue={""}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          type="button"
                          title="Insert {user}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                        >
                          @user
                        </button>
                        <button
                          type="button"
                          title="Insert {user.displayName}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                        >
                          @display name
                        </button>
                        <button
                          type="button"
                          title="Insert {server}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-green-500/20 text-green-300 hover:bg-green-500/25 border border-green-500/20"
                        >
                          @server
                        </button>
                        <button
                          type="button"
                          title="Insert {memberCount}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20"
                        >
                          @members
                        </button>
                        <button
                          type="button"
                          title="Insert {inviter}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20"
                        >
                          @inviter
                        </button>
                        <button
                          type="button"
                          title="Insert {inviter.name}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20"
                        >
                          @inviter.name
                        </button>
                        <button
                          type="button"
                          title="Insert {time.in.server}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/25 border border-purple-500/20"
                        >
                          @time.in.server
                        </button>
                      </div>
                      <span className="text-xs tabular-nums flex-shrink-0 ml-2 text-neutral-600">
                        0/2000
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/60">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <span className="text-[12px] text-neutral-300">
                          Embed
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            role="switch"
                            aria-checked="true"
                            className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white "
                          >
                            <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black" />
                          </button>
                        </div>
                      </label>
                    </div>
                    <div
                      className="relative  "
                      role="button"
                      tabIndex={0}
                      style={{ cursor: "default" }}
                    >
                      <div className="pointer-events-none select-none flex flex-col flex-1">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                              Embed Image
                            </label>
                            <span className="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-[0_1px_2px_-0.5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-emerald-400 border-emerald-500/20 bg-gradient-to-b from-emerald-400/25 to-emerald-600/10 h-[19px] pl-[5px] pr-[6.5px] gap-[3px] rounded-[6px] text-[9.5px]">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={10}
                                height={10}
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
                          <div className="space-y-1.5">
                            <div className="relative rounded-xl border border-dashed transition-all overflow-hidden h-24 flex flex-col items-center justify-center border-neutral-700 hover:border-neutral-600 bg-neutral-800/40">
                              <div className="flex flex-col items-center justify-center cursor-pointer">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={24}
                                  height={24}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-upload w-5 h-5 text-neutral-500 mb-1.5"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="17 8 12 3 7 8" />
                                  <line x1={12} x2={12} y1={3} y2={15} />
                                </svg>
                                <span className="text-sm font-medium text-neutral-300">
                                  Click or drop an image
                                </span>
                                <span className="text-[10px] text-neutral-500 mt-0.5">
                                  PNG ┬À JPG ┬À WebP ┬À GIF ┬À up to 4 MB
                                </span>
                              </div>
                              <button
                                type="button"
                                className="absolute bottom-2 right-2.5 inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-md bg-neutral-700/50 hover:bg-neutral-700 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={24}
                                  height={24}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-link w-3 h-3"
                                >
                                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                                Use URL
                              </button>
                              <input
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                className="hidden"
                                type="file"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-neutral-800">
                    <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
                      <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">
                        Preview
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 focus-visible:ring-green-500/40 "
                        disabled
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-send w-3 h-3"
                        >
                          <path d="m22 2-7 20-4-9-9-4Z" />
                          <path d="M22 2 11 13" />
                        </svg>
                        Send Test
                      </button>
                    </div>
                    <div className="mx-4 sm:mx-5 mb-4 sm:mb-5">
                      <div className="rounded-xl overflow-hidden border border-neutral-700/30">
                        <div className="bg-[#2f3136] px-4 py-2 flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-hash w-3.5 h-3.5 text-neutral-400"
                          >
                            <line x1={4} x2={20} y1={9} y2={9} />
                            <line x1={4} x2={20} y1={15} y2={15} />
                            <line x1={10} x2={8} y1={3} y2={21} />
                            <line x1={16} x2={14} y1={3} y2={21} />
                          </svg>
                          <span className="text-xs font-semibold text-white">
                            goodbye
                          </span>
                        </div>
                        <div className="bg-[#313338] px-4 pt-3 pb-4 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <svg
                              width={14}
                              height={14}
                              viewBox="0 0 16 16"
                              className="text-red-500 flex-shrink-0"
                            >
                              <path
                                fill="currentColor"
                                d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.5 8h-7a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1z"
                              />
                            </svg>
                            <p className="text-xs text-neutral-500">
                              <span className="font-medium text-white hover:underline cursor-pointer">
                                SomeUser
                              </span>{" "}
                              left the server.
                            </p>
                          </div>
                          <div className="flex gap-2.5  transition-opacity">
                            <img
                              src="/logo.png"
                              alt="Peak Bot"
                              className="w-8 h-8 rounded-full flex-shrink-0 object-cover mt-0.5"
                            />
                            <div
                              className="w-8 h-8 rounded-full flex-shrink-0 bg-[#5865F2] items-center justify-center text-white text-xs font-bold hidden mt-0.5"
                              aria-hidden="true"
                            >
                              P
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
                                <span className="text-xs font-semibold text-indigo-400 whitespace-nowrap">
                                  Peak Bot
                                </span>
                                <span className="inline-flex flex-shrink-0 items-center gap-[0.15em] px-1 py-px text-[10px] font-bold bg-[#5865F2] text-white rounded leading-none">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={4}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-[0.85em] w-[0.85em]"
                                  >
                                    <path d="M20 6 9 17l-5-5" />
                                  </svg>
                                  APP
                                </span>
                                <span className="text-xs text-neutral-500 truncate">
                                  Today at 12:00 PM
                                </span>
                              </div>
                              <div
                                className="border-l-[3px] rounded-r bg-[#2b2d31] max-w-full sm:max-w-[380px]"
                                style={{ borderColor: "rgb(237, 66, 69)" }}
                              >
                                <div className="p-2.5 space-y-1">
                                  <p className="text-xs font-semibold text-white leading-snug">
                                    <span />
                                    <span className="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">
                                      user
                                    </span>
                                    <span> has left</span>
                                  </p>
                                  <div className="flex items-center gap-1 pt-1 mt-1 border-t border-neutral-700/30">
                                    <img
                                      src="/logo.png"
                                      alt
                                      className="w-3 h-3 rounded-full"
                                    />
                                    <span className="text-[10px] text-neutral-500">
                                      Peak Bot
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
              </div>
              <div className="order-first lg:order-last flex flex-col">
                <div className="flex flex-col gap-4 flex-1">
                  <div
                    className="relative flex flex-col rounded-2xl flex-1"
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "default" }}
                  >
                    <div className="pointer-events-none select-none flex flex-col flex-1">
                      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-mail w-4 h-4 text-neutral-400"
                            >
                              <rect width={20} height={16} x={2} y={4} rx={2} />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            <span className="text-sm font-medium text-white">
                              DM on Leave
                            </span>
                            <span className="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-[0_1px_2px_-0.5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-emerald-400 border-emerald-500/20 bg-gradient-to-b from-emerald-400/25 to-emerald-600/10 h-[19px] pl-[5px] pr-[6.5px] gap-[3px] rounded-[6px] text-[9.5px]">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={10}
                                height={10}
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
                              aria-checked="false"
                              className="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 "
                            >
                              <span className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]" />
                            </button>
                          </div>
                        </div>
                        <div className="transition-all duration-200 flex-1 flex flex-col min-h-0">
                          <div className="flex-1 min-h-0 flex flex-col">
                            <div
                              className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors h-full flex flex-col"
                              style={{ minHeight: 84 }}
                            >
                              <div
                                aria-hidden="true"
                                className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white h-full text-[16px] leading-6 sm:text-[13px] sm:leading-5"
                                style={{
                                  fontFamily:
                                    '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
                                  padding: "12px 16px",
                                  letterSpacing: 0,
                                  wordBreak: "break-word",
                                  overflowWrap: "break-word",
                                  whiteSpace: "pre-wrap",
                                  boxSizing: "border-box",
                                  margin: 0,
                                  zIndex: 1,
                                }}
                              >
                                <span
                                  style={{ color: "rgba(115, 115, 115, 0.8)" }}
                                >
                                  ­ƒæï You left {"{"}server{"}"} (default)
                                </span>
                              </div>
                              <textarea
                                rows={3}
                                className="relative block w-full resize-none focus:outline-none bg-transparent flex-1 overflow-y-auto text-[16px] leading-6 sm:text-[13px] sm:leading-5"
                                style={{
                                  fontFamily:
                                    '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
                                  padding: "12px 16px",
                                  letterSpacing: 0,
                                  wordBreak: "break-word",
                                  overflowWrap: "break-word",
                                  whiteSpace: "pre-wrap",
                                  boxSizing: "border-box",
                                  margin: 0,
                                  zIndex: 2,
                                  boxShadow: "none",
                                  color: "transparent",
                                  WebkitTextFillColor: "transparent",
                                  caretColor: "white",
                                }}
                                defaultValue={""}
                              />
                            </div>
                          </div>
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              title="Insert {user}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                            >
                              @user
                            </button>
                            <button
                              type="button"
                              title="Insert {user.displayName}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                            >
                              @display name
                            </button>
                            <button
                              type="button"
                              title="Insert {server}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-green-500/20 text-green-300 hover:bg-green-500/25 border border-green-500/20"
                            >
                              @server
                            </button>
                            <button
                              type="button"
                              title="Insert {memberCount}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20"
                            >
                              @members
                            </button>
                            <button
                              type="button"
                              title="Insert {inviter}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20"
                            >
                              @inviter
                            </button>
                            <button
                              type="button"
                              title="Insert {inviter.name}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20"
                            >
                              @inviter.name
                            </button>
                            <button
                              type="button"
                              title="Insert {time.in.server}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/25 border border-purple-500/20"
                            >
                              @time.in.server
                            </button>
                          </div>
                          <div className="mt-2.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between gap-3">
                            <span className="text-[10px] text-neutral-600 italic truncate min-w-0">
                              Auto-appended:{" "}
                              <span className="not-italic text-neutral-500">
                                -# Sent from {"{"}server{"}"}
                              </span>
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[11px] tabular-nums text-neutral-600">
                                0/2000
                              </span>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 focus-visible:ring-purple-500/40 "
                                disabled
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={24}
                                  height={24}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-send w-3 h-3"
                                >
                                  <path d="m22 2-7 20-4-9-9-4Z" />
                                  <path d="M22 2 11 13" />
                                </svg>
                                Test DM
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
      </div>
    </main>
  );
}
