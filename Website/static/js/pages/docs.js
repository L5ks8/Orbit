/**
 * Orbit Documentation Engine & Layout
 * Fumadocs / Volt Notebook Layout Architecture
 * Comprehensive documentation for all Orbit Discord Bot features & commands.
 */

window.Pages = window.Pages || {};

(function() {
  // ==========================================
  // DOCUMENTATION DATA STORE
  // ==========================================
  const DOCS_CATEGORIES = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      items: [
        { id: 'overview', title: 'Introduction', icon: 'book-open', desc: 'Architecture, design principles, and core features of Orbit.' },
        { id: 'quickstart', title: 'Quickstart Setup', icon: 'rocket', desc: 'Get Orbit running in your Discord server in under 2 minutes.' },
        { id: 'permissions', title: 'Bot Permissions', icon: 'shield-alert', desc: 'Detailed breakdown of Discord permissions and role hierarchy.' }
      ]
    },
    {
      id: 'community',
      title: 'Community & Onboarding',
      items: [
        { id: 'welcome', title: 'Welcome & Goodbye', icon: 'hand-metal', badge: 'Popular', desc: 'Customizable greeting cards, direct messages, and leave logs.' },
        { id: 'boost', title: 'Boost Messages & Perks', icon: 'sparkles', badge: 'New', desc: 'Boost celebration cards, vanity perks, and reward roles.' },
        { id: 'verification', title: 'Verification & Captcha', icon: 'check-circle-2', desc: 'Web portal captcha, button verify, and quarantine roles.' },
        { id: 'roles', title: 'Auto & Reaction Roles', icon: 'user-check', desc: 'Interactive dropdowns, button matrices, and on-join roles.' }
      ]
    },
    {
      id: 'engagement',
      title: 'Engagement & Statistics',
      items: [
        { id: 'serverstats', title: 'ServerStats Channels', icon: 'bar-chart-3', badge: 'Updated', desc: 'Dynamic voice & text counters for members, bots, and boosts.' },
        { id: 'level', title: 'Level & XP Progression', icon: 'award', desc: 'Chat/voice XP, role multipliers, rank cards, and leaderboard.' },
        { id: 'autoresponder', title: 'AutoResponder Triggers', icon: 'message-square-plus', desc: 'Keyword & regex auto-replies with dynamic variables.' },
        { id: 'giveaways', title: 'Giveaways & Polls', icon: 'gift', desc: 'Interactive button giveaways, requirements, and live voting polls.' }
      ]
    },
    {
      id: 'moderation',
      title: 'Moderation & Security',
      items: [
        { id: 'automod', title: 'Auto-Moderation Engine', icon: 'shield-check', desc: 'Regex filter, invite blocker, anti-spam, and auto-punishments.' },
        { id: 'security', title: 'Security & Anti-Raid', icon: 'lock', desc: 'Mass-join detection, suspicious account filters, and lockdown.' },
        { id: 'inactive-kick', title: 'Inactive Member Kick', icon: 'user-x', desc: 'Automated prune of inactive accounts with role exemptions.' },
        { id: 'appeals', title: 'Ban Appeal Web Portal', icon: 'file-text', desc: 'OAuth2 web appeal portal for banned users with review dashboard.' }
      ]
    },
    {
      id: 'utility',
      title: 'Utility & Management',
      items: [
        { id: 'tickets', title: 'Support Ticket Panels', icon: 'inbox', desc: 'Multi-category ticket selects, claim system, and HTML transcripts.' },
        { id: 'tempvoice', title: 'Join to Create (Voice)', icon: 'mic', desc: 'Automatic temporary voice channels with owner management embed.' },
        { id: 'backups', title: 'Server Snapshots & Backups', icon: 'history', desc: 'Full structure backups with one-click restore.' },
        { id: 'bot-profile', title: 'Custom Bot Profile', icon: 'bot', desc: 'Server-specific bot nickname, custom avatar, and about me.' }
      ]
    },
    {
      id: 'references',
      title: 'References',
      items: [
        { id: 'commands', title: 'Slash Commands Index', icon: 'terminal', desc: 'Alphabetical directory of all 40+ Orbit slash commands.' },
        { id: 'variables', title: 'Variables & Placeholders', icon: 'code-2', desc: 'Complete cheat sheet of dynamic string tokens and formatters.' }
      ]
    }
  ];

  // Articles Dictionary
  const DOCS_ARTICLES = {
    overview: {
      category: 'Getting Started',
      title: 'Introduction to Orbit',
      badge: 'Core Engine',
      desc: 'High-performance, modular Discord infrastructure engineered for low-latency guild automation and enterprise server management.',
      content: `
        <p><strong>Orbit</strong> is an advanced, all-in-one Discord bot designed from the ground up to replace clutter with high-speed, integrated modules. Built using modern asynchronous Python 3.11 and Discord Components V2, Orbit delivers lightning-fast responses, real-time database synchronization via MongoDB, and an intuitive web management dashboard.</p>

        <div class="fd-callout fd-callout-info">
          <div class="flex flex-col gap-1">
            <strong class="text-white text-sm">Zero Paywalls & Complete Control</strong>
            <p class="text-xs text-neutral-300">All features in Orbit—including multi-category ticket panels, web ban appeals, server stats, and automod—are 100% accessible to every server owner with no paywalled tier limits.</p>
          </div>
        </div>

        <h2 id="core-pillars" class="text-xl font-bold text-white mt-8 mb-4">Core Architecture Pillars</h2>
        <div class="fd-card-grid">
          <div class="fd-feature-card">
            <div class="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span>Asynchronous Gateway</span>
            </div>
            <p class="text-xs text-neutral-400 leading-relaxed">Built with non-blocking event loops ensuring message filtering and button interactions respond within 15 milliseconds.</p>
          </div>

          <div class="fd-feature-card">
            <div class="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <span>Modular Architecture</span>
            </div>
            <p class="text-xs text-neutral-400 leading-relaxed">Every subsystem (AutoMod, Tickets, Level, ServerStats) functions independently. Enable only what your community needs.</p>
          </div>

          <div class="fd-feature-card">
            <div class="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <span>Web Dashboard Sync</span>
            </div>
            <p class="text-xs text-neutral-400 leading-relaxed">Instant live synchronization between web dashboard sliders, embed editors, and Discord live state.</p>
          </div>

          <div class="fd-feature-card">
            <div class="flex items-center gap-2 text-purple-400 font-semibold text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Proactive Security</span>
            </div>
            <p class="text-xs text-neutral-400 leading-relaxed">Integrated anti-phishing, invite protection, mass-join rate filters, and token-based captcha verification.</p>
          </div>
        </div>

        <h2 id="next-steps" class="text-xl font-bold text-white mt-8 mb-4">Recommended Next Steps</h2>
        <p>Follow our quickstart tutorial to invite Orbit, configure fundamental permissions, and deploy your first modules.</p>
      `
    },

    quickstart: {
      category: 'Getting Started',
      title: 'Quickstart Guide',
      badge: 'Tutorial',
      desc: 'Set up Orbit on your Discord server in 3 simple steps.',
      content: `
        <h2 id="step-1" class="text-xl font-bold text-white mt-4 mb-2">1. Invite Orbit to Your Guild</h2>
        <p>Use the official OAuth2 invite link to authorize Orbit. Ensure the bot is granted the recommended administrator permission or the required individual permissions for full functionality.</p>

        <div class="fd-code-block">
          <div class="fd-code-header">
            <span>OFFICIAL AUTHORIZATION LINK</span>
            <button class="fd-code-copy-btn" onclick="navigator.clipboard.writeText('https://discord.com/oauth2/authorize?client_id=1411032158406541353&permissions=8&scope=bot%20applications.commands')">Copy Link</button>
          </div>
          <div class="fd-code-content">https://discord.com/oauth2/authorize?client_id=1411032158406541353&permissions=8&scope=bot%20applications.commands</div>
        </div>

        <h2 id="step-2" class="text-xl font-bold text-white mt-8 mb-2">2. Position Orbit's Role</h2>
        <p>Discord enforces a strict role hierarchy: a bot cannot assign, manage, or moderate any role positioned above its highest role.</p>

        <div class="fd-callout fd-callout-warn">
          <div class="flex flex-col gap-1">
            <strong class="text-white text-sm">Crucial Setup Requirement</strong>
            <p class="text-xs text-neutral-300">Navigate to <strong>Server Settings &gt; Roles</strong> and drag the <code>Orbit</code> bot role as high as possible (above member, booster, and moderator roles).</p>
          </div>
        </div>

        <h2 id="step-3" class="text-xl font-bold text-white mt-8 mb-2">3. Access the Web Dashboard</h2>
        <p>Once invited, navigate to our web dashboard to configure your modules visually:</p>
        <p>1. Sign in with your Discord account via the top-right button.</p>
        <p>2. Select your server from the server selector grid.</p>
        <p>3. Customize your modules (Welcome, Boost, Tickets, Level, ServerStats) and hit <strong>Save Changes</strong>.</p>
      `
    },

    permissions: {
      category: 'Getting Started',
      title: 'Bot Permissions Reference',
      badge: 'Security',
      desc: 'Detailed breakdown of Discord permissions and why Orbit requests them.',
      content: `
        <p>Orbit utilizes Discord's least-privilege principle where possible. Below is the list of key permissions and the modules that require them.</p>

        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead>
              <tr>
                <th>Permission</th>
                <th>Required By</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code class="text-indigo-400">Manage Roles</code></td>
                <td>Auto-Roles, Verification, Level, Boost</td>
                <td>Assigning verified roles, level rewards, and booster vanity perks.</td>
              </tr>
              <tr>
                <td><code class="text-indigo-400">Manage Channels</code></td>
                <td>ServerStats, Tickets, TempVoice</td>
                <td>Creating private ticket rooms, updating live counter channels, and temporary voice rooms.</td>
              </tr>
              <tr>
                <td><code class="text-indigo-400">Moderate Members</code></td>
                <td>AutoMod, Moderation</td>
                <td>Executing timeouts on chat violators and spam accounts.</td>
              </tr>
              <tr>
                <td><code class="text-indigo-400">Manage Messages</code></td>
                <td>AutoMod, Purge, Tickets</td>
                <td>Deleting prohibited words, invite links, and cleaning up command triggers.</td>
              </tr>
              <tr>
                <td><code class="text-indigo-400">Embed Links & Attach Files</code></td>
                <td>All Modules</td>
                <td>Rendering rich Components V2 message embeds, rank cards, and transcripts.</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
    },

    welcome: {
      category: 'Community & Onboarding',
      title: 'Welcome & Goodbye Messages',
      badge: 'Onboarding',
      desc: 'Configurable join and leave notifications, direct message greetings, dynamic cards, and embed builders.',
      content: `
        <p>The Welcome & Goodbye module ensures every newcomer receives a warm, customized greeting and leaves a clear audit trail when members depart.</p>

        <h2 id="features" class="text-xl font-bold text-white mt-6 mb-3">Key Capabilities</h2>
        <ul class="list-disc list-inside space-y-2 text-neutral-300 text-sm">
          <li><strong>Channel Greeting Embeds:</strong> Send styled messages with custom title, description, color, thumbnail, and banner image.</li>
          <li><strong>Direct Message Greetings:</strong> Privately DM new joins with server rules, links, and guidance.</li>
          <li><strong>Goodbye Logs:</strong> Track departures with user tags, leave timestamps, and updated server member count.</li>
          <li><strong>Auto-Resizing Textarea Editor:</strong> Interactive dashboard editor with live Discord card preview.</li>
        </ul>

        <h2 id="variables" class="text-xl font-bold text-white mt-8 mb-3">Supported Variables</h2>
        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead>
              <tr><th>Variable</th><th>Output Example</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="fd-var-tag">{user}</span></td><td>User</td><td>Username of the joining member</td></tr>
              <tr><td><span class="fd-var-tag">{user.mention}</span></td><td>@User</td><td>Interactive mention tag</td></tr>
              <tr><td><span class="fd-var-tag">{user.id}</span></td><td>1411032158406541353</td><td>Discord snowflake ID</td></tr>
              <tr><td><span class="fd-var-tag">{server}</span></td><td>Orbit Community</td><td>Server display name</td></tr>
              <tr><td><span class="fd-var-tag">{server.member_count}</span></td><td>1,248</td><td>Total member count after join</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="commands" class="text-xl font-bold text-white mt-8 mb-3">Slash Commands</h2>
        <div class="fd-code-block">
          <div class="fd-code-header"><span>SLASH COMMANDS</span></div>
          <div class="fd-code-content">/welcome test &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Dispatches a test welcome card to verify layout
/welcome channel &nbsp;&nbsp;&nbsp;&nbsp;# Sets the active welcome broadcast channel</div>
        </div>
      `
    },

    boost: {
      category: 'Community & Onboarding',
      title: 'Boost Messages & Perks',
      badge: 'Community',
      desc: 'Celebrate Server Boosters with custom announcements, automated reward roles, and exclusive perks.',
      content: `
        <p>The Boost module allows you to thank and reward members who upgrade your Discord server with Server Boosts.</p>

        <h2 id="features" class="text-xl font-bold text-white mt-6 mb-3">Boost Perks & Features</h2>
        <ul class="list-disc list-inside space-y-2 text-neutral-300 text-sm">
          <li><strong>Celebration Channel:</strong> Automatic broadcast whenever a member boosts or renews their tier.</li>
          <li><strong>Booster Role Rewards:</strong> Automatically award custom VIP roles or vanity permissions to boosters.</li>
          <li><strong>Tier Celebrations:</strong> Special alerts when your guild unlocks Server Level 1, 2, or 3 perks.</li>
          <li><strong>Dynamic Variables:</strong> Display total boost count, booster rank, and server level dynamically.</li>
        </ul>

        <h2 id="variables" class="text-xl font-bold text-white mt-8 mb-3">Boost Variables</h2>
        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead>
              <tr><th>Variable</th><th>Output</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="fd-var-tag">{user}</span></td><td>@Booster</td><td>Mention of the boosting member</td></tr>
              <tr><td><span class="fd-var-tag">{boost.count}</span></td><td>14</td><td>Total current server boosts</td></tr>
              <tr><td><span class="fd-var-tag">{boost.tier}</span></td><td>Tier 2</td><td>Current server boost tier</td></tr>
              <tr><td><span class="fd-var-tag">{server}</span></td><td>Orbit Guild</td><td>Name of the server</td></tr>
            </tbody>
          </table>
        </div>
      `
    },

    verification: {
      category: 'Community & Onboarding',
      title: 'Verification & Anti-Bot Captcha',
      badge: 'Security',
      desc: 'Protect your community against raid bots and malicious user accounts.',
      content: `
        <p>Orbit features a multi-tiered verification engine designed to stop automated raid attacks before bots can interact with your members.</p>

        <h2 id="modes" class="text-xl font-bold text-white mt-6 mb-3">Verification Modes</h2>
        <div class="fd-card-grid">
          <div class="fd-feature-card">
            <h3 class="text-white font-bold text-sm">One-Click Button Verify</h3>
            <p class="text-xs text-neutral-400">Members click an interactive button to agree to the rules and gain full membership immediately.</p>
          </div>
          <div class="fd-feature-card">
            <h3 class="text-white font-bold text-sm">Web Portal Captcha (Recommended)</h3>
            <p class="text-xs text-neutral-400">Generates a secure, temporary web token. Users open the browser portal to solve an anti-bot puzzle.</p>
          </div>
          <div class="fd-feature-card">
            <h3 class="text-white font-bold text-sm">Passcode Verification</h3>
            <p class="text-xs text-neutral-400">Requires entering a hidden keyword found inside your community guidelines.</p>
          </div>
        </div>

        <h2 id="quarantine" class="text-xl font-bold text-white mt-8 mb-3">Quarantine Role Setup</h2>
        <p>To completely isolate unverified accounts, configure an <strong>Unverified Role</strong> with permissions revoked from reading general channels. Once verification succeeds, Orbit revokes the quarantine role and grants the <strong>Verified Role</strong> automatically.</p>
      `
    },

    roles: {
      category: 'Community & Onboarding',
      title: 'Auto Roles & Reaction Roles',
      badge: 'Roles',
      desc: 'Automate role assignments on join and deploy interactive role selection menus.',
      content: `
        <h2 id="auto-roles" class="text-xl font-bold text-white mt-4 mb-3">Auto Roles on Join</h2>
        <p>Automatically assign basic member roles as soon as a user joins your guild. You can also specify different default roles for verified human users and Discord bots.</p>

        <h2 id="reaction-roles" class="text-xl font-bold text-white mt-8 mb-3">Interactive Reaction Role Panels</h2>
        <p>Create clean, persistent message panels using modern Discord Dropdown Menus and Buttons:</p>
        <ul class="list-disc list-inside space-y-2 text-neutral-300 text-sm mt-3">
          <li><strong>Dropdown Selects:</strong> Allow members to choose notification roles, pronouns, or game pings cleanly without emoji spam.</li>
          <li><strong>Single-Choice Modes:</strong> Ideal for region selection or mutually exclusive roles (e.g., Red vs Blue team).</li>
          <li><strong>Multi-Choice Modes:</strong> Allow members to toggle as many roles as desired.</li>
        </ul>
      `
    },

    serverstats: {
      category: 'Engagement & Statistics',
      title: 'ServerStats Voice & Text Channels',
      badge: 'Statistics',
      desc: 'Real-time counters for member count, bots, online users, and boosts displayed in channel titles.',
      content: `
        <p>ServerStats transforms ordinary Discord voice or text channels into dynamic live counters that refresh automatically.</p>

        <h2 id="supported-metrics" class="text-xl font-bold text-white mt-6 mb-3">Available Counter Metrics</h2>
        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead>
              <tr><th>Metric</th><th>Placeholder Tag</th><th>Example Channel Name</th></tr>
            </thead>
            <tbody>
              <tr><td>Total Members</td><td><span class="fd-var-tag">[members]</span></td><td>👥 Members: 1,420</td></tr>
              <tr><td>Human Members</td><td><span class="fd-var-tag">[humans]</span></td><td>👤 Humans: 1,390</td></tr>
              <tr><td>Bot Accounts</td><td><span class="fd-var-tag">[bots]</span></td><td>🤖 Bots: 30</td></tr>
              <tr><td>Online Members</td><td><span class="fd-var-tag">[online]</span></td><td>🟢 Online: 480</td></tr>
              <tr><td>Server Boosts</td><td><span class="fd-var-tag">[boosts]</span></td><td>💎 Boosts: 14</td></tr>
              <tr><td>Boost Level</td><td><span class="fd-var-tag">[level]</span></td><td>🚀 Boost Level: 2</td></tr>
              <tr><td>Role Count</td><td><span class="fd-var-tag">[roles]</span></td><td>🏷️ Roles: 42</td></tr>
              <tr><td>Channel Count</td><td><span class="fd-var-tag">[channels]</span></td><td>📁 Channels: 58</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="rate-limits" class="text-xl font-bold text-white mt-8 mb-3">Discord Rate Limit Compliance</h2>
        <p>Discord limits channel renaming to <strong>twice per 10 minutes</strong> per channel. Orbit batches counter updates with an intelligent queue system so your server stays updated without ever getting rate-limited.</p>
      `
    },

    level: {
      category: 'Engagement & Statistics',
      title: 'Level & XP Progression',
      badge: 'Progression',
      desc: 'Reward active chatters and voice participants with customizable XP, level rewards, and web leaderboards.',
      content: `
        <p>Keep your community engaged with a gamified level system featuring rank cards, voice activity tracking, and role rewards.</p>

        <h2 id="mechanics" class="text-xl font-bold text-white mt-6 mb-3">XP Mechanics</h2>
        <ul class="list-disc list-inside space-y-2 text-neutral-300 text-sm">
          <li><strong>Chat XP:</strong> Configurable XP range per message (default: 15–25 XP) with a 60-second anti-spam cooldown.</li>
          <li><strong>Voice XP:</strong> Automatic XP accrual for every minute spent talking in an unmuted voice channel.</li>
          <li><strong>Role Multipliers:</strong> Grant 1.5x or 2x XP boosts to Server Boosters, VIPs, or active contributors.</li>
          <li><strong>Channel Blacklists:</strong> Disable XP gain in spam or bot command channels.</li>
        </ul>

        <h2 id="role-rewards" class="text-xl font-bold text-white mt-8 mb-3">Automated Role Rewards</h2>
        <p>Set milestones where members automatically receive new roles when hitting specific levels (e.g. Level 5 = Regular, Level 25 = Veteran, Level 50 = Elite).</p>

        <h2 id="leaderboard" class="text-xl font-bold text-white mt-8 mb-3">Web Leaderboard</h2>
        <p>Every server has access to an interactive public leaderboard at <code>/leaderboard/:guildId</code> displaying user avatars, levels, total XP, and rankings.</p>
      `
    },

    autoresponder: {
      category: 'Engagement & Statistics',
      title: 'AutoResponder Triggers',
      badge: 'Automation',
      desc: 'Deploy custom auto-replies for FAQs, rules, and community shortcuts.',
      content: `
        <p>Create automated replies triggered by specific keywords, exact phrases, or advanced regular expressions.</p>

        <h2 id="match-modes" class="text-xl font-bold text-white mt-6 mb-3">Trigger Matching Modes</h2>
        <div class="fd-card-grid">
          <div class="fd-feature-card">
            <h3 class="text-white font-bold text-sm">Exact Match</h3>
            <p class="text-xs text-neutral-400">Triggers only when the message consists entirely of the trigger phrase.</p>
          </div>
          <div class="fd-feature-card">
            <h3 class="text-white font-bold text-sm">Contains Word</h3>
            <p class="text-xs text-neutral-400">Triggers whenever the keyword appears anywhere within the sentence.</p>
          </div>
          <div class="fd-feature-card">
            <h3 class="text-white font-bold text-sm">Regex Pattern</h3>
            <p class="text-xs text-neutral-400">Matches complex patterns such as link formats or ticket numbers.</p>
          </div>
        </div>
      `
    },

    giveaways: {
      category: 'Engagement & Statistics',
      title: 'Giveaways & Polls',
      badge: 'Engagement',
      desc: 'Host giveaways with role prerequisites and deploy interactive voting polls.',
      content: `
        <p>Boost community engagement with instant button-based giveaways and interactive multi-choice polls.</p>

        <h2 id="giveaway-features" class="text-xl font-bold text-white mt-6 mb-3">Giveaway Options</h2>
        <ul class="list-disc list-inside space-y-2 text-neutral-300 text-sm">
          <li><strong>Role Requirements:</strong> Restrict entries to boosters, specific roles, or minimum level requirements.</li>
          <li><strong>Multiple Winners:</strong> Configure 1 to 20 winners with automated transparent random selection.</li>
          <li><strong>Reroll Support:</strong> Execute <code>/giveaway reroll</code> to pick a new winner if a participant is ineligible.</li>
        </ul>
      `
    },

    automod: {
      category: 'Moderation & Security',
      title: 'Auto-Moderation Engine',
      badge: 'Protection',
      desc: 'Real-time regex content filter, anti-invite system, phishing scanner, and automated sanctions.',
      content: `
        <p>The AutoMod engine scans incoming chat messages with sub-millisecond evaluation to eliminate spam, scam links, and abusive content.</p>

        <h2 id="filters" class="text-xl font-bold text-white mt-6 mb-3">Security Filters</h2>
        <ul class="list-disc list-inside space-y-2 text-neutral-300 text-sm">
          <li><strong>Prohibited Word & Regex Filter:</strong> Match exact words, wildcards, or custom regex expressions.</li>
          <li><strong>Discord Invite Blocker:</strong> Instantly deletes unauthorized server invite links (with channel/role bypasses).</li>
          <li><strong>Anti-Phishing & Scam Links:</strong> Actively checks shared domains against a constantly updated database of malicious phishing links.</li>
          <li><strong>Mention & Emoji Spam:</strong> Enforces strict thresholds (e.g., maximum 5 mentions or 10 emojis per message).</li>
        </ul>

        <h2 id="escalation" class="text-xl font-bold text-white mt-8 mb-3">Progressive Punishment Escalation</h2>
        <p>Configure automated consequences based on repeated infractions: <strong>1st strike:</strong> Warning &rarr; <strong>2nd strike:</strong> 1-hour timeout &rarr; <strong>3rd strike:</strong> 24-hour timeout &rarr; <strong>4th strike:</strong> Kick or Ban.</p>
      `
    },

    security: {
      category: 'Moderation & Security',
      title: 'Security & Anti-Raid',
      badge: 'Defense',
      desc: 'Safeguard your server against mass bot joins, token raids, and malicious permissions.',
      content: `
        <h2 id="anti-raid" class="text-xl font-bold text-white mt-4 mb-3">Mass Join Protection</h2>
        <p>Orbit monitors member joining velocity. If more than a defined number of accounts (e.g. 10 users in 5 seconds) join, Orbit triggers <strong>Anti-Raid Mode</strong>, temporarily pausing invites and isolating incoming accounts.</p>

        <h2 id="panic-lockdown" class="text-xl font-bold text-white mt-8 mb-3">Emergency Server Lockdown</h2>
        <p>Execute <code>/lock all</code> during an active raid to instantly revoke <code>Send Messages</code> permissions across all public channels simultaneously. Execute <code>/unlock all</code> once the incident is resolved.</p>
      `
    },

    'inactive-kick': {
      category: 'Moderation & Security',
      title: 'Inactive Member Kick',
      badge: 'Maintenance',
      desc: 'Keep your server roster clean by pruning accounts with prolonged inactivity.',
      content: `
        <p>The Inactive Kick module scans your server to identify members who have not sent a message, joined voice, or interacted for a configurable duration (e.g., 30, 60, or 90 days).</p>

        <h2 id="whitelist" class="text-xl font-bold text-white mt-6 mb-3">Role Whitelist Protection</h2>
        <p>Ensure critical members are never touched by whitelisting roles such as <code>Staff</code>, <code>Booster</code>, <code>VIP</code>, or <code>Donator</code>. Whitelisted members are completely ignored during pruning runs.</p>
      `
    },

    appeals: {
      category: 'Moderation & Security',
      title: 'Ban Appeal Web Portal',
      badge: 'Portal',
      desc: 'Give penalized users a fair, organized way to request unbans via an external web portal.',
      content: `
        <p>Orbit includes a standalone ban appeal portal at <code>/appeal/:guildSlug</code>. Whenever a member is banned, Orbit includes their personalized appeal link in their ban notification DM.</p>

        <h2 id="workflow" class="text-xl font-bold text-white mt-6 mb-3">Appeal Review Workflow</h2>
        <ol class="list-decimal list-inside space-y-2 text-neutral-300 text-sm">
          <li>The banned user visits your portal and signs in with their Discord account via OAuth2.</li>
          <li>They submit their explanation and agree to server terms.</li>
          <li>Server staff receive an instant dashboard alert with the case history and can <strong>Accept (Unban)</strong> or <strong>Deny</strong> with one click.</li>
        </ol>
      `
    },

    tickets: {
      category: 'Utility & Management',
      title: 'Support Ticket Panels',
      badge: 'Support',
      desc: 'Persistent interactive ticket panels, multi-category routing, claim workflow, and HTML transcripts.',
      content: `
        <p>Orbit provides a modern support ticket solution built with Discord Components V2 menus and buttons.</p>

        <h2 id="features" class="text-xl font-bold text-white mt-6 mb-3">Features & Functionality</h2>
        <ul class="list-disc list-inside space-y-2 text-neutral-300 text-sm">
          <li><strong>Multi-Category Menus:</strong> Route tickets to specialized categories (e.g. General Support, Billing, Staff Application, Bug Report).</li>
          <li><strong>Private Channels:</strong> Automatic creation with locked permissions, visible only to the ticket author and designated support roles.</li>
          <li><strong>Claim Ticket Workflow:</strong> Support staff claim a ticket to avoid duplicate work.</li>
          <li><strong>Full HTML Transcripts:</strong> Generates beautiful, searchable Discord-styled transcripts saved to database and sent to your logging channel and the user's DM.</li>
        </ul>

        <h2 id="ticket-commands" class="text-xl font-bold text-white mt-8 mb-3">Commands</h2>
        <div class="fd-code-block">
          <div class="fd-code-header"><span>TICKET SLASH COMMANDS</span></div>
          <div class="fd-code-content">/ticket setup &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Deploys a persistent ticket selection panel
/ticket close &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Closes the ticket with an optional reason and transcript
/ticket add &lt;user&gt; &nbsp;# Adds an additional member to the active ticket
/ticket claim &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Assigns the active ticket to the invoking moderator</div>
        </div>
      `
    },

    tempvoice: {
      category: 'Utility & Management',
      title: 'Join to Create (TempVoice)',
      badge: 'Voice',
      desc: 'Dynamic temporary voice rooms generated on-demand with interactive channel control panels.',
      content: `
        <p>Keep your voice channel list clutter-free. When a member joins the designated "Join to Create" lobby, Orbit instantly creates a private, temporary voice channel for them and moves them into it.</p>

        <h2 id="owner-controls" class="text-xl font-bold text-white mt-6 mb-3">Channel Owner Controls</h2>
        <p>The channel creator is sent an interactive Components V2 controller embed inside the channel chat allowing them to:</p>
        <ul class="list-disc list-inside space-y-2 text-neutral-300 text-sm mt-3">
          <li><strong>Lock / Unlock:</strong> Prevent other members from joining without permission.</li>
          <li><strong>User Limit:</strong> Set maximum participant limits (e.g. 2 for Duo, 5 for Squad).</li>
          <li><strong>Rename Channel:</strong> Change the voice channel name without server permissions.</li>
          <li><strong>Kick / Ban from Voice:</strong> Remove unwanted users from their voice session.</li>
          <li><strong>Transfer Ownership:</strong> Pass room ownership to a friend.</li>
        </ul>

        <h2 id="auto-delete" class="text-xl font-bold text-white mt-8 mb-3">Automated Cleanup</h2>
        <p>As soon as the last user leaves the temporary channel, Orbit removes it immediately, keeping your server clean.</p>
      `
    },

    backups: {
      category: 'Utility & Management',
      title: 'Server Snapshots & Backups',
      badge: 'Disaster Recovery',
      desc: 'Full guild snapshot engine with one-click restoration for channels, roles, and permission overwrites.',
      content: `
        <p>Protect your guild against accidental deletions, rogue administrator mistakes, or server nukes.</p>

        <h2 id="snapshot-data" class="text-xl font-bold text-white mt-6 mb-3">What is Backed Up</h2>
        <ul class="list-disc list-inside space-y-2 text-neutral-300 text-sm">
          <li><strong>Server Roles:</strong> Names, colors, permissions, hoisted status, and position ordering.</li>
          <li><strong>Categories & Channels:</strong> Text, voice, forum channels, topics, slowmode, and bitrate.</li>
          <li><strong>Permission Overwrites:</strong> Every granular role and user override on every channel.</li>
        </ul>

        <h2 id="commands" class="text-xl font-bold text-white mt-8 mb-3">Commands</h2>
        <div class="fd-code-block">
          <div class="fd-code-header"><span>BACKUP COMMANDS</span></div>
          <div class="fd-code-content">/backup create &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Generates a new encrypted snapshot of your server
/backup list &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Displays your existing snapshots with timestamps
/backup load &lt;id&gt; &nbsp;&nbsp;&nbsp;# Restores your server to the selected snapshot</div>
        </div>
      `
    },

    'bot-profile': {
      category: 'Utility & Management',
      title: 'Custom Bot Profile',
      badge: 'Personalization',
      desc: 'Customize Orbit\'s appearance, nickname, and presence specifically for your server.',
      content: `
        <p>Give Orbit a unique look tailored to your community's branding.</p>

        <h2 id="settings" class="text-xl font-bold text-white mt-6 mb-3">Available Profile Options</h2>
        <ul class="list-disc list-inside space-y-2 text-neutral-300 text-sm">
          <li><strong>Server Nickname:</strong> Set a custom display name in your guild member list.</li>
          <li><strong>Server Avatar:</strong> Upload an exclusive guild-specific bot icon.</li>
          <li><strong>About Me / Bio:</strong> Display a custom server bio when members click Orbit's profile.</li>
        </ul>
      `
    },

    commands: {
      category: 'References',
      title: 'Slash Commands Directory',
      badge: 'Reference',
      desc: 'Complete alphabetical directory of all 40+ Orbit slash commands, arguments, and required permissions.',
      content: `
        <p>Orbit features an extensive suite of Discord slash commands. All commands feature intuitive parameter autocomplete and permission checks.</p>

        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead>
              <tr>
                <th>Command</th>
                <th>Description</th>
                <th>Required Permission</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code class="text-indigo-400">/help</code></td><td>Interactive overview of all active modules and command categories</td><td>Everyone</td></tr>
              <tr><td><code class="text-indigo-400">/ping</code></td><td>Displays real-time Discord Gateway and API latency in milliseconds</td><td>Everyone</td></tr>
              <tr><td><code class="text-indigo-400">/level [user]</code></td><td>View your current rank card, total XP, level, and leaderboard place</td><td>Everyone</td></tr>
              <tr><td><code class="text-indigo-400">/leaderboard</code></td><td>Displays top 10 server members ranked by chat & voice XP</td><td>Everyone</td></tr>
              <tr><td><code class="text-indigo-400">/role all &lt;role&gt;</code></td><td>Mass assigns a role to every member in the guild</td><td>Administrator</td></tr>
              <tr><td><code class="text-indigo-400">/role rall &lt;role&gt;</code></td><td>Mass removes a role from all server members</td><td>Administrator</td></tr>
              <tr><td><code class="text-indigo-400">/warn &lt;user&gt; [reason]</code></td><td>Issues a formal moderation warning and increments strike count</td><td>Moderate Members</td></tr>
              <tr><td><code class="text-indigo-400">/timeout &lt;user&gt; &lt;duration&gt;</code></td><td>Applies Discord native timeout with case logging</td><td>Moderate Members</td></tr>
              <tr><td><code class="text-indigo-400">/kick &lt;user&gt; [reason]</code></td><td>Kicks a user and dispatches an appeal invitation DM</td><td>Kick Members</td></tr>
              <tr><td><code class="text-indigo-400">/ban &lt;user&gt; [reason]</code></td><td>Bans a user and records permanent case in audit log</td><td>Ban Members</td></tr>
              <tr><td><code class="text-indigo-400">/purge &lt;amount&gt;</code></td><td>Deletes specified number of recent messages in the channel</td><td>Manage Messages</td></tr>
              <tr><td><code class="text-indigo-400">/lock [channel]</code></td><td>Locks channel text permissions to halt chat raids</td><td>Manage Channels</td></tr>
              <tr><td><code class="text-indigo-400">/unlock [channel]</code></td><td>Restores normal member chat permissions</td><td>Manage Channels</td></tr>
              <tr><td><code class="text-indigo-400">/ticket setup</code></td><td>Deploys persistent support ticket dropdown or button panel</td><td>Manage Server</td></tr>
              <tr><td><code class="text-indigo-400">/welcome test</code></td><td>Sends test welcome greeting embed to the channel</td><td>Manage Server</td></tr>
              <tr><td><code class="text-indigo-400">/boost message</code></td><td>Configures booster announcement broadcast channel</td><td>Manage Server</td></tr>
              <tr><td><code class="text-indigo-400">/backup create</code></td><td>Creates a complete snapshot of roles and channels</td><td>Administrator</td></tr>
              <tr><td><code class="text-indigo-400">/giveaway start</code></td><td>Launches an interactive timed button giveaway</td><td>Manage Server</td></tr>
            </tbody>
          </table>
        </div>
      `
    },

    variables: {
      category: 'References',
      title: 'Variables & Placeholders Directory',
      badge: 'Reference',
      desc: 'Complete reference for dynamic string variables available in Welcome, Boost, AutoResponder, and Tickets.',
      content: `
        <p>Use dynamic variables inside your custom embeds, join messages, boost perks, and auto-responses. Orbit replaces them in real-time when the event occurs.</p>

        <h2 id="user-variables" class="text-xl font-bold text-white mt-6 mb-3">User Variables</h2>
        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead>
              <tr><th>Variable</th><th>Output</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="fd-var-tag">{user}</span></td><td>CyberNinja</td><td>Member username</td></tr>
              <tr><td><span class="fd-var-tag">{user.mention}</span></td><td>@CyberNinja</td><td>Interactive user mention</td></tr>
              <tr><td><span class="fd-var-tag">{user.id}</span></td><td>1411032158406541353</td><td>Discord snowflake ID</td></tr>
              <tr><td><span class="fd-var-tag">{user.avatar}</span></td><td>https://cdn.discordapp.com/...</td><td>Direct avatar image URL</td></tr>
              <tr><td><span class="fd-var-tag">{user.created_at}</span></td><td>2024-03-12</td><td>Account creation date</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="server-variables" class="text-xl font-bold text-white mt-8 mb-3">Server Variables</h2>
        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead>
              <tr><th>Variable</th><th>Output</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="fd-var-tag">{server}</span></td><td>Orbit Official</td><td>Server name</td></tr>
              <tr><td><span class="fd-var-tag">{server.id}</span></td><td>987654321098765432</td><td>Server ID</td></tr>
              <tr><td><span class="fd-var-tag">{server.member_count}</span></td><td>2,450</td><td>Total members in server</td></tr>
              <tr><td><span class="fd-var-tag">{server.icon}</span></td><td>https://cdn.discordapp.com/...</td><td>Server icon URL</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="boost-variables" class="text-xl font-bold text-white mt-8 mb-3">Boost & Level Variables</h2>
        <div class="fd-table-wrapper">
          <table class="fd-table">
            <thead>
              <tr><th>Variable</th><th>Output</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="fd-var-tag">{boost.count}</span></td><td>15</td><td>Total server boosts</td></tr>
              <tr><td><span class="fd-var-tag">{boost.tier}</span></td><td>Tier 2</td><td>Current boost tier</td></tr>
              <tr><td><span class="fd-var-tag">{level}</span></td><td>18</td><td>Current member level</td></tr>
              <tr><td><span class="fd-var-tag">{xp}</span></td><td>4,290</td><td>Current member XP</td></tr>
            </tbody>
          </table>
        </div>
      `
    }
  };

  // Helper to get all articles as a flat list
  function getFlatArticlesList() {
    const list = [];
    DOCS_CATEGORIES.forEach(cat => {
      cat.items.forEach(item => {
        list.push({ ...item, categoryTitle: cat.title });
      });
    });
    return list;
  }

  // ==========================================
  // PAGE RENDERER
  // ==========================================
  Pages.Docs = function(container, targetSlug) {
    const currentSlug = targetSlug || 'overview';
    const article = DOCS_ARTICLES[currentSlug] || DOCS_ARTICLES['overview'];

    // If shell is already mounted, simply update the article body, breadcrumbs, sidebar, and TOC
    const existingLayout = document.getElementById('nd-notebook-layout');
    if (existingLayout) {
      updateArticleContent(currentSlug, article);
      return;
    }

    // Build the complete Fumadocs Notebook Layout Shell
    container.innerHTML = `
      <div id="nd-notebook-layout" class="nd-notebook-wrapper">
        
        <!-- ================= TOP HEADER (nd-subnav) ================= -->
        <header id="nd-subnav">
          <div class="nd-header-top">
            <!-- Brand & Mobile Toggle -->
            <div class="flex items-center gap-3">
              <button id="nd-mobile-sidebar-toggle" class="md:hidden text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer" aria-label="Toggle Navigation">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
              </button>
              <a href="/" class="inline-flex items-center gap-2.5 font-bold text-white text-base hover:opacity-90 transition-opacity">
                <img src="/img/logo.png" alt="Orbit" class="w-7 h-7 rounded-xl object-contain">
                <span>Orbit</span>
              </a>
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#5865F2]/15 text-[#818cf8] border border-[#5865F2]/25">
                Wiki & Docs
              </span>
            </div>

            <!-- Center Search Bar Trigger -->
            <div class="flex-1 max-w-md mx-6 hidden sm:block">
              <button type="button" id="nd-search-btn" class="w-full flex items-center justify-between text-xs text-neutral-400 bg-neutral-900/80 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 rounded-xl px-3.5 py-2 transition-all group cursor-pointer shadow-sm">
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                  <span>Search Orbit docs, commands, variables...</span>
                </div>
                <kbd class="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-800 text-neutral-400 rounded border border-neutral-700">Ctrl K</kbd>
              </button>
            </div>

            <!-- Right Links & CTA -->
            <div class="flex items-center gap-2">
              <button type="button" id="nd-search-btn-mobile" class="sm:hidden p-2 text-neutral-400 hover:text-white rounded-lg cursor-pointer">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
              </button>
              <a href="https://discord.gg/orbit" target="_blank" class="p-2 text-neutral-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors" title="Join Discord Community">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              </a>
              <a href="/dashboard" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#5865F2] hover:bg-[#4752c4] shadow-md shadow-indigo-500/20 transition-all active:scale-95">
                <span>Dashboard</span>
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
            </div>
          </div>

          <!-- Header Tabs Row -->
          <div class="nd-header-tabs-row" data-header-tabs="">
            <a href="/docs/overview" class="nd-header-tab" data-active="${currentSlug !== 'commands' && currentSlug !== 'variables' ? 'true' : 'false'}">Documentation</a>
            <a href="/docs/commands" class="nd-header-tab" data-active="${currentSlug === 'commands' ? 'true' : 'false'}">Slash Commands</a>
            <a href="/docs/variables" class="nd-header-tab" data-active="${currentSlug === 'variables' ? 'true' : 'false'}">Variables Reference</a>
            <a href="/guides" class="nd-header-tab" data-active="false">Guides & Tutorials</a>
            <a href="/dashboard" class="nd-header-tab" data-active="false">Web Dashboard</a>
          </div>
        </header>

        <!-- ================= MOBILE SIDEBAR DRAWER ================= -->
        <div id="nd-mobile-drawer" class="fixed inset-0 z-50 hidden md:hidden">
          <div id="nd-mobile-drawer-backdrop" class="fixed inset-0 bg-black/75 backdrop-blur-sm"></div>
          <div class="fixed inset-y-0 start-0 w-[280px] bg-[#0c0c10] border-e border-white/[0.08] p-4 flex flex-col gap-4 overflow-y-auto z-10 shadow-2xl">
            <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span class="text-sm font-bold text-white flex items-center gap-2">
                <img src="/img/logo.png" class="w-5 h-5 rounded"> Orbit Wiki
              </span>
              <button id="nd-mobile-drawer-close" class="text-neutral-400 hover:text-white p-1 cursor-pointer">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="flex flex-col gap-4" id="nd-mobile-sidebar-content"></div>
          </div>
        </div>

        <!-- ================= 3-COLUMN DOCS CONTAINER ================= -->
        <div class="nd-docs-container">
          <!-- Left Sticky Sidebar -->
          <aside id="nd-sidebar">
            <div class="px-1">
              <a href="/docs/overview" class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white font-semibold text-xs hover:bg-white/[0.08] transition-colors">
                <svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
                <span>Orbit Documentation</span>
              </a>
            </div>
            <div class="flex flex-col gap-5 flex-1" id="nd-sidebar-tree"></div>
          </aside>

          <!-- Center Main Article Content -->
          <main id="nd-main-content">
            <!-- Breadcrumb -->
            <div class="flex items-center gap-2 text-xs text-neutral-500 font-medium">
              <a href="/docs/overview" class="hover:text-neutral-300 transition-colors">Docs</a>
              <span>/</span>
              <span class="text-neutral-400" id="nd-crumb-category">${article.category}</span>
              <span>/</span>
              <span class="text-[#818cf8] font-semibold" id="nd-crumb-title">${article.title}</span>
            </div>

            <!-- Title & Meta Header -->
            <header class="flex flex-col gap-2 pb-5 border-b border-white/[0.08]">
              <div class="flex items-center gap-3 flex-wrap">
                <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight" id="nd-page-title">${article.title}</h1>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#5865F2]/15 text-[#818cf8] border border-[#5865F2]/30" id="nd-page-badge">${article.badge || 'Official Docs'}</span>
              </div>
              <p class="text-sm text-neutral-400 leading-relaxed max-w-2xl" id="nd-page-desc">${article.desc}</p>
            </header>

            <!-- Article Body -->
            <article id="nd-page-body" class="text-neutral-300 text-sm leading-relaxed space-y-6">
              ${article.content}
            </article>

            <!-- Previous / Next Pagination Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-white/[0.08]" id="nd-pagination"></div>
          </main>

          <!-- Right Sticky TOC -->
          <aside id="nd-toc">
            <h3 class="inline-flex items-center gap-2 font-semibold text-neutral-400 tracking-wide uppercase text-[11px] mb-3">
              <svg class="w-3.5 h-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18H3"></path><path d="M17 6H3"></path><path d="M21 12H3"></path></svg>
              <span>On this page</span>
            </h3>

            <div class="relative overflow-y-auto scrollbar-none flex-1 py-1">
              <div id="nd-toc-links" class="flex flex-col border-s border-white/[0.08] ps-1 gap-1"></div>
            </div>

            <!-- Community Help Box -->
            <div class="mt-auto p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-2">
              <span class="text-xs font-semibold text-white flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                Need setup help?
              </span>
              <p class="text-[11px] text-neutral-400 leading-normal">Join our Discord community for instant configuration support.</p>
              <a href="https://discord.gg/orbit" target="_blank" class="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#818cf8] border border-[#5865F2]/30 transition-colors">
                Join Discord Server
              </a>
            </div>
          </aside>
        </div>

        <!-- ================= SEARCH MODAL (Ctrl + K) ================= -->
        <div id="nd-search-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div class="w-full max-w-xl rounded-2xl bg-[#111115] border border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
            <!-- Search Input -->
            <div class="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-800">
              <svg class="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
              <input type="text" id="nd-search-input" placeholder="Search documentation, guides, slash commands..." class="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none">
              <kbd class="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-800 text-neutral-400 rounded border border-neutral-700">ESC</kbd>
            </div>
            <!-- Search Results List -->
            <div id="nd-search-results" class="max-h-96 overflow-y-auto p-2 flex flex-col gap-1"></div>
          </div>
        </div>

      </div>
    `;

    // Render components & bind interactions
    renderSidebarTree(currentSlug);
    renderTableOfContents();
    renderPagination(currentSlug);
    bindInteractions();
  };

  // Helper: Update article content without re-rendering shell
  function updateArticleContent(slug, article) {
    document.getElementById('nd-crumb-category').textContent = article.category;
    document.getElementById('nd-crumb-title').textContent = article.title;
    document.getElementById('nd-page-title').textContent = article.title;
    document.getElementById('nd-page-badge').textContent = article.badge || 'Official Docs';
    document.getElementById('nd-page-desc').textContent = article.desc;
    document.getElementById('nd-page-body').innerHTML = article.content;

    // Update active header tabs
    const headerTabs = document.querySelectorAll('[data-header-tabs] a');
    headerTabs.forEach(a => {
      const href = a.getAttribute('href');
      if (href === `/docs/${slug}`) {
        a.setAttribute('data-active', 'true');
      } else if (href === '/docs/overview' && slug !== 'commands' && slug !== 'variables') {
        a.setAttribute('data-active', 'true');
      } else {
        a.setAttribute('data-active', 'false');
      }
    });

    renderSidebarTree(slug);
    renderTableOfContents();
    renderPagination(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Helper: Render sidebar tree
  function renderSidebarTree(activeSlug) {
    const treeContainer = document.getElementById('nd-sidebar-tree');
    const mobileContainer = document.getElementById('nd-mobile-sidebar-content');
    if (!treeContainer) return;

    let html = '';
    DOCS_CATEGORIES.forEach(cat => {
      html += `
        <div class="flex flex-col gap-1">
          <span class="px-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">${cat.title}</span>
          <div class="flex flex-col gap-0.5">
            ${cat.items.map(item => {
              const isActive = item.id === activeSlug;
              return `
                <a href="/docs/${item.id}" data-active="${isActive ? 'true' : 'false'}" class="nd-sidebar-item ${isActive ? 'bg-[#5865F2]/15 text-[#818cf8] font-semibold' : ''}">
                  <span class="flex-1 truncate">${item.title}</span>
                  ${item.badge ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-white/[0.08] text-neutral-300">${item.badge}</span>` : ''}
                </a>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    treeContainer.innerHTML = html;
    if (mobileContainer) mobileContainer.innerHTML = html;
  }

  // Helper: Render TOC links from current article headings
  function renderTableOfContents() {
    const body = document.getElementById('nd-page-body');
    const tocLinksContainer = document.getElementById('nd-toc-links');
    const mobileDropdown = document.getElementById('nd-toc-mobile-dropdown');
    if (!body || !tocLinksContainer) return;

    const headings = body.querySelectorAll('h2[id], h3[id]');
    if (!headings.length) {
      tocLinksContainer.innerHTML = `<span class="text-xs text-neutral-500 ps-3">No sections on this page.</span>`;
      if (mobileDropdown) mobileDropdown.innerHTML = `<span class="text-xs text-neutral-500">No sections</span>`;
      return;
    }

    let linksHtml = '';
    let mobileHtml = '';
    headings.forEach((h, idx) => {
      const id = h.getAttribute('id');
      const text = h.textContent;
      const isSub = h.tagName.toLowerCase() === 'h3';
      const isFirst = idx === 0;

      linksHtml += `
        <a href="#${id}" data-active="${isFirst ? 'true' : 'false'}" class="nd-toc-link ${isSub ? 'ps-6 text-[12px]' : 'ps-3'}">
          ${text}
        </a>
      `;

      mobileHtml += `
        <a href="#${id}" class="text-xs text-neutral-300 hover:text-white py-1">
          ${text}
        </a>
      `;
    });

    tocLinksContainer.innerHTML = linksHtml;
    if (mobileDropdown) mobileDropdown.innerHTML = mobileHtml;

    // ScrollSpy observer
    setupScrollSpy();
  }

  // Helper: Setup scrollspy observer for TOC
  function setupScrollSpy() {
    const headings = document.querySelectorAll('#nd-page-body h2[id], #nd-page-body h3[id]');
    const tocLinks = document.querySelectorAll('.nd-toc-link');
    const currentLabel = document.getElementById('nd-toc-current-label');

    if (!headings.length || !tocLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          tocLinks.forEach(link => {
            const matches = link.getAttribute('href') === `#${id}`;
            link.setAttribute('data-active', matches ? 'true' : 'false');
            if (matches && currentLabel) {
              currentLabel.textContent = entry.target.textContent;
            }
          });
        }
      });
    }, { rootMargin: '0px 0px -70% 0px' });

    headings.forEach(h => observer.observe(h));
  }

  // Helper: Render Previous & Next Pagination
  function renderPagination(currentSlug) {
    const paginationContainer = document.getElementById('nd-pagination');
    if (!paginationContainer) return;

    const flat = getFlatArticlesList();
    const currentIndex = flat.findIndex(item => item.id === currentSlug);

    const prevItem = currentIndex > 0 ? flat[currentIndex - 1] : null;
    const nextItem = currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null;

    paginationContainer.innerHTML = `
      ${prevItem ? `
        <a href="/docs/${prevItem.id}" class="flex flex-col gap-1 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all group">
          <span class="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            Previous
          </span>
          <span class="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">${prevItem.title}</span>
        </a>
      ` : `<div></div>`}

      ${nextItem ? `
        <a href="/docs/${nextItem.id}" class="flex flex-col gap-1 items-end text-right p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all group">
          <span class="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
            Next
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </span>
          <span class="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">${nextItem.title}</span>
        </a>
      ` : `<div></div>`}
    `;
  }

  // Helper: Bind keyboard shortcuts, search modal, and drawers
  function bindInteractions() {
    // Mobile sidebar drawer
    const toggleBtn = document.getElementById('nd-mobile-sidebar-toggle');
    const drawer = document.getElementById('nd-mobile-drawer');
    const drawerBackdrop = document.getElementById('nd-mobile-drawer-backdrop');
    const drawerClose = document.getElementById('nd-mobile-drawer-close');

    if (toggleBtn && drawer) {
      toggleBtn.onclick = () => drawer.classList.remove('hidden');
    }
    if (drawerBackdrop && drawer) {
      drawerBackdrop.onclick = () => drawer.classList.add('hidden');
    }
    if (drawerClose && drawer) {
      drawerClose.onclick = () => drawer.classList.add('hidden');
    }

    // Mobile TOC dropdown toggle
    const tocMobileBtn = document.getElementById('nd-toc-mobile-btn');
    const tocMobileDropdown = document.getElementById('nd-toc-mobile-dropdown');
    const tocChevron = document.getElementById('nd-toc-mobile-chevron');
    if (tocMobileBtn && tocMobileDropdown) {
      tocMobileBtn.onclick = () => {
        tocMobileDropdown.classList.toggle('hidden');
        if (tocChevron) {
          tocChevron.style.transform = tocMobileDropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        }
      };
    }

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
        performSearch('');
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

    // Ctrl + K shortcut
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
      searchInput.oninput = (e) => performSearch(e.target.value);
    }

    function performSearch(query) {
      if (!searchResults) return;
      const q = query.trim().toLowerCase();
      const flat = getFlatArticlesList();

      const filtered = q ? flat.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.desc.toLowerCase().includes(q) ||
        item.categoryTitle.toLowerCase().includes(q)
      ) : flat.slice(0, 8);

      if (!filtered.length) {
        searchResults.innerHTML = `
          <div class="p-6 text-center text-xs text-neutral-500">
            No documentation results found for "<span class="text-white">${query}</span>".
          </div>
        `;
        return;
      }

      searchResults.innerHTML = filtered.map(item => `
        <a href="/docs/${item.id}" onclick="document.getElementById('nd-search-modal').classList.add('hidden')" class="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.06] transition-colors group">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-neutral-500">${item.categoryTitle}</span>
            <span class="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">${item.title}</span>
            <span class="text-xs text-neutral-400 line-clamp-1">${item.desc}</span>
          </div>
          <svg class="w-4 h-4 text-neutral-600 group-hover:text-indigo-400 transition-colors shrink-0 ms-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      `).join('');
    }
  }

})();
