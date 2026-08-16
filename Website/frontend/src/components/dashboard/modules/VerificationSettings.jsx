import React, { useState } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';

export default function VerificationSettings({ config, roles, onSave, saving }) {
  const vCfg = config?.verify || {};

  const [enabled, setEnabled] = useState(vCfg.enabled || false);
  const [verType, setVerType] = useState(vCfg.verification_type || 'captcha');
  const [roleId, setRoleId] = useState(vCfg.role_id || '');
  const [removeRoleId, setRemoveRoleId] = useState(vCfg.remove_role_id || '');
  const [timeoutAction, setTimeoutAction] = useState(vCfg.timeout_action || 'none');
  const [timeoutMinutes, setTimeoutMinutes] = useState(vCfg.timeout_minutes || 0);
  const [embedTitle, setEmbedTitle] = useState(vCfg.embed_title || '');
  const [embedDesc, setEmbedDesc] = useState(vCfg.embed_description || '');
  const [embedColor, setEmbedColor] = useState(vCfg.embed_color || '#5865F2');
  const [embedImage, setEmbedImage] = useState(vCfg.embed_image || '');

  const roleOptions = roles.map(r => ({ value: r.id, label: `@ ${r.name}`, color: r.color }));

  const handleSave = () => {
    onSave({
      verify: {
        enabled,
        verification_type: verType,
        role_id: roleId,
        remove_role_id: removeRoleId,
        timeout_action: timeoutAction,
        timeout_minutes: timeoutMinutes,
        embed_title: embedTitle,
        embed_description: embedDesc,
        embed_color: embedColor,
        embed_image: embedImage
      }
    });
  };

  return (
    <div className="dash-settings-module">
      <div className="dash-settings-header">
        <div className="settings-title-row">
          <div>
            <h1 className="dash-title">Verification</h1>
            <p className="dash-subtitle" style={{ marginBottom: 0 }}>Require users to solve a CAPTCHA or click to verify before accessing channels.</p>
          </div>
          <Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <div className="form-group">
            <label style={{ color: '#fff' }}>Verification Mode</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Choose how users verify. One-Click is faster, CAPTCHA is more secure.</span>
            <CustomSelect 
              options={[
                { value: 'web_captcha', label: 'Web CAPTCHA (Browser)' },
                { value: 'captcha', label: 'Discord CAPTCHA (Image)' },
                { value: 'oneclick', label: 'One-Click (Instant Verify)' }
              ]} 
              value={verType}
              onChange={setVerType}
              placeholder="Select Mode..." 
            />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Verified Role (Add)</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>The role granted upon successful verification.</span>
            <CustomSelect options={roleOptions} value={roleId} onChange={setRoleId} placeholder="Select role..." />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Unverified Role (Remove)</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Optional: A role that is REMOVED when the user verifies.</span>
            <CustomSelect options={roleOptions} value={removeRoleId} onChange={setRemoveRoleId} placeholder="Select role..." />
          </div>

          <div className="form-group">
            <label style={{ color: '#fff' }}>Timeout Penalty</label>
            <span className="form-hint" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Action to take if the user fails to verify within a specific timeframe.</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <CustomSelect 
                  options={[
                    { value: 'none', label: 'None (Stay in server)' },
                    { value: 'kick', label: 'Kick User' },
                    { value: 'ban', label: 'Ban User' }
                  ]} 
                  value={timeoutAction}
                  onChange={setTimeoutAction}
                  placeholder="Select Penalty..." 
                />
              </div>
              <input type="number" className="dash-input" value={timeoutMinutes} onChange={e => setTimeoutMinutes(parseInt(e.target.value) || 0)} placeholder="Minutes" style={{ width: '100px' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="dash-card settings-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Verification Panel</h3>
        <p className="form-hint" style={{ fontSize: '12px', marginBottom: '20px' }}>Design the embed that users will see when they need to verify.</p>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="color" value={embedColor} onChange={e => setEmbedColor(e.target.value)} style={{ width: '44px', height: '38px', borderRadius: '4px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }} />
              <input type="text" className="dash-input" value={embedColor} onChange={e => setEmbedColor(e.target.value)} style={{ width: '100px' }} />
            </div>
            <input type="text" className="dash-input" value={embedTitle} onChange={e => setEmbedTitle(e.target.value)} placeholder="Embed Title" />
            <textarea className="dash-input" rows="3" value={embedDesc} onChange={e => setEmbedDesc(e.target.value)} placeholder="Embed Description"></textarea>
            <input type="text" className="dash-input" value={embedImage} onChange={e => setEmbedImage(e.target.value)} placeholder="Embed Image URL" />
          </div>

          {/* Preview */}
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ color: '#fff', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Preview</label>
            <div style={{ background: '#2B2D31', borderRadius: '4px', borderLeft: `4px solid ${embedColor}`, padding: '16px', maxWidth: '432px' }}>
              {embedTitle && <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>{embedTitle}</div>}
              {embedDesc && <div style={{ color: '#DBDEE1', fontSize: '13.5px', whiteSpace: 'pre-wrap' }}>{embedDesc}</div>}
              {embedImage && <img src={embedImage} style={{ width: '100%', borderRadius: '4px', marginTop: '12px' }} alt="" onError={e => e.target.style.display = 'none'} />}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <button className="dash-btn primary" style={{ width: '100%', padding: '12px' }} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Verification Settings'}</button>
      </div>
    </div>
  );
}
