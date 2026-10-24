/**
 * Orbit Dashboard - Ban Appeals Tab (/dashboard/:guildId/appeals)
 * Modern PeakBot-styled Appeal Management Suite with In-Place Reactive Updates
 */

(function () {
  'use strict';

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const SVGS = {
    scale: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scale"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>`,
    externalLink: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"></path></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"></path></svg>`,
    inbox: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-inbox"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`,
    history: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-history"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path></svg>`,
    refresh: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
  };

  function renderCustomToggle(id, isChecked, ariaLabel = 'Toggle setting') {
    return `
      <button 
        type="button" 
        role="switch" 
        aria-checked="${isChecked ? 'true' : 'false'}" 
        aria-label="${escapeHtml(ariaLabel)}"
        id="${escapeHtml(id)}"
        class="custom-toggle-btn inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-neutral-700/80 transition-colors duration-200 ease-in-out focus:outline-none ${isChecked ? 'bg-indigo-600' : 'bg-neutral-800'}"
      >
        <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-6' : 'translate-x-1'}"></span>
      </button>
    `;
  }

  function updateToggleDOM(toggleEl, isChecked) {
    if (!toggleEl) return;
    toggleEl.setAttribute('aria-checked', isChecked ? 'true' : 'false');
    toggleEl.className = `custom-toggle-btn inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-neutral-700/80 transition-colors duration-200 ease-in-out focus:outline-none ${isChecked ? 'bg-indigo-600' : 'bg-neutral-800'}`;
    const dot = toggleEl.querySelector('span');
    if (dot) {
      dot.className = `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-6' : 'translate-x-1'}`;
    }
  }

  DashboardTabs.Appeals = async function (container, guildId) {
    let roles = [];
    let textChannels = [];
    let cfg = {
      enabled: false,
      custom_url: 'orbit',
      channel_id: null,
      mod_roles: [],
      allowed_punishments: ['ban', 'timeout'],
      mention_mods: false,
      cooldown_days: 3,
      multiple_submissions: false,
      anonymous_mods: false,
      invite_unbanned: true,
      custom_questions: [
        { id: 'q_why', label: 'Why was the sanction issued?', placeholder: 'Explain what happened...', required: true },
        { id: 'q_lift', label: 'Why should the staff team reconsider and lift your punishment?', placeholder: 'Provide reasons or remorse...', required: true }
      ]
    };
    let openAppeals = [];
    let appealsHistory = [];
    let activeTab = 'queue'; // 'queue' | 'history'

    // Fetch Initial Data
    try {
      const [guildConfig, appealsCfgRes, recentAppeals, historyRes] = await Promise.all([
        API.getConfig(guildId).catch(() => ({})),
        API.getAppealsConfig(guildId).catch(() => null),
        API.request(`/api/server/${guildId}/appeals`).catch(() => []),
        API.request(`/api/server/${guildId}/appeals/history`).catch(() => [])
      ]);

      roles = Array.isArray(guildConfig?.roles) ? guildConfig.roles : [];
      const allChannels = Array.isArray(guildConfig?.channels) ? guildConfig.channels : [];
      textChannels = allChannels.filter(c => c && (c.type === 0 || c.type === 'text' || !c.type));

      if (appealsCfgRes && appealsCfgRes.config) {
        cfg = { ...cfg, ...appealsCfgRes.config };
      } else if (guildConfig?.appeals) {
        cfg = { ...cfg, ...guildConfig.appeals };
      }
      if (!Array.isArray(cfg.custom_questions) || cfg.custom_questions.length === 0) {
        cfg.custom_questions = [
          { id: 'q_why', label: 'Why was the sanction issued?', placeholder: 'Explain what happened...', required: true },
          { id: 'q_lift', label: 'Why should the staff team reconsider and lift your punishment?', placeholder: 'Provide reasons or remorse...', required: true }
        ];
      }
      openAppeals = Array.isArray(recentAppeals) ? recentAppeals : (recentAppeals?.appeals || []);
      appealsHistory = Array.isArray(historyRes) ? historyRes : (historyRes?.history || []);
    } catch (err) {
      console.error('[Appeals] Error loading initial data:', err);
    }

    // Save helper
    async function saveAppealsSettings() {
      const payload = {
        enabled: cfg.enabled,
        custom_url: cfg.custom_url || 'orbit',
        channel_id: cfg.channel_id,
        mod_roles: cfg.mod_roles || [],
        allowed_punishments: cfg.allowed_punishments || ['ban', 'timeout'],
        mention_mods: cfg.mention_mods,
        cooldown_days: cfg.cooldown_days,
        multiple_submissions: cfg.multiple_submissions,
        anonymous_mods: cfg.anonymous_mods,
        invite_unbanned: cfg.invite_unbanned,
        custom_questions: cfg.custom_questions
      };
      const res = await API.saveAppealsConfig(guildId, payload);
      if (res && res.config) {
        cfg = { ...cfg, ...res.config };
      }
      return res;
    }

    if (window.AutoSave) AutoSave.register(saveAppealsSettings);

    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
    const portalUrl = `${origin}/appeal/${encodeURIComponent(cfg.custom_url || 'orbit')}`;

    function getSelectedChannelName() {
      const found = textChannels.find(c => String(c.id) === String(cfg.channel_id));
      return found ? found.name : 'Select staff review channel...';
    }

    // Render Initial Static Skeleton
    container.innerHTML = `
      <div class="space-y-6 pb-24 max-w-5xl mx-auto">
        <!-- Top Bar / Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Moderation Suite</span>
              <span class="text-xs text-neutral-500">•</span>
              <span class="text-xs text-neutral-400">Pardon & Review System</span>
            </div>
            <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight">Ban Appeals System</h1>
            <p class="text-xs text-neutral-400 mt-1">Self-service pardon portal, form builder, and interactive review queue for sanctioned members.</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <a href="${portalUrl}" target="_blank" id="btn-preview-portal" class="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 border border-neutral-700/60">
              ${SVGS.externalLink}
              <span>Preview Portal</span>
            </a>
          </div>
        </div>

        <!-- Master Switch Card -->
        <div class="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              ${SVGS.scale}
            </div>
            <div>
              <div class="flex items-center gap-2.5">
                <span class="text-sm font-semibold text-white">Enable Appeals Portal</span>
                <span id="badge-portal-status" class="px-2 py-0.5 rounded text-[10px] font-semibold ${cfg.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}">${cfg.enabled ? 'ACTIVE' : 'DISABLED'}</span>
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">Allow banned and sanctioned users to access your public appeal portal and request pardons.</p>
            </div>
          </div>
          <div>
            ${renderCustomToggle('toggle-appeals-enabled', cfg.enabled, 'Toggle appeals portal')}
          </div>
        </div>

        <!-- Vanity Portal URL Card -->
        <div class="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-3.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-sm font-semibold text-white">Vanity Portal Address</span>
              <span class="text-xs text-neutral-500 font-mono">/appeal/:slug</span>
            </div>
            <button type="button" id="btn-copy-portal-link" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
              ${SVGS.copy}
              <span id="copy-text">Copy Link</span>
            </button>
          </div>
          <p class="text-xs text-neutral-400">Direct address provided to members in ban DM notifications or server rules.</p>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div class="flex-1 flex items-center rounded-xl bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus-within:border-indigo-500/80 transition-colors overflow-hidden">
              <span class="px-3.5 py-2.5 bg-neutral-800/80 border-r border-neutral-700 text-xs text-neutral-400 font-mono select-none">${origin}/appeal/</span>
              <input type="text" id="inp-custom-url" value="${escapeHtml(cfg.custom_url || '')}" placeholder="orbit" class="flex-1 px-3 py-2 bg-transparent text-white text-xs font-mono focus:outline-none">
            </div>
            <a href="${portalUrl}" target="_blank" id="btn-open-portal" class="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-700 transition-colors shrink-0">
              ${SVGS.externalLink}
              <span>Open Portal</span>
            </a>
          </div>
        </div>

        <!-- Staff Routing & Review Configuration -->
        <div class="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-5">
          <div class="border-b border-neutral-800 pb-3.5">
            <h3 class="text-sm font-semibold text-white">Staff Routing & Review Team</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Configure where submissions are sent and which roles are authorized to review them.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Staff Channel Dropdown -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-neutral-300">Staff Review Channel</label>
              <p class="text-[11px] text-neutral-400 mb-1">Orbit posts an interactive appeal embed with Accept/Deny buttons to this channel.</p>
              
              <div class="relative w-full custom-channel-dd">
                <button type="button" id="channel-dd-trigger" class="custom-channel-trigger w-full flex items-center justify-between gap-2 h-10 px-3.5 bg-neutral-800 border rounded-xl text-left text-xs transition-all border-neutral-700 hover:border-neutral-600 cursor-pointer">
                  <span id="selected-channel-display" class="truncate text-neutral-200">
                    ${cfg.channel_id ? `# ${escapeHtml(getSelectedChannelName())}` : '<span class="text-neutral-500">Select review channel...</span>'}
                  </span>
                  <span class="text-neutral-400 shrink-0">${SVGS.chevronDown}</span>
                </button>
                <div id="channel-dd-menu" class="custom-channel-menu hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-40 overflow-hidden max-h-60 flex flex-col">
                  <div class="p-2 border-b border-neutral-800 sticky top-0 bg-neutral-900 shrink-0">
                    <input type="text" id="channel-dd-search" placeholder="Search channels..." class="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none" autocomplete="off">
                  </div>
                  <div id="channel-dd-options" class="overflow-y-auto p-1 space-y-0.5 scrollbar-thin">
                    <button type="button" data-channel-id="" data-channel-name="" class="dd-item w-full flex items-center px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-left cursor-pointer">
                      None (Disabled)
                    </button>
                    ${textChannels.map(ch => `
                      <button type="button" data-channel-id="${ch.id}" data-channel-name="${escapeHtml(ch.name)}" class="dd-item w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-200 hover:text-white hover:bg-neutral-800 transition-colors text-left cursor-pointer ${String(ch.id) === String(cfg.channel_id) ? 'bg-neutral-800/80 text-white font-medium' : ''}">
                        <span class="truncate"># ${escapeHtml(ch.name)}</span>
                        ${String(ch.id) === String(cfg.channel_id) ? `<span class="text-emerald-400 shrink-0">${SVGS.check}</span>` : ''}
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Notify Reviewers Switch Card -->
            <div class="flex items-center justify-between p-3.5 px-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 self-end h-[68px]">
              <div>
                <span class="text-xs font-medium text-white">Notify Review Roles</span>
                <p class="text-[11px] text-neutral-400 mt-0.5">Ping authorized reviewer roles whenever a new appeal is submitted.</p>
              </div>
              <div>
                ${renderCustomToggle('toggle-mention-mods', cfg.mention_mods, 'Mention mod roles')}
              </div>
            </div>
          </div>

          <!-- Moderator Roles Multi-Select (Orbit Custom Dropdown) -->
          <div class="flex flex-col gap-2 pt-1">
            <div class="flex items-center justify-between">
              <label class="text-xs font-medium text-neutral-300">Moderator Review Roles</label>
              <span class="text-[11px] text-neutral-500 font-mono" id="review-roles-count">${(cfg.mod_roles || []).length} selected</span>
            </div>
            <p class="text-[11px] text-neutral-400">Roles permitted to approve or decline ban appeals both in the dashboard and Discord.</p>
            
            <div class="relative w-full" id="review-roles-dd-wrap">
              <button 
                type="button" 
                id="review-roles-trigger" 
                class="w-full flex items-center justify-between gap-2 min-h-[44px] px-3.5 py-2 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-left transition-all cursor-pointer focus:outline-none"
              >
                <div class="flex-1 flex flex-wrap gap-1.5 py-0.5 items-center" id="review-roles-chips">
                  <!-- Dynamically populated chips -->
                </div>
                <div class="flex items-center gap-1.5 text-neutral-400 shrink-0">
                  <span id="review-roles-arrow" class="transition-transform duration-200">${SVGS.chevronDown}</span>
                </div>
              </button>

              <div 
                id="review-roles-menu" 
                class="orbit-dropdown-menu hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] overflow-hidden max-h-60 flex flex-col"
                data-lenis-prevent
              >
                <div class="p-2 border-b border-neutral-800 shrink-0">
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">${SVGS.search}</span>
                    <input 
                      type="text" 
                      id="review-roles-search" 
                      placeholder="Search roles..." 
                      class="w-full pl-8 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500" 
                      autocomplete="off"
                    />
                  </div>
                </div>
                <div id="review-roles-options" class="overflow-y-auto p-1 space-y-0.5 scrollbar-thin">
                  <!-- Dynamically populated options -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Appeals Policy & Automation Card -->
        <div class="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-5">
          <div class="border-b border-neutral-800 pb-3.5">
            <h3 class="text-sm font-semibold text-white">Appeals Policy & Automation</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Control which sanction categories are appealable and the behavior when an appeal is accepted.</p>
          </div>

          <!-- Sanction Types Allowed to Appeal (Sleek Compact Pills) -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-medium text-neutral-300">Sanction Types Allowed to Appeal</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="punishment-cards-grid">
              ${[
                { id: 'ban', label: 'Bans' },
                { id: 'timeout', label: 'Timeouts' },
                { id: 'kick', label: 'Kicks' },
                { id: 'warn', label: 'Warnings' }
              ].map(p => {
                const isChecked = (cfg.allowed_punishments || []).includes(p.id);
                return `
                  <button 
                    type="button" 
                    class="punishment-toggle-card flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer select-none ${isChecked ? 'border-indigo-500/80 bg-indigo-500/10 text-white font-medium' : 'border-neutral-700/60 bg-neutral-800/40 text-neutral-300 hover:border-neutral-600 hover:text-white'}"
                    data-punishment="${p.id}"
                  >
                    <span class="text-xs">${p.label}</span>
                    <span class="check-box w-4 h-4 rounded flex items-center justify-center transition-colors ${isChecked ? 'bg-indigo-600 border border-indigo-600 text-white' : 'border-neutral-600 bg-neutral-800'}">
                      ${isChecked ? SVGS.check : ''}
                    </span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Policy Settings List (Clean, Slim Rows with Custom Orbit Select) -->
          <div class="divide-y divide-neutral-800/80 rounded-xl border border-neutral-700/60 bg-neutral-800/30 overflow-hidden">
            <!-- Auto-Invite Unbanned -->
            <div class="flex items-center justify-between p-3.5 px-4 hover:bg-neutral-800/40 transition-colors gap-4">
              <div class="flex-1 min-w-0 pr-2">
                <span class="text-xs font-medium text-white block">Auto-Invite Accepted Bans</span>
                <p class="text-[11px] text-neutral-400 mt-0.5">Send a one-time server invite DM when a ban appeal is approved.</p>
              </div>
              <div class="shrink-0">
                ${renderCustomToggle('toggle-invite-unbanned', cfg.invite_unbanned !== false, 'Auto-invite unbanned')}
              </div>
            </div>

            <!-- Anonymous Moderation -->
            <div class="flex items-center justify-between p-3.5 px-4 hover:bg-neutral-800/40 transition-colors gap-4">
              <div class="flex-1 min-w-0 pr-2">
                <span class="text-xs font-medium text-white block">Anonymous Moderator Decisions</span>
                <p class="text-[11px] text-neutral-400 mt-0.5">Conceal the deciding moderator's name from the appellant.</p>
              </div>
              <div class="shrink-0">
                ${renderCustomToggle('toggle-anon-mods', cfg.anonymous_mods, 'Anonymous decisions')}
              </div>
            </div>

            <!-- Allow Repeat Appeals -->
            <div class="flex items-center justify-between p-3.5 px-4 hover:bg-neutral-800/40 transition-colors gap-4">
              <div class="flex-1 min-w-0 pr-2">
                <span class="text-xs font-medium text-white block">Allow Repeat Appeals</span>
                <p class="text-[11px] text-neutral-400 mt-0.5">Allow users whose appeal was denied to re-apply once cooldown passes.</p>
              </div>
              <div class="shrink-0">
                ${renderCustomToggle('toggle-repeat-appeals', cfg.multiple_submissions, 'Allow repeat appeals')}
              </div>
            </div>

            <!-- Cooldown Days (Orbit Custom Single-Select Dropdown) -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 px-4 hover:bg-neutral-800/40 transition-colors gap-3">
              <div class="flex-1 min-w-0 pr-2">
                <span class="text-xs font-medium text-white block">Re-Application Cooldown</span>
                <p class="text-[11px] text-neutral-400 mt-0.5">Wait period before a denied appellant can submit another request.</p>
              </div>
              <div class="relative w-full sm:w-48 shrink-0" id="cooldown-dd-wrap">
                <button 
                  type="button" 
                  id="cooldown-dd-trigger" 
                  class="w-full flex items-center justify-between gap-2 h-10 px-3.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-left text-xs transition-colors cursor-pointer focus:outline-none"
                >
                  <span id="cooldown-dd-label" class="text-neutral-200 font-medium truncate">
                    ${getCooldownLabel(cfg.cooldown_days)}
                  </span>
                  <span id="cooldown-dd-arrow" class="text-neutral-400 shrink-0 transition-transform duration-200">${SVGS.chevronDown}</span>
                </button>
                <div 
                  id="cooldown-dd-menu" 
                  class="orbit-dropdown-menu hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] overflow-hidden flex flex-col p-1 space-y-0.5"
                  data-lenis-prevent
                >
                  <!-- Rendered dynamically -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Questionnaire / Form Builder -->
        <div class="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-4">
          <div class="flex items-center justify-between border-b border-neutral-800 pb-3.5">
            <div>
              <h3 class="text-sm font-semibold text-white">Appeals Questionnaire Builder</h3>
              <p class="text-xs text-neutral-400 mt-0.5">Configure the questions shown to appellants on your public portal.</p>
            </div>
            <button type="button" id="btn-add-question" class="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700/60">
              ${SVGS.plus}
              <span>Add Question</span>
            </button>
          </div>

          <!-- New Question Form (Hidden by default) -->
          <div id="new-question-box" class="hidden p-3.5 rounded-xl bg-neutral-800/50 border border-neutral-700/60 flex flex-col gap-3">
            <span class="text-xs font-semibold text-white">New Question</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input type="text" id="inp-new-q-label" placeholder="Question prompt (e.g. Why should we unban you?)" class="px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600">
              <input type="text" id="inp-new-q-placeholder" placeholder="Placeholder hint..." class="px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600">
            </div>
            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                <input type="checkbox" id="chk-new-q-required" checked class="rounded bg-neutral-800 border-neutral-700 text-white">
                <span>Required field</span>
              </label>
              <div class="flex items-center gap-2">
                <button type="button" id="btn-cancel-new-q" class="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors cursor-pointer">Cancel</button>
                <button type="button" id="btn-confirm-new-q" class="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer">Save Question</button>
              </div>
            </div>
          </div>

          <!-- Questions List Container -->
          <div id="questions-list-container" class="flex flex-col gap-2.5">
            <!-- Dynamically populated -->
          </div>
        </div>

        <!-- Moderation Queue & Decision History -->
        <div class="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3.5">
            <div class="flex items-center gap-2">
              <button type="button" id="tab-btn-queue" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'queue' ? 'bg-white text-black shadow-sm' : 'bg-neutral-800/60 text-neutral-400 hover:text-white'}">
                ${SVGS.inbox}
                <span>Pending Queue</span>
                <span id="badge-queue-count" class="px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'queue' ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'}">${openAppeals.length}</span>
              </button>
              <button type="button" id="tab-btn-history" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'history' ? 'bg-white text-black shadow-sm' : 'bg-neutral-800/60 text-neutral-400 hover:text-white'}">
                ${SVGS.history}
                <span>Decision History</span>
                <span id="badge-history-count" class="px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'history' ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'}">${appealsHistory.length}</span>
              </button>
            </div>
            <button type="button" id="btn-refresh-queue" class="px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer">
              ${SVGS.refresh}
              <span>Refresh</span>
            </button>
          </div>

          <!-- Tab Content Area -->
          <div id="appeals-tab-content">
            <!-- Dynamically populated without full page reload -->
          </div>
        </div>
      </div>
    `;

    // Cooldown Options & Helpers
    const COOLDOWN_OPTIONS = [
      { value: 0, label: 'None (Immediate)' },
      { value: 1, label: '1 Day' },
      { value: 3, label: '3 Days' },
      { value: 7, label: '7 Days' },
      { value: 14, label: '14 Days' },
      { value: 30, label: '30 Days' }
    ];

    function getCooldownLabel(days) {
      const val = Number(days);
      const match = COOLDOWN_OPTIONS.find(o => o.value === val);
      return match ? match.label : `${val} Days`;
    }

    function renderCooldownOptions() {
      const menu = container.querySelector('#cooldown-dd-menu');
      const label = container.querySelector('#cooldown-dd-label');
      if (!menu) return;

      const currentVal = Number(cfg.cooldown_days || 0);
      if (label) label.textContent = getCooldownLabel(currentVal);

      menu.innerHTML = COOLDOWN_OPTIONS.map(opt => {
        const isSelected = currentVal === opt.value;
        return `
          <button 
            type="button" 
            data-value="${opt.value}" 
            class="cooldown-option-btn w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${isSelected ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}"
          >
            <span>${opt.label}</span>
            ${isSelected ? `<span class="text-emerald-400 shrink-0">${SVGS.check}</span>` : ''}
          </button>
        `;
      }).join('');

      menu.querySelectorAll('.cooldown-option-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const val = Number(btn.dataset.value);
          cfg.cooldown_days = val;
          renderCooldownOptions();
          menu.classList.add('hidden');
          const arrow = container.querySelector('#cooldown-dd-arrow');
          if (arrow) arrow.classList.remove('rotate-180');
          if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 350);
        };
      });
    }

    // Role Color Helper
    function getRoleColor(r) {
      if (!r || !r.color || r.color === 0 || r.color === '#000000') return '#818cf8';
      return typeof r.color === 'number' ? `#${r.color.toString(16).padStart(6, '0')}` : r.color;
    }

    // Custom Multi-Select Review Roles Rendering
    function renderReviewRolesChips() {
      const chipsContainer = container.querySelector('#review-roles-chips');
      const countEl = container.querySelector('#review-roles-count');
      if (!chipsContainer) return;

      const modRoles = cfg.mod_roles || [];
      if (countEl) countEl.textContent = `${modRoles.length} selected`;

      if (modRoles.length === 0) {
        chipsContainer.innerHTML = `
          <span class="text-xs text-neutral-500 flex items-center gap-1.5 select-none py-1">
            <span class="text-neutral-400 font-semibold">+</span>
            <span>Select moderator review roles...</span>
          </span>
        `;
        return;
      }

      chipsContainer.innerHTML = modRoles.map(rId => {
        const r = roles.find(x => String(x.id) === String(rId));
        const name = r ? r.name : `Role (${rId})`;
        const color = getRoleColor(r);
        return `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200">
            <span class="text-neutral-500">@</span>
            <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${color}"></span>
            <span class="truncate max-w-[140px]">${escapeHtml(name)}</span>
            <span role="button" tabindex="0" class="btn-remove-role text-neutral-400 hover:text-red-400 p-0.5 cursor-pointer transition-colors" data-role-id="${rId}" title="Remove role">${SVGS.x}</span>
          </span>
        `;
      }).join('');

      chipsContainer.querySelectorAll('.btn-remove-role').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const rid = btn.dataset.roleId;
          cfg.mod_roles = (cfg.mod_roles || []).filter(x => String(x) !== String(rid));
          renderReviewRolesChips();
          renderReviewRolesOptions(container.querySelector('#review-roles-search')?.value || '');
          if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 350);
        };
      });
    }

    function renderReviewRolesOptions(filterQuery = '') {
      const optionsContainer = container.querySelector('#review-roles-options');
      if (!optionsContainer) return;

      const query = (filterQuery || '').toLowerCase().trim();
      const assignableRoles = roles.filter(r => r && r.name !== '@everyone');
      const filtered = assignableRoles.filter(r => !query || r.name.toLowerCase().includes(query));

      if (filtered.length === 0) {
        optionsContainer.innerHTML = `
          <div class="p-3 text-xs text-neutral-500 text-center select-none">No roles found</div>
        `;
        return;
      }

      const modRoles = (cfg.mod_roles || []).map(String);
      optionsContainer.innerHTML = filtered.map(r => {
        const isSelected = modRoles.includes(String(r.id));
        const color = getRoleColor(r);
        return `
          <button 
            type="button" 
            data-role-id="${r.id}" 
            class="role-option-btn w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${isSelected ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}"
          >
            <span class="flex items-center gap-2 truncate">
              <span class="text-neutral-500">@</span>
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${color}"></span>
              <span class="truncate">${escapeHtml(r.name)}</span>
            </span>
            ${isSelected ? `<span class="text-emerald-400 shrink-0">${SVGS.check}</span>` : ''}
          </button>
        `;
      }).join('');

      optionsContainer.querySelectorAll('.role-option-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const rid = String(btn.dataset.roleId);
          if (!cfg.mod_roles) cfg.mod_roles = [];
          if (cfg.mod_roles.map(String).includes(rid)) {
            cfg.mod_roles = cfg.mod_roles.filter(x => String(x) !== rid);
          } else {
            cfg.mod_roles.push(rid);
          }
          renderReviewRolesChips();
          renderReviewRolesOptions(container.querySelector('#review-roles-search')?.value || '');
          if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 350);
        };
      });
    }

    // In-Place Questions Rendering
    function renderQuestionsList() {
      const qList = container.querySelector('#questions-list-container');
      if (!qList) return;
      if (!cfg.custom_questions || cfg.custom_questions.length === 0) {
        qList.innerHTML = `<p class="text-xs text-neutral-500 py-3 text-center">No questions added yet. Click "Add Question" above to customize your form.</p>`;
        return;
      }
      qList.innerHTML = cfg.custom_questions.map((q, idx) => `
        <div class="p-3 px-3.5 rounded-xl bg-neutral-800/40 border border-neutral-700/60 flex items-center justify-between gap-3 group hover:border-neutral-600 transition-all" data-q-id="${q.id}">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <span class="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-700 text-[11px] font-bold text-neutral-400 flex items-center justify-center shrink-0">Q${idx + 1}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-xs font-semibold text-white truncate">${escapeHtml(q.label)}</p>
                ${q.required ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Required</span>' : '<span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-neutral-900 text-neutral-500">Optional</span>'}
              </div>
              <p class="text-[11px] text-neutral-400 truncate mt-0.5">${escapeHtml(q.placeholder || 'No placeholder specified')}</p>
            </div>
          </div>
          <button type="button" class="btn-del-question p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer" data-q-id="${q.id}" title="Delete Question">
            ${SVGS.trash}
          </button>
        </div>
      `).join('');

      qList.querySelectorAll('.btn-del-question').forEach(btn => {
        btn.onclick = () => {
          const qid = btn.dataset.qId;
          cfg.custom_questions = (cfg.custom_questions || []).filter(q => q.id !== qid);
          renderQuestionsList();
          if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 350);
        };
      });
    }

    // In-Place Queue / History Tab Rendering
    function renderTabContent() {
      const tabContent = container.querySelector('#appeals-tab-content');
      if (!tabContent) return;

      const btnQueue = container.querySelector('#tab-btn-queue');
      const btnHistory = container.querySelector('#tab-btn-history');
      const badgeQ = container.querySelector('#badge-queue-count');
      const badgeH = container.querySelector('#badge-history-count');

      if (badgeQ) badgeQ.textContent = openAppeals.length;
      if (badgeH) badgeH.textContent = appealsHistory.length;

      if (btnQueue) {
        btnQueue.className = `px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'queue' ? 'bg-white text-black shadow-sm' : 'bg-neutral-800/60 text-neutral-400 hover:text-white'}`;
        const b = btnQueue.querySelector('span:last-child');
        if (b) b.className = `px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'queue' ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'}`;
      }
      if (btnHistory) {
        btnHistory.className = `px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'history' ? 'bg-white text-black shadow-sm' : 'bg-neutral-800/60 text-neutral-400 hover:text-white'}`;
        const b = btnHistory.querySelector('span:last-child');
        if (b) b.className = `px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'history' ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'}`;
      }

      if (activeTab === 'queue') {
        if (openAppeals.length === 0) {
          tabContent.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div class="w-11 h-11 rounded-2xl bg-neutral-800/50 border border-neutral-700/60 text-emerald-400 flex items-center justify-center mb-2.5">
                ${SVGS.check}
              </div>
              <h4 class="text-sm font-semibold text-white">No Pending Appeals</h4>
              <p class="text-xs text-neutral-400 max-w-sm mt-1">All submitted appeals have been reviewed. When members submit new requests, they will appear here in real time.</p>
            </div>
          `;
        } else {
          tabContent.innerHTML = `
            <div class="flex flex-col gap-3">
              ${openAppeals.map(a => {
                const avatarUrl = a.user_avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
                const dateStr = a.last_submitted ? new Date(a.last_submitted * 1000).toLocaleString() : 'Recently';
                return `
                  <div class="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 flex flex-col gap-3 transition-all hover:border-neutral-600">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-neutral-700/60">
                      <div class="flex items-center gap-3">
                        <img src="${avatarUrl}" class="w-9 h-9 rounded-full object-cover bg-neutral-800 border border-neutral-700 shrink-0" alt="" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png';">
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-white">${escapeHtml(a.user_name || 'Discord User')}</span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">${escapeHtml(a.action || 'Sanction')}</span>
                          </div>
                          <span class="text-[11px] text-neutral-400 font-mono">ID: ${escapeHtml(a.user_id)}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                        ${SVGS.clock}
                        <span>${dateStr}</span>
                      </div>
                    </div>

                    <div class="p-3 rounded-lg bg-neutral-900/70 border border-neutral-700/60 text-xs text-neutral-300 leading-relaxed font-sans">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Appellant Statement</p>
                      <p class="whitespace-pre-wrap">${escapeHtml(a.reason || a.statement || 'No statement provided.')}</p>
                    </div>

                    <div class="flex items-center justify-end gap-2.5 pt-0.5">
                      <button type="button" class="btn-deny-appeal px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer" data-user-id="${a.user_id}">
                        ${SVGS.x}
                        <span>Deny Appeal</span>
                      </button>
                      <button type="button" class="btn-accept-appeal px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-500/10 cursor-pointer" data-user-id="${a.user_id}">
                        ${SVGS.check}
                        <span>Accept & Pardon</span>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;

          // Handle Deny
          tabContent.querySelectorAll('.btn-deny-appeal').forEach(btn => {
            btn.onclick = async () => {
              const uid = btn.dataset.userId;
              btn.disabled = true;
              try {
                await API.resolveAppeal(guildId, { user_id: uid, action: 'deny' });
                if (window.Toast) Toast.success('Appeal denied');
                openAppeals = openAppeals.filter(a => String(a.user_id) !== String(uid));
                appealsHistory.unshift({ user_id: uid, status: 'denied', resolved_at: Math.floor(Date.now() / 1000), resolved_by: 'Dashboard' });
                renderTabContent();
              } catch (err) {
                if (window.Toast) Toast.error('Action failed: ' + err.message);
                btn.disabled = false;
              }
            };
          });

          // Handle Accept
          tabContent.querySelectorAll('.btn-accept-appeal').forEach(btn => {
            btn.onclick = async () => {
              const uid = btn.dataset.userId;
              btn.disabled = true;
              try {
                await API.resolveAppeal(guildId, { user_id: uid, action: 'accept' });
                if (window.Toast) Toast.success('Appeal accepted & member pardoned');
                openAppeals = openAppeals.filter(a => String(a.user_id) !== String(uid));
                appealsHistory.unshift({ user_id: uid, status: 'accepted', resolved_at: Math.floor(Date.now() / 1000), resolved_by: 'Dashboard' });
                renderTabContent();
              } catch (err) {
                if (window.Toast) Toast.error('Action failed: ' + err.message);
                btn.disabled = false;
              }
            };
          });
        }
      } else {
        // Decision History Tab
        if (appealsHistory.length === 0) {
          tabContent.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div class="w-11 h-11 rounded-2xl bg-neutral-800/50 border border-neutral-700/60 text-neutral-400 flex items-center justify-center mb-2.5">
                ${SVGS.history}
              </div>
              <h4 class="text-sm font-semibold text-white">No Decision History</h4>
              <p class="text-xs text-neutral-400 max-w-sm mt-1">Processed appeal decisions will be recorded here with moderator and outcome details.</p>
            </div>
          `;
        } else {
          tabContent.innerHTML = `
            <div class="overflow-x-auto rounded-xl border border-neutral-700/60 bg-neutral-800/20">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-neutral-700/60 text-neutral-400 bg-neutral-800/40">
                    <th class="py-2.5 px-3 font-semibold">User</th>
                    <th class="py-2.5 px-3 font-semibold">Sanction</th>
                    <th class="py-2.5 px-3 font-semibold">Decision</th>
                    <th class="py-2.5 px-3 font-semibold">Reviewed By</th>
                    <th class="py-2.5 px-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-700/40 text-neutral-300">
                  ${appealsHistory.map(h => {
                    const isAccepted = h.status === 'accepted';
                    const badgeClass = isAccepted
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20';
                    const dateStr = h.resolved_at ? new Date(h.resolved_at * 1000).toLocaleDateString() : (h.last_submitted ? new Date(h.last_submitted * 1000).toLocaleDateString() : '-');
                    return `
                      <tr class="hover:bg-neutral-800/40 transition-colors">
                        <td class="py-2.5 px-3">
                          <div class="flex items-center gap-2.5">
                            <img src="${h.user_avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}" class="w-6 h-6 rounded-full bg-neutral-800" alt="" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png';">
                            <div>
                              <span class="font-medium text-white">${escapeHtml(h.user_name || 'User')}</span>
                              <span class="block text-[10px] text-neutral-400 font-mono">${escapeHtml(h.user_id)}</span>
                            </div>
                          </div>
                        </td>
                        <td class="py-2.5 px-3">
                          <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-900 border border-neutral-700 text-neutral-300 uppercase">${escapeHtml(h.action || 'Sanction')}</span>
                        </td>
                        <td class="py-2.5 px-3">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}">${isAccepted ? 'ACCEPTED' : (h.status === 'pending' ? 'PENDING' : 'DENIED')}</span>
                        </td>
                        <td class="py-2.5 px-3 text-neutral-300">${escapeHtml(h.resolved_by || 'Staff')}</td>
                        <td class="py-2.5 px-3 text-neutral-400">${dateStr}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `;
        }
      }
    }

    // Bind In-Place Events
    renderReviewRolesChips();
    renderReviewRolesOptions();
    renderCooldownOptions();
    renderQuestionsList();
    renderTabContent();

    // 1. Master Enabled Toggle
    const toggleMaster = container.querySelector('#toggle-appeals-enabled');
    if (toggleMaster) {
      toggleMaster.onclick = () => {
        cfg.enabled = !cfg.enabled;
        updateToggleDOM(toggleMaster, cfg.enabled);
        const badge = container.querySelector('#badge-portal-status');
        if (badge) {
          badge.textContent = cfg.enabled ? 'ACTIVE' : 'DISABLED';
          badge.className = `px-2 py-0.5 rounded text-[10px] font-semibold ${cfg.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}`;
        }
        if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 350);
      };
    }

    // 2. Mention Mods Toggle
    const toggleMention = container.querySelector('#toggle-mention-mods');
    if (toggleMention) {
      toggleMention.onclick = () => {
        cfg.mention_mods = !cfg.mention_mods;
        updateToggleDOM(toggleMention, cfg.mention_mods);
        if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 350);
      };
    }

    // 3. Invite Unbanned Toggle
    const toggleInvite = container.querySelector('#toggle-invite-unbanned');
    if (toggleInvite) {
      toggleInvite.onclick = () => {
        cfg.invite_unbanned = !cfg.invite_unbanned;
        updateToggleDOM(toggleInvite, cfg.invite_unbanned);
        if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 350);
      };
    }

    // 4. Anonymous Mods Toggle
    const toggleAnon = container.querySelector('#toggle-anon-mods');
    if (toggleAnon) {
      toggleAnon.onclick = () => {
        cfg.anonymous_mods = !cfg.anonymous_mods;
        updateToggleDOM(toggleAnon, cfg.anonymous_mods);
        if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 350);
      };
    }

    // 5. Repeat Appeals Toggle
    const toggleRepeat = container.querySelector('#toggle-repeat-appeals');
    if (toggleRepeat) {
      toggleRepeat.onclick = () => {
        cfg.multiple_submissions = !cfg.multiple_submissions;
        updateToggleDOM(toggleRepeat, cfg.multiple_submissions);
        if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 350);
      };
    }

    // 6. Punishment Types Toggle (In-Place DOM update, NO PAGE REFRESH!)
    container.querySelectorAll('.punishment-toggle-card').forEach(card => {
      card.onclick = () => {
        const pid = card.dataset.punishment;
        let list = [...(cfg.allowed_punishments || [])];
        if (list.includes(pid)) {
          list = list.filter(x => x !== pid);
        } else {
          list.push(pid);
        }
        cfg.allowed_punishments = list;

        const isChecked = list.includes(pid);
        card.className = `punishment-toggle-card flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer select-none ${isChecked ? 'border-indigo-500/80 bg-indigo-500/10 text-white font-medium' : 'border-neutral-700/60 bg-neutral-800/40 text-neutral-300 hover:border-neutral-600 hover:text-white'}`;
        const checkBox = card.querySelector('.check-box');
        if (checkBox) {
          checkBox.innerHTML = isChecked ? SVGS.check : '';
          checkBox.className = `check-box w-4 h-4 rounded flex items-center justify-center transition-colors ${isChecked ? 'bg-indigo-600 border border-indigo-600 text-white' : 'border-neutral-600 bg-neutral-800'}`;
        }
        if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 350);
      };
    });

    // Global Closer for All Custom Dropdowns in Appeals
    function closeAllAppealsDropdowns() {
      if (channelMenu) channelMenu.classList.add('hidden');
      const chArrow = container.querySelector('#channel-dd-trigger svg');
      if (chArrow) chArrow.classList.remove('rotate-180');

      const rolesMenu = container.querySelector('#review-roles-menu');
      if (rolesMenu) rolesMenu.classList.add('hidden');
      const rolesArrow = container.querySelector('#review-roles-arrow');
      if (rolesArrow) rolesArrow.classList.remove('rotate-180');

      const cdMenu = container.querySelector('#cooldown-dd-menu');
      if (cdMenu) cdMenu.classList.add('hidden');
      const cdArrow = container.querySelector('#cooldown-dd-arrow');
      if (cdArrow) cdArrow.classList.remove('rotate-180');
    }

    // 7. Staff Review Channel Custom Dropdown
    const channelTrigger = container.querySelector('#channel-dd-trigger');
    const channelMenu = container.querySelector('#channel-dd-menu');
    const channelSearch = container.querySelector('#channel-dd-search');
    const channelDisplay = container.querySelector('#selected-channel-display');
    const channelItems = container.querySelectorAll('#channel-dd-options .dd-item');

    if (channelTrigger && channelMenu) {
      channelTrigger.onclick = (e) => {
        e.stopPropagation();
        const isHidden = channelMenu.classList.contains('hidden');
        closeAllAppealsDropdowns();
        if (isHidden) {
          channelMenu.classList.remove('hidden');
          const arrow = channelTrigger.querySelector('svg');
          if (arrow) arrow.classList.add('rotate-180');
          if (channelSearch) {
            channelSearch.value = '';
            setTimeout(() => channelSearch.focus(), 50);
            channelItems.forEach(it => it.classList.remove('hidden'));
          }
        }
      };
    }

    if (channelSearch) {
      channelSearch.onclick = (e) => e.stopPropagation();
      channelSearch.oninput = () => {
        const query = channelSearch.value.toLowerCase().trim();
        channelItems.forEach(it => {
          const name = (it.dataset.channelName || '').toLowerCase();
          if (!query || name.includes(query) || it.textContent.toLowerCase().includes(query)) {
            it.classList.remove('hidden');
          } else {
            it.classList.add('hidden');
          }
        });
      };
    }

    channelItems.forEach(it => {
      it.onclick = (e) => {
        e.stopPropagation();
        const chId = it.dataset.channelId || null;
        cfg.channel_id = chId;
        closeAllAppealsDropdowns();
        if (channelDisplay) {
          channelDisplay.innerHTML = chId ? `# ${escapeHtml(getSelectedChannelName())}` : '<span class="text-neutral-500">None (Disabled)</span>';
        }
        // Update checkmarks
        channelItems.forEach(item => {
          const active = item.dataset.channelId === (chId || '');
          item.className = `dd-item w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-200 hover:text-white hover:bg-neutral-800 transition-colors text-left cursor-pointer ${active ? 'bg-neutral-800/80 text-white font-medium' : ''}`;
          let check = item.querySelector('.text-emerald-400');
          if (active && !check) {
            const span = document.createElement('span');
            span.className = 'text-emerald-400 shrink-0';
            span.innerHTML = SVGS.check;
            item.appendChild(span);
          } else if (!active && check) {
            check.remove();
          }
        });
        if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 350);
      };
    });

    // 8. Moderator Review Roles Custom Multi-Select Dropdown
    const rolesTrigger = container.querySelector('#review-roles-trigger');
    const rolesMenu = container.querySelector('#review-roles-menu');
    const rolesSearch = container.querySelector('#review-roles-search');
    const rolesArrow = container.querySelector('#review-roles-arrow');

    if (rolesTrigger && rolesMenu) {
      rolesTrigger.onclick = (e) => {
        if (e.target.closest('.btn-remove-role')) return;
        e.stopPropagation();
        const isHidden = rolesMenu.classList.contains('hidden');
        closeAllAppealsDropdowns();
        if (isHidden) {
          rolesMenu.classList.remove('hidden');
          if (rolesArrow) rolesArrow.classList.add('rotate-180');
          if (rolesSearch) {
            rolesSearch.value = '';
            renderReviewRolesOptions('');
            setTimeout(() => rolesSearch.focus(), 50);
          }
        }
      };
    }

    if (rolesSearch) {
      rolesSearch.onclick = (e) => e.stopPropagation();
      rolesSearch.oninput = () => {
        renderReviewRolesOptions(rolesSearch.value);
      };
    }

    // 9. Re-Application Cooldown Custom Dropdown
    const cdTrigger = container.querySelector('#cooldown-dd-trigger');
    const cdMenu = container.querySelector('#cooldown-dd-menu');
    const cdArrow = container.querySelector('#cooldown-dd-arrow');

    if (cdTrigger && cdMenu) {
      cdTrigger.onclick = (e) => {
        e.stopPropagation();
        const isHidden = cdMenu.classList.contains('hidden');
        closeAllAppealsDropdowns();
        if (isHidden) {
          cdMenu.classList.remove('hidden');
          if (cdArrow) cdArrow.classList.add('rotate-180');
        }
      };
    }

    // Global outside click listener
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-channel-dd') && !e.target.closest('#review-roles-dd-wrap') && !e.target.closest('#cooldown-dd-wrap')) {
        closeAllAppealsDropdowns();
      }
    });

    // 10. Custom URL Input
    const inpCustomUrl = container.querySelector('#inp-custom-url');
    if (inpCustomUrl) {
      inpCustomUrl.oninput = (e) => {
        cfg.custom_url = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        const newUrl = `${origin}/appeal/${encodeURIComponent(cfg.custom_url || 'orbit')}`;
        const btnOpen = container.querySelector('#btn-open-portal');
        const btnPrev = container.querySelector('#btn-preview-portal');
        if (btnOpen) btnOpen.href = newUrl;
        if (btnPrev) btnPrev.href = newUrl;
        if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 700);
      };
    }

    // 11. Copy Link Button
    const btnCopy = container.querySelector('#btn-copy-portal-link');
    if (btnCopy) {
      btnCopy.onclick = () => {
        const urlToCopy = `${origin}/appeal/${encodeURIComponent(cfg.custom_url || 'orbit')}`;
        navigator.clipboard.writeText(urlToCopy).then(() => {
          const copyTxt = container.querySelector('#copy-text');
          if (copyTxt) copyTxt.textContent = 'Copied!';
          if (window.Toast) Toast.success('Portal link copied to clipboard');
          setTimeout(() => { if (copyTxt) copyTxt.textContent = 'Copy Link'; }, 2000);
        }).catch(() => {
          if (window.Toast) Toast.error('Failed to copy link');
        });
      };
    }

    // 11. New Question Drawer Toggles
    const btnAddQ = container.querySelector('#btn-add-question');
    const newQBox = container.querySelector('#new-question-box');
    const btnCancelNewQ = container.querySelector('#btn-cancel-new-q');
    const btnConfirmNewQ = container.querySelector('#btn-confirm-new-q');

    if (btnAddQ && newQBox) {
      btnAddQ.onclick = () => {
        newQBox.classList.remove('hidden');
        const inpLabel = container.querySelector('#inp-new-q-label');
        if (inpLabel) inpLabel.focus();
      };
    }
    if (btnCancelNewQ && newQBox) {
      btnCancelNewQ.onclick = () => {
        newQBox.classList.add('hidden');
      };
    }
    if (btnConfirmNewQ && newQBox) {
      btnConfirmNewQ.onclick = () => {
        const inpLabel = container.querySelector('#inp-new-q-label');
        const inpPlaceholder = container.querySelector('#inp-new-q-placeholder');
        const chkReq = container.querySelector('#chk-new-q-required');

        const label = inpLabel ? inpLabel.value.trim() : '';
        if (!label) {
          if (window.Toast) Toast.error('Please enter a question prompt.');
          if (inpLabel) inpLabel.focus();
          return;
        }

        const newQ = {
          id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          label: label,
          placeholder: inpPlaceholder ? inpPlaceholder.value.trim() : '',
          required: chkReq ? chkReq.checked : true
        };

        if (!cfg.custom_questions) cfg.custom_questions = [];
        cfg.custom_questions.push(newQ);

        if (inpLabel) inpLabel.value = '';
        if (inpPlaceholder) inpPlaceholder.value = '';
        newQBox.classList.add('hidden');

        renderQuestionsList();
        if (window.AutoSave) AutoSave.trigger(saveAppealsSettings, 350);
      };
    }

    // 12. Tabs: Pending Queue vs Decision History (In-Place DOM update)
    const tabBtnQueue = container.querySelector('#tab-btn-queue');
    const tabBtnHistory = container.querySelector('#tab-btn-history');

    if (tabBtnQueue) {
      tabBtnQueue.onclick = () => {
        if (activeTab === 'queue') return;
        activeTab = 'queue';
        renderTabContent();
      };
    }
    if (tabBtnHistory) {
      tabBtnHistory.onclick = () => {
        if (activeTab === 'history') return;
        activeTab = 'history';
        renderTabContent();
      };
    }

    // 13. Refresh Queue Button
    const btnRefresh = container.querySelector('#btn-refresh-queue');
    if (btnRefresh) {
      btnRefresh.onclick = async () => {
        btnRefresh.classList.add('opacity-50', 'pointer-events-none');
        try {
          const [recent, history] = await Promise.all([
            API.request(`/api/server/${guildId}/appeals`),
            API.request(`/api/server/${guildId}/appeals/history`)
          ]);
          openAppeals = Array.isArray(recent) ? recent : (recent?.appeals || []);
          appealsHistory = Array.isArray(history) ? history : (history?.history || []);
          renderTabContent();
          if (window.Toast) Toast.success('Queue refreshed');
        } catch (err) {
          if (window.Toast) Toast.error('Failed to refresh: ' + err.message);
        } finally {
          btnRefresh.classList.remove('opacity-50', 'pointer-events-none');
        }
      };
    }


  };
})();
