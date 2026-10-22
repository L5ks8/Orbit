/**
 * Orbit Server Selector Page
 * Grid of Discord guilds with manage vs invite buttons and live search.
 */

Pages.ServerSelector = async function(container) {
  const user = await API.getUser();

  if (!user) {
    container.innerHTML = `
      <div class="flex items-center justify-center min-h-[85vh] p-4">
        <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-fade-in">
          <div class="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-6 text-neutral-400">
            ${icon('lock', 28)}
          </div>
          <h2 class="text-xl font-bold text-white mb-2">Login Required</h2>
          <p class="text-neutral-400 text-sm mb-6 leading-relaxed">Sign in with Discord to view and configure your servers.</p>
          <button 
            type="button" 
            onclick="API.login('/dashboard').then(() => Router.checkAuth().then(() => Router.handleRoute()))" 
            class="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            ${icon('bot', 18)} Login with Discord
          </button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-6 pt-28 pb-20 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white">Select a Server</h1>
          <p class="text-neutral-400 text-sm mt-1">Choose a Discord server to manage its Orbit modules and configuration.</p>
        </div>
        <div class="flex items-center gap-3">
          <button 
            type="button" 
            id="refresh-guilds-btn"
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
            onclick="loadGuildsList(true)"
          >
            ${icon('refresh-cw', 14)} Refresh Servers
          </button>
          <button 
            type="button" 
            onclick="API.logout()" 
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-900/50 text-neutral-400 hover:text-red-400 text-xs font-semibold transition-all"
          >
            ${icon('log-out', 14)} Logout
          </button>
        </div>
      </div>

      <!-- Search Input -->
      <div class="relative mb-8">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">${icon('search', 16)}</span>
        <input 
          type="text" 
          id="guild-search-input" 
          placeholder="Search servers by name..." 
          class="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-700 transition-colors"
        >
      </div>

      <!-- Guilds Container -->
      <div id="guilds-content">
        <div class="flex items-center justify-center p-12 text-neutral-500 text-sm">
          <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Loading your Discord servers...
        </div>
      </div>
    </div>
  `;

  let allGuilds = [];

  window.loadGuildsList = async (force = false) => {
    const content = document.getElementById('guilds-content');
    const refreshBtn = document.getElementById('refresh-guilds-btn');
    if (refreshBtn) refreshBtn.classList.add('opacity-50');

    try {
      const data = await API.getGuilds(force);
      allGuilds = Array.isArray(data) ? data : (data?.guilds || []);
      renderGuildCards();
    } catch (err) {
      if (content) {
        content.innerHTML = `
          <div class="p-8 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-center">
            Failed to load servers. Please try logging in again.
          </div>
        `;
      }
    } finally {
      if (refreshBtn) refreshBtn.classList.remove('opacity-50');
    }
  };

  const renderGuildCards = () => {
    const content = document.getElementById('guilds-content');
    if (!content) return;
    const query = (document.getElementById('guild-search-input')?.value || '').toLowerCase().trim();

    const filtered = allGuilds.filter(g => g.name.toLowerCase().includes(query));

    const activeGuilds = filtered.filter(g => g.has_bot);
    const inviteGuilds = filtered.filter(g => !g.has_bot);

    if (filtered.length === 0) {
      content.innerHTML = `
        <div class="text-center py-16 text-neutral-500">
          <p class="text-sm">No servers found matching "${query}".</p>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      ${activeGuilds.length > 0 ? `
        <div class="mb-12">
          <h2 class="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Active Servers (${activeGuilds.length})</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${activeGuilds.map(g => renderGuildCard(g, true)).join('')}
          </div>
        </div>
      ` : ''}

      ${inviteGuilds.length > 0 ? `
        <div>
          <h2 class="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Add Orbit to Server (${inviteGuilds.length})</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${inviteGuilds.map(g => renderGuildCard(g, false)).join('')}
          </div>
        </div>
      ` : ''}
    `;
  };

  const renderGuildCard = (g, hasBot) => {
    const iconUrl = g.icon 
      ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`
      : null;
    const initial = g.name.charAt(0).toUpperCase();

    if (hasBot) {
      return `
        <a 
          href="/dashboard/${g.id}/overview" 
          class="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-200 group hover:shadow-xl hover:shadow-black/50"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            ${iconUrl ? `
              <img src="${iconUrl}" class="w-12 h-12 rounded-xl object-cover shrink-0" alt="${g.name}">
            ` : `
              <div class="w-12 h-12 rounded-xl bg-neutral-800 text-white font-bold flex items-center justify-center shrink-0">
                ${initial}
              </div>
            `}
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">${g.name}</span>
              <span class="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Configured
              </span>
            </div>
          </div>
          <span class="p-2 rounded-xl text-neutral-500 group-hover:text-white group-hover:bg-neutral-800 transition-all shrink-0">
            ${icon('arrow-right', 16)}
          </span>
        </a>
      `;
    } else {
      const inviteUrl = `https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}`;
      return `
        <div class="flex items-center justify-between p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/60">
          <div class="flex items-center gap-3.5 min-w-0">
            ${iconUrl ? `
              <img src="${iconUrl}" class="w-12 h-12 rounded-xl object-cover opacity-80 shrink-0" alt="${g.name}">
            ` : `
              <div class="w-12 h-12 rounded-xl bg-neutral-800/80 text-neutral-400 font-bold flex items-center justify-center shrink-0">
                ${initial}
              </div>
            `}
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-semibold text-neutral-300 truncate">${g.name}</span>
              <span class="text-xs text-neutral-500 mt-0.5">Bot not invited</span>
            </div>
          </div>
          <a 
            href="${inviteUrl}" 
            target="_blank" 
            class="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5"
          >
            ${icon('plus', 14)} Invite
          </a>
        </div>
      `;
    }
  };

  document.getElementById('guild-search-input')?.addEventListener('input', renderGuildCards);
  loadGuildsList();
};
