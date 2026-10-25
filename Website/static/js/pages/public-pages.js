/**
 * Orbit Public Pages
 * Documentation, Guides, Benchmarks, Leaderboard, Terms, and Privacy.
 */

// ==========================================

// ==========================================


// ==========================================
// GUIDES PAGE
// ==========================================
Pages.Docs = function(container) {
  window.location.href = window.location.pathname.startsWith('/docs') ? window.location.pathname : '/docs';
};

Pages.Guides = function(container) {
  const guides = [
    { title: 'Setting Up Auto-Moderation', time: '3 min read', desc: 'Learn how to configure blocked words, invite filters, and automatic timeouts.' },
    { title: 'Configuring Multi-Category Tickets', time: '5 min read', desc: 'Step-by-step tutorial on creating interactive ticket panels and assigning staff roles.' },
    { title: 'Deploying the Web Ban Appeal Portal', time: '4 min read', desc: 'How to setup your custom URL and review submitted pardon requests in the dashboard.' }
  ];

  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-6 pt-32 pb-24 animate-fade-in">
      <div class="text-center mb-16">
        <h1 class="text-4xl font-extrabold text-white mb-3">Guides & Tutorials</h1>
        <p class="text-neutral-400 text-sm">Everything you need to set up Orbit on your server.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${guides.map(g => `
          <div class="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between gap-6 group">
            <div>
              <span class="text-xs text-indigo-400 font-semibold mb-2 block">${g.time}</span>
              <h2 class="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">${g.title}</h2>
              <p class="text-xs text-neutral-400 leading-relaxed">${g.desc}</p>
            </div>
            <a href="#features" class="text-xs text-white font-semibold flex items-center gap-1.5 hover:underline">
              Read Guide ${icon('arrow-right', 12)}
            </a>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};


// ==========================================
// BENCHMARKS PAGE
// ==========================================
Pages.Benchmarks = function(container) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto px-6 pt-32 pb-24 animate-fade-in text-center">
      <h1 class="text-4xl font-extrabold text-white mb-3">Performance Benchmarks</h1>
      <p class="text-neutral-400 text-sm mb-12">Engineered with async Python 3.11 for instant gateway response times.</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div class="text-3xl font-extrabold text-indigo-400 mb-1">0.14ms</div>
          <div class="text-xs font-semibold text-white mb-2">AutoMod Evaluation</div>
          <p class="text-[11px] text-neutral-500">Average message processing time across 10,000 regex rules.</p>
        </div>
        <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div class="text-3xl font-extrabold text-emerald-400 mb-1">100%</div>
          <div class="text-xs font-semibold text-white mb-2">Zero Build Dependency</div>
          <p class="text-[11px] text-neutral-500">Pure HTML5, CSS, and Vanilla JavaScript with instant deploys.</p>
        </div>
        <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div class="text-3xl font-extrabold text-purple-400 mb-1">10,000+</div>
          <div class="text-xs font-semibold text-white mb-2">Concurrent WebSockets</div>
          <p class="text-[11px] text-neutral-500">Async I/O non-blocking connection scalability.</p>
        </div>
      </div>
    </div>
  `;
};

// ==========================================
// PUBLIC LEADERBOARD PAGE
// ==========================================
Pages.Leaderboard = async function(container, guildId) {
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
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('sort') || urlParams.get('category');
    if (catParam && CATEGORIES.some(c => c.id === catParam)) {
      currentCategory = catParam;
    }
  } catch (_) {}

  const cache = {};
  let searchQuery = '';
  let serverInfo = { guild_name: '', guild_icon: '' };

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
        <div class="flex flex-col items-center flex-1 min-w-[90px] max-w-[170px] relative z-10">
          <div class="h-7 flex items-end justify-center mb-1">
            <span class="text-sm opacity-50 select-none">${theme.medal}</span>
          </div>
          <div class="${theme.avatarSize} rounded-full bg-neutral-800/40 border border-white/5 flex items-center justify-center text-sm text-neutral-500 font-medium">?</div>
          <div class="h-3 w-16 rounded bg-neutral-800/40 mt-2.5"></div>
          <div class="h-3 w-10 rounded bg-neutral-800/30 mt-1"></div>
          <div class="mb-1 mt-0.5 h-3"></div>
          <div class="orbit-podium-bar orbit-podium-bar-${rank} ${theme.emptyBarClass} mt-2 flex items-end justify-center pb-3">
            <span class="text-3xl font-black ${theme.emptyNumClass}">${rank}</span>
          </div>
        </div>
      `;
    }
    const avatar = entry.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const name = escapeHtml(entry.name || entry.username || `User#${entry.user_id}`);
    const primary = catDef.podiumPrimary(entry);
    const secondary = catDef.podiumSecondary(entry);

    return `
      <div class="flex flex-col items-center flex-1 min-w-[90px] max-w-[170px] relative z-10 group">
        <div class="h-7 flex items-end justify-center mb-1">
          <span class="text-base drop-shadow-md select-none transform transition-transform group-hover:scale-110">${theme.medal}</span>
        </div>
        <img src="${escapeHtml(avatar)}" alt="${name}" class="${theme.avatarSize} rounded-full object-cover ${theme.ringClass} transition-transform duration-200 group-hover:scale-105" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
        <span class="text-xs sm:text-sm font-bold text-white truncate max-w-[130px] sm:max-w-[150px] mt-2 text-center" title="${name}">${name}</span>
        <span class="text-[12px] sm:text-[13px] ${theme.totalClass} tabular-nums mt-0.5">${escapeHtml(primary)}</span>
        <span class="text-[10px] sm:text-[11px] ${theme.subClass} tabular-nums mb-1 mt-0.5 h-3 truncate max-w-[120px]">${escapeHtml(secondary)}</span>
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

    if (!first && !second && !third) {
      return '';
    }

    return `
      <div class="relative flex items-end justify-center px-4 pt-6 pb-0 gap-3 sm:gap-6 md:gap-8 mb-6">
        <div class="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
        ${renderPodiumSlot(second, 2, catDef)}
        ${renderPodiumSlot(first, 1, catDef)}
        ${renderPodiumSlot(third, 3, catDef)}
      </div>
    `;
  }

  function renderListRows(entries, catDef) {
    if (entries.length === 0) {
      return `
        <div class="p-10 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800/60 flex flex-col items-center justify-center">
          <div class="w-12 h-12 rounded-2xl bg-neutral-800/60 flex items-center justify-center text-neutral-400 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
          </div>
          <p class="text-sm font-semibold text-white">No active rankings yet</p>
          <p class="text-xs text-neutral-500 mt-1">There is no recorded ${catDef.label.toLowerCase()} activity for this server yet.</p>
        </div>
      `;
    }

    return `
      <div class="flex flex-col gap-2">
        ${entries.map(u => {
          const avatar = u.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
          const name = escapeHtml(u.name || u.username || `User#${u.user_id}`);
          const rank = u.rank;
          const rankColor = rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-orange-400' : 'text-neutral-500';
          const valStr = catDef.formatVal(u);
          const subStr = catDef.formatSub(u);

          return `
            <div class="p-3 sm:p-4 rounded-2xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700/80 transition-all flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 sm:gap-4 min-w-0">
                <span class="text-xs sm:text-sm font-black w-7 sm:w-8 text-center tabular-nums ${rankColor}">#${rank}</span>
                <img src="${escapeHtml(avatar)}" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0 ring-1 ring-white/10" alt="${name}" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                <div class="flex flex-col min-w-0">
                  <span class="text-xs sm:text-sm font-bold text-white truncate max-w-[150px] sm:max-w-xs">${name}</span>
                  <span class="text-[10px] sm:text-[11px] text-neutral-500 truncate">${escapeHtml(subStr)}</span>
                </div>
              </div>
              <div class="text-right shrink-0">
                <span class="text-xs sm:text-sm font-bold text-white tabular-nums">${escapeHtml(valStr)}</span>
                ${u.level ? `<div class="text-[10px] text-indigo-400 font-medium">Level ${u.level}</div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Shell HTML
  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20 animate-fade-in">
      <div class="flex items-center justify-between mb-8">
        <a href="/" class="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Orbit
        </a>
        <a href="https://discord.com/oauth2/authorize?client_id=1413812854968127539&permissions=8&integration_type=0&scope=bot+applications.commands" target="_blank" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add Orbit
        </a>
      </div>

      <div class="text-center flex flex-col items-center mb-8">
        <div class="relative mb-4">
          <div class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-md"></div>
          <img id="pub-guild-icon" src="/img/logo.png" class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-2 ring-white/10 shadow-xl" alt="Server Icon" onerror="this.src='/img/logo.png'">
        </div>
        <h1 id="pub-guild-name" class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Server Leaderboard</h1>
        <p class="text-xs sm:text-sm text-neutral-400 mt-1.5 max-w-md">Community rankings for activity, invites, voice time, and messages.</p>
      </div>

      <div class="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 mb-8 p-1.5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-sm shadow-inner max-w-2xl mx-auto">
        ${CATEGORIES.map(cat => `
          <button data-cat="${cat.id}" class="cat-tab-btn px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${cat.id === currentCategory ? 'bg-white/10 text-white border border-white/15 shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent'}">
            ${cat.icon}
            <span>${cat.label}</span>
          </button>
        `).join('')}
      </div>

      <div class="flex items-center justify-between gap-3 mb-6">
        <div class="relative flex-1 max-w-xs">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input type="text" id="lb-search" placeholder="Search members..." class="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900/80 border border-neutral-800/80 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/80 transition-colors">
        </div>
        <div id="lb-count-badge" class="text-xs font-semibold text-neutral-500 tabular-nums"></div>
      </div>

      <div id="pub-lb-loading" class="text-center py-20 text-neutral-500 text-sm">
        <svg class="animate-spin inline mr-2 text-indigo-400" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading rankings...
      </div>

      <div id="pub-lb-main" class="hidden">
        <div id="pub-lb-podium"></div>
        <div id="pub-lb-list"></div>
      </div>
    </div>
  `;

  async function loadCategory(catId) {
    const loading = document.getElementById('pub-lb-loading');
    const main = document.getElementById('pub-lb-main');
    const nameEl = document.getElementById('pub-guild-name');
    const iconEl = document.getElementById('pub-guild-icon');

    // Update tab button styles
    document.querySelectorAll('.cat-tab-btn').forEach(btn => {
      const active = btn.getAttribute('data-cat') === catId;
      btn.className = `cat-tab-btn px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${active ? 'bg-white/10 text-white border border-white/15 shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent'}`;
    });

    const catDef = CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];

    // Check cache
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
        if (loading) loading.innerHTML = `<span class="text-red-400">Failed to load leaderboard data: ${escapeHtml(err.message || 'Unknown error')}</span>`;
        return;
      }
    }

    if (main) main.style.opacity = '1';
    if (loading) loading.classList.add('hidden');
    if (main) main.classList.remove('hidden');

    if (data.guild_name) {
      serverInfo.guild_name = data.guild_name;
      if (nameEl) nameEl.textContent = `${data.guild_name} Leaderboard`;
    }
    if (data.guild_icon) {
      serverInfo.guild_icon = data.guild_icon;
      if (iconEl) iconEl.src = data.guild_icon;
    }

    const allEntries = data.entries || data.users || [];
    renderView(allEntries, catDef);
  }

  function renderView(allEntries, catDef) {
    const podiumEl = document.getElementById('pub-lb-podium');
    const listEl = document.getElementById('pub-lb-list');
    const badgeEl = document.getElementById('lb-count-badge');

    let filtered = allEntries;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = allEntries.filter(u => {
        const name = (u.name || u.username || u.user_id || '').toLowerCase();
        return name.includes(q);
      });
    }

    if (badgeEl) {
      badgeEl.textContent = `${filtered.length} member${filtered.length === 1 ? '' : 's'}`;
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

  // Bind tab buttons
  document.querySelectorAll('.cat-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-cat');
      if (catId && catId !== currentCategory) {
        currentCategory = catId;
        try {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('sort', catId);
          window.history.replaceState({}, '', newUrl.toString());
        } catch (_) {}
        loadCategory(catId);
      }
    });
  });

  // Bind search input
  const searchInput = document.getElementById('lb-search');
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

  // Initial load
  await loadCategory(currentCategory);
};

// ==========================================
// USER SETTINGS PAGE (PeakBot Layout)
// ==========================================
Pages.UserSettings = async function(container) {
  const escapeHtml = window.escapeHtml || function(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  let user = null;
  try {
    user = await API.getUser();
  } catch (e) {
    console.error('Failed to get user', e);
  }

  if (!user && window.Router?.currentUser) {
    user = window.Router.currentUser;
  }

  if (!user) {
    try {
      const cached = localStorage.getItem('orbit_user');
      if (cached) user = JSON.parse(cached);
    } catch (_) {}
  }

  if (!user) {
    container.innerHTML = `
      <div class="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center px-4 py-16">
        <div class="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path></svg>
        </div>
        <h2 class="text-xl font-bold text-white mb-2">Not signed in</h2>
        <p class="text-sm text-neutral-400 mb-6 max-w-sm text-center">Please sign in with your Discord account to view your profile and settings.</p>
        <button onclick="API.login('/settings')" class="px-6 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer">
          Sign In with Discord
        </button>
      </div>
    `;
    return;
  }

  const userName = user.global_name || user.username || 'Discord User';
  const userDiscordId = user.id ? String(user.id) : '';
  let userAvatar = '/img/logo.png';
  if (user.avatar) {
    if (user.avatar.startsWith('http')) {
      userAvatar = user.avatar;
    } else {
      const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
      userAvatar = `https://cdn.discordapp.com/avatars/${userDiscordId}/${user.avatar}.${ext}?size=128`;
    }
  }

  // Calculate real account registration date from Discord Snowflake ID
  let memberDate = 'Discord Member';
  try {
    if (userDiscordId && /^[0-9]+$/.test(userDiscordId)) {
      const snowflakeTime = Number((BigInt(userDiscordId) >> 22n) + 1420070400000n);
      const regDate = new Date(snowflakeTime);
      memberDate = 'Member since ' + regDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch (_) {
    memberDate = 'Member since 2024';
  }

  const now = new Date();
  const autoTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  function getTimezoneDetails(timeZoneId) {
    try {
      const d = new Date();
      const timeFormatted = d.toLocaleTimeString('en-US', { timeZone: timeZoneId, hour: 'numeric', minute: '2-digit' });
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: timeZoneId, timeZoneName: 'shortOffset' }).formatToParts(d);
      let offset = parts.find(p => p.type === 'timeZoneName')?.value || 'UTC';
      offset = offset.replace('GMT', 'UTC');
      if (offset === 'UTC') offset = 'UTC+0';
      return { time: timeFormatted, offset };
    } catch (e) {
      return { time: '--:--', offset: 'UTC' };
    }
  }

  const autoDetails = getTimezoneDetails(autoTz);
  const selectedTimezone = localStorage.getItem('orbit_timezone') || 'auto';
  const isAuto = selectedTimezone === 'auto';
  const activeTimezone = isAuto ? autoTz : selectedTimezone;
  const activeDetails = getTimezoneDetails(activeTimezone);

  const timezoneGroups = [
    {
      name: 'Pacific',
      zones: [
        { name: 'Midway', zone: 'Pacific/Midway' },
        { name: 'Hawaii', zone: 'Pacific/Honolulu' },
        { name: 'Guam', zone: 'Pacific/Guam' },
        { name: 'Tahiti', zone: 'Pacific/Tahiti' }
      ]
    },
    {
      name: 'Americas',
      zones: [
        { name: 'Alaska', zone: 'America/Anchorage' },
        { name: 'Los Angeles', zone: 'America/Los_Angeles' },
        { name: 'Vancouver', zone: 'America/Vancouver' },
        { name: 'Phoenix', zone: 'America/Phoenix' },
        { name: 'Denver', zone: 'America/Denver' },
        { name: 'Chicago', zone: 'America/Chicago' },
        { name: 'Mexico City', zone: 'America/Mexico_City' },
        { name: 'New York', zone: 'America/New_York' },
        { name: 'Toronto', zone: 'America/Toronto' },
        { name: 'Halifax', zone: 'America/Halifax' },
        { name: 'São Paulo', zone: 'America/Sao_Paulo' },
        { name: 'Buenos Aires', zone: 'America/Argentina/Buenos_Aires' },
        { name: 'Edmonton', zone: 'America/Edmonton' },
        { name: 'Winnipeg', zone: 'America/Winnipeg' },
        { name: 'Bogotá', zone: 'America/Bogota' },
        { name: 'Lima', zone: 'America/Lima' },
        { name: 'Caracas', zone: 'America/Caracas' },
        { name: 'Santiago', zone: 'America/Santiago' },
        { name: 'Montevideo', zone: 'America/Montevideo' }
      ]
    },
    {
      name: 'Atlantic',
      zones: [
        { name: 'Azores', zone: 'Atlantic/Azores' }
      ]
    },
    {
      name: 'Global',
      zones: [
        { name: 'UTC', zone: 'UTC' }
      ]
    },
    {
      name: 'Europe',
      zones: [
        { name: 'London', zone: 'Europe/London' },
        { name: 'Lisbon', zone: 'Europe/Lisbon' },
        { name: 'Paris', zone: 'Europe/Paris' },
        { name: 'Berlin', zone: 'Europe/Berlin' },
        { name: 'Madrid', zone: 'Europe/Madrid' },
        { name: 'Amsterdam', zone: 'Europe/Amsterdam' },
        { name: 'Rome', zone: 'Europe/Rome' },
        { name: 'Stockholm', zone: 'Europe/Stockholm' },
        { name: 'Warsaw', zone: 'Europe/Warsaw' },
        { name: 'Athens', zone: 'Europe/Athens' },
        { name: 'Helsinki', zone: 'Europe/Helsinki' },
        { name: 'Istanbul', zone: 'Europe/Istanbul' },
        { name: 'Moscow', zone: 'Europe/Moscow' },
        { name: 'Dublin', zone: 'Europe/Dublin' },
        { name: 'Brussels', zone: 'Europe/Brussels' },
        { name: 'Vienna', zone: 'Europe/Vienna' },
        { name: 'Zurich', zone: 'Europe/Zurich' },
        { name: 'Prague', zone: 'Europe/Prague' },
        { name: 'Bucharest', zone: 'Europe/Bucharest' },
        { name: 'Kyiv', zone: 'Europe/Kyiv' }
      ]
    },
    {
      name: 'Africa',
      zones: [
        { name: 'Lagos', zone: 'Africa/Lagos' },
        { name: 'Cairo', zone: 'Africa/Cairo' },
        { name: 'Johannesburg', zone: 'Africa/Johannesburg' },
        { name: 'Nairobi', zone: 'Africa/Nairobi' },
        { name: 'Casablanca', zone: 'Africa/Casablanca' }
      ]
    },
    {
      name: 'Asia',
      zones: [
        { name: 'Riyadh', zone: 'Asia/Riyadh' },
        { name: 'Dubai', zone: 'Asia/Dubai' },
        { name: 'Karachi', zone: 'Asia/Karachi' },
        { name: 'Mumbai/Kolkata', zone: 'Asia/Kolkata' },
        { name: 'Dhaka', zone: 'Asia/Dhaka' },
        { name: 'Bangkok', zone: 'Asia/Bangkok' },
        { name: 'Jakarta', zone: 'Asia/Jakarta' },
        { name: 'Singapore', zone: 'Asia/Singapore' },
        { name: 'Hong Kong', zone: 'Asia/Hong_Kong' },
        { name: 'Shanghai', zone: 'Asia/Shanghai' },
        { name: 'Taipei', zone: 'Asia/Taipei' },
        { name: 'Tokyo', zone: 'Asia/Tokyo' },
        { name: 'Seoul', zone: 'Asia/Seoul' },
        { name: 'Tehran', zone: 'Asia/Tehran' },
        { name: 'Baku', zone: 'Asia/Baku' },
        { name: 'Tashkent', zone: 'Asia/Tashkent' },
        { name: 'Almaty', zone: 'Asia/Almaty' },
        { name: 'Yangon', zone: 'Asia/Yangon' },
        { name: 'Ho Chi Minh', zone: 'Asia/Ho_Chi_Minh' },
        { name: 'Manila', zone: 'Asia/Manila' },
        { name: 'Kuala Lumpur', zone: 'Asia/Kuala_Lumpur' }
      ]
    },
    {
      name: 'Oceania',
      zones: [
        { name: 'Perth', zone: 'Australia/Perth' },
        { name: 'Adelaide', zone: 'Australia/Adelaide' },
        { name: 'Sydney', zone: 'Australia/Sydney' },
        { name: 'Brisbane', zone: 'Australia/Brisbane' },
        { name: 'Auckland', zone: 'Pacific/Auckland' },
        { name: 'Fiji', zone: 'Pacific/Fiji' },
        { name: 'Darwin', zone: 'Australia/Darwin' },
        { name: 'Melbourne', zone: 'Australia/Melbourne' },
        { name: 'Hobart', zone: 'Australia/Hobart' },
        { name: 'Port Moresby', zone: 'Pacific/Port_Moresby' }
      ]
    }
  ];

  const allZones = timezoneGroups.flatMap(g => g.zones);
  const selectedZoneObj = allZones.find(z => z.zone === selectedTimezone);

  const tzButtonLabel = isAuto 
    ? `Automatic detection (${autoTz})` 
    : `${selectedZoneObj ? selectedZoneObj.name : selectedTimezone} (${activeDetails.offset})`;

  window.toggleTimezoneDropdown = function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const menu = document.getElementById('tz-dropdown-menu');
    const chevron = document.getElementById('tz-dropdown-chevron');
    if (menu) {
      const isHidden = menu.classList.contains('hidden');
      if (isHidden) {
        menu.classList.remove('hidden');
        if (chevron) chevron.classList.add('rotate-180');
        const input = document.getElementById('tz-search-input');
        if (input) {
          input.value = '';
          if (window.filterTimezones) window.filterTimezones('');
          setTimeout(() => input.focus(), 60);
        }
        const list = document.getElementById('tz-zones-list');
        if (list) list.scrollTop = 0;
      } else {
        menu.classList.add('hidden');
        if (chevron) chevron.classList.remove('rotate-180');
      }
    }
  };

  window.filterTimezones = function(query) {
    const q = (query || '').toLowerCase().trim();
    const groups = document.querySelectorAll('.tz-group');
    const autoBtn = document.getElementById('tz-autodetect-btn');
    const noResults = document.getElementById('tz-no-results');
    const clearBtn = document.getElementById('tz-search-clear');
    
    if (clearBtn) {
      if (q) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }

    let anyVisible = false;

    if (autoBtn) {
      if (!q || 'auto-detect match my device'.includes(q) || autoTz.toLowerCase().includes(q)) {
        autoBtn.style.display = 'flex';
        anyVisible = true;
      } else {
        autoBtn.style.display = 'none';
      }
    }

    groups.forEach(group => {
      let groupHasVisible = false;
      const region = (group.dataset.region || '').toLowerCase();
      const items = group.querySelectorAll('.tz-item');
      items.forEach(item => {
        const name = (item.dataset.name || '').toLowerCase();
        const zone = (item.dataset.zone || '').toLowerCase();
        if (!q || name.includes(q) || zone.includes(q) || region.includes(q)) {
          item.style.display = 'flex';
          groupHasVisible = true;
          anyVisible = true;
        } else {
          item.style.display = 'none';
        }
      });
      group.style.display = groupHasVisible ? 'block' : 'none';
    });

    if (noResults) {
      noResults.style.display = anyVisible ? 'none' : 'block';
    }
  };

  window.selectTimezone = function(zoneId, name) {
    if (zoneId === 'auto') {
      localStorage.removeItem('orbit_timezone');
      if (typeof Toast !== 'undefined' && Toast.success) {
        Toast.success('Timezone set to Auto-detect');
      }
    } else {
      localStorage.setItem('orbit_timezone', zoneId);
      if (typeof Toast !== 'undefined' && Toast.success) {
        Toast.success(`Timezone updated to ${name}`);
      }
    }
    const app = document.getElementById('app');
    if (app && Pages.UserSettings) {
      Pages.UserSettings(app);
    }
  };

  if (!window._tzClickListenerAttached) {
    window._tzClickListenerAttached = true;
    document.addEventListener('click', function(e) {
      const menu = document.getElementById('tz-dropdown-menu');
      const btn = document.getElementById('tz-dropdown-btn');
      if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.add('hidden');
        const chevron = document.getElementById('tz-dropdown-chevron');
        if (chevron) chevron.classList.remove('rotate-180');
      }
    });
  }

  // Available languages
  const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
    { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
    { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
    { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' }
  ];

  const currentLang = localStorage.getItem('orbit_lang') || 'en';

  window.selectLanguage = function(code, name) {
    localStorage.setItem('orbit_lang', code);
    if (typeof Toast !== 'undefined' && Toast.success) {
      Toast.success(`Language updated to ${name}`);
    }
    const app = document.getElementById('app');
    if (app && Pages.UserSettings) {
      Pages.UserSettings(app);
    }
  };

  container.innerHTML = `
    <div class="min-h-screen bg-neutral-950 text-neutral-100">
      <!-- Sticky Settings Header -->
      <header class="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800">
        <div class="flex items-center justify-between h-14 px-4 lg:px-8 max-w-3xl mx-auto">
          <div class="flex items-center gap-3">
            <a class="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer" aria-label="Go back" href="/dashboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left w-5 h-5"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
            </a>
            <h1 class="text-base font-semibold text-white">Settings</h1>
          </div>
        </div>
      </header>

      <!-- Settings Content Container -->
      <div class="max-w-3xl mx-auto px-4 lg:px-8 py-8 space-y-10">
        
        <!-- Profile Section -->
        <section>
          <h3 class="text-[11px] uppercase tracking-widest text-neutral-400 font-medium mb-5">Profile</h3>
          <div class="border border-neutral-800 bg-neutral-900/30 rounded-xl p-6 lg:p-8">
            <div class="flex items-center gap-5">
              <img src="${userAvatar}" alt="${escapeHtml(userName)}" class="w-[72px] h-[72px] rounded-2xl border border-neutral-800 object-cover">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap">
                  <h2 class="text-xl font-bold text-white truncate">${escapeHtml(userName)}</h2>
                </div>
                <p class="text-neutral-400 text-sm mt-1">${memberDate}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Connected Account Section -->
        <section>
          <h3 class="text-[11px] uppercase tracking-widest text-neutral-400 font-medium mb-5">Connected Account</h3>
          <div class="border border-neutral-800 bg-neutral-900/30 rounded-xl p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 min-w-0 flex-1">
                <div class="w-10 h-10 bg-[#5865F2] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-white truncate">${escapeHtml(userName)}</p>
                  <p class="text-xs text-neutral-400 mt-0.5">Discord Account (ID: ${escapeHtml(userDiscordId)})</p>
                </div>
              </div>
              <span class="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-full flex items-center gap-1.5 flex-shrink-0 ml-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-3 h-3"><path d="M20 6 9 17l-5-5"></path></svg> Connected
              </span>
            </div>
          </div>
        </section>

        <!-- Language and Region Section -->
        <section>
          <h3 class="text-[11px] uppercase tracking-widest text-neutral-400 font-medium mb-5">Language & Region</h3>
          <div class="space-y-5">
            <div>
              <p class="text-xs text-neutral-400 mb-3">Select your display language. Your region is detected automatically by your browser.</p>
              <div class="space-y-2">
                ${languages.map(lang => {
                  const isSelected = currentLang === lang.code;
                  return `
                    <button 
                      type="button" 
                      onclick="selectLanguage('${lang.code}', '${lang.name}')" 
                      class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                        isSelected 
                          ? 'bg-white/5 border-white/20 text-white' 
                          : 'bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                      } cursor-pointer"
                    >
                      <span class="text-lg">${lang.flag}</span>
                      <div class="flex-1">
                        <span class="text-sm font-medium">${lang.name}</span>
                        ${lang.native !== lang.name ? `<span class="text-xs ${isSelected ? 'text-neutral-400' : 'text-neutral-500'} ml-2">${lang.native}</span>` : ''}
                      </div>
                      ${isSelected ? `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-4 h-4 text-green-400"><path d="M20 6 9 17l-5-5"></path></svg>
                      ` : ''}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Timezone Card -->
            <div>
              <p class="text-xs text-neutral-400 mb-3">Timezone – automatically detected by your browser, or select one to override.</p>
              <div class="relative border border-neutral-800 rounded-xl overflow-visible bg-neutral-900/30">
                <div class="flex items-center justify-between px-5 py-4 bg-neutral-900/60 border-b border-neutral-800">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe w-4 h-4 text-neutral-400"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-white tabular-nums">${activeDetails.time} <span class="text-neutral-400 font-normal">${activeDetails.offset}</span></p>
                      <p class="text-[11px] text-neutral-400 mt-0.5">${activeTimezone}<span class="ml-1.5 text-neutral-500">· ${isAuto ? 'Automatically detected' : 'Selected'}</span></p>
                    </div>
                  </div>
                </div>
                <div class="p-5 space-y-3">
                  <div class="relative">
                    <button id="tz-dropdown-btn" type="button" onclick="toggleTimezoneDropdown(event)" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-left text-white hover:border-neutral-700 transition-colors cursor-pointer">
                      <span class="flex items-center gap-2 min-w-0 truncate">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-3.5 h-3.5 text-neutral-400 flex-shrink-0"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                        <span class="truncate">${tzButtonLabel}</span>
                      </span>
                      <svg id="tz-dropdown-chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
                    </button>

                    <!-- Timezone Dropdown Menu -->
                    <div id="tz-dropdown-menu" class="hidden absolute left-0 right-0 top-full mt-2 z-50">
                      <div class="bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                        <!-- Search Bar -->
                        <div class="p-2.5 border-b border-neutral-800 bg-neutral-950">
                          <div class="relative flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                            <input 
                              id="tz-search-input" 
                              type="text" 
                              placeholder="Search city or zone…" 
                              autocomplete="off" 
                              spellcheck="false" 
                              class="w-full h-9 pl-9 pr-8 bg-neutral-900 border border-neutral-800 focus:border-neutral-600 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors" 
                              value="" 
                              oninput="window.filterTimezones ? window.filterTimezones(this.value) : null" 
                              onclick="event.stopPropagation()" 
                              onkeydown="if(event.key==='Escape'){toggleTimezoneDropdown(event);}"
                            >
                            <button 
                              id="tz-search-clear" 
                              type="button" 
                              onclick="event.stopPropagation(); document.getElementById('tz-search-input').value=''; window.filterTimezones(''); this.classList.add('hidden');" 
                              class="hidden absolute right-2.5 text-neutral-500 hover:text-white p-1 cursor-pointer"
                            >
                              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                            </button>
                          </div>
                        </div>

                        <!-- Auto Detect Button -->
                        <button id="tz-autodetect-btn" type="button" onclick="selectTimezone('auto', 'Auto-detect')" class="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-neutral-800/60 ${isAuto ? 'bg-emerald-500/[0.06] hover:bg-emerald-500/[0.08]' : 'hover:bg-neutral-900 text-neutral-300'} cursor-pointer">
                          <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-500/15 text-emerald-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-3.5 h-3.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-[13px] font-medium text-white">Auto-detect</p>
                            <p class="text-[11px] text-neutral-500 truncate">Match my device · ${autoTz} · ${autoDetails.time}</p>
                          </div>
                          ${isAuto ? `
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-4 h-4 text-emerald-400 flex-shrink-0"><path d="M20 6 9 17l-5-5"></path></svg>
                          ` : ''}
                        </button>

                        <!-- Zones Scrollable List -->
                        <div id="tz-zones-list" class="overflow-y-auto max-h-[300px] sm:max-h-[340px] divide-y divide-neutral-900/50 overscroll-contain" style="scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent;">
                          ${timezoneGroups.map(group => `
                            <div class="tz-group" data-region="${group.name.toLowerCase()}">
                              <div class="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-sm px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 border-y border-neutral-800/80">
                                ${group.name}
                              </div>
                              ${group.zones.map(z => {
                                const isSelected = !isAuto && selectedTimezone === z.zone;
                                const details = getTimezoneDetails(z.zone);
                                return `
                                  <button 
                                    type="button" 
                                    onclick="selectTimezone('${z.zone}', '${z.name}')" 
                                    class="tz-item w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer ${
                                      isSelected 
                                        ? 'bg-emerald-500/[0.06] text-white font-medium' 
                                        : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                                    }" 
                                    data-name="${z.name.toLowerCase()}" 
                                    data-zone="${z.zone.toLowerCase()}"
                                  >
                                    <div class="flex-1 min-w-0">
                                      <p class="text-[13px] truncate">${z.name}</p>
                                      <p class="text-[10.5px] text-neutral-500 tabular-nums">${details.offset}<span class="ml-1.5 text-neutral-400">· ${details.time}</span></p>
                                    </div>
                                    ${isSelected ? `
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-4 h-4 text-emerald-400 flex-shrink-0"><path d="M20 6 9 17l-5-5"></path></svg>
                                    ` : ''}
                                  </button>
                                `;
                              }).join('')}
                            </div>
                          `).join('')}
                          <div id="tz-no-results" class="hidden p-8 text-center text-xs text-neutral-500">
                            No matching timezones found
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p class="text-[11px] text-neutral-500">All dates and times across the dashboard are displayed in this timezone.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- Security Section -->
        <section>
          <h3 class="text-[11px] uppercase tracking-widest text-neutral-400 font-medium mb-5">Security</h3>
          <div class="border border-neutral-800 bg-neutral-900/30 rounded-xl divide-y divide-neutral-800">
            <div class="flex items-center justify-between p-5">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-monitor w-4 h-4 text-neutral-400"><rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-white flex items-center gap-2">Chrome on Windows<span class="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-medium rounded-md">Current</span></p>
                  <p class="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin w-3 h-3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg> Current location · Active now
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sign out Card -->
          <div class="mt-4 border border-red-500/20 bg-red-500/5 rounded-xl">
            <div class="flex items-center justify-between p-5">
              <div>
                <p class="text-sm font-medium text-white">Sign out</p>
                <p class="text-xs text-neutral-400 mt-0.5">End your current session</p>
              </div>
              <button onclick="API.logout()" class="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-medium transition-colors cursor-pointer">
                Sign out
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  `;
};

// ==========================================
// TERMS & PRIVACY (Implemented in legal.js)
// ==========================================
// Handled comprehensively in /js/pages/legal.js

