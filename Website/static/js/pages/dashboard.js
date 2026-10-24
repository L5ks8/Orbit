/**
 * Orbit Server Dashboard Page Shell
 * Exactly matches PeakBot sidebar, top navigation, and dark aesthetic.
 */

Pages.Dashboard = async function(container, guildId, tab = 'overview') {
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Fast path: if the dashboard shell is already loaded for this server, switch tabs instantly!
  const existingTabContainer = document.getElementById('dash-tab-content');
  if (window.__currentDashboardGuildId === String(guildId) && existingTabContainer) {
    window.__currentDashboardTab = tab;
    Pages._updateDashboardSidebarNav(tab);

    const sb = document.getElementById('dash-sidebar');
    if (sb && !sb.classList.contains('-translate-x-full') && window.innerWidth < 1024) {
      sb.classList.add('-translate-x-full');
    }

    if (tab === 'builder' || tab === 'ai-helper') {
      existingTabContainer.className = 'p-4 lg:p-6 xl:p-8 min-h-[calc(100vh-64px)] bg-neutral-950';
    } else {
      existingTabContainer.className = 'p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto min-h-[calc(100vh-64px)] bg-neutral-950';
    }

    // Switch pane instantly with 0ms loading (no blanking, no spinner!)
    Pages._switchDashboardPane(existingTabContainer, tab, guildId);
    return;
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

  // Fast in-memory cache check for instant server title & icon (never block page render!)
  let currentGuild = window.__currentDashboardGuildObj;
  if (!currentGuild || String(currentGuild.id) !== String(guildId)) {
    const cachedCfg = API.getCache ? API.getCache(`config_${guildId}`) : null;
    if (cachedCfg?.guild) {
      currentGuild = cachedCfg.guild;
    } else {
      const fastGuilds = API.getGuildsFast ? API.getGuildsFast() : [];
      currentGuild = fastGuilds.find(g => String(g.id) === String(guildId));
    }
  }
  if (!currentGuild) {
    currentGuild = {
      id: guildId,
      name: 'Server Dashboard',
      icon: null
    };
    if (API.getGuilds) {
      API.getGuilds().then(gList => {
        const match = (gList || []).find(g => String(g.id) === String(guildId));
        if (match) {
          window.__currentDashboardGuildObj = match;
          const nameEl = document.querySelector('#dash-sidebar .truncate');
          if (nameEl && match.name) nameEl.textContent = match.name;
        }
      }).catch(() => {});
    }
  }

  let guildIconUrl = '/img/logo.png';
  if (currentGuild.icon) {
    const ext = currentGuild.icon.startsWith('a_') ? 'gif' : 'png';
    guildIconUrl = `https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.${ext}?size=128`;
  }

  // Navigation sections matching PeakBot exactly
  const navSections = [
    {
      title: 'Main',
      links: [
        {
          name: 'Overview',
          id: 'overview',
          path: `/dashboard/${guildId}`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard w-4 h-4"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>`
        },
        {
          name: 'AI Helper',
          id: 'builder',
          path: `/dashboard/${guildId}/builder`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>`
        },
        {
          name: 'Bot Profile',
          id: 'bot-profile',
          path: `/dashboard/${guildId}/bot-profile`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-4 h-4"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>`
        },
        {
          name: 'Server Settings',
          id: 'settings',
          path: `/dashboard/${guildId}/settings`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings w-4 h-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
        },
        {
          name: 'Analytics',
          id: 'analytics',
          path: `/dashboard/${guildId}/analytics`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-4 h-4"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>`
        }
      ]
    },
    {
      title: 'Welcome & Onboarding',
      links: [
        {
          name: 'Welcome',
          id: 'welcomegoodbye',
          path: `/dashboard/${guildId}/welcome`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
        },
        {
          name: 'Roles',
          id: 'roles',
          path: `/dashboard/${guildId}/roles`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tags w-4 h-4"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"></path><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"></circle></svg>`
        },
        {
          name: 'Invite Tracker',
          id: 'invites',
          path: `/dashboard/${guildId}/invites`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-plus w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>`
        },
        {
          name: 'Verification',
          id: 'verify',
          path: `/dashboard/${guildId}/verify`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-4 h-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>`
        }
      ]
    },
    {
      title: 'Tools',
      links: [
        {
          name: 'Messages',
          id: 'messages',
          path: `/dashboard/${guildId}/messages`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers w-4 h-4"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path></svg>`
        }
      ]
    },
    {
      title: 'Engagement',
      links: [
        {
          name: 'XP & Level',
          id: 'level',
          path: `/dashboard/${guildId}/level`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star w-4 h-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
        },
        {
          name: 'Boost Messages',
          id: 'boost',
          path: `/dashboard/${guildId}/boost`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket w-4 h-4"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`
        },
        {
          name: 'Server Stats',
          id: 'serverstats',
          path: `/dashboard/${guildId}/serverstats`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart-2 w-4 h-4"><line x1="18" x2="18" y1="20" y2="10"></line><line x1="12" x2="12" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="14"></line></svg>`
        },
        {
          name: 'Polls',
          id: 'polls',
          path: `/dashboard/${guildId}/polls`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart-3 w-4 h-4"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>`
        },
        {
          name: 'Giveaways',
          id: 'giveaways',
          path: `/dashboard/${guildId}/giveaways`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift w-4 h-4"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>`
        }
      ]
    },
    {
      title: 'Community',
      links: [
        {
          name: 'Tickets',
          id: 'tickets',
          path: `/dashboard/${guildId}/tickets`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket w-4 h-4"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>`
        },
        {
          name: 'Voice Channels',
          id: 'tempvoice',
          path: `/dashboard/${guildId}/tempvoice`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2 w-4 h-4"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`
        }
      ]
    },
    {
      title: 'Moderation & Security',
      links: [
        {
          name: 'Auto-Moderation',
          id: 'automod',
          path: `/dashboard/${guildId}/automod`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert w-4 h-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>`
        },
        {
          name: 'Security',
          id: 'security',
          path: `/dashboard/${guildId}/security`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-4 h-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`
        },
        {
          name: 'Backups',
          id: 'backups',
          path: `/dashboard/${guildId}/backups`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database w-4 h-4"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>`
        },
        {
          name: 'Ban Appeals',
          id: 'appeals',
          path: `/dashboard/${guildId}/appeals`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scale w-4 h-4"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>`
        }
      ]
    },
    {
      title: 'Maintenance',
      links: [
        {
          name: 'Inactive Kick',
          id: 'inactive-kick',
          path: `/dashboard/${guildId}/inactive-kick`,
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-minus w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg>`
        }
      ]
    }
  ];

  container.innerHTML = `
    <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <div class="min-h-screen bg-neutral-950 relative overflow-x-hidden">

        <!-- Sidebar matching PeakBot exactly -->
        <aside id="dash-sidebar" data-lenis-prevent="true" class="fixed top-0 left-0 h-full w-64 bg-neutral-900 border-r border-neutral-800 z-50 transform transition-transform duration-300 lg:translate-x-0 -translate-x-full">
          <div class="flex flex-col h-full min-h-0 overflow-hidden">

            <!-- Logo & Brand Header -->
            <div class="p-5 border-b border-neutral-800 shrink-0">
              <div class="flex items-center justify-between">
                <a class="flex items-center gap-3" aria-label="Go to homepage" href="/">
                  <div class="relative">
                    <img src="/img/logo.png" alt="Orbit" width="24" height="24" class="w-10 h-10 rounded-lg">
                    <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full border-2 border-neutral-900"></div>
                  </div>
                  <div>
                    <span class="font-bold text-white text-lg">Orbit</span>
                    <p class="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">Dashboard</p>
                  </div>
                </a>
                <button onclick="toggleSidebar()" class="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg lg:hidden transition-colors" aria-label="Close sidebar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                </button>
              </div>
            </div>

            <!-- Server Switcher Card -->
            <div class="p-4 shrink-0">
              <a class="flex items-center gap-3 p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all group" href="/dashboard">
                <img src="${guildIconUrl}" alt="${escapeHtml(currentGuild.name)}" class="w-10 h-10 rounded-xl object-cover">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-white truncate">${escapeHtml(currentGuild.name)}</p>
                  <p class="text-xs text-neutral-500">Click to switch</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left w-4 h-4 text-neutral-400 group-hover:text-neutral-300 transition-colors"><path d="m15 18-6-6 6-6"></path></svg>
              </a>
            </div>

            <!-- Nav Links List -->
            <nav id="dash-sidebar-nav" data-lenis-prevent="true" class="flex-1 min-h-0 px-3 pb-4 overflow-y-auto overscroll-contain scrollbar-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              ${navSections.map(sec => `
                <div class="mb-4">
                  <p class="px-3 mb-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">${sec.title}</p>
                  <div class="space-y-0.5">
                    ${sec.links.map(l => {
                      const isActive = tab === l.id || (l.id === 'settings' && tab === 'server-settings') || (l.id === 'welcomegoodbye' && tab === 'welcome') || (l.id === 'builder' && tab === 'ai-helper') || (l.id === 'verify' && tab === 'verification') || (l.id === 'tempvoice' && (tab === 'tempvoice' || tab === 'jtc'));
                      return `
                        <a 
                          href="${l.path}" 
                          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full ${
                            isActive 
                              ? 'bg-white text-black shadow-sm font-semibold' 
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                          }"
                        >
                          <span class="${isActive ? 'text-black' : ''}">${l.svg}</span>
                          <span>${l.name}</span>
                        </a>
                      `;
                    }).join('')}
                  </div>
                </div>
              `).join('')}
            </nav>

            <!-- Bottom Support & Navigation -->
            <div class="p-4 border-t border-neutral-800">
              <div class="flex items-center justify-between text-xs">
                <a href="https://discord.gg/getorbit" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors">Support<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link w-3 h-3"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg></a>
                <a href="/" class="text-neutral-400 hover:text-white transition-colors">Back to Home</a>
              </div>
            </div>

          </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="lg:pl-64 relative min-h-screen bg-neutral-950">

          <!-- Header -->
          <header class="sticky top-0 z-20 h-16 bg-neutral-900/90 backdrop-blur-sm border-b border-neutral-800">
            <div class="flex items-center justify-between h-full px-4 lg:px-8">
              <div class="flex items-center gap-2 sm:gap-4">
                <button onclick="toggleSidebar()" class="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden transition-colors cursor-pointer" aria-label="Toggle sidebar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu w-5 h-5"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
                </button>
                <a class="p-1.5 rounded-xl hover:bg-neutral-800 transition-colors group" title="Back to servers" href="/dashboard">
                  <img src="/img/logo.png" alt="Orbit" width="28" height="28" class="rounded-xl group-hover:shadow-lg transition-shadow sm:w-8 sm:h-8">
                </a>
                <div class="w-px h-8 bg-neutral-700 hidden sm:block"></div>
                <h1 class="text-sm sm:text-[15px] font-semibold text-white truncate max-w-[100px] sm:max-w-none">${escapeHtml(currentGuild.name)}</h1>
              </div>

              <div class="flex items-center gap-1.5 sm:gap-3">
                <!-- Notifications with popup dropdown -->
                <div class="relative">
                  <button id="dash-notif-btn" class="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer" aria-label="Notifications" aria-expanded="false">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell w-5 h-5"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                  </button>

                  <!-- Notification UI matching PeakBot -->
                  <div id="dash-notif-dropdown" data-no-search="true" class="hidden absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[384px] max-w-[384px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
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
                
                <!-- User dropdown -->
                <div class="relative">
                  <button id="dash-user-menu-btn" class="flex items-center gap-1.5 sm:gap-3 p-1 sm:p-1.5 pr-1.5 sm:pr-3 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer" aria-label="User menu" aria-expanded="false">
                    <img src="${userAvatar}" alt="${escapeHtml(userName)}" class="w-8 h-8 rounded-xl ring-2 ring-neutral-700 object-cover">
                    <div class="hidden sm:block text-left">
                      <p class="text-sm font-medium text-white">${escapeHtml(userName)}</p>
                      <p class="text-[10px] text-neutral-500">Member</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                  
                  <!-- User Dropdown Menu matching PeakBot -->
                  <div id="dash-user-dropdown" data-no-search="true" class="hidden absolute right-0 mt-2 w-56 py-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-[60]">
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

          <!-- Main Content Body -->
          <main id="dash-tab-content" class="p-4 lg:p-6 xl:p-8 ${(tab === 'builder' || tab === 'ai-helper') ? '' : 'max-w-[1200px] mx-auto'} min-h-[calc(100vh-64px)] bg-neutral-950">
            <div class="flex items-center justify-center p-12 text-neutral-500 text-sm">
              <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Loading dashboard...
            </div>
          </main>

        </div>
      </div>
    </div>
  `;

  // Preserve and restore left sidebar scroll position across tab switches
  const sidebarNav = document.getElementById('dash-sidebar-nav');
  if (sidebarNav) {
    if (typeof window.__dashSidebarScrollTop === 'number') {
      sidebarNav.scrollTop = window.__dashSidebarScrollTop;
    }
    sidebarNav.addEventListener('scroll', () => {
      window.__dashSidebarScrollTop = sidebarNav.scrollTop;
    }, { passive: true });
  }

  // Toggle mobile sidebar
  window.toggleSidebar = () => {
    const sb = document.getElementById('dash-sidebar');
    if (!sb) return;
    sb.classList.toggle('-translate-x-full');
  };

  // Toggle user menu & notifications in dashboard
  const dashUserBtn = document.getElementById('dash-user-menu-btn');
  const dashDropdown = document.getElementById('dash-user-dropdown');
  const dashNotifBtn = document.getElementById('dash-notif-btn');
  const dashNotifDropdown = document.getElementById('dash-notif-dropdown');

  if (dashUserBtn && dashDropdown) {
    dashUserBtn.onclick = (e) => {
      e.stopPropagation();
      dashDropdown.classList.toggle('hidden');
      if (dashNotifDropdown) dashNotifDropdown.classList.add('hidden');
    };
  }

  if (dashNotifBtn && dashNotifDropdown) {
    dashNotifBtn.onclick = (e) => {
      e.stopPropagation();
      dashNotifDropdown.classList.toggle('hidden');
      if (dashDropdown) dashDropdown.classList.add('hidden');
    };
  }

  document.addEventListener('click', () => {
    if (dashDropdown) dashDropdown.classList.add('hidden');
    if (dashNotifDropdown) dashNotifDropdown.classList.add('hidden');
  });

  window.__currentDashboardGuildId = String(guildId);
  window.__currentDashboardGuildObj = currentGuild;
  window.__currentDashboardTab = tab;

  const tabContainer = document.getElementById('dash-tab-content');
  if (!tabContainer) return;

  // Clear initial placeholder and mount active pane
  tabContainer.innerHTML = '';
  Pages._switchDashboardPane(tabContainer, tab, guildId);

  // Pre-load on hover for 0ms instant tab transitions
  const nav = document.getElementById('dash-sidebar-nav');
  if (nav && !nav._hasHoverPreload) {
    nav._hasHoverPreload = true;
    nav.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const parts = href.split('/').filter(Boolean);
      if (parts[0] === 'dashboard' && parts[1] === String(guildId)) {
        const hoverTab = parts[2] || 'overview';
        const paneId = `dash-pane-${hoverTab}`;
        if (!document.getElementById(paneId)) {
          // Pre-mount idle pane in background
          const hiddenPane = document.createElement('div');
          hiddenPane.id = paneId;
          hiddenPane.className = 'dash-tab-pane w-full';
          hiddenPane.style.display = 'none';
          tabContainer.appendChild(hiddenPane);
          const handlers = Pages._getDashboardTabHandlers(hiddenPane, guildId, currentGuild);
          if (handlers[hoverTab]) {
            Pages._mountDashboardTab(hiddenPane, handlers[hoverTab], hoverTab, guildId);
          } else if (DashboardTabs.Modules) {
            Pages._mountDashboardTab(hiddenPane, () => DashboardTabs.Modules(hiddenPane, guildId, hoverTab), hoverTab, guildId);
          }
        }
      }
    }, { passive: true });
  }

  // Background pre-mount of every tab during browser idle time,
  // so even the very first click on a tab shows instantly (no loading state)
  Pages._idlePremountAllTabs(tabContainer, guildId, currentGuild);
};

Pages._idlePremountAllTabs = async function(tabContainer, guildId, currentGuild) {
  const SKIP = new Set(['builder', 'ai-helper']);
  const idle = (fn) => (window.requestIdleCallback
    ? window.requestIdleCallback(fn, { timeout: 1500 })
    : setTimeout(fn, 120));

  // Wait for the shared config first so all panes render from cache, not with spinners
  try { await API.getConfig(guildId); } catch (_) {}

  const nav = document.getElementById('dash-sidebar-nav');
  if (!nav) return;
  const tabs = [];
  nav.querySelectorAll('a[href]').forEach(a => {
    const parts = (a.getAttribute('href') || '').split('/').filter(Boolean);
    if (parts[0] === 'dashboard' && parts[1] === String(guildId)) {
      const t = parts[2] || 'overview';
      if (!SKIP.has(t) && !tabs.includes(t)) tabs.push(t);
    }
  });

  const next = () => {
    // Stop if the user left this guild dashboard
    if (!tabContainer.isConnected || String(window.__currentDashboardGuildId) !== String(guildId)) return;
    const t = tabs.shift();
    if (!t) return;
    const paneId = `dash-pane-${t}`;
    if (!document.getElementById(paneId)) {
      const pane = document.createElement('div');
      pane.id = paneId;
      pane.className = 'dash-tab-pane w-full';
      pane.style.display = 'none';
      tabContainer.appendChild(pane);
      const handlers = Pages._getDashboardTabHandlers(pane, guildId, currentGuild);
      if (handlers[t]) {
        Pages._mountDashboardTab(pane, handlers[t], t, guildId);
      } else if (DashboardTabs.Modules) {
        Pages._mountDashboardTab(pane, () => DashboardTabs.Modules(pane, guildId, t), t, guildId);
      }
    }
    idle(next);
  };
  idle(next);
};

Pages._switchDashboardPane = function(tabContainer, tab, guildId) {
  if (!tabContainer) return;
  const targetPaneId = `dash-pane-${tab}`;
  let targetPane = document.getElementById(targetPaneId);

  // Hide all other panes
  const allPanes = tabContainer.querySelectorAll('.dash-tab-pane');
  allPanes.forEach(p => {
    p.style.display = 'none';
  });

  if (targetPane) {
    // Already in memory! 0ms instant display without any loading screen
    targetPane.style.display = 'block';
    if (typeof window.__refreshWelcomeTab === 'function') {
      window.__refreshWelcomeTab();
      requestAnimationFrame(window.__refreshWelcomeTab);
      setTimeout(window.__refreshWelcomeTab, 50);
      setTimeout(window.__refreshWelcomeTab, 150);
      setTimeout(window.__refreshWelcomeTab, 350);
    } else if (typeof window.__refreshWelcomeAutoResizes === 'function') {
      window.__refreshWelcomeAutoResizes();
      requestAnimationFrame(window.__refreshWelcomeAutoResizes);
    }
    window.dispatchEvent(new Event('resize'));
    return;
  }

  // First time visiting this tab: create pane and mount directly
  targetPane = document.createElement('div');
  targetPane.id = targetPaneId;
  targetPane.className = 'dash-tab-pane w-full';
  tabContainer.appendChild(targetPane);

  const currentGuild = window.__currentDashboardGuildObj || { id: guildId, name: 'Server Dashboard', icon: null };
  const tabHandlers = Pages._getDashboardTabHandlers(targetPane, guildId, currentGuild);

  if (tabHandlers[tab]) {
    Pages._mountDashboardTab(targetPane, tabHandlers[tab], tab, guildId);
  } else if (DashboardTabs.Modules) {
    Pages._mountDashboardTab(targetPane, () => DashboardTabs.Modules(targetPane, guildId, tab), tab, guildId);
  } else if (typeof window.renderErrorState === 'function') {
    window.renderErrorState(targetPane, {
      title: 'Module Not Found',
      message: `The module "${tab}" does not exist or is currently unavailable.`,
      statusCode: 404,
      backUrl: `/dashboard/${guildId}`,
      backText: 'Back to Overview'
    });
  }
};

Pages._updateDashboardSidebarNav = function(currentTab) {
  const nav = document.getElementById('dash-sidebar-nav');
  if (!nav) return;
  const links = nav.querySelectorAll('a[href]');
  links.forEach(a => {
    const href = a.getAttribute('href') || '';
    const parts = href.split('/').filter(Boolean);
    const linkTab = parts[2] || 'overview';
    const isActive = (linkTab === currentTab) ||
      (linkTab === 'settings' && (currentTab === 'server-settings' || currentTab === 'settings')) ||
      (linkTab === 'welcome' && (currentTab === 'welcomegoodbye' || currentTab === 'welcome')) ||
      (linkTab === 'builder' && (currentTab === 'ai-helper' || currentTab === 'builder')) ||
      (linkTab === 'verify' && (currentTab === 'verification' || currentTab === 'verify')) ||
      (linkTab === 'tempvoice' && (currentTab === 'tempvoice' || currentTab === 'jtc'));

    if (isActive) {
      a.className = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all w-full bg-white text-black shadow-sm';
      const iconSpan = a.querySelector('span:first-child');
      if (iconSpan) iconSpan.className = 'text-black';
    } else {
      a.className = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-neutral-400 hover:text-white hover:bg-neutral-800';
      const iconSpan = a.querySelector('span:first-child');
      if (iconSpan) iconSpan.className = '';
    }
  });
};

Pages._getDashboardTabHandlers = function(tabContainer, guildId, currentGuild) {
  return {
    'overview': () => DashboardTabs.Overview && DashboardTabs.Overview(tabContainer, guildId, currentGuild),
    'builder': () => DashboardTabs.Builder && DashboardTabs.Builder(tabContainer, guildId),
    'ai-helper': () => DashboardTabs.Builder && DashboardTabs.Builder(tabContainer, guildId),
    'bot-profile': () => DashboardTabs.BotProfile && DashboardTabs.BotProfile(tabContainer, guildId),
    'settings': () => DashboardTabs.Settings && DashboardTabs.Settings(tabContainer, guildId),
    'server-settings': () => DashboardTabs.Settings && DashboardTabs.Settings(tabContainer, guildId),
    'analytics': () => DashboardTabs.Analytics && DashboardTabs.Analytics(tabContainer, guildId),
    'welcome': () => DashboardTabs.Welcome && DashboardTabs.Welcome(tabContainer, guildId),
    'welcomegoodbye': () => DashboardTabs.Welcome && DashboardTabs.Welcome(tabContainer, guildId),
    'roles': () => DashboardTabs.Roles && DashboardTabs.Roles(tabContainer, guildId),
    'invites': () => DashboardTabs.Invites && DashboardTabs.Invites(tabContainer, guildId),
    'verify': () => DashboardTabs.Verification && DashboardTabs.Verification(tabContainer, guildId),
    'verification': () => DashboardTabs.Verification && DashboardTabs.Verification(tabContainer, guildId),
    'messages': () => DashboardTabs.Messages && DashboardTabs.Messages(tabContainer, guildId),
    'level': () => DashboardTabs.Level && DashboardTabs.Level(tabContainer, guildId),
    'polls': () => DashboardTabs.Polls && DashboardTabs.Polls(tabContainer, guildId),
    'giveaways': () => DashboardTabs.Giveaways && DashboardTabs.Giveaways(tabContainer, guildId),
    'tickets': () => DashboardTabs.Tickets && DashboardTabs.Tickets(tabContainer, guildId),
    'tempvoice': () => DashboardTabs.TempVoice && DashboardTabs.TempVoice(tabContainer, guildId),
    'jtc': () => DashboardTabs.TempVoice && DashboardTabs.TempVoice(tabContainer, guildId),
    'automod': () => DashboardTabs.AutoMod && DashboardTabs.AutoMod(tabContainer, guildId),
    'security': () => DashboardTabs.Security && DashboardTabs.Security(tabContainer, guildId),
    'backups': () => DashboardTabs.Backups && DashboardTabs.Backups(tabContainer, guildId),
    'inactive-kick': () => DashboardTabs.InactiveKick && DashboardTabs.InactiveKick(tabContainer, guildId),
    'idle-kick': () => DashboardTabs.InactiveKick && DashboardTabs.InactiveKick(tabContainer, guildId),
    'appeals': () => DashboardTabs.Appeals && DashboardTabs.Appeals(tabContainer, guildId),
    'serverstats': () => DashboardTabs.ServerStats && DashboardTabs.ServerStats(tabContainer, guildId),
    'autoresponder': () => DashboardTabs.AutoResponder && DashboardTabs.AutoResponder(tabContainer, guildId),
    'automation': () => DashboardTabs.Automation && DashboardTabs.Automation(tabContainer, guildId),
    'boost': () => DashboardTabs.Boost && DashboardTabs.Boost(tabContainer, guildId),
    'leaderboard': () => DashboardTabs.Leaderboard && DashboardTabs.Leaderboard(tabContainer, guildId)
  };
};

Pages._mountDashboardTab = async function(tabContainer, handler, tabName, guildId) {
  try {
    const p = handler();
    if (p && typeof p.catch === 'function') {
      await p;
    }
  } catch (err) {
    console.error(`[Dashboard] Error in tab "${tabName}":`, err);
    if (typeof window.renderErrorState === 'function') {
      window.renderErrorState(tabContainer, {
        title: `Error loading ${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`,
        message: 'An error occurred while fetching module configuration. Please try again.',
        details: err?.message || String(err),
        statusCode: err?.status || (err?.message && err.message.includes('500') ? 500 : 404),
        onRetry: () => Pages._mountDashboardTab(tabContainer, handler, tabName, guildId),
        backUrl: `/dashboard/${guildId}`
      });
    } else {
      tabContainer.innerHTML = `<div class="p-8 text-red-400 text-center text-sm">Failed to load ${tabName}: ${err.message}</div>`;
    }
  }
};
