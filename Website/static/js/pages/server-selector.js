/**
 * Orbit Server Selector Page (/dashboard)
 * Matches Gipfel/PeakBot dashboard layout exactly.
 */

Pages.ServerSelector = async function(container) {
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const user = await API.getUser();

  if (!user) {
    if (window.Router) {
      window.Router.replace('/');
    } else {
      window.location.href = '/';
    }
    return;
  }

  const userAvatar = user.avatar 
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64` 
    : '/img/logo.png';
  const userName = user.global_name || user.username || 'User';

  container.innerHTML = `
    <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <!-- Header matching Gipfel/PeakBot layout -->
      <header class="sticky top-0 z-20 h-16 bg-neutral-900/90 backdrop-blur-sm border-b border-neutral-800">
        <div class="flex items-center justify-between h-full px-4 lg:px-8">
          <div class="flex items-center gap-2 sm:gap-4">
            <a class="p-1.5 rounded-xl hover:bg-neutral-800 transition-colors group" title="Back to Home" href="/">
              <img src="/img/logo.png" alt="Orbit" width="28" height="28" class="rounded-xl group-hover:shadow-lg transition-shadow sm:w-8 sm:h-8">
            </a>
            <div class="w-px h-8 bg-neutral-700 hidden sm:block"></div>
            <h1 class="text-sm sm:text-[15px] font-semibold text-white truncate max-w-[100px] sm:max-w-none">Dashboard</h1>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-3">
            <!-- Notifications with popup dropdown -->
            <div class="relative">
              <button id="notif-btn" class="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer" aria-label="Notifications" aria-expanded="false">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell w-5 h-5"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
              </button>

              <!-- Notification UI matching PeakBot -->
              <div id="notif-dropdown" class="hidden absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[384px] max-w-[384px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div class="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
                  <h2 class="text-sm font-semibold text-white">Notifications</h2>
                  <button disabled="" class="ml-auto flex items-center gap-1 text-[12px] text-cyan-400 hover:text-cyan-300 disabled:text-neutral-600 disabled:cursor-default transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-check w-3.5 h-3.5"><path d="M18 6 7 17l-5-5"></path><path d="m22 10-7.5 7.5L13 16"></path></svg> Clear all
                  </button>
                </div>
                <div class="max-h-[60vh] sm:max-h-[460px] overflow-y-auto">
                  <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div class="w-11 h-11 rounded-2xl bg-neutral-800 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-inbox w-5 h-5 text-neutral-500"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                    </div>
                    <p class="text-sm font-medium text-neutral-300">You're all caught up</p>
                    <p class="text-xs text-neutral-500 mt-1">Milestones, recaps and alerts will show up here.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- User Menu with dropdown toggle -->
            <div class="relative">
              <button id="user-menu-btn" class="flex items-center gap-1.5 sm:gap-3 p-1 sm:p-1.5 pr-1.5 sm:pr-3 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer" aria-label="User menu" aria-expanded="false">
                <img src="${userAvatar}" alt="${escapeHtml(userName)}" class="w-8 h-8 rounded-xl ring-2 ring-neutral-700 object-cover">
                <div class="hidden sm:block text-left">
                  <p class="text-sm font-medium text-white">${escapeHtml(userName)}</p>
                  <p class="text-[10px] text-neutral-500">Member</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              
              <!-- User Dropdown Menu matching PeakBot -->
              <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2 w-56 py-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-[60]">
                <div class="px-4 py-3 border-b border-neutral-800">
                  <p class="text-sm font-semibold text-white truncate">${escapeHtml(userName)}</p>
                  <p class="text-xs text-neutral-500 truncate">ID: ${user.id}</p>
                </div>
                <div class="py-1">
                  <a class="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors" href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home w-4 h-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Home
                  </a>
                  <a class="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors" href="/dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-server w-4 h-4"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect><rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect><line x1="6" x2="6.01" y1="6" y2="6"></line><line x1="6" x2="6.01" y1="18" y2="18"></line></svg> My Servers
                  </a>
                  <a class="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors" href="/settings">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings w-4 h-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg> Settings
                  </a>
                </div>
                <div class="border-t border-neutral-800 pt-1 mt-1">
                  <button onclick="API.logout()" class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg> Sign out
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="min-h-[calc(100vh-64px)] bg-neutral-950">
        <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <!-- Top Row: Title + Refresh Button -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 class="text-2xl font-bold text-white tracking-tight">Your Servers</h1>
              <p id="server-count-label" class="text-xs text-neutral-500 mt-1">Loading servers...</p>
            </div>
            <button id="refresh-guilds-btn" onclick="loadGuildsList(true)" class="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all disabled:opacity-50 cursor-pointer">
              <svg id="refresh-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-3.5 h-3.5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
              <span>Refresh</span>
            </button>
          </div>

          <!-- Search Input -->
          <div class="orbit-searchbar-pill flex items-center gap-3 px-4 h-11 rounded-xl bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700/80 focus-within:border-neutral-600 focus-within:ring-1 focus-within:ring-white/10 transition-all w-full mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search orbit-searchbar-icon text-neutral-400 shrink-0"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <input id="guild-search-input" oninput="window.filterGuilds ? window.filterGuilds() : null" placeholder="Search servers..." class="orbit-searchbar-input w-full bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none" type="text" value="">
          </div>

          <!-- Guilds Sections Container -->
          <div id="guilds-content">
            <div class="flex items-center justify-center p-12 text-neutral-500 text-sm">
              <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Loading your servers...
            </div>
          </div>

        </div>
      </main>
    </div>
  `;

  // Toggle user menu & notifications
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown-menu');
  const notifBtn = document.getElementById('notif-btn');
  const notifDropdown = document.getElementById('notif-dropdown');

  if (userMenuBtn && userDropdown) {
    userMenuBtn.onclick = (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
      if (notifDropdown) notifDropdown.classList.add('hidden');
    };
  }

  if (notifBtn && notifDropdown) {
    notifBtn.onclick = (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
      if (userDropdown) userDropdown.classList.add('hidden');
    };
  }

  document.addEventListener('click', () => {
    if (userDropdown) userDropdown.classList.add('hidden');
    if (notifDropdown) notifDropdown.classList.add('hidden');
  });

  let allGuilds = [];

  window.loadGuildsList = async (force = false) => {
    const content = document.getElementById('guilds-content');
    const refreshBtn = document.getElementById('refresh-guilds-btn');
    const refreshSpinner = document.getElementById('refresh-spinner');
    if (refreshBtn) refreshBtn.disabled = true;
    if (refreshSpinner) refreshSpinner.classList.add('animate-spin');

    try {
      const data = await API.getGuilds(force);
      allGuilds = Array.isArray(data) ? data : (data?.guilds || []);
      renderGuildSections();
    } catch (err) {
      if (content) {
        content.innerHTML = `
          <div class="p-8 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-center">
            Failed to load servers. Please sign in again.
          </div>
        `;
      }
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
      if (refreshSpinner) refreshSpinner.classList.remove('animate-spin');
    }
  };

  const renderGuildSections = () => {
    const content = document.getElementById('guilds-content');
    const countLabel = document.getElementById('server-count-label');
    if (!content) return;

    const query = (document.getElementById('guild-search-input')?.value || '').toLowerCase().trim();
    const filtered = allGuilds.filter(g => (g.name || '').toLowerCase().includes(query));

    // Active servers where bot is present
    const activeGuilds = filtered.filter(g => Boolean(g.bot_in_server || g.has_bot));
    // Inactive servers where bot is not present
    const inactiveGuilds = filtered.filter(g => !Boolean(g.bot_in_server || g.has_bot));

    if (countLabel) {
      countLabel.textContent = `${activeGuilds.length} ${activeGuilds.length === 1 ? 'server active' : 'servers active'}`;
    }

    if (filtered.length === 0) {
      content.innerHTML = `
        <div class="text-center py-16 text-neutral-500">
          <p class="text-sm">No servers found for "${escapeHtml(query)}".</p>
        </div>
      `;
      return;
    }

    let html = '<div class="space-y-6">';

    // 1. Active Servers (where bot is present)
    if (activeGuilds.length > 0) {
      html += `
        <div>
          <div class="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crown w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>
            <span class="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Owner</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${activeGuilds.map(g => renderActiveGuildCard(g)).join('')}
          </div>
        </div>
      `;
    }

    // 2. Inactive Servers (where bot is not present)
    if (inactiveGuilds.length > 0) {
      html += `
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="flex-1 h-px bg-neutral-200 dark:bg-neutral-800"></div>
            <span class="text-xs font-medium text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3 h-3"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>Not Added Yet
            </span>
            <div class="flex-1 h-px bg-neutral-200 dark:bg-neutral-800"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${inactiveGuilds.map(g => renderInactiveGuildCard(g)).join('')}
          </div>
        </div>
      `;
    }

    html += '</div>';
    content.innerHTML = html;
  };

  window.filterGuilds = renderGuildSections;
  const guildSearchInput = document.getElementById('guild-search-input');
  if (guildSearchInput) {
    guildSearchInput.oninput = () => renderGuildSections();
  }

  const getGuildInitials = (name) => {
    const words = (name || '').trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return (name || 'S').slice(0, 2).toUpperCase();
  };

  const renderActiveGuildCard = (g) => {
    const isOwner = Boolean(g.owner);
    const initials = getGuildInitials(g.name);
    let iconUrl = null;
    if (g.icon) {
      const ext = g.icon.startsWith('a_') ? 'gif' : 'png';
      iconUrl = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${ext}?size=128`;
    }

    return `
      <a class="group relative bg-white dark:bg-neutral-900 border rounded-2xl p-5 transition-all duration-200 hover:shadow-lg overflow-hidden border-neutral-200 dark:border-neutral-800 hover:border-neutral-400/30 dark:hover:border-white/30 cursor-pointer block select-none" href="/dashboard/${g.id}">
        <div class="absolute inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <div class="relative flex items-center gap-4">
          <div class="relative flex-shrink-0">
            ${iconUrl 
              ? `<img src="${iconUrl}" alt="${escapeHtml(g.name)}" class="w-14 h-14 rounded-xl group-hover:scale-105 transition-transform duration-300 ring-2 ring-neutral-200 dark:ring-neutral-800 group-hover:ring-neutral-400/30 dark:group-hover:ring-white/30 object-cover">`
              : `<div class="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors ring-2 ring-neutral-200 dark:ring-neutral-800 group-hover:ring-neutral-400/30 dark:group-hover:ring-white/30"><span class="text-lg font-bold text-black dark:text-white">${escapeHtml(initials)}</span></div>`
            }
            <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center shadow-lg shadow-green-500/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-2.5 h-2.5 text-white"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <h3 class="font-semibold text-black dark:text-white text-base truncate group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">${escapeHtml(g.name)}</h3>
              <button type="button" class="flex-shrink-0 w-10 h-10 -m-2 flex items-center justify-center rounded-md transition-all duration-200 opacity-60 sm:opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 text-neutral-500 hover:text-white" title="Pin server" onclick="event.preventDefault(); event.stopPropagation();">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin w-3 h-3"><line x1="12" x2="12" y1="17" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
              </button>
            </div>
            <div class="flex items-center gap-3 mt-1">
              <div class="flex items-center gap-1 text-sm text-green-500">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span><span>Active</span>
              </div>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-full">Free</span>
              ${isOwner ? `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-500 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crown w-3 h-3"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>Owner
                </span>
              ` : `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-full">Admin</span>
              `}
            </div>
          </div>
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center w-10 h-10 bg-neutral-50 dark:bg-neutral-950 group-hover:bg-neutral-800 dark:group-hover:bg-white text-neutral-500 dark:text-neutral-400 group-hover:text-white dark:group-hover:text-black rounded-xl transition-all duration-200 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-5 h-5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </div>
          </div>
        </div>
      </a>
    `;
  };

  const renderInactiveGuildCard = (g) => {
    const isOwner = Boolean(g.owner);
    const initials = getGuildInitials(g.name);
    let iconUrl = null;
    if (g.icon) {
      const ext = g.icon.startsWith('a_') ? 'gif' : 'png';
      iconUrl = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${ext}?size=128`;
    }
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}`;

    return `
      <a href="${inviteUrl}" target="_blank" class="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400/30 dark:hover:border-white/30 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg overflow-hidden text-left w-full cursor-pointer block">
        <div class="absolute inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <div class="relative flex items-center gap-4">
          <div class="relative flex-shrink-0">
            ${iconUrl 
              ? `<img src="${iconUrl}" alt="${escapeHtml(g.name)}" class="w-14 h-14 rounded-xl grayscale group-hover:grayscale-0 transition-all duration-200 group-hover:scale-105 object-cover">`
              : `<div class="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors"><span class="text-lg font-semibold text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">${escapeHtml(initials)}</span></div>`
            }
            <div class="absolute -inset-1 border-2 border-dashed border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400/30 dark:group-hover:border-white/30 rounded-xl transition-colors"></div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-black dark:text-white text-base truncate group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">${escapeHtml(g.name)}</h3>
            <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-0.5">Bot not installed</p>
            <div class="flex items-center gap-2 mt-2">
              ${isOwner ? `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-500 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crown w-3 h-3"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>Owner
                </span>
              ` : `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-full">Admin</span>
              `}
            </div>
          </div>
          <div class="flex-shrink-0">
            <div class="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-800 dark:group-hover:bg-white text-black dark:text-white group-hover:text-white dark:group-hover:text-black text-sm font-medium rounded-xl transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-4 h-4"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
              <span class="hidden sm:inline">Add Bot</span>
            </div>
          </div>
        </div>
      </a>
    `;
  };

  document.getElementById('guild-search-input')?.addEventListener('input', renderGuildSections);
  loadGuildsList();
};
