/**
 * Orbit Dashboard - Ban Appeals Tab (/dashboard/:guildId/appeals)
 * Modern Pixel-Perfect PeakBot-Styled Management Suite & Live Review Queue
 */

DashboardTabs.Appeals = async function (container, guildId) {
  const esc = (s) => (s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '');

  // Render initial loading skeleton
  container.innerHTML = `
    <div class="flex items-center justify-center min-h-[400px]">
      <div class="flex items-center gap-3 text-neutral-400">
        <svg class="animate-spin w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm font-medium">Loading Ban Appeals System...</span>
      </div>
    </div>
  `;

  // Inline SVGs
  const SVGS = {
    scale: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>`,
    link: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`,
    externalLink: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
    shieldCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    inbox: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`,
    refresh: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    history: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><polyline points="12 7 12 12 15 15"></polyline></svg>`
  };

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
      { id: 'q1', label: 'Why were you banned or sanctioned?', placeholder: 'Explain the context...', required: true },
      { id: 'q2', label: 'Why should the staff reconsider your punishment?', placeholder: 'Describe what has changed...', required: true }
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
          { id: 'q1', label: 'Why were you banned or sanctioned?', placeholder: 'Explain the context...', required: true },
          { id: 'q2', label: 'Why should the staff reconsider your punishment?', placeholder: 'Describe what has changed...', required: true }
        ];
      }
    }

    const chList = Array.isArray(configData?.channels) ? configData.channels : [];
    const rList = Array.isArray(configData?.roles) ? configData.roles : [];
    channels = chList.filter(c => !c.type || c.type === 'text' || c.type === 0 || (typeof c.type === 'string' && c.type.includes('text')));
    roles = rList.filter(r => !r.managed && r.name !== '@everyone');
    openAppeals = Array.isArray(openRes) ? openRes : [];
    appealsHistory = Array.isArray(histRes) ? histRes : [];
  } catch (err) {
    console.error('Failed to load appeals data:', err);
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12 select-none">
        <h2 class="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">Failed to load Ban Appeals</h2>
        <p class="text-sm font-semibold text-neutral-400 max-w-md mb-6">${esc(err.message || 'Unknown error occurred.')}</p>
        <button id="btn-retry-appeals" class="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-md">Retry</button>
      </div>
    `;
    const retryBtn = container.querySelector('#btn-retry-appeals');
    if (retryBtn) retryBtn.onclick = () => DashboardTabs.Appeals(container, guildId);
    return;
  }

  function renderView() {
    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
    const portalUrl = `${origin}/appeal/${encodeURIComponent(cfg.custom_url || 'orbit')}`;

    container.innerHTML = `
      <div class="space-y-6 pb-20 animate-fade-in max-w-5xl mx-auto">
        <!-- Top Bar / Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Moderation</span>
              <span class="text-xs text-neutral-500">•</span>
              <span class="text-xs text-neutral-400">Pardon & Review System</span>
            </div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Ban Appeals System</h1>
            <p class="text-xs text-neutral-400 mt-1">Branded pardon portal, custom form builder, and live moderation queue for sanctioned members.</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <a href="${portalUrl}" target="_blank" class="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95">
              ${SVGS.externalLink}
              <span>Preview Portal</span>
            </a>
            <button type="button" id="btn-save-appeals" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-sm active:scale-95">
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        <!-- Master Switch Card -->
        <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              ${SVGS.scale}
            </div>
            <div>
              <div class="flex items-center gap-2.5">
                <span class="text-sm font-semibold text-white">Enable Appeals Portal</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${cfg.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-400'}">${cfg.enabled ? 'ACTIVE' : 'DISABLED'}</span>
              </div>
              <p class="text-xs text-neutral-400 mt-1">Allow banned and sanctioned users to access your public appeal portal and request reviews.</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0">
            <input type="checkbox" id="chk-appeals-enabled" class="sr-only peer" ${cfg.enabled ? 'checked' : ''}>
            <div class="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
          </label>
        </div>

        <!-- Vanity Portal URL Card -->
        <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-sm font-semibold text-white">Vanity Portal Address</span>
              <span class="text-xs text-neutral-500 font-mono">/appeal/:slug</span>
            </div>
            <button type="button" id="btn-copy-portal-link" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors">
              ${SVGS.copy}
              <span>Copy Link</span>
            </button>
          </div>
          <p class="text-xs text-neutral-400">Share this direct link in your ban DM notifications, server rules, or website.</p>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div class="flex-1 flex items-center rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden focus-within:border-neutral-600 transition-colors">
              <span class="px-3.5 py-2.5 bg-neutral-900/60 border-r border-neutral-800 text-xs text-neutral-500 font-mono select-none">${origin}/appeal/</span>
              <input type="text" id="inp-custom-url" value="${esc(cfg.custom_url || '')}" placeholder="orbit" class="flex-1 px-3 py-2.5 bg-transparent text-white text-xs font-mono focus:outline-none">
            </div>
            <a href="${portalUrl}" target="_blank" class="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
              ${SVGS.externalLink}
              <span>Open Portal</span>
            </a>
          </div>
        </div>

        <!-- Staff Review & Channel Routing -->
        <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-6">
          <div class="border-b border-neutral-800/80 pb-4">
            <h3 class="text-sm font-semibold text-white">Staff Routing & Review Team</h3>
            <p class="text-xs text-neutral-400 mt-1">Configure where submissions are sent and who is allowed to review them.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Channel Selector -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-neutral-300">Staff Review Channel</label>
              <p class="text-[11px] text-neutral-500">Orbit will dispatch an interactive appeal embed with Accept/Deny buttons to this channel.</p>
              <select id="sel-appeal-channel" class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-600">
                <option value="" ${!cfg.channel_id ? 'selected' : ''}>-- Select a channel --</option>
                ${channels.map(c => `
                  <option value="${c.id}" ${String(cfg.channel_id) === String(c.id) ? 'selected' : ''}># ${esc(c.name)}</option>
                `).join('')}
              </select>
            </div>

            <!-- Ping Staff Option -->
            <div class="flex flex-col justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <span class="text-xs font-semibold text-white">Notify Review Roles</span>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Mention authorized reviewer roles when an appeal is submitted.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" id="chk-mention-mods" class="sr-only peer" ${cfg.mention_mods ? 'checked' : ''}>
                  <div class="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Mod Roles Multi-Select -->
          <div class="flex flex-col gap-2.5 pt-2">
            <label class="text-xs font-semibold text-neutral-300">Moderator Review Roles</label>
            <p class="text-[11px] text-neutral-500">Select roles permitted to decide upon ban appeals via the dashboard and Discord buttons.</p>
            <div id="roles-selector-container" class="flex flex-wrap gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 min-h-[46px] items-center">
              ${(cfg.mod_roles || []).map(rId => {
                const r = roles.find(x => String(x.id) === String(rId));
                const name = r ? r.name : `Role (${rId})`;
                const color = (r && r.color && r.color !== 0) ? `#${r.color.toString(16).padStart(6, '0')}` : '#818cf8';
                return `
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-200" data-role-id="${rId}">
                    <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${color}"></span>
                    <span>${esc(name)}</span>
                    <button type="button" class="btn-remove-role hover:text-red-400 transition-colors p-0.5" data-role-id="${rId}">${SVGS.x}</button>
                  </span>
                `;
              }).join('')}
              <select id="sel-add-role" class="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 hover:text-white focus:outline-none cursor-pointer">
                <option value="">+ Add Review Role</option>
                ${roles.filter(r => !(cfg.mod_roles || []).includes(String(r.id))).map(r => `
                  <option value="${r.id}">@ ${esc(r.name)}</option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Workflow Policy & Settings -->
        <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-6">
          <div class="border-b border-neutral-800/80 pb-4">
            <h3 class="text-sm font-semibold text-white">Appeals Policy & Automation</h3>
            <p class="text-xs text-neutral-400 mt-1">Control which punishment types are appealable and the automated behavior upon resolution.</p>
          </div>

          <!-- Allowed Punishments -->
          <div class="flex flex-col gap-3">
            <label class="text-xs font-semibold text-neutral-300">Sanction Types Allowed to Appeal</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              ${[
                { id: 'ban', label: 'Bans', desc: 'Server banned users' },
                { id: 'timeout', label: 'Timeouts', desc: 'Muted / timed out users' },
                { id: 'kick', label: 'Kicks', desc: 'Previously kicked members' },
                { id: 'warn', label: 'Warnings', desc: 'Warned members' }
              ].map(p => {
                const isChecked = (cfg.allowed_punishments || []).includes(p.id);
                return `
                  <label class="flex flex-col gap-1 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-all ${isChecked ? 'ring-1 ring-neutral-600' : ''}">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-semibold text-white">${p.label}</span>
                      <input type="checkbox" value="${p.id}" class="chk-punishment-type rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0" ${isChecked ? 'checked' : ''}>
                    </div>
                    <span class="text-[10px] text-neutral-500">${p.desc}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Policy Toggles Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <!-- Auto-Invite Unbanned -->
            <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-3">
              <div>
                <span class="text-xs font-semibold text-white">Auto-Invite Accepted Bans</span>
                <p class="text-[11px] text-neutral-500 mt-0.5">Send a one-time server invite link via Discord DM when a ban appeal is approved.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" id="chk-invite-unbanned" class="sr-only peer" ${cfg.invite_unbanned !== false ? 'checked' : ''}>
                <div class="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white"></div>
              </label>
            </div>

            <!-- Anonymous Moderation -->
            <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-3">
              <div>
                <span class="text-xs font-semibold text-white">Anonymous Moderator Decisions</span>
                <p class="text-[11px] text-neutral-500 mt-0.5">Conceal the moderator's identity from the appellant, showing "Staff Team".</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" id="chk-anonymous-mods" class="sr-only peer" ${cfg.anonymous_mods ? 'checked' : ''}>
                <div class="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white"></div>
              </label>
            </div>

            <!-- Cooldown Days -->
            <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col gap-2">
              <label class="text-xs font-semibold text-white">Re-Application Cooldown</label>
              <p class="text-[11px] text-neutral-500">Wait period before a denied user can submit another appeal.</p>
              <select id="sel-cooldown-days" class="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none">
                <option value="0" ${cfg.cooldown_days === 0 ? 'selected' : ''}>None (Immediate)</option>
                <option value="1" ${cfg.cooldown_days === 1 ? 'selected' : ''}>1 Day</option>
                <option value="3" ${cfg.cooldown_days === 3 ? 'selected' : ''}>3 Days</option>
                <option value="7" ${cfg.cooldown_days === 7 ? 'selected' : ''}>7 Days</option>
                <option value="14" ${cfg.cooldown_days === 14 ? 'selected' : ''}>14 Days</option>
                <option value="30" ${cfg.cooldown_days === 30 ? 'selected' : ''}>30 Days</option>
              </select>
            </div>

            <!-- Multiple Submissions -->
            <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-3">
              <div>
                <span class="text-xs font-semibold text-white">Allow Repeat Appeals</span>
                <p class="text-[11px] text-neutral-500 mt-0.5">Allow users whose appeal was denied to re-apply after the cooldown expires.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" id="chk-multiple-submissions" class="sr-only peer" ${cfg.multiple_submissions ? 'checked' : ''}>
                <div class="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Custom Questionnaire / Form Builder -->
        <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-5">
          <div class="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div>
              <h3 class="text-sm font-semibold text-white">Appeals Questionnaire Builder</h3>
              <p class="text-xs text-neutral-400 mt-1">Questions displayed to the appellant on the public portal form.</p>
            </div>
            <button type="button" id="btn-add-question" class="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
              ${SVGS.plus}
              <span>Add Question</span>
            </button>
          </div>

          <div id="questions-list" class="flex flex-col gap-3">
            ${(cfg.custom_questions || []).map((q, idx) => `
              <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4 group hover:border-neutral-700 transition-all" data-q-id="${q.id}">
                <div class="flex items-center gap-3.5 flex-1 min-w-0">
                  <span class="w-6 h-6 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] font-bold text-neutral-400 flex items-center justify-center shrink-0">Q${idx + 1}</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-xs font-semibold text-white truncate">${esc(q.label)}</p>
                      ${q.required ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Required</span>' : '<span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-neutral-900 text-neutral-500">Optional</span>'}
                    </div>
                    <p class="text-[11px] text-neutral-500 truncate mt-0.5">${esc(q.placeholder || 'No placeholder specified')}</p>
                  </div>
                </div>
                <button type="button" class="btn-del-question p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-900 transition-colors" data-q-id="${q.id}" title="Delete Question">
                  ${SVGS.trash}
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Moderation Queue & Decision History -->
        <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
            <div class="flex items-center gap-2">
              <button type="button" id="tab-btn-queue" class="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'queue' ? 'bg-white text-black' : 'bg-neutral-950 text-neutral-400 hover:text-white'}">
                ${SVGS.inbox}
                <span>Pending Queue</span>
                <span class="px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'queue' ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'}">${openAppeals.length}</span>
              </button>
              <button type="button" id="tab-btn-history" class="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-black' : 'bg-neutral-950 text-neutral-400 hover:text-white'}">
                ${SVGS.history}
                <span>Decision History</span>
                <span class="px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'history' ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'}">${appealsHistory.length}</span>
              </button>
            </div>
            <button type="button" id="btn-refresh-queue" class="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto">
              ${SVGS.refresh}
              <span>Refresh</span>
            </button>
          </div>

          <!-- Pending Queue Tab Content -->
          <div id="queue-content-panel" class="${activeTab === 'queue' ? '' : 'hidden'}">
            ${openAppeals.length === 0 ? `
              <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div class="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-800 text-emerald-400 flex items-center justify-center mb-4">
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
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
                        <div class="flex items-center gap-3">
                          <img src="${avatarUrl}" class="w-10 h-10 rounded-xl object-cover bg-neutral-900 border border-neutral-800 shrink-0" alt="Avatar">
                          <div>
                            <div class="flex items-center gap-2">
                              <span class="text-xs font-bold text-white">${esc(a.user_name || 'Discord User')}</span>
                              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">${esc(a.action || 'Sanction')}</span>
                            </div>
                            <span class="text-[11px] text-neutral-500 font-mono">ID: ${esc(a.user_id)}</span>
                          </div>
                        </div>
                        <div class="flex items-center gap-2 text-neutral-500 text-[11px]">
                          ${SVGS.clock}
                          <span>${dateStr}</span>
                        </div>
                      </div>

                      <div class="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-xs text-neutral-300 leading-relaxed font-sans">
                        <p class="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Appellant's Statement</p>
                        <p class="whitespace-pre-wrap">${esc(a.reason || 'No statement provided.')}</p>
                      </div>

                      <div class="flex items-center justify-end gap-3 pt-1">
                        <button type="button" class="btn-deny-appeal px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95" data-user-id="${a.user_id}">
                          ${SVGS.x}
                          <span>Deny Appeal</span>
                        </button>
                        <button type="button" class="btn-accept-appeal px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-500/10" data-user-id="${a.user_id}">
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
                <div class="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-500 flex items-center justify-center mb-4">
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
                              <img src="${h.user_avatar || '/img/logo.png'}" class="w-6 h-6 rounded-full bg-neutral-800" alt="">
                              <div>
                                <span class="font-medium text-white">${esc(h.user_name || 'User')}</span>
                                <span class="block text-[10px] text-neutral-500">${esc(h.user_id)}</span>
                              </div>
                            </div>
                          </td>
                          <td class="py-3 px-3">
                            <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-950 border border-neutral-800 text-neutral-300">${esc(h.action || 'Sanction')}</span>
                          </td>
                          <td class="py-3 px-3">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}">${isAccepted ? 'ACCEPTED' : (h.status === 'pending' ? 'PENDING' : 'DENIED')}</span>
                          </td>
                          <td class="py-3 px-3 text-neutral-400">${esc(h.resolved_by || 'Staff')}</td>
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
    // Master Enabled Toggle
    const chkEnabled = container.querySelector('#chk-appeals-enabled');
    if (chkEnabled) {
      chkEnabled.onchange = (e) => {
        cfg.enabled = e.target.checked;
        renderView();
      };
    }

    // Copy Link button
    const copyBtn = container.querySelector('#btn-copy-portal-link');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
    const portalUrl = `${origin}/appeal/${encodeURIComponent(cfg.custom_url || 'orbit')}`;
        navigator.clipboard.writeText(portalUrl).then(() => {
          if (window.Toast && Toast.success) Toast.success('Appeal portal link copied to clipboard!');
        }).catch(() => {
          prompt('Copy link:', portalUrl);
        });
      };
    }

    // Vanity URL input
    const inpUrl = container.querySelector('#inp-custom-url');
    if (inpUrl) {
      inpUrl.oninput = (e) => {
        cfg.custom_url = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      };
    }

    // Channel Selector
    const selChannel = container.querySelector('#sel-appeal-channel');
    if (selChannel) {
      selChannel.onchange = (e) => {
        cfg.channel_id = e.target.value ? String(e.target.value) : null;
      };
    }

    // Mention Staff Toggle
    const chkMention = container.querySelector('#chk-mention-mods');
    if (chkMention) {
      chkMention.onchange = (e) => {
        cfg.mention_mods = e.target.checked;
      };
    }

    // Auto-Invite Toggle
    const chkInvite = container.querySelector('#chk-invite-unbanned');
    if (chkInvite) {
      chkInvite.onchange = (e) => {
        cfg.invite_unbanned = e.target.checked;
      };
    }

    // Anonymous Mods Toggle
    const chkAnon = container.querySelector('#chk-anonymous-mods');
    if (chkAnon) {
      chkAnon.onchange = (e) => {
        cfg.anonymous_mods = e.target.checked;
      };
    }

    // Cooldown Selector
    const selCooldown = container.querySelector('#sel-cooldown-days');
    if (selCooldown) {
      selCooldown.onchange = (e) => {
        cfg.cooldown_days = parseInt(e.target.value, 10) || 0;
      };
    }

    // Multiple Submissions Toggle
    const chkMultiple = container.querySelector('#chk-multiple-submissions');
    if (chkMultiple) {
      chkMultiple.onchange = (e) => {
        cfg.multiple_submissions = e.target.checked;
      };
    }

    // Punishment Checkboxes
    container.querySelectorAll('.chk-punishment-type').forEach(chk => {
      chk.onchange = () => {
        const checked = Array.from(container.querySelectorAll('.chk-punishment-type:checked')).map(c => c.value);
        cfg.allowed_punishments = checked;
      };
    });

    // Remove Role
    container.querySelectorAll('.btn-remove-role').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const roleId = btn.dataset.roleId;
        cfg.mod_roles = (cfg.mod_roles || []).filter(r => String(r) !== String(roleId));
        renderView();
      };
    });

    // Add Role
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

    // Delete Question
    container.querySelectorAll('.btn-del-question').forEach(btn => {
      btn.onclick = () => {
        const qId = btn.dataset.qId;
        cfg.custom_questions = (cfg.custom_questions || []).filter(q => q.id !== qId);
        renderView();
      };
    });

    // Add Question Button
    const btnAddQ = container.querySelector('#btn-add-question');
    if (btnAddQ) {
      btnAddQ.onclick = () => {
        const label = prompt('Enter your new question prompt:');
        if (label && label.trim()) {
          const newQ = {
            id: 'q_' + Date.now(),
            label: label.trim(),
            placeholder: 'Your answer...',
            required: true
          };
          if (!Array.isArray(cfg.custom_questions)) cfg.custom_questions = [];
          cfg.custom_questions.push(newQ);
          renderView();
        }
      };
    }

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

    // Refresh Queue
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
          if (window.Toast && Toast.success) Toast.success('Queue refreshed!');
        } catch (err) {
          if (window.Toast && Toast.error) Toast.error('Failed to refresh: ' + err.message);
        }
      };
    }

    // Accept Appeal
    container.querySelectorAll('.btn-accept-appeal').forEach(btn => {
      btn.onclick = async () => {
        const userId = btn.dataset.userId;
        if (!confirm(`Are you sure you want to ACCEPT the appeal for user ID ${userId} and revoke the sanction?`)) return;

        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin inline-block mr-1">⌛</span> Processing...`;

        try {
          const res = await API.resolveAppeal(guildId, {
            user_id: userId,
            action: 'accept'
          });
          if (window.Toast && Toast.success) Toast.success(res.message || 'Appeal accepted successfully!');
          // Refresh lists
          const [openRes, histRes] = await Promise.all([
            API.getAppeals(guildId, true).catch(() => []),
            API.getAppealsHistory(guildId, true).catch(() => [])
          ]);
          openAppeals = Array.isArray(openRes) ? openRes : [];
          appealsHistory = Array.isArray(histRes) ? histRes : [];
          renderView();
        } catch (err) {
          if (window.Toast && Toast.error) Toast.error('Action failed: ' + err.message);
          renderView();
        }
      };
    });

    // Deny Appeal
    container.querySelectorAll('.btn-deny-appeal').forEach(btn => {
      btn.onclick = async () => {
        const userId = btn.dataset.userId;
        if (!confirm(`Are you sure you want to DENY the appeal for user ID ${userId}?`)) return;

        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin inline-block mr-1">⌛</span> Processing...`;

        try {
          const res = await API.resolveAppeal(guildId, {
            user_id: userId,
            action: 'decline'
          });
          if (window.Toast && Toast.success) Toast.success(res.message || 'Appeal denied.');
          // Refresh lists
          const [openRes, histRes] = await Promise.all([
            API.getAppeals(guildId, true).catch(() => []),
            API.getAppealsHistory(guildId, true).catch(() => [])
          ]);
          openAppeals = Array.isArray(openRes) ? openRes : [];
          appealsHistory = Array.isArray(histRes) ? histRes : [];
          renderView();
        } catch (err) {
          if (window.Toast && Toast.error) Toast.error('Action failed: ' + err.message);
          renderView();
        }
      };
    });

    // Save Changes
    const btnSave = container.querySelector('#btn-save-appeals');
    if (btnSave) {
      btnSave.onclick = async () => {
        btnSave.disabled = true;
        btnSave.innerHTML = `
          <svg class="animate-spin w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Saving...</span>
        `;

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
          if (window.Toast && Toast.success) Toast.success('Ban Appeals settings saved successfully!');
          renderView();
        } catch (err) {
          console.error('Save failed:', err);
          if (window.Toast && Toast.error) Toast.error('Failed to save settings: ' + err.message);
          renderView();
        }
      };
    }
  }

  renderView();
};
