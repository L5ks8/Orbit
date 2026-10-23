/**
 * Orbit Dashboard - Overview Tab
 * Fully functional overview connected to MongoDB:
 * - 5 live stat cards with week-over-week comparison badges
 * - Live Messages chart with interactive 48h / 60m toggle & bar hover tooltip
 * - Top Message Channels with interactive 1D / 1W / 1M / 1Y / All time filters
 * - Activity area chart with 1D / 1W / 1M / 1Y / All filters & interactive hover dashed line, point dot, and tooltip
 * - Real Features status from MongoDB guild configuration
 * - Real Recent Mod Activity feed from MongoDB (ModLogs, Cases, Warns, Bans)
 */

DashboardTabs.Overview = async function(container, guildId, currentGuildInfo = null) {
  if (DashboardTabs._overviewPollTimer) {
    clearInterval(DashboardTabs._overviewPollTimer);
    DashboardTabs._overviewPollTimer = null;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatNumber(n) {
    const num = Number(n) || 0;
    return num.toLocaleString('en-US');
  }

  function formatRelativeTime(ts) {
    if (!ts) return '';
    const nowSec = Date.now() / 1000;
    const sec = ts > 1e11 ? ts / 1000 : Number(ts);
    const diff = Math.max(0, Math.floor(nowSec - sec));
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    const d = new Date(sec * 1000);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatChartDateLabel(dateStr) {
    if (!dateStr) return '';
    // If already HH:MM format (for 1D hourly view)
    if (/^\d{2}:\d{2}$/.test(dateStr) || /^\d{2}\/\d{2}\s+\d{2}h$/.test(dateStr)) {
      return dateStr;
    }
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dt = new Date(Date.UTC(y, m, d));
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      }
    }
    return dateStr;
  }

  function renderPctBadge(pct) {
    const val = Number(pct) || 0;
    if (val < 0) {
      return `
        <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums bg-red-500/10 text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-right w-3 h-3"><path d="m7 7 10 10"></path><path d="M17 7v10H7"></path></svg>${val}%
        </span>
      `;
    }
    return `
      <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums bg-green-500/10 text-green-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right w-3 h-3"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>+${val}%
      </span>
    `;
  }

  function buildMonotoneSvgPath(points) {
    if (!points || points.length === 0) return { line: '', area: '' };
    if (points.length === 1) {
      const p = points[0];
      return {
        line: `M${p.x},${p.y}`,
        area: `M${p.x},148 L${p.x},${p.y} L${p.x},148 Z`
      };
    }

    const n = points.length;
    const dx = [];
    const dy = [];
    const m = [];
    for (let i = 0; i < n - 1; i++) {
      dx[i] = points[i + 1].x - points[i].x;
      dy[i] = points[i + 1].y - points[i].y;
      m[i] = dx[i] !== 0 ? dy[i] / dx[i] : 0;
    }

    const tangents = new Array(n).fill(0);
    tangents[0] = m[0];
    tangents[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) {
      if (m[i - 1] * m[i] <= 0) {
        tangents[i] = 0;
      } else {
        tangents[i] = (m[i - 1] + m[i]) / 2;
      }
    }

    for (let i = 0; i < n - 1; i++) {
      if (dy[i] === 0) {
        tangents[i] = 0;
        tangents[i + 1] = 0;
      } else {
        const alpha = tangents[i] / m[i];
        const beta = tangents[i + 1] / m[i];
        const s = alpha * alpha + beta * beta;
        if (s > 9) {
          const tau = 3 / Math.sqrt(s);
          tangents[i] = tau * alpha * m[i];
          tangents[i + 1] = tau * beta * m[i];
        }
      }
    }

    let d = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
    for (let i = 0; i < n - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const seg = (p1.x - p0.x) / 3;
      const cp1x = p0.x + seg;
      const cp1y = Math.min(148, Math.max(20, p0.y + tangents[i] * seg));
      const cp2x = p1.x - seg;
      const cp2y = Math.min(148, Math.max(20, p1.y - tangents[i + 1] * seg));
      d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`;
    }

    const first = points[0];
    const last = points[n - 1];
    const area = `${d} L${last.x.toFixed(2)},148 L${first.x.toFixed(2)},148 Z`;
    return { line: d, area };
  }

  container.innerHTML = `
    <div id="overview-container" class="space-y-6 pb-10">
      <div id="overview-loading" class="flex items-center justify-center p-12 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading overview...
      </div>
      <div id="overview-content" class="hidden space-y-6"></div>
    </div>
  `;

  // State for interactive filters
  const state = {
    liveMode: '48h',        // '48h' | '60m'
    channelRange: '7',      // '1' | '7' | '30' | '365' | 'all'
    activityRange: '7',     // '1' | '7' | '30' | '365' | 'all'
    live48h: [],
    total48h: 0,
    live60m: [],
    total60m: 0,
    topChannels: [],
    history: [],
    periodMessages: 0,
    changes: {},
    syncedAt: Date.now()
  };

  const RANGE_LABELS = {
    '1': 'Last 24 hours',
    '7': 'Last 7 days',
    '30': 'Last 30 days',
    '365': 'Last 365 days',
    'all': 'All time'
  };

  try {
    const [configData, statsData, liveData, modActivity, guildsData] = await Promise.all([
      API.getConfig(guildId).catch(() => ({})),
      API.getGuildStats(guildId, 7, 7).catch(() => ({})),
      API.getGuildStatsLive(guildId).catch(() => ({})),
      API.getModActivity(guildId).catch(() => ([])),
      API.getGuilds().catch(() => ([]))
    ]);

    const guilds = Array.isArray(guildsData) ? guildsData : (guildsData?.guilds || []);
    const guild = currentGuildInfo || guilds.find(g => String(g.id) === String(guildId)) || {
      id: guildId,
      name: 'Server',
      icon: null
    };

    let iconUrl = '/img/logo.png';
    if (guild.icon) {
      const ext = guild.icon.startsWith('a_') ? 'gif' : 'png';
      iconUrl = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=128`;
    }

    const memberCount = statsData?.total_members ?? statsData?.member_count ?? 0;
    const messageCount = statsData?.week_messages ?? statsData?.message_count ?? statsData?.today_messages ?? 0;
    const activeUsers = statsData?.week_active_users ?? statsData?.active_users ?? statsData?.today_active_users ?? 0;
    const voiceHours = statsData?.voice_hours ?? (statsData?.today_voice_minutes ? Math.round((statsData.today_voice_minutes / 60) * 10) / 10 : 0);
    const openTickets = statsData?.open_tickets ?? 0;

    state.changes = statsData?.changes || {};
    state.live48h = statsData?.live_48h || liveData?.live_48h || [];
    state.total48h = statsData?.total_48h ?? liveData?.total_48h ?? messageCount;
    state.live60m = liveData?.live_60m || [];
    state.total60m = liveData?.total_60m ?? 0;
    state.topChannels = statsData?.top_channels || [];
    state.history = statsData?.history || [];
    state.periodMessages = statsData?.period_messages ?? messageCount;
    state.syncedAt = Date.now();

    // Evaluate real Features status from MongoDB config
    const cfg = configData?.config || configData || {};
    const am = cfg.automod || {};
    const sec = cfg.security || {};
    const isAutomodActive = Boolean(
      am.enabled ||
      am.banned_words?.enabled ||
      am.anti_spam?.enabled ||
      am.anti_invites?.enabled ||
      am.anti_link?.enabled ||
      am.anti_caps?.enabled ||
      am.mention_spam?.enabled ||
      am.anti_scam?.enabled ||
      am.anti_alt?.enabled ||
      am.anti_bot?.enabled ||
      am.ai_automod?.enabled ||
      am.ai_image?.enabled ||
      am.anti_zalgo?.enabled ||
      sec.anti_nuke?.enabled ||
      sec.anti_raid?.enabled ||
      sec.webhook_protection?.enabled
    );

    const isWelcomeRolesActive = Boolean(
      cfg.welcome?.enabled ||
      cfg.welcome?.dm_enabled ||
      cfg.goodbye?.enabled ||
      cfg.goodbye?.dm_enabled ||
      cfg.joinroles?.enabled ||
      cfg.joinroles?.user_roles_enabled ||
      cfg.joinroles?.bot_roles_enabled ||
      cfg.joinroles?.tag_roles_enabled ||
      cfg.joinroles?.sticky_roles?.enabled ||
      cfg.joinroles?.booster_role?.enabled
    );

    const isLevelActive = Boolean(cfg.level?.enabled);
    const isTicketsActive = Boolean(cfg.ticket?.enabled || openTickets > 0);
    const isInvitesActive = Boolean(cfg.invites?.enabled);
    const isVerifyActive = Boolean(cfg.verify?.enabled);
    const isAutoResponderActive = Boolean(
      cfg.autoresponder_enabled ||
      cfg.settings?.autoresponder_enabled ||
      (Array.isArray(cfg.autoresponder) && cfg.autoresponder.length > 0) ||
      (cfg.autoresponder && typeof cfg.autoresponder === 'object' && Object.keys(cfg.autoresponder).length > 0)
    );
    const isTempVoiceActive = Boolean(
      cfg.tempvoice?.enabled ||
      (Array.isArray(cfg.tempvoice?.hubs) && cfg.tempvoice.hubs.length > 0)
    );

    const featuresList = [
      { name: 'Auto-Moderation', active: isAutomodActive, tab: 'automod' },
      { name: 'Welcome & Roles', active: isWelcomeRolesActive, tab: 'welcome' },
      { name: 'Leveling & XP', active: isLevelActive, tab: 'level' },
      { name: 'Support Tickets', active: isTicketsActive, tab: 'tickets' },
      { name: 'Invite Tracker', active: isInvitesActive, tab: 'invites' },
      { name: 'Verification', active: isVerifyActive, tab: 'verify' },
      { name: 'Auto-Responder', active: isAutoResponderActive, tab: 'messages' },
      { name: 'Temp Voice', active: isTempVoiceActive, tab: 'tempvoice' }
    ];
    const activeFeaturesCount = featuresList.filter(f => f.active).length;

    const modLogs = Array.isArray(modActivity) ? modActivity : [];
    const hasAnyData = messageCount > 0 || activeUsers > 0 || voiceHours > 0 || modLogs.length > 0 || state.topChannels.length > 0;

    const content = document.getElementById('overview-content');
    const loading = document.getElementById('overview-loading');
    if (!content) return;

    content.innerHTML = `
      ${!hasAnyData ? `
      <!-- Banner 1: Setup in progress (shown only when no stats tracked yet) -->
      <div class="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-4 h-4 text-blue-400 animate-spin flex-shrink-0"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
        <div>
          <p class="text-sm font-medium text-white">Setting up...</p>
          <p class="text-xs text-neutral-400">Statistics will appear shortly after the bot starts tracking.</p>
        </div>
      </div>
      ` : ''}

      <!-- Banner 2: AI Builder Card -->
      <div class="relative overflow-hidden rounded-xl border border-green-500/10 bg-gradient-to-br from-green-950/40 via-neutral-900 to-neutral-900 px-5 py-5 sm:px-6">
        <div class="absolute -top-8 -right-8 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="pointer-events-none absolute inset-0 opacity-[0.06]" style="background-image: radial-gradient(circle, rgb(255, 255, 255) 1px, transparent 1px); background-size: 14px 14px; mask-image: linear-gradient(to left bottom, black 0%, rgba(0, 0, 0, 0.4) 40%, transparent 80%);"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div class="flex-1 min-w-0 space-y-2">
            <span class="text-[10px] font-semibold text-green-400 uppercase tracking-widest block leading-none">AI Builder</span>
            <h2 class="text-base font-bold text-white leading-tight text-balance">Set up your server in seconds</h2>
            <div class="flex flex-wrap gap-1">
              <span class="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-2.5 h-2.5"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>Channels</span>
              <span class="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-2.5 h-2.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>Permissions</span>
              <span class="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-2.5 h-2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>Roles</span>
              <span class="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-2.5 h-2.5"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>Bot Config</span>
            </div>
          </div>
          <a class="inline-flex items-center justify-center gap-2 pl-5 pr-[18px] py-2.5 bg-white hover:bg-neutral-200 text-black text-sm font-semibold rounded-lg transition-transform duration-150 ease-out active:scale-[0.96] whitespace-nowrap shrink-0 self-stretch sm:self-center" href="/dashboard/${guildId}/builder">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg> Try AI Builder
          </a>
        </div>
      </div>

      <!-- Banner 3: Server Info Card -->
      <div class="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] p-4 sm:p-6">
        <div class="pointer-events-none absolute -bottom-20 -right-10 w-[700px] h-80 opacity-25" style="background: radial-gradient(at right center, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.06) 30%, rgba(34, 197, 94, 0.02) 60%, transparent 90%);"></div>
        <div class="relative flex items-center justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <div class="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-neutral-800 bg-neutral-800 flex items-center justify-center">
              <img alt="${escapeHtml(guild.name)}" class="w-full h-full object-cover" src="${iconUrl}" onerror="this.src='/img/logo.png'">
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2.5">
                <h1 class="text-xl font-semibold text-white truncate">${escapeHtml(guild.name)}</h1>
              </div>
              <p class="text-xs text-neutral-500 mt-0.5 truncate tabular-nums">Online &amp; Active · ${formatNumber(memberCount)} members</p>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <div class="flex items-center gap-1.5 text-xs"><div class="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"></div></div>
            <div class="flex items-center gap-1.5 text-xs text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span id="overview-sync-label" class="hidden sm:inline">Synced just now</span>
              <button id="overview-refresh-btn" type="button" class="p-1 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-white cursor-pointer" aria-label="Refresh">
                <svg id="overview-refresh-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-3.5 h-3.5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 5 Stat Cards: Members, Messages, Active users, Voice hours, Open tickets -->
      <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-px bg-neutral-800">
          
          <!-- Members -->
          <div class="bg-neutral-900 px-5 py-5 group hover:bg-neutral-800/30 transition-colors">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-3.5 h-3.5 text-blue-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <span class="text-xs font-medium text-neutral-400">Members</span>
            </div>
            <p id="stat-card-members" class="text-[28px] font-bold tabular-nums leading-none text-white">${formatNumber(memberCount)}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              ${renderPctBadge(state.changes.members_pct)}
              <span class="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>

          <!-- Messages -->
          <div class="bg-neutral-900 px-5 py-5 group hover:bg-neutral-800/30 transition-colors">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square w-3.5 h-3.5 text-green-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <span class="text-xs font-medium text-neutral-400">Messages</span>
            </div>
            <p id="stat-card-messages" class="text-[28px] font-bold tabular-nums leading-none text-white">${formatNumber(messageCount)}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              ${renderPctBadge(state.changes.messages_pct)}
              <span class="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>

          <!-- Active Users -->
          <div class="bg-neutral-900 px-5 py-5 group hover:bg-neutral-800/30 transition-colors">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity w-3.5 h-3.5 text-cyan-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <span class="text-xs font-medium text-neutral-400">Active users</span>
            </div>
            <p id="stat-card-active-users" class="text-[28px] font-bold tabular-nums leading-none text-white">${formatNumber(activeUsers)}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              ${renderPctBadge(state.changes.active_users_pct)}
              <span class="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>

          <!-- Voice Hours -->
          <div class="bg-neutral-900 px-5 py-5 group hover:bg-neutral-800/30 transition-colors">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic w-3.5 h-3.5 text-purple-400"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
              </div>
              <span class="text-xs font-medium text-neutral-400">Voice hours</span>
            </div>
            <p id="stat-card-voice-hours" class="text-[28px] font-bold tabular-nums leading-none text-white">${voiceHours}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              ${renderPctBadge(state.changes.voice_pct)}
              <span class="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>

          <!-- Open Tickets -->
          <a href="/dashboard/${guildId}/tickets" class="bg-neutral-900 px-5 py-5 group hover:bg-neutral-800/30 transition-colors max-lg:col-span-2 block">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-md bg-neutral-800 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket w-3.5 h-3.5 text-neutral-400"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
              </div>
              <span class="text-xs font-medium text-neutral-400">Open tickets</span>
            </div>
            <p id="stat-card-tickets" class="text-[28px] font-bold tabular-nums leading-none text-white">${formatNumber(openTickets)}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              ${openTickets > 0
                ? `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400">${openTickets} awaiting reply</span>`
                : `<span class="text-[10px] text-neutral-500">all clear</span>`
              }
            </div>
          </a>

        </div>
      </div>

      <!-- Two-column row: 48h/60m messages chart & Top Message Channels -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <!-- Messages · Last 48 hours / 60 minutes -->
        <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
          <div class="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p id="live-chart-subtitle" class="text-[13px] text-neutral-400 font-medium">Messages · Last 48 hours</p>
              <p id="live-chart-total" class="text-3xl font-bold text-white tabular-nums mt-1">${formatNumber(state.total48h)}</p>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span class="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Live</span>
              </div>
              <div class="relative inline-flex p-0.5 rounded-lg bg-neutral-800 border border-neutral-700" id="live-mode-buttons">
                <button type="button" data-live-mode="48h" class="relative px-2.5 py-1 text-[11px] font-medium rounded-md text-black bg-white select-none cursor-pointer transition-colors">48h</button>
                <button type="button" data-live-mode="60m" class="relative px-2.5 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white select-none cursor-pointer transition-colors">60m</button>
              </div>
            </div>
          </div>
          <div class="px-5 pb-5">
            <div id="live-chart-wrapper" class="relative select-none" style="width: 100%; height: 180px;"></div>
          </div>
        </div>

        <!-- Top Message Channels -->
        <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
          <div class="px-4 pt-4 pb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div class="min-w-0">
              <p class="text-sm text-white font-semibold">Top Message Channels</p>
              <p id="top-channels-subtitle" class="text-[11px] text-neutral-500 mt-0.5">Last 7 days</p>
            </div>
            <div class="relative inline-flex p-0.5 rounded-lg bg-neutral-800 border border-neutral-700 shrink-0" id="top-channels-range-buttons">
              <button type="button" data-ch-range="1" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white cursor-pointer transition-colors">1D</button>
              <button type="button" data-ch-range="7" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-black bg-white cursor-pointer transition-colors">1W</button>
              <button type="button" data-ch-range="30" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white cursor-pointer transition-colors">1M</button>
              <button type="button" data-ch-range="365" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white cursor-pointer transition-colors">1Y</button>
              <button type="button" data-ch-range="all" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white cursor-pointer transition-colors">All</button>
            </div>
          </div>
          <div id="top-channels-body" class="flex-1 px-4 pb-4 pt-1"></div>
        </div>

      </div>

      <!-- Activity Section Chart -->
      <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
        <div class="px-5 pt-4 pb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity w-3.5 h-3.5 text-green-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            <span class="text-sm font-medium text-white">Activity</span>
            <span id="activity-range-subtitle" class="text-[11px] text-neutral-500">last 7 days</span>
          </div>
          <div class="relative inline-flex p-0.5 rounded-lg bg-neutral-800 border border-neutral-700 shrink-0" id="activity-range-buttons">
            <button type="button" data-act-range="1" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white cursor-pointer transition-colors">1D</button>
            <button type="button" data-act-range="7" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-black bg-white cursor-pointer transition-colors">1W</button>
            <button type="button" data-act-range="30" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white cursor-pointer transition-colors">1M</button>
            <button type="button" data-act-range="365" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white cursor-pointer transition-colors">1Y</button>
            <button type="button" data-act-range="all" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white cursor-pointer transition-colors">All</button>
          </div>
        </div>
        <div class="px-5 pb-3 flex items-end justify-between gap-6 flex-wrap">
          <div class="flex items-end gap-3">
            <div class="flex flex-col">
              <span id="activity-total-messages" class="text-4xl font-bold text-white tabular-nums leading-none">${formatNumber(state.periodMessages)}</span>
              <span class="text-[11px] text-neutral-500 mt-1">messages</span>
            </div>
            <div id="activity-pct-wrapper" class="mb-0.5">
              ${renderPctBadge(state.changes.period_messages_pct)}
            </div>
          </div>
        </div>
        <div class="px-5 pb-4">
          <div id="activity-chart-wrapper" class="relative select-none" style="width: 100%; height: 185px;"></div>
        </div>
      </div>

      <!-- Features & Recent mod activity -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
        
        <!-- Features List -->
        <div class="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <div class="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings w-4 h-4 text-neutral-500"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <span class="text-sm font-semibold text-white">Features</span>
            </div>
            <span class="text-[11px] font-medium text-neutral-500 tabular-nums">${activeFeaturesCount}/${featuresList.length} active</span>
          </div>
          <div class="flex flex-col flex-1 divide-y divide-neutral-800/60">
            ${featuresList.map(f => `
              <a href="/dashboard/${guildId}/${f.tab}" class="flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/40 transition-colors group">
                <div class="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-400">
                  <span class="w-2 h-2 rounded-full ${f.active ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-neutral-600'}"></span>
                </div>
                <div class="text-xs font-medium text-neutral-300 group-hover:text-white transition-colors">${escapeHtml(f.name)}</div>
                <div class="ml-auto flex items-center gap-2">
                  <span class="px-2 py-0.5 text-[10px] font-medium rounded ${f.active ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-500'}">${f.active ? 'Active' : 'Inactive'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-600 group-hover:text-neutral-400 transition-colors"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </a>
            `).join('')}
          </div>
        </div>

        <!-- Recent Mod Activity -->
        <div class="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-800 gap-2 flex-wrap">
            <div class="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert w-4 h-4 text-neutral-500"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
              <span class="text-sm font-semibold text-white">Recent mod activity</span>
              <div id="mod-activity-summary-pills" class="flex items-center gap-1.5 flex-wrap"></div>
            </div>
            <a class="relative -my-2 py-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors inline-flex items-center gap-1 group" href="/dashboard/${guildId}/automod">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3 h-3 group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
          </div>
          <div id="mod-activity-body" class="flex-1 flex flex-col"></div>
        </div>

      </div>
    `;

    // ─── Render Functions for Dynamic Sections ──────────────────────────────────

    function renderLiveChart() {
      const wrapper = document.getElementById('live-chart-wrapper');
      const subtitleEl = document.getElementById('live-chart-subtitle');
      const totalEl = document.getElementById('live-chart-total');
      if (!wrapper) return;

      const is48h = state.liveMode === '48h';
      const rawData = is48h ? state.live48h : state.live60m;
      const totalVal = is48h ? state.total48h : state.total60m;

      if (subtitleEl) subtitleEl.textContent = is48h ? 'Messages · Last 48 hours' : 'Messages · Last 60 minutes';
      if (totalEl) totalEl.textContent = formatNumber(totalVal);

      const count = is48h ? 48 : 60;
      const buckets = [];
      for (let i = 0; i < count; i++) {
        const item = rawData[i] || {};
        buckets.push({
          label: item.label || item.name || (is48h ? `${i}h` : `${i}m`),
          messages: Number(item.messages) || 0
        });
      }

      const maxVal = Math.max(1, ...buckets.map(b => b.messages));
      const W = 440;
      const padLeft = 8;
      const padRight = 8;
      const plotW = W - padLeft - padRight;
      const slotW = plotW / count;
      const barW = Math.max(3, Math.min(8, slotW * 0.68));

      const barsSvg = buckets.map((b, i) => {
        const x = padLeft + i * slotW + (slotW - barW) / 2;
        const h = b.messages > 0 ? Math.max(6, Math.round((b.messages / maxVal) * 108)) : 3;
        const y = 150 - h;
        const opacity = b.messages > 0 ? '0.9' : '0.35';
        const color = b.messages > 0 ? '#22c55e' : '#262626';
        return `<rect data-bar-idx="${i}" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barW.toFixed(2)}" height="${h}" rx="2" fill="${color}" opacity="${opacity}" class="transition-opacity duration-75"></rect>`;
      }).join('');

      const tickIndices = is48h ? [4, 18, 32, 46] : [5, 22, 39, 56];
      const ticksSvg = tickIndices.map(idx => {
        const b = buckets[Math.min(buckets.length - 1, idx)];
        const x = padLeft + idx * slotW;
        return `<text x="${x.toFixed(1)}" y="170" font-size="9" fill="#525252" text-anchor="middle">${escapeHtml(b?.label || '')}</text>`;
      }).join('');

      wrapper.innerHTML = `
        <svg id="live-chart-svg" width="100%" height="180" viewBox="0 0 440 180" class="overflow-visible">
          <line stroke="#262626" x1="0" y1="150" x2="440" y2="150"></line>
          <line stroke="#262626" x1="0" y1="113.5" x2="440" y2="113.5"></line>
          <line stroke="#262626" x1="0" y1="77" x2="440" y2="77"></line>
          <line stroke="#262626" x1="0" y1="40" x2="440" y2="40"></line>
          <line id="live-hover-line" x1="0" y1="30" x2="0" y2="150" stroke="#22c55e" stroke-width="1" stroke-dasharray="3 3" class="hidden pointer-events-none"></line>
          ${barsSvg}
          ${ticksSvg}
        </svg>
        <div id="live-chart-tooltip" class="hidden pointer-events-none absolute z-20 rounded-lg border border-[#2e2e2e] bg-[#171717] px-3 py-2 shadow-xl" style="top: 8px; left: 0;">
          <p id="live-tooltip-date" class="text-[11px] font-medium text-neutral-400 leading-tight"></p>
          <p class="text-[12px] text-neutral-300 mt-1 leading-tight">Messages: <span id="live-tooltip-val" class="font-bold text-white tabular-nums">0</span></p>
        </div>
      `;

      const svgEl = document.getElementById('live-chart-svg');
      const hoverLine = document.getElementById('live-hover-line');
      const tooltip = document.getElementById('live-chart-tooltip');
      const tooltipDate = document.getElementById('live-tooltip-date');
      const tooltipVal = document.getElementById('live-tooltip-val');
      const barRects = svgEl ? Array.from(svgEl.querySelectorAll('rect[data-bar-idx]')) : [];

      function handleMove(clientX) {
        const rect = wrapper.getBoundingClientRect();
        if (!rect.width) return;
        const relX = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const svgX = (relX / rect.width) * W;
        const idx = Math.max(0, Math.min(count - 1, Math.floor((svgX - padLeft) / slotW)));
        const bucket = buckets[idx];
        if (!bucket) return;

        const centerX = padLeft + idx * slotW + slotW / 2;
        if (hoverLine) {
          hoverLine.setAttribute('x1', centerX.toFixed(2));
          hoverLine.setAttribute('x2', centerX.toFixed(2));
          hoverLine.classList.remove('hidden');
        }

        barRects.forEach((r, i) => {
          if (i === idx) {
            r.setAttribute('fill', '#4ade80');
            r.setAttribute('opacity', '1');
          } else {
            const hasMsg = buckets[i].messages > 0;
            r.setAttribute('fill', hasMsg ? '#22c55e' : '#262626');
            r.setAttribute('opacity', hasMsg ? '0.9' : '0.35');
          }
        });

        if (tooltip && tooltipDate && tooltipVal) {
          tooltipDate.textContent = bucket.label;
          tooltipVal.textContent = formatNumber(bucket.messages);
          tooltip.classList.remove('hidden');
          const pxX = (centerX / W) * rect.width;
          const tipW = tooltip.offsetWidth || 115;
          const leftPos = pxX + tipW + 16 > rect.width ? Math.max(4, pxX - tipW - 10) : pxX + 10;
          tooltip.style.left = `${leftPos}px`;
        }
      }

      wrapper.onmousemove = (e) => handleMove(e.clientX);
      wrapper.ontouchmove = (e) => {
        if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX);
      };
      wrapper.onmouseleave = () => {
        if (hoverLine) hoverLine.classList.add('hidden');
        if (tooltip) tooltip.classList.add('hidden');
        barRects.forEach((r, i) => {
          const hasMsg = buckets[i].messages > 0;
          r.setAttribute('fill', hasMsg ? '#22c55e' : '#262626');
          r.setAttribute('opacity', hasMsg ? '0.9' : '0.35');
        });
      };
    }

    function renderTopChannels() {
      const body = document.getElementById('top-channels-body');
      const subtitle = document.getElementById('top-channels-subtitle');
      if (!body) return;

      if (subtitle) {
        subtitle.textContent = RANGE_LABELS[state.channelRange] || 'Last 7 days';
      }

      const channels = Array.isArray(state.topChannels) ? state.topChannels : [];
      if (channels.length === 0) {
        body.innerHTML = `
          <div class="h-[180px] flex flex-col items-center justify-center text-center">
            <p class="text-sm text-neutral-500">No channel activity yet</p>
            <p class="text-xs text-neutral-600 mt-1">Stats build up as messages come in.</p>
          </div>
        `;
        return;
      }

      const maxCount = Math.max(1, ...channels.map(c => Number(c.messages) || 0));
      body.innerHTML = `
        <div class="space-y-3 pt-1">
          ${channels.map((ch, idx) => {
            const msgs = Number(ch.messages) || 0;
            const pct = ch.percentage !== undefined ? Number(ch.percentage) : Math.round((msgs / maxCount) * 100);
            const barWidth = Math.max(4, Math.min(100, Math.round((msgs / maxCount) * 100)));
            return `
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-xs gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-4 h-4 rounded bg-neutral-800 text-[10px] font-semibold text-neutral-400 flex items-center justify-center shrink-0 tabular-nums">${idx + 1}</span>
                    <span class="text-neutral-300 font-medium truncate">#${escapeHtml(ch.name)}</span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0 tabular-nums">
                    <span class="text-white font-semibold">${formatNumber(msgs)}</span>
                    <span class="text-[10px] text-neutral-500 w-8 text-right">${pct}%</span>
                  </div>
                </div>
                <div class="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full transition-all duration-300" style="width: ${barWidth}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    function renderActivityChart() {
      const wrapper = document.getElementById('activity-chart-wrapper');
      const totalEl = document.getElementById('activity-total-messages');
      const subtitleEl = document.getElementById('activity-range-subtitle');
      const pctWrapper = document.getElementById('activity-pct-wrapper');
      if (!wrapper) return;

      if (totalEl) totalEl.textContent = formatNumber(state.periodMessages);
      if (subtitleEl) subtitleEl.textContent = (RANGE_LABELS[state.activityRange] || 'Last 7 days').toLowerCase();
      if (pctWrapper) pctWrapper.innerHTML = renderPctBadge(state.changes?.period_messages_pct);

      const history = Array.isArray(state.history) && state.history.length > 0
        ? state.history
        : Array.from({ length: 7 }).map((_, idx) => {
            const d = new Date(Date.now() - (6 - idx) * 86400000);
            return {
              date: d.toISOString().slice(0, 10),
              messages: 0
            };
          });

      const values = history.map(h => Number(h.messages) || 0);
      const maxDataVal = Math.max(0, ...values);
      // Match screenshots: when max is 0, Y-axis ticks are 0, 1, 2, 3, 4
      const step = maxDataVal <= 0 ? 1 : Math.ceil(maxDataVal / 4);
      const yMax = step * 4;
      const yTicks = [0, step, step * 2, step * 3, step * 4];

      const W = 940;
      const H = 185;
      const padLeft = 34;
      const padRight = 24;
      const topY = 20;
      const bottomY = 148;
      const plotW = W - padLeft - padRight;
      const plotH = bottomY - topY;

      const points = history.map((item, idx) => {
        const x = history.length === 1
          ? padLeft + plotW / 2
          : padLeft + (idx / (history.length - 1)) * plotW;
        const val = Number(item.messages) || 0;
        const y = bottomY - (val / yMax) * plotH;
        const formattedDate = formatChartDateLabel(item.date);
        return {
          x,
          y,
          val,
          rawDate: item.date,
          label: formattedDate,
          tooltipDate: item.full_date || formattedDate
        };
      });

      const { line, area } = buildMonotoneSvgPath(points);

      const gridSvg = yTicks.map((tickVal, idx) => {
        const y = bottomY - (idx / 4) * plotH;
        const isBase = idx === 0;
        return `
          <line stroke="#262626" ${isBase ? '' : 'stroke-dasharray="2 2"'} x1="${padLeft}" y1="${y.toFixed(1)}" x2="${W - padRight}" y2="${y.toFixed(1)}"></line>
          <text x="${padLeft - 10}" y="${(y + 3.5).toFixed(1)}" font-size="11" fill="#525252" text-anchor="end" class="tabular-nums">${tickVal}</text>
        `;
      }).join('');

      // X-axis date labels (show all when <= 8 points, otherwise up to 7 evenly spaced labels)
      const maxLabels = 7;
      const labelIndices = [];
      if (points.length <= 8) {
        for (let i = 0; i < points.length; i++) labelIndices.push(i);
      } else {
        for (let i = 0; i < maxLabels; i++) {
          labelIndices.push(Math.round((i / (maxLabels - 1)) * (points.length - 1)));
        }
      }

      const xLabelsSvg = labelIndices.map(idx => {
        const pt = points[idx];
        return `<text x="${pt.x.toFixed(1)}" y="172" font-size="11" fill="#525252" text-anchor="middle">${escapeHtml(pt.label)}</text>`;
      }).join('');

      wrapper.innerHTML = `
        <svg id="activity-chart-svg" width="100%" height="${H}" viewBox="0 0 ${W} ${H}" class="overflow-visible">
          <defs>
            <linearGradient id="orbitWeeklyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#22c55e" stop-opacity="0.28"></stop>
              <stop offset="100%" stop-color="#22c55e" stop-opacity="0.0"></stop>
            </linearGradient>
          </defs>
          ${gridSvg}
          <path d="${area}" fill="url(#orbitWeeklyFill)"></path>
          <path d="${line}" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          <!-- Interactive Hover Elements matching screenshots -->
          <line id="activity-hover-line" x1="0" y1="${topY}" x2="0" y2="${bottomY}" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3 3" class="hidden pointer-events-none"></line>
          <circle id="activity-hover-dot" cx="0" cy="${bottomY}" r="4.5" fill="#22c55e" stroke="#ffffff" stroke-width="2.5" class="hidden pointer-events-none"></circle>
          ${xLabelsSvg}
        </svg>
        <div id="activity-chart-tooltip" class="hidden pointer-events-none absolute z-20 rounded-lg border border-[#2e2e2e] bg-[#171717] px-3 py-2 shadow-xl" style="top: 40px; left: 0;">
          <p id="activity-tooltip-date" class="text-[11px] font-medium text-neutral-400 leading-tight"></p>
          <p class="text-[12px] text-neutral-300 mt-1 leading-tight">Messages: <span id="activity-tooltip-val" class="font-bold text-white tabular-nums">0</span></p>
        </div>
      `;

      const hoverLine = document.getElementById('activity-hover-line');
      const hoverDot = document.getElementById('activity-hover-dot');
      const tooltip = document.getElementById('activity-chart-tooltip');
      const tooltipDate = document.getElementById('activity-tooltip-date');
      const tooltipVal = document.getElementById('activity-tooltip-val');

      function handleActivityHover(clientX) {
        const rect = wrapper.getBoundingClientRect();
        if (!rect.width || points.length === 0) return;
        const relX = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const svgX = (relX / rect.width) * W;

        let nearestIdx = 0;
        let minDist = Infinity;
        for (let i = 0; i < points.length; i++) {
          const dist = Math.abs(points[i].x - svgX);
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = i;
          }
        }

        const pt = points[nearestIdx];
        if (!pt) return;

        if (hoverLine) {
          hoverLine.setAttribute('x1', pt.x.toFixed(2));
          hoverLine.setAttribute('x2', pt.x.toFixed(2));
          hoverLine.classList.remove('hidden');
        }
        if (hoverDot) {
          hoverDot.setAttribute('cx', pt.x.toFixed(2));
          hoverDot.setAttribute('cy', pt.y.toFixed(2));
          hoverDot.classList.remove('hidden');
        }
        if (tooltip && tooltipDate && tooltipVal) {
          tooltipDate.textContent = pt.tooltipDate;
          tooltipVal.textContent = formatNumber(pt.val);
          tooltip.classList.remove('hidden');

          const pxX = (pt.x / W) * rect.width;
          const pxY = (pt.y / H) * rect.height;
          const tipW = tooltip.offsetWidth || 115;
          const tipH = tooltip.offsetHeight || 52;

          const leftPos = pxX + tipW + 18 > rect.width
            ? Math.max(8, pxX - tipW - 14)
            : pxX + 14;
          const topPos = Math.max(10, Math.min(rect.height - tipH - 28, pxY - tipH - 8));

          tooltip.style.left = `${leftPos}px`;
          tooltip.style.top = `${topPos}px`;
        }
      }

      wrapper.onmousemove = (e) => handleActivityHover(e.clientX);
      wrapper.ontouchmove = (e) => {
        if (e.touches && e.touches[0]) handleActivityHover(e.touches[0].clientX);
      };
      wrapper.onmouseleave = () => {
        if (hoverLine) hoverLine.classList.add('hidden');
        if (hoverDot) hoverDot.classList.add('hidden');
        if (tooltip) tooltip.classList.add('hidden');
      };
    }

    function renderModActivity(logs) {
      const body = document.getElementById('mod-activity-body');
      const pillsEl = document.getElementById('mod-activity-summary-pills');
      if (!body) return;

      if (!Array.isArray(logs) || logs.length === 0) {
        if (pillsEl) pillsEl.innerHTML = '';
        body.innerHTML = `
          <div class="flex-1 flex flex-col items-center justify-center py-10 gap-2">
            <div class="w-12 h-12 rounded-xl bg-neutral-800/80 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-6 h-6 text-neutral-600"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
            </div>
            <p class="text-sm text-neutral-400 font-medium">All quiet</p>
            <p class="text-[11px] text-neutral-600 text-center max-w-[240px]">No moderation actions yet. Actions will appear here as your mods take them.</p>
          </div>
        `;
        return;
      }

      // Compute summary counts by action category
      const counts = {};
      logs.forEach(item => {
        const act = String(item.action || 'mod').toLowerCase();
        counts[act] = (counts[act] || 0) + 1;
      });

      function getActionStyle(actionRaw) {
        const a = String(actionRaw || '').toLowerCase();
        if (a.includes('unban')) {
          return { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400', label: 'Unban' };
        }
        if (a.includes('ban')) {
          return { badge: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400', label: a.includes('temp') ? 'Tempban' : (a.includes('soft') ? 'Softban' : 'Ban') };
        }
        if (a.includes('kick')) {
          return { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-400', label: 'Kick' };
        }
        if (a.includes('warn')) {
          return { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400', label: 'Warn' };
        }
        if (a.includes('unmute') || a.includes('untimeout')) {
          return { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', dot: 'bg-cyan-400', label: 'Unmute' };
        }
        if (a.includes('timeout') || a.includes('mute')) {
          return { badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-400', label: 'Timeout' };
        }
        return {
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          dot: 'bg-blue-400',
          label: String(actionRaw || 'Action').replace(/_/g, ' ')
        };
      }

      if (pillsEl) {
        pillsEl.innerHTML = Object.entries(counts).slice(0, 4).map(([act, cnt]) => {
          const st = getActionStyle(act);
          return `<span class="px-1.5 py-0.5 text-[10px] font-medium rounded border ${st.badge} capitalize tabular-nums">${cnt} ${escapeHtml(st.label.toLowerCase())}${cnt > 1 ? 's' : ''}</span>`;
        }).join('');
      }

      body.innerHTML = `
        <div class="divide-y divide-neutral-800/60 max-h-[380px] overflow-y-auto">
          ${logs.slice(0, 10).map(item => {
            const st = getActionStyle(item.action);
            const relTime = formatRelativeTime(item.timestamp);
            return `
              <div class="flex items-start gap-3 px-4 py-3 hover:bg-neutral-800/30 transition-colors">
                <div class="w-8 h-8 rounded-lg bg-neutral-800/90 flex items-center justify-center shrink-0 mt-0.5">
                  <span class="w-2 h-2 rounded-full ${st.dot}"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-semibold text-white truncate">${escapeHtml(item.target_name || 'Unknown User')}</span>
                    <span class="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${st.badge}">${escapeHtml(st.label)}</span>
                    <span class="text-[11px] text-neutral-500 truncate">by <span class="text-neutral-400">${escapeHtml(item.mod_name || 'Moderator')}</span></span>
                  </div>
                  <p class="text-xs text-neutral-400 mt-0.5 line-clamp-1 break-all">${escapeHtml(item.reason || 'No reason provided')}</p>
                </div>
                <span class="text-[11px] text-neutral-500 shrink-0 tabular-nums mt-0.5">${escapeHtml(relTime)}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // Initial render of all dynamic charts and lists
    renderLiveChart();
    renderTopChannels();
    renderActivityChart();
    renderModActivity(modLogs);

    // ─── Event Listeners for Filter Toggles & Refresh ───────────────────────────

    function updateToggleButtonStyles(containerId, attrName, activeValue) {
      const group = document.getElementById(containerId);
      if (!group) return;
      group.querySelectorAll(`button[${attrName}]`).forEach(btn => {
        const isSelected = btn.getAttribute(attrName) === String(activeValue);
        if (isSelected) {
          btn.className = btn.className
            .replace(/text-neutral-400|hover:text-white/g, '')
            .trim() + ' text-black bg-white';
        } else {
          btn.className = btn.className
            .replace(/text-black|bg-white/g, '')
            .trim() + ' text-neutral-400 hover:text-white';
        }
      });
    }

    // 1. Live Chart 48h / 60m Toggle
    const liveBtns = document.getElementById('live-mode-buttons');
    if (liveBtns) {
      liveBtns.querySelectorAll('button[data-live-mode]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const mode = btn.getAttribute('data-live-mode');
          if (!mode || mode === state.liveMode) return;
          state.liveMode = mode;
          updateToggleButtonStyles('live-mode-buttons', 'data-live-mode', mode);
          renderLiveChart();
          try {
            const freshLive = await API.getGuildStatsLive(guildId);
            if (freshLive) {
              if (freshLive.live_60m) state.live60m = freshLive.live_60m;
              if (freshLive.total_60m !== undefined) state.total60m = freshLive.total_60m;
              if (freshLive.live_48h) state.live48h = freshLive.live_48h;
              if (freshLive.total_48h !== undefined) state.total48h = freshLive.total_48h;
              renderLiveChart();
            }
          } catch (_) {}
        });
      });
    }

    // 2. Top Message Channels 1D / 1W / 1M / 1Y / All Toggle
    const chRangeBtns = document.getElementById('top-channels-range-buttons');
    if (chRangeBtns) {
      chRangeBtns.querySelectorAll('button[data-ch-range]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const rng = btn.getAttribute('data-ch-range');
          if (!rng || rng === state.channelRange) return;
          state.channelRange = rng;
          updateToggleButtonStyles('top-channels-range-buttons', 'data-ch-range', rng);
          try {
            const updated = await API.getGuildStats(guildId, state.activityRange, state.channelRange);
            if (updated && Array.isArray(updated.top_channels)) {
              state.topChannels = updated.top_channels;
              renderTopChannels();
            }
          } catch (e) {
            console.warn('[OverviewTab] Failed to update channel range:', e);
          }
        });
      });
    }

    // 3. Activity Chart 1D / 1W / 1M / 1Y / All Toggle
    const actRangeBtns = document.getElementById('activity-range-buttons');
    if (actRangeBtns) {
      actRangeBtns.querySelectorAll('button[data-act-range]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const rng = btn.getAttribute('data-act-range');
          if (!rng || rng === state.activityRange) return;
          state.activityRange = rng;
          updateToggleButtonStyles('activity-range-buttons', 'data-act-range', rng);
          try {
            const updated = await API.getGuildStats(guildId, state.activityRange, state.channelRange);
            if (updated) {
              state.history = updated.history || [];
              state.periodMessages = updated.period_messages ?? 0;
              state.changes = updated.changes || state.changes;
              renderActivityChart();
            }
          } catch (e) {
            console.warn('[OverviewTab] Failed to update activity range:', e);
          }
        });
      });
    }

    // 4. Manual Refresh Button & Auto-Polling
    const refreshBtn = document.getElementById('overview-refresh-btn');
    const refreshIcon = document.getElementById('overview-refresh-icon');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (refreshIcon) refreshIcon.classList.add('animate-spin');
        DashboardTabs.Overview(container, guildId, guild);
      });
    }

    DashboardTabs._overviewPollTimer = setInterval(async () => {
      if (!document.getElementById('overview-content')) {
        clearInterval(DashboardTabs._overviewPollTimer);
        DashboardTabs._overviewPollTimer = null;
        return;
      }
      try {
        const [freshLive, freshStats, freshMod] = await Promise.all([
          API.getGuildStatsLive(guildId).catch(() => null),
          API.getGuildStats(guildId, state.activityRange, state.channelRange).catch(() => null),
          API.getModActivity(guildId).catch(() => null)
        ]);
        if (freshLive) {
          if (freshLive.live_60m) state.live60m = freshLive.live_60m;
          if (freshLive.total_60m !== undefined) state.total60m = freshLive.total_60m;
          if (freshLive.live_48h) state.live48h = freshLive.live_48h;
          if (freshLive.total_48h !== undefined) state.total48h = freshLive.total_48h;
        }
        if (freshStats) {
          state.history = freshStats.history || state.history;
          state.periodMessages = freshStats.period_messages ?? state.periodMessages;
          state.topChannels = freshStats.top_channels || state.topChannels;
          state.changes = freshStats.changes || state.changes;
          const memEl = document.getElementById('stat-card-members');
          const msgEl = document.getElementById('stat-card-messages');
          const actEl = document.getElementById('stat-card-active-users');
          const vcEl = document.getElementById('stat-card-voice-hours');
          const tkEl = document.getElementById('stat-card-tickets');
          if (memEl) memEl.textContent = formatNumber(freshStats.total_members ?? freshStats.member_count ?? memberCount);
          if (msgEl) msgEl.textContent = formatNumber(freshStats.week_messages ?? freshStats.message_count ?? messageCount);
          if (actEl) actEl.textContent = formatNumber(freshStats.week_active_users ?? freshStats.active_users ?? activeUsers);
          if (vcEl) vcEl.textContent = freshStats.voice_hours ?? voiceHours;
          if (tkEl) tkEl.textContent = formatNumber(freshStats.open_tickets ?? openTickets);
        }
        renderLiveChart();
        renderTopChannels();
        renderActivityChart();
        if (Array.isArray(freshMod)) renderModActivity(freshMod);
      } catch (_) {}
    }, 30000);

    loading.classList.add('hidden');
    content.classList.remove('hidden');

  } catch (err) {
    console.error('[OverviewTab] Error loading overview:', err);
    const loading = document.getElementById('overview-loading');
    if (loading) {
      loading.innerHTML = `
        <div class="p-8 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-center">
          Failed to load server data.
        </div>
      `;
    }
  }
};
