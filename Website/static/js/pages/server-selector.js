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
    container.innerHTML = `
      <div class="flex items-center justify-center min-h-[85vh] p-4 bg-neutral-950">
        <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-fade-in">
          <div class="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-6 text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2 class="text-xl font-bold text-white mb-2">Anmeldung erforderlich</h2>
          <p class="text-neutral-400 text-sm mb-6 leading-relaxed">Melden Sie sich mit Discord an, um Ihre Server zu verwalten.</p>
          <button 
            type="button" 
            onclick="API.login('/dashboard').then(() => Router.checkAuth().then(() => Router.handleRoute()))" 
            class="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-sm transition-all shadow-lg shadow-[#5865F2]/20 active:scale-95 cursor-pointer"
          >
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            Mit Discord anmelden
          </button>
        </div>
      </div>
    `;
    return;
  }

  const userAvatar = user.avatar 
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64` 
    : '/img/logo.png';
  const userName = user.global_name || user.username || 'Benutzer';

  container.innerHTML = `
    <div class="min-h-screen bg-neutral-950">
      <!-- Header matching Gipfel/PeakBot layout -->
      <header class="sticky top-0 z-20 h-16 bg-neutral-900/90 backdrop-blur-sm border-b border-neutral-800">
        <div class="flex items-center justify-between h-full px-4 lg:px-8">
          <div class="flex items-center gap-2 sm:gap-4">
            <a class="p-1.5 rounded-xl hover:bg-neutral-800 transition-colors group" title="Zurück nach Hause" href="/">
              <img src="/img/logo.png" alt="Orbit" width="28" height="28" class="rounded-xl group-hover:shadow-lg transition-shadow sm:w-8 sm:h-8">
            </a>
            <div class="w-px h-8 bg-neutral-700 hidden sm:block"></div>
            <h1 class="text-sm sm:text-[15px] font-semibold text-white truncate max-w-[100px] sm:max-w-none">Armaturenbrett</h1>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-3">
            <div class="relative">
              <button class="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors" aria-label="Benachrichtigungen" aria-expanded="false">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell w-5 h-5"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
              </button>
            </div>
            
            <!-- User Menu with dropdown toggle -->
            <div class="relative">
              <button id="user-menu-btn" class="flex items-center gap-1.5 sm:gap-3 p-1 sm:p-1.5 pr-1.5 sm:pr-3 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer" aria-label="Benutzermenü" aria-expanded="false">
                <img src="${userAvatar}" alt="${escapeHtml(userName)}" class="w-8 h-8 rounded-xl ring-2 ring-neutral-700 object-cover">
                <div class="hidden sm:block text-left">
                  <p class="text-sm font-medium text-white">${escapeHtml(userName)}</p>
                  <p class="text-[10px] text-neutral-500">Mitglied</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              
              <!-- User Dropdown Menu -->
              <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2 w-48 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-1.5 z-30">
                <a href="/" class="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  Zurück nach Hause
                </a>
                <button onclick="API.logout()" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-colors text-left cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                  Abmelden
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="min-h-[calc(100vh-80px)] bg-neutral-50 dark:bg-neutral-950">
        <div class="max-w-6xl mx-auto px-4 py-8">
          
          <!-- Top Row: Title + Refresh Button -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 class="text-2xl font-bold text-black dark:text-white">Ihre Server</h1>
              <p id="server-count-label" class="text-sm text-neutral-400 dark:text-neutral-500 mt-1">0 aktive Server</p>
            </div>
            <button id="refresh-guilds-btn" onclick="loadGuildsList(true)" class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-lg transition-all disabled:opacity-50 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-4 h-4"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
              Aktualisieren
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <input id="guild-search-input" placeholder="Suchserver..." class="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-white transition-all text-sm" type="text" value="">
          </div>

          <!-- Add Bot Banner -->
          <div class="mb-8 rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 p-6 sm:p-8 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-purple-500/[0.03]"></div>
            <div class="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div class="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-7 h-7 text-white"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-semibold text-white mb-1">Orbit zu einem Server hinzufügen</h2>
                <p class="text-sm text-neutral-400">Wählen Sie unten einen Server aus, um Orbit hinzuzufügen und Moderation, Leveling, Tickets und mehr freizuschalten.</p>
              </div>
              <a href="https://discord.com/oauth2/authorize?client_id=1411032158406541353&permissions=8&scope=bot%20applications.commands" target="_blank" class="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-neutral-200 text-black text-sm font-semibold rounded-xl transition-colors shrink-0 cursor-pointer">
                Zum Server hinzufügen
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-4 h-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
            </div>
          </div>

          <!-- Guilds Grid Container -->
          <div class="space-y-6">
            <div>
              <div id="guilds-content">
                <div class="flex items-center justify-center p-12 text-neutral-500 text-sm">
                  <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Lade Ihre Server...
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;

  // Toggle user menu
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown-menu');
  if (userMenuBtn && userDropdown) {
    userMenuBtn.onclick = (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    };
    document.addEventListener('click', () => userDropdown.classList.add('hidden'));
  }

  let allGuilds = [];

  window.loadGuildsList = async (force = false) => {
    const content = document.getElementById('guilds-content');
    const refreshBtn = document.getElementById('refresh-guilds-btn');
    const countLabel = document.getElementById('server-count-label');
    if (refreshBtn) refreshBtn.classList.add('opacity-50');

    try {
      const data = await API.getGuilds(force);
      allGuilds = Array.isArray(data) ? data : (data?.guilds || []);
      if (countLabel) {
        countLabel.textContent = `${allGuilds.length} aktive Server`;
      }
      renderGuildCards();
    } catch (err) {
      if (content) {
        content.innerHTML = `
          <div class="p-8 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-center">
            Fehler beim Laden der Server. Bitte melden Sie sich erneut an.
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

    const filtered = allGuilds.filter(g => (g.name || '').toLowerCase().includes(query));

    if (filtered.length === 0) {
      content.innerHTML = `
        <div class="text-center py-16 text-neutral-500">
          <p class="text-sm">Keine Server gefunden für "${escapeHtml(query)}".</p>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${filtered.map(g => renderGuildCard(g)).join('')}
      </div>
    `;
  };

  const renderGuildCard = (g) => {
    const isOwner = Boolean(g.owner);
    const hasBot = Boolean(g.has_bot);
    
    // Build icon URL (GIF or PNG)
    let iconUrl = null;
    if (g.icon) {
      const ext = g.icon.startsWith('a_') ? 'gif' : 'png';
      iconUrl = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${ext}?size=128`;
    }

    // Two-letter initials fallback
    const words = (g.name || '').trim().split(/\s+/);
    let initials = '';
    if (words.length >= 2) {
      initials = (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    } else {
      initials = (g.name || 'S').slice(0, 2).toUpperCase();
    }

    const manageUrl = `/dashboard/${g.id}/overview`;
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=1411032158406541353&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}`;
    const targetUrl = hasBot ? manageUrl : inviteUrl;
    const isExternal = !hasBot;

    return `
      <${isExternal ? 'a' : 'button'} 
        href="${targetUrl}" 
        ${isExternal ? 'target="_blank"' : `onclick="Router.navigate('${manageUrl}')"`}
        class="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400/30 dark:hover:border-white/30 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg overflow-hidden text-left w-full cursor-pointer block"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <div class="relative flex items-center gap-4">
          
          <!-- Server Icon -->
          <div class="relative flex-shrink-0">
            ${iconUrl ? `
              <img src="${iconUrl}" alt="${escapeHtml(g.name)}" class="w-14 h-14 rounded-xl ${hasBot ? '' : 'grayscale group-hover:grayscale-0'} transition-all duration-200 group-hover:scale-105 object-cover">
            ` : `
              <div class="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                <span class="text-lg font-semibold text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">${escapeHtml(initials)}</span>
              </div>
            `}
            <div class="absolute -inset-1 border-2 border-dashed border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400/30 dark:group-hover:border-white/30 rounded-xl transition-colors pointer-events-none"></div>
          </div>

          <!-- Server Name & Status -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-black dark:text-white text-base truncate group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">${escapeHtml(g.name)}</h3>
            <p class="text-sm ${hasBot ? 'text-emerald-400 dark:text-emerald-400 font-medium' : 'text-neutral-400 dark:text-neutral-500'} mt-0.5">
              ${hasBot ? 'Bot installiert' : 'Bot nicht installiert'}
            </p>
            <div class="flex items-center gap-2 mt-2">
              ${isOwner ? `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-500 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crown w-3 h-3"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>
                  Eigentümer
                </span>
              ` : `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-100 dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-400 rounded-full">
                  Admin
                </span>
              `}
            </div>
          </div>

          <!-- Action Button -->
          <div class="flex-shrink-0">
            <div class="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-800 dark:group-hover:bg-white text-black dark:text-white group-hover:text-white dark:group-hover:text-black text-sm font-medium rounded-xl transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-4 h-4"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
              <span class="hidden sm:inline">${hasBot ? 'Verwalten' : 'Bot hinzufügen'}</span>
            </div>
          </div>

        </div>
      </${isExternal ? 'a' : 'button'}>
    `;
  };

  document.getElementById('guild-search-input')?.addEventListener('input', renderGuildCards);
  loadGuildsList();
};
