import Toggle from '../../ui/Toggle';
import SaveBar from '../../ui/SaveBar';
import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';

export default function MessageLogsSettings({ config, channels, roles, onSave, saving, onReset }) {
  const mlCfg = config?.messagelogs || {};
  const [executorInLogs, setExecutorInLogs] = useState(mlCfg.executor_in_logs || false);
  const [exemptChannels, setExemptChannels] = useState((mlCfg.exempt_channels || []).map(String));
  const [exemptRoles, setExemptRoles] = useState((mlCfg.exempt_roles || []).map(String));

  const channelOptions = channels.map(c => ({ value: c.id, label: `# ${c.name}` }));
  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));

  const getPayload = () => ({
    messagelogs: {
      enabled: mlCfg.enabled || false,
      executor_in_logs: executorInLogs,
      exempt_channels: exemptChannels,
      exempt_roles: exemptRoles
    }
  });

  const [initialState, setInitialState] = React.useState(() => JSON.stringify(getPayload()));
  const currentPayloadStr = JSON.stringify(getPayload());
  const isDirty = Boolean(initialState && currentPayloadStr !== initialState);

  const handleSave = () => {
    onSave(getPayload(), true);
    setInitialState(currentPayloadStr);
  };

  const logCategories = [
    {
      title: 'Messages',
      events: ['Message Deleted', 'Message Edited', 'Bulk Messages Deleted']
    },
    {
      title: 'Members',
      events: ['Member Joined', 'Member Left', 'Member Banned', 'Member Kicked', 'Member Timeout']
    },
    {
      title: 'Server',
      events: ['Role Created', 'Role Deleted', 'Role Updated', 'Channel Created', 'Channel Deleted']
    },
    {
      title: 'Voice',
      events: ['Member Joined Voice', 'Member Left Voice', 'Member Moved']
    }
  ];

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5 w-full">
      <div data-tour="feature-header" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>
            <div>
              <h1 className="text-base font-medium text-white truncate">Audit & Message Logs</h1>
              <p className="text-xs text-neutral-400 mt-0.5">Track channel events, deleted messages, and moderator actions.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
        <h2 className="text-sm font-semibold text-white">General Logging Options</h2>

        <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
          <div>
            <label className="text-xs font-semibold text-white block">Executor in Logs</label>
            <span className="text-[11px] text-neutral-400">Display who initiated the action whenever available from Discord.</span>
          </div>
          <Toggle checked={executorInLogs} onChange={() => setExecutorInLogs(!executorInLogs)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white">Excluded Channels</label>
          <span className="text-[11px] text-neutral-400">Events inside these channels will not be recorded to logs.</span>
          <CustomSelect options={channelOptions} value={exemptChannels} onChange={setExemptChannels} isMulti={true} placeholder="Select Channels..." />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white">Excluded Roles</label>
          <span className="text-[11px] text-neutral-400">Actions taken by members with these roles will be ignored.</span>
          <CustomSelect options={roleOptions} value={exemptRoles} onChange={setExemptRoles} isMulti={true} placeholder="Select Roles..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logCategories.map((category, idx) => (
          <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider pb-2 border-b border-neutral-800/80">
              {category.title}
            </h3>
            <div className="flex flex-col gap-3">
              {category.events.map((event, eventIdx) => (
                <div key={eventIdx} className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-300">{event}</label>
                  <CustomSelect options={channelOptions} placeholder="Select Target Log Channel..." />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </main>
  );
}
