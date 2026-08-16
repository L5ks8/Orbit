import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function TicketSettings() {
  const [globalEnabled, setGlobalEnabled] = useState(true);

  const channelOptions = [
    { value: '1', label: '# support' },
    { value: '2', label: '# open-ticket' },
    { value: '3', label: '# ticket-logs' },
  ];
  
  const roleOptions = [
    { value: '1', label: '@ Admin', color: '#e74c3c' },
    { value: '2', label: '@ Moderator', color: '#3498db' },
  ];
  
  const [panelChannel, setPanelChannel] = useState('');
  const [logChannel, setLogChannel] = useState('');

  const [ticketOptions, setTicketOptions] = useState([
    { id: 1, label: 'General Support', description: 'Help with general inquiries.', emoji: '🎫', role: '2' }
  ]);

  const [editingOption, setEditingOption] = useState(null);

  const handleSaveOption = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newOpt = {
      id: editingOption.id || Date.now(),
      label: formData.get('label'),
      description: formData.get('description'),
      emoji: formData.get('emoji'),
      role: formData.get('role'),
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

      <div style={{ marginBottom: '32px' }}>
        <button className="dash-btn primary">Send Panel to Channel</button>
      </div>

      <div className="dash-card settings-card" style={{ marginBottom: '24px' }}>
        <div className="settings-form">
          <div className="form-group">
            <label>Ticket Panel Title</label>
            <span className="form-hint">The main title of the embed sent in the ticket panel channel.</span>
            <input type="text" className="dash-input" placeholder="e.g. Support Ticket Desk" defaultValue="Support Tickets" />
          </div>

          <div className="form-group">
            <label>Ticket Panel Description</label>
            <span className="form-hint">The description text of the embed.</span>
            <textarea className="dash-input" rows="3" placeholder="Click the button below to open a direct support channel with our team."></textarea>
          </div>

          <div className="form-group">
            <label>Ticket Panel Instructions</label>
            <span className="form-hint">The instructions text displayed below the divider.</span>
            <textarea className="dash-input" rows="2" placeholder="Select your desired inquiry category in the dropdown menu below, then click Create Ticket to open your private channel."></textarea>
          </div>

          <div className="form-group">
            <label>Ticket Panel Channel</label>
            <span className="form-hint">Select the channel where the "Open Ticket" button should be sent.</span>
            <CustomSelect 
              options={channelOptions}
              value={panelChannel}
              onChange={setPanelChannel}
              placeholder="Select a channel..."
            />
          </div>

          <div className="form-group">
            <label>Ticket Log Channel</label>
            <span className="form-hint">Where should ticket transcripts and logs be saved when closed?</span>
            <CustomSelect 
              options={channelOptions}
              value={logChannel}
              onChange={setLogChannel}
              placeholder="Select a channel..."
            />
          </div>
        </div>
      </div>

      <div className="settings-title-row" style={{ justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Ticket Options Builder</h3>
          <p className="form-hint" style={{ margin: 0 }}>Create multiple ticket categories (e.g. General Support, Bug Report). Users will choose from these before opening a ticket.</p>
        </div>
        <button className="dash-btn secondary" onClick={() => setEditingOption({})}>+ Add Option</button>
      </div>

      <div className="dash-card settings-card">
        <div className="settings-form">
          {ticketOptions.length === 0 ? (
            <div className="dash-custom-select-empty" style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              No ticket options configured. Click "Add Option" to create one.
            </div>
          ) : (
            ticketOptions.map(opt => {
              const roleInfo = roleOptions.find(r => r.value === opt.role);
              return (
                <div key={opt.id} className="form-group inline" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="form-text">
                    <label>{opt.label}</label>
                    <span className="form-hint">Emoji: {opt.emoji || 'None'} • Support Role: {roleInfo ? roleInfo.label : 'None'}</span>
                  </div>
                  <button className="dash-btn secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setEditingOption(opt)}>Edit</button>
                </div>
              );
            })
          )}
        </div>
        
        <div className="settings-footer">
          <button className="dash-btn primary">Save Changes</button>
          <button className="dash-btn secondary">Discard</button>
        </div>
      </div>

      {editingOption && (
        <div className="dash-modal-overlay" onClick={() => setEditingOption(null)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">{editingOption.id ? 'Edit Ticket Option' : 'New Ticket Option'}</h3>
              <button className="dash-modal-close" onClick={() => setEditingOption(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveOption}>
              <div className="settings-form">
                <div className="form-group">
                  <label>Label</label>
                  <input type="text" name="label" className="dash-input" defaultValue={editingOption.label} required placeholder="e.g. Bug Report" />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" name="description" className="dash-input" defaultValue={editingOption.description} placeholder="e.g. Report a bug you found." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Emoji</label>
                    <input type="text" name="emoji" className="dash-input" defaultValue={editingOption.emoji} placeholder="e.g. 🐛" />
                  </div>
                  
                  <div className="form-group">
                    <label>Support Role</label>
                    <CustomSelect 
                      name="role"
                      options={roleOptions}
                      value={editingOption.role}
                      onChange={(val) => setEditingOption({...editingOption, role: val})}
                      placeholder="Select a role..."
                    />
                  </div>
                </div>
              </div>

              <div className="settings-footer" style={{ marginTop: '32px', paddingTop: '20px', justifyContent: 'space-between' }}>
                {editingOption.id ? (
                  <button type="button" className="dash-btn secondary" style={{ color: '#ef4444' }} onClick={() => handleDeleteOption(editingOption.id)}>Delete</button>
                ) : <div></div>}
                <button type="submit" className="dash-btn primary">Save Option</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
