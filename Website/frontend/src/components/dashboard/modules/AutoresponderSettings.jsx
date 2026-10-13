import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';
import Toggle from '../../ui/Toggle';
import SaveBar from '../../ui/SaveBar';

export default function AutoresponderSettings({ config, channels, onSave, saving, onReset }) {
  const arCfg = config?.autoresponder || {};
  const isEnabled = config?.autoresponder_enabled ?? (config?.settings?.autoresponder_enabled ?? true);

  const initialTriggers = Object.keys(arCfg).map((trigger, i) => {
    const t = arCfg[trigger];
    return {
      id: Date.now() + i,
      trigger: trigger,
      reply: t.response || t.reply || '',
      exactMatch: t.exact_match || false,
      useAi: t.use_ai || false,
      channelId: t.channel_id || null
    };
  });

  const [enabled, setEnabled] = useState(isEnabled);
  const [triggers, setTriggers] = useState(initialTriggers);
  const [editingTrigger, setEditingTrigger] = useState(null);

  const handleSaveTrigger = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTrigger = {
      id: editingTrigger.id || Date.now(),
      trigger: formData.get('trigger'),
      reply: formData.get('reply'),
      exactMatch: formData.get('exactMatch') === 'on',
      useAi: formData.get('useAi') === 'on',
      channelId: editingTrigger.channelId || null
    };

    let newTriggers;
    if (editingTrigger.id) {
      newTriggers = triggers.map(t => t.id === newTrigger.id ? newTrigger : t);
    } else {
      newTriggers = [...triggers, newTrigger];
    }
    setTriggers(newTriggers);
    setEditingTrigger(null);
  };

  const handleDeleteTrigger = (id) => {
    const newTriggers = triggers.filter(t => t.id !== id);
    setTriggers(newTriggers);
    setEditingTrigger(null);
  };

  const getPayload = () => {
    const autoresponderDict = {};
    triggers.forEach(t => {
      autoresponderDict[t.trigger] = {
        response: t.reply,
        exact_match: t.exactMatch,
        channel_id: t.channelId,
        use_ai: t.useAi
      };
    });
    
    return {
      autoresponder_enabled: enabled,
      settings: {
        ...(config?.settings || {}),
        autoresponder_enabled: enabled
      },
      autoresponder: autoresponderDict
    };
  };

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
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <div>
              <h1 className="text-base font-medium text-white truncate">Auto Responder</h1>
              <p className="text-xs text-neutral-400 mt-0.5">Automatically reply to specific user messages or triggers in chat.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Master Toggle Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Enable Auto Responder</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Globally activate keyword trigger responses.</p>
        </div>
        <Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />
      </div>

      {/* Triggers Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Custom Triggers ({triggers.length})</h2>
            <p className="text-xs text-neutral-400 mt-0.5">When users type the keyword, Orbit will automatically respond.</p>
          </div>
          <button
            onClick={() => setEditingTrigger({})}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-colors"
          >
            + Add Trigger
          </button>
        </div>

        {triggers.length === 0 ? (
          <div className="p-8 text-center bg-neutral-950/50 rounded-xl border border-dashed border-neutral-800">
            <p className="text-sm text-neutral-500 mb-3">No auto-replies configured yet.</p>
            <button
              onClick={() => setEditingTrigger({})}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              + Create First Trigger
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {triggers.map(t => (
              <div key={t.id} className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white truncate">"{t.trigger}"</span>
                    {t.exactMatch && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Exact</span>}
                    {t.useAi && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">AI Context</span>}
                  </div>
                  <p className="text-xs text-neutral-400 truncate">Replies: <span className="text-neutral-300">"{t.reply}"</span></p>
                </div>
                <button
                  onClick={() => setEditingTrigger(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingTrigger && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingTrigger(null)}>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-semibold text-white">{editingTrigger.id ? 'Edit Trigger' : 'New Trigger'}</h3>
              <button onClick={() => setEditingTrigger(null)} className="text-neutral-400 hover:text-white text-lg leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSaveTrigger} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-300">Trigger Phrase / Keyword</label>
                <input
                  type="text"
                  name="trigger"
                  className="h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700"
                  defaultValue={editingTrigger.trigger}
                  required
                  placeholder="e.g. !help, rules, ip"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-300">Bot Reply</label>
                <textarea
                  name="reply"
                  rows="3"
                  className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-neutral-700 resize-y"
                  defaultValue={editingTrigger.reply}
                  required
                  placeholder="e.g. Check out our website at https://example.com"
                ></textarea>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-neutral-800/60">
                <div>
                  <span className="text-xs font-medium text-neutral-300 block">Exact Match Only</span>
                  <span className="text-[11px] text-neutral-500">Only trigger if the user's message is an exact match.</span>
                </div>
                <input type="checkbox" name="exactMatch" defaultChecked={editingTrigger.exactMatch} className="rounded border-neutral-700 bg-neutral-800 text-white focus:ring-0 w-4 h-4" />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-neutral-800/60">
                <div>
                  <span className="text-xs font-medium text-neutral-300 block">Smart AI Detection</span>
                  <span className="text-[11px] text-neutral-500">Use AI to recognize intent rather than strict keywords.</span>
                </div>
                <input type="checkbox" name="useAi" defaultChecked={editingTrigger.useAi} className="rounded border-neutral-700 bg-neutral-800 text-white focus:ring-0 w-4 h-4" />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                {editingTrigger.id ? (
                  <button type="button" className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors" onClick={() => handleDeleteTrigger(editingTrigger.id)}>Delete</button>
                ) : <div />}
                <button type="submit" className="h-9 px-4 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-colors">Save Trigger</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </main>
  );
}
