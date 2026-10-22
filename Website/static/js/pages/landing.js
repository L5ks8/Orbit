/**
 * Orbit Landing Page
 * High-performance, pixel-perfect recreation of the Orbit home page.
 */

Pages.Landing = function(container) {
  container.innerHTML = `
    <div class="relative overflow-hidden pt-28 pb-20">
      <!-- Particle Canvas -->
      <canvas id="hero-particles" class="absolute top-0 left-0 w-full h-[700px] pointer-events-none -z-10"></canvas>
      
      <!-- Hero Section -->
      <div class="max-w-6xl mx-auto px-6 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 animate-fade-in">
          <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          Orbit v2.0 is Live — Modern Discord Ecosystem
        </div>

        <h1 class="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
          The All-In-One Bot for <br class="hidden sm:block"/>
          <span class="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Modern Communities</span>
        </h1>

        <p class="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Supercharge your Discord server with advanced auto-moderation, multi-category tickets, leveling, custom embeds, voice channels, and ban appeals.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4 mb-16">
          <a href="https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=8&scope=bot%20applications.commands" target="_blank" class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-all duration-200 shadow-xl shadow-indigo-600/25 active:scale-95">
            ${icon('plus', 18)} Add to Discord
          </a>
          <a href="/dashboard" class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 font-semibold text-base transition-all duration-200 active:scale-95">
            ${icon('layout-dashboard', 18)} Open Dashboard
          </a>
        </div>

        <!-- Live Metrics Banner -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto p-6 bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 rounded-3xl shadow-2xl mb-24">
          <div class="text-center p-3">
            <div class="text-2xl md:text-3xl font-extrabold text-white" id="stat-servers">--</div>
            <div class="text-xs text-neutral-500 font-medium mt-1">Servers Protected</div>
          </div>
          <div class="text-center p-3 border-l border-neutral-800">
            <div class="text-2xl md:text-3xl font-extrabold text-white" id="stat-users">--</div>
            <div class="text-xs text-neutral-500 font-medium mt-1">Users Served</div>
          </div>
          <div class="text-center p-3 border-l border-neutral-800">
            <div class="text-2xl md:text-3xl font-extrabold text-emerald-400" id="stat-uptime">99.98%</div>
            <div class="text-xs text-neutral-500 font-medium mt-1">System Uptime</div>
          </div>
          <div class="text-center p-3 border-l border-neutral-800">
            <div class="text-2xl md:text-3xl font-extrabold text-indigo-400" id="stat-ping">18ms</div>
            <div class="text-xs text-neutral-500 font-medium mt-1">Gateway Latency</div>
          </div>
        </div>

        <!-- Features Showcase Grid -->
        <div class="text-left mb-24">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Engineered for Perfection</h2>
            <p class="text-neutral-400 text-sm md:text-base">Everything your team needs to moderate, engage, and scale your Discord server.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Feature 1: Automod -->
            <div class="p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 group">
              <div class="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                ${icon('shield-alert', 24)}
              </div>
              <h3 class="text-xl font-bold text-white mb-2">Automated Moderation</h3>
              <p class="text-neutral-400 text-sm leading-relaxed mb-4">Instant protection against invites, phishing domains, mass mentions, profanity, and raids with configurable automated escalation.</p>
              <div class="text-xs font-semibold text-red-400/90 flex items-center gap-1.5">
                Zero-delay regex filters ${icon('arrow-right', 12)}
              </div>
            </div>

            <!-- Feature 2: Tickets -->
            <div class="p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 group">
              <div class="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                ${icon('ticket', 24)}
              </div>
              <h3 class="text-xl font-bold text-white mb-2">Support Ticket Desk</h3>
              <p class="text-neutral-400 text-sm leading-relaxed mb-4">Deploy interactive ticket panels with custom dropdown categories, staff assignment roles, automatic transcript generation, and ticket limits.</p>
              <div class="text-xs font-semibold text-teal-400/90 flex items-center gap-1.5">
                Discord Components V2 ${icon('arrow-right', 12)}
              </div>
            </div>

            <!-- Feature 3: Leveling -->
            <div class="p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 group">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                ${icon('activity', 24)}
              </div>
              <h3 class="text-xl font-bold text-white mb-2">Leveling & Rewards</h3>
              <p class="text-neutral-400 text-sm leading-relaxed mb-4">Boost chat activity with customizable XP multipliers, automated role rewards, level-up celebration cards, and public leaderboards.</p>
              <div class="text-xs font-semibold text-emerald-400/90 flex items-center gap-1.5">
                Visual rank cards ${icon('arrow-right', 12)}
              </div>
            </div>

            <!-- Feature 4: Embeds -->
            <div class="p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 group">
              <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                ${icon('palette', 24)}
              </div>
              <h3 class="text-xl font-bold text-white mb-2">Live Embed Studio</h3>
              <p class="text-neutral-400 text-sm leading-relaxed mb-4">Craft stunning Discord announcements with our WYSIWYG live embed builder. Save presets, attach buttons, and send to any channel.</p>
              <div class="text-xs font-semibold text-blue-400/90 flex items-center gap-1.5">
                Real-time preview ${icon('arrow-right', 12)}
              </div>
            </div>

            <!-- Feature 5: Temp Voice -->
            <div class="p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 group">
              <div class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                ${icon('volume-2', 24)}
              </div>
              <h3 class="text-xl font-bold text-white mb-2">Dynamic Temp Voice</h3>
              <p class="text-neutral-400 text-sm leading-relaxed mb-4">Join-to-create voice channels that automatically spin up private rooms when members join and clean them up when empty.</p>
              <div class="text-xs font-semibold text-purple-400/90 flex items-center gap-1.5">
                Automatic lifecycle ${icon('arrow-right', 12)}
              </div>
            </div>

            <!-- Feature 6: Ban Appeals -->
            <div class="p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 group">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                ${icon('gavel', 24)}
              </div>
              <h3 class="text-xl font-bold text-white mb-2">Web Ban Appeals</h3>
              <p class="text-neutral-400 text-sm leading-relaxed mb-4">Give penalized users a fair second chance with a branded web portal to review punishments, submit appeals, and let staff resolve them in 1-click.</p>
              <div class="text-xs font-semibold text-amber-400/90 flex items-center gap-1.5">
                Custom URL portal ${icon('arrow-right', 12)}
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ Accordion -->
        <div class="max-w-3xl mx-auto text-left mb-24">
          <h2 class="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
          <div class="flex flex-col gap-3" id="faq-container">
            ${[
              { q: 'Is Orbit free to use?', a: 'Yes! Orbit offers a complete set of enterprise-grade features including AutoMod, tickets, leveling, and custom embeds completely free for your Discord server.' },
              { q: 'How do I add Orbit to my server?', a: 'Simply click "Add to Discord" above, select your Discord server, and grant Administrator or Manage Server permissions. You can then configure modules in the web dashboard.' },
              { q: 'How does the Ban Appeal system work?', a: 'Orbit automatically includes your server\'s custom appeal link in moderation DMs. Banned or timed-out users sign in through the web portal to write an appeal, which your moderators can review directly in the dashboard.' },
              { q: 'Are Discord Components V2 supported?', a: 'Yes! Orbit uses modern Discord Components V2 cards with accent colors and interactive buttons for bot responses and ticket desks.' }
            ].map((item, idx) => `
              <div class="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900/60">
                <button type="button" class="w-full flex items-center justify-between p-5 text-left font-semibold text-white hover:text-indigo-400 transition-colors" onclick="toggleFaq(${idx})">
                  <span>${item.q}</span>
                  <span id="faq-icon-${idx}">${icon('chevron-down', 16)}</span>
                </button>
                <div id="faq-ans-${idx}" class="hidden px-5 pb-5 text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/50 pt-3">
                  ${item.a}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- CTA Banner -->
        <div class="p-12 rounded-3xl bg-gradient-to-b from-indigo-950/40 to-neutral-900 border border-indigo-500/20 text-center relative overflow-hidden mb-16">
          <div class="relative z-10 max-w-xl mx-auto">
            <h2 class="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to upgrade your server?</h2>
            <p class="text-neutral-400 text-sm md:text-base mb-8">Join thousands of members enjoying a cleaner, safer, and more interactive Discord experience with Orbit.</p>
            <a href="https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=8&scope=bot%20applications.commands" target="_blank" class="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-black font-semibold hover:bg-neutral-200 transition-all active:scale-95">
              ${icon('plus', 18)} Get Started with Orbit
            </a>
          </div>
        </div>

        <!-- Footer -->
        <footer class="pt-12 border-t border-neutral-800 text-neutral-500 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <img src="/img/logo.png" class="w-6 h-6 rounded-full" alt="Orbit">
            <span class="font-bold text-white">Orbit</span> &copy; 2026. All rights reserved.
          </div>
          <div class="flex items-center gap-6">
            <a href="/docs" class="hover:text-white transition-colors">Documentation</a>
            <a href="/status" class="hover:text-white transition-colors">Status</a>
            <a href="/terms" class="hover:text-white transition-colors">Terms</a>
            <a href="/privacy" class="hover:text-white transition-colors">Privacy</a>
          </div>
        </footer>
      </div>
    </div>
  `;

  // FAQ Toggle Helper
  window.toggleFaq = (idx) => {
    const ans = document.getElementById(`faq-ans-${idx}`);
    const ic = document.getElementById(`faq-icon-${idx}`);
    if (!ans) return;
    const isHidden = ans.classList.contains('hidden');
    ans.classList.toggle('hidden');
    if (ic) ic.innerHTML = isHidden ? icon('chevron-up', 16) : icon('chevron-down', 16);
  };

  // Fetch live stats
  API.getStats().then(stats => {
    if (stats) {
      if (stats.guilds) document.getElementById('stat-servers').textContent = stats.guilds.toLocaleString();
      if (stats.users) document.getElementById('stat-users').textContent = stats.users.toLocaleString();
    }
  }).catch(() => {});

  // Particles animation
  initParticles();
};

function initParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);

  const particles = Array.from({ length: 40 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    radius: Math.random() * 2 + 1,
    alpha: Math.random() * 0.4 + 0.1
  }));

  let animId;
  function render() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129, 140, 248, ${p.alpha})`;
      ctx.fill();
    });
    animId = requestAnimationFrame(render);
  }
  render();

  window.addEventListener('resize', () => {
    if (!canvas) return;
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }, { once: true });
}
