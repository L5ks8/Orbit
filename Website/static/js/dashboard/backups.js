/**
 * Orbit Dashboard - Backups Tab
 * 1:1 PeakBot Recreation with real-time backup creation, restoration,
 * deletion, and scheduled auto-backup management (5 slots FIFO ring buffer).
 */

(function () {
  const MAX_SLOTS = 5;

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDateTime(timestamp) {
    if (!timestamp) return 'Never';
    const d = new Date(timestamp * 1000);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Never';
    const now = Math.floor(Date.now() / 1000);
    const diff = Math.max(0, now - timestamp);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function formatTimeUntil(timestamp) {
    if (!timestamp) return 'Not scheduled';
    const now = Math.floor(Date.now() / 1000);
    const diff = timestamp - now;
    if (diff <= 0) return 'due shortly';
    if (diff < 3600) return `in ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `in ${Math.floor(diff / 3600)}h`;
    return `in ${Math.floor(diff / 86400)}d`;
  }

  DashboardTabs.Backups = async function (container, guildId) {
    container.innerHTML = `
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="flex items-center gap-3 text-neutral-400">
          <svg class="animate-spin w-5 h-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Loading server backups...</span>
        </div>
      </div>
    `;

    let data;
    try {
      data = await API.getBackups(guildId);
    } catch (err) {
      container.innerHTML = `
        <div class="p-6 max-w-lg mx-auto text-center">
          <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h3 class="text-base font-semibold text-white mb-1">Failed to load backups</h3>
          <p class="text-xs text-neutral-400 mb-4">${escapeHtml(err.message || 'Unknown error occurred.')}</p>
          <button id="btn-retry-backups" class="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition-colors">Retry</button>
        </div>
      `;
      const retryBtn = container.querySelector('#btn-retry-backups');
      if (retryBtn) retryBtn.onclick = () => DashboardTabs.Backups(container, guildId);
      return;
    }

    let backups = data.backups || [];
    let config = data.config || { enabled: false, interval: 'daily', last_backup: null, next_backup: null, max_slots: MAX_SLOTS };

    function renderMainView() {
      const count = backups.length;
      // Circumference for r=15 is ~94.25
      const dash = ((count / MAX_SLOTS) * 94.2).toFixed(1);
      const circleColor = count >= MAX_SLOTS ? 'text-red-500' : 'text-violet-500';

      const lastStr = config.last_backup ? formatTimeAgo(config.last_backup) : 'never';
      const nextStr = config.enabled && config.next_backup ? formatTimeUntil(config.next_backup) : 'off';
      const formattedNextDate = config.enabled && config.next_backup ? formatDateTime(config.next_backup) : 'Disabled';

      container.innerHTML = `
        <main class="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto animate-fade-in">
          <!-- Header -->
          <div data-tour="feature-header" class="scroll-mt-24">
            <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database w-5 h-5">
                    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                    <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                    <path d="M3 12A9 3 0 0 0 21 12"></path>
                  </svg>
                </span>
                <h1 class="text-base font-medium text-white truncate">Backups</h1>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="mt-6">
            <div class="space-y-3.5">
              <!-- Top Card: Summary & Controls -->
              <div class="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div class="px-5 py-4 flex items-center justify-between gap-4">
                  <!-- Donut Chart & Meta -->
                  <div class="flex items-center gap-4 min-w-0">
                    <div class="relative w-12 h-12 flex-shrink-0">
                      <svg viewBox="0 0 36 36" class="w-12 h-12 -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" stroke-width="3" class="text-neutral-800"></circle>
                        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="${dash} 100" class="${circleColor}" style="transition: stroke-dasharray 0.5s ease-out;"></circle>
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-[11px] font-bold text-white tabular-nums">${count}/${MAX_SLOTS}</span>
                      </div>
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-base font-semibold text-white tracking-tight">Backups</span>
                        <span class="text-[10px] px-1.5 py-0.5 bg-violet-500/15 text-violet-400 rounded font-semibold uppercase tracking-wider">Auto</span>
                      </div>
                      <p class="text-xs text-neutral-500 mt-1 truncate tabular-nums">Last ${lastStr} · Next ${nextStr}</p>
                    </div>
                  </div>

                  <!-- Actions: Auto Switch & New Backup Button -->
                  <div class="flex items-center gap-2.5 flex-shrink-0">
                    <div id="btn-toggle-auto-desktop" class="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg bg-neutral-800/60 border border-neutral-700/40 cursor-pointer select-none hover:bg-neutral-800 transition-colors duration-150 ease-out active:scale-[0.96]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-3.5 h-3.5 ${config.enabled ? 'text-violet-400' : 'text-neutral-500'}">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                        <path d="M21 3v5h-5"></path>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                        <path d="M8 16H3v5"></path>
                      </svg>
                      <span class="text-xs text-neutral-400 font-medium">Auto</span>
                      <div>
                        <button type="button" role="switch" aria-checked="${config.enabled}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${config.enabled ? 'bg-white' : 'bg-neutral-800 border border-neutral-700'}">
                          <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full transition-transform duration-200 ease-in-out ${config.enabled ? 'translate-x-[21px] !bg-black' : 'translate-x-[3px] !bg-white'} shadow-sm"></span>
                        </button>
                      </div>
                    </div>

                    <button id="btn-new-backup" class="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 ease-out active:scale-[0.96] focus:outline-none bg-white hover:bg-neutral-200 text-black px-3.5 py-2 text-xs shadow-lg shadow-white/5 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-4 h-4">
                        <path d="M5 12h14"></path>
                        <path d="M12 5v14"></path>
                      </svg>
                      New Backup
                    </button>
                  </div>
                </div>

                <!-- Schedule Bar -->
                <div class="px-5 py-3 border-t border-neutral-800/60 flex items-center justify-between gap-x-4 gap-y-2 flex-wrap bg-neutral-800/20">
                  <div class="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                    <span class="text-xs text-neutral-500 font-medium">Every</span>
                    <div class="w-32 relative" id="backup-interval-dropdown-mount"></div>
                    <span class="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      All intervals unlocked
                    </span>
                  </div>

                  <span class="text-xs text-neutral-500 flex items-center gap-1.5 tabular-nums">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-3 h-3 text-neutral-600">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Next: ${formattedNextDate}
                  </span>
                </div>
              </div>

              <!-- Mobile Auto Toggle Row -->
              <div id="btn-toggle-auto-mobile" class="sm:hidden flex items-center justify-between px-4 py-3 bg-neutral-900 rounded-xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] cursor-pointer select-none">
                <div class="flex items-center gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-3.5 h-3.5 ${config.enabled ? 'text-violet-400' : 'text-neutral-500'}">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M8 16H3v5"></path>
                  </svg>
                  <span class="text-sm text-neutral-300 font-medium">Automatic Backups</span>
                </div>
                <button type="button" role="switch" aria-checked="${config.enabled}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${config.enabled ? 'bg-white' : 'bg-neutral-800 border border-neutral-700'}">
                  <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full transition-transform duration-200 ease-in-out ${config.enabled ? 'translate-x-[21px] !bg-black' : 'translate-x-[3px] !bg-white'} shadow-sm"></span>
                </button>
              </div>

              <!-- Backups List Card -->
              <div class="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div id="backups-items-container" class="divide-y divide-neutral-800/60">
                  <!-- Rendered dynamically -->
                </div>
              </div>

              <!-- Footer Slot Info -->
              <div class="flex flex-wrap items-center justify-between gap-2 px-4 pt-1 pb-0.5 text-[11px] text-neutral-500">
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                  <span>5 Slots Max · Oldest backup automatically rotated when full</span>
                </div>
                <span class="text-neutral-500">Synchronized with Discord <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px]">/backup</code></span>
              </div>
            </div>
          </div>
        </main>
      `;

      // Mount Custom Interval Dropdown
      renderIntervalDropdown();

      // Render the List of Backups
      renderBackupsList();

      // Attach Event Listeners
      const toggleDesktop = container.querySelector('#btn-toggle-auto-desktop');
      const toggleMobile = container.querySelector('#btn-toggle-auto-mobile');
      const newBackupBtn = container.querySelector('#btn-new-backup');

      if (toggleDesktop) toggleDesktop.onclick = handleToggleAuto;
      if (toggleMobile) toggleMobile.onclick = handleToggleAuto;
      if (newBackupBtn) newBackupBtn.onclick = handleOpenCreateModal;
    }

    function renderIntervalDropdown() {
      const mount = container.querySelector('#backup-interval-dropdown-mount');
      if (!mount) return;

      const intervals = [
        { id: '6h', label: '6h' },
        { id: '12h', label: '12h' },
        { id: 'daily', label: 'Daily' },
        { id: 'weekly', label: 'Weekly' }
      ];

      const currentInterval = config.interval || 'daily';
      const selectedItem = intervals.find(i => i.id === currentInterval) || intervals[2];

      mount.innerHTML = `
        <button type="button" id="backup-interval-btn" class="w-full flex items-center justify-between gap-2 h-9 px-3 bg-neutral-800 border rounded-xl text-xs text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
          <span class="min-w-0 truncate text-xs text-white font-medium">${selectedItem.label}</span>
          <svg class="lucide lucide-chevron-down w-3.5 h-3.5 text-neutral-400 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"></path></svg>
        </button>
        <div id="backup-interval-menu" class="hidden absolute left-0 top-full mt-1.5 w-full bg-neutral-900 border border-neutral-700/70 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
          ${intervals.map(opt => `
            <button type="button" class="w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${opt.id === selectedItem.id ? 'bg-white/10 text-white font-medium' : 'text-neutral-400 hover:text-white hover:bg-white/5'}" data-interval-val="${opt.id}">
              <span>${opt.label}</span>
              ${opt.id === selectedItem.id ? `<svg class="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>` : ''}
            </button>
          `).join('')}
        </div>
      `;

      const btn = mount.querySelector('#backup-interval-btn');
      const menu = mount.querySelector('#backup-interval-menu');

      btn.onclick = (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
      };

      menu.querySelectorAll('[data-interval-val]').forEach(optBtn => {
        optBtn.onclick = async (e) => {
          e.stopPropagation();
          menu.classList.add('hidden');
          const newInterval = optBtn.getAttribute('data-interval-val');
          if (newInterval === config.interval) return;

          config.interval = newInterval;
          try {
            const res = await API.saveBackupConfig(guildId, {
              enabled: config.enabled,
              interval: config.interval
            });
            if (res && res.config) config = res.config;
            Toast.success(`Backup interval set to ${selectedItem.label}`);
            renderMainView();
          } catch (err) {
            Toast.error('Failed to update interval: ' + (err.message || ''));
          }
        };
      });

      document.addEventListener('click', () => {
        if (menu) menu.classList.add('hidden');
      }, { once: true });
    }

    async function handleToggleAuto() {
      const targetState = !config.enabled;
      config.enabled = targetState;

      try {
        const res = await API.saveBackupConfig(guildId, {
          enabled: config.enabled,
          interval: config.interval || 'daily'
        });
        if (res && res.config) config = res.config;
        Toast.success(config.enabled ? 'Automatic backups enabled' : 'Automatic backups disabled');
        renderMainView();
      } catch (err) {
        config.enabled = !targetState;
        Toast.error('Failed to update auto backups: ' + (err.message || ''));
        renderMainView();
      }
    }

    function renderBackupsList() {
      const containerEl = container.querySelector('#backups-items-container');
      if (!containerEl) return;

      if (!backups.length) {
        containerEl.innerHTML = `
          <div class="p-12 text-center flex flex-col items-center justify-center">
            <div class="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center text-neutral-400 mb-3 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-neutral-500">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                <path d="M3 12A9 3 0 0 0 21 12"></path>
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-white mb-1">No backups created yet</h3>
            <p class="text-xs text-neutral-400 max-w-sm mb-4">Click "New Backup" or enable Automatic Backups above to snapshot your server roles, channels, and permissions.</p>
            <button id="btn-create-first-backup" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Create First Backup
            </button>
          </div>
        `;
        const firstBtn = containerEl.querySelector('#btn-create-first-backup');
        if (firstBtn) firstBtn.onclick = handleOpenCreateModal;
        return;
      }

      containerEl.innerHTML = backups.map(b => {
        const dateStr = formatDateTime(b.timestamp);
        const chCount = b.channels_count || (b.channels ? b.channels.length : 0);
        const rCount = b.roles_count || (b.roles ? b.roles.length : 0);
        const mCount = b.members_count || 0;

        return `
          <div class="backup-item-wrapper transition-colors hover:bg-white/[0.01]" data-backup-id="${escapeHtml(b.id)}">
            <div class="px-5 py-3.5 flex items-center justify-between gap-3">
              <!-- Item details -->
              <div class="flex items-center gap-3 min-w-0 flex-1 cursor-pointer select-none" data-action="toggle-expand">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-neutral-800 border border-neutral-700/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database w-4 h-4 text-neutral-400">
                    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                    <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                    <path d="M3 12A9 3 0 0 0 21 12"></path>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm text-white font-medium truncate">${escapeHtml(b.name || 'Server Backup')}</p>
                  </div>
                  <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                    <span class="text-xs text-neutral-500 whitespace-nowrap">${dateStr}</span>
                    <span class="text-neutral-700 text-xs">·</span>
                    <span class="text-xs text-neutral-400 tabular-nums whitespace-nowrap">${chCount}ch · ${rCount}r · ${mCount}m</span>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <button class="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer" data-action="restore" title="Restore backup">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw w-4 h-4">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                </button>
                <button class="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer" data-action="delete" title="Delete backup">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 w-4 h-4">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" x2="10" y1="11" y2="17"></line>
                    <line x1="14" x2="14" y1="11" y2="17"></line>
                  </svg>
                </button>
                <button class="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-white transition-transform cursor-pointer ml-0.5" data-action="toggle-expand" title="Show details">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="backup-chevron lucide lucide-chevron-down w-4 h-4 transition-transform duration-200">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Expandable Structure Preview -->
            <div class="backup-details-panel hidden px-5 pb-4 pt-1 border-t border-neutral-800/40 bg-neutral-950/40 animate-fade-in">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-2">
                <div class="p-3 rounded-xl bg-neutral-900 border border-neutral-800/80">
                  <span class="text-neutral-400 font-semibold text-[11px] uppercase tracking-wider block mb-2">Channels (${chCount})</span>
                  <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    ${(b.channels || []).slice(0, 30).map(c => `
                      <span class="px-2 py-0.5 rounded bg-neutral-800/80 border border-neutral-700/50 text-neutral-300 font-mono text-[11px]">
                        ${c.type === 'voice' ? '🔊' : '#'}${escapeHtml(c.name)}
                      </span>
                    `).join('')}
                    ${(b.channels || []).length > 30 ? `<span class="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[11px]">+${(b.channels.length - 30)} more</span>` : ''}
                    ${!(b.channels || []).length ? `<span class="text-neutral-500 italic text-[11px]">No channels recorded</span>` : ''}
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-neutral-900 border border-neutral-800/80">
                  <span class="text-neutral-400 font-semibold text-[11px] uppercase tracking-wider block mb-2">Roles (${rCount})</span>
                  <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    ${(b.roles || []).slice(0, 30).map(r => `
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-800/80 border border-neutral-700/50 text-neutral-300 text-[11px]">
                        <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${r.color ? '#' + (r.color.toString(16).padStart(6, '0')) : '#99aab5'}"></span>
                        ${escapeHtml(r.name)}
                      </span>
                    `).join('')}
                    ${(b.roles || []).length > 30 ? `<span class="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[11px]">+${(b.roles.length - 30)} more</span>` : ''}
                    ${!(b.roles || []).length ? `<span class="text-neutral-500 italic text-[11px]">No roles recorded</span>` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Attach item action handlers
      containerEl.querySelectorAll('.backup-item-wrapper').forEach(card => {
        const backupId = card.getAttribute('data-backup-id');
        const backupObj = backups.find(b => String(b.id) === String(backupId));

        // Toggle details
        card.querySelectorAll('[data-action="toggle-expand"]').forEach(btn => {
          btn.onclick = () => {
            const panel = card.querySelector('.backup-details-panel');
            const chevron = card.querySelector('.backup-chevron');
            if (panel) {
              const isHidden = panel.classList.contains('hidden');
              panel.classList.toggle('hidden', !isHidden);
              if (chevron) {
                chevron.classList.toggle('rotate-180', isHidden);
              }
            }
          };
        });

        // Restore Backup
        const restoreBtn = card.querySelector('[data-action="restore"]');
        if (restoreBtn) {
          restoreBtn.onclick = (e) => {
            e.stopPropagation();
            handleOpenRestoreModal(backupObj);
          };
        }

        // Delete Backup
        const deleteBtn = card.querySelector('[data-action="delete"]');
        if (deleteBtn) {
          deleteBtn.onclick = async (e) => {
            e.stopPropagation();
            if (typeof confirmDelete === 'function') {
              const confirmed = await confirmDelete({
                title: 'Delete Backup?',
                message: `Are you sure you want to delete "${backupObj ? backupObj.name : 'this backup'}"? This action cannot be undone.`,
                confirmText: 'Delete Backup'
              });
              if (!confirmed) return;
            } else {
              if (!confirm(`Are you sure you want to delete "${backupObj ? backupObj.name : 'this backup'}"?`)) return;
            }

            try {
              await API.deleteBackup(guildId, backupId);
              backups = backups.filter(b => String(b.id) !== String(backupId));
              Toast.success('Backup deleted successfully');
              renderMainView();
            } catch (err) {
              Toast.error('Failed to delete backup: ' + (err.message || ''));
            }
          };
        }
      });
    }

    // Modal: Create New Backup
    function handleOpenCreateModal() {
      const existing = document.getElementById('orbit-backup-create-modal');
      if (existing) existing.remove();

      const defaultName = `Backup ${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}`;
      const isFull = backups.length >= MAX_SLOTS;

      const modal = document.createElement('div');
      modal.id = 'orbit-backup-create-modal';
      modal.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in';
      modal.innerHTML = `
        <div class="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
          <div class="p-6">
            <div class="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                <path d="M3 12A9 3 0 0 0 21 12"></path>
              </svg>
            </div>
            <h3 class="text-base font-semibold text-white mb-1">Create Server Backup</h3>
            <p class="text-xs text-neutral-400 mb-4">Take a snapshot of current server channels, categories, roles, and permissions.</p>

            ${isFull ? `
              <div class="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span>5/5 slots used. The oldest backup will be automatically rotated out.</span>
              </div>
            ` : ''}

            <label class="block text-xs text-neutral-400 font-medium mb-1.5">Backup Name (optional)</label>
            <input 
              type="text" 
              id="input-backup-name" 
              value="${defaultName}" 
              placeholder="e.g. Pre-Launch Snapshot" 
              class="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700/80 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div class="px-6 py-4 bg-neutral-950/60 border-t border-neutral-800/80 flex items-center justify-end gap-2.5">
            <button id="modal-cancel-btn" type="button" class="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">Cancel</button>
            <button id="modal-confirm-create-btn" type="button" class="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-2 shadow-sm">
              <span>Create Backup</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const cancelBtn = modal.querySelector('#modal-cancel-btn');
      const confirmBtn = modal.querySelector('#modal-confirm-create-btn');
      const inputEl = modal.querySelector('#input-backup-name');

      cancelBtn.onclick = () => modal.remove();
      modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
      };

      inputEl.focus();
      inputEl.select();

      inputEl.onkeydown = (e) => {
        if (e.key === 'Enter') confirmBtn.click();
        if (e.key === 'Escape') modal.remove();
      };

      confirmBtn.onclick = async () => {
        const chosenName = inputEl.value.trim() || defaultName;
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `
          <svg class="animate-spin w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Creating...</span>
        `;

        try {
          const res = await API.createBackup(guildId, chosenName);
          modal.remove();
          Toast.success(`Backup "${chosenName}" created!`);

          // Re-fetch backups list
          const freshData = await API.getBackups(guildId);
          backups = freshData.backups || [];
          config = freshData.config || config;
          renderMainView();
        } catch (err) {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = `<span>Create Backup</span>`;
          Toast.error('Failed to create backup: ' + (err.message || ''));
        }
      };
    }

    // Modal: Confirm Destructive Restore
    function handleOpenRestoreModal(backupObj) {
      if (!backupObj) return;

      const existing = document.getElementById('orbit-backup-restore-modal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'orbit-backup-restore-modal';
      modal.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in';
      modal.innerHTML = `
        <div class="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
          <div class="p-6">
            <div class="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3 class="text-base font-semibold text-white mb-2">Restore Backup?</h3>
            <p class="text-xs text-neutral-400 leading-relaxed mb-4">
              Applying <strong class="text-white">${escapeHtml(backupObj.name)}</strong> will <span class="text-red-400 font-semibold">DELETE existing server channels and roles</span> and replace them with the snapshot layout.
            </p>
            <div class="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <div class="flex justify-between"><span class="text-neutral-500">Channels to restore:</span><span class="text-white font-medium">${backupObj.channels_count || 0}</span></div>
              <div class="flex justify-between"><span class="text-neutral-500">Roles to restore:</span><span class="text-white font-medium">${backupObj.roles_count || 0}</span></div>
              <div class="flex justify-between"><span class="text-neutral-500">Created:</span><span class="text-white font-medium">${formatDateTime(backupObj.timestamp)}</span></div>
            </div>
          </div>

          <div class="px-6 py-4 bg-neutral-950/60 border-t border-neutral-800/80 flex items-center justify-end gap-2.5">
            <button id="modal-cancel-restore-btn" type="button" class="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">Cancel</button>
            <button id="modal-confirm-restore-btn" type="button" class="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-red-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span>Yes, Restore Backup</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const cancelBtn = modal.querySelector('#modal-cancel-restore-btn');
      const confirmBtn = modal.querySelector('#modal-confirm-restore-btn');

      cancelBtn.onclick = () => modal.remove();
      modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
      };

      confirmBtn.onclick = async () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `
          <svg class="animate-spin w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Restoring...</span>
        `;

        try {
          await API.restoreBackup(guildId, backupObj.id);
          modal.remove();
          Toast.success(`Restoration started! Orbit is reconstructing "${backupObj.name}" in the server.`);
        } catch (err) {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = `<span>Yes, Restore Backup</span>`;
          Toast.error('Restoration failed: ' + (err.message || ''));
        }
      };
    }

    // Initial render
    renderMainView();
  };

  // Compatibility hook for modules router
  window.renderBackupsModule = function (el, guildId) {
    return DashboardTabs.Backups(el, guildId);
  };
})();
