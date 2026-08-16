import SaveBar from '../../ui/SaveBar';
import React, { useState } from 'react';
import CustomSelect from '../../ui/CustomSelect';

export default function TicketSettings({ config, channels, roles, categories, onSave, saving, onReset }) {
  const tCfg = config?.ticket || {};

    const [panelTitle, setPanelTitle] = useState(tCfg.panel_title || 'Support Tickets');
  const [panelDesc, setPanelDesc] = useState(tCfg.panel_description || '');
  const [panelInstructions, setPanelInstructions] = useState(tCfg.panel_instructions || '');
  const [panelChannel, setPanelChannel] = useState(tCfg.panel_channel_id || '');
  const [logChannel, setLogChannel] = useState(tCfg.log_channel_id || '');

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
        enabled: tCfg.enabled || false,
        panel_title: panelTitle,
        panel_description: panelDesc,
        panel_instructions: panelInstructions,
        panel_channel_id: panelChannel,
        log_channel_id: logChannel,
        options_slots: ticketOptions.map(o => ({
          name: o.name,
          role_id: o.role_id,
          category_id: o.category_id
        }))
      }
    });

  const [initialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  const handleSave = () => {
    onSave(getPayload());
  };

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Ticket System</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Configure support tickets and send the ticket panel to a channel.</p>
          </div>
                  </div>
      </div>

      <div className="dash-card settings-card" style={{ marginBottom: '24px' }}>
        <div className="settings-form">
          <div className="form-group">
            <label>Ticket Panel Title</label>
            <span className="form-hint">The main title of the embed sent in the ticket panel channel.</span>
            <input type="text" className="dash-input" value={panelTitle} onChange={e => setPanelTitle(e.target.value)} placeholder="e.g. Support Ticket Desk" />
          </div>

          <div className="form-group">
            <label>Ticket Panel Description</label>
            <span className="form-hint">The description text of the embed.</span>
            <textarea className="dash-input" rows="3" value={panelDesc} onChange={e => setPanelDesc(e.target.value)} placeholder="Click the button below to open a direct support channel with our team."></textarea>
          </div>

          <div className="form-group">
            <label>Panel Instructions</label>
            <span className="form-hint">Instructions shown to the user after opening a ticket.</span>
            <textarea className="dash-input" rows="3" value={panelInstructions} onChange={e => setPanelInstructions(e.target.value)} placeholder="Please describe your issue..."></textarea>
          </div>

          <div className="form-group">
            <label>Panel Channel</label>
            <span className="form-hint">The channel where the panel embed will be sent.</span>
            <CustomSelect options={channelOptions} value={panelChannel} onChange={setPanelChannel} placeholder="Select Channel..." />
          </div>

          <div className="form-group">
            <label>Log Channel</label>
            <span className="form-hint">The channel where ticket transcripts/logs will be sent.</span>
            <CustomSelect options={channelOptions} value={logChannel} onChange={setLogChannel} placeholder="Select Channel..." />
          </div>
        </div>
      </div>

      <div className="settings-title-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 0 }}>Ticket Options</h3>
        <button className="dash-btn secondary" onClick={() => setEditingOption({})}>+ Add Option</button>
      </div>

      <div className="dash-card settings-card">
        <div className="settings-form">
          {ticketOptions.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#949BA4', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              No ticket options. Add one to let users choose a category.
            </div>
          ) : (
            ticketOptions.map(opt => (
              <div key={opt.id} className="form-group inline" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="form-text">
                  <label>{opt.name}</label>
                  <span className="form-hint">Role: {opt.role_id || 'None'}</span>
                </div>
                <button className="dash-btn secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setEditingOption(opt)}>Edit</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        
      </div>

      {editingOption && (
        <div className="dash-modal-overlay" onClick={() => setEditingOption(null)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">{editingOption.id ? 'Edit Option' : 'New Option'}</h3>
              <button className="dash-modal-close" onClick={() => setEditingOption(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveOption}>
              <div className="settings-form">
                <div className="form-group">
                  <label>Option Name</label>
                  <input type="text" name="label" className="dash-input" defaultValue={editingOption.name} required placeholder="e.g. General Support" />
                </div>
                <div className="form-group">
                  <label>Support Role</label>
                  <select name="role" className="dash-input" defaultValue={editingOption.role_id}>
                    <option value="">None</option>
                    {roles.map(r => <option key={r.id} value={r.id}>@ {r.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" className="dash-input" defaultValue={editingOption.category_id}>
                    <option value="">None</option>
                    {(categories || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="settings-footer" style={{ marginTop: '24px', justifyContent: 'space-between' }}>
                {editingOption.id ? (
                  <button type="button" className="dash-btn secondary" style={{ color: '#ef4444' }} onClick={() => handleDeleteOption(editingOption.id)}>Delete</button>
                ) : <div></div>}
                <button type="submit" className="dash-btn primary">Save Option</button>
              </div>
            </form>
          </div>
        </div>
      )}
    
      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />
    </div>
  );
}
