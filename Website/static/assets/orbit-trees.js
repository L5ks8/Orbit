/**
 * Orbit Docs Synchronous Tree & Index Cache
 * Loaded synchronously in <head> for instant 0ms hydration without DOM flashing
 * 100% English Edition
 */
const ORBIT_PAGE_TREE = {
  $id: "root",
  name: "Orbit Docs",
  children: [
    { $id: "root:index.mdx", type: "page", name: "Introduction", description: "Welcome to the official Orbit documentation.", url: "/docs", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open size-4"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>' },
    { $id: "root:quickstart.mdx", type: "page", name: "Quickstart", description: "Invite Orbit and configure your server in under 3 minutes.", url: "/docs/quickstart", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket size-4"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>' },

    { $id: "root:sep_mod", type: "separator", name: "Moderation & Security" },
    { type: "page", name: "Auto-Moderation", url: "/docs/modules/automod", description: "Banned words, anti-spam, link filters, and mass-mentions.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert size-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>' },
    { type: "page", name: "Verification", url: "/docs/modules/verification", description: "Button, Captcha, and password protection for new members.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-check size-4"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path></svg>' },
    { type: "page", name: "Security & Anti-Raid", url: "/docs/modules/security", description: "Mass-join protection, account age verification, and lockdown.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check size-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>' },
    { type: "page", name: "Inactive Kick", url: "/docs/modules/inactivekick", description: "Automatically prune inactive accounts from your server.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-x size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg>' },
    { type: "page", name: "Ban Appeals", url: "/docs/modules/appeals", description: "Web-based unban application portal for banned users.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text size-4"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>' },
    { type: "page", name: "Audit & Mod Logs", url: "/docs/modules/modlog", description: "Moderation case tracking and comprehensive audit logs.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll size-4"><path d="M19 17V5a2 2 0 0 0-2-2H4"></path><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"></path></svg>' },

    { $id: "root:sep_comm", type: "separator", name: "Community & Support" },
    { type: "page", name: "Welcome & Goodbye", url: "/docs/modules/welcome", description: "Custom greeting cards with embeds and variables.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles size-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>' },
    { type: "page", name: "Leveling & XP", url: "/docs/modules/level", description: "Text and voice activity leveling with tiered role rewards.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-award size-4"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>' },
    { type: "page", name: "Tickets & Support", url: "/docs/modules/tickets", description: "Multi-category support panels with HTML transcript logging.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square size-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' },
    { type: "page", name: "Giveaways", url: "/docs/modules/giveaways", description: "Interactive prize drawings with button entries and rerolls.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift size-4"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>' },
    { type: "page", name: "Polls & Surveys", url: "/docs/modules/polls", description: "Interactive voting with live percentage visualizers.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart-3 size-4"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>' },
    { type: "page", name: "TempVoice Channels", url: "/docs/modules/tempvoice", description: "Dynamic 'Join to Create' temporary voice channels.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic size-4"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>' },

    { $id: "root:sep_server", type: "separator", name: "Server Management" },
    { type: "page", name: "Roles & Reaction Roles", url: "/docs/modules/roles", description: "Auto-join roles, button selection, and role hierarchies.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield size-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>' },
    { type: "page", name: "Server Stats", url: "/docs/modules/serverstats", description: "Live real-time voice channel counters for members, bots, and boosts.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity size-4"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>' },
    { type: "page", name: "Invite Tracker", url: "/docs/modules/invites", description: "Track invite codes, fake accounts, leaves, and leaderboards.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-plus size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>' },
    { type: "page", name: "Auto-Responder", url: "/docs/modules/autoresponder", description: "Automated trigger keywords, custom replies, and sticky notes.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot size-4"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>' },
    { type: "page", name: "Server Backups", url: "/docs/modules/backups", description: "Complete snapshot creation and restoration of roles and channels.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-archive size-4"><rect width="20" height="5" x="2" y="3" rx="1"></rect><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M10 12h4"></path></svg>' },
    { type: "page", name: "Dashboard Settings", url: "/docs/modules/settings", description: "Command prefix, default language, embed styles, and admin roles.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sliders size-4"><line x1="4" x2="4" y1="21" y2="14"></line><line x1="4" x2="4" y1="10" y2="3"></line><line x1="12" x2="12" y1="21" y2="12"></line><line x1="12" x2="12" y1="8" y2="3"></line><line x1="20" x2="20" y1="21" y2="16"></line><line x1="20" x2="20" y1="12" y2="3"></line><line x1="1" x2="7" y1="14" y2="14"></line><line x1="9" x2="15" y1="8" y2="8"></line><line x1="17" x2="23" y1="16" y2="16"></line></svg>' },

    { $id: "root:sep_commands", type: "separator", name: "Command Reference", icon: void 0 },
    { type: "page", name: "Moderation Commands", url: "/docs/commands/moderation", description: "Bans, kicks, timeouts, warnings, and message purging.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hammer size-4"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"></path><path d="m17.64 4.36 2-2a2 2 0 0 1 2.83 2.83l-2 2"></path><path d="m14 7 3 3"></path><path d="m19 12-2 2"></path></svg>' },
    { type: "page", name: "Management Commands", url: "/docs/commands/management", description: "Server setup, role managers, custom embeds, and backups.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-2 size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>' },
    { type: "page", name: "Community Commands", url: "/docs/commands/community", description: "Rank cards, leaderboards, poll triggers, and giveaway commands.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' },
    { type: "page", name: "Info & Utility Commands", url: "/docs/commands/info", description: "Help, botinfo, userinfo, avatar inspection, and server stats.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-4"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>' },
    { type: "page", name: "Admin & Security Commands", url: "/docs/commands/admin", description: "Anti-raid toggle, whitelisting, audit logs, and emergency locks.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock size-4"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>' }
  ]
};

const ORBIT_GUIDES_TREE = {
  $id: "root:guides",
  name: "Orbit Guides",
  children: [
    { $id: "guides:index.mdx", type: "page", name: "Overview: Guides", description: "All step-by-step guides and tutorials for Orbit.", url: "/docs/guides" },
    { $id: "guides:sep_tutorials", type: "separator", name: "Step-by-Step Tutorials" },
    { type: "page", name: "Server Setup from 0 to 100", url: "/docs/guides/server-setup", description: "Complete guide to setting up and optimizing your Discord server with Orbit." },
    { type: "page", name: "Anti-Raid & Server Hardening", url: "/docs/guides/antiraid-security", description: "Mass-join protection, account age gates, and emergency lockdown controls." },
    { type: "page", name: "Support & Ticket System", url: "/docs/guides/tickets-support", description: "Interactive ticket panels, staff roles, and automatic HTML transcripts." },
    { type: "page", name: "Leveling & Role Rewards", url: "/docs/guides/leveling-rewards", description: "Configure text and voice XP with tiered milestone roles." },
    { type: "page", name: "Temporary Voice Channels (TempVoice)", url: "/docs/guides/tempvoice-channels", description: "Dynamic voice hubs with custom member controls and permissions." },
    { type: "page", name: "Configuring Auto-Moderation", url: "/docs/guides/automod-moderation", description: "Prevent raid spam, malicious links, phishing domains, and toxicity." }
  ]
};

const ORBIT_RELEASES_TREE = {
  $id: "root:releases",
  name: "Release Notes",
  children: [
    { $id: "releases:index.mdx", type: "page", name: "Overview: Releases", description: "Chronological log of all major Orbit updates and feature releases.", url: "/docs/releases" },
    { $id: "releases:sep_versions", type: "separator", name: "Version History" },
    { type: "page", name: "Orbit v2.4 (Current)", url: "/docs/releases/v2-4", description: "Zero-latency web dashboard, new AutoMod engine, and HTML transcripts." },
    { type: "page", name: "Orbit v2.3", url: "/docs/releases/v2-3", description: "TempVoice channels and interactive giveaways with role requirements." },
    { type: "page", name: "Orbit v2.2", url: "/docs/releases/v2-2", description: "Multi-category ticket system and real-time percentage poll charts." },
    { type: "page", name: "Orbit v2.1", url: "/docs/releases/v2-1", description: "Anti-Raid shield, account age gate, and emergency lockdown commands." },
    { type: "page", name: "Orbit v2.0", url: "/docs/releases/v2-0", description: "Complete ground-up rewrite: Web dashboard, MongoDB Atlas backend, and modular systems." }
  ]
};

const ORBIT_SEARCH_INDEX = [
  { id: "/docs", type: "page", content: "Introduction", description: "Welcome to the official documentation for the Orbit Discord Bot.", url: "/docs", breadcrumbs: ["Docs"] },
  { id: "/docs/quickstart", type: "page", content: "Quickstart", description: "Invite Orbit and set up your server in under 3 minutes.", url: "/docs/quickstart", breadcrumbs: ["Docs"] },
  
  // Modules
  { id: "/docs/modules/automod", type: "page", content: "Auto-Moderation", description: "Banned words, anti-spam, links & mass-mentions.", url: "/docs/modules/automod", breadcrumbs: ["Docs", "Moderation & Security"] },
  { id: "/docs/modules/verification", type: "page", content: "Verification", description: "Button, Captcha, and password protection for new members.", url: "/docs/modules/verification", breadcrumbs: ["Docs", "Moderation & Security"] },
  { id: "/docs/modules/security", type: "page", content: "Security & Anti-Raid", description: "Mass-join defense, account age gates, and emergency lockdown.", url: "/docs/modules/security", breadcrumbs: ["Docs", "Moderation & Security"] },
  { id: "/docs/modules/inactivekick", type: "page", content: "Inactive Kick", description: "Automatically prune inactive members from your server.", url: "/docs/modules/inactivekick", breadcrumbs: ["Docs", "Moderation & Security"] },
  { id: "/docs/modules/appeals", type: "page", content: "Ban Appeals", description: "Web-based unban application portal for banned users.", url: "/docs/modules/appeals", breadcrumbs: ["Docs", "Moderation & Security"] },
  { id: "/docs/modules/modlog", type: "page", content: "Audit & Mod Logs", description: "Moderation case tracking and comprehensive audit logs.", url: "/docs/modules/modlog", breadcrumbs: ["Docs", "Moderation & Security"] },
  
  { id: "/docs/modules/welcome", type: "page", content: "Welcome & Goodbye", description: "Custom greeting cards with embeds and variables.", url: "/docs/modules/welcome", breadcrumbs: ["Docs", "Community & Support"] },
  { id: "/docs/modules/level", type: "page", content: "Leveling & XP", description: "Text and voice activity leveling with tiered role rewards.", url: "/docs/modules/level", breadcrumbs: ["Docs", "Community & Support"] },
  { id: "/docs/modules/tickets", type: "page", content: "Tickets & Support", description: "Multi-category support panels with HTML transcript logging.", url: "/docs/modules/tickets", breadcrumbs: ["Docs", "Community & Support"] },
  { id: "/docs/modules/giveaways", type: "page", content: "Giveaways", description: "Interactive prize drawings with button entries and rerolls.", url: "/docs/modules/giveaways", breadcrumbs: ["Docs", "Community & Support"] },
  { id: "/docs/modules/polls", type: "page", content: "Polls & Surveys", description: "Interactive voting with live percentage visualizers.", url: "/docs/modules/polls", breadcrumbs: ["Docs", "Community & Support"] },
  { id: "/docs/modules/tempvoice", type: "page", content: "TempVoice Channels", description: "Dynamic 'Join to Create' temporary voice channels.", url: "/docs/modules/tempvoice", breadcrumbs: ["Docs", "Community & Support"] },
  
  { id: "/docs/modules/roles", type: "page", content: "Roles & Reaction Roles", description: "Auto-join roles, button selection, and role hierarchies.", url: "/docs/modules/roles", breadcrumbs: ["Docs", "Server Management"] },
  { id: "/docs/modules/serverstats", type: "page", content: "Server Stats", description: "Live real-time voice channel counters for members, bots, and boosts.", url: "/docs/modules/serverstats", breadcrumbs: ["Docs", "Server Management"] },
  { id: "/docs/modules/invites", type: "page", content: "Invite Tracker", description: "Track invite codes, fake accounts, leaves, and leaderboards.", url: "/docs/modules/invites", breadcrumbs: ["Docs", "Server Management"] },
  { id: "/docs/modules/autoresponder", type: "page", content: "Auto-Responder", description: "Automated trigger keywords, custom replies, and sticky notes.", url: "/docs/modules/autoresponder", breadcrumbs: ["Docs", "Server Management"] },
  { id: "/docs/modules/backups", type: "page", content: "Server Backups", description: "Complete snapshot creation and restoration of roles and channels.", url: "/docs/modules/backups", breadcrumbs: ["Docs", "Server Management"] },
  { id: "/docs/modules/settings", type: "page", content: "Dashboard Settings", description: "Command prefix, default language, embed styles, and admin roles.", url: "/docs/modules/settings", breadcrumbs: ["Docs", "Server Management"] },
  
  // Commands
  { id: "/docs/commands/moderation", type: "page", content: "Moderation Commands", description: "/ban, /kick, /timeout, /warn, /clearwarns, /purge, /lock.", url: "/docs/commands/moderation", breadcrumbs: ["Docs", "Command Reference"] },
  { id: "/docs/commands/management", type: "page", content: "Management Commands", description: "/embed, /roles, /backup, /slowmode, /poll, /giveaway.", url: "/docs/commands/management", breadcrumbs: ["Docs", "Command Reference"] },
  { id: "/docs/commands/community", type: "page", content: "Community Commands", description: "/rank, /leaderboard, /ticket, /vote, /profile.", url: "/docs/commands/community", breadcrumbs: ["Docs", "Command Reference"] },
  { id: "/docs/commands/info", type: "page", content: "Info & Utility Commands", description: "/help, /botinfo, /userinfo, /serverinfo, /avatar, /ping.", url: "/docs/commands/info", breadcrumbs: ["Docs", "Command Reference"] },
  { id: "/docs/commands/admin", type: "page", content: "Admin & Security Commands", description: "/security, /whitelist, /lockdown, /setup, /sync.", url: "/docs/commands/admin", breadcrumbs: ["Docs", "Command Reference"] },
  
  // Guides
  { id: "/docs/guides", type: "page", content: "Overview: Guides", description: "All tutorials and step-by-step guides for Orbit.", url: "/docs/guides", breadcrumbs: ["Guides"] },
  { id: "/docs/guides/server-setup", type: "page", content: "Server Setup from 0 to 100", description: "Complete guide to setting up and optimizing your Discord server with Orbit.", url: "/docs/guides/server-setup", breadcrumbs: ["Guides"] },
  { id: "/docs/guides/antiraid-security", type: "page", content: "Anti-Raid & Server Hardening", description: "Mass-join defense, account age gates, and emergency lockdown controls.", url: "/docs/guides/antiraid-security", breadcrumbs: ["Guides"] },
  { id: "/docs/guides/tickets-support", type: "page", content: "Support & Ticket System", description: "Interactive ticket panels, staff roles, and automatic HTML transcripts.", url: "/docs/guides/tickets-support", breadcrumbs: ["Guides"] },
  { id: "/docs/guides/leveling-rewards", type: "page", content: "Leveling & Role Rewards", description: "Configure text and voice XP with tiered milestone roles.", url: "/docs/guides/leveling-rewards", breadcrumbs: ["Guides"] },
  { id: "/docs/guides/tempvoice-channels", type: "page", content: "Temporary Voice Channels (TempVoice)", description: "Dynamic voice hubs with custom member controls and permissions.", url: "/docs/guides/tempvoice-channels", breadcrumbs: ["Guides"] },
  { id: "/docs/guides/automod-moderation", type: "page", content: "Configuring Auto-Moderation", description: "Prevent raid spam, malicious links, phishing domains, and toxicity.", url: "/docs/guides/automod-moderation", breadcrumbs: ["Guides"] },
  
  // Releases
  { id: "/docs/releases", type: "page", content: "Overview: Releases", description: "Chronological log of all major Orbit updates and feature releases.", url: "/docs/releases", breadcrumbs: ["Release Notes"] },
  { id: "/docs/releases/v2-4", type: "page", content: "Orbit v2.4 (Current)", description: "Zero-latency web dashboard, new AutoMod engine, and HTML transcripts.", url: "/docs/releases/v2-4", breadcrumbs: ["Release Notes", "v2.4"] },
  { id: "/docs/releases/v2-3", type: "page", content: "Orbit v2.3", description: "TempVoice channels and interactive giveaways with role requirements.", url: "/docs/releases/v2-3", breadcrumbs: ["Release Notes", "v2.3"] },
  { id: "/docs/releases/v2-2", type: "page", content: "Orbit v2.2", description: "Multi-category ticket system and real-time percentage poll charts.", url: "/docs/releases/v2-2", breadcrumbs: ["Release Notes", "v2.2"] },
  { id: "/docs/releases/v2-1", type: "page", content: "Orbit v2.1", description: "Anti-Raid shield, account age gate, and emergency lockdown commands.", url: "/docs/releases/v2-1", breadcrumbs: ["Release Notes", "v2.1"] },
  { id: "/docs/releases/v2-0", type: "page", content: "Orbit v2.0", description: "Complete ground-up rewrite: Web dashboard, MongoDB Atlas backend, and modular systems.", url: "/docs/releases/v2-0", breadcrumbs: ["Release Notes", "v2.0"] }
];

window.__ORBIT_PAGE_TREE__ = ORBIT_PAGE_TREE;
window.__ORBIT_GUIDES_TREE__ = ORBIT_GUIDES_TREE;
window.__ORBIT_RELEASES_TREE__ = ORBIT_RELEASES_TREE;
window.__ORBIT_SEARCH_INDEX__ = ORBIT_SEARCH_INDEX;
window.__DOCS_TREES__ = {
  docs: ORBIT_PAGE_TREE,
  guides: ORBIT_GUIDES_TREE,
  releases: ORBIT_RELEASES_TREE
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { ORBIT_PAGE_TREE, ORBIT_GUIDES_TREE, ORBIT_RELEASES_TREE, ORBIT_SEARCH_INDEX };
}
