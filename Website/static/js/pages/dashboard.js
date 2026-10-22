/**
 * Orbit Dashboard Page Shell
 * Collapsible Sidebar, TopNav, Server Dropdown, and Sub-Tab mounting.
 */

Pages.Dashboard = async function(container, guildId, tab = 'overview') {
  const user = await API.getUser();
  if (!user) {
    Router.navigate('/dashboard');
    return;
  }

  // Load server list to find current server
  let guilds = [];
  try {
    const gData = await API.getGuilds();
    guilds = Array.isArray(gData) ? gData : (gData?.guilds || []);
  } catch (_) {}

  const currentGuild = guilds.find(g => String(g.id) === String(guildId)) || {
    id: guildId,
    name: 'Server Dashboard',
    icon: null
  };

  const guildIconUrl = currentGuild.icon
    ? `https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.png?size=128`
    : '/img/logo.png';

  const sections = [
    {
      title: 'MAIN',
      links: [
        { name: 'Overview', id: 'overview', iconName: 'layout-dashboard' },
        { name: 'Bot Profile', id: 'bot-profile', iconName: 'user' },
        { name: 'Analytics', id: 'analytics', iconName: 'activity' }
      ]
    },
    {
      title: 'WELCOME & ONBOARDING',
      links: [
        { name: 'Welcome & Goodbye', id: 'welcomegoodbye', iconName: 'message-square' },
        { name: 'Roles', id: 'roles', iconName: 'users' },
        { name: 'Invite Tracker', id: 'invites', iconName: 'user-plus' }
      ]
    },
    {
      title: 'MODERATION',
      links: [
        { name: 'Auto-Moderation', id: 'automod', iconName: 'shield' },
        { name: 'Ban Appeals', id: 'appeals', iconName: 'shield-alert' },
        { name: 'Security', id: 'security', iconName: 'shield-check' },
        { name: 'Verification', id: 'verify', iconName: 'scan-eye' }
      ]
    },
    {
      title: 'ENGAGEMENT',
      links: [
        { name: 'Leveling System', id: 'level', iconName: 'activity' },
        { name: 'Leaderboard', id: 'leaderboard', iconName: 'bar-chart-3' },
        { name: 'Boost Messages', id: 'boost', iconName: 'zap' },
        { name: 'Server Stats', id: 'serverstats', iconName: 'bar-chart-2' }
      ]
    },
    {
      title: 'UTILITY',
      links: [
        { name: 'Support Tickets', id: 'tickets', iconName: 'ticket' },
        { name: 'Automation', id: 'automation', iconName: 'zap' },
        { name: 'Auto Responder', id: 'autoresponder', iconName: 'message-square' },
        { name: 'Embed Builder', id: 'embed-builder', iconName: 'palette' },
        { name: 'Temp Voice', id: 'tempvoice', iconName: 'volume-2' }
      ]
    },
    {
      title: 'SYSTEM',
      links: [
        { name: 'Settings', id: 'settings', iconName: 'settings' }
      ]
    }
  ];

  container.innerHTML = `
    <div class="flex h-screen w-screen overflow-hidden bg-neutral-950 font-sans">
      <!-- Sidebar -->
      <aside id="dash-sidebar" class="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0 z-30 transition-transform duration-200 ease-in-out md:translate-x-0 -translate-x-full fixed md:relative h-full">
        <!-- Server Switcher Header -->
        <div class="p-4 border-b border-neutral-800">
          <a href="/dashboard" class="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 transition-all group">
            <img src="${guildIconUrl}" class="w-9 h-9 rounded-lg object-cover shrink-0" alt="${currentGuild.name}">
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-xs font-semibold text-white truncate">${currentGuild.name}</span>
              <span class="text-[10px] text-neutral-400 group-hover:text-neutral-300 transition-colors flex items-center gap-1">
                Switch Server ${icon('chevron-down', 10)}
              </span>
            </div>
          </a>
        </div>

        <!-- Navigation Links -->
        <div class="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6 custom-scrollbar">
          ${sections.map(sec => `
            <div>
              <div class="px-3 text-[10px] font-bold tracking-wider text-neutral-500 uppercase mb-2">${sec.title}</div>
              <div class="flex flex-col gap-0.5">
                ${sec.links.map(l => {
                  const isActive = tab === l.id;
                  return `
                    <a 
                      href="/dashboard/${guildId}/${l.id}" 
                      class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive 
                          ? 'bg-neutral-800 text-white font-semibold shadow-sm' 
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                      }"
                    >
                      <span class="${isActive ? 'text-indigo-400' : 'text-neutral-500'} shrink-0">${icon(l.iconName, 16)}</span>
                      <span class="truncate">${l.name}</span>
                    </a>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- User Footer -->
        <div class="p-3 border-t border-neutral-800 flex items-center justify-between">
          <div class="flex items-center gap-2.5 min-w-0">
            <img src="${user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64` : '/img/logo.png'}" class="w-8 h-8 rounded-full shrink-0" alt="${user.username}">
            <span class="text-xs font-semibold text-white truncate">${user.username}</span>
          </div>
          <button type="button" onclick="API.logout()" class="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors" title="Logout">
            ${icon('log-out', 16)}
          </button>
        </div>
      </aside>

      <!-- Main Dash Content Area -->
      <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <!-- TopNav -->
        <header class="h-14 bg-neutral-900 border-b border-neutral-800 px-6 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <button type="button" class="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800" onclick="toggleSidebar()">
              ${icon('sliders', 18)}
            </button>
            <div class="flex items-center gap-2 text-xs text-neutral-400">
              <a href="/dashboard" class="hover:text-white transition-colors">Servers</a>
              <span>/</span>
              <span class="text-white font-medium truncate max-w-[200px]">${currentGuild.name}</span>
              <span>/</span>
              <span class="text-indigo-400 capitalize">${tab.replace('-', ' ')}</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <a href="/docs" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors">
              ${icon('file-text', 14)} Docs
            </a>
            <a href="https://discord.gg/getorbit" target="_blank" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors">
              ${icon('external-link', 14)} Support
            </a>
          </div>
        </header>

        <!-- Sub-Tab Content View -->
        <main id="dash-tab-content" class="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div class="flex items-center justify-center min-h-[300px]">
            <svg class="animate-spin text-neutral-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        </main>
      </div>
    </div>
  `;

  // Mobile sidebar toggle
  window.toggleSidebar = () => {
    const sb = document.getElementById('dash-sidebar');
    if (!sb) return;
    sb.classList.toggle('-translate-x-full');
  };

  const tabContainer = document.getElementById('dash-tab-content');
  if (!tabContainer) return;

  // Mount specific sub-tab
  if (tab === 'overview') {
    DashboardTabs.Overview(tabContainer, guildId);
  } else if (tab === 'bot-profile') {
    DashboardTabs.BotProfile(tabContainer, guildId);
  } else if (tab === 'analytics') {
    DashboardTabs.Analytics(tabContainer, guildId);
  } else if (tab === 'roles') {
    DashboardTabs.Roles(tabContainer, guildId);
  } else if (tab === 'invites') {
    DashboardTabs.Invites(tabContainer, guildId);
  } else if (tab === 'embed-builder') {
    DashboardTabs.EmbedBuilder(tabContainer, guildId);
  } else if (tab === 'leaderboard') {
    DashboardTabs.Leaderboard(tabContainer, guildId);
  } else if (tab === 'settings') {
    DashboardTabs.Settings(tabContainer, guildId);
  } else if (tab === 'security') {
    DashboardTabs.Security(tabContainer, guildId);
  } else if (tab === 'verify') {
    DashboardTabs.Verification(tabContainer, guildId);
  } else {
    // Modules: automod, tickets, welcomegoodbye, autoresponder, appeals, automation, boost, messages, serverstats, tempvoice, level
    DashboardTabs.Modules(tabContainer, guildId, tab);
  }
};
