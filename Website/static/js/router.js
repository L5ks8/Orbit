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
        <button onclick="API.login(window.location.pathname).then(() => Router.checkAuth().then(() => Router.handleRoute()))" class="flex items-center gap-2 pl-4 pr-5 py-2 rounded-full text-xs font-semibold tracking-[0.3px] text-white bg-[#5865F2] shadow-[0_0_22.5px_rgba(88,101,242,0.3),0_0_45px_rgba(88,101,242,0.12),inset_0_0_0_1px_rgba(255,255,255,0.35)] hover:bg-[#4752c4] transition-all active:scale-[0.96] cursor-pointer">
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"></path></svg>
          Melden Sie sich mit Discord an
        </button>
      `;
    }
  }
};

window.Router = Router;
window.Pages = window.Pages || {};
window.DashboardTabs = window.DashboardTabs || {};
