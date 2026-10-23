/**
 * Orbit Dashboard - Overview Tab
 * Exactly matches PeakBot overview layout: 5 stats cards, 48h messages chart,
 * top message channels, weekly activity chart, features status, and mod activity.
 */

DashboardTabs.Overview = async function(container, guildId, currentGuildInfo = null) {
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  container.innerHTML = `
    <div id="overview-container" class="space-y-6 pb-10">
      <div id="overview-loading" class="flex items-center justify-center p-12 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Lade Übersicht...
      </div>
      <div id="overview-content" class="hidden space-y-6"></div>
    </div>
  `;

  try {
    const [configData, statsData, modActivity, guildsData] = await Promise.all([
      API.getConfig(guildId).catch(() => ({})),
      API.getGuildStats(guildId, 7).catch(() => ({})),
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

    const memberCount = statsData?.member_count ?? 0;
    const messageCount = statsData?.message_count ?? 0;
    const activeUsers = statsData?.active_users ?? 0;
    const voiceHours = statsData?.voice_hours ?? 0;
    const openTickets = statsData?.open_tickets ?? 0;

    const content = document.getElementById('overview-content');
    const loading = document.getElementById('overview-loading');
    if (!content) return;

    content.innerHTML = `
      <!-- Banner 1: Setup in progress -->
      <div class="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-4 h-4 text-blue-400 animate-spin flex-shrink-0"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
        <div>
          <p class="text-sm font-medium text-white">Wird eingerichtet...</p>
          <p class="text-xs text-neutral-400">Die Statistiken erscheinen kurz nachdem der Bot mit dem Tracking begonnen hat.</p>
        </div>
      </div>

      <!-- Banner 2: KI-Builder Card -->
      <div class="relative overflow-hidden rounded-xl border border-green-500/10 bg-gradient-to-br from-green-950/40 via-neutral-900 to-neutral-900 px-5 py-5 sm:px-6">
        <div class="absolute -top-8 -right-8 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="pointer-events-none absolute inset-0 opacity-[0.06]" style="background-image: radial-gradient(circle, rgb(255, 255, 255) 1px, transparent 1px); background-size: 14px 14px; mask-image: linear-gradient(to left bottom, black 0%, rgba(0, 0, 0, 0.4) 40%, transparent 80%);"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div class="flex-1 min-w-0 space-y-2">
            <span class="text-[10px] font-semibold text-green-400 uppercase tracking-widest block leading-none">KI-Builder</span>
            <h2 class="text-base font-bold text-white leading-tight text-balance">Richte deinen Server in Sekunden ein</h2>
            <div class="flex flex-wrap gap-1">
              <span class="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-2.5 h-2.5"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>Kanäle</span>
              <span class="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-2.5 h-2.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>Berechtigungen</span>
              <span class="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-2.5 h-2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>Rollen</span>
              <span class="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-2.5 h-2.5"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>Bot-Konfig</span>
            </div>
          </div>
          <a class="inline-flex items-center justify-center gap-2 pl-5 pr-[18px] py-2.5 bg-white hover:bg-neutral-200 text-black text-sm font-semibold rounded-lg transition-transform duration-150 ease-out active:scale-[0.96] whitespace-nowrap shrink-0 self-stretch sm:self-center" href="/dashboard/${guildId}/builder">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg> KI-Builder ausprobieren
          </a>
        </div>
      </div>

      <!-- Banner 3: Server Info Card -->
      <div class="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] p-4 sm:p-6">
        <div class="pointer-events-none absolute -bottom-20 -right-10 w-[700px] h-80 opacity-25" style="background: radial-gradient(at right center, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.06) 30%, rgba(34, 197, 94, 0.02) 60%, transparent 90%);"></div>
        <div class="relative flex items-center justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <div class="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-neutral-800">
              <img alt="${escapeHtml(guild.name)}" class="w-full h-full object-cover" src="${iconUrl}">
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2.5">
                <h1 class="text-xl font-semibold text-white truncate">${escapeHtml(guild.name)}</h1>
              </div>
              <p class="text-xs text-neutral-500 mt-0.5 truncate tabular-nums">Online & Aktiv</p>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <div class="flex items-center gap-1.5 text-xs"><div class="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"></div></div>
            <div class="flex items-center gap-1.5 text-xs text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span class="hidden sm:inline">Synchronisiert</span>
              <button onclick="DashboardTabs.Overview(document.getElementById('dash-tab-content'), '${guildId}')" class="p-1 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-white cursor-pointer" aria-label="Refresh">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-3.5 h-3.5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
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
            <p class="text-[28px] font-bold tabular-nums leading-none text-white">${memberCount}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums bg-green-500/10 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right w-3 h-3"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>+0%
              </span>
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
            <p class="text-[28px] font-bold tabular-nums leading-none text-white">${messageCount}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums bg-green-500/10 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right w-3 h-3"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>+0%
              </span>
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
            <p class="text-[28px] font-bold tabular-nums leading-none text-white">${activeUsers}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums bg-green-500/10 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right w-3 h-3"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>+0%
              </span>
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
            <p class="text-[28px] font-bold tabular-nums leading-none text-white">${voiceHours}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums bg-green-500/10 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right w-3 h-3"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>+0%
              </span>
              <span class="text-[10px] text-neutral-600">vs last week</span>
            </div>
          </div>

          <!-- Open Tickets -->
          <div class="bg-neutral-900 px-5 py-5 group hover:bg-neutral-800/30 transition-colors max-lg:col-span-2">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-md bg-neutral-800 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket w-3.5 h-3.5 text-neutral-400"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
              </div>
              <span class="text-xs font-medium text-neutral-400">Open tickets</span>
            </div>
            <p class="text-[28px] font-bold tabular-nums leading-none text-white">${openTickets}</p>
            <div class="mt-2 flex items-center gap-1.5 min-h-[18px]">
              <span class="text-[10px] text-neutral-500">all clear</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Two-column row: 48h messages chart & Top Message Channels -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <!-- Messages · Last 48 hours -->
        <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
          <div class="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[13px] text-neutral-400 font-medium">Messages · Last 48 hours</p>
              <p class="text-3xl font-bold text-white tabular-nums mt-1">${messageCount}</p>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span class="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Live</span>
              </div>
              <div class="relative inline-flex p-0.5 rounded-lg bg-neutral-800 border border-neutral-700">
                <button type="button" class="relative px-2.5 py-1 text-[11px] font-medium rounded-md text-black bg-white select-none">48h</button>
                <button type="button" class="relative px-2.5 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white select-none">60m</button>
              </div>
            </div>
          </div>
          <div class="px-5 pb-5">
            <div style="width: 100%; height: 180px;">
              <svg width="100%" height="180" viewBox="0 0 440 180" class="overflow-visible">
                <line stroke="#262626" x1="0" y1="150" x2="440" y2="150"></line>
                <line stroke="#262626" x1="0" y1="113.5" x2="440" y2="113.5"></line>
                <line stroke="#262626" x1="0" y1="77" x2="440" y2="77"></line>
                <line stroke="#262626" x1="0" y1="40" x2="440" y2="40"></line>
                <!-- SVG Bars matching PeakBot -->
                ${Array.from({ length: 30 }).map((_, i) => {
                  const x = 10 + i * 14;
                  const h = Math.max(3, (i % 7 === 0 ? 18 : (i % 5 === 0 ? 12 : 4)));
                  const y = 150 - h;
                  return `<rect x="${x}" y="${y}" width="8" height="${h}" rx="2" fill="#22c55e" opacity="0.85"></rect>`;
                }).join('')}
                <text x="20" y="170" font-size="9" fill="#525252">10/21 15h</text>
                <text x="140" y="170" font-size="9" fill="#525252">10/22 07h</text>
                <text x="260" y="170" font-size="9" fill="#525252">10/22 23h</text>
                <text x="380" y="170" font-size="9" fill="#525252">10/23 07h</text>
              </svg>
            </div>
          </div>
        </div>

        <!-- Top Message Channels -->
        <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
          <div class="px-4 pt-4 pb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div class="min-w-0">
              <p class="text-sm text-white font-semibold">Top Message Channels</p>
              <p class="text-[11px] text-neutral-500 mt-0.5">Last 7 days</p>
            </div>
            <div class="relative inline-flex p-0.5 rounded-lg bg-neutral-800 border border-neutral-700 shrink-0">
              <button type="button" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white">1D</button>
              <button type="button" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-black bg-white">1W</button>
              <button type="button" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white">1M</button>
              <button type="button" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white">1Y</button>
              <button type="button" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white">All</button>
            </div>
          </div>
          <div class="flex-1 px-2 pb-3">
            <div class="h-[180px] flex flex-col items-center justify-center text-center">
              <p class="text-sm text-neutral-500">No channel activity yet</p>
              <p class="text-xs text-neutral-600 mt-1">Stats build up as messages come in.</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Activity Section Chart (Weekly) -->
      <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
        <div class="px-5 pt-4 pb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity w-3.5 h-3.5 text-green-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            <span class="text-sm font-medium text-white">Aktivität</span>
            <span class="text-[11px] text-neutral-500">last 7 days</span>
          </div>
          <div class="relative inline-flex p-0.5 rounded-lg bg-neutral-800 border border-neutral-700 shrink-0">
            <button type="button" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white">1D</button>
            <button type="button" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-black bg-white">1W</button>
            <button type="button" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white">1M</button>
            <button type="button" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white">1Y</button>
            <button type="button" class="relative px-2 py-1 text-[11px] font-medium rounded-md text-neutral-400 hover:text-white">All</button>
          </div>
        </div>
        <div class="px-5 pb-3 flex items-end justify-between gap-6 flex-wrap">
          <div class="flex items-end gap-4">
            <div class="flex flex-col">
              <span class="text-4xl font-bold text-white tabular-nums leading-none">${messageCount}</span>
              <span class="text-[11px] text-neutral-500 mt-1">messages</span>
            </div>
          </div>
        </div>
        <div class="px-5 pb-4">
          <div style="width: 100%; height: 180px;">
            <svg width="100%" height="180" viewBox="0 0 940 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="orbitWeeklyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#22c55e" stop-opacity="0.3"></stop>
                  <stop offset="100%" stop-color="#22c55e" stop-opacity="0"></stop>
                </linearGradient>
              </defs>
              <line stroke="#262626" x1="0" y1="150" x2="940" y2="150"></line>
              <line stroke="#262626" x1="0" y1="114.5" x2="940" y2="114.5"></line>
              <line stroke="#262626" x1="0" y1="79" x2="940" y2="79"></line>
              <line stroke="#262626" x1="0" y1="43.5" x2="940" y2="43.5"></line>
              <!-- Filled green curve -->
              <path d="M0,150 Q200,140 400,120 T700,90 T940,110 L940,150 L0,150 Z" fill="url(#orbitWeeklyFill)"></path>
              <path d="M0,150 Q200,140 400,120 T700,90 T940,110" fill="none" stroke="#22c55e" stroke-width="2"></path>
            </svg>
          </div>
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
          </div>
          <div class="flex flex-col flex-1 divide-y divide-neutral-800/60">
            ${[
              { name: 'Auto-Moderation', active: true },
              { name: 'Willkommen & Rollen', active: true },
              { name: 'Leveling & XP', active: true },
              { name: 'Support Tickets', active: true },
              { name: 'Invite Tracker', active: true },
              { name: 'Verifizierung', active: true },
              { name: 'Auto-Responder', active: true },
              { name: 'Temp Voice', active: true }
            ].map(f => `
              <div class="flex items-center gap-3 px-4 py-3">
                <div class="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-400">
                  <span class="w-2 h-2 rounded-full ${f.active ? 'bg-green-400' : 'bg-neutral-600'}"></span>
                </div>
                <div class="text-xs font-medium text-neutral-300">${f.name}</div>
                <div class="ml-auto">
                  <span class="px-2 py-0.5 text-[10px] font-medium rounded ${f.active ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-500'}">Aktiv</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recent Mod Activity -->
        <div class="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <div class="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert w-4 h-4 text-neutral-500"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
              <span class="text-sm font-semibold text-white">Recent mod activity</span>
            </div>
            <a class="relative -my-2 py-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors inline-flex items-center gap-1 group" href="/dashboard/${guildId}/automod">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3 h-3 group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
          </div>
          <div class="flex-1 flex flex-col items-center justify-center py-10 gap-2">
            <div class="w-12 h-12 rounded-xl bg-neutral-800/80 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-6 h-6 text-neutral-600"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
            </div>
            <p class="text-sm text-neutral-400 font-medium">All quiet</p>
            <p class="text-[11px] text-neutral-600 text-center max-w-[240px]">No moderation actions yet. Actions will appear here as your mods take them.</p>
          </div>
        </div>

      </div>
    `;

    loading.classList.add('hidden');
    content.classList.remove('hidden');

  } catch (err) {
    console.error('[OverviewTab] Error loading overview:', err);
    const loading = document.getElementById('overview-loading');
    if (loading) {
      loading.innerHTML = `
        <div class="p-8 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-center">
          Fehler beim Laden der Serverdaten.
        </div>
      `;
    }
  }
};
