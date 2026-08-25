import React, { useState, useEffect, useRef } from "react";
import DiscordPreview, { parseDiscordMarkdown } from "../../ui/DiscordPreview";
import Toggle from "../../ui/Toggle";
import CustomSelect from "../../ui/CustomSelect";
import { SketchPicker } from "react-color";
import { useToast } from '../../ui/Toast';
import ImageURLPopup from "../../ui/ImageURLPopup";

export default function WelcomeSettings({
  guildId,
  config,
  channels,
  onSave,
  saving,
  onReset,
}) {
  const { addToast } = useToast();
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

  
  const [welcomeMsgMode, setWelcomeMsgMode] = useState(wCfg.msg_mode || "image");
  const [welcomeEmbedTitle, setWelcomeEmbedTitle] = useState(wCfg.embed_title || "");
  const [welcomeEmbedDesc, setWelcomeEmbedDesc] = useState(wCfg.embed_description || "");
  const [welcomeEmbedThumbnail, setWelcomeEmbedThumbnail] = useState(wCfg.embed_thumbnail || "");
  const [welcomeEmbedColor, setWelcomeEmbedColor] = useState(wCfg.embed_color || "#5865F2");
  const [welcomeEmbedFooter, setWelcomeEmbedFooter] = useState(wCfg.embed_footer || "");
  const [welcomeImageUrl, setWelcomeImageUrl] = useState(wCfg.image_url || "");
  const [showUrlPopup, setShowUrlPopup] = useState(false);
  const [urlPopupTarget, setUrlPopupTarget] = useState("");

  const [showWelcomeColor, setShowWelcomeColor] = useState(false);
  const [showGoodbyeColor, setShowGoodbyeColor] = useState(false);


  const [welcomeEmbedFields, setWelcomeEmbedFields] = useState(wCfg.embed_fields || []);
  const [goodbyeEmbedFields, setGoodbyeEmbedFields] = useState(gCfg.embed_fields || []);


  const [goodbyeMsgMode, setGoodbyeMsgMode] = useState(gCfg.msg_mode || "image");
  const [goodbyeEmbedTitle, setGoodbyeEmbedTitle] = useState(gCfg.embed_title || "");
  const [goodbyeEmbedDesc, setGoodbyeEmbedDesc] = useState(gCfg.embed_description || "");
  const [goodbyeEmbedThumbnail, setGoodbyeEmbedThumbnail] = useState(gCfg.embed_thumbnail || "");
  const [goodbyeEmbedColor, setGoodbyeEmbedColor] = useState(gCfg.embed_color || "#ED4245");
  const [goodbyeEmbedFooter, setGoodbyeEmbedFooter] = useState(gCfg.embed_footer || "");
  const [goodbyeImageUrl, setGoodbyeImageUrl] = useState(gCfg.image_url || "");

  const handleUpload = async (file, type) => {
    // We will just use the toast logic passed down or handled here
    const formData = new FormData();
    formData.append("file", file);
      try {
        const res = await fetch("/api/upload/image", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData
        });
        const data = await res.json();
        if (!data.error) {
          if (type === "welcome") setWelcomeImageUrl(data.url);
          if (type === "goodbye") setGoodbyeImageUrl(data.url);
          addToast("Image uploaded successfully!", "success");
        } else {
          addToast("Error: " + data.error, "error");
        }
      } catch (e) {
        console.error(e);
        addToast("Failed to upload image", "error");
      }
  };
    
  const isFirstRender = useRef(true);

  const [activeRef, setActiveRef] = useState(null);
  const welcomeTextRef = useRef(null);
  const welcomeDescRef = useRef(null);
  const dmJoinRef = useRef(null);
  const goodbyeTextRef = useRef(null);
  const goodbyeDescRef = useRef(null);
  const dmLeaveRef = useRef(null);

  
  const handleTestDm = async (type) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/server/${guildId}/test-dm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ type }),
        });
        const data = await res.json();
        if (data.error) addToast('Error: ' + data.error, 'error');
        else addToast('Test DM sent!', 'success');
      } catch (e) {
        addToast('Failed to send test DM', 'error');
      }
  };

  const handleTestWelcome = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/server/${guildId}/test-welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.error) addToast('Error: ' + data.error, 'error');
      else addToast('Test message sent!', 'success');
    } catch (e) {
      addToast('Failed to send test message', 'error');
    }
  };

  const insertVar = (variable) => {
    if (!activeRef || !activeRef.current) return;
    const el = activeRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const newVal = val.substring(0, start) + variable + val.substring(end);
    
    const setterName = el.getAttribute("data-setter");
    if (setterName === "welcomeText") setWelcomeText(newVal);
    if (setterName === "welcomeEmbedDesc") setWelcomeEmbedDesc(newVal);
    if (setterName === "dmJoinText") setDmJoinText(newVal);
    if (setterName === "goodbyeText") setGoodbyeText(newVal);
    if (setterName === "goodbyeEmbedDesc") setGoodbyeEmbedDesc(newVal);
    if (setterName === "dmLeaveText") setDmLeaveText(newVal);

    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + variable.length;
    }, 0);
  };


  const getPayload = () => ({
    welcome: {
      ...wCfg,
      enabled: welcomeEnabled,
      channel_id: welcomeChannel,
      message: welcomeText,
      dm_enabled: dmJoinEnabled,
      dm_message: dmJoinText,
      msg_mode: welcomeMsgMode,
      embed_color: welcomeEmbedColor,
      embed_title: welcomeEmbedTitle,
      embed_description: welcomeEmbedDesc,
      embed_thumbnail: welcomeEmbedThumbnail,
      embed_footer: welcomeEmbedFooter,
      embed_fields: welcomeEmbedFields,
      image_url: welcomeImageUrl
    },
    goodbye: {
      ...gCfg,
      enabled: goodbyeEnabled,
      channel_id: goodbyeChannel,
      message: goodbyeText,
      dm_enabled: dmLeaveEnabled,
      dm_message: dmLeaveText,
      msg_mode: goodbyeMsgMode,
      embed_color: goodbyeEmbedColor,
      embed_title: goodbyeEmbedTitle,
      embed_description: goodbyeEmbedDesc,
      embed_thumbnail: goodbyeEmbedThumbnail,
      embed_footer: goodbyeEmbedFooter,
      embed_fields: goodbyeEmbedFields,
      image_url: goodbyeImageUrl
    },
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handler = setTimeout(() => {
      onSave(getPayload());
    }, 1500); 
    return () => clearTimeout(handler);
  }, [
    welcomeEnabled,
    welcomeChannel,
    welcomeMsgMode,
    dmJoinEnabled,
    goodbyeEnabled,
    goodbyeChannel,
    goodbyeMsgMode,
    dmLeaveEnabled,
  ]);

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5">
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 min-w-0">
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
                        <CustomSelect options={(channels || []).map(ch => ({ label: "# " + ch.name, value: ch.id }))} value={welcomeChannel} onChange={(val) => setWelcomeChannel(val)} placeholder="# select channel" />
                      </div>
                    </div>
                    <span
                      data-tour="feature-toggle"
                      className="inline-flex scroll-mt-24"
                    >
                      <div className="flex items-center gap-3">
                        <Toggle checked={welcomeEnabled} onChange={() => setWelcomeEnabled(!welcomeEnabled)} />
                      </div>
                    </span>
                  </div>
                </div>
                <div
                  data-tour="welcome-message"
                  className="scroll-mt-24 p-4 sm:p-5 space-y-3"
                >
                  <div className="space-y-2.5">
