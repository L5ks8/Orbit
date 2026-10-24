/**
 * Orbit Dashboard - Idle Kick (Inactive Kick) Tab
 * 1:1 Pixel-Perfect Recreation of PeakBot's Inactive Kick System
 * 100% English, completely free (no Starter/Pro paywall badges).
 */

DashboardTabs.InactiveKick = async function (container, guildId) {
  const esc = (s) => (s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '');

  // Loading skeleton
  container.innerHTML = `
    <div class="flex items-center justify-center min-h-[400px]">
      <div class="flex items-center gap-3 text-neutral-400">
        <svg class="animate-spin w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm font-medium">Loading Idle Kick...</span>
      </div>
    </div>
  `;

  const SVGS = {
    userMinus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-minus"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>`,
    messageSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`,
    mail: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"></path></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
    hash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"></polyline></svg>`
  };

  let cfg = {
    enabled: false,
    days: 30,
    action: 'kick',
    min_server_size: 10,
    log_channel_id: null,
    historical_tracking: false,
    exempt_roles: [],
    ignore_any_role: false,
    count_voice: true,
    dm_warning_enabled: true,
    warn_before_hours: 24,
    warning_message: "Hey {user}! You've been inactive in **{server}** for {days} days. You'll be removed in {hours} hours unless you send a message or join a voice channel."
  };

  let channels = [];
  let roles = [];
  let serverName = 'Your Server';

  try {
    const configRes = await API.getConfig(guildId).catch(() => ({}));
    if (configRes) {
      if (Array.isArray(configRes.channels)) {
        channels = configRes.channels;
      }
      if (Array.isArray(configRes.roles)) {
        roles = configRes.roles.filter(r => !r.managed && r.name !== '@everyone');
      }
      if (configRes.guild && configRes.guild.name) {
        serverName = configRes.guild.name;
      } else if (configRes.name) {
        serverName = configRes.name;
      }
      const rawCfg = configRes.config && configRes.config.inactive_kick ? configRes.config.inactive_kick : (configRes.inactive_kick || {});
      cfg = { ...cfg, ...rawCfg };
      if (!Array.isArray(cfg.exempt_roles)) {
        cfg.exempt_roles = [];
      }
    }
  } catch (err) {
    console.error('[InactiveKick] Load error:', err);
  }

  function getActionLabel(act) {
    if (act === 'timeout') return 'Timeout (7 days)';
    if (act === 'prune') return 'Remove roles / Prune';
    return 'Kick from server';
  }

  function renderView() {
    const actionLabel = getActionLabel(cfg.action);

    container.innerHTML = `
      <main class="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto animate-fade-in">
        <div>
          <!-- Feature Header -->
          <div data-tour="feature-header" class="scroll-mt-24">
            <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                  <span class="w-5 h-5 flex items-center justify-center">${SVGS.userMinus}</span>
                </span>
                <h1 class="text-base font-medium text-white truncate">Idle Kick</h1>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0">
                <!-- Master Toggle -->
                <div class="flex items-center gap-3">
                  <button type="button" id="master-toggle-btn" role="switch" aria-checked="${cfg.enabled ? 'true' : 'false'}" aria-label="${cfg.enabled ? 'Enabled' : 'Disabled'}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${cfg.enabled ? 'bg-white' : 'bg-neutral-700'}">
                    <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${cfg.enabled ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-white'}"></span>
                  </button>
                  <div class="flex-shrink-0">
                    <span id="master-toggle-label" class="text-sm font-medium whitespace-nowrap ${cfg.enabled ? 'text-white' : 'text-neutral-500'}">${cfg.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div class="mt-6">
            <div class="space-y-4">

              <!-- 1. Workflow Summary Banner -->
              <div class="bg-neutral-900 rounded-2xl border border-neutral-800 px-4 py-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div class="flex items-center gap-2.5 flex-wrap">
                  <!-- Step 1: Inactivity Threshold -->
                  <div class="flex items-center gap-2 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/15">
                    <span class="w-4 h-4 text-amber-400 shrink-0 flex items-center justify-center">${SVGS.clock}</span>
                    <span id="summary-days" class="text-xs font-medium text-amber-300 tabular-nums">${cfg.days} days inactive</span>
                  </div>
                  <!-- Arrow 1 -->
                  <div class="flex items-center gap-2.5">
                    <span class="w-4 h-4 text-neutral-600 shrink-0 flex items-center justify-center">${SVGS.arrowRight}</span>
                    <!-- Step 2: DM Warning -->
                    <div id="summary-dm-box" class="flex items-center gap-2 rounded-lg px-3 py-2 border transition-all ${cfg.dm_warning_enabled ? 'bg-orange-500/10 border-orange-500/15' : 'bg-neutral-800/40 border-neutral-700/30 opacity-60'}">
                      <span class="w-4 h-4 shrink-0 flex items-center justify-center ${cfg.dm_warning_enabled ? 'text-orange-400' : 'text-neutral-400'}">${SVGS.messageSquare}</span>
                      <span id="summary-hours" class="text-xs font-medium tabular-nums ${cfg.dm_warning_enabled ? 'text-orange-300' : 'text-neutral-400'}">${cfg.dm_warning_enabled ? `DM warning (${cfg.warn_before_hours}h before)` : 'No warning DM'}</span>
                    </div>
                  </div>
                  <!-- Arrow 2 -->
                  <div class="flex items-center gap-2.5">
                    <span class="w-4 h-4 text-neutral-600 shrink-0 flex items-center justify-center">${SVGS.arrowRight}</span>
                    <!-- Step 3: Action -->
                    <div class="flex items-center gap-2 rounded-lg px-3 py-2 border bg-red-500/10 border-red-500/15">
                      <span class="w-4 h-4 text-red-400 shrink-0 flex items-center justify-center">${SVGS.userMinus}</span>
                      <span id="summary-action" class="text-xs font-medium text-red-300">${actionLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. Card: Inactivity Threshold -->
              <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div class="flex items-center gap-2.5 px-5 py-3.5 border-b border-neutral-800">
                  <div class="p-1.5 rounded-lg bg-amber-500/10 shrink-0">
                    <span class="w-4 h-4 text-amber-400 flex items-center justify-center">${SVGS.clock}</span>
                  </div>
                  <span class="text-sm font-semibold text-white">Inactivity Threshold</span>
                </div>
                <div class="p-5 space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Inactive after -->
                    <div>
                      <label class="text-xs text-neutral-400 block mb-2">Inactive after</label>
                      <div class="relative">
                        <input id="input-days" min="1" max="365" class="w-full bg-neutral-800 border rounded-xl px-4 py-2.5 text-sm text-white tabular-nums outline-none transition-[transform,background-color,color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-neutral-700 hover:border-neutral-600" type="number" value="${cfg.days}">
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pointer-events-none select-none">days</span>
                      </div>
                    </div>

                    <!-- Action dropdown -->
                    <div>
                      <label class="text-xs text-neutral-400 block mb-2">Action</label>
                      <div class="relative" id="dropdown-action-container">
                        <button type="button" id="dropdown-action-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                          <span class="min-w-0 truncate text-sm text-white" id="dropdown-action-label">${actionLabel}</span>
                          <span class="w-4 h-4 text-neutral-400 transition-transform duration-200" id="dropdown-action-chevron">${SVGS.chevronDown}</span>
                        </button>
                        <div id="dropdown-action-menu" class="hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-30 py-1">
                          <button type="button" data-action="kick" class="w-full px-3 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-800 flex items-center justify-between transition-colors">
                            <span>Kick from server</span>
                            ${cfg.action === 'kick' ? `<span class="text-amber-400">${SVGS.check}</span>` : ''}
                          </button>
                          <button type="button" data-action="timeout" class="w-full px-3 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-800 flex items-center justify-between transition-colors">
                            <span>Timeout (7 days)</span>
                            ${cfg.action === 'timeout' ? `<span class="text-amber-400">${SVGS.check}</span>` : ''}
                          </button>
                          <button type="button" data-action="prune" class="w-full px-3 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-800 flex items-center justify-between transition-colors">
                            <span>Remove roles / Prune</span>
                            ${cfg.action === 'prune' ? `<span class="text-amber-400">${SVGS.check}</span>` : ''}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. Card: Security & Logging -->
              <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div class="flex items-center gap-2.5 px-5 py-3.5 border-b border-neutral-800">
                  <div class="p-1.5 rounded-lg bg-blue-500/10 shrink-0">
                    <span class="w-4 h-4 text-blue-400 flex items-center justify-center">${SVGS.users}</span>
                  </div>
                  <span class="text-sm font-semibold text-white">Security &amp; Logging</span>
                </div>
                <div class="p-5 space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Minimum Server Size -->
                    <div>
                      <label class="text-xs text-neutral-400 block mb-2">Minimum Server Size</label>
                      <div class="relative" id="dropdown-serversize-container">
                        <button type="button" id="dropdown-serversize-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                          <span class="min-w-0 truncate text-sm text-white" id="dropdown-serversize-label">${cfg.min_server_size > 0 ? `${cfg.min_server_size} members` : 'None (No minimum)'}</span>
                          <span class="w-4 h-4 text-neutral-400 transition-transform duration-200" id="dropdown-serversize-chevron">${SVGS.chevronDown}</span>
                        </button>
                        <div id="dropdown-serversize-menu" class="hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-30 py-1">
                          ${[0, 10, 25, 50, 100, 250].map(n => `
                            <button type="button" data-size="${n}" class="w-full px-3 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-800 flex items-center justify-between transition-colors">
                              <span>${n === 0 ? 'None (No minimum)' : `${n} members`}</span>
                              ${cfg.min_server_size === n ? `<span class="text-amber-400">${SVGS.check}</span>` : ''}
                            </button>
                          `).join('')}
                        </div>
                      </div>
                    </div>

                    <!-- Log Channel -->
                    <div>
                      <label class="text-xs text-neutral-400 block mb-2">Log Channel</label>
                      <div class="relative" id="dropdown-channel-container">
                        <button type="button" id="dropdown-channel-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                          <span class="min-w-0 truncate text-sm ${cfg.log_channel_id ? 'text-white' : 'text-neutral-500'}" id="dropdown-channel-label">
                            ${(() => {
                              if (!cfg.log_channel_id) return '# Select channel';
                              const ch = channels.find(c => String(c.id) === String(cfg.log_channel_id));
                              return ch ? `# ${ch.name}` : '# Select channel';
                            })()}
                          </span>
                          <div class="flex items-center gap-1">
                            ${cfg.log_channel_id ? `
                              <span role="button" tabindex="0" id="clear-channel-btn" aria-label="Clear selection" class="p-1 -m-1 text-neutral-400 hover:text-white transition-colors cursor-pointer">
                                <span class="w-3.5 h-3.5 flex items-center justify-center">${SVGS.x}</span>
                              </span>
                            ` : ''}
                            <span class="w-4 h-4 text-neutral-400 transition-transform duration-200" id="dropdown-channel-chevron">${SVGS.chevronDown}</span>
                          </div>
                        </button>
                        <div id="dropdown-channel-menu" class="hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-30 p-2 space-y-1 max-h-56 overflow-y-auto">
                          <input type="text" id="channel-search-input" placeholder="Search channels..." class="w-full px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 outline-none mb-1">
                          <div id="channel-options-list" class="space-y-0.5">
                            <button type="button" data-channel-id="" class="w-full px-2.5 py-1.5 text-left text-xs text-neutral-400 hover:bg-neutral-800 rounded-lg flex items-center gap-2 transition-colors">
                              <span>None / Disabled</span>
                            </button>
                            ${channels.map(c => `
                              <button type="button" data-channel-id="${c.id}" class="w-full px-2.5 py-1.5 text-left text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center justify-between transition-colors">
                                <span class="flex items-center gap-1.5 truncate">
                                  <span class="text-neutral-500 shrink-0">${SVGS.hash}</span>
                                  <span class="truncate">${esc(c.name)}</span>
                                </span>
                                ${String(cfg.log_channel_id) === String(c.id) ? `<span class="text-amber-400 shrink-0">${SVGS.check}</span>` : ''}
                              </button>
                            `).join('')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Historical Tracking Toggle -->
                  <div class="border-t border-neutral-800 pt-4 space-y-2.5">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-xs font-medium text-white">Count time from before you turned this on</p>
                        <p class="text-[11px] text-neutral-500 leading-relaxed text-pretty mt-0.5">Off: everyone starts a fresh 30-day timer today. On: the bot checks when each member last sent a message, so people who've already been quiet that long count right away.</p>
                      </div>
                      <div class="flex items-center gap-3">
                        <button type="button" id="toggle-historical-btn" role="switch" aria-checked="${cfg.historical_tracking ? 'true' : 'false'}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${cfg.historical_tracking ? 'bg-white' : 'bg-neutral-700'}">
                          <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${cfg.historical_tracking ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-white'}"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4. Card: Exemptions -->
              <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div class="flex items-center gap-2.5 px-5 py-3.5 border-b border-neutral-800">
                  <div class="p-1.5 rounded-lg bg-green-500/10 shrink-0">
                    <span class="w-4 h-4 text-green-400 flex items-center justify-center">${SVGS.shield}</span>
                  </div>
                  <span class="text-sm font-semibold text-white">Exemptions</span>
                </div>
                <div class="p-5 space-y-4">
                  <!-- Exempt Roles Multi-Select -->
                  <div>
                    <label class="text-xs text-neutral-400 block mb-2">Exempt Roles</label>
                    <div class="relative" id="dropdown-roles-container">
                      <button type="button" id="dropdown-roles-btn" class="w-full flex items-center justify-between gap-2 min-h-[40px] px-3 py-1.5 bg-neutral-800 border rounded-xl text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                        <div class="flex-1 flex flex-wrap gap-1.5" id="selected-roles-container">
                          ${(() => {
                            if (!cfg.exempt_roles || cfg.exempt_roles.length === 0) {
                              return `<span class="text-neutral-500 text-sm py-0.5">Select roles...</span>`;
                            }
                            return cfg.exempt_roles.map(rid => {
                              const r = roles.find(item => String(item.id) === String(rid));
                              const rName = r ? r.name : `Role ${rid}`;
                              const rColor = r && r.color && r.color !== '#000000' && r.color !== '#b9bbbe' ? r.color : '#818cf8';
                              return `
                                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white" data-role-id="${rid}">
                                  <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${rColor};"></span>
                                  <span class="truncate max-w-[150px]">${esc(rName)}</span>
                                  <span role="button" tabindex="0" data-remove-role="${rid}" class="text-neutral-400 hover:text-white p-0.5 cursor-pointer">
                                    <span class="w-3 h-3 flex items-center justify-center">${SVGS.x}</span>
                                  </span>
                                </span>
                              `;
                            }).join('');
                          })()}
                        </div>
                        <span class="w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform" id="dropdown-roles-chevron">${SVGS.chevronDown}</span>
                      </button>
                      <div id="dropdown-roles-menu" class="hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-30 p-2 space-y-1 max-h-56 overflow-y-auto">
                        <input type="text" id="role-search-input" placeholder="Search roles..." class="w-full px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 outline-none mb-1">
                        <div id="role-options-list" class="space-y-0.5">
                          ${roles.map(r => {
                            const isSelected = cfg.exempt_roles.includes(String(r.id));
                            const rColor = r.color && r.color !== '#000000' && r.color !== '#b9bbbe' ? r.color : '#818cf8';
                            return `
                              <button type="button" data-role-toggle="${r.id}" class="w-full px-2.5 py-1.5 text-left text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center justify-between transition-colors">
                                <span class="flex items-center gap-2 truncate">
                                  <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${rColor};"></span>
                                  <span class="truncate">${esc(r.name)}</span>
                                </span>
                                ${isSelected ? `<span class="text-amber-400 shrink-0">${SVGS.check}</span>` : ''}
                              </button>
                            `;
                          }).join('')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="border-t border-neutral-800 pt-4 space-y-3.5">
                    <!-- Ignore members with any role -->
                    <div class="flex items-center justify-between gap-3 min-h-[24px]">
                      <div>
                        <p class="text-xs font-medium text-white">Ignore members with any role</p>
                        <p class="text-[11px] text-neutral-500 leading-relaxed text-pretty mt-0.5">Protects all members who have at least one role assigned; only inactive members with zero roles will be affected.</p>
                      </div>
                      <div class="flex items-center gap-3">
                        <button type="button" id="toggle-ignore-roles-btn" role="switch" aria-checked="${cfg.ignore_any_role ? 'true' : 'false'}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${cfg.ignore_any_role ? 'bg-white' : 'bg-neutral-700'}">
                          <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${cfg.ignore_any_role ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-white'}"></span>
                        </button>
                      </div>
                    </div>

                    <!-- Count voice activity -->
                    <div class="flex items-center justify-between gap-3 min-h-[24px]">
                      <div>
                        <p class="text-xs font-medium text-white">Count voice activity</p>
                        <p class="text-[11px] text-neutral-500 leading-relaxed text-pretty mt-0.5">Members actively participating in voice channels are counted as active.</p>
                      </div>
                      <div class="flex items-center gap-3">
                        <button type="button" id="toggle-count-voice-btn" role="switch" aria-checked="${cfg.count_voice ? 'true' : 'false'}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${cfg.count_voice ? 'bg-white' : 'bg-neutral-700'}">
                          <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${cfg.count_voice ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-white'}"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 5. Card: Warning DM (Fully Unlocked, 100% Free, NO Starter/Pro Badge) -->
              <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div class="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800">
                  <div class="flex items-center gap-2.5">
                    <div class="p-1.5 rounded-lg bg-orange-500/10 shrink-0">
                      <span class="w-4 h-4 text-orange-400 flex items-center justify-center">${SVGS.messageSquare}</span>
                    </div>
                    <span class="text-sm font-semibold text-white">Warning DM</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <button type="button" id="toggle-dm-warning-btn" role="switch" aria-checked="${cfg.dm_warning_enabled ? 'true' : 'false'}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${cfg.dm_warning_enabled ? 'bg-white' : 'bg-neutral-700'}">
                      <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${cfg.dm_warning_enabled ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-white'}"></span>
                    </button>
                  </div>
                </div>

                <div class="p-5 space-y-4">
                  <!-- Warn before dropdown -->
                  <div>
                    <label class="text-xs text-neutral-400 block mb-2">Warn before</label>
                    <div class="max-w-xs relative" id="dropdown-hours-container">
                      <button type="button" id="dropdown-hours-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                        <span class="min-w-0 truncate text-sm text-white" id="dropdown-hours-label">${cfg.warn_before_hours} hours before</span>
                        <span class="w-4 h-4 text-neutral-400 transition-transform duration-200" id="dropdown-hours-chevron">${SVGS.chevronDown}</span>
                      </button>
                      <div id="dropdown-hours-menu" class="hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-30 py-1">
                        ${[12, 24, 48, 72].map(h => `
                          <button type="button" data-hours="${h}" class="w-full px-3 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-800 flex items-center justify-between transition-colors">
                            <span>${h} hours before</span>
                            ${cfg.warn_before_hours === h ? `<span class="text-amber-400">${SVGS.check}</span>` : ''}
                          </button>
                        `).join('')}
                      </div>
                    </div>
                  </div>

                  <!-- Warning Message Textarea with Token Buttons -->
                  <div>
                    <label class="text-xs text-neutral-400 block mb-2">Warning Message</label>
                    <div class="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors">
                      <textarea id="warning-message-textarea" rows="3" class="w-full resize-none focus:outline-none bg-transparent text-white text-[13px] leading-5 p-3.5 placeholder-neutral-500 font-mono" placeholder="Hey {user}! You've been inactive...">${esc(cfg.warning_message || '')}</textarea>
                    </div>

                    <!-- Token Pills & Char Count -->
                    <div class="flex items-center justify-between gap-2 mt-2.5">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <button type="button" data-token="{user}" class="relative px-2.5 py-1.5 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer bg-indigo-500/20 text-[#c9cdfb] hover:bg-indigo-500/30">@user</button>
                        <button type="button" data-token="{server}" class="relative px-2.5 py-1.5 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer bg-green-500/20 text-green-300 hover:bg-green-500/30">@server</button>
                        <button type="button" data-token="{days}" class="relative px-2.5 py-1.5 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer bg-amber-500/20 text-amber-300 hover:bg-amber-500/30">@days</button>
                        <button type="button" data-token="{hours}" class="relative px-2.5 py-1.5 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer bg-rose-500/20 text-rose-300 hover:bg-rose-500/30">@hours</button>
                      </div>
                      <span id="char-counter" class="text-[11px] tabular-nums shrink-0 text-neutral-500">${(cfg.warning_message || '').length}/1000</span>
                    </div>

                    <div class="mt-2.5 flex items-center gap-1.5">
                      <span class="text-[10px] text-neutral-500 italic">Auto-appended:</span>
                      <span class="text-[10px] text-neutral-400 font-mono">-# Sent from ${esc(serverName)}</span>
                    </div>
                  </div>

                  <!-- Live Preview -->
                  <div>
                    <label class="text-[10px] text-neutral-500 block mb-2 font-medium">Preview</label>
                    <div class="rounded-xl overflow-hidden border border-neutral-700/40">
                      <!-- DM Header -->
                      <div class="bg-[#2f3136] px-4 py-2 flex items-center gap-2">
                        <span class="w-3.5 h-3.5 text-neutral-400 flex items-center justify-center">${SVGS.mail}</span>
                        <span class="text-xs font-semibold text-white">Direct Message</span>
                      </div>
                      <!-- DM Body -->
                      <div class="bg-[#313338] px-4 pt-3 pb-4 space-y-2.5">
                        <div class="flex gap-2.5">
                          <img src="/logo.png" alt="Orbit Bot" class="w-8 h-8 rounded-full flex-shrink-0 object-cover mt-0.5 border border-white/10" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5 mb-0.5 min-w-0">
                              <span class="text-xs font-semibold text-indigo-400 whitespace-nowrap">Orbit</span>
                              <span class="inline-flex flex-shrink-0 items-center gap-[0.15em] px-1 py-px text-[10px] font-bold bg-[#5865F2] text-white rounded leading-none">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="h-[0.85em] w-[0.85em]"><path d="M20 6 9 17l-5-5"></path></svg>
                                APP
                              </span>
                              <span class="text-xs text-neutral-500 truncate">Today at 5:30 PM</span>
                            </div>
                            <p id="preview-message-body" class="text-sm text-[#dbdee1] leading-relaxed text-pretty break-words"></p>
                            <p class="text-[11px] text-[#72767d] mt-2 leading-relaxed">Sent from ${esc(serverName)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    `;

    updateLivePreview();
    bindEvents();
  }

  function updateLivePreview() {
    const previewEl = container.querySelector('#preview-message-body');
    if (!previewEl) return;
    const raw = cfg.warning_message || '';
    const formatted = raw
      .replace(/{user}|@user/g, '@YourName')
      .replace(/{server}|@server/g, serverName)
      .replace(/{days}|@days/g, String(cfg.days || 30))
      .replace(/{hours}|@hours/g, String(cfg.warn_before_hours || 24));
    
    // Convert basic markdown like **text** to bold
    const boldParsed = esc(formatted).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    previewEl.innerHTML = boldParsed;
  }

  function updateSummaryBanner() {
    const daysEl = container.querySelector('#summary-days');
    const hoursEl = container.querySelector('#summary-hours');
    const actionEl = container.querySelector('#summary-action');
    const dmBoxEl = container.querySelector('#summary-dm-box');

    if (daysEl) daysEl.textContent = `${cfg.days} days inactive`;
    if (hoursEl) {
      hoursEl.textContent = cfg.dm_warning_enabled ? `DM warning (${cfg.warn_before_hours}h before)` : 'No warning DM';
    }
    if (actionEl) actionEl.textContent = getActionLabel(cfg.action);
    if (dmBoxEl) {
      if (cfg.dm_warning_enabled) {
        dmBoxEl.className = 'flex items-center gap-2 rounded-lg px-3 py-2 border transition-all bg-orange-500/10 border-orange-500/15';
        dmBoxEl.querySelector('span')?.classList.remove('text-neutral-400');
        dmBoxEl.querySelector('span')?.classList.add('text-orange-400');
        hoursEl?.classList.remove('text-neutral-400');
        hoursEl?.classList.add('text-orange-300');
      } else {
        dmBoxEl.className = 'flex items-center gap-2 rounded-lg px-3 py-2 border transition-all bg-neutral-800/40 border-neutral-700/30 opacity-60';
        dmBoxEl.querySelector('span')?.classList.remove('text-orange-400');
        dmBoxEl.querySelector('span')?.classList.add('text-neutral-400');
        hoursEl?.classList.remove('text-orange-300');
        hoursEl?.classList.add('text-neutral-400');
      }
    }
  }

  function bindEvents() {
    // 1. Master Toggle
    const masterBtn = container.querySelector('#master-toggle-btn');
    const masterLabel = container.querySelector('#master-toggle-label');
    if (masterBtn) {
      masterBtn.onclick = () => {
        cfg.enabled = !cfg.enabled;
        masterBtn.setAttribute('aria-checked', cfg.enabled ? 'true' : 'false');
        masterBtn.setAttribute('aria-label', cfg.enabled ? 'Enabled' : 'Disabled');
        masterBtn.className = `relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${cfg.enabled ? 'bg-white' : 'bg-neutral-700'}`;
        const pill = masterBtn.querySelector('span');
        if (pill) {
          pill.className = `pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${cfg.enabled ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-white'}`;
        }
        if (masterLabel) {
          masterLabel.textContent = cfg.enabled ? 'Enabled' : 'Disabled';
          masterLabel.className = `text-sm font-medium whitespace-nowrap ${cfg.enabled ? 'text-white' : 'text-neutral-500'}`;
        }
      };
    }

    // 2. Inactive Days Input
    const daysInput = container.querySelector('#input-days');
    if (daysInput) {
      daysInput.oninput = (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 365) val = 365;
        cfg.days = val;
        updateSummaryBanner();
        updateLivePreview();
      };
    }

    // 3. Action Dropdown
    const actionBtn = container.querySelector('#dropdown-action-btn');
    const actionMenu = container.querySelector('#dropdown-action-menu');
    const actionLabel = container.querySelector('#dropdown-action-label');
    if (actionBtn && actionMenu) {
      actionBtn.onclick = (e) => {
        e.stopPropagation();
        actionMenu.classList.toggle('hidden');
      };
      actionMenu.querySelectorAll('[data-action]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          cfg.action = btn.getAttribute('data-action');
          if (actionLabel) actionLabel.textContent = getActionLabel(cfg.action);
          actionMenu.classList.add('hidden');
          updateSummaryBanner();
          renderView();
        };
      });
    }

    // 4. Server Size Dropdown
    const sizeBtn = container.querySelector('#dropdown-serversize-btn');
    const sizeMenu = container.querySelector('#dropdown-serversize-menu');
    const sizeLabel = container.querySelector('#dropdown-serversize-label');
    if (sizeBtn && sizeMenu) {
      sizeBtn.onclick = (e) => {
        e.stopPropagation();
        sizeMenu.classList.toggle('hidden');
      };
      sizeMenu.querySelectorAll('[data-size]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          cfg.min_server_size = parseInt(btn.getAttribute('data-size')) || 0;
          if (sizeLabel) sizeLabel.textContent = cfg.min_server_size > 0 ? `${cfg.min_server_size} members` : 'None (No minimum)';
          sizeMenu.classList.add('hidden');
          renderView();
        };
      });
    }

    // 5. Channel Dropdown & Search
    const chBtn = container.querySelector('#dropdown-channel-btn');
    const chMenu = container.querySelector('#dropdown-channel-menu');
    const chLabel = container.querySelector('#dropdown-channel-label');
    const chSearch = container.querySelector('#channel-search-input');
    const clearChBtn = container.querySelector('#clear-channel-btn');

    if (clearChBtn) {
      clearChBtn.onclick = (e) => {
        e.stopPropagation();
        cfg.log_channel_id = null;
        renderView();
      };
    }

    if (chBtn && chMenu) {
      chBtn.onclick = (e) => {
        e.stopPropagation();
        chMenu.classList.toggle('hidden');
        if (!chMenu.classList.contains('hidden') && chSearch) {
          chSearch.focus();
        }
      };
      if (chSearch) {
        chSearch.oninput = (e) => {
          const q = e.target.value.toLowerCase().trim();
          chMenu.querySelectorAll('[data-channel-id]').forEach(opt => {
            const text = opt.textContent.toLowerCase();
            opt.style.display = text.includes(q) ? 'flex' : 'none';
          });
        };
      }
      chMenu.querySelectorAll('[data-channel-id]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const cid = btn.getAttribute('data-channel-id');
          cfg.log_channel_id = cid ? cid : null;
          chMenu.classList.add('hidden');
          renderView();
        };
      });
    }

    // 6. Historical Tracking Toggle
    const histBtn = container.querySelector('#toggle-historical-btn');
    if (histBtn) {
      histBtn.onclick = () => {
        cfg.historical_tracking = !cfg.historical_tracking;
        histBtn.setAttribute('aria-checked', cfg.historical_tracking ? 'true' : 'false');
        histBtn.className = `relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${cfg.historical_tracking ? 'bg-white' : 'bg-neutral-700'}`;
        const pill = histBtn.querySelector('span');
        if (pill) {
          pill.className = `pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${cfg.historical_tracking ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-white'}`;
        }
      };
    }

    // 7. Exempt Roles Dropdown
    const rolesBtn = container.querySelector('#dropdown-roles-btn');
    const rolesMenu = container.querySelector('#dropdown-roles-menu');
    const rolesSearch = container.querySelector('#role-search-input');

    if (rolesBtn && rolesMenu) {
      rolesBtn.onclick = (e) => {
        if (e.target.closest('[data-remove-role]')) return;
        e.stopPropagation();
        rolesMenu.classList.toggle('hidden');
        if (!rolesMenu.classList.contains('hidden') && rolesSearch) {
          rolesSearch.focus();
        }
      };

      if (rolesSearch) {
        rolesSearch.oninput = (e) => {
          const q = e.target.value.toLowerCase().trim();
          rolesMenu.querySelectorAll('[data-role-toggle]').forEach(opt => {
            const text = opt.textContent.toLowerCase();
            opt.style.display = text.includes(q) ? 'flex' : 'none';
          });
        };
      }

      rolesMenu.querySelectorAll('[data-role-toggle]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const rid = String(btn.getAttribute('data-role-toggle'));
          if (cfg.exempt_roles.includes(rid)) {
            cfg.exempt_roles = cfg.exempt_roles.filter(id => id !== rid);
          } else {
            cfg.exempt_roles.push(rid);
          }
          renderView();
        };
      });
    }

    // Remove single role tag
    container.querySelectorAll('[data-remove-role]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const rid = String(btn.getAttribute('data-remove-role'));
        cfg.exempt_roles = cfg.exempt_roles.filter(id => id !== rid);
        renderView();
      };
    });

    // 8. Ignore Any Role Toggle
    const ignoreRolesBtn = container.querySelector('#toggle-ignore-roles-btn');
    if (ignoreRolesBtn) {
      ignoreRolesBtn.onclick = () => {
        cfg.ignore_any_role = !cfg.ignore_any_role;
        ignoreRolesBtn.setAttribute('aria-checked', cfg.ignore_any_role ? 'true' : 'false');
        ignoreRolesBtn.className = `relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${cfg.ignore_any_role ? 'bg-white' : 'bg-neutral-700'}`;
        const pill = ignoreRolesBtn.querySelector('span');
        if (pill) {
          pill.className = `pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${cfg.ignore_any_role ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-white'}`;
        }
      };
    }

    // 9. Count Voice Activity Toggle
    const countVoiceBtn = container.querySelector('#toggle-count-voice-btn');
    if (countVoiceBtn) {
      countVoiceBtn.onclick = () => {
        cfg.count_voice = !cfg.count_voice;
        countVoiceBtn.setAttribute('aria-checked', cfg.count_voice ? 'true' : 'false');
        countVoiceBtn.className = `relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${cfg.count_voice ? 'bg-white' : 'bg-neutral-700'}`;
        const pill = countVoiceBtn.querySelector('span');
        if (pill) {
          pill.className = `pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${cfg.count_voice ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-white'}`;
        }
      };
    }

    // 10. DM Warning Toggle
    const dmWarningBtn = container.querySelector('#toggle-dm-warning-btn');
    if (dmWarningBtn) {
      dmWarningBtn.onclick = () => {
        cfg.dm_warning_enabled = !cfg.dm_warning_enabled;
        dmWarningBtn.setAttribute('aria-checked', cfg.dm_warning_enabled ? 'true' : 'false');
        dmWarningBtn.className = `relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${cfg.dm_warning_enabled ? 'bg-white' : 'bg-neutral-700'}`;
        const pill = dmWarningBtn.querySelector('span');
        if (pill) {
          pill.className = `pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${cfg.dm_warning_enabled ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-white'}`;
        }
        updateSummaryBanner();
      };
    }

    // 11. Warn Before Hours Dropdown
    const hoursBtn = container.querySelector('#dropdown-hours-btn');
    const hoursMenu = container.querySelector('#dropdown-hours-menu');
    const hoursLabel = container.querySelector('#dropdown-hours-label');
    if (hoursBtn && hoursMenu) {
      hoursBtn.onclick = (e) => {
        e.stopPropagation();
        hoursMenu.classList.toggle('hidden');
      };
      hoursMenu.querySelectorAll('[data-hours]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          cfg.warn_before_hours = parseInt(btn.getAttribute('data-hours')) || 24;
          if (hoursLabel) hoursLabel.textContent = `${cfg.warn_before_hours} hours before`;
          hoursMenu.classList.add('hidden');
          updateSummaryBanner();
          updateLivePreview();
          renderView();
        };
      });
    }

    // 12. Warning Message Textarea & Token Insertion
    const textarea = container.querySelector('#warning-message-textarea');
    const charCounter = container.querySelector('#char-counter');
    if (textarea) {
      textarea.oninput = (e) => {
        cfg.warning_message = e.target.value;
        if (charCounter) charCounter.textContent = `${cfg.warning_message.length}/1000`;
        updateLivePreview();
      };
    }

    container.querySelectorAll('[data-token]').forEach(btn => {
      btn.onclick = () => {
        const token = btn.getAttribute('data-token');
        if (!textarea) return;
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const current = textarea.value;
        const updated = current.slice(0, start) + token + current.slice(end);
        textarea.value = updated;
        cfg.warning_message = updated;
        textarea.selectionStart = textarea.selectionEnd = start + token.length;
        textarea.focus();
        if (charCounter) charCounter.textContent = `${updated.length}/1000`;
        updateLivePreview();
      };
    });

    // Close open dropdowns on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#dropdown-action-container') && actionMenu) actionMenu.classList.add('hidden');
      if (!e.target.closest('#dropdown-serversize-container') && sizeMenu) sizeMenu.classList.add('hidden');
      if (!e.target.closest('#dropdown-channel-container') && chMenu) chMenu.classList.add('hidden');
      if (!e.target.closest('#dropdown-roles-container') && rolesMenu) rolesMenu.classList.add('hidden');
      if (!e.target.closest('#dropdown-hours-container') && hoursMenu) hoursMenu.classList.add('hidden');
    });

    // 13. Save Changes Button
    const saveBtn = container.querySelector('#save-inactivekick-btn');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const origContent = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = `
          <svg class="animate-spin w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Saving...</span>
        `;

        try {
          await API.saveConfig(guildId, { inactive_kick: cfg });
          if (window.Toast && Toast.success) {
            Toast.success('Idle Kick settings saved successfully!');
          }
        } catch (err) {
          console.error('[InactiveKick] Save error:', err);
          if (window.Toast && Toast.error) {
            Toast.error('Failed to save settings: ' + (err.message || 'Unknown error'));
          }
        } finally {
          saveBtn.disabled = false;
          saveBtn.innerHTML = origContent;
        }
      };
    }
  }

  renderView();
};

window.renderInactiveKickModule = function (el, guildId, cfg) {
  return DashboardTabs.InactiveKick(el, guildId);
};
