/**
 * Orbit Dashboard - Nachrichten (Messages & Embed Builder) Tab (/dashboard/:guildId/messages)
 * 1:1 PeakBot Nachrichten UI & Full WYSIWYG Functionality
 */

DashboardTabs.Messages = async function (container, guildId) {
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  container.innerHTML = `
    <div class="p-8 flex items-center justify-center min-h-[360px]">
      <div class="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  `;

  let allChannels = [];
  let savedEmbeds = [];
  let botProfile = { nickname: '', avatar_url: '', default_name: 'Orbit', default_avatar: '/img/logo.png' };
  let currentGuild = { id: guildId, name: 'Server', icon: null, member_count: 100 };
  let fullConfig = {};

  try {
    const [cfgRes, chRes, savedRes, bpRes, guildsRes] = await Promise.all([
      API.getConfig(guildId).catch(() => ({})),
      API.getChannels(guildId).catch(() => []),
      API.getSavedEmbeds(guildId).catch(() => []),
      API.getBotProfile(guildId).catch(() => ({})),
      API.getGuilds().catch(() => [])
    ]);

    const rawChannels = (Array.isArray(chRes) && chRes.length > 0)
      ? chRes
      : (Array.isArray(cfgRes?.channels) ? cfgRes.channels : []);
    allChannels = rawChannels.filter(c => !c.type || c.type === 'text' || c.type === 'news' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text')));
    fullConfig = cfgRes?.config || {};
    savedEmbeds = Array.isArray(savedRes) ? savedRes : [];
    if (bpRes && typeof bpRes === 'object') {
      botProfile = { ...botProfile, ...bpRes };
    }
    const gList = Array.isArray(guildsRes) ? guildsRes : (guildsRes?.guilds || []);
    const foundG = gList.find(g => String(g.id) === String(guildId));
    if (foundG) currentGuild = foundG;
  } catch (err) {
    console.warn('[Messages] Initial load warning:', err);
  }

  const guildIconUrl = currentGuild.icon
    ? `https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.${currentGuild.icon.startsWith('a_') ? 'gif' : 'png'}?size=128`
    : '';
  const botDisplayName = botProfile.nickname || botProfile.default_name || 'Orbit';
  const botAvatarUrl = botProfile.avatar_url || botProfile.default_avatar || '/img/logo.png';

  const VARIABLES = [
    { token: '{user}', desc: 'Erwähnt den Benutzer (@User)' },
    { token: '{user.name}', desc: 'Anzeigename des Benutzers' },
    { token: '{server}', desc: 'Name des Discord-Servers' },
    { token: '{membercount}', desc: 'Aktuelle Mitgliederanzahl' }
  ];

  const TEMPLATES = [
    {
      key: 'blank',
      label: 'Leere Nachricht',
      desc: ' Komplett leer beginnen',
      data: {
        name: 'Untitled message',
        content: '',
        has_embed: false,
        title: '',
        url: '',
        description: '',
        color: '#5865F2',
        author_name: '',
        author_url: '',
        author_icon: '',
        footer_text: '',
        footer_icon: '',
        thumbnail: '',
        image: '',
        timestamp: false,
        fields: [],
        buttons: []
      }
    },
    {
      key: 'rules',
      label: '📜 Server-Regeln',
      desc: 'Strukturiertes Regelwerk für neue Mitglieder',
      data: {
        name: 'Server-Regeln',
        content: '',
        has_embed: true,
        title: '📜 Offizielle Server-Regeln — {server}',
        url: '',
        description: 'Bitte lies dir unsere Regeln sorgfältig durch, damit sich jeder auf **{server}** wohlfühlt.',
        color: '#5865F2',
        author_name: '{server} Administration',
        author_url: '',
        author_icon: '',
        footer_text: 'Mit dem Verbleib auf dem Server akzeptierst du diese Regeln.',
        footer_icon: '',
        thumbnail: '',
        image: '',
        timestamp: true,
        fields: [
          { name: '1. Respektvoller Umgang', value: 'Behandle alle Mitglieder freundlich. Beleidigungen, Diskriminierung und Belästigung werden nicht toleriert.', inline: false },
          { name: '2. Kein Spam & Eigenwerbung', value: 'Vermeide Nachrichten-Spam, Caps-Lock-Fluten und unaufgeforderte Einladungslinks.', inline: false },
          { name: '3. Richtige Kanäle nutzen', value: 'Achte auf die Kanalbeschreibungen und halte Gespräche im vorgesehenen Thema.', inline: false }
        ],
        buttons: []
      }
    },
    {
      key: 'announcement',
      label: '📢 Ankündigung',
      desc: 'Wichtige Neuigkeiten für deine Community',
      data: {
        name: 'Community Ankündigung',
        content: '📢 **Wichtige Neuigkeiten für {server}!**',
        has_embed: true,
        title: '🚀 Großes Server-Update ist live!',
        url: '',
        description: 'Hallo zusammen! Wir haben neue Funktionen, Kanäle und Rollen für unsere **{membercount}** Mitglieder eingerichtet.\n\nSchaut euch gerne um und gebt uns Feedback!',
        color: '#10B981',
        author_name: 'Server Team',
        author_url: '',
        author_icon: '',
        footer_text: '{server} • Ankündigung',
        footer_icon: '',
        thumbnail: '',
        image: '',
        timestamp: true,
        fields: [
          { name: '✨ Was ist neu?', value: '• Neues Ticket-System\n• Überarbeitete Selbstrollen\n• Frische Event-Kanäle', inline: true },
          { name: '📅 Wann?', value: 'Ab sofort für alle freigeschaltet!', inline: true }
        ],
        buttons: []
      }
    },
    {
      key: 'welcome_info',
      label: '👋 Willkommens-Guide',
      desc: 'Erste Schritte & Übersicht für neue User',
      data: {
        name: 'Willkommens-Guide',
        content: '',
        has_embed: true,
        title: '👋 Willkommen auf {server}!',
        url: '',
        description: 'Schön, dass du den Weg zu uns gefunden hast! Hier findest du die wichtigsten Anlaufstellen für deinen Start:',
        color: '#F59E0B',
        author_name: 'Onboarding',
        author_url: '',
        author_icon: '',
        footer_text: 'Du bist Mitglied #{membercount}',
        footer_icon: '',
        thumbnail: '',
        image: '',
        timestamp: false,
        fields: [
          { name: '🏷️ Rollen wählen', value: 'Hole dir deine Ping- und Farbrollen im Rollen-Kanal.', inline: true },
          { name: '🎫 Hilfe & Support', value: 'Bei Fragen kannst du jederzeit ein Ticket eröffnen.', inline: true }
        ],
        buttons: []
      }
    },
    {
      key: 'event',
      label: '🎉 Event-Einladung',
      desc: 'Community-Abend, Turnier oder Gewinnspiel',
      data: {
        name: 'Community Event',
        content: '',
        has_embed: true,
        title: '🎉 Großes Community-Event am Wochenende!',
        url: '',
        description: 'Macht euch bereit! Dieses Wochenende veranstalten wir unser nächstes großes Community-Event auf **{server}**.',
        color: '#EC4899',
        author_name: 'Event-Team',
        author_url: '',
        author_icon: '',
        footer_text: 'Wir freuen uns auf euch!',
        footer_icon: '',
        thumbnail: '',
        image: '',
        timestamp: true,
        fields: [
          { name: '🕒 Startzeit', value: 'Samstag, 20:00 Uhr', inline: true },
          { name: '🏆 Preise', value: 'Exklusive Rollen & Überraschungen', inline: true }
        ],
        buttons: []
      }
    }
  ];

  const PRESET_COLORS = [
    '#5865F2',
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#EC4899',
    '#A855F7',
    '#FFFFFF'
  ];

  // Main state
  let activeTopTab = 'user_messages'; // 'user_messages' | 'bot_messages'
  let mobileFriendly = true;
  let openPopover = null; // 'new' | 'saved' | 'send_as' | 'channel' | 'color' | null
  let isSending = false;

  const state = {
    id: '',
    name: 'Untitled message',
    channel_id: '',
    send_as: 'server', // 'server' | 'bot' | 'custom'
    sender_name: currentGuild.name || 'Ehemaliger Hub',
    sender_avatar: guildIconUrl || '',
    content: '',
    has_embed: false,
    title: '',
    url: '',
    description: '',
    color: '#5865F2',
    author_name: '',
    author_url: '',
    author_icon: '',
    footer_text: '',
    footer_icon: '',
    thumbnail: '',
    image: '',
    timestamp: false,
    fields: [],
    buttons: []
  };

  // Undo / Redo history stack
  const undoStack = [];
  const redoStack = [];

  function snapshotState() {
    return JSON.parse(JSON.stringify({
      name: state.name,
      content: state.content,
      has_embed: state.has_embed,
      title: state.title,
      url: state.url,
      description: state.description,
      color: state.color,
      author_name: state.author_name,
      author_url: state.author_url,
      author_icon: state.author_icon,
      footer_text: state.footer_text,
      footer_icon: state.footer_icon,
      thumbnail: state.thumbnail,
      image: state.image,
      timestamp: state.timestamp,
      fields: state.fields,
      buttons: state.buttons
    }));
  }

  function pushUndo() {
    const snap = snapshotState();
    const last = undoStack[undoStack.length - 1];
    if (last && JSON.stringify(last) === JSON.stringify(snap)) return;
    undoStack.push(snap);
    if (undoStack.length > 40) undoStack.shift();
    redoStack.length = 0;
    updateToolbarStatesInPlace();
  }

  function applySnapshot(snap) {
    if (!snap) return;
    Object.assign(state, JSON.parse(JSON.stringify(snap)));
    render();
  }

  function performUndo() {
    if (undoStack.length === 0) return;
    redoStack.push(snapshotState());
    const prev = undoStack.pop();
    applySnapshot(prev);
  }

  function performRedo() {
    if (redoStack.length === 0) return;
    undoStack.push(snapshotState());
    const next = redoStack.pop();
    applySnapshot(next);
  }

  function hasAnyContent() {
    if ((state.content || '').trim().length > 0) return true;
    if (!state.has_embed) return false;
    return Boolean(
      (state.title || '').trim() ||
      (state.description || '').trim() ||
      (state.author_name || '').trim() ||
      (state.footer_text || '').trim() ||
      (state.image || '').trim() ||
      (state.thumbnail || '').trim() ||
      (Array.isArray(state.fields) && state.fields.some(f => (f.name || '').trim() || (f.value || '').trim()))
    );
  }

  function resolvePreviewVars(text) {
    if (!text) return '';
    const gName = currentGuild.name || 'Server';
    const mCount = String(currentGuild.member_count || 128);
    return String(text)
      .replace(/\{(user|user\.mention|mention|member|user_mention)\}/gi, '@Lukas')
      .replace(/\{(user\.display_?name|display_?name|user_globalname)\}/gi, 'Lukas')
      .replace(/\{(user\.name|username)\}/gi, 'Lukas')
      .replace(/\{(server|server\.name|guild|guild\.name)\}/gi, gName)
      .replace(/\{(member_?count|count|members|server\.members)\}/gi, mCount);
  }

  function formatDiscordText(text) {
    if (!text) return '';
    if (window.DiscordMarkdown && typeof window.DiscordMarkdown.parse === 'function') {
      return window.DiscordMarkdown.parse(text, {
        guildName: currentGuild.name || 'Server',
        memberCount: currentGuild.member_count || 128,
        highlightVariables: false
      });
    }
    const withVars = resolvePreviewVars(text);
    return escapeHtml(withVars).replace(/\n/g, '<br>');
  }

  function renderSenderAvatarHtml(sizeCls = 'w-10 h-10') {
    const sName = state.send_as === 'bot' ? botDisplayName : (state.sender_name || currentGuild.name || 'Server');
    const sAvatar = state.send_as === 'bot' ? botAvatarUrl : state.sender_avatar;
    const initial = (sName.trim()[0] || 'V').toUpperCase();
    if (sAvatar) {
      return `<img src="${escapeHtml(sAvatar)}" alt="${escapeHtml(sName)}" class="hidden sm:flex ${sizeCls} rounded-full object-cover flex-shrink-0 bg-neutral-800">`;
    }
    return `<div class="hidden sm:flex ${sizeCls} rounded-full bg-indigo-500 items-center justify-center text-white font-semibold flex-shrink-0">${escapeHtml(initial)}</div>`;
  }

  function renderRightPreviewHtml() {
    if (!hasAnyContent()) {
      return `
        <div class="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 px-4 py-6 text-center">
          <p class="text-[12px] text-neutral-500">Es gibt noch keine Vorschau – beginnen Sie mit dem Ausfüllen der Nachricht oben.</p>
        </div>
      `;
    }

    const sName = state.send_as === 'bot' ? botDisplayName : (state.sender_name || currentGuild.name || 'Ehemaliger Hub');
    const hasEmb = state.has_embed && (
      (state.title || '').trim() ||
      (state.description || '').trim() ||
      (state.author_name || '').trim() ||
      (state.footer_text || '').trim() ||
      (state.image || '').trim() ||
      (state.thumbnail || '').trim() ||
      state.fields.some(f => (f.name || '').trim() || (f.value || '').trim())
    );

    return `
      <div class="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-xs font-medium text-neutral-300">Discord Live-Vorschau</span>
          </div>
          <span class="text-[11px] text-neutral-500">${mobileFriendly ? '📱 Mobilfreundlich aktiv' : '🖥️ Desktop-Ansicht'}</span>
        </div>
        <div class="p-4 sm:p-5 bg-[#313338] ${mobileFriendly ? 'max-w-[420px] mx-auto my-3 rounded-xl border border-white/[0.06]' : ''}">
          <div class="flex items-start gap-3">
            ${renderSenderAvatarHtml('w-10 h-10')}
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-2 mb-1">
                <span class="text-sm font-semibold text-white">${escapeHtml(sName)}</span>
                <span class="inline-flex items-center gap-[0.15em] text-[10px] px-1 py-0.5 bg-indigo-500 text-white rounded font-bold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="h-[0.85em] w-[0.85em]"><path d="M20 6 9 17l-5-5"></path></svg>APP
                </span>
                <span class="text-[10px] text-neutral-400">Heute um 12:00 Uhr</span>
              </div>

              ${(state.content || '').trim() ? `
                <div class="text-[14px] text-neutral-100 leading-snug whitespace-pre-wrap break-words mb-2">${formatDiscordText(state.content)}</div>
              ` : ''}

              ${hasEmb ? `
                <div class="rounded-md bg-[#2b2d31] border-l-4 p-3.5 max-w-[520px] space-y-2" style="border-left-color: ${escapeHtml(state.color || '#5865F2')};">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0 space-y-1.5">
                      ${(state.author_name || '').trim() ? `
                        <div class="flex items-center gap-2">
                          ${(state.author_icon || '').trim() ? `<img src="${escapeHtml(state.author_icon)}" alt="" class="w-5 h-5 rounded-full object-cover">` : ''}
                          ${(state.author_url || '').trim() ? `
                            <a href="${escapeHtml(state.author_url)}" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-white hover:underline truncate">${formatDiscordText((state.author_name))}</a>
                          ` : `
                            <span class="text-xs font-semibold text-white truncate">${formatDiscordText((state.author_name))}</span>
                          `}
                        </div>
                      ` : ''}

                      ${(state.title || '').trim() ? `
                        <div>
                          ${(state.url || '').trim() ? `
                            <a href="${escapeHtml(state.url)}" target="_blank" rel="noopener noreferrer" class="text-sm font-bold text-[#00a8fc] hover:underline break-words">${formatDiscordText((state.title))}</a>
                          ` : `
                            <div class="text-sm font-bold text-white break-words">${formatDiscordText((state.title))}</div>
                          `}
                        </div>
                      ` : ''}

                      ${(state.description || '').trim() ? `
                        <div class="text-[13px] text-neutral-200 leading-relaxed whitespace-pre-wrap break-words">${formatDiscordText(state.description)}</div>
                      ` : ''}
                    </div>

                    ${(state.thumbnail || '').trim() ? `
                      <img src="${escapeHtml(state.thumbnail)}" alt="Thumbnail" class="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover flex-shrink-0 bg-neutral-800">
                    ` : ''}
                  </div>

                  ${state.fields.some(f => (f.name || '').trim() || (f.value || '').trim()) ? `
                    <div class="grid grid-cols-12 gap-2.5 pt-1">
                      ${state.fields.filter(f => (f.name || '').trim() || (f.value || '').trim()).map(f => `
                        <div class="${f.inline ? 'col-span-4' : 'col-span-12'} min-w-0">
                          <div class="text-xs font-semibold text-white break-words">${formatDiscordText((f.name || '\u200b'))}</div>
                          <div class="text-xs text-neutral-300 whitespace-pre-wrap break-words mt-0.5">${formatDiscordText(f.value || '\u200b')}</div>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}

                  ${(state.image || '').trim() ? `
                    <div class="pt-1">
                      <img src="${escapeHtml(state.image)}" alt="Embed Image" class="w-full ${mobileFriendly ? 'max-h-[240px] object-cover' : 'max-h-[320px] object-contain'} rounded-md bg-neutral-900">
                    </div>
                  ` : ''}

                  ${((state.footer_text || '').trim() || state.timestamp) ? `
                    <div class="flex items-center gap-2 pt-1 text-[11px] text-neutral-400">
                      ${(state.footer_icon || '').trim() ? `<img src="${escapeHtml(state.footer_icon)}" alt="" class="w-4 h-4 rounded-full object-cover">` : ''}
                      <span>${formatDiscordText((state.footer_text || ''))}${state.footer_text && state.timestamp ? ' • ' : ''}${state.timestamp ? 'Heute um 12:00 Uhr' : ''}</span>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              ${state.buttons.some(b => (b.label || '').trim() && (b.url || '').trim()) ? `
                <div class="flex flex-wrap gap-2 mt-2.5">
                  ${state.buttons.filter(b => (b.label || '').trim() && (b.url || '').trim()).map(b => `
                    <a href="${escapeHtml(b.url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#4e5058] hover:bg-[#6d6f78] text-white text-xs font-medium transition-colors">
                      <span>${escapeHtml(b.label)}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link opacity-80"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                    </a>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function updateToolbarStatesInPlace() {
    const undoBtn = document.getElementById('msg-undo-btn');
    const redoBtn = document.getElementById('msg-redo-btn');
    const sendBtn = document.getElementById('msg-send-btn');
    const previewRoot = document.getElementById('msg-right-preview');

    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
    if (sendBtn) sendBtn.disabled = isSending || !state.channel_id || !hasAnyContent();
    if (previewRoot) previewRoot.innerHTML = renderRightPreviewHtml();
  }

  function renderInteractiveEmbedEditorHtml() {
    if (!state.has_embed) {
      return `
        <div class="mt-2">
          <button type="button" id="msg-add-embed-btn" class="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md text-[11px] font-medium border border-dashed border-neutral-700 text-neutral-500 hover:text-indigo-300 hover:border-indigo-400/50 hover:bg-indigo-500/5 transition-colors cursor-pointer" title="Fügen Sie dieser Nachricht eine Einbettung hinzu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3.5 h-3.5">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>Einbetten</button>
        </div>
      `;
    }

    return `
      <div class="mt-3 relative rounded-lg bg-[#2b2d31] border-l-4 p-4 space-y-3 shadow-inner" style="border-left-color: ${escapeHtml(state.color || '#5865F2')};">
        <!-- Top Bar: Color Picker & Remove Embed -->
        <div class="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[11px] font-medium text-neutral-400 mr-1">Farbe:</span>
            ${PRESET_COLORS.map(c => `
              <button type="button" data-emb-color="${escapeHtml(c)}" class="w-4 h-4 rounded-full border transition-transform cursor-pointer ${state.color.toLowerCase() === c.toLowerCase() ? 'border-white scale-125' : 'border-black/40 hover:scale-110'}" style="background-color: ${escapeHtml(c)};"></button>
            `).join('')}
            <input type="color" id="msg-emb-custom-color" value="${escapeHtml(state.color.startsWith('#') ? state.color : '#5865F2')}" class="w-5 h-5 rounded bg-transparent border-0 cursor-pointer ml-1" title="Benutzerdefinierte Farbe">
          </div>
          <button type="button" id="msg-remove-embed-btn" class="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-neutral-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer" title="Einbettung entfernen">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            Entfernen
          </button>
        </div>

        <!-- Author & Thumbnail Row -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0 space-y-2">
            <!-- Author inputs -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <input id="msg-emb-author-name" type="text" placeholder="Autor-Name (optional)" value="${escapeHtml(state.author_name)}" class="sm:col-span-2 px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-white placeholder-neutral-500 focus:outline-none">
              <input id="msg-emb-author-icon" type="text" placeholder="Autor-Icon URL" value="${escapeHtml(state.author_icon)}" class="px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-white placeholder-neutral-500 focus:outline-none">
            </div>

            <!-- Title & URL -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <input id="msg-emb-title" type="text" placeholder="Embed-Titel" value="${escapeHtml(state.title)}" class="sm:col-span-2 px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-sm font-semibold text-white placeholder-neutral-500 focus:outline-none">
              <input id="msg-emb-url" type="text" placeholder="Titel-Link (https://...)" value="${escapeHtml(state.url)}" class="px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-white placeholder-neutral-500 focus:outline-none">
            </div>

            <!-- Description -->
            <div>
              <textarea id="msg-emb-description" rows="3" placeholder="Beschreibung der Einbettung (unterstützt Markdown & / für Variablen)..." class="w-full px-2.5 py-2 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none resize-y">${escapeHtml(state.description)}</textarea>
            </div>
          </div>

          <!-- Thumbnail Slot -->
          <div class="flex flex-col items-center gap-1 flex-shrink-0">
            <label class="relative w-16 h-16 rounded-lg bg-[#1e1f22] border border-dashed border-neutral-700 hover:border-indigo-400 flex flex-col items-center justify-center cursor-pointer overflow-hidden group" title="Thumbnail hochladen">
              <input type="file" id="msg-emb-thumb-file" accept="image/*" class="hidden">
              ${state.thumbnail ? `
                <img src="${escapeHtml(state.thumbnail)}" alt="Thumbnail" class="w-full h-full object-cover">
              ` : `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image text-neutral-500 group-hover:text-indigo-300"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                <span class="text-[9px] text-neutral-500 mt-0.5">Thumb</span>
              `}
            </label>
            ${state.thumbnail ? `
              <button type="button" id="msg-emb-clear-thumb" class="text-[10px] text-rose-400 hover:underline cursor-pointer">Löschen</button>
            ` : ''}
          </div>
        </div>

        <!-- Fields Section -->
        <div class="space-y-2 pt-1">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Felder (${state.fields.length}/25)</span>
            <button type="button" id="msg-emb-add-field" class="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-200 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
              Feld hinzufügen
            </button>
          </div>
          ${state.fields.length > 0 ? `
            <div class="space-y-2">
              ${state.fields.map((f, idx) => `
                <div class="p-2.5 rounded-lg bg-[#1e1f22] border border-white/[0.06] space-y-1.5">
                  <div class="flex items-center gap-2">
                    <input type="text" data-field-name="${idx}" placeholder="Feldname" value="${escapeHtml(f.name)}" class="flex-1 min-w-0 px-2 py-1 rounded bg-[#2b2d31] border border-white/[0.06] text-xs font-semibold text-white placeholder-neutral-500 focus:outline-none">
                    <label class="inline-flex items-center gap-1 text-[11px] text-neutral-400 cursor-pointer select-none">
                      <input type="checkbox" data-field-inline="${idx}" ${f.inline ? 'checked' : ''} class="rounded border-neutral-600">
                      Inline
                    </label>
                    <button type="button" data-field-remove="${idx}" class="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer" title="Feld löschen">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                    </button>
                  </div>
                  <textarea rows="2" data-field-value="${idx}" placeholder="Feldwert..." class="w-full px-2 py-1 rounded bg-[#2b2d31] border border-white/[0.06] text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none">${escapeHtml(f.value)}</textarea>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Main Image Row -->
        <div class="pt-1">
          <div class="flex items-center gap-2">
            <input id="msg-emb-image-url" type="text" placeholder="Hauptbild-URL (https://...) oder rechts hochladen" value="${escapeHtml(state.image)}" class="flex-1 min-w-0 px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-white placeholder-neutral-500 focus:outline-none">
            <label class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-neutral-200 cursor-pointer flex-shrink-0">
              <input type="file" id="msg-emb-image-file" accept="image/*" class="hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></path></svg>
              Bild
            </label>
          </div>
        </div>

        <!-- Footer & Timestamp Row -->
        <div class="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-1.5 items-center pt-1">
          <input id="msg-emb-footer-text" type="text" placeholder="Footer-Text (optional)" value="${escapeHtml(state.footer_text)}" class="px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-white placeholder-neutral-500 focus:outline-none">
          <input id="msg-emb-footer-icon" type="text" placeholder="Footer-Icon URL" value="${escapeHtml(state.footer_icon)}" class="px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-white placeholder-neutral-500 focus:outline-none">
          <label class="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs text-neutral-300 cursor-pointer select-none">
            <input type="checkbox" id="msg-emb-timestamp" ${state.timestamp ? 'checked' : ''} class="rounded border-neutral-600">
            Zeitstempel
          </label>
        </div>

        <!-- Link Buttons Section -->
        <div class="space-y-2 pt-2 border-t border-white/[0.06]">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Link-Buttons (${state.buttons.length}/5)</span>
            ${state.buttons.length < 5 ? `
              <button type="button" id="msg-emb-add-btn" class="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-200 transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                Link-Button
              </button>
            ` : ''}
          </div>
          ${state.buttons.length > 0 ? `
            <div class="space-y-1.5">
              ${state.buttons.map((b, idx) => `
                <div class="flex items-center gap-1.5">
                  <input type="text" data-btn-label="${idx}" placeholder="Button-Text" value="${escapeHtml(b.label)}" class="w-36 px-2 py-1 rounded bg-[#1e1f22] border border-white/[0.06] text-xs text-white placeholder-neutral-500 focus:outline-none">
                  <input type="text" data-btn-url="${idx}" placeholder="https://discord.gg/..." value="${escapeHtml(b.url)}" class="flex-1 min-w-0 px-2 py-1 rounded bg-[#1e1f22] border border-white/[0.06] text-xs text-white placeholder-neutral-500 focus:outline-none">
                  <button type="button" data-btn-remove="${idx}" class="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                  </button>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderBotMessagesTabHtml() {
    const welcomeCfg = fullConfig.welcome || {};
    const goodbyeCfg = fullConfig.goodbye || {};
    const boostCfg = fullConfig.boost || {};
    const verifyCfg = fullConfig.verify || {};
    const ticketCfg = fullConfig.ticket || {};
    const levelCfg = fullConfig.level || {};

    const findChName = (cid) => {
      if (!cid) return 'Kein Kanal gewählt';
      const c = allChannels.find(ch => String(ch.id) === String(cid));
      return c ? `#${c.name}` : `#${cid}`;
    };

    const botCards = [
      {
        key: 'welcome',
        title: 'Willkommensnachricht',
        desc: 'Wird automatisch gesendet, wenn ein neues Mitglied dem Server beitritt.',
        enabled: Boolean(welcomeCfg.enabled),
        channel: findChName(welcomeCfg.channel_id),
        color: welcomeCfg.embed_color || '#5865F2',
        previewTitle: welcomeCfg.embed_title || 'Willkommen auf {server}!',
        previewDesc: welcomeCfg.embed_description || welcomeCfg.message || 'Willkommen {user}!',
        tabRoute: `/dashboard/${guildId}/welcome`
      },
      {
        key: 'goodbye',
        title: 'Abschiedsnachricht',
        desc: 'Wird gesendet, wenn ein Mitglied den Server verlässt.',
        enabled: Boolean(goodbyeCfg.enabled),
        channel: findChName(goodbyeCfg.channel_id),
        color: goodbyeCfg.embed_color || '#EF4444',
        previewTitle: goodbyeCfg.embed_title || 'Auf Wiedersehen!',
        previewDesc: goodbyeCfg.embed_description || goodbyeCfg.message || '{user.name} hat den Server verlassen.',
        tabRoute: `/dashboard/${guildId}/welcome`
      },
      {
        key: 'boost',
        title: 'Server-Boost-Nachricht',
        desc: 'Bedankt sich automatisch bei neuen Server-Boostern.',
        enabled: Boolean(boostCfg.enabled),
        channel: findChName(boostCfg.channel_id),
        color: boostCfg.embed_color || '#EB459E',
        previewTitle: boostCfg.embed_title || 'Neuer Server-Boost!',
        previewDesc: boostCfg.embed_description || boostCfg.message || 'Danke für deinen Boost, {user}!',
        tabRoute: `/dashboard/${guildId}/welcome`
      },
      {
        key: 'verify',
        title: 'Verifizierungs-Panel',
        desc: 'Interaktives Verifizierungs-Embed für neue Mitglieder.',
        enabled: Boolean(verifyCfg.enabled),
        channel: 'Verifizierungs-Kanal',
        color: verifyCfg.embed_color || '#5865F2',
        previewTitle: verifyCfg.embed_title || 'Server Verification',
        previewDesc: verifyCfg.embed_description || 'Klicke unten auf den Button, um dich zu verifizieren.',
        tabRoute: `/dashboard/${guildId}/verify`
      },
      {
        key: 'tickets',
        title: 'Support-Ticket-Panel',
        desc: 'Panel-Einbettung zum Eröffnen von Support-Tickets.',
        enabled: Boolean(ticketCfg.enabled),
        channel: findChName(ticketCfg.panel_channel_id),
        color: '#5865F2',
        previewTitle: ticketCfg.panel_title || 'Support Ticket Desk',
        previewDesc: ticketCfg.panel_description || 'Wähle unten eine Kategorie aus, um ein Ticket zu erstellen.',
        tabRoute: `/dashboard/${guildId}/tickets`
      },
      {
        key: 'level',
        title: 'Level-Up-Benachrichtigung',
        desc: 'Wird gesendet, wenn ein Mitglied ein neues XP-Level erreicht.',
        enabled: Boolean(levelCfg.enabled),
        channel: levelCfg.levelup_channel === 'current' ? 'Aktueller Kanal' : findChName(levelCfg.levelup_channel),
        color: levelCfg.leaderboard_color || '#3B82F6',
        previewTitle: levelCfg.levelup_embed_title || 'Level Up!',
        previewDesc: levelCfg.levelup_embed_description || levelCfg.levelup_message_content || 'Glückwunsch {user}, du hast ein neues Level erreicht!',
        tabRoute: `/dashboard/${guildId}/level`
      }
    ];

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${botCards.map(card => `
          <div class="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 flex flex-col justify-between gap-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3 class="text-sm font-semibold text-white">${escapeHtml(card.title)}</h3>
                  <p class="text-[11px] text-neutral-500 mt-0.5">${escapeHtml(card.desc)}</p>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${card.enabled ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-neutral-800 text-neutral-500 border border-neutral-700'}">
                  ${card.enabled ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>

              <div class="rounded-lg bg-[#2b2d31] border-l-4 p-3 space-y-1" style="border-left-color: ${escapeHtml(card.color)};">
                <p class="text-xs font-bold text-white truncate">${formatDiscordText((card.previewTitle))}</p>
                <p class="text-[11px] text-neutral-300 line-clamp-2">${formatDiscordText((card.previewDesc))}</p>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
              <span class="text-neutral-500 truncate max-w-[140px]">${escapeHtml(card.channel)}</span>
              <div class="flex items-center gap-1.5">
                <button type="button" data-load-bot-card="${escapeHtml(card.key)}" class="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium transition-colors cursor-pointer">
                  In Editor laden
                </button>
                <a href="${escapeHtml(card.tabRoute)}" class="px-2.5 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-[11px] font-semibold transition-colors">
                  Modul →
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function render() {
    const selectedChannel = allChannels.find(c => String(c.id) === String(state.channel_id));
    const senderLabel = state.send_as === 'bot' ? botDisplayName : (state.sender_name || currentGuild.name || 'Gipfel');
    const senderImg = state.send_as === 'bot' ? botAvatarUrl : (state.sender_avatar || guildIconUrl || '/img/logo.png');

    container.innerHTML = `
      <div class="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 pt-6">
        <div>
          <div data-tour="feature-header" class="scroll-mt-24">
            <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type w-5 h-5">
                    <polyline points="4 7 4 4 20 4 20 7"></polyline>
                    <line x1="9" x2="15" y1="20" y2="20"></line>
                    <line x1="12" x2="12" y1="4" y2="20"></line>
                  </svg>
                </span>
                <h1 class="text-base font-medium text-white truncate">Nachrichten</h1>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0">
                <div class="flex items-center gap-3">
                  <div class="overflow-x-auto scrollbar-none">
                    <div class="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
                      <button type="button" id="msg-tab-user" class="px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${activeTopTab === 'user_messages' ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'}">Ihre Nachrichten</button>
                      <button type="button" id="msg-tab-bot" class="px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${activeTopTab === 'bot_messages' ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'}">Bot-Nachrichten</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6">
            ${activeTopTab === 'bot_messages' ? renderBotMessagesTabHtml() : `
              <div class="w-full pb-6">
                <!-- Action Toolbar -->
                <div class="relative z-30 mb-5 rounded-xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                  <div class="flex items-center gap-1.5 px-3 py-2.5 flex-wrap">
                    <!-- Neu (Templates / Blank) -->
                    <div class="relative">
                      <button type="button" id="msg-new-btn" title="Neue Nachricht – wählen Sie eine Vorlage oder beginnen Sie leer" class="inline-flex items-center gap-2 h-9 px-3 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-plus w-4 h-4">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                          <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                          <path d="M9 15h6"></path>
                          <path d="M12 18v-6"></path>
                        </svg>Neu</button>
                      ${openPopover === 'new' ? `
                        <div class="orbit-dropdown-menu absolute left-0 mt-2 w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] p-1.5 space-y-1" style="z-index: 99999;" data-lenis-prevent="true">
                          <div class="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Vorlage wählen</div>
                          ${TEMPLATES.map(t => `
                            <button type="button" data-pick-template="${escapeHtml(t.key)}" class="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
                              <div class="text-xs font-semibold text-white">${escapeHtml(t.label)}</div>
                              <div class="text-[11px] text-neutral-500">${escapeHtml(t.desc)}</div>
                            </button>
                          `).join('')}
                        </div>
                      ` : ''}
                    </div>

                    <!-- Einbettet (Saved Embeds Drawer) -->
                    <div class="relative">
                      <button type="button" id="msg-saved-btn" title="Durchsuchen Sie alle Einbettungen" class="inline-flex items-center gap-2 h-9 px-3 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open w-4 h-4">
                          <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
                        </svg>Einbettet</button>
                      ${openPopover === 'saved' ? `
                        <div class="orbit-dropdown-menu absolute left-0 mt-2 w-80 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] p-2 space-y-1.5 max-h-80 overflow-y-auto" style="z-index: 99999;" data-lenis-prevent="true">
                          <div class="flex items-center justify-between px-2 py-1">
                            <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Gespeicherte Nachrichten (${savedEmbeds.length})</span>
                          </div>
                          ${savedEmbeds.length > 0 ? savedEmbeds.map(emb => `
                            <div class="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg hover:bg-neutral-800 group">
                              <button type="button" data-load-saved="${escapeHtml(emb.id)}" class="flex-1 min-w-0 text-left cursor-pointer">
                                <div class="text-xs font-medium text-white truncate">${escapeHtml(emb.name || emb.title || 'Untitled message')}</div>
                                <div class="text-[10px] text-neutral-500 truncate">${escapeHtml(emb.description || emb.content || 'Keine Beschreibung')}</div>
                              </button>
                              <button type="button" data-delete-saved="${escapeHtml(emb.id)}" class="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer" title="Löschen">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                              </button>
                            </div>
                          `).join('') : `
                            <div class="px-3 py-4 text-center text-xs text-neutral-500">Noch keine Nachrichten gespeichert. Klicke rechts auf „An die Bibliothek senden“.</div>
                          `}
                        </div>
                      ` : ''}
                    </div>

                    <span class="self-stretch w-px bg-neutral-800 mx-1.5"></span>

                    <!-- Undo / Redo -->
                    <button type="button" id="msg-undo-btn" ${undoStack.length === 0 ? 'disabled=""' : ''} title="Rückgängig machen (Strg+Z)" class="inline-flex items-center justify-center w-9 h-9 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo2 w-4 h-4">
                        <path d="M9 14 4 9l5-5"></path>
                        <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path>
                      </svg>
                    </button>
                    <button type="button" id="msg-redo-btn" ${redoStack.length === 0 ? 'disabled=""' : ''} title="Wiederherstellen (Strg+Umschalt+Z)" class="inline-flex items-center justify-center w-9 h-9 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo2 w-4 h-4">
                        <path d="m15 14 5-5-5-5"></path>
                        <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"></path>
                      </svg>
                    </button>

                    <div class="flex-1"></div>

                    <!-- Senden als -->
                    <div class="relative">
                      <button type="button" id="msg-sendas-btn" title="Ändern Sie, wer die Nachricht sendet" class="inline-flex items-center gap-2 h-10 pl-2 pr-3 text-[13px] font-medium text-neutral-200 hover:text-white hover:bg-neutral-800 rounded-md transition-colors cursor-pointer">
                        <img src="${escapeHtml(senderImg)}" alt="" class="w-6 h-6 rounded-full object-cover flex-shrink-0 bg-neutral-800">
                        <span class="text-neutral-500">Senden als</span>
                        <span class="truncate max-w-[100px]">${escapeHtml(senderLabel)}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-3.5 h-3.5 text-neutral-500">
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </button>
                      ${openPopover === 'send_as' ? `
                        <div class="orbit-dropdown-menu absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] p-2 space-y-1.5" style="z-index: 99999;" data-lenis-prevent="true">
                          <button type="button" data-pick-sendas="bot" class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-neutral-800 cursor-pointer ${state.send_as === 'bot' ? 'bg-neutral-800 text-white' : 'text-neutral-300'}">
                            <img src="${escapeHtml(botAvatarUrl)}" alt="" class="w-6 h-6 rounded-full object-cover bg-neutral-800">
                            <div class="min-w-0 flex-1">
                              <div class="text-xs font-semibold truncate">${escapeHtml(botDisplayName)}</div>
                              <div class="text-[10px] text-neutral-500">Als Server-Bot senden</div>
                            </div>
                          </button>
                          <button type="button" data-pick-sendas="webhook" class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-neutral-800 cursor-pointer ${state.send_as !== 'bot' ? 'bg-neutral-800 text-white' : 'text-neutral-300'}">
                            <div class="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${escapeHtml((currentGuild.name || 'S')[0])}</div>
                            <div class="min-w-0 flex-1">
                              <div class="text-xs font-semibold truncate">${escapeHtml(currentGuild.name || 'Server')} (Webhook)</div>
                              <div class="text-[10px] text-neutral-500">Eigener Name & Avatar</div>
                            </div>
                          </button>
                          ${state.send_as !== 'bot' ? `
                            <div class="pt-1.5 border-t border-neutral-800 space-y-1.5 px-1">
                              <input id="msg-custom-sender-name" type="text" placeholder="Absender-Name" value="${escapeHtml(state.sender_name)}" class="w-full px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none">
                              <input id="msg-custom-sender-avatar" type="text" placeholder="Avatar-URL (optional)" value="${escapeHtml(state.sender_avatar)}" class="w-full px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none">
                            </div>
                          ` : ''}
                        </div>
                      ` : ''}
                    </div>

                    <!-- Kanal auswählen -->
                    <div class="relative">
                      <button type="button" id="msg-channel-btn" title="Kanal auswählen" class="inline-flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-lg border transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${selectedChannel ? 'text-white border-neutral-600 bg-neutral-800/60' : 'text-neutral-400 border-neutral-700'} hover:text-white hover:bg-neutral-800 hover:border-neutral-600 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-4 h-4 text-neutral-500">
                          <line x1="4" x2="20" y1="9" y2="9"></line>
                          <line x1="4" x2="20" y1="15" y2="15"></line>
                          <line x1="10" x2="8" y1="3" y2="21"></line>
                          <line x1="16" x2="14" y1="3" y2="21"></line>
                        </svg>
                        <span class="truncate max-w-[140px]">${selectedChannel ? escapeHtml(selectedChannel.name) : 'Kanal auswählen'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-3.5 h-3.5 text-neutral-500">
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </button>
                      ${openPopover === 'channel' ? `
                        <div class="orbit-dropdown-menu absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] overflow-hidden p-1 flex flex-col max-h-72" style="z-index: 99999;" data-lenis-prevent="true">
                          <div class="orbit-searchbar-header sticky top-0 z-20 p-2 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/80 shrink-0">
                            <div class="relative w-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                              <input type="text" id="msg-channel-search-input" placeholder="Suchen..." class="orbit-searchbar-input w-full pl-9 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off" />
                            </div>
                          </div>
                          <div id="msg-channel-items" class="overflow-y-auto max-h-56 p-1 space-y-0.5" data-lenis-prevent="true">
                            ${allChannels.length > 0 ? allChannels.map(ch => `
                              <button type="button" data-pick-msg-channel="${escapeHtml(ch.id)}" data-ch-name="${escapeHtml((ch.name || '').toLowerCase())}" class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left hover:bg-neutral-800 transition-colors cursor-pointer ${String(ch.id) === String(state.channel_id) ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300'}">
                                <span class="text-neutral-500 font-mono">#</span>
                                <span class="truncate">${escapeHtml(ch.name)}</span>
                              </button>
                            `).join('') : `
                              <div class="px-3 py-3 text-xs text-neutral-500 text-center">Keine Textkanäle gefunden</div>
                            `}
                          </div>
                        </div>
                      ` : ''}
                    </div>

                    <span class="self-stretch w-px bg-neutral-800 mx-1.5"></span>

                    <!-- Mobilfreundlich -->
                    <button type="button" id="msg-mobile-btn" title="Mobilfreundlicher Modus: Alle eingebetteten Bilder werden so dimensioniert, dass sie auf Telefonen und Desktops gleich dargestellt werden. Klicken Sie zum Deaktivieren." class="inline-flex items-center gap-2 h-9 px-3.5 text-sm font-medium rounded-lg transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer ${mobileFriendly ? 'text-indigo-200 bg-indigo-500/15 hover:bg-indigo-500/25' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smartphone w-4 h-4">
                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
                        <path d="M12 18h.01"></path>
                      </svg>Mobilfreundlich</button>

                    <!-- An die Bibliothek senden -->
                    <button type="button" id="msg-save-lib-btn" title="Senden Sie diese Einbettung an die öffentliche Bibliothek" class="inline-flex items-center gap-2 h-9 px-3.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload w-4 h-4">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" x2="12" y1="3" y2="15"></line>
                      </svg>An die Bibliothek senden</button>

                    <!-- Schicken -->
                    <button type="button" id="msg-send-btn" ${(isSending || !state.channel_id || !hasAnyContent()) ? 'disabled=""' : ''} class="inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-4 h-4">
                        <path d="m22 2-7 20-4-9-9-4Z"></path>
                        <path d="M22 2 11 13"></path>
                      </svg>${isSending ? 'Sendet...' : 'Schicken'}</button>
                  </div>
                </div>

                <!-- Message Name Input -->
                <div class="mb-3 flex items-center gap-2">
                  <input id="msg-name-input" class="flex-1 bg-transparent text-sm text-neutral-400 hover:text-white focus:text-white border-0 border-b border-transparent hover:border-neutral-700 focus:border-indigo-500/40 focus:outline-none transition-colors px-1 py-0.5" placeholder="Unbenannte Nachricht" value="${escapeHtml(state.name)}">
                </div>

                <!-- 2-Column Workspace -->
                <div class="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-8">
                  <!-- Left Column: Interactive Discord Message Canvas -->
                  <div class="w-full lg:w-auto lg:flex-1 lg:max-w-[840px] min-w-0">
                    <div class="relative">
                      <div class="bg-[#313338] rounded-2xl p-3 sm:p-6 max-w-[800px]">
                        <div class="flex items-start gap-3 mb-2">
                          ${renderSenderAvatarHtml('w-10 h-10')}
                          <div class="flex-1 min-w-0">
                            <div class="flex items-baseline gap-2 mb-1">
                              <span class="text-sm font-semibold text-white">${escapeHtml(senderLabel)}</span>
                              <span class="inline-flex items-center gap-[0.15em] text-[10px] px-1 py-0.5 bg-indigo-500 text-white rounded font-bold">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="h-[0.85em] w-[0.85em]">
                                  <path d="M20 6 9 17l-5-5"></path>
                                </svg>APP</span>
                              <span class="text-[10px] text-neutral-500">Heute um 12:00 Uhr</span>
                            </div>

                            <!-- Editable Message Content -->
                            <div class="relative group opacity-70 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <div id="msg-content-editable" contenteditable="true" role="textbox" aria-multiline="true" class="outline-none text-sm text-white empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-600 rounded-md -mx-1 px-1 -my-0.5 py-0.5 select-text hover:shadow-[inset_0_0_0_1px_rgb(99_102_241_/_0.25)] focus:shadow-[inset_0_0_0_2px_rgb(99_102_241_/_0.6)] whitespace-pre-wrap !text-[14px] !text-neutral-100 leading-snug min-h-[1.5em]" data-placeholder="Message above the embed (optional)" style="user-select: text;">${escapeHtml(state.content)}</div>
                              <div id="msg-slash-vars-menu" class="hidden orbit-dropdown-menu absolute left-0 top-full mt-1 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 p-1.5">
                                <div class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Variablen einfügen</div>
                                ${VARIABLES.map(v => `
                                  <button type="button" data-insert-var="${escapeHtml(v.token)}" class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-neutral-800 text-left cursor-pointer">
                                    <code class="text-indigo-400 font-mono">${escapeHtml(v.token)}</code>
                                    <span class="text-[11px] text-neutral-400">${escapeHtml(v.desc)}</span>
                                  </button>
                                `).join('')}
                              </div>
                            </div>

                            <!-- Embed Editor or + Einbetten Button -->
                            <div id="msg-embed-editor-slot">
                              ${renderInteractiveEmbedEditorHtml()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="mt-4 flex justify-center">
                        <p class="inline-block px-2.5 py-1 rounded-md bg-white/[0.04] text-center text-[11px] text-neutral-500">Klicken Sie auf einen beliebigen Teil der Nachricht, um ihn zu bearbeiten. Typ <kbd class="px-1 py-0.5 text-[9px] bg-neutral-800 rounded border border-neutral-700">/</kbd> in jedem Text für Variablen.</p>
                      </div>
                    </div>
                  </div>

                  <!-- Right Column: Live Discord Preview -->
                  <div id="msg-right-preview" class="w-full lg:w-[640px] lg:flex-shrink-0 lg:sticky lg:top-4">
                    ${renderRightPreviewHtml()}
                  </div>
                </div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Top Tab Switcher
    document.getElementById('msg-tab-user')?.addEventListener('click', () => {
      activeTopTab = 'user_messages';
      render();
    });
    document.getElementById('msg-tab-bot')?.addEventListener('click', () => {
      activeTopTab = 'bot_messages';
      render();
    });

    // Bot-Nachrichten: Load card into editor
    container.querySelectorAll('[data-load-bot-card]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-load-bot-card');
        pushUndo();
        if (key === 'welcome') {
          const w = fullConfig.welcome || {};
          state.name = 'Willkommensnachricht';
          state.channel_id = w.channel_id ? String(w.channel_id) : state.channel_id;
          state.content = w.message || '';
          state.has_embed = true;
          state.title = w.embed_title || 'Willkommen auf {server}!';
          state.description = w.embed_description || 'Willkommen {user} auf **{server}**!';
          state.color = w.embed_color || '#5865F2';
          state.thumbnail = w.embed_thumbnail || '';
          state.image = w.embed_image || '';
          state.footer_text = w.embed_footer || '';
          state.author_name = w.embed_author || '';
        } else if (key === 'goodbye') {
          const g = fullConfig.goodbye || {};
          state.name = 'Abschiedsnachricht';
          state.channel_id = g.channel_id ? String(g.channel_id) : state.channel_id;
          state.content = g.message || '';
          state.has_embed = true;
          state.title = g.embed_title || 'Auf Wiedersehen!';
          state.description = g.embed_description || '{user.name} hat den Server verlassen.';
          state.color = g.embed_color || '#EF4444';
        } else if (key === 'boost') {
          const b = fullConfig.boost || {};
          state.name = 'Server-Boost-Nachricht';
          state.channel_id = b.channel_id ? String(b.channel_id) : state.channel_id;
          state.content = b.message || '';
          state.has_embed = true;
          state.title = b.embed_title || 'Neuer Server-Boost!';
          state.description = b.embed_description || 'Vielen Dank für deinen Boost, {user}!';
          state.color = b.embed_color || '#EB459E';
        } else if (key === 'verify') {
          const v = fullConfig.verify || {};
          state.name = 'Verifizierungs-Panel';
          state.has_embed = true;
          state.title = v.embed_title || 'Server Verification';
          state.description = v.embed_description || 'Klicke auf den Button unten, um dich zu verifizieren.';
          state.color = v.embed_color || '#5865F2';
        } else if (key === 'tickets') {
          const t = fullConfig.ticket || {};
          state.name = 'Ticket-Panel';
          state.channel_id = t.panel_channel_id ? String(t.panel_channel_id) : state.channel_id;
          state.has_embed = true;
          state.title = t.panel_title || 'Support Ticket Desk';
          state.description = t.panel_description || 'Wähle unten eine Kategorie aus, um ein Ticket zu erstellen.';
          state.color = '#5865F2';
        } else if (key === 'level') {
          const l = fullConfig.level || {};
          state.name = 'Level-Up-Nachricht';
          state.content = l.levelup_message_content || '{user}';
          state.has_embed = true;
          state.title = l.levelup_embed_title || 'Level Up!';
          state.description = l.levelup_embed_description || 'Glückwunsch {user}!';
          state.color = l.leaderboard_color || '#3B82F6';
        }
        activeTopTab = 'user_messages';
        render();
      });
    });

    if (activeTopTab !== 'user_messages') return;

    // Toolbar Popovers
    const togglePopover = (name, e) => {
      e.stopPropagation();
      openPopover = openPopover === name ? null : name;
      render();
      if (openPopover && window.OrbitDropdownManager) {
        window.OrbitDropdownManager.scheduleSync();
      }
    };

    document.getElementById('msg-new-btn')?.addEventListener('click', (e) => togglePopover('new', e));
    document.getElementById('msg-saved-btn')?.addEventListener('click', (e) => togglePopover('saved', e));
    document.getElementById('msg-sendas-btn')?.addEventListener('click', (e) => togglePopover('send_as', e));
    document.getElementById('msg-channel-btn')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (allChannels.length === 0) {
        try {
          const freshChannels = await API.getChannels(guildId);
          if (Array.isArray(freshChannels) && freshChannels.length > 0) {
            allChannels = freshChannels.filter(c => !c.type || c.type === 'text' || c.type === 'news' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text')));
          }
        } catch (_) {}
      }
      togglePopover('channel', e);
    });

    // Template picker
    container.querySelectorAll('[data-pick-template]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = btn.getAttribute('data-pick-template');
        const tpl = TEMPLATES.find(t => t.key === key);
        if (tpl) {
          pushUndo();
          Object.assign(state, JSON.parse(JSON.stringify(tpl.data)));
          state.id = '';
        }
        openPopover = null;
        render();
      });
    });

    // Saved Embeds picker & delete
    container.querySelectorAll('[data-load-saved]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-load-saved');
        const found = savedEmbeds.find(x => String(x.id) === String(id));
        if (found) {
          pushUndo();
          state.id = found.id || '';
          state.name = found.name || found.title || 'Untitled message';
          state.content = found.content || '';
          state.has_embed = found.has_embed !== undefined ? Boolean(found.has_embed) : Boolean(found.title || found.description || (found.fields && found.fields.length));
          state.title = found.title || '';
          state.url = found.url || '';
          state.description = found.description || '';
          state.color = found.color || '#5865F2';
          state.author_name = found.author_name || '';
          state.author_url = found.author_url || '';
          state.author_icon = found.author_icon || '';
          state.footer_text = found.footer_text || '';
          state.footer_icon = found.footer_icon || '';
          state.thumbnail = found.thumbnail || '';
          state.image = found.image || '';
          state.timestamp = Boolean(found.timestamp);
          state.fields = Array.isArray(found.fields) ? JSON.parse(JSON.stringify(found.fields)) : [];
          state.buttons = Array.isArray(found.buttons) ? JSON.parse(JSON.stringify(found.buttons)) : [];
        }
        openPopover = null;
        render();
      });
    });

    container.querySelectorAll('[data-delete-saved]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-delete-saved');
        if (!id) return;
        const targetEmb = savedEmbeds.find(x => String(x.id) === String(id));
        const confirmed = await window.confirmDelete({
          title: `${targetEmb?.name || 'Nachricht'} löschen?`,
          message: 'Das kann nicht rückgängig gemacht werden. Diese Vorlage wird dauerhaft entfernt.',
          confirmText: 'Löschen',
          cancelText: 'Abbrechen'
        });
        if (!confirmed) return;
        try {
          await API.deleteSavedEmbed(guildId, id);
          savedEmbeds = savedEmbeds.filter(x => String(x.id) !== String(id));
          if (String(state.id) === String(id)) state.id = '';
          render();
          if (window.Notifications) Notifications.show('Nachricht aus Bibliothek gelöscht', 'success');
        } catch (err) {
          if (window.Notifications) Notifications.show(err.message || 'Fehler beim Löschen', 'error');
        }
      });
    });

    // Undo / Redo buttons
    document.getElementById('msg-undo-btn')?.addEventListener('click', performUndo);
    document.getElementById('msg-redo-btn')?.addEventListener('click', performRedo);

    // Send As picker
    container.querySelectorAll('[data-pick-sendas]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.send_as = btn.getAttribute('data-pick-sendas') || 'bot';
        render();
      });
    });

    document.getElementById('msg-custom-sender-name')?.addEventListener('click', e => e.stopPropagation());
    document.getElementById('msg-custom-sender-name')?.addEventListener('input', (e) => {
      state.sender_name = e.target.value;
      updateToolbarStatesInPlace();
    });
    document.getElementById('msg-custom-sender-avatar')?.addEventListener('click', e => e.stopPropagation());
    document.getElementById('msg-custom-sender-avatar')?.addEventListener('input', (e) => {
      state.sender_avatar = e.target.value;
      updateToolbarStatesInPlace();
    });

    // Channel picker search & selection
    const msgChSearch = document.getElementById('msg-channel-search-input');
    if (msgChSearch) {
      setTimeout(() => msgChSearch.focus(), 30);
      msgChSearch.addEventListener('click', (e) => e.stopPropagation());
      msgChSearch.addEventListener('keydown', (e) => e.stopPropagation());
      msgChSearch.addEventListener('input', (e) => {
        const query = (e.target.value || '').toLowerCase().trim();
        const items = container.querySelectorAll('#msg-channel-items [data-pick-msg-channel]');
        items.forEach(it => {
          const name = it.getAttribute('data-ch-name') || '';
          it.style.display = (!query || name.includes(query)) ? '' : 'none';
        });
      });
    }

    container.querySelectorAll('[data-pick-msg-channel]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.channel_id = btn.getAttribute('data-pick-msg-channel') || '';
        openPopover = null;
        render();
      });
    });

    // Mobilfreundlich toggle
    document.getElementById('msg-mobile-btn')?.addEventListener('click', () => {
      mobileFriendly = !mobileFriendly;
      render();
    });

    // Save to Library ("An die Bibliothek senden")
    document.getElementById('msg-save-lib-btn')?.addEventListener('click', async () => {
      if (!hasAnyContent()) {
        if (window.Notifications) Notifications.show('Bitte fülle zuerst die Nachricht oder Einbettung aus.', 'error');
        return;
      }
      try {
        const payload = {
          id: state.id || undefined,
          name: (state.name || '').trim() || 'Untitled message',
          content: state.content,
          has_embed: state.has_embed,
          title: state.title,
          url: state.url,
          description: state.description,
          color: state.color,
          author_name: state.author_name,
          author_url: state.author_url,
          author_icon: state.author_icon,
          footer_text: state.footer_text,
          footer_icon: state.footer_icon,
          thumbnail: state.thumbnail,
          image: state.image,
          timestamp: state.timestamp,
          fields: state.fields,
          buttons: state.buttons
        };
        const res = await API.saveCustomEmbed(guildId, payload);
        if (res?.id) {
          state.id = res.id;
          payload.id = res.id;
          const idx = savedEmbeds.findIndex(x => String(x.id) === String(res.id));
          if (idx >= 0) savedEmbeds[idx] = payload;
          else savedEmbeds.push(payload);
        }
        if (window.Notifications) Notifications.show('In der Bibliothek gespeichert!', 'success');
      } catch (err) {
        if (window.Notifications) Notifications.show(err.message || 'Fehler beim Speichern', 'error');
      }
    });

    // Send Message ("Schicken")
    document.getElementById('msg-send-btn')?.addEventListener('click', async () => {
      if (isSending || !state.channel_id || !hasAnyContent()) return;
      isSending = true;
      updateToolbarStatesInPlace();
      try {
        await API.sendCustomEmbed(guildId, {
          channel_id: state.channel_id,
          send_as: state.send_as === 'bot' ? 'bot' : 'webhook',
          sender_name: state.send_as === 'bot' ? botDisplayName : (state.sender_name || currentGuild.name),
          sender_avatar: state.send_as === 'bot' ? botAvatarUrl : (state.sender_avatar || guildIconUrl),
          content: state.content,
          has_embed: state.has_embed,
          title: state.title,
          url: state.url,
          description: state.description,
          color: state.color,
          author_name: state.author_name,
          author_url: state.author_url,
          author_icon: state.author_icon,
          footer_text: state.footer_text,
          footer_icon: state.footer_icon,
          thumbnail: state.thumbnail,
          image: state.image,
          timestamp: state.timestamp,
          fields: state.fields,
          buttons: state.buttons
        });
        if (window.Notifications) {
          Notifications.show('Nachricht erfolgreich in Discord gesendet!', 'success');
        }
      } catch (err) {
        if (window.Notifications) {
          Notifications.show(err.message || 'Fehler beim Senden der Nachricht', 'error');
        }
      } finally {
        isSending = false;
        updateToolbarStatesInPlace();
      }
    });

    // Message Name Input
    document.getElementById('msg-name-input')?.addEventListener('input', (e) => {
      state.name = e.target.value;
    });

    // Editable Message Content & "/" Variable Autocomplete
    const contentEl = document.getElementById('msg-content-editable');
    const slashMenu = document.getElementById('msg-slash-vars-menu');
    if (contentEl) {
      contentEl.addEventListener('focus', () => pushUndo());
      contentEl.addEventListener('input', () => {
        state.content = contentEl.innerText || '';
        if (state.content.endsWith('/')) {
          slashMenu?.classList.remove('hidden');
        } else {
          slashMenu?.classList.add('hidden');
        }
        updateToolbarStatesInPlace();
      });
    }

    container.querySelectorAll('[data-insert-var]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const token = btn.getAttribute('data-insert-var') || '';
        if (state.content.endsWith('/')) {
          state.content = state.content.slice(0, -1) + token;
        } else {
          state.content = (state.content ? state.content + ' ' : '') + token;
        }
        slashMenu?.classList.add('hidden');
        render();
      });
    });

    // + Einbetten & Remove Embed
    document.getElementById('msg-add-embed-btn')?.addEventListener('click', () => {
      pushUndo();
      state.has_embed = true;
      render();
    });

    document.getElementById('msg-remove-embed-btn')?.addEventListener('click', () => {
      pushUndo();
      state.has_embed = false;
      render();
    });

    // Embed Editor Inputs (in-place sync to right preview)
    container.querySelectorAll('[data-emb-color]').forEach(btn => {
      btn.addEventListener('click', () => {
        pushUndo();
        state.color = btn.getAttribute('data-emb-color') || '#5865F2';
        render();
      });
    });

    document.getElementById('msg-emb-custom-color')?.addEventListener('input', (e) => {
      state.color = e.target.value;
      updateToolbarStatesInPlace();
    });

    const bindEmbInput = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('focus', () => pushUndo());
      el.addEventListener('input', (e) => {
        state[key] = e.target.value;
        updateToolbarStatesInPlace();
      });
    };

    bindEmbInput('msg-emb-author-name', 'author_name');
    bindEmbInput('msg-emb-author-icon', 'author_icon');
    bindEmbInput('msg-emb-title', 'title');
    bindEmbInput('msg-emb-url', 'url');
    bindEmbInput('msg-emb-description', 'description');
    bindEmbInput('msg-emb-image-url', 'image');
    bindEmbInput('msg-emb-footer-text', 'footer_text');
    bindEmbInput('msg-emb-footer-icon', 'footer_icon');

    document.getElementById('msg-emb-timestamp')?.addEventListener('change', (e) => {
      pushUndo();
      state.timestamp = Boolean(e.target.checked);
      updateToolbarStatesInPlace();
    });

    // Thumbnail & Main Image file upload
    const handleImageFileUpload = async (file, key) => {
      if (!file) return;
      try {
        if (window.Notifications) Notifications.show('Bild wird hochgeladen...', 'info');
        const res = await API.uploadImage(file);
        if (res?.url) {
          pushUndo();
          state[key] = res.url;
          render();
          if (window.Notifications) Notifications.show('Bild erfolgreich hochgeladen!', 'success');
        }
      } catch (err) {
        if (window.Notifications) Notifications.show(err.message || 'Bild-Upload fehlgeschlagen', 'error');
      }
    };

    document.getElementById('msg-emb-thumb-file')?.addEventListener('change', (e) => {
      handleImageFileUpload(e.target.files?.[0], 'thumbnail');
    });
    document.getElementById('msg-emb-clear-thumb')?.addEventListener('click', () => {
      pushUndo();
      state.thumbnail = '';
      render();
    });
    document.getElementById('msg-emb-image-file')?.addEventListener('change', (e) => {
      handleImageFileUpload(e.target.files?.[0], 'image');
    });

    // Embed Fields
    document.getElementById('msg-emb-add-field')?.addEventListener('click', () => {
      if (state.fields.length >= 25) return;
      pushUndo();
      state.fields.push({ name: 'Neues Feld', value: 'Feldwert...', inline: false });
      render();
    });

    container.querySelectorAll('[data-field-name]').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(inp.getAttribute('data-field-name'), 10);
        if (state.fields[idx]) {
          state.fields[idx].name = e.target.value;
          updateToolbarStatesInPlace();
        }
      });
    });

    container.querySelectorAll('[data-field-value]').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(inp.getAttribute('data-field-value'), 10);
        if (state.fields[idx]) {
          state.fields[idx].value = e.target.value;
          updateToolbarStatesInPlace();
        }
      });
    });

    container.querySelectorAll('[data-field-inline]').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const idx = parseInt(chk.getAttribute('data-field-inline'), 10);
        if (state.fields[idx]) {
          state.fields[idx].inline = Boolean(e.target.checked);
          updateToolbarStatesInPlace();
        }
      });
    });

    container.querySelectorAll('[data-field-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-field-remove'), 10);
        pushUndo();
        state.fields.splice(idx, 1);
        render();
      });
    });

    // Link Buttons
    document.getElementById('msg-emb-add-btn')?.addEventListener('click', () => {
      if (state.buttons.length >= 5) return;
      pushUndo();
      state.buttons.push({ label: 'Website öffnen', url: 'https://' });
      render();
    });

    container.querySelectorAll('[data-btn-label]').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(inp.getAttribute('data-btn-label'), 10);
        if (state.buttons[idx]) {
          state.buttons[idx].label = e.target.value;
          updateToolbarStatesInPlace();
        }
      });
    });

    container.querySelectorAll('[data-btn-url]').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(inp.getAttribute('data-btn-url'), 10);
        if (state.buttons[idx]) {
          state.buttons[idx].url = e.target.value;
          updateToolbarStatesInPlace();
        }
      });
    });

    container.querySelectorAll('[data-btn-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-btn-remove'), 10);
        pushUndo();
        state.buttons.splice(idx, 1);
        render();
      });
    });

    // Global outside click & keyboard shortcuts (Ctrl+Z / Ctrl+Y)
    if (!window.__orbitMessagesGlobalBound) {
      window.__orbitMessagesGlobalBound = true;
      document.addEventListener('click', () => {
        if (openPopover && document.getElementById('msg-new-btn')) {
          openPopover = null;
          render();
        }
      });
      document.addEventListener('keydown', (e) => {
        if (!document.getElementById('msg-new-btn')) return;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          if (e.shiftKey) {
            e.preventDefault();
            performRedo();
          } else if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            e.preventDefault();
            performUndo();
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          performRedo();
        }
      });
    }
  }

  render();
};
