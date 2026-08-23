import React, { useState, useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';
import SaveBar from '../ui/SaveBar';
import { useToast } from '../ui/Toast';

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




const ModerationSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => String(o.value) === String(value))?.label || placeholder;

  return (
    <div className="relative">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 h-10 sm:h-8 pl-3 pr-2 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-sm text-white transition-[color,border-color,scale] duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
      >
        {selectedLabel}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6"></path>
        </svg>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-20 mt-1 left-0 min-w-[130px] p-1 rounded-lg bg-neutral-800 border border-neutral-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_18px_40px_-20px_rgba(0,0,0,0.9)]">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-[color,background-color,scale] duration-150 active:scale-[0.98] hover:bg-white/5 ${String(value) === String(opt.value) ? 'text-white' : 'text-neutral-400'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ActionSelector = ({ value, onChange, durationValue, onDurationChange }) => {
  const actions = [
    { id: 'delete', label: 'Delete' },
    { id: 'warn', label: 'Warn' },
    { id: 'timeout', label: 'Timeout' },
    { id: 'kick', label: 'Kick' },
    { id: 'ban', label: 'Ban' }
  ];
  
  const timeoutOptions = [
    { value: '60', label: '1 min' },
    { value: '300', label: '5 min' },
    { value: '600', label: '10 min' },
    { value: '3600', label: '1 hour' },
    { value: '86400', label: '1 day' },
    { value: '604800', label: '1 week' }
  ];
  
  const banOptions = [
    { value: '0', label: 'Permanent' },
    { value: '86400', label: '1 day' },
    { value: '604800', label: '7 days' },
    { value: '2592000', label: '30 days' }
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-0.5 p-0.5 rounded-xl bg-neutral-800">
        {actions.map(action => {
          const isSelected = value.toLowerCase() === action.id;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onChange(action.id)}
              className={`flex-1 whitespace-nowrap px-2.5 py-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-[color,background-color,box-shadow,scale] duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${isSelected ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              {action.label}
            </button>
          );
        })}
      </div>
      
      {value.toLowerCase() === 'timeout' && (
        <div className="flex items-center gap-2.5 mt-3">
          <span className="text-sm text-neutral-400">Timed out for</span>
          <div className="w-[140px]">
            <ModerationSelect
              options={timeoutOptions}
              value={durationValue}
              onChange={onDurationChange}
              placeholder="5 min"
              
            />
          </div>
        </div>
      )}
      
      {value.toLowerCase() === 'ban' && (
        <div className="flex items-center gap-2.5 mt-3">
          <span className="text-sm text-neutral-400">Banned for</span>
          <div className="w-[140px]">
            <ModerationSelect
              options={banOptions}
              value={durationValue}
              onChange={onDurationChange}
              placeholder="Permanent"
              
            />
          </div>
        </div>
      )}
    </div>
  );
};

const FilterLevelSelector = ({ value, onChange, levels }) => (
  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${levels.length}, minmax(0px, 1fr))` }}>
    {levels.map(level => {
      const isSelected = value.toLowerCase() === level.id.toLowerCase();
      
      let borderClass = 'border-neutral-800 hover:border-neutral-700';
      let bgOuterClass = 'bg-neutral-800/40';
      let bgInnerClass = 'bg-neutral-700';
      
      if (isSelected) {
        if (level.color === 'amber') {
          borderClass = 'border-amber-500/50';
          bgOuterClass = 'bg-amber-500/10';
          bgInnerClass = 'bg-amber-400';
        } else if (level.color === 'blue') {
          borderClass = 'border-blue-500/50';
          bgOuterClass = 'bg-blue-500/10';
          bgInnerClass = 'bg-blue-400';
        } else {
          borderClass = 'border-neutral-500/50';
          bgOuterClass = 'bg-neutral-500/10';
          bgInnerClass = 'bg-neutral-400';
        }
      }
      
      return (
        <button
          key={level.id}
          type="button"
          onClick={() => onChange(level.id.toLowerCase())}
          className={`rounded-xl border px-2 py-4 flex flex-col items-center gap-2 transition-[color,background-color,border-color,scale] duration-150 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 ${borderClass} ${bgOuterClass}`}
        >
          <span className="flex items-end" style={{ gap: "3px", height: "16px" }} aria-hidden="true">
            {level.bars.map((h, i) => (
              <span key={i} className={`w-1 rounded-full transition-colors ${isSelected && i < level.activeBars ? bgInnerClass : 'bg-neutral-700'}`} style={{ height: h }} />
            ))}
          </span>
          <span className={`text-[13px] font-medium leading-none ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
            {level.label}
          </span>
        </button>
      );
    })}
  </div>
);

export default function Moderation({ guildId }) {
  const toast = useToast();
  
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialStateStr, setInitialStateStr] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'success' | 'error'
  const [saveMessage, setSaveMessage] = useState('');
  const [formKey, setFormKey] = useState(0);

  // States
  const [bannedWordsSearch, setBannedWordsSearch] = useState('');
  const [bannedWords, setBannedWords] = useState({ enabled: false, action: 'delete', timeout_duration_min: 5, words: [], allowed_words: [], filter_level: 'relaxed' });
  const [antiSpam, setAntiSpam] = useState({ enabled: false, max_messages: 5, time_window_sec: 5, action: 'timeout', timeout_duration_min: 5 });
  const [antiLink, setAntiLink] = useState({ enabled: false, action: 'delete', timeout_duration_min: 5, blocked_domains: [], allowed_domains: [], allow_media: false, allow_gifs: false });
  const [antiInvites, setAntiInvites] = useState({ enabled: false, action: 'delete', timeout_duration_min: 5 });
  const [mentionSpam, setMentionSpam] = useState({ enabled: false, max_mentions: 5, action: 'timeout', timeout_duration_min: 5 });
  const [antiZalgo, setAntiZalgo] = useState({ enabled: false, action: 'delete', timeout_duration_min: 5 });
  const [antiCaps, setAntiCaps] = useState({ enabled: false, action: 'delete', timeout_duration_min: 5 });
  
  const [general, setGeneral] = useState({ log_channel: '' });
  const [exemptions, setExemptions] = useState({ roles: [], channels: [] });
  const [logs, setLogs] = useState({
    enabled: true,
    executor_in_logs: false,
    global_exempt_channels: [],
    global_exempt_roles: [],
    categories: {},
    channels: {},
    roles: {}
  });
  
  const [recentActions, setRecentActions] = useState([]);
  const [warnSearchId, setWarnSearchId] = useState('');
  const [warnSearchData, setWarnSearchData] = useState(null);
  const [searchingWarns, setSearchingWarns] = useState(false);

  const profanity_basic = ["fuck", "shit", "bitch", "asshole", "cunt", "nigger", "nigga", "faggot", "whore", "slut", "dick", "cock", "pussy"];
  const profanity_strict = [...profanity_basic, "bastard", "motherfucker", "twat", "wanker", "prick", "retard", "dyke", "tranny", "kys", "kill yourself"];
  const profanity_maximum = [...profanity_strict, "crap", "damn", "ass", "piss", "boobs", "tits", "vagina", "penis", "cum", "jizz", "wank"];
  
  const getPredefinedWords = (level) => {
    if (level === 'maximum') return profanity_maximum;
    if (level === 'strict') return profanity_strict;
    if (level === 'moderate') return profanity_basic;
    return [];
  };

  const predefinedWords = getPredefinedWords(bannedWords.filter_level);
  const allBannedWords = Array.from(new Set([...(bannedWords.words || []), ...predefinedWords])).filter(w => !(bannedWords.allowed_words || []).includes(w));

  const removeBannedWord = (w) => {
    if (predefinedWords.includes(w)) {
      setBannedWords({ ...bannedWords, allowed_words: [...(bannedWords.allowed_words || []), w] });
    }
    if ((bannedWords.words || []).includes(w)) {
      setBannedWords({ ...bannedWords, words: bannedWords.words.filter(word => word !== w) });
    }
  };

  const getPayload = () => {
    return {
      automod: {
        enabled: serverData?.config?.automod?.enabled ?? true,
        exempt_channels: exemptions.channels,
        exempt_roles: exemptions.roles,
        banned_words: { ...bannedWords },
        anti_spam: { ...antiSpam },
        anti_link: { ...antiLink },
        anti_invites: { ...antiInvites },
        mention_spam: { ...mentionSpam },
        anti_zalgo: { ...antiZalgo },
        anti_caps: { ...antiCaps }
      }
    };
  };



  const fetchRecentActions = async () => {
    try {
      const res = await fetch(`/api/mod_activity/${guildId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecentActions(data);
      }
    } catch (e) {
      console.error("Failed to load recent actions", e);
    }
  };

  const searchWarns = async () => {
    if (!warnSearchId) return;
    setSearchingWarns(true);
    try {
      const res = await fetch(`/api/warns/${guildId}/${warnSearchId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!data.error) {
        setWarnSearchData(data);
      } else {
        setWarnSearchData([]);
      }
    } catch (e) {
      console.error(e);
      setWarnSearchData([]);
    } finally {
      setSearchingWarns(false);
    }
  };

  useEffect(() => {
    if (!guildId) return;
    setLoading(true);
    
    fetchRecentActions();
    
    fetch(`/api/config/${guildId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setServerData(data);
        const amCfg = data?.config?.automod || {};
        setBannedWords(prev => ({ ...prev, ...amCfg.banned_words }));
        setAntiSpam(prev => ({ ...prev, ...amCfg.anti_spam }));
        setAntiLink(prev => ({ ...prev, ...amCfg.anti_link }));
        setAntiInvites(prev => ({ ...prev, ...amCfg.anti_invites }));
        setMentionSpam(prev => ({ ...prev, ...amCfg.mention_spam }));
        setAntiZalgo(prev => ({ ...prev, ...amCfg.anti_zalgo }));
        setAntiCaps(prev => ({ ...prev, ...amCfg.anti_caps }));
        
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
       setInitialStateStr(JSON.stringify(getPayload()));
    }
  }, [loading]);
  const handleSave = async (payloadStr) => {
    setSaveStatus('saving');
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
        setSaveStatus('error');
        setSaveMessage("Failed to save: " + data.error);
        setTimeout(() => setSaveStatus('idle'), 4000);
      } else {
        setSaveStatus('success');
        setSaveMessage("Saved");
        setInitialStateStr(payloadString);
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (e) {
      console.error(e);
      setSaveStatus('error');
      setSaveMessage("Error saving settings");
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  const currentPayloadStr = JSON.stringify(getPayload());
  const isDirty = initialStateStr && currentPayloadStr !== initialStateStr;

  useEffect(() => {
    if (!initialStateStr || !isDirty) return;
    const timeoutId = setTimeout(() => {
      handleSave(currentPayloadStr);
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [currentPayloadStr, initialStateStr, isDirty]);

  if (loading) return <div className="text-neutral-400 p-8">Loading moderation settings...</div>;

  const channelOptions = serverData?.channels ? serverData.channels.map(c => ({ value: c.id, label: `# ${c.name}` })) : [];
  const roleOptions = serverData?.roles ? serverData.roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color })) : [];

  return (
    <div className="pb-overview-container">
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
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[2fr_1.1fr] gap-4 lg:items-stretch min-w-0">
          <div className="flex flex-col gap-4 min-w-0 scroll-mt-24 w-full">

                        {/* Content Filter */}
            <div data-tour="content-filter" className="scroll-mt-24 w-full">
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex-shrink-0 transition-colors text-amber-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter w-4 h-4">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-white truncate">Content Filter</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="inline-flex">
                      <div className="flex items-center gap-3">
                        <TailwindToggle checked={bannedWords.enabled} onChange={() => setBannedWords({ ...bannedWords, enabled: !bannedWords.enabled })} />
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
                        <span className="text-xs text-neutral-500 tabular-nums">{allBannedWords.length} words</span>
                      </div>
                      <FilterLevelSelector 
                        value={bannedWords.filter_level} 
                        onChange={(val) => setBannedWords({ ...bannedWords, filter_level: val })} 
                        levels={[
                          { id: 'relaxed', label: 'Relaxed', color: 'amber', activeBars: 1, bars: ['7px', '10px', '13px', '16px'] },
                          { id: 'moderate', label: 'Moderate', color: 'amber', activeBars: 2, bars: ['7px', '10px', '13px', '16px'] },
                          { id: 'strict', label: 'Strict', color: 'amber', activeBars: 3, bars: ['7px', '10px', '13px', '16px'] },
                          { id: 'maximum', label: 'Maximum', color: 'amber', activeBars: 4, bars: ['7px', '10px', '13px', '16px'] }
                        ]} 
                      />
                    </div>
                  </div>

                  {/* When a match is found */}
                  <div data-tour="moderation-content-action" className="scroll-mt-24">
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">When a match is found</label>
                      </div>
                      <div className="space-y-3">
                        <ActionSelector value={bannedWords.action} onChange={(val) => setBannedWords({ ...bannedWords, action: val })} durationValue={bannedWords.timeout_duration_min} onDurationChange={(val) => setBannedWords({ ...bannedWords, timeout_duration_min: parseInt(val) })} />
                      </div>
                    </div>
                  </div>

                  {/* Edit word list */}
                  <div>
                    <button type="button" className="flex items-center justify-between w-full min-h-[44px] py-2 text-left group rounded-lg transition-[scale] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" onClick={(e) => { e.currentTarget.nextElementSibling.classList.toggle('hidden'); }}>
                      <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">Edit word list</span>
                      <span className="flex items-center gap-2 text-xs text-neutral-500">{allBannedWords.length} words
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 transition-transform duration-200 ease-out rotate-180">
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </span>
                    </button>
                    <div className="overflow-hidden hidden">
                      <div className="pt-4">
                        <div className="bg-neutral-800/30 rounded-xl border border-neutral-800 overflow-hidden">
                          <div className="px-4 py-4 border-b border-neutral-800/60 space-y-2.5">
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <circle cx="11" cy="11" r="8"></circle>
                                  <path d="m21 21-4.3-4.3"></path>
                                </svg>
                                <input value={bannedWordsSearch} onChange={(e) => setBannedWordsSearch(e.target.value)} placeholder="Search words..." className="w-full h-10 pr-9 bg-neutral-700/50 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 hover:bg-neutral-700 transition-all duration-150 ease-out focus:border-neutral-600 focus:bg-neutral-700 focus:ring-2 focus:ring-white/10" style={{ paddingLeft: "2.5rem" }} type="text" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <path d="M5 12h14"></path>
                                  <path d="M12 5v14"></path>
                                </svg>
                                <input id="banned_word_input" placeholder="Add a word and press Enter..." className="w-full h-10 pr-3 bg-neutral-700/50 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 hover:bg-neutral-700 transition-all duration-150 ease-out focus:border-neutral-600 focus:bg-neutral-700 focus:ring-2 focus:ring-white/10" style={{ paddingLeft: "2.5rem" }} type="text" onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                    const w = e.target.value.trim();
                                    if ((bannedWords.allowed_words || []).includes(w)) {
                                      setBannedWords({ ...bannedWords, allowed_words: bannedWords.allowed_words.filter(word => word !== w) });
                                    } else if (!allBannedWords.includes(w)) {
                                      setBannedWords({ ...bannedWords, words: [...(bannedWords.words||[]), w] });
                                    }
                                    e.target.value = '';
                                  }
                                }} />
                              </div>
                              <button onClick={() => {
                                const input = document.getElementById('banned_word_input');
                                if (input.value.trim()) {
                                  const w = input.value.trim();
                                  if ((bannedWords.allowed_words || []).includes(w)) {
                                    setBannedWords({ ...bannedWords, allowed_words: bannedWords.allowed_words.filter(word => word !== w) });
                                  } else if (!allBannedWords.includes(w)) {
                                    setBannedWords({ ...bannedWords, words: [...(bannedWords.words||[]), w] });
                                  }
                                  input.value = '';
                                }
                              }} className="h-10 px-4 bg-neutral-700 text-neutral-200 text-sm font-medium rounded-xl hover:bg-neutral-600 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 flex-shrink-0">Add</button>
                            </div>
                          </div>
                          <div className="px-4 py-4 max-h-[280px] overflow-y-auto scrollbar-thin">
                            <div className="flex flex-wrap gap-1.5">
                              {allBannedWords.filter(w => w.toLowerCase().includes(bannedWordsSearch.toLowerCase())).map((w, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 max-w-full break-all pl-2.5 pr-1 py-1 text-xs bg-neutral-700/50 text-neutral-300 rounded-lg font-mono group hover:bg-neutral-700 transition-[background-color] duration-150 ease-out">
                                  {w}
                                  <button onClick={() => removeBannedWord(w)} aria-label="Remove word" className="grid place-items-center w-6 h-6 -my-1 text-red-500/80 hover:text-red-400 transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-md opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x w-3 h-3">
                                      <path d="M18 6 6 18"></path>
                                      <path d="m6 6 12 12"></path>
                                    </svg>
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                                    {/* Always allow these words */}
                  <div>
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <label className="text-sm font-medium text-neutral-300">Always allow these words</label>
                      <span className="text-xs text-neutral-500 tabular-nums">{bannedWords.allowed_words?.length || 0} words</span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex gap-2">
                        <input id="allowed_word_input" placeholder="Add a word that should never be filtered..." className="flex-1 h-10 px-3 bg-neutral-700/50 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 hover:bg-neutral-700 transition-all duration-150 ease-out focus:border-neutral-600 focus:bg-neutral-700 focus:ring-2 focus:ring-white/10" type="text" onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            setBannedWords({ ...bannedWords, allowed_words: [...(bannedWords.allowed_words||[]), e.target.value.trim()] });
                            e.target.value = '';
                          }
                        }} />
                        <button onClick={() => {
                          const input = document.getElementById('allowed_word_input');
                          if (input.value.trim()) {
                            setBannedWords({ ...bannedWords, allowed_words: [...(bannedWords.allowed_words||[]), input.value.trim()] });
                            input.value = '';
                          }
                        }} className="h-10 px-4 bg-neutral-700 text-neutral-200 text-sm font-medium rounded-xl hover:bg-neutral-600 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 flex-shrink-0">Add</button>
                      </div>
                      {((bannedWords.allowed_words||[]).length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {bannedWords.allowed_words.map((w, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs font-medium text-white group cursor-pointer hover:bg-neutral-700 transition-colors" onClick={() => setBannedWords({ ...bannedWords, allowed_words: bannedWords.allowed_words.filter(word => word !== w) })}>
                              {w}
                              <button aria-label="Remove word" className="p-0.5 rounded-md text-red-500/80 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 6 6 18"></path>
                                  <path d="m6 6 12 12"></path>
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
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
                      <TailwindToggle checked={antiSpam.enabled} onChange={() => setAntiSpam({ ...antiSpam, enabled: !antiSpam.enabled })} />
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
                      <span className="font-semibold text-white tabular-nums">{antiSpam.max_messages || 5}</span>{" "}
                      messages in{" "}
                      <span className="font-semibold text-white tabular-nums">{antiSpam.time_window_sec || 5}s</span>
                    </p>
                  </div>

                  {/* Sensitivity */}
                  <div>
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <label className="text-sm font-medium text-neutral-300">Sensitivity</label>
                    </div>
                    <FilterLevelSelector 
                        value={antiSpam.sensitivity || 'normal'} 
                        onChange={(val) => {
                          const settings = val === 'relaxed' ? { max_messages: 7, time_window_sec: 5 } :
                                           val === 'normal'  ? { max_messages: 5, time_window_sec: 5 } :
                                           val === 'strict'  ? { max_messages: 3, time_window_sec: 5 } : {};
                          setAntiSpam({ ...antiSpam, sensitivity: val, ...settings });
                        }} 
                        levels={[
                          { id: 'relaxed', label: 'Relaxed', color: 'blue', activeBars: 1, bars: ['7px', '11.5px', '16px'] },
                          { id: 'normal', label: 'Normal', color: 'blue', activeBars: 2, bars: ['7px', '11.5px', '16px'] },
                          { id: 'strict', label: 'Strict', color: 'blue', activeBars: 3, bars: ['7px', '11.5px', '16px'] }
                        ]} 
                      />
                    </div>

                  {/* Messages & Time Window */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Messages</label>
                      </div>
                      <div className="flex items-center h-10 bg-neutral-700/50 border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-700 rounded-xl transition-all duration-150 ease-out focus-within:border-neutral-600 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-white/10">
                        <input min={2} max={20} autoComplete="off" className="h-full w-full !bg-transparent px-3 text-sm text-white outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" type="number" value={antiSpam.max_messages} onChange={(e) => setAntiSpam({ ...antiSpam, max_messages: parseInt(e.target.value) || 5 })} />
                        <span className="pr-3 text-xs font-medium text-neutral-500 flex-shrink-0 select-none">msgs</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Time Window</label>
                      </div>
                      <div className="flex items-center h-10 bg-neutral-700/50 border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-700 rounded-xl transition-all duration-150 ease-out focus-within:border-neutral-600 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-white/10">
                        <input min={1} max={60} autoComplete="off" className="h-full w-full !bg-transparent px-3 text-sm text-white outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" type="number" value={antiSpam.time_window_sec} onChange={(e) => setAntiSpam({ ...antiSpam, time_window_sec: parseInt(e.target.value) || 5 })} />
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
                      <ActionSelector value={antiSpam.action} onChange={(val) => setAntiSpam({ ...antiSpam, action: val })} />
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
                      <TailwindToggle checked={antiLink.enabled} onChange={() => setAntiLink({ ...antiLink, enabled: !antiLink.enabled })} />
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
                        <TailwindToggle checked={antiInvites.enabled} onChange={() => setAntiInvites({ ...antiInvites, enabled: !antiInvites.enabled })} />
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
                      <ActionSelector value={antiLink.action} onChange={(val) => setAntiLink({ ...antiLink, action: val })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Always allowed</label>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text hover:border-neutral-600 transition-[border-color] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                        {(antiLink.allowed_domains || []).map((domain, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-lg bg-neutral-700/50 text-xs font-medium text-neutral-300 group">
                            {domain}
                            <button type="button" aria-label="Remove domain" onClick={() => setAntiLink({ ...antiLink, allowed_domains: antiLink.allowed_domains.filter(d => d !== domain) })} className="p-0.5 rounded-md text-red-500/80 hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                            </button>
                          </span>
                        ))}
                        <input placeholder="youtube.com, twitter.com..." title="" autoComplete="off" className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5" onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            setAntiLink({ ...antiLink, allowed_domains: [...(antiLink.allowed_domains || []), e.target.value.trim()] });
                            e.target.value = '';
                          }
                        }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <label className="text-sm font-medium text-neutral-300">Always blocked</label>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text hover:border-neutral-600 transition-[border-color] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                        {(antiLink.blocked_domains || []).map((domain, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-lg bg-neutral-700/50 text-xs font-medium text-neutral-300 group">
                            {domain}
                            <button type="button" aria-label="Remove domain" onClick={() => setAntiLink({ ...antiLink, blocked_domains: antiLink.blocked_domains.filter(d => d !== domain) })} className="p-0.5 rounded-md text-red-500/80 hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                            </button>
                          </span>
                        ))}
                        <input placeholder="spam-site.com..." title="" autoComplete="off" className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5" onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            setAntiLink({ ...antiLink, blocked_domains: [...(antiLink.blocked_domains || []), e.target.value.trim()] });
                            e.target.value = '';
                          }
                        }} />
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
                  <span className="text-xs text-neutral-600 tabular-nums">{recentActions.length} total</span>
                </div>
                <div className="flex flex-col lg:flex-1 lg:min-h-0">
                  <div className="divide-y divide-neutral-800/40 overflow-y-auto scrollbar-thin max-h-[420px] lg:max-h-none lg:flex-1 lg:min-h-0">
                    {recentActions.length === 0 ? (
                      <div className="p-4 text-center text-sm text-neutral-500">No recent actions</div>
                    ) : (
                      recentActions.map((action, i) => (
                        <div key={i} className="flex items-start gap-3 px-4 sm:px-5 py-3 hover:bg-neutral-800/20 transition-[background-color] duration-150 ease-out">
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
                              <span className="text-sm text-white font-medium truncate">{action.target_name}</span>
                              <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider tabular-nums bg-neutral-800 text-neutral-400 border border-neutral-700">{action.action}</span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1 truncate">{action.reason}</p>
                          </div>
                          <span className="text-[10px] text-neutral-600 tabular-nums flex-shrink-0 mt-1.5">{new Date(action.timestamp * 1000).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
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
                        <input autoComplete="off" value={warnSearchId} onChange={(e) => setWarnSearchId(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') searchWarns() }} className="w-full pr-4 pl-[44px] py-3 sm:py-2.5 bg-white dark:bg-neutral-800 border rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600" placeholder="Discord user ID..." />
                      </div>
                    </div>
                    <button type="button" onClick={searchWarns} disabled={searchingWarns} className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out enabled:active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 focus:ring-neutral-400/20 px-3.5 py-2 text-xs">
                      {searchingWarns ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
                <div className="h-[440px] lg:h-auto lg:flex-1 lg:min-h-0 overflow-y-auto scrollbar-thin flex flex-col">
                  {!warnSearchData ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search w-6 h-6 text-neutral-800 mx-auto mb-3">
                        <circle cx={11} cy={11} r={8} />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                      <p className="text-sm text-neutral-600 text-pretty">Enter a user ID to view warnings</p>
                    </div>
                  ) : warnSearchData.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
                      <p className="text-sm text-neutral-500">No warnings found for this user.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-800/40">
                      {warnSearchData.map((warn, i) => (
                        <div key={i} className="flex flex-col gap-1 px-4 sm:px-5 py-3 hover:bg-neutral-800/20 transition-[background-color]">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">Warn ID: {warn.id}</span>
                            <span className="text-[10px] text-neutral-600">{new Date(warn.timestamp * 1000).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-neutral-400">Moderator: {warn.mod_name}</p>
                          <p className="text-sm text-neutral-300 mt-1">{warn.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
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
                    <CustomSelect options={channelOptions} value={logs.channels?.auto_moderation} onChange={(val) => setLogs({ ...logs, channels: { ...logs.channels, auto_moderation: val }})} placeholder="Select log channel..." />
                  </div>
                </div>
                <div className="px-4 sm:px-5 py-3">
                  <div className="relative" role="button" tabIndex={0} style={{ cursor: "default" }}>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-neutral-200">Caps filter</label>
                        <div className="flex items-center gap-3">
                          <TailwindToggle checked={antiLink.block_invites} onChange={() => setAntiLink({ ...antiLink, block_invites: !antiLink.block_invites })} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center h-10 bg-neutral-700/50 border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-700 rounded-xl transition-all duration-150 ease-out focus-within:border-neutral-600 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-white/10 ">
                          <input min={50} max={100}  autoComplete="off" className="h-full w-full !bg-transparent px-3 text-sm text-white outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" type="number" defaultValue={70} />
                          <span className="pr-3 text-xs font-medium text-neutral-500 flex-shrink-0 select-none">% caps</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 sm:px-5 py-3">
                  <label className="text-sm text-neutral-200 block mb-2">Max Mentions</label>
                  <div className="flex items-center h-10 bg-neutral-700/50 border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-700 rounded-xl transition-all duration-150 ease-out focus-within:border-neutral-600 focus-within:bg-neutral-700 focus-within:ring-2 focus-within:ring-white/10">
                    <input min={0} max={50} autoComplete="off" className="h-full w-full !bg-transparent px-3 text-sm text-white outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" type="number" value={general.max_mentions} onChange={(e) => setGeneral({ ...general, max_mentions: parseInt(e.target.value) || 5 })} />
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
                  <CustomSelect 
                    options={channelOptions} 
                    value={logs.channels?.message_deleted || logs.channels?.message_edited} 
                    onChange={(val) => setLogs({ ...logs, channels: { ...logs.channels, message_deleted: val, message_edited: val, bulk_message_delete: val }})} 
                    placeholder="Select log channel..." 
                  />
                </div>
                <div className="flex gap-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <TailwindToggle checked={logs.categories?.message_edited || false} onChange={() => setLogs({ ...logs, categories: { ...logs.categories, message_edited: !logs.categories?.message_edited }})} />
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
                      <TailwindToggle checked={logs.categories?.message_deleted || false} onChange={() => setLogs({ ...logs, categories: { ...logs.categories, message_deleted: !logs.categories?.message_deleted, bulk_message_delete: !logs.categories?.message_deleted }})} />
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
                  <CustomSelect 
                    options={channelOptions} 
                    value={logs.channels?.member_joined || logs.channels?.member_left} 
                    onChange={(val) => setLogs({ ...logs, channels: { ...logs.channels, member_joined: val, member_left: val }})} 
                    placeholder="Select log channel..." 
                  />
                </div>
                <div className="flex gap-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <TailwindToggle checked={logs.categories?.member_joined || false} onChange={() => setLogs({ ...logs, categories: { ...logs.categories, member_joined: !logs.categories?.member_joined }})} />
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
                      <TailwindToggle checked={logs.categories?.member_left || false} onChange={() => setLogs({ ...logs, categories: { ...logs.categories, member_left: !logs.categories?.member_left }})} />
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
                <div className="flex flex-col">
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
                      <CustomSelect 
                        options={channelOptions} 
                        value={logs.channels?.member_joined_voice || logs.channels?.member_left_voice} 
                        onChange={(val) => setLogs({ ...logs, channels: { ...logs.channels, member_joined_voice: val, member_left_voice: val, member_moved_voice: val }})} 
                        placeholder="Select log channel..." 
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <TailwindToggle checked={logs.categories?.member_joined_voice || false} onChange={() => setLogs({ ...logs, categories: { ...logs.categories, member_joined_voice: !logs.categories?.member_joined_voice, member_left_voice: !logs.categories?.member_joined_voice, member_moved_voice: !logs.categories?.member_joined_voice }})} />
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
                  <CustomSelect 
                    options={channelOptions} 
                    value={logs.channels?.moderation_action} 
                    onChange={(val) => setLogs({ ...logs, channels: { ...logs.channels, moderation_action: val }})} 
                    placeholder="Select log channel..." 
                  />
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
                  <CustomSelect 
                    options={channelOptions} 
                    value={logs.global_exempt_channels} 
                    onChange={(val) => setLogs({ ...logs, global_exempt_channels: val })} 
                    isMulti 
                    placeholder="Select channels to exclude..." 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {saveStatus !== 'idle' && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
            saveStatus === 'success' 
              ? 'bg-emerald-600 text-white' 
              : saveStatus === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-neutral-800 text-neutral-200'
          }`}>
            {saveStatus === 'saving' && (
              <svg className="animate-spin w-4 h-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {saveStatus === 'success' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            )}
            {saveStatus === 'error' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            )}
            <span className="text-sm font-medium">
              {saveStatus === 'saving' ? 'Saving...' : saveMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}





