/**
 * Orbit Documentation Engine & Layout
 * 1:1 Fumadocs / Volt Notebook Layout Implementation
 * Adapted to Orbit Bot's dark grey aesthetic and features.
 */

window.Pages = window.Pages || {};

(function() {
  // SVGs for navigation items matching Volt lucide icons
  const SVG_ICONS = {
    'book-open': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open" aria-hidden="true"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>',
    'rocket': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 9v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>',
    'shield': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    'users': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    'sparkles': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>',
    'check-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2" aria-hidden="true"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>',
    'tag': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tag" aria-hidden="true"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path></svg>',
    'bar-chart': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart-3" aria-hidden="true"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>',
    'award': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-award" aria-hidden="true"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>',
    'message-square': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    'gift': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>',
    'shield-alert': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>',
    'lock': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    'user-x': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-x" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg>',
    'file-text': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    'inbox': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-inbox" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>',
    'mic': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>',
    'database': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>',
    'bot': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot" aria-hidden="true"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>',
    'terminal': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-terminal" aria-hidden="true"><path d="m4 17 6-6-6-6"></path><path d="M12 19h8"></path></svg>',
    'code': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-2" aria-hidden="true"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>'
  };

  // Categories & Items matching 1:1 Fumadocs tree navigation
  const DOCS_CATEGORIES = [
    {
      title: null, // Top-level un-grouped
      items: [
        { id: 'overview', title: 'Introduction', icon: 'book-open', desc: 'Architecture, design principles, and core features of Orbit.' },
        { id: 'quickstart', title: 'Quickstart Setup', icon: 'rocket', desc: 'Get Orbit running in your Discord server in under 2 minutes.' },
        { id: 'permissions', title: 'Bot Permissions', icon: 'shield', desc: 'Breakdown of Discord permissions and role hierarchy.' }
      ]
    },
    {
      title: 'Community & Onboarding',
      items: [
        { id: 'welcome', title: 'Welcome & Goodbye', icon: 'users', desc: 'Customizable greeting cards, direct messages, and leave logs.' },
        { id: 'boost', title: 'Boost Messages & Perks', icon: 'sparkles', desc: 'Boost celebration cards, vanity perks, and reward roles.' },
        { id: 'verification', title: 'Verification & Captcha', icon: 'check-circle', desc: 'Web portal captcha, button verify, and quarantine roles.' },
        { id: 'roles', title: 'Auto & Reaction Roles', icon: 'tag', desc: 'Interactive dropdowns, button matrices, and on-join roles.' }
      ]
    },
    {
      title: 'Engagement & Statistics',
      items: [
        { id: 'serverstats', title: 'ServerStats Channels', icon: 'bar-chart', desc: 'Dynamic voice & text counters for members, bots, and boosts.' },
        { id: 'level', title: 'Level & XP Progression', icon: 'award', desc: 'Chat/voice XP, role multipliers, rank cards, and leaderboard.' },
        { id: 'autoresponder', title: 'AutoResponder Triggers', icon: 'message-square', desc: 'Keyword & regex auto-replies with dynamic variables.' },
        { id: 'giveaways', title: 'Giveaways & Polls', icon: 'gift', desc: 'Interactive button giveaways, requirements, and live voting polls.' }
      ]
    },
    {
      title: 'Moderation & Security',
      items: [
        { id: 'automod', title: 'Auto-Moderation Engine', icon: 'shield-alert', desc: 'Regex filter, invite blocker, anti-spam, and auto-punishments.' },
        { id: 'security', title: 'Security & Anti-Raid', icon: 'lock', desc: 'Mass-join detection, suspicious account filters, and lockdown.' },
        { id: 'inactive-kick', title: 'Inactive Member Kick', icon: 'user-x', desc: 'Automated prune of inactive accounts with role exemptions.' },
        { id: 'appeals', title: 'Ban Appeal Web Portal', icon: 'file-text', desc: 'OAuth2 web appeal portal for banned users with review dashboard.' }
      ]
    },
    {
      title: 'Utility & Management',
      items: [
        { id: 'tickets', title: 'Support Ticket Panels', icon: 'inbox', desc: 'Multi-category ticket selects, claim system, and HTML transcripts.' },
        { id: 'tempvoice', title: 'Join to Create (Voice)', icon: 'mic', desc: 'Automatic temporary voice channels with owner management embed.' },
        { id: 'backups', title: 'Server Snapshots & Backups', icon: 'database', desc: 'Full structure backups with one-click restore.' },
        { id: 'bot-profile', title: 'Custom Bot Profile', icon: 'bot', desc: 'Server-specific bot nickname, custom avatar, and about me.' }
      ]
    },
    {
      title: 'References',
      items: [
        { id: 'commands', title: 'Slash Commands Directory', icon: 'terminal', desc: 'Alphabetical directory of all 40+ Orbit slash commands.' },
        { id: 'variables', title: 'Variables & Placeholders', icon: 'code', desc: 'Complete cheat sheet of dynamic string tokens and formatters.' }
      ]
    }
  ];

  // Flat list helper
  function getFlatArticlesList() {
    const list = [];
    DOCS_CATEGORIES.forEach(cat => {
      cat.items.forEach(item => {
        list.push({ ...item, categoryTitle: cat.title || 'Getting Started' });
      });
    });
    return list;
  }

  // Articles dictionary
  const DOCS_ARTICLES = {
    overview: {
      category: 'Getting Started',
      title: 'Introduction',
      desc: 'The official documentation for Orbit Discord Bot.',
      content: `
        <p>The official documentation for <strong>Orbit</strong>.</p>
        <p>Orbit is a high-performance, modular Discord application engineered for high-concurrency servers, moderation, verification, and automated guild engagement.</p>
        <p>Here you can find comprehensive information about Orbit's modules, configuration options, and slash commands.</p>

        <div class="flex gap-2 my-4 rounded-xl border bg-fd-card p-3 ps-1 text-sm text-fd-card-foreground shadow-md" style="--callout-color: var(--color-fd-info, var(--color-fd-muted));">
          <div role="none" class="w-0.5 bg-(--callout-color)/50 rounded-sm"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide size-5 -me-0.5 fill-(--callout-color) text-fd-card"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          <div class="flex flex-col gap-2 min-w-0 flex-1">
            <div class="text-fd-muted-foreground prose-no-margin empty:hidden">
              <p>Zero Paywalls: All features in Orbit—including multi-category ticket panels, web ban appeals, server stats, and automod—are 100% accessible to every server owner with zero paywalled tier limits.</p>
            </div>
          </div>
        </div>

        <hr class="border-fd-border my-6">

        <h2 class="flex scroll-m-28 flex-row items-center gap-2 text-xl font-bold text-white mb-4" id="explore-the-docs">
          <a data-card="" href="#explore-the-docs" class="peer flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; width: 0.85em; height: 0.85em; vertical-align: -0.06em; margin-right: 0.5rem;"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>Explore the Docs
          </a>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        </h2>

        <div class="grid grid-cols-2 gap-3 @container explore-docs-grid">
          ${getFlatArticlesList().filter(x => x.id !== 'overview').map(item => `
            <a data-card="true" href="/docs/${item.id}" class="block rounded-xl border bg-fd-card p-4 text-fd-card-foreground transition-colors hover:bg-fd-accent/80">
              <h3 class="not-prose mb-1 text-sm font-medium text-white">${item.title}</h3>
              <div class="text-sm text-fd-muted-foreground prose-no-margin empty:hidden">
                <p>${item.desc}</p>
              </div>
            </a>
          `).join('')}
        </div>
      `
    },

    quickstart: {
      category: 'Getting Started',
      title: 'Quickstart Setup',
      desc: 'Get Orbit running in your Discord server in under 2 minutes.',
      content: `
        <h2 id="step-1" class="text-xl font-bold text-white mt-4 mb-2">1. Authorize Orbit</h2>
        <p>Use the official Discord OAuth2 link to invite Orbit to your server with required administrator or manage permissions.</p>

        <div class="fd-code-block">
          <div class="fd-code-header"><span>OFFICIAL INVITE LINK</span></div>
          <div class="fd-code-content">https://discord.com/oauth2/authorize?client_id=1411032158406541353&permissions=8&scope=bot%20applications.commands</div>
        </div>

        <h2 id="step-2" class="text-xl font-bold text-white mt-8 mb-2">2. Position Orbit's Role</h2>
        <p>In <strong>Server Settings &gt; Roles</strong>, drag the <code>Orbit</code> bot role above all regular member, booster, and moderator roles so it can manage them.</p>

        <h2 id="step-3" class="text-xl font-bold text-white mt-8 mb-2">3. Open Web Dashboard</h2>
        <p>Sign in at <code>/dashboard</code> to visually configure your Welcome cards, AutoMod rules, Ticket panels, and Level multipliers.</p>
      `
    },

    permissions: {
      category: 'Getting Started',
      title: 'Bot Permissions',
      desc: 'Detailed breakdown of Discord permissions and why Orbit requests them.',
      content: `
        <p>Orbit utilizes Discord's least-privilege principle where possible. Below is the list of key permissions and their respective modules.</p>

        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead>
              <tr><th>Permission</th><th>Required By</th><th>Purpose</th></tr>
            </thead>
            <tbody>
              <tr><td><code class="text-indigo-400">Manage Roles</code></td><td>Auto-Roles, Verification, Level, Boost</td><td>Assigning verified roles, level rewards, and booster vanity perks.</td></tr>
              <tr><td><code class="text-indigo-400">Manage Channels</code></td><td>ServerStats, Tickets, TempVoice</td><td>Creating private ticket rooms and updating live counter channels.</td></tr>
              <tr><td><code class="text-indigo-400">Moderate Members</code></td><td>AutoMod, Moderation</td><td>Executing timeouts on chat violators and spam accounts.</td></tr>
              <tr><td><code class="text-indigo-400">Manage Messages</code></td><td>AutoMod, Purge, Tickets</td><td>Deleting prohibited words, invite links, and command cleanup.</td></tr>
            </tbody>
          </table>
        </div>
      `
    },

    welcome: {
      category: 'Community & Onboarding',
      title: 'Welcome & Goodbye',
      desc: 'Configurable join and leave notifications, direct message greetings, dynamic cards, and embed builders.',
      content: `
        <h2 id="features" class="text-xl font-bold text-white mt-4 mb-3">Key Capabilities</h2>
        <ul class="list-disc list-inside space-y-2 text-neutral-300 text-sm">
          <li><strong>Channel Greeting Embeds:</strong> Send styled messages with custom title, description, color, and banner image.</li>
          <li><strong>Direct Message Greetings:</strong> Privately DM new joins with server rules, links, and guidance.</li>
          <li><strong>Goodbye Logs:</strong> Track departures with user tags, leave timestamps, and updated member count.</li>
        </ul>

        <h2 id="variables" class="text-xl font-bold text-white mt-8 mb-3">Dynamic Variables</h2>
        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead>
              <tr><th>Variable</th><th>Output</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="fd-var-tag">{user}</span></td><td>CyberNinja</td><td>Member username</td></tr>
              <tr><td><span class="fd-var-tag">{user.mention}</span></td><td>@CyberNinja</td><td>Interactive user mention</td></tr>
              <tr><td><span class="fd-var-tag">{server.member_count}</span></td><td>1,248</td><td>Total member count after join</td></tr>
            </tbody>
          </table>
        </div>
      `
    },

    boost: {
      category: 'Community & Onboarding',
      title: 'Boost Messages & Perks',
      desc: 'Celebrate Server Boosters with custom announcements, automated reward roles, and exclusive perks.',
      content: `
        <h2 id="features" class="text-xl font-bold text-white mt-4 mb-3">Boost Perks & Features</h2>
        <ul class="list-disc list-inside space-y-2 text-neutral-300 text-sm">
          <li><strong>Celebration Channel:</strong> Automatic broadcast whenever a member boosts or renews their tier.</li>
          <li><strong>Booster Role Rewards:</strong> Automatically award custom VIP roles or vanity permissions to boosters.</li>
          <li><strong>Tier Celebrations:</strong> Special alerts when your guild unlocks Server Level 1, 2, or 3 perks.</li>
        </ul>
      `
    },

    verification: {
      category: 'Community & Onboarding',
      title: 'Verification & Captcha',
      desc: 'Protect your community against raid bots and malicious user accounts.',
      content: `
        <h2 id="modes" class="text-xl font-bold text-white mt-4 mb-3">Verification Modes</h2>
        <p>Choose between <strong>One-Click Button Verify</strong>, <strong>Passcode Mode</strong>, or <strong>Web Portal Captcha</strong> with token-based anti-bot protection.</p>
      `
    },

    roles: {
      category: 'Community & Onboarding',
      title: 'Auto & Reaction Roles',
      desc: 'Automate role assignments on join and deploy interactive role selection menus.',
      content: `
        <h2 id="auto-roles" class="text-xl font-bold text-white mt-4 mb-3">Auto Roles on Join</h2>
        <p>Automatically grant base member roles upon guild join, separating verified users and bot accounts.</p>
      `
    },

    serverstats: {
      category: 'Engagement & Statistics',
      title: 'ServerStats Channels',
      desc: 'Real-time counters for member count, bots, online users, and boosts displayed in channel titles.',
      content: `
        <h2 id="metrics" class="text-xl font-bold text-white mt-4 mb-3">Counter Metrics</h2>
        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead>
              <tr><th>Metric</th><th>Placeholder Tag</th><th>Example</th></tr>
            </thead>
            <tbody>
              <tr><td>Total Members</td><td><span class="fd-var-tag">[members]</span></td><td>👥 Members: 1,420</td></tr>
              <tr><td>Human Members</td><td><span class="fd-var-tag">[humans]</span></td><td>👤 Humans: 1,390</td></tr>
              <tr><td>Server Boosts</td><td><span class="fd-var-tag">[boosts]</span></td><td>💎 Boosts: 14</td></tr>
            </tbody>
          </table>
        </div>
      `
    },

    level: {
      category: 'Engagement & Statistics',
      title: 'Level & XP Progression',
      desc: 'Reward active chatters and voice participants with customizable XP, level rewards, and web leaderboards.',
      content: `
        <h2 id="mechanics" class="text-xl font-bold text-white mt-4 mb-3">XP Mechanics</h2>
        <p>Configurable chat XP (15-25 XP per message, 60s cooldown), voice XP per minute, booster multipliers, and web leaderboards at <code>/leaderboard/:guildId</code>.</p>
      `
    },

    autoresponder: {
      category: 'Engagement & Statistics',
      title: 'AutoResponder Triggers',
      desc: 'Deploy custom auto-replies for FAQs, rules, and community shortcuts.',
      content: `
        <h2 id="match-modes" class="text-xl font-bold text-white mt-4 mb-3">Matching Modes</h2>
        <p>Supports <strong>Exact Match</strong>, <strong>Contains Word</strong>, and <strong>Regex Patterns</strong> with dynamic variable substitution.</p>
      `
    },

    giveaways: {
      category: 'Engagement & Statistics',
      title: 'Giveaways & Polls',
      desc: 'Host giveaways with role prerequisites and deploy interactive voting polls.',
      content: `
        <h2 id="features" class="text-xl font-bold text-white mt-4 mb-3">Giveaway Options</h2>
        <p>Timed button entry giveaways, minimum level or role requirements, multi-winner support, and reroll commands.</p>
      `
    },

    automod: {
      category: 'Moderation & Security',
      title: 'Auto-Moderation Engine',
      desc: 'Real-time regex content filter, anti-invite system, phishing scanner, and automated sanctions.',
      content: `
        <h2 id="filters" class="text-xl font-bold text-white mt-4 mb-3">Security Filters</h2>
        <p>Zero-latency word blacklist, Discord invite blocker, anti-phishing domain checker, mention flood limiter, and progressive punishment escalation (Warn &rarr; Timeout &rarr; Kick &rarr; Ban).</p>
      `
    },

    security: {
      category: 'Moderation & Security',
      title: 'Security & Anti-Raid',
      desc: 'Safeguard your server against mass bot joins, token raids, and malicious permissions.',
      content: `
        <h2 id="anti-raid" class="text-xl font-bold text-white mt-4 mb-3">Mass Join Velocity Filter</h2>
        <p>Automatically freezes server invites and isolates suspicious waves of accounts during raid attacks.</p>
      `
    },

    'inactive-kick': {
      category: 'Moderation & Security',
      title: 'Inactive Member Kick',
      desc: 'Keep your server roster clean by pruning accounts with prolonged inactivity.',
      content: `
        <h2 id="prune" class="text-xl font-bold text-white mt-4 mb-3">Automated Inactivity Pruner</h2>
        <p>Prune members with no message or voice activity over 30/60/90 days, with role whitelist exclusions.</p>
      `
    },

    appeals: {
      category: 'Moderation & Security',
      title: 'Ban Appeal Web Portal',
      desc: 'Give penalized users a fair, organized way to request unbans via an external web portal.',
      content: `
        <h2 id="portal" class="text-xl font-bold text-white mt-4 mb-3">OAuth2 Appeal Portal</h2>
        <p>Banned members sign in at <code>/appeal/:guildSlug</code> to explain their situation. Staff approve or deny directly in the dashboard.</p>
      `
    },

    tickets: {
      category: 'Utility & Management',
      title: 'Support Ticket Panels',
      desc: 'Persistent interactive ticket panels, multi-category routing, claim workflow, and HTML transcripts.',
      content: `
        <h2 id="panels" class="text-xl font-bold text-white mt-4 mb-3">Components V2 Support Panels</h2>
        <p>Dropdown category selects, automatic private channels, staff claim workflow, and full HTML transcripts saved to DM and logs.</p>
      `
    },

    tempvoice: {
      category: 'Utility & Management',
      title: 'Join to Create (Voice)',
      desc: 'Dynamic temporary voice rooms generated on-demand with interactive channel control panels.',
      content: `
        <h2 id="controls" class="text-xl font-bold text-white mt-4 mb-3">Voice Master Controls</h2>
        <p>Interactive controller embed allowing owners to lock, limit, rename, kick, and transfer room ownership.</p>
      `
    },

    backups: {
      category: 'Utility & Management',
      title: 'Server Snapshots & Backups',
      desc: 'Full guild snapshot engine with one-click restoration for channels, roles, and permission overwrites.',
      content: `
        <h2 id="snapshots" class="text-xl font-bold text-white mt-4 mb-3">Disaster Recovery</h2>
        <p>Encrypted backups of all roles, categories, channels, and permission overwrites with instant one-click restore.</p>
      `
    },

    'bot-profile': {
      category: 'Utility & Management',
      title: 'Custom Bot Profile',
      desc: 'Customize Orbit\'s appearance, nickname, and presence specifically for your server.',
      content: `
        <h2 id="profile" class="text-xl font-bold text-white mt-4 mb-3">Server-Specific Branding</h2>
        <p>Configure custom bot nickname, server avatar, and about-me status for your guild.</p>
      `
    },

    commands: {
      category: 'References',
      title: 'Slash Commands Directory',
      desc: 'Complete alphabetical directory of all 40+ Orbit slash commands, arguments, and permissions.',
      content: `
        <h2 id="commands-list" class="text-xl font-bold text-white mt-4 mb-3">Core Commands</h2>
        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead><tr><th>Command</th><th>Description</th><th>Permission</th></tr></thead>
            <tbody>
              <tr><td><code class="text-indigo-400">/help</code></td><td>Overview of all active bot modules</td><td>Everyone</td></tr>
              <tr><td><code class="text-indigo-400">/ping</code></td><td>Gateway latency in milliseconds</td><td>Everyone</td></tr>
              <tr><td><code class="text-indigo-400">/level [user]</code></td><td>View rank card and level progress</td><td>Everyone</td></tr>
              <tr><td><code class="text-indigo-400">/role all &lt;role&gt;</code></td><td>Mass-assign role to all members</td><td>Administrator</td></tr>
              <tr><td><code class="text-indigo-400">/ticket setup</code></td><td>Deploy interactive ticket panel</td><td>Manage Server</td></tr>
              <tr><td><code class="text-indigo-400">/welcome test</code></td><td>Test current welcome greeting embed</td><td>Manage Server</td></tr>
              <tr><td><code class="text-indigo-400">/lock [channel]</code></td><td>Halt channel chat during raids</td><td>Manage Channels</td></tr>
            </tbody>
          </table>
        </div>
      `
    },

    variables: {
      category: 'References',
      title: 'Variables & Placeholders',
      desc: 'Complete reference for dynamic string variables available in Welcome, Boost, AutoResponder, and Tickets.',
      content: `
        <h2 id="user-vars" class="text-xl font-bold text-white mt-4 mb-3">User Variables</h2>
        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead><tr><th>Variable</th><th>Output</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><span class="fd-var-tag">{user}</span></td><td>CyberNinja</td><td>Username</td></tr>
              <tr><td><span class="fd-var-tag">{user.mention}</span></td><td>@CyberNinja</td><td>User mention</td></tr>
              <tr><td><span class="fd-var-tag">{user.id}</span></td><td>1411032158406541353</td><td>Snowflake ID</td></tr>
              <tr><td><span class="fd-var-tag">{server.member_count}</span></td><td>2,450</td><td>Total members</td></tr>
              <tr><td><span class="fd-var-tag">{boost.count}</span></td><td>15</td><td>Total server boosts</td></tr>
            </tbody>
          </table>
        </div>
      `
    }
  };

  // ==========================================
  // 1:1 FUMADOCS NOTEBOOK LAYOUT RENDERER
  // ==========================================
  Pages.Docs = function(container, targetSlug) {
    const currentSlug = targetSlug || 'overview';
    const article = DOCS_ARTICLES[currentSlug] || DOCS_ARTICLES['overview'];

    // Update if already mounted
    const existingLayout = document.getElementById('nd-notebook-layout');
    if (existingLayout) {
      updateArticle(currentSlug, article);
      return;
    }

    container.innerHTML = `
      <div id="nd-notebook-layout" class="grid overflow-x-clip min-h-(--fd-docs-height) transition-[grid-template-columns] auto-cols-auto auto-rows-auto [--fd-docs-height:100dvh] [--fd-header-height:0px] [--fd-toc-popover-height:0px] [--fd-sidebar-width:0px] [--fd-toc-width:0px] volt-docs-grid" style="grid-template:&quot;. header header header .&quot;
              &quot;sidebar sidebar toc-popover toc-popover .&quot;
              &quot;sidebar sidebar main toc .&quot; 1fr / minmax(min-content, 1fr) var(--fd-sidebar-col) minmax(0, calc(var(--fd-layout-width,97rem) - var(--fd-sidebar-col) - var(--fd-toc-width))) var(--fd-toc-width) minmax(min-content, 1fr);--fd-docs-row-1:var(--fd-banner-height, 0px);--fd-docs-row-2:calc(var(--fd-docs-row-1) + var(--fd-header-height));--fd-docs-row-3:calc(var(--fd-docs-row-2) + var(--fd-toc-popover-height));--fd-sidebar-col:var(--fd-sidebar-width)">
        
        <!-- SIDEBAR PLACEHOLDER & ASIDE -->
        <div data-sidebar-placeholder="" class="sticky z-20 [grid-area:sidebar] pointer-events-none *:pointer-events-auto md:layout:[--fd-sidebar-width:268px] max-md:hidden top-(--fd-docs-row-2) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-2))]">
          <aside id="nd-sidebar" data-collapsed="false" data-hovered="false" class="absolute flex flex-col w-full start-0 inset-y-0 items-end text-sm duration-250 *:w-(--fd-sidebar-width)">
            <div class="flex flex-col gap-3 p-4 pb-2 empty:hidden">
              <button type="button" class="flex items-center gap-2 rounded-lg p-2 border border-fd-border bg-fd-secondary/50 text-start text-fd-secondary-foreground transition-colors hover:bg-fd-accent lg:hidden">
                <div class="size-5 shrink-0">${SVG_ICONS['book-open']}</div>
                <div><p class="text-sm font-medium">Docs</p></div>
              </button>
            </div>

            <!-- Scrollable Nav List -->
            <div dir="ltr" class="overflow-hidden min-h-0 flex-1 w-full" style="position:relative;--radix-scroll-area-corner-width:0px;--radix-scroll-area-corner-height:0px">
              <div data-radix-scroll-area-viewport="" class="size-full rounded-[inherit] p-4 overscroll-contain" style="overflow: hidden scroll; mask-image: linear-gradient(transparent, white 12px, white calc(100% - 12px), transparent);">
                <div style="min-width:100%;display:table" id="nd-sidebar-tree">
                  <!-- Generated links -->
                </div>
              </div>
            </div>

            <!-- Discord footer for mobile/tablet -->
            <div class="hidden flex-row text-fd-muted-foreground items-center border-t border-fd-border p-4 pt-2 max-lg:flex">
              <a href="https://discord.gg/orbit" rel="noreferrer noopener" target="_blank" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground p-1.5 [&_svg]:size-4.5 lg:hidden">
                <svg viewBox="0 0 24 24" fill="currentColor" class="size-4" aria-hidden="true"><path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.214.38-.46.892-.63 1.297a18.27 18.27 0 0 0-5.51 0A12.6 12.6 0 0 0 9.106 3 19.78 19.78 0 0 0 4.67 4.369C1.61 8.93.78 13.38 1.195 17.765a19.93 19.93 0 0 0 6.073 3.058c.49-.668.927-1.377 1.302-2.122-.715-.269-1.4-.6-2.046-.99.171-.125.34-.255.502-.388a14.2 14.2 0 0 0 12.148 0c.164.143.332.273.502.389-.648.39-1.334.722-2.05.99.376.745.81 1.454 1.302 2.122a19.9 19.9 0 0 0 6.075-3.058c.487-5.094-.831-9.504-3.486-13.4ZM8.02 15.09c-1.183 0-2.157-1.085-2.157-2.42 0-1.334.955-2.42 2.157-2.42 1.21 0 2.176 1.095 2.157 2.42 0 1.335-.955 2.42-2.157 2.42Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.42 0-1.334.955-2.42 2.157-2.42 1.21 0 2.176 1.095 2.157 2.42 0 1.335-.946 2.42-2.157 2.42Z"></path></svg>
              </a>
            </div>
          </aside>
        </div>

        <!-- HEADER SUBNAV -->
        <header data-transparent="true" id="nd-subnav" class="sticky [grid-area:header] flex flex-col top-(--fd-docs-row-1) z-10 backdrop-blur-sm transition-colors data-[transparent=false]:bg-fd-background/80 layout:[--fd-header-height:--spacing(14)] lg:layout:[--fd-header-height:--spacing(24)]">
          <div data-header-body="" class="flex border-b border-fd-border px-4 gap-2 h-14 md:px-6">
            <!-- Brand -->
            <div class="items-center flex flex-1">
              <a href="/" class="inline-flex items-center gap-2.5 font-semibold text-white">
                <img src="/img/logo.png" alt="Orbit" style="height:28px;width:auto;" class="rounded-lg">
                <span class="text-base tracking-tight font-bold">Orbit</span>
              </a>
            </div>

            <!-- Search Button -->
            <button type="button" data-search-full="" id="nd-search-btn" class="inline-flex items-center gap-2 border border-fd-border bg-fd-secondary/50 p-1.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground w-full my-auto max-md:hidden rounded-xl max-w-sm ps-2.5 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide size-4"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
              Search Orbit docs...
              <div class="ms-auto inline-flex gap-0.5">
                <kbd class="rounded-md border border-fd-border bg-fd-background px-1.5 text-[10px]">Ctrl</kbd>
                <kbd class="rounded-md border border-fd-border bg-fd-background px-1.5 text-[10px]">K</kbd>
              </div>
            </button>

            <!-- Right links -->
            <div class="flex flex-1 items-center justify-end md:gap-2">
              <a href="https://discord.gg/orbit" rel="noreferrer noopener" target="_blank" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground p-1.5 text-fd-muted-foreground max-lg:hidden" title="Discord">
                <svg viewBox="0 0 24 24" fill="currentColor" class="size-4"><path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.214.38-.46.892-.63 1.297a18.27 18.27 0 0 0-5.51 0A12.6 12.6 0 0 0 9.106 3 19.78 19.78 0 0 0 4.67 4.369C1.61 8.93.78 13.38 1.195 17.765a19.93 19.93 0 0 0 6.073 3.058c.49-.668.927-1.377 1.302-2.122-.715-.269-1.4-.6-2.046-.99.171-.125.34-.255.502-.388a14.2 14.2 0 0 0 12.148 0c.164.143.332.273.502.389-.648.39-1.334.722-2.05.99.376.745.81 1.454 1.302 2.122a19.9 19.9 0 0 0 6.075-3.058c.487-5.094-.831-9.504-3.486-13.4ZM8.02 15.09c-1.183 0-2.157-1.085-2.157-2.42 0-1.334.955-2.42 2.157-2.42 1.21 0 2.176 1.095 2.157 2.42 0 1.335-.955 2.42-2.157 2.42Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.42 0-1.334.955-2.42 2.157-2.42 1.21 0 2.176 1.095 2.157 2.42 0 1.335-.946 2.42-2.157 2.42Z"></path></svg>
              </a>
              <a href="/dashboard" class="inline-flex items-center justify-center rounded-xl text-xs font-semibold px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-sm transition-all">
                Dashboard
              </a>

              <!-- Mobile controls -->
              <div class="flex items-center md:hidden">
                <button type="button" id="nd-search-btn-mobile" class="inline-flex items-center justify-center rounded-md text-sm p-2 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground" aria-label="Open Search">
                  <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                </button>
                <button id="nd-mobile-sidebar-toggle" aria-label="Open Sidebar" class="inline-flex items-center justify-center rounded-md text-sm p-2 -me-1.5 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground">
                  <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Tabs row -->
          <div class="flex flex-row items-end gap-6 overflow-x-auto border-b border-fd-border px-6 h-10 max-lg:hidden" data-header-tabs="">
            <a class="inline-flex border-b-2 transition-colors items-center pb-1.5 font-medium gap-2 text-sm text-nowrap hover:text-fd-accent-foreground ${currentSlug !== 'commands' && currentSlug !== 'variables' ? 'border-fd-primary text-fd-primary active' : 'border-transparent text-fd-muted-foreground'}" href="/docs" ${currentSlug !== 'commands' && currentSlug !== 'variables' ? 'data-status="active" aria-current="page"' : ''}>
              ${SVG_ICONS['book-open']}Docs
            </a>
            <a href="/docs/commands" class="inline-flex border-b-2 transition-colors items-center pb-1.5 font-medium gap-2 text-sm text-nowrap hover:text-fd-accent-foreground ${currentSlug === 'commands' ? 'border-fd-primary text-fd-primary active' : 'border-transparent text-fd-muted-foreground'}">
              ${SVG_ICONS['terminal']}Slash Commands
            </a>
            <a href="/docs/variables" class="inline-flex border-b-2 transition-colors items-center pb-1.5 font-medium gap-2 text-sm text-nowrap hover:text-fd-accent-foreground ${currentSlug === 'variables' ? 'border-fd-primary text-fd-primary active' : 'border-transparent text-fd-muted-foreground'}">
              ${SVG_ICONS['code']}Variables Reference
            </a>
            <a href="/guides" class="inline-flex border-b-2 border-transparent transition-colors items-center pb-1.5 font-medium gap-2 text-fd-muted-foreground text-sm text-nowrap hover:text-fd-accent-foreground">
              ${SVG_ICONS['rocket']}Guides
            </a>
            <a href="/dashboard" class="inline-flex border-b-2 border-transparent transition-colors items-center pb-1.5 font-medium gap-2 text-fd-muted-foreground text-sm text-nowrap hover:text-fd-accent-foreground">
              ${SVG_ICONS['bot']}Dashboard
            </a>
          </div>
        </header>

        <!-- MOBILE TOC POPOVER -->
        <div data-state="closed" data-toc-popover="" class="sticky top-(--fd-docs-row-2) z-10 [grid-area:toc-popover] h-(--fd-toc-popover-height) xl:hidden max-xl:layout:[--fd-toc-popover-height:--spacing(10)]">
          <header class="border-b border-fd-border backdrop-blur-sm transition-colors">
            <button type="button" aria-expanded="false" data-state="closed" class="flex w-full h-10 items-center text-sm text-fd-muted-foreground gap-2.5 px-4 py-2.5 text-start focus-visible:outline-none [&_svg]:size-4 md:px-6 cursor-pointer" data-toc-popover-trigger="" id="nd-toc-popover-btn">
              <svg role="progressbar" viewBox="0 0 24 24" aria-valuenow="1" aria-valuemin="0" aria-valuemax="1" class="shrink-0 size-4"><circle cx="12" cy="12" r="11" fill="none" stroke-width="2" class="stroke-current/25"></circle><circle cx="12" cy="12" r="11" fill="none" stroke-width="2" stroke="currentColor" stroke-dasharray="69.1" stroke-dashoffset="0" stroke-linecap="round" transform="rotate(-90 12 12)" class="transition-all"></circle></svg>
              <span class="grid flex-1">
                <span class="truncate" id="nd-toc-popover-label">On this page</span>
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide shrink-0 transition-transform mx-0.5 size-4" id="nd-toc-popover-chevron"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <div id="nd-toc-popover-dropdown" class="hidden overflow-hidden flex flex-col px-4 max-h-[50vh] md:px-6 py-2 bg-fd-card border-t border-fd-border gap-2"></div>
          </header>
        </div>

        <!-- MAIN ARTICLE -->
        <article id="nd-page" data-full="false" class="flex flex-col [grid-area:main] px-4 py-6 gap-4 md:px-6 md:pt-8 xl:px-8 xl:pt-14 *:max-w-[900px]">
          <h1 class="text-[1.75em] font-semibold text-white" id="nd-page-title">${article.title}</h1>
          <div class="prose flex-1 text-neutral-300 text-sm leading-relaxed" id="nd-page-body">
            ${article.content}
          </div>

          <!-- Bottom Pagination matching snippet -->
          <div class="@container grid gap-4 grid-cols-1 pt-6 border-t border-fd-border mt-8" id="nd-pagination">
            <!-- Rendered via JS -->
          </div>
        </article>

        <!-- RIGHT TOC -->
        <div id="nd-toc" class="sticky top-(--fd-docs-row-3) [grid-area:toc] h-[calc(var(--fd-docs-height)-var(--fd-docs-row-3))] flex flex-col w-(--fd-toc-width) pt-12 pe-4 pb-2 xl:layout:[--fd-toc-width:268px] max-xl:hidden">
          <h3 id="toc-title" class="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide size-4"><path d="M15 18H3"></path><path d="M17 6H3"></path><path d="M21 12H3"></path></svg>On this page
          </h3>
          <div class="relative min-h-0 text-sm ms-px overflow-auto [scrollbar-width:none] mask-[linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-3">
            <div role="none" class="absolute top-(--fd-top) h-(--fd-height) w-px bg-fd-primary transition-all" id="nd-toc-active-line" style="--fd-top: 12px; --fd-height: 20px;"></div>
            <div class="flex flex-col border-s border-fd-foreground/10" id="nd-toc-links">
              <!-- Rendered via JS -->
            </div>
          </div>
        </div>

        <!-- SEARCH MODAL -->
        <div id="nd-search-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div class="w-full max-w-xl rounded-2xl bg-fd-card border border-fd-border shadow-2xl overflow-hidden flex flex-col">
            <div class="flex items-center gap-3 px-4 py-3.5 border-b border-fd-border">
              <svg class="w-4 h-4 text-fd-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
              <input type="text" id="nd-search-input" placeholder="Search documentation, guides, slash commands..." class="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none">
              <kbd class="px-1.5 py-0.5 text-[10px] font-mono bg-fd-secondary text-neutral-400 rounded border border-fd-border">ESC</kbd>
            </div>
            <div id="nd-search-results" class="max-h-96 overflow-y-auto p-2 flex flex-col gap-1"></div>
          </div>
        </div>

      </div>
    `;

    renderSidebar(currentSlug);
    renderToc();
    renderPagination(currentSlug);
    bindEvents();
  };

  // Helper: Update article on route switch
  function updateArticle(slug, article) {
    document.getElementById('nd-page-title').textContent = article.title;
    document.getElementById('nd-page-body').innerHTML = article.content;

    // Update active tab styles in header
    const headerTabs = document.querySelectorAll('[data-header-tabs] a');
    headerTabs.forEach(a => {
      const href = a.getAttribute('href');
      const isActive = (href === `/docs/${slug}`) || (href === '/docs' && slug !== 'commands' && slug !== 'variables');
      if (isActive) {
        a.className = 'inline-flex border-b-2 transition-colors items-center pb-1.5 font-medium gap-2 text-sm text-nowrap border-fd-primary text-fd-primary active';
        a.setAttribute('data-status', 'active');
        a.setAttribute('aria-current', 'page');
      } else {
        a.className = 'inline-flex border-b-2 border-transparent transition-colors items-center pb-1.5 font-medium gap-2 text-fd-muted-foreground text-sm text-nowrap hover:text-fd-accent-foreground';
        a.removeAttribute('data-status');
        a.removeAttribute('aria-current');
      }
    });

    renderSidebar(slug);
    renderToc();
    renderPagination(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Render sidebar links matching 1:1 Fumadocs layout
  function renderSidebar(activeSlug) {
    const tree = document.getElementById('nd-sidebar-tree');
    if (!tree) return;

    let html = '';
    DOCS_CATEGORIES.forEach(cat => {
      if (cat.title) {
        html += `
          <p class="inline-flex items-center gap-2 mb-1.5 px-2 mt-6 empty:mb-0 first:mt-0 [&_svg]:size-4 [&_svg]:shrink-0 text-xs font-semibold text-fd-muted-foreground uppercase tracking-wider" style="padding-inline-start: calc(2 * var(--spacing, 4px));">
            <span>${cat.title}</span>
          </p>
        `;
      }

      cat.items.forEach(item => {
        const isActive = item.id === activeSlug;
        const iconSvg = SVG_ICONS[item.icon] || SVG_ICONS['book-open'];
        html += `
          <a data-active="${isActive ? 'true' : 'false'}" href="/docs/${item.id}" class="relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors ${isActive ? 'active' : ''}" style="padding-inline-start: calc(2 * var(--spacing, 4px));" ${isActive ? 'data-status="active" aria-current="page"' : ''}>
            <span>${iconSvg}</span>
            <span>${item.title}</span>
          </a>
        `;
      });
    });

    tree.innerHTML = html;
  }

  // Render Table of Contents
  function renderToc() {
    const body = document.getElementById('nd-page-body');
    const tocLinks = document.getElementById('nd-toc-links');
    const popoverDropdown = document.getElementById('nd-toc-popover-dropdown');
    if (!body || !tocLinks) return;

    const headings = body.querySelectorAll('h2[id], h3[id]');
    if (!headings.length) {
      tocLinks.innerHTML = `<span class="prose py-1.5 text-xs text-fd-muted-foreground ps-3">No sections</span>`;
      if (popoverDropdown) popoverDropdown.innerHTML = `<span class="text-xs text-fd-muted-foreground">No sections</span>`;
      return;
    }

    let linksHtml = '';
    let popoverHtml = '';
    headings.forEach((h, idx) => {
      const id = h.getAttribute('id');
      const text = h.textContent.replace(/^#\s*/, '').trim();
      const isFirst = idx === 0;

      linksHtml += `
        <a data-active="${isFirst ? 'true' : 'false'}" href="#${id}" class="prose py-1.5 text-sm text-fd-muted-foreground transition-colors wrap-anywhere first:pt-0 last:pb-0 data-[active=true]:text-fd-primary ps-3">
          ${text}
        </a>
      `;

      popoverHtml += `
        <a href="#${id}" class="text-xs text-fd-muted-foreground hover:text-white py-1">
          ${text}
        </a>
      `;
    });

    tocLinks.innerHTML = linksHtml;
    if (popoverDropdown) popoverDropdown.innerHTML = popoverHtml;

    // ScrollSpy observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          const links = tocLinks.querySelectorAll('a');
          links.forEach(l => {
            const matches = l.getAttribute('href') === `#${id}`;
            l.setAttribute('data-active', matches ? 'true' : 'false');
          });
          const popoverLabel = document.getElementById('nd-toc-popover-label');
          if (popoverLabel) popoverLabel.textContent = entry.target.textContent.replace(/^#\s*/, '').trim();
        }
      });
    }, { rootMargin: '0px 0px -70% 0px' });

    headings.forEach(h => observer.observe(h));
  }

  // Render bottom Previous / Next card matching snippet
  function renderPagination(currentSlug) {
    const container = document.getElementById('nd-pagination');
    if (!container) return;

    const flat = getFlatArticlesList();
    const idx = flat.findIndex(x => x.id === currentSlug);

    const prev = idx > 0 ? flat[idx - 1] : null;
    const next = idx < flat.length - 1 ? flat[idx + 1] : null;

    let html = '';
    if (next) {
      html += `
        <a href="/docs/${next.id}" class="flex flex-col gap-2 rounded-lg border border-fd-border bg-fd-card p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground text-end">
          <div class="inline-flex items-center gap-1.5 font-medium flex-row-reverse text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide -mx-1 size-4 shrink-0 rtl:rotate-180"><path d="m9 18 6-6-6-6"></path></svg>
            <p><span>${next.title}</span></p>
          </div>
          <p class="text-fd-muted-foreground truncate text-xs">${next.desc}</p>
        </a>
      `;
    } else if (prev) {
      html += `
        <a href="/docs/${prev.id}" class="flex flex-col gap-2 rounded-lg border border-fd-border bg-fd-card p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground text-start">
          <div class="inline-flex items-center gap-1.5 font-medium text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide -mx-1 size-4 shrink-0"><path d="m15 18-6-6 6-6"></path></svg>
            <p><span>${prev.title}</span></p>
          </div>
          <p class="text-fd-muted-foreground truncate text-xs">${prev.desc}</p>
        </a>
      `;
    }

    container.innerHTML = html;
  }

  // Bind interaction events
  function bindEvents() {
    // Search Modal
    const searchModal = document.getElementById('nd-search-modal');
    const searchInput = document.getElementById('nd-search-input');
    const searchResults = document.getElementById('nd-search-results');
    const searchBtn = document.getElementById('nd-search-btn');
    const searchBtnMobile = document.getElementById('nd-search-btn-mobile');

    function openSearch() {
      if (!searchModal) return;
      searchModal.classList.remove('hidden');
      searchModal.classList.add('flex');
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        searchDocs('');
      }
    }

    function closeSearch() {
      if (!searchModal) return;
      searchModal.classList.add('hidden');
      searchModal.classList.remove('flex');
    }

    if (searchBtn) searchBtn.onclick = openSearch;
    if (searchBtnMobile) searchBtnMobile.onclick = openSearch;

    if (searchModal) {
      searchModal.onclick = (e) => {
        if (e.target === searchModal) closeSearch();
      };
    }

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && searchModal && !searchModal.classList.contains('hidden')) {
        closeSearch();
      }
    });

    if (searchInput) {
      searchInput.oninput = (e) => searchDocs(e.target.value);
    }

    function searchDocs(query) {
      if (!searchResults) return;
      const q = query.trim().toLowerCase();
      const flat = getFlatArticlesList();
      const filtered = q ? flat.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.desc.toLowerCase().includes(q) ||
        item.categoryTitle.toLowerCase().includes(q)
      ) : flat.slice(0, 8);

      if (!filtered.length) {
        searchResults.innerHTML = `<div class="p-6 text-center text-xs text-fd-muted-foreground">No results for "${query}".</div>`;
        return;
      }

      searchResults.innerHTML = filtered.map(item => `
        <a href="/docs/${item.id}" onclick="document.getElementById('nd-search-modal').classList.add('hidden')" class="flex items-center justify-between p-3 rounded-xl hover:bg-fd-accent transition-colors">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-fd-muted-foreground">${item.categoryTitle}</span>
            <span class="text-sm font-semibold text-white">${item.title}</span>
            <span class="text-xs text-neutral-400 line-clamp-1">${item.desc}</span>
          </div>
          <svg class="w-4 h-4 text-neutral-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      `).join('');
    }

    // Mobile TOC Popover toggle
    const popoverBtn = document.getElementById('nd-toc-popover-btn');
    const popoverDropdown = document.getElementById('nd-toc-popover-dropdown');
    const popoverChevron = document.getElementById('nd-toc-popover-chevron');
    if (popoverBtn && popoverDropdown) {
      popoverBtn.onclick = () => {
        const isHidden = popoverDropdown.classList.contains('hidden');
        popoverDropdown.classList.toggle('hidden');
        if (popoverChevron) {
          popoverChevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      };
    }
  }

})();
