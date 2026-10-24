/**
 * Orbit Dashboard - Ban Appeals Tab (/dashboard/:guildId/appeals)
 * 1:1 Pixel-Perfect PeakBot-styled Appeal Management Suite with Automod Design System
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

  function showNotify(msg, type = 'success') {
    if (window.Toast && typeof Toast[type] === 'function') Toast[type](msg);
    else if (window.Toast && typeof Toast.show === 'function') Toast.show(msg, type);
    else if (window.Notifications && typeof Notifications.show === 'function') Notifications.show(msg, type);
    else console.log(`[${type}] ${msg}`);
  }

  const SVGS = {
    scale: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scale"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>`,
    externalLink: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`,
    shieldCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
    inbox: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`,
    history: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><polyline points="12 7 12 12 15 15"></polyline></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`,
    refresh: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`
  };

  // Custom Toggle Switch (Matches Automod 1:1)
  function renderCustomToggle(id, checked, label = '') {
    const isChecked = Boolean(checked);
    return `
      <button 
        type="button" 
        role="switch" 
        id="${escapeHtml(id)}"
        aria-checked="${isChecked ? 'true' : 'false'}" 
        ${label ? `aria-label="${escapeHtml(label)}"` : ''}
        class="orbit-custom-toggle relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${isChecked ? 'bg-white' : 'bg-neutral-700'}"
      >
        <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out ${isChecked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-900'}"></span>
      </button>
    `;
  }

  function updateToggleDOM(btn, isChecked) {
    if (!btn) return;
    btn.setAttribute('aria-checked', isChecked ? 'true' : 'false');
    if (isChecked) {
      btn.classList.remove('bg-neutral-700');
      btn.classList.add('bg-white');
    } else {
      btn.classList.remove('bg-white');
      btn.classList.add('bg-neutral-700');
    }
    const knob = btn.querySelector('span');
    if (knob) {
      if (isChecked) {
        knob.classList.remove('translate-x-[3px]', 'bg-neutral-900');
        knob.classList.add('translate-x-[21px]', 'bg-black');
      } else {
        knob.classList.remove('translate-x-[21px]', 'bg-black');
        knob.classList.add('translate-x-[3px]', 'bg-neutral-900');
      }
    }
  }

  DashboardTabs.Appeals = async function (container, guildId) {
    container.innerHTML = `
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    `;

    let cfg = {
      enabled: true,
      custom_url: 'orbit',
      channel_id: null,
      mod_roles: [],
      allowed_punishments: ['ban', 'timeout'],
      mention_mods: true,
      cooldown_days: 3,
      multiple_submissions: false,
      anonymous_mods: false,
      invite_unbanned: true,
      custom_questions: [
        { id: 'q1', label: 'Why were you banned or sanctioned?', placeholder: 'Explain what happened and the context...', required: true },
        { id: 'q2', label: 'Why should the staff reconsider your punishment?', placeholder: 'Describe what has changed and why you should be pardoned...', required: true }
      ]
    };

    let channels = [];
    let roles = [];
    let openAppeals = [];
    let appealsHistory = [];
    let activeTab = 'queue'; // 'queue' | 'history'

    try {
      const [configData, openRes, histRes] = await Promise.all([
        API.getConfig(guildId).catch(() => ({})),
        API.getAppeals ? API.getAppeals(guildId, true).catch(() => []) : Promise.resolve([]),
        API.getAppealsHistory ? API.getAppealsHistory(guildId, true).catch(() => []) : Promise.resolve([])
      ]);

      const appealConfig = (configData?.config && configData.config.appeals) ? configData.config.appeals : (configData?.appeals || {});
      if (appealConfig && typeof appealConfig === 'object') {
        cfg = { ...cfg, ...appealConfig };
        if (!Array.isArray(cfg.allowed_punishments)) {
          cfg.allowed_punishments = ['ban', 'timeout'];
        }
        if (!Array.isArray(cfg.custom_questions) || cfg.custom_questions.length === 0) {
          cfg.custom_questions = [
            { id: 'q1', label: 'Why were you banned or sanctioned?', placeholder: 'Explain what happened and the context...', required: true },
            { id: 'q2', label: 'Why should the staff reconsider your punishment?', placeholder: 'Describe what has changed and why you should be pardoned...', required: true }
          ];
        }
      }

      const chList = Array.isArray(configData?.channels) ? configData.channels : [];
      const rList = Array.isArray(configData?.roles) ? configData.roles : [];
      channels = chList.filter(c => !c.type || c.type === 'text' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text')));
      roles = rList.filter(r => !r.managed && r.name !== '@everyone');
      openAppeals = Array.isArray(openRes) ? openRes : [];
      appealsHistory = Array.isArray(histRes) ? histRes : [];
    } catch (err) {
      console.error('Failed to load appeals data:', err);
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-12">
          <h2 class="text-xl font-bold text-white mb-2">Failed to load Ban Appeals</h2>
          <p class="text-xs text-neutral-400 max-w-md mb-6">${escapeHtml(err.message || 'Unknown error occurred.')}</p>
          <button id="btn-retry-appeals" class="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer">Retry</button>
        </div>
      `;
      const retryBtn = container.querySelector('#btn-retry-appeals');
      if (retryBtn) retryBtn.onclick = () => DashboardTabs.Appeals(container, guildId);
      return;
    }

    function renderCustomChannelSelect(ddId, selectedId, placeholder = 'Select staff review channel') {
      const selectedCh = channels.find(c => String(c.id) === String(selectedId));
      const hasVal = Boolean(selectedCh);
      const label = selectedCh ? selectedCh.name : placeholder;

      return `
        <div class="relative w-full custom-channel-dd" data-dd-id="${escapeHtml(ddId)}">
          <button 
            type="button" 
            id="${escapeHtml(ddId)}-trigger"
            class="custom-channel-trigger w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-xs text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer"
          >
            <span class="truncate flex items-center gap-1.5 ${hasVal ? 'text-white font-medium' : 'text-neutral-500'}">
              <span class="text-neutral-500 font-mono">#</span>
              <span class="dd-display-label">${escapeHtml(label)}</span>
            </span>
            <div class="flex items-center gap-1 text-neutral-400">
              ${SVGS.chevronDown}
            </div>
          </button>

          <div 
            id="${escapeHtml(ddId)}-menu"
            class="orbit-dropdown-menu custom-channel-menu hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] overflow-hidden max-h-60 flex flex-col"
          >
            <div class="p-2 border-b border-neutral-800 shrink-0">
              <div class="relative">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">${SVGS.search}</span>
                <input 
                  type="text" 
                  placeholder="Filter channels..." 
                  class="custom-dd-search w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>
            <div class="custom-dd-list overflow-y-auto max-h-48 p-1 divide-y divide-neutral-800/40">
              <button 
                type="button"
                data-channel-id=""
                class="dd-item w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer ${!selectedId ? 'bg-neutral-800/70 text-white font-semibold' : ''}"
              >
                <span class="text-neutral-500 font-mono text-[11px]">Ø</span>
                <span>None (Disabled)</span>
              </button>
              ${channels.map(ch => `
                <button 
                  type="button"
                  data-channel-id="${escapeHtml(ch.id)}"
                  data-channel-name="${escapeHtml(ch.name)}"
                  class="dd-item w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs text-left text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer ${String(selectedId) === String(ch.id) ? 'bg-neutral-800 text-white font-semibold' : ''}"
                >
                  <span class="truncate flex items-center gap-1.5">
                    <span class="text-neutral-500 font-mono">#</span>
                    <span>${escapeHtml(ch.name)}</span>
                  </span>
                  ${String(selectedId) === String(ch.id) ? `<span class="text-white">${SVGS.check}</span>` : ''}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    function renderView() {
      const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
      const portalUrl = `${origin}/appeal/${encodeURIComponent(cfg.custom_url || 'orbit')}`;

      container.innerHTML = `
        <div class="space-y-6 pb-24 animate-fade-in max-w-5xl mx-auto">
          <!-- Top Bar / Header (PeakBot automod style) -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20">Moderation Suite</span>
                <span class="text-xs text-neutral-500">•</span>
                <span class="text-xs text-neutral-400">Pardon & Review System</span>
              </div>
              <h1 class="text-2xl font-bold text-white tracking-tight">Ban Appeals System</h1>
              <p class="text-xs text-neutral-400 mt-1">Self-service pardon portal, form builder, and interactive review queue for sanctioned members.</p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <a href="${portalUrl}" target="_blank" class="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95">
                ${SVGS.externalLink}
                <span>Preview Portal</span>
              </a>
              <button type="button" id="btn-save-appeals" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer">
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          <!-- Master Switch Card -->
          <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-11 h-11 rounded-xl bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20 flex items-center justify-center shrink-0">
                ${SVGS.scale}
              </div>
              <div>
                <div class="flex items-center gap-2.5">
                  <span class="text-sm font-semibold text-white">Enable Appeals Portal</span>
                  <span id="badge-portal-status" class="px-2 py-0.5 rounded text-[10px] font-semibold ${cfg.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}">${cfg.enabled ? 'ACTIVE' : 'DISABLED'}</span>
                </div>
                <p class="text-xs text-neutral-400 mt-1">Allow banned and sanctioned users to access your public appeal portal and request pardons.</p>
              </div>
            </div>
            <div>
              ${renderCustomToggle('toggle-appeals-enabled', cfg.enabled, 'Toggle appeals portal')}
            </div>
          </div>

          <!-- Vanity Portal URL Card -->
          <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="text-sm font-semibold text-white">Vanity Portal Address</span>
                <span class="text-xs text-neutral-500 font-mono">/appeal/:slug</span>
              </div>
              <button type="button" id="btn-copy-portal-link" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
                ${SVGS.copy}
                <span>Copy Link</span>
              </button>
            </div>
            <p class="text-xs text-neutral-400">Direct address provided to members in ban DM notifications or server rules.</p>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div class="flex-1 flex items-center rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 focus-within:border-neutral-600 transition-colors">
                <span class="px-3.5 py-2.5 bg-neutral-900/60 border-r border-neutral-800 text-xs text-neutral-500 font-mono select-none">${origin}/appeal/</span>
                <input type="text" id="inp-custom-url" value="${escapeHtml(cfg.custom_url || '')}" placeholder="orbit" class="flex-1 px-3 py-2.5 bg-transparent text-white text-xs font-mono focus:outline-none">
              </div>
              <a href="${portalUrl}" target="_blank" class="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                ${SVGS.externalLink}
                <span>Open Portal</span>
              </a>
            </div>
          </div>

          <!-- Staff Routing & Review Configuration -->
          <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-6">
            <div class="border-b border-neutral-800 pb-4">
              <h3 class="text-sm font-semibold text-white">Staff Routing & Review Team</h3>
              <p class="text-xs text-neutral-400 mt-1">Configure where submissions are sent and which roles are authorized to review them.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Staff Channel Dropdown -->
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-neutral-300">Staff Review Channel</label>
                <p class="text-[11px] text-neutral-500 mb-1">Orbit will post an interactive appeal embed with Accept/Deny buttons to this channel.</p>
                ${renderCustomChannelSelect('select-appeal-channel', cfg.channel_id, 'Select staff review channel')}
              </div>

              <!-- Mention Reviewers Switch Card -->
              <div class="flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                <div>
                  <span class="text-xs font-semibold text-white">Notify Review Roles</span>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Ping authorized reviewer roles whenever a new appeal is submitted.</p>
                </div>
                ${renderCustomToggle('toggle-mention-mods', cfg.mention_mods, 'Mention mod roles')}
              </div>
            </div>

            <!-- Moderator Roles Multi-Select -->
            <div class="flex flex-col gap-2.5 pt-2">
              <label class="text-xs font-semibold text-neutral-300">Moderator Review Roles</label>
              <p class="text-[11px] text-neutral-500">Roles permitted to approve or decline ban appeals both in the dashboard and Discord.</p>
              <div id="roles-selector-container" class="flex flex-wrap gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 min-h-[46px] items-center">
                ${(cfg.mod_roles || []).map(rId => {
                  const r = roles.find(x => String(x.id) === String(rId));
                  const name = r ? r.name : `Role (${rId})`;
                  const color = (r && r.color && r.color !== 0) ? `#${r.color.toString(16).padStart(6, '0')}` : '#818cf8';
                  return `
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-200">
                      <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${color}"></span>
                      <span>${escapeHtml(name)}</span>
                      <button type="button" class="btn-remove-role hover:text-red-400 transition-colors p-0.5 cursor-pointer" data-role-id="${rId}">${SVGS.x}</button>
                    </span>
                  `;
                }).join('')}
                <select id="sel-add-role" class="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 hover:text-white focus:outline-none cursor-pointer">
                  <option value="">+ Add Review Role</option>
                  ${roles.filter(r => !(cfg.mod_roles || []).includes(String(r.id))).map(r => `
                    <option value="${r.id}">@ ${escapeHtml(r.name)}</option>
                  `).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Appeals Policy & Automation -->
          <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-6">
            <div class="border-b border-neutral-800 pb-4">
              <h3 class="text-sm font-semibold text-white">Appeals Policy & Automation</h3>
              <p class="text-xs text-neutral-400 mt-1">Control which sanction categories are appealable and the behavior when an appeal is accepted.</p>
            </div>

            <!-- Sanction Types Allowed to Appeal -->
            <div class="flex flex-col gap-3">
              <label class="text-xs font-semibold text-neutral-300">Sanction Types Allowed to Appeal</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="punishment-cards-grid">
                ${[
                  { id: 'ban', label: 'Bans', desc: 'Server banned users' },
                  { id: 'timeout', label: 'Timeouts', desc: 'Muted / timed out members' },
                  { id: 'kick', label: 'Kicks', desc: 'Previously kicked members' },
                  { id: 'warn', label: 'Warnings', desc: 'Warned members' }
                ].map(p => {
                  const isChecked = (cfg.allowed_punishments || []).includes(p.id);
                  return `
                    <div 
                      class="punishment-toggle-card flex flex-col justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-all select-none ${isChecked ? 'ring-1 ring-white/20 border-neutral-600' : 'opacity-70'}"
                      data-punishment="${p.id}"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-semibold text-white">${p.label}</span>
                        <div class="w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-white border-white text-black' : 'border-neutral-700 bg-neutral-900'}">
                          ${isChecked ? SVGS.check : ''}
                        </div>
                      </div>
                      <span class="text-[10px] text-neutral-500">${p.desc}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Policy Settings Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <!-- Auto-Invite Unbanned -->
              <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
                <div>
                  <span class="text-xs font-semibold text-white">Auto-Invite Accepted Bans</span>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Send a one-time server invite DM when a ban appeal is approved.</p>
                </div>
                ${renderCustomToggle('toggle-invite-unbanned', cfg.invite_unbanned !== false, 'Auto-invite unbanned')}
              </div>

              <!-- Anonymous Moderation -->
              <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
                <div>
                  <span class="text-xs font-semibold text-white">Anonymous Moderator Decisions</span>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Conceal the deciding moderator's name from the appellant.</p>
                </div>
                ${renderCustomToggle('toggle-anon-mods', cfg.anonymous_mods, 'Anonymous decisions')}
              </div>

              <!-- Cooldown Days -->
              <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between gap-2">
                <div>
                  <span class="text-xs font-semibold text-white">Re-Application Cooldown</span>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Wait period before a denied appellant can submit another request.</p>
                </div>
                <select id="sel-cooldown-days" class="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white text-xs focus:outline-none cursor-pointer">
                  <option value="0" ${cfg.cooldown_days === 0 ? 'selected' : ''}>None (Immediate)</option>
                  <option value="1" ${cfg.cooldown_days === 1 ? 'selected' : ''}>1 Day</option>
                  <option value="3" ${cfg.cooldown_days === 3 ? 'selected' : ''}>3 Days</option>
                  <option value="7" ${cfg.cooldown_days === 7 ? 'selected' : ''}>7 Days</option>
                  <option value="14" ${cfg.cooldown_days === 14 ? 'selected' : ''}>14 Days</option>
                  <option value="30" ${cfg.cooldown_days === 30 ? 'selected' : ''}>30 Days</option>
                </select>
              </div>

              <!-- Allow Repeat Appeals -->
              <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
                <div>
                  <span class="text-xs font-semibold text-white">Allow Repeat Appeals</span>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Allow users whose appeal was denied to re-apply once cooldown passes.</p>
                </div>
                ${renderCustomToggle('toggle-repeat-appeals', cfg.multiple_submissions, 'Allow repeat appeals')}
              </div>
            </div>
          </div>

          <!-- Custom Questionnaire / Form Builder -->
          <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-5">
            <div class="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 class="text-sm font-semibold text-white">Appeals Questionnaire Builder</h3>
                <p class="text-xs text-neutral-400 mt-1">Configure the questions shown to appellants on your public portal.</p>
              </div>
              <button type="button" id="btn-add-question" class="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                ${SVGS.plus}
                <span>Add Question</span>
              </button>
            </div>

            <!-- New Question Form (Hidden by default) -->
            <div id="new-question-box" class="hidden p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col gap-3">
              <span class="text-xs font-semibold text-white">New Question</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" id="inp-new-q-label" placeholder="Question prompt (e.g. Why should we unban you?)" class="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600">
                <input type="text" id="inp-new-q-placeholder" placeholder="Placeholder hint..." class="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600">
              </div>
              <div class="flex items-center justify-between pt-1">
                <label class="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input type="checkbox" id="chk-new-q-required" checked class="rounded bg-neutral-900 border-neutral-700 text-white">
                  <span>Required field</span>
                </label>
                <div class="flex items-center gap-2">
                  <button type="button" id="btn-cancel-new-q" class="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors">Cancel</button>
                  <button type="button" id="btn-confirm-new-q" class="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors">Save Question</button>
                </div>
              </div>
            </div>

            <!-- Questions List -->
            <div id="questions-list" class="flex flex-col gap-3">
              ${(cfg.custom_questions || []).map((q, idx) => `
                <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4 group hover:border-neutral-700 transition-all" data-q-id="${q.id}">
                  <div class="flex items-center gap-3.5 flex-1 min-w-0">
                    <span class="w-6 h-6 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] font-bold text-neutral-400 flex items-center justify-center shrink-0">Q${idx + 1}</span>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="text-xs font-semibold text-white truncate">${escapeHtml(q.label)}</p>
                        ${q.required ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Required</span>' : '<span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-neutral-900 text-neutral-500">Optional</span>'}
                      </div>
                      <p class="text-[11px] text-neutral-500 truncate mt-0.5">${escapeHtml(q.placeholder || 'No placeholder specified')}</p>
                    </div>
                  </div>
                  <button type="button" class="btn-del-question p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-900 transition-colors cursor-pointer" data-q-id="${q.id}" title="Delete Question">
                    ${SVGS.trash}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Moderation Queue & Decision History -->
          <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div class="flex items-center gap-2">
                <button type="button" id="tab-btn-queue" class="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'queue' ? 'bg-white text-black shadow-sm' : 'bg-neutral-950 text-neutral-400 hover:text-white'}">
                  ${SVGS.inbox}
                  <span>Pending Queue</span>
                  <span class="px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'queue' ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'}">${openAppeals.length}</span>
                </button>
                <button type="button" id="tab-btn-history" class="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'history' ? 'bg-white text-black shadow-sm' : 'bg-neutral-950 text-neutral-400 hover:text-white'}">
                  ${SVGS.history}
                  <span>Decision History</span>
                  <span class="px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'history' ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'}">${appealsHistory.length}</span>
                </button>
              </div>
              <button type="button" id="btn-refresh-queue" class="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer">
                ${SVGS.refresh}
                <span>Refresh</span>
              </button>
            </div>

            <!-- Pending Queue Tab Content -->
            <div id="queue-content-panel" class="${activeTab === 'queue' ? '' : 'hidden'}">
              ${openAppeals.length === 0 ? `
                <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div class="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 text-emerald-400 flex items-center justify-center mb-3">
                    ${SVGS.check}
                  </div>
                  <h4 class="text-sm font-semibold text-white">No Pending Appeals</h4>
                  <p class="text-xs text-neutral-500 max-w-sm mt-1">All submitted appeals have been reviewed. When members submit new requests, they will appear here in real time.</p>
                </div>
              ` : `
                <div class="flex flex-col gap-4">
                  ${openAppeals.map(a => {
                    const avatarUrl = a.user_avatar || '/img/logo.png';
                    const dateStr = a.last_submitted ? new Date(a.last_submitted * 1000).toLocaleString() : 'Recently';
                    return `
                      <div class="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-4 transition-all hover:border-neutral-700">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                          <div class="flex items-center gap-3">
                            <img src="${avatarUrl}" class="w-10 h-10 rounded-xl object-cover bg-neutral-900 border border-neutral-800 shrink-0" alt="Avatar" onerror="this.onerror=null; this.src='/img/logo.png';">
                            <div>
                              <div class="flex items-center gap-2">
                                <span class="text-xs font-bold text-white">${escapeHtml(a.user_name || 'Discord User')}</span>
                                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">${escapeHtml(a.action || 'Sanction')}</span>
                              </div>
                              <span class="text-[11px] text-neutral-500 font-mono">ID: ${escapeHtml(a.user_id)}</span>
                            </div>
                          </div>
                          <div class="flex items-center gap-2 text-neutral-500 text-[11px]">
                            ${SVGS.clock}
                            <span>${dateStr}</span>
                          </div>
                        </div>

                        <div class="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-sans">
                          <p class="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Appellant Statement</p>
                          <p class="whitespace-pre-wrap">${escapeHtml(a.reason || a.statement || 'No statement provided.')}</p>
                        </div>

                        <div class="flex items-center justify-end gap-3 pt-1">
                          <button type="button" class="btn-deny-appeal px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer" data-user-id="${a.user_id}">
                            ${SVGS.x}
                            <span>Deny Appeal</span>
                          </button>
                          <button type="button" class="btn-accept-appeal px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-500/10 cursor-pointer" data-user-id="${a.user_id}">
                            ${SVGS.check}
                            <span>Accept & Pardon</span>
                          </button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>

            <!-- History Tab Content -->
            <div id="history-content-panel" class="${activeTab === 'history' ? '' : 'hidden'}">
              ${appealsHistory.length === 0 ? `
                <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div class="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-500 flex items-center justify-center mb-3">
                    ${SVGS.history}
                  </div>
                  <h4 class="text-sm font-semibold text-white">No Decision History</h4>
                  <p class="text-xs text-neutral-500 max-w-sm mt-1">Processed appeal decisions will be recorded here with moderator and outcome details.</p>
                </div>
              ` : `
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr class="border-b border-neutral-800 text-neutral-400">
                        <th class="py-3 px-3 font-semibold">User</th>
                        <th class="py-3 px-3 font-semibold">Sanction</th>
                        <th class="py-3 px-3 font-semibold">Decision</th>
                        <th class="py-3 px-3 font-semibold">Reviewed By</th>
                        <th class="py-3 px-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-800/60 text-neutral-300">
                      ${appealsHistory.map(h => {
                        const isAccepted = h.status === 'accepted';
                        const badgeClass = isAccepted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20';
                        const dateStr = h.resolved_at ? new Date(h.resolved_at * 1000).toLocaleDateString() : (h.last_submitted ? new Date(h.last_submitted * 1000).toLocaleDateString() : '-');
                        return `
                          <tr class="hover:bg-neutral-950/60 transition-colors">
                            <td class="py-3 px-3">
                              <div class="flex items-center gap-2.5">
                                <img src="${h.user_avatar || '/img/logo.png'}" class="w-6 h-6 rounded-full bg-neutral-800" alt="" onerror="this.onerror=null; this.src='/img/logo.png';">
                                <div>
                                  <span class="font-medium text-white">${escapeHtml(h.user_name || 'User')}</span>
                                  <span class="block text-[10px] text-neutral-500 font-mono">${escapeHtml(h.user_id)}</span>
                                </div>
                              </div>
                            </td>
                            <td class="py-3 px-3">
                              <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-950 border border-neutral-800 text-neutral-300 uppercase">${escapeHtml(h.action || 'Sanction')}</span>
                            </td>
                            <td class="py-3 px-3">
                              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}">${isAccepted ? 'ACCEPTED' : (h.status === 'pending' ? 'PENDING' : 'DENIED')}</span>
                            </td>
                            <td class="py-3 px-3 text-neutral-400">${escapeHtml(h.resolved_by || 'Staff')}</td>
                            <td class="py-3 px-3 text-neutral-500">${dateStr}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          </div>
        </div>
      `;

      bindEvents();
    }

    function bindEvents() {
      // Custom Dropdown Outside Click handler
      function closeAllCustomDropdowns() {
        container.querySelectorAll('.custom-channel-menu').forEach(menu => menu.classList.add('hidden'));
      }

      document.removeEventListener('click', closeAllCustomDropdowns);
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-channel-dd')) {
          closeAllCustomDropdowns();
        }
      });

      // Channel Dropdown Toggles
      container.querySelectorAll('.custom-channel-dd').forEach(wrapper => {
        const trigger = wrapper.querySelector('.custom-channel-trigger');
        const menu = wrapper.querySelector('.custom-channel-menu');
        const searchInput = wrapper.querySelector('.custom-dd-search');
        const items = wrapper.querySelectorAll('.dd-item');

        if (trigger && menu) {
          trigger.onclick = (e) => {
            e.stopPropagation();
            const isHidden = menu.classList.contains('hidden');
            closeAllCustomDropdowns();
            if (isHidden) {
              menu.classList.remove('hidden');
              if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
                items.forEach(it => it.classList.remove('hidden'));
              }
            }
          };
        }

        if (searchInput) {
          searchInput.oninput = () => {
            const query = searchInput.value.toLowerCase().trim();
            items.forEach(it => {
              const name = (it.dataset.channelName || '').toLowerCase();
              if (!query || name.includes(query) || it.textContent.toLowerCase().includes(query)) {
                it.classList.remove('hidden');
              } else {
                it.classList.add('hidden');
              }
            });
          };
        }

        items.forEach(it => {
          it.onclick = (e) => {
            e.stopPropagation();
            const chId = it.dataset.channelId || null;
            cfg.channel_id = chId;
            closeAllCustomDropdowns();
            renderView();
          };
        });
      });

      // Master Enabled Toggle Switch
      const toggleMaster = container.querySelector('#toggle-appeals-enabled');
      if (toggleMaster) {
        toggleMaster.onclick = () => {
          cfg.enabled = !cfg.enabled;
          updateToggleDOM(toggleMaster, cfg.enabled);
          const badge = container.querySelector('#badge-portal-status');
          if (badge) {
            badge.textContent = cfg.enabled ? 'ACTIVE' : 'DISABLED';
            if (cfg.enabled) {
              badge.className = 'px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            } else {
              badge.className = 'px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700';
            }
          }
        };
      }

      // Mention Mods Toggle Switch
      const toggleMention = container.querySelector('#toggle-mention-mods');
      if (toggleMention) {
        toggleMention.onclick = () => {
          cfg.mention_mods = !cfg.mention_mods;
          updateToggleDOM(toggleMention, cfg.mention_mods);
        };
      }

      // Invite Unbanned Toggle Switch
      const toggleInvite = container.querySelector('#toggle-invite-unbanned');
      if (toggleInvite) {
        toggleInvite.onclick = () => {
          cfg.invite_unbanned = !cfg.invite_unbanned;
          updateToggleDOM(toggleInvite, cfg.invite_unbanned);
        };
      }

      // Anonymous Mods Toggle Switch
      const toggleAnon = container.querySelector('#toggle-anon-mods');
      if (toggleAnon) {
        toggleAnon.onclick = () => {
          cfg.anonymous_mods = !cfg.anonymous_mods;
          updateToggleDOM(toggleAnon, cfg.anonymous_mods);
        };
      }

      // Repeat Appeals Toggle Switch
      const toggleRepeat = container.querySelector('#toggle-repeat-appeals');
      if (toggleRepeat) {
        toggleRepeat.onclick = () => {
          cfg.multiple_submissions = !cfg.multiple_submissions;
          updateToggleDOM(toggleRepeat, cfg.multiple_submissions);
        };
      }

      // Punishment Card Click Handlers
      container.querySelectorAll('.punishment-toggle-card').forEach(card => {
        card.onclick = () => {
          const pId = card.dataset.punishment;
          let list = Array.isArray(cfg.allowed_punishments) ? [...cfg.allowed_punishments] : ['ban', 'timeout'];
          if (list.includes(pId)) {
            list = list.filter(x => x !== pId);
          } else {
            list.push(pId);
          }
          cfg.allowed_punishments = list;
          renderView();
        };
      });

      // Copy Link Button
      const copyBtn = container.querySelector('#btn-copy-portal-link');
      if (copyBtn) {
        copyBtn.onclick = () => {
          const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
          const portalUrl = `${origin}/appeal/${encodeURIComponent(cfg.custom_url || 'orbit')}`;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(portalUrl).then(() => {
              showNotify('Portal link copied to clipboard!');
            }).catch(() => {
              prompt('Copy link:', portalUrl);
            });
          } else {
            prompt('Copy link:', portalUrl);
          }
        };
      }

      // Vanity URL input
      const inpUrl = container.querySelector('#inp-custom-url');
      if (inpUrl) {
        inpUrl.oninput = (e) => {
          cfg.custom_url = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        };
      }

      // Cooldown Selector
      const selCooldown = container.querySelector('#sel-cooldown-days');
      if (selCooldown) {
        selCooldown.onchange = (e) => {
          cfg.cooldown_days = parseInt(e.target.value, 10) || 0;
        };
      }

      // Remove Role
      container.querySelectorAll('.btn-remove-role').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const roleId = btn.dataset.roleId;
          cfg.mod_roles = (cfg.mod_roles || []).filter(r => String(r) !== String(roleId));
          renderView();
        };
      });

      // Add Role Selector
      const selAddRole = container.querySelector('#sel-add-role');
      if (selAddRole) {
        selAddRole.onchange = (e) => {
          const roleId = e.target.value;
          if (roleId && !(cfg.mod_roles || []).includes(String(roleId))) {
            if (!Array.isArray(cfg.mod_roles)) cfg.mod_roles = [];
            cfg.mod_roles.push(String(roleId));
            renderView();
          }
        };
      }

      // Questionnaire Add / Delete Logic
      const btnAddQ = container.querySelector('#btn-add-question');
      const newQBox = container.querySelector('#new-question-box');
      const btnCancelNewQ = container.querySelector('#btn-cancel-new-q');
      const btnConfirmNewQ = container.querySelector('#btn-confirm-new-q');

      if (btnAddQ && newQBox) {
        btnAddQ.onclick = () => {
          newQBox.classList.remove('hidden');
          const inp = container.querySelector('#inp-new-q-label');
          if (inp) inp.focus();
        };
      }

      if (btnCancelNewQ && newQBox) {
        btnCancelNewQ.onclick = () => {
          newQBox.classList.add('hidden');
        };
      }

      if (btnConfirmNewQ) {
        btnConfirmNewQ.onclick = () => {
          const labelInp = container.querySelector('#inp-new-q-label');
          const placeInp = container.querySelector('#inp-new-q-placeholder');
          const reqChk = container.querySelector('#chk-new-q-required');

          const label = labelInp?.value?.trim();
          if (!label) {
            showNotify('Please enter a question prompt.', 'error');
            return;
          }

          const newQ = {
            id: 'q_' + Date.now(),
            label: label,
            placeholder: placeInp?.value?.trim() || 'Your response...',
            required: reqChk ? reqChk.checked : true
          };

          if (!Array.isArray(cfg.custom_questions)) cfg.custom_questions = [];
          cfg.custom_questions.push(newQ);
          renderView();
        };
      }

      container.querySelectorAll('.btn-del-question').forEach(btn => {
        btn.onclick = () => {
          const qId = btn.dataset.qId;
          cfg.custom_questions = (cfg.custom_questions || []).filter(q => q.id !== qId);
          renderView();
        };
      });

      // Queue / History Tab Switching
      const tabBtnQueue = container.querySelector('#tab-btn-queue');
      const tabBtnHistory = container.querySelector('#tab-btn-history');
      if (tabBtnQueue) {
        tabBtnQueue.onclick = () => {
          activeTab = 'queue';
          renderView();
        };
      }
      if (tabBtnHistory) {
        tabBtnHistory.onclick = () => {
          activeTab = 'history';
          renderView();
        };
      }

      // Refresh Queue Button
      const btnRefresh = container.querySelector('#btn-refresh-queue');
      if (btnRefresh) {
        btnRefresh.onclick = async () => {
          btnRefresh.disabled = true;
          btnRefresh.classList.add('opacity-50');
          try {
            const [openRes, histRes] = await Promise.all([
              API.getAppeals(guildId, true).catch(() => []),
              API.getAppealsHistory(guildId, true).catch(() => [])
            ]);
            openAppeals = Array.isArray(openRes) ? openRes : [];
            appealsHistory = Array.isArray(histRes) ? histRes : [];
            renderView();
            showNotify('Queue refreshed!');
          } catch (err) {
            showNotify('Failed to refresh: ' + err.message, 'error');
          }
        };
      }

      // Accept Appeal
      container.querySelectorAll('.btn-accept-appeal').forEach(btn => {
        btn.onclick = async () => {
          const userId = btn.dataset.userId;
          if (!confirm(`Are you sure you want to ACCEPT the appeal for user ID ${userId} and lift the sanction?`)) return;

          btn.disabled = true;
          btn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span> Processing...`;

          try {
            const res = await API.resolveAppeal(guildId, {
              user_id: userId,
              action: 'accept'
            });
            showNotify(res.message || 'Appeal accepted successfully!');
            const [openRes, histRes] = await Promise.all([
              API.getAppeals(guildId, true).catch(() => []),
              API.getAppealsHistory(guildId, true).catch(() => [])
            ]);
            openAppeals = Array.isArray(openRes) ? openRes : [];
            appealsHistory = Array.isArray(histRes) ? histRes : [];
            renderView();
          } catch (err) {
            showNotify('Action failed: ' + err.message, 'error');
            renderView();
          }
        };
      });

      // Deny Appeal
      container.querySelectorAll('.btn-deny-appeal').forEach(btn => {
        btn.onclick = async () => {
          const userId = btn.dataset.userId;
          if (!confirm(`Are you sure you want to DECLINE the appeal for user ID ${userId}?`)) return;

          btn.disabled = true;
          btn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></span> Processing...`;

          try {
            const res = await API.resolveAppeal(guildId, {
              user_id: userId,
              action: 'decline'
            });
            showNotify(res.message || 'Appeal declined.');
            const [openRes, histRes] = await Promise.all([
              API.getAppeals(guildId, true).catch(() => []),
              API.getAppealsHistory(guildId, true).catch(() => [])
            ]);
            openAppeals = Array.isArray(openRes) ? openRes : [];
            appealsHistory = Array.isArray(histRes) ? histRes : [];
            renderView();
          } catch (err) {
            showNotify('Action failed: ' + err.message, 'error');
            renderView();
          }
        };
      });

      // Top Save Changes Button
      const btnSave = container.querySelector('#btn-save-appeals');
      if (btnSave) {
        btnSave.onclick = async () => {
          btnSave.disabled = true;
          btnSave.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span> Saving...`;

          try {
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
            showNotify('Ban Appeals settings saved successfully!');
            renderView();
          } catch (err) {
            console.error('Save failed:', err);
            showNotify('Failed to save settings: ' + err.message, 'error');
            renderView();
          }
        };
      }
    }

    renderView();
  };
})();