<div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-4 mb-2 border-b border-neutral-800/60">
                    <div className="inline-flex items-center gap-2 w-48">
                      <CustomSelect
                        options={[
                          { label: "Welcome Card", value: "image" },
                          { label: "Embed", value: "embed" },
                          { label: "Text Message", value: "text" },
                        ]}
                        value={welcomeMsgMode}
                        onChange={(val) => setWelcomeMsgMode(val)}
                      />
                    </div>
                    {welcomeMsgMode === "embed" && (
                      <div className="inline-flex items-center gap-2">
                        <span className="text-[12px] text-neutral-300">
                          User avatar
                        </span>
                        <div className="flex items-center gap-3">
                          <Toggle checked={welcomeEmbedThumbnail === "{user.avatar}"} onChange={() => setWelcomeEmbedThumbnail(welcomeEmbedThumbnail === "{user.avatar}" ? "" : "{user.avatar}")} />
                        </div>
                      </div>
                    )}


                  

                  </div>

                    <div className="flex items-stretch gap-2">
                      <div className="flex-1 min-w-0">
                        <div
                          className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors "
                          style={{ minHeight: 42 }}
                        >
                          <textarea
                            rows={1}
                            ref={welcomeTextRef} data-setter="welcomeText" onFocus={() => setActiveRef(welcomeTextRef)} value={welcomeText} onChange={e => setWelcomeText(e.target.value)} className="relative block w-full resize-none focus:outline-none bg-transparent  text-[16px] leading-6 sm:text-[13px] sm:leading-5"
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
                              color: "white",
                              WebkitTextFillColor: "white",
                              caretColor: "white",
                            }}
                            defaultValue={""}
                          ></textarea>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="relative flex flex-col group">
                          <button
                            type="button"
                            onClick={() => setShowWelcomeColor(!showWelcomeColor)}
                            className="w-[42px] h-[42px] rounded-xl shadow-sm border border-neutral-700 hover:border-neutral-500 transition-colors flex-shrink-0"
                            style={{ backgroundColor: welcomeEmbedColor }}
                          />
                          {showWelcomeColor && (
                            <div className="absolute top-[48px] right-0 z-50">
                              <div className="fixed inset-0" onClick={() => setShowWelcomeColor(false)} />
                              <div className="relative z-50">
                                <SketchPicker color={welcomeEmbedColor} onChange={(c) => setWelcomeEmbedColor(c.hex)} disableAlpha />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors">
                      <textarea rows="1"
                        
                        value={welcomeEmbedTitle}
                        onChange={e => setWelcomeEmbedTitle(e.target.value)}
                        placeholder="Embed Title"
                        className="relative block w-full focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 text-white placeholder-neutral-500 px-4 py-2"
                        style={{ fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace' }}
                      ></textarea>
                    </div>
                    <div
                      className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors "
                      style={{ minHeight: 84 }}
                    >
                      <textarea
                        rows={3}
                        ref={welcomeDescRef} data-setter="welcomeEmbedDesc" onFocus={() => setActiveRef(welcomeDescRef)} value={welcomeEmbedDesc} onChange={e => setWelcomeEmbedDesc(e.target.value)} className="relative block w-full resize-none focus:outline-none bg-transparent  text-[16px] leading-6 sm:text-[13px] sm:leading-5"
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
                          color: "white",
                          WebkitTextFillColor: "white",
                          caretColor: "white",
                          height: 84,
                        }}
                        defaultValue={""}
                      ></textarea>
                    </div>
                  </div>
                  
                  
                  {welcomeMsgMode === "embed" && (
                    <div className="pt-4 border-t border-neutral-800/60  space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Embed Fields</span>
                        <button
                          type="button"
                          onClick={() => setWelcomeEmbedFields([...welcomeEmbedFields, { name: "New Field", value: "Value", inline: false }])}
                          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                          Add Field
                        </button>
                      </div>
                      <div className="space-y-3">
                        {welcomeEmbedFields.map((field, idx) => (
                          <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg border border-neutral-700/50 bg-neutral-800/30">
                            <div className="flex items-center gap-2">
                              <textarea rows="1" 
                                
                                value={field.name}
                                onChange={(e) => {
                                  const nf = [...welcomeEmbedFields];
                                  nf[idx].name = e.target.value;
                                  setWelcomeEmbedFields(nf);
                                }}
                                className="flex-1 bg-neutral-800/50 border border-neutral-700/50 rounded-md px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-neutral-500"
                                placeholder="Field Name"
                              ></textarea>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <span className="text-xs text-neutral-400">Inline</span>
                                <input type="checkbox" checked={field.inline} onChange={(e) => {
                                  const nf = [...welcomeEmbedFields];
                                  nf[idx].inline = e.target.checked;
                                  setWelcomeEmbedFields(nf);
                                }} className="rounded border-neutral-700 bg-neutral-900 text-indigo-500 focus:ring-indigo-500/30 focus:ring-offset-0" />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const nf = [...welcomeEmbedFields];
                                  nf.splice(idx, 1);
                                  setWelcomeEmbedFields(nf);
                                }}
                                className="bg-red-500 text-white hover:bg-red-600 transition-colors p-1.5 rounded-md"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              </button>
                            </div>
                            <textarea
                              value={field.value}
                              onChange={(e) => {
                                const nf = [...welcomeEmbedFields];
                                nf[idx].value = e.target.value;
                                setWelcomeEmbedFields(nf);
                              }}
                              rows={2}
                              className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-md px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-neutral-500 resize-none"
                              placeholder="Field Value"
                            ></textarea>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {welcomeMsgMode === "embed" && (
                    <div className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors mt-3 mb-4">
                      <textarea rows="1"
                        
                        value={welcomeEmbedFooter}
                        onChange={e => setWelcomeEmbedFooter(e.target.value)}
                        placeholder="Embed Footer"
                        className="relative block w-full focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 text-white placeholder-neutral-500 px-4 py-2"
                        style={{ fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace' }}
                      ></textarea>
                    </div>
                  )}
<div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{user}")}
                        title="Insert {user}"
                        className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                      >
                        @user
                      </button>
                      <button
                        type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{user.displayName}")}
                        title="Insert {user.displayName}"
                        className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                      >
                        @display name
                      </button>
                      <button
                        type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{server}")}
                        title="Insert {server}"
                        className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-green-500/20 text-green-300 hover:bg-green-500/25 border border-green-500/20"
                      >
                        @server
                      </button>
                      <button
                        type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{invite}")}
                        title="Insert {invite}"
                        className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/20"
                      >
                        @invite
                      </button>
                      <button
                        type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{memberCount}")}
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

<div
                    className="relative  "
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "default" }}
                  >
                    <div className="flex flex-col flex-1">
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
                            <label htmlFor="welcome-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
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
                                PNG • JPG • WebP • GIF • up to 4 MB
                              </span>
                              <input
                                id="welcome-upload"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                className="hidden"
                                type="file"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleUpload(e.target.files[0], "welcome");
                                  }
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setUrlPopupTarget("welcome");
                                setShowUrlPopup(true);
                              }}
                              className="absolute bottom-2 right-2.5 inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-md bg-neutral-700/50 hover:bg-neutral-700 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors z-10"
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
                    <button onClick={() => handleTestWelcome("welcome")}
                      type="button"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 focus-visible:ring-green-500/40 "
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
                    
<DiscordPreview
  content={welcomeText}
  embedColor={welcomeEmbedColor}
  embedTitle={welcomeEmbedTitle}
  embedDesc={welcomeEmbedDesc}
  embedFooter={welcomeEmbedFooter}
  embedThumbnail={welcomeEmbedThumbnail === "{user.avatar}" ? "https://cdn.discordapp.com/embed/avatars/0.png" : welcomeEmbedThumbnail}
  embedImage={welcomeImageUrl}
  embedFields={welcomeEmbedFields}
  imageUrl={welcomeImageUrl}
  mode={welcomeMsgMode}
  accentColor="#5865F2"
  cardTitle="WELCOME"
  channels={channels}
/>
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
                  <div className="flex flex-col flex-1">
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
                              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1 1.275-1.275L12 3Z" />
                              <path d="M5 3v4" />
                              <path d="M19 17v4" />
                            </svg>
                            Starter
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Toggle checked={dmJoinEnabled} onChange={() => setDmJoinEnabled(!dmJoinEnabled)} />
                        </div>
                      </div>
                      <div className="transition-all duration-200 flex-1 flex flex-col min-h-0">
                        <div className="flex-1 min-h-0 flex flex-col">
                          <div
                            className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors h-full flex flex-col"
                            style={{ minHeight: 104 }}
                          >
                            <textarea
                              rows={4}
                              ref={dmJoinRef} data-setter="dmJoinText" onFocus={() => setActiveRef(dmJoinRef)} value={dmJoinText} onChange={e => setDmJoinText(e.target.value)} onBlur={() => onSave(getPayload())} className="relative block w-full resize-none focus:outline-none bg-transparent flex-1 overflow-y-auto text-[16px] leading-6 sm:text-[13px] sm:leading-5"
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
                                color: "white",
                                WebkitTextFillColor: "white",
                                caretColor: "white",
                              }}
                              defaultValue={""}
                            ></textarea>
                          </div>
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <button
                            type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{user}")}
                            title="Insert {user}"
                            className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                          >
                            @user
                          </button>
                          <button
                            type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{user.displayName}")}
                            title="Insert {user.displayName}"
                            className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                          >
                            @display name
                          </button>
                          <button
                            type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{server}")}
                            title="Insert {server}"
                            className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-green-500/20 text-green-300 hover:bg-green-500/25 border border-green-500/20"
                          >
                            @server
                          </button>
                          <button
                            type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{invite}")}
                            title="Insert {invite}"
                            className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/20"
                          >
                            @invite
                          </button>
                          <button
                            type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{memberCount}")}
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
                            <button onClick={() => handleTestDm("welcome")}
                              type="button"
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 focus-visible:ring-purple-500/40 "
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
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 min-w-0">
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
                            <CustomSelect options={(channels || []).map(ch => ({ label: "# " + ch.name, value: ch.id }))} value={goodbyeChannel} onChange={(val) => setGoodbyeChannel(val)} placeholder="# select channel" />
                          </div>
                        </div>
                        <span
                          className="inline-flex scroll-mt-24"
                        >
                          <div className="flex items-center gap-3">
                            <Toggle checked={goodbyeEnabled} onChange={() => setGoodbyeEnabled(!goodbyeEnabled)} />
                          </div>
                        </span>
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
                            <textarea
                              rows={1}
                              ref={goodbyeTextRef} data-setter="goodbyeText" onFocus={() => setActiveRef(goodbyeTextRef)} value={goodbyeText} onChange={e => setGoodbyeText(e.target.value)} className="relative block w-full resize-none focus:outline-none bg-transparent  text-[16px] leading-6 sm:text-[13px] sm:leading-5"
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
                                color: "white",
                                WebkitTextFillColor: "white",
                                caretColor: "white",
                              }}
                              defaultValue={"{user.name} has left"}
                            ></textarea>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="relative flex flex-col group">
                            <button
                              type="button"
                              onClick={() => setShowGoodbyeColor(!showGoodbyeColor)}
                              className="w-[42px] h-[42px] rounded-xl shadow-sm border border-neutral-700 hover:border-neutral-500 transition-colors flex-shrink-0"
                              style={{ backgroundColor: goodbyeEmbedColor }}
                            />
                            {showGoodbyeColor && (
                              <div className="absolute top-[48px] right-0 z-50">
                                <div className="fixed inset-0" onClick={() => setShowGoodbyeColor(false)} />
                                <div className="relative z-50">
                                  <SketchPicker color={goodbyeEmbedColor} onChange={(c) => setGoodbyeEmbedColor(c.hex)} disableAlpha />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                          <div className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors">
                            <textarea rows="1"
                              
                              value={goodbyeEmbedTitle}
                              onChange={e => setGoodbyeEmbedTitle(e.target.value)}
                              placeholder="Embed Title"
                              className="relative block w-full focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 text-white placeholder-neutral-500 px-4 py-2"
                              style={{ fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace' }}
                            ></textarea>
                          </div>
<div
                        className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors "
                        style={{ minHeight: 84 }}
                      >
                        <textarea
                          rows={3}
                          ref={goodbyeDescRef} data-setter="goodbyeEmbedDesc" onFocus={() => setActiveRef(goodbyeDescRef)} value={goodbyeEmbedDesc} onChange={e => setGoodbyeEmbedDesc(e.target.value)} className="relative block w-full resize-none focus:outline-none bg-transparent  text-[16px] leading-6 sm:text-[13px] sm:leading-5"
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
                            color: "white",
                            WebkitTextFillColor: "white",
                            caretColor: "white",
                            height: 84,
                          }}
                          defaultValue={""}
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/60">
                      <div className="inline-flex items-center gap-2 w-48">
                        <CustomSelect
                          options={[
                            { label: "Goodbye Card", value: "image" },
                            { label: "Embed", value: "embed" },
                            { label: "Text Message", value: "text" },
                          ]}
                          value={goodbyeMsgMode}
                          onChange={(val) => setGoodbyeMsgMode(val)}
                        />
                      </div>
                      {goodbyeMsgMode === "embed" && (
                        <div className="inline-flex items-center gap-2">
                          <span className="text-[12px] text-neutral-300">
                            User avatar
                          </span>
                          <div className="flex items-center gap-3">
                            <Toggle checked={goodbyeEmbedThumbnail === "{user.avatar}"} onChange={() => setGoodbyeEmbedThumbnail(goodbyeEmbedThumbnail === "{user.avatar}" ? "" : "{user.avatar}")} />
                          </div>
                        </div>
                      )}

                  

                    </div>
                    {goodbyeMsgMode === "embed" && (
                    <div className="pt-4 border-t border-neutral-800/60  space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Embed Fields</span>
                        <button
                          type="button"
                          onClick={() => setGoodbyeEmbedFields([...goodbyeEmbedFields, { name: "New Field", value: "Value", inline: false }])}
                          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                          Add Field
                        </button>
                      </div>
                      <div className="space-y-3">
                        {goodbyeEmbedFields.map((field, idx) => (
                          <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg border border-neutral-700/50 bg-neutral-800/30">
                            <div className="flex items-center gap-2">
                              <textarea rows="1" 
                                
                                value={field.name}
                                onChange={(e) => {
                                  const nf = [...goodbyeEmbedFields];
                                  nf[idx].name = e.target.value;
                                  setGoodbyeEmbedFields(nf);
                                }}
                                className="flex-1 bg-neutral-800/50 border border-neutral-700/50 rounded-md px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-neutral-500"
                                placeholder="Field Name"
                              ></textarea>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <span className="text-xs text-neutral-400">Inline</span>
                                <input type="checkbox" checked={field.inline} onChange={(e) => {
                                  const nf = [...goodbyeEmbedFields];
                                  nf[idx].inline = e.target.checked;
                                  setGoodbyeEmbedFields(nf);
                                }} className="rounded border-neutral-700 bg-neutral-900 text-indigo-500 focus:ring-indigo-500/30 focus:ring-offset-0" />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const nf = [...goodbyeEmbedFields];
                                  nf.splice(idx, 1);
                                  setGoodbyeEmbedFields(nf);
                                }}
                                className="bg-red-500 text-white hover:bg-red-600 transition-colors p-1.5 rounded-md"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              </button>
                            </div>
                            <textarea
                              value={field.value}
                              onChange={(e) => {
                                const nf = [...goodbyeEmbedFields];
                                nf[idx].value = e.target.value;
                                setGoodbyeEmbedFields(nf);
                              }}
                              rows={2}
                              className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-md px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-neutral-500 resize-none"
                              placeholder="Field Value"
                            ></textarea>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {goodbyeMsgMode === "embed" && (
                    <div className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors mt-3 mb-4">
                      <textarea rows="1"
                        
                        value={goodbyeEmbedFooter}
                        onChange={e => setGoodbyeEmbedFooter(e.target.value)}
                        placeholder="Embed Footer"
                        className="relative block w-full focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 text-white placeholder-neutral-500 px-4 py-2"
                        style={{ fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, Monaco, monospace' }}
                      ></textarea>
                    </div>
                  )}
<div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{user}")}
                          title="Insert {user}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                        >
                          @user
                        </button>
                        <button
                          type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{user.displayName}")}
                          title="Insert {user.displayName}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                        >
                          @display name
                        </button>
                        <button
                          type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{server}")}
                          title="Insert {server}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-green-500/20 text-green-300 hover:bg-green-500/25 border border-green-500/20"
                        >
                          @server
                        </button>
                        <button
                          type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{memberCount}")}
                          title="Insert {memberCount}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20"
                        >
                          @members
                        </button>
                        <button
                          type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{inviter}")}
                          title="Insert {inviter}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20"
                        >
                          @inviter
                        </button>
                        <button
                          type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{inviter.name}")}
                          title="Insert {inviter.name}"
                          className="px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20"
                        >
                          @inviter.name
                        </button>
                        <button
                          type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{time.in.server}")}
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

<div
                      className="relative  "
                      role="button"
                      tabIndex={0}
                      style={{ cursor: "default" }}
                    >
                      <div className="flex flex-col flex-1">
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
                                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1 1.275-1.275L12 3Z" />
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
                              <label htmlFor="goodbye-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
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
                                  PNG &bull; JPG &bull; WebP &bull; GIF &bull; up to 4 MB
                                </span>
                                <input
                                  id="goodbye-upload"
                                  accept="image/png,image/jpeg,image/webp,image/gif"
                                  className="hidden"
                                  type="file"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleUpload(e.target.files[0], "goodbye");
                                    }
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setUrlPopupTarget("goodbye");
                                  setShowUrlPopup(true);
                                }}
                                className="absolute bottom-2 right-2.5 inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-md bg-neutral-700/50 hover:bg-neutral-700 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors z-10"
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
                      <button onClick={() => handleTestWelcome("goodbye")}
                        type="button"
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 focus-visible:ring-green-500/40 "
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
                      
<DiscordPreview
  content={goodbyeText}
  embedColor={goodbyeEmbedColor}
  embedTitle={goodbyeEmbedTitle}
  embedDesc={goodbyeEmbedDesc}
  embedFooter={goodbyeEmbedFooter}
  embedThumbnail={goodbyeEmbedThumbnail === "{user.avatar}" ? "https://cdn.discordapp.com/embed/avatars/0.png" : goodbyeEmbedThumbnail}
  embedImage={goodbyeImageUrl}
  embedFields={goodbyeEmbedFields}
  imageUrl={goodbyeImageUrl}
  mode={goodbyeMsgMode}
  accentColor="#ED4245"
  cardTitle="GOODBYE"
  channels={channels}
/>
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
                            <Toggle checked={dmLeaveEnabled} onChange={() => setDmLeaveEnabled(!dmLeaveEnabled)} />
                          </div>
                        </div>
                        <div className="transition-all duration-200 flex-1 flex flex-col min-h-0">
                          <div className="flex-1 min-h-0 flex flex-col">
                            <div
                              className="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors h-full flex flex-col"
                              style={{ minHeight: 84 }}
                            >
                              <textarea
                                rows={3}
                                ref={dmLeaveRef} data-setter="dmLeaveText" onFocus={() => setActiveRef(dmLeaveRef)} value={dmLeaveText} onChange={e => setDmLeaveText(e.target.value)} onBlur={() => onSave(getPayload())} className="relative block w-full resize-none focus:outline-none bg-transparent flex-1 overflow-y-auto text-[16px] leading-6 sm:text-[13px] sm:leading-5"
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
                                  color: "white",
                                  WebkitTextFillColor: "white",
                                  caretColor: "white",
                                }}
                                defaultValue={""}
                              ></textarea>
                            </div>
                          </div>
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <button
                              type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{user}")}
                              title="Insert {user}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                            >
                              @user
                            </button>
                            <button
                              type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{user.displayName}")}
                              title="Insert {user.displayName}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
                            >
                              @display name
                            </button>
                            <button
                              type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{server}")}
                              title="Insert {server}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-green-500/20 text-green-300 hover:bg-green-500/25 border border-green-500/20"
                            >
                              @server
                            </button>
                            <button
                              type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{memberCount}")}
                              title="Insert {memberCount}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20"
                            >
                              @members
                            </button>
                            <button
                              type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{inviter}")}
                              title="Insert {inviter}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20"
                            >
                              @inviter
                            </button>
                            <button
                              type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{inviter.name}")}
                              title="Insert {inviter.name}"
                              className="px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20"
                            >
                              @inviter.name
                            </button>
                            <button
                              type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertVar("{time.in.server}")}
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
                              <button onClick={() => handleTestDm("goodbye")}
                                type="button"
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 focus-visible:ring-purple-500/40 "
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
      <ImageURLPopup
        isOpen={showUrlPopup}
        onClose={() => {
          setShowUrlPopup(false);
          setUrlPopupTarget("");
        }}
        onConfirm={(url) => {
          if (urlPopupTarget === "welcome") setWelcomeImageUrl(url);
          if (urlPopupTarget === "goodbye") setGoodbyeImageUrl(url);
        }}
      />
    </main>
  );
}
