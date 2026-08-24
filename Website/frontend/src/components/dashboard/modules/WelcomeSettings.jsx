import React, { useState, useEffect, useRef } from 'react';
import Toggle from '../../ui/Toggle';
import CustomSelect from '../../ui/CustomSelect';
import DiscordPreview from '../../ui/DiscordPreview';

export default function WelcomeSettings({ config, channels, onSave, saving, onReset }) {
  const wCfg = config?.welcome || {};
  const gCfg = config?.goodbye || {};

  // Welcome State
  const [welcomeEnabled, setWelcomeEnabled] = useState(wCfg.enabled || false);
  const [welcomeChannel, setWelcomeChannel] = useState(wCfg.channel_id || '');
  const [welcomeText, setWelcomeText] = useState(wCfg.message || '');
  const [welcomeMsgMode, setWelcomeMsgMode] = useState(wCfg.msg_mode || 'embed');
  const [welcomeEmbedColor, setWelcomeEmbedColor] = useState(wCfg.embed_color || '#5865F2');
  const [welcomeEmbedTitle, setWelcomeEmbedTitle] = useState(wCfg.embed_title || '');
  const [welcomeEmbedDesc, setWelcomeEmbedDesc] = useState(wCfg.embed_description || '');
  const [welcomeEmbedFooter, setWelcomeEmbedFooter] = useState(wCfg.embed_footer || '');
  const [welcomeEmbedThumbnail, setWelcomeEmbedThumbnail] = useState(wCfg.embed_thumbnail || '');
  const [welcomeImageUrl, setWelcomeImageUrl] = useState(wCfg.image_url || '');

  // DM on Join State
  const [dmJoinEnabled, setDmJoinEnabled] = useState(wCfg.dm_enabled || false);
  const [dmJoinText, setDmJoinText] = useState(wCfg.dm_message || '');

  // Goodbye State
  const [goodbyeEnabled, setGoodbyeEnabled] = useState(gCfg.enabled || false);
  const [goodbyeChannel, setGoodbyeChannel] = useState(gCfg.channel_id || '');
  const [goodbyeText, setGoodbyeText] = useState(gCfg.message || '');
  const [goodbyeMsgMode, setGoodbyeMsgMode] = useState(gCfg.msg_mode || 'embed');
  const [goodbyeEmbedColor, setGoodbyeEmbedColor] = useState(gCfg.embed_color || '#ED4245');
  const [goodbyeEmbedTitle, setGoodbyeEmbedTitle] = useState(gCfg.embed_title || '');
  const [goodbyeEmbedDesc, setGoodbyeEmbedDesc] = useState(gCfg.embed_description || '');
  const [goodbyeEmbedFooter, setGoodbyeEmbedFooter] = useState(gCfg.embed_footer || '');
  const [goodbyeEmbedThumbnail, setGoodbyeEmbedThumbnail] = useState(gCfg.embed_thumbnail || '');
  const [goodbyeImageUrl, setGoodbyeImageUrl] = useState(gCfg.image_url || '');

  // DM on Leave State
  const [dmLeaveEnabled, setDmLeaveEnabled] = useState(gCfg.dm_enabled || false);
  const [dmLeaveText, setDmLeaveText] = useState(gCfg.dm_message || '');

  const channelOptions = (channels || []).map(c => ({ value: c.id, label: `# ${c.name}` }));

  const isFirstRender = useRef(true);

  const getPayload = () => ({
    welcome: {
      ...wCfg,
      enabled: welcomeEnabled,
      channel_id: welcomeChannel,
      message: welcomeText,
      msg_mode: welcomeMsgMode,
      embed_color: welcomeEmbedColor,
      embed_title: welcomeEmbedTitle,
      embed_description: welcomeEmbedDesc,
      embed_footer: welcomeEmbedFooter,
      embed_thumbnail: welcomeEmbedThumbnail,
      image_url: welcomeImageUrl,
      dm_enabled: dmJoinEnabled,
      dm_message: dmJoinText,
    },
    goodbye: {
      ...gCfg,
      enabled: goodbyeEnabled,
      channel_id: goodbyeChannel,
      message: goodbyeText,
      msg_mode: goodbyeMsgMode,
      embed_color: goodbyeEmbedColor,
      embed_title: goodbyeEmbedTitle,
      embed_description: goodbyeEmbedDesc,
      embed_footer: goodbyeEmbedFooter,
      embed_thumbnail: goodbyeEmbedThumbnail,
      image_url: goodbyeImageUrl,
      dm_enabled: dmLeaveEnabled,
      dm_message: dmLeaveText,
    },
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handler = setTimeout(() => {
      onSave(getPayload());
    }, 50);
    return () => clearTimeout(handler);
  }, [
    welcomeEnabled, welcomeChannel, welcomeText, welcomeMsgMode, welcomeEmbedColor,
    welcomeEmbedTitle, welcomeEmbedDesc, welcomeEmbedFooter, welcomeEmbedThumbnail, welcomeImageUrl,
    dmJoinEnabled, dmJoinText,
    goodbyeEnabled, goodbyeChannel, goodbyeText, goodbyeMsgMode, goodbyeEmbedColor,
    goodbyeEmbedTitle, goodbyeEmbedDesc, goodbyeEmbedFooter, goodbyeEmbedThumbnail, goodbyeImageUrl,
    dmLeaveEnabled, dmLeaveText,
  ]);

  // Insert variable into a textarea ref
  const welcomeTextRef = useRef(null);
  const welcomeDescRef = useRef(null);
  const goodbyeTextRef = useRef(null);
  const goodbyeDescRef = useRef(null);
  const dmJoinRef = useRef(null);
  const dmLeaveRef = useRef(null);

  const insertVar = (ref, setter, variable) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const newVal = val.substring(0, start) + variable + val.substring(end);
    setter(newVal);
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + variable.length;
    }, 0);
  };

  const handleTestDm = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/actions/test-dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.error) alert('Error: ' + data.error);
      else alert('Test DM sent!');
    } catch (e) {
      alert('Failed to send test DM');
    }
  };

  const VariableButtons = ({ textRef, setter, showInviter = false }) => (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
      <button className="dash-btn secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => insertVar(textRef, setter, '{user}')}>@user</button>
      <button className="dash-btn secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => insertVar(textRef, setter, '{user.displayName}')}>@display name</button>
      <button className="dash-btn secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => insertVar(textRef, setter, '{server}')}>@server</button>
      <button className="dash-btn secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => insertVar(textRef, setter, '{memberCount}')}>@members</button>
      {showInviter && (
        <>
          <button className="dash-btn secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => insertVar(textRef, setter, '{inviter}')}>@inviter</button>
          <button className="dash-btn secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => insertVar(textRef, setter, '{inviter.name}')}>@inviter.name</button>
        </>
      )}
    </div>
  );

  const SectionCard = ({ title, icon, children, enabled, onToggle, channelValue, onChannelChange }) => (
    <div className="dash-card settings-card" style={{ padding: '0', marginBottom: '20px', overflow: 'visible' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {icon}
          <span style={{ color: '#fff', fontWeight: '600', fontSize: '15px' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onChannelChange && (
            <div style={{ width: '200px' }}>
              <CustomSelect options={channelOptions} value={channelValue} onChange={onChannelChange} placeholder="# select channel" />
            </div>
          )}
          {onToggle && <Toggle checked={enabled} onChange={() => onToggle(!enabled)} />}
        </div>
      </div>
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="dash-settings-module">
      {/* ═══════════════════════════════ WELCOME SECTION ═══════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '32px' }}>
        <div>
          <SectionCard
            title="Welcome Message"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
            enabled={welcomeEnabled}
            onToggle={setWelcomeEnabled}
            channelValue={welcomeChannel}
            onChannelChange={setWelcomeChannel}
          >
            {/* Content Text */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ color: '#fff', fontSize: '13px' }}>Message Text</label>
              <textarea
                ref={welcomeTextRef}
                className="dash-input"
                style={{ width: '100%', height: '50px', resize: 'vertical' }}
                value={welcomeText}
                onChange={(e) => setWelcomeText(e.target.value)}
                placeholder="Welcome {user} to {server}!"
              />
              <VariableButtons textRef={welcomeTextRef} setter={setWelcomeText} showInviter />
            </div>

            {/* Embed Description */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ color: '#fff', fontSize: '13px' }}>Embed Description</label>
              <textarea
                ref={welcomeDescRef}
                className="dash-input"
                style={{ width: '100%', height: '80px', resize: 'vertical' }}
                value={welcomeEmbedDesc}
                onChange={(e) => setWelcomeEmbedDesc(e.target.value)}
                placeholder="Welcome {user}! We're glad to have you here."
              />
              <VariableButtons textRef={welcomeDescRef} setter={setWelcomeEmbedDesc} />
            </div>

            {/* Toggles Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#ccc' }}>
                Embed
                <Toggle checked={welcomeMsgMode === 'embed'} onChange={() => setWelcomeMsgMode(welcomeMsgMode === 'embed' ? 'image' : 'embed')} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#ccc' }}>
                User Avatar
                <Toggle checked={welcomeEmbedThumbnail === '{user.avatar}'} onChange={() => setWelcomeEmbedThumbnail(welcomeEmbedThumbnail === '{user.avatar}' ? '' : '{user.avatar}')} />
              </label>
            </div>

            {/* Embed Color & Title (if embed mode) */}
            {welcomeMsgMode === 'embed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff', fontSize: '13px' }}>Embed Color</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input type="color" value={welcomeEmbedColor} onChange={(e) => setWelcomeEmbedColor(e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
                    <input type="text" className="dash-input" value={welcomeEmbedColor} onChange={(e) => setWelcomeEmbedColor(e.target.value)} style={{ width: '100px' }} />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff', fontSize: '13px' }}>Embed Title</label>
                  <input type="text" className="dash-input" placeholder="Title..." value={welcomeEmbedTitle} onChange={(e) => setWelcomeEmbedTitle(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff', fontSize: '13px' }}>Footer</label>
                  <input type="text" className="dash-input" placeholder="Footer..." value={welcomeEmbedFooter} onChange={(e) => setWelcomeEmbedFooter(e.target.value)} />
                </div>
              </div>
            )}

            {/* Image Upload (if image mode) */}
            {welcomeMsgMode === 'image' && (
              <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff', fontSize: '13px' }}>Background Image URL</label>
                  <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Provide a direct URL to an image (png/jpg/gif).</span>
                  <input type="text" className="dash-input" placeholder="https://example.com/image.png" value={welcomeImageUrl} onChange={(e) => setWelcomeImageUrl(e.target.value)} />
                </div>
              </div>
            )}
          </SectionCard>

          {/* DM on Join */}
          <SectionCard
            title="DM on Join"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>}
            enabled={dmJoinEnabled}
            onToggle={setDmJoinEnabled}
          >
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ color: '#fff', fontSize: '13px' }}>DM Message</label>
              <textarea
                ref={dmJoinRef}
                className="dash-input"
                style={{ width: '100%', height: '80px', resize: 'vertical' }}
                value={dmJoinText}
                onChange={(e) => setDmJoinText(e.target.value)}
                placeholder="👋 Welcome to {server}!"
              />
              <VariableButtons textRef={dmJoinRef} setter={setDmJoinText} />
            </div>
            <button className="dash-btn primary" style={{ fontSize: '12px' }} onClick={() => handleTestDm('welcome')}>
              📩 Test DM
            </button>
          </SectionCard>
        </div>

        {/* Welcome Preview */}
        <div>
          <DiscordPreview
            content={welcomeText}
            embedColor={welcomeEmbedColor}
            embedTitle={welcomeEmbedTitle}
            embedDesc={welcomeEmbedDesc}
            embedFooter={welcomeEmbedFooter}
            embedThumbnail={welcomeEmbedThumbnail === '{user.avatar}' ? 'https://cdn.discordapp.com/embed/avatars/0.png' : welcomeEmbedThumbnail}
            imageUrl={welcomeImageUrl}
            mode={welcomeMsgMode}
            accentColor="#5865F2"
            cardTitle="WELCOME"
            channels={channels}
          />
        </div>
      </div>

      {/* ═══════════════════════════════ GOODBYE SECTION ═══════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        <div>
          <SectionCard
            title="Goodbye Message"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ED4245" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>}
            enabled={goodbyeEnabled}
            onToggle={setGoodbyeEnabled}
            channelValue={goodbyeChannel}
            onChannelChange={setGoodbyeChannel}
          >
            {/* Content Text */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ color: '#fff', fontSize: '13px' }}>Message Text</label>
              <textarea
                ref={goodbyeTextRef}
                className="dash-input"
                style={{ width: '100%', height: '50px', resize: 'vertical' }}
                value={goodbyeText}
                onChange={(e) => setGoodbyeText(e.target.value)}
                placeholder="We're sad to see you go, {user}!"
              />
              <VariableButtons textRef={goodbyeTextRef} setter={setGoodbyeText} />
            </div>

            {/* Embed Description */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ color: '#fff', fontSize: '13px' }}>Embed Description</label>
              <textarea
                ref={goodbyeDescRef}
                className="dash-input"
                style={{ width: '100%', height: '80px', resize: 'vertical' }}
                value={goodbyeEmbedDesc}
                onChange={(e) => setGoodbyeEmbedDesc(e.target.value)}
                placeholder="We hope you enjoyed your time in {server}!"
              />
              <VariableButtons textRef={goodbyeDescRef} setter={setGoodbyeEmbedDesc} />
            </div>

            {/* Toggles Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#ccc' }}>
                Embed
                <Toggle checked={goodbyeMsgMode === 'embed'} onChange={() => setGoodbyeMsgMode(goodbyeMsgMode === 'embed' ? 'image' : 'embed')} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#ccc' }}>
                User Avatar
                <Toggle checked={goodbyeEmbedThumbnail === '{user.avatar}'} onChange={() => setGoodbyeEmbedThumbnail(goodbyeEmbedThumbnail === '{user.avatar}' ? '' : '{user.avatar}')} />
              </label>
            </div>

            {/* Embed Color & Title (if embed mode) */}
            {goodbyeMsgMode === 'embed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff', fontSize: '13px' }}>Embed Color</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input type="color" value={goodbyeEmbedColor} onChange={(e) => setGoodbyeEmbedColor(e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
                    <input type="text" className="dash-input" value={goodbyeEmbedColor} onChange={(e) => setGoodbyeEmbedColor(e.target.value)} style={{ width: '100px' }} />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff', fontSize: '13px' }}>Embed Title</label>
                  <input type="text" className="dash-input" placeholder="Title..." value={goodbyeEmbedTitle} onChange={(e) => setGoodbyeEmbedTitle(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff', fontSize: '13px' }}>Footer</label>
                  <input type="text" className="dash-input" placeholder="Footer..." value={goodbyeEmbedFooter} onChange={(e) => setGoodbyeEmbedFooter(e.target.value)} />
                </div>
              </div>
            )}

            {/* Image Upload (if image mode) */}
            {goodbyeMsgMode === 'image' && (
              <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: '#fff', fontSize: '13px' }}>Background Image URL</label>
                  <span className="form-hint" style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Provide a direct URL to an image (png/jpg/gif).</span>
                  <input type="text" className="dash-input" placeholder="https://example.com/image.png" value={goodbyeImageUrl} onChange={(e) => setGoodbyeImageUrl(e.target.value)} />
                </div>
              </div>
            )}
          </SectionCard>

          {/* DM on Leave */}
          <SectionCard
            title="DM on Leave"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ED4245" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>}
            enabled={dmLeaveEnabled}
            onToggle={setDmLeaveEnabled}
          >
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ color: '#fff', fontSize: '13px' }}>DM Message</label>
              <textarea
                ref={dmLeaveRef}
                className="dash-input"
                style={{ width: '100%', height: '80px', resize: 'vertical' }}
                value={dmLeaveText}
                onChange={(e) => setDmLeaveText(e.target.value)}
                placeholder="We're sorry to see you leave {server}."
              />
              <VariableButtons textRef={dmLeaveRef} setter={setDmLeaveText} />
            </div>
            <button className="dash-btn primary" style={{ fontSize: '12px' }} onClick={() => handleTestDm('goodbye')}>
              📩 Test DM
            </button>
          </SectionCard>
        </div>

        {/* Goodbye Preview */}
        <div>
          <DiscordPreview
            content={goodbyeText}
            embedColor={goodbyeEmbedColor}
            embedTitle={goodbyeEmbedTitle}
            embedDesc={goodbyeEmbedDesc}
            embedFooter={goodbyeEmbedFooter}
            embedThumbnail={goodbyeEmbedThumbnail === '{user.avatar}' ? 'https://cdn.discordapp.com/embed/avatars/0.png' : goodbyeEmbedThumbnail}
            imageUrl={goodbyeImageUrl}
            mode={goodbyeMsgMode}
            accentColor="#ED4245"
            cardTitle="GOODBYE"
            channels={channels}
          />
        </div>
      </div>
    </div>
  );
}
