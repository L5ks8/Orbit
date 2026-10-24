/**
 * Orbit Dashboard - Server Stats Tab (/dashboard/:guildId/serverstats)
 * Full-featured real-time Discord Server Stats suite.
 * Features:
 * - Master enable/disable toggle
 * - Custom category name with variable support & automatic category creation
 * - Discord Category picker dropdown
 * - 4 dedicated counters matching backend cog: Users, Bots, Boosts, Roles
 * - Custom channel templates with {count}, {total}, {server}, {tier} variables
 * - Interactive variable chips with 1-click cursor insertion
 * - Instant live Discord channel sidebar preview
 * - One-click "Sync Channels Now" action with Discord API debounce protection
 * - Automatic background saving with smooth status indicator
 */

DashboardTabs.ServerStats = async function (container, guildId) {
  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const state = {
    guildName: 'My Server',
    channels: [],
    categories: [],
    serverstats: {
      enabled: false,
      category_id: '',
      category_name: '📊 Server Stats',
      users_enabled: true,
      users_name: '👥 Members: {count}',
      bots_enabled: true,
      bots_name: '🤖 Bots: {count}',
      boosts_enabled: true,
      boosts_name: '🚀 Boosts: {count}',
      roles_enabled: false,
      roles_name: '🏷️ Roles: {count}'
    },
    metrics: {
      total: 1250,
      users: 1234,
      bots: 16,
      boosts: 7,
      roles: 32,
      tier: 'Level 2'
    }
  };

  let isInitialLoading = true;
  let saveTimer = null;

  // Counter metadata definitions
  const COUNTER_DEFS = [
    {
      key: 'users',
      enabledKey: 'users_enabled',
      nameKey: 'users_name',
      title: 'Member Counter (Humans)',
      desc: 'Counts all real human members on your server, excluding bot accounts.',
      defaultTemplate: '👥 Members: {count}',
      metricKey: 'users',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      vars: [
        { token: '{count}', label: '{count}', tip: 'Human member count (e.g. 1,234)' },
        { token: '{total}', label: '{total}', tip: 'Total members including bots (e.g. 1,250)' },
        { token: '{server}', label: '{server}', tip: 'Server Name' }
      ],
      presets: ['👥 Members: {count}', '👤 Users: {count}', '👥 {server}: {count}', 'Mitglieder: {count}'],
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users text-indigo-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
    },
    {
      key: 'bots',
      enabledKey: 'bots_enabled',
      nameKey: 'bots_name',
      title: 'Bot Counter',
      desc: 'Counts all automated bot applications present on your server.',
      defaultTemplate: '🤖 Bots: {count}',
      metricKey: 'bots',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      vars: [
        { token: '{count}', label: '{count}', tip: 'Number of bots (e.g. 16)' },
        { token: '{total}', label: '{total}', tip: 'Total members (e.g. 1,250)' },
        { token: '{server}', label: '{server}', tip: 'Server Name' }
      ],
      presets: ['🤖 Bots: {count}', '⚙️ Automations: {count}', 'Bots: {count}'],
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot text-cyan-400"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>`
    },
    {
      key: 'boosts',
      enabledKey: 'boosts_enabled',
      nameKey: 'boosts_name',
      title: 'Nitro Boosts Counter',
      desc: 'Counts the live number of active Discord Nitro boosts on the guild.',
      defaultTemplate: '🚀 Boosts: {count}',
      metricKey: 'boosts',
      badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      vars: [
        { token: '{count}', label: '{count}', tip: 'Active boost count (e.g. 7)' },
        { token: '{tier}', label: '{tier}', tip: 'Boost level (e.g. Level 2)' },
        { token: '{server}', label: '{server}', tip: 'Server Name' }
      ],
      presets: ['🚀 Boosts: {count}', '✨ Nitro: {count}', '🚀 {tier} ({count} Boosts)'],
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket text-pink-400"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`
    },
    {
      key: 'roles',
      enabledKey: 'roles_enabled',
      nameKey: 'roles_name',
      title: 'Roles Counter',
      desc: 'Counts all roles created in this server.',
      defaultTemplate: '🏷️ Roles: {count}',
      metricKey: 'roles',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      vars: [
        { token: '{count}', label: '{count}', tip: 'Number of roles (e.g. 32)' },
        { token: '{server}', label: '{server}', tip: 'Server Name' }
      ],
      presets: ['🏷️ Roles: {count}', '🛡️ Ranks: {count}', 'Rollen: {count}'],
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tag text-amber-400"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path></svg>`
    }
  ];

  function renderSwitchHtml(id, checked) {
    return `
      <button type="button" id="${id}" role="switch" aria-checked="${checked ? 'true' : 'false'}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${checked ? 'bg-white' : 'bg-neutral-700'}">
        <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${checked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-900'}"></span>
      </button>
    `;
  }

  function setSwitchVisual(btnId, checked) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.setAttribute('aria-checked', checked ? 'true' : 'false');
    btn.classList.toggle('bg-white', checked);
    btn.classList.toggle('bg-neutral-700', !checked);
    const thumb = btn.querySelector('span');
    if (thumb) {
      thumb.className = `pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${checked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-900'}`;
    }
  }

  function formatTemplate(template, count) {
    if (!template) return '';
    let res = String(template);
    const cStr = Number(count).toLocaleString('en-US');
    res = res.replace(/\{count\}/gi, cStr);
    res = res.replace(/\{total\}/gi, Number(state.metrics.total).toLocaleString('en-US'));
    res = res.replace(/\{users\}/gi, Number(state.metrics.users).toLocaleString('en-US'));
    res = res.replace(/\{bots\}/gi, Number(state.metrics.bots).toLocaleString('en-US'));
    res = res.replace(/\{boosts\}/gi, Number(state.metrics.boosts).toLocaleString('en-US'));
    res = res.replace(/\{roles\}/gi, Number(state.metrics.roles).toLocaleString('en-US'));
    res = res.replace(/\{tier\}|\{level\}/gi, state.metrics.tier);
    res = res.replace(/\{server\}|\{guild\}/gi, state.guildName);
    return res;
  }

  function insertAtCursor(inputEl, textToInsert) {
    if (!inputEl) return;
    const start = inputEl.selectionStart ?? inputEl.value.length;
    const end = inputEl.selectionEnd ?? inputEl.value.length;
    const val = inputEl.value || '';
    inputEl.value = val.slice(0, start) + textToInsert + val.slice(end);
    const nextPos = start + textToInsert.length;
    inputEl.focus();
    inputEl.setSelectionRange(nextPos, nextPos);
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function scheduleSave() {
    if (isInitialLoading) return;
    const statusEl = document.getElementById('stats-save-status');
    if (statusEl) {
      statusEl.textContent = 'Saving...';
      statusEl.className = 'text-xs text-neutral-400 transition-colors';
    }
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await saveNow();
        if (statusEl) {
          statusEl.textContent = 'Saved';
          statusEl.className = 'text-xs text-emerald-400 transition-colors';
          setTimeout(() => {
            if (statusEl && statusEl.textContent === 'Saved') {
              statusEl.textContent = 'Auto-saved';
              statusEl.className = 'text-xs text-neutral-600 transition-colors';
            }
          }, 1800);
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = 'Save failed';
          statusEl.className = 'text-xs text-red-400 transition-colors';
        }
      }
    }, 600);
  }

  async function saveNow() {
    const payload = {
      serverstats: {
        enabled: Boolean(state.serverstats.enabled),
        category_id: state.serverstats.category_id || '',
        category_name: state.serverstats.category_name || '📊 Server Stats',
        users_enabled: Boolean(state.serverstats.users_enabled),
        users_name: state.serverstats.users_name || '👥 Members: {count}',
        bots_enabled: Boolean(state.serverstats.bots_enabled),
        bots_name: state.serverstats.bots_name || '🤖 Bots: {count}',
        boosts_enabled: Boolean(state.serverstats.boosts_enabled),
        boosts_name: state.serverstats.boosts_name || '🚀 Boosts: {count}',
        roles_enabled: Boolean(state.serverstats.roles_enabled),
        roles_name: state.serverstats.roles_name || '🏷️ Roles: {count}'
      }
    };
    await API.saveConfig(guildId, payload);
  }

  function getCategoryLabel(catId) {
    if (!catId) {
      return `✨ Automatically Create ("${state.serverstats.category_name || 'Server Stats'}")`;
    }
    const found = state.categories.find(c => String(c.id) === String(catId));
    return found ? `📁 ${found.name}` : `📁 Existing Category (${catId})`;
  }

  function updateLivePreview() {
    // 1. Preview category title
    const pCatName = document.getElementById('stats-preview-cat-name');
    if (pCatName) {
      const name = state.serverstats.category_name || 'SERVER STATS';
      pCatName.textContent = formatTemplate(name, state.metrics.total).toUpperCase();
    }

    // 2. Preview channel items
    const listEl = document.getElementById('stats-preview-channel-list');
    if (!listEl) return;

    const enabledCounters = COUNTER_DEFS.filter(def => state.serverstats[def.enabledKey]);

    if (!state.serverstats.enabled || enabledCounters.length === 0) {
      listEl.innerHTML = `
        <div class="px-3 py-6 text-center rounded-xl bg-neutral-900/60 border border-dashed border-neutral-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-x mx-auto w-5 h-5 text-neutral-600 mb-1.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="22" x2="16" y1="9" y2="15"></line><line x1="16" x2="22" y1="9" y2="15"></line></svg>
          <span class="text-xs font-medium text-neutral-400 block">${!state.serverstats.enabled ? 'Server Stats are currently disabled' : 'No counter channels enabled'}</span>
          <span class="text-[11px] text-neutral-600 block mt-0.5">Toggle counters on the left to see locked voice channels appear here.</span>
        </div>
      `;
      return;
    }

    listEl.innerHTML = enabledCounters.map(def => {
      const template = state.serverstats[def.nameKey] || def.defaultTemplate;
      const count = state.metrics[def.metricKey];
      const formatted = formatTemplate(template, count);

      return `
        <div class="group flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 text-xs font-medium transition-colors select-none cursor-default border border-white/[0.03]">
          <div class="flex items-center gap-2 min-w-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2 text-neutral-400 shrink-0"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            <span class="truncate font-normal tracking-wide">${esc(formatted)}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock text-neutral-500 shrink-0" title="Locked Channel"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
      `;
    }).join('');

    // Also update individual preview pills under each input
    COUNTER_DEFS.forEach(def => {
      const pill = document.getElementById(`stats-pill-${def.key}`);
      if (pill) {
        const template = state.serverstats[def.nameKey] || def.defaultTemplate;
        const count = state.metrics[def.metricKey];
        pill.textContent = formatTemplate(template, count);
      }
    });
  }

  function renderPage() {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-6xl pb-12">
        
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pb-2 border-b border-neutral-800">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart-2"><line x1="18" x2="18" y1="20" y2="10"></line><line x1="12" x2="12" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="14"></line></svg>
            </div>
            <div>
              <h1 class="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                Server Stats Counters
                <span class="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 h-[19px] px-2 rounded-[6px] text-[9.5px]">Live Sync</span>
              </h1>
              <p class="text-xs text-neutral-400 mt-0.5">Automated locked voice channels displaying real-time metrics for members, bots, boosts, and roles.</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span id="stats-save-status" class="text-xs text-neutral-600 transition-colors">Auto-saved</span>
            <button type="button" id="stats-sync-btn" class="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer active:scale-[0.97] shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>Sync Channels Now</span>
            </button>
          </div>
        </div>

        <!-- Master Switch Card -->
        <div class="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex items-center justify-between gap-4">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-power"><path d="M12 2v10"></path><path d="M18.4 6.6a9 9 0 1 1-12.77.04"></path></svg>
            </div>
            <div>
              <span class="text-sm font-semibold text-white block">Enable Server Stats</span>
              <p class="text-xs text-neutral-400 mt-0.5">When active, Orbit generates and updates voice channels in your server matching the formats below.</p>
            </div>
          </div>
          <div class="shrink-0 flex items-center">
            ${renderSwitchHtml('stats-master-switch', state.serverstats.enabled)}
          </div>
        </div>

        <!-- Main Layout: 2 Columns (Configuration + Discord Sidebar Preview) -->
        <div class="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6 items-start">
          
          <!-- Left: Counters & Category Settings -->
          <div class="space-y-6">
            
            <!-- Category Settings Card -->
            <div class="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder text-neutral-400"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path></svg>
                  <h2 class="text-sm font-semibold text-white">Category Placement</h2>
                </div>
                <span class="text-[11px] text-neutral-500 font-mono">category_id</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Category Name Input -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-medium text-neutral-300">Category Display Name</label>
                  <input type="text" id="stats-cat-name-input" value="${esc(state.serverstats.category_name || '📊 Server Stats')}" placeholder="📊 Server Stats" class="w-full h-10 px-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:outline-none focus:border-neutral-500 transition-colors">
                  <p class="text-[11px] text-neutral-500">Name given when creating or renaming the category.</p>
                </div>

                <!-- Category Dropdown Selector -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-medium text-neutral-300">Target Category</label>
                  <div class="relative w-full" id="stats-category-dropdown-wrap">
                    <button type="button" id="stats-category-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-xs text-left transition-all border-neutral-700 hover:border-neutral-600 cursor-pointer text-white">
                      <span id="stats-category-label" class="truncate">${esc(getCategoryLabel(state.serverstats.category_id))}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down text-neutral-400 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
                    </button>
                    <div id="stats-category-menu" style="z-index: 99999;" class="orbit-dropdown-menu hidden absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl py-1">
                      <button type="button" data-cat="" class="stats-cat-opt w-full px-3 py-2 text-left text-xs ${!state.serverstats.category_id ? 'bg-white/10 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'} transition-colors flex items-center gap-1.5">
                        <span>✨ Automatically Create Category</span>
                      </button>
                      <div class="my-1 border-t border-neutral-800"></div>
                      ${state.categories.length === 0 ? `
                        <div class="px-3 py-2 text-[11px] text-neutral-500 italic">No existing categories found</div>
                      ` : state.categories.map(cat => `
                        <button type="button" data-cat="${esc(cat.id)}" class="stats-cat-opt w-full px-3 py-2 text-left text-xs ${String(state.serverstats.category_id) === String(cat.id) ? 'bg-white/10 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'} transition-colors truncate flex items-center gap-1.5">
                          <span>📁</span> <span class="truncate">${esc(cat.name)}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>
                  <p class="text-[11px] text-neutral-500">Select an existing category or create automatically.</p>
                </div>
              </div>
            </div>

            <!-- Four Counter Configuration Cards -->
            <div class="space-y-4">
              <div class="flex items-center justify-between px-1">
                <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Stat Counter Channels</span>
                <span class="text-xs text-neutral-500">Each counter creates a locked voice channel</span>
              </div>

              ${COUNTER_DEFS.map(def => {
                const isEnabled = Boolean(state.serverstats[def.enabledKey]);
                const val = state.serverstats[def.nameKey] || def.defaultTemplate;
                const count = state.metrics[def.metricKey];
                const previewStr = formatTemplate(val, count);

                return `
                  <div class="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] space-y-4 transition-all">
                    
                    <!-- Counter Top Bar -->
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex items-start gap-3.5 min-w-0">
                        <div class="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0">
                          ${def.iconSvg}
                        </div>
                        <div class="min-w-0">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-sm font-semibold text-white">${esc(def.title)}</span>
                            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full border ${def.badgeColor}">
                              Count: ${Number(count).toLocaleString('en-US')}
                            </span>
                          </div>
                          <p class="text-xs text-neutral-400 mt-0.5">${esc(def.desc)}</p>
                        </div>
                      </div>
                      <div class="shrink-0 flex items-center">
                        ${renderSwitchHtml(`stats-toggle-${def.key}`, isEnabled)}
                      </div>
                    </div>

                    <!-- Counter Input & Pills (Folded or Dimmed when disabled) -->
                    <div class="space-y-3 pt-3 border-t border-neutral-800/60 ${isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'} transition-opacity">
                      
                      <!-- Channel Name Input -->
                      <div class="space-y-1.5">
                        <div class="flex items-center justify-between">
                          <label class="block text-xs font-medium text-neutral-300">Channel Name Template</label>
                          <span class="text-[11px] text-neutral-500">Live preview: <span id="stats-pill-${def.key}" class="font-mono text-cyan-400 font-medium">${esc(previewStr)}</span></span>
                        </div>
                        <div class="relative">
                          <input type="text" id="stats-input-${def.key}" value="${esc(val)}" placeholder="${esc(def.defaultTemplate)}" class="w-full h-10 pl-3 pr-28 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-mono focus:outline-none focus:border-neutral-500 transition-colors">
                          <button type="button" data-reset-target="stats-input-${def.key}" data-reset-val="${esc(def.defaultTemplate)}" class="stats-reset-btn absolute right-2 top-2 px-2 py-1 rounded-lg bg-neutral-700/60 hover:bg-neutral-700 text-[10px] font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer" title="Reset to default template">
                            Reset
                          </button>
                        </div>
                      </div>

                      <!-- Variable Insertion Chips + Presets -->
                      <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="text-[11px] text-neutral-500 font-medium mr-1">Insert Variable:</span>
                          ${def.vars.map(v => `
                            <button type="button" data-input-target="stats-input-${def.key}" data-var="${esc(v.token)}" title="${esc(v.tip)}" class="stats-var-chip px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-cyan-300 hover:text-cyan-200 text-xs font-mono transition-all cursor-pointer active:scale-95">
                              ${esc(v.label)}
                            </button>
                          `).join('')}
                        </div>

                        <!-- Presets Dropdown or Chips -->
                        <div class="flex items-center gap-1 flex-wrap">
                          <span class="text-[11px] text-neutral-500 font-medium mr-1">Presets:</span>
                          ${def.presets.map(p => `
                            <button type="button" data-input-target="stats-input-${def.key}" data-set-val="${esc(p)}" class="stats-preset-chip px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/80 text-neutral-300 hover:text-white text-[11px] transition-all cursor-pointer">
                              ${esc(p)}
                            </button>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Discord Rate Limit Notice -->
            <div class="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info shrink-0 mt-0.5 text-blue-400"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              <div class="space-y-1">
                <span class="font-semibold text-blue-200 block">Discord Channel Rename Cooldown Protection</span>
                <p class="text-blue-300/80 leading-relaxed">
                  Discord allows maximum 2 channel renames per 10 minutes per channel. Orbit automatically throttles and debounces updates every 5 to 10 minutes so your server never hits Discord rate limits.
                </p>
              </div>
            </div>

          </div>

          <!-- Right: Live Discord Channel Sidebar Mockup -->
          <div class="sticky top-6 space-y-4">
            
            <div class="rounded-2xl bg-[#2b2d31] border border-neutral-700/40 shadow-2xl overflow-hidden">
              
              <!-- Discord Server Top Banner -->
              <div class="bg-[#1f2023] px-4 py-3 flex items-center justify-between border-b border-black/20 shadow-sm">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-xs font-bold text-white tracking-wide truncate">${esc(state.guildName)}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-check text-indigo-400 shrink-0"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path></svg>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down text-neutral-400"><path d="m6 9 6 6 6-6"></path></svg>
              </div>

              <!-- Channel Tree Mockup Body -->
              <div class="p-3 space-y-3 font-sans">
                
                <!-- Category Row -->
                <div class="flex items-center gap-1.5 px-1 text-[11px] font-bold text-neutral-400 tracking-wider">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" class="lucide lucide-play rotate-90 text-neutral-400"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                  <span id="stats-preview-cat-name" class="truncate uppercase">${esc((state.serverstats.category_name || 'SERVER STATS').toUpperCase())}</span>
                </div>

                <!-- Channel Items List -->
                <div id="stats-preview-channel-list" class="space-y-1 pl-1">
                  <!-- Injected via updateLivePreview -->
                </div>

                <!-- Normal Channels Below For Realism -->
                <div class="pt-3 border-t border-white/5 space-y-1">
                  <div class="flex items-center gap-1.5 px-1 text-[11px] font-bold text-neutral-500 tracking-wider">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" class="rotate-90 text-neutral-500"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                    <span>TEXT CHANNELS</span>
                  </div>
                  <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-400 text-xs">
                    <span class="text-neutral-500 font-bold">#</span>
                    <span>announcements</span>
                  </div>
                  <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium">
                    <span class="text-neutral-300 font-bold">#</span>
                    <span>general-chat</span>
                  </div>
                </div>

              </div>
            </div>

            <!-- Help Box -->
            <div class="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 space-y-1.5">
              <span class="font-semibold text-neutral-200 block">💡 Pro Tip</span>
              <p class="leading-relaxed text-[11px] text-neutral-400">
                You can add any Discord emoji or unicode character directly into the template. The bot locks the voice channels so no members can join them.
              </p>
            </div>

          </div>
        </div>

      </div>
    `;

    updateLivePreview();
    bindEvents();
  }

  function bindEvents() {
    // 1. Master Toggle
    const masterBtn = document.getElementById('stats-master-switch');
    if (masterBtn) {
      masterBtn.onclick = (e) => {
        e.stopPropagation();
        state.serverstats.enabled = !state.serverstats.enabled;
        setSwitchVisual('stats-master-switch', state.serverstats.enabled);
        updateLivePreview();
        scheduleSave();
      };
    }

    // 2. Category Name Input
    const catNameInput = document.getElementById('stats-cat-name-input');
    if (catNameInput) {
      catNameInput.addEventListener('input', (e) => {
        state.serverstats.category_name = e.target.value;
        const catLabel = document.getElementById('stats-category-label');
        if (catLabel && !state.serverstats.category_id) {
          catLabel.textContent = getCategoryLabel('');
        }
        updateLivePreview();
        scheduleSave();
      });
    }

    // 3. Category Dropdown
    const catBtn = document.getElementById('stats-category-btn');
    const catMenu = document.getElementById('stats-category-menu');
    if (catBtn && catMenu) {
      catBtn.onclick = (e) => {
        e.stopPropagation();
        catMenu.classList.toggle('hidden');
        if (!catMenu.classList.contains('hidden') && window.OrbitDropdownManager) {
          window.OrbitDropdownManager.scheduleSync();
        }
      };

      document.querySelectorAll('.stats-cat-opt').forEach(opt => {
        opt.onclick = (e) => {
          e.stopPropagation();
          const chosenCat = opt.getAttribute('data-cat') || '';
          state.serverstats.category_id = chosenCat;
          catMenu.classList.add('hidden');
          const catLabel = document.getElementById('stats-category-label');
          if (catLabel) catLabel.textContent = getCategoryLabel(chosenCat);

          // Update active option styling
          document.querySelectorAll('.stats-cat-opt').forEach(b => {
            const isMatch = (b.getAttribute('data-cat') || '') === chosenCat;
            b.className = `stats-cat-opt w-full px-3 py-2 text-left text-xs ${isMatch ? 'bg-white/10 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'} transition-colors flex items-center gap-1.5`;
          });

          updateLivePreview();
          scheduleSave();
        };
      });

      document.addEventListener('click', () => {
        catMenu?.classList.add('hidden');
      });
    }

    // 4. Counter Toggles & Template Inputs
    COUNTER_DEFS.forEach(def => {
      // Toggle Switch
      const tBtn = document.getElementById(`stats-toggle-${def.key}`);
      if (tBtn) {
        tBtn.onclick = (e) => {
          e.stopPropagation();
          const next = !state.serverstats[def.enabledKey];
          state.serverstats[def.enabledKey] = next;
          setSwitchVisual(`stats-toggle-${def.key}`, next);

          // Dim/undim the inputs wrapper
          const inputWrap = tBtn.closest('.rounded-2xl')?.querySelector('.space-y-3');
          if (inputWrap) {
            inputWrap.classList.toggle('opacity-100', next);
            inputWrap.classList.toggle('opacity-40', !next);
            inputWrap.classList.toggle('pointer-events-none', !next);
          }

          updateLivePreview();
          scheduleSave();
        };
      }

      // Template Input
      const inp = document.getElementById(`stats-input-${def.key}`);
      if (inp) {
        inp.addEventListener('input', (e) => {
          state.serverstats[def.nameKey] = e.target.value;
          updateLivePreview();
          scheduleSave();
        });
      }
    });

    // 5. Variable Insertion Chips
    document.querySelectorAll('.stats-var-chip').forEach(btn => {
      btn.onclick = () => {
        const targetId = btn.getAttribute('data-input-target');
        const token = btn.getAttribute('data-var');
        const inputEl = document.getElementById(targetId);
        if (inputEl && token) {
          insertAtCursor(inputEl, token);
        }
      };
    });

    // 6. Preset Chips
    document.querySelectorAll('.stats-preset-chip').forEach(btn => {
      btn.onclick = () => {
        const targetId = btn.getAttribute('data-input-target');
        const val = btn.getAttribute('data-set-val');
        const inputEl = document.getElementById(targetId);
        if (inputEl && val) {
          inputEl.value = val;
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };
    });

    // 7. Reset Buttons
    document.querySelectorAll('.stats-reset-btn').forEach(btn => {
      btn.onclick = () => {
        const targetId = btn.getAttribute('data-reset-target');
        const defVal = btn.getAttribute('data-reset-val');
        const inputEl = document.getElementById(targetId);
        if (inputEl && defVal) {
          inputEl.value = defVal;
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };
    });

    // 8. Sync Channels Button
    const syncBtn = document.getElementById('stats-sync-btn');
    if (syncBtn) {
      syncBtn.onclick = async () => {
        const orig = syncBtn.innerHTML;
        syncBtn.disabled = true;
        syncBtn.innerHTML = `
          <svg class="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Syncing...
        `;
        try {
          await saveNow();
          await API.setupServerStats(guildId);
          if (window.Toast) Toast.success('Server Stats channels synced to Discord!');
        } catch (err) {
          if (window.Toast) Toast.error('Failed to sync Server Stats: ' + err.message);
        } finally {
          syncBtn.disabled = false;
          syncBtn.innerHTML = orig;
        }
      };
    }
  }

  // Initial loading placeholder
  container.innerHTML = `
    <div class="flex items-center justify-center p-16 text-neutral-500 text-sm animate-fade-in">
      <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      Loading Server Stats configuration...
    </div>
  `;

  try {
    const configData = await API.getConfig(guildId).catch(() => ({}));

    if (configData.guild) {
      state.guildName = configData.guild.name || 'My Server';
      if (configData.guild.member_count) {
        state.memberCount = configData.guild.member_count;
        state.metrics.total = configData.guild.member_count;
      }
      if (configData.guild.premium_subscription_count !== undefined) {
        state.metrics.boosts = configData.guild.premium_subscription_count;
      }
      if (configData.guild.premium_tier !== undefined) {
        state.metrics.tier = `Level ${configData.guild.premium_tier}`;
      }
    } else if (window.__currentDashboardGuildObj) {
      state.guildName = window.__currentDashboardGuildObj.name || 'My Server';
      if (window.__currentDashboardGuildObj.member_count) {
        state.memberCount = window.__currentDashboardGuildObj.member_count;
        state.metrics.total = window.__currentDashboardGuildObj.member_count;
      }
    }

    const cfg = configData.config || configData || {};

    // Load channels and categories
    const rawChs = Array.isArray(configData.channels) && configData.channels.length > 0
      ? configData.channels
      : (await API.getChannels(guildId).catch(() => []));
    state.channels = rawChs;
    state.categories = rawChs.filter(c => c.type === 4 || c.type === 'category' || (c.type && String(c.type).includes('category')));

    // Roles count
    const rolesList = Array.isArray(configData.roles) ? configData.roles : (Array.isArray(cfg.roles) ? cfg.roles : []);
    if (rolesList.length > 0) {
      state.rolesCount = rolesList.length;
      state.metrics.roles = rolesList.length;
    }

    // Members / Bots metrics estimation
    const membersList = Array.isArray(configData.members) ? configData.members : [];
    if (membersList.length > 0) {
      const bots = membersList.filter(m => m.bot || m.user?.bot).length;
      state.metrics.bots = bots;
      state.metrics.users = Math.max(1, state.metrics.total - bots);
    } else {
      state.metrics.bots = 5;
      state.metrics.users = Math.max(1, state.metrics.total - 5);
    }

    // Load serverstats config from backend
    if (cfg.serverstats) {
      const s = cfg.serverstats;
      state.serverstats = {
        enabled: Boolean(s.enabled),
        category_id: s.category_id ? String(s.category_id) : '',
        category_name: s.category_name || '📊 Server Stats',
        users_enabled: s.users_enabled !== undefined ? Boolean(s.users_enabled) : true,
        users_name: s.users_name || '👥 Members: {count}',
        bots_enabled: s.bots_enabled !== undefined ? Boolean(s.bots_enabled) : true,
        bots_name: s.bots_name || '🤖 Bots: {count}',
        boosts_enabled: s.boosts_enabled !== undefined ? Boolean(s.boosts_enabled) : true,
        boosts_name: s.boosts_name || '🚀 Boosts: {count}',
        roles_enabled: Boolean(s.roles_enabled),
        roles_name: s.roles_name || '🏷️ Roles: {count}'
      };
    }
  } catch (err) {
    console.warn('[ServerStats] Failed to load config:', err);
  } finally {
    isInitialLoading = false;
    renderPage();
  }
};

window.renderServerStatsModule = function (container, guildId) {
  return DashboardTabs.ServerStats(container, guildId);
};
