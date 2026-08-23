import sys
import re

try:
    with open('Website/frontend/src/components/dashboard/Moderation.jsx', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Update General Settings "Log Channel" UI
    # We will hook up logs.channels.auto_moderation here!
    general_ui = """                <div className="px-4 sm:px-5 py-3">
                  <label className="text-sm text-neutral-200 block mb-2">Log Channel</label>
                  <div className="w-full">
                    <CustomSelect 
                      options={channelOptions} 
                      value={logs.channels?.auto_moderation} 
                      onChange={(val) => setLogs({ ...logs, channels: { ...logs.channels, auto_moderation: val }})} 
                      placeholder="Select log channel..." 
                    />
                  </div>
                </div>"""
                
    code = re.sub(
        r'<div className="px-4 sm:px-5 py-3">\s*<label className="text-sm text-neutral-200 block mb-2">Log Channel</label>.*?</div>\s*</div>',
        general_ui,
        code,
        flags=re.DOTALL
    )

    # 2. Update Exemptions UI
    # Right now they use CustomSelect but it's hardcoded to exemptions.roles and exemptions.channels
    # Wait, earlier I noticed it was already using exemptions.roles and exemptions.channels. I don't need to change that if the state works.
    
    # 3. Update Logging UI
    # Currently they use `# select channel` dummies
    
    # Message Logs
    msg_logs = """            {/* Message Logs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square w-4 h-4 text-blue-400">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Message Logs</span>
              </div>
              <div className="bg-neutral-800/50 rounded-xl border border-neutral-800 p-3 space-y-3">
                <div className="w-full">
                  <CustomSelect 
                    options={channelOptions} 
                    value={logs.channels?.message_deleted || logs.channels?.message_edited} 
                    onChange={(val) => setLogs({ ...logs, channels: { ...logs.channels, message_deleted: val, message_edited: val, bulk_message_delete: val }})} 
                    placeholder="Select log channel..." 
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 px-1">
                  <div className="flex items-center gap-2">
                    <TailwindToggle checked={logs.categories?.message_edited || false} onChange={() => setLogs({ ...logs, categories: { ...logs.categories, message_edited: !logs.categories?.message_edited }})} />
                    <span className="text-xs text-neutral-400 flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil w-3 h-3"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>Edits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TailwindToggle checked={logs.categories?.message_deleted || false} onChange={() => setLogs({ ...logs, categories: { ...logs.categories, message_deleted: !logs.categories?.message_deleted, bulk_message_delete: !logs.categories?.message_deleted }})} />
                    <span className="text-xs text-neutral-400 flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 w-3 h-3"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1={10} x2={10} y1={11} y2={17} /><line x1={14} x2={14} y1={11} y2={17} /></svg>Deletes</span>
                  </div>
                </div>
              </div>
            </div>"""
    
    code = re.sub(
        r'\{/\*\s*Message Logs\s*\*/\}.*?(?=\{/\*\s*Member Logs\s*\*/\})',
        msg_logs + "\n            ",
        code,
        flags=re.DOTALL
    )

    # Member Logs
    member_logs = """{/* Member Logs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users w-4 h-4 text-emerald-400">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx={9} cy={7} r={4} />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Member Logs</span>
              </div>
              <div className="bg-neutral-800/50 rounded-xl border border-neutral-800 p-3 space-y-3">
                <div className="w-full">
                  <CustomSelect 
                    options={channelOptions} 
                    value={logs.channels?.member_joined || logs.channels?.member_left} 
                    onChange={(val) => setLogs({ ...logs, channels: { ...logs.channels, member_joined: val, member_left: val }})} 
                    placeholder="Select log channel..." 
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 px-1">
                  <div className="flex items-center gap-2">
                    <TailwindToggle checked={logs.categories?.member_joined || false} onChange={() => setLogs({ ...logs, categories: { ...logs.categories, member_joined: !logs.categories?.member_joined }})} />
                    <span className="text-xs text-neutral-400 flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-in w-3 h-3"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1={15} x2={3} y1={12} y2={12} /></svg>Joins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TailwindToggle checked={logs.categories?.member_left || false} onChange={() => setLogs({ ...logs, categories: { ...logs.categories, member_left: !logs.categories?.member_left }})} />
                    <span className="text-xs text-neutral-400 flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out w-3 h-3"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1={21} x2={9} y1={12} y2={12} /></svg>Leaves</span>
                  </div>
                </div>
              </div>
            </div>"""
            
    code = re.sub(
        r'\{/\*\s*Member Logs\s*\*/\}.*?(?=\{/\*\s*Voice Logs\s*\*/\})',
        member_logs + "\n            ",
        code,
        flags=re.DOTALL
    )

    # Voice Logs
    voice_logs = """{/* Voice Logs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic w-4 h-4 text-purple-400">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1={12} x2={12} y1={19} y2={22} />
                </svg>
                <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Voice Logs</span>
                <span className="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-[0_1px_2px_-0.5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-emerald-400 border-emerald-500/20 bg-gradient-to-b from-emerald-400/25 to-emerald-600/10 h-[19px] pl-[5px] pr-[6.5px] gap-[3px] rounded-[6px] text-[9.5px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-[9px] h-[9px]">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    <path d="M5 3v4" />
                    <path d="M19 17v4" />
                    <path d="M3 5h4" />
                    <path d="M17 19h4" />
                  </svg>
                  Starter
                </span>
              </div>
              <div className="bg-neutral-800/50 rounded-xl border border-neutral-800 p-3 space-y-3">
                <div className="w-full">
                  <CustomSelect 
                    options={channelOptions} 
                    value={logs.channels?.member_joined_voice} 
                    onChange={(val) => setLogs({ ...logs, channels: { ...logs.channels, member_joined_voice: val, member_left_voice: val, member_moved_voice: val }})} 
                    placeholder="Select log channel..." 
                  />
                </div>
                <div className="flex items-center gap-2 px-1">
                  <TailwindToggle checked={logs.categories?.member_joined_voice || false} onChange={() => setLogs({ ...logs, categories: { ...logs.categories, member_joined_voice: !logs.categories?.member_joined_voice, member_left_voice: !logs.categories?.member_joined_voice, member_moved_voice: !logs.categories?.member_joined_voice }})} />
                  <span className="text-xs text-neutral-400">Log Voice Activity</span>
                </div>
              </div>
            </div>"""

    code = re.sub(
        r'\{/\*\s*Voice Logs\s*\*/\}.*?(?=\{/\*\s*Mod Action Logs\s*\*/\})',
        voice_logs + "\n            ",
        code,
        flags=re.DOTALL
    )

    # Mod Action Logs
    mod_logs = """{/* Mod Action Logs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gavel w-4 h-4 text-red-400">
                  <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
                  <path d="m16 16 6-6" />
                  <path d="m8 8 6-6" />
                  <path d="m9 7 8 8" />
                  <path d="m21 11-8-8" />
                </svg>
                <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Mod Action Logs</span>
              </div>
              <div className="bg-neutral-800/50 rounded-xl border border-neutral-800 p-3">
                <div className="w-full">
                  <CustomSelect 
                    options={channelOptions} 
                    value={logs.channels?.moderation_action} 
                    onChange={(val) => setLogs({ ...logs, channels: { ...logs.channels, moderation_action: val }})} 
                    placeholder="Select log channel..." 
                  />
                </div>
                <div className="mt-3 px-1">
                  <span className="text-xs text-neutral-500">Warns, bans, kicks, timeouts & unbans</span>
                </div>
              </div>
            </div>"""

    code = re.sub(
        r'\{/\*\s*Mod Action Logs\s*\*/\}.*?(?=\{/\*\s*Ignored Channels\s*\*/\})',
        mod_logs + "\n            ",
        code,
        flags=re.DOTALL
    )

    # Ignored Channels
    ignored_logs = """{/* Ignored Channels */}
            <div className="col-span-1 lg:col-span-2 space-y-3 mt-2">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off w-4 h-4 text-neutral-500">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1={2} x2={22} y1={2} y2={22} />
                </svg>
                <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">Ignored Channels</span>
              </div>
              <div className="bg-neutral-800/50 rounded-xl border border-neutral-800 p-3">
                <CustomSelect 
                  options={channelOptions} 
                  value={logs.global_exempt_channels} 
                  onChange={(val) => setLogs({ ...logs, global_exempt_channels: val })} 
                  isMulti 
                  placeholder="Select channels to exclude..." 
                />
              </div>
            </div>"""

    code = re.sub(
        r'\{/\*\s*Ignored Channels\s*\*/\}.*?(?=</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</main>)',
        ignored_logs + "\n          ",
        code,
        flags=re.DOTALL
    )

    with open('Website/frontend/src/components/dashboard/Moderation.jsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print('Updated UI in Moderation.jsx')
except Exception as e:
    print('Failed:', e)
