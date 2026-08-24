import React, { useState, useEffect } from "react";
import { useToast } from "../../ui/Toast";

export default function ReactionRoleBuilder({
  isOpen,
  onClose,
  initialData,
  guildId,
  serverData,
  onSaveSuccess,
  onDeleteSuccess,
}) {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Core State
  const [embedTitle, setEmbedTitle] = useState("");
  const [embedDesc, setEmbedDesc] = useState("");
  const [channelId, setChannelId] = useState("");
  const [components, setComponents] = useState([]);

  // Behavior & Settings (Mock state for UI)
  const [behavior, setBehavior] = useState("pick_one");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setChannelId(initialData.channel_id || "");
        const e = initialData.embed || {};
        setEmbedTitle(e.title || "🎨 Pick your color");
        setEmbedDesc(e.description || "Tap a button to recolor your name.");
        
        setComponents((initialData.components || []).map(c => ({
          ...c,
          _id: Math.random().toString(36).substr(2, 9)
        })));
      } else {
        setChannelId("");
        setEmbedTitle("🎨 Pick your color");
        setEmbedDesc("Tap a button to recolor your name.");
        setComponents([]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const channels = serverData?.channels || [];
  const roles = serverData?.roles || [];

  const handleSave = async () => {
    if (!channelId) return toast.error("Channel is required");
    if (components.length === 0) return toast.error("At least one role is required");

    setIsSaving(true);
    try {
      const payload = {
        name: embedTitle || "Reaction Role",
        channel_id: channelId,
        button_type: "toggle", // static for now
        embed: {
          title: embedTitle,
          description: embedDesc,
          color: "#5865F2", // Default discord color
        },
        components: components.map(c => ({
          label: c.label,
          emoji: c.emoji,
          role_id: c.role_id,
          style: 2, // Secondary
        }))
      };

      const url = initialData 
        ? `/api/dashboard/${guildId}/reactionroles/${initialData.id}`
        : `/api/dashboard/${guildId}/reactionroles`;

      const res = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save");
      
      const data = await res.json();
      toast.success("Reaction role saved successfully!");
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error saving reaction role");
    } finally {
      setIsSaving(false);
    }
  };

  const addComponent = () => {
    if (components.length >= 25) return toast.error("Max 25 buttons allowed.");
    setComponents([
      ...components,
      { _id: Math.random().toString(36).substr(2, 9), label: "New Role", emoji: "⚪", role_id: "" }
    ]);
  };

  const updateComponent = (index, field, value) => {
    const newComps = [...components];
    newComps[index][field] = value;
    setComponents(newComps);
  };

  const removeComponent = (index) => {
    const newComps = [...components];
    newComps.splice(index, 1);
    setComponents(newComps);
  };

  const moveComponent = (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === components.length - 1) return;
    const newComps = [...components];
    const temp = newComps[index];
    newComps[index] = newComps[index + direction];
    newComps[index + direction] = temp;
    setComponents(newComps);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col" style={{ opacity: 1, transform: 'none' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 ring-1 ring-rose-500/15 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smile-plus w-4 h-4 text-rose-400">
                <path d="M22 11v1a10 10 0 1 1-9-10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" x2="9.01" y1="9" y2="9" />
                <line x1="15" x2="15.01" y1="9" y2="9" />
                <path d="M16 5h6" />
                <path d="M19 2v6" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{initialData ? "Edit reaction panel" : "New reaction panel"}</p>
              <p className="text-[11px] text-neutral-500">Members tap an emoji to grab a role</p>
            </div>
          </div>
          <button onClick={onClose} type="button" className="p-1 text-neutral-500 hover:text-white transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-4 h-4">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Content Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,360px] min-h-full">
            
            {/* Left Column */}
            <div className="divide-y divide-neutral-800/60">
              
              {/* Start with a template (Static) */}
              <div className="px-5 py-4">
                <p className="text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-2">Start with a template</p>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-palette w-3.5 h-3.5"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>Color
                  </button>
                  {/* Additional template buttons removed for brevity in code generation, user wanted the look but it's optional */}
                  <button type="button" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-type w-3.5 h-3.5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>Pronouns
                  </button>
                  <button type="button" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>Region
                  </button>
                  <button type="button" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gamepad2 w-3.5 h-3.5"><line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>Game pings
                  </button>
                </div>
              </div>

              {/* Behavior (Static UI mock) */}
              <div className="px-5 py-4">
                <p className="text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-2">Behavior</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 rounded-xl bg-neutral-800/50 border border-neutral-800">
                  <button onClick={() => setBehavior("multi")} type="button" className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${behavior === 'multi' ? 'text-black' : 'text-neutral-400 hover:text-white'}`}>
                    {behavior === 'multi' && <span className="absolute inset-0 bg-white rounded-lg shadow-sm"></span>}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-checks relative z-10 w-3.5 h-3.5"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>
                    <span className="relative z-10">Multi-pick</span>
                  </button>
                  <button onClick={() => setBehavior("pick_one")} type="button" className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${behavior === 'pick_one' ? 'text-black' : 'text-neutral-400 hover:text-white'}`}>
                    {behavior === 'pick_one' && <span className="absolute inset-0 bg-white rounded-lg shadow-sm"></span>}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target relative z-10 w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    <span className="relative z-10">Pick one</span>
                  </button>
                  <button onClick={() => setBehavior("verify")} type="button" className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${behavior === 'verify' ? 'text-black' : 'text-neutral-400 hover:text-white'}`}>
                    {behavior === 'verify' && <span className="absolute inset-0 bg-white rounded-lg shadow-sm"></span>}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check relative z-10 w-3.5 h-3.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
                    <span className="relative z-10">Verify</span>
                  </button>
                  <button onClick={() => setBehavior("opt_out")} type="button" className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${behavior === 'opt_out' ? 'text-black' : 'text-neutral-400 hover:text-white'}`}>
                    {behavior === 'opt_out' && <span className="absolute inset-0 bg-white rounded-lg shadow-sm"></span>}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ban relative z-10 w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
                    <span className="relative z-10">Opt-out</span>
                  </button>
                  <button onClick={() => setBehavior("reversed")} type="button" className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${behavior === 'reversed' ? 'text-black' : 'text-neutral-400 hover:text-white'}`}>
                    {behavior === 'reversed' && <span className="absolute inset-0 bg-white rounded-lg shadow-sm"></span>}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus-circle relative z-10 w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                    <span className="relative z-10">Reversed</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
                  {behavior === 'pick_one' ? "Picking another swaps your existing role." : "Members can pick multiple roles."}
                </p>
              </div>

              {/* Title & Description */}
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">Title</label>
                  <input 
                    maxLength={256} 
                    placeholder="Pick your roles" 
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl h-10 px-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors" 
                    type="text" 
                    value={embedTitle}
                    onChange={(e) => setEmbedTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">Description</label>
                  <textarea 
                    maxLength={1024} 
                    rows={2} 
                    placeholder="Optional" 
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 resize-none transition-colors"
                    value={embedDesc}
                    onChange={(e) => setEmbedDesc(e.target.value)}
                  />
                </div>
              </div>

              {/* Message (Edit in message builder) */}
              <div className="px-5 py-4">
                <p className="text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-2">Message</p>
                <button type="button" className="group w-full flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800/70 hover:border-neutral-700 px-3.5 py-3 text-left transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40">
                  <span className="grid place-items-center w-9 h-9 flex-shrink-0 rounded-lg bg-indigo-500/15 text-indigo-300 group-hover:bg-indigo-500/25 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil w-4 h-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-white">Edit in message builder</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-4 h-4 flex-shrink-0 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-[transform,color] duration-150"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>

              {/* Channel */}
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">Channel<span className="ml-2 text-amber-400 normal-case tracking-normal font-normal">· required to post</span></label>
                  <div className="rounded-xl transition-shadow ring-1 ring-amber-500/40">
                    <select 
                      className="w-full h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-white transition-all duration-200 border-neutral-700 hover:border-neutral-600 focus:outline-none"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                    >
                      <option value="">Pick a channel…</option>
                      {channels.map((c) => (
                        <option key={c.id} value={c.id}>#{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-neutral-800/40 border border-neutral-800">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-white">Post to Discord on save</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Pick a channel above to post.</p>
                  </div>
                  <button type="button" className={`w-10 h-5 rounded-full transition-[transform,background-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 relative flex-shrink-0 ${channelId ? 'bg-emerald-500' : 'bg-neutral-700'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${channelId ? 'left-[22px]' : 'left-0.5'}`}></span>
                  </button>
                </div>
              </div>

              {/* Roles */}
              <div className="px-5 py-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wider font-medium text-neutral-500">Roles</p>
                  <span className="text-[10.5px] text-neutral-600 tabular-nums">{components.length}/25</span>
                </div>
                
                <div className="space-y-2">
                  {components.map((comp, idx) => (
                    <div key={comp._id} className="group flex items-center gap-2 p-2.5 bg-neutral-800/40 border border-neutral-800 rounded-xl">
                      {/* Drag handles (functional but visual only for now) */}
                      <div className="flex flex-col items-center justify-center text-neutral-700 group-hover:text-neutral-500 transition-colors">
                        <button onClick={() => moveComponent(idx, -1)} disabled={idx === 0} type="button" aria-label="Move up" className="flex items-center justify-center min-w-[28px] min-h-[28px] sm:min-w-0 sm:min-h-0 text-xs sm:text-[10px] leading-none px-0.5 disabled:opacity-30 hover:text-white transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded">▲</button>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip-vertical w-3 h-3 my-0.5 opacity-50"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                        <button onClick={() => moveComponent(idx, 1)} disabled={idx === components.length - 1} type="button" aria-label="Move down" className="flex items-center justify-center min-w-[28px] min-h-[28px] sm:min-w-0 sm:min-h-0 text-xs sm:text-[10px] leading-none px-0.5 disabled:opacity-30 hover:text-white transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded">▼</button>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-[44px_1fr] sm:grid-cols-[44px_1fr_140px] gap-2 min-w-0">
                        <div className="relative">
                          <button 
                            type="button" 
                            className="w-full h-10 flex items-center justify-center bg-neutral-800 border rounded-xl text-lg transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border-neutral-700 hover:border-neutral-600" 
                            aria-label="Pick emoji"
                            onClick={() => {
                              const e = prompt("Enter an emoji:", comp.emoji);
                              if (e) updateComponent(idx, "emoji", e);
                            }}
                          >
                            {comp.emoji || "🤔"}
                          </button>
                        </div>
                        <div className="w-full">
                          <select 
                            className="w-full h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-neutral-300 transition-all duration-200 border-neutral-700 hover:border-neutral-600 focus:outline-none"
                            value={comp.role_id || ""}
                            onChange={(e) => updateComponent(idx, "role_id", e.target.value)}
                          >
                            <option value="">Pick a role…</option>
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                        <input 
                          placeholder="Button label (auto)" 
                          maxLength={80} 
                          className="col-span-2 sm:col-span-1 block bg-neutral-800 border border-neutral-700 rounded-xl h-10 px-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors" 
                          type="text" 
                          value={comp.label}
                          onChange={(e) => updateComponent(idx, "label", e.target.value)}
                        />
                      </div>
                      <button onClick={() => removeComponent(idx)} type="button" className="w-10 h-10 flex items-center justify-center rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 flex-shrink-0" aria-label="Remove this role">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 w-3.5 h-3.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  ))}

                  <button onClick={addComponent} type="button" className="flex items-center justify-center gap-1.5 w-full h-10 border border-dashed border-neutral-700 rounded-xl text-xs text-neutral-400 hover:text-white hover:border-neutral-500 hover:bg-neutral-800/30 transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus w-3.5 h-3.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>Add another role
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Preview */}
            <div className="flex flex-col border-t md:border-t-0 md:border-l border-neutral-800/60 bg-neutral-900/40">
              <div className="px-4 py-2.5 border-b border-neutral-800/60 flex items-center gap-2 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye w-3.5 h-3.5 text-neutral-500"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Preview</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="rounded-xl overflow-hidden border border-neutral-800 md:sticky md:top-0">
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#2f3136] border-b border-neutral-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hash w-3.5 h-3.5 text-neutral-500"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                    <span className="text-[12px] font-medium text-neutral-300 truncate">
                      {channels.find(c => c.id === channelId)?.name || "select-channel"}
                    </span>
                  </div>
                  <div className="bg-[#313338] p-3">
                    <div className="flex gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#5865F2] flex-shrink-0 overflow-hidden flex items-center justify-center">
                        <img src="/img/logo.png" alt="Orbit" className="w-full h-full object-cover outline outline-1 -outline-offset-1 outline-white/10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[12px] font-semibold text-white">Orbit</span>
                          <span className="inline-flex items-center gap-[0.15em] px-1 py-px bg-[#5865F2] rounded text-[8.5px] font-bold text-white leading-tight">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-[0.85em] w-[0.85em]"><path d="M20 6 9 17l-5-5"/></svg>BOT
                          </span>
                        </div>
                        <div className="flex rounded overflow-hidden max-w-sm">
                          <div className="w-1 flex-shrink-0" style={{ backgroundColor: 'rgb(88, 101, 242)' }}></div>
                          <div className="bg-[#2b2d31] py-2 px-2.5 flex-1 min-w-0">
                            <p className="text-[11.5px] font-semibold text-white mb-0.5 break-words leading-snug">{embedTitle || "No title"}</p>
                            {embedDesc && <p className="text-[10.5px] text-neutral-400 leading-snug break-words">{embedDesc}</p>}
                            <p className="text-[9.5px] mt-1.5 text-amber-300">
                              {behavior === 'pick_one' ? "Pick one mode" : "Multi-pick mode"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {components.map((comp) => (
                            <div key={comp._id} className="inline-flex items-center gap-1 px-2 h-6 rounded text-[10.5px] font-medium text-white/90 bg-[#4e5058] hover:bg-[#6d6f78] transition-colors max-w-[140px]">
                              <span>{comp.emoji}</span>
                              <span className="truncate">{comp.label || "Role"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-neutral-800 flex-shrink-0">
          <button onClick={onClose} type="button" className="text-xs text-neutral-500 hover:text-white transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-md px-1">
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {components.length === 0 && (
              <span className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-3 h-3"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                Add at least one role
              </span>
            )}
            {initialData && (
              <button
                onClick={async () => {
                  if(!window.confirm("Delete this panel?")) return;
                  setIsSaving(true);
                  try {
                    const res = await fetch(`/api/dashboard/${guildId}/reactionroles/${initialData.id}`, { method: 'DELETE' });
                    if (res.ok) {
                      toast.success("Panel deleted");
                      if(onDeleteSuccess) onDeleteSuccess();
                      onClose();
                    }
                  } finally { setIsSaving(false); }
                }}
                className="text-xs text-red-500 hover:text-red-400 font-semibold px-2"
                disabled={isSaving}
              >
                Delete
              </button>
            )}
            <button 
              onClick={handleSave} 
              disabled={isSaving || components.length === 0 || !channelId} 
              className="flex items-center gap-1.5 bg-white text-black font-semibold text-sm rounded-xl h-10 px-4 hover:bg-neutral-200 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-3.5 h-3.5"><path d="M20 6 9 17l-5-5"/></svg> 
              {isSaving ? "Saving..." : "Save panel"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
