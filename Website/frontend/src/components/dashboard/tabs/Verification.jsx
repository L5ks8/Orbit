import React, { useState, useEffect, useRef } from 'react';
import CustomSelect from '../../ui/CustomSelect';
import DiscordPreview from '../../ui/DiscordPreview';
import { useToast } from '../../ui/Toast';

const TailwindToggle = ({ checked, onChange }) => (
    <button 
      type="button" 
      role="switch" 
      aria-checked={checked} 
      onClick={onChange}
      className={`relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 ${checked ? 'bg-white' : 'bg-neutral-800'}`}
    >
      <span className={`pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-all duration-300 ease-out will-change-transform ${checked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-400'}`} />
    </button>
);

export default function Verification({ guildId, serverData, setServerData }) {
  const toast = useToast();
  const vCfg = serverData?.config?.verify || {};

  const initialPayloadRef = useRef('');
  const [isSaving, setIsSaving] = useState(false);

  const [verType, setVerType] = useState(vCfg.verification_type || 'captcha');
  const [roleId, setRoleId] = useState(vCfg.role_id || '');
  const [removeRoleId, setRemoveRoleId] = useState(vCfg.remove_role_id || '');
  const [timeoutAction, setTimeoutAction] = useState(vCfg.timeout_action || 'none');
  const [timeoutMinutes, setTimeoutMinutes] = useState(vCfg.timeout_minutes || 0);
  const [embedTitle, setEmbedTitle] = useState(vCfg.embed_title || '');
  const [embedDesc, setEmbedDesc] = useState(vCfg.embed_description || '');
  const [embedColor, setEmbedColor] = useState(vCfg.embed_color || '#5865F2');
  const [embedImage, setEmbedImage] = useState(vCfg.embed_image || '/img/default_verify.png');
  const [panelChannel, setPanelChannel] = useState(vCfg.channel_id || '');

  const roleOptions = (serverData?.roles || []).map(r => ({ value: String(r.id), label: r.name || 'Unknown Role', color: r.color ? `#${r.color.toString(16).padStart(6, '0')}` : undefined }));
  const channelOptions = (serverData?.channels || []).map(c => ({ value: String(c.id), label: `# ${c.name}` }));

  const verifyModes = [
    { id: 'web_captcha', label: 'Web CAPTCHA', desc: 'Opens a browser challenge — most secure' },
    { id: 'captcha', label: 'Discord CAPTCHA', desc: 'Image-based captcha inside Discord' },
    { id: 'oneclick', label: 'One-Click', desc: 'Instant verify with a single button tap' }
  ];

  const timeoutActions = [
    { value: 'none', label: 'None' },
    { value: 'kick', label: 'Kick' },
    { value: 'ban', label: 'Ban' }
  ];

  const getPayload = () => ({
    verify: {
      enabled: vCfg.enabled || false,
      verification_type: verType,
      channel_id: panelChannel,
      role_id: roleId,
      remove_role_id: removeRoleId,
      timeout_action: timeoutAction,
      timeout_minutes: timeoutMinutes,
      embed_title: embedTitle,
      embed_description: embedDesc,
      embed_color: embedColor,
      embed_image: embedImage
    }
  });

  if (!initialPayloadRef.current) {
    initialPayloadRef.current = JSON.stringify(getPayload());
  }

  const isSavingRef = useRef(false);

  const handleSave = async (payloadStr) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    const toastId = toast.loading('Saving...');
    try {
      const payloadString = typeof payloadStr === 'string' ? payloadStr : JSON.stringify(getPayload());
      const res = await fetch(`/api/config/${guildId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: payloadString
      });
      const data = await res.json();
      if (data.error) {
        toast.error('Failed to save: ' + data.error, { id: toastId });
      } else {
        toast.success('Settings saved', { id: toastId });
        initialPayloadRef.current = payloadString;
      }
    } catch (e) {
      console.error(e);
      toast.error('Error saving settings', { id: toastId });
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const currentPayloadStr = JSON.stringify(getPayload());
  const isDirty = initialPayloadRef.current && currentPayloadStr !== initialPayloadRef.current;

  useEffect(() => {
    if (!initialPayloadRef.current || !isDirty || isSavingRef.current) return;
    const timeoutId = setTimeout(() => {
      handleSave(currentPayloadStr);
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [currentPayloadStr, isDirty]);

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5">
      <div>
        <div data-tour="feature-header" className="scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check w-5 h-5">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
              <h1 className="text-base font-medium text-white truncate">
                Verification
              </h1>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="space-y-3">
            {/* Verification Mode */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-emerald-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scan-eye w-4 h-4 text-emerald-400">
                      <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                      <circle cx="12" cy="12" r="1" /><path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white truncate">
                    Verification Mode
                  </span>
                </div>
              </div>
              <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {verifyModes.map(mode => {
                    const isSelected = verType === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setVerType(mode.id)}
                        className={`relative px-4 py-3.5 rounded-xl border text-left transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                          isSelected
                            ? 'bg-neutral-800 border-neutral-500 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[13px] font-semibold">{mode.label}</span>
                          {isSelected && (
                            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500 leading-snug">
                          {mode.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Role Configuration */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-sky-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check w-4 h-4 text-sky-400">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white truncate">
                    Role Configuration
                  </span>
                </div>
              </div>
              <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1.5">Verified Role (granted on verify)</label>
                    <CustomSelect options={roleOptions} value={roleId} onChange={setRoleId} placeholder="Select role..." />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1.5">Unverified Role (removed on verify)</label>
                    <CustomSelect options={roleOptions} value={removeRoleId} onChange={setRemoveRoleId} placeholder="Select role..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeout Penalty */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-amber-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer w-4 h-4 text-amber-400">
                      <line x1="10" x2="14" y1="2" y2="2" /><line x1="12" x2="15" y1="14" y2="11" /><circle cx="12" cy="14" r="8" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white truncate">
                    Timeout Penalty
                  </span>
                </div>
              </div>
              <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
                <p className="text-[11px] text-neutral-500 leading-relaxed mt-3 mb-4">
                  What happens if a user doesn't verify within the time limit.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1.5">Action</label>
                    <CustomSelect options={timeoutActions} value={timeoutAction} onChange={setTimeoutAction} placeholder="Select action..." />
                  </div>
                  {timeoutAction !== 'none' && (
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1.5">Time limit (minutes)</label>
                      <div className="flex items-center gap-2">
                        <div className="w-full">
                          <div className="relative">
                            <input
                              autoComplete="off"
                              title=""
                              className="w-full px-4 py-3 sm:py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600"
                              min="1"
                              max="10080"
                              type="number"
                              value={timeoutMinutes}
                              onChange={e => setTimeoutMinutes(parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-neutral-500 flex-shrink-0">min</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Panel Design */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-violet-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-palette w-4 h-4 text-violet-400">
                      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white truncate">
                    Panel Design
                  </span>
                </div>
              </div>
              <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
                  {/* Editor */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1.5">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={embedColor}
                          onChange={e => setEmbedColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-neutral-700 bg-transparent"
                        />
                        <input
                          className="w-24 px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none hover:border-neutral-600 transition-all duration-200"
                          value={embedColor}
                          onChange={e => setEmbedColor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1.5">Title</label>
                      <input
                        className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none hover:border-neutral-600 transition-all duration-200"
                        value={embedTitle}
                        onChange={e => setEmbedTitle(e.target.value)}
                        placeholder="Server Verification"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1.5">Description</label>
                      <textarea
                        className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none hover:border-neutral-600 transition-all duration-200 resize-none"
                        rows={3}
                        value={embedDesc}
                        onChange={e => setEmbedDesc(e.target.value)}
                        placeholder="Click the button below to verify your account."
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1.5">Image URL</label>
                      <input
                        className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none hover:border-neutral-600 transition-all duration-200"
                        value={embedImage}
                        onChange={e => setEmbedImage(e.target.value)}
                        placeholder="https://example.com/image.png"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] text-neutral-500 block">Preview</label>
                    <div className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-3 flex-1">
                      <DiscordPreview
                        embedColor={embedColor}
                        embedTitle={embedTitle || 'Server Verification'}
                        embedDesc={embedDesc || 'Please click the button below to verify your account and gain access to the server.'}
                        embedImage={embedImage || '/img/default_verify.png'}
                        mode="embed"
                        accentColor="#5865F2"
                        cardTitle="VERIFY"
                        roles={serverData?.roles || []}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Send Panel */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-rose-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send w-4 h-4 text-rose-400">
                      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                      <path d="m21.854 2.147-10.94 10.939" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white truncate">
                    Deploy Panel
                  </span>
                </div>
              </div>
              <div className="px-5 pb-5 pt-1 border-t border-neutral-800">
                <p className="text-[11px] text-neutral-500 leading-relaxed mt-3 mb-4">
                  Choose a channel and send the verification embed. Users will see a button to start verification.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                    <label className="text-[11px] text-neutral-500 block mb-1.5">Channel</label>
                    <CustomSelect options={channelOptions} value={panelChannel} onChange={setPanelChannel} placeholder="# select channel" />
                  </div>
                  <button
                    type="button"
                    disabled={!panelChannel || isSaving || isDirty}
                    onClick={async () => {
                      if (isDirty) {
                        toast.error('Save your changes before sending the panel.');
                        return;
                      }
                      const sendToastId = toast.loading('Sending panel...');
                      try {
                        const res = await fetch(`/api/action/${guildId}/send_verify_panel`, {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: JSON.stringify({ channel_id: panelChannel })
                        });
                        const data = await res.json();
                        if (data.error) {
                          toast.error(data.error, { id: sendToastId });
                        } else {
                          toast.success('Panel sent successfully!', { id: sendToastId });
                        }
                      } catch (err) {
                        toast.error('Failed to send panel', { id: sendToastId });
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                      <path d="m21.854 2.147-10.94 10.939" />
                    </svg>
                    Send Panel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
