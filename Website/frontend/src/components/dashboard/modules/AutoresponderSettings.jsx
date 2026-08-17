import SaveBar from '../../ui/SaveBar';
import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';

export default function AutoresponderSettings({ config, channels, onSave, saving, onReset }) {
  const arCfg = config?.autoresponder || {};
  
  // Convert dictionary { "trigger": { response: "reply", exact_match: true } } to array
  const initialTriggers = Object.keys(arCfg).map((trigger, i) => {
    const t = arCfg[trigger];
    return {
      id: Date.now() + i, // Generate unique ID
      trigger: trigger,
      reply: t.response || t.reply || '', // Support both "response" (backend) and "reply"
      exactMatch: t.exact_match || false,
      useAi: t.use_ai || false,
      channelId: t.channel_id || null
    };
  });

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
      // Use trigger as key, as expected by the Python backend
      autoresponderDict[t.trigger] = {
        response: t.reply, // Backend uses "response"
        exact_match: t.exactMatch,
        channel_id: t.channelId,
        use_ai: t.useAi
      };
    });
    
    return {
      autoresponder: autoresponderDict
    };
  };

  const [initialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  const handleSave = () => {
    onSave(getPayload());
  };

  return (
    <div className="dash-settings-module">


      <div className="settings-title-row" style={{ justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Triggers</h3>
        </div>
        <button className="dash-btn secondary" onClick={() => setEditingTrigger({})}>+ Add Trigger</button>
      </div>

      <div className="dash-card settings-card">
        <div className="settings-form">
          {triggers.length === 0 ? (
            <div className="dash-custom-select-empty" style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              No auto-replies configured. Click "Add Trigger" to create one.
            </div>
          ) : (
            triggers.map(t => (
              <div key={t.id} className="form-group inline" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="form-text">
                  <label>"{t.trigger}"</label>
                  <span className="form-hint">Replies: "{t.reply}" • Exact Match: {t.exactMatch ? 'Yes' : 'No'} • AI Context: {t.useAi ? 'Yes' : 'No'}</span>
                </div>
                <button className="dash-btn secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setEditingTrigger(t)}>Edit</button>
              </div>
            ))
          )}
        </div>
      </div>

      {editingTrigger && (
        <div className="dash-modal-overlay" onClick={() => setEditingTrigger(null)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">{editingTrigger.id ? 'Edit Trigger' : 'New Trigger'}</h3>
              <button className="dash-modal-close" onClick={() => setEditingTrigger(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveTrigger}>
              <div className="settings-form">
                <div className="form-group">
                  <label>Trigger Phrase</label>
                  <input type="text" name="trigger" className="dash-input" defaultValue={editingTrigger.trigger} required placeholder="e.g. hi bot" />
                </div>
                
                <div className="form-group">
                  <label>Bot Reply</label>
                  <textarea name="reply" className="dash-input" rows="3" defaultValue={editingTrigger.reply} required placeholder="e.g. Hello there!"></textarea>
                </div>

                <div className="form-group inline">
                  <div className="form-text">
                    <label>Exact Match Only</label>
                    <span className="form-hint">If enabled, the bot will only reply if the message is exactly the trigger phrase.</span>
                  </div>
                  <input type="checkbox" name="exactMatch" defaultChecked={editingTrigger.exactMatch} style={{ width: 'auto' }} />
                </div>

                <div className="form-group inline" style={{ marginTop: '16px' }}>
                  <div className="form-text">
                    <label>Smart AI Context (Requires ChatGPT)</label>
                    <span className="form-hint">Use AI to detect if the user's message matches the context of the trigger, rather than a dumb text search.</span>
                  </div>
                  <input type="checkbox" name="useAi" defaultChecked={editingTrigger.useAi} style={{ width: 'auto' }} />
                </div>
              </div>

              <div className="settings-footer" style={{ marginTop: '32px', paddingTop: '20px', justifyContent: 'space-between' }}>
                {editingTrigger.id ? (
                  <button type="button" className="dash-btn secondary" style={{ color: '#ef4444' }} onClick={() => handleDeleteTrigger(editingTrigger.id)}>Delete</button>
                ) : <div></div>}
                <button type="submit" className="dash-btn primary">Save Trigger</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </div>
  );
}
