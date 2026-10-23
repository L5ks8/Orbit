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

    // If accessing dashboard while not logged in, always redirect to home screen immediately
    if (path.startsWith('/dashboard') && !this.currentUser) {
      return this.replace('/');
    }

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
        <button onclick="API.login('/dashboard').then(() => Router.checkAuth().then(() => Router.navigate('/dashboard')))" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-[0.3px] text-white bg-[#5865F2] hover:bg-[#4752C4] shadow-[0_2px_12px_rgba(88,101,242,0.4)] transition-all active:scale-[0.96] cursor-pointer">
          <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          Sign In
        </button>
      `;
    }
  }
};

window.Router = Router;
window.Pages = window.Pages || {};
window.DashboardTabs = window.DashboardTabs || {};
