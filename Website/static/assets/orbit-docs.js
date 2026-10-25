import { j as e } from "./fetch-IBTWQCJR-JNYCxzyx.js";

// Markdown Heading / Text Helpers
const h1 = "h1", h2 = "h2", h3 = "h3", p = "p", a = "a", strong = "strong", ul = "ul", li = "li", code = "code", pre = "pre", blockquote = "blockquote";

function Callout({ title, children, type = "info" }) {
  const borderColors = {
    info: "border-blue-500/30 bg-blue-500/5 text-blue-300",
    warning: "border-amber-500/30 bg-amber-500/5 text-amber-300",
    error: "border-red-500/30 bg-red-500/5 text-red-300",
    success: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
  };
  return e.jsxs("div", {
    className: `p-4 rounded-xl border ${borderColors[type] || borderColors.info} my-4 text-sm leading-relaxed`,
    children: [
      title && e.jsx("strong", { className: "block font-semibold mb-1 text-white", children: title }),
      children
    ]
  });
}

function Card({ title, href, children }) {
  return e.jsxs("a", {
    href,
    className: "block p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 hover:border-neutral-700 transition-all duration-200 group no-underline text-inherit",
    children: [
      e.jsx("h3", { className: "text-base font-semibold text-white group-hover:text-blue-400 transition-colors mb-1.5 flex items-center justify-between", children: [
        title,
        e.jsx("span", { className: "text-neutral-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all text-sm", children: "→" })
      ] }),
      e.jsx("p", { className: "text-xs text-neutral-400 leading-relaxed m-0", children: children })
    ]
  });
}

function Cards({ children }) {
  return e.jsx("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4 my-6",
    children
  });
}

