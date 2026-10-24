/**
 * Orbit Dashboard - AI Helper Tab (1:1 PeakBot Layout + Groq Vision/File Analysis, Persistent Chat History & Channel/Role ID Actions)
 */

DashboardTabs.Builder = async function(container, guildId) {
  // Ensure full-width container matching PeakBot's <main class="p-4 lg:p-6 xl:p-8">
  container.classList.remove('max-w-[1200px]', 'mx-auto');

  const STORAGE_CHATS_KEY = `orbit_ai_helper_chats_${guildId}`;
  const STORAGE_ACTIVE_KEY = `orbit_ai_helper_active_chat_${guildId}`;
  const STORAGE_APPLIED_KEY = `orbit_ai_helper_applied_actions_${guildId}`;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="text-neutral-200">$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/[0.08] text-cyan-300 font-mono text-[12.5px]">$1</code>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  function getGreeting(name) {
    const hour = new Date().getHours();
    if (hour >= 20 || hour < 5) return `Working late, ${name}?`;
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  }

  function getChatDateLabel(ts) {
    if (!ts) return 'Today';
    const d = new Date(Number(ts) * 1000);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400 * 1000;
    const t = d.getTime();
    if (t >= startOfToday) return 'Today';
    if (t >= startOfYesterday) return 'Yesterday';
    return 'Older';
  }

  function loadLocalChats() {
    try {
      const raw = localStorage.getItem(STORAGE_CHATS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveLocalChats(chatsList, currentActiveId) {
    try {
      localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify((chatsList || []).slice(0, 40)));
      if (currentActiveId !== undefined) {
        if (currentActiveId) {
          localStorage.setItem(STORAGE_ACTIVE_KEY, String(currentActiveId));
        } else {
          localStorage.removeItem(STORAGE_ACTIVE_KEY);
        }
      }
    } catch (_) {}
  }

  function loadAppliedActions() {
    try {
      const raw = localStorage.getItem(STORAGE_APPLIED_KEY);
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch (_) {
      return new Set();
    }
  }

  function saveAppliedActions(set) {
    try {
      localStorage.setItem(STORAGE_APPLIED_KEY, JSON.stringify(Array.from(set || [])));
    } catch (_) {}
  }


  function mergeChats(serverChats, localChats) {
    const map = new Map();
    for (const c of (localChats || [])) {
      if (c && c.id && !String(c.id).startsWith('temp_')) {
        map.set(String(c.id), c);
      }
    }
    for (const c of (serverChats || [])) {
      if (c && c.id) {
        const existing = map.get(String(c.id));
        if (!existing) {
          map.set(String(c.id), c);
        } else {
          const sLen = c.messages?.length || 0;
          const lLen = existing.messages?.length || 0;
          const sUpd = Number(c.updated_at || c.created_at || 0);
          const lUpd = Number(existing.updated_at || existing.created_at || 0);
          if (sLen > lLen || (sLen === lLen && sUpd > lUpd)) {
            map.set(String(c.id), c);
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => (b.updated_at || b.created_at || 0) - (a.updated_at || a.created_at || 0));
  }

  let user = null;
  let cfg = {};
  let chatData = { chats: [], action_history: [], can_undo: false, can_redo: false };

  let userName = 'User';
  let chats = loadLocalChats();
  let savedActiveId = null;
  try {
    savedActiveId = localStorage.getItem(STORAGE_ACTIVE_KEY);
  } catch (_) {}

  let activeChatId = (savedActiveId && chats.some(c => c.id === savedActiveId))
    ? savedActiveId
    : (chats.length ? chats[0].id : null);

  saveLocalChats(chats, activeChatId);

  // Background fetch to sync latest server state without blocking UI
  Promise.all([
    API.getUser().catch(() => null),
    API.getConfig(guildId).catch(() => ({})),
    API.getAIHelperChats(guildId).catch(() => ({ chats: [], action_history: [], can_undo: false, can_redo: false }))
  ]).then(([uRes, cfgRes, chatsRes]) => {
    user = uRes;
    if (user?.global_name || user?.username) userName = user.global_name || user.username;
    cfg = cfgRes || {};
    chatData = chatsRes || { chats: [], action_history: [], can_undo: false, can_redo: false };
    if (Array.isArray(chatData.action_history)) actionHistory = chatData.action_history;
    canUndo = Boolean(chatData.can_undo);
    canRedo = Boolean(chatData.can_redo);

    chats = mergeChats(Array.isArray(chatData.chats) ? chatData.chats : [], loadLocalChats());
    if (savedActiveId && chats.some(c => c.id === savedActiveId)) {
      activeChatId = savedActiveId;
    } else if (!activeChatId && chats.length > 0) {
      activeChatId = chats[0].id;
    }
    saveLocalChats(chats, activeChatId);
    render();
  });

  let chatSearchQuery = '';
  let leftSidebarCollapsed = false;
  let mobileChatDrawerOpen = false;
  let mobileActiveView = 'chat'; // 'chat' | 'preview'
  let planTab = 'channels'; // 'channels' | 'roles' | 'features'
  let featuresPanelOpen = false;
  let collapsedCategories = new Set();
  let selectedModel = 'llama-3.3-70b-versatile';
  let selectedModelLabel = 'Llama 3.3 70B';
  let modelDropdownOpen = false;
  let historyDropdownOpen = false;
  let quickAddDropdownOpen = false;
  let openChatOptionsId = null;
  let editingChatId = null;
  let isSending = false;

  function closeAllPopupsDom() {
    modelDropdownOpen = false;
    historyDropdownOpen = false;
    quickAddDropdownOpen = false;
    openChatOptionsId = null;
    document.getElementById('ai-quick-add-menu')?.classList.add('hidden');
    document.getElementById('ai-model-picker-menu')?.classList.add('hidden');
    document.getElementById('ai-history-menu')?.classList.add('hidden');
    container.querySelectorAll('[data-chat-options-menu]').forEach(el => el.classList.add('hidden'));
  }
  let isApplying = false;
  let pendingActions = [];
  let pendingAttachments = [];
  let draftInputText = '';
  let appliedActionIds = loadAppliedActions();
  for (const c of chats) {
    for (const m of (c.messages || [])) {
      for (const a of (m.actions || [])) {
        if (a && a.id && a.applied) appliedActionIds.add(a.id);
      }
    }
  }
  let actionHistory = Array.isArray(chatData.action_history) ? chatData.action_history : [];
  let canUndo = Boolean(chatData.can_undo);
  let canRedo = Boolean(chatData.can_redo);

  const MODELS = [
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', desc: 'Meta Llama 3.3 · Fast, precise & 30k TPM' },
    { id: 'openai/gpt-oss-120b', label: 'Onyx V1 (120B)', desc: 'GPT-OSS 120B · Highest precision' },
    { id: 'qwen/qwen3.8-27b', label: 'Qwen 3.8', desc: 'Qwen 27B · Fast & smart' },
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Vision', desc: 'Multimodal · Ideal for images & screenshots' },
    { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', desc: 'Ultra fast · Lowest latency' }
  ];

  // Exact 17 features from PeakBot reference HTML
  const FEATURES_LIST = [
    {
      key: 'welcome',
      title: 'Welcome Messages',
      desc: 'Greet new members',
      color: 'rgb(87, 242, 135)',
      isEnabled: () => Boolean(cfg?.welcome?.enabled || cfg?.config?.welcome?.enabled),
      prompt: 'Set up welcome messages for this server. Choose a suitable welcome or general channel and create an appealing welcome embed.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(87, 242, 135);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
    },
    {
      key: 'goodbye',
      title: 'Goodbye Messages',
      desc: 'Message when members leave',
      color: 'rgb(148, 163, 184)',
      isEnabled: () => Boolean(cfg?.goodbye?.enabled || cfg?.config?.goodbye?.enabled),
      prompt: 'Set up goodbye messages for this server when members leave.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(148, 163, 184);"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>`
    },
    {
      key: 'tempvoice',
      title: 'Join to Create',
      desc: 'Temporary voice channels',
      color: 'rgb(88, 101, 242)',
      isEnabled: () => Boolean(cfg?.tempvoice?.enabled || cfg?.config?.tempvoice?.enabled),
      prompt: 'Configure Join to Create (temporary voice channels) for this server with a suitable voice channel and category.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2 w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(88, 101, 242);"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`
    },
    {
      key: 'joinroles',
      title: 'Reaction Roles',
      desc: 'Roles from reactions',
      color: 'rgb(230, 126, 34)',
      isEnabled: () => Boolean(cfg?.joinroles?.enabled || cfg?.config?.joinroles?.enabled),
      prompt: 'Set up reaction roles or auto-roles on join for new members on this server.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mouse-pointer-click w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(230, 126, 34);"><path d="m9 9 5 12 1.8-5.2L21 14Z"></path><path d="M7.2 2.2 8 5.1"></path><path d="m5.1 8-2.9-.8"></path><path d="M14 4.1 12 6"></path><path d="m6 12-1.9 2"></path></svg>`
    },
    {
      key: 'tickets',
      title: 'Tickets',
      desc: 'Private support threads',
      color: 'rgb(235, 69, 158)',
      isEnabled: () => Boolean(cfg?.ticket?.enabled || cfg?.config?.ticket?.enabled),
      prompt: 'Configure the ticket system for this server including ticket channel, category, and staff role.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(235, 69, 158);"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>`
    },
    {
      key: 'level',
      title: 'XP & Levelaufstieg',
      desc: 'Levels und Bestenlisten',
      color: 'rgb(254, 231, 92)',
      isEnabled: () => Boolean(cfg?.level?.enabled || cfg?.config?.level?.enabled),
      prompt: 'Enable and configure the XP & Level system for this server.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(254, 231, 92);"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>`
    },
    {
      key: 'giveaways',
      title: 'Werbegeschenke',
      desc: 'Host giveaways',
      color: 'rgb(46, 204, 113)',
      isEnabled: () => false,
      prompt: 'How do I set up a giveaway on my server and what channel permissions are optimal?',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(46, 204, 113);"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>`
    },
    {
      key: 'logs',
      title: 'Protokollierung',
      desc: 'Serverereignisse protokollieren',
      color: 'rgb(155, 89, 182)',
      isEnabled: () => Boolean(cfg?.logs?.enabled || cfg?.config?.logs?.enabled),
      prompt: 'Richte die Server-Protokollierung (Logging) mit einem passenden Log-Kanal auf diesem Server ein.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll-text w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(155, 89, 182);"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"></path><path d="M19 17V5a2 2 0 0 0-2-2H4"></path><path d="M15 8h-5"></path><path d="M15 12h-5"></path></svg>`
    },
    {
      key: 'banned_words',
      title: 'Inhaltsfilter',
      desc: 'Block bad words and profanity',
      color: 'rgb(52, 152, 219)',
      isEnabled: () => Boolean(cfg?.automod?.banned_words?.enabled || cfg?.config?.automod?.banned_words?.enabled),
      prompt: 'Enable the content filter (word filter against profanity and toxicity) in AutoMod.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-off w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(52, 152, 219);"><path d="M21 15V5a2 2 0 0 0-2-2H9"></path><path d="m2 2 20 20"></path><path d="M3.6 3.6c-.4.3-.6.8-.6 1.4v16l4-4h10"></path></svg>`
    },
    {
      key: 'anti_spam',
      title: 'Spam-Schutz',
      desc: 'Stop message spam and flooding',
      color: 'rgb(249, 115, 22)',
      isEnabled: () => Boolean(cfg?.automod?.anti_spam?.enabled || cfg?.config?.automod?.anti_spam?.enabled),
      prompt: 'Enable anti-spam protection in AutoMod for this server.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(249, 115, 22);"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>`
    },
    {
      key: 'anti_link',
      title: 'Linkfilter',
      desc: 'Kontrollieren Sie Links und Einladungen',
      color: 'rgb(56, 189, 248)',
      isEnabled: () => Boolean(cfg?.automod?.anti_link?.enabled || cfg?.automod?.anti_invites?.enabled || cfg?.config?.automod?.anti_link?.enabled),
      prompt: 'Aktiviere den Linkfilter und Discord-Einladungsfilter in der Auto-Moderation.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2-off w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(56, 189, 248);"><path d="M9 17H7A5 5 0 0 1 7 7"></path><path d="M15 7h2a5 5 0 0 1 4 8"></path><line x1="8" x2="12" y1="12" y2="12"></line><line x1="2" x2="22" y1="2" y2="22"></line></svg>`
    },
    {
      key: 'anti_raid',
      title: 'Anti-Raid',
      desc: 'Stoppen Sie Join-Raid-Bursts',
      color: 'rgb(220, 38, 38)',
      isEnabled: () => Boolean(cfg?.security?.anti_raid?.enabled || cfg?.config?.security?.anti_raid?.enabled),
      prompt: 'Enable anti-raid protection for this server to automatically mitigate join-raid attacks.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-x w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(220, 38, 38);"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m14.5 9.5-5 5"></path><path d="m9.5 9.5 5 5"></path></svg>`
    },
    {
      key: 'anti_nuke',
      title: 'Anti-Atomkraft',
      desc: 'Block mass deletion and ban attacks',
      color: 'rgb(237, 66, 69)',
      isEnabled: () => Boolean(cfg?.security?.anti_nuke?.enabled || cfg?.config?.security?.anti_nuke?.enabled),
      prompt: 'Enable anti-nuke protection for this server against mass deletions and ban attacks.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(237, 66, 69);"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`
    },
    {
      key: 'anti_alt',
      title: 'Suspicious Accounts',
      desc: 'Markieren Sie riskante neue Konten',
      color: 'rgb(245, 158, 11)',
      isEnabled: () => Boolean(cfg?.automod?.anti_alt?.enabled || cfg?.config?.automod?.anti_alt?.enabled),
      prompt: 'Enable protection against suspicious new accounts (anti-alt) with an account age threshold of 3 days.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-x w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(245, 158, 11);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg>`
    },
    {
      key: 'ai_automod',
      title: 'KI-Moderation',
      desc: 'AI reads and moderates messages (Pro)',
      color: 'rgb(124, 58, 237)',
      isEnabled: () => Boolean(cfg?.automod?.ai_automod?.enabled || cfg?.config?.automod?.ai_automod?.enabled),
      prompt: 'Enable AI moderation in AutoMod so messages are automatically evaluated for toxicity.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(124, 58, 237);"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>`
    },
    {
      key: 'ai_image',
      title: 'Bildmoderation',
      desc: 'AI-Scan geposteter Bilder (Pro)',
      color: 'rgb(128, 132, 142)',
      isEnabled: () => Boolean(cfg?.automod?.ai_image?.enabled || cfg?.config?.automod?.ai_image?.enabled),
      prompt: 'Enable AI image moderation for posted images on this server.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-puzzle w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(128, 132, 142);"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"></path></svg>`
    },
    {
      key: 'verify',
      title: 'Verification',
      desc: 'Gate new members',
      color: 'rgb(20, 184, 166)',
      isEnabled: () => Boolean(cfg?.verify?.enabled || cfg?.config?.verify?.enabled),
      prompt: 'Set up the verification system for new members with a verification channel and role.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle2 w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(20, 184, 166);"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>`
    },
    {
      key: 'onboarding',
      title: 'Onboarding',
      desc: 'Setup flow for new members',
      color: 'rgb(52, 211, 153)',
      isEnabled: () => Boolean((cfg?.welcome?.enabled || cfg?.config?.welcome?.enabled) && (cfg?.joinroles?.enabled || cfg?.config?.joinroles?.enabled)),
      prompt: 'Set up a complete onboarding flow (welcome message + auto-role + verification) for new members.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(52, 211, 153);"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>`
    },
    {
      key: 'invites',
      title: 'Invite Tracker',
      desc: 'Track who invited whom',
      color: 'rgb(255, 152, 0)',
      isEnabled: () => Boolean(cfg?.invites?.enabled || cfg?.config?.invites?.enabled),
      prompt: 'Enable the invite tracker for this server including leave tracking.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-plus w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(255, 152, 0);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>`
    },
    {
      key: 'notifications',
      title: 'Notifications',
      desc: 'Social and stream announcements',
      color: 'rgb(245, 158, 11)',
      isEnabled: () => false,
      prompt: 'Help me set up an announcement and notification channel with the right permissions.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(245, 158, 11);"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>`
    },
    {
      key: 'inactive_kick',
      title: 'Inactive Purge',
      desc: 'Remove inactive members',
      color: 'rgb(100, 116, 139)',
      isEnabled: () => false,
      prompt: 'How do I best set up inactive member cleanup or auto-kick on my server?',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-minus w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(100, 116, 139);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg>`
    }
  ];

  function getActiveChat() {
    if (!activeChatId) return null;
    return chats.find(c => c.id === activeChatId) || null;
  }

  function copyIdToClipboard(idText, labelText, btnEl) {
    if (!idText) return;
    navigator.clipboard?.writeText(String(idText)).catch(() => {});
    if (window.Toast) {
      window.Toast.success(`${labelText ? labelText + ' ' : ''}ID kopiert: ${idText}`);
    }
    if (btnEl) {
      const origHtml = btnEl.innerHTML;
      btnEl.innerHTML = `<span class="text-emerald-400">✓</span>`;
      setTimeout(() => {
        if (btnEl && btnEl.isConnected) btnEl.innerHTML = origHtml;
      }, 1100);
    }
  }

  function processImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1024;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve({
            id: 'att_' + Math.random().toString(36).slice(2, 9),
            type: 'image',
            name: file.name || 'screenshot.jpg',
            dataUrl
          });
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function processTextFile(file) {
    return new Promise((resolve, reject) => {
      if (file.type && file.type.startsWith('image/')) {
        return processImageFile(file).then(resolve, reject);
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const textContent = String(ev.target.result || '').slice(0, 15000);
        resolve({
          id: 'att_' + Math.random().toString(36).slice(2, 9),
          type: 'file',
          name: file.name || 'datei.txt',
          textContent,
          size: textContent.length
        });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async function handleFilesSelected(fileList) {
    if (!fileList || !fileList.length) return;
    const currentInput = document.getElementById('ai-helper-textarea');
    if (currentInput) draftInputText = currentInput.value;

    for (const file of Array.from(fileList).slice(0, 4)) {
      try {
        if (file.type && file.type.startsWith('image/')) {
          const att = await processImageFile(file);
          pendingAttachments.push(att);
        } else {
          const att = await processTextFile(file);
          pendingAttachments.push(att);
        }
      } catch (_) {
        if (window.Toast) window.Toast.error(`Konnte Datei "${file.name}" nicht lesen.`);
      }
    }
    quickAddDropdownOpen = false;
    render();
  }

  function renderChatListItems(isMobile) {
    const q = chatSearchQuery.trim().toLowerCase();
    const filtered = q
      ? chats.filter(c => (c.title || '').toLowerCase().includes(q) || (c.messages || []).some(m => (m.content || '').toLowerCase().includes(q)))
      : chats;

    if (!filtered.length) {
      return `
        <div class="px-3.5 py-6 text-center">
          <span class="text-[12px] text-neutral-500">${q ? 'No chats found' : 'No chats yet'}</span>
        </div>
      `;
    }

    // Group by Today / Yesterday / Older matching PeakBot Screenshot 1
    const groups = new Map();
    for (const c of filtered) {
      const label = getChatDateLabel(c.updated_at || c.created_at);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(c);
    }

    return Array.from(groups.entries()).map(([groupLabel, groupChats]) => `
      <div class="mb-2 last:mb-0">
        <div class="px-3.5 pb-1"><span class="text-[11px] font-medium text-neutral-500">${escapeHtml(groupLabel)}</span></div>
        ${groupChats.map(c => {
          const isCurrent = c.id === activeChatId;
          const isMenuOpen = openChatOptionsId === c.id;
          const isEditing = editingChatId === c.id;
          return `
            <div class="px-1.5" style="opacity: 1;">
              <div class="group/row relative flex items-center rounded-lg cursor-pointer h-[38px] pl-3 pr-1 transition-colors duration-150 ${
                isCurrent
                  ? 'bg-white/[0.08] text-white'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }" data-select-chat="${escapeHtml(c.id)}">
                ${isEditing ? `
                  <div class="flex items-center gap-1 flex-1 min-w-0 pr-0.5" data-rename-wrap="${escapeHtml(c.id)}">
                    <input type="text" data-rename-input="${escapeHtml(c.id)}" value="${escapeHtml(c.title || 'New Chat')}" class="flex-1 min-w-0 h-7 bg-neutral-950 border border-white/25 rounded-md px-2 text-[13px] font-medium text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20" />
                    <button type="button" data-rename-save="${escapeHtml(c.id)}" class="grid place-items-center h-6 w-6 rounded-md bg-white text-black hover:bg-neutral-200 flex-shrink-0 transition-colors" title="Save">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </button>
                    <button type="button" data-rename-cancel="${escapeHtml(c.id)}" class="grid place-items-center h-6 w-6 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 flex-shrink-0 transition-colors" title="Cancel">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                ` : `
                  <span class="flex-1 min-w-0 truncate text-[13.5px] font-medium pr-1">${escapeHtml(c.title || 'New Chat')}</span>
                  <div class="relative flex-shrink-0">
                    <button type="button" data-chat-options="${escapeHtml(c.id)}" class="relative grid place-items-center h-7 w-7 flex-shrink-0 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.1] transition-[opacity,color,background-color,transform] duration-150 active:scale-[0.94] before:absolute before:inset-[-6px] before:content-[''] ${isMobile || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100'}" title="Options" aria-label="Chat Options">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal w-4 h-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
                    <div data-chat-options-menu="${escapeHtml(c.id)}" class="orbit-dropdown-menu ${isMenuOpen ? '' : 'hidden'} absolute right-0 top-8 w-40 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1 z-[99999]">
                      <button type="button" data-rename-chat="${escapeHtml(c.id)}" class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-neutral-200 hover:bg-white/[0.08] text-left transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        Rename
                      </button>
                      <button type="button" data-delete-chat="${escapeHtml(c.id)}" class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-red-400 hover:bg-red-500/10 text-left transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `).join('');
  }

  function renderFeaturesListHtml() {
    const enabledCount = FEATURES_LIST.filter(f => f.isEnabled()).length;
    return `
      <p class="px-2.5 pt-2 pb-1 text-[12.5px] text-neutral-500 text-pretty">
        ${enabledCount > 0
          ? `${enabledCount} feature(s) already active. Select a feature below and AI will configure it for you.`
          : 'Nothing set up yet. Select a feature below and AI will configure it for you.'}
      </p>
      <div class="pt-2">
        <div class="px-2.5 pb-1.5">
          <span class="text-[11px] font-medium text-neutral-500">Add a feature</span>
        </div>
        <div class="space-y-1">
          ${FEATURES_LIST.map(f => {
            const active = f.isEnabled();
            return `
              <button type="button" data-feature-prompt="${escapeHtml(f.prompt)}" aria-pressed="${active ? 'true' : 'false'}" class="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]">
                ${f.svg}
                <span class="min-w-0 flex-1">
                  <span class="block text-[13.5px] font-medium truncate text-neutral-200">${escapeHtml(f.title)}</span>
                  <span class="block text-[12px] text-neutral-500 truncate">${escapeHtml(f.desc)}</span>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-4 h-4 flex-shrink-0 text-neutral-600 group-hover/add:text-neutral-300 transition-colors"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderPlanContentHtml() {
    if (planTab === 'features') {
      return `
        <div class="h-full overflow-y-auto overscroll-contain p-2 space-y-1.5 scrollbar-thin bg-white dark:bg-neutral-900" data-lenis-prevent="true">
          ${renderFeaturesListHtml()}
        </div>
      `;
    }

    if (planTab === 'roles') {
      const roles = Array.isArray(cfg.roles) ? cfg.roles : [];
      return `
        <div class="h-full overflow-y-auto overscroll-contain bg-white dark:bg-neutral-900 py-2 scrollbar-thin" data-lenis-prevent="true">
          ${pendingActions.length > 0 ? `<div class="px-2 mb-2">${renderPendingActionsBanner()}</div>` : ''}
          ${roles.map(r => {
            const color = r.color && r.color !== '#000000' ? r.color : '#99aab5';
            const mentionStr = `@${r.name} (ID: ${r.id})`;
            return `
              <div>
                <div class="flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg select-none group min-h-[40px] text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 cursor-pointer" data-insert-mention="${escapeHtml(mentionStr)}" title="Click to mention in AI chat (${escapeHtml(r.id)})">
                  <span class="w-3.5 h-3.5 rounded-full flex-shrink-0" style="background-color: ${escapeHtml(color)};"></span>
                  <span title="${escapeHtml(r.name)}" class="text-[15px] font-medium truncate min-w-0 leading-5">${escapeHtml(r.name)}</span>
                  <div class="flex-1"></div>
                  <div class="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button type="button" data-copy-id="${escapeHtml(r.id)}" data-copy-label="@${escapeHtml(r.name)}" class="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10.5px] font-mono text-neutral-300 hover:text-white border border-neutral-700" title="Copy Role ID (${escapeHtml(r.id)})">ID</button>
                    <button type="button" data-insert-mention="${escapeHtml(mentionStr)}" class="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white hover:text-black text-[10.5px] font-medium text-neutral-200" title="Mention in AI chat">@AI</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // Default: 'channels' matching Screenshot 2 1:1
    const textChannels = Array.isArray(cfg.channels) ? cfg.channels : [];
    const voiceChannels = Array.isArray(cfg.voice_channels) ? cfg.voice_channels : [];
    const categories = Array.isArray(cfg.categories) ? cfg.categories : [];

    const allChannels = [
      ...textChannels.map(c => ({ ...c, isVoice: false })),
      ...voiceChannels.map(c => ({ ...c, isVoice: true }))
    ];

    const uncategorized = allChannels.filter(c => !c.category_id);

    function renderChannelRow(ch) {
      const mentionStr = `${ch.isVoice ? '🔊 ' : '#'}${ch.name} (ID: ${ch.id})`;
      const iconHtml = ch.isVoice
        ? `<span class="flex-shrink-0 text-neutral-500 dark:text-neutral-400"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2 w-5 h-5 flex-shrink-0"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg></span>`
        : `<span class="flex-shrink-0 "><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-5 h-5 flex-shrink-0"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg></span>`;

      return `
        <div>
          <div class="flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg select-none group min-h-[40px] text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 cursor-grab active:cursor-grabbing" role="button" tabindex="0" data-insert-mention="${escapeHtml(mentionStr)}" style="transition: transform linear;">
            ${iconHtml}
            <span title="${escapeHtml(ch.name)}" class="text-[15px] font-medium truncate min-w-0 leading-5 ">${escapeHtml(ch.name)}</span>
            <div class="flex-1"></div>
            <div class="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              <button type="button" data-copy-id="${escapeHtml(ch.id)}" data-copy-label="#${escapeHtml(ch.name)}" class="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10.5px] font-mono text-neutral-300 hover:text-white border border-neutral-700" title="Copy Channel ID (${escapeHtml(ch.id)})">ID</button>
              <button type="button" data-insert-mention="${escapeHtml(mentionStr)}" class="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white hover:text-black text-[10.5px] font-medium text-neutral-200" title="Insert channel in AI chat">@AI</button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="h-full overflow-y-auto overscroll-contain bg-white dark:bg-neutral-900 scrollbar-thin" data-lenis-prevent="true">
        <div style="opacity: 1; transform: none;">
          <div class="py-2">
            ${pendingActions.length > 0 ? `<div class="px-2 mb-2">${renderPendingActionsBanner()}</div>` : ''}
            ${uncategorized.length > 0 ? `
              <div class="mb-2">
                ${uncategorized.map(renderChannelRow).join('')}
              </div>
            ` : ''}
            ${categories.map(cat => {
              const isCollapsed = collapsedCategories.has(String(cat.id));
              const catChannels = allChannels.filter(c => String(c.category_id) === String(cat.id));
              return `
                <div class="pt-4 first:pt-0  " style="transition: transform linear;">
                  <div data-toggle-cat="${escapeHtml(cat.id)}" class="flex items-center gap-1 px-2 py-1.5 mx-1 mt-2 mb-1 rounded-lg select-none cursor-pointer group transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/50 cursor-grab active:cursor-grabbing" role="button" tabindex="0">
                    <button type="button" class="p-1.5 sm:p-0.5 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 sm:w-3 sm:h-3 transition-transform duration-200 ease-out ${isCollapsed ? '-rotate-90' : ''}"><path d="m6 9 6 6 6-6"></path></svg>
                    </button>
                    <span class="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.02em] truncate group-hover:text-black dark:group-hover:text-white flex-1">${escapeHtml(cat.name)}</span>
                    <button type="button" data-copy-id="${escapeHtml(cat.id)}" data-copy-label="Category ${escapeHtml(cat.name)}" class="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-neutral-300 hover:text-white border border-neutral-700 transition-opacity" title="Copy Category ID (${escapeHtml(cat.id)})">ID</button>
                  </div>
                  ${!isCollapsed ? `
                    <div class="mt-[2px]">
                      ${catChannels.map(renderChannelRow).join('')}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderPendingActionsBanner() {
    if (!pendingActions.length) return '';
    return `
      <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2 mb-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[12px] font-semibold text-amber-300 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            ${pendingActions.length} pending change(s)
          </span>
          <button type="button" id="ai-clear-pending-btn" class="text-[11px] text-neutral-400 hover:text-white transition-colors">Discard</button>
        </div>
        <div class="space-y-1">
          ${pendingActions.map((act, idx) => `
            <div class="flex items-center justify-between gap-2 text-[12px] bg-neutral-950/60 px-2.5 py-1.5 rounded-lg border border-white/[0.05]">
              <span class="text-neutral-200 truncate font-medium">${escapeHtml(act.title || act.type)}</span>
              <button type="button" data-remove-pending="${idx}" class="text-neutral-500 hover:text-red-400 transition-colors" title="Remove">✕</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderAttachmentsPreviewHtml() {
    if (!pendingAttachments.length) return '';
    return `
      <div class="px-3.5 pt-3 pb-1 flex flex-wrap gap-2">
        ${pendingAttachments.map((att, idx) => {
          if (att.type === 'image') {
            return `
              <div class="relative group flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-neutral-800/90 border border-white/10">
                <img src="${att.dataUrl}" alt="${escapeHtml(att.name)}" class="w-10 h-10 rounded-lg object-cover border border-white/10">
                <div class="min-w-0 max-w-[140px] text-left">
                  <p class="text-[11.5px] font-medium text-white truncate">${escapeHtml(att.name)}</p>
                  <p class="text-[10px] text-emerald-400">Image attached</p>
                </div>
                <button type="button" data-remove-attachment="${idx}" class="p-1 rounded-md text-neutral-400 hover:text-red-400 hover:bg-white/10 transition-colors" title="Remove">✕</button>
              </div>
            `;
          }
          return `
            <div class="relative group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-neutral-800/90 border border-white/10">
              <div class="min-w-0 max-w-[160px] text-left">
                <p class="text-[11.5px] font-medium text-white truncate">${escapeHtml(att.name)}</p>
                <p class="text-[10px] text-neutral-400">${att.size || 0} chars</p>
              </div>
              <button type="button" data-remove-attachment="${idx}" class="p-1 rounded-md text-neutral-400 hover:text-red-400 hover:bg-white/10 transition-colors" title="Remove">✕</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderPromptInputBox(inputId, sendBtnId) {
    const canSendNow = (draftInputText.trim().length > 0 || pendingAttachments.length > 0) && !isSending;
    return `
      <div id="ai-prompt-dropzone" data-tour="builder-chat" class="scroll-mt-24 w-full rounded-2xl bg-neutral-900/80 border ring-1 transition-[border-color] duration-200 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.4)] border-white/[0.06] ring-white/[0.02] focus-within:border-white/[0.12] focus-within:ring-white/[0.04]">
        <input type="file" id="ai-upload-image-input" accept="image/png,image/jpeg,image/webp,image/gif" multiple class="hidden">
        <input type="file" id="ai-upload-file-input" accept=".txt,.md,.json,.csv,.yaml,.yml,.py,.js,.html,.css,image/*" multiple class="hidden">
        ${renderAttachmentsPreviewHtml()}
        <textarea id="${inputId}" data-no-autoresize="true" placeholder="How can I help you today?" rows="1" class="w-full px-5 pt-4 pb-2 bg-transparent border-0 text-base sm:text-[15.5px] text-white placeholder-neutral-500 resize-none overflow-hidden focus:outline-none focus:ring-0 " style="height: 48px; overflow-y: hidden;">${escapeHtml(draftInputText)}</textarea>
        <div class="flex items-center justify-between gap-2 px-2.5 pb-2.5">
          <div class="relative">
            <button type="button" id="ai-quick-add-btn" class="relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-[color,background-color,transform] active:scale-[0.96] before:absolute before:inset-[-2px] before:content-[''] text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04]" title="Attach an image" aria-label="Attach an image">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-[18px] h-[18px]"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
            </button>
            <div id="ai-quick-add-menu" data-lenis-prevent="true" class="orbit-dropdown-menu ${quickAddDropdownOpen ? '' : 'hidden'} absolute bottom-full mb-2 left-0 w-72 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-[99999] space-y-1 text-left orbit-dropup">
              <button type="button" id="ai-trigger-image-upload" class="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-lg text-[12.5px] text-white hover:bg-white/[0.08] transition-colors">
                <span class="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </span>
                <div class="min-w-0 flex-1">
                  <span class="block font-medium text-white">Bild / Screenshot hochladen</span>
                  <span class="block text-[11px] text-neutral-400 truncate">KI analysiert das Bild</span>
                </div>
              </button>
              <button type="button" id="ai-trigger-file-upload" class="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-lg text-[12.5px] text-white hover:bg-white/[0.08] transition-colors">
                <span class="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                </span>
                <div class="min-w-0 flex-1">
                  <span class="block font-medium text-white">Datei / Vorlage hochladen</span>
                  <span class="block text-[11px] text-neutral-400 truncate">Text, JSON or configs</span>
                </div>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="relative">
              <button type="button" id="ai-model-picker-btn" class="hidden sm:inline-flex items-center gap-1 px-2.5 h-9 rounded-lg text-[12.5px] font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" title="Select model" aria-label="Select model">${escapeHtml(selectedModelLabel)}<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-3 h-3 opacity-60 transition-transform duration-150 "><path d="m6 9 6 6 6-6"></path></svg></button>
              <div id="ai-model-picker-menu" data-lenis-prevent="true" class="orbit-dropdown-menu ${modelDropdownOpen ? '' : 'hidden'} absolute bottom-full mb-2 right-0 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-[99999] space-y-0.5 text-left orbit-dropup">
                ${MODELS.map(m => `
                  <button type="button" data-select-model="${escapeHtml(m.id)}" data-select-model-label="${escapeHtml(m.label)}" class="w-full flex flex-col items-start px-3 py-2 rounded-lg text-left transition-colors ${selectedModel === m.id ? 'bg-white/[0.08] text-white' : 'text-neutral-300 hover:bg-white/[0.04]'}">
                    <span class="text-[12.5px] font-semibold">${escapeHtml(m.label)}</span>
                    <span class="text-[11px] text-neutral-500">${escapeHtml(m.desc)}</span>
                  </button>
                `).join('')}
              </div>
            </div>
            <button type="button" id="${sendBtnId}" ${canSendNow ? '' : 'disabled=""'} class="relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-[color,background-color,box-shadow,transform] before:absolute before:inset-[-2px] before:content-[''] ${canSendNow ? 'bg-white text-black hover:bg-neutral-200 cursor-pointer' : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'}" title="Send" aria-label="Send"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-4 h-4"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg></button>
          </div>
        </div>
      </div>
    `;
  }

  function getActionMeta(act) {
    const t = String(act.type || '');
    if (t === 'create_giveaway') {
      return {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift text-amber-400"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>',
        badge: 'Giveaway',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      };
    }
    if (t === 'create_ticket_panel' || t === 'configure_tickets') {
      return {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket text-indigo-400"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>',
        badge: 'Tickets',
        badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      };
    }
    if (t === 'create_verification_panel' || t === 'configure_verify') {
      return {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check text-emerald-400"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>',
        badge: 'Verification',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      };
    }
    if (t === 'channel_permissions') {
      return {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock text-cyan-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
        badge: 'Permissions',
        badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
      };
    }
    if (t === 'configure_security' || t === 'configure_automod') {
      return {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert text-rose-400"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>',
        badge: 'Security',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      };
    }
    if (t === 'create_reaction_roles') {
      return {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tags text-purple-400"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"></path><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"></circle></svg>',
        badge: 'Roles',
        badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      };
    }
    if (t === 'send_message') {
      return {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square text-sky-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        badge: 'Message',
        badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
      };
    }
    return {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles text-neutral-300"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>',
      badge: 'Config',
      badgeClass: 'bg-white/[0.06] text-neutral-300 border-white/10'
    };
  }

  function renderCenterBodyHtml() {
    const activeChat = getActiveChat();
    const messages = activeChat && Array.isArray(activeChat.messages) ? activeChat.messages : [];

    if (messages.length === 0 && !isSending) {
      return `
        <div class="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" data-lenis-prevent="true">
          <div class="w-full my-auto space-y-6 sm:space-y-8">
            <div class="flex flex-col items-center justify-center px-4 sm:px-6 py-8">
              <div class="flex flex-col items-center text-center w-full max-w-[640px] 2xl:max-w-[720px]">
                <div class="flex items-center gap-3 mb-7">
                  <div class="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/[0.08] shadow-[0_2px_6px_-3px_rgba(0,0,0,0.3)]">
                    <img src="/img/logo.png" alt="Orbit" class="w-full h-full object-cover">
                  </div>
                  <h2 class="text-[27px] sm:text-[34px] font-semibold tracking-tight text-white leading-none text-balance">${escapeHtml(getGreeting(userName))}</h2>
                </div>
                ${renderPromptInputBox('ai-helper-textarea', 'ai-helper-send-btn')}
                <div class="mt-2 text-center text-[11px] text-neutral-500">You are chatting with Peak, an AI assistant. AI can make mistakes – review changes before applying them.</div>

                <div class="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-[680px]">
                  <button type="button" data-prompt-chip="Analyze my server overview and activity analytics, and tell me what needs improvement." class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-700/70 hover:border-neutral-500 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer">
                    <span>📊</span> Analyze Server &amp; Analytics
                  </button>
                  <button type="button" data-prompt-chip="Create a Discord Nitro giveaway with 1 winner for 24 hours in the giveaways channel." class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-700/70 hover:border-neutral-500 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer">
                    <span>🎉</span> Create a Giveaway
                  </button>
                  <button type="button" data-prompt-chip="Setup and deploy an interactive support ticket panel with categories." class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-700/70 hover:border-neutral-500 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer">
                    <span>🎫</span> Setup Ticket Panel
                  </button>
                  <button type="button" data-prompt-chip="Setup a verification system with captcha and verified role." class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-700/70 hover:border-neutral-500 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer">
                    <span>🛡️</span> Setup Verification
                  </button>
                  <button type="button" data-prompt-chip="Audit our security settings: Anti-Raid, Anti-Nuke and AutoMod protection." class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-700/70 hover:border-neutral-500 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer">
                    <span>🔒</span> Audit Security
                  </button>
                </div>
              </div>
            </div>
            <div class="h-px"></div>
            <div></div>
          </div>
        </div>
      `;
    }

    return `
      <div id="ai-chat-scroll" data-lenis-prevent="true" class="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 scrollbar-thin">
        <div class="max-w-[740px] mx-auto space-y-5">
          ${messages.map(msg => {
            if (msg.role === 'user') {
              const msgAtts = Array.isArray(msg.attachments) ? msg.attachments : [];
              return `
                <div class="flex justify-end">
                  <div class="max-w-[82%] rounded-2xl rounded-br-md bg-white/[0.08] border border-white/[0.07] px-4 py-3 text-[14.5px] text-neutral-100 leading-relaxed space-y-2.5">
                    ${msgAtts.length > 0 ? `
                      <div class="flex flex-wrap gap-2">
                        ${msgAtts.map(att => {
                          if (att.type === 'image' && att.dataUrl) {
                            return `<img src="${att.dataUrl}" alt="${escapeHtml(att.name || 'Image')}" class="max-h-48 rounded-xl border border-white/10 object-cover">`;
                          }
                          return `
                            <div class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-900/80 border border-white/10 text-xs text-neutral-200">
                              <span>📄</span>
                              <span class="truncate max-w-[180px]">${escapeHtml(att.name || 'File')}</span>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    ` : ''}
                    <div>${formatMarkdown(msg.content)}</div>
                  </div>
                </div>
              `;
            }

            const msgActions = Array.isArray(msg.actions) ? msg.actions : [];
            return `
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/[0.08] mt-0.5">
                  <img src="/img/logo.png" alt="Orbit" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0 space-y-3">
                  <div class="rounded-2xl rounded-tl-md bg-neutral-950/60 border border-white/[0.06] px-4 py-3 text-[14.5px] text-neutral-200 leading-relaxed">
                    ${formatMarkdown(msg.content)}
                  </div>
                  ${msgActions.length > 0 ? `
                    <div class="space-y-2">
                      ${msgActions.map(act => {
                        const isApplied = Boolean(act.applied || appliedActionIds.has(act.id));
                        const meta = getActionMeta(act);
                        return `
                          <div class="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] ${isApplied ? 'opacity-80' : ''}">
                            <div class="flex items-center gap-3 min-w-0">
                              <div class="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                                ${meta.icon}
                              </div>
                              <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                  <p class="text-[13.5px] font-semibold text-white truncate">${escapeHtml(act.title || act.type)}</p>
                                  <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${meta.badgeClass}">${escapeHtml(meta.badge)}</span>
                                </div>
                                <p class="text-[12px] text-neutral-400 truncate">${escapeHtml(act.description || 'Configuration change ready')}</p>
                              </div>
                            </div>
                            ${isApplied ? `
                              <button type="button" disabled class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-neutral-800 border border-neutral-700/60 text-neutral-400 flex-shrink-0 cursor-not-allowed select-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check text-neutral-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Built
                              </button>
                            ` : `
                              <button type="button" data-apply-single="${escapeHtml(act.id)}" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-white text-black hover:bg-neutral-200 transition-colors flex-shrink-0 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket w-3 h-3"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>
                                Build
                              </button>
                            `}
                          </div>
                        `;
                      }).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
          ${isSending ? `
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/[0.08]">
                <img src="/img/logo.png" alt="Orbit" class="w-full h-full object-cover">
              </div>
              <div class="rounded-2xl rounded-tl-md bg-neutral-950/60 border border-white/[0.06] px-4 py-3 text-[13.5px] text-neutral-400 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-white/60 animate-bounce"></span>
                <span class="w-2 h-2 rounded-full bg-white/60 animate-bounce" style="animation-delay: 150ms;"></span>
                <span class="w-2 h-2 rounded-full bg-white/60 animate-bounce" style="animation-delay: 300ms;"></span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="flex-shrink-0 p-3 sm:p-4 border-t border-neutral-800/80 bg-neutral-900">
        <div class="max-w-[740px] mx-auto">
          ${renderPromptInputBox('ai-helper-textarea', 'ai-helper-send-btn')}
          <div class="mt-2 text-center text-[11px] text-neutral-500">You are chatting with Peak, an AI assistant. AI can make mistakes – review changes before applying them.</div>
        </div>
      </div>
    `;
  }

  function render() {
    const totalChannels = (cfg.channels ? cfg.channels.length : 0) + (cfg.voice_channels ? cfg.voice_channels.length : 0);
    const totalRoles = cfg.roles ? cfg.roles.length : 0;
    const totalCategories = cfg.categories ? cfg.categories.length : 0;
    const hasPending = pendingActions.length > 0;

    container.innerHTML = `
      <div class="relative w-full flex flex-col h-[calc(100dvh-4rem-2rem)] lg:h-[calc(100dvh-4rem-3rem)] xl:h-[calc(100dvh-4rem-4rem)] overflow-hidden">
        <!-- Mobile Chat Drawer Backdrop & Drawer -->
        <div id="ai-mobile-drawer-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${mobileChatDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}"></div>
        <div class="fixed left-0 top-0 h-full w-[90vw] sm:w-[85vw] max-w-80 z-50 lg:hidden transition-transform duration-300 ease-out border-r border-neutral-800 ${mobileChatDrawerOpen ? 'translate-x-0' : '-translate-x-full'}">
          <div class="flex flex-col h-full bg-neutral-900">
            <div class="px-2 pt-2 pb-1.5 flex-shrink-0">
              <div class="flex items-center gap-1.5">
                <button type="button" data-action="new-chat" class="flex-1 flex items-center gap-2 px-3 h-9 rounded-lg text-[13.5px] font-medium text-neutral-100 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.06] transition-[background-color,transform] duration-150 ease-out active:scale-[0.99]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen w-4 h-4 text-neutral-300"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>Neuer Chat
                </button>
                <button type="button" id="ai-close-mobile-drawer" class="grid place-items-center h-9 w-9 rounded-lg hover:bg-white/[0.06] text-neutral-500 transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96]" title="Close">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                </button>
              </div>
              <div class="relative w-full mt-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                <input data-chat-search="true" placeholder="Suchen..." class="orbit-searchbar-input w-full pl-9 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" type="text" value="${escapeHtml(chatSearchQuery)}">
              </div>
            </div>
            <div class="flex-1 overflow-y-auto overscroll-contain py-1 scrollbar-thin" data-lenis-prevent="true">
              ${renderChatListItems(true)}
            </div>
            <div class="px-2 py-1.5 flex-shrink-0 border-t border-white/[0.05]">
              <button type="button" data-action="clear-all-chats" class="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-[12px] text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 w-3.5 h-3.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>Clear all
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile/Tablet Bottom Sheet for Features (< 2xl) -->
        <div id="ai-features-sheet-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 2xl:hidden transition-opacity duration-300 ${featuresPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}"></div>
        <div class="fixed inset-x-0 bottom-0 top-16 z-50 2xl:hidden transition-transform duration-300 ease-out ${featuresPanelOpen ? 'translate-y-0' : 'translate-y-full'}">
          <div data-tour="builder-features-panel" class="h-full overflow-hidden rounded-t-2xl border-t border-white/[0.08] bg-neutral-900 shadow-[0_-16px_40px_-12px_rgba(0,0,0,0.6)]">
            <div class="h-full w-full flex flex-col min-h-0 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div class="flex-shrink-0 flex items-center justify-between px-4 h-12 border-b border-white/[0.05]">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4 text-neutral-300"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                  <span class="text-[13.5px] font-semibold text-neutral-100">Features</span>
                </div>
                <button type="button" data-close-features="true" class="relative grid place-items-center h-8 w-8 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.06] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96] before:absolute before:inset-[-4px] before:content-['']" title="Close features">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                </button>
              </div>
              <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-1.5 scrollbar-thin" data-lenis-prevent="true">
                ${renderFeaturesListHtml()}
              </div>
            </div>
          </div>
        </div>

        <!-- Main 3-Column Row -->
        <div class="w-full flex-1 flex gap-2 sm:gap-4 min-h-0">
          <!-- Column 1: Left Chat History Sidebar (1:1 Screenshot 1) -->
          <div data-tour="builder-chats" class="scroll-mt-24 hidden lg:flex shrink-0 overflow-hidden transition-[width] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]" style="width: ${leftSidebarCollapsed ? '0px' : '296px'};">
            <div class="w-full flex flex-col flex-shrink-0 overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl">
              <div class="px-2 pt-2 pb-1.5 flex-shrink-0">
                <div class="flex items-center gap-1.5">
                  <button type="button" data-action="new-chat" class="flex-1 flex items-center gap-2 px-3 h-9 rounded-lg text-[13.5px] font-medium text-neutral-100 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.06] transition-[background-color,transform] duration-150 ease-out active:scale-[0.99]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen w-4 h-4 text-neutral-300"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>Neuer Chat
                  </button>
                  <button type="button" id="ai-collapse-sidebar-btn" class="grid place-items-center h-9 w-9 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-neutral-300 transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96]" title="Collapse sidebar" aria-label="Collapse sidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-left-close w-4 h-4"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m16 15-3-3 3-3"></path></svg>
                  </button>
                </div>
                <div class="relative w-full mt-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                  <input id="ai-desktop-chat-search" data-chat-search="true" placeholder="Suchen..." class="orbit-searchbar-input w-full pl-9 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" type="text" value="${escapeHtml(chatSearchQuery)}">
                </div>
              </div>
              <div id="ai-desktop-chat-list" data-lenis-prevent="true" class="flex-1 overflow-y-auto overscroll-contain py-1 scrollbar-thin">
                ${renderChatListItems(false)}
              </div>
              <div class="px-2 py-1.5 flex-shrink-0 border-t border-white/[0.05]">
                <button type="button" data-action="clear-all-chats" class="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-[12px] text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 w-3.5 h-3.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>Clear all
                </button>
              </div>
            </div>
          </div>

          <!-- Columns 2 & 3 Container -->
          <div class="flex-1 min-w-0 flex flex-col lg:flex-row gap-0 lg:gap-4 min-h-0">
            <!-- Mobile Tab Bar -->
            <div class="flex lg:hidden gap-1.5 p-1.5 bg-neutral-900 border border-neutral-800 border-b-0 rounded-t-2xl flex-shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
              <button type="button" id="ai-open-mobile-drawer" class="px-3 py-2.5 text-sm font-medium rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" title="Chatverlauf" aria-label="Chatverlauf">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-5 h-5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
              </button>
              <button type="button" data-mobile-view="chat" class="relative flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-[color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${mobileActiveView === 'chat' ? 'text-white' : 'text-neutral-400'}">
                ${mobileActiveView === 'chat' ? '<span class="absolute inset-0 bg-neutral-700 rounded-lg shadow-sm" style="opacity: 1;"></span>' : ''}
                <span class="relative z-10">Chat</span>
              </button>
              <button type="button" data-mobile-view="preview" class="relative flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-[color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${mobileActiveView === 'preview' ? 'text-white' : 'text-neutral-400'}">
                ${mobileActiveView === 'preview' ? '<span class="absolute inset-0 bg-neutral-700 rounded-lg shadow-sm" style="opacity: 1;"></span>' : ''}
                <span class="relative z-10">Vorschau</span>
              </button>
            </div>

            <!-- Column 2: Center Chat Pane (1:1 Screenshot 3) -->
            <div class="lg:flex-[12] ${mobileActiveView === 'chat' ? 'flex' : 'hidden lg:flex'} flex-col min-h-0 min-w-0 flex-1">
              <div class="relative h-full flex flex-col min-h-0 bg-neutral-900 border border-white/[0.06] ring-1 ring-white/[0.02] rounded-2xl max-lg:rounded-t-none overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <div class="flex-shrink-0 flex items-center justify-between px-2 sm:px-4 py-3 min-h-[52px] border-b border-neutral-800">
                  <div>
                    ${leftSidebarCollapsed ? `
                      <button type="button" id="ai-expand-sidebar-btn" class="p-2.5 sm:p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-[color,background-color,transform] active:scale-[0.96]" title="Expand sidebar" aria-label="Expand sidebar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-left-open w-5 h-5 sm:w-4 sm:h-4"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m14 9 3 3-3 3"></path></svg>
                      </button>
                    ` : ''}
                  </div>
                  <div class="flex items-center gap-1">
                    <button type="button" id="ai-undo-btn" ${canUndo ? '' : 'disabled=""'} class="p-2.5 sm:p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-[color,background-color,transform] active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100" title="Undo (Ctrl+Z)" aria-label="Undo (Ctrl+Z)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo2 w-5 h-5 sm:w-4 sm:h-4"><path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path></svg>
                    </button>
                    <button type="button" id="ai-redo-btn" ${canRedo ? '' : 'disabled=""'} class="p-2.5 sm:p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-[color,background-color,transform] active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100" title="Redo (Ctrl+Y)" aria-label="Redo (Ctrl+Y)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo2 w-5 h-5 sm:w-4 sm:h-4"><path d="m15 14 5-5-5-5"></path><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"></path></svg>
                    </button>
                    <div class="relative">
                      <button type="button" id="ai-history-btn" class="p-2.5 sm:p-1.5 rounded-lg transition-[color,background-color,transform] active:scale-[0.96] text-neutral-400 hover:text-white hover:bg-neutral-800" title="Action History" aria-label="Action History">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-history w-5 h-5 sm:w-4 sm:h-4"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path></svg>
                        ${actionHistory.length > 0 ? `<span class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[8px] font-bold tabular-nums bg-neutral-600 text-white rounded-full flex items-center justify-center">${actionHistory.length}</span>` : ''}
                      </button>
                      <div id="ai-history-menu" data-lenis-prevent="true" class="orbit-dropdown-menu ${historyDropdownOpen ? '' : 'hidden'} absolute right-0 mt-2 w-72 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-3 z-[99999]">
                        <p class="text-[12px] font-semibold text-white mb-2">Action History</p>
                        ${actionHistory.length === 0 ? `
                          <p class="text-[12px] text-neutral-500 py-3 text-center">No actions applied yet</p>
                        ` : `
                          <div class="max-h-60 overflow-y-auto overscroll-contain space-y-1.5 scrollbar-thin" data-lenis-prevent="true">
                            ${actionHistory.map(h => `
                              <div class="flex items-center gap-2 text-[12px] text-neutral-300 bg-white/[0.03] px-2.5 py-1.5 rounded-lg">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                                <span class="truncate flex-1">${escapeHtml(h.title)}</span>
                              </div>
                            `).join('')}
                          </div>
                        `}
                      </div>
                    </div>
                    <button type="button" data-action="new-chat" class="p-2.5 sm:p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-[color,background-color,transform] active:scale-[0.96]" title="New Chat" aria-label="New Chat">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw w-5 h-5 sm:w-4 sm:h-4"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                    </button>
                  </div>
                </div>
                <div class="relative flex-1 flex flex-col min-h-0 overflow-hidden">
                  ${renderCenterBodyHtml()}
                </div>
              </div>
            </div>

            <!-- Column 3: Right Plan Pane (1:1 Screenshot 2) -->
            <div data-tour="builder-plan" class="scroll-mt-24 min-h-0 min-w-0 lg:flex-[5] lg:min-w-[300px] ${mobileActiveView === 'preview' ? 'flex flex-1' : 'hidden lg:flex'}">
              <div class="relative w-full flex flex-col h-full bg-neutral-900 border border-neutral-800 ring-1 ring-white/[0.02] rounded-2xl max-lg:rounded-t-none overflow-hidden shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
                <div class="flex-shrink-0 flex flex-col gap-y-2 px-3 sm:px-5 py-3 border-b border-neutral-800/80">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-4 h-4 text-neutral-400"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                        <span class="text-[15px] font-medium text-white">Plan</span>
                      </div>
                      <span class="text-neutral-700 hidden xl:inline">·</span>
                      <span class="hidden xl:inline text-[13px] tabular-nums truncate"><span class="text-neutral-200 font-semibold">${totalChannels}</span><span class="text-neutral-600"> channels · </span><span class="text-neutral-200 font-semibold">${totalRoles}</span><span class="text-neutral-600"> roles</span><span class="text-neutral-600"> · </span><span class="text-neutral-200 font-semibold">${totalCategories}</span><span class="text-neutral-600"> categories</span></span>
                      <span class="xl:hidden text-[12.5px] tabular-nums truncate"><span class="text-neutral-200 font-semibold">${totalChannels}</span><span class="text-neutral-600"> ch</span><span class="text-neutral-700"> · </span><span class="text-neutral-200 font-semibold">${totalRoles}</span><span class="text-neutral-600"> r</span><span class="text-neutral-700"> · </span><span class="text-neutral-200 font-semibold">${totalCategories}</span><span class="text-neutral-600"> cat</span></span>
                    </div>
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                      <button type="button" id="ai-refresh-plan-btn" class="p-2.5 sm:p-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] transition-colors disabled:opacity-40" title="Reset plan to live server state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-3.5 h-3.5 "><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
                      </button>
                      <button type="button" id="ai-apply-all-btn" ${hasPending && !isApplying ? '' : 'disabled=""'} class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-[color,background-color,transform] duration-150 ease-out ${
                        hasPending && !isApplying
                          ? 'bg-white text-black hover:bg-neutral-200 active:scale-[0.97] cursor-pointer'
                          : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                      }" title="${hasPending ? 'Apply pending changes' : 'No pending changes to apply'}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket w-3 h-3"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>${isApplying ? 'Building…' : 'Build'}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Sub-Tabs (Channels | Roles | Features) -->
                <div class="flex-shrink-0 flex items-center gap-2 px-2.5 pt-3 pb-2 border-b border-neutral-800/80">
                  <div class="relative flex items-center gap-0.5 min-w-0">
                    <button type="button" data-plan-tab="channels" class="relative flex-shrink-0 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                      ${planTab === 'channels' ? '<span class="absolute inset-0 rounded-lg bg-white shadow-[0_2px_8px_-2px_rgba(255,255,255,0.18)]" style="opacity: 1;"></span>' : ''}
                      <span class="relative z-10 inline-flex items-center gap-1.5 ${planTab === 'channels' ? 'text-black' : 'text-neutral-400 hover:text-white'}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-4 h-4"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>Channels
                      </span>
                    </button>
                    <button type="button" data-plan-tab="roles" data-tour="builder-roles-tab" class="relative flex-shrink-0 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                      ${planTab === 'roles' ? '<span class="absolute inset-0 rounded-lg bg-white shadow-[0_2px_8px_-2px_rgba(255,255,255,0.18)]" style="opacity: 1;"></span>' : ''}
                      <span class="relative z-10 inline-flex items-center gap-1.5 ${planTab === 'roles' ? 'text-black' : 'text-neutral-400 hover:text-white'}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>Roles
                      </span>
                    </button>
                    <button type="button" data-plan-tab="features" aria-label="Features" data-tour="builder-features-tab" class="relative flex-shrink-0 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 hover:bg-white/[0.05]">
                      ${planTab === 'features' ? '<span class="absolute inset-0 rounded-lg bg-white shadow-[0_2px_8px_-2px_rgba(255,255,255,0.18)]" style="opacity: 1;"></span>' : ''}
                      <span class="relative z-10 inline-flex items-center gap-1.5 ${planTab === 'features' ? 'text-black' : 'text-neutral-400 hover:text-white'}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>Features
                      </span>
                    </button>
                  </div>
                </div>

                <!-- Plan Content Body -->
                <div class="flex-1 overflow-hidden relative bg-white dark:bg-neutral-900">
                  ${renderPlanContentHtml()}
                </div>

                <!-- Plan Footer -->
                <div class="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-neutral-800/80 text-[11px]">
                  ${hasPending ? `
                    <span class="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>${pendingActions.length} change(s) pending
                    </span>
                  ` : `
                    <span class="inline-flex items-center gap-1.5 text-neutral-500">
                      <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>All synced – nothing pending
                    </span>
                  `}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    bindEvents();
    scrollToBottom();
  }

  function scrollToBottom() {
    const scroller = document.getElementById('ai-chat-scroll');
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }

  async function sendMessage(text) {
    const clean = String(text || '').trim();
    const attachmentsToSend = [...pendingAttachments];
    if ((!clean && attachmentsToSend.length === 0) || isSending) return;

    const finalMessage = clean || 'Analyze the uploaded content and provide suggestions or suitable configurations for this server.';
    isSending = true;
    draftInputText = '';
    pendingAttachments = [];
    quickAddDropdownOpen = false;
    modelDropdownOpen = false;
    openChatOptionsId = null;

    let tempChat = getActiveChat();
    if (!tempChat) {
      const tempId = 'temp_' + Date.now();
      tempChat = {
        id: tempId,
        title: finalMessage.slice(0, 42) + (finalMessage.length > 42 ? '…' : ''),
        created_at: Date.now() / 1000,
        updated_at: Date.now() / 1000,
        messages: []
      };
      chats.unshift(tempChat);
      activeChatId = tempId;
    }
    tempChat.messages.push({
      id: 'u_' + Date.now(),
      role: 'user',
      content: finalMessage,
      attachments: attachmentsToSend,
      timestamp: Date.now() / 1000
    });

    render();

    try {
      const realChatId = activeChatId && !String(activeChatId).startsWith('temp_') ? activeChatId : '';
      const useModel = attachmentsToSend.some(a => a.type === 'image')
        ? 'meta-llama/llama-4-scout-17b-16e-instruct'
        : selectedModel;

      const res = await API.sendAIHelperChat(guildId, {
        message: finalMessage,
        chat_id: realChatId,
        model: useModel,
        attachments: attachmentsToSend
      });

      if (res && res.chats) {
        chats = mergeChats(res.chats, chats.filter(c => !String(c.id).startsWith('temp_')));
      }
      if (res && res.chat_id) {
        activeChatId = res.chat_id;
      }
      saveLocalChats(chats, activeChatId);

      if (res && Array.isArray(res.actions) && res.actions.length > 0) {
        for (const act of res.actions) {
          if (!pendingActions.some(p => p.id === act.id)) {
            pendingActions.push(act);
          }
        }
      }
    } catch (err) {
      const current = getActiveChat();
      if (current) {
        current.messages.push({
          id: 'err_' + Date.now(),
          role: 'assistant',
          content: `Request error: ${err.message || 'Unknown error'}`,
          actions: [],
          timestamp: Date.now() / 1000
        });
        saveLocalChats(chats, activeChatId);
      }
    } finally {
      isSending = false;
      render();
    }
  }

  async function applyActions(actionsToApply) {
    if (!actionsToApply || !actionsToApply.length || isApplying) return;
    isApplying = true;
    render();

    try {
      const res = await API.applyAIHelperActions(guildId, actionsToApply);
      if (res) {
        for (const a of actionsToApply) {
          if (a.id) {
            appliedActionIds.add(a.id);
            a.applied = true;
          }
        }
        saveAppliedActions(appliedActionIds);

        // Mark on all matching actions inside chats
        for (const c of chats) {
          for (const m of (c.messages || [])) {
            for (const a of (m.actions || [])) {
              if (appliedActionIds.has(a.id)) {
                a.applied = true;
              }
            }
          }
        }
        saveLocalChats(chats, activeChatId);

        const appliedIds = new Set(actionsToApply.map(a => a.id));
        pendingActions = pendingActions.filter(p => !appliedIds.has(p.id));
        canUndo = Boolean(res.can_undo);
        canRedo = Boolean(res.can_redo);
        if (Array.isArray(res.action_history)) {
          actionHistory = res.action_history;
        }

        try {
          cfg = await API.getConfig(guildId);
        } catch (_) {}

        if (window.Toast) {
          if (res.errors && res.errors.length > 0) {
            window.Toast.error(res.errors.join(' | '));
          } else {
            window.Toast.success(`${(res.applied || actionsToApply).length} change(s) successfully applied!`);
          }
        }
      }
    } catch (err) {
      if (window.Toast) {
        window.Toast.error(err.message || 'Failed to apply changes');
      }
    } finally {
      isApplying = false;
      render();
    }
  }

  function bindEvents() {
    const textarea = document.getElementById('ai-helper-textarea');
    const sendBtn = document.getElementById('ai-helper-send-btn');

    if (textarea && sendBtn) {
      const syncTextarea = () => {
        draftInputText = textarea.value;
        textarea.style.height = '48px';
        const nextH = Math.min(180, Math.max(48, textarea.scrollHeight));
        textarea.style.height = nextH + 'px';
        const hasContent = (textarea.value.trim().length > 0 || pendingAttachments.length > 0) && !isSending;
        sendBtn.disabled = !hasContent;
        if (hasContent) {
          sendBtn.className = "relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-[color,background-color,box-shadow,transform] before:absolute before:inset-[-2px] before:content-[''] bg-white text-black hover:bg-neutral-200 cursor-pointer";
        } else {
          sendBtn.className = "relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-[color,background-color,box-shadow,transform] before:absolute before:inset-[-2px] before:content-[''] bg-neutral-800 text-neutral-600 cursor-not-allowed";
        }
      };

      syncTextarea();
      textarea.addEventListener('input', syncTextarea);
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if ((textarea.value.trim() || pendingAttachments.length > 0) && !isSending) {
            sendMessage(textarea.value);
          }
        }
      });

      textarea.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        const files = [];
        for (const it of items) {
          if (it.kind === 'file') {
            const f = it.getAsFile();
            if (f) files.push(f);
          }
        }
        if (files.length > 0) {
          e.preventDefault();
          handleFilesSelected(files);
        }
      });

      sendBtn.addEventListener('click', () => {
        if ((textarea.value.trim() || pendingAttachments.length > 0) && !isSending) {
          sendMessage(textarea.value);
        }
      });
    }

    const dropzone = document.getElementById('ai-prompt-dropzone');
    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-white/30');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-white/30');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-white/30');
        if (e.dataTransfer?.files?.length) {
          handleFilesSelected(e.dataTransfer.files);
        }
      });
    }

    const imgUploadBtn = document.getElementById('ai-trigger-image-upload');
    const fileUploadBtn = document.getElementById('ai-trigger-file-upload');
    const imgInput = document.getElementById('ai-upload-image-input');
    const fileInput = document.getElementById('ai-upload-file-input');

    if (imgUploadBtn && imgInput) {
      imgUploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        imgInput.click();
      });
      imgInput.addEventListener('change', () => {
        if (imgInput.files?.length) handleFilesSelected(imgInput.files);
      });
    }

    if (fileUploadBtn && fileInput) {
      fileUploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
      });
      fileInput.addEventListener('change', () => {
        if (fileInput.files?.length) handleFilesSelected(fileInput.files);
      });
    }

    container.querySelectorAll('[data-remove-attachment]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(btn.getAttribute('data-remove-attachment'));
        if (!Number.isNaN(idx)) {
          pendingAttachments.splice(idx, 1);
          render();
        }
      });
    });

    container.querySelectorAll('[data-copy-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idVal = btn.getAttribute('data-copy-id');
        const labelVal = btn.getAttribute('data-copy-label') || '';
        copyIdToClipboard(idVal, labelVal, btn);
      });
    });

    container.querySelectorAll('[data-action="new-chat"]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeChatId = null;
        draftInputText = '';
        pendingAttachments = [];
        mobileChatDrawerOpen = false;
        openChatOptionsId = null;
        saveLocalChats(chats, null);
        render();
      });
    });

    container.querySelectorAll('[data-action="clear-all-chats"]').forEach(btn => {
      btn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const confirmed = await window.confirmDelete({
          title: 'Delete all chats?',
          message: 'This cannot be undone. All previous chat history will be permanently deleted.',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        });
        if (!confirmed) return;
        chats = [];
        activeChatId = null;
        openChatOptionsId = null;
        saveLocalChats([], null);
        try {
          await API.deleteAIHelperChat(guildId, 'all');
        } catch (_) {}
        render();
        if (window.Toast) window.Toast.success('All chats deleted');
      };
    });

    container.querySelectorAll('[data-select-chat]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (
          e.target.closest('[data-chat-options]') ||
          e.target.closest('[data-delete-chat]') ||
          e.target.closest('[data-rename-chat]') ||
          e.target.closest('[data-rename-wrap]')
        ) return;
        activeChatId = el.getAttribute('data-select-chat');
        mobileChatDrawerOpen = false;
        openChatOptionsId = null;
        editingChatId = null;
        saveLocalChats(chats, activeChatId);
        render();
      });
    });

    container.querySelectorAll('[data-chat-options]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cid = btn.getAttribute('data-chat-options');
        const willOpen = openChatOptionsId !== cid;
        closeAllPopupsDom();
        if (willOpen) {
          openChatOptionsId = cid;
          container.querySelectorAll(`[data-chat-options-menu="${CSS.escape ? CSS.escape(cid) : cid}"]`).forEach(m => m.classList.remove('hidden'));
        }
      });
    });

    container.querySelectorAll('[data-rename-chat]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cid = btn.getAttribute('data-rename-chat');
        openChatOptionsId = null;
        editingChatId = cid;
        render();
        setTimeout(() => {
          const inp = container.querySelector(`[data-rename-input="${CSS.escape ? CSS.escape(cid) : cid}"]`);
          if (inp) {
            inp.focus();
            inp.select();
          }
        }, 10);
      });
    });

    container.querySelectorAll('[data-rename-input]').forEach(inp => {
      const cid = inp.getAttribute('data-rename-input');
      let committed = false;
      const commitRename = () => {
        if (committed || editingChatId !== cid) return;
        committed = true;
        const nextTitle = inp.value.trim();
        const target = chats.find(c => c.id === cid);
        if (target && nextTitle) {
          target.title = nextTitle;
          target.updated_at = Date.now() / 1000;
          saveLocalChats(chats, activeChatId);
          if (!String(cid).startsWith('temp_') && API.renameAIHelperChat) {
            API.renameAIHelperChat(guildId, cid, nextTitle).catch(() => {});
          }
        }
        editingChatId = null;
        render();
      };
      const cancelRename = () => {
        if (committed) return;
        committed = true;
        editingChatId = null;
        render();
      };
      inp.addEventListener('click', (e) => e.stopPropagation());
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitRename();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelRename();
        }
      });
      const saveBtn = container.querySelector(`[data-rename-save="${CSS.escape ? CSS.escape(cid) : cid}"]`);
      const cancelBtn = container.querySelector(`[data-rename-cancel="${CSS.escape ? CSS.escape(cid) : cid}"]`);
      saveBtn?.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        commitRename();
      });
      cancelBtn?.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cancelRename();
      });
      inp.addEventListener('blur', () => {
        setTimeout(() => {
          if (!committed) commitRename();
        }, 100);
      });
    });

    container.querySelectorAll('[data-delete-chat]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const cid = btn.getAttribute('data-delete-chat');
        openChatOptionsId = null;
        if (!cid) return;
        const targetChat = chats.find(c => c.id === cid);
        const confirmed = await window.confirmDelete({
          title: `Delete ${targetChat?.title || 'Chat'}?`,
          message: 'This cannot be undone. The chat history will be permanently deleted.',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        });
        if (!confirmed) return;
        chats = chats.filter(c => c.id !== cid);
        if (activeChatId === cid) {
          activeChatId = chats.length ? chats[0].id : null;
        }
        saveLocalChats(chats, activeChatId);
        try {
          if (!String(cid).startsWith('temp_')) {
            await API.deleteAIHelperChat(guildId, cid);
          }
        } catch (_) {}
        render();
      });
    });


    container.querySelectorAll('[data-chat-search]').forEach(inp => {
      inp.addEventListener('input', () => {
        chatSearchQuery = inp.value;
        const desktopList = document.getElementById('ai-desktop-chat-list');
        if (desktopList) desktopList.innerHTML = renderChatListItems(false);
      });
    });

    const collapseBtn = document.getElementById('ai-collapse-sidebar-btn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        leftSidebarCollapsed = true;
        render();
      });
    }

    const expandBtn = document.getElementById('ai-expand-sidebar-btn');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        leftSidebarCollapsed = false;
        render();
      });
    }

    const openMobileDrawer = document.getElementById('ai-open-mobile-drawer');
    if (openMobileDrawer) {
      openMobileDrawer.addEventListener('click', () => {
        mobileChatDrawerOpen = true;
        render();
      });
    }

    const closeMobileDrawer = document.getElementById('ai-close-mobile-drawer');
    const mobileBackdrop = document.getElementById('ai-mobile-drawer-backdrop');
    if (closeMobileDrawer) {
      closeMobileDrawer.addEventListener('click', () => {
        mobileChatDrawerOpen = false;
        render();
      });
    }
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', () => {
        mobileChatDrawerOpen = false;
        render();
      });
    }

    container.querySelectorAll('[data-mobile-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        mobileActiveView = btn.getAttribute('data-mobile-view') || 'chat';
        render();
      });
    });

    container.querySelectorAll('[data-plan-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextTab = btn.getAttribute('data-plan-tab');
        planTab = nextTab;
        render();
      });
    });

    container.querySelectorAll('[data-close-features]').forEach(btn => {
      btn.addEventListener('click', () => {
        featuresPanelOpen = false;
        if (planTab === 'features') planTab = 'channels';
        render();
      });
    });

    const featuresBackdrop = document.getElementById('ai-features-sheet-backdrop');
    if (featuresBackdrop) {
      featuresBackdrop.addEventListener('click', () => {
        featuresPanelOpen = false;
        render();
      });
    }

    container.querySelectorAll('[data-toggle-cat]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-copy-id]')) return;
        const catId = String(el.getAttribute('data-toggle-cat'));
        if (collapsedCategories.has(catId)) {
          collapsedCategories.delete(catId);
        } else {
          collapsedCategories.add(catId);
        }
        render();
      });
    });

    container.querySelectorAll('[data-insert-mention]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-copy-id]')) return;
        e.stopPropagation();
        const mention = el.getAttribute('data-insert-mention');
        const input = document.getElementById('ai-helper-textarea');
        if (input && mention) {
          const prefix = input.value && !input.value.endsWith(' ') ? input.value + ' ' : (input.value || '');
          input.value = `${prefix}${mention} `;
          draftInputText = input.value;
          input.focus();
          input.dispatchEvent(new Event('input'));
        }
      });
    });

    container.querySelectorAll('[data-feature-prompt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const promptText = btn.getAttribute('data-feature-prompt');
        if (promptText) {
          featuresPanelOpen = false;
          mobileActiveView = 'chat';
          sendMessage(promptText);
        }
      });
    });

    const quickAddBtn = document.getElementById('ai-quick-add-btn');
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !quickAddDropdownOpen;
        closeAllPopupsDom();
        if (willOpen) {
          quickAddDropdownOpen = true;
          document.getElementById('ai-quick-add-menu')?.classList.remove('hidden');
        }
      });
    }

    const modelPickerBtn = document.getElementById('ai-model-picker-btn');
    if (modelPickerBtn) {
      modelPickerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !modelDropdownOpen;
        closeAllPopupsDom();
        if (willOpen) {
          modelDropdownOpen = true;
          document.getElementById('ai-model-picker-menu')?.classList.remove('hidden');
        }
      });
    }

    container.querySelectorAll('[data-select-model]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedModel = btn.getAttribute('data-select-model') || 'llama-3.3-70b-versatile';
        selectedModelLabel = btn.getAttribute('data-select-model-label') || 'Llama 3.3 70B';
        closeAllPopupsDom();
        render();
      });
    });

    const historyBtn = document.getElementById('ai-history-btn');
    if (historyBtn) {
      historyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !historyDropdownOpen;
        closeAllPopupsDom();
        if (willOpen) {
          historyDropdownOpen = true;
          document.getElementById('ai-history-menu')?.classList.remove('hidden');
        }
      });
    }

    const applyAllBtn = document.getElementById('ai-apply-all-btn');
    if (applyAllBtn) {
      applyAllBtn.addEventListener('click', () => {
        if (pendingActions.length > 0 && !isApplying) {
          applyActions([...pendingActions]);
        }
      });
    }

    container.querySelectorAll('[data-apply-single]').forEach(btn => {
      btn.addEventListener('click', () => {
        const actId = btn.getAttribute('data-apply-single');
        if (appliedActionIds.has(actId)) return;
        const activeChat = getActiveChat();
        let found = pendingActions.find(a => a.id === actId);
        if (!found && activeChat) {
          for (const m of (activeChat.messages || [])) {
            for (const a of (m.actions || [])) {
              if (a.id === actId) found = a;
            }
          }
        }
        if (found) {
          applyActions([found]);
        }
      });
    });

    const clearPendingBtn = document.getElementById('ai-clear-pending-btn');
    if (clearPendingBtn) {
      clearPendingBtn.addEventListener('click', () => {
        pendingActions = [];
        render();
      });
    }

    container.querySelectorAll('[data-remove-pending]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-remove-pending'));
        if (!Number.isNaN(idx)) {
          pendingActions.splice(idx, 1);
          render();
        }
      });
    });

    container.querySelectorAll('[data-prompt-chip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt-chip');
        if (prompt && !isSending) {
          sendMessage(prompt);
        }
      });
    });

    const refreshPlanBtn = document.getElementById('ai-refresh-plan-btn');
    if (refreshPlanBtn) {
      refreshPlanBtn.addEventListener('click', async () => {
        try {
          cfg = await API.getConfig(guildId);
          render();
          if (window.Toast) window.Toast.success('Live server status updated');
        } catch (_) {}
      });
    }

    const undoBtn = document.getElementById('ai-undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', async () => {
        if (!canUndo) return;
        try {
          const res = await API.undoAIHelperAction(guildId);
          if (res) {
            canUndo = Boolean(res.can_undo);
            canRedo = Boolean(res.can_redo);
            if (Array.isArray(res.action_history)) actionHistory = res.action_history;
            cfg = await API.getConfig(guildId).catch(() => cfg);
            render();
            if (window.Toast) window.Toast.info('Last action undone');
          }
        } catch (err) {
          if (window.Toast) window.Toast.error(err.message || 'Undo failed');
        }
      });
    }

    const redoBtn = document.getElementById('ai-redo-btn');
    if (redoBtn) {
      redoBtn.addEventListener('click', async () => {
        if (!canRedo) return;
        try {
          const res = await API.redoAIHelperAction(guildId);
          if (res) {
            canUndo = Boolean(res.can_undo);
            canRedo = Boolean(res.can_redo);
            if (Array.isArray(res.action_history)) actionHistory = res.action_history;
            cfg = await API.getConfig(guildId).catch(() => cfg);
            render();
            if (window.Toast) window.Toast.success('Action restored');
          }
        } catch (err) {
          if (window.Toast) window.Toast.error(err.message || 'Redo failed');
        }
      });
    }
  }

  if (window.__aiHelperOutsideClick) {
    document.removeEventListener('click', window.__aiHelperOutsideClick);
  }
  window.__aiHelperOutsideClick = () => {
    if (modelDropdownOpen || historyDropdownOpen || quickAddDropdownOpen || openChatOptionsId) {
      closeAllPopupsDom();
    }
  };
  document.addEventListener('click', window.__aiHelperOutsideClick);

  render();
};
