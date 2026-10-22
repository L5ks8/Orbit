/**
 * Orbit SPA Router
 * Handles all client-side navigation without page reloads.
 */

const Router = {
  routes: [],
  currentPath: '',
  currentUser: null,

  init() {
    window.addEventListener('popstate', () => this.handleRoute());
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.getAttribute('href')?.startsWith('/') && !link.getAttribute('target') && !link.getAttribute('download')) {
        const href = link.getAttribute('href');
        if (!href.startsWith('/api') && !href.startsWith('/auth')) {
          e.preventDefault();
          this.navigate(href);
        }
      }
    });

    this.checkAuth().then(() => this.handleRoute());
  },

  async checkAuth() {
    try {
      this.currentUser = await API.getUser();
    } catch (_) {
      this.currentUser = null;
    }
  },

  navigate(path) {
    if (path === this.currentPath) return;
    window.history.pushState({}, '', path);
    this.handleRoute();
  },

  replace(path) {
    window.history.replaceState({}, '', path);
    this.handleRoute();
  },

  async handleRoute() {
    const path = window.location.pathname;
    this.currentPath = path;
    window.scrollTo(0, 0);

    const app = document.getElementById('app');
    if (!app) return;

    // Show top navbar for public pages
    const isDashboard = path.startsWith('/dashboard');
    const navbar = document.getElementById('main-navbar');
    if (navbar) {
      navbar.style.display = isDashboard ? 'none' : 'flex';
      this.updateNavbarUser();
    }

    // Match exact and dynamic routes
    if (path === '/') {
      return Pages.Landing(app);
    }
    if (path === '/docs') {
      return Pages.Docs(app);
    }
    if (path === '/guides') {
      return Pages.Guides(app);
    }
    if (path === '/status') {
      return Pages.Status(app);
    }
    if (path === '/benchmarks') {
      return Pages.Benchmarks(app);
    }
    if (path === '/terms') {
      return Pages.Terms(app);
    }
    if (path === '/privacy') {
      return Pages.Privacy(app);
    }
    if (path === '/settings') {
      return Pages.UserSettings(app);
    }

    // Appeal: /appeal/:customUrl
    const appealMatch = path.match(/^\/appeal\/([^\/]+)/);
    if (appealMatch) {
      return Pages.Appeal(app, appealMatch[1]);
    }

    // Verify: /verify/:token
    const verifyMatch = path.match(/^\/verify\/([^\/]+)/);
    if (verifyMatch) {
      return Pages.Verify(app, verifyMatch[1]);
    }

    // Leaderboard: /leaderboard/:guildId
    const lbMatch = path.match(/^\/leaderboard\/([^\/]+)/);
    if (lbMatch) {
      return Pages.Leaderboard(app, lbMatch[1]);
    }

    // Server Selector: /dashboard
    if (path === '/dashboard' || path === '/dashboard/') {
      return Pages.ServerSelector(app);
    }

    // Dashboard inner: /dashboard/:guildId/*
    const dashMatch = path.match(/^\/dashboard\/([0-9]+)(?:\/(.*))?$/);
    if (dashMatch) {
      const guildId = dashMatch[1];
      const tab = dashMatch[2] || 'overview';
      return Pages.Dashboard(app, guildId, tab);
    }

    // 404
    app.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <h1 class="text-6xl font-bold text-white mb-4">404</h1>
        <p class="text-neutral-400 text-lg mb-6">Page not found.</p>
        <a href="/" class="px-6 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition-colors">Go Home</a>
      </div>
    `;
  },

  updateNavbarUser() {
    const userSlot = document.getElementById('nav-user-slot');
    if (!userSlot) return;

    if (this.currentUser) {
      const avatarUrl = this.currentUser.avatar 
        ? `https://cdn.discordapp.com/avatars/${this.currentUser.id}/${this.currentUser.avatar}.png?size=64`
        : '/img/logo.png';

      userSlot.innerHTML = `
        <a href="/dashboard" class="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-neutral-800 border border-neutral-700 hover:border-neutral-600 transition-all">
          <img src="${avatarUrl}" class="w-6 h-6 rounded-full" alt="${this.currentUser.username}">
          <span class="text-xs font-semibold text-white">${this.currentUser.username}</span>
        </a>
      `;
    } else {
      userSlot.innerHTML = `
        <a href="https://discord.com/oauth2/authorize?client_id=1411032158406541353&permissions=8&scope=bot%20applications.commands" target="_blank" class="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold tracking-[0.3px] text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition-all active:scale-[0.96] cursor-pointer">
          Add to My Server
        </a>
        <button onclick="API.login(window.location.pathname).then(() => Router.checkAuth().then(() => Router.handleRoute()))" class="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold tracking-[0.3px] text-black bg-white hover:bg-neutral-200 transition-all active:scale-[0.96] cursor-pointer">
          Sign In
        </button>
      `;
    }
  }
};

window.Router = Router;
window.Pages = window.Pages || {};
window.DashboardTabs = window.DashboardTabs || {};