function TitleBadge({ text, color = "primary" }) {
  const colors = {
    primary: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    red: "bg-rose-500/10 text-rose-400 border-rose-500/20"
  };
  return e.jsx("span", {
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color] || colors.primary} mb-3`,
    children: text
  });
}

function CommandCard({ name, syntax, desc, perms = "None", example, options }) {
  return e.jsxs("div", {
    className: "p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 my-3 transition-all hover:border-neutral-700",
    children: [
      e.jsxs("div", {
        className: "flex flex-wrap items-center justify-between gap-2 mb-2",
        children: [
          e.jsx("code", { className: "text-blue-400 font-bold text-sm bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20", children: syntax || name }),
          e.jsxs("span", { className: "text-[11px] text-neutral-400 px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700", children: ["Permissions: ", perms] })
        ]
      }),
      e.jsx("p", { className: "text-sm text-neutral-300 mb-2 leading-relaxed", children: desc }),
      options && e.jsxs("div", {
        className: "text-xs text-neutral-400 mb-2",
        children: [
          e.jsx("span", { className: "font-semibold text-neutral-300", children: "Options: " }),
          options
        ]
      }),
      example && e.jsxs("div", {
        className: "text-xs text-neutral-400 font-mono bg-black/50 px-3 py-1.5 rounded-lg border border-neutral-800/80",
        children: [e.jsx("span", { className: "text-neutral-500 select-none", children: "Example: " }), example]
      })
    ]
  });
}

function SettingsTable({ rows }) {
  return e.jsx("div", {
    className: "overflow-x-auto my-4 rounded-xl border border-neutral-800 bg-neutral-950/60",
    children: e.jsxs("table", {
      className: "w-full text-left text-sm border-collapse",
      children: [
        e.jsx("thead", {
          className: "bg-neutral-900/80 border-b border-neutral-800 text-xs uppercase tracking-wider text-neutral-400",
          children: e.jsxs("tr", {
            children: [
              e.jsx("th", { className: "p-3 font-semibold", children: "Setting / Option" }),
              e.jsx("th", { className: "p-3 font-semibold", children: "Function & Description" }),
              e.jsx("th", { className: "p-3 font-semibold", children: "Default / Recommended" })
            ]
          })
        }),
        e.jsx("tbody", {
          className: "divide-y divide-neutral-800/60",
          children: rows.map(([name, desc, rec], idx) => e.jsxs("tr", {
            className: "hover:bg-neutral-900/40 transition-colors",
            children: [
              e.jsx("td", { className: "p-3 font-medium text-white whitespace-nowrap", children: name }),
              e.jsx("td", { className: "p-3 text-neutral-300 leading-relaxed", children: desc }),
              e.jsx("td", { className: "p-3 font-mono text-xs text-blue-400 whitespace-nowrap", children: rec })
            ]
          }, idx))
        })
      ]
    })
  });
}

function StepBox({ num, title, children }) {
  return e.jsxs("div", {
    className: "flex gap-3 my-4 p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40",
    children: [
      e.jsx("div", {
        className: "flex-shrink-0 w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shadow-blue-500/20",
        children: num
      }),
      e.jsxs("div", {
        className: "flex-1 min-w-0 pt-0.5",
        children: [
          e.jsx("h4", { className: "font-semibold text-white text-base mb-1", children: title }),
          e.jsx("div", { className: "text-sm text-neutral-300 leading-relaxed space-y-2", children })
        ]
      })
    ]
  });
}

// -------------------------------------------------------------
// 1. PAGE INTRO
// -------------------------------------------------------------
function PageIntro() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Official Documentation", color: "primary" }),
      e.jsx("p", {
        className: "text-lg text-neutral-300 leading-relaxed mb-6",
        children: "Welcome to the official documentation for Orbit — the modern all-in-one Discord bot featuring an instant 0ms web dashboard, enterprise-grade anti-raid & spam protection, verification, ticketing, leveling, and complete server automation."
      }),
      e.jsx(h2, { id: "why-orbit", children: "Why Orbit?" }),
      e.jsx("p", {
        className: "text-neutral-300 mb-4",
        children: "Orbit unifies over 40 bot systems in a single high-performance platform. You no longer need to manage 5 different bots for your community — Orbit delivers everything seamlessly under one roof."
      }),
      e.jsxs(Cards, {
        children: [
          e.jsx(Card, { title: "0ms Web Dashboard", href: "/docs/quickstart", children: "Manage all your server settings, toggles, and logs in real time with instant cache transitions." }),
          e.jsx(Card, { title: "Auto-Moderation", href: "/docs/modules/automod", children: "24/7 protection against banned words, spam bursts, raid waves, external invites, and mass mentions." }),
          e.jsx(Card, { title: "Verification & Anti-Raid", href: "/docs/modules/verification", children: "One-click, Captcha, and password gates to shield your community from automated raid bots." }),
          e.jsx(Card, { title: "Support & Tickets", href: "/docs/modules/tickets", children: "Professional multi-category support panels with automated HTML transcript logging." }),
          e.jsx(Card, { title: "Leveling & Voice XP", href: "/docs/modules/level", children: "Chat and voice activity rewards with automated tiered role progression." }),
          e.jsx(Card, { title: "40+ Slash Commands", href: "/docs/commands/moderation", children: "Complete command suite for your server administration and moderation team." })
        ]
      }),
      e.jsx(h2, { id: "quick-search", children: "Global Search" }),
      e.jsx(Callout, {
        title: "Pro-Tip for Server Admins",
        type: "info",
        children: "Press Ctrl + K (or Cmd + K on macOS) at any time to open the global search modal and jump directly to any setting, guide, or command!"
      })
    ]
  });
}

// -------------------------------------------------------------
// 2. PAGE QUICKSTART
// -------------------------------------------------------------
function PageQuickstart() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Getting Started", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Follow this quick guide to set up Orbit on your Discord server in under 3 minutes."
      }),
      e.jsx(h2, { id: "step-by-step", children: "Step-by-Step Setup" }),
      e.jsx(StepBox, {
        num: "1",
        title: "Invite Orbit to your server",
        children: [
          e.jsx("p", { children: "Click the invite link and select your Discord server. We recommend granting Administrator permissions so Orbit can seamlessly configure channels, manage roles, and enforce moderation rules." }),
          e.jsx("div", { className: "mt-2", children: e.jsx("a", { href: "https://discord.gg/orbit", target: "_blank", className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors", children: "Invite Orbit Now" }) })
        ]
      }),
      e.jsx(StepBox, {
        num: "2",
        title: "Configure Role Hierarchy in Discord (CRITICAL)",
        children: [
          e.jsx("p", { children: "Open Discord Server Settings -> Roles. Drag the Orbit role to the top of your role hierarchy (above all user roles that the bot will manage, verify, mute, or moderate). Discord's security model strictly prohibits bots from managing roles positioned above their own." })
        ]
      }),
      e.jsx(StepBox, {
        num: "3",
        title: "Log into the Web Dashboard",
        children: [
          e.jsx("p", { children: "Navigate to the Orbit Web Dashboard at /dashboard and sign in with your Discord account. Select your server from the server selection grid." })
        ]
      }),
      e.jsx(StepBox, {
        num: "4",
        title: "Enable & Configure Modules",
        children: [
          e.jsx("p", { children: "Select any module in the left sidebar (such as Auto-Moderation, Welcome, or Verification). Flip the toggle to 'Enabled' and customize the options to match your server's needs." })
        ]
      })
    ]
  });
}

// -------------------------------------------------------------
// 3. PAGE AUTOMOD
// -------------------------------------------------------------
function PageAutoMod() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Security System", color: "amber" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Orbit's Auto-Moderation continuously monitors all text channels in real time, neutralizing bad words, spam bursts, invite links, and mass pings in milliseconds."
      }),
      e.jsx(h2, { id: "settings-table", children: "Available Settings & Toggles" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Content Filter (Bad Words)", "Filters insults, hate speech, and custom blacklisted phrases.", "Enabled"],
          ["Filter Strictness", "Relaxed (checks exact words) or Strict (detects bypasses like f.u.c.k, leetspeak, and spaced characters).", "Strict"],
          ["Violation Action", "Action taken when rules are broken: Delete message, warn user, timeout (mute), or kick.", "Delete + Warn"],
          ["Anti-Spam", "Stops channel flooding (e.g. maximum 5 messages within 3 seconds).", "Enabled (5 msgs / 3s)"],
          ["Anti-Caps", "Blocks messages with excessive uppercase letters (e.g. over 70% capital letters).", "Enabled (70%)"],
          ["Link & Invite Filter", "Automatically removes unauthorized discord.gg invites and unknown URLs.", "Enabled"],
          ["Mass-Mention Filter", "Blocks messages mentioning more than 3 users or roles.", "Enabled (Max 3)"],
          ["Ignored Roles", "Roles exempted from all Auto-Moderation checks (e.g. Moderators, Admins).", "Staff / Admin"],
          ["Ignored Channels", "Channels where AutoMod is inactive (e.g. #bot-commands, #staff-chat).", "#bot-spam"]
        ]
      }),
      e.jsx(h2, { id: "step-by-step-setup", children: "Step-by-Step Configuration" }),
      e.jsx(StepBox, {
        num: "1",
        title: "Configure Blacklist & Strictness",
        children: "Navigate to the Auto-Moderation tab in the dashboard. Enable the Content Filter and add custom banned phrases or slurs to your server blacklist."
      }),
      e.jsx(StepBox, {
        num: "2",
        title: "Set Escalation Punishments",
        children: "Choose your preferred violation consequence. We recommend 'Delete + Warn' for first offenses, with automatic timeouts for repeated violations."
      }),
      e.jsx(StepBox, {
        num: "3",
        title: "Set Whitelists",
        children: "Add your staff roles to the 'Ignored Roles' list so moderators are never accidentally restricted during active moderation."
      }),
      e.jsx(h2, { id: "associated-commands", children: "Associated Commands" }),
      e.jsx(CommandCard, { name: "warn", syntax: "/warn <user> <reason>", desc: "Manually issues an official warning to a member for breaking rules.", perms: "Manage Messages", example: "/warn @Spammer Inappropriate language" }),
      e.jsx(CommandCard, { name: "warnings", syntax: "/warnings <user>", desc: "Displays all warnings and moderation history for a member.", perms: "Manage Messages", example: "/warnings @User" }),
      e.jsx(CommandCard, { name: "clearwarns", syntax: "/clearwarns <user>", desc: "Clears all warnings for a member from the database.", perms: "Kick Members", example: "/clearwarns @User" }),
      e.jsx(CommandCard, { name: "purge", syntax: "/purge <amount>", desc: "Bulk deletes up to 100 messages from the current channel.", perms: "Manage Messages", example: "/purge 50" })
    ]
  });
}

// -------------------------------------------------------------
// 4. PAGE WELCOME
// -------------------------------------------------------------
function PageWelcome() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Community Module", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Welcome new members with customized embed cards, avatar thumbnails, and direct messages (DMs), while keeping track of server leavers."
      }),
      e.jsx(h2, { id: "variables", children: "Available Placeholders & Variables" }),
      e.jsx("div", {
        className: "grid grid-cols-1 sm:grid-cols-2 gap-3 my-4",
        children: [
          e.jsxs("div", { className: "p-3 rounded-lg border border-neutral-800 bg-neutral-900", children: [e.jsx("code", { className: "text-blue-400 font-bold", children: "{user}" }), e.jsx("p", { className: "text-xs text-neutral-400 mt-1", children: "Mentions the new member (@Username)" })] }),
          e.jsxs("div", { className: "p-3 rounded-lg border border-neutral-800 bg-neutral-900", children: [e.jsx("code", { className: "text-blue-400 font-bold", children: "{username}" }), e.jsx("p", { className: "text-xs text-neutral-400 mt-1", children: "Plain username without @ symbol" })] }),
          e.jsxs("div", { className: "p-3 rounded-lg border border-neutral-800 bg-neutral-900", children: [e.jsx("code", { className: "text-blue-400 font-bold", children: "{server}" }), e.jsx("p", { className: "text-xs text-neutral-400 mt-1", children: "The name of your Discord server" })] }),
          e.jsxs("div", { className: "p-3 rounded-lg border border-neutral-800 bg-neutral-900", children: [e.jsx("code", { className: "text-blue-400 font-bold", children: "{membercount}" }), e.jsx("p", { className: "text-xs text-neutral-400 mt-1", children: "Current member count of the server" })] })
        ]
      }),
      e.jsx(h2, { id: "configuration", children: "Dashboard Configuration" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Welcome Message", "Toggles welcome greetings in the designated server channel.", "Enabled"],
          ["Welcome Channel", "The text channel where welcome greetings will be posted.", "#welcome"],
          ["Use Rich Embed", "Sends the greeting in a styled Discord embed with custom color accent.", "Enabled"],
          ["Show Avatar", "Displays the member's profile avatar as an embed thumbnail.", "Enabled"],
          ["DM Welcome", "Sends the new member a private direct message upon joining.", "Optional (e.g. for rules)"],
          ["Goodbye Messages", "Posts a notification when a member leaves the server.", "#leave-logs"]
        ]
      })
    ]
  });
}

// -------------------------------------------------------------
// 5. PAGE VERIFICATION
// -------------------------------------------------------------
function PageVerification() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Raid Protection", color: "purple" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Protect your server with a verification gate before new members gain access to your community channels."
      }),
      e.jsx(h2, { id: "methods", children: "Verification Modes" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Button Verification", "User clicks a 'Verify' button. Fast, simple, and member-friendly.", "Recommended for general communities"],
          ["Discord CAPTCHA", "User enters a random 5-character image code. Effectively stops automated raid bots.", "Recommended for public servers"],
          ["Password / Codeword", "User must enter a secret password hidden in your server rules.", "For private communities"],
          ["Questionnaire", "User must answer interactive questionnaire questions in a modal before getting verified.", "For whitelist / application servers"]
        ]
      }),
      e.jsx(h2, { id: "role-setup", children: "Role Setup Guide" }),
      e.jsx(StepBox, {
        num: "1",
        title: "Create a 'Verified' Role",
        children: "In Discord Server Settings -> Roles, create a role named 'Member' or 'Verified'."
      }),
      e.jsx(StepBox, {
        num: "2",
        title: "Select Roles in Dashboard",
        children: "In the Verification tab under 'Verified Role', select your role and assign the #verify channel."
      }),
      e.jsx(StepBox, {
        num: "3",
        title: "Configure Discord Channel Permissions",
        children: "For the @everyone role, set 'View Channels' to OFF globally. Set 'View Channels' to ON for your 'Verified' role. In the #verify channel, allow @everyone to View Channel and Read Message History."
      })
    ]
  });
}

// -------------------------------------------------------------
// 6. PAGE SECURITY
// -------------------------------------------------------------
function PageSecurity() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Anti-Raid System", color: "red" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "The Security module defends your server against mass joins, raid waves, compromised accounts, and rogue bot additions."
      }),
      e.jsx(h2, { id: "security-toggles", children: "Security Toggles & Thresholds" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Anti-Raid Mode", "Detects abnormal join surges (e.g. more than 8 joins within 10 seconds) and triggers automatic lockdown.", "Enabled (8 joins / 10s)"],
          ["Account Age Gate", "Blocks or kicks accounts younger than X days (e.g. under 3 days old).", "Enabled (Min. 3 days)"],
          ["Anti-Bot Add", "Instantly kicks unauthorized bots added by non-administrator accounts.", "Enabled"],
          ["Lockdown Action", "Consequence during a detected raid: Pause verification, halt messaging, or pause invites.", "Lockdown + Alert"],
          ["Security Log Channel", "Channel where suspicious activities and defensive actions are logged.", "#security-logs"]
        ]
      }),
      e.jsx(h2, { id: "security-commands", children: "Security Commands" }),
      e.jsx(CommandCard, { name: "security", syntax: "/security status", desc: "Displays current security status and active protection layers.", perms: "Administrator", example: "/security status" }),
      e.jsx(CommandCard, { name: "antiraid", syntax: "/antiraid [on|off]", desc: "Manually activates or pauses the anti-raid defense mode.", perms: "Administrator", example: "/antiraid on" }),
      e.jsx(CommandCard, { name: "lock", syntax: "/lock [channel] [reason]", desc: "Emergency lock for one or all text channels.", perms: "Manage Channels", example: "/lock #general Emergency lockdown" })
    ]
  });
}

// -------------------------------------------------------------
// 7. PAGE ROLES
// -------------------------------------------------------------
function PageRoles() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Role Management", color: "cyan" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Automate role assignment upon server join and create interactive reaction roles with buttons or select menus."
      }),
      e.jsx(h2, { id: "role-features", children: "Features & Settings" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Auto-Role (Join)", "Automatically assigns a default role to new members upon joining.", "Enabled (e.g. @Member)"],
          ["Bot Auto-Role", "Automatically assigns a separate role to new bots (e.g. @Bots).", "Enabled (e.g. @Bots)"],
          ["Reaction Roles", "Allows members to self-assign notification, game, or cosmetic roles using buttons.", "Button or Select Menu"],
          ["Exclusive Roles", "Ensures users can only select one role from a category (e.g. age or platform).", "Optional"]
        ]
      }),
      e.jsx(h2, { id: "role-commands", children: "Role Commands" }),
      e.jsx(CommandCard, { name: "autorole", syntax: "/autorole set <role>", desc: "Configures the default join role for new members.", perms: "Manage Roles", example: "/autorole set @Community" }),
      e.jsx(CommandCard, { name: "reactionrole", syntax: "/reactionrole add <msg_id> <emoji> <role>", desc: "Binds an emoji or button to a role on an existing message.", perms: "Manage Roles", example: "/reactionrole add 123456789 🎮 @Gamer" })
    ]
  });
}

// -------------------------------------------------------------
// 8. PAGE LEVEL
// -------------------------------------------------------------
function PageLevel() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Gamification", color: "amber" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Drive community engagement with experience points (XP), leaderboards, and automated tiered role rewards."
      }),
      e.jsx(h2, { id: "xp-system", children: "How XP is Earned" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Text XP", "15 to 25 XP awarded per message sent in chat.", "60s Cooldown"],
          ["Voice XP", "5 to 10 XP per minute spent in active voice channels (unmuted).", "Enabled"],
          ["Level-Up Channel", "Where level-up announcements are posted: Current channel, dedicated channel, or DM.", "#level-ups"],
          ["XP Multipliers", "Assign 1.5x or 2.0x XP multipliers for Server Boosters or weekend events.", "Boosters: 1.5x"],
          ["Ignored Channels", "Channels where XP gain is disabled (e.g. spam or bot command channels).", "#bot-commands"]
        ]
      }),
      e.jsx(h2, { id: "role-rewards", children: "Role Rewards" }),
      e.jsx("p", {
        className: "text-neutral-300 mb-4",
        children: "Define milestones in the dashboard where members automatically receive new roles as they level up (e.g., Level 5 -> Regular, Level 20 -> Veteran, Level 50 -> Legend)."
      }),
      e.jsx(h2, { id: "level-commands", children: "Leveling Commands" }),
      e.jsx(CommandCard, { name: "rank", syntax: "/rank [user]", desc: "Displays personal rank card with current level, XP, and progress bar.", perms: "None", example: "/rank @Friend" }),
      e.jsx(CommandCard, { name: "levels", syntax: "/levels", desc: "Provides a link to the interactive web leaderboard for the server.", perms: "None", example: "/levels" }),
      e.jsx(CommandCard, { name: "xp add", syntax: "/xp add <user> <amount>", desc: "Awards bonus XP to a specified member.", perms: "Administrator", example: "/xp add @User 500" }),
      e.jsx(CommandCard, { name: "xp set", syntax: "/xp set <user> <level>", desc: "Manually sets a member's level.", perms: "Administrator", example: "/xp set @User 10" })
    ]
  });
}

// -------------------------------------------------------------
// 9. PAGE TICKETS
// -------------------------------------------------------------
function PageTickets() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Support System", color: "primary" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Create private support channels on demand with category selection, staff mentions, and automated HTML transcript logging."
      }),
      e.jsx(h2, { id: "ticket-features", children: "Features & Setup" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Ticket Panel", "Deploys a styled embed with an interactive 'Open Ticket' button to your support channel.", "Enabled"],
          ["Ticket Categories", "Support categories such as 'General Support', 'Billing', or 'Staff Applications'.", "Up to 5 Categories"],
          ["Support Staff Role", "Role that receives access to newly opened tickets and gets pinged.", "Support Team"],
          ["HTML Transcripts", "Generates and saves a complete downloadable HTML transcript when a ticket is closed.", "#ticket-logs"],
          ["Ticket Limit", "Maximum number of simultaneous open tickets allowed per user.", "1 Ticket"]
        ]
      }),
      e.jsx(h2, { id: "ticket-commands", children: "Ticket Commands" }),
      e.jsx(CommandCard, { name: "ticket panel", syntax: "/ticket panel", desc: "Deploys the interactive ticket panel into the current channel.", perms: "Administrator", example: "/ticket panel" }),
      e.jsx(CommandCard, { name: "ticket close", syntax: "/ticket close [reason]", desc: "Closes the ticket, archives the HTML transcript, and deletes the channel.", perms: "Support Staff", example: "/ticket close Issue resolved" }),
      e.jsx(CommandCard, { name: "ticket add", syntax: "/ticket add <user>", desc: "Grants an additional user access to the current ticket.", perms: "Support Staff", example: "/ticket add @Helper" }),
      e.jsx(CommandCard, { name: "ticket remove", syntax: "/ticket remove <user>", desc: "Removes a user from the ticket channel.", perms: "Support Staff", example: "/ticket remove @User" })
    ]
  });
}

// -------------------------------------------------------------
// 10. PAGE GIVEAWAYS
// -------------------------------------------------------------
function PageGiveaways() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Giveaways", color: "purple" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Host automated giveaways with live countdown timers, role requirements, rerolls, and button entries."
      }),
      e.jsx(h2, { id: "giveaway-features", children: "Options & Requirements" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Button Entry", "Members join giveaways with a single button click.", "Enabled"],
          ["Role Requirements", "Restrict entry to specific roles (e.g. Server Boosters or VIPs).", "Optional"],
          ["Winner Count", "Configure between 1 and 20 winners per drawing.", "1 Winner"],
          ["Automatic Reroll", "Instantly draw a replacement winner if the initial winner is invalid.", "Supported"]
        ]
      }),
      e.jsx(h2, { id: "giveaway-commands", children: "Giveaway Commands" }),
      e.jsx(CommandCard, { name: "giveaway start", syntax: "/giveaway start <duration> <winners> <prize>", desc: "Starts a new giveaway in the current channel.", perms: "Manage Messages", example: "/giveaway start 24h 1 Discord Nitro" }),
      e.jsx(CommandCard, { name: "giveaway end", syntax: "/giveaway end <msg_id>", desc: "Ends an active giveaway early and draws winners.", perms: "Manage Messages", example: "/giveaway end 1234567890" }),
      e.jsx(CommandCard, { name: "giveaway reroll", syntax: "/giveaway reroll <msg_id>", desc: "Draws a new winner for a concluded giveaway.", perms: "Manage Messages", example: "/giveaway reroll 1234567890" })
    ]
  });
}

// -------------------------------------------------------------
// 11. PAGE POLLS
// -------------------------------------------------------------
function PagePolls() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Community Feedback", color: "cyan" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Create visually appealing community polls with single or multiple choice, live percentage bars, and automated expiration timers."
      }),
      e.jsx(h2, { id: "poll-features", children: "Options & Dashboard Setup" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Poll Type", "Single-Choice (1 vote per user) or Multiple-Choice (multiple selections permitted).", "Single-Choice"],
          ["Anonymous Voting", "Hides member vote identities from public display.", "Optional"],
          ["End Timer", "Automatically closes the poll after a set duration (e.g. 12h, 2d).", "24 Hours"],
          ["Live Result Bars", "Displays percentage bars and vote tallies dynamically in real time.", "Enabled"]
        ]
      }),
      e.jsx(h2, { id: "poll-commands", children: "Poll Commands" }),
      e.jsx(CommandCard, { name: "poll", syntax: "/poll <question> <option1> <option2> [duration]", desc: "Creates a new interactive poll in chat.", perms: "Manage Messages", example: "/poll 'What game should we play?' 'Valorant' 'Minecraft' 24h" })
    ]
  });
}

// -------------------------------------------------------------
// 12. PAGE TEMPVOICE
// -------------------------------------------------------------
function PageTempVoice() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Voice System", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Dynamic temporary voice channels ('Join to Create'). When a member enters the creator hub, a private voice room is spawned and automatically cleaned up when empty."
      }),
      e.jsx(h2, { id: "tempvoice-settings", children: "Settings & Controls" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Hub Channel", "The primary voice channel members join to spawn their custom room.", "➕ Create Voice"],
          ["Category", "The category where temporary voice rooms are organized.", "🔊 Voice Lounges"],
          ["Channel Naming", "Naming template for new rooms (e.g. {username}'s Lounge).", "{username}'s Lounge"],
          ["User Limit", "Default member limit for newly spawned rooms (0 = unlimited).", "0 (Customizable)"],
          ["Auto-Delete", "Instantly deletes the room once the last member departs.", "Immediate"]
        ]
      }),
      e.jsx(h2, { id: "tempvoice-commands", children: "Room Owner Commands" }),
      e.jsx(CommandCard, { name: "voice lock", syntax: "/voice lock", desc: "Locks your temporary voice channel so no additional users can join.", perms: "Room Owner", example: "/voice lock" }),
      e.jsx(CommandCard, { name: "voice unlock", syntax: "/voice unlock", desc: "Re-opens your voice channel to the public.", perms: "Room Owner", example: "/voice unlock" }),
      e.jsx(CommandCard, { name: "voice limit", syntax: "/voice limit <amount>", desc: "Updates the member capacity limit for your voice room.", perms: "Room Owner", example: "/voice limit 4" }),
      e.jsx(CommandCard, { name: "voice rename", syntax: "/voice rename <name>", desc: "Renames your active voice room.", perms: "Room Owner", example: "/voice rename Duo Ranked" })
    ]
  });
}

// -------------------------------------------------------------
// 13. PAGE SERVERSTATS
// -------------------------------------------------------------
function PageServerStats() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Server Statistics", color: "primary" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Display real-time server statistics in locked voice channel names. Counters update automatically."
      }),
      e.jsx(h2, { id: "counter-types", children: "Available Counters & Channels" }),
      e.jsx(SettingsTable, {
        rows: [
          ["All Members", "Counts all members including bots on the server.", "👥 Members: 1,250"],
          ["Humans", "Counts only real human users, excluding bot accounts.", "👤 Users: 1,238"],
          ["Bots", "Counts total bot accounts integrated into the guild.", "🤖 Bots: 12"],
          ["Server Boosts", "Shows active Nitro boost tier and total boosts.", "🚀 Boosts: Tier 3 (14)"],
          ["Online Members", "Counts currently active members (Online, DND, Idle).", "🟢 Online: 420"]
        ]
      }),
      e.jsx(h2, { id: "stats-commands", children: "Associated Commands" }),
      e.jsx(CommandCard, { name: "serverstats setup", syntax: "/serverstats setup", desc: "Automatically creates the category and statistical voice channels.", perms: "Administrator", example: "/serverstats setup" })
    ]
  });
}

// -------------------------------------------------------------
// 14. PAGE INVITES
// -------------------------------------------------------------
function PageInvites() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Invite Tracker", color: "amber" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Track exactly which member invited each newcomer, complete with fake account detection and leaver deductions."
      }),
      e.jsx(h2, { id: "invite-calculation", children: "Calculation & Anti-Fake" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Regular Invites", "Members who joined via an invite link and remain in the server.", "+1 Invite"],
          ["Left Invites", "Members who subsequently left the server.", "-1 Invite"],
          ["Fake Invites", "Accounts that leave abnormally fast or are suspicious alt accounts.", "0 (Filtered)"],
          ["Bonus Invites", "Custom invite points manually awarded by server administrators.", "Customizable"]
        ]
      }),
      e.jsx(h2, { id: "invite-commands", children: "Associated Commands" }),
      e.jsx(CommandCard, { name: "invites", syntax: "/invites [user]", desc: "Displays invite statistics for a specified member.", perms: "None", example: "/invites @Friend" }),
      e.jsx(CommandCard, { name: "inviteleaderboard", syntax: "/inviteleaderboard", desc: "Displays the top inviters on the server.", perms: "None", example: "/inviteleaderboard" })
    ]
  });
}

// -------------------------------------------------------------
// 15. PAGE AUTORESPONDER
// -------------------------------------------------------------
function PageAutoResponder() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Automation", color: "purple" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Create automated responses for frequently asked questions (FAQs) and configure persistent sticky messages that stay pinned to the bottom of active channels."
      }),
      e.jsx(h2, { id: "responder-types", children: "Trigger Types & Sticky Messages" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Exact Match", "Triggers only when the message matches the keyword exactly.", "e.g. !ip"],
          ["Contains", "Triggers whenever the keyword appears anywhere within the sentence.", "e.g. 'when update'"],
          ["Sticky Messages", "Keeps critical notices or channel rules pinned at the bottom of chat.", "Configurable per channel"]
        ]
      }),
      e.jsx(h2, { id: "responder-commands", children: "Associated Commands" }),
      e.jsx(CommandCard, { name: "autoresponder add", syntax: "/autoresponder add <trigger> <response>", desc: "Creates a new automated chat response.", perms: "Manage Messages", example: "/autoresponder add '!website' Visit https://orbitbot.com" }),
      e.jsx(CommandCard, { name: "autoresponder list", syntax: "/autoresponder list", desc: "Lists all active auto-responders on the server.", perms: "Manage Messages", example: "/autoresponder list" })
    ]
  });
}

// -------------------------------------------------------------
// 16. PAGE INACTIVEKICK
// -------------------------------------------------------------
function PageInactiveKick() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Server Hygiene", color: "red" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Keep your server active and purge dormant accounts that have not participated in chat or voice channels for months."
      }),
      e.jsx(h2, { id: "inactivity-settings", children: "Criteria & Exemptions" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Inactivity Period", "Days of complete inactivity (no chat or voice activity) before an account is marked.", "60 or 90 Days"],
          ["Exempt Roles", "Roles that will never be pruned (e.g. Staff, VIP, Boosters).", "@Staff, @VIP, @Booster"],
          ["Dry-Run (Preview)", "Safety test: Displays affected members without executing any kicks.", "Always run preview first!"]
        ]
      }),
      e.jsx(h2, { id: "kick-commands", children: "Associated Commands" }),
      e.jsx(CommandCard, { name: "inactivekick preview", syntax: "/inactivekick preview <days>", desc: "Generates a preview report of all members qualifying for inactive pruning.", perms: "Administrator", example: "/inactivekick preview 60" }),
      e.jsx(CommandCard, { name: "inactivekick run", syntax: "/inactivekick run <days>", desc: "Executes the removal of qualifying inactive members.", perms: "Administrator", example: "/inactivekick run 90" })
    ]
  });
}

// -------------------------------------------------------------
// 17. PAGE BACKUPS
// -------------------------------------------------------------
function PageBackups() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Server Security", color: "primary" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Create full snapshots of your Discord server (roles, channels, permission overrides, and bot configuration) and restore them with a single code."
      }),
      e.jsx(h2, { id: "backup-scope", children: "What is Backed Up?" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Roles & Permissions", "Backs up all roles, colors, hierarchy positions, and exact permissions.", "Complete"],
          ["Text & Voice Channels", "Backs up categories, channels, descriptions, slowmodes, and permission overwrites.", "Complete"],
          ["Bot Configuration", "Backs up all dashboard module settings and configurations.", "Complete"]
        ]
      }),
      e.jsx(h2, { id: "backup-commands", children: "Associated Commands" }),
      e.jsx(CommandCard, { name: "backup create", syntax: "/backup create", desc: "Generates a full server snapshot and outputs the unique backup key.", perms: "Server Owner", example: "/backup create" }),
      e.jsx(CommandCard, { name: "backup load", syntax: "/backup load <code>", desc: "Restores server structure and permissions from a backup key.", perms: "Server Owner", example: "/backup load orb_9a8f7c" })
    ]
  });
}

// -------------------------------------------------------------
// 18. PAGE APPEALS
// -------------------------------------------------------------
function PageAppeals() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Unban Portal", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Allow banned members to submit ban appeals through a web portal. Your staff can review cases and approve or deny unbans with a single click."
      }),
      e.jsx(h2, { id: "appeals-workflow", children: "Workflow & Moderation" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Web Submission Form", "Banned users authenticate via Discord OAuth2 and submit their appeal statement.", "Enabled"],
          ["Staff Review Channel", "Appeals are posted with 'Approve' and 'Reject' buttons in your staff channel.", "#ban-appeals"],
          ["Automated Unban", "Approving an appeal immediately lifts the Discord ban on the user account.", "Enabled"]
        ]
      })
    ]
  });
}

// -------------------------------------------------------------
// 19. PAGE MODLOG
// -------------------------------------------------------------
function PageModLog() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Audit & Mod Logs", color: "cyan" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Track all staff actions with unique Case IDs, log edited and deleted messages with original content, and audit role modifications."
      }),
      e.jsx(h2, { id: "log-categories", children: "Log Categories" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Mod Cases", "Bans, kicks, timeouts, and warnings logged with incremental Case IDs (#123) and reasons.", "#mod-logs"],
          ["Message Logs", "Logs edited and deleted messages (including previous message content and attachments).", "#msg-logs"],
          ["Server Logs", "Channel creation, role adjustments, and member join/leave logs.", "#server-logs"]
        ]
      }),
      e.jsx(h2, { id: "modlog-commands", children: "Associated Commands" }),
      e.jsx(CommandCard, { name: "cases", syntax: "/cases <user>", desc: "Displays all recorded moderation cases for a member.", perms: "Manage Messages", example: "/cases @User" }),
      e.jsx(CommandCard, { name: "case view", syntax: "/case view <id>", desc: "Fetches detailed records for a specific moderation case ID.", perms: "Manage Messages", example: "/case view 42" })
    ]
  });
}

// -------------------------------------------------------------
// 20. PAGE SETTINGS
// -------------------------------------------------------------
function PageSettings() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Bot Configuration", color: "primary" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "General server preferences and administrative controls in the Orbit Dashboard."
      }),
      e.jsx(h2, { id: "global-options", children: "Available Options" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Bot Prefix", "Prefix for legacy text commands (default: Slash commands /).", "!"],
          ["Dashboard Language", "Language for web dashboard interface and notifications.", "English (en)"],
          ["Admin Roles", "Roles granted full administrative control over Orbit dashboard settings.", "@Administrator"],
          ["Moderator Roles", "Roles authorized to execute moderation commands (/warn, /kick, /timeout).", "@Moderator"],
          ["0ms Instant Cache", "Browser cache-first architecture for latency-free tab switching.", "Always Active"]
        ]
      })
    ]
  });
}

// -------------------------------------------------------------
// 21. PAGE COMMANDS MOD
// -------------------------------------------------------------
function PageCommandsMod() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Command Reference", color: "amber" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Complete reference for all Orbit moderation commands, complete with syntax, permissions, and examples."
      }),
      e.jsx(CommandCard, { name: "ban", syntax: "/ban <user> [reason] [delete_days]", desc: "Permanently bans a member from the server with optional 1-7 day message deletion.", perms: "Ban Members", example: "/ban @Troll Harassment 1" }),
      e.jsx(CommandCard, { name: "unban", syntax: "/unban <user_id> [reason]", desc: "Lifts a ban using the target user's Discord ID.", perms: "Ban Members", example: "/unban 123456789012345678 Appeal approved" }),
      e.jsx(CommandCard, { name: "softban", syntax: "/softban <user> [reason]", desc: "Bans and immediately unbans a user to purge all their recent messages quickly.", perms: "Ban Members", example: "/softban @Spammer Chat cleanup" }),
      e.jsx(CommandCard, { name: "kick", syntax: "/kick <user> [reason]", desc: "Kicks a member from the server. They are eligible to rejoin with an invite.", perms: "Kick Members", example: "/kick @User Please review rules" }),
      e.jsx(CommandCard, { name: "timeout", syntax: "/timeout <user> <duration> [reason]", desc: "Places a member in Discord timeout for a set duration (e.g. 10m, 1h, 1d).", perms: "Moderate Members", example: "/timeout @User 30m Spamming" }),
      e.jsx(CommandCard, { name: "untimeout", syntax: "/untimeout <user>", desc: "Removes an active timeout from a member early.", perms: "Moderate Members", example: "/untimeout @User" }),
      e.jsx(CommandCard, { name: "mute", syntax: "/mute <user> <duration> [reason]", desc: "Role-based alternative to timeout — assigns the server Muted role.", perms: "Manage Roles", example: "/mute @User 2h Chat mute" }),
      e.jsx(CommandCard, { name: "unmute", syntax: "/unmute <user>", desc: "Removes the server Muted role from a member.", perms: "Manage Roles", example: "/unmute @User" }),
      e.jsx(CommandCard, { name: "warn", syntax: "/warn <user> <reason>", desc: "Issues an official warning and logs a new Case ID in the database.", perms: "Manage Messages", example: "/warn @User Spamming wrong channel" }),
      e.jsx(CommandCard, { name: "warnings", syntax: "/warnings <user>", desc: "Retrieves complete warning history for a user.", perms: "Manage Messages", example: "/warnings @User" }),
      e.jsx(CommandCard, { name: "delwarn", syntax: "/delwarn <warn_id>", desc: "Deletes a specific warning by its ID.", perms: "Manage Messages", example: "/delwarn 14" }),
      e.jsx(CommandCard, { name: "clearwarns", syntax: "/clearwarns <user>", desc: "Clears all warnings for a member completely.", perms: "Kick Members", example: "/clearwarns @User" }),
      e.jsx(CommandCard, { name: "purge", syntax: "/purge <amount>", desc: "Bulk deletes up to 100 messages from the active channel.", perms: "Manage Messages", example: "/purge 25" }),
      e.jsx(CommandCard, { name: "lock", syntax: "/lock [channel] [reason]", desc: "Locks a text channel for regular members (@everyone).", perms: "Manage Channels", example: "/lock #general Raid pause" }),
      e.jsx(CommandCard, { name: "unlock", syntax: "/unlock [channel]", desc: "Unlocks a previously locked channel.", perms: "Manage Channels", example: "/unlock #general" }),
      e.jsx(CommandCard, { name: "slowmode", syntax: "/slowmode <seconds>", desc: "Sets message cooldown rate limit for the channel (0 to disable).", perms: "Manage Channels", example: "/slowmode 5" }),
      e.jsx(CommandCard, { name: "nick", syntax: "/nick <user> [new_nick]", desc: "Updates or resets a member's server nickname.", perms: "Manage Nicknames", example: "/nick @User CoolName" })
    ]
  });
}

// -------------------------------------------------------------
// 22. PAGE COMMANDS MGMT
// -------------------------------------------------------------
function PageCommandsMgmt() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Server Management", color: "primary" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Commands for managing server structure, roles, embeds, and backups."
      }),
      e.jsx(CommandCard, { name: "setup", syntax: "/setup", desc: "Launches the interactive setup wizard for newly onboarded servers.", perms: "Administrator", example: "/setup" }),
      e.jsx(CommandCard, { name: "autorole", syntax: "/autorole set <role>", desc: "Configures default role granted to new members.", perms: "Manage Roles", example: "/autorole set @Member" }),
      e.jsx(CommandCard, { name: "reactionrole", syntax: "/reactionrole add <msg_id> <emoji> <role>", desc: "Binds an interactive emoji or button to a role.", perms: "Manage Roles", example: "/reactionrole add 987654321 ⭐ @VIP" }),
      e.jsx(CommandCard, { name: "embed", syntax: "/embed create", desc: "Launches the visual embed builder for announcements.", perms: "Manage Messages", example: "/embed create" }),
      e.jsx(CommandCard, { name: "backup create", syntax: "/backup create", desc: "Creates a complete server structure backup.", perms: "Server Owner", example: "/backup create" }),
      e.jsx(CommandCard, { name: "backup load", syntax: "/backup load <code>", desc: "Restores a server structure from a backup code.", perms: "Server Owner", example: "/backup load orb_123" }),
      e.jsx(CommandCard, { name: "serverstats setup", syntax: "/serverstats setup", desc: "Automatically provisions live statistics channels.", perms: "Administrator", example: "/serverstats setup" })
    ]
  });
}

// -------------------------------------------------------------
// 23. PAGE COMMANDS COMMUNITY
// -------------------------------------------------------------
function PageCommandsCommunity() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Community & Fun", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Commands for community members: leveling, leaderboards, polls, giveaways, support, and AFK status."
      }),
      e.jsx(CommandCard, { name: "rank", syntax: "/rank [user]", desc: "Displays personal rank card with level, XP, and server standing.", perms: "None", example: "/rank" }),
      e.jsx(CommandCard, { name: "leaderboard", syntax: "/leaderboard", desc: "Displays top active members in chat or links to web leaderboard.", perms: "None", example: "/leaderboard" }),
      e.jsx(CommandCard, { name: "giveaway start", syntax: "/giveaway start <duration> <winners> <prize>", desc: "Launches a community giveaway drawing.", perms: "Manage Messages", example: "/giveaway start 12h 1 Steam Key" }),
      e.jsx(CommandCard, { name: "poll", syntax: "/poll <question> <option1> <option2>", desc: "Starts an interactive voting poll in the channel.", perms: "Manage Messages", example: "/poll 'Pizza or Pasta?' 'Pizza' 'Pasta'" }),
      e.jsx(CommandCard, { name: "ticket panel", syntax: "/ticket panel", desc: "Deploys the support ticket creation panel.", perms: "Administrator", example: "/ticket panel" }),
      e.jsx(CommandCard, { name: "afk", syntax: "/afk [status]", desc: "Sets your status to AFK and notifies anyone mentioning you.", perms: "None", example: "/afk Grabbing food" }),
      e.jsx(CommandCard, { name: "remind", syntax: "/remind <time> <message>", desc: "Sends you a DM reminder once the specified duration elapses.", perms: "None", example: "/remind 2h Check oven" })
    ]
  });
}

// -------------------------------------------------------------
// 24. PAGE COMMANDS INFO
// -------------------------------------------------------------
function PageCommandsInfo() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Information & Utility", color: "cyan" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Informational utilities for users, servers, avatars, and bot metrics."
      }),
      e.jsx(CommandCard, { name: "help", syntax: "/help [command]", desc: "Displays full command index or details on a specific command.", perms: "None", example: "/help ban" }),
      e.jsx(CommandCard, { name: "botinfo", syntax: "/botinfo", desc: "Displays bot system resources, latency, server count, and version.", perms: "None", example: "/botinfo" }),
      e.jsx(CommandCard, { name: "serverinfo", syntax: "/serverinfo", desc: "Detailed information about the current Discord server (creation date, boost tier, role count).", perms: "None", example: "/serverinfo" }),
      e.jsx(CommandCard, { name: "userinfo", syntax: "/userinfo [user]", desc: "Inspects a member's profile, join date, roles, and permissions.", perms: "None", example: "/userinfo @Friend" }),
      e.jsx(CommandCard, { name: "avatar", syntax: "/avatar [user]", desc: "Fetches full-resolution avatar image for a user.", perms: "None", example: "/avatar @User" }),
      e.jsx(CommandCard, { name: "banner", syntax: "/banner [user]", desc: "Fetches high-resolution profile banner for a user.", perms: "None", example: "/banner @User" }),
      e.jsx(CommandCard, { name: "ping", syntax: "/ping", desc: "Measures WebSocket heartbeat and REST API latency.", perms: "None", example: "/ping" }),
      e.jsx(CommandCard, { name: "steal", syntax: "/steal <emoji> [name]", desc: "Clones an emoji or sticker from another server into your guild.", perms: "Manage Emojis", example: "/steal :pepe_clap:" })
    ]
  });
}

// -------------------------------------------------------------
// 25. PAGE COMMANDS ADMIN
// -------------------------------------------------------------
function PageCommandsAdmin() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Administration & Security", color: "red" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Specialized administrative controls for security, whitelist enforcement, and emergency management."
      }),
      e.jsx(CommandCard, { name: "security", syntax: "/security status", desc: "Inspects status of all security filters and active defenses.", perms: "Administrator", example: "/security status" }),
      e.jsx(CommandCard, { name: "antiraid", syntax: "/antiraid <on|off>", desc: "Manually triggers or deactivates anti-raid defense mode.", perms: "Administrator", example: "/antiraid on" }),
      e.jsx(CommandCard, { name: "whitelist", syntax: "/whitelist add <user|role>", desc: "Adds trusted users or roles to the security whitelist.", perms: "Administrator", example: "/whitelist add @AdminTeam" }),
      e.jsx(CommandCard, { name: "blacklist", syntax: "/blacklist add <phrase>", desc: "Appends phrases to the global server word blacklist.", perms: "Administrator", example: "/blacklist add scamlink" }),
      e.jsx(CommandCard, { name: "voice setup", syntax: "/voice setup", desc: "Automatically creates the TempVoice Hub and category.", perms: "Administrator", example: "/voice setup" })
    ]
  });
}

// -------------------------------------------------------------
// 26. PAGE GUIDES INDEX
// -------------------------------------------------------------
function PageGuidesIndex() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Practical Guides", color: "primary" }),
      e.jsx("p", {
        className: "text-lg text-neutral-300 leading-relaxed mb-6",
        children: "Welcome to the Orbit Guides! Here you'll find comprehensive, step-by-step walkthroughs to configure, secure, and automate your Discord community from scratch."
      }),
      e.jsx(h2, { id: "popular-guides", children: "Popular Guides" }),
      e.jsxs(Cards, {
        children: [
          e.jsx(Card, { title: "Server Setup from 0 to 100", href: "/docs/guides/server-setup", children: "The ultimate starter blueprint for modern gaming and community servers." }),
          e.jsx(Card, { title: "Anti-Raid & Server Security", href: "/docs/guides/antiraid-security", children: "How to lock down your server against mass joins, token raids, and spambots." }),
          e.jsx(Card, { title: "Support & Ticket Systems", href: "/docs/guides/tickets-support", children: "Build a professional customer support pipeline with automated HTML transcripts." }),
          e.jsx(Card, { title: "Leveling & Role Rewards", href: "/docs/guides/leveling-rewards", children: "Reward active community members with balanced chat and voice XP progression." }),
          e.jsx(Card, { title: "TempVoice / Voice Lounges", href: "/docs/guides/tempvoice-channels", children: "Eliminate empty voice channels with dynamic 'Join to Create' voice rooms." }),
          e.jsx(Card, { title: "Auto-Moderation Masterclass", href: "/docs/guides/automod-moderation", children: "Fine-tune regex filters, anti-spam thresholds, and automated punishment ladders." })
        ]
      })
    ]
  });
}

// -------------------------------------------------------------
// 27. PAGE GUIDE SERVER SETUP
// -------------------------------------------------------------
function PageGuideServerSetup() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Setup Guide", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "This guide walks you through the foundational steps to structure your Discord server with Orbit, establish proper role hierarchies, and enable core modules."
      }),
      e.jsx(h2, { id: "step-1-invite", children: "1. Bot Invitation & Core Permissions" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Invite Orbit using the official OAuth2 link. Grant Administrator permissions to ensure the bot can create channels and assign roles without permission conflicts." }),
      e.jsx(h2, { id: "step-2-roles", children: "2. Role Hierarchy & Permissions" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "In Discord under 'Server Settings -> Roles', drag the Orbit bot role above all regular member roles. Orbit can only manage and assign roles that are hierarchically beneath it." }),
      e.jsx(h2, { id: "step-3-channels", children: "3. Recommended Channel Structure" }),
      e.jsx("ul", { className: "list-disc pl-5 space-y-1.5 text-neutral-300 mb-4", children: [
        e.jsx("li", { children: "#welcome – Greeting cards for new arrivals" }),
        e.jsx("li", { children: "#verify – Verification gate for new members" }),
        e.jsx("li", { children: "#rules – Server guidelines and information" }),
        e.jsx("li", { children: "#support – Ticket panel for user inquiries" }),
        e.jsx("li", { children: "#mod-logs – Internal staff audit and action logs" })
      ]}),
      e.jsx(h2, { id: "step-4-dashboard", children: "4. Enable Modules in Dashboard" }),
      e.jsx("p", { className: "text-neutral-300", children: "Visit /dashboard, select your server, and enable your chosen tabs (AutoMod, Verification, Leveling, TempVoice)." })
    ]
  });
}

// -------------------------------------------------------------
// 28. PAGE GUIDE ANTI-RAID
// -------------------------------------------------------------
function PageGuideAntiRaid() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Security Guide", color: "red" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Raids and bot floods can disrupt a community in seconds. Follow this guide to configure Orbit for 100% raid resilience."
      }),
      e.jsx(h2, { id: "mass-join", children: "1. Enable Mass-Join Protection" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "In the Security tab, set Mass-Join Protection to '8 joins within 10 seconds'. When triggered, Orbit instantly pauses server invites and alerts your moderation staff." }),
      e.jsx(h2, { id: "account-age", children: "2. Enforce Account Age Gate" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Require accounts to be at least 3 days old before joining. The vast majority of raid bots are freshly registered disposable accounts and will be filtered out." }),
      e.jsx(h2, { id: "emergency-commands", children: "3. Essential Emergency Commands" }),
      e.jsx(CommandCard, { name: "lock", syntax: "/lock", desc: "Instantly locks the current channel for @everyone.", perms: "Manage Channels", example: "/lock" }),
      e.jsx(CommandCard, { name: "antiraid", syntax: "/antiraid on", desc: "Manually engages the highest security lockdown tier.", perms: "Administrator", example: "/antiraid on" })
    ]
  });
}

// -------------------------------------------------------------
// 29. PAGE GUIDE TICKETS
// -------------------------------------------------------------
function PageGuideTickets() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Support Guide", color: "primary" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Deliver high-tier support to your members with private ticket rooms, staff mentions, and searchable HTML transcripts."
      }),
      e.jsx(h2, { id: "create-panel", children: "1. Deploy the Ticket Panel" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Run /ticket panel in your designated support channel or design and deploy your custom panel from the Web Dashboard." }),
      e.jsx(h2, { id: "staff-role", children: "2. Define Staff Roles" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Assign your Moderator or Support role. Only staff members holding this role will have viewing and management permissions in newly opened tickets." }),
      e.jsx(h2, { id: "transcripts", children: "3. Archive HTML Transcripts" }),
      e.jsx("p", { className: "text-neutral-300", children: "Set your transcript log channel to #ticket-logs. Whenever a ticket is closed, Orbit compiles the entire chat into an interactive, downloadable HTML document." })
    ]
  });
}

// -------------------------------------------------------------
// 30. PAGE GUIDE LEVELING
// -------------------------------------------------------------
function PageGuideLeveling() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Community Guide", color: "amber" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Active members are the heartbeat of every Discord server. Learn how to balance XP gains and role rewards to keep engagement high."
      }),
      e.jsx(h2, { id: "xp-balance", children: "1. Perfecting the XP Economy" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "By default, members receive 15-25 XP every 60 seconds for chat messages and 5-10 XP per minute in voice channels. Muted or deafened users do not earn voice XP." }),
      e.jsx(h2, { id: "role-rewards", children: "2. Tiered Role Progression" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Recommended milestone tiers: Level 5 (Regular), Level 15 (Active Member), Level 30 (Veteran), Level 50 (Server Legend)." }),
      e.jsx(h2, { id: "level-channel", children: "3. Dedicated Level-Up Channel" }),
      e.jsx("p", { className: "text-neutral-300", children: "Direct level-up notifications to a dedicated #level-ups channel to keep main discussion chats clean and focused." })
    ]
  });
}

// -------------------------------------------------------------
// 31. PAGE GUIDE TEMPVOICE
// -------------------------------------------------------------
function PageGuideTempVoice() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Voice Guide", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Say goodbye to cluttered lists of empty voice channels. With 'Join to Create', rooms are dynamically created on demand."
      }),
      e.jsx(h2, { id: "hub-setup", children: "1. Create the Voice Hub" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Run /voice setup or select the '➕ Create Voice' hub channel in your dashboard." }),
      e.jsx(h2, { id: "owner-controls", children: "2. Channel Owner Controls" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "The creator retains full channel authority: they can lock the room with /voice lock, restrict capacity with /voice limit, or rename it with /voice rename." }),
      e.jsx(h2, { id: "auto-cleanup", children: "3. Automatic Cleanup" }),
      e.jsx("p", { className: "text-neutral-300", children: "Once the last participant leaves the temporary room, Orbit deletes it instantly, keeping your server clean." })
    ]
  });
}

// -------------------------------------------------------------
// 32. PAGE GUIDE AUTOMOD
// -------------------------------------------------------------
function PageGuideAutoMod() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Moderation Guide", color: "purple" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Learn how to configure Orbit's Content Filter and Anti-Spam systems to block toxic content without disrupting genuine conversations."
      }),
      e.jsx(h2, { id: "filter-levels", children: "1. Relaxed vs. Strict Filtering" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Strict mode detects zero-width characters, spaced text, and leetspeak bypasses (e.g. 'f_u_c_k'). For most servers, Strict mode with a staff whitelist provides optimal safety." }),
      e.jsx(h2, { id: "anti-spam", children: "2. Anti-Spam Tuning" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "We recommend 5 messages within 3 seconds. This accommodates fast typists while neutralizing automated macros and spammers." }),
      e.jsx(h2, { id: "escalation", children: "3. Graduated Punishment Ladders" }),
      e.jsx("p", { className: "text-neutral-300", children: "Warn on 1st offense, 10-minute timeout on 2nd offense, and kick or ban on 3+ repeated offenses." })
    ]
  });
}

// -------------------------------------------------------------
// 33. PAGE RELEASES INDEX
// -------------------------------------------------------------
function PageReleasesIndex() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Changelog", color: "primary" }),
      e.jsx("p", {
        className: "text-lg text-neutral-300 leading-relaxed mb-6",
        children: "Complete overview of all Orbit version releases, new features, performance updates, and bug fixes."
      }),
      e.jsx(h2, { id: "release-overview", children: "Recent Releases" }),
      e.jsxs(Cards, {
        children: [
          e.jsx(Card, { title: "Orbit v2.4 (Current)", href: "/docs/releases/v2-4", children: "0ms Instant Dashboard Cache, enhanced AutoMod engine, and downloadable HTML transcripts." }),
          e.jsx(Card, { title: "Orbit v2.3", href: "/docs/releases/v2-3", children: "Dynamic TempVoice (Join to Create) and giveaways with role requirements." }),
          e.jsx(Card, { title: "Orbit v2.2", href: "/docs/releases/v2-2", children: "New multi-category ticket system and interactive polls with live percentage bars." }),
          e.jsx(Card, { title: "Orbit v2.1", href: "/docs/releases/v2-1", children: "Anti-Raid Shield, Account Age Gate, and emergency server lockdown." }),
          e.jsx(Card, { title: "Orbit v2.0", href: "/docs/releases/v2-0", children: "Complete architectural relaunch built natively on Discord Slash Commands." })
        ]
      })
    ]
  });
}

// -------------------------------------------------------------
// 34. PAGE RELEASE V24
// -------------------------------------------------------------
function PageReleaseV24() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Version 2.4 – October 2026", color: "green" }),
      e.jsx("p", { className: "text-neutral-300 leading-relaxed mb-6", children: "Our biggest performance and usability update yet!" }),
      e.jsx(h2, { id: "highlights", children: "Key Highlights" }),
      e.jsx("ul", { className: "list-disc pl-5 space-y-2 text-neutral-300 mb-6", children: [
        e.jsxs("li", { children: [e.jsx("strong", { children: "0ms Web Dashboard: " }), "Thanks to cache-first architecture and background tab pre-mounting, switching between all 18 dashboard modules is instantaneous."] }),
        e.jsxs("li", { children: [e.jsx("strong", { children: "Refactored AutoMod Engine: " }), "Detects zero-width spaces, Unicode homoglyphs, and obfuscated character sequences."] }),
        e.jsxs("li", { children: [e.jsx("strong", { children: "HTML Transcripts: " }), "Tickets compile upon closure into downloadable, standalone web files with avatars, embeds, and timestamps."] }),
        e.jsxs("li", { children: [e.jsx("strong", { children: "Global Search: " }), "Documentation includes a keyboard-driven search modal with Ctrl + K."] })
      ]})
    ]
  });
}

// -------------------------------------------------------------
// 35. PAGE RELEASE V23
// -------------------------------------------------------------
function PageReleaseV23() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Version 2.3 – September 2026", color: "cyan" }),
      e.jsx("p", { className: "text-neutral-300 leading-relaxed mb-6", children: "Focused on voice engagement and community events." }),
      e.jsx(h2, { id: "features", children: "New Features" }),
      e.jsx("ul", { className: "list-disc pl-5 space-y-2 text-neutral-300 mb-6", children: [
        e.jsxs("li", { children: [e.jsx("strong", { children: "TempVoice: " }), "Fully automated 'Join to Create' temporary voice channel system with creator controls (/voice lock, /voice limit)."] }),
        e.jsxs("li", { children: [e.jsx("strong", { children: "Giveaway Requirements: " }), "Giveaways can now require specific roles (e.g. Server Boosters) to enter."] })
      ]})
    ]
  });
}

// -------------------------------------------------------------
// 36. PAGE RELEASE V22
// -------------------------------------------------------------
function PageReleaseV22() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Version 2.2 – August 2026", color: "purple" }),
      e.jsx("p", { className: "text-neutral-300 leading-relaxed mb-6", children: "Upgraded support ticketing and interactive polling." }),
      e.jsx(h2, { id: "features", children: "New Features" }),
      e.jsx("ul", { className: "list-disc pl-5 space-y-2 text-neutral-300 mb-6", children: [
        e.jsxs("li", { children: [e.jsx("strong", { children: "Categorized Tickets: " }), "Support for up to 5 custom ticket categories with dedicated dropdown routing."] }),
        e.jsxs("li", { children: [e.jsx("strong", { children: "Interactive Polls: " }), "Single and multiple-choice voting with real-time percentage indicators."] })
      ]})
    ]
  });
}

// -------------------------------------------------------------
// 37. PAGE RELEASE V21
// -------------------------------------------------------------
function PageReleaseV21() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Version 2.1 – July 2026", color: "red" }),
      e.jsx("p", { className: "text-neutral-300 leading-relaxed mb-6", children: "Heightened security against botnets and mass-join raids." }),
      e.jsx(h2, { id: "features", children: "New Features" }),
      e.jsx("ul", { className: "list-disc pl-5 space-y-2 text-neutral-300 mb-6", children: [
        e.jsxs("li", { children: [e.jsx("strong", { children: "Anti-Raid Shield: " }), "Surge detection for sudden join spikes with automated defensive lockdown."] }),
        e.jsxs("li", { children: [e.jsx("strong", { children: "Account Age Gate: " }), "Automated rejection for freshly registered disposable accounts."] })
      ]})
    ]
  });
}

// -------------------------------------------------------------
// 38. PAGE RELEASE V20
// -------------------------------------------------------------
function PageReleaseV20() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Version 2.0 – June 2026", color: "amber" }),
      e.jsx("p", { className: "text-neutral-300 leading-relaxed mb-6", children: "Complete rebuild of the entire Orbit platform." }),
      e.jsx(h2, { id: "features", children: "Highlights" }),
      e.jsx("ul", { className: "list-disc pl-5 space-y-2 text-neutral-300 mb-6", children: [
        e.jsx("li", { children: "100% Discord Slash Commands native integration." }),
        e.jsx("li", { children: "Microservice architecture for sub-10ms response times." }),
        e.jsx("li", { children: "Launch of the modern Web Dashboard for server administrators." })
      ]})
    ]
  });
}

// -------------------------------------------------------------
// ORBIT_PAGES DICTIONARY (All routes + frontmatter + TOC)
// -------------------------------------------------------------
const ORBIT_PAGES = {
  // Docs Tab
  "index.mdx": () => Promise.resolve({
    default: PageIntro,
    frontmatter: { title: "Welcome to Orbit Docs", description: "Official documentation for the all-in-one Discord bot Orbit.", icon: "BookOpen" },
    toc: [{ depth: 2, url: "#why-orbit", title: "Why Orbit?" }, { depth: 2, url: "#quick-search", title: "Global Search" }]
  }),
  "quickstart.mdx": () => Promise.resolve({
    default: PageQuickstart,
    frontmatter: { title: "Quickstart", description: "Invite Orbit and configure your server in under 3 minutes.", icon: "Rocket" },
    toc: [{ depth: 2, url: "#step-by-step", title: "Step-by-Step Setup" }]
  }),
  "modules/automod.mdx": () => Promise.resolve({
    default: PageAutoMod,
    frontmatter: { title: "Auto-Moderation", description: "Real-time protection against bad words, spam, links, and mass-mentions.", icon: "ShieldAlert" },
    toc: [{ depth: 2, url: "#settings-table", title: "Settings & Toggles" }, { depth: 2, url: "#step-by-step-setup", title: "Setup" }, { depth: 2, url: "#associated-commands", title: "Commands" }]
  }),
  "modules/welcome.mdx": () => Promise.resolve({
    default: PageWelcome,
    frontmatter: { title: "Welcome & Goodbye", description: "Greet and bid farewell to members with personalized embeds.", icon: "Heart" },
    toc: [{ depth: 2, url: "#variables", title: "Variables" }, { depth: 2, url: "#configuration", title: "Dashboard Settings" }]
  }),
  "modules/verification.mdx": () => Promise.resolve({
    default: PageVerification,
    frontmatter: { title: "Verification", description: "Secure your server with button, captcha, and password gates.", icon: "CheckCircle" },
    toc: [{ depth: 2, url: "#methods", title: "Verification Modes" }, { depth: 2, url: "#role-setup", title: "Role Setup" }]
  }),
  "modules/security.mdx": () => Promise.resolve({
    default: PageSecurity,
    frontmatter: { title: "Server Security & Anti-Raid", description: "Mass-join protection, account age verification, and emergency lockdown.", icon: "ShieldCheck" },
    toc: [{ depth: 2, url: "#security-toggles", title: "Security Features" }, { depth: 2, url: "#security-commands", title: "Commands" }]
  }),
  "modules/roles.mdx": () => Promise.resolve({
    default: PageRoles,
    frontmatter: { title: "Roles & Reaction Roles", description: "Automatic join roles, button selection, and role hierarchies.", icon: "Users" },
    toc: [{ depth: 2, url: "#role-features", title: "Features" }, { depth: 2, url: "#role-commands", title: "Commands" }]
  }),
  "modules/level.mdx": () => Promise.resolve({
    default: PageLevel,
    frontmatter: { title: "Leveling & XP", description: "Text and voice activity leveling with tiered role rewards.", icon: "Award" },
    toc: [{ depth: 2, url: "#xp-system", title: "XP System" }, { depth: 2, url: "#role-rewards", title: "Role Rewards" }, { depth: 2, url: "#level-commands", title: "Commands" }]
  }),
  "modules/tickets.mdx": () => Promise.resolve({
    default: PageTickets,
    frontmatter: { title: "Tickets & Support", description: "Support panels with buttons and automated HTML transcripts.", icon: "Ticket" },
    toc: [{ depth: 2, url: "#ticket-features", title: "Features" }, { depth: 2, url: "#ticket-commands", title: "Commands" }]
  }),
  "modules/giveaways.mdx": () => Promise.resolve({
    default: PageGiveaways,
    frontmatter: { title: "Giveaways", description: "Automated giveaways with button entry, countdowns, and rerolls.", icon: "Gift" },
    toc: [{ depth: 2, url: "#giveaway-features", title: "Options" }, { depth: 2, url: "#giveaway-commands", title: "Commands" }]
  }),
  "modules/polls.mdx": () => Promise.resolve({
    default: PagePolls,
    frontmatter: { title: "Polls & Surveys", description: "Interactive community voting with live percentage visualizers.", icon: "BarChart3" },
    toc: [{ depth: 2, url: "#poll-features", title: "Options" }, { depth: 2, url: "#poll-commands", title: "Commands" }]
  }),
  "modules/tempvoice.mdx": () => Promise.resolve({
    default: PageTempVoice,
    frontmatter: { title: "TempVoice / Join to Create", description: "Dynamic temporary voice channels with automated deletion and owner controls.", icon: "Mic" },
    toc: [{ depth: 2, url: "#tempvoice-settings", title: "Settings" }, { depth: 2, url: "#tempvoice-commands", title: "Commands" }]
  }),
  "modules/serverstats.mdx": () => Promise.resolve({
    default: PageServerStats,
    frontmatter: { title: "Server Statistics", description: "Live counter channels for members, humans, bots, and boosts.", icon: "Activity" },
    toc: [{ depth: 2, url: "#counter-types", title: "Counter Types" }, { depth: 2, url: "#stats-commands", title: "Commands" }]
  }),
  "modules/invites.mdx": () => Promise.resolve({
    default: PageInvites,
    frontmatter: { title: "Invite Tracker", description: "Track joins, fake invites, and server invite leaderboards.", icon: "UserPlus" },
    toc: [{ depth: 2, url: "#invite-calculation", title: "Calculation" }, { depth: 2, url: "#invite-commands", title: "Commands" }]
  }),
  "modules/autoresponder.mdx": () => Promise.resolve({
    default: PageAutoResponder,
    frontmatter: { title: "Auto-Responder & Automation", description: "Automated chat responses and sticky messages.", icon: "Bot" },
    toc: [{ depth: 2, url: "#responder-types", title: "Trigger Types" }, { depth: 2, url: "#responder-commands", title: "Commands" }]
  }),
  "modules/inactivekick.mdx": () => Promise.resolve({
    default: PageInactiveKick,
    frontmatter: { title: "Inactive Kick", description: "Automatically prune inactive members with custom role exemptions.", icon: "UserMinus" },
    toc: [{ depth: 2, url: "#inactivity-settings", title: "Criteria" }, { depth: 2, url: "#kick-commands", title: "Commands" }]
  }),
  "modules/backups.mdx": () => Promise.resolve({
    default: PageBackups,
    frontmatter: { title: "Server Backups", description: "Complete backup of roles, channels, permissions, and server configurations.", icon: "Database" },
    toc: [{ depth: 2, url: "#backup-scope", title: "Scope" }, { depth: 2, url: "#backup-commands", title: "Commands" }]
  }),
  "modules/appeals.mdx": () => Promise.resolve({
    default: PageAppeals,
    frontmatter: { title: "Ban Appeals", description: "Web-based unban application portal with staff review buttons.", icon: "Scale" },
    toc: [{ depth: 2, url: "#appeals-workflow", title: "Workflow & Review" }]
  }),
  "modules/modlog.mdx": () => Promise.resolve({
    default: PageModLog,
    frontmatter: { title: "Audit & Mod Logs", description: "Moderation case tracking with Case IDs and message logs.", icon: "FileText" },
    toc: [{ depth: 2, url: "#log-categories", title: "Categories" }, { depth: 2, url: "#modlog-commands", title: "Commands" }]
  }),
  "modules/settings.mdx": () => Promise.resolve({
    default: PageSettings,
    frontmatter: { title: "Dashboard Settings", description: "Bot prefix, language, admin roles, and performance options.", icon: "Settings" },
    toc: [{ depth: 2, url: "#global-options", title: "Options" }]
  }),
  "commands/moderation.mdx": () => Promise.resolve({
    default: PageCommandsMod,
    frontmatter: { title: "Moderation Commands", description: "Complete reference for all Orbit moderation commands.", icon: "Shield" },
    toc: [{ depth: 2, url: "#ban", title: "/ban" }, { depth: 2, url: "#kick", title: "/kick" }, { depth: 2, url: "#timeout", title: "/timeout" }, { depth: 2, url: "#warn", title: "/warn" }, { depth: 2, url: "#purge", title: "/purge" }]
  }),
  "commands/management.mdx": () => Promise.resolve({
    default: PageCommandsMgmt,
    frontmatter: { title: "Management Commands", description: "Commands to configure and administer your Discord server.", icon: "Sliders" },
    toc: [{ depth: 2, url: "#setup", title: "/setup" }, { depth: 2, url: "#autorole", title: "/autorole" }, { depth: 2, url: "#backup", title: "/backup" }]
  }),
  "commands/community.mdx": () => Promise.resolve({
    default: PageCommandsCommunity,
    frontmatter: { title: "Community Commands", description: "Commands for member ranks, giveaways, polls, and interaction.", icon: "Users" },
    toc: [{ depth: 2, url: "#rank", title: "/rank" }, { depth: 2, url: "#leaderboard", title: "/leaderboard" }, { depth: 2, url: "#giveaway", title: "/giveaway" }, { depth: 2, url: "#poll", title: "/poll" }]
  }),
  "commands/info.mdx": () => Promise.resolve({
    default: PageCommandsInfo,
    frontmatter: { title: "Info & Utility Commands", description: "Commands for bot statistics, server info, avatars, and utilities.", icon: "Info" },
    toc: [{ depth: 2, url: "#help", title: "/help" }, { depth: 2, url: "#botinfo", title: "/botinfo" }, { depth: 2, url: "#userinfo", title: "/userinfo" }]
  }),
  "commands/admin.mdx": () => Promise.resolve({
    default: PageCommandsAdmin,
    frontmatter: { title: "Admin & Security Commands", description: "Commands for security status, whitelists, blacklists, and emergency lockdown.", icon: "Lock" },
    toc: [{ depth: 2, url: "#security", title: "/security" }, { depth: 2, url: "#antiraid", title: "/antiraid" }, { depth: 2, url: "#whitelist", title: "/whitelist" }]
  }),

  // Guides Tab
  "guides/index.mdx": () => Promise.resolve({
    default: PageGuidesIndex,
    frontmatter: { title: "Orbit Guides & Tutorials", description: "Comprehensive step-by-step guides for your server.", icon: "Compass" },
    toc: [{ depth: 2, url: "#popular-guides", title: "Popular Guides" }]
  }),
  "guides/server-setup.mdx": () => Promise.resolve({
    default: PageGuideServerSetup,
    frontmatter: { title: "Server Setup from 0 to 100", description: "Complete initial configuration of your Discord server with Orbit.", icon: "Layers" },
    toc: [{ depth: 2, url: "#step-1-invite", title: "1. Bot Invitation" }, { depth: 2, url: "#step-2-roles", title: "2. Role Hierarchy" }, { depth: 2, url: "#step-3-channels", title: "3. Channels" }, { depth: 2, url: "#step-4-dashboard", title: "4. Dashboard" }]
  }),
  "guides/antiraid-security.mdx": () => Promise.resolve({
    default: PageGuideAntiRaid,
    frontmatter: { title: "Anti-Raid & Server Security", description: "Optimal configuration to prevent mass-joins and spambots.", icon: "ShieldAlert" },
    toc: [{ depth: 2, url: "#mass-join", title: "Mass-Join Protection" }, { depth: 2, url: "#account-age", title: "Account Age Gate" }, { depth: 2, url: "#emergency-commands", title: "Emergency Commands" }]
  }),
  "guides/tickets-support.mdx": () => Promise.resolve({
    default: PageGuideTickets,
    frontmatter: { title: "Support & Ticket Systems", description: "Build a professional support workflow with HTML transcripts.", icon: "Ticket" },
    toc: [{ depth: 2, url: "#create-panel", title: "Deploy Panel" }, { depth: 2, url: "#staff-role", title: "Staff Role" }, { depth: 2, url: "#transcripts", title: "Transcripts" }]
  }),
  "guides/leveling-rewards.mdx": () => Promise.resolve({
    default: PageGuideLeveling,
    frontmatter: { title: "Leveling & Role Rewards", description: "Optimal XP economy balance and tiered role reward setup.", icon: "Award" },
    toc: [{ depth: 2, url: "#xp-balance", title: "XP Balance" }, { depth: 2, url: "#role-rewards", title: "Role Rewards" }, { depth: 2, url: "#level-channel", title: "Level Channel" }]
  }),
  "guides/tempvoice-channels.mdx": () => Promise.resolve({
    default: PageGuideTempVoice,
    frontmatter: { title: "TempVoice / Join to Create", description: "Dynamic temporary voice lounges with automatic cleanup.", icon: "Mic" },
    toc: [{ depth: 2, url: "#hub-setup", title: "Hub Setup" }, { depth: 2, url: "#owner-controls", title: "Owner Controls" }, { depth: 2, url: "#auto-cleanup", title: "Auto-Cleanup" }]
  }),
  "guides/automod-moderation.mdx": () => Promise.resolve({
    default: PageGuideAutoMod,
    frontmatter: { title: "Auto-Moderation Masterclass", description: "Fine-tune regex filters, anti-spam thresholds, and punishments.", icon: "Sliders" },
    toc: [{ depth: 2, url: "#filter-levels", title: "Filter Strictness" }, { depth: 2, url: "#anti-spam", title: "Anti-Spam" }, { depth: 2, url: "#escalation", title: "Punishment Ladder" }]
  }),

  // Release Notes Tab
  "releases/index.mdx": () => Promise.resolve({
    default: PageReleasesIndex,
    frontmatter: { title: "Orbit Release Notes", description: "Version history and update changelog for Orbit.", icon: "ScrollText" },
    toc: [{ depth: 2, url: "#release-overview", title: "Recent Releases" }]
  }),
  "releases/v2-4.mdx": () => Promise.resolve({
    default: PageReleaseV24,
    frontmatter: { title: "Orbit v2.4", description: "0ms Web Dashboard, refactored AutoMod engine, and HTML transcripts.", icon: "Sparkles" },
    toc: [{ depth: 2, url: "#highlights", title: "Key Highlights" }]
  }),
  "releases/v2-3.mdx": () => Promise.resolve({
    default: PageReleaseV23,
    frontmatter: { title: "Orbit v2.3", description: "TempVoice (Join to Create) and giveaways with role requirements.", icon: "Mic" },
    toc: [{ depth: 2, url: "#features", title: "New Features" }]
  }),
  "releases/v2-2.mdx": () => Promise.resolve({
    default: PageReleaseV22,
    frontmatter: { title: "Orbit v2.2", description: "New multi-category ticket system and interactive polls with live bars.", icon: "Ticket" },
    toc: [{ depth: 2, url: "#features", title: "New Features" }]
  }),
  "releases/v2-1.mdx": () => Promise.resolve({
    default: PageReleaseV21,
    frontmatter: { title: "Orbit v2.1", description: "Anti-Raid Shield, Account Age Gate, and emergency server lockdown.", icon: "Shield" },
    toc: [{ depth: 2, url: "#features", title: "New Features" }]
  }),
  "releases/v2-0.mdx": () => Promise.resolve({
    default: PageReleaseV20,
    frontmatter: { title: "Orbit v2.0", description: "Complete architectural relaunch built natively on Discord Slash Commands.", icon: "Rocket" },
    toc: [{ depth: 2, url: "#features", title: "Highlights" }]
  })
};

// Aliases for flat and index-less routes
for (const [k, v] of Object.entries(ORBIT_PAGES)) {
  const flat = k.split("/").pop();
  if (flat && !ORBIT_PAGES[flat]) {
    ORBIT_PAGES[flat] = v;
  }
}
ORBIT_PAGES["guides.mdx"] = ORBIT_PAGES["guides/index.mdx"];
ORBIT_PAGES["releases.mdx"] = ORBIT_PAGES["releases/index.mdx"];

// -------------------------------------------------------------
// NAVIGATION TREES & SEARCH INDEX (100% English)
// -------------------------------------------------------------
const ORBIT_PAGE_TREE = {
  "$id": "root",
  "name": "Orbit Docs",
  "children": [
    {
      "$id": "root:index.mdx",
      "type": "page",
      "name": "Introduction",
      "description": "Welcome to the official Orbit documentation.",
      "url": "/docs",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-book-open size-4\"><path d=\"M12 7v14\"></path><path d=\"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z\"></path></svg>"
    },
    {
      "$id": "root:quickstart.mdx",
      "type": "page",
      "name": "Quickstart",
      "description": "Invite Orbit and configure your server in under 3 minutes.",
      "url": "/docs/quickstart",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-rocket size-4\"><path d=\"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z\"></path><path d=\"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z\"></path><path d=\"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0\"></path><path d=\"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5\"></path></svg>"
    },
    {
      "$id": "root:sep_mod",
      "type": "separator",
      "name": "Moderation & Security"
    },
    {
      "type": "page",
      "name": "Auto-Moderation",
      "url": "/docs/modules/automod",
      "description": "Banned words, anti-spam, link filters, and mass-mentions.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-shield-alert size-4\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"></path><path d=\"M12 8v4\"></path><path d=\"M12 16h.01\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Verification",
      "url": "/docs/modules/verification",
      "description": "Button, Captcha, and password protection for new members.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-badge-check size-4\"><path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\"></path><path d=\"m9 12 2 2 4-4\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Security & Anti-Raid",
      "url": "/docs/modules/security",
      "description": "Mass-join protection, account age verification, and lockdown.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-shield-check size-4\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"></path><path d=\"m9 12 2 2 4-4\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Inactive Kick",
      "url": "/docs/modules/inactivekick",
      "description": "Automatically prune inactive accounts from your server.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-user-x size-4\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><line x1=\"17\" x2=\"22\" y1=\"8\" y2=\"13\"></line><line x1=\"22\" x2=\"17\" y1=\"8\" y2=\"13\"></line></svg>"
    },
    {
      "type": "page",
      "name": "Ban Appeals",
      "url": "/docs/modules/appeals",
      "description": "Web-based unban application portal for banned users.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-file-text size-4\"><path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"></path><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"></path><path d=\"M10 9H8\"></path><path d=\"M16 13H8\"></path><path d=\"M16 17H8\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Audit & Mod Logs",
      "url": "/docs/modules/modlog",
      "description": "Moderation case tracking and comprehensive audit logs.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-scroll size-4\"><path d=\"M19 17V5a2 2 0 0 0-2-2H4\"></path><path d=\"M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3\"></path></svg>"
    },
    {
      "$id": "root:sep_comm",
      "type": "separator",
      "name": "Community & Support"
    },
    {
      "type": "page",
      "name": "Welcome & Goodbye",
      "url": "/docs/modules/welcome",
      "description": "Custom greeting cards with embeds and variables.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-sparkles size-4\"><path d=\"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Leveling & XP",
      "url": "/docs/modules/level",
      "description": "Text and voice activity leveling with tiered role rewards.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-award size-4\"><circle cx=\"12\" cy=\"8\" r=\"6\"></circle><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Tickets & Support",
      "url": "/docs/modules/tickets",
      "description": "Multi-category support panels with HTML transcript logging.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-message-square size-4\"><path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Giveaways",
      "url": "/docs/modules/giveaways",
      "description": "Interactive prize drawings with button entries and rerolls.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-gift size-4\"><rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"></rect><path d=\"M12 8v13\"></path><path d=\"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7\"></path><path d=\"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Polls & Surveys",
      "url": "/docs/modules/polls",
      "description": "Interactive voting with live percentage visualizers.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-bar-chart-3 size-4\"><path d=\"M3 3v18h18\"></path><path d=\"M18 17V9\"></path><path d=\"M13 17V5\"></path><path d=\"M8 17v-3\"></path></svg>"
    },
    {
      "type": "page",
      "name": "TempVoice Channels",
      "url": "/docs/modules/tempvoice",
      "description": "Dynamic 'Join to Create' temporary voice channels.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-mic size-4\"><path d=\"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z\"></path><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"></path><line x1=\"12\" x2=\"12\" y1=\"19\" y2=\"22\"></line></svg>"
    },
    {
      "$id": "root:sep_server",
      "type": "separator",
      "name": "Server Management"
    },
    {
      "type": "page",
      "name": "Roles & Reaction Roles",
      "url": "/docs/modules/roles",
      "description": "Auto-join roles, button selection, and role hierarchies.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-shield size-4\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Server Stats",
      "url": "/docs/modules/serverstats",
      "description": "Live real-time voice channel counters for members, bots, and boosts.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-activity size-4\"><path d=\"M22 12h-4l-3 9L9 3l-3 9H2\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Invite Tracker",
      "url": "/docs/modules/invites",
      "description": "Track invite codes, fake accounts, leaves, and leaderboards.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-user-plus size-4\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><line x1=\"19\" x2=\"19\" y1=\"8\" y2=\"14\"></line><line x1=\"22\" x2=\"16\" y1=\"11\" y2=\"11\"></line></svg>"
    },
    {
      "type": "page",
      "name": "Auto-Responder",
      "url": "/docs/modules/autoresponder",
      "description": "Automated trigger keywords, custom replies, and sticky notes.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-bot size-4\"><path d=\"M12 8V4H8\"></path><rect width=\"16\" height=\"12\" x=\"4\" y=\"8\" rx=\"2\"></rect><path d=\"M2 14h2\"></path><path d=\"M20 14h2\"></path><path d=\"M15 13v2\"></path><path d=\"M9 13v2\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Server Backups",
      "url": "/docs/modules/backups",
      "description": "Complete snapshot creation and restoration of roles and channels.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-archive size-4\"><rect width=\"20\" height=\"5\" x=\"2\" y=\"3\" rx=\"1\"></rect><path d=\"M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8\"></path><path d=\"M10 12h4\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Dashboard Settings",
      "url": "/docs/modules/settings",
      "description": "Command prefix, default language, embed styles, and admin roles.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-sliders size-4\"><line x1=\"4\" x2=\"4\" y1=\"21\" y2=\"14\"></line><line x1=\"4\" x2=\"4\" y1=\"10\" y2=\"3\"></line><line x1=\"12\" x2=\"12\" y1=\"21\" y2=\"12\"></line><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"3\"></line><line x1=\"20\" x2=\"20\" y1=\"21\" y2=\"16\"></line><line x1=\"20\" x2=\"20\" y1=\"12\" y2=\"3\"></line><line x1=\"1\" x2=\"7\" y1=\"14\" y2=\"14\"></line><line x1=\"9\" x2=\"15\" y1=\"8\" y2=\"8\"></line><line x1=\"17\" x2=\"23\" y1=\"16\" y2=\"16\"></line></svg>"
    },
    {
      "$id": "root:sep_commands",
      "type": "separator",
      "name": "Command Reference"
    },
    {
      "type": "page",
      "name": "Moderation Commands",
      "url": "/docs/commands/moderation",
      "description": "Bans, kicks, timeouts, warnings, and message purging.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-hammer size-4\"><path d=\"m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9\"></path><path d=\"m17.64 4.36 2-2a2 2 0 0 1 2.83 2.83l-2 2\"></path><path d=\"m14 7 3 3\"></path><path d=\"m19 12-2 2\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Management Commands",
      "url": "/docs/commands/management",
      "description": "Server setup, role managers, custom embeds, and backups.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-settings-2 size-4\"><path d=\"M20 7h-9\"></path><path d=\"M14 17H5\"></path><circle cx=\"17\" cy=\"17\" r=\"3\"></circle><circle cx=\"7\" cy=\"7\" r=\"3\"></circle></svg>"
    },
    {
      "type": "page",
      "name": "Community Commands",
      "url": "/docs/commands/community",
      "description": "Rank cards, leaderboards, poll triggers, and giveaway commands.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-users size-4\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Info & Utility Commands",
      "url": "/docs/commands/info",
      "description": "Help, botinfo, userinfo, avatar inspection, and server stats.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-info size-4\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path></svg>"
    },
    {
      "type": "page",
      "name": "Admin & Security Commands",
      "url": "/docs/commands/admin",
      "description": "Anti-raid toggle, whitelisting, audit logs, and emergency locks.",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-lock size-4\"><rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path></svg>"
    }
  ]
};
const ORBIT_GUIDES_TREE = {
  "$id": "root:guides",
  "name": "Orbit Guides",
  "children": [
    {
      "$id": "guides:index.mdx",
      "type": "page",
      "name": "Overview: Guides",
      "description": "All step-by-step guides and tutorials for Orbit.",
      "url": "/docs/guides"
    },
    {
      "$id": "guides:sep_tutorials",
      "type": "separator",
      "name": "Step-by-Step Tutorials"
    },
    {
      "type": "page",
      "name": "Server Setup from 0 to 100",
      "url": "/docs/guides/server-setup",
      "description": "Complete guide to setting up and optimizing your Discord server with Orbit."
    },
    {
      "type": "page",
      "name": "Anti-Raid & Server Hardening",
      "url": "/docs/guides/antiraid-security",
      "description": "Mass-join protection, account age gates, and emergency lockdown controls."
    },
    {
      "type": "page",
      "name": "Support & Ticket System",
      "url": "/docs/guides/tickets-support",
      "description": "Interactive ticket panels, staff roles, and automatic HTML transcripts."
    },
    {
      "type": "page",
      "name": "Leveling & Role Rewards",
      "url": "/docs/guides/leveling-rewards",
      "description": "Configure text and voice XP with tiered milestone roles."
    },
    {
      "type": "page",
      "name": "Temporary Voice Channels (TempVoice)",
      "url": "/docs/guides/tempvoice-channels",
      "description": "Dynamic voice hubs with custom member controls and permissions."
    },
    {
      "type": "page",
      "name": "Configuring Auto-Moderation",
      "url": "/docs/guides/automod-moderation",
      "description": "Prevent raid spam, malicious links, phishing domains, and toxicity."
    }
  ]
};
const ORBIT_RELEASES_TREE = {
  "$id": "root:releases",
  "name": "Release Notes",
  "children": [
    {
      "$id": "releases:index.mdx",
      "type": "page",
      "name": "Overview: Releases",
      "description": "Chronological log of all major Orbit updates and feature releases.",
      "url": "/docs/releases"
    },
    {
      "$id": "releases:sep_versions",
      "type": "separator",
      "name": "Version History"
    },
    {
      "type": "page",
      "name": "Orbit v2.4 (Current)",
      "url": "/docs/releases/v2-4",
      "description": "Zero-latency web dashboard, new AutoMod engine, and HTML transcripts."
    },
    {
      "type": "page",
      "name": "Orbit v2.3",
      "url": "/docs/releases/v2-3",
      "description": "TempVoice channels and interactive giveaways with role requirements."
    },
    {
      "type": "page",
      "name": "Orbit v2.2",
      "url": "/docs/releases/v2-2",
      "description": "Multi-category ticket system and real-time percentage poll charts."
    },
    {
      "type": "page",
      "name": "Orbit v2.1",
      "url": "/docs/releases/v2-1",
      "description": "Anti-Raid shield, account age gate, and emergency lockdown commands."
    },
    {
      "type": "page",
      "name": "Orbit v2.0",
      "url": "/docs/releases/v2-0",
      "description": "Complete ground-up rewrite: Web dashboard, MongoDB Atlas backend, and modular systems."
    }
  ]
};
const ORBIT_SEARCH_INDEX = [
  {
    "id": "/docs",
    "type": "page",
    "content": "Introduction",
    "description": "Welcome to the official documentation for the Orbit Discord Bot.",
    "url": "/docs",
    "breadcrumbs": [
      "Docs"
    ]
  },
  {
    "id": "/docs/quickstart",
    "type": "page",
    "content": "Quickstart",
    "description": "Invite Orbit and set up your server in under 3 minutes.",
    "url": "/docs/quickstart",
    "breadcrumbs": [
      "Docs"
    ]
  },
  {
    "id": "/docs/modules/automod",
    "type": "page",
    "content": "Auto-Moderation",
    "description": "Banned words, anti-spam, links & mass-mentions.",
    "url": "/docs/modules/automod",
    "breadcrumbs": [
      "Docs",
      "Moderation & Security"
    ]
  },
  {
    "id": "/docs/modules/verification",
    "type": "page",
    "content": "Verification",
    "description": "Button, Captcha, and password protection for new members.",
    "url": "/docs/modules/verification",
    "breadcrumbs": [
      "Docs",
      "Moderation & Security"
    ]
  },
  {
    "id": "/docs/modules/security",
    "type": "page",
    "content": "Security & Anti-Raid",
    "description": "Mass-join defense, account age gates, and emergency lockdown.",
    "url": "/docs/modules/security",
    "breadcrumbs": [
      "Docs",
      "Moderation & Security"
    ]
  },
  {
    "id": "/docs/modules/inactivekick",
    "type": "page",
    "content": "Inactive Kick",
    "description": "Automatically prune inactive members from your server.",
    "url": "/docs/modules/inactivekick",
    "breadcrumbs": [
      "Docs",
      "Moderation & Security"
    ]
  },
  {
    "id": "/docs/modules/appeals",
    "type": "page",
    "content": "Ban Appeals",
    "description": "Web-based unban application portal for banned users.",
    "url": "/docs/modules/appeals",
    "breadcrumbs": [
      "Docs",
      "Moderation & Security"
    ]
  },
  {
    "id": "/docs/modules/modlog",
    "type": "page",
    "content": "Audit & Mod Logs",
    "description": "Moderation case tracking and comprehensive audit logs.",
    "url": "/docs/modules/modlog",
    "breadcrumbs": [
      "Docs",
      "Moderation & Security"
    ]
  },
  {
    "id": "/docs/modules/welcome",
    "type": "page",
    "content": "Welcome & Goodbye",
    "description": "Custom greeting cards with embeds and variables.",
    "url": "/docs/modules/welcome",
    "breadcrumbs": [
      "Docs",
      "Community & Support"
    ]
  },
  {
    "id": "/docs/modules/level",
    "type": "page",
    "content": "Leveling & XP",
    "description": "Text and voice activity leveling with tiered role rewards.",
    "url": "/docs/modules/level",
    "breadcrumbs": [
      "Docs",
      "Community & Support"
    ]
  },
  {
    "id": "/docs/modules/tickets",
    "type": "page",
    "content": "Tickets & Support",
    "description": "Multi-category support panels with HTML transcript logging.",
    "url": "/docs/modules/tickets",
    "breadcrumbs": [
      "Docs",
      "Community & Support"
    ]
  },
  {
    "id": "/docs/modules/giveaways",
    "type": "page",
    "content": "Giveaways",
    "description": "Interactive prize drawings with button entries and rerolls.",
    "url": "/docs/modules/giveaways",
    "breadcrumbs": [
      "Docs",
      "Community & Support"
    ]
  },
  {
    "id": "/docs/modules/polls",
    "type": "page",
    "content": "Polls & Surveys",
    "description": "Interactive voting with live percentage visualizers.",
    "url": "/docs/modules/polls",
    "breadcrumbs": [
      "Docs",
      "Community & Support"
    ]
  },
  {
    "id": "/docs/modules/tempvoice",
    "type": "page",
    "content": "TempVoice Channels",
    "description": "Dynamic 'Join to Create' temporary voice channels.",
    "url": "/docs/modules/tempvoice",
    "breadcrumbs": [
      "Docs",
      "Community & Support"
    ]
  },
  {
    "id": "/docs/modules/roles",
    "type": "page",
    "content": "Roles & Reaction Roles",
    "description": "Auto-join roles, button selection, and role hierarchies.",
    "url": "/docs/modules/roles",
    "breadcrumbs": [
      "Docs",
      "Server Management"
    ]
  },
  {
    "id": "/docs/modules/serverstats",
    "type": "page",
    "content": "Server Stats",
    "description": "Live real-time voice channel counters for members, bots, and boosts.",
    "url": "/docs/modules/serverstats",
    "breadcrumbs": [
      "Docs",
      "Server Management"
    ]
  },
  {
    "id": "/docs/modules/invites",
    "type": "page",
    "content": "Invite Tracker",
    "description": "Track invite codes, fake accounts, leaves, and leaderboards.",
    "url": "/docs/modules/invites",
    "breadcrumbs": [
      "Docs",
      "Server Management"
    ]
  },
  {
    "id": "/docs/modules/autoresponder",
    "type": "page",
    "content": "Auto-Responder",
    "description": "Automated trigger keywords, custom replies, and sticky notes.",
    "url": "/docs/modules/autoresponder",
    "breadcrumbs": [
      "Docs",
      "Server Management"
    ]
  },
  {
    "id": "/docs/modules/backups",
    "type": "page",
    "content": "Server Backups",
    "description": "Complete snapshot creation and restoration of roles and channels.",
    "url": "/docs/modules/backups",
    "breadcrumbs": [
      "Docs",
      "Server Management"
    ]
  },
  {
    "id": "/docs/modules/settings",
    "type": "page",
    "content": "Dashboard Settings",
    "description": "Command prefix, default language, embed styles, and admin roles.",
    "url": "/docs/modules/settings",
    "breadcrumbs": [
      "Docs",
      "Server Management"
    ]
  },
  {
    "id": "/docs/commands/moderation",
    "type": "page",
    "content": "Moderation Commands",
    "description": "/ban, /kick, /timeout, /warn, /clearwarns, /purge, /lock.",
    "url": "/docs/commands/moderation",
    "breadcrumbs": [
      "Docs",
      "Command Reference"
    ]
  },
  {
    "id": "/docs/commands/management",
    "type": "page",
    "content": "Management Commands",
    "description": "/embed, /roles, /backup, /slowmode, /poll, /giveaway.",
    "url": "/docs/commands/management",
    "breadcrumbs": [
      "Docs",
      "Command Reference"
    ]
  },
  {
    "id": "/docs/commands/community",
    "type": "page",
    "content": "Community Commands",
    "description": "/rank, /leaderboard, /ticket, /vote, /profile.",
    "url": "/docs/commands/community",
    "breadcrumbs": [
      "Docs",
      "Command Reference"
    ]
  },
  {
    "id": "/docs/commands/info",
    "type": "page",
    "content": "Info & Utility Commands",
    "description": "/help, /botinfo, /userinfo, /serverinfo, /avatar, /ping.",
    "url": "/docs/commands/info",
    "breadcrumbs": [
      "Docs",
      "Command Reference"
    ]
  },
  {
    "id": "/docs/commands/admin",
    "type": "page",
    "content": "Admin & Security Commands",
    "description": "/security, /whitelist, /lockdown, /setup, /sync.",
    "url": "/docs/commands/admin",
    "breadcrumbs": [
      "Docs",
      "Command Reference"
    ]
  },
  {
    "id": "/docs/guides",
    "type": "page",
    "content": "Overview: Guides",
    "description": "All tutorials and step-by-step guides for Orbit.",
    "url": "/docs/guides",
    "breadcrumbs": [
      "Guides"
    ]
  },
  {
    "id": "/docs/guides/server-setup",
    "type": "page",
    "content": "Server Setup from 0 to 100",
    "description": "Complete guide to setting up and optimizing your Discord server with Orbit.",
    "url": "/docs/guides/server-setup",
    "breadcrumbs": [
      "Guides"
    ]
  },
  {
    "id": "/docs/guides/antiraid-security",
    "type": "page",
    "content": "Anti-Raid & Server Hardening",
    "description": "Mass-join defense, account age gates, and emergency lockdown controls.",
    "url": "/docs/guides/antiraid-security",
    "breadcrumbs": [
      "Guides"
    ]
  },
  {
    "id": "/docs/guides/tickets-support",
    "type": "page",
    "content": "Support & Ticket System",
    "description": "Interactive ticket panels, staff roles, and automatic HTML transcripts.",
    "url": "/docs/guides/tickets-support",
    "breadcrumbs": [
      "Guides"
    ]
  },
  {
    "id": "/docs/guides/leveling-rewards",
    "type": "page",
    "content": "Leveling & Role Rewards",
    "description": "Configure text and voice XP with tiered milestone roles.",
    "url": "/docs/guides/leveling-rewards",
    "breadcrumbs": [
      "Guides"
    ]
  },
  {
    "id": "/docs/guides/tempvoice-channels",
    "type": "page",
    "content": "Temporary Voice Channels (TempVoice)",
    "description": "Dynamic voice hubs with custom member controls and permissions.",
    "url": "/docs/guides/tempvoice-channels",
    "breadcrumbs": [
      "Guides"
    ]
  },
  {
    "id": "/docs/guides/automod-moderation",
    "type": "page",
    "content": "Configuring Auto-Moderation",
    "description": "Prevent raid spam, malicious links, phishing domains, and toxicity.",
    "url": "/docs/guides/automod-moderation",
    "breadcrumbs": [
      "Guides"
    ]
  },
  {
    "id": "/docs/releases",
    "type": "page",
    "content": "Overview: Releases",
    "description": "Chronological log of all major Orbit updates and feature releases.",
    "url": "/docs/releases",
    "breadcrumbs": [
      "Release Notes"
    ]
  },
  {
    "id": "/docs/releases/v2-4",
    "type": "page",
    "content": "Orbit v2.4 (Current)",
    "description": "Zero-latency web dashboard, new AutoMod engine, and HTML transcripts.",
    "url": "/docs/releases/v2-4",
    "breadcrumbs": [
      "Release Notes",
      "v2.4"
    ]
  },
  {
    "id": "/docs/releases/v2-3",
    "type": "page",
    "content": "Orbit v2.3",
    "description": "TempVoice channels and interactive giveaways with role requirements.",
    "url": "/docs/releases/v2-3",
    "breadcrumbs": [
      "Release Notes",
      "v2.3"
    ]
  },
  {
    "id": "/docs/releases/v2-2",
    "type": "page",
    "content": "Orbit v2.2",
    "description": "Multi-category ticket system and real-time percentage poll charts.",
    "url": "/docs/releases/v2-2",
    "breadcrumbs": [
      "Release Notes",
      "v2.2"
    ]
  },
  {
    "id": "/docs/releases/v2-1",
    "type": "page",
    "content": "Orbit v2.1",
    "description": "Anti-Raid shield, account age gate, and emergency lockdown commands.",
    "url": "/docs/releases/v2-1",
    "breadcrumbs": [
      "Release Notes",
      "v2.1"
    ]
  },
  {
    "id": "/docs/releases/v2-0",
    "type": "page",
    "content": "Orbit v2.0",
    "description": "Complete ground-up rewrite: Web dashboard, MongoDB Atlas backend, and modular systems.",
    "url": "/docs/releases/v2-0",
    "breadcrumbs": [
      "Release Notes",
      "v2.0"
    ]
  }
];

// Expose on global window object for synchronous hydration
window.__ORBIT_PAGES__ = ORBIT_PAGES;
window.__ORBIT_PAGE_TREE__ = ORBIT_PAGE_TREE;
window.__ORBIT_GUIDES_TREE__ = ORBIT_GUIDES_TREE;
window.__ORBIT_RELEASES_TREE__ = ORBIT_RELEASES_TREE;
window.__ORBIT_SEARCH_INDEX__ = ORBIT_SEARCH_INDEX;
window.__ORBIT_TREES__ = {
  docs: ORBIT_PAGE_TREE,
  guides: ORBIT_GUIDES_TREE,
  releases: ORBIT_RELEASES_TREE
};

export { ORBIT_PAGES, ORBIT_PAGE_TREE, ORBIT_GUIDES_TREE, ORBIT_RELEASES_TREE, ORBIT_SEARCH_INDEX };
