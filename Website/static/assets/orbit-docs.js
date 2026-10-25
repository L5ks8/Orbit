/**
 * Orbit Documentation, Guides & Release Notes Suite
 * 100% Native React & Fumadocs Integration
 */
import { j, a1 as components } from "./main-DJXeaSrE.js";

const e = j;
const { h1, h2, h3, h4, p, ul, li, code: inlineCode, pre, table, Callout, Card, Cards } = components;

function TitleBadge({ text, color = "primary" }) {
  const colors = {
    primary: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
  };
  return e.jsx("span", {
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color] || colors.primary} mb-3`,
    children: text
  });
}

function CommandCard({ name, syntax, desc, perms = "Keine", example, options }) {
  return e.jsxs("div", {
    className: "p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 my-3 transition-all hover:border-neutral-700",
    children: [
      e.jsxs("div", {
        className: "flex flex-wrap items-center justify-between gap-2 mb-2",
        children: [
          e.jsx("code", { className: "text-blue-400 font-bold text-sm bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20", children: syntax || name }),
          e.jsxs("span", { className: "text-[11px] text-neutral-400 px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700", children: ["Rechte: ", perms] })
        ]
      }),
      e.jsx("p", { className: "text-sm text-neutral-300 mb-2 leading-relaxed", children: desc }),
      options && e.jsxs("div", {
        className: "text-xs text-neutral-400 mb-2",
        children: [
          e.jsx("span", { className: "font-semibold text-neutral-300", children: "Optionen: " }),
          options
        ]
      }),
      example && e.jsxs("div", {
        className: "text-xs text-neutral-400 font-mono bg-black/50 px-3 py-1.5 rounded-lg border border-neutral-800/80",
        children: [e.jsx("span", { className: "text-neutral-500 select-none", children: "Beispiel: " }), example]
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
              e.jsx("th", { className: "p-3 font-semibold", children: "Einstellung / Option" }),
              e.jsx("th", { className: "p-3 font-semibold", children: "Funktion & Erklärung" }),
              e.jsx("th", { className: "p-3 font-semibold", children: "Standard / Empfohlen" })
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


function PageIntro() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Offizielle Dokumentation", color: "primary" }),
      e.jsx("p", {
        className: "text-lg text-neutral-300 leading-relaxed mb-6",
        children: "Willkommen in der offiziellen Dokumentation von Orbit – dem modernen All-in-One Discord Bot mit ultraschnellem 0ms Web-Dashboard, lückenlosem Schutz vor Raids & Spam, Verifizierung, Ticketsystem, Leveling und vollständiger Server-Automatisierung."
      }),
      e.jsx(h2, { id: "warum-orbit", children: "Warum Orbit?" }),
      e.jsx("p", {
        className: "text-neutral-300 mb-4",
        children: "Orbit vereint über 40 Bot-Systeme in einer einzigen Anwendung. Du musst nicht mehr 5 verschiedene Bots auf deinem Server einrichten – Orbit übernimmt alles aus einer Hand."
      }),
      e.jsxs(Cards, {
        children: [
          e.jsx(Card, { title: "0ms Web Dashboard", href: "/docs/quickstart", children: "Verwalte alle Einstellungen, Toggles und Logs in Echtzeit ohne Ladezeiten." }),
          e.jsx(Card, { title: "Auto-Moderation", href: "/docs/modules/automod", children: "24/7 Schutz vor Bad Words, Spam, Raids, Links und Mass-Mentions." }),
          e.jsx(Card, { title: "Verifizierung & Anti-Raid", href: "/docs/modules/verification", children: "1-Klick, Captcha- und Passwort-Gates gegen Raidbots." }),
          e.jsx(Card, { title: "Support & Tickets", href: "/docs/modules/tickets", children: "Professionelle Support-Panels mit automatischen HTML-Transkripten." }),
          e.jsx(Card, { title: "Leveling & Voice-XP", href: "/docs/modules/level", children: "Aktivitätsbelohnungen im Chat und Sprachkanal mit Rollen-Rewards." }),
          e.jsx(Card, { title: "40+ Slash Commands", href: "/docs/commands/moderation", children: "Vollständige Befehlsreferenz für dein Moderations- und Server-Team." })
        ]
      }),
      e.jsx(h2, { id: "schnellzugriff", children: "Globale Suche" }),
      e.jsx(Callout, {
        title: "Tipp für Server-Admins",
        type: "info",
        children: "Drücke jederzeit Ctrl + K (oder Cmd + K auf Mac), um die globale Suche zu öffnen und sofort zu jedem Befehl oder jeder Einstellung zu springen!"
      })
    ]
  });
}


function PageQuickstart() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Erste Schritte", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "In dieser Anleitung richten wir Orbit in weniger als 3 Minuten auf deinem Discord Server ein."
      }),
      e.jsx(h2, { id: "schritt-fuer-schritt", children: "Schritt-für-Schritt Einrichtung" }),
      e.jsx(StepBox, {
        num: "1",
        title: "Orbit auf deinen Server einladen",
        children: [
          e.jsx("p", { children: "Klicke auf den Einladungslink und wähle deinen Discord Server aus. Wir empfehlen, dem Bot Administrator-Rechte zu gewähren, damit er Rollen, Kanäle und Schutzfunktionen uneingeschränkt ausführen kann." }),
          e.jsx("div", { className: "mt-2", children: e.jsx("a", { href: "https://discord.gg/orbit", target: "_blank", className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors", children: "Orbit jetzt einladen" }) })
        ]
      }),
      e.jsx(StepBox, {
        num: "2",
        title: "Rollenhierarchie in Discord anpassen (WICHTIG)",
        children: [
          e.jsx("p", { children: "Öffne deine Discord Server-Einstellungen -> Rollen. Ziehe die Orbit-Rolle ganz nach oben in der Liste (über alle Rollen, die der Bot moderieren, vergeben oder stummschalten soll). Discord verbietet es Bots, Rollen zu verwalten, die hierarchisch über ihnen stehen." })
        ]
      }),
      e.jsx(StepBox, {
        num: "3",
        title: "Im Web Dashboard anmelden",
        children: [
          e.jsx("p", { children: "Öffne das Orbit Web Dashboard unter /dashboard und melde dich mit deinem Discord-Account an. Wähle deinen Server aus der Server-Liste aus." })
        ]
      }),
      e.jsx(StepBox, {
        num: "4",
        title: "Module aktivieren & konfigurieren",
        children: [
          e.jsx("p", { children: "Wähle in der linken Seitenleiste das gewünschte Modul aus (z.B. Auto-Moderation, Willkommen oder Verifizierung). Schalte den Schalter auf 'Aktiviert' und passe deine Einstellungen an." })
        ]
      })
    ]
  });
}


function PageAutoMod() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Schutz-System", color: "amber" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Die Auto-Moderation von Orbit überwacht alle Textkanäle in Echtzeit und reagiert in Millisekunden auf unerwünschte Wörter, Spam, Einladungslinks und Massen-Pings."
      }),
      e.jsx(h2, { id: "einstellungen-tabelle", children: "Verfügbare Einstellungen & Toggles" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Content Filter (Bad Words)", "Filtert Beleidigungen und verbotene Begriffe aus der Blacklist.", "Aktiviert"],
          ["Filter Level", "Relaxed (prüft exakte Wörter) oder Strict (erkennt auch Zeichen wie f.u.c.k oder Leetspeak).", "Strict"],
          ["Aktion bei Verstoß", "Welche Bestrafung folgt: Nachricht löschen, Nutzer verwarnen, Timeout (Stummschalten) oder Kick.", "Löschen + Warn"],
          ["Anti-Spam", "Verhindert das Fluten von Kanälen (z.B. max. 5 Nachrichten in 3 Sekunden).", "Aktiviert (5 Msgs / 3s)"],
          ["Anti-Caps", "Blockiert Nachrichten mit übermäßig vielen Großbuchstaben (z.B. ab 70% Caps).", "Aktiviert (70%)"],
          ["Link- & Invite-Schutz", "Löscht fremde discord.gg-Links und unbekannte Domains automatisch.", "Aktiviert"],
          ["Mass-Mention Schutz", "Verhindert das Erwähnen von mehr als 3 Nutzern oder Rollen in einer Nachricht.", "Aktiviert (Max 3)"],
          ["Ignorierte Rollen", "Rollen, die von der Auto-Moderation niemals bestraft werden (z.B. Moderatoren).", "Team / Admin"],
          ["Ignorierte Kanäle", "Kanäle, in denen AutoMod inaktiv ist (z.B. #bot-commands, #admin-chat).", "#bot-spam"]
        ]
      }),
      e.jsx(h2, { id: "schritt-fuer-schritt-einrichtung", children: "Schritt-für-Schritt Einrichtung" }),
      e.jsx(StepBox, {
        num: "1",
        title: "Bad Words Liste befüllen",
        children: "Klicke im AutoMod-Tab auf 'Wortliste bearbeiten'. Trage Wörter ein, die auf deinem Server verboten sein sollen (getrennt durch Kommas oder Zeilenumbrüche). Trage auf der Whitelist Wörter ein, die ähnlich klingen, aber erlaubt sind."
      }),
      e.jsx(StepBox, {
        num: "2",
        title: "Bestrafung konfigurieren",
        children: "Wähle unter 'Aktion' aus, was bei einem Verstoß passieren soll. Für normale Server empfehlen wir 'Nachricht löschen & Verwarnung aussprechen'."
      }),
      e.jsx(StepBox, {
        num: "3",
        title: "Kanäle & Rollen ausnehmen",
        children: "Füge im Dropdown 'Ignorierte Kanäle' Kanäle wie #bot-spam oder #admin-chat hinzu, damit Orbit dort nicht interveniert."
      }),
      e.jsx(h2, { id: "zugehoerige-commands", children: "Zugehörige Befehle" }),
      e.jsx(CommandCard, { name: "warn", syntax: "/warn <user> <grund>", desc: "Verwarnt ein Mitglied manuell für einen Regelverstoß.", perms: "Nachrichten verwalten", example: "/warn @Spammer Unangemessene Ausdrucksweise" }),
      e.jsx(CommandCard, { name: "warnings", syntax: "/warnings <user>", desc: "Zeigt alle Verwarnungen und den Verlauf eines Mitglieds an.", perms: "Nachrichten verwalten", example: "/warnings @User" }),
      e.jsx(CommandCard, { name: "clearwarns", syntax: "/clearwarns <user>", desc: "Löscht alle Verwarnungen eines Mitglieds vollständig.", perms: "Mitglieder kicken", example: "/clearwarns @User" }),
      e.jsx(CommandCard, { name: "purge", syntax: "/purge <anzahl>", desc: "Löscht bis zu 100 Nachrichten gleichzeitig aus dem Kanal.", perms: "Nachrichten verwalten", example: "/purge 50" })
    ]
  });
}


function PageWelcome() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Community Modul", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Begrüße neue Mitglieder mit personalisierten Embed-Nachrichten, Profilbildern und Direktnachrichten (DM), und behalte Server-Verlasser im Blick."
      }),
      e.jsx(h2, { id: "variablen", children: "Verfügbare Platzhalter & Variablen" }),
      e.jsx("div", {
        className: "grid grid-cols-1 sm:grid-cols-2 gap-3 my-4",
        children: [
          e.jsxs("div", { className: "p-3 rounded-lg border border-neutral-800 bg-neutral-900", children: [e.jsx("code", { className: "text-blue-400 font-bold", children: "{user}" }), e.jsx("p", { className: "text-xs text-neutral-400 mt-1", children: "Erwähnt das neue Mitglied (@Username)" })] }),
          e.jsxs("div", { className: "p-3 rounded-lg border border-neutral-800 bg-neutral-900", children: [e.jsx("code", { className: "text-blue-400 font-bold", children: "{username}" }), e.jsx("p", { className: "text-xs text-neutral-400 mt-1", children: "Reiner Benutzername ohne @" })] }),
          e.jsxs("div", { className: "p-3 rounded-lg border border-neutral-800 bg-neutral-900", children: [e.jsx("code", { className: "text-blue-400 font-bold", children: "{server}" }), e.jsx("p", { className: "text-xs text-neutral-400 mt-1", children: "Der Name deines Discord Servers" })] }),
          e.jsxs("div", { className: "p-3 rounded-lg border border-neutral-800 bg-neutral-900", children: [e.jsx("code", { className: "text-blue-400 font-bold", children: "{membercount}" }), e.jsx("p", { className: "text-xs text-neutral-400 mt-1", children: "Aktuelle Mitgliederzahl des Servers" })] })
        ]
      }),
      e.jsx(h2, { id: "konfiguration", children: "Einstellungen im Dashboard" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Willkommensnachricht", "Schaltet Begrüßungen im Server-Kanal ein/aus.", "Aktiviert"],
          ["Willkommenskanal", "Der Textkanal, in dem die Begrüßung gepostet wird.", "#willkommen"],
          ["Embed nutzen", "Sendet die Nachricht in einem ansprechenden Embed mit Farbrand.", "Aktiviert"],
          ["Avatar anzeigen", "Zeigt das Profilbild des Nutzers als Thumbnail im Embed an.", "Aktiviert"],
          ["DM Willkommen", "Sendet dem neuen Mitglied eine private Nachricht in Discord.", "Optional (z.B. für Regelhinweis)"],
          ["Goodbye Nachrichten", "Postet eine Nachricht beim Verlassen des Servers.", "#leave-logs"]
        ]
      })
    ]
  });
}


function PageVerification() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Raid-Schutz", color: "purple" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Sichere deinen Server mit einem Verifizierungs-Gate ab, bevor neue Mitglieder Zugriff auf deine Chatkanäle erhalten."
      }),
      e.jsx(h2, { id: "methoden", children: "Verifizierungs-Arten" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Button Verifizierung", "User klickt auf einen Button 'Verifizieren'. Schnell und benutzerfreundlich.", "Empfohlen für normale Communitys"],
          ["Captcha Code", "User muss einen zufälligen 5-stelligen Code abtippen. Verhindert automatisierte Raid-Bots.", "Empfohlen bei häufigen Raids"],
          ["Passwort / Codewort", "User muss ein in den Server-Regeln verstecktes Passwort eingeben.", "Für geschlossene Gruppen"]
        ]
      }),
      e.jsx(h2, { id: "rollen-setup", children: "So richtest du die Rollen ein" }),
      e.jsx(StepBox, {
        num: "1",
        title: "Rolle 'Verifiziert' erstellen",
        children: "Erstelle in deinen Discord Server-Einstellungen eine Rolle namens 'Mitglied' oder 'Verifiziert'."
      }),
      e.jsx(StepBox, {
        num: "2",
        title: "Im Dashboard auswählen",
        children: "Wähle im Verification-Tab unter 'Verifizierte Rolle' deine erstellte Rolle aus und wähle den Kanal #verifizieren."
      }),
      e.jsx(StepBox, {
        num: "3",
        title: "Kanal-Rechte in Discord anpassen",
        children: "Setze für die Rolle @everyone die Berechtigung 'Kanäle ansehen' auf AUS. Gib der Rolle 'Verifiziert' die Berechtigung 'Kanäle ansehen' auf AN. Im Kanal #verifizieren darf @everyone den Kanal sehen und Nachrichten lesen."
      })
    ]
  });
}


function PageSecurity() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Anti-Raid System", color: "red" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Das Security-Modul schützt deinen Server vor Mass-Joins, Raid-Wellen, kompromittierten Konten und unbefugten Bot-Einladungen."
      }),
      e.jsx(h2, { id: "security-toggles", children: "Sicherheits-Funktionen & Schwellenwerte" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Anti-Raid Mode", "Erkennt plötzliche Beitrittswellen (z.B. mehr als 8 Joins in 10 Sekunden) und schaltet den Server automatisch in den Lockdown.", "Aktiviert (8 Joins / 10s)"],
          ["Account Age Gate", "Blockiert oder kickt Accounts, die jünger als X Tage sind (z.B. 3 Tage alt).", "Aktiviert (Min. 3 Tage)"],
          ["Anti-Bot Add", "Kickt unautorisierte Bots sofort, wenn sie von Nicht-Admins hinzugefügt werden.", "Aktiviert"],
          ["Lockdown Aktion", "Was bei einem Raid passiert: Verifizierung sperren, Nachrichten stoppen oder Einladungen pausieren.", "Lockdown + Benachrichtigung"],
          ["Sicherheits-Logkanal", "Kanal, in dem verdächtige Aktivitäten und Raid-Abwehrmaßnahmen geloggt werden.", "#security-logs"]
        ]
      }),
      e.jsx(h2, { id: "security-commands", children: "Zugehörige Befehle" }),
      e.jsx(CommandCard, { name: "security", syntax: "/security status", desc: "Zeigt den aktuellen Sicherheitsstatus und aktive Schutzmechanismen an.", perms: "Administrator", example: "/security status" }),
      e.jsx(CommandCard, { name: "antiraid", syntax: "/antiraid [on|off]", desc: "Aktiviert oder pausiert den Mass-Join Schutz manuell.", perms: "Administrator", example: "/antiraid on" }),
      e.jsx(CommandCard, { name: "lock", syntax: "/lock [kanal] [grund]", desc: "Sperrt einen oder alle Kanäle im Notfall.", perms: "Kanäle verwalten", example: "/lock #allgemein Notfall-Lockdown" })
    ]
  });
}


function PageRoles() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Rollenverwaltung", color: "cyan" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Automatisiere die Rollenvergabe beim Beitritt und erstelle interaktive Reaktionsrollen mit Buttons oder Dropdown-Menüs."
      }),
      e.jsx(h2, { id: "rollen-funktionen", children: "Funktionen & Einstellungen" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Auto-Role (Join)", "Vergibt neuen Mitgliedern sofort beim Betreten des Servers eine feste Rolle.", "Aktiviert (z.B. @Mitglied)"],
          ["Bot Auto-Role", "Vergibt neuen Bots automatisch eine separate Rolle (z.B. @Bots).", "Aktiviert (z.B. @Bots)"],
          ["Reaction Roles", "Ermöglicht Mitgliedern, sich Rollen (z.B. Benachrichtigungen, Games) selbst auszuwählen.", "Button-Style oder Select-Menu"],
          ["Exklusive Rollen", "Nutzer können nur eine Rolle aus einer Gruppe wählen (z.B. Alter oder Farbe).", "Optional konfigurierbar"]
        ]
      }),
      e.jsx(h2, { id: "rollen-commands", children: "Zugehörige Befehle" }),
      e.jsx(CommandCard, { name: "autorole", syntax: "/autorole set <rolle>", desc: "Legt die automatische Beitrittsrolle für neue Mitglieder fest.", perms: "Rollen verwalten", example: "/autorole set @Community" }),
      e.jsx(CommandCard, { name: "reactionrole", syntax: "/reactionrole add <msg_id> <emoji> <rolle>", desc: "Fügt eine Reaktionsrolle zu einer bestehenden Nachricht hinzu.", perms: "Rollen verwalten", example: "/reactionrole add 123456789 🎮 @Gamer" })
    ]
  });
}


function PageLevel() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Gamification", color: "amber" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Steigere die Aktivität deiner Community mit Erfahrungspunkten (XP), Ranglisten und automatischen Rollen-Belohnungen."
      }),
      e.jsx(h2, { id: "xp-system", children: "Wie XP gesammelt werden" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Text-XP", "15 bis 25 XP pro geschriebene Nachricht im Chat.", "60 Sekunden Cooldown"],
          ["Voice-XP", "5 bis 10 XP pro Minute im Sprachkanal (nur wenn nicht stummgeschaltet).", "Aktiviert"],
          ["Level-Up Kanal", "Wo das Level-Up verkündet wird: Aktueller Kanal, dedizierter Kanal oder DM.", "#level-ups"],
          ["XP Multiplikatoren", "Vergib z.B. 1.5x XP für Server-Booster oder Event-Wochenenden.", "Booster: 1.5x"],
          ["Ignorierte Kanäle", "Kanäle, in denen keine XP gesammelt werden können (z.B. Spam-Kanäle).", "#bot-commands"]
        ]
      }),
      e.jsx(h2, { id: "rollen-belohnungen", children: "Rollen-Belohnungen (Role Rewards)" }),
      e.jsx("p", {
        className: "text-neutral-300 mb-4",
        children: "Definiere im Dashboard, ab welchem Level Mitglieder automatisch eine neue Rolle erhalten (z.B. Level 5 -> Stammgast, Level 20 -> Veteran, Level 50 -> Legende)."
      }),
      e.jsx(h2, { id: "level-commands", children: "Zugehörige Commands" }),
      e.jsx(CommandCard, { name: "rank", syntax: "/rank [user]", desc: "Zeigt die aktuelle Level-Karte mit XP, Rang und Fortschrittsbalken an.", perms: "Keine", example: "/rank @Freund" }),
      e.jsx(CommandCard, { name: "levels", syntax: "/levels", desc: "Öffnet das interaktive Web-Leaderboard des Servers.", perms: "Keine", example: "/levels" }),
      e.jsx(CommandCard, { name: "xp add", syntax: "/xp add <user> <menge>", desc: "Gibt einem Mitglied zusätzliche Erfahrungspunkte.", perms: "Administrator", example: "/xp add @User 500" }),
      e.jsx(CommandCard, { name: "xp set", syntax: "/xp set <user> <level>", desc: "Setzt das Level eines Mitglieds manuell fest.", perms: "Administrator", example: "/xp set @User 10" })
    ]
  });
}


function PageTickets() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Support System", color: "primary" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Erstelle private Support-Kanäle per Knopfdruck mit Ticket-Kategorien, Team-Zuweisung und automatischen HTML-Transkripten."
      }),
      e.jsx(h2, { id: "ticket-funktionen", children: "Funktionen & Setup" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Ticket-Panel", "Sende ein schönes Embed mit 'Ticket öffnen' Button in deinen #support-Kanal.", "Aktiviert"],
          ["Ticket-Kategorien", "Erstelle Kategorien wie 'Allgemeiner Support', 'Bewerbung' oder 'Spenden'.", "Bis zu 5 Kategorien"],
          ["Team-Rolle", "Rolle, die Zugriff auf alle Tickets hat und gepingt wird.", "Support-Team"],
          ["HTML-Transkripte", "Speichert den gesamten Chatverlauf als Datei beim Schließen des Tickets.", "#ticket-logs"],
          ["Ticket Limit", "Maximale Anzahl offener Tickets pro Benutzer.", "1 Ticket"]
        ]
      }),
      e.jsx(h2, { id: "ticket-commands", children: "Ticket Commands" }),
      e.jsx(CommandCard, { name: "ticket panel", syntax: "/ticket panel", desc: "Erstellt das interaktive Ticket-Panel im aktuellen Kanal.", perms: "Administrator", example: "/ticket panel" }),
      e.jsx(CommandCard, { name: "ticket close", syntax: "/ticket close [grund]", desc: "Schließt das Ticket, speichert das Transkript und löscht den Kanal.", perms: "Support-Team", example: "/ticket close Anliegen gelöst" }),
      e.jsx(CommandCard, { name: "ticket add", syntax: "/ticket add <user>", desc: "Fügt einen weiteren Nutzer zum aktuellen Ticket hinzu.", perms: "Support-Team", example: "/ticket add @Helfer" }),
      e.jsx(CommandCard, { name: "ticket remove", syntax: "/ticket remove <user>", desc: "Entfernt einen Nutzer aus dem Ticket.", perms: "Support-Team", example: "/ticket remove @User" })
    ]
  });
}


function PageGiveaways() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Gewinnspiele", color: "purple" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Veranstalte automatisierte Gewinnspiele mit Countdown, Rollen-Voraussetzungen, Rerolls und Button-Teilnahme."
      }),
      e.jsx(h2, { id: "giveaway-features", children: "Optionen & Voraussetzungen" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Teilnahme per Button", "Nutzer treten dem Gewinnspiel mit einem einfachen Button-Klick bei.", "Aktiviert"],
          ["Rollen-Voraussetzung", "Nur Mitglieder mit einer bestimmten Rolle dürfen teilnehmen (z.B. @Booster).", "Optional"],
          ["Gewinner-Anzahl", "Wähle flexibel zwischen 1 und 20 Gewinnern.", "1 Gewinner"],
          ["Automatischer Reroll", "Falls ein Gewinner ungültig ist, kann sofort ein neuer Gewinner gezogen werden.", "Unterstützt"]
        ]
      }),
      e.jsx(h2, { id: "giveaway-commands", children: "Zugehörige Commands" }),
      e.jsx(CommandCard, { name: "giveaway start", syntax: "/giveaway start <zeit> <gewinner> <preis>", desc: "Startet ein neues Giveaway im aktuellen Kanal.", perms: "Nachrichten verwalten", example: "/giveaway start 24h 1 Discord Nitro" }),
      e.jsx(CommandCard, { name: "giveaway end", syntax: "/giveaway end <msg_id>", desc: "Beendet ein laufendes Giveaway vorzeitig und kürt Gewinner.", perms: "Nachrichten verwalten", example: "/giveaway end 1234567890" }),
      e.jsx(CommandCard, { name: "giveaway reroll", syntax: "/giveaway reroll <msg_id>", desc: "Zieht einen neuen Gewinner für ein beendetes Giveaway.", perms: "Nachrichten verwalten", example: "/giveaway reroll 1234567890" })
    ]
  });
}


function PagePolls() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Community Feedback", color: "cyan" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Erstelle visuell ansprechende Umfragen mit Einzel- oder Mehrfachauswahl, Live-Ergebnisanzeige und Endzeiten."
      }),
      e.jsx(h2, { id: "umfragen-funktionen", children: "Optionen & Dashboard-Setup" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Auswahl-Typ", "Single-Choice (1 Stimme) oder Multiple-Choice (mehrere Stimmen erlaubt).", "Single-Choice"],
          ["Anonyme Abstimmung", "Hält verborgen, wer für welche Option gestimmt hat.", "Optional"],
          ["Endzeit / Timer", "Schließt die Umfrage automatisch nach einer vorgegebenen Dauer (z.B. 12h, 2d).", "24 Stunden"],
          ["Live-Ergebnisbalken", "Zeigt Fortschrittsbalken und Prozentwerte in Echtzeit an.", "Aktiviert"]
        ]
      }),
      e.jsx(h2, { id: "poll-commands", children: "Zugehörige Commands" }),
      e.jsx(CommandCard, { name: "poll", syntax: "/poll <frage> <option1> <option2> [dauer]", desc: "Erstellt eine neue interaktive Umfrage im Chat.", perms: "Nachrichten verwalten", example: "/poll 'Welches Event wollt ihr?' 'Turnier' 'Filmabend' 24h" })
    ]
  });
}


function PageTempVoice() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Voice System", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Dynamische temporäre Sprachkanäle (Join to Create). Sobald ein Mitglied den Hub betritt, wird ein persönlicher Talk erstellt und beim Verlassen automatisch gelöscht."
      }),
      e.jsx(h2, { id: "tempvoice-einstellungen", children: "Einstellungen & Steuerung" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Hub Kanal", "Der primäre Sprachkanal, den Nutzer betreten müssen, um einen eigenen Talk zu erhalten.", "➕ Talk erstellen"],
          ["Kanal-Kategorie", "Discord-Kategorie, in der die neuen Talks einsortiert werden.", "🔊 Temporäre Talks"],
          ["Kanalname Schema", "Namensmuster der neuen Kanäle (z.B. {username}'s Talk).", "{username}'s Lounge"],
          ["User Limit", "Standard-Mitgliederlimit für neu erstellte Talks (0 = unbegrenzt).", "0 (Frei anpassbar)"],
          ["Auto-Delete", "Löscht den temporären Kanal sofort, sobald alle Mitglieder ihn verlassen haben.", "Sofort"]
        ]
      }),
      e.jsx(h2, { id: "tempvoice-commands", children: "Talk-Besitzer Befehle" }),
      e.jsx(CommandCard, { name: "voice lock", syntax: "/voice lock", desc: "Sperrt den eigenen Talk, sodass keine weiteren Mitglieder beitreten können.", perms: "Talk-Besitzer", example: "/voice lock" }),
      e.jsx(CommandCard, { name: "voice unlock", syntax: "/voice unlock", desc: "Öffnet den Talk wieder für alle Mitglieder.", perms: "Talk-Besitzer", example: "/voice unlock" }),
      e.jsx(CommandCard, { name: "voice limit", syntax: "/voice limit <anzahl>", desc: "Ändert das Mitgliederlimit des aktuellen Talks.", perms: "Talk-Besitzer", example: "/voice limit 4" }),
      e.jsx(CommandCard, { name: "voice rename", syntax: "/voice rename <name>", desc: "Benennt den eigenen Kanal um.", perms: "Talk-Besitzer", example: "/voice rename Duo Ranked" })
    ]
  });
}


function PageServerStats() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Server-Statistiken", color: "primary" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Zeige Live-Statistiken deines Servers in geschützten Sprachkanälen an. Die Zähler aktualisieren sich automatisch."
      }),
      e.jsx(h2, { id: "zaehler-arten", children: "Verfügbare Zähler & Kanäle" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Alle Mitglieder", "Zählt alle Mitglieder inklusive Bots auf dem Server.", "👥 Mitglieder: 1.250"],
          ["Menschen (Humans)", "Zählt nur echte Discord-Benutzer ohne Bots.", "👤 User: 1.238"],
          ["Bots", "Zählt alle Bots auf dem Server.", "🤖 Bots: 12"],
          ["Server Boosts", "Zeigt Boost-Level und Gesamtzahl der Boosts an.", "🚀 Boosts: Level 3 (14)"],
          ["Online Mitglieder", "Zählt aktuell aktive Mitglieder (Online, DND, Idle).", "🟢 Online: 420"]
        ]
      }),
      e.jsx(h2, { id: "stats-commands", children: "Zugehörige Commands" }),
      e.jsx(CommandCard, { name: "serverstats setup", syntax: "/serverstats setup", desc: "Erstellt die Kategorie und alle Statistik-Kanäle automatisch.", perms: "Administrator", example: "/serverstats setup" })
    ]
  });
}


function PageInvites() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Einladungs-Tracker", color: "amber" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Verfolge genau, wer welche neuen Mitglieder auf deinen Server eingeladen hat, mit Erkennung von Fake-Accounts und Verlassern."
      }),
      e.jsx(h2, { id: "invite-berechnung", children: "Berechnung & Anti-Fake" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Reguläre Invites", "Mitglieder, die über den Link beigetreten sind und auf dem Server geblieben sind.", "+1 Invite"],
          ["Left Invites", "Mitglieder, die den Server wieder verlassen haben.", "-1 Invite"],
          ["Fake Invites", "Accounts, die verdächtig schnell joinen und leaven oder extrem jung sind.", "0 (Nicht gewertet)"],
          ["Bonus Invites", "Manuell von Admins hinzugefügte Einladungen (z.B. als Event-Belohnung).", "Flexibel anpassbar"]
        ]
      }),
      e.jsx(h2, { id: "invite-commands", children: "Zugehörige Commands" }),
      e.jsx(CommandCard, { name: "invites", syntax: "/invites [user]", desc: "Zeigt die Einladungsstatistik eines Mitglieds an.", perms: "Keine", example: "/invites @Freund" }),
      e.jsx(CommandCard, { name: "inviteleaderboard", syntax: "/inviteleaderboard", desc: "Zeigt die Top-Einlader des Servers an.", perms: "Keine", example: "/inviteleaderboard" })
    ]
  });
}


function PageAutoResponder() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Automatisierung", color: "purple" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Erstelle automatische Text- und Embed-Antworten auf häufig gestellte Fragen (FAQ) sowie Sticky Messages, die immer unten im Kanal bleiben."
      }),
      e.jsx(h2, { id: "responder-typen", children: "Trigger-Arten & Sticky Messages" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Exact Match", "Antwortet nur, wenn die Nachricht genau dem Suchbegriff entspricht.", "z.B. !ip"],
          ["Contains (Enthält)", "Antwortet, wenn das Wort irgendwo im Satz vorkommt.", "z.B. 'wann update'"],
          ["Sticky Messages", "Hält eine wichtige Nachricht (z.B. Kanal-Regeln) immer ganz unten im Chat.", "Aktivierbar pro Kanal"]
        ]
      }),
      e.jsx(h2, { id: "responder-commands", children: "Zugehörige Commands" }),
      e.jsx(CommandCard, { name: "autoresponder add", syntax: "/autoresponder add <trigger> <antwort>", desc: "Erstellt eine neue automatische Chat-Antwort.", perms: "Nachrichten verwalten", example: "/autoresponder add '!website' Besuche https://orbitbot.de" }),
      e.jsx(CommandCard, { name: "autoresponder list", syntax: "/autoresponder list", desc: "Listet alle aktiven Auto-Responder des Servers auf.", perms: "Nachrichten verwalten", example: "/autoresponder list" })
    ]
  });
}


function PageInactiveKick() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Server-Bereinigung", color: "red" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Halte deinen Server aktiv und bereinige tote Accounts, die seit Monaten weder geschrieben noch gesprochen haben."
      }),
      e.jsx(h2, { id: "inaktivitaet-einstellungen", children: "Kriterien & Ausnahmen" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Inaktivitäts-Zeitraum", "Tage ohne Aktivität (Chat oder Voice), ab wann ein User als inaktiv gilt.", "60 oder 90 Tage"],
          ["Ausgenommene Rollen", "Rollen, die niemals gekickt werden (z.B. Team, VIP, Booster).", "@Team, @VIP, @Booster"],
          ["Dry-Run (Vorschau)", "Testmodus: Zeigt nur die Liste der betroffenen User an, ohne Kicks auszuführen.", "Immer zuerst testen!"]
        ]
      }),
      e.jsx(h2, { id: "kick-commands", children: "Zugehörige Commands" }),
      e.jsx(CommandCard, { name: "inactivekick preview", syntax: "/inactivekick preview <tage>", desc: "Erstellt eine Vorschau aller betroffenen inaktiven Mitglieder.", perms: "Administrator", example: "/inactivekick preview 60" }),
      e.jsx(CommandCard, { name: "inactivekick run", syntax: "/inactivekick run <tage>", desc: "Führt den Kick für inaktive Mitglieder durch.", perms: "Administrator", example: "/inactivekick run 90" })
    ]
  });
}


function PageBackups() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Server-Sicherheit", color: "primary" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Erstelle vollständige Sicherungen deines Servers (Rollen, Kanäle, Berechtigungen und Einstellungen) und stelle sie bei Bedarf mit einem Klick wieder her."
      }),
      e.jsx(h2, { id: "backup-umfang", children: "Was wird gesichert?" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Rollen & Berechtigungen", "Sichert alle Rollen, Farben, Anordnungen und exakten Rechte.", "Vollständig"],
          ["Text- & Sprachkanäle", "Sichert alle Kategorien, Kanäle, Beschreibungen, Slowmodes und Channel-Overrides.", "Vollständig"],
          ["Bot-Konfiguration", "Sichert die im Dashboard hinterlegten Einstellungen aller Module.", "Vollständig"]
        ]
      }),
      e.jsx(h2, { id: "backup-commands", children: "Zugehörige Commands" }),
      e.jsx(CommandCard, { name: "backup create", syntax: "/backup create", desc: "Erstellt ein neues Backup und gibt den Backup-Code aus.", perms: "Server-Besitzer", example: "/backup create" }),
      e.jsx(CommandCard, { name: "backup load", syntax: "/backup load <code>", desc: "Stellt den Server aus einem Backup-Code wieder her.", perms: "Server-Besitzer", example: "/backup load orb_9a8f7c" })
    ]
  });
}


function PageAppeals() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Entbannungssystem", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Ermögliche gebannten Nutzern, über ein sauberes Webformular einen Entbannungsantrag einzureichen, den dein Team mit Knopfdruck annehmen oder ablehnen kann."
      }),
      e.jsx(h2, { id: "appeals-ablauf", children: "Ablauf & Moderation" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Webformular", "Gebannte Nutzer melden sich via Discord an und schildern ihren Fall.", "Aktiviert"],
          ["Team Review-Kanal", "Neuer Antrag wird mit 'Annehmen' und 'Ablehnen' Buttons im Team-Kanal gepostet.", "#ban-appeals"],
          ["Automatischer Unban", "Beim Klick auf 'Annehmen' wird der Bann in Discord sofort aufgehoben.", "Aktiviert"]
        ]
      })
    ]
  });
}


function PageModLog() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Audit & Protokollierung", color: "cyan" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Protokolliere alle Moderationsentscheidungen mit eindeutigen Case-IDs, gelöschte & bearbeitete Nachrichten sowie Rollenänderungen."
      }),
      e.jsx(h2, { id: "log-kategorien", children: "Log-Kategorien" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Mod Cases", "Bans, Kicks, Timeouts und Warns mit Fallnummer (Case #123) und Begründung.", "#mod-logs"],
          ["Nachrichten-Logs", "Protokolliert bearbeitete und gelöschte Nachrichten (inkl. Originaltext).", "#msg-logs"],
          ["Server-Logs", "Kanal-Erstellungen, Rollen-Änderungen und Beitritt/Verlassen.", "#server-logs"]
        ]
      }),
      e.jsx(h2, { id: "modlog-commands", children: "Zugehörige Commands" }),
      e.jsx(CommandCard, { name: "cases", syntax: "/cases <user>", desc: "Zeigt alle Moderationsfälle eines Mitglieds an.", perms: "Nachrichten verwalten", example: "/cases @User" }),
      e.jsx(CommandCard, { name: "case view", syntax: "/case view <id>", desc: "Ruft Details zu einer bestimmten Fallnummer ab.", perms: "Nachrichten verwalten", example: "/case view 42" })
    ]
  });
}


function PageSettings() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Bot-Konfiguration", color: "primary" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Allgemeine Einstellungen für deinen Server im Orbit Dashboard."
      }),
      e.jsx(h2, { id: "globale-optionen", children: "Verfügbare Optionen" }),
      e.jsx(SettingsTable, {
        rows: [
          ["Bot-Präfix", "Präfix für optionale Text-Befehle (Standard: Slash Commands /).", "!"],
          ["Dashboard-Sprache", "Sprache für Bot-Nachrichten und das Web Dashboard.", "Deutsch (de)"],
          ["Admin-Rollen", "Rollen, die vollen Zugriff auf alle Orbit Dashboard-Einstellungen haben.", "@Administrator"],
          ["Moderator-Rollen", "Rollen, die Moderationsbefehle (/warn, /kick, /timeout) ausführen dürfen.", "@Moderator"],
          ["0ms Instant Cache", "Echtzeit-Caching im Browser für unterbrechungsfreies Wechseln zwischen Tabs.", "Immer aktiv"]
        ]
      })
    ]
  });
}


function PageCommandsMod() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Befehlsreferenz", color: "amber" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Vollständige Übersicht aller Moderationsbefehle von Orbit mit Syntax, Rechten und Beispielen."
      }),
      e.jsx(CommandCard, { name: "ban", syntax: "/ban <user> [grund] [tage_löschen]", desc: "Bannt ein Mitglied dauerhaft vom Server und löscht optional Nachrichten der letzten 1-7 Tage.", perms: "Mitglieder bannen", example: "/ban @Troll Beleidigung 1" }),
      e.jsx(CommandCard, { name: "unban", syntax: "/unban <user_id> [grund]", desc: "Hebt den Bann eines Nutzers anhand seiner Discord User ID auf.", perms: "Mitglieder bannen", example: "/unban 123456789012345678 Entbannung angenommen" }),
      e.jsx(CommandCard, { name: "softban", syntax: "/softban <user> [grund]", desc: "Bannt einen Nutzer und entbannt ihn sofort wieder, um alle seine Nachrichten schnell zu bereinigen.", perms: "Mitglieder bannen", example: "/softban @Spammer Chat bereinigt" }),
      e.jsx(CommandCard, { name: "kick", syntax: "/kick <user> [grund]", desc: "Kickt ein Mitglied vom Server. Der Nutzer kann wieder beitreten.", perms: "Mitglieder kicken", example: "/kick @Nutzer Bitte Regeln lesen" }),
      e.jsx(CommandCard, { name: "timeout", syntax: "/timeout <user> <dauer> [grund]", desc: "Schaltet ein Mitglied für eine bestimmte Zeit stumm (z.B. 10m, 1h, 1d).", perms: "Mitglieder stummschalten", example: "/timeout @User 30m Spamming" }),
      e.jsx(CommandCard, { name: "untimeout", syntax: "/untimeout <user>", desc: "Hebt das Timeout eines Mitglieds vorzeitig auf.", perms: "Mitglieder stummschalten", example: "/untimeout @User" }),
      e.jsx(CommandCard, { name: "mute", syntax: "/mute <user> <dauer> [grund]", desc: "Alternative zu Timeout – vergibt die Muted-Rolle an das Mitglied.", perms: "Rollen verwalten", example: "/mute @User 2h Chat-Pause" }),
      e.jsx(CommandCard, { name: "unmute", syntax: "/unmute <user>", desc: "Entfernt die Muted-Rolle eines Mitglieds.", perms: "Rollen verwalten", example: "/unmute @User" }),
      e.jsx(CommandCard, { name: "warn", syntax: "/warn <user> <grund>", desc: "Trägt eine offizielle Verwarnung in die Datenbank ein.", perms: "Nachrichten verwalten", example: "/warn @User Spam im falschen Kanal" }),
      e.jsx(CommandCard, { name: "warnings", syntax: "/warnings <user>", desc: "Ruft die Verwarnungshistorie eines Nutzers ab.", perms: "Nachrichten verwalten", example: "/warnings @User" }),
      e.jsx(CommandCard, { name: "delwarn", syntax: "/delwarn <warn_id>", desc: "Löscht eine spezifische Verwarnung anhand ihrer ID.", perms: "Nachrichten verwalten", example: "/delwarn 14" }),
      e.jsx(CommandCard, { name: "clearwarns", syntax: "/clearwarns <user>", desc: "Löscht alle Verwarnungen eines Mitglieds vollständig.", perms: "Mitglieder kicken", example: "/clearwarns @User" }),
      e.jsx(CommandCard, { name: "purge", syntax: "/purge <anzahl>", desc: "Löscht bis zu 100 Nachrichten im Kanal auf einmal.", perms: "Nachrichten verwalten", example: "/purge 25" }),
      e.jsx(CommandCard, { name: "lock", syntax: "/lock [kanal] [grund]", desc: "Sperrt einen Textkanal für normale Mitglieder (@everyone).", perms: "Kanäle verwalten", example: "/lock #allgemein Raid-Pause" }),
      e.jsx(CommandCard, { name: "unlock", syntax: "/unlock [kanal]", desc: "Entsperrt einen zuvor gesperrten Textkanal.", perms: "Kanäle verwalten", example: "/unlock #allgemein" }),
      e.jsx(CommandCard, { name: "slowmode", syntax: "/slowmode <sekunden>", desc: "Setzt die Nachrichten-Verzögerung für den Kanal (0 zum Deaktivieren).", perms: "Kanäle verwalten", example: "/slowmode 5" }),
      e.jsx(CommandCard, { name: "nick", syntax: "/nick <user> [neuer_nick]", desc: "Ändert oder setzt den Server-Spitznamen eines Mitglieds zurück.", perms: "Spitznamen verwalten", example: "/nick @User CoolerName" })
    ]
  });
}


function PageCommandsMgmt() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Server-Management", color: "primary" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Befehle zur Verwaltung von Kanälen, Rollen, Embeds und Sicherungen."
      }),
      e.jsx(CommandCard, { name: "setup", syntax: "/setup", desc: "Öffnet den interaktiven Setup-Assistenten für neue Server.", perms: "Administrator", example: "/setup" }),
      e.jsx(CommandCard, { name: "autorole", syntax: "/autorole set <rolle>", desc: "Setzt die automatische Rolle für neue Mitglieder.", perms: "Rollen verwalten", example: "/autorole set @Mitglied" }),
      e.jsx(CommandCard, { name: "reactionrole", syntax: "/reactionrole add <msg_id> <emoji> <rolle>", desc: "Verknüpft ein Emoji mit einer Rolle.", perms: "Rollen verwalten", example: "/reactionrole add 987654321 ⭐ @VIP" }),
      e.jsx(CommandCard, { name: "embed", syntax: "/embed create", desc: "Startet den visuellen Embed-Builder für Ankündigungen.", perms: "Nachrichten verwalten", example: "/embed create" }),
      e.jsx(CommandCard, { name: "backup create", syntax: "/backup create", desc: "Erstellt ein vollständiges Server-Backup.", perms: "Server-Besitzer", example: "/backup create" }),
      e.jsx(CommandCard, { name: "backup load", syntax: "/backup load <code>", desc: "Stellt ein Server-Backup wieder her.", perms: "Server-Besitzer", example: "/backup load orb_123" }),
      e.jsx(CommandCard, { name: "serverstats setup", syntax: "/serverstats setup", desc: "Richtet die Live-Zählerkanäle automatisch ein.", perms: "Administrator", example: "/serverstats setup" })
    ]
  });
}


function PageCommandsCommunity() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Community & Spaß", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Befehle für Mitglieder: Level, Ränge, Umfragen, Giveaways, Support und AFK."
      }),
      e.jsx(CommandCard, { name: "rank", syntax: "/rank [user]", desc: "Zeigt die persönliche Rangkarte mit Level und Fortschritt an.", perms: "Keine", example: "/rank" }),
      e.jsx(CommandCard, { name: "leaderboard", syntax: "/leaderboard", desc: "Zeigt die aktivsten Mitglieder des Servers im Chat oder als Web-Link an.", perms: "Keine", example: "/leaderboard" }),
      e.jsx(CommandCard, { name: "giveaway start", syntax: "/giveaway start <zeit> <gewinner> <preis>", desc: "Startet ein Gewinnspiel.", perms: "Nachrichten verwalten", example: "/giveaway start 12h 1 Steam Key" }),
      e.jsx(CommandCard, { name: "poll", syntax: "/poll <frage> <option1> <option2>", desc: "Startet eine Umfrage im aktuellen Kanal.", perms: "Nachrichten verwalten", example: "/poll Pizza oder Pasta?" }),
      e.jsx(CommandCard, { name: "ticket panel", syntax: "/ticket panel", desc: "Postet das Ticket-Support-Panel.", perms: "Administrator", example: "/ticket panel" }),
      e.jsx(CommandCard, { name: "afk", syntax: "/afk [status]", desc: "Setzt deinen Status auf AFK und benachrichtigt jeden, der dich erwähnt.", perms: "Keine", example: "/afk Bin kurz essen" }),
      e.jsx(CommandCard, { name: "remind", syntax: "/remind <zeit> <nachricht>", desc: "Erinnert dich nach Ablauf der Zeit per Direktnachricht.", perms: "Keine", example: "/remind 2h Pizza aus dem Ofen holen" })
    ]
  });
}


function PageCommandsInfo() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Information & Utility", color: "cyan" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Informative Befehle über Nutzer, Server, Avatare und Bot-Status."
      }),
      e.jsx(CommandCard, { name: "help", syntax: "/help [befehl]", desc: "Zeigt die Übersicht aller Befehle oder Hilfe zu einem bestimmten Befehl.", perms: "Keine", example: "/help ban" }),
      e.jsx(CommandCard, { name: "botinfo", syntax: "/botinfo", desc: "Zeigt System-Ressourcen, Ping, Serveranzahl und Bot-Version an.", perms: "Keine", example: "/botinfo" }),
      e.jsx(CommandCard, { name: "serverinfo", syntax: "/serverinfo", desc: "Detaillierte Infos zum aktuellen Discord Server (Erstellung, Boosts, Rollen).", perms: "Keine", example: "/serverinfo" }),
      e.jsx(CommandCard, { name: "userinfo", syntax: "/userinfo [user]", desc: "Zeigt Informationen über ein Mitglied an (Beitrittsdatum, Rollen, Berechtigungen).", perms: "Keine", example: "/userinfo @Freund" }),
      e.jsx(CommandCard, { name: "avatar", syntax: "/avatar [user]", desc: "Gibt das Profilbild eines Nutzers in voller Auflösung aus.", perms: "Keine", example: "/avatar @User" }),
      e.jsx(CommandCard, { name: "banner", syntax: "/banner [user]", desc: "Gibt das Profil-Banner eines Nutzers aus.", perms: "Keine", example: "/banner @User" }),
      e.jsx(CommandCard, { name: "ping", syntax: "/ping", desc: "Misst die WebSocket- und REST-Latenz des Bots.", perms: "Keine", example: "/ping" }),
      e.jsx(CommandCard, { name: "steal", syntax: "/steal <emoji> [name]", desc: "Fügt ein Emoji oder Sticker von einem anderen Server deinem Server hinzu.", perms: "Emojis verwalten", example: "/steal :pepe_clap:" })
    ]
  });
}


function PageCommandsAdmin() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Administration & Schutz", color: "red" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Spezielle Administrationsbefehle für Sicherheit, Whitelist und Notfallmaßnahmen."
      }),
      e.jsx(CommandCard, { name: "security", syntax: "/security status", desc: "Zeigt den Zustand der Sicherheitsfilter und aktiven Schutzmechanismen.", perms: "Administrator", example: "/security status" }),
      e.jsx(CommandCard, { name: "antiraid", syntax: "/antiraid <on|off>", desc: "Aktiviert den Mass-Join Schutz manuell.", perms: "Administrator", example: "/antiraid on" }),
      e.jsx(CommandCard, { name: "whitelist", syntax: "/whitelist add <user|rolle>", desc: "Fügt Nutzer oder Rollen zur Sicherheits-Whitelist hinzu.", perms: "Administrator", example: "/whitelist add @AdminTeam" }),
      e.jsx(CommandCard, { name: "blacklist", syntax: "/blacklist add <wort>", desc: "Fügt Wörter zur globalen Blacklist hinzu.", perms: "Administrator", example: "/blacklist add scamlink" }),
      e.jsx(CommandCard, { name: "voice setup", syntax: "/voice setup", desc: "Richtet das TempVoice System automatisch ein.", perms: "Administrator", example: "/voice setup" })
    ]
  });
}


function PageGuidesIndex() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Praxis-Anleitungen", color: "primary" }),
      e.jsx("p", {
        className: "text-lg text-neutral-300 leading-relaxed mb-6",
        children: "Willkommen in den Orbit Guides! Hier findest du ausführliche Schritt-für-Schritt Anleitungen, wie du deinen Discord Server mit Orbit von Grund auf einrichtest, absicherst und automatisierst."
      }),
      e.jsx(h2, { id: "beliebte-guides", children: "Beliebte Anleitungen" }),
      e.jsxs(Cards, {
        children: [
          e.jsx(Card, { title: "Server-Setup von 0 auf 100", href: "/docs/guides/server-setup", children: "Der ultimative Guide für neue Community- und Gaming-Server." }),
          e.jsx(Card, { title: "Anti-Raid & Server absichern", href: "/docs/guides/antiraid-security", children: "So schützt du deinen Server vor Raids, Mass-Joins und Spambots." }),
          e.jsx(Card, { title: "Support- & Ticket-System", href: "/docs/guides/tickets-support", children: "Baue ein professionelles Team-Supportsystem mit HTML-Transkripten auf." }),
          e.jsx(Card, { title: "Leveling & Rollen-Belohnungen", href: "/docs/guides/leveling-rewards", children: "Belohne aktive Mitglieder mit Chat- und Voice-XP." }),
          e.jsx(Card, { title: "TempVoice / Talk-System", href: "/docs/guides/tempvoice-channels", children: "Nie wieder volle Sprachkanäle: Dynamische Join to Create Talks." }),
          e.jsx(Card, { title: "Auto-Moderation Masterclass", href: "/docs/guides/automod-moderation", children: "Wortfilter, Anti-Spam und Schwellenwerte perfekt konfigurieren." })
        ]
      })
    ]
  });
}

function PageGuideServerSetup() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Setup Guide", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Dieser Guide zeigt dir Schritt für Schritt, wie du deinen Discord Server mit Orbit optimal strukturierst, Berechtigungen vergibst und alle Core-Module aktivierst."
      }),
      e.jsx(h2, { id: "schritt-1-einladung", children: "1. Bot einladen & Rechte vergeben" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Lade Orbit über den offiziellen OAuth2-Link ein. Gib dem Bot Administrator-Rechte, damit er Kanäle und Rollen problemlos verwalten kann." }),
      e.jsx(h2, { id: "schritt-2-rollen", children: "2. Rollenhierarchie & Berechtigungen" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Ziehe in Discord unter 'Server-Einstellungen -> Rollen' die Orbit-Rolle über alle Benutzerrollen. Orbit kann nur Rollen verwalten, die hierarchisch unter ihm stehen." }),
      e.jsx(h2, { id: "schritt-3-kanaele", children: "3. Empfohlene Kanäle anlegen" }),
      e.jsx("ul", { className: "list-disc pl-5 space-y-1.5 text-neutral-300 mb-4", children: [
        e.jsx("li", { children: "#willkommen – Begrüßung neuer Mitglieder" }),
        e.jsx("li", { children: "#verifizieren – Gate für neue Mitglieder" }),
        e.jsx("li", { children: "#regeln – Serverregeln" }),
        e.jsx("li", { children: "#support – Ticket-Panel für Anfragen" }),
        e.jsx("li", { children: "#mod-logs – Interner Teamkanal für Logs" })
      ]}),
      e.jsx(h2, { id: "schritt-4-dashboard", children: "4. Module im Dashboard aktivieren" }),
      e.jsx("p", { className: "text-neutral-300", children: "Gehe auf /dashboard, wähle deinen Server aus und schalte die gewünschten Tabs (AutoMod, Verification, Level, TempVoice) ein." })
    ]
  });
}

function PageGuideAntiRaid() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Sicherheits-Guide", color: "red" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Raids und Bot-Angriffe können einen Server innerhalb von Sekunden ruinieren. In diesem Guide lernst du, wie du Orbit konfigurierst, um 100% vor Raids geschützt zu sein."
      }),
      e.jsx(h2, { id: "mass-join", children: "1. Mass-Join Schutz aktivieren" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Stelle im Security-Tab den Mass-Join Schutz auf '8 Joins in 10 Sekunden'. Tritt dieser Fall ein, sperrt Orbit neue Einladungen automatisch und schlägt im Team-Log Alarm." }),
      e.jsx(h2, { id: "account-age", children: "2. Account Age Gate einrichten" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Setze das Mindestalter für Accounts auf mindestens 3 Tage. Die meisten Raid-Bots werden frisch registriert und werden dadurch sofort geblockt." }),
      e.jsx(h2, { id: "notfall-befehle", children: "3. Wichtige Notfallbefehle" }),
      e.jsx(CommandCard, { name: "lock", syntax: "/lock", desc: "Sperrt den aktuellen Kanal sofort für @everyone.", perms: "Kanäle verwalten", example: "/lock" }),
      e.jsx(CommandCard, { name: "antiraid", syntax: "/antiraid on", desc: "Aktiviert manuell den höchsten Sicherheitsmodus.", perms: "Administrator", example: "/antiraid on" })
    ]
  });
}

function PageGuideTickets() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Support-Guide", color: "primary" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Biete deinen Mitgliedern erstklassigen Support mit privaten Ticket-Kanälen, Rollen-Pings und HTML-Transkripten."
      }),
      e.jsx(h2, { id: "panel-erstellen", children: "1. Ticket-Panel einrichten" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Führe im gewünschten Support-Kanal den Befehl /ticket panel aus oder konfiguriere das Panel bequem im Web Dashboard." }),
      e.jsx(h2, { id: "team-rolle", children: "2. Team-Rolle definieren" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Wähle deine Moderator- oder Supporter-Rolle aus. Nur Teammitglieder mit dieser Rolle können geöffnete Tickets einsehen." }),
      e.jsx(h2, { id: "transkripte", children: "3. HTML-Transkripte speichern" }),
      e.jsx("p", { className: "text-neutral-300", children: "Aktiviere den Transkript-Kanal #ticket-logs. Bei jedem Schließen eines Tickets wird der vollständige Chatverlauf als interaktive HTML-Datei gespeichert." })
    ]
  });
}

function PageGuideLeveling() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Community-Guide", color: "amber" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Aktive Mitglieder sind das Herz jedes Servers. Erfahre, wie du das Leveling-System mit XP und Rollen-Belohnungen optimal einstellst."
      }),
      e.jsx(h2, { id: "xp-balance", children: "1. Die perfekte XP-Balance" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Standardmäßig erhalten Nutzer 15-25 XP alle 60 Sekunden für Chatnachrichten und 5-10 XP pro Minute in Sprachkanälen. Stummgeschaltete Nutzer erhalten keine Voice-XP." }),
      e.jsx(h2, { id: "role-rewards", children: "2. Rollen-Belohnungen staffeln" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Empfohlene Belohnungsstufen: Level 5 (Stammgast), Level 15 (Fortgeschritten), Level 30 (Veteran), Level 50 (Server-Legende)." }),
      e.jsx(h2, { id: "level-kanaele", children: "3. Spamfreier Level-Up Kanal" }),
      e.jsx("p", { className: "text-neutral-300", children: "Lege einen Kanal #level-ups an, damit Level-Aufstiege nicht den allgemeinen Chat stören." })
    ]
  });
}

function PageGuideTempVoice() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Voice-Guide", color: "green" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Keine unübersichtlichen, leeren Sprachkanäle mehr! Mit Join to Create erstellen sich Kanäle bei Bedarf von selbst."
      }),
      e.jsx(h2, { id: "hub-setup", children: "1. Hub-Kanal anlegen" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Nutze /voice setup oder wähle im Dashboard den Sprachkanal '➕ Talk erstellen' aus." }),
      e.jsx(h2, { id: "owner-rechte", children: "2. Berechtigungen für Talk-Ersteller" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Der Ersteller hat die volle Kontrolle: Er kann mit /voice lock den Kanal abschließen oder mit /voice limit die Teilnehmerzahl begrenzen." }),
      e.jsx(h2, { id: "auto-delete", children: "3. Automatisches Aufräumen" }),
      e.jsx("p", { className: "text-neutral-300", children: "Verlässt das letzte Mitglied den Kanal, wird er von Orbit sofort gelöscht." })
    ]
  });
}

function PageGuideAutoMod() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Moderations-Guide", color: "purple" }),
      e.jsx("p", {
        className: "text-neutral-300 leading-relaxed mb-6",
        children: "Erfahre, wie du den Content-Filter und Anti-Spam von Orbit so konfigurierst, dass Beleidigungen geblockt werden, ohne normale Gespräche zu stören."
      }),
      e.jsx(h2, { id: "filter-level", children: "1. Relaxed vs. Strict" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Strict erkennt Sonderzeichen-Tricks (z.B. 'f_u_c_k' oder 'w-o-r-t'). Für die meisten Server ist 'Strict' mit einer sauberen Whitelist die beste Wahl." }),
      e.jsx(h2, { id: "anti-spam", children: "2. Anti-Spam Feinabstimmung" }),
      e.jsx("p", { className: "text-neutral-300 mb-3", children: "Wir empfehlen 5 Nachrichten innerhalb von 3 Sekunden. Das erlaubt schnelles Tippen, stoppt aber automatisierte Makros und Spammer." }),
      e.jsx(h2, { id: "stufenweise-strafen", children: "3. Stufenweise Bestrafung" }),
      e.jsx("p", { className: "text-neutral-300", children: "Verwarnung beim 1. Verstoß, 10 Minuten Timeout beim 2. Verstoß, Kick oder Bann bei 3+ Verstößen." })
    ]
  });
}


function PageReleasesIndex() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Update-Historie", color: "primary" }),
      e.jsx("p", {
        className: "text-lg text-neutral-300 leading-relaxed mb-6",
        children: "Alle Versionshinweise, neuen Features, Verbesserungen und Bugfixes von Orbit im Überblick."
      }),
      e.jsx(h2, { id: "versions-uebersicht", children: "Aktuelle Versionen" }),
      e.jsxs(Cards, {
        children: [
          e.jsx(Card, { title: "Orbit v2.4 (Aktuell)", href: "/docs/releases/v2-4", children: "0ms Instant Dashboard Cache, neuer AutoMod Engine, HTML Transkripte." }),
          e.jsx(Card, { title: "Orbit v2.3", href: "/docs/releases/v2-3", children: "TempVoice (Join to Create) und Giveaways mit Rollen-Bedingungen." }),
          e.jsx(Card, { title: "Orbit v2.2", href: "/docs/releases/v2-2", children: "Neues Ticketsystem mit Kategorien und Umfragen (Polls) mit Prozentbalken." }),
          e.jsx(Card, { title: "Orbit v2.1", href: "/docs/releases/v2-1", children: "Anti-Raid Shield, Account Age Gate und Notfall-Lockdown." }),
          e.jsx(Card, { title: "Orbit v2.0", href: "/docs/releases/v2-0", children: "Vollständiger Relaunch der Bot-Architektur auf Discord Slash Commands." })
        ]
      })
    ]
  });
}

function PageReleaseV24() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Version 2.4 – Oktober 2026", color: "green" }),
      e.jsx("p", { className: "text-neutral-300 leading-relaxed mb-6", children: "Das bisher größte Performance- und Usability-Update für Orbit!" }),
      e.jsx(h2, { id: "highlights", children: "Wichtigste Neuerungen" }),
      e.jsx("ul", { className: "list-disc pl-5 space-y-2 text-neutral-300 mb-6", children: [
        e.jsxs("li", { children: [e.jsx("strong", { children: "0ms Web Dashboard: " }), "Dank Cache-First Architektur und intelligentem Hintergrund-Pre-Mounting schalten alle 18 Tabs im Dashboard verzögerungsfrei um."] }),
        e.jsxs("li", { children: [e.jsx("strong", { children: "Überarbeitete AutoMod-Engine: " }), "Erkennt nun auch versteckte Unicode-Homoglyphen und Zero-Width-Spaces."] }),
        e.jsxs("li", { children: [e.jsx("strong", { children: "HTML-Transkripte: " }), "Tickets werden beim Schließen formatiert als herunterladbare Web-Dateien mit Avataren und Formatierung gespeichert."] }),
        e.jsxs("li", { children: [e.jsx("strong", { children: "Globale Suche: " }), "Die Dokumentation verfügt über eine interaktive Suche mit Ctrl + K."] })
      ]})
    ]
  });
}

function PageReleaseV23() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Version 2.3 – September 2026", color: "cyan" }),
      e.jsx("p", { className: "text-neutral-300 leading-relaxed mb-6", children: "Fokus auf Voice-Interaktion und Community-Events." }),
      e.jsx(h2, { id: "features", children: "Neue Features" }),
      e.jsx("ul", { className: "list-disc pl-5 space-y-2 text-neutral-300 mb-6", children: [
        e.jsxs("li", { children: [e.jsx("strong", { children: "TempVoice: " }), "Vollautomatisches 'Join to Create' System mit Owner-Befehlen (/voice lock, /voice limit)."] }),
        e.jsxs("li", { children: [e.jsx("strong", { children: "Giveaway-Rollen: " }), "Gewinnspiele können nun an Mindest-Rollen (z.B. Booster) gekoppelt werden."] })
      ]})
    ]
  });
}

function PageReleaseV22() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Version 2.2 – August 2026", color: "purple" }),
      e.jsx("p", { className: "text-neutral-300 leading-relaxed mb-6", children: "Neues Ticket- und Support-Management." }),
      e.jsx(h2, { id: "features", children: "Neue Features" }),
      e.jsx("ul", { className: "list-disc pl-5 space-y-2 text-neutral-300 mb-6", children: [
        e.jsxs("li", { children: [e.jsx("strong", { children: "Kategorisierte Tickets: " }), "Unterstützung für bis zu 5 separate Ticket-Kategorien im Select-Menü."] }),
        e.jsxs("li", { children: [e.jsx("strong", { children: "Interaktive Umfragen: " }), "Single- und Multiple-Choice Umfragen mit grafischen Live-Balken."] })
      ]})
    ]
  });
}

function PageReleaseV21() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Version 2.1 – Juli 2026", color: "red" }),
      e.jsx("p", { className: "text-neutral-300 leading-relaxed mb-6", children: "Erhöhter Schutz vor Bot-Netzen und Server-Raids." }),
      e.jsx(h2, { id: "features", children: "Neue Features" }),
      e.jsx("ul", { className: "list-disc pl-5 space-y-2 text-neutral-300 mb-6", children: [
        e.jsxs("li", { children: [e.jsx("strong", { children: "Anti-Raid Shield: " }), "Erkennung von Mass-Joins mit automatischem Notfall-Lockdown."] }),
        e.jsxs("li", { children: [e.jsx("strong", { children: "Account Age Gate: " }), "Automatisches Verweigern des Beitritts für neue Wegwerf-Accounts."] })
      ]})
    ]
  });
}

function PageReleaseV20() {
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(TitleBadge, { text: "Version 2.0 – Juni 2026", color: "amber" }),
      e.jsx("p", { className: "text-neutral-300 leading-relaxed mb-6", children: "Kompletter Relaunch der gesamten Orbit Plattform." }),
      e.jsx(h2, { id: "features", children: "Highlights" }),
      e.jsx("ul", { className: "list-disc pl-5 space-y-2 text-neutral-300 mb-6", children: [
        e.jsx("li", { children: "100% Umstellung auf Discord Slash Commands." }),
        e.jsx("li", { children: "Moderne Microservice-Architektur mit performantem Backend." }),
        e.jsx("li", { children: "Einführung des Web-Dashboards für Server-Admins." })
      ]})
    ]
  });
}


const ORBIT_PAGES = {
  // Docs Tab
  "index.mdx": () => Promise.resolve({
    default: PageIntro,
    frontmatter: { title: "Willkommen bei Orbit Docs", description: "Offizielle Dokumentation für den All-in-One Discord Bot Orbit.", icon: "BookOpen" },
    toc: [{ depth: 2, url: "#warum-orbit", title: "Warum Orbit?" }, { depth: 2, url: "#schnellzugriff", title: "Globale Suche" }]
  }),
  "quickstart.mdx": () => Promise.resolve({
    default: PageQuickstart,
    frontmatter: { title: "Erste Schritte", description: "Lade Orbit ein und richte deinen Server in 3 Minuten ein.", icon: "Rocket" },
    toc: [{ depth: 2, url: "#schritt-fuer-schritt", title: "Schritt-für-Schritt Einrichtung" }]
  }),
  "modules/automod.mdx": () => Promise.resolve({
    default: PageAutoMod,
    frontmatter: { title: "Auto-Moderation", description: "Echtzeitschutz vor Bad Words, Spam, Links und Mass-Mentions.", icon: "ShieldAlert" },
    toc: [{ depth: 2, url: "#einstellungen-tabelle", title: "Einstellungen & Toggles" }, { depth: 2, url: "#schritt-fuer-schritt-einrichtung", title: "Einrichtung" }, { depth: 2, url: "#zugehoerige-commands", title: "Befehle" }]
  }),
  "modules/welcome.mdx": () => Promise.resolve({
    default: PageWelcome,
    frontmatter: { title: "Welcome & Goodbye", description: "Begrüße und verabschiede Mitglieder mit personalisierten Embeds.", icon: "Heart" },
    toc: [{ depth: 2, url: "#variablen", title: "Variablen" }, { depth: 2, url: "#konfiguration", title: "Dashboard Einstellungen" }]
  }),
  "modules/verification.mdx": () => Promise.resolve({
    default: PageVerification,
    frontmatter: { title: "Verifizierung", description: "Sichere deinen Server mit Button-, Captcha- und Passwort-Gates ab.", icon: "CheckCircle" },
    toc: [{ depth: 2, url: "#methoden", title: "Verifizierungs-Arten" }, { depth: 2, url: "#rollen-setup", title: "Rollen-Setup" }]
  }),
  "modules/security.mdx": () => Promise.resolve({
    default: PageSecurity,
    frontmatter: { title: "Server-Sicherheit & Anti-Raid", description: "Mass-Join Schutz, Account-Alter Überprüfung und Notfall-Lockdown.", icon: "ShieldCheck" },
    toc: [{ depth: 2, url: "#security-toggles", title: "Sicherheits-Funktionen" }, { depth: 2, url: "#security-commands", title: "Befehle" }]
  }),
  "modules/roles.mdx": () => Promise.resolve({
    default: PageRoles,
    frontmatter: { title: "Rollen & Reaction Roles", description: "Automatische Beitrittsrollen und interaktive Reaktionsrollen.", icon: "Users" },
    toc: [{ depth: 2, url: "#rollen-funktionen", title: "Funktionen" }, { depth: 2, url: "#rollen-commands", title: "Befehle" }]
  }),
  "modules/level.mdx": () => Promise.resolve({
    default: PageLevel,
    frontmatter: { title: "Leveling & XP", description: "Erfahrungspunkte für Text und Voice mit Rollen-Belohnungen.", icon: "Award" },
    toc: [{ depth: 2, url: "#xp-system", title: "XP-System" }, { depth: 2, url: "#rollen-belohnungen", title: "Rollen-Belohnungen" }, { depth: 2, url: "#level-commands", title: "Commands" }]
  }),
  "modules/tickets.mdx": () => Promise.resolve({
    default: PageTickets,
    frontmatter: { title: "Tickets & Support", description: "Support-Panels mit Buttons und automatischen HTML-Transkripten.", icon: "Ticket" },
    toc: [{ depth: 2, url: "#ticket-funktionen", title: "Funktionen" }, { depth: 2, url: "#ticket-commands", title: "Commands" }]
  }),
  "modules/giveaways.mdx": () => Promise.resolve({
    default: PageGiveaways,
    frontmatter: { title: "Giveaways & Gewinnspiele", description: "Automatisierte Gewinnspiele mit Button-Teilnahme und Rerolls.", icon: "Gift" },
    toc: [{ depth: 2, url: "#giveaway-features", title: "Optionen" }, { depth: 2, url: "#giveaway-commands", title: "Commands" }]
  }),
  "modules/polls.mdx": () => Promise.resolve({
    default: PagePolls,
    frontmatter: { title: "Umfragen (Polls)", description: "Interaktive Abstimmungen mit Live-Ergebnisbalken.", icon: "BarChart3" },
    toc: [{ depth: 2, url: "#umfragen-funktionen", title: "Optionen" }, { depth: 2, url: "#poll-commands", title: "Commands" }]
  }),
  "modules/tempvoice.mdx": () => Promise.resolve({
    default: PageTempVoice,
    frontmatter: { title: "TempVoice / Join to Create", description: "Dynamische Sprachkanäle mit automatischer Löschung und Rechten.", icon: "Mic" },
    toc: [{ depth: 2, url: "#tempvoice-einstellungen", title: "Einstellungen" }, { depth: 2, url: "#tempvoice-commands", title: "Commands" }]
  }),
  "modules/serverstats.mdx": () => Promise.resolve({
    default: PageServerStats,
    frontmatter: { title: "Server-Statistiken", description: "Live-Zählerkanäle für Mitglieder, Bots und Boosts.", icon: "Activity" },
    toc: [{ depth: 2, url: "#zaehler-arten", title: "Zähler-Arten" }, { depth: 2, url: "#stats-commands", title: "Commands" }]
  }),
  "modules/invites.mdx": () => Promise.resolve({
    default: PageInvites,
    frontmatter: { title: "Einladungs-Tracker", description: "Verfolge Beitritte, Fake-Invites und Einladungs-Ranglisten.", icon: "UserPlus" },
    toc: [{ depth: 2, url: "#invite-berechnung", title: "Berechnung" }, { depth: 2, url: "#invite-commands", title: "Commands" }]
  }),
  "modules/autoresponder.mdx": () => Promise.resolve({
    default: PageAutoResponder,
    frontmatter: { title: "Auto-Responder & Automation", description: "Automatische Chat-Antworten und Sticky Messages.", icon: "Bot" },
    toc: [{ depth: 2, url: "#responder-typen", title: "Trigger-Arten" }, { depth: 2, url: "#responder-commands", title: "Commands" }]
  }),
  "modules/inactivekick.mdx": () => Promise.resolve({
    default: PageInactiveKick,
    frontmatter: { title: "Inaktivitäts-Kick", description: "Automatisches Entfernen inaktiver Mitglieder mit Rollenausnahmen.", icon: "UserMinus" },
    toc: [{ depth: 2, url: "#inaktivitaet-einstellungen", title: "Kriterien" }, { depth: 2, url: "#kick-commands", title: "Commands" }]
  }),
  "modules/backups.mdx": () => Promise.resolve({
    default: PageBackups,
    frontmatter: { title: "Server-Backups", description: "Vollständige Sicherung von Rollen, Kanälen und Server-Einstellungen.", icon: "Database" },
    toc: [{ depth: 2, url: "#backup-umfang", title: "Umfang" }, { depth: 2, url: "#backup-commands", title: "Commands" }]
  }),
  "modules/appeals.mdx": () => Promise.resolve({
    default: PageAppeals,
    frontmatter: { title: "Entbannungsanträge (Appeals)", description: "Web-basiertes System für Ban-Appeals mit Team-Entscheidung.", icon: "Scale" },
    toc: [{ depth: 2, url: "#appeals-ablauf", title: "Ablauf & Review" }]
  }),
  "modules/modlog.mdx": () => Promise.resolve({
    default: PageModLog,
    frontmatter: { title: "Audit & ModLogs", description: "Protokollierung von Moderationsfällen mit Case-IDs und Nachrichtenlogs.", icon: "FileText" },
    toc: [{ depth: 2, url: "#log-kategorien", title: "Kategorien" }, { depth: 2, url: "#modlog-commands", title: "Commands" }]
  }),
  "modules/settings.mdx": () => Promise.resolve({
    default: PageSettings,
    frontmatter: { title: "Dashboard Einstellungen", description: "Bot-Präfix, Sprache, Admin-Rollen und Performance-Optionen.", icon: "Settings" },
    toc: [{ depth: 2, url: "#globale-optionen", title: "Optionen" }]
  }),
  "commands/moderation.mdx": () => Promise.resolve({
    default: PageCommandsMod,
    frontmatter: { title: "Moderations-Befehle", description: "Vollständige Referenz aller Moderationsbefehle von Orbit.", icon: "Shield" },
    toc: [{ depth: 2, url: "#ban", title: "/ban" }, { depth: 2, url: "#kick", title: "/kick" }, { depth: 2, url: "#timeout", title: "/timeout" }, { depth: 2, url: "#warn", title: "/warn" }, { depth: 2, url: "#purge", title: "/purge" }]
  }),
  "commands/management.mdx": () => Promise.resolve({
    default: PageCommandsMgmt,
    frontmatter: { title: "Management-Befehle", description: "Befehle zur Einrichtung und Verwaltung deines Servers.", icon: "Sliders" },
    toc: [{ depth: 2, url: "#setup", title: "/setup" }, { depth: 2, url: "#autorole", title: "/autorole" }, { depth: 2, url: "#backup", title: "/backup" }]
  }),
  "commands/community.mdx": () => Promise.resolve({
    default: PageCommandsCommunity,
    frontmatter: { title: "Community-Befehle", description: "Befehle für Ränge, Gewinnspiele, Umfragen und Interaktion.", icon: "Users" },
    toc: [{ depth: 2, url: "#rank", title: "/rank" }, { depth: 2, url: "#leaderboard", title: "/leaderboard" }, { depth: 2, url: "#giveaway", title: "/giveaway" }, { depth: 2, url: "#poll", title: "/poll" }]
  }),
  "commands/info.mdx": () => Promise.resolve({
    default: PageCommandsInfo,
    frontmatter: { title: "Info- & Utility-Befehle", description: "Befehle für Bot-Info, Server-Info, Avatare und Tools.", icon: "Info" },
    toc: [{ depth: 2, url: "#help", title: "/help" }, { depth: 2, url: "#botinfo", title: "/botinfo" }, { depth: 2, url: "#userinfo", title: "/userinfo" }]
  }),
  "commands/admin.mdx": () => Promise.resolve({
    default: PageCommandsAdmin,
    frontmatter: { title: "Admin- & Sicherheits-Befehle", description: "Befehle für Security, Whitelist, Blacklist und Notfälle.", icon: "Lock" },
    toc: [{ depth: 2, url: "#security", title: "/security" }, { depth: 2, url: "#antiraid", title: "/antiraid" }, { depth: 2, url: "#whitelist", title: "/whitelist" }]
  }),

  // Guides Tab
  "guides/index.mdx": () => Promise.resolve({
    default: PageGuidesIndex,
    frontmatter: { title: "Orbit Anleitungen & Guides", description: "Ausführliche Schritt-für-Schritt Guides für deinen Server.", icon: "Compass" },
    toc: [{ depth: 2, url: "#beliebte-guides", title: "Beliebte Anleitungen" }]
  }),
  "guides/server-setup.mdx": () => Promise.resolve({
    default: PageGuideServerSetup,
    frontmatter: { title: "Server-Setup von 0 auf 100", description: "Vollständige Einrichtung deines Discord Servers mit Orbit.", icon: "Layers" },
    toc: [{ depth: 2, url: "#schritt-1-einladung", title: "1. Bot einladen" }, { depth: 2, url: "#schritt-2-rollen", title: "2. Rollenhierarchie" }, { depth: 2, url: "#schritt-3-kanaele", title: "3. Kanäle" }, { depth: 2, url: "#schritt-4-dashboard", title: "4. Dashboard" }]
  }),
  "guides/antiraid-security.mdx": () => Promise.resolve({
    default: PageGuideAntiRaid,
    frontmatter: { title: "Anti-Raid & Server absichern", description: "Optimaler Schutz vor Mass-Joins und Spambots.", icon: "ShieldAlert" },
    toc: [{ depth: 2, url: "#mass-join", title: "Mass-Join Schutz" }, { depth: 2, url: "#account-age", title: "Account Age Gate" }, { depth: 2, url: "#notfall-befehle", title: "Notfallbefehle" }]
  }),
  "guides/tickets-support.mdx": () => Promise.resolve({
    default: PageGuideTickets,
    frontmatter: { title: "Support- & Ticket-System", description: "Professionelles Supportsystem mit HTML-Transkripten.", icon: "Ticket" },
    toc: [{ depth: 2, url: "#panel-erstellen", title: "Panel erstellen" }, { depth: 2, url: "#team-rolle", title: "Team-Rolle" }, { depth: 2, url: "#transkripte", title: "Transkripte" }]
  }),
  "guides/leveling-rewards.mdx": () => Promise.resolve({
    default: PageGuideLeveling,
    frontmatter: { title: "Leveling & Rollen-Belohnungen", description: "XP-Raten und Role Rewards optimal ausbalancieren.", icon: "Award" },
    toc: [{ depth: 2, url: "#xp-balance", title: "XP-Balance" }, { depth: 2, url: "#role-rewards", title: "Rollen-Belohnungen" }, { depth: 2, url: "#level-kanaele", title: "Level-Kanal" }]
  }),
  "guides/tempvoice-channels.mdx": () => Promise.resolve({
    default: PageGuideTempVoice,
    frontmatter: { title: "TempVoice / Join to Create", description: "Dynamische Talk-Kanäle mit automatischer Löschung.", icon: "Mic" },
    toc: [{ depth: 2, url: "#hub-setup", title: "Hub Setup" }, { depth: 2, url: "#owner-rechte", title: "Owner Rechte" }, { depth: 2, url: "#auto-delete", title: "Auto-Delete" }]
  }),
  "guides/automod-moderation.mdx": () => Promise.resolve({
    default: PageGuideAutoMod,
    frontmatter: { title: "Auto-Moderation Masterclass", description: "Wortfilter, Anti-Spam und Schwellenwerte perfekt abstimmen.", icon: "Sliders" },
    toc: [{ depth: 2, url: "#filter-level", title: "Filter Level" }, { depth: 2, url: "#anti-spam", title: "Anti-Spam" }, { depth: 2, url: "#stufenweise-strafen", title: "Stufenweise Strafen" }]
  }),

  // Release Notes Tab
  "releases/index.mdx": () => Promise.resolve({
    default: PageReleasesIndex,
    frontmatter: { title: "Orbit Release Notes", description: "Versionshistorie und Update-Übersicht von Orbit.", icon: "ScrollText" },
    toc: [{ depth: 2, url: "#versions-uebersicht", title: "Aktuelle Versionen" }]
  }),
  "releases/v2-4.mdx": () => Promise.resolve({
    default: PageReleaseV24,
    frontmatter: { title: "Orbit v2.4", description: "0ms Web Dashboard, neuer AutoMod Engine, HTML Transkripte.", icon: "Sparkles" },
    toc: [{ depth: 2, url: "#highlights", title: "Wichtigste Neuerungen" }]
  }),
  "releases/v2-3.mdx": () => Promise.resolve({
    default: PageReleaseV23,
    frontmatter: { title: "Orbit v2.3", description: "TempVoice (Join to Create) und Giveaways mit Rollen-Bedingungen.", icon: "Mic" },
    toc: [{ depth: 2, url: "#features", title: "Neue Features" }]
  }),
  "releases/v2-2.mdx": () => Promise.resolve({
    default: PageReleaseV22,
    frontmatter: { title: "Orbit v2.2", description: "Neues Ticketsystem mit Kategorien und Umfragen mit Prozentbalken.", icon: "Ticket" },
    toc: [{ depth: 2, url: "#features", title: "Neue Features" }]
  }),
  "releases/v2-1.mdx": () => Promise.resolve({
    default: PageReleaseV21,
    frontmatter: { title: "Orbit v2.1", description: "Anti-Raid Shield, Account Age Gate und Notfall-Lockdown.", icon: "Shield" },
    toc: [{ depth: 2, url: "#features", title: "Neue Features" }]
  }),
  "releases/v2-0.mdx": () => Promise.resolve({
    default: PageReleaseV20,
    frontmatter: { title: "Orbit v2.0", description: "Vollständiger Relaunch der Bot-Architektur auf Slash Commands.", icon: "Rocket" },
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


window.__ORBIT_PAGES__ = ORBIT_PAGES;
window.__ORBIT_PAGE_TREE__ = ORBIT_PAGE_TREE;
window.__ORBIT_GUIDES_TREE__ = ORBIT_GUIDES_TREE;
window.__ORBIT_RELEASES_TREE__ = ORBIT_RELEASES_TREE;
window.__ORBIT_SEARCH_INDEX__ = ORBIT_SEARCH_INDEX;
window.__DOCS_TREES__ = {
  docs: ORBIT_PAGE_TREE,
  guides: ORBIT_GUIDES_TREE,
  releases: ORBIT_RELEASES_TREE
};

console.log("[Orbit Docs] Loaded Orbit Documentation, Guides and Release Notes Suite.");
export { ORBIT_PAGES, ORBIT_PAGE_TREE, ORBIT_GUIDES_TREE, ORBIT_RELEASES_TREE, ORBIT_SEARCH_INDEX };
