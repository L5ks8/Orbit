/**
 * Orbit Dashboard - Leaderboard Tab (/dashboard/:guildId/leaderboard)
 */

DashboardTabs.Leaderboard = async function(container, guildId) {
  const escapeHtml = window.escapeHtml || function(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  const CATEGORIES = [
    {
      id: 'total_xp',
      label: 'Level & XP',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      formatVal: (u) => `${Number(u.total_xp || u.xp || 0).toLocaleString()} XP`,
      formatSub: (u) => `Level ${u.level || 0}`,
      podiumPrimary: (u) => `Level ${u.level || 0}`,
      podiumSecondary: (u) => `${Number(u.total_xp || u.xp || 0).toLocaleString()} XP`
    },
    {
      id: 'invites',
      label: 'Invites',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>',
      formatVal: (u) => `${Number(u.value !== undefined ? u.value : (u.total || 0)).toLocaleString()} invites`,
      formatSub: (u) => `+${u.regular || 0} / -${u.left || 0}`,
      podiumPrimary: (u) => `${Number(u.value !== undefined ? u.value : (u.total || 0)).toLocaleString()} inv.`,
      podiumSecondary: (u) => `+${u.regular || 0} / -${u.left || 0}`
    },
    {
      id: 'voice_minutes',
      label: 'Voice Hours',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>',
      formatVal: (u) => `${typeof u.value === 'number' ? u.value.toFixed(1) : (Number(u.voice_minutes || 0) / 60).toFixed(1)} hrs`,
      formatSub: (u) => `${Math.round(Number(u.voice_minutes || 0))} mins`,
      podiumPrimary: (u) => `${typeof u.value === 'number' ? u.value.toFixed(1) : (Number(u.voice_minutes || 0) / 60).toFixed(1)} hrs`,
      podiumSecondary: (u) => `${Math.round(Number(u.voice_minutes || 0))} mins`
    },
    {
      id: 'message_count',
      label: 'Messages',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
      formatVal: (u) => `${Number(u.value !== undefined ? u.value : (u.message_count || u.messages || 0)).toLocaleString()} msgs`,
      formatSub: (u) => 'Messages sent',
      podiumPrimary: (u) => `${Number(u.value !== undefined ? u.value : (u.message_count || u.messages || 0)).toLocaleString()} msgs`,
      podiumSecondary: (u) => 'Messages sent'
    },
    {
      id: 'reaction_count',
      label: 'Reactions',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>',
      formatVal: (u) => `${Number(u.value !== undefined ? u.value : (u.reaction_count || u.reactions || 0)).toLocaleString()} reacts`,
      formatSub: (u) => 'Reactions added',
      podiumPrimary: (u) => `${Number(u.value !== undefined ? u.value : (u.reaction_count || u.reactions || 0)).toLocaleString()} reacts`,
      podiumSecondary: (u) => 'Reactions added'
    }
  ];

  let currentCategory = 'total_xp';
  const cache = {};
  let searchQuery = '';

  const PODIUM_THEMES = {
    1: {
      medal: '👑',
      barClass: 'orbit-podium-gold',
      numClass: 'text-amber-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.7)]',
      ringClass: 'ring-2 ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.5)]',
      totalClass: 'text-amber-300 font-extrabold',
      subClass: 'text-amber-200/70',
      emptyBarClass: 'orbit-podium-gold opacity-30',
      emptyNumClass: 'text-amber-400/40',
      avatarSize: 'w-16 h-16 sm:w-20 sm:h-20'
    },
    2: {
      medal: '🥈',
      barClass: 'orbit-podium-silver',
      numClass: 'text-slate-100 drop-shadow-[0_2px_10px_rgba(226,232,240,0.7)]',
      ringClass: 'ring-2 ring-slate-300 shadow-[0_0_16px_rgba(226,232,240,0.4)]',
      totalClass: 'text-slate-100 font-extrabold',
      subClass: 'text-slate-300/70',
      emptyBarClass: 'orbit-podium-silver opacity-30',
      emptyNumClass: 'text-slate-300/40',
      avatarSize: 'w-14 h-14 sm:w-16 sm:h-16'
    },
    3: {
      medal: '🥉',
      barClass: 'orbit-podium-bronze',
      numClass: 'text-orange-300 drop-shadow-[0_2px_10px_rgba(249,115,22,0.7)]',
      ringClass: 'ring-2 ring-orange-500 shadow-[0_0_16px_rgba(249,115,22,0.4)]',
      totalClass: 'text-orange-300 font-extrabold',
      subClass: 'text-orange-200/70',
      emptyBarClass: 'orbit-podium-bronze opacity-30',
      emptyNumClass: 'text-orange-400/40',
      avatarSize: 'w-12 h-12 sm:w-14 sm:h-14'
    }
  };

  function renderPodiumSlot(entry, rank, catDef) {
    const theme = PODIUM_THEMES[rank];
    if (!entry) {
      return `
        <div class="flex flex-col items-center flex-1 min-w-[80px] max-w-[150px] relative z-10">
          <div class="h-6 flex items-end justify-center mb-0.5">
            <span class="text-xs opacity-50 select-none">${theme.medal}</span>
          </div>
          <div class="${theme.avatarSize} rounded-full bg-neutral-800/40 border border-white/5 flex items-center justify-center text-xs text-neutral-500 font-medium">?</div>
          <div class="h-3 w-14 rounded bg-neutral-800/30 mt-2"></div>
          <div class="h-3.5 w-8 rounded bg-neutral-800/20 mt-1"></div>
          <div class="mb-1 mt-0.5 h-3"></div>
          <div class="orbit-podium-bar orbit-podium-bar-${rank} ${theme.emptyBarClass} mt-2 flex items-end justify-center pb-3">
            <span class="text-3xl font-black ${theme.emptyNumClass}">${rank}</span>
          </div>
        </div>
      `;
    }
    const avatar = entry.avatar || '/img/logo.png';
    const name = escapeHtml(entry.name || entry.username || `User#${entry.user_id}`);
    const primary = catDef.podiumPrimary(entry);
    const secondary = catDef.podiumSecondary(entry);

    return `
      <div class="flex flex-col items-center flex-1 min-w-[80px] max-w-[150px] relative z-10 group">
        <div class="h-6 flex items-end justify-center mb-0.5">
          <span class="text-sm drop-shadow-md select-none">${theme.medal}</span>
        </div>
        <img src="${escapeHtml(avatar)}" alt="${name}" class="${theme.avatarSize} rounded-full object-cover ${theme.ringClass} transition-transform duration-200 group-hover:scale-105" onerror="this.src='/img/logo.png'">
        <span class="text-xs font-bold text-white truncate max-w-[125px] mt-2 text-center" title="${name}">${name}</span>
        <span class="text-[12px] ${theme.totalClass} tabular-nums mt-1">${escapeHtml(primary)}</span>
        <span class="text-[10px] ${theme.subClass} tabular-nums mb-1 mt-0.5 h-3 truncate max-w-[110px]">${escapeHtml(secondary)}</span>
        <div class="orbit-podium-bar orbit-podium-bar-${rank} ${theme.barClass} mt-2 flex items-end justify-center pb-3 transition-transform duration-200 group-hover:scale-[1.02]">
          <span class="text-3xl font-black ${theme.numClass}">${rank}</span>
        </div>
      </div>
    `;
  }

  function renderPodium(entries, catDef) {
    const first = entries[0] || null;
    const second = entries[1] || null;
    const third = entries[2] || null;
    if (!first && !second && !third) return '';

    return `
      <div class="relative flex items-end justify-center px-4 pt-6 pb-0 gap-3 sm:gap-6 mb-4">
        <div class="absolute bottom-0 left-4 right-4 h-px bg-neutral-800"></div>
        ${renderPodiumSlot(second, 2, catDef)}
        ${renderPodiumSlot(first, 1, catDef)}
        ${renderPodiumSlot(third, 3, catDef)}
      </div>
    `;
  }

  function renderListRows(entries, catDef) {
    if (entries.length === 0) {
      return `
        <div class="p-8 text-center text-neutral-500 text-xs rounded-2xl bg-neutral-900 border border-neutral-800">
          No member activity recorded for ${catDef.label.toLowerCase()} yet.
        </div>
      `;
    }

    return `
      <div class="flex flex-col gap-2">
        ${entries.map(u => {
          const avatar = u.avatar || '/img/logo.png';
          const name = escapeHtml(u.name || u.username || `User#${u.user_id}`);
          const rank = u.rank;
          const rankColor = rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-orange-400' : 'text-neutral-500';
          const valStr = catDef.formatVal(u);
          const subStr = catDef.formatSub(u);

          return `
            <div class="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3 min-w-0">
                <span class="w-6 text-center text-xs font-bold ${rankColor}">#${rank}</span>
                <img src="${escapeHtml(avatar)}" class="w-9 h-9 rounded-full object-cover shrink-0" onerror="this.src='/img/logo.png'">
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-semibold text-white truncate max-w-xs">${name}</span>
                  <span class="text-[10px] text-neutral-500 truncate">${escapeHtml(subStr)}</span>
                </div>
              </div>
              <div class="text-right shrink-0">
                <span class="text-xs font-bold text-white tabular-nums">${escapeHtml(valStr)}</span>
                ${u.level ? `<p class="text-[10px] text-indigo-400 font-medium">Lvl ${u.level}</p>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Server Leaderboard</h1>
          <p class="text-xs text-neutral-400 mt-1">Community activity rankings and podium statistics.</p>
        </div>
        <a href="/leaderboard/${guildId}" target="_blank" class="self-start sm:self-auto px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
          ${typeof icon === 'function' ? icon('external-link', 14) : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>'} Public Leaderboard Link
        </a>
      </div>

      <div class="flex items-center flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-900 border border-neutral-800">
        ${CATEGORIES.map(cat => `
          <button data-cat="${cat.id}" class="dash-lb-tab-btn px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${cat.id === currentCategory ? 'bg-white/10 text-white border border-white/15' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent'}">
            ${cat.icon}
            <span>${cat.label}</span>
          </button>
        `).join('')}
      </div>

      <div class="flex items-center justify-between gap-3">
        <div class="relative flex-1 max-w-xs">
          <input type="text" id="dash-lb-search" placeholder="Search members..." class="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500">
        </div>
        <span id="dash-lb-count" class="text-xs text-neutral-500 tabular-nums font-medium"></span>
      </div>

      <div id="dash-lb-loading" class="text-center py-12 text-neutral-500 text-sm">
        <svg class="animate-spin inline mr-2 text-indigo-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading rankings...
      </div>

      <div id="dash-lb-main" class="hidden flex flex-col gap-4">
        <div id="dash-lb-podium"></div>
        <div id="dash-lb-list"></div>
      </div>
    </div>
  `;

  async function loadCategory(catId) {
    const loading = document.getElementById('dash-lb-loading');
    const main = document.getElementById('dash-lb-main');

    document.querySelectorAll('.dash-lb-tab-btn').forEach(btn => {
      const active = btn.getAttribute('data-cat') === catId;
      btn.className = `dash-lb-tab-btn px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${active ? 'bg-white/10 text-white border border-white/15' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent'}`;
    });

    const catDef = CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];

    let data = cache[catId];
    if (!data) {
      if (main && !main.classList.contains('hidden')) {
        main.style.opacity = '0.5';
      } else if (loading) {
        loading.classList.remove('hidden');
      }

      try {
        data = await API.getLeaderboard(guildId, catId);
        cache[catId] = data;
      } catch (err) {
        if (loading) loading.innerHTML = `<span class="text-red-400">Failed to load leaderboard: ${escapeHtml(err.message || 'Unknown error')}</span>`;
        return;
      }
    }

    if (main) main.style.opacity = '1';
    if (loading) loading.classList.add('hidden');
    if (main) main.classList.remove('hidden');

    const allEntries = data.entries || data.users || [];
    renderView(allEntries, catDef);
  }

  function renderView(allEntries, catDef) {
    const podiumEl = document.getElementById('dash-lb-podium');
    const listEl = document.getElementById('dash-lb-list');
    const countEl = document.getElementById('dash-lb-count');

    let filtered = allEntries;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = allEntries.filter(u => (u.name || u.username || u.user_id || '').toLowerCase().includes(q));
    }

    if (countEl) {
      countEl.textContent = `${filtered.length} member${filtered.length === 1 ? '' : 's'}`;
    }

    if (!searchQuery.trim()) {
      if (podiumEl) podiumEl.innerHTML = renderPodium(allEntries.slice(0, 3), catDef);
      const remaining = allEntries.slice(3);
      if (listEl) listEl.innerHTML = renderListRows(remaining, catDef);
    } else {
      if (podiumEl) podiumEl.innerHTML = '';
      if (listEl) listEl.innerHTML = renderListRows(filtered, catDef);
    }
  }

  document.querySelectorAll('.dash-lb-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-cat');
      if (catId && catId !== currentCategory) {
        currentCategory = catId;
        loadCategory(catId);
      }
    });
  });

  const searchInput = document.getElementById('dash-lb-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      const catDef = CATEGORIES.find(c => c.id === currentCategory) || CATEGORIES[0];
      const data = cache[currentCategory];
      if (data) {
        renderView(data.entries || data.users || [], catDef);
      }
    });
  }

  await loadCategory(currentCategory);
};
