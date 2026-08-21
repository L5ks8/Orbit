import React, { useState, useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';
import SaveBar from '../ui/SaveBar';
import { useToast } from '../ui/Toast';

const TailwindToggle = ({ checked, onChange }) => (
  <button type="button" role="switch" aria-checked={checked} onClick={onChange} className={`relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 ${checked ? 'bg-blue-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}><span className={`pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${checked ? 'translate-x-[21px]' : 'translate-x-[3px]'}`} /></button>
);



const ActionSelector = ({ value, onChange }) => {
  const actions = ['Delete', 'Warn', 'Timeout', 'Kick', 'Ban'];
  return (
    <div className="flex flex-wrap gap-0.5 p-0.5 rounded-xl bg-neutral-800">
      {actions.map(action => {
        const isSelected = value.toLowerCase() === action.toLowerCase();
        return (
          <button
            key={action}
            type="button"
            onClick={() => onChange(action.toLowerCase())}
            className={`flex-1 whitespace-nowrap px-2.5 py-2.5 sm:py-2 rounded-lg text-xs font-medium transition-[color,background-color,box-shadow,scale] duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${isSelected ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            {action}
          </button>
        );
      })}
    </div>
  );
};

export default function Moderation({ guildId }) {
  const toast = useToast();
  
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // States
  const [aiAutomodEnabled, setAiAutomodEnabled] = useState(false);
  const [bannedWords, setBannedWords] = useState({ enabled: false, action: 'delete', words: [], exempt_words: [], level: 'relaxed' });
  const [antiSpam, setAntiSpam] = useState({ enabled: false, max_messages: 5, time_window_sec: 5, action: 'timeout', sensitivity: 'normal' });
  const [antiLink, setAntiLink] = useState({ enabled: false, block_invites: true, allow_media: true, allow_gifs: true, action: 'delete', always_allowed: [], always_blocked: [] });
  const [general, setGeneral] = useState({ log_channel: '', caps_filter_enabled: false, max_mentions: 5 });
  const [exemptions, setExemptions] = useState({ roles: [], channels: [] });
  const [logs, setLogs] = useState({
    message_logs_channel: '', message_edits: false, message_deletes: false,
    member_logs_channel: '', member_joins: false, member_leaves: false,
    voice_logs_channel: '', voice_activity: false,
    mod_logs_channel: '', ignored_channels: []
  });

  const getPayload = () => {
    return {
      automod: {
        enabled: serverData?.config?.automod?.enabled ?? true,
        exempt_channels: exemptions.channels,
        exempt_roles: exemptions.roles,
        ai_automod: { enabled: aiAutomodEnabled },
        banned_words: { ...bannedWords },
        anti_spam: { ...antiSpam },
        anti_link: { ...antiLink },
        anti_caps: { enabled: general.caps_filter_enabled },
        mention_spam: { max_mentions: general.max_mentions }
      }
    };
  };

  const [initialPayload, setInitialPayload] = useState('');

  useEffect(() => {
    if (!guildId) return;
    setLoading(true);
    fetch(`/api/config/${guildId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setServerData(data);
        const amCfg = data?.config?.automod || {};
        
        setAiAutomodEnabled(amCfg.ai_automod?.enabled || false);
        setBannedWords({ ...bannedWords, ...amCfg.banned_words });
        setAntiSpam({ ...antiSpam, ...amCfg.anti_spam });
        setAntiLink({ ...antiLink, ...amCfg.anti_link });
        setGeneral({ 
          log_channel: '', 
          caps_filter_enabled: amCfg.anti_caps?.enabled || false, 
          max_mentions: amCfg.mention_spam?.max_mentions || 5 
        });
        setExemptions({
          roles: (amCfg.exempt_roles || []).map(String),
          channels: (amCfg.exempt_channels || []).map(String)
        });
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load moderation config", err);
        setLoading(false);
      });
  }, [guildId, formKey]);
  
  useEffect(() => {
    if (!loading) {
       setInitialPayload(JSON.stringify(getPayload()));
    }
  }, [loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = getPayload();
      const res = await fetch(`/api/config/${guildId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) {
        toast("Failed to save: " + data.error, 'error');
      } else {
        toast("Settings saved successfully!", 'success');
        setInitialPayload(JSON.stringify(payload));
      }
    } catch (e) {
      console.error(e);
      toast("Error saving settings.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const isDirty = initialPayload && JSON.stringify(getPayload()) !== initialPayload;

  if (loading) return <div className="text-neutral-400 p-8">Loading moderation settings...</div>;

  const channelOptions = serverData?.channels ? serverData.channels.map(c => ({ value: c.id, label: `# ${c.name}` })) : [];
  const roleOptions = serverData?.roles ? serverData.roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color })) : [];

  return (
    <div className="pb-overview-container">
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm bg-red-50/90 dark:bg-red-500/20 text-red-700 dark:text-red-400">
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
            className="lucide lucide-alert-circle w-4 h-4"
          >
            <circle cx={12} cy={12} r={10} />
            <line x1={12} x2={12} y1={8} y2={12} />
            <line x1={12} x2="12.01" y1={16} y2={16} />
          </svg>
          <span className="text-sm">These changes require Pro</span>
        </div>
      </div>
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
                className="lucide lucide-shield-alert w-5 h-5"
              >
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </span>
            <h1 className="text-base font-medium text-white truncate">
              Auto Moderation
            </h1>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 lg:items-stretch min-w-0">
          <div className="flex flex-col gap-4 min-w-0 scroll-mt-24 w-full">
            {/* AI Moderation Card */}
            <div
              className="relative flex flex-col w-full"
              role="button"
              tabIndex={0}
              style={{ cursor: "default" }}
            >
              <div className="pointer-events-none select-none flex flex-col">
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                  <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex-shrink-0 transition-colors text-neutral-500">
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
                          className="lucide lucide-sparkles w-4 h-4"
                        >
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                          <path d="M5 3v4" />
                          <path d="M19 17v4" />
                          <path d="M3 5h4" />
                          <path d="M17 19h4" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium text-white truncate">
                        AI Moderation
                      </span>
                      <span className="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-[0_1px_2px_-0.5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-indigo-400 border-indigo-500/20 bg-gradient-to-b from-indigo-400/25 to-indigo-600/10 h-[19px] pl-[5px] pr-[6.5px] gap-[3px] rounded-[6px] text-[9.5px]">
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
                          className="lucide lucide-crown shrink-0 -ml-px opacity-90"
                          aria-hidden="true"
                        >
                          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
                        </svg>
                        Pro
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-neutral-300 rounded font-semibold uppercase tracking-[0.08em]">
                        Beta
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <TailwindToggle checked={logs.message_deletes} onChange={() => setLogs({ ...logs, message_deletes: !logs.message_deletes })} />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="block w-full px-5 py-9 text-center group rounded-2xl transition-[background-color] hover:bg-white/[0.015] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  >
                    <div className="mx-auto w-11 h-11 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] transition-[transform,background-color] group-hover:bg-violet-500/15 group-active:scale-[0.96]">
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
                        className="lucide lucide-lock w-4 h-4 text-violet-400 group-hover:text-violet-300 transition-[color]"
                      >
                        <rect width={18} height={11} x={3} y={11} rx={2} ry={2} />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-white mb-3 text-balance">
                      Reads what people mean, not just keywords
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md mx-auto mb-4">
                      <span className="text-[11px] px-2 py-1 rounded-md bg-neutral-800/70 text-neutral-400 border border-neutral-800">Hate speech</span>
                      <span className="text-[11px] px-2 py-1 rounded-md bg-neutral-800/70 text-neutral-400 border border-neutral-800">Harassment</span>
                      <span className="text-[11px] px-2 py-1 rounded-md bg-neutral-800/70 text-neutral-400 border border-neutral-800">Threats</span>
                      <span className="text-[11px] px-2 py-1 rounded-md bg-neutral-800/70 text-neutral-400 border border-neutral-800">Violence</span>
                      <span className="text-[11px] px-2 py-1 rounded-md bg-neutral-800/70 text-neutral-400 border border-neutral-800">Sexual content</span>
                      <span className="text-[11px] px-2 py-1 rounded-md bg-neutral-800/70 text-neutral-400 border border-neutral-800">Self-harm</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white text-black text-sm font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_14px_34px_-20px_rgba(0,0,0,0.9)] transition-[transform,background-color] group-hover:bg-neutral-200 group-active:scale-[0.96] group-disabled:group-active:scale-100">
                      Upgrade to Pro
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* AI Image Moderation Card */}
            <div
              className="relative flex flex-col w-full"
              role="button"
              tabIndex={0}
              style={{ cursor: "default" }}
            >
              <div className="pointer-events-none select-none flex flex-col">
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                  <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid place-items-center w-9 h-9 rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] shrink-0">
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
                          className="lucide lucide-scan-eye w-4 h-4"
                        >
                          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                          <circle cx={12} cy={12} r={1} />
                          <path d="M5 12s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium text-white text-balance">AI Image Moderation</h3>
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
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
                              className="lucide lucide-lock w-3 h-3 -ml-0.5"
                            >
                              <rect width={18} height={11} x={3} y={11} rx={2} ry={2} />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Pro
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TailwindToggle checked={logs.message_edits} onChange={() => setLogs({ ...logs, message_edits: !logs.message_edits })} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Filter */}
            <div data-tour="content-filter" className="scroll-mt-24 w-full">
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex-shrink-0 transition-colors text-neutral-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter w-4 h-4">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-white truncate">Content Filter</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="inline-flex">
                      <div className="flex items-center gap-3">
                        <TailwindToggle checked={aiAutomodEnabled} onChange={() => setAiAutomodEnabled(!aiAutomodEnabled)} />
                      </div>
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-5 space-y-5">
                  {/* Filter Level */}
                  <div data-tour="moderation-filter-level" className="scroll-mt-24">
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Filter level</label>
                        <span className="text-xs text-neutral-500 tabular-nums">203 words</span>
                      </div>
                      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(4, minmax(0px, 1fr))" }}>
                        <button type="button" className="rounded-xl border px-2 py-4 flex flex-col items-center gap-2 transition-[color,background-color,border-color,scale] duration-150 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 border-amber-500/50 bg-amber-500/10">
                          <span className="flex items-end" style={{ gap: "3px", height: "16px" }} aria-hidden="true">
                            <span className="w-1 rounded-full transition-colors bg-amber-400" style={{ height: 7 }} />
                            <span className="w-1 rounded-full transition-colors bg-neutral-700" style={{ height: 10 }} />
                            <span className="w-1 rounded-full transition-colors bg-neutral-700" style={{ height: 13 }} />
                            <span className="w-1 rounded-full transition-colors bg-neutral-700" style={{ height: 16 }} />
                          </span>
                          <span className="text-[13px] font-medium leading-none text-white">Relaxed</span>
                        </button>
                        <button type="button" className="rounded-xl border px-2 py-4 flex flex-col items-center gap-2 transition-[color,background-color,border-color,scale] duration-150 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 border-neutral-800 bg-neutral-800/40 hover:border-neutral-700">
                          <span className="flex items-end" style={{ gap: "3px", height: "16px" }} aria-hidden="true">
                            <span className="w-1 rounded-full transition-colors bg-neutral-500" style={{ height: 7 }} />
                            <span className="w-1 rounded-full transition-colors bg-neutral-500" style={{ height: 10 }} />
                            <span className="w-1 rounded-full transition-colors bg-neutral-700" style={{ height: 13 }} />
                            <span className="w-1 rounded-full transition-colors bg-neutral-700" style={{ height: 16 }} />
                          </span>
                          <span className="text-[13px] font-medium leading-none text-neutral-400">Moderate</span>
                        </button>
                        <button type="button" className="rounded-xl border px-2 py-4 flex flex-col items-center gap-2 transition-[color,background-color,border-color,scale] duration-150 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 border-neutral-800 bg-neutral-800/40 hover:border-neutral-700">
                          <span className="flex items-end" style={{ gap: "3px", height: "16px" }} aria-hidden="true">
                            <span className="w-1 rounded-full transition-colors bg-neutral-500" style={{ height: 7 }} />
                            <span className="w-1 rounded-full transition-colors bg-neutral-500" style={{ height: 10 }} />
                            <span className="w-1 rounded-full transition-colors bg-neutral-500" style={{ height: 13 }} />
                            <span className="w-1 rounded-full transition-colors bg-neutral-700" style={{ height: 16 }} />
                          </span>
                          <span className="text-[13px] font-medium leading-none text-neutral-400">Strict</span>
                        </button>
                        <button type="button" className="rounded-xl border px-2 py-4 flex flex-col items-center gap-2 transition-[color,background-color,border-color,scale] duration-150 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 border-neutral-800 bg-neutral-800/40 hover:border-neutral-700">
                          <span className="flex items-end" style={{ gap: "3px", height: "16px" }} aria-hidden="true">
                            <span className="w-1 rounded-full transition-colors bg-neutral-500" style={{ height: 7 }} />
                            <span className="w-1 rounded-full transition-colors bg-neutral-500" style={{ height: 10 }} />
                            <span className="w-1 rounded-full transition-colors bg-neutral-500" style={{ height: 13 }} />
                            <span className="w-1 rounded-full transition-colors bg-neutral-500" style={{ height: 16 }} />
                          </span>
                          <span className="text-[13px] font-medium leading-none text-neutral-400">Maximum</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* When a match is found */}
                  <div data-tour="moderation-content-action" className="scroll-mt-24">
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">When a match is found</label>
                      </div>
                      <div className="space-y-3">
                          <ActionSelector value={bannedWords.action} onChange={val => setBannedWords({ ...bannedWords, action: val })} />
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm text-neutral-400">Banned for</span>
                          <div className="relative">
                            <button type="button" className="inline-flex items-center gap-1.5 h-10 sm:h-8 pl-3 pr-2 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-sm text-white transition-[color,border-color,scale] duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                              Permanent
                              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ease-out">
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit word list */}
                  <div>
                    <button type="button" className="flex items-center justify-between w-full min-h-[44px] py-2 text-left group rounded-lg transition-[scale] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                      <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">Edit word list</span>
                      <span className="flex items-center gap-2 text-xs text-neutral-500">
                        203 words
                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 transition-transform duration-200 ease-out">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </button>
                  </div>

                  {/* Always allow these words */}
                  <div>
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <label className="text-sm font-medium text-neutral-300">Always allow these words</label>
                      <span className="text-xs text-neutral-500 tabular-nums">0 words</span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex gap-2">
                        <input placeholder="Add a word that should never be filtered..." className="flex-1 h-10 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 transition-[border-color,box-shadow] duration-150 ease-out focus:border-neutral-600 focus:ring-2 focus:ring-white/10" type="text" defaultValue="" />
                        <button className="h-10 px-4 bg-neutral-700 text-neutral-200 text-sm font-medium rounded-xl hover:bg-neutral-600 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 flex-shrink-0">Add</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spam Protection */}
            <div data-tour="moderation-spam" className="scroll-mt-24">
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex-shrink-0 transition-colors text-neutral-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap w-4 h-4">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-white truncate">Spam Protection</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <TailwindToggle checked={bannedWords.enabled} onChange={() => setBannedWords({ ...bannedWords, enabled: !bannedWords.enabled })} />
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-5 space-y-5">
                  <div className="rounded-xl bg-neutral-800/40 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] px-4 py-3.5 flex items-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap w-4 h-4 text-blue-400 flex-shrink-0">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <p className="text-sm text-neutral-200 leading-snug text-pretty">
                      Catches a member sending{" "}
                      <span className="font-semibold text-white tabular-nums">5</span>{" "}
                      messages in{" "}
                      <span className="font-semibold text-white tabular-nums">5s</span>
                    </p>
                  </div>

                  {/* Sensitivity */}
                  <div>
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <label className="text-sm font-medium text-neutral-300">Sensitivity</label>
                    </div>
                    <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}>
                      {['Relaxed', 'Normal', 'Strict'].map((level) => {
                        const isSelected = antiSpam.sensitivity.toLowerCase() === level.toLowerCase();
                        let bgClass, borderClass, textClass, barColors;
                        
                        if (isSelected) {
                          borderClass = 'border-blue-500/50';
                          bgClass = 'bg-blue-500/10';
                          textClass = 'text-white';
                          if (level === 'Relaxed') {
                             barColors = ['bg-blue-400', 'bg-neutral-700', 'bg-neutral-700'];
                          } else if (level === 'Normal') {
                             barColors = ['bg-blue-400', 'bg-blue-400', 'bg-neutral-700'];
                          } else {
                             barColors = ['bg-blue-400', 'bg-blue-400', 'bg-blue-400'];
                          }
                        } else {
                          borderClass = 'border-neutral-800 hover:border-neutral-700';
                          bgClass = 'bg-neutral-800/40';
                          textClass = 'text-neutral-400';
                          if (level === 'Relaxed') {
                             barColors = ['bg-neutral-500', 'bg-neutral-700', 'bg-neutral-700'];
                          } else if (level === 'Normal') {
                             barColors = ['bg-neutral-500', 'bg-neutral-500', 'bg-neutral-700'];
                          } else {
                             barColors = ['bg-neutral-500', 'bg-neutral-500', 'bg-neutral-500'];
                          }
                        }

                        return (
                          <button 
                            key={level} 
                            type="button" 
                            onClick={() => setAntiSpam({ ...antiSpam, sensitivity: level.toLowerCase() })}
                            className={`rounded-xl border px-2 py-4 flex flex-col items-center gap-2 transition-[color,background-color,border-color,scale] duration-150 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 ${borderClass} ${bgClass}`}
                          >
                            <span className="flex items-end" style={{ gap: "3px", height: "16px" }} aria-hidden="true">
                              <span className={`w-1 rounded-full transition-colors ${barColors[0]}`} style={{ height: 7 }} />
                              <span className={`w-1 rounded-full transition-colors ${barColors[1]}`} style={{ height: "11.5px" }} />
                              <span className={`w-1 rounded-full transition-colors ${barColors[2]}`} style={{ height: 16 }} />
                            </span>
                            <span className={`text-[13px] font-medium leading-none ${textClass}`}>{level}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Messages & Time Window */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Messages</label>
                      </div>
                      <div className="flex items-center h-10 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl transition-[border-color,box-shadow,opacity] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                        <input min={2} max={20} autoComplete="off" className="h-full w-full bg-transparent px-3 text-sm text-white outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" type="number" value={antiSpam.max_messages} onChange={(e) => setAntiSpam({ ...antiSpam, max_messages: parseInt(e.target.value) || 5 })} />
                        <span className="pr-3 text-xs font-medium text-neutral-500 flex-shrink-0 select-none">msgs</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Time Window</label>
                      </div>
                      <div className="flex items-center h-10 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl transition-[border-color,box-shadow,opacity] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                        <input min={1} max={60} autoComplete="off" className="h-full w-full bg-transparent px-3 text-sm text-white outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" type="number" value={antiSpam.time_window_sec} onChange={(e) => setAntiSpam({ ...antiSpam, time_window_sec: parseInt(e.target.value) || 5 })} />
                        <span className="pr-3 text-xs font-medium text-neutral-500 flex-shrink-0 select-none">sec</span>
                      </div>
                    </div>
                  </div>

                  {/* When triggered */}
                  <div>
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <label className="text-sm font-medium text-neutral-300">When triggered</label>
                    </div>
                    <div className="space-y-3">
                      <ActionSelector value={antiSpam.action} onChange={val => setAntiSpam({ ...antiSpam, action: val })} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Link Filter */}
            <div data-tour="moderation-links" className="relative scroll-mt-24">
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex-shrink-0 transition-colors text-neutral-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link2 w-4 h-4">
                        <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                        <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
                        <line x1={8} x2={16} y1={12} y2={12} />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-white truncate">Link Filter</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <TailwindToggle checked={antiSpam.enabled} onChange={() => setAntiSpam({ ...antiSpam, enabled: !antiSpam.enabled })} />
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-neutral-800/60">
                  <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
                    <div className="min-w-0">
                      <span className="text-sm text-neutral-200">Block Discord invites</span>
                      <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">Removes discord.gg / discord.com invite links</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <TailwindToggle checked={antiLink.enabled} onChange={() => setAntiLink({ ...antiLink, enabled: !antiLink.enabled })} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
                    <div className="min-w-0">
                      <span className="text-sm text-neutral-200">Allow Discord media</span>
                      <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">Let Discord CDN images &amp; attachments through</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <TailwindToggle checked={antiLink.allow_media} onChange={() => setAntiLink({ ...antiLink, allow_media: !antiLink.allow_media })} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
                    <div className="min-w-0">
                      <span className="text-sm text-neutral-200">Allow GIFs</span>
                      <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">Let Tenor &amp; Giphy GIF links through</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <TailwindToggle checked={antiLink.allow_gifs} onChange={() => setAntiLink({ ...antiLink, allow_gifs: !antiLink.allow_gifs })} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-5 space-y-5 border-t border-neutral-800">
                  <div>
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <label className="text-sm font-medium text-neutral-300">When a link is blocked</label>
                    </div>
                    <div className="space-y-3">
                      <ActionSelector value={antiLink.action} onChange={val => setAntiLink({ ...antiLink, action: val })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Always allowed</label>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text hover:border-neutral-600 transition-[border-color] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                        <input placeholder="youtube.com, twitter.com..." title="" autoComplete="off" className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5" defaultValue="" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Always blocked</label>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text hover:border-neutral-600 transition-[border-color] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                        <input placeholder="spam-site.com..." title="" autoComplete="off" className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5" defaultValue="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Actions & Warnings */}
          <div className="lg:relative flex flex-col">
            <div className="flex flex-col gap-4 lg:absolute lg:inset-0">
              {/* Recent Actions */}
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col lg:flex-1 lg:min-h-0">
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gavel w-4 h-4 text-neutral-400">
                      <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
                      <path d="m16 16 6-6" />
                      <path d="m8 8 6-6" />
                      <path d="m9 7 8 8" />
                      <path d="m21 11-8-8" />
                    </svg>
                    <span className="text-sm font-medium text-white">Recent actions</span>
                  </div>
                  <span className="text-xs text-neutral-600 tabular-nums">2 total</span>
                </div>
                <div className="flex flex-col lg:flex-1 lg:min-h-0">
                  <div className="divide-y divide-neutral-800/40 overflow-y-auto scrollbar-thin max-h-[420px] lg:max-h-none lg:flex-1 lg:min-h-0">
                    <div className="flex items-start gap-3 px-4 sm:px-5 py-3 hover:bg-neutral-800/20 transition-[background-color] duration-150 ease-out">
                      <div className="grid place-items-center w-8 h-8 rounded-lg bg-neutral-800 flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gavel w-3.5 h-3.5">
                          <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
                          <path d="m16 16 6-6" />
                          <path d="m8 8 6-6" />
                          <path d="m9 7 8 8" />
                          <path d="m21 11-8-8" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium truncate">Orbit#7034</span>
                          <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider tabular-nums bg-neutral-800 text-neutral-400 border border-neutral-700">untimeout</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 truncate">Removed via timeout quick-action</p>
                      </div>
                      <span className="text-[10px] text-neutral-600 tabular-nums flex-shrink-0 mt-1.5">4h ago</span>
                    </div>
                    <div className="flex items-start gap-3 px-4 sm:px-5 py-3 hover:bg-neutral-800/20 transition-[background-color] duration-150 ease-out">
                      <div className="grid place-items-center w-8 h-8 rounded-lg bg-orange-500/10 flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-x w-3.5 h-3.5">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <line x1={22} x2={16} y1={9} y2={15} />
                          <line x1={16} x2={22} y1={9} y2={15} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium truncate">Orbit#7034</span>
                          <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider tabular-nums bg-orange-500/10 text-orange-400 border border-orange-500/20">timeout</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 truncate">No reason provided</p>
                      </div>
                      <span className="text-[10px] text-neutral-600 tabular-nums flex-shrink-0 mt-1.5">4h ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col lg:flex-1 lg:min-h-0">
                <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle w-4 h-4 text-amber-400">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </svg>
                  <span className="text-sm font-medium text-white">Warnings</span>
                </div>
                <div className="px-4 sm:px-5 py-3 border-b border-neutral-800/60">
                  <div className="flex gap-2">
                    <div className="w-full">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search w-3.5 h-3.5">
                            <circle cx={11} cy={11} r={8} />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                        </div>
                        <input autoComplete="off" title="" className="w-full px-4 py-3 sm:py-2.5 bg-white dark:bg-neutral-800 border rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 pl-11" placeholder="Discord user ID..." defaultValue="" />
                      </div>
                    </div>
                    <button className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out enabled:active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 focus:ring-neutral-400/20 px-3.5 py-2 text-xs">Search</button>
                  </div>
                </div>
                <div className="h-[440px] lg:h-auto lg:flex-1 lg:min-h-0 overflow-y-auto scrollbar-thin flex flex-col">
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search w-6 h-6 text-neutral-800 mx-auto mb-3">
                      <circle cx={11} cy={11} r={8} />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <p className="text-sm text-neutral-600 text-pretty">Enter a user ID to view warnings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - General Settings, Exemptions, Logging */}
        <div data-tour="moderation-actions" className="mt-5 pt-5 border-t border-neutral-800 space-y-4 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* General Settings */}
            <div data-tour="moderation-log" className="w-full bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] scroll-mt-24">
              <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-neutral-800">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings w-4 h-4 text-neutral-400">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx={12} cy={12} r={3} />
                </svg>
                <span className="text-sm font-medium text-white">General settings</span>
              </div>
              <div className="divide-y divide-neutral-800/60">
                <div className="px-4 sm:px-5 py-3">
                  <label className="text-sm text-neutral-200 block mb-2">Log Channel</label>
                  <div className="w-full">
                    <CustomSelect options={channelOptions} value={general.log_channel} onChange={(val) => setGeneral({ ...general, log_channel: val })} placeholder="Select log channel..." />
                  </div>
                </div>
                <div className="px-4 sm:px-5 py-3">
                  <div className="relative" role="button" tabIndex={0} style={{ cursor: "default" }}>
                    <div className="pointer-events-none select-none flex flex-col">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-neutral-200">Caps filter</label>
                        <div className="flex items-center gap-3">
                          <TailwindToggle checked={general.caps_filter_enabled} onChange={() => setGeneral({ ...general, caps_filter_enabled: !general.caps_filter_enabled })} />
                        </div>
                      </div>
                      <div className="mt-3 pointer-events-none opacity-50">
                        <div className="flex items-center h-10 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl transition-[border-color,box-shadow,opacity] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10 opacity-50 cursor-not-allowed">
                          <input min={50} max={100} disabled autoComplete="off" className="h-full w-full bg-transparent px-3 text-sm text-white outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" type="number" defaultValue={70} />
                          <span className="pr-3 text-xs font-medium text-neutral-500 flex-shrink-0 select-none">% caps</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 sm:px-5 py-3">
                  <label className="text-sm text-neutral-200 block mb-2">Max Mentions</label>
                  <div className="flex items-center h-10 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl transition-[border-color,box-shadow,opacity] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                    <input min={0} max={50} autoComplete="off" className="h-full w-full bg-transparent px-3 text-sm text-white outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" type="number" value={general.max_mentions} onChange={(e) => setGeneral({ ...general, max_mentions: parseInt(e.target.value) || 5 })} />
                    <span className="pr-3 text-xs font-medium text-neutral-500 flex-shrink-0 select-none">per msg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Exemptions */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 sm:px-5 py-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield w-4 h-4 text-neutral-400">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                  </svg>
                  <span className="text-sm font-medium text-white">Exemptions</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-3">
                    <span className="text-xs tabular-nums text-neutral-500">0/25 roles</span>
                    <div className="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden">
                      <div className="h-full rounded-full transition-all bg-white/60" style={{ width: "0%" }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs tabular-nums text-neutral-500">0/25 channels</span>
                    <div className="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden">
                      <div className="h-full rounded-full transition-all bg-white/60" style={{ width: "0%" }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-5 space-y-4">
                <div>
                  <label className="text-sm text-neutral-200 block mb-2">Exempt Roles</label>
                  <div className="w-full">
                    <CustomSelect options={roleOptions} value={exemptions.roles} onChange={(val) => setExemptions({ ...exemptions, roles: val })} isMulti placeholder="Select roles..." />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-neutral-200 block mb-2">Exempt Channels</label>
                  <div className="w-full">
                    <CustomSelect options={channelOptions} value={exemptions.channels} onChange={(val) => setExemptions({ ...exemptions, channels: val })} isMulti placeholder="Select channels..." />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logging */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-neutral-800">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square w-4 h-4 text-neutral-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-sm font-medium text-white">Logging</span>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Message Logs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square w-3.5 h-3.5 text-blue-400">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Message Logs</span>
                </div>
                <div className="w-full">
                  <div className="relative">
                    <CustomSelect options={channelOptions} value={logs.message_logs_channel} onChange={(val) => setLogs({ ...logs, message_logs_channel: val })} placeholder="Select log channel..." />
                  </div>
                </div>
                <div className="flex gap-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <TailwindToggle checked={logs.message_edits} onChange={() => setLogs({ ...logs, message_edits: !logs.message_edits })} />
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil w-3.5 h-3.5 text-neutral-500">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                      Edits
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <TailwindToggle checked={logs.message_deletes} onChange={() => setLogs({ ...logs, message_deletes: !logs.message_deletes })} />
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 w-3.5 h-3.5 text-neutral-500">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1={10} x2={10} y1={11} y2={17} />
                        <line x1={14} x2={14} y1={11} y2={17} />
                      </svg>
                      Deletes
                    </span>
                  </label>
                </div>
              </div>

              {/* Member Logs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users w-3.5 h-3.5 text-green-400">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx={9} cy={7} r={4} />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Member Logs</span>
                </div>
                <div className="w-full">
                  <div className="relative">
                    <CustomSelect options={channelOptions} value={logs.member_logs_channel} onChange={(val) => setLogs({ ...logs, member_logs_channel: val })} placeholder="Select log channel..." />
                  </div>
                </div>
                <div className="flex gap-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <TailwindToggle checked={logs.member_joins} onChange={() => setLogs({ ...logs, member_joins: !logs.member_joins })} />
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-in w-3.5 h-3.5 text-neutral-500">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1={15} x2={3} y1={12} y2={12} />
                      </svg>
                      Joins
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <TailwindToggle checked={logs.member_leaves} onChange={() => setLogs({ ...logs, member_leaves: !logs.member_leaves })} />
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out w-3.5 h-3.5 text-neutral-500">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1={21} x2={9} y1={12} y2={12} />
                      </svg>
                      Leaves
                    </span>
                  </label>
                </div>
              </div>

              {/* Voice Logs */}
              <div className="relative" role="button" tabIndex={0} style={{ cursor: "default" }}>
                <div className="pointer-events-none select-none flex flex-col">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic w-3.5 h-3.5 text-purple-400">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1={12} x2={12} y1={19} y2={22} />
                      </svg>
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Voice Logs</span>
                      <span className="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-[0_1px_2px_-0.5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-emerald-400 border-emerald-500/20 bg-gradient-to-b from-emerald-400/25 to-emerald-600/10 h-[19px] pl-[5px] pr-[6.5px] gap-[3px] rounded-[6px] text-[9.5px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles shrink-0 -ml-px opacity-90" aria-hidden="true">
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                          <path d="M5 3v4" />
                          <path d="M19 17v4" />
                          <path d="M3 5h4" />
                          <path d="M17 19h4" />
                        </svg>
                        Starter
                      </span>
                    </div>
                    <div className="w-full">
                      <div className="relative">
                        <CustomSelect options={channelOptions} value={logs.voice_logs_channel} onChange={(val) => setLogs({ ...logs, voice_logs_channel: val })} placeholder="Select log channel..." />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <TailwindToggle checked={logs.voice_activity} onChange={() => setLogs({ ...logs, voice_activity: !logs.voice_activity })} />
                      </div>
                      <span className="text-xs text-neutral-400">Log Voice Activity</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Mod Action Logs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gavel w-3.5 h-3.5 text-red-400">
                    <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
                    <path d="m16 16 6-6" />
                    <path d="m8 8 6-6" />
                    <path d="m9 7 8 8" />
                    <path d="m21 11-8-8" />
                  </svg>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mod Action Logs</span>
                </div>
                <div className="w-full">
                  <div className="relative">
                    <CustomSelect options={channelOptions} value={logs.mod_logs_channel} onChange={(val) => setLogs({ ...logs, mod_logs_channel: val })} placeholder="Select log channel..." />
                  </div>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed text-pretty">Warns, bans, kicks, timeouts &amp; unbans</p>
              </div>
            </div>

            {/* Ignored Channels */}
            <div className="px-4 sm:px-5 py-4 border-t border-neutral-800/60">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off w-3.5 h-3.5 text-neutral-500">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1={2} x2={22} y1={2} y2={22} />
                </svg>
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ignored Channels</span>
              </div>
              <div className="mt-3">
                <div className="w-full">
                  <div className="relative">
                    <button type="button" className="w-full flex items-center justify-between gap-2 min-h-[40px] px-3 py-1.5 bg-neutral-800 border rounded-xl text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                      <div className="flex-1 flex flex-wrap gap-1">
                        <span className="text-neutral-500 text-sm py-0.5">Select channels to exclude...</span>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform">
                        <path d="m6 9 6 6 6-6" />
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
  );
}

