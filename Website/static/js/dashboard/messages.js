/**
 * Orbit Dashboard - Messages & Embed Builder Tab
 * Supports both custom channel messages and dedicated Feature Slots (e.g. Moderation DMs)
 * 1:1 PeakBot Embed Builder UI & WYSIWYG Functionality
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

  // Check URL params for slot mode (e.g. embed-builder?slot=moderation.warn_dm&from=moderation)
  const urlParams = new URLSearchParams(window.location.search);
  let slotParam = urlParams.get('slot');
  let fromParam = urlParams.get('from');
  const isEmbedBuilderPath = window.location.pathname.includes('/embed-builder');

  if (isEmbedBuilderPath && !slotParam) {
    slotParam = 'moderation.warn_dm';
    fromParam = fromParam || 'moderation';
  }
  if (slotParam === 'moderation.mute_dm') {
    slotParam = 'moderation.timeout_dm';
  }

  const isSlotMode = Boolean(slotParam);
  let currentSlot = slotParam || 'moderation.warn_dm';
  let personalizeTab = 'this'; // 'this' | 'every'
  let lastFocusedInput = null;

  // Moderation Slots Definitions
  const MODERATION_SLOTS = {
    'moderation.warn_dm': {
      actionKey: 'warn_dm',
      tabLabel: 'Warn',
      title: 'Moderation — Warn DM',
      subtitle: 'Sent privately to a member when a moderator warns them.',
      switchLabel: 'Warn DM on or off',
      infoNote: 'Sent by /warn, the "Warn instead" button on /kick or a warning from the dashboard. Members who don\'t accept DMs from this server won\'t get it, and the action still goes through. Only link buttons work in a DM.',
      defaultTemplate: {
        content: '',
        has_embed: true,
        title: 'You received a warning in {server.name}',
        description: 'A moderator gave you a warning. Please read the server rules so it does not happen again.',
        color: '#5865F2',
        thumbnail: 'server_icon',
        timestamp: true,
        fields: [
          { name: 'Reason', value: '{case.reason}', inline: false },
          { name: 'Moderator', value: '{case.moderator}', inline: true },
          { name: 'Total warnings', value: '{case.warning_count}', inline: true },
          { name: 'Case ID', value: '#{case.id}', inline: true }
        ]
      },
      sampleVars: {
        '{server.name}': currentGuild.name || 'Your Server',
        '{server}': currentGuild.name || 'Your Server',
        '{case.reason}': 'Spamming in #general',
        '{case.moderator}': '@ModSquad',
        '{case.warning_count}': '2',
        '{case.id}': '102',
        '{user.name}': 'Lukas',
        '{user.mention}': '@Lukas',
        '{server.member_count}': String(currentGuild.member_count || 100)
      },
      contextTokens: [
        { token: '{case.id}', label: '@case number', desc: 'The moderation case number. · e.g. 102' },
        { token: '{case.reason}', label: '@reason', desc: 'Why the action was taken. · e.g. Spamming' },
        { token: '{case.moderator}', label: '@moderator', desc: 'Who took the action. · e.g. @ModSquad' },
        { token: '{case.warning_count}', label: '@warning count', desc: 'How many warnings they have now. · e.g. 2' }
      ]
    },
    'moderation.timeout_dm': {
      actionKey: 'timeout_dm',
      tabLabel: 'Timeout',
      title: 'Moderation — Timeout DM',
      subtitle: 'Sent privately to a member when a moderator times them out.',
      switchLabel: 'Timeout DM on or off',
      infoNote: 'Sent by /timeout, automod filters or a timeout from the dashboard. Members who don\'t accept DMs from this server won\'t get it, and the action still goes through. Only link buttons work in a DM.',
      defaultTemplate: {
        content: '',
        has_embed: true,
        title: 'You were timed out in {server.name}',
        description: 'A moderator timed you out. You cannot send messages or join voice channels until the timeout ends.',
        color: '#F59E0B',
        thumbnail: 'server_icon',
        timestamp: true,
        fields: [
          { name: 'Reason', value: '{case.reason}', inline: false },
          { name: 'Duration', value: '{case.duration}', inline: true },
          { name: 'Moderator', value: '{case.moderator}', inline: true },
          { name: 'Case ID', value: '#{case.id}', inline: true }
        ]
      },
      sampleVars: {
        '{server.name}': currentGuild.name || 'Your Server',
        '{server}': currentGuild.name || 'Your Server',
        '{case.reason}': 'Inappropriate language in chat',
        '{case.duration}': '15 minutes',
        '{case.moderator}': '@ModSquad',
        '{case.id}': '103',
        '{user.name}': 'Lukas',
        '{user.mention}': '@Lukas',
        '{server.member_count}': String(currentGuild.member_count || 100)
      },
      contextTokens: [
        { token: '{case.id}', label: '@case number', desc: 'The moderation case number. · e.g. 103' },
        { token: '{case.reason}', label: '@reason', desc: 'Why the action was taken. · e.g. Inappropriate language' },
        { token: '{case.duration}', label: '@duration', desc: 'How long the timeout lasts. · e.g. 15 minutes' },
        { token: '{case.moderator}', label: '@moderator', desc: 'Who took the action. · e.g. @ModSquad' }
      ]
    },
    'moderation.kick_dm': {
      actionKey: 'kick_dm',
      tabLabel: 'Kick',
      title: 'Moderation — Kick DM',
      subtitle: 'Sent privately to a member when a moderator kicks them.',
      switchLabel: 'Kick DM on or off',
      infoNote: 'Sent by /kick, automod kick actions or an action from the dashboard. Members who don\'t accept DMs from this server won\'t get it, and the action still goes through. Only link buttons work in a DM.',
      defaultTemplate: {
        content: '',
        has_embed: true,
        title: 'You were removed from {server.name}',
        description: 'A moderator removed you from the server. You can rejoin with an invite, but please read the rules first.',
        color: '#EF4444',
        thumbnail: 'server_icon',
        timestamp: true,
        fields: [
          { name: 'Reason', value: '{case.reason}', inline: false },
          { name: 'Moderator', value: '{case.moderator}', inline: true },
          { name: 'Case ID', value: '#{case.id}', inline: true }
        ]
      },
      sampleVars: {
        '{server.name}': currentGuild.name || 'Your Server',
        '{server}': currentGuild.name || 'Your Server',
        '{case.reason}': 'Repeated advertising after warnings',
        '{case.moderator}': '@ModSquad',
        '{case.id}': '104',
        '{user.name}': 'Lukas',
        '{user.mention}': '@Lukas',
        '{server.member_count}': String(currentGuild.member_count || 100)
      },
      contextTokens: [
        { token: '{case.id}', label: '@case number', desc: 'The moderation case number. · e.g. 104' },
        { token: '{case.reason}', label: '@reason', desc: 'Why the action was taken. · e.g. Repeated advertising' },
        { token: '{case.moderator}', label: '@moderator', desc: 'Who took the action. · e.g. @ModSquad' }
      ]
    },
    'moderation.ban_dm': {
      actionKey: 'ban_dm',
      tabLabel: 'Ban',
      title: 'Moderation — Ban DM',
      subtitle: 'Sent privately to a member when a moderator bans them.',
      switchLabel: 'Ban DM on or off',
      infoNote: 'Sent by /ban, automod ban actions or an action from the dashboard. Members who don\'t accept DMs from this server won\'t get it, and the action still goes through. Only link buttons work in a DM.',
      defaultTemplate: {
        content: '',
        has_embed: true,
        title: 'You were banned from {server.name}',
        description: 'A moderator banned you from the server.',
        color: '#DC2626',
        thumbnail: 'server_icon',
        timestamp: true,
        fields: [
          { name: 'Reason', value: '{case.reason}', inline: false },
          { name: 'Moderator', value: '{case.moderator}', inline: true },
          { name: 'Case ID', value: '#{case.id}', inline: true }
        ]
      },
      sampleVars: {
        '{server.name}': currentGuild.name || 'Your Server',
        '{server}': currentGuild.name || 'Your Server',
        '{case.reason}': 'Severe violations of Discord Terms of Service',
        '{case.moderator}': '@ModSquad',
        '{case.id}': '105',
        '{user.name}': 'Lukas',
        '{user.mention}': '@Lukas',
        '{server.member_count}': String(currentGuild.member_count || 100)
      },
      contextTokens: [
        { token: '{case.id}', label: '@case number', desc: 'The moderation case number. · e.g. 105' },
        { token: '{case.reason}', label: '@reason', desc: 'Why the action was taken. · e.g. Severe violation' },
        { token: '{case.moderator}', label: '@moderator', desc: 'Who took the action. · e.g. @ModSquad' }
      ]
    }
  };

  const GLOBAL_TOKENS = [
    { token: '{server.name}', label: '@server name', desc: 'The name of this server. · e.g. ' + (currentGuild.name || 'Your Server') },
    { token: '{user.name}', label: '@member name', desc: 'The member\'s username. · e.g. Lukas' },
    { token: '{user.mention}', label: '@member mention', desc: 'Mentions the member. · e.g. @Lukas' },
    { token: '{server.member_count}', label: '@member count', desc: 'Total members in server. · e.g. ' + (currentGuild.member_count || 100) },
    { token: '{server.icon}', label: '@server icon', desc: 'The server icon image URL.' }
  ];

  const VARIABLES = [
    { token: '{user}', desc: 'Mentions user (@User)' },
    { token: '{user.name}', desc: 'User display name' },
    { token: '{server}', desc: 'Discord server name' },
    { token: '{membercount}', desc: 'Current member count' }
  ];

  const TEMPLATES = [
    {
      key: 'blank',
      label: 'Empty Message',
      desc: 'Start completely blank',
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
      label: '📜 Server Rules',
      desc: 'Structured rules for new members',
      data: {
        name: 'Server Rules',
        content: '',
        has_embed: true,
        title: '📜 Official Server Rules — {server}',
        url: '',
        description: 'Please read our rules carefully so everyone can enjoy their time on **{server}**.',
        color: '#5865F2',
        author_name: '{server} Administration',
        author_url: '',
        author_icon: '',
        footer_text: 'By staying in this server you accept these rules.',
        footer_icon: '',
        thumbnail: '',
        image: '',
        timestamp: true,
        fields: [
          { name: '1. Respectful Conduct', value: 'Treat all members kindly. Harassment and hate speech will not be tolerated.', inline: false },
          { name: '2. No Spam & Advertising', value: 'Avoid message spam, excessive caps, and unsolicited invite links.', inline: false },
          { name: '3. Use Correct Channels', value: 'Follow channel topics and keep discussions in their designated areas.', inline: false }
        ],
        buttons: []
      }
    },
    {
      key: 'announcement',
      label: '📢 Announcement',
      desc: 'Important news for your community',
      data: {
        name: 'Community Announcement',
        content: '📢 **Important news for {server}!**',
        has_embed: true,
        title: '🚀 Major Server Update is Live!',
        url: '',
        description: 'Hello everyone! We have set up new features, channels, and roles for our **{membercount}** members.\n\nTake a look around and give us your feedback!',
        color: '#10B981',
        author_name: 'Server Team',
        author_url: '',
        author_icon: '',
        footer_text: '{server} • Announcement',
        footer_icon: '',
        thumbnail: '',
        image: '',
        timestamp: true,
        fields: [
          { name: '✨ What is new?', value: '• New ticket system\n• Updated self roles\n• Fresh event channels', inline: true },
          { name: '📅 When?', value: 'Live now for everyone!', inline: true }
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
    sender_name: currentGuild.name || 'Server',
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
    if ((state.content || '').trim()) return true;
    if (state.has_embed) {
      if ((state.title || '').trim()) return true;
      if ((state.description || '').trim()) return true;
      if ((state.author_name || '').trim()) return true;
      if ((state.footer_text || '').trim()) return true;
      if ((state.image || '').trim()) return true;
      if ((state.thumbnail || '').trim()) return true;
      if (state.fields && state.fields.length > 0) return true;
    }
    return false;
  }

  function loadSlotData(slotKey) {
    const sDef = MODERATION_SLOTS[slotKey] || MODERATION_SLOTS['moderation.warn_dm'];
    const automodCfg = fullConfig.automod || {};
    const dmTemplates = automodCfg.dm_templates || {};
    const saved = dmTemplates[slotKey];
    const def = sDef.defaultTemplate;

    state.name = sDef.title;
    state.send_as = 'bot';
    state.sender_name = botDisplayName;
    state.sender_avatar = botAvatarUrl;

    if (saved) {
      state.content = saved.content || '';
      state.has_embed = saved.has_embed !== false;
      state.title = saved.title !== undefined ? saved.title : def.title;
      state.description = saved.description !== undefined ? saved.description : def.description;
      state.color = saved.color || def.color;
      state.author_name = saved.author_name || '';
      state.author_icon = saved.author_icon || '';
      state.author_url = saved.author_url || '';
      state.footer_text = saved.footer_text || '';
      state.footer_icon = saved.footer_icon || '';
      state.thumbnail = saved.thumbnail || def.thumbnail;
      state.image = saved.image || '';
      state.timestamp = saved.timestamp !== undefined ? saved.timestamp : def.timestamp;
      state.fields = Array.isArray(saved.fields) ? JSON.parse(JSON.stringify(saved.fields)) : JSON.parse(JSON.stringify(def.fields));
      state.buttons = Array.isArray(saved.buttons) ? JSON.parse(JSON.stringify(saved.buttons)) : [];
    } else {
      state.content = def.content || '';
      state.has_embed = true;
      state.title = def.title;
      state.description = def.description;
      state.color = def.color;
      state.author_name = '';
      state.author_icon = '';
      state.author_url = '';
      state.footer_text = '';
      state.footer_icon = '';
      state.thumbnail = def.thumbnail;
      state.image = '';
      state.timestamp = def.timestamp;
      state.fields = JSON.parse(JSON.stringify(def.fields));
      state.buttons = [];
    }
  }

  if (isSlotMode) {
    loadSlotData(currentSlot);
  }

  function resolvePreviewVars(text) {
    if (!text) return '';
    let res = String(text);

    if (isSlotMode) {
      const sDef = MODERATION_SLOTS[currentSlot] || MODERATION_SLOTS['moderation.warn_dm'];
      const vars = {
        ...sDef.sampleVars,
        '{server.name}': currentGuild.name || 'Your Server',
        '{server}': currentGuild.name || 'Your Server',
        '{user.name}': 'Lukas',
        '{user.mention}': '@Lukas',
        '{user}': '@Lukas',
        '{server.member_count}': String(currentGuild.member_count || 100)
      };
      for (const [k, v] of Object.entries(vars)) {
        res = res.split(k).join(v);
      }
    } else {
      res = res.replace(/{user}/g, '@User')
               .replace(/{user.name}/g, 'Member')
               .replace(/{server}/g, currentGuild.name || 'Server')
               .replace(/{membercount}/g, String(currentGuild.member_count || 100));
    }

    return res;
  }

  function formatDiscordText(text) {
    if (!text) return '';
    let escaped = escapeHtml(resolvePreviewVars(text));
    // Code blocks ```
    escaped = escaped.replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre class="bg-black/40 border border-white/10 rounded p-2 text-xs font-mono my-1 overflow-x-auto">$1</pre>');
    // Inline code `
    escaped = escaped.replace(/\`([^\`]+)\`/g, '<code class="bg-black/30 border border-white/10 rounded px-1 text-xs font-mono text-indigo-300">$1</code>');
    // Bold **text**
    escaped = escaped.replace(/\*\*([^\*]+)\*\*/g, '<strong class="font-bold">$1</strong>');
    // Italic *text* or _text_
    escaped = escaped.replace(/\*([^\*]+)\*/g, '<em class="italic">$1</em>');
    // Blockquote
    escaped = escaped.replace(/^> (.*)$/gm, '<blockquote class="border-l-2 border-neutral-600 pl-2 text-neutral-300 my-0.5">$1</blockquote>');
    return escaped;
  }

  function renderSenderAvatarHtml(sizeCls = 'w-10 h-10') {
    if (state.send_as === 'bot') {
      return `<img src="${escapeHtml(botAvatarUrl)}" alt="" class="${sizeCls} rounded-full object-cover flex-shrink-0 bg-neutral-800">`;
    }
    if (state.sender_avatar && state.sender_avatar.trim()) {
      return `<img src="${escapeHtml(state.sender_avatar)}" alt="" class="${sizeCls} rounded-full object-cover flex-shrink-0 bg-neutral-800">`;
    }
    const initial = (currentGuild.name || 'S').charAt(0).toUpperCase();
    return `
      <div class="${sizeCls} rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
        ${escapeHtml(initial)}
      </div>
    `;
  }

  function renderRightPreviewHtml() {
    if (!hasAnyContent()) {
      return `
        <div class="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 px-4 py-6 text-center">
          <p class="text-[12px] text-neutral-500">No preview yet – start typing your message above to preview.</p>
        </div>
      `;
    }

    const sName = state.send_as === 'bot' ? botDisplayName : (state.sender_name || currentGuild.name || 'Orbit');
    const hasEmb = state.has_embed && (
      (state.title || '').trim() ||
      (state.description || '').trim() ||
      (state.author_name || '').trim() ||
      (state.footer_text || '').trim() ||
      (state.image || '').trim() ||
      (state.thumbnail || '').trim() ||
      state.fields.some(f => (f.name || '').trim() || (f.value || '').trim())
    );

    let thumbUrl = '';
    if (state.thumbnail === 'server_icon' || state.thumbnail === 'server') {
      thumbUrl = guildIconUrl || '';
    } else if (state.thumbnail && state.thumbnail.trim()) {
      thumbUrl = state.thumbnail.trim();
    }

    return `
      <div class="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-xs font-medium text-neutral-300">Discord Live Preview</span>
          </div>
          <span class="text-[11px] text-neutral-500">${mobileFriendly ? '📱 Mobile-friendly' : '🖥️ Desktop mode'}</span>
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
                <span class="text-[10px] text-neutral-400">Today at 12:00 PM</span>
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

                    ${thumbUrl ? `
                      <img src="${escapeHtml(thumbUrl)}" alt="Thumbnail" class="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover flex-shrink-0 bg-neutral-800">
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
                      <span>${formatDiscordText((state.footer_text || ''))}${state.footer_text && state.timestamp ? ' • ' : ''}${state.timestamp ? 'Today at 12:00 PM' : ''}</span>
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
    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
    if (sendBtn) sendBtn.disabled = isSending || !state.channel_id || !hasAnyContent();

    const rightPreview = document.getElementById('msg-right-preview');
    if (rightPreview) {
      rightPreview.innerHTML = renderRightPreviewHtml();
    }
  }

  function renderInteractiveEmbedEditorHtml() {
    if (!state.has_embed) {
      return `
        <div class="mt-2">
          <button type="button" id="msg-add-embed-btn" class="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md text-[11px] font-medium border border-dashed border-neutral-700 text-neutral-500 hover:text-indigo-300 hover:border-indigo-400/50 hover:bg-indigo-500/5 transition-colors cursor-pointer" title="Add an embed to this message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3.5 h-3.5">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>Embed</button>
        </div>
      `;
    }

    return `
      <div class="mt-3 relative rounded-lg bg-[#2b2d31] border-l-4 p-4 space-y-3 shadow-inner" style="border-left-color: ${escapeHtml(state.color || '#5865F2')};">
        <!-- Top Bar: Color Picker & Remove Embed -->
        <div class="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[11px] font-medium text-neutral-400 mr-1">Color:</span>
            ${PRESET_COLORS.map(c => `
              <button type="button" data-emb-color="${escapeHtml(c)}" class="w-4 h-4 rounded-full border transition-transform cursor-pointer ${state.color.toLowerCase() === c.toLowerCase() ? 'border-white scale-125' : 'border-black/40 hover:scale-110'}" style="background-color: ${escapeHtml(c)};"></button>
            `).join('')}
            <input type="color" id="msg-emb-custom-color" value="${escapeHtml(state.color.startsWith('#') ? state.color : '#5865F2')}" class="w-5 h-5 rounded bg-transparent border-0 cursor-pointer ml-1" title="Custom color">
          </div>
          ${!isSlotMode ? `
            <button type="button" id="msg-remove-embed-btn" class="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-neutral-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer" title="Remove embed">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              Remove
            </button>
          ` : ''}
        </div>

        <!-- Author & Thumbnail Row -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0 space-y-2">
            <!-- Author inputs -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <input id="msg-emb-author-name" type="text" placeholder="Author Name (optional)" value="${escapeHtml(state.author_name)}" class="sm:col-span-2 px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-white placeholder-neutral-500 focus:outline-none">
              <input id="msg-emb-author-icon" type="text" placeholder="Author Icon URL" value="${escapeHtml(state.author_icon)}" class="px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-white placeholder-neutral-500 focus:outline-none">
            </div>

            <!-- Title & URL -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <input id="msg-emb-title" type="text" placeholder="Embed Title" value="${escapeHtml(state.title)}" class="sm:col-span-2 px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-sm font-semibold text-white placeholder-neutral-500 focus:outline-none">
              <input id="msg-emb-url" type="text" placeholder="Title Link (https://...)" value="${escapeHtml(state.url)}" class="px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-white placeholder-neutral-500 focus:outline-none">
            </div>

            <!-- Description -->
            <div>
              <textarea id="msg-emb-description" rows="3" placeholder="Embed description (supports Markdown & / for variables)..." class="w-full px-2.5 py-2 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none resize-y">${escapeHtml(state.description)}</textarea>
            </div>
          </div>

          <!-- Thumbnail Slot -->
          <div class="flex flex-col items-center gap-1 flex-shrink-0">
            ${isSlotMode ? `
              <button type="button" id="slot-thumbnail-btn" class="w-20 h-20 relative flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/15 border border-indigo-400/40 rounded hover:from-indigo-500/30 hover:to-purple-500/20 transition-colors group">
                <div class="w-10 h-10 rounded-full bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                  ${guildIconUrl ? `<img src="${escapeHtml(guildIconUrl)}" class="w-full h-full object-cover" />` : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image w-5 h-5 text-indigo-200"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`}
                </div>
                <span class="px-2 py-0.5 rounded bg-indigo-500/40 text-indigo-100 text-[10px] font-medium border border-indigo-400/40">Server icon</span>
              </button>
            ` : `
              <label class="relative w-16 h-16 rounded-lg bg-[#1e1f22] border border-dashed border-neutral-700 hover:border-indigo-400 flex flex-col items-center justify-center cursor-pointer overflow-hidden group" title="Upload thumbnail">
                <input type="file" id="msg-emb-thumb-file" accept="image/*" class="hidden">
                ${state.thumbnail ? `
                  <img src="${escapeHtml(state.thumbnail)}" alt="Thumbnail" class="w-full h-full object-cover">
                ` : `
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image text-neutral-500 group-hover:text-indigo-300"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                  <span class="text-[9px] text-neutral-500 mt-0.5">Thumb</span>
                `}
              </label>
              ${state.thumbnail ? `
                <button type="button" id="msg-emb-clear-thumb" class="text-[10px] text-rose-400 hover:underline cursor-pointer">Delete</button>
              ` : ''}
            `}
          </div>
        </div>

        <!-- Fields Section -->
        <div class="space-y-2 pt-1">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Fields (${state.fields.length}/25)</span>
            <button type="button" id="msg-emb-add-field" class="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-200 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
              Add Field
            </button>
          </div>
          ${state.fields.length > 0 ? `
            <div class="space-y-2">
              ${state.fields.map((f, idx) => `
                <div class="group relative p-2.5 rounded-lg bg-[#1e1f22] border border-white/[0.06] hover:border-indigo-400/30 transition-colors space-y-1.5">
                  <div class="flex items-center gap-2">
                    <input type="text" data-field-name="${idx}" placeholder="Field Name" value="${escapeHtml(f.name)}" class="flex-1 min-w-0 px-2 py-1 rounded bg-[#2b2d31] border border-white/[0.06] text-xs font-semibold text-white placeholder-neutral-500 focus:outline-none">
                    
                    <button type="button" data-field-inline="${idx}" class="inline-flex items-center gap-1 px-1.5 h-6 rounded text-[10px] font-medium border transition-colors cursor-pointer ${f.inline ? 'bg-indigo-500/15 border-indigo-400/50 text-indigo-200' : 'bg-transparent border-neutral-700 text-neutral-500 hover:text-neutral-300'}" title="${f.inline ? 'Inline — sits next to other inline fields' : 'Block — fills the full row width'}">
                      ${f.inline ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-2.5 h-2.5"><path d="M20 6 9 17l-5-5"></path></svg>` : ''}
                      Inline
                    </button>

                    <div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      ${idx > 0 ? `
                        <button type="button" data-field-up="${idx}" class="w-6 h-6 inline-flex items-center justify-center rounded text-neutral-400 hover:text-indigo-300 hover:bg-indigo-500/10 cursor-pointer" title="Move up">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"></path></svg>
                        </button>
                      ` : ''}
                      ${idx < state.fields.length - 1 ? `
                        <button type="button" data-field-down="${idx}" class="w-6 h-6 inline-flex items-center justify-center rounded text-neutral-400 hover:text-indigo-300 hover:bg-indigo-500/10 cursor-pointer" title="Move down">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
                        </button>
                      ` : ''}
                      <button type="button" data-field-remove="${idx}" class="w-6 h-6 inline-flex items-center justify-center rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer" title="Remove field">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                  <textarea rows="2" data-field-value="${idx}" placeholder="Field value..." class="w-full px-2 py-1 rounded bg-[#2b2d31] border border-white/[0.06] text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none">${escapeHtml(f.value)}</textarea>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Main Image Row -->
        <div class="pt-1">
          <div class="flex items-center gap-2">
            <input id="msg-emb-image-url" type="text" placeholder="Main image URL (https://...) or upload on right" value="${escapeHtml(state.image)}" class="flex-1 min-w-0 px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-white placeholder-neutral-500 focus:outline-none">
            <label class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-neutral-200 cursor-pointer flex-shrink-0">
              <input type="file" id="msg-emb-image-file" accept="image/*" class="hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></path></svg>
              Image
            </label>
          </div>
        </div>

        <!-- Footer & Timestamp Row -->
        <div class="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-1.5 items-center pt-1">
          <input id="msg-emb-footer-text" type="text" placeholder="Footer text (optional)" value="${escapeHtml(state.footer_text)}" class="px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-white placeholder-neutral-500 focus:outline-none">
          <input id="msg-emb-footer-icon" type="text" placeholder="Footer Icon URL" value="${escapeHtml(state.footer_icon)}" class="px-2.5 py-1.5 rounded bg-[#1e1f22] border border-white/[0.06] focus:border-indigo-500/60 text-xs text-white placeholder-neutral-500 focus:outline-none">
          <label class="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs text-neutral-300 cursor-pointer select-none">
            <input type="checkbox" id="msg-emb-timestamp" ${state.timestamp ? 'checked' : ''} class="rounded border-neutral-600">
            Timestamp
          </label>
        </div>

        ${!isSlotMode ? `
          <!-- Link Buttons Section -->
          <div class="space-y-2 pt-2 border-t border-white/[0.06]">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Link Buttons (${state.buttons.length}/5)</span>
              ${state.buttons.length < 5 ? `
                <button type="button" id="msg-emb-add-btn" class="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-200 transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                  Link Button
                </button>
              ` : ''}
            </div>
            ${state.buttons.length > 0 ? `
              <div class="space-y-1.5">
                ${state.buttons.map((b, idx) => `
                  <div class="flex items-center gap-1.5">
                    <input type="text" data-btn-label="${idx}" placeholder="Button text" value="${escapeHtml(b.label)}" class="w-36 px-2 py-1 rounded bg-[#1e1f22] border border-white/[0.06] text-xs text-white placeholder-neutral-500 focus:outline-none">
                    <input type="text" data-btn-url="${idx}" placeholder="https://discord.gg/..." value="${escapeHtml(b.url)}" class="flex-1 min-w-0 px-2 py-1 rounded bg-[#1e1f22] border border-white/[0.06] text-xs text-white placeholder-neutral-500 focus:outline-none">
                    <button type="button" data-btn-remove="${idx}" class="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                    </button>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        ` : ''}
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
      if (!cid) return 'No channel selected';
      const c = allChannels.find(ch => String(ch.id) === String(cid));
      return c ? `#${c.name}` : `#${cid}`;
    };

    const botCards = [
      {
        key: 'welcome',
        title: 'Welcome Message',
        desc: 'Sent automatically when a new member joins the server.',
        enabled: Boolean(welcomeCfg.enabled),
        channel: findChName(welcomeCfg.channel_id),
        color: welcomeCfg.embed_color || '#5865F2',
        previewTitle: welcomeCfg.embed_title || 'Welcome to {server}!',
        previewDesc: welcomeCfg.embed_description || welcomeCfg.message || 'Welcome {user}!',
        tabRoute: `/dashboard/${guildId}/welcome`
      },
      {
        key: 'goodbye',
        title: 'Goodbye Message',
        desc: 'Sent when a member leaves the server.',
        enabled: Boolean(goodbyeCfg.enabled),
        channel: findChName(goodbyeCfg.channel_id),
        color: goodbyeCfg.embed_color || '#EF4444',
        previewTitle: goodbyeCfg.embed_title || 'Goodbye!',
        previewDesc: goodbyeCfg.embed_description || goodbyeCfg.message || '{user.name} has left the server.',
        tabRoute: `/dashboard/${guildId}/welcome`
      },
      {
        key: 'boost',
        title: 'Server Boost Message',
        desc: 'Automatically thanks new server boosters.',
        enabled: Boolean(boostCfg.enabled),
        channel: findChName(boostCfg.channel_id),
        color: boostCfg.embed_color || '#EB459E',
        previewTitle: boostCfg.embed_title || 'New Server Boost!',
        previewDesc: boostCfg.embed_description || boostCfg.message || 'Thank you for boosting, {user}!',
        tabRoute: `/dashboard/${guildId}/welcome`
      },
      {
        key: 'verify',
        title: 'Verification Panel',
        desc: 'Interactive verification embed for new members.',
        enabled: Boolean(verifyCfg.enabled),
        channel: 'Verification Channel',
        color: verifyCfg.embed_color || '#5865F2',
        previewTitle: verifyCfg.embed_title || 'Server Verification',
        previewDesc: verifyCfg.embed_description || 'Click the button below to verify your account.',
        tabRoute: `/dashboard/${guildId}/verify`
      },
      {
        key: 'tickets',
        title: 'Support Ticket Panel',
        desc: 'Panel embed for opening support tickets.',
        enabled: Boolean(ticketCfg.enabled),
        channel: findChName(ticketCfg.panel_channel_id),
        color: '#5865F2',
        previewTitle: ticketCfg.panel_title || 'Support Ticket Desk',
        previewDesc: ticketCfg.panel_description || 'Select a category below to create a ticket.',
        tabRoute: `/dashboard/${guildId}/tickets`
      },
      {
        key: 'level',
        title: 'Level-Up Notification',
        desc: 'Sent when a member reaches a new level.',
        enabled: Boolean(levelCfg.enabled),
        channel: levelCfg.levelup_channel === 'current' ? 'Current Channel' : findChName(levelCfg.levelup_channel),
        color: levelCfg.leaderboard_color || '#3B82F6',
        previewTitle: levelCfg.levelup_embed_title || 'Level Up!',
        previewDesc: levelCfg.levelup_embed_description || levelCfg.levelup_message_content || 'Congratulations {user}, you reached a new level!',
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
                  ${card.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div class="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1 text-xs">
                <div class="flex items-center gap-2 text-neutral-400">
                  <svg class="w-3.5 h-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <span class="truncate">${escapeHtml(card.channel)}</span>
                </div>
                <div class="text-[11px] text-neutral-300 font-semibold truncate pt-1">${escapeHtml(card.previewTitle)}</div>
                <div class="text-[10px] text-neutral-500 line-clamp-2">${escapeHtml(card.previewDesc)}</div>
              </div>
            </div>
            <div class="flex items-center gap-2 pt-2 border-t border-neutral-800">
              <a href="${escapeHtml(card.tabRoute)}" class="flex-1 py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white text-center transition-colors">
                Configure Module
              </a>
              <button type="button" data-load-bot-card="${escapeHtml(card.key)}" class="py-1.5 px-3 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-xs font-medium text-indigo-300 transition-colors cursor-pointer" title="Load into Embed Builder">
                Edit Embed
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function render() {
    const selectedChannel = allChannels.find(c => String(c.id) === String(state.channel_id));
    const senderLabel = state.send_as === 'bot' ? botDisplayName : (state.sender_name || currentGuild.name || 'Orbit');
    const senderImg = state.send_as === 'bot' ? botAvatarUrl : (state.sender_avatar || guildIconUrl || '/img/logo.png');

    if (isSlotMode) {
      const slotDef = MODERATION_SLOTS[currentSlot] || MODERATION_SLOTS['moderation.warn_dm'];
      const automodCfg = fullConfig.automod || {};
      const dmNotifications = automodCfg.dm_notifications || { warn_dm: true, timeout_dm: true, kick_dm: true, ban_dm: true };
      const isSlotEnabled = dmNotifications[slotDef.actionKey] !== false;
      const activeTokens = personalizeTab === 'this' ? slotDef.contextTokens : GLOBAL_TOKENS;

      container.innerHTML = `
        <div class="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 pt-6">
          <div>
            <div data-tour="feature-header" class="scroll-mt-24">
              <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type w-5 h-5"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" x2="15" y1="20" y2="20"></line><line x1="12" x2="12" y1="4" y2="20"></line></svg>
                  </span>
                  <h1 class="text-base font-medium text-white truncate">Messages</h1>
                </div>
              </div>
            </div>

            <div class="mt-6">
              <div class="w-full pb-6">
                <!-- Moderation Slot Banner -->
                <div class="mb-5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 px-4 py-3.5">
                  <div class="flex items-center gap-4 flex-wrap">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                      </span>
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-white truncate">${escapeHtml(slotDef.title)}</p>
                        <p class="text-[11px] text-neutral-400 truncate">${escapeHtml(slotDef.subtitle)}</p>
                      </div>
                    </div>
                    <div class="flex-1"></div>
                    <div class="flex items-center gap-2">
                      <button type="button" id="slot-exit-btn" class="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>Exit
                      </button>
                      <button type="button" id="slot-save-btn" title="Save — the bot will send this version" class="inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save w-4 h-4"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>Save
                      </button>
                    </div>
                  </div>
                  <div class="mt-3 pt-3 border-t border-indigo-500/15 flex flex-wrap items-center gap-x-4 gap-y-2.5">
                    <div class="flex items-center gap-1 p-1 rounded-lg bg-neutral-900/70 border border-neutral-800" role="tablist" aria-label="Moderation">
                      <button type="button" role="tab" data-switch-slot="moderation.warn_dm" class="h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${currentSlot === 'moderation.warn_dm' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}">Warn</button>
                      <button type="button" role="tab" data-switch-slot="moderation.timeout_dm" class="h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${currentSlot === 'moderation.timeout_dm' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}">Timeout</button>
                      <button type="button" role="tab" data-switch-slot="moderation.kick_dm" class="h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${currentSlot === 'moderation.kick_dm' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}">Kick</button>
                      <button type="button" role="tab" data-switch-slot="moderation.ban_dm" class="h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${currentSlot === 'moderation.ban_dm' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}">Ban</button>
                    </div>
                    <label class="inline-flex items-center gap-2 cursor-pointer" title="Members get this DM">
                      <div class="flex items-center gap-3">
                        <button type="button" id="slot-toggle-btn" role="switch" aria-checked="${isSlotEnabled ? 'true' : 'false'}" aria-label="${escapeHtml(slotDef.switchLabel)}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${isSlotEnabled ? 'bg-white' : 'bg-neutral-800'}">
                          <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${isSlotEnabled ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-900'}"></span>
                        </button>
                      </div>
                      <span id="slot-toggle-label" class="text-[12px] font-medium text-white">${isSlotEnabled ? 'On' : 'Off'}</span>
                    </label>
                    <span class="inline-flex items-center gap-1.5 text-[12px] text-neutral-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail w-3.5 h-3.5"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>Delivered as a DM to the member
                    </span>
                    <div class="flex-1"></div>
                    <button type="button" id="slot-test-btn" title="DM yourself this message as it looks right now, filled with sample values" class="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-neutral-200 bg-neutral-800/80 hover:bg-neutral-800 rounded-lg disabled:opacity-50 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-3.5 h-3.5"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>Send test DM
                    </button>
                    <p class="basis-full flex items-start gap-1.5 text-[11px] leading-snug text-neutral-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info w-3.5 h-3.5 flex-shrink-0 mt-px"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      <span>${escapeHtml(slotDef.infoNote)}</span>
                    </p>
                  </div>
                </div>

                <!-- Action Toolbar -->
                <div class="relative z-30 mb-5 rounded-xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                  <div class="flex items-center gap-1.5 px-3 py-2.5 flex-wrap">
                    <!-- Embeds Drawer Button -->
                    <div class="relative">
                      <button type="button" id="msg-saved-btn" title="Browse all embeds" class="inline-flex items-center gap-2 h-9 px-3 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open w-4 h-4"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path></svg>Embeds
                      </button>
                      ${openPopover === 'saved' ? `
                        <div class="orbit-dropdown-menu absolute left-0 mt-2 w-80 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] p-2 space-y-1.5 max-h-80 overflow-y-auto" style="z-index: 99999;" data-lenis-prevent="true">
                          <div class="flex items-center justify-between px-2 py-1">
                            <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Saved Messages (${savedEmbeds.length})</span>
                          </div>
                          ${savedEmbeds.length > 0 ? savedEmbeds.map(emb => `
                            <div class="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg hover:bg-neutral-800 group">
                              <button type="button" data-load-saved="${escapeHtml(emb.id)}" class="flex-1 min-w-0 text-left cursor-pointer">
                                <div class="text-xs font-medium text-white truncate">${escapeHtml(emb.name || emb.title || 'Untitled message')}</div>
                                <div class="text-[10px] text-neutral-500 truncate">${escapeHtml(emb.description || emb.content || 'No description')}</div>
                              </button>
                            </div>
                          `).join('') : `
                            <div class="px-3 py-4 text-center text-xs text-neutral-500">No saved templates in library.</div>
                          `}
                        </div>
                      ` : ''}
                    </div>

                    <span class="self-stretch w-px bg-neutral-800 mx-1.5"></span>

                    <!-- Undo / Redo -->
                    <button type="button" id="msg-undo-btn" ${undoStack.length === 0 ? 'disabled=""' : ''} title="Undo (Ctrl+Z)" class="inline-flex items-center justify-center w-9 h-9 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-all cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo2 w-4 h-4"><path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path></svg>
                    </button>
                    <button type="button" id="msg-redo-btn" ${redoStack.length === 0 ? 'disabled=""' : ''} title="Redo (Ctrl+Shift+Z)" class="inline-flex items-center justify-center w-9 h-9 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-all cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo2 w-4 h-4"><path d="m15 14 5-5-5-5"></path><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"></path></svg>
                    </button>

                    <div class="flex-1"></div>

                    <!-- Mobile-friendly -->
                    <button type="button" id="msg-mobile-btn" class="inline-flex items-center gap-2 h-9 px-3.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${mobileFriendly ? 'text-indigo-200 bg-indigo-500/15 hover:bg-indigo-500/25' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smartphone w-4 h-4"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>Mobile-friendly
                    </button>

                    <!-- Import -->
                    <button type="button" id="slot-import-btn" title="Import from templates" class="inline-flex items-center gap-2 h-9 px-3.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>Import
                    </button>

                    <!-- Reset -->
                    <button type="button" id="slot-reset-btn" title="Reset this slot to default" class="inline-flex items-center gap-2 h-9 px-3.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw w-4 h-4"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>Reset
                    </button>

                    <!-- Submit to library -->
                    <button type="button" id="msg-save-lib-btn" title="Share this feature embed publicly" class="inline-flex items-center gap-2 h-9 px-3.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>Submit to library
                    </button>
                  </div>
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
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="h-[0.85em] w-[0.85em]"><path d="M20 6 9 17l-5-5"></path></svg>APP
                              </span>
                              <span class="text-[10px] text-neutral-500">Today at 12:00 PM</span>
                            </div>

                            <!-- Editable Message Content -->
                            <div class="relative group opacity-70 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <div id="msg-content-editable" contenteditable="true" role="textbox" aria-multiline="true" class="outline-none text-sm text-white empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-600 rounded-md -mx-1 px-1 -my-0.5 py-0.5 select-text hover:shadow-[inset_0_0_0_1px_rgb(99_102_241_/_0.25)] focus:shadow-[inset_0_0_0_2px_rgb(99_102_241_/_0.6)] whitespace-pre-wrap !text-[14px] !text-neutral-100 leading-snug min-h-[1.5em]" data-placeholder="Message above the embed (optional)" style="user-select: text;">${escapeHtml(state.content)}</div>
                            </div>

                            <!-- Embed Editor -->
                            <div id="msg-embed-editor-slot">
                              ${renderInteractiveEmbedEditorHtml()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="mt-4 flex justify-center">
                        <p class="inline-block px-2.5 py-1 rounded-md bg-white/[0.04] text-center text-[11px] text-neutral-500">Click any part of the message to edit. Type <kbd class="px-1 py-0.5 text-[9px] bg-neutral-800 rounded border border-neutral-700">/</kbd> in any text for variables.</p>
                      </div>
                    </div>
                  </div>

                  <!-- Right Column: Live Discord Preview & Personalize Section -->
                  <div class="w-full lg:w-[640px] lg:flex-shrink-0 lg:sticky lg:top-4">
                    <div id="msg-right-preview">
                      ${renderRightPreviewHtml()}
                    </div>

                    <!-- Personalize tray below preview -->
                    <div class="mt-4">
                      <div class="flex items-center gap-2 mb-3 px-1">
                        <span class="text-[11px] uppercase tracking-wider font-semibold text-neutral-500">Personalize this message</span>
                      </div>
                      <div class="rounded-xl border border-neutral-800/60 bg-neutral-900/40 overflow-hidden">
                        <div class="px-2 pt-2">
                          <div class="inline-flex items-center gap-0.5 p-0.5 rounded-md bg-neutral-800/60">
                            <button type="button" id="token-tab-this" class="inline-flex items-center h-6 px-2 text-[11px] font-medium rounded transition-colors cursor-pointer ${personalizeTab === 'this' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:text-white'}">
                              This message <span class="text-[10px] text-neutral-500 tabular-nums ml-1">${slotDef.contextTokens.length}</span>
                            </button>
                            <button type="button" id="token-tab-every" class="inline-flex items-center h-6 px-2 text-[11px] font-medium rounded transition-colors cursor-pointer ${personalizeTab === 'every' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:text-white'}">
                              Every message <span class="text-[10px] text-neutral-500 tabular-nums ml-1">${GLOBAL_TOKENS.length}</span>
                            </button>
                          </div>
                        </div>
                        <div class="p-1.5 max-h-[220px] overflow-y-auto" data-lenis-prevent="true">
                          <div class="grid grid-cols-1 gap-0.5">
                            ${activeTokens.map(tok => `
                              <button type="button" data-insert-token="${escapeHtml(tok.token)}" title="${escapeHtml(tok.desc)}" class="group w-full flex items-center gap-3 px-2.5 py-1.5 rounded-md hover:bg-neutral-800/60 transition-colors text-left cursor-pointer">
                                <span class="flex-shrink-0 text-[11px] font-medium text-indigo-200 bg-[#5865f2]/20 px-2 py-0.5 rounded">${escapeHtml(tok.label)}</span>
                                <span class="flex-1 min-w-0 text-[11px] text-neutral-500 truncate">${escapeHtml(tok.desc)}</span>
                                <span class="flex-shrink-0 text-neutral-600 group-hover:text-neutral-300 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                                </span>
                              </button>
                            `).join('')}
                          </div>
                        </div>
                        <p class="px-3 pb-2 text-[10px] text-neutral-600">Click one to add it where you were typing. It fills in for every member automatically.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Standard Messages Workspace
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
                  <h1 class="text-base font-medium text-white truncate">Messages</h1>
                </div>
                <div class="flex items-center gap-3 flex-shrink-0">
                  <div class="flex items-center gap-3">
                    <div class="overflow-x-auto scrollbar-none">
                      <div class="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
                        <button type="button" id="msg-tab-user" class="px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${activeTopTab === 'user_messages' ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'}">Your Messages</button>
                        <button type="button" id="msg-tab-bot" class="px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${activeTopTab === 'bot_messages' ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'}">Bot Messages</button>
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
                      <!-- New (Templates / Blank) -->
                      <div class="relative">
                        <button type="button" id="msg-new-btn" title="New message – choose a template or start blank" class="inline-flex items-center gap-2 h-9 px-3 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-plus w-4 h-4"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M9 15h6"></path><path d="M12 18v-6"></path></svg>New</button>
                        ${openPopover === 'new' ? `
                          <div class="orbit-dropdown-menu absolute left-0 mt-2 w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] p-1.5 space-y-1" style="z-index: 99999;" data-lenis-prevent="true">
                            <div class="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Choose template</div>
                            ${TEMPLATES.map(t => `
                              <button type="button" data-pick-template="${escapeHtml(t.key)}" class="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
                                <div class="text-xs font-semibold text-white">${escapeHtml(t.label)}</div>
                                <div class="text-[11px] text-neutral-500">${escapeHtml(t.desc)}</div>
                              </button>
                            `).join('')}
                          </div>
                        ` : ''}
                      </div>

                      <!-- Saved Embeds Drawer -->
                      <div class="relative">
                        <button type="button" id="msg-saved-btn" title="Browse all embeds" class="inline-flex items-center gap-2 h-9 px-3 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open w-4 h-4"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path></svg>Saved Embeds</button>
                        ${openPopover === 'saved' ? `
                          <div class="orbit-dropdown-menu absolute left-0 mt-2 w-80 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] p-2 space-y-1.5 max-h-80 overflow-y-auto" style="z-index: 99999;" data-lenis-prevent="true">
                            <div class="flex items-center justify-between px-2 py-1">
                              <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Saved Messages (${savedEmbeds.length})</span>
                            </div>
                            ${savedEmbeds.length > 0 ? savedEmbeds.map(emb => `
                              <div class="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg hover:bg-neutral-800 group">
                                <button type="button" data-load-saved="${escapeHtml(emb.id)}" class="flex-1 min-w-0 text-left cursor-pointer">
                                  <div class="text-xs font-medium text-white truncate">${escapeHtml(emb.name || emb.title || 'Untitled message')}</div>
                                  <div class="text-[10px] text-neutral-500 truncate">${escapeHtml(emb.description || emb.content || 'No description')}</div>
                                </button>
                                <button type="button" data-delete-saved="${escapeHtml(emb.id)}" class="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer" title="Delete">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                </button>
                              </div>
                            `).join('') : `
                              <div class="px-3 py-4 text-center text-xs text-neutral-500">No saved templates in library.</div>
                            `}
                          </div>
                        ` : ''}
                      </div>

                      <span class="self-stretch w-px bg-neutral-800 mx-1.5"></span>

                      <!-- Undo / Redo -->
                      <button type="button" id="msg-undo-btn" ${undoStack.length === 0 ? 'disabled=""' : ''} title="Undo (Ctrl+Z)" class="inline-flex items-center justify-center w-9 h-9 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-all cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo2 w-4 h-4"><path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path></svg>
                      </button>
                      <button type="button" id="msg-redo-btn" ${redoStack.length === 0 ? 'disabled=""' : ''} title="Redo (Ctrl+Shift+Z)" class="inline-flex items-center justify-center w-9 h-9 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-all cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo2 w-4 h-4"><path d="m15 14 5-5-5-5"></path><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"></path></svg>
                      </button>

                      <div class="flex-1"></div>

                      <!-- Send As -->
                      <div class="relative">
                        <button type="button" id="msg-sendas-btn" title="Change message author" class="inline-flex items-center gap-2 h-10 pl-2 pr-3 text-[13px] font-medium text-neutral-200 hover:text-white hover:bg-neutral-800 rounded-md transition-colors cursor-pointer">
                          <img src="${escapeHtml(senderImg)}" alt="" class="w-6 h-6 rounded-full object-cover flex-shrink-0 bg-neutral-800">
                          <span class="text-neutral-500">Send as</span>
                          <span class="truncate max-w-[100px]">${escapeHtml(senderLabel)}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-3.5 h-3.5 text-neutral-500"><path d="m6 9 6 6 6-6"></path></svg>
                        </button>
                        ${openPopover === 'send_as' ? `
                          <div class="orbit-dropdown-menu absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] p-2 space-y-1.5" style="z-index: 99999;" data-lenis-prevent="true">
                            <button type="button" data-pick-sendas="bot" class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-neutral-800 cursor-pointer ${state.send_as === 'bot' ? 'bg-neutral-800 text-white' : 'text-neutral-300'}">
                              <img src="${escapeHtml(botAvatarUrl)}" alt="" class="w-6 h-6 rounded-full object-cover bg-neutral-800">
                              <div class="min-w-0 flex-1">
                                <div class="text-xs font-semibold truncate">${escapeHtml(botDisplayName)}</div>
                                <div class="text-[10px] text-neutral-500">Send as Server Bot</div>
                              </div>
                            </button>
                            <button type="button" data-pick-sendas="webhook" class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-neutral-800 cursor-pointer ${state.send_as !== 'bot' ? 'bg-neutral-800 text-white' : 'text-neutral-300'}">
                              <div class="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${escapeHtml((currentGuild.name || 'S')[0])}</div>
                              <div class="min-w-0 flex-1">
                                <div class="text-xs font-semibold truncate">${escapeHtml(currentGuild.name || 'Server')} (Webhook)</div>
                                <div class="text-[10px] text-neutral-500">Custom Name & Avatar</div>
                              </div>
                            </button>
                          </div>
                        ` : ''}
                      </div>

                      <!-- Select Channel -->
                      <div class="relative">
                        <button type="button" id="msg-channel-btn" title="Select channel" class="inline-flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-lg border transition-all ${selectedChannel ? 'text-white border-neutral-600 bg-neutral-800/60' : 'text-neutral-400 border-neutral-700'} hover:text-white hover:bg-neutral-800 hover:border-neutral-600 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-4 h-4 text-neutral-500"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                          <span class="truncate max-w-[140px]">${selectedChannel ? escapeHtml(selectedChannel.name) : 'Select channel'}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-3.5 h-3.5 text-neutral-500"><path d="m6 9 6 6 6-6"></path></svg>
                        </button>
                        ${openPopover === 'channel' ? `
                          <div class="orbit-dropdown-menu absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] overflow-hidden p-1 flex flex-col max-h-72" style="z-index: 99999;" data-lenis-prevent="true">
                            <div class="orbit-searchbar-header sticky top-0 z-20 p-2 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/80 shrink-0">
                              <div class="relative w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                                <input type="text" id="msg-channel-search-input" placeholder="Search..." class="orbit-searchbar-input w-full pl-9 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off" />
                              </div>
                            </div>
                            <div id="msg-channel-items" class="overflow-y-auto max-h-56 p-1 space-y-0.5" data-lenis-prevent="true">
                              ${allChannels.length > 0 ? allChannels.map(ch => `
                                <button type="button" data-pick-msg-channel="${escapeHtml(ch.id)}" data-ch-name="${escapeHtml((ch.name || '').toLowerCase())}" class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left hover:bg-neutral-800 transition-colors cursor-pointer ${String(ch.id) === String(state.channel_id) ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300'}">
                                  <span class="text-neutral-500 font-mono">#</span>
                                  <span class="truncate">${escapeHtml(ch.name)}</span>
                                </button>
                              `).join('') : `
                                <div class="px-3 py-3 text-xs text-neutral-500 text-center">No text channels found</div>
                              `}
                            </div>
                          </div>
                        ` : ''}
                      </div>

                      <span class="self-stretch w-px bg-neutral-800 mx-1.5"></span>

                      <!-- Mobile-friendly -->
                      <button type="button" id="msg-mobile-btn" class="inline-flex items-center gap-2 h-9 px-3.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${mobileFriendly ? 'text-indigo-200 bg-indigo-500/15 hover:bg-indigo-500/25' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smartphone w-4 h-4"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>Mobile Friendly
                      </button>

                      <!-- Save to Library -->
                      <button type="button" id="msg-save-lib-btn" class="inline-flex items-center gap-2 h-9 px-3.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>Save to Library
                      </button>

                      <!-- Send -->
                      <button type="button" id="msg-send-btn" ${(isSending || !state.channel_id || !hasAnyContent()) ? 'disabled=""' : ''} class="inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-4 h-4"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>${isSending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </div>

                  <!-- Message Name Input -->
                  <div class="mb-3 flex items-center gap-2">
                    <input id="msg-name-input" class="flex-1 bg-transparent text-sm text-neutral-400 hover:text-white focus:text-white border-0 border-b border-transparent hover:border-neutral-700 focus:border-indigo-500/40 focus:outline-none transition-colors px-1 py-0.5" placeholder="Untitled message" value="${escapeHtml(state.name)}">
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
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="h-[0.85em] w-[0.85em]"><path d="M20 6 9 17l-5-5"></path></svg>APP
                                </span>
                                <span class="text-[10px] text-neutral-500">Today at 12:00 PM</span>
                              </div>

                              <!-- Editable Message Content -->
                              <div class="relative group opacity-70 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                <div id="msg-content-editable" contenteditable="true" role="textbox" aria-multiline="true" class="outline-none text-sm text-white empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-600 rounded-md -mx-1 px-1 -my-0.5 py-0.5 select-text hover:shadow-[inset_0_0_0_1px_rgb(99_102_241_/_0.25)] focus:shadow-[inset_0_0_0_2px_rgb(99_102_241_/_0.6)] whitespace-pre-wrap !text-[14px] !text-neutral-100 leading-snug min-h-[1.5em]" data-placeholder="Message above the embed (optional)" style="user-select: text;">${escapeHtml(state.content)}</div>
                                <div id="msg-slash-vars-menu" class="hidden orbit-dropdown-menu absolute left-0 top-full mt-1 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 p-1.5">
                                  <div class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Insert Variables</div>
                                  ${VARIABLES.map(v => `
                                    <button type="button" data-insert-var="${escapeHtml(v.token)}" class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-neutral-800 text-left cursor-pointer">
                                      <code class="text-indigo-400 font-mono">${escapeHtml(v.token)}</code>
                                      <span class="text-[11px] text-neutral-400">${escapeHtml(v.desc)}</span>
                                    </button>
                                  `).join('')}
                                </div>
                              </div>

                              <!-- Embed Editor -->
                              <div id="msg-embed-editor-slot">
                                ${renderInteractiveEmbedEditorHtml()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="mt-4 flex justify-center">
                          <p class="inline-block px-2.5 py-1 rounded-md bg-white/[0.04] text-center text-[11px] text-neutral-500">Click any part of the message to edit. Type <kbd class="px-1 py-0.5 text-[9px] bg-neutral-800 rounded border border-neutral-700">/</kbd> in any text for variables.</p>
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
    }

    bindEvents();
  }

  function bindEvents() {
    // Top Tab Switcher (Non-slot mode)
    document.getElementById('msg-tab-user')?.addEventListener('click', () => {
      activeTopTab = 'user_messages';
      render();
    });
    document.getElementById('msg-tab-bot')?.addEventListener('click', () => {
      activeTopTab = 'bot_messages';
      render();
    });

    // Track active/focused input or contenteditable for token insertion
    document.addEventListener('focusin', (e) => {
      if (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        lastFocusedInput = e.target;
      }
    });

    if (isSlotMode) {
      const slotDef = MODERATION_SLOTS[currentSlot] || MODERATION_SLOTS['moderation.warn_dm'];

      // Exit button
      document.getElementById('slot-exit-btn')?.addEventListener('click', () => {
        const dest = fromParam === 'moderation' ? 'automod' : (fromParam || 'automod');
        if (window.Router) {
          Router.navigate(`/dashboard/${guildId}/${dest}`);
        } else {
          window.location.href = `/dashboard/${guildId}/${dest}`;
        }
      });

      // Save button
      document.getElementById('slot-save-btn')?.addEventListener('click', async () => {
        const automodCfg = fullConfig.automod || {};
        const dmNotifications = automodCfg.dm_notifications || { warn_dm: true, timeout_dm: true, kick_dm: true, ban_dm: true };
        const isEnabled = dmNotifications[slotDef.actionKey] !== false;

        const slotPayload = {
          content: state.content || '',
          has_embed: true,
          title: state.title || '',
          description: state.description || '',
          color: state.color || '#5865F2',
          author_name: state.author_name || '',
          author_icon: state.author_icon || '',
          author_url: state.author_url || '',
          footer_text: state.footer_text || '',
          footer_icon: state.footer_icon || '',
          thumbnail: state.thumbnail || 'server_icon',
          image: state.image || '',
          timestamp: Boolean(state.timestamp),
          fields: state.fields || []
        };

        if (!fullConfig.automod) fullConfig.automod = {};
        if (!fullConfig.automod.dm_templates) fullConfig.automod.dm_templates = {};
        fullConfig.automod.dm_templates[currentSlot] = slotPayload;

        const saveBtn = document.getElementById('slot-save-btn');
        if (saveBtn) saveBtn.disabled = true;

        try {
          await API.saveConfig(guildId, {
            automod: {
              dm_templates: { [currentSlot]: slotPayload },
              dm_notifications: { [slotDef.actionKey]: isEnabled }
            }
          });
          if (window.Notifications) {
            Notifications.show('Saved — the bot will send this version.', 'success');
          }
        } catch (err) {
          if (window.Notifications) {
            Notifications.show(err.message || 'Failed to save configuration', 'error');
          }
        } finally {
          if (saveBtn) saveBtn.disabled = false;
        }
      });

      // Switch moderation slot tab
      container.querySelectorAll('[data-switch-slot]').forEach(btn => {
        btn.addEventListener('click', () => {
          const nextSlot = btn.getAttribute('data-switch-slot');
          if (nextSlot === currentSlot) return;
          currentSlot = nextSlot;
          window.history.replaceState({}, '', `/dashboard/${guildId}/embed-builder?slot=${currentSlot}&from=${fromParam || 'moderation'}`);
          loadSlotData(currentSlot);
          render();
        });
      });

      // Slot Toggle switch
      document.getElementById('slot-toggle-btn')?.addEventListener('click', () => {
        if (!fullConfig.automod) fullConfig.automod = {};
        if (!fullConfig.automod.dm_notifications) {
          fullConfig.automod.dm_notifications = { warn_dm: true, timeout_dm: true, kick_dm: true, ban_dm: true };
        }
        const curVal = fullConfig.automod.dm_notifications[slotDef.actionKey] !== false;
        const newVal = !curVal;
        fullConfig.automod.dm_notifications[slotDef.actionKey] = newVal;

        API.saveConfig(guildId, {
          automod: {
            dm_notifications: { [slotDef.actionKey]: newVal }
          }
        }).catch(() => {});

        render();
      });

      // Send test DM button
      document.getElementById('slot-test-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('slot-test-btn');
        if (!btn) return;
        const origHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<svg class="animate-spin mr-1 w-3.5 h-3.5 text-neutral-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...`;

        try {
          const res = await API.request(`/api/server/${guildId}/test-dm`, {
            method: 'POST',
            body: {
              type: currentSlot,
              embed: {
                title: state.title,
                description: state.description,
                color: state.color,
                author_name: state.author_name,
                author_icon: state.author_icon,
                author_url: state.author_url,
                footer_text: state.footer_text,
                footer_icon: state.footer_icon,
                thumbnail: state.thumbnail,
                image: state.image,
                timestamp: state.timestamp,
                fields: state.fields
              },
              content: state.content
            }
          });
          if (res && res.error) {
            throw new Error(res.error);
          }
          if (window.Notifications) {
            Notifications.show('Test DM sent to your Discord account!', 'success');
          }
        } catch (err) {
          if (window.Notifications) {
            Notifications.show(err.message || 'Could not send test DM. Check if your DMs are open.', 'error');
          }
        } finally {
          btn.disabled = false;
          btn.innerHTML = origHtml;
        }
      });

      // Slot Reset button
      document.getElementById('slot-reset-btn')?.addEventListener('click', () => {
        pushUndo();
        Object.assign(state, JSON.parse(JSON.stringify(slotDef.defaultTemplate)));
        render();
        if (window.Notifications) {
          Notifications.show('Reset to default template.', 'success');
        }
      });

      // Slot Import button
      document.getElementById('slot-import-btn')?.addEventListener('click', () => {
        pushUndo();
        Object.assign(state, JSON.parse(JSON.stringify(slotDef.defaultTemplate)));
        render();
        if (window.Notifications) {
          Notifications.show('Loaded slot default template.', 'success');
        }
      });

      // Personalize Subtabs
      document.getElementById('token-tab-this')?.addEventListener('click', () => {
        personalizeTab = 'this';
        render();
      });
      document.getElementById('token-tab-every')?.addEventListener('click', () => {
        personalizeTab = 'every';
        render();
      });

      // Insert Token Pill into active or target element
      container.querySelectorAll('[data-insert-token]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const token = btn.getAttribute('data-insert-token');
          if (!token) return;

          pushUndo();

          if (lastFocusedInput) {
            if (lastFocusedInput.isContentEditable) {
              lastFocusedInput.focus();
              document.execCommand('insertText', false, ' ' + token + ' ');
              lastFocusedInput.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (lastFocusedInput.tagName === 'INPUT' || lastFocusedInput.tagName === 'TEXTAREA') {
              const start = lastFocusedInput.selectionStart || lastFocusedInput.value.length;
              const end = lastFocusedInput.selectionEnd || lastFocusedInput.value.length;
              const val = lastFocusedInput.value;
              lastFocusedInput.value = val.slice(0, start) + ' ' + token + ' ' + val.slice(end);
              lastFocusedInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
          } else {
            state.description = (state.description ? state.description + ' ' : '') + token;
            updateToolbarStatesInPlace();
            const descEl = document.getElementById('msg-emb-description');
            if (descEl) descEl.value = state.description;
          }

          updateToolbarStatesInPlace();
        });
      });
    }

    // Embeds Drawer popover
    document.getElementById('msg-saved-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openPopover = openPopover === 'saved' ? null : 'saved';
      render();
    });

    // Undo / Redo
    document.getElementById('msg-undo-btn')?.addEventListener('click', performUndo);
    document.getElementById('msg-redo-btn')?.addEventListener('click', performRedo);

    // Mobile-friendly toggle
    document.getElementById('msg-mobile-btn')?.addEventListener('click', () => {
      mobileFriendly = !mobileFriendly;
      render();
    });

    // Save to Library button
    document.getElementById('msg-save-lib-btn')?.addEventListener('click', async () => {
      if (!hasAnyContent()) {
        if (window.Notifications) Notifications.show('Please add some content before saving.', 'error');
        return;
      }
      try {
        const payload = {
          name: state.name || 'Saved embed',
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
        const res = await API.saveEmbed(guildId, payload);
        if (res && res.embed) {
          savedEmbeds = savedEmbeds.filter(x => String(x.id) !== String(res.id));
          savedEmbeds.unshift(res.embed);
        }
        if (window.Notifications) {
          Notifications.show('Embed saved to library!', 'success');
        }
      } catch (err) {
        if (window.Notifications) {
          Notifications.show(err.message || 'Failed to save to library', 'error');
        }
      }
    });

    // Load saved embed
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
          state.has_embed = found.has_embed !== undefined ? Boolean(found.has_embed) : true;
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

    // Non-slot specific handlers
    if (!isSlotMode) {
      document.getElementById('msg-new-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        openPopover = openPopover === 'new' ? null : 'new';
        render();
      });
      document.getElementById('msg-sendas-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        openPopover = openPopover === 'send_as' ? null : 'send_as';
        render();
      });
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
        openPopover = openPopover === 'channel' ? null : 'channel';
        render();
      });

      // Send Custom Embed
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
            Notifications.show('Message sent to Discord successfully!', 'success');
          }
        } catch (err) {
          if (window.Notifications) {
            Notifications.show(err.message || 'Failed to send message', 'error');
          }
        } finally {
          isSending = false;
          updateToolbarStatesInPlace();
        }
      });
    }

    // Message Name Input
    document.getElementById('msg-name-input')?.addEventListener('input', (e) => {
      state.name = e.target.value;
    });

    // Editable Message Content
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

    // Embed Toggle & Removal
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

    // Embed Color buttons
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

    // Inputs binding
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

    // Fields Management
    document.getElementById('msg-emb-add-field')?.addEventListener('click', () => {
      if (state.fields.length >= 25) return;
      pushUndo();
      state.fields.push({ name: '', value: '', inline: false });
      render();
    });

    container.querySelectorAll('[data-field-name]').forEach(input => {
      input.addEventListener('focus', () => pushUndo());
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-field-name'), 10);
        if (state.fields[idx]) {
          state.fields[idx].name = e.target.value;
          updateToolbarStatesInPlace();
        }
      });
    });

    container.querySelectorAll('[data-field-value]').forEach(input => {
      input.addEventListener('focus', () => pushUndo());
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-field-value'), 10);
        if (state.fields[idx]) {
          state.fields[idx].value = e.target.value;
          updateToolbarStatesInPlace();
        }
      });
    });

    container.querySelectorAll('[data-field-inline]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-field-inline'), 10);
        if (state.fields[idx]) {
          pushUndo();
          state.fields[idx].inline = !state.fields[idx].inline;
          render();
        }
      });
    });

    container.querySelectorAll('[data-field-up]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-field-up'), 10);
        if (idx > 0 && state.fields[idx]) {
          pushUndo();
          const temp = state.fields[idx];
          state.fields[idx] = state.fields[idx - 1];
          state.fields[idx - 1] = temp;
          render();
        }
      });
    });

    container.querySelectorAll('[data-field-down]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-field-down'), 10);
        if (idx < state.fields.length - 1 && state.fields[idx]) {
          pushUndo();
          const temp = state.fields[idx];
          state.fields[idx] = state.fields[idx + 1];
          state.fields[idx + 1] = temp;
          render();
        }
      });
    });

    container.querySelectorAll('[data-field-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-field-remove'), 10);
        if (state.fields[idx] !== undefined) {
          pushUndo();
          state.fields.splice(idx, 1);
          render();
        }
      });
    });

    // Close open popovers when clicking outside
    document.addEventListener('click', (e) => {
      if (openPopover && !e.target.closest('.orbit-dropdown-menu') && !e.target.closest('#msg-new-btn') && !e.target.closest('#msg-saved-btn') && !e.target.closest('#msg-sendas-btn') && !e.target.closest('#msg-channel-btn')) {
        openPopover = null;
        render();
      }
    }, { once: true });
  }

  render();
};
