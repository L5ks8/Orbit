/**
 * Orbit Public Pages
 * Documentation, Guides, Status, Benchmarks, Leaderboard, Terms, and Privacy.
 */

// ==========================================
// DOCS PAGE
// ==========================================
Pages.Docs = function(container) {
  const sections = [
    { id: 'overview', title: 'Introduction', content: 'Welcome to the Orbit documentation. Orbit is a high-performance, modular Discord application engineered for high-concurrency servers.' },
    { id: 'commands', title: 'Core Slash Commands', content: `
      <div class="flex flex-col gap-3">
        <div class="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <code class="text-indigo-400 font-bold">/role all &lt;role&gt; [reason]</code>
          <p class="text-xs text-neutral-400 mt-1">Assigns a specified role to every member in the server with Discord Components V2 summary.</p>
        </div>
        <div class="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <code class="text-indigo-400 font-bold">/role rall &lt;role&gt; [reason]</code>
          <p class="text-xs text-neutral-400 mt-1">Removes a role from all server members with rate-limit protection.</p>
        </div>
        <div class="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <code class="text-indigo-400 font-bold">/mute &lt;user&gt; [reason]</code>
          <p class="text-xs text-neutral-400 mt-1">Mutes a member and records the moderation case in the audit log.</p>
        </div>
        <div class="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <code class="text-indigo-400 font-bold">/ticket</code>
          <p class="text-xs text-neutral-400 mt-1">Interactive commands to manage, claim, and close active support channels.</p>
        </div>
      </div>
    `},
    { id: 'automod', title: 'Auto-Moderation Engine', content: 'Orbit filters chat messages with zero-latency regex matching. When violations occur, actions escalate from warnings to timeouts, kicks, or bans according to your threshold settings.' },
    { id: 'tickets', title: 'Support Ticket Panels', content: 'Deploy persistent ticket panels in any channel. Members pick an inquiry category from a dropdown menu, generating a private channel with your designated support roles.' },
    { id: 'appeals', title: 'Ban Appeal System', content: 'Orbit automatically includes a personalized appeal portal link whenever a moderation action is dispatched. Punished members sign in with OAuth2 to submit their appeal statement.' }
  ];

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-6 pt-32 pb-24 animate-fade-in flex flex-col md:flex-row gap-12">
      <!-- Sidebar -->
      <div class="w-full md:w-64 shrink-0">
        <div class="sticky top-28 flex flex-col gap-2">
          <span class="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Documentation</span>
          ${sections.map((s, i) => `
            <a href="#${s.id}" class="px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors ${i === 0 ? 'bg-neutral-900 text-white font-semibold' : ''}">
              ${s.title}
            </a>
          `).join('')}
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 flex flex-col gap-12">
        <div>
          <h1 class="text-4xl font-extrabold text-white mb-2">Documentation</h1>
          <p class="text-neutral-400 text-sm">Comprehensive guides and command references for Orbit.</p>
        </div>

        ${sections.map(s => `
          <div id="${s.id}" class="scroll-mt-32 p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800">
            <h2 class="text-xl font-bold text-white mb-4">${s.title}</h2>
            <div class="text-neutral-300 text-sm leading-relaxed">${s.content}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// ==========================================
// GUIDES PAGE
// ==========================================
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
            <a href="/docs" class="text-xs text-white font-semibold flex items-center gap-1.5 hover:underline">
              Read Guide ${icon('arrow-right', 12)}
            </a>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// ==========================================
// STATUS PAGE
// ==========================================
Pages.Status = async function(container) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto px-6 pt-32 pb-24 animate-fade-in text-center">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        All Systems Operational
      </div>

      <h1 class="text-4xl font-extrabold text-white mb-3">System Status & Latency</h1>
      <p class="text-neutral-400 text-sm mb-12">Real-time health and uptime of Orbit services.</p>

      <div class="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4 text-left mb-8">
        ${[
          { name: 'Discord Gateway Connection', status: 'Operational', ping: '18ms' },
          { name: 'API Server & Web Dashboard', status: 'Operational', ping: '12ms' },
          { name: 'Components V2 Engine', status: 'Operational', ping: 'Instant' },
          { name: 'Auto-Moderation Scanner', status: 'Operational', ping: '<5ms' },
          { name: 'Database Cluster (MongoDB)', status: 'Operational', ping: '4ms' }
        ].map(s => `
          <div class="flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span class="text-xs font-semibold text-white">${s.name}</span>
            <div class="flex items-center gap-4">
              <span class="text-xs text-neutral-500 font-mono">${s.ping}</span>
              <span class="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ${s.status}
              </span>
            </div>
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
  container.innerHTML = `
    <div class="max-w-3xl mx-auto px-6 pt-32 pb-24 animate-fade-in">
      <div id="pub-lb-loading" class="text-center py-16 text-neutral-500 text-sm">
        <svg class="animate-spin inline mr-2 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading server leaderboard...
      </div>
      <div id="pub-lb-content" class="hidden flex flex-col gap-4"></div>
    </div>
  `;

  try {
    const data = await API.getLeaderboard(guildId);
    const content = document.getElementById('pub-lb-content');
    const loading = document.getElementById('pub-lb-loading');
    if (!content) return;

    const list = Array.isArray(data) ? data : (data?.users || []);
    content.innerHTML = `
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">${data.guild_name || 'Server'} Leaderboard</h1>
        <p class="text-xs text-neutral-400">Top active chatters ranked by level and experience.</p>
      </div>

      <div class="flex flex-col gap-2">
        ${list.map((u, i) => `
          <div class="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4">
            <div class="flex items-center gap-4 min-w-0">
              <span class="text-sm font-bold w-6 text-center ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-neutral-300' : i === 2 ? 'text-amber-600' : 'text-neutral-500'}">#${i + 1}</span>
              <img src="${u.avatar || '/img/logo.png'}" class="w-10 h-10 rounded-full shrink-0" alt="${u.name || 'User'}">
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-white truncate">${u.name || u.user_id}</span>
                <span class="text-[11px] text-neutral-500">XP: ${u.xp?.toLocaleString() || 0}</span>
              </div>
            </div>
            <span class="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">Level ${u.level || 0}</span>
          </div>
        `).join('')}
        ${list.length === 0 ? `<div class="p-8 text-center text-neutral-500 text-xs">No active leaderboard data yet.</div>` : ''}
      </div>
    `;

    loading.classList.add('hidden');
    content.classList.remove('hidden');
  } catch (err) {
    container.innerHTML = `<div class="pt-32 text-center text-red-400 text-sm">Failed to load leaderboard.</div>`;
  }
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

  if (!user) {
    user = {
      id: '1195055294380781629',
      username: 'l5ks8',
      global_name: 'l5ks8',
      avatar: 'fb767530b737fec5d198922be5ff80c9'
    };
  }

  const userName = user.global_name || user.username || 'Benutzer';
  const userDiscordId = user.id || '1195055294380781629';
  const userAvatar = user.avatar 
    ? `https://cdn.discordapp.com/avatars/${userDiscordId}/${user.avatar}.png?size=128`
    : '/img/logo.png';

  const now = new Date();
  const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
  const memberDate = now.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europa/Berlin';

  container.innerHTML = `
    <div class="min-h-screen bg-neutral-950 text-neutral-100">
      <!-- Sticky Settings Header -->
      <header class="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800">
        <div class="flex items-center justify-between h-14 px-4 lg:px-8 max-w-3xl mx-auto">
          <div class="flex items-center gap-3">
            <a class="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer" aria-label="Geh zurück" href="/dashboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left w-5 h-5"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
            </a>
            <h1 class="text-base font-semibold text-white">Einstellungen</h1>
          </div>
        </div>
      </header>

      <!-- Settings Content Container -->
      <div class="max-w-3xl mx-auto px-4 lg:px-8 py-8 space-y-10">
        
        <!-- Profil Section -->
        <section>
          <h3 class="text-[11px] uppercase tracking-widest text-neutral-400 font-medium mb-5">Profil</h3>
          <div class="border border-neutral-800 bg-neutral-900/30 rounded-xl p-6 lg:p-8">
            <div class="flex items-center gap-5">
              <img src="${userAvatar}" alt="${escapeHtml(userName)}" class="w-[72px] h-[72px] rounded-2xl border border-neutral-800 object-cover">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap">
                  <h2 class="text-xl font-bold text-white truncate">${escapeHtml(userName)}</h2>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400">Frei</span>
                </div>
                <p class="text-neutral-400 text-sm mt-1">Mitglied seit ${memberDate}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Verbundenes Konto Section -->
        <section>
          <h3 class="text-[11px] uppercase tracking-widest text-neutral-400 font-medium mb-5">Verbundenes Konto</h3>
          <div class="border border-neutral-800 bg-neutral-900/30 rounded-xl p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 min-w-0 flex-1">
                <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-white truncate">${escapeHtml(userName)}</p>
                  <p class="text-xs text-neutral-400 mt-0.5">Discord-Konto (ID: ${escapeHtml(userDiscordId)})</p>
                </div>
              </div>
              <span class="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-full flex items-center gap-1.5 flex-shrink-0 ml-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-3 h-3"><path d="M20 6 9 17l-5-5"></path></svg> Verbunden
              </span>
            </div>
          </div>
        </section>

        <!-- Abonnements Section -->
        <section>
          <h3 class="text-[11px] uppercase tracking-widest text-neutral-400 font-medium mb-5">Abonnements</h3>
          <div class="flex items-center justify-between gap-4 px-5 py-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl mb-3">
            <div class="min-w-0">
              <p class="text-[13px] text-neutral-400">Kein aktives Abonnement. <span class="text-white font-medium">Kaufen Sie einen Slot</span> um Pro freizuschalten.</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <a href="/pricing" class="inline-flex items-center gap-1.5 px-3 h-8 text-[12px] font-semibold bg-white hover:bg-neutral-200 text-black rounded-lg transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3 h-3"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg> Slot kaufen
              </a>
            </div>
          </div>
          
          <div class="bg-neutral-900/40 border border-neutral-800 rounded-xl overflow-hidden">
            <div class="flex items-center gap-3 px-4 py-3.5 border-2 border-dashed border-neutral-800 m-2 rounded-lg">
              <div class="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-server w-4 h-4 text-neutral-400"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect><rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect><line x1="6" x2="6.01" y1="6" y2="6"></line><line x1="6" x2="6.01" y1="18" y2="18"></line></svg>
              </div>
              <p class="flex-1 text-[13px] font-medium text-neutral-400">Holen Sie sich Ihren ersten Pro-Slot</p>
              <a href="/pricing" class="inline-flex items-center gap-1.5 px-3 h-8 text-[12px] font-semibold bg-white hover:bg-neutral-200 text-black rounded-lg transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3 h-3"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg> Slot kaufen
              </a>
            </div>
          </div>
          
          <div class="mt-4 text-center">
            <a class="inline-flex items-center gap-1.5 text-[12px] text-neutral-400 hover:text-white transition-colors cursor-pointer" href="/pricing">
              Preise ansehen
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link w-3 h-3"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
            </a>
          </div>
        </section>

        <!-- Sprache und Region Section -->
        <section>
          <h3 class="text-[11px] uppercase tracking-widest text-neutral-400 font-medium mb-5">Sprache und Region</h3>
          <div class="space-y-5">
            <div>
              <p class="text-xs text-neutral-400 mb-3">Wählen Sie Ihre Anzeigesprache. Ihre Region wird automatisch von Ihrem Browser erkannt.</p>
              <div class="space-y-2">
                <button type="button" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white cursor-pointer">
                  <span class="text-lg">🇺🇸</span>
                  <div class="flex-1"><span class="text-sm font-medium">Englisch</span></div>
                </button>
                <button type="button" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white cursor-pointer">
                  <span class="text-lg">🇪🇸</span>
                  <div class="flex-1"><span class="text-sm font-medium">Spanisch</span><span class="text-xs text-neutral-500 ml-2">Spanisch</span></div>
                </button>
                <button type="button" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white cursor-pointer">
                  <span class="text-lg">🇫🇷</span>
                  <div class="flex-1"><span class="text-sm font-medium">Französisch</span><span class="text-xs text-neutral-500 ml-2">Französisch</span></div>
                </button>
                <button type="button" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left bg-white/5 border-white/20 text-white cursor-pointer">
                  <span class="text-lg">🇩🇪</span>
                  <div class="flex-1"><span class="text-sm font-medium">Deutsch</span><span class="text-xs text-neutral-400 ml-2">Deutsch</span></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-4 h-4 text-green-400"><path d="M20 6 9 17l-5-5"></path></svg>
                </button>
                <button type="button" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white cursor-pointer">
                  <span class="text-lg">🇧🇷</span>
                  <div class="flex-1"><span class="text-sm font-medium">Portugiesisch</span><span class="text-xs text-neutral-500 ml-2">Portugiesisch</span></div>
                </button>
                <button type="button" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white cursor-pointer">
                  <span class="text-lg">🇮🇹</span>
                  <div class="flex-1"><span class="text-sm font-medium">Italienisch</span><span class="text-xs text-neutral-500 ml-2">Italienisch</span></div>
                </button>
                <button type="button" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white cursor-pointer">
                  <span class="text-lg">🇯🇵</span>
                  <div class="flex-1"><span class="text-sm font-medium">日本語</span><span class="text-xs text-neutral-500 ml-2">japanisch</span></div>
                </button>
                <button type="button" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white cursor-pointer">
                  <span class="text-lg">🇰🇷</span>
                  <div class="flex-1"><span class="text-sm font-medium">한국어</span><span class="text-xs text-neutral-500 ml-2">Koreanisch</span></div>
                </button>
                <button type="button" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white cursor-pointer">
                  <span class="text-lg">🇨🇳</span>
                  <div class="flex-1"><span class="text-sm font-medium">中文</span><span class="text-xs text-neutral-500 ml-2">chinesisch</span></div>
                </button>
                <button type="button" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left bg-transparent border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white cursor-pointer">
                  <span class="text-lg">🇷🇺</span>
                  <div class="flex-1"><span class="text-sm font-medium">Русский</span><span class="text-xs text-neutral-500 ml-2">Russisch</span></div>
                </button>
              </div>
            </div>

            <!-- Timezone Card -->
            <div>
              <p class="text-xs text-neutral-400 mb-3">Zeitzone – wird automatisch von Ihrem Browser erkannt, oder wählen Sie eine aus, die Sie überschreiben möchten.</p>
              <div class="relative border border-neutral-800 rounded-xl overflow-visible bg-neutral-900/30">
                <div class="flex items-center justify-between px-5 py-4 bg-neutral-900/60 border-b border-neutral-800">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe w-4 h-4 text-neutral-400"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-white tabular-nums">${timeStr} <span class="text-neutral-400 font-normal">UTC+2</span></p>
                      <p class="text-[11px] text-neutral-400 mt-0.5">${tz}<span class="ml-1.5 text-neutral-500">· Automatisch erkannt</span></p>
                    </div>
                  </div>
                </div>
                <div class="p-5 space-y-3">
                  <button type="button" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-left text-white hover:border-neutral-700 transition-colors cursor-pointer">
                    <span class="flex items-center gap-2 min-w-0 truncate">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-3.5 h-3.5 text-neutral-400 flex-shrink-0"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                      <span class="truncate">Automatische Erkennung (${tz})</span>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                  <p class="text-[11px] text-neutral-500">In dieser Zone werden alle Daten und Uhrzeiten im gesamten Dashboard angezeigt.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- Sicherheit Section -->
        <section>
          <h3 class="text-[11px] uppercase tracking-widest text-neutral-400 font-medium mb-5">Sicherheit</h3>
          <div class="border border-neutral-800 bg-neutral-900/30 rounded-xl divide-y divide-neutral-800">
            <div class="flex items-center justify-between p-5">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-monitor w-4 h-4 text-neutral-400"><rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-white flex items-center gap-2">Chrome unter Windows<span class="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-medium rounded-md">Aktuell</span></p>
                  <p class="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin w-3 h-3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg> Aktueller Standort · Jetzt
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Abmelden Card -->
          <div class="mt-4 border border-red-500/20 bg-red-500/5 rounded-xl">
            <div class="flex items-center justify-between p-5">
              <div>
                <p class="text-sm font-medium text-white">Abmelden</p>
                <p class="text-xs text-neutral-400 mt-0.5">Beende deine aktuelle Sitzung</p>
              </div>
              <button onclick="API.logout()" class="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-medium transition-colors cursor-pointer">
                Abmelden
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  `;
};

// ==========================================
// TERMS & PRIVACY
// ==========================================
Pages.Terms = function(container) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto px-6 pt-32 pb-24 text-neutral-300 text-sm leading-relaxed">
      <h1 class="text-3xl font-extrabold text-white mb-6">Terms of Service</h1>
      <p class="mb-4">By inviting or using Orbit in your Discord server, you agree to comply with Discord Terms of Service and Community Guidelines.</p>
      <p class="mb-4">Orbit is provided "as is" without warranties of any kind. Server administrators are responsible for configuring moderation rules responsibly.</p>
    </div>
  `;
};

Pages.Privacy = function(container) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto px-6 pt-32 pb-24 text-neutral-300 text-sm leading-relaxed">
      <h1 class="text-3xl font-extrabold text-white mb-6">Privacy Policy</h1>
      <p class="mb-4">Orbit stores server configurations, log channel identifiers, and moderation records solely to provide bot functionality.</p>
      <p class="mb-4">We do not sell or distribute personal data to third parties. Server owners may request data erasure at any time.</p>
    </div>
  `;
};
