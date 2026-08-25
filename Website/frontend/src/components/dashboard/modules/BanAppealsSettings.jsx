import React, { useState, useEffect } from 'react';
import CustomSelect from '../../ui/CustomSelect';

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

export default function BanAppealsSettings({ guildId, config, channels, roles, onSave, saving, onReset }) {
  const aCfg = config?.appeals || {};
  const [questions, setQuestions] = useState(aCfg.questions || []);
  const [appealChannel, setAppealChannel] = useState(aCfg.channel_id || '');
  const [modRoles, setModRoles] = useState((aCfg.mod_roles || []).map(String));
  const [allowedPunishments, setAllowedPunishments] = useState(aCfg.allowed_punishments || ['ban']);
  const [mentionMods, setMentionMods] = useState(aCfg.mention_mods || false);
  const [anonymousMods, setAnonymousMods] = useState(aCfg.anonymous_mods || false);
  const [multipleSubmissions, setMultipleSubmissions] = useState(aCfg.multiple_submissions || false);
  const [inviteUnbanned, setInviteUnbanned] = useState(aCfg.invite_unbanned || false);
  const [cooldownDays, setCooldownDays] = useState(aCfg.cooldown_days || 3);
  const [customUrl, setCustomUrl] = useState(aCfg.custom_url || '');

  const [pendingAppeals, setPendingAppeals] = useState([]);
  const [fetchingAppeals, setFetchingAppeals] = useState(true);
  const [processingAction, setProcessingAction] = useState(null);

  useEffect(() => {
    if (!guildId) return;
    const fetchAppeals = async () => {
      try {
        const res = await fetch(`/api/server/${guildId}/appeals`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPendingAppeals(data || []);
        }
      } catch (e) {
        console.error("Failed to fetch appeals", e);
      } finally {
        setFetchingAppeals(false);
      }
    };
    fetchAppeals();
  }, [guildId]);

  const handleResolve = async (userId, action) => {
    setProcessingAction(userId);
    try {
      const res = await fetch(`/api/server/${guildId}/appeals/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ user_id: userId, action })
      });
      const data = await res.json();
      if (res.ok) {
        setPendingAppeals(prev => prev.filter(a => a.user_id !== userId));
      } else {
        alert(data.error || 'Failed to process appeal.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while processing appeal.');
    } finally {
      setProcessingAction(null);
    }
  };

  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));
  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));
  const punishmentOptions = [
    { value: 'ban', label: 'Ban' },
    { value: 'timeout', label: 'Timeout' },
    { value: 'kick', label: 'Kick' },
    { value: 'warn', label: 'Warn' },
  ];

  const getPayload = () => ({
      appeals: {
        enabled: true,
        channel_id: appealChannel,
        mod_roles: modRoles,
        allowed_punishments: allowedPunishments,
        mention_mods: mentionMods,
        anonymous_mods: anonymousMods,
        multiple_submissions: multipleSubmissions,
        invite_unbanned: inviteUnbanned,
        cooldown_days: cooldownDays,
        custom_url: customUrl,
        questions: questions
      }
    });

  const [initialStateStr, setInitialStateStr] = useState('');
  
  useEffect(() => {
    const payloadStr = JSON.stringify(getPayload());
    setInitialStateStr(payloadStr);
  }, [config]); 
  
  const currentPayloadStr = JSON.stringify(getPayload());
  const isDirty = initialStateStr && currentPayloadStr !== initialStateStr;

  useEffect(() => {
    if (!initialStateStr || !isDirty) return;
    const timeoutId = setTimeout(() => {
      onSave(getPayload());
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [currentPayloadStr, initialStateStr, isDirty, onSave]);

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5">
      <div data-tour="feature-header" className="scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gavel w-5 h-5">
                  <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"/>
                  <path d="m16 16 6-6"/>
                  <path d="m8 8 6-6"/>
                  <path d="m9 7 8 8"/>
                  <path d="m21 11-8-8"/>
                </svg>
              </span>
              <h1 className="text-base font-medium text-white truncate">
                Ban Appeals
              </h1>
            </div>
          </div>
        </div>

      <div className="mt-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-4 lg:items-stretch min-w-0">
          
          <div className="flex flex-col gap-6 min-w-0 w-full">

            {/* General Settings */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
              <div className="border-b border-neutral-800 p-5">
                <h2 className="text-[15px] font-semibold text-white">General</h2>
                <p className="text-[13px] text-neutral-400 mt-1">Configure where appeals go and who can manage them.</p>
              </div>
              <div className="p-5 flex flex-col gap-6">
                
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[13px] font-medium text-neutral-300">
                    Appeal Channel <span className="text-red-400">*</span>
                  </label>
                  <span className="text-xs text-neutral-500">The channel where new appeals will be sent with Accept/Deny buttons.</span>
                  <div className="z-40">
                    <CustomSelect options={channelOptions} value={appealChannel} onChange={setAppealChannel} placeholder="Select channel..." />
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-[13px] font-medium text-neutral-300">Moderator Roles</label>
                  <span className="text-xs text-neutral-500">Roles allowed to decide on appeals.</span>
                  <div className="z-30">
                    <CustomSelect options={roleOptions} value={modRoles} onChange={setModRoles} isMulti placeholder="Select roles..." />
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-[13px] font-medium text-neutral-300">Allowed Punishments</label>
                  <span className="text-xs text-neutral-500">Which types of punishments can be appealed?</span>
                  <div className="z-20">
                    <CustomSelect options={punishmentOptions} isMulti placeholder="Select punishments..." value={allowedPunishments} onChange={setAllowedPunishments} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-neutral-300">Custom URL</label>
                  <span className="text-xs text-neutral-500">The URL where the appeal form for this server is accessible.</span>
                  <div className="flex items-center">
                    <span className="bg-neutral-800 text-neutral-400 px-3 py-2 border border-r-0 border-neutral-700/50 rounded-l-lg text-[13px]">
                      orbit-bot.com/appeal/
                    </span>
                    <input 
                      type="text"
                      className="flex-1 bg-neutral-800/50 border border-neutral-700/50 rounded-r-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-neutral-500 transition-colors" 
                      placeholder="my-server" 
                      value={customUrl} 
                      onChange={(e) => setCustomUrl(e.target.value)} 
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Options */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
              <div className="border-b border-neutral-800 p-5">
                <h2 className="text-[15px] font-semibold text-white">Options</h2>
                <p className="text-[13px] text-neutral-400 mt-1">Configure appeal behavior and cooldowns.</p>
              </div>
              <div className="p-5 flex flex-col gap-6">

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-medium text-neutral-200">Mention Moderators</div>
                    <div className="text-[13px] text-neutral-500 mt-0.5">Should moderators be mentioned when a new appeal is submitted?</div>
                  </div>
                  <TailwindToggle checked={mentionMods} onChange={() => setMentionMods(!mentionMods)} />
                </div>

                <div className="h-px bg-neutral-800 w-full" />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-medium text-neutral-200">Anonymous Moderators</div>
                    <div className="text-[13px] text-neutral-500 mt-0.5">Should moderators remain anonymous when processing appeals?</div>
                  </div>
                  <TailwindToggle checked={anonymousMods} onChange={() => setAnonymousMods(!anonymousMods)} />
                </div>

                <div className="h-px bg-neutral-800 w-full" />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-medium text-neutral-200">Multiple Submissions</div>
                    <div className="text-[13px] text-neutral-500 mt-0.5">Should users be able to submit multiple appeals?</div>
                  </div>
                  <TailwindToggle checked={multipleSubmissions} onChange={() => setMultipleSubmissions(!multipleSubmissions)} />
                </div>

                <div className="h-px bg-neutral-800 w-full" />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-medium text-neutral-200">Invite Unbanned Members</div>
                    <div className="text-[13px] text-neutral-500 mt-0.5">Send an invite link via DM when an appeal is accepted?</div>
                  </div>
                  <TailwindToggle checked={inviteUnbanned} onChange={() => setInviteUnbanned(!inviteUnbanned)} />
                </div>

                <div className="h-px bg-neutral-800 w-full" />

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-neutral-300">Submission Cooldown (Days)</label>
                  <span className="text-xs text-neutral-500">Wait time before submitting another appeal.</span>
                  <input 
                    type="number" 
                    className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-neutral-500 transition-colors" 
                    value={cooldownDays} 
                    onChange={e => setCooldownDays(parseInt(e.target.value) || 3)} 
                  />
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Recent Appeals */}
          <div className="flex flex-col gap-6 w-full min-w-0">
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col h-full min-h-[400px]">
              <div className="border-b border-neutral-800 p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-white">Recent Appeals</h2>
                  <p className="text-[13px] text-neutral-400 mt-1">Pending ban appeals waiting for review.</p>
                </div>
              </div>
              <div className="flex flex-col flex-1 min-h-0 divide-y divide-neutral-800/60 overflow-y-auto scrollbar-thin">
                
                {fetchingAppeals ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-60">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="text-[11px] text-neutral-400 font-medium">Loading appeals...</span>
                  </div>
                ) : pendingAppeals.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-inbox w-10 h-10 text-neutral-600 mb-3">
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                    </svg>
                    <span className="text-[13px] font-medium text-neutral-400">All Caught Up!</span>
                    <p className="text-[11px] text-neutral-500 mt-1 max-w-[200px]">There are no pending appeals at the moment.</p>
                  </div>
                ) : (
                  pendingAppeals.map((appeal) => {
                    
                    let timeStr = "just now";
                    if (appeal.last_submitted) {
                      const diff = Math.floor(Date.now()/1000 - appeal.last_submitted);
                      if (diff < 60) timeStr = diff + "s ago";
                      else if (diff < 3600) timeStr = Math.floor(diff/60) + "m ago";
                      else if (diff < 86400) timeStr = Math.floor(diff/3600) + "h ago";
                      else timeStr = Math.floor(diff/86400) + "d ago";
                    }

                    const isProcessing = processingAction === appeal.user_id;

                    return (
                      <div key={appeal._id || appeal.user_id} className="p-4 hover:bg-neutral-800/30 transition-colors flex flex-col gap-3 relative">
                        {isProcessing && (
                          <div className="absolute inset-0 bg-neutral-900/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                             <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {appeal.user_avatar ? (
                              <img src={appeal.user_avatar} alt="" className="w-8 h-8 rounded-full bg-neutral-800 flex-shrink-0 object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-neutral-300">{(appeal.user_name || '?').charAt(0).toUpperCase()}</span>
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-white truncate">{appeal.user_name || 'Unknown User'}</span>
                              <span className="text-[11px] text-neutral-500 truncate">{appeal.action || 'Punishment'} • {timeStr}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 whitespace-nowrap flex-shrink-0">Pending</span>
                        </div>
                        <div className="text-[13px] text-neutral-300 bg-neutral-800/50 p-3 rounded-lg border border-neutral-700/50 line-clamp-4">
                          {appeal.reason || 'No reason provided.'}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button 
                            type="button" 
                            disabled={isProcessing}
                            onClick={() => handleResolve(appeal.user_id, 'accept')} 
                            className="flex-1 h-8 rounded-md bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-[11px] font-medium transition-colors disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button 
                            type="button" 
                            disabled={isProcessing}
                            onClick={() => handleResolve(appeal.user_id, 'decline')} 
                            className="flex-1 h-8 rounded-md bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[11px] font-medium transition-colors disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

              </div>
            </div>
          </div>

        </div>

        {/* Questions Form */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
              <div className="border-b border-neutral-800 p-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-white">Form <span className="text-red-400">*</span></h2>
                  <p className="text-[13px] text-neutral-400 mt-1">Configure the questions users must answer.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.open(`${window.location.origin}/appeal/${customUrl || 'my-server'}`, '_blank')}
                    className="inline-flex items-center justify-center gap-2 h-8 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/50 text-[13px] font-medium text-white transition-colors"
                  >
                    View Form
                  </button>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-4">
                
                {questions.length === 0 ? (
                  <div className="flex items-center justify-center h-24 border border-dashed border-neutral-700/50 rounded-xl bg-neutral-800/20">
                    <span className="text-[13px] text-neutral-500">No questions configured.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {questions.map((q, i) => (
                      <div key={i} className="flex gap-2 items-center group">
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-500 text-xs font-medium border border-neutral-700/50 shrink-0">
                          {i + 1}
                        </div>
                        <textarea 
                          rows="1"
                          className="flex-1 bg-neutral-800/50 border border-neutral-700/50 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-neutral-500 transition-colors"
                          placeholder="Enter question..." 
                          value={typeof q === 'string' ? q : ''} 
                          onChange={(e) => {
                            const newQs = [...questions];
                            newQs[i] = e.target.value;
                            setQuestions(newQs);
                          }}
                        ></textarea>
                        <button 
                          type="button"
                          onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))} 
                          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors focus:outline-none border border-red-500 hover:border-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-2">
                  <button 
                    onClick={() => setQuestions([...questions, ''])} 
                    className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-white hover:bg-neutral-200 text-[13px] font-medium text-black transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                    Add Question
                  </button>
                </div>

              </div>
            </div>

      </div>

    </main>
  );
}
