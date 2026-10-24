/**
 * Orbit Dashboard - Voice Channels (Join-to-Create) Tab (/dashboard/:guildId/tempvoice or /jtc)
 * 1:1 Pixel-Perfect Recreation of PeakBot Voice Channels System & Trigger Modal
 */

DashboardTabs.TempVoice = async function (container, guildId) {
  const esc = (s) => (s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '');

  // Loading skeleton
  container.innerHTML = `
    <div class="flex items-center justify-center min-h-[400px]">
      <div class="flex items-center gap-3 text-neutral-400">
        <svg class="animate-spin w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm font-medium">Loading Voice Channels...</span>
      </div>
    </div>
  `;

  // Inline SVGs
  const SVGS = {
    volume2: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`,
    mic: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>`,
    folderOpen: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path></svg>`,
    type: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" x2="15" y1="20" y2="20"></line><line x1="12" x2="12" y1="4" y2="20"></line></svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`,
    crown: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crown"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>`,
    atSign: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-at-sign"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"></path></svg>`,
    eye: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    eyeOff: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"></path></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
  };

  let cfg = {
    enabled: false,
    hubs: []
  };

  let voiceChannels = [];
  let categories = [];
  let roles = [];
  let guildName = 'Your Server';
  let showLivePreview = true;

  try {
    const configRes = await API.getConfig(guildId).catch(() => ({}));
    if (configRes) {
      if (configRes.voice_channels && Array.isArray(configRes.voice_channels)) {
        voiceChannels = configRes.voice_channels;
      }
      if (configRes.categories && Array.isArray(configRes.categories)) {
        categories = configRes.categories;
      }
      if (configRes.roles && Array.isArray(configRes.roles)) {
        roles = configRes.roles.filter(r => !r.managed && r.name !== '@everyone');
      }
      if (configRes.config && configRes.config.tempvoice) {
        cfg = {
          enabled: Boolean(configRes.config.tempvoice.enabled),
          hubs: Array.isArray(configRes.config.tempvoice.hubs) ? configRes.config.tempvoice.hubs : []
        };
      } else if (configRes.tempvoice) {
        cfg = {
          enabled: Boolean(configRes.tempvoice.enabled),
          hubs: Array.isArray(configRes.tempvoice.hubs) ? configRes.tempvoice.hubs : []
        };
      }
    }

    if (configRes?.guild?.name) {
      guildName = configRes.guild.name;
    } else if (window.__currentDashboardGuildObj?.name) {
      guildName = window.__currentDashboardGuildObj.name;
    }

    // Fallback: If voiceChannels or categories were empty, try API.getChannels
    if (voiceChannels.length === 0 || categories.length === 0) {
      try {
        const allCh = await API.getChannels(guildId).catch(() => []);
        if (Array.isArray(allCh)) {
          if (voiceChannels.length === 0) {
            voiceChannels = allCh.filter(c => c.type === 'voice');
          }
          if (categories.length === 0) {
            categories = allCh.filter(c => c.type === 'category');
          }
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error('Failed to load voice channels configuration:', err);
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12 select-none">
        <h2 class="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">Failed to load Voice Channels</h2>
        <p class="text-sm font-semibold text-neutral-400 max-w-md mb-6">${esc(err.message || 'Unknown error occurred.')}</p>
        <button id="btn-retry-tempvoice" class="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-md">Retry</button>
      </div>
    `;
    const retryBtn = container.querySelector('#btn-retry-tempvoice');
    if (retryBtn) retryBtn.onclick = () => DashboardTabs.TempVoice(container, guildId);
    return;
  }

  function renderView() {
    const triggersCount = cfg.hubs ? cfg.hubs.length : 0;
    const progressPercent = Math.min(100, Math.round((triggersCount / 999) * 100));

    container.innerHTML = `
      <div>
        <!-- Feature Header matching PeakBot exactly -->
        <div data-tour="feature-header" class="scroll-mt-24">
          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                <div class="w-5 h-5 flex items-center justify-center text-neutral-500">${SVGS.volume2}</div>
              </span>
              <h1 class="text-base font-medium text-white truncate">Voice Channels</h1>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <div class="flex items-center gap-3">
                <span data-tour="feature-toggle" class="inline-flex scroll-mt-24">
                  <div class="flex items-center gap-3">
                    <button type="button" id="btn-feature-switch" role="switch" aria-checked="${cfg.enabled ? 'true' : 'false'}" aria-label="${cfg.enabled ? 'Enabled' : 'Disabled'}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 ${cfg.enabled ? 'bg-white' : 'bg-neutral-200 dark:bg-neutral-700'}">
                      <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${cfg.enabled ? 'translate-x-[21px] bg-neutral-900' : 'translate-x-[3px] bg-white dark:bg-neutral-900'}"></span>
                    </button>
                    <div class="flex-shrink-0">
                      <span id="txt-feature-toggle" class="text-sm font-medium whitespace-nowrap ${cfg.enabled ? 'text-white' : 'text-neutral-400 dark:text-neutral-500'}">${cfg.enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div class="flex items-center gap-3">
              <span class="text-xs tabular-nums text-neutral-500">${triggersCount}/999 triggers</span>
              <div class="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden">
                <div class="h-full rounded-full transition-all bg-white/60" style="width: ${progressPercent}%;"></div>
              </div>
            </div>
            <button id="btn-create-channel-top" class="flex items-center gap-2 bg-white text-black font-semibold text-sm rounded-xl h-9 pl-3 pr-4 shrink-0 hover:bg-neutral-200 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50 disabled:cursor-not-allowed">
              <div class="w-4 h-4 flex items-center justify-center">${SVGS.plus}</div>
              <span>Create Channel</span>
            </button>
          </div>

          <!-- Trigger Channels Grid or Empty Card -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${cfg.hubs.map((hub, idx) => {
              const ch = voiceChannels.find(v => String(v.id) === String(hub.hub_channel_id));
              const chName = ch ? ch.name : (hub.hub_name || 'Join to Create');
              const cat = categories.find(c => String(c.id) === String(hub.category_id));
              const catName = cat ? cat.name : 'No category';
              const role = roles.find(r => String(r.id) === String(hub.required_role_id));
              const roleName = role ? `@${role.name}` : null;
              const limit = parseInt(hub.default_user_limit, 10) || 0;
              const limitStr = limit === 0 ? 'Unlimited' : `${limit} users max`;
              const templateStr = hub.name_template || "{user}'s Channel";

              return `
                <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between gap-4 group">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <div class="w-5 h-5 flex items-center justify-center">${SVGS.volume2}</div>
                      </div>
                      <div class="min-w-0">
                        <h3 class="text-sm font-semibold text-white truncate">${esc(chName)}</h3>
                        <p class="text-[11px] text-neutral-500 truncate flex items-center gap-1.5 mt-0.5">
                          <span class="w-3 h-3 flex items-center justify-center shrink-0 text-neutral-500">${SVGS.folderOpen}</span>
                          <span>${esc(catName)}</span>
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" class="btn-edit-hub p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors" data-idx="${idx}" title="Edit Trigger">
                        <div class="w-4 h-4 flex items-center justify-center">${SVGS.settings}</div>
                      </button>
                      <button type="button" class="btn-delete-hub p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors" data-idx="${idx}" title="Delete Trigger">
                        <div class="w-4 h-4 flex items-center justify-center">${SVGS.trash}</div>
                      </button>
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-800/80 text-[11px]">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono">
                      <span class="w-3 h-3 text-neutral-400 flex items-center justify-center">${SVGS.type}</span>
                      <span>${esc(templateStr)}</span>
                    </span>
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300">
                      <span class="w-3 h-3 text-neutral-400 flex items-center justify-center">${SVGS.users}</span>
                      <span>${esc(limitStr)}</span>
                    </span>
                    ${roleName ? `
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-300">
                        <span class="w-3 h-3 flex items-center justify-center">${SVGS.atSign}</span>
                        <span>${esc(roleName)}</span>
                      </span>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}

            <!-- Create Trigger Channel Dashed Card (Matches PeakBot 1:1) -->
            <div id="card-create-trigger" class="group border border-dashed border-neutral-700 rounded-2xl px-5 py-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:border-neutral-500 hover:bg-neutral-800/20 transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 w-full ${cfg.hubs.length === 0 ? 'max-w-sm' : 'min-h-[140px]'}">
              <div class="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center group-hover:border-neutral-600 transition-colors">
                <div class="w-5 h-5 flex items-center justify-center text-neutral-400">${SVGS.plus}</div>
              </div>
              <p class="text-sm font-semibold text-white">Create Trigger Channel</p>
            </div>
          </div>
        </div>
      </div>
    `;

    bindMainEvents();
  }

  function bindMainEvents() {
    // Feature Switch Button
    const switchBtn = container.querySelector('#btn-feature-switch');
    if (switchBtn) {
      switchBtn.onclick = async () => {
        cfg.enabled = !cfg.enabled;
        renderView();
        try {
          await API.saveConfig(guildId, {
            tempvoice: {
              enabled: cfg.enabled,
              hubs: cfg.hubs
            }
          });
          if (window.Toast && Toast.success) {
            Toast.success(cfg.enabled ? 'Voice Channels system enabled!' : 'Voice Channels system disabled.');
          }
        } catch (err) {
          cfg.enabled = !cfg.enabled;
          renderView();
          if (window.Toast && Toast.error) Toast.error('Failed to update toggle: ' + err.message);
        }
      };
    }

    // Open Modal button (Top Bar)
    const btnCreateTop = container.querySelector('#btn-create-channel-top');
    if (btnCreateTop) {
      btnCreateTop.onclick = () => openTriggerModal();
    }

    // Open Modal card (Dashed Box)
    const cardCreate = container.querySelector('#card-create-trigger');
    if (cardCreate) {
      cardCreate.onclick = () => openTriggerModal();
    }

    // Delete Hub button
    container.querySelectorAll('.btn-delete-hub').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        if (isNaN(idx) || idx < 0 || idx >= cfg.hubs.length) return;

        if (!confirm('Are you sure you want to delete this trigger channel?')) return;

        const removed = cfg.hubs.splice(idx, 1);
        renderView();

        try {
          await API.saveConfig(guildId, {
            tempvoice: {
              enabled: cfg.enabled,
              hubs: cfg.hubs
            }
          });
          if (window.Toast && Toast.success) Toast.success('Trigger channel removed.');
        } catch (err) {
          cfg.hubs.splice(idx, 0, removed[0]);
          renderView();
          if (window.Toast && Toast.error) Toast.error('Failed to remove trigger: ' + err.message);
        }
      };
    });

    // Edit Hub button
    container.querySelectorAll('.btn-edit-hub').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        if (!isNaN(idx) && cfg.hubs[idx]) {
          openTriggerModal(cfg.hubs[idx], idx);
        }
      };
    });
  }

  // --- CREATE / EDIT TRIGGER CHANNEL MODAL ---
  function openTriggerModal(existingHub = null, editIndex = -1) {
    const isEdit = existingHub !== null && editIndex >= 0;

    let selectedVoiceChannelId = existingHub ? (existingHub.hub_channel_id ? String(existingHub.hub_channel_id) : 'new') : 'new';
    let selectedCategoryId = existingHub ? (existingHub.category_id ? String(existingHub.category_id) : '') : '';
    let nameTemplate = existingHub ? (existingHub.name_template || "{user}'s Channel") : "{user}'s Channel";
    let userLimit = existingHub ? (parseInt(existingHub.default_user_limit, 10) || 0) : 0;
    let selectedRoleId = existingHub ? (existingHub.required_role_id ? String(existingHub.required_role_id) : '') : '';

    const modalId = 'modal-trigger-channel-container';
    let existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();

    const modalEl = document.createElement('div');
    modalEl.id = modalId;
    modalEl.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150';

    function getVoiceChannelName(id) {
      if (id === 'new' || !id) return 'Create new channel (default)';
      const ch = voiceChannels.find(v => String(v.id) === String(id));
      return ch ? ch.name : `Channel (${id})`;
    }

    function getCategoryName(id) {
      if (!id) return 'No category (root level)';
      const cat = categories.find(c => String(c.id) === String(id));
      return cat ? cat.name : `Category (${id})`;
    }

    function getRoleName(id) {
      if (!id) return 'No role required';
      const role = roles.find(r => String(r.id) === String(id));
      return role ? `@${role.name}` : `Role (${id})`;
    }

    function updatePreview() {
      const pCat = modalEl.querySelector('#preview-category-name');
      const pHub = modalEl.querySelector('#preview-hub-name');
      const pCh = modalEl.querySelector('#preview-channel-name');

      if (pCat) {
        pCat.textContent = selectedCategoryId ? getCategoryName(selectedCategoryId) : 'Voice Channels';
      }
      if (pHub) {
        pHub.textContent = selectedVoiceChannelId === 'new' ? 'Join to Create' : getVoiceChannelName(selectedVoiceChannelId);
      }
      if (pCh) {
        const sampleName = (nameTemplate || "{user}'s Channel")
          .replace(/\{user\}/g, 'Player')
          .replace(/\{game\}/g, 'Minecraft');
        pCh.textContent = sampleName || "Player's Channel";
      }
    }

    modalEl.innerHTML = `
      <div class="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-150">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-800 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <div class="w-4 h-4 flex items-center justify-center text-indigo-400">${SVGS.volume2}</div>
            </div>
            <div>
              <h2 class="text-base font-semibold text-white">${isEdit ? 'Edit Trigger Channel' : 'Create Trigger Channel'}</h2>
              <p class="text-xs text-neutral-400 mt-0.5">Set up a new Join-to-Create voice channel</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button id="modal-btn-toggle-preview" class="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" title="${showLivePreview ? 'Hide preview' : 'Show preview'}">
              <div class="w-4 h-4 flex items-center justify-center">${showLivePreview ? SVGS.eyeOff : SVGS.eye}</div>
            </button>
            <button id="modal-btn-close" class="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
              <div class="w-4 h-4 flex items-center justify-center">${SVGS.x}</div>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-hidden flex min-h-0">
          <!-- Form Section -->
          <div class="flex-1 overflow-y-auto scrollbar-thin">
            <!-- 1. Trigger Channel Section -->
            <div class="p-5 space-y-4 border-b border-neutral-800">
              <div class="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                <div class="w-3.5 h-3.5 flex items-center justify-center">${SVGS.mic}</div>
                <span>Trigger Channel</span>
              </div>
              
              <!-- Voice Channel Dropdown -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">Voice Channel</label>
                <p class="text-xs text-neutral-400 mb-2">Select an existing voice channel or leave empty to create one</p>
                <div class="relative">
                  <button type="button" id="btn-trigger-vc-sel" class="w-full flex items-center justify-between gap-2 h-10 px-3.5 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                    <span id="txt-trigger-vc-sel" class="min-w-0 truncate text-sm ${selectedVoiceChannelId === 'new' ? 'text-neutral-400' : 'text-white font-medium'}">${esc(getVoiceChannelName(selectedVoiceChannelId))}</span>
                    <div class="flex items-center gap-1 text-neutral-400">
                      <div class="w-4 h-4 flex items-center justify-center">${SVGS.chevronDown}</div>
                    </div>
                  </button>
                  <div id="menu-trigger-vc-sel" class="hidden absolute top-full left-0 right-0 mt-1 z-50 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                    <button type="button" class="opt-vc w-full px-3.5 py-2.5 text-left text-xs hover:bg-neutral-800 transition-colors flex items-center justify-between ${selectedVoiceChannelId === 'new' ? 'text-indigo-400 font-semibold bg-neutral-800/50' : 'text-neutral-300'}" data-id="new">
                      <span>Create new channel (default)</span>
                      ${selectedVoiceChannelId === 'new' ? '<span class="text-[10px] text-indigo-400">Selected</span>' : ''}
                    </button>
                    ${voiceChannels.map(vc => `
                      <button type="button" class="opt-vc w-full px-3.5 py-2.5 text-left text-xs hover:bg-neutral-800 transition-colors flex items-center justify-between ${String(selectedVoiceChannelId) === String(vc.id) ? 'text-indigo-400 font-semibold bg-neutral-800/50' : 'text-white'}" data-id="${vc.id}">
                        <span class="truncate flex items-center gap-2">
                          <span class="w-3.5 h-3.5 text-neutral-500 flex items-center justify-center">${SVGS.volume2}</span>
                          <span>${esc(vc.name)}</span>
                        </span>
                        ${String(selectedVoiceChannelId) === String(vc.id) ? '<span class="text-[10px] text-indigo-400">Selected</span>' : ''}
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Category Dropdown -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">Category</label>
                <div class="relative">
                  <button type="button" id="btn-trigger-cat-sel" class="w-full flex items-center justify-between gap-2 h-10 px-3.5 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                    <span id="txt-trigger-cat-sel" class="min-w-0 truncate text-sm text-white flex items-center gap-2">
                      <span class="w-4 h-4 text-neutral-400 flex items-center justify-center shrink-0">${SVGS.folderOpen}</span>
                      <span class="truncate font-medium">${esc(getCategoryName(selectedCategoryId))}</span>
                    </span>
                    <div class="flex items-center gap-1 text-neutral-400">
                      <div class="w-4 h-4 flex items-center justify-center">${SVGS.chevronDown}</div>
                    </div>
                  </button>
                  <div id="menu-trigger-cat-sel" class="hidden absolute top-full left-0 right-0 mt-1 z-50 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                    <button type="button" class="opt-cat w-full px-3.5 py-2.5 text-left text-xs hover:bg-neutral-800 transition-colors flex items-center justify-between ${!selectedCategoryId ? 'text-indigo-400 font-semibold bg-neutral-800/50' : 'text-neutral-300'}" data-id="">
                      <span class="flex items-center gap-2">
                        <span class="w-3.5 h-3.5 text-neutral-500 flex items-center justify-center">${SVGS.folderOpen}</span>
                        <span>No category (root level)</span>
                      </span>
                      ${!selectedCategoryId ? '<span class="text-[10px] text-indigo-400">Selected</span>' : ''}
                    </button>
                    ${categories.map(cat => `
                      <button type="button" class="opt-cat w-full px-3.5 py-2.5 text-left text-xs hover:bg-neutral-800 transition-colors flex items-center justify-between ${String(selectedCategoryId) === String(cat.id) ? 'text-indigo-400 font-semibold bg-neutral-800/50' : 'text-white'}" data-id="${cat.id}">
                        <span class="truncate flex items-center gap-2">
                          <span class="w-3.5 h-3.5 text-neutral-500 flex items-center justify-center">${SVGS.folderOpen}</span>
                          <span>${esc(cat.name)}</span>
                        </span>
                        ${String(selectedCategoryId) === String(cat.id) ? '<span class="text-[10px] text-indigo-400">Selected</span>' : ''}
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Channel Name Section -->
            <div class="relative p-5 border-b border-neutral-800">
              <div class="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                <div class="w-3.5 h-3.5 flex items-center justify-center">${SVGS.type}</div>
                <span>Channel Name</span>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">Name Template</label>
                <div class="flex flex-wrap items-center gap-1.5 mb-2.5">
                  <span class="text-xs text-neutral-400 mr-1 font-medium">Insert:</span>
                  <button type="button" class="btn-token-insert inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-blue-500/15 text-blue-300 border-blue-500/25 hover:bg-blue-500/25 cursor-pointer" data-token="{user}">user</button>
                  <button type="button" class="btn-token-insert inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-purple-500/15 text-purple-300 border-purple-500/25 hover:bg-purple-500/25 cursor-pointer" data-token="{game}">game</button>
                </div>
                <div class="w-full">
                  <input type="text" id="inp-modal-name-template" autocomplete="off" class="w-full px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-400 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 text-sm font-medium" placeholder="{user}'s Channel" value="${esc(nameTemplate)}">
                </div>
              </div>
            </div>

            <!-- 3. Limits & Permissions Section -->
            <div class="p-5">
              <div class="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                <div class="w-3.5 h-3.5 flex items-center justify-center">${SVGS.shield}</div>
                <span>Limits &amp; Permissions</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <!-- User Limit -->
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">User Limit</label>
                  <p class="text-xs text-neutral-400 mb-2">0 = unlimited, up to 99 (Discord's maximum)</p>
                  <div class="w-full">
                    <input type="number" id="inp-modal-user-limit" autocomplete="off" min="0" max="99" value="${userLimit}" class="w-28 px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-400 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600 focus:border-neutral-500 text-sm font-medium">
                  </div>
                </div>

                <!-- Required Role -->
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">Required Role</label>
                  <p class="text-xs text-neutral-400 mb-2">Only members with this role can create a channel. The server owner and admins always can.</p>
                  <div class="relative">
                    <button type="button" id="btn-trigger-role-sel" class="w-full flex items-center justify-between gap-2 h-10 px-3.5 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                      <span id="txt-trigger-role-sel" class="min-w-0 truncate text-sm text-white flex items-center gap-2">
                        <span class="w-4 h-4 text-neutral-400 flex items-center justify-center shrink-0">${SVGS.atSign}</span>
                        <span class="truncate font-medium">${esc(getRoleName(selectedRoleId))}</span>
                      </span>
                      <div class="flex items-center gap-1 text-neutral-400">
                        <div class="w-4 h-4 flex items-center justify-center">${SVGS.chevronDown}</div>
                      </div>
                    </button>
                    <div id="menu-trigger-role-sel" class="hidden absolute top-full left-0 right-0 mt-1 z-50 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                      <button type="button" class="opt-role w-full px-3.5 py-2.5 text-left text-xs hover:bg-neutral-800 transition-colors flex items-center justify-between ${!selectedRoleId ? 'text-indigo-400 font-semibold bg-neutral-800/50' : 'text-neutral-300'}" data-id="">
                        <span class="flex items-center gap-2">
                          <span class="w-3.5 h-3.5 text-neutral-500 flex items-center justify-center">${SVGS.atSign}</span>
                          <span>No role required</span>
                        </span>
                        ${!selectedRoleId ? '<span class="text-[10px] text-indigo-400">Selected</span>' : ''}
                      </button>
                      ${roles.map(r => `
                        <button type="button" class="opt-role w-full px-3.5 py-2.5 text-left text-xs hover:bg-neutral-800 transition-colors flex items-center justify-between ${String(selectedRoleId) === String(r.id) ? 'text-indigo-400 font-semibold bg-neutral-800/50' : 'text-white'}" data-id="${r.id}">
                          <span class="truncate flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${r.color || '#818cf8'}"></span>
                            <span>@${esc(r.name)}</span>
                          </span>
                          ${String(selectedRoleId) === String(r.id) ? '<span class="text-[10px] text-indigo-400">Selected</span>' : ''}
                        </button>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Preview Column matching PeakBot 1:1 -->
          <div id="modal-preview-panel" class="${showLivePreview ? 'hidden md:flex' : 'hidden'} flex-col w-[280px] border-l border-neutral-800 bg-neutral-950/40 flex-shrink-0">
            <div class="px-4 py-3 border-b border-neutral-800">
              <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Live Preview</p>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
              <div class="rounded-2xl border border-neutral-800 overflow-hidden bg-[#2b2d31]">
                <div class="px-4 py-3 bg-[#2b2d31] border-b border-[#1e1f22] flex items-center gap-2">
                  <div class="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <span class="text-[8px] font-bold text-indigo-400">O</span>
                  </div>
                  <span class="text-xs font-semibold text-neutral-200 truncate">${esc(guildName)}</span>
                </div>
                <div class="p-3">
                  <div class="flex items-center gap-1 px-1 mb-1.5">
                    <svg class="w-2 h-2 text-neutral-400" viewBox="0 0 6 4" fill="none"><path d="M1 1l2 2 2-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider truncate" id="preview-category-name">${esc(selectedCategoryId ? getCategoryName(selectedCategoryId) : 'Voice Channels')}</span>
                  </div>
                  <div class="space-y-0.5 ml-1">
                    <div class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors group">
                      <div class="w-4 h-4 text-neutral-400 flex items-center justify-center shrink-0">${SVGS.volume2}</div>
                      <span class="text-sm text-neutral-300 group-hover:text-neutral-200 transition-colors truncate" id="preview-hub-name">${esc(selectedVoiceChannelId === 'new' ? 'Join to Create' : getVoiceChannelName(selectedVoiceChannelId))}</span>
                    </div>
                    <div class="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.06]">
                      <div class="w-4 h-4 text-indigo-400 flex items-center justify-center shrink-0">${SVGS.volume2}</div>
                      <span class="text-sm font-medium text-white truncate flex-1" id="preview-channel-name">Player's Channel</span>
                    </div>
                    <div class="flex items-center gap-2 pl-8 py-0.5">
                      <div class="w-4 h-4 rounded-full bg-neutral-700 flex items-center justify-center">
                        <span class="text-[8px] font-bold text-neutral-300">P</span>
                      </div>
                      <span class="text-xs text-neutral-300">Player</span>
                      <div class="w-2.5 h-2.5 rounded-full bg-green-500/80 ml-auto mr-1" title="Connected"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex flex-col gap-2 px-5 py-4 border-t border-neutral-800 flex-shrink-0">
          <div class="flex items-center justify-between gap-3">
            <button id="modal-btn-cancel" class="text-neutral-400 hover:text-white text-sm h-10 px-4 rounded-xl transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">Cancel</button>
            <button id="modal-btn-submit" class="bg-white text-black font-medium text-sm rounded-xl h-10 px-4 hover:bg-neutral-200 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-40 disabled:pointer-events-none">${isEdit ? 'Save Changes' : 'Create Channel'}</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);
    updatePreview();

    // Toggle Preview button
    const btnTogglePreview = modalEl.querySelector('#modal-btn-toggle-preview');
    const previewPanel = modalEl.querySelector('#modal-preview-panel');
    if (btnTogglePreview && previewPanel) {
      btnTogglePreview.onclick = () => {
        showLivePreview = !showLivePreview;
        if (showLivePreview) {
          previewPanel.classList.remove('hidden');
          previewPanel.classList.add('md:flex');
          btnTogglePreview.title = 'Hide preview';
          btnTogglePreview.innerHTML = `<div class="w-4 h-4 flex items-center justify-center">${SVGS.eyeOff}</div>`;
        } else {
          previewPanel.classList.add('hidden');
          previewPanel.classList.remove('md:flex');
          btnTogglePreview.title = 'Show preview';
          btnTogglePreview.innerHTML = `<div class="w-4 h-4 flex items-center justify-center">${SVGS.eye}</div>`;
        }
      };
    }

    // Close button & Cancel
    const closeModal = () => modalEl.remove();
    modalEl.querySelector('#modal-btn-close').onclick = closeModal;
    modalEl.querySelector('#modal-btn-cancel').onclick = closeModal;
    modalEl.onclick = (e) => {
      if (e.target === modalEl) closeModal();
    };

    // Voice Channel Custom Dropdown
    const btnVc = modalEl.querySelector('#btn-trigger-vc-sel');
    const menuVc = modalEl.querySelector('#menu-trigger-vc-sel');
    const txtVc = modalEl.querySelector('#txt-trigger-vc-sel');

    btnVc.onclick = (e) => {
      e.stopPropagation();
      menuVc.classList.toggle('hidden');
      menuCat.classList.add('hidden');
      menuRole.classList.add('hidden');
    };

    modalEl.querySelectorAll('.opt-vc').forEach(opt => {
      opt.onclick = () => {
        selectedVoiceChannelId = opt.dataset.id;
        txtVc.textContent = getVoiceChannelName(selectedVoiceChannelId);
        txtVc.className = `min-w-0 truncate text-sm ${selectedVoiceChannelId === 'new' ? 'text-neutral-500' : 'text-white'}`;
        menuVc.classList.add('hidden');
        updatePreview();
      };
    });

    // Category Custom Dropdown
    const btnCat = modalEl.querySelector('#btn-trigger-cat-sel');
    const menuCat = modalEl.querySelector('#menu-trigger-cat-sel');
    const txtCat = modalEl.querySelector('#txt-trigger-cat-sel');

    btnCat.onclick = (e) => {
      e.stopPropagation();
      menuCat.classList.toggle('hidden');
      menuVc.classList.add('hidden');
      menuRole.classList.add('hidden');
    };

    modalEl.querySelectorAll('.opt-cat').forEach(opt => {
      opt.onclick = () => {
        selectedCategoryId = opt.dataset.id;
        txtCat.innerHTML = `
          <span class="w-4 h-4 text-neutral-500 flex items-center justify-center shrink-0">${SVGS.folderOpen}</span>
          <span class="truncate">${esc(getCategoryName(selectedCategoryId))}</span>
        `;
        menuCat.classList.add('hidden');
        updatePreview();
      };
    });

    // Role Custom Dropdown
    const btnRole = modalEl.querySelector('#btn-trigger-role-sel');
    const menuRole = modalEl.querySelector('#menu-trigger-role-sel');
    const txtRole = modalEl.querySelector('#txt-trigger-role-sel');

    btnRole.onclick = (e) => {
      e.stopPropagation();
      menuRole.classList.toggle('hidden');
      menuVc.classList.add('hidden');
      menuCat.classList.add('hidden');
    };

    modalEl.querySelectorAll('.opt-role').forEach(opt => {
      opt.onclick = () => {
        selectedRoleId = opt.dataset.id;
        txtRole.innerHTML = `
          <span class="w-4 h-4 text-neutral-500 flex items-center justify-center shrink-0">${SVGS.atSign}</span>
          <span class="truncate">${esc(getRoleName(selectedRoleId))}</span>
        `;
        menuRole.classList.add('hidden');
      };
    });

    // Close open menus when clicking inside modal
    modalEl.querySelector('.flex-1').onclick = () => {
      menuVc.classList.add('hidden');
      menuCat.classList.add('hidden');
      menuRole.classList.add('hidden');
    };

    // Name template input & tokens
    const inpTemplate = modalEl.querySelector('#inp-modal-name-template');
    inpTemplate.oninput = (e) => {
      nameTemplate = e.target.value;
      updatePreview();
    };

    modalEl.querySelectorAll('.btn-token-insert').forEach(btn => {
      btn.onclick = () => {
        const token = btn.dataset.token;
        if (!nameTemplate.includes(token)) {
          nameTemplate = (nameTemplate.trim() + ' ' + token).trim();
          inpTemplate.value = nameTemplate;
          updatePreview();
        }
      };
    });

    // User limit input
    const inpLimit = modalEl.querySelector('#inp-modal-user-limit');
    inpLimit.oninput = (e) => {
      userLimit = parseInt(e.target.value, 10) || 0;
      if (userLimit < 0) userLimit = 0;
      if (userLimit > 99) userLimit = 99;
    };

    // Submit button
    const btnSubmit = modalEl.querySelector('#modal-btn-submit');
    btnSubmit.onclick = async () => {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `
        <svg class="animate-spin w-4 h-4 text-black mr-2 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Saving...</span>
      `;

      try {
        const newHub = {
          hub_channel_id: selectedVoiceChannelId === 'new' ? 'new' : selectedVoiceChannelId,
          category_id: selectedCategoryId || null,
          default_user_limit: userLimit,
          name_template: nameTemplate || "{user}'s Channel",
          required_role_id: selectedRoleId || null,
          create_new: selectedVoiceChannelId === 'new'
        };

        if (isEdit) {
          cfg.hubs[editIndex] = newHub;
        } else {
          cfg.hubs.push(newHub);
        }

        cfg.enabled = true; // Auto-enable when creating a trigger

        await API.saveConfig(guildId, {
          tempvoice: {
            enabled: cfg.enabled,
            hubs: cfg.hubs
          }
        });

        // Re-fetch config to get actual created channel IDs if 'new' was created
        const updatedConfig = await API.getConfig(guildId).catch(() => null);
        if (updatedConfig) {
          if (updatedConfig.voice_channels) voiceChannels = updatedConfig.voice_channels;
          if (updatedConfig.categories) categories = updatedConfig.categories;
          if (updatedConfig.config && updatedConfig.config.tempvoice) {
            cfg = {
              enabled: Boolean(updatedConfig.config.tempvoice.enabled),
              hubs: Array.isArray(updatedConfig.config.tempvoice.hubs) ? updatedConfig.config.tempvoice.hubs : []
            };
          }
        }

        closeModal();
        renderView();

        if (window.Toast && Toast.success) {
          Toast.success(isEdit ? 'Trigger channel updated successfully!' : 'Trigger channel created successfully!');
        }
      } catch (err) {
        console.error('Failed to save trigger channel:', err);
        btnSubmit.disabled = false;
        btnSubmit.textContent = isEdit ? 'Save Changes' : 'Create Channel';
        if (window.Toast && Toast.error) Toast.error('Failed to create channel: ' + err.message);
      }
    };
  }

  renderView();
};

window.renderTempVoiceModule = function (el, guildId) {
  return DashboardTabs.TempVoice(el, guildId);
};

DashboardTabs.Jtc = DashboardTabs.TempVoice;
