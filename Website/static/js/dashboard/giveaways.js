/**
 * Orbit Dashboard - Giveaways Tab (Werbegeschenke)
 * 1:1 PeakBot UI & Full End-to-End Functionality:
 * - Feature Header (`lucide-gift` + `Werbegeschenke`)
 * - Filter Tabs (`Alle`, `Aktiv`, `Geplant`, `Beendet`, `Entwürfe`)
 * - Active Counter & Progress Bar (`X/999 aktiv`)
 * - `+ Giveaway erstellen` button & dashed creation card
 * - Giveaway Cards (accent color bar, icon, title, channel, winners count, status badge, 3-dots action menu, participant count, countdown/ended timestamp)
 * - 3-Column `Create Giveaway` Modal with live Discord Embed & Button Preview, Quick Presets, Searchable Channel Selector, Role Requirements, Duration, Winners Stepper, Large Color Tiles
 * - Full `Giveaway Details / Results` Modal with Winner Avatars, Reroll Button, Early End Button, Discord Link & Delete
 */

DashboardTabs.Giveaways = async function(container, guildId) {
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
    else alert(msg);
  }

  function formatRelativeTime(unixSeconds) {
    if (!unixSeconds) return 'Vor wenigen Sekunden';
    const nowSec = Math.floor(Date.now() / 1000);
    const diff = Math.max(0, nowSec - Number(unixSeconds));
    if (diff < 60) return 'Vor 1m';
    if (diff < 3600) return `Vor ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `Vor ${Math.floor(diff / 3600)}h`;
    const days = Math.floor(diff / 86400);
    if (days < 30) return `Vor ${days}d`;
    return new Date(Number(unixSeconds) * 1000).toLocaleDateString('de-DE');
  }

  function formatTimeRemaining(endTimestamp) {
    if (!endTimestamp) return 'Kein Limit';
    const nowSec = Math.floor(Date.now() / 1000);
    const diff = Number(endTimestamp) - nowSec;
    if (diff <= 0) return 'Gerade beendet';
    if (diff < 60) return `Endet in ${diff}s`;
    if (diff < 3600) return `Endet in ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `Endet in ${Math.floor(diff / 3600)}h`;
    const days = Math.floor(diff / 86400);
    return `Endet in ${days}d`;
  }

  // Loading state
  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-center p-16 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400 w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Lade Werbegeschenke...
      </div>
    </div>
  `;

  try {
    const [giveawaysRes, rawChannels, rawRoles, cfgRes] = await Promise.all([
      API.getGiveaways(guildId).catch(() => ({ giveaways: [] })),
      API.getChannels(guildId).catch(() => ([])),
      API.getRoles(guildId).catch(() => ([])),
      API.getConfig(guildId).catch(() => ({}))
    ]);

    let giveaways = Array.isArray(giveawaysRes?.giveaways) ? giveawaysRes.giveaways : [];
    const allChs = (Array.isArray(rawChannels) && rawChannels.length > 0)
      ? rawChannels
      : (Array.isArray(cfgRes?.channels) ? cfgRes.channels : []);
    let textChannels = allChs.filter(c => !c.type || c.type === 'text' || c.type === 'news' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text')));
    const allRls = (Array.isArray(rawRoles) && rawRoles.length > 0)
      ? rawRoles
      : (Array.isArray(cfgRes?.roles) ? cfgRes.roles : []);
    let roles = allRls.filter(r => r.name !== '@everyone');

    let currentFilter = 'all'; // 'all' | 'active' | 'scheduled' | 'ended' | 'draft'
    let openMenuId = null;

    function getChannelName(channelId) {
      if (!channelId) return 'general';
      const found = textChannels.find(c => String(c.id) === String(channelId));
      return found ? found.name : 'unbekannt';
    }

    function getRoleName(roleId) {
      if (!roleId) return '';
      const found = roles.find(r => String(r.id) === String(roleId));
      return found ? found.name : '';
    }

    function renderMainView() {
      const activeCount = giveaways.filter(g => g.status === 'active').length;
      const activeProgressPct = Math.min(100, (activeCount / 999) * 100);

      const filteredGiveaways = giveaways.filter(g => {
        if (currentFilter === 'active') return g.status === 'active';
        if (currentFilter === 'scheduled') return g.status === 'scheduled';
        if (currentFilter === 'ended') return g.status === 'ended';
        if (currentFilter === 'draft') return g.status === 'draft';
        return true;
      });

      const filterTabs = [
        { id: 'all', label: 'Alle' },
        { id: 'active', label: 'Aktiv' },
        { id: 'scheduled', label: 'Geplant' },
        { id: 'ended', label: 'Beendet' },
        { id: 'draft', label: 'Entwürfe' }
      ];

      container.innerHTML = `
        <main class="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto">
          <div>
            <!-- Feature Header -->
            <div data-tour="feature-header" class="scroll-mt-24">
              <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift w-5 h-5">
                      <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                      <path d="M12 8v13"></path>
                      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
                      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
                    </svg>
                  </span>
                  <h1 class="text-base font-medium text-white truncate">Werbegeschenke</h1>
                </div>
              </div>
            </div>

            <!-- Filter Bar & Actions -->
            <div class="mt-6">
              <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 mb-6">
                <!-- Segmented Filter Bar -->
                <div data-tour="giveaways-filters" class="flex gap-0.5 p-1 rounded-xl bg-neutral-800/50 border border-neutral-800 scroll-mt-24 overflow-x-auto max-w-full">
                  ${filterTabs.map(tab => {
                    const isActive = currentFilter === tab.id;
                    return `
                      <button type="button" data-filter="${tab.id}" class="px-3 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer ${
                        isActive
                          ? 'bg-white text-black font-medium'
                          : 'text-neutral-400 hover:text-white'
                      }">
                        ${tab.label}
                      </button>
                    `;
                  }).join('')}
                </div>

                <!-- Active Counter & Create Button -->
                <div class="flex flex-wrap items-center gap-3">
                  <div class="flex items-center gap-3">
                    <span class="text-xs tabular-nums text-neutral-500">${activeCount}/999 aktiv</span>
                    <div class="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden">
                      <div class="h-full rounded-full transition-all bg-white/60" style="width: ${activeProgressPct}%;"></div>
                    </div>
                  </div>
                  <button type="button" id="create-giveaway-top-btn" data-tour="giveaways-create" class="flex items-center gap-2 h-10 px-5 bg-white text-black font-medium text-sm rounded-xl scroll-mt-24 whitespace-nowrap hover:bg-neutral-200 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-4 h-4"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                    Giveaway erstellen
                  </button>
                </div>
              </div>

              <!-- Grid -->
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <!-- Dashed Create Card -->
                <div id="create-giveaway-card" class="border border-dashed border-neutral-700 rounded-2xl px-6 py-7 flex flex-col items-center justify-center gap-2.5 min-h-[176px] cursor-pointer hover:border-neutral-500 hover:bg-neutral-800/20 transition-[transform,border-color,background-color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                  <div class="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-5 h-5 text-neutral-400"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                  </div>
                  <p class="text-sm font-semibold text-white">Create Giveaway</p>
                </div>

                <!-- Giveaway Cards -->
                ${filteredGiveaways.map(gw => {
                  const cardColor = gw.color || '#5865F2';
                  const isMenuOpen = openMenuId === gw.id;
                  const channelDisplay = gw.channel_name || getChannelName(gw.channel_id);
                  const winnersCount = gw.winners_count || 1;
                  const participantsCount = gw.participants_count || (Array.isArray(gw.participants) ? gw.participants.length : 0);

                  let badgeBg = 'bg-emerald-500/10 text-emerald-400';
                  let badgeText = 'aktiv';
                  if (gw.status === 'ended') {
                    badgeBg = 'bg-neutral-800 text-neutral-500';
                    badgeText = 'beendet';
                  } else if (gw.status === 'scheduled') {
                    badgeBg = 'bg-sky-500/10 text-sky-400';
                    badgeText = 'geplant';
                  } else if (gw.status === 'draft') {
                    badgeBg = 'bg-amber-500/10 text-amber-400';
                    badgeText = 'entwurf';
                  }

                  let timeText = '';
                  if (gw.status === 'active' && gw.end_timestamp) {
                    timeText = formatTimeRemaining(gw.end_timestamp);
                  } else if (gw.status === 'ended') {
                    timeText = `Beendet ${formatRelativeTime(gw.end_timestamp || gw.created_at)}`;
                  } else if (gw.status === 'draft') {
                    timeText = 'Entwurf';
                  } else {
                    timeText = formatRelativeTime(gw.created_at);
                  }

                  return `
                    <div data-gw-id="${gw.id}" class="orbit-gw-card group bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all cursor-pointer relative flex flex-col justify-between">
                      <div>
                        <!-- Top Accent Bar -->
                        <div class="h-[3px]" style="background-color: ${cardColor};"></div>
                        <div class="p-4">
                          <div class="flex items-start justify-between gap-3 mb-3">
                            <div class="flex items-start gap-3 min-w-0 flex-1">
                              <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style="background-color: ${cardColor}1A;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift w-4 h-4" style="color: ${cardColor};">
                                  <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                                  <path d="M12 8v13"></path>
                                  <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
                                  <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
                                </svg>
                              </div>
                              <div class="min-w-0 flex-1">
                                <h3 class="text-sm font-semibold text-white line-clamp-2 pt-1 leading-snug">${escapeHtml(gw.prize)}</h3>
                                <p class="text-xs text-neutral-400 truncate mt-0.5 flex items-center gap-1.5">
                                  <span class="text-neutral-500">#</span><span class="text-neutral-300">${escapeHtml(channelDisplay)}</span>
                                  <span class="text-neutral-600">•</span>
                                  <span>${winnersCount} ${winnersCount === 1 ? 'Gewinner' : 'Gewinner'}</span>
                                </p>
                              </div>
                            </div>
                            <div class="flex items-center gap-1.5 flex-shrink-0">
                              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${badgeBg}">${badgeText}</span>
                              <div class="relative">
                                <button type="button" aria-label="Aktionen" data-menu-toggle="${gw.id}" class="p-2 -m-1 rounded-lg text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal w-4 h-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                </button>
                                ${isMenuOpen ? `
                                  <div class="absolute right-0 top-full mt-1 w-48 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                                    <button type="button" data-action="details" data-id="${gw.id}" class="flex items-center gap-2 w-full px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                                      Ergebnisse & Details
                                    </button>
                                    ${gw.status === 'active' ? `
                                      <button type="button" data-action="end" data-id="${gw.id}" class="flex items-center gap-2 w-full px-3 py-2 text-xs text-amber-400 hover:bg-neutral-700 transition-colors cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><line x1="10" x2="10" y1="15" y2="9"></line><line x1="14" x2="14" y1="15" y2="9"></line></svg>
                                        Giveaway beenden
                                      </button>
                                    ` : ''}
                                    ${gw.status === 'ended' ? `
                                      <button type="button" data-action="reroll" data-id="${gw.id}" class="flex items-center gap-2 w-full px-3 py-2 text-xs text-indigo-400 hover:bg-neutral-700 transition-colors cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
                                        Neu auslosen (Reroll)
                                      </button>
                                    ` : ''}
                                    ${gw.jump_url ? `
                                      <a href="${gw.jump_url}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 w-full px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" x2="21" y1="14" y2="3"></line></svg>
                                        In Discord öffnen
                                      </a>
                                    ` : ''}
                                    <div class="h-px bg-neutral-700/60 my-1"></div>
                                    <button type="button" data-action="delete" data-id="${gw.id}" class="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-neutral-700 transition-colors cursor-pointer">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                      Löschen
                                    </button>
                                  </div>
                                ` : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Bottom Bar -->
                      <div class="flex items-center justify-between text-xs text-neutral-400 px-4 py-3 border-t border-neutral-800/60 bg-neutral-900/50">
                        <span class="flex items-center gap-1.5 text-neutral-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-3.5 h-3.5 text-neutral-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                          <span>${participantsCount} Teilnehmer</span>
                        </span>
                        <span class="text-neutral-500">${timeText}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </main>
      `;

      attachEventListeners();
    }

    function attachEventListeners() {
      // Filter tab buttons
      container.querySelectorAll('[data-filter]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          currentFilter = btn.getAttribute('data-filter');
          openMenuId = null;
          renderMainView();
        };
      });

      // Create giveaway top & card buttons
      const topCreate = container.querySelector('#create-giveaway-top-btn');
      if (topCreate) topCreate.onclick = () => openCreateGiveawayModal();

      const cardCreate = container.querySelector('#create-giveaway-card');
      if (cardCreate) cardCreate.onclick = () => openCreateGiveawayModal();

      // Card clicks for Details
      container.querySelectorAll('.orbit-gw-card').forEach(card => {
        card.onclick = (e) => {
          // If clicked inside 3-dots or menu, skip
          if (e.target.closest('[data-menu-toggle]') || e.target.closest('[data-action]') || e.target.closest('a')) return;
          const gwId = card.getAttribute('data-gw-id');
          const found = giveaways.find(g => String(g.id) === String(gwId));
          if (found) openGiveawayDetailsModal(found);
        };
      });

      // 3-dots menu toggles
      container.querySelectorAll('[data-menu-toggle]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const gwId = btn.getAttribute('data-menu-toggle');
          openMenuId = (openMenuId === gwId) ? null : gwId;
          renderMainView();
        };
      });

      // Dropdown Actions
      container.querySelectorAll('[data-action]').forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          const action = btn.getAttribute('data-action');
          const gwId = btn.getAttribute('data-id');
          openMenuId = null;

          const gw = giveaways.find(g => String(g.id) === String(gwId));
          if (!gw) return;

          if (action === 'details') {
            openGiveawayDetailsModal(gw);
          } else if (action === 'end') {
            await handleEndGiveaway(gw);
          } else if (action === 'reroll') {
            await handleRerollGiveaway(gw);
          } else if (action === 'delete') {
            await handleDeleteGiveaway(gw);
          }
        };
      });

      // Global click closes dropdowns
      const onDocClick = () => {
        if (openMenuId !== null) {
          openMenuId = null;
          renderMainView();
        }
      };
      document.removeEventListener('click', container._onDocClick);
      container._onDocClick = onDocClick;
      document.addEventListener('click', onDocClick);
    }

    // =========================================================================
    // END, REROLL, DELETE HANDLERS
    // =========================================================================
    async function handleEndGiveaway(gw) {
      if (!confirm(`Möchtest du das Giveaway für "${gw.prize}" jetzt vorzeitig beenden und Gewinner auslosen?`)) return;
      try {
        const res = await API.endGiveaway(guildId, gw.id);
        if (res?.error) {
          showNotify(res.error, 'error');
          return;
        }
        showNotify('Giveaway erfolgreich beendet!', 'success');
        const ref = await API.getGiveaways(guildId, true);
        giveaways = ref.giveaways || [];
        renderMainView();
      } catch (err) {
        showNotify(err?.message || 'Fehler beim Beenden.', 'error');
      }
    }

    async function handleRerollGiveaway(gw) {
      try {
        const res = await API.rerollGiveaway(guildId, gw.id, { winners: gw.winners_count || 1 });
        if (res?.error) {
          showNotify(res.error, 'error');
          return;
        }
        showNotify('Gewinner wurden neu ausgelost!', 'success');
        const ref = await API.getGiveaways(guildId, true);
        giveaways = ref.giveaways || [];
        renderMainView();
      } catch (err) {
        showNotify(err?.message || 'Fehler beim Auslosen.', 'error');
      }
    }

    async function handleDeleteGiveaway(gw) {
      if (!confirm(`Bist du sicher, dass du das Giveaway für "${gw.prize}" löschen möchtest?`)) return;
      try {
        const res = await API.deleteGiveaway(guildId, gw.id);
        if (res?.error) {
          showNotify(res.error, 'error');
          return;
        }
        showNotify('Giveaway gelöscht.', 'success');
        giveaways = giveaways.filter(g => String(g.id) !== String(gw.id));
        renderMainView();
      } catch (err) {
        showNotify(err?.message || 'Fehler beim Löschen.', 'error');
      }
    }

    // =========================================================================
    // GIVEAWAY DETAILS / RESULTS MODAL
    // =========================================================================
    function openGiveawayDetailsModal(gw) {
      const prev = document.getElementById('orbit-gw-details-modal');
      if (prev) prev.remove();

      document.body.style.overflow = 'hidden';

      const modal = document.createElement('div');
      modal.id = 'orbit-gw-details-modal';
      modal.className = 'fixed inset-0 lg:left-64 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in';

      const channelDisplay = gw.channel_name || getChannelName(gw.channel_id);
      const roleDisplay = gw.required_role_name || getRoleName(gw.required_role_id);
      const winners = Array.isArray(gw.picked_winners) ? gw.picked_winners : [];
      const participants = Array.isArray(gw.participants) ? gw.participants : [];

      let badgeBg = 'bg-emerald-500/10 text-emerald-400';
      let badgeText = 'aktiv';
      if (gw.status === 'ended') {
        badgeBg = 'bg-neutral-800 text-neutral-500';
        badgeText = 'beendet';
      } else if (gw.status === 'draft') {
        badgeBg = 'bg-amber-500/10 text-amber-400';
        badgeText = 'entwurf';
      }

      modal.innerHTML = `
        <div role="dialog" aria-modal="true" aria-label="Giveaway Details" class="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
          <!-- Top Accent Bar -->
          <div class="h-[3px] flex-shrink-0" style="background-color: ${gw.color || '#5865F2'};"></div>

          <!-- Header -->
          <div class="flex items-start justify-between px-6 pt-5 pb-3 flex-shrink-0">
            <div class="flex-1 min-w-0 pr-3">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${badgeBg}">${badgeText}</span>
                <span class="text-xs text-neutral-500 flex items-center gap-1">
                  <span class="text-neutral-600">#</span>${escapeHtml(channelDisplay)}
                </span>
              </div>
              <h2 class="text-lg font-bold text-white leading-tight break-words">${escapeHtml(gw.prize)}</h2>
              ${gw.description ? `<p class="text-xs text-neutral-400 mt-1 leading-relaxed">${escapeHtml(gw.description)}</p>` : ''}
            </div>
            <button type="button" aria-label="Schließen" id="gw-details-close-btn" class="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors flex-shrink-0 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-3 space-y-4 flex-1 min-h-0 overflow-y-auto" data-lenis-prevent>
            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-2.5">
              <div class="p-3 rounded-xl bg-neutral-800/40 border border-neutral-800">
                <span class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Teilnehmer</span>
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-neutral-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  <span class="text-base font-bold text-white tabular-nums">${gw.participants_count || participants.length}</span>
                </div>
              </div>
              <div class="p-3 rounded-xl bg-neutral-800/40 border border-neutral-800">
                <span class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Gewinnerplätze</span>
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-amber-400"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                  <span class="text-base font-bold text-white tabular-nums">${gw.winners_count || 1}</span>
                </div>
              </div>
            </div>

            ${roleDisplay ? `
              <div class="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs text-indigo-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-indigo-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span>Erforderliche Rolle:</span>
                </div>
                <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-200">@${escapeHtml(roleDisplay)}</span>
              </div>
            ` : ''}

            <!-- Winners Box -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-amber-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  Gewinner
                </label>
                <span class="text-[11px] text-neutral-500">${winners.length} ermittelt</span>
              </div>

              ${winners.length > 0 ? `
                <div class="space-y-2">
                  ${winners.map((w, idx) => `
                    <div class="flex items-center justify-between p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0 text-xs font-bold text-white">
                          ${w.avatar ? `<img src="${w.avatar}" alt="" class="w-full h-full object-cover">` : (w.name || '?')[0].toUpperCase()}
                        </div>
                        <div class="min-w-0">
                          <p class="text-sm font-semibold text-white truncate">${escapeHtml(w.name || w.id || 'Benutzer')}</p>
                          <p class="text-[10px] text-neutral-500 tabular-nums">ID: ${escapeHtml(w.id || '')}</p>
                        </div>
                      </div>
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 uppercase tracking-wide">#${idx + 1}</span>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="p-4 rounded-xl bg-neutral-800/30 border border-neutral-800 text-center">
                  <p class="text-xs text-neutral-400">
                    ${gw.status === 'active' ? 'Wird nach Ablauf automatisch ausgelost.' : 'Keine gültigen Gewinner vorhanden.'}
                  </p>
                </div>
              `}
            </div>

            <!-- Participants Preview -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Teilnehmerliste</label>
                <span class="text-[11px] text-neutral-500">${participants.length} gesamt</span>
              </div>
              ${participants.length > 0 ? `
                <div class="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-neutral-800/30 border border-neutral-800/80 scrollbar-thin" data-lenis-prevent>
                  ${participants.map(p => `
                    <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-800/40 text-xs text-neutral-300">
                      <div class="w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden flex-shrink-0">
                        ${p.avatar ? `<img src="${p.avatar}" alt="" class="w-full h-full object-cover">` : (p.name || '?')[0].toUpperCase()}
                      </div>
                      <span class="truncate">${escapeHtml(p.name || p.id || 'User')}</span>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="p-3 rounded-xl bg-neutral-800/20 border border-neutral-800/60 text-center">
                  <p class="text-xs text-neutral-500">Noch keine Teilnehmer.</p>
                </div>
              `}
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-6 py-4 border-t border-neutral-800 bg-neutral-900/90 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
            <div>
              ${gw.jump_url ? `
                <a href="${gw.jump_url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" x2="21" y1="14" y2="3"></line></svg>
                  Discord
                </a>
              ` : ''}
            </div>
            <div class="flex items-center gap-2">
              ${gw.status === 'active' ? `
                <button type="button" id="gw-modal-end-btn" class="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer">
                  Vorzeitig beenden
                </button>
              ` : ''}
              ${gw.status === 'ended' ? `
                <button type="button" id="gw-modal-reroll-btn" class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors cursor-pointer">
                  Gewinner neu auslosen
                </button>
              ` : ''}
              <button type="button" id="gw-modal-delete-btn" class="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer">
                Löschen
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const closeModal = () => {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = '';
        modal.remove();
      };
      const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(); };
      document.addEventListener('keydown', onKeyDown);

      modal.querySelector('#gw-details-close-btn').onclick = closeModal;
      modal.onclick = (e) => { if (e.target === modal) closeModal(); };

      const endBtn = modal.querySelector('#gw-modal-end-btn');
      if (endBtn) {
        endBtn.onclick = async () => {
          closeModal();
          await handleEndGiveaway(gw);
        };
      }

      const rerollBtn = modal.querySelector('#gw-modal-reroll-btn');
      if (rerollBtn) {
        rerollBtn.onclick = async () => {
          closeModal();
          await handleRerollGiveaway(gw);
        };
      }

      const delBtn = modal.querySelector('#gw-modal-delete-btn');
      if (delBtn) {
        delBtn.onclick = async () => {
          closeModal();
          await handleDeleteGiveaway(gw);
        };
      }
    }

    // =========================================================================
    // 3-COLUMN "CREATE GIVEAWAY" MODAL (1:1 PEAKBOT DESIGN)
    // =========================================================================
    function openCreateGiveawayModal() {
      const prev = document.getElementById('orbit-create-gw-modal');
      if (prev) prev.remove();

      document.body.style.overflow = 'hidden';

      const state = {
        prize: '',
        description: '',
        channel_id: textChannels.length > 0 ? String(textChannels[0].id) : '',
        winners_count: 1,
        duration_value: 1,
        duration_unit: 'days', // 'minutes' | 'hours' | 'days' | 'weeks'
        required_role_id: '',
        color: '#5865F2'
      };

      const unitSeconds = {
        minutes: 60,
        hours: 3600,
        days: 86400,
        weeks: 604800
      };

      const unitLabels = {
        minutes: 'Minuten',
        hours: 'Stunden',
        days: 'Tage',
        weeks: 'Wochen'
      };

      const colorPalette = [
        '#5865F2', // Discord Blurple
        '#10B981', // Emerald
        '#F43F5E', // Rose
        '#F59E0B', // Amber
        '#06B6D4', // Cyan
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#6366F1'  // Indigo
      ];

      const modal = document.createElement('div');
      modal.id = 'orbit-create-gw-modal';
      modal.className = 'fixed inset-0 lg:left-64 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in';

      modal.innerHTML = `
        <div role="dialog" aria-modal="true" aria-label="Giveaway erstellen" class="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-[1300px] max-h-[90vh] flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
          <!-- Top Bar -->
          <div id="gw-preview-top-accent" class="h-[3px] flex-shrink-0" style="background-color: ${state.color};"></div>

          <!-- Header -->
          <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 flex-shrink-0">
            <div>
              <h2 class="text-base sm:text-lg font-semibold text-white">Giveaway erstellen</h2>
              <p class="text-xs text-neutral-500 mt-0.5 hidden sm:block">Konfiguriere Preis, Gewinner, Dauer und Berechtigungen</p>
            </div>
            <button type="button" id="gw-modal-close" aria-label="Close" class="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>

          <!-- 3-Column Body -->
          <div class="flex-1 overflow-y-auto min-h-0" data-lenis-prevent>
            <div class="grid grid-cols-1 lg:grid-cols-[340px,1fr,300px] lg:min-h-[480px]">
              <!-- Left Column: Quick Presets, Prize, Description, Winners Stepper, Duration -->
              <div class="p-4 sm:p-6 space-y-4 sm:space-y-5 border-b lg:border-b-0 lg:border-r border-neutral-800">
                <!-- Quick Presets -->
                <div>
                  <label class="text-xs font-medium text-neutral-400 mb-2 block">Schnellstart-Vorlagen</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button type="button" data-gw-preset="nitro" class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border bg-neutral-800/50 border-neutral-700/50 text-neutral-300 hover:text-white hover:border-neutral-500 transition-all cursor-pointer">
                      <svg class="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"></path></svg>
                      Nitro
                    </button>
                    <button type="button" data-gw-preset="vip" class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border bg-neutral-800/50 border-neutral-700/50 text-neutral-300 hover:text-white hover:border-neutral-500 transition-all cursor-pointer">
                      <svg class="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      VIP Rang
                    </button>
                    <button type="button" data-gw-preset="steam" class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border bg-neutral-800/50 border-neutral-700/50 text-neutral-300 hover:text-white hover:border-neutral-500 transition-all cursor-pointer">
                      <svg class="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
                      Steam Card
                    </button>
                    <button type="button" data-gw-preset="custom" class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border bg-neutral-800/50 border-neutral-700/50 text-neutral-300 hover:text-white hover:border-neutral-500 transition-all cursor-pointer">
                      <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>
                      Eigener Preis
                    </button>
                  </div>
                </div>

                <!-- Prize Input -->
                <div>
                  <label class="text-xs font-medium text-neutral-400 mb-2 block">Preis / Gewinn *</label>
                  <input id="gw-prize-input" placeholder="z. B. Discord Nitro, 10€ Paysafecard..." maxlength="100" class="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-all" type="text" value="${escapeHtml(state.prize)}">
                  <div class="flex justify-end mt-1">
                    <span id="gw-prize-counter" class="text-[10px] tabular-nums text-neutral-600">${state.prize.length}/100</span>
                  </div>
                </div>

                <!-- Description / Details -->
                <div>
                  <label class="text-xs font-medium text-neutral-400 mb-2 block">Beschreibung / Anweisungen (Optional)</label>
                  <textarea id="gw-description-input" rows="2" placeholder="z. B. Gesponsert von Orbit. Gewinner wird per DM kontaktiert." class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-all resize-none">${escapeHtml(state.description)}</textarea>
                </div>

                <!-- Winners Stepper -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-xs font-medium text-neutral-400">Anzahl der Gewinner</label>
                    <span id="gw-winners-display" class="text-xs font-semibold text-white tabular-nums">${state.winners_count} Gewinner</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button type="button" id="gw-winners-minus" class="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700 flex items-center justify-center font-bold text-base transition-colors cursor-pointer">-</button>
                    <input id="gw-winners-input" type="number" min="1" max="25" value="${state.winners_count}" class="flex-1 h-10 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-center text-white font-semibold focus:outline-none focus:border-neutral-500">
                    <button type="button" id="gw-winners-plus" class="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700 flex items-center justify-center font-bold text-base transition-colors cursor-pointer">+</button>
                  </div>
                </div>

                <!-- Duration -->
                <div>
                  <label class="text-xs font-medium text-neutral-400 mb-2 block">Dauer</label>
                  <div class="grid grid-cols-[1fr,130px] gap-2">
                    <input id="gw-duration-value" type="number" min="1" max="365" value="${state.duration_value}" class="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500">
                    <select id="gw-duration-unit" class="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500 cursor-pointer">
                      <option value="minutes">Minuten</option>
                      <option value="hours">Stunden</option>
                      <option value="days" selected>Tage</option>
                      <option value="weeks">Wochen</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Center Column: Discord Live Preview -->
              <div class="p-6 bg-[#313338]/40 border-b lg:border-b-0 lg:border-r border-neutral-800 min-w-0">
                <label class="text-xs font-medium text-neutral-400 mb-3 block">Discord Vorschau</label>
                <div class="rounded-xl overflow-hidden border border-neutral-700/40 shadow-xl max-w-[420px] mx-auto">
                  <!-- Channel Header -->
                  <div class="bg-[#2f3136] px-4 py-2.5 flex items-center gap-2 border-b border-neutral-800/80">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-neutral-400"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                    <span id="gw-preview-channel" class="text-xs font-semibold text-white">${escapeHtml(getChannelName(state.channel_id))}</span>
                  </div>

                  <!-- Discord Message -->
                  <div class="bg-[#313338] p-4 space-y-3">
                    <div class="flex gap-3">
                      <div class="w-9 h-9 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        O
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 mb-1">
                          <span class="text-xs font-semibold text-indigo-400 whitespace-nowrap">Orbit</span>
                          <span class="inline-flex items-center gap-[0.15em] px-1 py-px text-[9px] font-bold bg-[#5865F2] text-white rounded">APP</span>
                          <span class="text-[10px] text-neutral-500">Heute um 12:00</span>
                        </div>

                        <!-- Embed Box -->
                        <div id="gw-preview-embed" class="border-l-[4px] rounded-r-lg bg-[#2b2d31] p-3.5 space-y-2.5" style="border-color: ${state.color};">
                          <div class="flex items-center gap-2">
                            <span class="text-base">🎉</span>
                            <span class="text-xs font-bold uppercase tracking-wider text-white">GIVEAWAY</span>
                          </div>

                          <div>
                            <h4 id="gw-preview-prize" class="text-sm font-bold text-white leading-snug break-words">Discord Nitro</h4>
                            <p id="gw-preview-desc" class="text-xs text-neutral-400 mt-1 leading-relaxed hidden"></p>
                          </div>

                          <div class="space-y-1 pt-1 border-t border-neutral-700/50 text-xs">
                            <div class="flex items-center gap-1.5 text-neutral-300">
                              <span>🎁</span>
                              <span>Klicke auf den Button unten, um teilzunehmen!</span>
                            </div>
                            <div class="flex items-center gap-1.5 text-neutral-400">
                              <span>⏱️</span>
                              <span>Endet: <strong id="gw-preview-duration" class="text-neutral-200">in 1 Tag</strong></span>
                            </div>
                            <div class="flex items-center gap-1.5 text-neutral-400">
                              <span>🏆</span>
                              <span>Gewinner: <strong id="gw-preview-winners" class="text-neutral-200">1</strong></span>
                            </div>
                            <div id="gw-preview-role-row" class="flex items-center gap-1.5 text-neutral-400 hidden">
                              <span>🔒</span>
                              <span>Rolle benötigt: <strong id="gw-preview-role" class="text-indigo-300">@VIP</strong></span>
                            </div>
                          </div>
                        </div>

                        <!-- Discord Interactive Buttons Mockup -->
                        <div class="flex items-center gap-2 mt-2.5">
                          <button type="button" disabled class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-medium shadow transition-colors">
                            <span>🎉</span>
                            <span>Teilnehmen (0)</span>
                          </button>
                          <button type="button" disabled class="px-3 py-1.5 rounded bg-[#4e5058] text-white text-xs font-medium shadow opacity-60">
                            Verlassen
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Channel, Role Requirement, Accent Color Tiles -->
              <div class="p-4 sm:p-6 space-y-5">
                <!-- Target Channel Dropdown -->
                <div>
                  <label class="text-xs font-medium text-neutral-400 mb-2 block">Zielkanal *</label>
                  <div class="relative" id="gw-channel-dd-wrap">
                    <button type="button" id="gw-channel-dd-btn" class="w-full flex items-center justify-between px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500 cursor-pointer">
                      <span id="gw-channel-dd-label" class="truncate flex items-center gap-1.5">
                        <span class="text-neutral-500">#</span>
                        <span>${escapeHtml(getChannelName(state.channel_id))}</span>
                      </span>
                      <svg class="w-4 h-4 text-neutral-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"></path></svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <div id="gw-channel-dd-menu" class="hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl z-40 overflow-hidden">
                      <div class="p-2 border-b border-neutral-700">
                        <div class="relative">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                          <input id="gw-channel-search-input" placeholder="Kanal suchen..." class="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none">
                        </div>
                      </div>
                      <div id="gw-channel-dd-list" class="max-h-48 overflow-y-auto p-1 space-y-0.5" data-lenis-prevent>
                        ${textChannels.map(c => `
                          <button type="button" data-ch-id="${c.id}" data-ch-name="${escapeHtml(c.name)}" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer">
                            <span class="text-neutral-500">#</span>
                            <span class="truncate">${escapeHtml(c.name)}</span>
                          </button>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Required Role Dropdown -->
                <div>
                  <label class="text-xs font-medium text-neutral-400 mb-2 block">Rollen-Voraussetzung (Optional)</label>
                  <div class="relative" id="gw-role-dd-wrap">
                    <button type="button" id="gw-role-dd-btn" class="w-full flex items-center justify-between px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500 cursor-pointer">
                      <span id="gw-role-dd-label" class="truncate text-neutral-400">Keine Rolle erforderlich</span>
                      <svg class="w-4 h-4 text-neutral-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"></path></svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <div id="gw-role-dd-menu" class="hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl z-40 overflow-hidden">
                      <div class="p-2 border-b border-neutral-700">
                        <div class="relative">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                          <input id="gw-role-search-input" placeholder="Rolle suchen..." class="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none">
                        </div>
                      </div>
                      <div id="gw-role-dd-list" class="max-h-48 overflow-y-auto p-1 space-y-0.5" data-lenis-prevent>
                        <button type="button" data-role-id="" data-role-name="" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer">
                          <span>Keine Rolle erforderlich</span>
                        </button>
                        ${roles.map(r => `
                          <button type="button" data-role-id="${r.id}" data-role-name="${escapeHtml(r.name)}" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer">
                            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${r.color && r.color !== 0 ? '#' + r.color.toString(16).padStart(6, '0') : '#99aab5'};"></span>
                            <span class="truncate">@${escapeHtml(r.name)}</span>
                          </button>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Large Color Tiles Palette -->
                <div>
                  <label class="text-xs font-medium text-neutral-400 mb-2 block">Akzentfarbe</label>
                  <div class="grid grid-cols-4 gap-2.5 mb-3" id="gw-color-tiles">
                    ${colorPalette.map(hex => `
                      <button type="button" data-color="${hex}" class="gw-color-tile h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${state.color.toLowerCase() === hex.toLowerCase() ? 'ring-2 ring-white scale-105 shadow-lg' : 'hover:scale-102 opacity-80 hover:opacity-100'}" style="background-color: ${hex};">
                        ${state.color.toLowerCase() === hex.toLowerCase() ? `<svg class="w-4 h-4 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"></path></svg>` : ''}
                      </button>
                    `).join('')}
                  </div>
                  <div class="flex items-center gap-2">
                    <input id="gw-color-input" type="text" maxlength="7" value="${state.color}" class="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-neutral-500">
                    <input id="gw-color-picker" type="color" value="${state.color}" class="w-9 h-8 p-0 bg-transparent rounded-lg border-0 cursor-pointer">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-800 bg-neutral-900/95 flex-shrink-0">
            <button type="button" id="gw-cancel-btn" class="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer">Abbrechen</button>
            <div class="flex items-center gap-2.5">
              <button type="button" id="gw-save-draft-btn" class="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold border border-neutral-700 transition-colors cursor-pointer">Als Entwurf speichern</button>
              <button type="button" id="gw-submit-btn" class="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">Giveaway erstellen</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const closeModal = () => {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = '';
        modal.remove();
      };
      const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(); };
      document.addEventListener('keydown', onKeyDown);

      modal.querySelector('#gw-modal-close').onclick = closeModal;
      modal.querySelector('#gw-cancel-btn').onclick = closeModal;
      modal.onclick = (e) => { if (e.target === modal) closeModal(); };

      // DOM references
      const prizeInput = modal.querySelector('#gw-prize-input');
      const prizeCounter = modal.querySelector('#gw-prize-counter');
      const descInput = modal.querySelector('#gw-description-input');
      const winnersInput = modal.querySelector('#gw-winners-input');
      const winnersDisplay = modal.querySelector('#gw-winners-display');
      const winnersMinus = modal.querySelector('#gw-winners-minus');
      const winnersPlus = modal.querySelector('#gw-winners-plus');
      const durationValInput = modal.querySelector('#gw-duration-value');
      const durationUnitSelect = modal.querySelector('#gw-duration-unit');
      const submitBtn = modal.querySelector('#gw-submit-btn');
      const saveDraftBtn = modal.querySelector('#gw-save-draft-btn');

      // Preview references
      const previewTopAccent = modal.querySelector('#gw-preview-top-accent');
      const previewChannel = modal.querySelector('#gw-preview-channel');
      const previewEmbed = modal.querySelector('#gw-preview-embed');
      const previewPrize = modal.querySelector('#gw-preview-prize');
      const previewDesc = modal.querySelector('#gw-preview-desc');
      const previewDuration = modal.querySelector('#gw-preview-duration');
      const previewWinners = modal.querySelector('#gw-preview-winners');
      const previewRoleRow = modal.querySelector('#gw-preview-role-row');
      const previewRole = modal.querySelector('#gw-preview-role');

      function updateUI() {
        const pTrim = state.prize.trim();
        const dTrim = state.description.trim();

        // Counter
        prizeCounter.textContent = `${state.prize.length}/100`;

        // Preview updates
        previewPrize.textContent = pTrim || 'Giveaway Preis';
        if (dTrim) {
          previewDesc.textContent = dTrim;
          previewDesc.classList.remove('hidden');
        } else {
          previewDesc.classList.add('hidden');
        }

        const durNum = state.duration_value;
        const durUnitName = unitLabels[state.duration_unit] || 'Tage';
        previewDuration.textContent = `in ${durNum} ${durUnitName}`;
        previewWinners.textContent = String(state.winners_count);

        if (state.required_role_id) {
          const rName = getRoleName(state.required_role_id);
          previewRole.textContent = `@${rName}`;
          previewRoleRow.classList.remove('hidden');
        } else {
          previewRoleRow.classList.add('hidden');
        }

        previewEmbed.style.borderColor = state.color;
        previewTopAccent.style.backgroundColor = state.color;

        // Validation
        const isValid = pTrim.length > 0 && Boolean(state.channel_id) && state.winners_count >= 1 && state.duration_value >= 1;
        submitBtn.disabled = !isValid;
        saveDraftBtn.disabled = pTrim.length === 0;

        winnersDisplay.textContent = `${state.winners_count} ${state.winners_count === 1 ? 'Gewinner' : 'Gewinner'}`;
      }

      // Input events
      prizeInput.oninput = () => {
        state.prize = prizeInput.value;
        updateUI();
      };

      descInput.oninput = () => {
        state.description = descInput.value;
        updateUI();
      };

      winnersMinus.onclick = () => {
        if (state.winners_count > 1) {
          state.winners_count--;
          winnersInput.value = state.winners_count;
          updateUI();
        }
      };

      winnersPlus.onclick = () => {
        if (state.winners_count < 25) {
          state.winners_count++;
          winnersInput.value = state.winners_count;
          updateUI();
        }
      };

      winnersInput.onchange = () => {
        let v = parseInt(winnersInput.value, 10);
        if (isNaN(v) || v < 1) v = 1;
        if (v > 25) v = 25;
        state.winners_count = v;
        winnersInput.value = v;
        updateUI();
      };

      durationValInput.onchange = () => {
        let v = parseInt(durationValInput.value, 10);
        if (isNaN(v) || v < 1) v = 1;
        state.duration_value = v;
        durationValInput.value = v;
        updateUI();
      };

      durationUnitSelect.onchange = () => {
        state.duration_unit = durationUnitSelect.value;
        updateUI();
      };

      // Presets
      modal.querySelectorAll('[data-gw-preset]').forEach(btn => {
        btn.onclick = () => {
          const type = btn.getAttribute('data-gw-preset');
          if (type === 'nitro') {
            state.prize = '1x Discord Nitro (1 Monat)';
            state.duration_value = 1;
            state.duration_unit = 'days';
            state.color = '#5865F2';
          } else if (type === 'vip') {
            state.prize = 'VIP Rang (1 Monat)';
            state.duration_value = 3;
            state.duration_unit = 'days';
            state.color = '#F59E0B';
          } else if (type === 'steam') {
            state.prize = '10€ Steam Guthaben';
            state.duration_value = 2;
            state.duration_unit = 'days';
            state.color = '#06B6D4';
          } else if (type === 'custom') {
            state.prize = '';
            state.color = '#10B981';
          }
          prizeInput.value = state.prize;
          durationValInput.value = state.duration_value;
          durationUnitSelect.value = state.duration_unit;
          modal.querySelector('#gw-color-input').value = state.color;
          modal.querySelector('#gw-color-picker').value = state.color;
          renderColorTiles();
          updateUI();
        };
      });

      // Channel dropdown
      const chBtn = modal.querySelector('#gw-channel-dd-btn');
      const chMenu = modal.querySelector('#gw-channel-dd-menu');
      const chSearch = modal.querySelector('#gw-channel-search-input');
      const chList = modal.querySelector('#gw-channel-dd-list');
      const chLabel = modal.querySelector('#gw-channel-dd-label');

      chBtn.onclick = (e) => {
        e.stopPropagation();
        roleMenu.classList.add('hidden');
        chMenu.classList.toggle('hidden');
        if (!chMenu.classList.contains('hidden')) chSearch.focus();
      };

      chSearch.oninput = () => {
        const q = chSearch.value.toLowerCase().trim();
        chList.querySelectorAll('button').forEach(b => {
          const name = b.getAttribute('data-ch-name').toLowerCase();
          b.style.display = name.includes(q) ? '' : 'none';
        });
      };

      chList.querySelectorAll('button').forEach(b => {
        b.onclick = () => {
          const cid = b.getAttribute('data-ch-id');
          const cname = b.getAttribute('data-ch-name');
          state.channel_id = cid;
          chLabel.innerHTML = `<span class="text-neutral-500">#</span><span>${escapeHtml(cname)}</span>`;
          previewChannel.textContent = cname;
          chMenu.classList.add('hidden');
          updateUI();
        };
      });

      // Role dropdown
      const roleBtn = modal.querySelector('#gw-role-dd-btn');
      const roleMenu = modal.querySelector('#gw-role-dd-menu');
      const roleSearch = modal.querySelector('#gw-role-search-input');
      const roleList = modal.querySelector('#gw-role-dd-list');
      const roleLabel = modal.querySelector('#gw-role-dd-label');

      roleBtn.onclick = (e) => {
        e.stopPropagation();
        chMenu.classList.add('hidden');
        roleMenu.classList.toggle('hidden');
        if (!roleMenu.classList.contains('hidden')) roleSearch.focus();
      };

      roleSearch.oninput = () => {
        const q = roleSearch.value.toLowerCase().trim();
        roleList.querySelectorAll('button').forEach(b => {
          const name = (b.getAttribute('data-role-name') || '').toLowerCase();
          b.style.display = name.includes(q) ? '' : 'none';
        });
      };

      roleList.querySelectorAll('button').forEach(b => {
        b.onclick = () => {
          const rid = b.getAttribute('data-role-id');
          const rname = b.getAttribute('data-role-name');
          state.required_role_id = rid;
          if (rid) {
            roleLabel.textContent = `@${rname}`;
            roleLabel.className = 'truncate text-white font-medium';
          } else {
            roleLabel.textContent = 'Keine Rolle erforderlich';
            roleLabel.className = 'truncate text-neutral-400';
          }
          roleMenu.classList.add('hidden');
          updateUI();
        };
      });

      // Close dropdowns on outside click
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
        if (!e.target.closest('#gw-channel-dd-wrap')) chMenu.classList.add('hidden');
        if (!e.target.closest('#gw-role-dd-wrap')) roleMenu.classList.add('hidden');
      };

      // Colors
      const colorTilesContainer = modal.querySelector('#gw-color-tiles');
      const colorInput = modal.querySelector('#gw-color-input');
      const colorPicker = modal.querySelector('#gw-color-picker');

      function renderColorTiles() {
        colorTilesContainer.querySelectorAll('.gw-color-tile').forEach(tile => {
          const c = tile.getAttribute('data-color');
          const isSelected = state.color.toLowerCase() === c.toLowerCase();
          if (isSelected) {
            tile.className = 'gw-color-tile h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ring-2 ring-white scale-105 shadow-lg';
            tile.innerHTML = `<svg class="w-4 h-4 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"></path></svg>`;
          } else {
            tile.className = 'gw-color-tile h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:scale-102 opacity-80 hover:opacity-100';
            tile.innerHTML = '';
          }
        });
      }

      colorTilesContainer.querySelectorAll('.gw-color-tile').forEach(tile => {
        tile.onclick = () => {
          state.color = tile.getAttribute('data-color');
          colorInput.value = state.color;
          colorPicker.value = state.color;
          renderColorTiles();
          updateUI();
        };
      });

      colorInput.oninput = () => {
        let val = colorInput.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          state.color = val;
          colorPicker.value = val;
          renderColorTiles();
          updateUI();
        }
      };

      colorPicker.oninput = () => {
        state.color = colorPicker.value;
        colorInput.value = state.color;
        renderColorTiles();
        updateUI();
      };

      // Submission logic
      async function submitGiveaway(isDraft = false) {
        const pTrim = state.prize.trim();
        if (!pTrim) {
          showNotify('Bitte gib einen Preis für das Giveaway an.', 'error');
          return;
        }
        if (!isDraft && !state.channel_id) {
          showNotify('Bitte wähle einen Zielkanal für das Giveaway aus.', 'error');
          return;
        }

        const totalSecs = (Number(state.duration_value) || 1) * (unitSeconds[state.duration_unit] || 86400);

        const payload = {
          prize: pTrim,
          description: state.description.trim(),
          channel_id: state.channel_id,
          winners_count: state.winners_count,
          duration_seconds: totalSecs,
          required_role_id: state.required_role_id || null,
          color: state.color,
          is_draft: isDraft
        };

        const targetBtn = isDraft ? saveDraftBtn : submitBtn;
        const originalText = targetBtn.textContent;
        targetBtn.disabled = true;
        targetBtn.textContent = 'Wird gespeichert...';

        try {
          const res = await API.saveGiveaway(guildId, payload);
          if (res?.error) {
            showNotify(res.error, 'error');
            targetBtn.disabled = false;
            targetBtn.textContent = originalText;
            return;
          }

          showNotify(isDraft ? 'Entwurf gespeichert!' : 'Giveaway erfolgreich in Discord gepostet!', 'success');
          closeModal();

          const ref = await API.getGiveaways(guildId, true);
          giveaways = ref.giveaways || [];
          renderMainView();
        } catch (err) {
          showNotify(err?.message || 'Fehler beim Erstellen des Giveaways.', 'error');
          targetBtn.disabled = false;
          targetBtn.textContent = originalText;
        }
      }

      submitBtn.onclick = () => submitGiveaway(false);
      saveDraftBtn.onclick = () => submitGiveaway(true);

      updateUI();
    }

    // Initial render
    renderMainView();

  } catch (err) {
    console.error('[Giveaways] Render Error:', err);
    container.innerHTML = `
      <div class="p-8 text-center text-neutral-400">
        <p class="text-sm text-red-400 mb-2">Fehler beim Laden der Giveaways.</p>
        <p class="text-xs text-neutral-500">${escapeHtml(err.message || String(err))}</p>
        <button type="button" onclick="DashboardTabs.Giveaways(document.getElementById('dashboard-content'), '${guildId}')" class="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl transition-colors">
          Erneut versuchen
        </button>
      </div>
    `;
  }
};
