/**
 * Orbit Dashboard - AI Helper Tab (1:1 PeakBot AI Layout + Groq Vision/File Analysis, Persistent Chat History & Server ID Inspector)
 */

DashboardTabs.Builder = async function(container, guildId) {
  // Ensure full-width container matching PeakBot's <main class="p-4 lg:p-6 xl:p-8">
  container.classList.remove('max-w-[1200px]', 'mx-auto');

  const STORAGE_CHATS_KEY = `orbit_ai_helper_chats_${guildId}`;
  const STORAGE_ACTIVE_KEY = `orbit_ai_helper_active_chat_${guildId}`;

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
    if (hour >= 22 || hour < 5) return `Bis spät dran, ${name}`;
    if (hour < 12) return `Guten Morgen, ${name}`;
    if (hour < 18) return `Guten Tag, ${name}`;
    return `Guten Abend, ${name}`;
  }

  function formatRelativeTime(ts) {
    if (!ts) return '';
    const diffSec = Math.max(0, Math.floor(Date.now() / 1000 - Number(ts)));
    if (diffSec < 60) return 'Gerade eben';
    if (diffSec < 3600) return `vor ${Math.floor(diffSec / 60)} Min.`;
    if (diffSec < 86400) return `vor ${Math.floor(diffSec / 3600)} Std.`;
    return `vor ${Math.floor(diffSec / 86400)} Tg.`;
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
        if (!existing || (c.messages?.length || 0) >= (existing.messages?.length || 0)) {
          map.set(String(c.id), c);
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => (b.updated_at || b.created_at || 0) - (a.updated_at || a.created_at || 0));
  }

  // Load current user and guild config + saved chats in parallel
  let user = null;
  let cfg = {};
  let chatData = { chats: [], action_history: [], can_undo: false, can_redo: false };

  try {
    const [uRes, cfgRes, chatsRes] = await Promise.all([
      API.getUser().catch(() => null),
      API.getConfig(guildId).catch(() => ({})),
      API.getAIHelperChats(guildId).catch(() => ({ chats: [], action_history: [], can_undo: false, can_redo: false }))
    ]);
    user = uRes;
    cfg = cfgRes || {};
    chatData = chatsRes || { chats: [], action_history: [], can_undo: false, can_redo: false };
  } catch (_) {}

  const userName = user?.global_name || user?.username || 'Admin';

  // Merge backend chats with localStorage fallback so chat history is NEVER lost
  let chats = mergeChats(Array.isArray(chatData.chats) ? chatData.chats : [], loadLocalChats());
  let savedActiveId = null;
  try {
    savedActiveId = localStorage.getItem(STORAGE_ACTIVE_KEY);
  } catch (_) {}

  let activeChatId = (savedActiveId && chats.some(c => c.id === savedActiveId))
    ? savedActiveId
    : null;

  saveLocalChats(chats, activeChatId);

  let chatSearchQuery = '';
  let planSearchQuery = '';
  let leftSidebarCollapsed = false;
  let mobileChatDrawerOpen = false;
  let mobileActiveView = 'chat'; // 'chat' | 'preview'
  let planTab = 'channels'; // 'channels' | 'roles' | 'features'
  let featuresPanelOpen = false;
  let collapsedCategories = new Set();
  let selectedModel = 'openai/gpt-oss-120b';
  let selectedModelLabel = 'Onyx V1';
  let modelDropdownOpen = false;
  let historyDropdownOpen = false;
  let quickAddDropdownOpen = false;
  let isSending = false;
  let isApplying = false;
  let pendingActions = [];
  let pendingAttachments = []; // [{ id, type: 'image'|'file', name, dataUrl, textContent, size }]
  let draftInputText = '';
  let appliedActionIds = new Set();
  let actionHistory = Array.isArray(chatData.action_history) ? chatData.action_history : [];
  let canUndo = Boolean(chatData.can_undo);
  let canRedo = Boolean(chatData.can_redo);

  const MODELS = [
    { id: 'openai/gpt-oss-120b', label: 'Onyx V1', desc: 'GPT-OSS 120B · Höchste Präzision' },
    { id: 'qwen/qwen3.8-27b', label: 'Qwen 3.8', desc: 'Qwen 27B · Schnell & Clever' },
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Vision', desc: 'Multimodal · Ideal für Bilder & Screenshots' },
    { id: 'openai/gpt-oss-20b', label: 'Onyx Fast', desc: 'GPT-OSS 20B · Ultra-Schnell' }
  ];

  // Exact 17 features from PeakBot reference HTML
  const FEATURES_LIST = [
    {
      key: 'welcome',
      title: 'Willkommensnachrichten',
      desc: 'Begrüßen Sie neue Mitglieder',
      color: 'rgb(87, 242, 135)',
      isEnabled: () => Boolean(cfg?.welcome?.enabled || cfg?.config?.welcome?.enabled),
      prompt: 'Richte Willkommensnachrichten für diesen Server ein. Wähle einen passenden Willkommens- oder Allgemein-Kanal und erstelle ein schönes Willkommens-Embed.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(87, 242, 135);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
    },
    {
      key: 'goodbye',
      title: 'Abschiedsnachrichten',
      desc: 'Nachricht, wenn Mitglieder austreten',
      color: 'rgb(148, 163, 184)',
      isEnabled: () => Boolean(cfg?.goodbye?.enabled || cfg?.config?.goodbye?.enabled),
      prompt: 'Richte Abschiedsnachrichten für diesen Server ein, wenn Mitglieder den Server verlassen.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(148, 163, 184);"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>`
    },
    {
      key: 'tempvoice',
      title: 'Join-to-Create',
      desc: 'Temporäre Sprachkanäle',
      color: 'rgb(88, 101, 242)',
      isEnabled: () => Boolean(cfg?.tempvoice?.enabled || cfg?.config?.tempvoice?.enabled),
      prompt: 'Konfiguriere Join-to-Create (temporäre Sprachkanäle) für diesen Server mit einem passenden Sprachkanal und einer Kategorie.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2 w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(88, 101, 242);"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`
    },
    {
      key: 'joinroles',
      title: 'Reaktionsrollen',
      desc: 'Rollen aus Reaktionen & Auto-Rollen',
      color: 'rgb(230, 126, 34)',
      isEnabled: () => Boolean(cfg?.joinroles?.enabled || cfg?.config?.joinroles?.enabled),
      prompt: 'Richte Auto-Rollen bei Serverbeitritt für neue Mitglieder auf diesem Server ein.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mouse-pointer-click w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(230, 126, 34);"><path d="m9 9 5 12 1.8-5.2L21 14Z"></path><path d="M7.2 2.2 8 5.1"></path><path d="m5.1 8-2.9-.8"></path><path d="M14 4.1 12 6"></path><path d="m6 12-1.9 2"></path></svg>`
    },
    {
      key: 'tickets',
      title: 'Tickets',
      desc: 'Private Support-Threads',
      color: 'rgb(235, 69, 158)',
      isEnabled: () => Boolean(cfg?.ticket?.enabled || cfg?.config?.ticket?.enabled),
      prompt: 'Konfiguriere das Ticket-System für diesen Server inklusive Ticket-Kanal, Kategorie und Supporter-Rolle.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(235, 69, 158);"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>`
    },
    {
      key: 'level',
      title: 'XP & Levelaufstieg',
      desc: 'Levels und Bestenlisten',
      color: 'rgb(254, 231, 92)',
      isEnabled: () => Boolean(cfg?.level?.enabled || cfg?.config?.level?.enabled),
      prompt: 'Aktiviere und konfiguriere das XP & Level-System für diesen Server.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(254, 231, 92);"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>`
    },
    {
      key: 'giveaways',
      title: 'Werbegeschenke',
      desc: 'Veranstalten Sie Werbegeschenke',
      color: 'rgb(46, 204, 113)',
      isEnabled: () => false,
      prompt: 'Wie kann ich ein Giveaway (Werbegeschenk) auf meinem Server einrichten und welche Kanalberechtigungen sind dafür optimal?',
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
      desc: 'Blockieren Sie schlechte Wörter und Obszönitäten',
      color: 'rgb(52, 152, 219)',
      isEnabled: () => Boolean(cfg?.automod?.banned_words?.enabled || cfg?.config?.automod?.banned_words?.enabled),
      prompt: 'Aktiviere den Inhaltsfilter (Wortfilter gegen Beleidigungen und Obszönitäten) in der Auto-Moderation.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-off w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(52, 152, 219);"><path d="M21 15V5a2 2 0 0 0-2-2H9"></path><path d="m2 2 20 20"></path><path d="M3.6 3.6c-.4.3-.6.8-.6 1.4v16l4-4h10"></path></svg>`
    },
    {
      key: 'anti_spam',
      title: 'Spam-Schutz',
      desc: 'Stoppen Sie die Nachrichtenflut',
      color: 'rgb(249, 115, 22)',
      isEnabled: () => Boolean(cfg?.automod?.anti_spam?.enabled || cfg?.config?.automod?.anti_spam?.enabled),
      prompt: 'Aktiviere den Spam-Schutz (Anti-Spam) in der Auto-Moderation für diesen Server.',
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
      prompt: 'Aktiviere den Anti-Raid-Schutz für diesen Server, um Join-Raid-Angriffe automatisch zu blockieren.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-x w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(220, 38, 38);"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m14.5 9.5-5 5"></path><path d="m9.5 9.5 5 5"></path></svg>`
    },
    {
      key: 'anti_nuke',
      title: 'Anti-Atomkraft',
      desc: 'Blockieren Sie Massenlöschungs- und Verbotsangriffe',
      color: 'rgb(237, 66, 69)',
      isEnabled: () => Boolean(cfg?.security?.anti_nuke?.enabled || cfg?.config?.security?.anti_nuke?.enabled),
      prompt: 'Aktiviere den Anti-Nuke-Schutz (Anti-Atomkraft) für diesen Server gegen Massenlöschungen und Bann-Angriffe.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(237, 66, 69);"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`
    },
    {
      key: 'anti_alt',
      title: 'Verdächtige Konten',
      desc: 'Markieren Sie riskante neue Konten',
      color: 'rgb(245, 158, 11)',
      isEnabled: () => Boolean(cfg?.automod?.anti_alt?.enabled || cfg?.config?.automod?.anti_alt?.enabled),
      prompt: 'Aktiviere den Schutz gegen verdächtige neue Konten (Anti-Alt) mit einem Mindestalter von 3 Tagen.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-x w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(245, 158, 11);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg>`
    },
    {
      key: 'ai_automod',
      title: 'KI-Moderation',
      desc: 'KI liest und moderiert Nachrichten (Pro)',
      color: 'rgb(124, 58, 237)',
      isEnabled: () => Boolean(cfg?.automod?.ai_automod?.enabled || cfg?.config?.automod?.ai_automod?.enabled),
      prompt: 'Aktiviere die KI-Moderation in AutoMod, damit Nachrichten automatisch durch KI auf Toxizität geprüft werden.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(124, 58, 237);"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>`
    },
    {
      key: 'ai_image',
      title: 'Bildmoderation',
      desc: 'AI-Scan gepostete Bilder (Pro)',
      color: 'rgb(128, 132, 142)',
      isEnabled: () => Boolean(cfg?.automod?.ai_image?.enabled || cfg?.config?.automod?.ai_image?.enabled),
      prompt: 'Aktiviere die KI-Bildmoderation für gepostete Bilder auf diesem Server.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-puzzle w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(128, 132, 142);"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"></path></svg>`
    },
    {
      key: 'verify',
      title: 'Überprüfung',
      desc: 'Eröffnen Sie neue Mitglieder',
      color: 'rgb(20, 184, 166)',
      isEnabled: () => Boolean(cfg?.verify?.enabled || cfg?.config?.verify?.enabled),
      prompt: 'Richte das Überprüfungs-System (Verifizierung) für neue Mitglieder mit einem Verifizierungs-Kanal und einer Rolle ein.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle2 w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(20, 184, 166);"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>`
    },
    {
      key: 'onboarding',
      title: 'Onboarding',
      desc: 'Einrichtungsablauf für neue Mitglieder',
      color: 'rgb(52, 211, 153)',
      isEnabled: () => Boolean((cfg?.welcome?.enabled || cfg?.config?.welcome?.enabled) && (cfg?.joinroles?.enabled || cfg?.config?.joinroles?.enabled)),
      prompt: 'Richte einen kompletten Onboarding-Ablauf (Willkommensnachricht + Auto-Rolle + Verifizierung) für neue Mitglieder ein.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(52, 211, 153);"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>`
    },
    {
      key: 'invites',
      title: 'Einladungs-Tracker',
      desc: 'Verfolgen Sie, wer wen eingeladen hat',
      color: 'rgb(255, 152, 0)',
      isEnabled: () => Boolean(cfg?.invites?.enabled || cfg?.config?.invites?.enabled),
      prompt: 'Aktiviere den Einladungs-Tracker für diesen Server inklusive Tracking von Austritten.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-plus w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(255, 152, 0);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>`
    },
    {
      key: 'permissions_helper',
      title: 'Kanal-Berechtigungen',
      desc: 'Rollen-Zugriff in Kanälen steuern',
      color: 'rgb(56, 189, 248)',
      isEnabled: () => false,
      prompt: 'Ich möchte für eine bestimmte Rolle in jedem Kanal (oder bestimmten Kanälen) einstellen, dass sie den Kanal nicht sehen oder dort nicht schreiben darf. Welche Rolle soll angepasst werden?',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock w-[18px] h-[18px] flex-shrink-0 opacity-75" style="color: rgb(56, 189, 248);"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
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
      btnEl.innerHTML = `<span class="text-emerald-400 font-semibold">✓ Kopiert</span>`;
      setTimeout(() => {
        if (btnEl && btnEl.isConnected) btnEl.innerHTML = origHtml;
      }, 1200);
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
      } catch (err) {
        if (window.Toast) window.Toast.error(`Konnte Datei "${file.name}" nicht lesen.`);
      }
    }
    quickAddDropdownOpen = false;
    render();
    if (window.Toast) {
      window.Toast.success(`${fileList.length} Anhang/Anhänge für die KI bereitgestellt`);
    }
  }

  function renderChatListItems() {
    const q = chatSearchQuery.trim().toLowerCase();
    const filtered = q
      ? chats.filter(c => (c.title || '').toLowerCase().includes(q) || (c.messages || []).some(m => (m.content || '').toLowerCase().includes(q)))
      : chats;

    if (!filtered.length) {
      return `
        <div class="text-center py-10 px-4">
          <div class="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square w-5 h-5 text-neutral-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <p class="text-[13px] text-neutral-400 font-medium">${q ? 'Keine passenden Chats gefunden' : 'Noch keine gespeicherten Chats'}</p>
          <p class="text-[11px] text-neutral-500 mt-1">Deine Unterhaltungen mit der KI werden hier automatisch gespeichert.</p>
        </div>
      `;
    }

    return `
      <div class="px-2 space-y-1">
        ${filtered.map(c => {
          const isCurrent = c.id === activeChatId;
          const msgCount = Array.isArray(c.messages) ? c.messages.length : 0;
          const timeStr = formatRelativeTime(c.updated_at || c.created_at);
          return `
            <div class="group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
              isCurrent
                ? 'bg-white/[0.1] text-white border border-white/[0.12] shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] border border-transparent'
            }" data-select-chat="${escapeHtml(c.id)}">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square w-4 h-4 flex-shrink-0 ${isCurrent ? 'text-white' : 'text-neutral-500'}"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <div class="min-w-0 flex-1">
                <p class="text-[13px] font-medium truncate">${escapeHtml(c.title || 'Neues Gespräch')}</p>
                <p class="text-[11px] text-neutral-500 truncate">${msgCount} Nachr.${timeStr ? ' · ' + escapeHtml(timeStr) : ''}</p>
              </div>
              <button type="button" data-delete-chat="${escapeHtml(c.id)}" class="opacity-0 group-hover:opacity-100 p-1 rounded-md text-neutral-500 hover:text-red-400 hover:bg-white/[0.08] transition-all cursor-pointer" title="Chat löschen">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2 w-3.5 h-3.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderFeaturesListHtml() {
    const enabledCount = FEATURES_LIST.filter(f => f.isEnabled()).length;
    return `
      <p class="px-2.5 pt-2 pb-1 text-[12.5px] text-neutral-500 text-pretty">
        ${enabledCount > 0
          ? `${enabledCount} Funktion(en) bereits aktiv. Wählen Sie unten eine Funktion aus und die KI konfiguriert oder aktualisiert sie für Sie.`
          : 'Noch nichts eingerichtet. Wählen Sie unten eine Funktion aus und die KI konfiguriert sie für Sie.'}
      </p>
      <div class="pt-2">
        <div class="px-2.5 pb-1.5">
          <span class="text-[11px] font-medium text-neutral-500">Fügen Sie eine Funktion hinzu</span>
        </div>
        <div class="space-y-1">
          ${FEATURES_LIST.map(f => {
            const active = f.isEnabled();
            return `
              <button type="button" data-feature-prompt="${escapeHtml(f.prompt)}" aria-pressed="${active ? 'true' : 'false'}" class="group/add w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors disabled:cursor-default active:scale-[0.995] cursor-pointer ${
                active
                  ? 'border-emerald-500/25 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]'
                  : 'border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.03]'
              }">
                ${f.svg}
                <span class="min-w-0 flex-1">
                  <span class="flex items-center gap-1.5">
                    <span class="block text-[13.5px] font-medium truncate text-neutral-200">${escapeHtml(f.title)}</span>
                    ${active ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">Aktiv</span>` : ''}
                  </span>
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
        <div class="h-full overflow-y-auto overscroll-contain p-2 space-y-1.5 scrollbar-thin bg-neutral-900" data-lenis-prevent="true">
          ${renderFeaturesListHtml()}
        </div>
      `;
    }

    const q = planSearchQuery.trim().toLowerCase();

    if (planTab === 'roles') {
      const rawRoles = Array.isArray(cfg.roles) ? cfg.roles : [];
      const allRolesWithEveryone = [
        { id: String(guildId), name: 'everyone', color: '#99aab5', isEveryone: true },
        ...rawRoles
      ];
      const roles = q
        ? allRolesWithEveryone.filter(r => r.name.toLowerCase().includes(q) || String(r.id).includes(q))
        : allRolesWithEveryone;

      return `
        <div class="h-full overflow-y-auto overscroll-contain p-2.5 space-y-1.5 bg-neutral-900 scrollbar-thin" data-lenis-prevent="true">
          ${pendingActions.length > 0 ? renderPendingActionsBanner() : ''}
          <div class="px-2 py-1 flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Rollen (${roles.length})</span>
            <span class="text-[10.5px] text-neutral-500">ID kopieren oder @KI</span>
          </div>
          ${roles.map(r => {
            const color = r.color && r.color !== '#000000' ? r.color : '#99aab5';
            const displayRoleName = r.isEveryone ? '@everyone' : r.name;
            const mentionStr = r.isEveryone ? `@everyone (ID: ${r.id})` : `@${r.name} (ID: ${r.id})`;
            const hasPendingRoleChange = pendingActions.some(a =>
              (a.role_id && String(a.role_id) === String(r.id)) ||
              (a.role_name && a.role_name.replace(/^@/, '').toLowerCase() === r.name.toLowerCase())
            );
            return `
              <div class="group flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/[0.015] hover:bg-neutral-800/70 border border-white/[0.04] hover:border-white/[0.09] transition-all">
                <span class="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-white/10" style="background-color: ${escapeHtml(color)};"></span>
                <div class="min-w-0 flex-1 cursor-pointer" data-insert-mention="${escapeHtml(mentionStr)}" title="Klicken, um ${escapeHtml(mentionStr)} in den KI-Chat einzufügen">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[13.5px] font-medium text-neutral-200 group-hover:text-white truncate">${escapeHtml(displayRoleName)}</span>
                    ${hasPendingRoleChange ? `<span class="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Geplant</span>` : ''}
                  </div>
                  <span class="block text-[10.5px] font-mono text-neutral-500 truncate">ID: ${escapeHtml(r.id)}</span>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <button type="button" data-copy-id="${escapeHtml(r.id)}" data-copy-label="@${escapeHtml(r.name)}" class="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300 hover:text-white border border-neutral-700/80 transition-colors cursor-pointer" title="Rollen-ID kopieren (${escapeHtml(r.id)})">
                    ID kopieren
                  </button>
                  <button type="button" data-insert-mention="${escapeHtml(mentionStr)}" class="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white hover:text-black text-[11px] font-medium text-neutral-200 transition-colors cursor-pointer" title="Rolle in den KI-Chat einfügen">
                    @KI
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // Default: 'channels' tree with direct ID copy and @KI buttons
    const textChannels = Array.isArray(cfg.channels) ? cfg.channels : [];
    const voiceChannels = Array.isArray(cfg.voice_channels) ? cfg.voice_channels : [];
    const categories = Array.isArray(cfg.categories) ? cfg.categories : [];

    const allChannels = [
      ...textChannels.map(c => ({ ...c, isVoice: false })),
      ...voiceChannels.map(c => ({ ...c, isVoice: true }))
    ];

    const filteredChannels = q
      ? allChannels.filter(c => c.name.toLowerCase().includes(q) || String(c.id).includes(q))
      : allChannels;

    const hasGlobalPermChange = pendingActions.some(a => a.type === 'channel_permissions' && (a.target_scope === 'all' || !a.target_scope));

    function isChannelAffected(ch) {
      if (hasGlobalPermChange) return true;
      return pendingActions.some(a => {
        if (a.type === 'channel_permissions') {
          const cids = (a.channel_ids || []).map(String);
          const cnames = (a.channel_names || []).map(n => String(n).replace(/^#/, '').toLowerCase());
          const catIds = (a.category_ids || []).map(String);
          if (cids.includes(String(ch.id)) || cnames.includes(ch.name.toLowerCase())) return true;
          if (ch.category_id && catIds.includes(String(ch.category_id))) return true;
        }
        if (a.settings && String(a.settings.channel_id) === String(ch.id)) return true;
        return false;
      });
    }

    function renderChannelRow(ch) {
      const affected = isChannelAffected(ch);
      const mentionStr = `${ch.isVoice ? '🔊 ' : '#'}${ch.name} (ID: ${ch.id})`;
      const iconSvg = ch.isVoice
        ? `<span class="flex-shrink-0 text-neutral-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2 w-4 h-4 flex-shrink-0"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
          </span>`
        : `<span class="flex-shrink-0 text-neutral-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-4 h-4 flex-shrink-0"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
          </span>`;

      return `
        <div class="mx-2 my-0.5">
          <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl select-none group min-h-[38px] text-neutral-300 hover:text-white hover:bg-neutral-800/70 border border-transparent hover:border-white/[0.07] transition-all ${affected ? 'bg-amber-500/[0.06] ring-1 ring-amber-500/20' : ''}">
            ${iconSvg}
            <div class="min-w-0 flex-1 cursor-pointer" data-insert-mention="${escapeHtml(mentionStr)}" title="Klicken, um ${escapeHtml(mentionStr)} in den KI-Chat einzufügen">
              <div class="flex items-center gap-1.5">
                <span class="text-[13.5px] font-medium truncate leading-5 ${affected ? 'text-amber-200' : 'text-neutral-200 group-hover:text-white'}">${escapeHtml(ch.name)}</span>
                ${affected ? `<span class="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-amber-500/20 text-amber-300">Geplant</span>` : ''}
              </div>
              <span class="block text-[10px] font-mono text-neutral-500 truncate">ID: ${escapeHtml(ch.id)}</span>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              <button type="button" data-copy-id="${escapeHtml(ch.id)}" data-copy-label="#${escapeHtml(ch.name)}" class="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10.5px] font-mono text-neutral-300 hover:text-white border border-neutral-700/80 transition-colors cursor-pointer" title="Kanal-ID kopieren (${escapeHtml(ch.id)})">
                ID kopieren
              </button>
              <button type="button" data-insert-mention="${escapeHtml(mentionStr)}" class="px-1.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white hover:text-black text-[10.5px] font-medium text-neutral-300 transition-colors cursor-pointer" title="Kanal + ID in den KI-Chat einfügen">
                @KI
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (q) {
      return `
        <div class="h-full overflow-y-auto overscroll-contain bg-neutral-900 py-2 scrollbar-thin" data-lenis-prevent="true">
          ${filteredChannels.length > 0 ? filteredChannels.map(renderChannelRow).join('') : `<p class="text-center text-xs text-neutral-500 py-8">Keine Kanäle für "${escapeHtml(planSearchQuery)}" gefunden</p>`}
        </div>
      `;
    }

    const uncategorized = allChannels.filter(c => !c.category_id);

    return `
      <div id="ai-plan-scroll" class="h-full overflow-y-auto overscroll-contain bg-neutral-900 scrollbar-thin" data-lenis-prevent="true">
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
              <div class="pt-3 first:pt-0">
                <div class="flex items-center justify-between gap-1 px-2 py-1 mx-1 mt-1 mb-0.5 rounded-lg select-none group transition-colors hover:bg-neutral-800/50">
                  <div data-toggle-cat="${escapeHtml(cat.id)}" class="flex items-center gap-1 min-w-0 flex-1 cursor-pointer">
                    <button type="button" class="p-1 text-neutral-400 hover:text-white rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-3.5 h-3.5 transition-transform duration-200 ease-out ${isCollapsed ? '-rotate-90' : ''}"><path d="m6 9 6 6 6-6"></path></svg>
                    </button>
                    <span class="text-[11.5px] font-bold text-neutral-400 uppercase tracking-[0.02em] truncate group-hover:text-white">${escapeHtml(cat.name)}</span>
                    <span class="text-[10px] text-neutral-600 tabular-nums">(${catChannels.length})</span>
                  </div>
                  <button type="button" data-copy-id="${escapeHtml(cat.id)}" data-copy-label="Kategorie ${escapeHtml(cat.name)}" class="opacity-70 group-hover:opacity-100 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all cursor-pointer" title="Kategorie-ID kopieren (${escapeHtml(cat.id)})">
                    ID
                  </button>
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
    `;
  }

  function renderPendingActionsBanner() {
    if (!pendingActions.length) return '';
    return `
      <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2 mb-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[12px] font-semibold text-amber-300 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            ${pendingActions.length} ausstehende Änderung(en)
          </span>
          <button type="button" id="ai-clear-pending-btn" class="text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer">Verwerfen</button>
        </div>
        <div class="space-y-1">
          ${pendingActions.map((act, idx) => `
            <div class="flex items-center justify-between gap-2 text-[12px] bg-neutral-950/60 px-2.5 py-1.5 rounded-lg border border-white/[0.05]">
              <span class="text-neutral-200 truncate font-medium">${escapeHtml(act.title || act.type)}</span>
              <button type="button" data-remove-pending="${idx}" class="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer" title="Entfernen">✕</button>
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
                <img src="${att.dataUrl}" alt="${escapeHtml(att.name)}" class="w-11 h-11 rounded-lg object-cover border border-white/10">
                <div class="min-w-0 max-w-[140px]">
                  <p class="text-[11.5px] font-medium text-white truncate">${escapeHtml(att.name)}</p>
                  <p class="text-[10px] text-emerald-400">KI-Bildanalyse bereit</p>
                </div>
                <button type="button" data-remove-attachment="${idx}" class="p-1 rounded-md text-neutral-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer" title="Entfernen">✕</button>
              </div>
            `;
          }
          return `
            <div class="relative group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-neutral-800/90 border border-white/10">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
              </div>
              <div class="min-w-0 max-w-[160px]">
                <p class="text-[11.5px] font-medium text-white truncate">${escapeHtml(att.name)}</p>
                <p class="text-[10px] text-neutral-400">${att.size || 0} Zeichen · Datei bereit</p>
              </div>
              <button type="button" data-remove-attachment="${idx}" class="p-1 rounded-md text-neutral-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer" title="Entfernen">✕</button>
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
        <textarea id="${inputId}" data-no-autoresize="true" placeholder="Frage etwas, lade über + ein Bild/Datei hoch oder wähle rechts einen Kanal/Rolle…" rows="1" class="w-full px-5 pt-4 pb-2 bg-transparent border-0 text-base sm:text-[15.5px] text-white placeholder-neutral-500 resize-none overflow-hidden focus:outline-none focus:ring-0" style="height: 48px; overflow-y: hidden;">${escapeHtml(draftInputText)}</textarea>
        <div class="flex items-center justify-between gap-2 px-2.5 pb-2.5">
          <div class="relative">
            <button type="button" id="ai-quick-add-btn" class="relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-[color,background-color,transform] active:scale-[0.96] text-neutral-400 hover:text-white hover:bg-white/[0.06] cursor-pointer" title="Bild, Datei hochladen oder Schnellbefehl wählen" aria-label="Bild, Datei hochladen oder Schnellbefehl wählen">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-[18px] h-[18px]"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
            </button>
            <div id="ai-quick-add-menu" data-lenis-prevent="true" class="orbit-dropdown-menu ${quickAddDropdownOpen ? '' : 'hidden'} absolute bottom-11 left-0 w-80 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-1.5 z-[99999] space-y-1">
              <div class="px-2.5 py-1 text-[10.5px] font-semibold text-neutral-500 uppercase tracking-wider">Hochladen & Analysieren</div>
              <button type="button" id="ai-trigger-image-upload" class="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-lg text-[12.5px] text-white hover:bg-white/[0.08] transition-colors cursor-pointer">
                <span class="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </span>
                <div class="min-w-0 flex-1">
                  <span class="block font-medium text-white">Bild / Screenshot hochladen</span>
                  <span class="block text-[11px] text-neutral-400 truncate">KI zieht sich Tipps, Farben & Ideen aus dem Bild</span>
                </div>
              </button>
              <button type="button" id="ai-trigger-file-upload" class="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-lg text-[12.5px] text-white hover:bg-white/[0.08] transition-colors cursor-pointer">
                <span class="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                </span>
                <div class="min-w-0 flex-1">
                  <span class="block font-medium text-white">Datei / Vorlage hochladen</span>
                  <span class="block text-[11px] text-neutral-400 truncate">Text, JSON, Regeln oder Configs einlesen</span>
                </div>
              </button>
              <div class="border-t border-neutral-800 my-1"></div>
              <div class="px-2.5 py-1 text-[10.5px] font-semibold text-neutral-500 uppercase tracking-wider">Schnellbefehle</div>
              <button type="button" data-quick-prompt="Mache in jedem Channel, dass die Rolle @Unverified nicht die Permission hat, den Channel zu sehen." class="w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] text-neutral-200 hover:bg-white/[0.06] transition-colors cursor-pointer">
                🔒 Rolle in allen Kanälen ausblenden
              </button>
              <button type="button" data-quick-prompt="Richte Willkommensnachrichten mit einem schönen Embed für neue Mitglieder ein." class="w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] text-neutral-200 hover:bg-white/[0.06] transition-colors cursor-pointer">
                👋 Willkommensnachricht konfigurieren
              </button>
              <button type="button" data-quick-prompt="Aktiviere den AutoMod Spam-Schutz, Linkfilter und Inhaltsfilter für diesen Server." class="w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] text-neutral-200 hover:bg-white/[0.06] transition-colors cursor-pointer">
                🛡️ AutoMod & Spam-Schutz aktivieren
              </button>
              <button type="button" data-quick-prompt="Konfiguriere das Ticket-System für Support-Anfragen auf diesem Server." class="w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] text-neutral-200 hover:bg-white/[0.06] transition-colors cursor-pointer">
                🎫 Ticket-System einrichten
              </button>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="relative">
              <button type="button" id="ai-model-picker-btn" class="inline-flex items-center gap-1 px-2.5 h-9 rounded-lg text-[12.5px] font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer" title="Modell auswählen" aria-label="Modell auswählen">
                <span>${escapeHtml(selectedModelLabel)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-3 h-3 opacity-60 transition-transform duration-150"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              <div id="ai-model-picker-menu" data-lenis-prevent="true" class="orbit-dropdown-menu ${modelDropdownOpen ? '' : 'hidden'} absolute bottom-11 right-0 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-1.5 z-[99999] space-y-0.5">
                ${MODELS.map(m => `
                  <button type="button" data-select-model="${escapeHtml(m.id)}" data-select-model-label="${escapeHtml(m.label)}" class="w-full flex flex-col items-start px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${selectedModel === m.id ? 'bg-white/[0.08] text-white' : 'text-neutral-300 hover:bg-white/[0.04]'}">
                    <span class="text-[12.5px] font-semibold">${escapeHtml(m.label)}</span>
                    <span class="text-[11px] text-neutral-500">${escapeHtml(m.desc)}</span>
                  </button>
                `).join('')}
              </div>
            </div>
            <button type="button" id="${sendBtnId}" ${canSendNow ? '' : 'disabled'} class="relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-[color,background-color,box-shadow,transform] ${canSendNow ? 'bg-white text-black hover:bg-neutral-200 cursor-pointer shadow-sm' : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'}" title="Schicken" aria-label="Schicken">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-4 h-4"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderCenterBodyHtml() {
    const activeChat = getActiveChat();
    const messages = activeChat && Array.isArray(activeChat.messages) ? activeChat.messages : [];

    if (messages.length === 0 && !isSending) {
      return `
        <div class="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain" data-lenis-prevent="true">
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
                <div class="mt-2 text-center text-[11px] text-neutral-500">Tipp: Über <strong>+</strong> kannst du Bilder/Screenshots oder Dateien hochladen – und rechts in der Serverleiste direkt Kanal-/Rollen-IDs kopieren.</div>
              </div>
            </div>
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
                            return `<img src="${att.dataUrl}" alt="${escapeHtml(att.name || 'Bild')}" class="max-h-48 rounded-xl border border-white/10 object-cover">`;
                          }
                          return `
                            <div class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-900/80 border border-white/10 text-xs text-neutral-200">
                              <span>📄</span>
                              <span class="truncate max-w-[180px]">${escapeHtml(att.name || 'Datei')}</span>
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
                        const isApplied = appliedActionIds.has(act.id);
                        return `
                          <div class="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.03] border ${isApplied ? 'border-emerald-500/30' : 'border-white/[0.08]'}">
                            <div class="flex items-center gap-3 min-w-0">
                              <div class="w-8 h-8 rounded-lg ${isApplied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-neutral-200'} flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
                              </div>
                              <div class="min-w-0">
                                <p class="text-[13.5px] font-semibold text-white truncate">${escapeHtml(act.title || act.type)}</p>
                                <p class="text-[12px] text-neutral-400 truncate">${escapeHtml(act.description || 'Konfigurations-Änderung bereit')}</p>
                              </div>
                            </div>
                            ${isApplied ? `
                              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold bg-emerald-500/20 text-emerald-300 flex-shrink-0">
                                ✓ Angewendet
                              </span>
                            ` : `
                              <button type="button" data-apply-single="${escapeHtml(act.id)}" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-white text-black hover:bg-neutral-200 transition-colors flex-shrink-0 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket w-3 h-3"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>
                                Bauen
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
                <span class="ml-1">Orbit analysiert deine Anfrage…</span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="flex-shrink-0 p-3 sm:p-4 border-t border-neutral-800/80 bg-neutral-900">
        <div class="max-w-[740px] mx-auto">
          ${renderPromptInputBox('ai-helper-textarea', 'ai-helper-send-btn')}
          <div class="mt-2 text-center text-[11px] text-neutral-500">Sie chatten mit Orbit, einem KI-Assistenten. KI kann Fehler machen – prüfen Sie Änderungen, bevor Sie sie anwenden.</div>
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
        <!-- Mobile Chat History Backdrop & Drawer -->
        <div id="ai-mobile-drawer-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${mobileChatDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}"></div>
        <div class="fixed left-0 top-0 h-full w-[90vw] sm:w-[85vw] max-w-80 z-50 lg:hidden transition-transform duration-300 ease-out border-r border-neutral-800 ${mobileChatDrawerOpen ? 'translate-x-0' : '-translate-x-full'}">
          <div class="flex flex-col h-full bg-neutral-900">
            <div class="px-2 pt-2 pb-1.5 flex-shrink-0">
              <div class="flex items-center gap-1.5">
                <button type="button" data-action="new-chat" class="flex-1 flex items-center gap-2 px-3 h-9 rounded-lg text-[13.5px] font-medium text-neutral-100 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.06] transition-[background-color,transform] duration-150 ease-out active:scale-[0.99]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen w-4 h-4 text-neutral-300"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
                  Neuer Chat
                </button>
                <button type="button" id="ai-close-mobile-drawer" class="grid place-items-center h-9 w-9 rounded-lg hover:bg-white/[0.06] text-neutral-500 transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96]" title="Schließen">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                </button>
              </div>
              <div class="relative mt-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                <input data-chat-search="true" placeholder="Chats durchsuchen…" class="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-8 pr-8 h-9 text-base sm:text-[13px] text-white placeholder:text-neutral-500 focus:outline-none focus:bg-white/[0.05] focus:border-white/[0.1] transition-[background-color,border-color]" type="text" value="${escapeHtml(chatSearchQuery)}">
              </div>
            </div>
            <div class="flex-1 overflow-y-auto overscroll-contain py-1 scrollbar-thin" data-lenis-prevent="true">
              ${renderChatListItems()}
            </div>
          </div>
        </div>

        <!-- Mobile/Tablet Bottom Sheet for Merkmale (< 2xl) -->
        <div id="ai-features-sheet-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 2xl:hidden transition-opacity duration-300 ${featuresPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}"></div>
        <div class="fixed inset-x-0 bottom-0 top-16 z-50 2xl:hidden transition-transform duration-300 ease-out ${featuresPanelOpen ? 'translate-y-0' : 'translate-y-full'}">
          <div data-tour="builder-features-panel" class="h-full overflow-hidden rounded-t-2xl border-t border-white/[0.08] bg-neutral-900 shadow-[0_-16px_40px_-12px_rgba(0,0,0,0.6)]">
            <div class="h-full w-full flex flex-col min-h-0 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div class="flex-shrink-0 flex items-center justify-between px-4 h-12 border-b border-white/[0.05]">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4 text-neutral-300"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                  <span class="text-[13.5px] font-semibold text-neutral-100">Merkmale</span>
                </div>
                <button type="button" data-close-features="true" class="relative grid place-items-center h-8 w-8 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.06] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96]" title="Schließen Sie Funktionen">
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
        <div class="w-full flex-1 flex gap-2 sm:gap-3.5 min-h-0">
          <!-- Column 1: Desktop Chat History Sidebar -->
          <div data-tour="builder-chats" class="scroll-mt-24 hidden lg:flex shrink-0 overflow-hidden transition-[width] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]" style="width: ${leftSidebarCollapsed ? '0px' : '270px'};">
            <div class="w-full flex flex-col flex-shrink-0 overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl">
              <div class="px-2.5 pt-2.5 pb-1.5 flex-shrink-0 border-b border-neutral-800/70">
                <div class="flex items-center justify-between px-1 mb-2">
                  <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Chatverlauf (${chats.length})</span>
                  <button type="button" id="ai-collapse-sidebar-btn" class="grid place-items-center h-7 w-7 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer" title="Seitenleiste einklappen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-left-close w-4 h-4"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m16 15-3-3 3-3"></path></svg>
                  </button>
                </div>
                <button type="button" data-action="new-chat" class="w-full flex items-center justify-center gap-2 px-3 h-9 rounded-lg text-[13px] font-medium text-neutral-100 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-[background-color,transform] duration-150 ease-out active:scale-[0.99] cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen w-4 h-4 text-neutral-300"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
                  Neuer Chat
                </button>
                <div class="relative mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                  <input id="ai-desktop-chat-search" data-chat-search="true" placeholder="Chats durchsuchen…" class="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-8 pr-3 h-8 text-[12.5px] text-white placeholder:text-neutral-500 focus:outline-none focus:bg-white/[0.05] focus:border-white/[0.1] transition-[background-color,border-color]" type="text" value="${escapeHtml(chatSearchQuery)}">
                </div>
              </div>
              <div id="ai-desktop-chat-list" data-lenis-prevent="true" class="flex-1 overflow-y-auto overscroll-contain py-2 scrollbar-thin">
                ${renderChatListItems()}
              </div>
            </div>
          </div>

          <!-- Columns 2 & 3 Container -->
          <div class="flex-1 min-w-0 flex flex-col lg:flex-row gap-0 lg:gap-3.5 min-h-0">
            <!-- Mobile Tab Bar -->
            <div class="flex lg:hidden gap-1.5 p-1.5 bg-neutral-900 border border-neutral-800 border-b-0 rounded-t-2xl flex-shrink-0">
              <button type="button" id="ai-open-mobile-drawer" class="px-3 py-2 text-xs font-medium rounded-lg text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 transition-colors flex items-center gap-1.5" title="Chatverlauf">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Chats (${chats.length})
              </button>
              <button type="button" data-mobile-view="chat" class="relative flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${mobileActiveView === 'chat' ? 'bg-white text-black' : 'text-neutral-400'}">
                Chatten
              </button>
              <button type="button" data-mobile-view="preview" class="relative flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${mobileActiveView === 'preview' ? 'bg-white text-black' : 'text-neutral-400'}">
                Serverleiste & IDs ${hasPending ? `(${pendingActions.length})` : ''}
              </button>
            </div>

            <!-- Column 2: Center Chat Pane -->
            <div class="lg:flex-[11] ${mobileActiveView === 'chat' ? 'flex' : 'hidden lg:flex'} flex-col min-h-0 min-w-0 flex-1">
              <div class="relative h-full flex flex-col min-h-0 bg-neutral-900 border border-white/[0.06] ring-1 ring-white/[0.02] rounded-2xl max-lg:rounded-t-none overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <!-- Top Toolbar -->
                <div class="flex-shrink-0 flex items-center justify-between px-3 sm:px-4 py-2.5 min-h-[50px] border-b border-neutral-800">
                  <div class="flex items-center gap-2 min-w-0">
                    ${leftSidebarCollapsed ? `
                      <button type="button" id="ai-expand-sidebar-btn" class="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer" title="Chatverlauf einblenden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m14 9 3 3-3 3"></path></svg>
                        Verlauf (${chats.length})
                      </button>
                    ` : ''}
                    <span class="text-[13px] font-medium text-neutral-300 truncate">${getActiveChat() ? escapeHtml(getActiveChat().title) : 'Neues Gespräch mit Orbit AI'}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button type="button" id="ai-undo-btn" ${canUndo ? '' : 'disabled'} class="p-2 sm:p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" title="Rückgängig machen (Strg+Z)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path></svg>
                    </button>
                    <button type="button" id="ai-redo-btn" ${canRedo ? '' : 'disabled'} class="p-2 sm:p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer" title="Wiederherstellen (Strg+Y)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="m15 14 5-5-5-5"></path><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"></path></svg>
                    </button>
                    <div class="relative">
                      <button type="button" id="ai-history-btn" class="p-2 sm:p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer" title="Aktionsgeschichte">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path></svg>
                      </button>
                      <div id="ai-history-menu" data-lenis-prevent="true" class="orbit-dropdown-menu ${historyDropdownOpen ? '' : 'hidden'} absolute right-0 mt-2 w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-3 z-[99999]">
                        <p class="text-[12px] font-semibold text-white mb-2">Aktionsgeschichte</p>
                        ${actionHistory.length === 0 ? `
                          <p class="text-[12px] text-neutral-500 py-3 text-center">Noch keine Aktionen angewendet</p>
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
                    <button type="button" data-action="new-chat" class="p-2 sm:p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer" title="Neuer Chat">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                    </button>
                  </div>
                </div>

                <!-- Main Chat Content -->
                <div class="relative flex-1 flex flex-col min-h-0 overflow-hidden">
                  ${renderCenterBodyHtml()}
                </div>
              </div>
            </div>

            <!-- Column 3: Right Server Plan / Channel & Role ID Inspector Pane -->
            <div data-tour="builder-plan" class="scroll-mt-24 min-h-0 min-w-0 lg:w-[350px] xl:w-[380px] shrink-0 ${mobileActiveView === 'preview' ? 'flex flex-1' : 'hidden lg:flex'}">
              <div class="relative w-full flex flex-col h-full bg-neutral-900 border border-neutral-800 ring-1 ring-white/[0.02] rounded-2xl max-lg:rounded-t-none overflow-hidden shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
                <!-- Plan Header -->
                <div class="flex-shrink-0 flex flex-col gap-y-2 px-3.5 py-3 border-b border-neutral-800/80">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" class="w-4 h-4 text-neutral-400 shrink-0"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                      <span class="text-[14px] font-semibold text-white truncate">Server & IDs</span>
                      <span class="text-[11.5px] text-neutral-500 tabular-nums truncate">
                        ${totalChannels} Kanäle · ${totalRoles} Rollen
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                      <button type="button" data-copy-id="${escapeHtml(guildId)}" data-copy-label="Server" class="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10.5px] font-mono text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer" title="Server-ID kopieren (${escapeHtml(guildId)})">
                        Server-ID
                      </button>
                      <button type="button" id="ai-refresh-plan-btn" class="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] transition-colors cursor-pointer" title="Live-Serverstatus aktualisieren">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
                      </button>
                      <button type="button" id="ai-apply-all-btn" ${hasPending && !isApplying ? '' : 'disabled'} class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all ${
                        hasPending && !isApplying
                          ? 'bg-white text-black hover:bg-neutral-200 active:scale-[0.97] cursor-pointer shadow-sm'
                          : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                      }" title="${hasPending ? 'Ausstehende Änderungen jetzt anwenden' : 'Keine ausstehenden Änderungen'}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-3 h-3"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>
                        ${isApplying ? 'Baut…' : (hasPending ? `Bauen (${pendingActions.length})` : 'Bauen')}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Plan Sub-Tabs (Kanäle | Rollen | Merkmale) + Filter -->
                <div class="flex-shrink-0 px-2.5 pt-2.5 pb-2 border-b border-neutral-800/80 space-y-2">
                  <div class="relative flex items-center gap-1 min-w-0">
                    <button type="button" data-plan-tab="channels" class="relative flex-1 px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer ${planTab === 'channels' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'}">
                      <span class="inline-flex items-center justify-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                        Kanäle
                      </span>
                    </button>
                    <button type="button" data-plan-tab="roles" class="relative flex-1 px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer ${planTab === 'roles' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'}">
                      <span class="inline-flex items-center justify-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                        Rollen
                      </span>
                    </button>
                    <button type="button" data-plan-tab="features" class="relative flex-1 px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer ${planTab === 'features' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'}">
                      <span class="inline-flex items-center justify-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
                        Merkmale
                      </span>
                    </button>
                  </div>
                  ${planTab !== 'features' ? `
                    <div class="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class=" absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      <input id="ai-plan-search-input" type="text" value="${escapeHtml(planSearchQuery)}" placeholder="${planTab === 'roles' ? 'Rolle oder ID suchen…' : 'Kanal oder ID suchen…'}" class="w-full h-8 pl-8 pr-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/[0.15]">
                    </div>
                  ` : ''}
                </div>

                <!-- Plan Body -->
                <div class="flex-1 overflow-hidden relative bg-neutral-900">
                  ${renderPlanContentHtml()}
                </div>

                <!-- Plan Footer -->
                <div class="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-neutral-800/80 text-[11px]">
                  ${hasPending ? `
                    <span class="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      ${pendingActions.length} Änderung(en) bereit – Klicken Sie auf „Bauen“
                    </span>
                  ` : `
                    <span class="inline-flex items-center gap-1.5 text-neutral-400">
                      <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      Klicke auf <strong class="text-white">ID kopieren</strong> oder <strong class="text-white">@KI</strong>
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

    const finalMessage = clean || 'Analysiere die hochgeladenen Inhalte und gib mir Tipps oder passende Einstellungen für diesen Server.';
    isSending = true;
    draftInputText = '';
    pendingAttachments = [];
    quickAddDropdownOpen = false;
    modelDropdownOpen = false;

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
          content: `Fehler bei der Anfrage: ${err.message || 'Unbekannter Fehler'}`,
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
          if (a.id) appliedActionIds.add(a.id);
        }
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
            window.Toast.success(`${(res.applied || actionsToApply).length} Änderung(en) erfolgreich angewendet!`);
          }
        }
      }
    } catch (err) {
      if (window.Toast) {
        window.Toast.error(err.message || 'Fehler beim Anwenden der Änderungen');
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
          sendBtn.className = 'relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-[color,background-color,box-shadow,transform] bg-white text-black hover:bg-neutral-200 cursor-pointer shadow-sm';
        } else {
          sendBtn.className = 'relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-[color,background-color,box-shadow,transform] bg-neutral-800 text-neutral-600 cursor-not-allowed';
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

      // Clipboard paste support for images
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

    // Drag and drop files/images onto prompt box
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

    // Upload triggers in (+) menu
    const imgUploadBtn = document.getElementById('ai-trigger-image-upload');
    const fileUploadBtn = document.getElementById('ai-trigger-file-upload');
    const imgInput = document.getElementById('ai-upload-image-input');
    const fileInput = document.getElementById('ai-upload-file-input');

    if (imgUploadBtn && imgInput) {
      imgUploadBtn.onclick = (e) => {
        e.stopPropagation();
        imgInput.click();
      };
      imgInput.onchange = (e) => {
        if (e.target.files?.length) handleFilesSelected(e.target.files);
      };
    }

    if (fileUploadBtn && fileInput) {
      fileUploadBtn.onclick = (e) => {
        e.stopPropagation();
        fileInput.click();
      };
      fileInput.onchange = (e) => {
        if (e.target.files?.length) handleFilesSelected(e.target.files);
      };
    }

    // Remove attachment chip
    container.querySelectorAll('[data-remove-attachment]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-remove-attachment'), 10);
        if (!isNaN(idx)) {
          pendingAttachments.splice(idx, 1);
          render();
        }
      };
    });

    // Copy Channel / Role / Category / Server ID buttons
    container.querySelectorAll('[data-copy-id]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idVal = btn.getAttribute('data-copy-id');
        const lblVal = btn.getAttribute('data-copy-label') || '';
        copyIdToClipboard(idVal, lblVal, btn);
      };
    });

    // Search filter inside right Planen pane
    const planSearchInput = document.getElementById('ai-plan-search-input');
    if (planSearchInput) {
      planSearchInput.oninput = (e) => {
        planSearchQuery = e.target.value || '';
        const pos = planSearchInput.selectionStart;
        render();
        const nextInp = document.getElementById('ai-plan-search-input');
        if (nextInp) {
          nextInp.focus();
          if (typeof pos === 'number') nextInp.setSelectionRange(pos, pos);
        }
      };
    }

    // Sidebar collapse / expand
    const collapseBtn = document.getElementById('ai-collapse-sidebar-btn');
    if (collapseBtn) {
      collapseBtn.onclick = () => {
        leftSidebarCollapsed = true;
        render();
      };
    }
    const expandBtn = document.getElementById('ai-expand-sidebar-btn');
    if (expandBtn) {
      expandBtn.onclick = () => {
        leftSidebarCollapsed = false;
        render();
      };
    }

    // Mobile drawer open/close
    const openMobileDrawer = document.getElementById('ai-open-mobile-drawer');
    if (openMobileDrawer) {
      openMobileDrawer.onclick = () => {
        mobileChatDrawerOpen = true;
        render();
      };
    }
    const closeMobileDrawer = document.getElementById('ai-close-mobile-drawer');
    const mobileBackdrop = document.getElementById('ai-mobile-drawer-backdrop');
    if (closeMobileDrawer) {
      closeMobileDrawer.onclick = () => {
        mobileChatDrawerOpen = false;
        render();
      };
    }
    if (mobileBackdrop) {
      mobileBackdrop.onclick = () => {
        mobileChatDrawerOpen = false;
        render();
      };
    }

    // Mobile view switch (Chatten | Vorschau)
    container.querySelectorAll('[data-mobile-view]').forEach(btn => {
      btn.onclick = () => {
        mobileActiveView = btn.getAttribute('data-mobile-view') || 'chat';
        render();
      };
    });

    // New Chat buttons
    container.querySelectorAll('[data-action="new-chat"]').forEach(btn => {
      btn.onclick = () => {
        activeChatId = null;
        pendingActions = [];
        mobileChatDrawerOpen = false;
        saveLocalChats(chats, null);
        render();
      };
    });

    // Select Chat from history
    container.querySelectorAll('[data-select-chat]').forEach(el => {
      el.onclick = (e) => {
        if (e.target.closest('[data-delete-chat]')) return;
        activeChatId = el.getAttribute('data-select-chat');
        mobileChatDrawerOpen = false;
        saveLocalChats(chats, activeChatId);

        const c = getActiveChat();
        pendingActions = [];
        if (c && Array.isArray(c.messages)) {
          for (const m of c.messages) {
            if (Array.isArray(m.actions)) {
              for (const act of m.actions) {
                if (act.id && !appliedActionIds.has(act.id)) {
                  pendingActions.push(act);
                }
              }
            }
          }
        }
        render();
      };
    });

    // Delete Chat from history
    container.querySelectorAll('[data-delete-chat]').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const cid = btn.getAttribute('data-delete-chat');
        if (!cid) return;
        chats = chats.filter(c => c.id !== cid);
        if (activeChatId === cid) {
          activeChatId = chats[0]?.id || null;
          pendingActions = [];
        }
        saveLocalChats(chats, activeChatId);
        render();
        try {
          await API.deleteAIHelperChat(guildId, cid);
        } catch (_) {}
      };
    });

    // Search Chats
    container.querySelectorAll('[data-chat-search]').forEach(inp => {
      inp.oninput = (e) => {
        chatSearchQuery = e.target.value || '';
        const listEl = document.getElementById('ai-desktop-chat-list');
        if (listEl) listEl.innerHTML = renderChatListItems();
      };
    });

    // Plan sub-tabs (Kanäle | Rollen | Merkmale)
    container.querySelectorAll('[data-plan-tab]').forEach(btn => {
      btn.onclick = () => {
        planTab = btn.getAttribute('data-plan-tab') || 'channels';
        render();
      };
    });

    // Close Features panel
    container.querySelectorAll('[data-close-features]').forEach(btn => {
      btn.onclick = () => {
        featuresPanelOpen = false;
        if (planTab === 'features') planTab = 'channels';
        render();
      };
    });

    // Feature prompt buttons inside Merkmale
    container.querySelectorAll('[data-feature-prompt]').forEach(btn => {
      btn.onclick = () => {
        const promptText = btn.getAttribute('data-feature-prompt');
        if (promptText) {
          mobileActiveView = 'chat';
          sendMessage(promptText);
        }
      };
    });

    // Category collapse toggle in Kanäle tree
    container.querySelectorAll('[data-toggle-cat]').forEach(el => {
      el.onclick = () => {
        const cid = String(el.getAttribute('data-toggle-cat'));
        if (collapsedCategories.has(cid)) collapsedCategories.delete(cid);
        else collapsedCategories.add(cid);
        render();
      };
    });

    // Click channel or role (@KI) in Planen pane to insert mention + ID into prompt
    container.querySelectorAll('[data-insert-mention]').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        const mention = el.getAttribute('data-insert-mention');
        const ta = document.getElementById('ai-helper-textarea');
        if (ta && mention) {
          const prefix = ta.value && !ta.value.endsWith(' ') ? ' ' : '';
          ta.value = ta.value + prefix + mention + ' ';
          draftInputText = ta.value;
          ta.dispatchEvent(new Event('input'));
          ta.focus();
          if (window.Toast) {
            window.Toast.info(`${mention} in den Chat eingefügt`);
          }
        }
      };
    });

    // Model selector dropdown
    const modelBtn = document.getElementById('ai-model-picker-btn');
    if (modelBtn) {
      modelBtn.onclick = (e) => {
        e.stopPropagation();
        modelDropdownOpen = !modelDropdownOpen;
        quickAddDropdownOpen = false;
        historyDropdownOpen = false;
        render();
      };
    }
    container.querySelectorAll('[data-select-model]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        selectedModel = btn.getAttribute('data-select-model') || 'openai/gpt-oss-120b';
        selectedModelLabel = btn.getAttribute('data-select-model-label') || 'Onyx V1';
        modelDropdownOpen = false;
        render();
      };
    });

    // Quick add (+) button
    const quickAddBtn = document.getElementById('ai-quick-add-btn');
    if (quickAddBtn) {
      quickAddBtn.onclick = (e) => {
        e.stopPropagation();
        quickAddDropdownOpen = !quickAddDropdownOpen;
        modelDropdownOpen = false;
        historyDropdownOpen = false;
        render();
      };
    }
    container.querySelectorAll('[data-quick-prompt]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const p = btn.getAttribute('data-quick-prompt');
        quickAddDropdownOpen = false;
        if (p) sendMessage(p);
      };
    });

    // History popover
    const histBtn = document.getElementById('ai-history-btn');
    if (histBtn) {
      histBtn.onclick = (e) => {
        e.stopPropagation();
        historyDropdownOpen = !historyDropdownOpen;
        modelDropdownOpen = false;
        quickAddDropdownOpen = false;
        render();
      };
    }

    // Apply All (Bauen) button
    const applyAllBtn = document.getElementById('ai-apply-all-btn');
    if (applyAllBtn) {
      applyAllBtn.onclick = () => {
        if (pendingActions.length > 0) {
          applyActions([...pendingActions]);
        }
      };
    }

    // Apply single action from chat card
    container.querySelectorAll('[data-apply-single]').forEach(btn => {
      btn.onclick = () => {
        const actId = btn.getAttribute('data-apply-single');
        const activeChat = getActiveChat();
        let targetAct = pendingActions.find(a => a.id === actId);
        if (!targetAct && activeChat && Array.isArray(activeChat.messages)) {
          for (const m of activeChat.messages) {
            if (Array.isArray(m.actions)) {
              const found = m.actions.find(a => a.id === actId);
              if (found) {
                targetAct = found;
                break;
              }
            }
          }
        }
        if (targetAct) {
          applyActions([targetAct]);
        }
      };
    });

    // Clear / remove pending actions
    const clearPendingBtn = document.getElementById('ai-clear-pending-btn');
    if (clearPendingBtn) {
      clearPendingBtn.onclick = () => {
        pendingActions = [];
        render();
      };
    }
    container.querySelectorAll('[data-remove-pending]').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-remove-pending'), 10);
        if (!isNaN(idx)) {
          pendingActions.splice(idx, 1);
          render();
        }
      };
    });

    // Refresh live server state button
    const refreshBtn = document.getElementById('ai-refresh-plan-btn');
    if (refreshBtn) {
      refreshBtn.onclick = async () => {
        pendingActions = [];
        try {
          cfg = await API.getConfig(guildId);
          if (window.Toast) window.Toast.success('Live-Serverstatus aktualisiert');
        } catch (_) {}
        render();
      };
    }

    // Undo / Redo buttons
    const undoBtn = document.getElementById('ai-undo-btn');
    if (undoBtn) {
      undoBtn.onclick = async () => {
        if (!canUndo) return;
        try {
          const res = await API.undoAIHelperAction(guildId);
          canUndo = Boolean(res.can_undo);
          canRedo = Boolean(res.can_redo);
          cfg = await API.getConfig(guildId);
          if (window.Toast) window.Toast.success('Änderung rückgängig gemacht');
          render();
        } catch (err) {
          if (window.Toast) window.Toast.error(err.message || 'Fehler beim Rückgängigmachen');
        }
      };
    }

    const redoBtn = document.getElementById('ai-redo-btn');
    if (redoBtn) {
      redoBtn.onclick = async () => {
        if (!canRedo) return;
        try {
          const res = await API.redoAIHelperAction(guildId);
          canUndo = Boolean(res.can_undo);
          canRedo = Boolean(res.can_redo);
          cfg = await API.getConfig(guildId);
          if (window.Toast) window.Toast.success('Änderung wiederhergestellt');
          render();
        } catch (err) {
          if (window.Toast) window.Toast.error(err.message || 'Fehler beim Wiederherstellen');
        }
      };
    }

    if (window.OrbitDropdownManager) {
      window.OrbitDropdownManager.sync();
    }
  }

  // Close AI Helper popovers when clicking outside
  document.addEventListener('click', (e) => {
    if (quickAddDropdownOpen || modelDropdownOpen || historyDropdownOpen) {
      if (!e.target.closest('#ai-quick-add-btn, #ai-quick-add-menu, #ai-model-picker-btn, #ai-model-picker-menu, #ai-history-btn, #ai-history-menu')) {
        quickAddDropdownOpen = false;
        modelDropdownOpen = false;
        historyDropdownOpen = false;
        render();
      }
    }
  });

  render();
};

window.renderBuilderModule = function(el, guildId) {
  return DashboardTabs.Builder(el, guildId);
};
