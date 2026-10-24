/**
 * Orbit Dashboard - Polls Tab (Umfragen)
 * 1:1 PeakBot UI & Full End-to-End Functionality:
 * - Feature Header (`lucide-bar-chart3` + `Umfragen`)
 * - Segmented Filter Bar (`Alle`, `Aktiv`, `Beendet`, `Entwürfe`) + Active Counter (`0/999 aktiv`) + `+ Umfrage erstellen` button
 * - Polls Grid with Active/Ended/Draft Poll Cards (3-dots action menu, live option vote bars, total votes, relative creation time) + dashed `+ Umfrage erstellen` card
 * - 3-Column `Create a Poll` Modal (`Quick Start` presets, `Question` 0/256, `Options` 1..10, live `Discord Preview`, `Channel` custom dropdown, `Duration` + `No time limit`, `Allow multiple votes`, collapsible `Advanced` settings, `Save as Draft` & `Create Poll`)
 * - Interactive Poll Details Modal when clicking an active or ended poll card
 */

DashboardTabs.Polls = async function(container, guildId) {
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-center p-16 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400 w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Lade Umfragen...
      </div>
    </div>
  `;

  try {
    const [pollsRes, rawChannels, rawRoles, cfgRes] = await Promise.all([
      API.getPolls(guildId).catch(() => ({ polls: [] })),
      API.getChannels(guildId).catch(() => ([])),
      API.getRoles(guildId).catch(() => ([])),
      API.getConfig(guildId).catch(() => ({}))
    ]);

    let polls = Array.isArray(pollsRes?.polls) ? pollsRes.polls : [];
    const allChs = (Array.isArray(rawChannels) && rawChannels.length > 0)
      ? rawChannels
      : (Array.isArray(cfgRes?.channels) ? cfgRes.channels : []);
    let textChannels = allChs.filter(c => !c.type || c.type === 'text' || c.type === 'news' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text')));
    const allRls = (Array.isArray(rawRoles) && rawRoles.length > 0)
      ? rawRoles
      : (Array.isArray(cfgRes?.roles) ? cfgRes.roles : []);
    let roles = allRls.filter(r => r.name !== '@everyone');

    let currentFilter = 'all'; // 'all' | 'active' | 'ended' | 'draft'
    let openMenuPollId = null;

    function getChannelName(channelId) {
      if (!channelId) return 'general';
      const found = textChannels.find(c => String(c.id) === String(channelId));
      return found ? found.name : 'general';
    }

    function renderMainView() {
      const activeCount = polls.filter(p => p.status === 'active').length;
      const activeProgressPct = Math.min(100, (activeCount / 999) * 100);

      const filteredPolls = polls.filter(p => {
        if (currentFilter === 'active') return p.status === 'active';
        if (currentFilter === 'ended') return p.status === 'ended';
        if (currentFilter === 'draft') return p.status === 'draft';
        return true;
      });

      const filterTabs = [
        { id: 'all', label: 'Alle' },
        { id: 'active', label: 'Aktiv' },
        { id: 'ended', label: 'Beendet' },
        { id: 'draft', label: 'Entwürfe' }
      ];

      container.innerHTML = `
        <div>
          <!-- Feature Header -->
          <div data-tour="feature-header" class="scroll-mt-24">
            <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart3 w-5 h-5"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
                </span>
                <h1 class="text-base font-medium text-white truncate">Umfragen</h1>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <!-- Filter Bar & Top Create Button -->
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-6">
              <div class="flex flex-wrap items-center gap-3">
                <div class="flex gap-1 p-1 h-10 rounded-xl bg-neutral-800/50 border border-neutral-800">
                  ${filterTabs.map(t => {
                    const isActive = currentFilter === t.id;
                    return `
                      <button type="button" data-poll-filter="${t.id}" class="relative px-3.5 rounded-lg text-sm font-medium transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${isActive ? 'text-black font-semibold' : 'text-neutral-500 hover:text-neutral-300'}">
                        ${isActive ? '<span class="absolute inset-0 bg-white rounded-lg" style="transform: none; transform-origin: 50% 50% 0px; opacity: 1;"></span>' : ''}
                        <span class="relative z-10">${t.label}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs tabular-nums text-neutral-500">${activeCount}/999 aktiv</span>
                  <div class="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden">
                    <div class="h-full rounded-full transition-all bg-white/60" style="width: ${activeProgressPct}%;"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2.5 w-full sm:w-auto">
                <button type="button" id="polls-top-create-btn" class="flex-1 sm:flex-none justify-center flex items-center gap-2 h-10 px-5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-4 h-4"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>Umfrage erstellen
                </button>
              </div>
            </div>

            <!-- Polls Grid -->
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              ${filteredPolls.map(poll => renderPollCard(poll)).join('')}

              <button type="button" id="polls-grid-create-btn" class="rounded-xl border-2 border-dashed border-neutral-700 p-5 hover:border-neutral-500 hover:bg-neutral-800/30 transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[200px]">
                <div class="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-6 h-6 text-neutral-400"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                </div>
                <span class="text-sm font-medium text-neutral-300">Umfrage erstellen</span>
              </button>
            </div>
          </div>
        </div>
      `;

      bindMainEvents();
    }

    function renderPollCard(poll) {
      const options = Array.isArray(poll.options) ? poll.options : [];
      const optVotes = Array.isArray(poll.option_votes) ? poll.option_votes : [];
      const totalVotes = Number(poll.total_votes || 0);
      const maxVote = optVotes.length > 0 ? Math.max(...optVotes) : 0;
      const accentColor = poll.color || '#5865F2';
      const accentBg = accentColor.startsWith('#')
        ? accentColor + '1A'
        : (accentColor.includes('rgb') ? accentColor.replace('rgb(', 'rgba(').replace(')', ', 0.1)') : 'rgba(88, 101, 242, 0.1)');

      let badgeClass = 'bg-emerald-500/10 text-emerald-400';
      let badgeText = 'aktiv';
      if (poll.status === 'ended') {
        badgeClass = 'bg-neutral-700/40 text-neutral-400';
        badgeText = 'beendet';
      } else if (poll.status === 'draft') {
        badgeClass = 'bg-amber-500/10 text-amber-400';
        badgeText = 'entwurf';
      }

      const visibleOptions = options.slice(0, 4);
      const extraOptionsCount = Math.max(0, options.length - visibleOptions.length);

      return `
        <div class="group bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all cursor-pointer relative" data-poll-card="${escapeHtml(poll.id)}">
          <div class="h-[3px] bg-[#5865F2]" style="background-color: ${escapeHtml(accentColor)};"></div>
          <div class="p-4">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex items-start gap-3 min-w-0 flex-1">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#5865F2]/10" style="background-color: ${accentBg};">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart3 w-4 h-4 text-[#5865F2]" style="color: ${escapeHtml(accentColor)};"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
                </div>
                <h3 class="text-sm font-semibold text-white line-clamp-2 pt-1">${escapeHtml(poll.question || 'rgdgrd')}</h3>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${badgeClass}">${badgeText}</span>
                <div class="relative" data-poll-menu-wrap="${escapeHtml(poll.id)}">
                  <button type="button" aria-label="Umfrageaktionen" aria-haspopup="menu" aria-expanded="${openMenuPollId === poll.id ? 'true' : 'false'}" data-poll-menu-btn="${escapeHtml(poll.id)}" class="p-2 -m-1 rounded-lg text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal w-4 h-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  </button>
                  <div data-poll-menu="${escapeHtml(poll.id)}" class="orbit-dropdown-menu absolute right-0 top-full mt-1 w-40 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-20 overflow-hidden py-1 ${openMenuPollId === poll.id ? '' : 'hidden'}" style="opacity: 1; transform: none;">
                    <button type="button" data-poll-action="results" data-poll-id="${escapeHtml(poll.id)}" class="flex items-center gap-2 w-full px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-700 transition-colors cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart3 w-3.5 h-3.5"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
                      Ergebnisse anzeigen
                    </button>
                    ${poll.status === 'active' ? `
                      <button type="button" data-poll-action="end" data-poll-id="${escapeHtml(poll.id)}" class="flex items-center gap-2 w-full px-3 py-2 text-xs text-amber-400 hover:bg-neutral-700 transition-colors cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-stop-circle w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><rect width="6" height="6" x="9" y="9"></rect></svg>
                        Frühes Ende
                      </button>
                    ` : ''}
                    <button type="button" data-poll-action="duplicate" data-poll-id="${escapeHtml(poll.id)}" class="flex items-center gap-2 w-full px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-700 transition-colors cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy w-3.5 h-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                      Duplikat
                    </button>
                    <button type="button" data-poll-action="delete" data-poll-id="${escapeHtml(poll.id)}" class="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-neutral-700 transition-colors cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 w-3.5 h-3.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-1.5 mb-3">
              ${visibleOptions.map((opt, idx) => {
                const vCount = Number(optVotes[idx] || 0);
                const pct = totalVotes > 0 ? Math.round((vCount / totalVotes) * 100) : 0;
                const isWinner = totalVotes > 0 && vCount === maxVote && maxVote > 0;
                return `
                  <div class="flex items-center gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="h-6 rounded-md bg-neutral-800/60 overflow-hidden relative">
                        <div class="absolute inset-y-0 left-0 rounded-md transition-all duration-500 ${isWinner ? 'bg-[#5865F2]/30' : 'bg-neutral-700/40'}" style="width: ${pct}%;"></div>
                        <div class="relative flex items-center justify-between h-full px-2">
                          <span class="text-[11px] font-medium text-neutral-300 truncate">${escapeHtml(opt)}</span>
                          <span class="text-[10px] text-neutral-500 tabular-nums flex-shrink-0 ml-2">${pct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
              ${extraOptionsCount > 0 ? `<p class="text-[10px] text-neutral-500 pl-1">+${extraOptionsCount} weitere Option${extraOptionsCount > 1 ? 'en' : ''}</p>` : ''}
            </div>

            <div class="flex items-center gap-3 text-[11px] text-neutral-500">
              <div class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-3 h-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>${totalVotes} Abstimmung${totalVotes === 1 ? '' : 'en'}</span>
              </div>
              <span class="text-neutral-700">·</span>
              <span>Erstellt ${formatRelativeTime(poll.created_at)}</span>
            </div>
          </div>
        </div>
      `;
    }

    function bindMainEvents() {
      // Filter buttons
      container.querySelectorAll('[data-poll-filter]').forEach(btn => {
        btn.onclick = () => {
          currentFilter = btn.getAttribute('data-poll-filter') || 'all';
          openMenuPollId = null;
          renderMainView();
        };
      });

      // Create Poll buttons
      const topCreateBtn = document.getElementById('polls-top-create-btn');
      const gridCreateBtn = document.getElementById('polls-grid-create-btn');
      if (topCreateBtn) topCreateBtn.onclick = () => openCreatePollModal(null);
      if (gridCreateBtn) gridCreateBtn.onclick = () => openCreatePollModal(null);

      // 3-dots menu buttons
      container.querySelectorAll('[data-poll-menu-btn]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const pid = btn.getAttribute('data-poll-menu-btn');
          const menuEl = container.querySelector(`[data-poll-menu="${pid}"]`);
          const wasOpen = openMenuPollId === pid && menuEl && !menuEl.classList.contains('hidden');

          container.querySelectorAll('[data-poll-menu]').forEach(m => m.classList.add('hidden'));
          if (wasOpen) {
            openMenuPollId = null;
          } else {
            openMenuPollId = pid;
            if (menuEl) menuEl.classList.remove('hidden');
          }
        };
      });

      // Menu action items
      container.querySelectorAll('[data-poll-action]').forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          const action = btn.getAttribute('data-poll-action');
          const pid = btn.getAttribute('data-poll-id');
          openMenuPollId = null;
          container.querySelectorAll('[data-poll-menu]').forEach(m => m.classList.add('hidden'));

          const poll = polls.find(p => String(p.id) === String(pid));
          if (!poll) return;

          if (action === 'results' || action === 'edit') {
            openPollDetailsModal(poll);
          } else if (action === 'duplicate') {
            openCreatePollModal({
              ...poll,
              id: '',
              poll_id: '',
              status: 'draft',
              draft: false,
              closed: false
            });
          } else if (action === 'end') {
            try {
              const res = await API.endPoll(guildId, poll.id);
              if (res?.poll) {
                polls = polls.map(p => String(p.id) === String(poll.id) ? res.poll : p);
              } else {
                poll.status = 'ended';
                poll.closed = true;
              }
              if (window.Toast && typeof Toast.success === 'function') Toast.success('Umfrage wurde beendet.');
              else if (window.Notifications) Notifications.show('Umfrage wurde beendet.', 'success');
              renderMainView();
            } catch (err) {
              if (window.Toast && typeof Toast.error === 'function') Toast.error(err.message || 'Fehler beim Beenden der Umfrage.');
              else if (window.Notifications) Notifications.show(err.message || 'Fehler beim Beenden der Umfrage.', 'error');
            }
          } else if (action === 'delete') {
            if (!confirm(`Möchten Sie die Umfrage "${poll.question || 'Umfrage'}" wirklich löschen?`)) return;
            try {
              await API.deletePoll(guildId, poll.id);
              polls = polls.filter(p => String(p.id) !== String(poll.id));
              if (window.Toast && typeof Toast.success === 'function') Toast.success('Umfrage gelöscht.');
              else if (window.Notifications) Notifications.show('Umfrage gelöscht.', 'info');
              renderMainView();
            } catch (err) {
              if (window.Toast && typeof Toast.error === 'function') Toast.error(err.message || 'Fehler beim Löschen der Umfrage.');
              else if (window.Notifications) Notifications.show(err.message || 'Fehler beim Löschen der Umfrage.', 'error');
            }
          }
        };
      });

      // Card click -> open Edit modal for drafts, or Poll Details modal for active/ended
      container.querySelectorAll('[data-poll-card]').forEach(card => {
        card.onclick = (e) => {
          if (e.target.closest('[data-poll-menu-wrap]') || e.target.closest('[data-poll-menu]') || e.target.closest('[data-poll-action]')) return;
          const pid = card.getAttribute('data-poll-card');
          const poll = polls.find(p => String(p.id) === String(pid));
          if (!poll) return;
          if (poll.status === 'draft') {
            openCreatePollModal(poll);
          } else {
            openPollDetailsModal(poll);
          }
        };
      });
    }

    // Close 3-dots menu on outside click
    const docClickHandler = (e) => {
      if (!e.target.closest('[data-poll-menu-wrap]')) {
        openMenuPollId = null;
        container.querySelectorAll('[data-poll-menu]').forEach(m => m.classList.add('hidden'));
      }
    };
    document.addEventListener('click', docClickHandler);

    // =========================================================================
    // POLL DETAILS MODAL (WHEN CLICKING AN ACTIVE OR ENDED POLL CARD)
    // =========================================================================
    function openPollDetailsModal(poll) {
      const existing = document.getElementById('orbit-poll-details-modal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'orbit-poll-details-modal';
      modal.className = 'fixed inset-0 lg:left-64 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in';

      const options = Array.isArray(poll.options) ? poll.options : [];
      const optVotes = Array.isArray(poll.option_votes) ? poll.option_votes : [];
      const totalVotes = Number(poll.total_votes || 0);
      const maxVote = optVotes.length > 0 ? Math.max(...optVotes) : 0;
      const chName = poll.channel_name || getChannelName(poll.channel_id);

      let badgeClass = 'bg-emerald-500/10 text-emerald-400';
      let badgeText = 'aktiv';
      if (poll.status === 'ended') {
        badgeClass = 'bg-neutral-700/40 text-neutral-400';
        badgeText = 'beendet';
      }

      modal.innerHTML = `
        <div role="dialog" aria-modal="true" class="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
          <div class="h-[3px]" style="background-color: ${escapeHtml(poll.color || '#5865F2')};"></div>
          <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#5865F2]/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart3 w-4 h-4 text-[#5865F2]"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${badgeClass}">${badgeText}</span>
                  <span class="text-xs text-neutral-500 truncate">#${escapeHtml(chName)}</span>
                </div>
                <p class="text-[11px] text-neutral-500 mt-0.5">Erstellt ${formatRelativeTime(poll.created_at)} · ID: ${escapeHtml(poll.id)}</p>
              </div>
            </div>
            <button type="button" id="poll-details-close" class="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>

          <div class="p-5 space-y-4 max-h-[70vh] overflow-y-auto" data-lenis-prevent>
            <h3 class="text-base font-semibold text-white">${escapeHtml(poll.question)}</h3>

            <div class="space-y-2">
              ${options.map((opt, idx) => {
                const vCount = Number(optVotes[idx] || 0);
                const pct = totalVotes > 0 ? Math.round((vCount / totalVotes) * 100) : 0;
                const isWinner = totalVotes > 0 && vCount === maxVote && maxVote > 0;
                return `
                  <div class="relative rounded-lg overflow-hidden bg-neutral-800/70 h-10 flex items-center border ${isWinner ? 'border-[#5865F2]/40' : 'border-neutral-800'}">
                    <div class="absolute inset-y-0 left-0 transition-all duration-500 ${isWinner ? 'bg-[#5865F2]/30' : 'bg-neutral-700/40'}" style="width: ${pct}%;"></div>
                    <div class="relative flex items-center justify-between w-full px-3.5">
                      <span class="text-xs font-medium text-white truncate">${escapeHtml(opt)}</span>
                      <span class="text-xs tabular-nums font-semibold ${isWinner ? 'text-white' : 'text-neutral-400'} ml-3 flex-shrink-0">${pct}% (${vCount})</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800 text-xs text-neutral-400">
              <span>Gesamte Stimmen: <strong class="text-white">${totalVotes}</strong></span>
              <span>${poll.no_time_limit ? 'Kein Zeitlimit' : (poll.status === 'ended' ? 'Abstimmung beendet' : `Dauer: ${poll.duration_value || 1} ${poll.duration_unit || 'Tage'}`)}</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 px-5 py-3.5 border-t border-neutral-800 bg-neutral-900/60">
            <button type="button" id="poll-details-delete" class="px-3.5 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">Löschen</button>
            <div class="flex items-center gap-2">
              <button type="button" id="poll-details-edit" class="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer">
                Duplizieren
              </button>
              ${poll.status === 'active' ? `
                <button type="button" id="poll-details-end" class="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-xs font-semibold text-black transition-colors cursor-pointer">
                  Frühes Ende
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelector('#poll-details-close').onclick = () => modal.remove();
      modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

      modal.querySelector('#poll-details-edit').onclick = () => {
        modal.remove();
        if (poll.status === 'ended') {
          openCreatePollModal({ ...poll, id: '', poll_id: '', status: 'draft', draft: false, closed: false });
        } else {
          openCreatePollModal(poll);
        }
      };

      const endBtn = modal.querySelector('#poll-details-end');
      if (endBtn) {
        endBtn.onclick = async () => {
          endBtn.disabled = true;
          endBtn.textContent = 'Ending...';
          try {
            const res = await API.endPoll(guildId, poll.id);
            if (res?.poll) {
              polls = polls.map(p => String(p.id) === String(poll.id) ? res.poll : p);
            }
            Toast.success('Umfrage wurde beendet.');
            modal.remove();
            renderMainView();
          } catch (err) {
            Toast.error(err.message || 'Fehler beim Beenden der Umfrage.');
            endBtn.disabled = false;
            endBtn.textContent = 'End Poll';
          }
        };
      }

      modal.querySelector('#poll-details-delete').onclick = async () => {
        try {
          await API.deletePoll(guildId, poll.id);
          polls = polls.filter(p => String(p.id) !== String(poll.id));
          Toast.success('Umfrage gelöscht.');
          modal.remove();
          renderMainView();
        } catch (err) {
          Toast.error(err.message || 'Fehler beim Löschen der Umfrage.');
        }
      };
    }

    // =========================================================================
    // 3-COLUMN "CREATE A POLL" MODAL (1:1 PEAKBOT DESIGN)
    // =========================================================================
    function openCreatePollModal(existingPoll) {
      const prev = document.getElementById('orbit-create-poll-modal');
      if (prev) prev.remove();

      const isEditing = Boolean(existingPoll && existingPoll.id);

      const state = {
        id: existingPoll?.id || '',
        quickStart: '',
        question: existingPoll?.question || '',
        options: Array.isArray(existingPoll?.options) && existingPoll.options.length >= 2
          ? [...existingPoll.options]
          : ['', ''],
        channel_id: existingPoll?.channel_id || '',
        duration_value: Number(existingPoll?.duration_value || 1),
        duration_unit: existingPoll?.duration_unit || 'days', // 'minutes' | 'hours' | 'days' | 'weeks'
        no_time_limit: Boolean(existingPoll?.no_time_limit),
        allow_multiple_votes: Boolean(existingPoll?.allow_multiple_votes),
        anonymous: Boolean(existingPoll?.anonymous),
        required_role_id: existingPoll?.required_role_id || '',
        color: existingPoll?.color || '#5865F2',
        advancedOpen: false
      };

      const unitLabels = {
        minutes: 'Minuten',
        hours: 'Stunden',
        days: 'Tage',
        weeks: 'Wochen'
      };

      const previewDurLabels = {
        minutes: state.duration_value === 1 ? '1 minute left' : `${state.duration_value} minutes left`,
        hours: state.duration_value === 1 ? '1 hour left' : `${state.duration_value} hours left`,
        days: state.duration_value === 1 ? '1 day left' : `${state.duration_value} days left`,
        weeks: state.duration_value === 1 ? '1 week left' : `${state.duration_value} weeks left`
      };

      const modal = document.createElement('div');
      modal.id = 'orbit-create-poll-modal';
      modal.className = 'fixed inset-0 lg:left-64 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in';

      modal.innerHTML = `
        <div role="dialog" aria-modal="true" aria-label="Create a poll" class="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-[1300px] max-h-[90vh] flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 flex-shrink-0">
            <div>
              <h2 class="text-base sm:text-lg font-semibold text-white text-balance">${isEditing ? 'Edit Poll' : 'Create a Poll'}</h2>
              <p class="text-xs text-neutral-500 mt-0.5 hidden sm:block">Set up your question, options, and rules</p>
            </div>
            <button type="button" id="poll-modal-close" aria-label="Close" class="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>

          <!-- 3-Column Body -->
          <div class="flex-1 overflow-y-auto min-h-0" data-lenis-prevent>
            <div class="grid grid-cols-1 lg:grid-cols-[340px,1fr,280px] lg:min-h-[460px]">
              <!-- Left Column: Quick Start, Question, Options -->
              <div class="p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div>
                  <label class="text-xs font-medium text-neutral-400 mb-2 block">Quick Start</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button type="button" data-quick-start="yesno" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border bg-neutral-800/50 border-neutral-700/50 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-thumbs-up w-3.5 h-3.5 flex-shrink-0"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path></svg>Yes / No
                    </button>
                    <button type="button" data-quick-start="rating" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border bg-neutral-800/50 border-neutral-700/50 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star w-3.5 h-3.5 flex-shrink-0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>Rating
                    </button>
                    <button type="button" data-quick-start="thisorthat" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border bg-neutral-800/50 border-neutral-700/50 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-right w-3.5 h-3.5 flex-shrink-0"><path d="M8 3 4 7l4 4"></path><path d="M4 7h16"></path><path d="m16 21 4-4-4-4"></path><path d="M20 17H4"></path></svg>This or That
                    </button>
                    <button type="button" data-quick-start="custom" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border bg-neutral-800/50 border-neutral-700/50 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil w-3.5 h-3.5 flex-shrink-0"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>Custom
                    </button>
                  </div>
                </div>

                <div>
                  <label class="text-xs font-medium text-neutral-400 mb-2 block">Question</label>
                  <input id="poll-question-input" placeholder="What should we play tonight?" maxlength="256" class="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:bg-neutral-800 transition-[background-color,border-color] duration-150 ease-out" type="text" value="${escapeHtml(state.question)}">
                  <div class="flex justify-end mt-1">
                    <span id="poll-question-counter" class="text-[10px] tabular-nums text-neutral-600">${state.question.length}/256</span>
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-xs font-medium text-neutral-400">Options</label>
                    <span id="poll-options-counter" class="text-[10px] text-neutral-600 tabular-nums">0 of 2</span>
                  </div>
                  <div id="poll-options-list" class="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin" data-lenis-prevent></div>
                  <button type="button" id="poll-add-option-btn" class="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-300 border border-dashed border-neutral-700/50 hover:border-neutral-600 w-full justify-center transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3.5 h-3.5"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg> Add Option
                  </button>
                </div>
              </div>

              <!-- Center Column: Live Discord Preview -->
              <div class="hidden lg:block lg:border-x border-neutral-800 p-6 bg-[#313338]/30 min-w-0">
                <label class="text-xs font-medium text-neutral-400 mb-3 block">Discord Preview</label>
                <div class="rounded-xl overflow-hidden border border-neutral-700/30">
                  <div class="bg-[#2f3136] px-4 py-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-3.5 h-3.5 text-neutral-400"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                    <span id="poll-preview-channel" class="text-xs font-semibold text-white">general</span>
                  </div>
                  <div class="bg-[#313338] px-4 pt-3 pb-4 space-y-2.5">
                    <div class="flex gap-2.5 transition-opacity">
                      <img src="/img/logo.png" alt="Orbit" class="w-8 h-8 rounded-full flex-shrink-0 object-cover mt-0.5" onerror="this.style.display='none';this.nextElementSibling.classList.remove('hidden');this.nextElementSibling.classList.add('flex');">
                      <div class="w-8 h-8 rounded-full flex-shrink-0 bg-[#5865F2] items-center justify-center text-white text-xs font-bold hidden mt-0.5" aria-hidden="true">O</div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 mb-0.5 min-w-0">
                          <span class="text-xs font-semibold text-indigo-400 whitespace-nowrap">Orbit</span>
                          <span class="inline-flex flex-shrink-0 items-center gap-[0.15em] px-1 py-px text-[10px] font-bold bg-[#5865F2] text-white rounded leading-none">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="h-[0.85em] w-[0.85em]"><path d="M20 6 9 17l-5-5"></path></svg>APP
                          </span>
                          <span class="text-xs text-neutral-500 truncate">Today</span>
                        </div>
                        <div id="poll-preview-embed" class="border-l-[3px] rounded-r bg-[#2b2d31] max-w-full sm:max-w-[380px]" style="border-color: rgb(88, 101, 242);">
                          <div class="p-2.5 flex gap-2.5">
                            <div class="flex-1 min-w-0 space-y-1">
                              <p class="text-xs font-semibold text-white leading-snug">
                                <span class="block">
                                  <span class="flex items-center gap-1.5 mb-1 text-[10px] text-neutral-400 font-medium uppercase tracking-wide">
                                    <svg class="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h10a1 1 0 010 2H4a1 1 0 010-2zm0 6h14a1 1 0 010 2H4a1 1 0 010-2z"></path></svg>Poll
                                  </span>
                                  <span id="poll-preview-question" class="block break-words">Your question here...</span>
                                </span>
                              </p>
                              <div id="poll-preview-options" class="space-y-1.5 pt-0.5"></div>
                              <div id="poll-preview-footer" class="pt-1 mt-1 border-t border-neutral-700/30 text-[10px] text-neutral-500">0 votes · 1 day left</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Channel, Duration, Settings, Advanced -->
              <div class="p-4 sm:p-5 space-y-4 sm:space-y-5 border-t lg:border-t-0 border-neutral-800">
                <!-- Channel Dropdown -->
                <div>
                  <label class="text-xs font-medium text-neutral-400 mb-1.5 block">Channel</label>
                  <div class="w-full relative" id="poll-channel-dd-wrap">
                    <button type="button" id="poll-channel-dd-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                      <span id="poll-channel-dd-label" class="min-w-0 truncate text-sm text-neutral-500"># select channel</span>
                      <div class="flex items-center gap-1">
                        <span id="poll-channel-dd-clear" role="button" tabindex="0" aria-label="Clear selection" class="hidden p-2 -m-1 text-neutral-400 hover:text-white transition-colors cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
                      </div>
                    </button>
                    <div id="poll-channel-dd-menu" data-lenis-prevent style="z-index: 99999;" class="orbit-dropdown-menu hidden absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-hidden rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl py-1 z-[99999] flex flex-col">
                      <div class="orbit-searchbar-header sticky top-0 z-20 p-2 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/80 shrink-0">
                        <div class="relative w-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                          <input type="text" id="poll-channel-search-input" placeholder="Suchen..." class="orbit-searchbar-input w-full pl-9 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off" />
                        </div>
                      </div>
                      <div id="poll-channel-list" class="overflow-y-auto max-h-48 p-1 space-y-0.5" data-lenis-prevent="true">
                        ${textChannels.length > 0 ? textChannels.map(c => `
                          <button type="button" data-poll-ch-opt="${escapeHtml(c.id)}" data-ch-name="${escapeHtml((c.name || '').toLowerCase())}" class="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2 rounded-lg transition-colors">
                            <span class="text-neutral-500 font-mono">#</span>
                            <span class="truncate">${escapeHtml(c.name)}</span>
                          </button>
                        `).join('') : `<div class="px-3 py-3 text-xs text-neutral-500 text-center">Keine Textkanäle gefunden</div>`}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Duration -->
                <div>
                  <label class="text-xs font-medium text-neutral-400 mb-1.5 block">Duration</label>
                  <div id="poll-duration-inputs-wrap" class="flex gap-1.5">
                    <input id="poll-duration-val" min="1" max="999" class="w-[70px] px-3 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-white text-xs text-center focus:outline-none focus:border-neutral-600 transition-[background-color,border-color] duration-150 ease-out [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" type="number" value="${state.duration_value}">
                    <div class="flex-1">
                      <div class="w-full relative" id="poll-unit-dd-wrap">
                        <button type="button" id="poll-unit-dd-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                          <span class="min-w-0 truncate text-sm text-white">
                            <span class="flex items-center gap-2 min-w-0">
                              <span id="poll-unit-dd-label" class="truncate">${unitLabels[state.duration_unit] || 'Tage'}</span>
                            </span>
                          </span>
                          <div class="flex items-center gap-1">
                            <span id="poll-unit-dd-clear" role="button" tabindex="0" aria-label="Clear selection" class="p-2 -m-1 text-neutral-400 hover:text-white transition-colors cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
                          </div>
                        </button>
                        <div id="poll-unit-dd-menu" data-lenis-prevent class="orbit-dropdown-menu hidden absolute left-0 right-0 top-full mt-1.5 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-1 z-40">
                          ${Object.entries(unitLabels).map(([k, lbl]) => `
                            <button type="button" data-poll-unit-opt="${k}" class="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">${lbl}</button>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="button" id="poll-no-limit-btn" class="flex items-center gap-2.5 mt-1 py-2 -mb-2 group cursor-pointer transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-md">
                    <div id="poll-no-limit-box" class="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-[background-color,border-color] duration-150 ease-out border-neutral-600 group-hover:border-neutral-500"></div>
                    <span class="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">No time limit</span>
                  </button>
                </div>

                <div class="border-t border-neutral-800"></div>

                <!-- Settings -->
                <div class="space-y-3">
                  <label class="text-xs font-medium text-neutral-400 block">Settings</label>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-neutral-300">Allow multiple votes</span>
                    <div class="flex items-center gap-3">
                      <button type="button" id="poll-multi-vote-switch" role="switch" aria-checked="${state.allow_multiple_votes ? 'true' : 'false'}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${state.allow_multiple_votes ? 'bg-white' : 'bg-neutral-700'}">
                        <span id="poll-multi-vote-knob" class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${state.allow_multiple_votes ? 'translate-x-[21px] bg-neutral-900' : 'translate-x-[3px] bg-neutral-900'}"></span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Advanced -->
                <div>
                  <button type="button" id="poll-advanced-toggle" class="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                    <span>Advanced</span>
                    <svg id="poll-advanced-chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-3.5 h-3.5 transition-transform -rotate-90"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                  <div id="poll-advanced-panel" class="hidden mt-3 pt-3 border-t border-neutral-800 space-y-3.5">
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-neutral-300">Anonymous voting</span>
                      <button type="button" id="poll-anon-switch" role="switch" aria-checked="${state.anonymous ? 'true' : 'false'}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${state.anonymous ? 'bg-white' : 'bg-neutral-700'}">
                        <span id="poll-anon-knob" class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out ${state.anonymous ? 'translate-x-[21px]' : 'translate-x-[3px]'}"></span>
                      </button>
                    </div>

                    <div>
                      <label class="text-xs font-medium text-neutral-400 mb-1.5 block">Required Role</label>
                      <div class="w-full relative" id="poll-role-dd-wrap">
                        <button type="button" id="poll-role-dd-btn" class="w-full flex items-center justify-between gap-2 h-9 px-3 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-xs text-left cursor-pointer">
                          <span id="poll-role-dd-label" class="min-w-0 truncate text-neutral-400">@ Everyone</span>
                          <svg class="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"></path></svg>
                        </button>
                        <div id="poll-role-dd-menu" data-lenis-prevent style="z-index: 99999;" class="orbit-dropdown-menu hidden absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl py-1 z-[99999]">
                          <button type="button" data-poll-role-opt="" class="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800">@ Everyone (No restriction)</button>
                          ${roles.map(r => `
                            <button type="button" data-poll-role-opt="${escapeHtml(r.id)}" class="w-full px-3 py-1.5 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2">
                              <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${escapeHtml(r.color || '#99aab5')};"></span>
                              <span class="truncate">${escapeHtml(r.name)}</span>
                            </button>
                          `).join('')}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label class="text-xs font-medium text-neutral-400 mb-1.5 block">Accent Color</label>
                      <div class="flex flex-wrap items-center gap-1.5">
                        ${['#5865F2', '#22c55e', '#eab308', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#06b6d4'].map(c => `
                          <button type="button" data-poll-color="${c}" class="w-6 h-6 rounded-lg border-2 transition-transform active:scale-95 ${state.color.toLowerCase() === c.toLowerCase() ? 'border-white scale-105' : 'border-transparent'}" style="background-color: ${c};"></button>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex flex-col gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-800 flex-shrink-0">
            <div class="flex items-center justify-between gap-3">
              <button type="button" id="poll-save-draft-btn" disabled class="px-4 py-2.5 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg hover:bg-neutral-700 border border-neutral-700 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-40 disabled:pointer-events-none">Save as Draft</button>
              <button type="button" id="poll-create-submit-btn" disabled class="px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-40 disabled:pointer-events-none">${isEditing && existingPoll?.status === 'active' ? 'Update Poll' : 'Create Poll'}</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const questionInput = modal.querySelector('#poll-question-input');
      const questionCounter = modal.querySelector('#poll-question-counter');
      const optionsCounter = modal.querySelector('#poll-options-counter');
      const optionsList = modal.querySelector('#poll-options-list');
      const addOptionBtn = modal.querySelector('#poll-add-option-btn');
      const saveDraftBtn = modal.querySelector('#poll-save-draft-btn');
      const createSubmitBtn = modal.querySelector('#poll-create-submit-btn');

      function updateFooterButtonsAndPreview() {
        const qTrim = state.question.trim();
        const nonEmptyOpts = state.options.map(o => o.trim()).filter(Boolean);
        const hasAnyInput = qTrim.length > 0 || nonEmptyOpts.length > 0;
        const canCreate = qTrim.length > 0 && nonEmptyOpts.length >= 2 && Boolean(state.channel_id);

        saveDraftBtn.disabled = !hasAnyInput;
        createSubmitBtn.disabled = !canCreate;

        // Update options counter ("X of Y")
        optionsCounter.textContent = `${nonEmptyOpts.length} of ${state.options.length}`;

        // Update Add Option visibility
        if (state.options.length >= 10) {
          addOptionBtn.classList.add('hidden');
        } else {
          addOptionBtn.classList.remove('hidden');
        }

        // Update Channel Label & Preview Channel
        const chLabel = modal.querySelector('#poll-channel-dd-label');
        const chClear = modal.querySelector('#poll-channel-dd-clear');
        const previewCh = modal.querySelector('#poll-preview-channel');
        if (state.channel_id) {
          const cName = getChannelName(state.channel_id);
          chLabel.textContent = `# ${cName}`;
          chLabel.className = 'min-w-0 truncate text-sm text-white';
          chClear.classList.remove('hidden');
          previewCh.textContent = cName;
        } else {
          chLabel.textContent = '# select channel';
          chLabel.className = 'min-w-0 truncate text-sm text-neutral-500';
          chClear.classList.add('hidden');
          previewCh.textContent = 'general';
        }

        // Update No time limit UI
        const noLimitBox = modal.querySelector('#poll-no-limit-box');
        const durWrap = modal.querySelector('#poll-duration-inputs-wrap');
        if (state.no_time_limit) {
          noLimitBox.className = 'w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-[background-color,border-color] duration-150 ease-out bg-white border-white text-black';
          noLimitBox.innerHTML = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"></path></svg>`;
          durWrap.classList.add('opacity-40', 'pointer-events-none');
        } else {
          noLimitBox.className = 'w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-[background-color,border-color] duration-150 ease-out border-neutral-600 group-hover:border-neutral-500';
          noLimitBox.innerHTML = '';
          durWrap.classList.remove('opacity-40', 'pointer-events-none');
        }

        // Update Live Discord Preview
        const previewEmbed = modal.querySelector('#poll-preview-embed');
        const previewQuestion = modal.querySelector('#poll-preview-question');
        const previewOptions = modal.querySelector('#poll-preview-options');
        const previewFooter = modal.querySelector('#poll-preview-footer');

        if (previewEmbed) previewEmbed.style.borderColor = state.color || '#5865F2';
        if (previewQuestion) previewQuestion.textContent = qTrim || 'Your question here...';

        const samplePcts = [42, 28, 15, 9, 6, 4, 3, 2, 1, 1];
        if (previewOptions) {
          previewOptions.innerHTML = state.options.map((opt, idx) => {
            const label = opt.trim() || `Option ${idx + 1}`;
            const pct = samplePcts[idx] || 5;
            const isFirst = idx === 0;
            return `
              <div class="relative rounded-md overflow-hidden bg-[#3a3c41] h-9 flex items-center">
                <div class="absolute inset-y-0 left-0 transition-[width] duration-300 ${isFirst ? 'bg-[#5865F2]/30' : 'bg-[#4e5058]/40'}" style="width: ${pct}%; ${isFirst ? `background-color: ${state.color}4D;` : ''}"></div>
                <div class="relative flex items-center justify-between w-full px-3">
                  <span class="text-[12px] text-white font-medium truncate">${escapeHtml(label)}</span>
                  <span class="text-[11px] tabular-nums font-semibold ${isFirst ? 'text-white' : 'text-neutral-400'} ml-2">${pct}%</span>
                </div>
                ${isFirst ? `<div class="absolute left-0 inset-y-0 w-[3px] bg-[#5865F2] rounded-l" style="background-color: ${escapeHtml(state.color)};"></div>` : ''}
              </div>
            `;
          }).join('');
        }

        if (previewFooter) {
          let durText = 'No time limit';
          if (!state.no_time_limit) {
            const v = state.duration_value || 1;
            const u = state.duration_unit || 'days';
            const singular = { minutes: 'minute', hours: 'hour', days: 'day', weeks: 'week' }[u] || 'day';
            const plural = { minutes: 'minutes', hours: 'hours', days: 'days', weeks: 'weeks' }[u] || 'days';
            durText = `${v} ${v === 1 ? singular : plural} left`;
          }
          const multiText = state.allow_multiple_votes ? ' · Multiple votes' : '';
          previewFooter.textContent = `0 votes · ${durText}${multiText}`;
        }
      }

      function renderOptionsInputs() {
        const canDelete = state.options.length > 2;
        optionsList.innerHTML = state.options.map((opt, idx) => `
          <div class="group flex items-center gap-2">
            <span class="text-[10px] text-neutral-700 w-3 text-right tabular-nums flex-shrink-0">${idx + 1}</span>
            <input data-poll-opt-idx="${idx}" placeholder="Option ${idx + 1}" maxlength="100" class="flex-1 px-3.5 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:bg-neutral-800 transition-[background-color,border-color] duration-150 ease-out" type="text" value="${escapeHtml(opt)}">
            <button type="button" data-poll-opt-del="${idx}" ${canDelete ? '' : 'disabled=""'} class="p-1.5 rounded-lg text-neutral-700 hover:text-red-400 hover:bg-red-400/10 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-0 disabled:pointer-events-none flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 w-3.5 h-3.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></path><line x1="14" x2="14" y1="11" y2="17"></path></svg>
            </button>
          </div>
        `).join('');

        optionsList.querySelectorAll('[data-poll-opt-idx]').forEach(inp => {
          inp.oninput = () => {
            const i = Number(inp.getAttribute('data-poll-opt-idx'));
            state.options[i] = inp.value;
            updateFooterButtonsAndPreview();
          };
        });

        optionsList.querySelectorAll('[data-poll-opt-del]').forEach(delBtn => {
          delBtn.onclick = () => {
            if (state.options.length <= 2) return;
            const i = Number(delBtn.getAttribute('data-poll-opt-del'));
            state.options.splice(i, 1);
            renderOptionsInputs();
            updateFooterButtonsAndPreview();
          };
        });
      }

      // Close modal
      modal.querySelector('#poll-modal-close').onclick = () => modal.remove();
      modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

      // Quick Start presets
      modal.querySelectorAll('[data-quick-start]').forEach(btn => {
        btn.onclick = () => {
          const preset = btn.getAttribute('data-quick-start');
          state.quickStart = preset;
          modal.querySelectorAll('[data-quick-start]').forEach(b => {
            const active = b.getAttribute('data-quick-start') === preset;
            b.className = `flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border ${
              active
                ? 'bg-neutral-800 border-neutral-500 text-white'
                : 'bg-neutral-800/50 border-neutral-700/50 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'
            }`;
          });

          if (preset === 'yesno') {
            state.options = ['Yes', 'No'];
          } else if (preset === 'rating') {
            state.options = ['⭐ 1 Star', '⭐⭐ 2 Stars', '⭐⭐⭐ 3 Stars', '⭐⭐⭐⭐ 4 Stars', '⭐⭐⭐⭐⭐ 5 Stars'];
          } else if (preset === 'thisorthat') {
            state.options = ['This', 'That'];
          } else if (preset === 'custom') {
            state.options = ['', ''];
            questionInput.focus();
          }
          renderOptionsInputs();
          updateFooterButtonsAndPreview();
        };
      });

      // Question input
      questionInput.oninput = () => {
        state.question = questionInput.value;
        questionCounter.textContent = `${state.question.length}/256`;
        updateFooterButtonsAndPreview();
      };

      // Add option
      addOptionBtn.onclick = () => {
        if (state.options.length >= 10) return;
        state.options.push('');
        renderOptionsInputs();
        updateFooterButtonsAndPreview();
        const inputs = optionsList.querySelectorAll('[data-poll-opt-idx]');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
      };

      // Channel custom dropdown & search
      const chBtn = modal.querySelector('#poll-channel-dd-btn');
      const chMenu = modal.querySelector('#poll-channel-dd-menu');
      const chClear = modal.querySelector('#poll-channel-dd-clear');
      const chSearchInput = modal.querySelector('#poll-channel-search-input');

      if (chSearchInput) {
        chSearchInput.onclick = (e) => e.stopPropagation();
        chSearchInput.onkeydown = (e) => e.stopPropagation();
        chSearchInput.oninput = (e) => {
          const q = (e.target.value || '').toLowerCase().trim();
          modal.querySelectorAll('#poll-channel-list [data-poll-ch-opt]').forEach(btn => {
            const name = btn.getAttribute('data-ch-name') || '';
            btn.style.display = (!q || name.includes(q)) ? '' : 'none';
          });
        };
      }

      chBtn.onclick = async (e) => {
        if (e.target.closest('#poll-channel-dd-clear')) return;
        e.stopPropagation();
        if (textChannels.length === 0) {
          try {
            const freshCh = await API.getChannels(guildId);
            if (Array.isArray(freshCh) && freshCh.length > 0) {
              textChannels = freshCh.filter(c => !c.type || c.type === 'text' || c.type === 'news' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text')));
              const listEl = modal.querySelector('#poll-channel-list');
              if (listEl) {
                listEl.innerHTML = textChannels.map(c => `
                  <button type="button" data-poll-ch-opt="${escapeHtml(c.id)}" data-ch-name="${escapeHtml((c.name || '').toLowerCase())}" class="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2 rounded-lg transition-colors">
                    <span class="text-neutral-500 font-mono">#</span>
                    <span class="truncate">${escapeHtml(c.name)}</span>
                  </button>
                `).join('');
                listEl.querySelectorAll('[data-poll-ch-opt]').forEach(optBtn => {
                  optBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    state.channel_id = optBtn.getAttribute('data-poll-ch-opt') || '';
                    chMenu.classList.add('hidden');
                    updateFooterButtonsAndPreview();
                  };
                });
              }
            }
          } catch (_) {}
        }
        modal.querySelector('#poll-unit-dd-menu')?.classList.add('hidden');
        modal.querySelector('#poll-role-dd-menu')?.classList.add('hidden');
        const isOpening = chMenu.classList.contains('hidden');
        chMenu.classList.toggle('hidden');
        if (isOpening && chSearchInput) {
          chSearchInput.value = '';
          modal.querySelectorAll('#poll-channel-list [data-poll-ch-opt]').forEach(b => b.style.display = '');
          setTimeout(() => chSearchInput.focus(), 20);
        }
        if (window.OrbitDropdownManager) window.OrbitDropdownManager.scheduleSync();
      };

      chClear.onclick = (e) => {
        e.stopPropagation();
        state.channel_id = '';
        chMenu.classList.add('hidden');
        updateFooterButtonsAndPreview();
      };

      modal.querySelectorAll('[data-poll-ch-opt]').forEach(optBtn => {
        optBtn.onclick = (e) => {
          e.stopPropagation();
          state.channel_id = optBtn.getAttribute('data-poll-ch-opt') || '';
          chMenu.classList.add('hidden');
          updateFooterButtonsAndPreview();
        };
      });

      // Duration value & unit dropdown
      const durValInput = modal.querySelector('#poll-duration-val');
      const unitBtn = modal.querySelector('#poll-unit-dd-btn');
      const unitMenu = modal.querySelector('#poll-unit-dd-menu');
      const unitLabel = modal.querySelector('#poll-unit-dd-label');
      const unitClear = modal.querySelector('#poll-unit-dd-clear');

      durValInput.oninput = () => {
        let v = parseInt(durValInput.value, 10);
        if (isNaN(v) || v < 1) v = 1;
        if (v > 999) v = 999;
        state.duration_value = v;
        updateFooterButtonsAndPreview();
      };

      unitBtn.onclick = (e) => {
        if (e.target.closest('#poll-unit-dd-clear')) return;
        e.stopPropagation();
        chMenu.classList.add('hidden');
        modal.querySelector('#poll-role-dd-menu')?.classList.add('hidden');
        unitMenu.classList.toggle('hidden');
      };

      unitClear.onclick = (e) => {
        e.stopPropagation();
        state.duration_unit = 'days';
        unitLabel.textContent = unitLabels.days;
        unitMenu.classList.add('hidden');
        updateFooterButtonsAndPreview();
      };

      modal.querySelectorAll('[data-poll-unit-opt]').forEach(optBtn => {
        optBtn.onclick = (e) => {
          e.stopPropagation();
          const u = optBtn.getAttribute('data-poll-unit-opt') || 'days';
          state.duration_unit = u;
          unitLabel.textContent = unitLabels[u] || 'Tage';
          unitMenu.classList.add('hidden');
          updateFooterButtonsAndPreview();
        };
      });

      // No time limit checkbox
      modal.querySelector('#poll-no-limit-btn').onclick = () => {
        state.no_time_limit = !state.no_time_limit;
        updateFooterButtonsAndPreview();
      };

      // Allow multiple votes switch
      const multiSwitch = modal.querySelector('#poll-multi-vote-switch');
      const multiKnob = modal.querySelector('#poll-multi-vote-knob');
      multiSwitch.onclick = () => {
        state.allow_multiple_votes = !state.allow_multiple_votes;
        multiSwitch.setAttribute('aria-checked', state.allow_multiple_votes ? 'true' : 'false');
        multiSwitch.className = `relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${state.allow_multiple_votes ? 'bg-white' : 'bg-neutral-700'}`;
        multiKnob.className = `pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${state.allow_multiple_votes ? 'translate-x-[21px]' : 'translate-x-[3px]'}`;
        updateFooterButtonsAndPreview();
      };

      // Advanced collapsible
      const advToggle = modal.querySelector('#poll-advanced-toggle');
      const advChevron = modal.querySelector('#poll-advanced-chevron');
      const advPanel = modal.querySelector('#poll-advanced-panel');
      advToggle.onclick = () => {
        state.advancedOpen = !state.advancedOpen;
        advPanel.classList.toggle('hidden', !state.advancedOpen);
        advChevron.classList.toggle('-rotate-90', !state.advancedOpen);
      };

      // Anonymous switch
      const anonSwitch = modal.querySelector('#poll-anon-switch');
      const anonKnob = modal.querySelector('#poll-anon-knob');
      anonSwitch.onclick = () => {
        state.anonymous = !state.anonymous;
        anonSwitch.setAttribute('aria-checked', state.anonymous ? 'true' : 'false');
        anonSwitch.className = `relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${state.anonymous ? 'bg-white' : 'bg-neutral-700'}`;
        anonKnob.className = `pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out ${state.anonymous ? 'translate-x-[21px]' : 'translate-x-[3px]'}`;
      };

      // Required Role dropdown
      const roleBtn = modal.querySelector('#poll-role-dd-btn');
      const roleMenu = modal.querySelector('#poll-role-dd-menu');
      const roleLabel = modal.querySelector('#poll-role-dd-label');
      if (state.required_role_id) {
        const rFound = roles.find(r => String(r.id) === String(state.required_role_id));
        if (rFound) {
          roleLabel.textContent = `@ ${rFound.name}`;
          roleLabel.className = 'min-w-0 truncate text-white';
        }
      }
      roleBtn.onclick = (e) => {
        e.stopPropagation();
        chMenu.classList.add('hidden');
        unitMenu.classList.add('hidden');
        roleMenu.classList.toggle('hidden');
        if (window.OrbitDropdownManager) window.OrbitDropdownManager.scheduleSync();
      };
      modal.querySelectorAll('[data-poll-role-opt]').forEach(optBtn => {
        optBtn.onclick = (e) => {
          e.stopPropagation();
          const rid = optBtn.getAttribute('data-poll-role-opt') || '';
          state.required_role_id = rid;
          if (rid) {
            const rFound = roles.find(r => String(r.id) === String(rid));
            roleLabel.textContent = rFound ? `@ ${rFound.name}` : '@ Selected Role';
            roleLabel.className = 'min-w-0 truncate text-white';
          } else {
            roleLabel.textContent = '@ Everyone';
            roleLabel.className = 'min-w-0 truncate text-neutral-400';
          }
          roleMenu.classList.add('hidden');
        };
      });

      // Accent color swatches
      modal.querySelectorAll('[data-poll-color]').forEach(sw => {
        sw.onclick = () => {
          state.color = sw.getAttribute('data-poll-color') || '#5865F2';
          modal.querySelectorAll('[data-poll-color]').forEach(b => {
            const active = (b.getAttribute('data-poll-color') || '').toLowerCase() === state.color.toLowerCase();
            b.className = `w-6 h-6 rounded-lg border-2 transition-transform active:scale-95 ${active ? 'border-white scale-105' : 'border-transparent'}`;
          });
          updateFooterButtonsAndPreview();
        };
      });

      // Close modal dropdowns when clicking inside modal outside dropdowns
      modal.querySelector('[role="dialog"]').onclick = (e) => {
        if (!e.target.closest('#poll-channel-dd-wrap')) chMenu.classList.add('hidden');
        if (!e.target.closest('#poll-unit-dd-wrap')) unitMenu.classList.add('hidden');
        if (!e.target.closest('#poll-role-dd-wrap')) roleMenu.classList.add('hidden');
      };

      // Submit handler (Save as Draft / Create Poll)
      async function submitPoll(asDraft) {
        const btn = asDraft ? saveDraftBtn : createSubmitBtn;
        const origText = btn.textContent;
        btn.disabled = true;
        btn.textContent = asDraft ? 'Saving...' : 'Creating...';

        try {
          const payload = {
            poll_id: state.id || undefined,
            question: state.question.trim(),
            options: state.options.map(o => o.trim()).filter(Boolean),
            channel_id: state.channel_id,
            duration_value: state.duration_value,
            duration_unit: state.duration_unit,
            no_time_limit: state.no_time_limit,
            allow_multiple_votes: state.allow_multiple_votes,
            anonymous: state.anonymous,
            required_role_id: state.required_role_id,
            color: state.color,
            draft: Boolean(asDraft)
          };

          const res = await API.savePoll(guildId, payload);
          if (res?.poll) {
            const existsIdx = polls.findIndex(p => String(p.id) === String(res.poll.id));
            if (existsIdx >= 0) {
              polls[existsIdx] = res.poll;
            } else {
              polls.unshift(res.poll);
            }
          }
          Toast.success(asDraft ? 'Entwurf gespeichert!' : 'Umfrage erfolgreich erstellt und in Discord gepostet!');
          modal.remove();
          renderMainView();
        } catch (err) {
          Toast.error(err.message || 'Fehler beim Speichern der Umfrage.');
          btn.disabled = false;
          btn.textContent = origText;
        }
      }

      saveDraftBtn.onclick = () => submitPoll(true);
      createSubmitBtn.onclick = () => submitPoll(false);

      // Initial render of options and preview
      renderOptionsInputs();
      updateFooterButtonsAndPreview();
    }

    renderMainView();
  } catch (err) {
    console.error('[Polls Tab Error]', err);
    container.innerHTML = `
      <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-red-400 text-sm">
        Fehler beim Laden der Umfragen: ${escapeHtml(err.message)}
      </div>
    `;
  }
};
