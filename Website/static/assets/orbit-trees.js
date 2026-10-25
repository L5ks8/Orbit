/**
 * Orbit Docs Synchronous Tree & Index Cache
 * Loaded synchronously in <head> for instant 0ms hydration without DOM flashing
 */
const ORBIT_PAGE_TREE = {
  $id: "root",
  name: "Orbit Docs",
  children: [
    { $id: "root:index.mdx", type: "page", name: "Einführung", description: "Willkommen in der offiziellen Dokumentation von Orbit.", url: "/docs", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open size-4"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>' },
    { $id: "root:quickstart.mdx", type: "page", name: "Erste Schritte", description: "Lade Orbit ein und richte deinen Server in 3 Minuten ein.", url: "/docs/quickstart", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket size-4"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>' },
    
    { $id: "root:sep_mod", type: "separator", name: "Moderation & Schutz" },
    { type: "page", name: "Auto-Moderation", url: "/docs/modules/automod", description: "Banned Words, Anti-Spam, Links & Mass-Mentions.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert size-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>' },
    { type: "page", name: "Verifizierung", url: "/docs/modules/verification", description: "Button-, Captcha- und Passwort-Schutz für neue Mitglieder.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-check size-4"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path></svg>' },
    { type: "page", name: "Sicherheit & Anti-Raid", url: "/docs/modules/security", description: "Mass-Join Schutz, Account-Alter und Lockdown.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check size-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>' },
    { type: "page", name: "Inaktivitäts-Kick", url: "/docs/modules/inactivekick", description: "Automatisches Entfernen inaktiver Konten.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-x size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg>' },
    { type: "page", name: "Entbannungsanträge", url: "/docs/modules/appeals", description: "Web-Appeals für gebannte Mitglieder.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text size-4"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>' },
    { type: "page", name: "Audit & ModLogs", url: "/docs/modules/modlog", description: "Mod-Cases und Audit-Logs für deinen Server.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll size-4"><path d="M19 17V5a2 2 0 0 0-2-2H4"></path><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"></path></svg>' },

    { $id: "root:sep_comm", type: "separator", name: "Community & Support" },
    { type: "page", name: "Welcome & Goodbye", url: "/docs/modules/welcome", description: "Begrüßungen mit Embeds und Variablen.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles size-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>' },
    { type: "page", name: "Leveling & XP", url: "/docs/modules/level", description: "Text- und Voice-XP mit Rollenbelohnungen.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-award size-4"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>' },
    { type: "page", name: "Tickets & Support", url: "/docs/modules/tickets", description: "Support-Panels mit automatischen HTML-Transkripten.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square size-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' },
    { type: "page", name: "Giveaways", url: "/docs/modules/giveaways", description: "Gewinnspiele mit Button-Teilnahme und Rerolls.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift size-4"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>' },
    { type: "page", name: "Umfragen (Polls)", url: "/docs/modules/polls", description: "Interaktive Abstimmungen mit Live-Ergebnissen.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bar-chart-3 size-4"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>' },
    { type: "page", name: "TempVoice Channels", url: "/docs/modules/tempvoice", description: "Temporäre Join to Create Sprachkanäle.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic size-4"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>' },

    { $id: "root:sep_server", type: "separator", name: "Server-Verwaltung" },
    { type: "page", name: "Rollen & Reaction Roles", url: "/docs/modules/roles", description: "Auto-Join Rollen und Button-Rollen.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield size-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>' },
    { type: "page", name: "Server-Statistiken", url: "/docs/modules/serverstats", description: "Live-Zähler für Mitglieder, Bots und Boosts.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity size-4"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>' },
    { type: "page", name: "Einladungs-Tracker", url: "/docs/modules/invites", description: "Mitglieder-Herkunft und Fake-Erkennung.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-plus size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>' },
    { type: "page", name: "Auto-Responder", url: "/docs/modules/autoresponder", description: "Automatische Chat-Antworten und Sticky Messages.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot size-4"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>' },
    { type: "page", name: "Server-Backups", url: "/docs/modules/backups", description: "Sicherung und Wiederherstellung des Servers.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-archive size-4"><rect width="20" height="5" x="2" y="3" rx="1"></rect><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M10 12h4"></path></svg>' },
    { type: "page", name: "Dashboard-Einstellungen", url: "/docs/modules/settings", description: "Präfix, Sprache und Administrator-Rollen.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sliders size-4"><line x1="4" x2="4" y1="21" y2="14"></line><line x1="4" x2="4" y1="10" y2="3"></line><line x1="12" x2="12" y1="21" y2="12"></line><line x1="12" x2="12" y1="8" y2="3"></line><line x1="20" x2="20" y1="21" y2="16"></line><line x1="20" x2="20" y1="12" y2="3"></line><line x1="1" x2="7" y1="14" y2="14"></line><line x1="9" x2="15" y1="8" y2="8"></line><line x1="17" x2="23" y1="16" y2="16"></line></svg>' },

    { $id: "root:sep_commands", type: "separator", name: "Befehle (Commands)", icon: void 0 },
    { type: "page", name: "Moderations-Befehle", url: "/docs/commands/moderation", description: "Bans, Kicks, Timeouts, Warns und Purge.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hammer size-4"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"></path><path d="m17.64 4.36 2-2a2 2 0 0 1 2.83 2.83l-2 2"></path><path d="m14 7 3 3"></path><path d="m19 12-2 2"></path></svg>' },
    { type: "page", name: "Management-Befehle", url: "/docs/commands/management", description: "Setup, Rollen, Embeds und Backups.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-2 size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>' },
    { type: "page", name: "Community-Befehle", url: "/docs/commands/community", description: "Rank, Leaderboard, Polls und Giveaways.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' },
    { type: "page", name: "Info- & Utility-Befehle", url: "/docs/commands/info", description: "Help, BotInfo, UserInfo und ServerInfo.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info size-4"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>' },
    { type: "page", name: "Admin- & Sicherheits-Befehle", url: "/docs/commands/admin", description: "Security, Anti-Raid, Whitelist und Notfallbefehle.", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock size-4"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>' }
  ]
};

const ORBIT_GUIDES_TREE = {
  $id: "root:guides",
  name: "Orbit Guides",
  children: [
    { $id: "guides:index.mdx", type: "page", name: "Übersicht: Guides", description: "Alle Anleitungen für Orbit im Überblick.", url: "/docs/guides" },
    { $id: "guides:sep_tutorials", type: "separator", name: "Schritt-für-Schritt Tutorials" },
    { type: "page", name: "Server-Setup von 0 auf 100", url: "/docs/guides/server-setup", description: "Vollständige Einrichtung deines Discord Servers mit Orbit." },
    { type: "page", name: "Anti-Raid & Server absichern", url: "/docs/guides/antiraid-security", description: "Mass-Join Schutz, Account Age Gate und Lockdown." },
    { type: "page", name: "Support- & Ticket-System", url: "/docs/guides/tickets-support", description: "Support-Panels, Rollen und HTML-Transkripte." },
    { type: "page", name: "Leveling & Rollen-Belohnungen", url: "/docs/guides/leveling-rewards", description: "XP-System und automatische Rollenbelohnungen." },
    { type: "page", name: "TempVoice (Join to Create)", url: "/docs/guides/tempvoice-channels", description: "Temporäre Sprachkanäle mit automatischer Löschung." },
    { type: "page", name: "Auto-Moderation Masterclass", url: "/docs/guides/automod-moderation", description: "Wortfilter, Anti-Spam und Schwellenwerte perfekt konfigurieren." }
  ]
};


const ORBIT_RELEASES_TREE = {
  $id: "root:releases",
  name: "Release Notes",
  children: [
    { $id: "releases:index.mdx", type: "page", name: "Übersicht: Updates", description: "Chronologische Liste aller Orbit Updates.", url: "/docs/releases" },
    { $id: "releases:sep_versions", type: "separator", name: "Versionshistorie" },
    { type: "page", name: "Orbit v2.4 (Aktuell)", url: "/docs/releases/v2-4", description: "0ms Web Dashboard, neuer AutoMod Engine, HTML Transkripte." },
    { type: "page", name: "Orbit v2.3", url: "/docs/releases/v2-3", description: "TempVoice und Giveaways mit Rollen-Bedingungen." },
    { type: "page", name: "Orbit v2.2", url: "/docs/releases/v2-2", description: "Ticketsystem mit Kategorien und Umfragen mit Prozentbalken." },
    { type: "page", name: "Orbit v2.1", url: "/docs/releases/v2-1", description: "Anti-Raid Shield, Account Age Gate und Notfall-Lockdown." },
    { type: "page", name: "Orbit v2.0", url: "/docs/releases/v2-0", description: "Vollständiger Relaunch der Bot-Architektur auf Slash Commands." }
  ]
};


const ORBIT_SEARCH_INDEX = [
  // Core Docs
  { id: "/docs", type: "page", content: "Willkommen bei Orbit Docs", description: "Offizielle Dokumentation für den All-in-One Discord Bot Orbit.", url: "/docs", breadcrumbs: ["Orbit Docs"] },
  { id: "/docs/quickstart", type: "page", content: "Erste Schritte & Bot Einrichten", description: "Orbit zum Discord Server einladen, Rollen ordnen und Dashboard starten.", url: "/docs/quickstart", breadcrumbs: ["Orbit Docs"] },

  // Modules: Moderation & Protection
  { id: "/docs/modules/automod", type: "page", content: "Auto-Moderation Modul", description: "Banned Words, Anti-Spam, Caps, Links, Invites und Mass-Mentions konfigurieren.", url: "/docs/modules/automod", breadcrumbs: ["Dashboard Module", "Moderation & Schutz"] },
  { id: "/docs/modules/automod#banned-words", type: "heading", content: "Banned Words Filter", description: "Relaxed & Strict Level, Blacklist und Whitelist Wörter.", url: "/docs/modules/automod", breadcrumbs: ["Auto-Moderation", "Content Filter"] },
  { id: "/docs/modules/automod#anti-spam", type: "heading", content: "Anti-Spam & Rate-Limits", description: "Nachrichtenlimits und Zeitfenster gegen Chat-Flutung.", url: "/docs/modules/automod", breadcrumbs: ["Auto-Moderation", "Spam Schutz"] },
  { id: "/docs/modules/automod#anti-caps", type: "heading", content: "Anti-Caps Filter", description: "Blockiert Nachrichten mit übermäßig vielen Großbuchstaben.", url: "/docs/modules/automod", breadcrumbs: ["Auto-Moderation", "Caps Schutz"] },
  { id: "/docs/modules/automod#anti-links", type: "heading", content: "Link- und Invite-Schutz", description: "Löscht unerlaubte Einladungslinks und Domains automatisch.", url: "/docs/modules/automod", breadcrumbs: ["Auto-Moderation", "Link Filter"] },
  
  { id: "/docs/modules/verification", type: "page", content: "Verifizierungssystem", description: "1-Klick Button, Captcha und Passwort-Schutz vor Raidbots.", url: "/docs/modules/verification", breadcrumbs: ["Dashboard Module", "Moderation & Schutz"] },
  { id: "/docs/modules/security", type: "page", content: "Server-Sicherheit & Anti-Raid", description: "Mass-Join Schutz, Account-Alter Überprüfung und Notfall-Lockdown.", url: "/docs/modules/security", breadcrumbs: ["Dashboard Module", "Moderation & Schutz"] },
  { id: "/docs/modules/inactivekick", type: "page", content: "Inaktivitäts-Kick Modul", description: "Automatisches Entfernen inaktiver Konten nach 30, 60 oder 90 Tagen.", url: "/docs/modules/inactivekick", breadcrumbs: ["Dashboard Module", "Moderation & Schutz"] },
  { id: "/docs/modules/appeals", type: "page", content: "Entbannungsanträge (Appeals)", description: "Web-Appeals für gebannte Mitglieder mit Team-Entscheidung.", url: "/docs/modules/appeals", breadcrumbs: ["Dashboard Module", "Moderation & Schutz"] },
  { id: "/docs/modules/modlog", type: "page", content: "Audit & ModLogs System", description: "Mod-Cases, Fallnummern und Logging von gelöschten Nachrichten.", url: "/docs/modules/modlog", breadcrumbs: ["Dashboard Module", "Moderation & Schutz"] },

  // Modules: Community & Support
  { id: "/docs/modules/welcome", type: "page", content: "Welcome & Goodbye Modul", description: "Begrüßungskanal, Embed Builder, Variablen {user}, {server}, DMs.", url: "/docs/modules/welcome", breadcrumbs: ["Dashboard Module", "Community & Support"] },
  { id: "/docs/modules/level", type: "page", content: "Leveling & XP System", description: "Text- und Voice-XP, Multiplikatoren und automatische Rollen-Belohnungen.", url: "/docs/modules/level", breadcrumbs: ["Dashboard Module", "Community & Support"] },
  { id: "/docs/modules/tickets", type: "page", content: "Tickets & Support System", description: "Support-Panels, Support-Rollen und automatische HTML-Transkripte.", url: "/docs/modules/tickets", breadcrumbs: ["Dashboard Module", "Community & Support"] },
  { id: "/docs/modules/giveaways", type: "page", content: "Giveaways & Gewinnspiele", description: "Gewinnspiele mit Button-Teilnahme, Countdown und Rerolls.", url: "/docs/modules/giveaways", breadcrumbs: ["Dashboard Module", "Community & Support"] },
  { id: "/docs/modules/polls", type: "page", content: "Umfragen (Polls) Modul", description: "Interaktive Abstimmungen mit Live-Ergebnisbalken und Endzeiten.", url: "/docs/modules/polls", breadcrumbs: ["Dashboard Module", "Community & Support"] },
  { id: "/docs/modules/tempvoice", type: "page", content: "TempVoice / Join to Create", description: "Temporäre Sprachkanäle mit automatischer Löschung und Talk-Rechten.", url: "/docs/modules/tempvoice", breadcrumbs: ["Dashboard Module", "Community & Support"] },

  // Modules: Server Management
  { id: "/docs/modules/roles", type: "page", content: "Rollen & Reaction Roles", description: "Auto-Join Rollen, Bot-Rollen und interaktive Button-Rollen.", url: "/docs/modules/roles", breadcrumbs: ["Dashboard Module", "Server-Verwaltung"] },
  { id: "/docs/modules/serverstats", type: "page", content: "Server-Statistiken Kanäle", description: "Live-Zähler für Mitglieder, Bots, Boosts und Online-Status.", url: "/docs/modules/serverstats", breadcrumbs: ["Dashboard Module", "Server-Verwaltung"] },
  { id: "/docs/modules/invites", type: "page", content: "Einladungs-Tracker", description: "Verfolge Mitglieder-Herkunft, Fake-Invites und Leaderboard.", url: "/docs/modules/invites", breadcrumbs: ["Dashboard Module", "Server-Verwaltung"] },
  { id: "/docs/modules/autoresponder", type: "page", content: "Auto-Responder & Automation", description: "Automatische Chat-Antworten und Sticky Messages.", url: "/docs/modules/autoresponder", breadcrumbs: ["Dashboard Module", "Server-Verwaltung"] },
  { id: "/docs/modules/backups", type: "page", content: "Server-Backups Modul", description: "Sicherung und Wiederherstellung von Rollen, Kanälen und Rechten.", url: "/docs/modules/backups", breadcrumbs: ["Dashboard Module", "Server-Verwaltung"] },
  { id: "/docs/modules/settings", type: "page", content: "Dashboard-Einstellungen", description: "Bot-Präfix, Sprache, Admin-Rollen und 0ms Instant Cache.", url: "/docs/modules/settings", breadcrumbs: ["Dashboard Module", "Server-Verwaltung"] },

  // Commands: Moderation
  { id: "/docs/commands/moderation#ban", type: "heading", content: "/ban <user> [grund]", description: "Bannt ein Mitglied dauerhaft vom Server.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#unban", type: "heading", content: "/unban <user_id>", description: "Hebt den Bann eines Nutzers anhand seiner Discord ID auf.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#softban", type: "heading", content: "/softban <user> [grund]", description: "Bannt und entbannt sofort, um Nachrichten zu bereinigen.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#kick", type: "heading", content: "/kick <user> [grund]", description: "Kickt ein Mitglied vom Server.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#timeout", type: "heading", content: "/timeout <user> <dauer>", description: "Schaltet ein Mitglied für 10m, 1h, 1d stumm.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#untimeout", type: "heading", content: "/untimeout <user>", description: "Hebt das Timeout eines Mitglieds vorzeitig auf.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#mute", type: "heading", content: "/mute <user> <dauer>", description: "Vergibt die Muted-Rolle an ein Mitglied.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#unmute", type: "heading", content: "/unmute <user>", description: "Entfernt die Muted-Rolle eines Mitglieds.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#warn", type: "heading", content: "/warn <user> <grund>", description: "Verwarnt ein Mitglied und speichert den Vorfall in der Datenbank.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#warnings", type: "heading", content: "/warnings <user>", description: "Ruft alle Verwarnungen eines Mitglieds ab.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#delwarn", type: "heading", content: "/delwarn <warn_id>", description: "Löscht eine Verwarnung anhand ihrer ID.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#clearwarns", type: "heading", content: "/clearwarns <user>", description: "Löscht alle Verwarnungen eines Nutzers vollständig.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#purge", type: "heading", content: "/purge <anzahl>", description: "Löscht bis zu 100 Nachrichten gleichzeitig aus dem Chat.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#lock", type: "heading", content: "/lock [kanal]", description: "Sperrt einen Textkanal für normale Mitglieder.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#unlock", type: "heading", content: "/unlock [kanal]", description: "Entsperrt einen zuvor gesperrten Textkanal.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#slowmode", type: "heading", content: "/slowmode <sekunden>", description: "Setzt den Slowmode für den aktuellen Kanal.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },
  { id: "/docs/commands/moderation#nick", type: "heading", content: "/nick <user> [neuer_name]", description: "Ändert den Server-Spitznamen eines Nutzers.", url: "/docs/commands/moderation", breadcrumbs: ["Commands", "Moderation"] },

  // Guides
  { id: "/docs/guides", type: "page", content: "Orbit Anleitungen & Guides", description: "Alle Praxis-Guides für Discord Server mit Orbit.", url: "/docs/guides", breadcrumbs: ["Guides"] },
  { id: "/docs/guides/server-setup", type: "page", content: "Server-Setup von 0 auf 100", description: "Vollständige Einrichtung deines Discord Servers mit Orbit.", url: "/docs/guides/server-setup", breadcrumbs: ["Guides", "Setup"] },
  { id: "/docs/guides/antiraid-security", type: "page", content: "Anti-Raid & Server absichern", description: "Optimaler Schutz vor Mass-Joins und Spambots.", url: "/docs/guides/antiraid-security", breadcrumbs: ["Guides", "Sicherheit"] },
  { id: "/docs/guides/tickets-support", type: "page", content: "Support- & Ticket-System", description: "Support-Panels, Rollen und HTML-Transkripte.", url: "/docs/guides/tickets-support", breadcrumbs: ["Guides", "Support"] },
  { id: "/docs/guides/leveling-rewards", type: "page", content: "Leveling & Rollen-Belohnungen", description: "XP-System und automatische Rollenbelohnungen.", url: "/docs/guides/leveling-rewards", breadcrumbs: ["Guides", "Community"] },
  { id: "/docs/guides/tempvoice-channels", type: "page", content: "TempVoice (Join to Create)", description: "Temporäre Sprachkanäle mit automatischer Löschung.", url: "/docs/guides/tempvoice-channels", breadcrumbs: ["Guides", "Voice"] },
  { id: "/docs/guides/automod-moderation", type: "page", content: "Auto-Moderation Masterclass", description: "Wortfilter, Anti-Spam und Schwellenwerte perfekt konfigurieren.", url: "/docs/guides/automod-moderation", breadcrumbs: ["Guides", "Moderation"] },

  // Release Notes
  { id: "/docs/releases", type: "page", content: "Orbit Release Notes", description: "Update-Historie und Versionsübersicht.", url: "/docs/releases", breadcrumbs: ["Release Notes"] },
  { id: "/docs/releases/v2-4", type: "page", content: "Orbit v2.4 Update", description: "0ms Web Dashboard, neuer AutoMod Engine, HTML Transkripte.", url: "/docs/releases/v2-4", breadcrumbs: ["Release Notes", "v2.4"] },
  { id: "/docs/releases/v2-3", type: "page", content: "Orbit v2.3 Update", description: "TempVoice und Giveaways mit Rollen-Bedingungen.", url: "/docs/releases/v2-3", breadcrumbs: ["Release Notes", "v2.3"] },
  { id: "/docs/releases/v2-2", type: "page", content: "Orbit v2.2 Update", description: "Ticketsystem mit Kategorien und Umfragen mit Prozentbalken.", url: "/docs/releases/v2-2", breadcrumbs: ["Release Notes", "v2.2"] },
  { id: "/docs/releases/v2-1", type: "page", content: "Orbit v2.1 Update", description: "Anti-Raid Shield, Account Age Gate und Notfall-Lockdown.", url: "/docs/releases/v2-1", breadcrumbs: ["Release Notes", "v2.1"] },
  { id: "/docs/releases/v2-0", type: "page", content: "Orbit v2.0 Update", description: "Vollständiger Relaunch der Bot-Architektur auf Slash Commands.", url: "/docs/releases/v2-0", breadcrumbs: ["Release Notes", "v2.0"] }
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
