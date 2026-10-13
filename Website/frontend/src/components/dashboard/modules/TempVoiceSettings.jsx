import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';
import Toggle from '../../ui/Toggle';
import SaveBar from '../../ui/SaveBar';

export default function TempVoiceSettings({ config, voiceChannels, categories, onSave, saving, onReset }) {
  const tvCfg = config?.tempvoice || {};

  const [enabled, setEnabled] = useState(tvCfg.enabled !== false);
  const [hubs, setHubs] = useState(
    (tvCfg.hubs || []).map((h) => ({
      hub_channel_id: String(h.hub_channel_id || ''),
      category_id: String(h.category_id || ''),
      default_user_limit: h.default_user_limit || 0
    }))
  );

  const categoryOptions = (categories || []).map(c => ({ value: c.id, label: c.name }));
  const voiceChannelOptions = (voiceChannels || []).map(c => ({ value: c.id, label: `🔊 ${c.name}` }));

  const updateHub = (index, key, value) => {
    setHubs(prev => prev.map((h, i) => i === index ? { ...h, [key]: value } : h));
  };

  const getPayload = () => ({
    tempvoice: {
      enabled,
      hubs: hubs.filter(h => h.hub_channel_id)
    }
  });

  const [initialState, setInitialState] = React.useState(() => JSON.stringify(getPayload()));
  const currentPayloadStr = JSON.stringify(getPayload());
  const isDirty = Boolean(initialState && currentPayloadStr !== initialState);

  const handleSave = () => {
    onSave(getPayload(), true);
    setInitialState(currentPayloadStr);
  };

  return (
    <main className="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto flex flex-col gap-5 w-full">
      <div data-tour="feature-header" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2c-1.7 0-3 1.2-3 2.6v6.8c0 1.4 1.3 2.6 3 2.6s3-1.2 3-2.6V4.6C15 3.2 13.7 2 12 2z" />
                <path d="M19 10v1.6c0 3.6-3.1 6.4-7 6.4s-7-2.8-7-6.4V10" />
                <path d="M12 18v4" />
                <path d="M8 22h8" />
              </svg>
            </span>
            <div>
              <h1 className="text-base font-medium text-white truncate">Temporary Voice Channels</h1>
              <p className="text-xs text-neutral-400 mt-0.5">Allow users to automatically generate private voice rooms on join.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Master Toggle Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Enable Temp Voice</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Activate temporary voice channel creation on this server.</p>
        </div>
        <Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />
      </div>

      {/* Hubs Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Voice Hubs ({hubs.length})</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Configure creator channels and parent categories for auto-created rooms.</p>
          </div>
          <button
            onClick={() => setHubs([...hubs, { hub_channel_id: '', category_id: '', default_user_limit: 0 }])}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-colors"
          >
            + Add Hub
          </button>
        </div>

        {hubs.length === 0 ? (
          <div className="p-8 text-center bg-neutral-950/50 rounded-xl border border-dashed border-neutral-800">
            <p className="text-sm text-neutral-500 mb-3">No voice hubs configured yet.</p>
            <button
              onClick={() => setHubs([...hubs, { hub_channel_id: '', category_id: '', default_user_limit: 0 }])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              + Create First Hub
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {hubs.map((hub, i) => (
              <div key={i} className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Voice Hub #{i + 1}</span>
                  <button
                    onClick={() => setHubs(hubs.filter((_, idx) => idx !== i))}
                    className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete Hub
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-300">Creator Channel (Generator)</label>
                    <CustomSelect
                      options={voiceChannelOptions}
                      value={hub.hub_channel_id}
                      onChange={v => updateHub(i, 'hub_channel_id', v)}
                      placeholder="Select Voice Channel..."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-300">Target Category</label>
                    <CustomSelect
                      options={categoryOptions}
                      value={hub.category_id}
                      onChange={v => updateHub(i, 'category_id', v)}
                      placeholder="Select Category..."
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 max-w-xs">
                  <label className="text-xs font-medium text-neutral-300">Default User Limit (0 for unlimited)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    className="h-9 px-3 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700"
                    value={hub.default_user_limit}
                    onChange={e => updateHub(i, 'default_user_limit', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </main>
  );
}
