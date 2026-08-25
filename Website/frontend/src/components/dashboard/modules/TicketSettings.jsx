import React, { useState, useEffect } from 'react';
import CustomSelect from '../../ui/CustomSelect';
import Toggle from '../../ui/Toggle';

export default function TicketSettings({ config, channels, roles, categories, onSave, saving, onReset }) {
  const tCfg = config?.ticket || {};

  const [ticketEnabled, setTicketEnabled] = useState(tCfg.enabled || false);
  const [panelTitle, setPanelTitle] = useState(tCfg.panel_title || 'Support Tickets');
  const [panelDesc, setPanelDesc] = useState(tCfg.panel_description || '');
  const [panelInstructions, setPanelInstructions] = useState(tCfg.panel_instructions || '');
  const [panelChannel, setPanelChannel] = useState(tCfg.panel_channel_id || '');
  const [logChannel, setLogChannel] = useState(tCfg.log_channel_id || '');

  const [autoCloseEnabled, setAutoCloseEnabled] = useState(tCfg.auto_close_time_enabled || false);
  const [autoCloseHours, setAutoCloseHours] = useState(tCfg.auto_close_time_hours || 24);
  const [maxOpenTickets, setMaxOpenTickets] = useState(tCfg.max_open_tickets || 3);

  const [ticketOptions, setTicketOptions] = useState(
    (tCfg.options_slots || []).map((s, i) => ({
      id: i + 1,
      name: s.name || 'Option',
      role_id: s.role_id || '',
      category_id: s.category_id || ''
    }))
  );
  const [editingOption, setEditingOption] = useState(null);

  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));
  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));
  const categoryOptions = (categories || []).map(c => ({ value: c.id, label: c.name }));

  const handleSaveOption = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newOpt = {
      id: editingOption.id || Date.now(),
      name: formData.get('label'),
      role_id: formData.get('role') || '',
      category_id: formData.get('category') || ''
    };

    if (editingOption.id) {
      setTicketOptions(ticketOptions.map(opt => opt.id === newOpt.id ? newOpt : opt));
    } else {
      setTicketOptions([...ticketOptions, newOpt]);
    }
    setEditingOption(null);
  };

  const handleDeleteOption = (id) => {
    setTicketOptions(ticketOptions.filter(opt => opt.id !== id));
    setEditingOption(null);
  };

  const getPayload = () => ({
    ticket: {
      enabled: ticketEnabled,
      panel_title: panelTitle,
      panel_description: panelDesc,
      panel_instructions: panelInstructions,
      panel_channel_id: panelChannel,
      log_channel_id: logChannel,
      auto_close_time_enabled: autoCloseEnabled,
      auto_close_time_hours: parseInt(autoCloseHours) || 24,
      max_open_tickets: parseInt(maxOpenTickets) || 3,
      options_slots: ticketOptions.map(o => ({
        name: o.name,
        role_id: o.role_id,
        category_id: o.category_id
      }))
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
      onSave(getPayload(), true);
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [currentPayloadStr, initialStateStr, isDirty, onSave]);

  const handleSave = () => {
    onSave(getPayload());
  };

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5">
      <div data-tour="feature-header" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ticket w-5 h-5">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
              </svg>
            </span>
            <h1 className="text-base font-medium text-white truncate">
              Support Tickets
            </h1>
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-col gap-5">
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0 bg-emerald-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-power w-6 h-6 text-emerald-400">
                  <path d="M12 2v10" />
                  <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white mb-1">
                  Enable Support Tickets
                </h1>
                <p className="text-sm text-neutral-400">
                  Allow users to open support tickets via a panel on this server.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3" data-tour="feature-toggle">
              <Toggle checked={ticketEnabled} onChange={() => setTicketEnabled(!ticketEnabled)} />
            </div>
          </div>
        </div>

        <div className={`flex flex-col gap-6 transition-opacity duration-300 ${!ticketEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-blue-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings w-4 h-4 text-blue-400">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate">Panel Configuration</span>
                <span className="text-[11px] text-neutral-500 truncate">Configure where and how the ticket panel appears.</span>
              </div>
            </div>
          </div>
          
          <div className="px-5 pb-5 pt-5 border-t border-neutral-800 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-neutral-300">Ticket Panel Title</label>
              <span className="text-xs text-neutral-500">The main title of the embed sent in the ticket panel channel.</span>
              <textarea 
                rows="1" 
                className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-neutral-500 transition-colors w-full"
                value={panelTitle} 
                onChange={e => setPanelTitle(e.target.value)} 
                placeholder="e.g. Support Ticket Desk" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-neutral-300">Ticket Panel Description</label>
              <span className="text-xs text-neutral-500">The description text of the embed.</span>
              <textarea 
                rows="3" 
                className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-neutral-500 transition-colors w-full"
                value={panelDesc} 
                onChange={e => setPanelDesc(e.target.value)} 
                placeholder="Click the button below to open a direct support channel with our team." 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-neutral-300">Panel Instructions</label>
              <span className="text-xs text-neutral-500">Instructions shown to the user after opening a ticket.</span>
              <textarea 
                rows="3" 
                className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-neutral-500 transition-colors w-full"
                value={panelInstructions} 
                onChange={e => setPanelInstructions(e.target.value)} 
                placeholder="Please describe your issue..." 
              />
            </div>

            <div className="flex flex-col gap-2 relative z-50">
              <label className="text-[13px] font-medium text-neutral-300">Panel Channel</label>
              <span className="text-xs text-neutral-500">The channel where the panel embed will be sent.</span>
              <div className="w-full">
                <CustomSelect options={channelOptions} value={panelChannel} onChange={setPanelChannel} placeholder="Select Channel..." />
              </div>
            </div>

            <div className="flex flex-col gap-2 relative z-40">
              <label className="text-[13px] font-medium text-neutral-300">Log Channel</label>
              <span className="text-xs text-neutral-500">The channel where ticket transcripts/logs will be sent.</span>
              <div className="w-full">
                <CustomSelect options={channelOptions} value={logChannel} onChange={setLogChannel} placeholder="Select Channel..." />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-blue-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal w-4 h-4 text-blue-400">
                  <line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate">Ticket Behavior</span>
                <span className="text-[11px] text-neutral-500 truncate">Configure limits and automatic actions for tickets.</span>
              </div>
            </div>
          </div>
          
          <div className="px-5 pb-5 pt-5 border-t border-neutral-800 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-neutral-800/20 border border-neutral-800/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-amber-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer w-4 h-4 text-amber-400">
                      <line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-white">Auto-close time</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                      STARTER
                    </span>
                  </div>
                </div>
                <Toggle checked={autoCloseEnabled} onChange={() => setAutoCloseEnabled(!autoCloseEnabled)} />
              </div>
              
              {autoCloseEnabled && (
                <div className="pl-14 flex items-center gap-3">
                  <span className="text-[13px] text-neutral-400">Close inactive tickets after</span>
                  <input 
                    type="number"
                    min="1"
                    max="720"
                    className="w-20 bg-neutral-800/50 border border-neutral-700/50 rounded-lg px-3 py-1.5 text-[13px] text-white focus:outline-none focus:border-neutral-500 transition-colors"
                    value={autoCloseHours}
                    onChange={e => setAutoCloseHours(e.target.value)}
                  />
                  <span className="text-[13px] text-neutral-400">hours</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-neutral-800/20 border border-neutral-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-blue-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users w-4 h-4 text-blue-400">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <span className="text-[13px] font-medium text-white">Maximum open tickets per user</span>
              </div>
              <input 
                type="number"
                min="1"
                max="10"
                className="w-20 bg-neutral-800/50 border border-neutral-700/50 rounded-lg px-3 py-1.5 text-[13px] text-white focus:outline-none focus:border-neutral-500 transition-colors text-center"
                value={maxOpenTickets}
                onChange={e => setMaxOpenTickets(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-purple-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-plus w-4 h-4 text-purple-400">
                  <path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="M18 9v6"/><path d="M21 12h-6"/>
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate">Ticket Categories</span>
                <span className="text-[11px] text-neutral-500 truncate">Configure options users can select when opening a ticket.</span>
              </div>
            </div>
            <button 
              onClick={() => setEditingOption({})} 
              className="inline-flex items-center justify-center gap-2 h-8 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/50 text-[13px] font-medium text-white transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              Add Option
            </button>
          </div>

          <div className="px-5 pb-5 pt-5 border-t border-neutral-800 flex flex-col gap-4">
            {ticketOptions.length === 0 ? (
              <div className="flex items-center justify-center h-24 border border-dashed border-neutral-700/50 rounded-xl bg-neutral-800/20">
                <span className="text-[13px] text-neutral-500">No ticket options. Add one to let users choose a category.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {ticketOptions.map(opt => (
                  <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-700/50 bg-neutral-800/20">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-white">{opt.name}</span>
                      <span className="text-[11px] text-neutral-500">Role: {opt.role_id ? `@${roles.find(r => r.id === opt.role_id)?.name || opt.role_id}` : 'None'}</span>
                    </div>
                    <button 
                      onClick={() => setEditingOption(opt)}
                      className="h-8 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/50 text-[13px] font-medium text-white transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {editingOption && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setEditingOption(null)}>
          <div className="w-full max-w-[440px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-neutral-800 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-white">{editingOption.id ? 'Edit Option' : 'New Option'}</h3>
              <button className="text-neutral-500 hover:text-white transition-colors" onClick={() => setEditingOption(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveOption} className="flex flex-col p-5 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-neutral-300">Option Name</label>
                <input 
                  type="text" 
                  name="label" 
                  className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-neutral-500 transition-colors w-full" 
                  defaultValue={editingOption.name} 
                  required 
                  placeholder="e.g. General Support" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-neutral-300">Support Role</label>
                <CustomSelect 
                  options={[{ value: '', label: 'None' }, ...roleOptions]}
                  value={editingOption.role_id || ''}
                  onChange={(val) => setEditingOption({ ...editingOption, role_id: val })}
                  name="role"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-neutral-300">Category</label>
                <CustomSelect 
                  options={[{ value: '', label: 'None' }, ...categoryOptions]}
                  value={editingOption.category_id || ''}
                  onChange={(val) => setEditingOption({ ...editingOption, category_id: val })}
                  name="category"
                />
              </div>

              <div className="flex items-center justify-between gap-4 mt-2">
                {editingOption.id ? (
                  <button type="button" className="h-9 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[13px] font-medium transition-colors" onClick={() => handleDeleteOption(editingOption.id)}>Delete</button>
                ) : <div />}
                <button type="submit" className="h-9 px-4 rounded-lg bg-white hover:bg-neutral-200 text-black text-[13px] font-medium transition-colors">Save Option</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </main>
  );
}
