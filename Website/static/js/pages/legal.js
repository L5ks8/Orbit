/**
 * Orbit Legal Pages (Terms of Service & Privacy Policy)
 * Comprehensive, production-grade legal documentation complying with:
 * - Discord Developer Terms of Service & Developer Policy
 * - General Data Protection Regulation (EU GDPR & UK GDPR)
 * - California Consumer Privacy Act (CCPA / CPRA)
 * - Children's Online Privacy Protection Act (COPPA)
 * 
 * Styled with the unified Orbit Docs design system:
 * - Fumadocs-inspired callouts (info, warning, security) with accent indicator lines
 * - High-legibility typography with generous reading widths ([--fd-layout-width: 1400px])
 * - 100% SVG Lucide icons (Zero emojis)
 * - Interactive Table of Contents, Real-time search, bilingual EN/DE support, and PDF print.
 */

(function() {
  'use strict';

  // State
  let currentLegalLang = localStorage.getItem('orbit_legal_lang') || 'en';

  function setLanguage(lang) {
    currentLegalLang = lang;
    try {
      localStorage.setItem('orbit_legal_lang', lang);
    } catch (_) {}
    const path = window.location.pathname;
    const app = document.getElementById('app');
    if (!app) return;
    if (path.startsWith('/privacy') || path === '/datenschutz') {
      Pages.Privacy(app);
    } else {
      Pages.Terms(app);
    }
  }

  window.setLegalLanguage = setLanguage;

  function copySectionLink(id) {
    const url = window.location.origin + window.location.pathname + '#' + id;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        if (typeof Toast !== 'undefined' && Toast.success) {
          Toast.success(currentLegalLang === 'de' ? 'Link zum Abschnitt kopiert!' : 'Section link copied to clipboard!');
        }
      });
    }
  }
  window.copySectionLink = copySectionLink;

  function filterLegalSections(query) {
    const q = (query || '').toLowerCase().trim();
    const sections = document.querySelectorAll('.legal-section');
    const tocItems = document.querySelectorAll('.toc-item');
    let visibleCount = 0;

    sections.forEach(sec => {
      const text = sec.textContent.toLowerCase();
      const match = !q || text.includes(q);
      sec.style.display = match ? 'block' : 'none';
      if (match) visibleCount++;
    });

    tocItems.forEach(item => {
      const targetId = item.getAttribute('data-target');
      const sec = document.getElementById(targetId);
      if (sec) {
        item.style.display = sec.style.display === 'none' ? 'none' : 'flex';
      }
    });

    const noResults = document.getElementById('legal-no-results');
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }
  window.filterLegalSections = filterLegalSections;

  // Unified Docs Callout Component
  function renderCallout(type, title, text) {
    const configs = {
      info: {
        border: 'border-blue-500/25',
        bg: 'bg-blue-500/[0.04]',
        line: 'bg-blue-500',
        textColor: 'text-blue-400',
        icon: `<svg class="w-5 h-5 shrink-0 text-blue-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`
      },
      warning: {
        border: 'border-amber-500/25',
        bg: 'bg-amber-500/[0.04]',
        line: 'bg-amber-500',
        textColor: 'text-amber-400',
        icon: `<svg class="w-5 h-5 shrink-0 text-amber-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`
      },
      security: {
        border: 'border-emerald-500/25',
        bg: 'bg-emerald-500/[0.04]',
        line: 'bg-emerald-500',
        textColor: 'text-emerald-400',
        icon: `<svg class="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`
      }
    };
    const c = configs[type] || configs.info;
    return `
      <div class="my-5 flex gap-3.5 rounded-xl border ${c.border} ${c.bg} p-4 text-sm text-neutral-300 shadow-sm">
        <div class="w-1 ${c.line} rounded-full shrink-0 my-0.5"></div>
        ${c.icon}
        <div class="flex flex-col gap-1 min-w-0 flex-1">
          ${title ? `<span class="font-semibold text-white text-sm">${title}</span>` : ''}
          <div class="text-neutral-300 text-xs sm:text-sm leading-relaxed">${text}</div>
        </div>
      </div>
    `;
  }

  function getSharedFooter() {
    return `
      <footer class="border-t border-neutral-800 bg-neutral-950 py-16 px-6 mt-20">
        <div class="max-w-[1400px] mx-auto">
          <div class="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div class="col-span-2">
              <div class="flex items-center gap-3 mb-4">
                <img src="/img/logo.png" alt="Orbit" width="32" height="32" class="rounded-xl">
                <span class="text-xl font-bold text-white">Orbit</span>
              </div>
              <p class="text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
                ${currentLegalLang === 'de' 
                  ? 'Der moderne All-in-One Discord Bot für Server-Builder, Community-Leader und Gaming-Netzwerke.' 
                  : 'The modern, all-in-one Discord bot engineered for server builders, community leaders, and gaming networks.'}
              </p>
              <div class="flex items-center gap-4">
                <a href="https://discord.gg/orbit" target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors" aria-label="Discord">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.15em] text-neutral-400 font-medium mb-4">${currentLegalLang === 'de' ? 'Funktionen' : 'Features'}</p>
              <ul class="space-y-3">
                <li><a href="/#features" class="text-sm text-neutral-400 hover:text-white transition-colors">Server Builder</a></li>
                <li><a href="/#features" class="text-sm text-neutral-400 hover:text-white transition-colors">Auto-Mod</a></li>
                <li><a href="/#features" class="text-sm text-neutral-400 hover:text-white transition-colors">Tickets & Appeals</a></li>
                <li><a href="/#pricing" class="text-sm text-neutral-400 hover:text-white transition-colors">Modules</a></li>
              </ul>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.15em] text-neutral-400 font-medium mb-4">Dashboard</p>
              <ul class="space-y-3">
                <li><a href="/dashboard" class="text-sm text-neutral-400 hover:text-white transition-colors">Overview</a></li>
                <li><a href="/dashboard" class="text-sm text-neutral-400 hover:text-white transition-colors">My Servers</a></li>
                <li><a href="/settings" class="text-sm text-neutral-400 hover:text-white transition-colors">Settings</a></li>
              </ul>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.15em] text-neutral-400 font-medium mb-4">${currentLegalLang === 'de' ? 'Rechtliches' : 'Legal'}</p>
              <ul class="space-y-3">
                <li><a href="/privacy" class="text-sm text-neutral-400 hover:text-white transition-colors">${currentLegalLang === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}</a></li>
                <li><a href="/terms" class="text-sm text-neutral-400 hover:text-white transition-colors">${currentLegalLang === 'de' ? 'Nutzungsbedingungen' : 'Terms of Service'}</a></li>
                <li><a href="/status" class="text-sm text-neutral-400 hover:text-white transition-colors">${currentLegalLang === 'de' ? 'System-Status' : 'System Status'}</a></li>
              </ul>
            </div>
          </div>
          <div class="py-6 border-t border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <p>© ${new Date().getFullYear()} Orbit. All rights reserved.</p>
            <p>Not affiliated with Discord Inc.</p>
          </div>
        </div>
      </footer>
    `;
  }

  function getLegalHeader(activeTab) {
    const isDe = currentLegalLang === 'de';
    const isTerms = activeTab === 'terms';

    return `
      <div class="relative overflow-hidden pt-32 pb-16 border-b border-neutral-800/80 bg-gradient-to-b from-neutral-900/40 via-neutral-950 to-neutral-950">
        <!-- Subtle Glow Effects -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none"></div>

        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <!-- Top Badges Row -->
          <div class="flex flex-wrap items-center gap-3 mb-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-medium shadow-sm">
              <svg class="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>${isDe ? 'Offizielle Rechtsdokumentation' : 'Official Legal Documentation'}</span>
            </div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>${isDe ? 'Discord ToS & DSGVO / CCPA Konform' : 'Discord ToS & GDPR / CCPA Compliant'}</span>
            </div>
            <span class="text-xs text-neutral-500 hidden sm:inline">·</span>
            <span class="text-xs text-neutral-400">${isDe ? 'Zuletzt aktualisiert: 25. Oktober 2026 (Version 2.4)' : 'Last Updated: October 25, 2026 (Version 2.4)'}</span>
          </div>

          <!-- Page Title & Description -->
          <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
            <div class="max-w-3xl">
              <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                ${isTerms 
                  ? (isDe ? 'Nutzungsbedingungen' : 'Terms of Service')
                  : (isDe ? 'Datenschutzerklärung' : 'Privacy Policy')
                }
              </h1>
              <p class="text-neutral-400 text-sm sm:text-base leading-relaxed">
                ${isTerms
                  ? (isDe 
                      ? 'Diese Bedingungen regeln die Nutzung des Orbit Discord Bots, des Web Dashboards, der Verifizierungs- und Appeal-Portale sowie aller zugehörigen Dienste.'
                      : 'These Terms govern your use of the Orbit Discord Bot, Web Dashboard, Verification & Appeal Portals, and all related services.')
                  : (isDe
                      ? 'Vollständige Transparenz über die Erhebung, Verarbeitung, Speicherung und Löschung Ihrer Daten gemäß DSGVO (GDPR), UK GDPR und CCPA.'
                      : 'Complete transparency regarding the collection, processing, storage, and deletion of your data under GDPR, UK GDPR, and CCPA.')
                }
              </p>
            </div>

            <!-- Language & Action Controls -->
            <div class="flex flex-wrap items-center gap-3">
              <!-- Language Switcher Pill (Using SVG Icons, No Emojis) -->
              <div class="inline-flex p-1 bg-neutral-900 border border-neutral-800 rounded-xl shadow-sm">
                <button type="button" onclick="setLegalLanguage('en')" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${!isDe ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'}">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>English</span>
                </button>
                <button type="button" onclick="setLegalLanguage('de')" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isDe ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'}">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>Deutsch</span>
                </button>
              </div>

              <!-- Print / PDF Button -->
              <button type="button" onclick="window.print()" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer" title="${isDe ? 'Als PDF drucken oder speichern' : 'Print or save as PDF'}">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                <span>${isDe ? 'Drucken / PDF' : 'Print / PDF'}</span>
              </button>
            </div>
          </div>

          <!-- Quick Navigation Tabs & Real-time Search Bar -->
          <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4 border-t border-neutral-800/60">
            <!-- Document Tabs -->
            <div class="inline-flex p-1 bg-neutral-900 border border-neutral-800 rounded-2xl w-fit shadow-sm">
              <a href="/terms" class="px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${isTerms ? 'bg-white text-neutral-950 shadow-md font-bold' : 'text-neutral-400 hover:text-white'}">
                ${isDe ? 'Nutzungsbedingungen (Terms)' : 'Terms of Service'}
              </a>
              <a href="/privacy" class="px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${!isTerms ? 'bg-white text-neutral-950 shadow-md font-bold' : 'text-neutral-400 hover:text-white'}">
                ${isDe ? 'Datenschutz (Privacy)' : 'Privacy Policy'}
              </a>
            </div>

            <!-- Search In Document -->
            <div class="relative max-w-md w-full">
              <svg class="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="${isDe ? 'Rechtsklausel oder Begriff suchen…' : 'Filter legal clauses or terms…'}" 
                oninput="filterLegalSections(this.value)" 
                class="w-full h-10 pl-10 pr-4 bg-neutral-900 border border-neutral-800 focus:border-neutral-600 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
              >
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TERMS OF SERVICE (ENGLISH & DEUTSCH)
  // ==========================================
  Pages.Terms = function(container) {
    const isDe = currentLegalLang === 'de';

    const sections = isDe ? [
      {
        id: 'tos-sec-1',
        num: '01',
        title: 'Geltungsbereich & Zustimmung zu den Bedingungen',
        badge: 'Grundlegend',
        content: `
          <p class="mb-4">Willkommen bei <strong>Orbit</strong>. Durch das Einladen des Orbit Discord Bots auf einen Server, den Zugriff auf das Web Dashboard (<a href="/" class="text-indigo-400 underline">orbitbot.net</a>), die Nutzung unserer Slash-Befehle oder die Interaktion mit unseren Verifizierungs-, Appeal- oder Ticketsystemen schließen Sie einen rechtsverbindlichen Vertrag mit den Betreibern von Orbit ab.</p>
          <p class="mb-4">Wenn Sie diesen Nutzungsbedingungen („Bedingungen“) nicht zustimmen, dürfen Sie Orbit weder einladen noch in irgendeiner Weise nutzen. Durch die fortgesetzte Nutzung erklären Sie, dass Sie diese Bedingungen vollständig gelesen, verstanden haben und akzeptieren.</p>
          ${renderCallout('info', 'Kurzzusammenfassung (TL;DR):', 'Orbit ist ein Discord-Bot und Server-Management-Tool. Durch die Nutzung stimmen Sie diesen Regeln zu. Wenn Sie nicht einverstanden sind, entfernen Sie den Bot bitte von Ihrem Server.')}
        `
      },
      {
        id: 'tos-sec-2',
        num: '02',
        title: 'Mindestalter & Nutzungsberechtigung',
        badge: 'Altersgrenze',
        content: `
          <p class="mb-4">Sie müssen mindestens <strong>13 Jahre alt</strong> sein (oder das in Ihrem Wohnsitzland geltende Mindestalter für digitale Dienste erreicht haben, z. B. 16 Jahre in bestimmten EU-Mitgliedstaaten), um Orbit zu nutzen.</p>
          <p class="mb-4">Personen unter dem gesetzlichen Mindestalter ist die Nutzung von Orbit strengstens untersagt. Wenn wir Kenntnis davon erlangen, dass ein Nutzer minderjährig im Sinne der Discord-Vorgaben ist, werden dessen Daten und Zugänge unverzüglich gelöscht.</p>
        `
      },
      {
        id: 'tos-sec-3',
        num: '03',
        title: 'Beziehung zu Discord Inc. & API-Konformität',
        badge: 'Discord ToS',
        content: `
          <p class="mb-4">Orbit ist eine unabhängige Drittanbieter-Anwendung. Orbit wird <strong>weder von Discord Inc. betrieben, noch gesponsert, empfohlen oder steht in sonstiger offizieller Verbindung zu Discord Inc.</strong></p>
          <p class="mb-4">Ihre Nutzung von Orbit unterliegt zwingend auch den folgenden offiziellen Discord-Richtlinien:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li><a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline">Discord Nutzungsbedingungen (Terms of Service)</a></li>
            <li><a href="https://discord.com/guidelines" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline">Discord Community-Richtlinien (Community Guidelines)</a></li>
            <li><a href="https://discord.com/developers/docs/policies-and-agreements/developer-terms-of-service" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline">Discord Entwickler-Richtlinien (Developer Terms of Service)</a></li>
          </ul>
          <p>Jegliche Aktivitäten, die gegen die Regeln von Discord verstoßen (z. B. Raids, unautorisiertes Self-Botting, Spamming, Belästigung), führen zum sofortigen Ausschluss von Orbit.</p>
        `
      },
      {
        id: 'tos-sec-4',
        num: '04',
        title: 'Leistungsumfang & Lizenzgewährung',
        badge: 'Lizenz',
        content: `
          <p class="mb-4">Orbit gewährt Ihnen eine persönliche, widerrufliche, nicht-exklusive, nicht übertragbare Lizenz zur Nutzung der Orbit-Dienste für die Verwaltung und Moderation Ihrer Discord-Server.</p>
          <p class="mb-4">Der Leistungsumfang umfasst unter anderem folgende Module:</p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 my-4">
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm">
              <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                <svg class="w-4 h-4 text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>Server Automation & Builder</span>
              </div>
              <p class="text-neutral-400 text-xs leading-relaxed">Automatische Kanaleinrichtung, Rollenhierarchien, Server-Vorlagen und dynamische Server-Statistiken.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm">
              <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                <svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Auto-Moderation Engine</span>
              </div>
              <p class="text-neutral-400 text-xs leading-relaxed">Echtzeit-Regex-Filter, Erkennung unerwünschter Einladungslinks, Anti-Spam, Caps-Lock- und Erwähnungsbegrenzung.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm">
              <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                <svg class="w-4 h-4 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
                <span>Support-Ticket-System</span>
              </div>
              <p class="text-neutral-400 text-xs leading-relaxed">Interaktive Ticket-Panels, automatische Transkripte und Mitarbeiter-Zuweisung.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm">
              <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                <svg class="w-4 h-4 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"/><path d="m16 16 6-6"/></svg>
                <span>Web-Verifizierung & Appeals</span>
              </div>
              <p class="text-neutral-400 text-xs leading-relaxed">Eigenständiges Webportal für Entsperrungsanträge und Captcha-Verifizierung.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm">
              <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                <svg class="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
                <span>Leveling & Leaderboards</span>
              </div>
              <p class="text-neutral-400 text-xs leading-relaxed">Nachrichten- und Voice-XP-Berechnung, Rollenbelohnungen und öffentliche Bestenlisten.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm">
              <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                <svg class="w-4 h-4 text-pink-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                <span>Join-to-Create Voice & Backups</span>
              </div>
              <p class="text-neutral-400 text-xs leading-relaxed">Temporäre Sprachkanäle und Strukturen-Backups zur Serversicherung.</p>
            </div>
          </div>
        `
      },
      {
        id: 'tos-sec-5',
        num: '05',
        title: 'Verantwortung der Server-Administratoren',
        badge: 'Haftung Administrator',
        content: `
          <p class="mb-4">Server-Eigentümer und Administratoren, die Orbit auf ihren Server einladen oder Berechtigungen erteilen, tragen die alleinige Verantwortung für:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li>Die dem Bot zugewiesenen Discord-Berechtigungen (z. B. Administrator, Rollen verwalten, Mitglieder bannen/kicken).</li>
            <li>Die Konfiguration von automatischen Sanktionen (z. B. automatische Timeouts, Kicks oder Banns bei Filter-Treffern).</li>
            <li>Den Schutz von Zugängen und die Zuweisung von Manager-Rollen im Web-Dashboard.</li>
            <li>Die Rechtmäßigkeit der von ihnen eingestellten Wortfilter, Regeln und benutzerdefinierten Antworten.</li>
          </ul>
          ${renderCallout('warning', 'Wichtiger Hinweis für Server-Administratoren:', 'Orbit führt Moderationsmaßnahmen automatisiert basierend auf den von IHNEN gewählten Einstellungen aus. Orbit haftet nicht für unbeabsichtigte Sanktionen, gelöschte Kanäle oder Rollenänderungen, die durch fehlerhafte Einstellungen von Server-Administratoren entstanden sind.')}
        `
      },
      {
        id: 'tos-sec-6',
        num: '06',
        title: 'Zulässige Nutzung & Verbotene Handlungen (AUP)',
        badge: 'Fair Use',
        content: `
          <p class="mb-4">Bei der Nutzung von Orbit sind folgende Handlungen ausdrücklich untersagt:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li><strong>Rechtswidrige Inhalte:</strong> Die Verbreitung von Kinderpornografie (CSAM), Terrorpropaganda, Betrug, Drogenhandel oder Schadsoftware über Orbit-Befehle oder Embeds.</li>
            <li><strong>Missbrauch & Exploits:</strong> Das Ausnutzen von Sicherheitslücken, Race Conditions oder Fehlern im Bot oder Dashboard. Sicherheitslücken sind unverzüglich dem Orbit-Team zu melden.</li>
            <li><strong>Angriffe auf die Infrastruktur:</strong> Durchführung von Denial-of-Service-Angriffen (DDoS), Überlastung der API durch Skripte oder Umgehung unserer Rate-Limits.</li>
            <li><strong>Raids & Massen-Spam:</strong> Der Einsatz des Bots für Raids, koordinierte Massenerwähnungen oder automatisierte Belästigung anderer Discord-Nutzer.</li>
            <li><strong>Umgehung von Sperren:</strong> Das Umgehen von Server-Banns oder Orbit-Blacklists durch Zweitaccounts oder Proxys.</li>
            <li><strong>Reverse Engineering:</strong> Das Dekompilieren, Scraping oder Kopieren geschützter Programmbestandteile ohne vorherige schriftliche Zustimmung.</li>
          </ul>
          <p>Verstöße führen zur sofortigen permanenten Sperre des Nutzers und/oder der betroffenen Discord-Gilde.</p>
        `
      },
      {
        id: 'tos-sec-7',
        num: '07',
        title: 'Funktionsspezifische Bestimmungen',
        badge: 'Module',
        content: `
          <div class="space-y-4 text-sm">
            <div class="border-l-2 border-indigo-500 pl-4 py-1">
              <h4 class="font-bold text-white mb-1">7.1 Auto-Moderation</h4>
              <p class="text-neutral-300 leading-relaxed">Die Auto-Moderation ist ein heuristisches Assistenzsystem. Obwohl sie mit Sub-Millisekunden-Geschwindigkeit arbeitet, garantiert Orbit keine 100%ige Erkennung aller schädlichen Inhalte und schließt Fehlalarme („False Positives“) nicht aus.</p>
            </div>
            <div class="border-l-2 border-indigo-500 pl-4 py-1">
              <h4 class="font-bold text-white mb-1">7.2 Support-Tickets & Transkripte</h4>
              <p class="text-neutral-300 leading-relaxed">In Tickets ausgetauschte Nachrichten verbleiben auf Ihrem Discord-Server. Wenn Transkripte exportiert werden, geschieht dies zur Dokumentation für das Server-Team. Server-Betreiber sind für den vertraulichen Umgang mit Ticket-Inhalten verantwortlich.</p>
            </div>
            <div class="border-l-2 border-indigo-500 pl-4 py-1">
              <h4 class="font-bold text-white mb-1">7.3 Ban-Appeal-Portal & Verifizierung</h4>
              <p class="text-neutral-300 leading-relaxed">Nutzer, die einen Entsperrungsantrag einreichen, verpflichten sich zu wahrheitsgemäßen Angaben. Die Entscheidung über einen Pardon liegt ausschließlich beim jeweiligen Server-Team, nicht bei Orbit.</p>
            </div>
            <div class="border-l-2 border-indigo-500 pl-4 py-1">
              <h4 class="font-bold text-white mb-1">7.4 Leveling & XP-System</h4>
              <p class="text-neutral-300 leading-relaxed">Erreichte Erfahrungspunkte (XP) und Ränge besitzen keinen Geldwert. Server-Eigentümer können XP jederzeit zurücksetzen. Orbit behält sich vor, durch Spam-Bots manipulierte Levelstände zu bereinigen.</p>
            </div>
            <div class="border-l-2 border-indigo-500 pl-4 py-1">
              <h4 class="font-bold text-white mb-1">7.5 Server-Backups</h4>
              <p class="text-neutral-300 leading-relaxed">Server-Backups sichern Kanal- und Rollenstrukturen. Orbit speichert keine privaten Nachrichtenverläufe von Nutzern im Backup. Backups werden ohne Gewähr auf dauerhafte Verfügbarkeit bereitgestellt.</p>
            </div>
          </div>
        `
      },
      {
        id: 'tos-sec-8',
        num: '08',
        title: 'Geistiges Eigentum & Urheberrechte',
        badge: 'Copyright',
        content: `
          <p class="mb-4">Alle Marken, Logos, Software-Codes, Grafiken, Datenbanken und Benutzeroberflächen von Orbit sind das ausschließliche geistige Eigentum der Betreiber von Orbit.</p>
          <p class="mb-4">Von Ihnen bereitgestellte Inhalte (wie benutzerdefinierte Begrüßungstexte, Banner oder Befehlsantworten) verbleiben in Ihrem Eigentum. Sie gewähren Orbit jedoch das weltweite, gebührenfreie Recht, diese Inhalte ausschließlich zur Erbringung der Bot-Dienste auf Ihrem Server zu speichern und anzuzeigen.</p>
        `
      },
      {
        id: 'tos-sec-9',
        num: '09',
        title: 'Verfügbarkeit, Wartung & Leistungsänderungen',
        badge: 'SLA',
        content: `
          <p class="mb-4">Orbit wird <strong>„wie besehen“ („AS IS“) und „nach Verfügbarkeit“ („AS AVAILABLE“)</strong> bereitgestellt. Wir streben eine maximale Uptime an, garantieren jedoch keine ununterbrochene oder fehlerfreie Verfügbarkeit.</p>
          <p class="mb-4">Ausfälle, die auf Störungen des Discord-Gateways, Hosting-Wartungen oder höhere Gewalt zurückzuführen sind, begründen keinen Anspruch auf Schadensersatz.</p>
          <p>Wir behalten uns das Recht vor, Funktionen jederzeit zu aktualisieren, anzupassen oder einzustellen.</p>
        `
      },
      {
        id: 'tos-sec-10',
        num: '10',
        title: 'Kündigung, Ausschluss & Blacklisting',
        badge: 'Beendigung',
        content: `
          <p class="mb-4">Sie können diesen Vertrag jederzeit beenden, indem Sie den Orbit Bot von Ihrem Discord-Server entfernen und das Web Dashboard nicht mehr nutzen.</p>
          <p class="mb-4">Orbit behält sich das Recht vor, den Zugriff für einzelne Nutzer, IP-Adressen oder ganze Discord-Server fristlos zu sperren, wenn:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li>Gegen diese Nutzungsbedingungen oder die Discord Community-Richtlinien verstoßen wird.</li>
            <li>Die Stabilität der Orbit-Infrastruktur durch übermäßige Anfragen gefährdet wird.</li>
            <li>Rechtliche Verpflichtungen oder behördliche Anordnungen dies erfordern.</li>
          </ul>
        `
      },
      {
        id: 'tos-sec-11',
        num: '11',
        title: 'Haftungsausschluss & Haftungsbeschränkung',
        badge: 'Haftung',
        content: `
          <p class="mb-4">Soweit gesetzlich zulässig, schließen die Betreiber von Orbit jegliche Haftung für mittelbare Schäden, Folgeschäden, entgangenen Gewinn, Datenverlust oder Server-Schäden aus.</p>
          <p class="mb-4">Orbit haftet unbeschränkt nur für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit nach den gesetzlichen Vorschriften.</p>
        `
      },
      {
        id: 'tos-sec-12',
        num: '12',
        title: 'Freistellungserklärung (Indemnification)',
        badge: 'Freistellung',
        content: `
          <p class="mb-4">Sie verpflichten sich, Orbit, seine Entwickler, Mitwirkenden und Hosting-Partner von sämtlichen Ansprüchen Dritter freizustellen, die aus Ihrer schuldhaften Verletzung dieser Bedingungen, anwendbaren Rechts oder Rechten Dritter entstehen.</p>
        `
      },
      {
        id: 'tos-sec-13',
        num: '13',
        title: 'Änderungen dieser Nutzungsbedingungen',
        badge: 'Aktualisierungen',
        content: `
          <p class="mb-4">Wir behalten uns vor, diese Nutzungsbedingungen jederzeit an neue rechtliche oder technische Rahmenbedingungen anzupassen. Die jeweils aktuelle Version wird auf dieser Website mit aktuellem Datumsstempel veröffentlicht.</p>
          <p>Bei wesentlichen Änderungen informieren wir die Community über unseren offiziellen Discord-Support-Server. Die fortgesetzte Nutzung nach Inkrafttreten gilt als Zustimmung zu den neuen Bedingungen.</p>
        `
      },
      {
        id: 'tos-sec-14',
        num: '14',
        title: 'Kontakt & Support',
        badge: 'Support',
        content: `
          <p class="mb-4">Bei Fragen zu diesen Nutzungsbedingungen oder Problemen mit Orbit erreichen Sie unser Team über folgende Kanäle:</p>
          <div class="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-sm text-neutral-300">
            <p class="font-bold text-white mb-1.5">Orbit Community & Support Server</p>
            <p class="mb-4 text-neutral-400">Öffnen Sie ein Ticket in unserem Support-Server für sofortige Hilfe:</p>
            <a href="https://discord.gg/orbit" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors text-xs sm:text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              <span>Discord Support Server beitreten</span>
            </a>
          </div>
        `
      }
    ] : [
      {
        id: 'tos-sec-1',
        num: '01',
        title: 'Agreement to Terms & Scope of Application',
        badge: 'Core Terms',
        content: `
          <p class="mb-4">Welcome to <strong>Orbit</strong>. By inviting the Orbit Discord bot to your Discord server, accessing our web dashboard (<a href="/" class="text-indigo-400 underline">orbitbot.net</a>), executing slash commands, or interacting with our verification, support ticket, or appeal portals, you enter into a legally binding contract with the developers and operators of Orbit („we“, „us“, or „our“).</p>
          <p class="mb-4">If you do not agree to these Terms of Service („Terms“), you must not invite, access, or use Orbit. By continuing to use the service, you affirm that you have read, understood, and agreed to be bound by these Terms in full.</p>
          ${renderCallout('info', 'Plain English Summary (TL;DR):', 'Orbit is an all-in-one Discord bot and management suite. Using Orbit means you accept these rules. If you do not agree, simply kick or ban the bot from your server.')}
        `
      },
      {
        id: 'tos-sec-2',
        num: '02',
        title: 'Eligibility & Minimum Age Requirements',
        badge: 'Age Limit',
        content: `
          <p class="mb-4">You must be at least <strong>13 years of age</strong> (or the minimum legal age required in your country of residence to consent to digital services, such as 16 in certain European Union jurisdictions) to use Orbit.</p>
          <p class="mb-4">Use of Orbit by anyone under the legal age threshold is strictly prohibited. If we discover that a user is underage according to Discord policies, their stored records and access privileges will be deleted promptly.</p>
        `
      },
      {
        id: 'tos-sec-3',
        num: '03',
        title: 'Independent Status & Discord Terms Compliance',
        badge: 'Discord ToS',
        content: `
          <p class="mb-4">Orbit is an independent third-party Discord application. Orbit is <strong>not operated, sponsored, endorsed, or officially affiliated with Discord Inc.</strong></p>
          <p class="mb-4">Your usage of Orbit is strictly conditional on full compliance with Discord's governing terms:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li><a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline">Discord Terms of Service</a></li>
            <li><a href="https://discord.com/guidelines" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline">Discord Community Guidelines</a></li>
            <li><a href="https://discord.com/developers/docs/policies-and-agreements/developer-terms-of-service" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline">Discord Developer Terms of Service</a></li>
          </ul>
          <p>Any conduct that breaches Discord's policies (including mass raids, self-botting, spamming, or server harassment) will result in immediate termination of Orbit services.</p>
        `
      },
      {
        id: 'tos-sec-4',
        num: '04',
        title: 'Service Description & License Grant',
        badge: 'License',
        content: `
          <p class="mb-4">Orbit grants you a revocable, non-exclusive, non-transferable, limited license to utilize Orbit and its web interfaces solely for legitimate Discord server administration, community building, and moderation.</p>
          <p class="mb-4">Orbit provides a rich suite of automation and management modules:</p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 my-4">
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm">
              <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                <svg class="w-4 h-4 text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>Server Automation & Builder</span>
              </div>
              <p class="text-neutral-400 text-xs leading-relaxed">Automated channel blueprints, role hierarchies, template presets, and real-time counter channels.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm">
              <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                <svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Auto-Moderation Engine</span>
              </div>
              <p class="text-neutral-400 text-xs leading-relaxed">Sub-millisecond regex scanning, invite link filtering, anti-spam, mention limits, and auto-timeouts.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm">
              <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                <svg class="w-4 h-4 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
                <span>Support Ticket System</span>
              </div>
              <p class="text-neutral-400 text-xs leading-relaxed">Multi-category interactive ticket panels, staff routing, and secure transcript exports.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm">
              <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                <svg class="w-4 h-4 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"/><path d="m16 16 6-6"/></svg>
                <span>Web Verification & Appeals</span>
              </div>
              <p class="text-neutral-400 text-xs leading-relaxed">Dedicated web portal for banned users to request pardons and captcha verification gates.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm">
              <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                <svg class="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
                <span>Leveling & Leaderboards</span>
              </div>
              <p class="text-neutral-400 text-xs leading-relaxed">Message and voice XP progression, role rewards, and web leaderboards.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs sm:text-sm">
              <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                <svg class="w-4 h-4 text-pink-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                <span>Join-to-Create Voice & Backups</span>
              </div>
              <p class="text-neutral-400 text-xs leading-relaxed">Ephemeral auto-created voice rooms and structural template backups.</p>
            </div>
          </div>
        `
      },
      {
        id: 'tos-sec-5',
        num: '05',
        title: 'Server Administrator & Owner Responsibilities',
        badge: 'Admin Duties',
        content: `
          <p class="mb-4">Server owners and authorized administrators who invite Orbit or assign bot roles maintain full responsibility for:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li>Granting appropriate Discord permissions (e.g. Administrator, Manage Roles, Ban Members, Manage Channels).</li>
            <li>Configuring automatic sanctions (e.g. timeout durations, automatic kicks, or permanent bans triggered by AutoMod rules).</li>
            <li>Protecting dashboard login credentials and assigning manager roles strictly to trusted community staff.</li>
            <li>The legality and appropriateness of custom word blacklists, automated responses, and server rule presets.</li>
          </ul>
          ${renderCallout('warning', 'Important Notice for Server Administrators:', 'Orbit executes moderation actions autonomously based on YOUR chosen configuration. Orbit bears no liability for accidental bans, deleted channels, or role demotions resulting from misconfigured settings or rogue staff.')}
        `
      },
      {
        id: 'tos-sec-6',
        num: '06',
        title: 'Acceptable Use Policy (AUP) & Prohibitions',
        badge: 'AUP',
        content: `
          <p class="mb-4">When using Orbit, you agree NOT to engage in any of the following prohibited behaviors:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li><strong>Illegal Activities:</strong> Distributing child sexual abuse material (CSAM), terroristic threats, fraud, narcotics, malware, or stolen credentials via Orbit.</li>
            <li><strong>Exploits & Vulnerabilities:</strong> Exploiting software bugs, race conditions, or logic flaws. Discovered security issues must be responsibly disclosed to the Orbit team immediately.</li>
            <li><strong>Infrastructure Attacks:</strong> Launching Denial of Service (DDoS) attacks, flood-requesting endpoints, or circumventing API rate limiters.</li>
            <li><strong>Raids & Mass Harassment:</strong> Using Orbit to organize or execute server raids, mass pings, or targeted harassment of Discord users.</li>
            <li><strong>Ban & Blacklist Evasion:</strong> Bypassing server bans, verification gates, or Orbit global blacklists using alt accounts or residential proxies.</li>
            <li><strong>Reverse Engineering:</strong> Decompiling, scraping, or stealing private bot assets, codebases, or proprietary API logic.</li>
          </ul>
          <p>Violations result in immediate permanent blacklisting of the user and the affiliated Discord guild.</p>
        `
      },
      {
        id: 'tos-sec-7',
        num: '07',
        title: 'Feature-Specific Terms & Operational Disclaimers',
        badge: 'Modules',
        content: `
          <div class="space-y-4 text-sm">
            <div class="border-l-2 border-indigo-500 pl-4 py-1">
              <h4 class="font-bold text-white mb-1">7.1 Auto-Moderation Engine</h4>
              <p class="text-neutral-300 leading-relaxed">AutoMod is a heuristic helper system. While engineered for sub-millisecond regex processing, Orbit does not guarantee 100% detection of all illicit material, nor can it guarantee total absence of false positive detections.</p>
            </div>
            <div class="border-l-2 border-indigo-500 pl-4 py-1">
              <h4 class="font-bold text-white mb-1">7.2 Support Tickets & Transcripts</h4>
              <p class="text-neutral-300 leading-relaxed">Messages within ticket channels exist within your guild's environment. When transcripts are generated, they are preserved for server audit purposes. Server administrators are responsible for the confidentiality of user disclosures in tickets.</p>
            </div>
            <div class="border-l-2 border-indigo-500 pl-4 py-1">
              <h4 class="font-bold text-white mb-1">7.3 Ban Appeal Portal & Verification Gates</h4>
              <p class="text-neutral-300 leading-relaxed">Users submitting pardon requests agree to provide truthful statements. The ultimate decision to pardon or reject an appeal rests solely with that server's moderation team, not with Orbit developers.</p>
            </div>
            <div class="border-l-2 border-indigo-500 pl-4 py-1">
              <h4 class="font-bold text-white mb-1">7.4 Leveling, XP & Leaderboards</h4>
              <p class="text-neutral-300 leading-relaxed">Experience points (XP) and leaderboard ranks hold no monetary or real-world value. Server owners may reset or adjust XP at any time. Orbit reserves the right to wipe artificial XP generated through automated chat loops.</p>
            </div>
            <div class="border-l-2 border-indigo-500 pl-4 py-1">
              <h4 class="font-bold text-white mb-1">7.5 Server Backups & Templates</h4>
              <p class="text-neutral-300 leading-relaxed">Server backups store structural outlines (channel names, permissions, and roles). Orbit never backs up private chat histories or member DM archives. Backups are offered as a convenience without warranty of eternal storage.</p>
            </div>
          </div>
        `
      },
      {
        id: 'tos-sec-8',
        num: '08',
        title: 'Intellectual Property Rights',
        badge: 'IP Rights',
        content: `
          <p class="mb-4">All trademarks, logos, custom software code, visual styles, artwork, and documentation related to Orbit belong exclusively to Orbit and its authors.</p>
          <p class="mb-4">Content uploaded or configured by you (e.g. welcome banners, custom embeds, server descriptions) remains your property. You grant Orbit a non-exclusive, worldwide, royalty-free license to store, process, and display that content solely to deliver bot features to your server.</p>
        `
      },
      {
        id: 'tos-sec-9',
        num: '09',
        title: 'Service Availability, Modifications & Outages',
        badge: 'Uptime',
        content: `
          <p class="mb-4">Orbit is provided <strong>„AS IS“ and „AS AVAILABLE“</strong>. While we maintain a high-availability infrastructure with redundancy, we do not warrant 100% uptime, uninterrupted service, or instantaneous delivery during Discord API outages.</p>
          <p class="mb-4">Downtime resulting from Discord platform incidents, datacenter maintenance, or force majeure events shall not give rise to any liability or damages.</p>
          <p>We reserve the right to modify, upgrade, or deprecate features at any time without prior liability.</p>
        `
      },
      {
        id: 'tos-sec-10',
        num: '10',
        title: 'Termination, Guild Blacklisting & Access Revocation',
        badge: 'Termination',
        content: `
          <p class="mb-4">You may terminate your agreement with Orbit at any time by kicking the bot from your server and discontinuing web dashboard usage.</p>
          <p class="mb-4">Orbit reserves the right to immediately suspend, blacklist, or terminate access for any user, guild, or IP address if:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li>You breach any provision of these Terms or Discord's Community Guidelines.</li>
            <li>Your server exhibits behavior that threatens the performance or security of Orbit.</li>
            <li>Required by law enforcement or competent regulatory authorities.</li>
          </ul>
        `
      },
      {
        id: 'tos-sec-11',
        num: '11',
        title: 'Disclaimer of Warranties & Limitation of Liability',
        badge: 'Disclaimers',
        content: `
          <p class="mb-4">To the fullest extent permitted by applicable law, Orbit and its maintainers disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.</p>
          <p class="mb-4">In no event shall Orbit be liable for indirect, incidental, special, punitive, or consequential damages, including loss of profits, data loss, server disruptions, or goodwill damages arising out of the use or inability to use Orbit.</p>
        `
      },
      {
        id: 'tos-sec-12',
        num: '12',
        title: 'Indemnification',
        badge: 'Indemnity',
        content: `
          <p class="mb-4">You agree to defend, indemnify, and hold harmless Orbit, its developers, operators, contributors, and hosting providers against any claims, losses, liabilities, costs, and legal fees arising from your use of the bot, your server's content, or your breach of these Terms.</p>
        `
      },
      {
        id: 'tos-sec-13',
        num: '13',
        title: 'Modifications to These Terms',
        badge: 'Updates',
        content: `
          <p class="mb-4">We may update these Terms periodically to reflect operational, legal, or regulatory changes. The latest version will always be accessible at this URL with an updated effective date.</p>
          <p>Material revisions will be announced in our official Discord community server. Your continued use of Orbit following revisions constitutes your acceptance of the updated Terms.</p>
        `
      },
      {
        id: 'tos-sec-14',
        num: '14',
        title: 'Contact Information & Community Support',
        badge: 'Support',
        content: `
          <p class="mb-4">For any inquiries, legal concerns, or technical support regarding these Terms, please contact our support team:</p>
          <div class="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-sm text-neutral-300">
            <p class="font-bold text-white mb-1.5">Orbit Community & Support Server</p>
            <p class="mb-4 text-neutral-400">Open a ticket in our official Discord server for rapid assistance:</p>
            <a href="https://discord.gg/orbit" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors text-xs sm:text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              <span>Join Discord Support Server</span>
            </a>
          </div>
        `
      }
    ];

    container.innerHTML = `
      <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
        ${getLegalHeader('terms')}

        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Table of Contents Sidebar (3 Cols / 25%) -->
            <aside class="hidden lg:block lg:col-span-3 sticky top-28 space-y-4">
              <div class="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xs uppercase tracking-wider text-neutral-400 font-bold">
                    ${isDe ? 'Inhaltsverzeichnis' : 'Table of Contents'}
                  </h3>
                  <span class="text-[11px] font-mono text-neutral-500">${sections.length} ${isDe ? 'Abschnitte' : 'Clauses'}</span>
                </div>
                <nav class="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1" style="scrollbar-width: thin;">
                  ${sections.map(s => `
                    <a href="#${s.id}" data-target="${s.id}" class="toc-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-all group">
                      <span class="w-5 text-[10px] font-mono text-neutral-500 group-hover:text-indigo-400 font-bold">${s.num}</span>
                      <span class="truncate flex-1">${s.title}</span>
                    </a>
                  `).join('')}
                </nav>
              </div>

              <!-- Quick Support Box (Docs Style) -->
              <div class="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs shadow-sm">
                <div class="flex items-center gap-2 font-semibold text-white mb-1.5">
                  <svg class="w-4 h-4 text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span>${isDe ? 'Brauchen Sie rechtliche Auskunft?' : 'Need Legal Support?'}</span>
                </div>
                <p class="text-neutral-400 mb-3 leading-relaxed">${isDe ? 'Unser Support-Team beantwortet Fragen zu unseren Richtlinien gerne auf unserem Discord-Server.' : 'Our team is available on Discord to answer questions regarding our Terms and data processing.'}</p>
                <a href="https://discord.gg/orbit" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold">
                  <span>${isDe ? 'Support-Server öffnen' : 'Open Support Server'}</span>
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
            </aside>

            <!-- Main Content (9 Cols / 75% - Spacious Reading Width) -->
            <main class="lg:col-span-9 space-y-6 min-w-0">
              
              <!-- Quick Overview Card (Fumadocs Card Style) -->
              <div class="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-sm text-neutral-300 space-y-4 leading-relaxed shadow-sm">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-white">${isDe ? 'Auf einen Blick: Die wichtigsten Kernpunkte' : 'Key Highlights at a Glance'}</h3>
                    <p class="text-xs text-neutral-400">${isDe ? 'Wichtige Regeln verständlich zusammengefasst' : 'Essential rules summarized for convenience'}</p>
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div class="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                    <span class="text-white font-semibold block mb-1 text-sm">${isDe ? '1. Nicht mit Discord affiliiert' : '1. Not Affiliated with Discord'}</span>
                    <span class="text-neutral-400 text-xs sm:text-sm leading-relaxed">${isDe ? 'Orbit ist ein eigenständiges Bot-Projekt, das alle Discord-Entwicklerregeln befolgt.' : 'Orbit is an independent bot complying strictly with Discord developer policies.'}</span>
                  </div>
                  <div class="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                    <span class="text-white font-semibold block mb-1 text-sm">${isDe ? '2. Verantwortung des Server-Teams' : '2. Admin Responsibility'}</span>
                    <span class="text-neutral-400 text-xs sm:text-sm leading-relaxed">${isDe ? 'Administratoren bestimmen Auto-Mod-Regeln, Ticket-Rollen und Sanktionen selbst.' : 'Admins are responsible for their assigned permissions, auto-mod filters, and staff access.'}</span>
                  </div>
                  <div class="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                    <span class="text-white font-semibold block mb-1 text-sm">${isDe ? '3. Kein Missbrauch & kein Raid' : '3. Zero Abuse Tolerance'}</span>
                    <span class="text-neutral-400 text-xs sm:text-sm leading-relaxed">${isDe ? 'Exploits, DDoS, Massen-Spam oder Raids führen zur sofortigen permanenten Sperrung.' : 'Exploiting, raiding, spamming, or attacking the API leads to immediate blacklisting.'}</span>
                  </div>
                  <div class="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                    <span class="text-white font-semibold block mb-1 text-sm">${isDe ? '4. Bereitstellung ohne Gewähr' : '4. As-Is Provision'}</span>
                    <span class="text-neutral-400 text-xs sm:text-sm leading-relaxed">${isDe ? 'Orbit wird ohne Garantie auf 100%ige Verfügbarkeit bei externen Discord-Ausfällen bereitgestellt.' : 'Orbit is provided as-is without warranty for downtime caused by external Discord outages.'}</span>
                  </div>
                </div>
              </div>

              <!-- Filter No Results Indicator -->
              <div id="legal-no-results" class="hidden p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-400">
                <svg class="w-8 h-8 text-neutral-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                ${isDe ? 'Keine Abschnitte passend zu Ihrem Suchbegriff gefunden.' : 'No clauses match your search query.'}
              </div>

              <!-- Clause Cards (Spacious, Beautiful Docs Typography) -->
              ${sections.map(s => `
                <section id="${s.id}" class="legal-section p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700/80 transition-all scroll-mt-28 shadow-sm">
                  <div class="flex items-start justify-between gap-4 mb-4">
                    <div class="flex items-center gap-3">
                      <span class="flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700/60 text-xs font-mono font-bold text-indigo-400 shrink-0">
                        ${s.num}
                      </span>
                      <div>
                        <h2 class="text-base sm:text-xl font-bold text-white tracking-tight">${s.title}</h2>
                        <span class="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">${s.badge}</span>
                      </div>
                    </div>
                    <button type="button" onclick="copySectionLink('${s.id}')" class="p-2 text-neutral-500 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer" title="${isDe ? 'Link zu diesem Abschnitt kopieren' : 'Copy link to this section'}">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </button>
                  </div>
                  <div class="text-sm sm:text-[15px] text-neutral-300 leading-relaxed pt-2">
                    ${s.content}
                  </div>
                </section>
              `).join('')}

            </main>
          </div>
        </div>

        ${getSharedFooter()}
      </div>
    `;
  };

  // ==========================================
  // PRIVACY POLICY (ENGLISH & DEUTSCH)
  // ==========================================
  Pages.Privacy = function(container) {
    const isDe = currentLegalLang === 'de';

    const sections = isDe ? [
      {
        id: 'priv-sec-1',
        num: '01',
        title: 'Verantwortliche Stelle & Einführung',
        badge: 'DSGVO Art. 4',
        content: `
          <p class="mb-4">Die Sicherheit und Vertraulichkeit Ihrer personenbezogenen Daten hat für <strong>Orbit</strong> oberste Priorität. Diese Datenschutzerklärung informiert Sie ausführlich darüber, welche Daten bei der Nutzung des Orbit Discord Bots, unserer Web-Dienste und des Dashboards erhoben werden, zu welchen Zwecken sie verarbeitet werden und welche Rechte Ihnen nach der <strong>Europäischen Datenschutz-Grundverordnung (DSGVO)</strong>, dem <strong>UK Data Protection Act</strong> sowie dem <strong>California Consumer Privacy Act (CCPA/CPRA)</strong> zustehen.</p>
          <p class="mb-4">Verantwortlicher Betreiber für die Datenverarbeitung ist das Orbit-Entwicklerteam. Für Datenschutzfragen und Betroffenenanfragen steht unser Datenschutz-Support auf unserem offiziellen Discord-Server bereit.</p>
        `
      },
      {
        id: 'priv-sec-2',
        num: '02',
        title: 'Rechtsgrundlagen der Datenverarbeitung (DSGVO Art. 6)',
        badge: 'Rechtsgrundlagen',
        content: `
          <p class="mb-4">Die Verarbeitung personenbezogener Daten durch Orbit erfolgt ausschließlich auf Basis der gesetzlichen Rechtsgrundlagen nach Art. 6 Abs. 1 DSGVO:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li><strong>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO):</strong> Zur Bereitstellung der von Server-Eigentümern und Mitgliedern angeforderten Bot-Funktionen (z. B. Ticket-Erstellung, Rollenvergabe, XP-Berechnung, Web-Dashboard-Authentifizierung).</li>
            <li><strong>Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO):</strong> Gewährleistung der Server-Sicherheit, Abwehr von Raids und Spam, Auto-Moderation, Schutz vor Missbrauch und DDoS-Angriffen sowie Optimierung unserer Systemleistung.</li>
            <li><strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO):</strong> Freiwillige Angaben in Ban-Appeal-Formularen oder benutzerdefinierten Einstellungen.</li>
            <li><strong>Rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO):</strong> Erfüllung gesetzlicher Auskunfts- oder Aufbewahrungspflichten gegenüber Strafverfolgungsbehörden.</li>
          </ul>
        `
      },
      {
        id: 'priv-sec-3',
        num: '03',
        title: 'Welche Daten Orbit erhebt und verarbeitet',
        badge: 'Datenerhebung',
        content: `
          <p class="mb-4">Orbit verfolgt den Grundsatz der <strong>Datenminimierung (Art. 5 Abs. 1 lit. c DSGVO)</strong>. Es werden nur die Daten erhoben, die für den Betrieb der gewünschten Funktionen technisch zwingend erforderlich sind.</p>
          
          <div class="overflow-x-auto my-5 border border-neutral-800 rounded-xl bg-neutral-900/30">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-neutral-900/90 text-neutral-300 border-b border-neutral-800 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="px-4 py-3.5">Datenkategorie</th>
                  <th class="px-4 py-3.5">Genaue Datenpunkte</th>
                  <th class="px-4 py-3.5">Zweck der Verarbeitung</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-800/60 text-neutral-300">
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Discord-Benutzerdaten</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">Snowflake-ID (User ID), Benutzername, Avatar-Hash, Global Name</td>
                  <td class="px-4 py-3.5">Zuordnung von Level-XP, Rollen, Dashboard-Login und Verifizierung.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Server- & Gildendaten</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">Guild-ID, Server-Name, Rollen-IDs, Kanal-IDs, Berechtigungs-Bits</td>
                  <td class="px-4 py-3.5">Speicherung von Modul-Konfigurationen und Server-Builder-Strukturen.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Echtzeit-Nachrichteninhalte</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">Text der Nachricht (flüchtig im Arbeitsspeicher)</td>
                  <td class="px-4 py-3.5">Nur zur Ausführung von Auto-Mod-Regeln (<5ms). <strong>Keine dauerhafte Speicherung von Chat-Nachrichten!</strong></td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Support-Tickets & Transkripte</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">Ticket-Kanal, Ersteller-ID, Bearbeiter-ID, Text-Transkript</td>
                  <td class="px-4 py-3.5">Dokumentation von Kundensupport-Fällen für das jeweilige Server-Team.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Ban-Appeals (Entsperrung)</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">Bann-Grund, Rechtfertigungstext, Discord-Tag, Antragszeit</td>
                  <td class="px-4 py-3.5">Prüfung von Entsperrungsanträgen durch Server-Moderatoren.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Gamification / Leveling</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">XP-Zähler, Level-Zahl, Nachrichten-Zähler, Bestenlisten-Rang</td>
                  <td class="px-4 py-3.5">Berechnung von Level-Aufstiegen und öffentlichen Ranglisten.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Web-Dashboard & Session</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">Session-Cookie (<span class="font-mono text-indigo-400">orbit_session</span>), Zeitzone, Sprache</td>
                  <td class="px-4 py-3.5">Sichere Benutzerauthentifizierung und Speicherung von Anzeigeoptionen.</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        id: 'priv-sec-4',
        num: '04',
        title: 'Speicherdauer & Automatisierte Löschfristen',
        badge: 'Löschfristen',
        content: `
          <p class="mb-4">Personenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen Verarbeitungszweck erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen:</p>
          
          <div class="overflow-x-auto my-5 border border-neutral-800 rounded-xl bg-neutral-900/30">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-neutral-900/90 text-neutral-300 border-b border-neutral-800 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="px-4 py-3.5">Bereich</th>
                  <th class="px-4 py-3.5">Reguläre Aufbewahrungsdauer</th>
                  <th class="px-4 py-3.5">Löschungs-Trigger / Mechanismus</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-800/60 text-neutral-300">
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Gilden-Konfigurationen</td>
                  <td class="px-4 py-3.5">Dauer der Bot-Anwesenheit</td>
                  <td class="px-4 py-3.5">Wird <strong>30 Tage</strong> nach Entfernen des Bots von der Gilde unwiderruflich gelöscht.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">User-XP & Level-Daten</td>
                  <td class="px-4 py-3.5">Dauer der Mitgliedschaft</td>
                  <td class="px-4 py-3.5">Auf Anfrage über unser Support-Team oder bei Server-Daten-Reset durch den Eigentümer sofort gelöscht.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Moderations-Protokolle</td>
                  <td class="px-4 py-3.5">Server-Audit-Zeitraum</td>
                  <td class="px-4 py-3.5">Löschbar durch Server-Staff oder automatische Bereinigung.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Ban-Appeals</td>
                  <td class="px-4 py-3.5">Maximal 90 Tage nach Fallabschluss</td>
                  <td class="px-4 py-3.5">Automatisches Purging nach Ablauf von 90 Tagen.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Web-Dashboard Sessions</td>
                  <td class="px-4 py-3.5">7 Tage</td>
                  <td class="px-4 py-3.5">Automatischer Verfall nach 7 Tagen oder sofort beim Klick auf „Sign out“.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Server-Zugriffs-Logs (IPs)</td>
                  <td class="px-4 py-3.5">7 bis 14 Tage</td>
                  <td class="px-4 py-3.5">Automatische Protokollrotation zur Abwehr von DDoS-Angriffen.</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        id: 'priv-sec-5',
        num: '05',
        title: 'Weitergabe an Dritte & Auftragsverarbeiter',
        badge: 'Auftragsverarbeiter',
        content: `
          <p class="mb-4"><strong>Orbit verkauft, vermietet oder handelt niemals mit Ihren personenbezogenen Daten.</strong> Es findet kein Profiling zu Werbezwecken statt.</p>
          <p class="mb-4">Zur Bereitstellung unserer Infrastruktur setzen wir ausgewählte, hochsichere Dienstleister (Auftragsverarbeiter) ein:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li><strong>Discord Inc. (USA):</strong> Als Plattformbetreiber für den Empfang von Gateway-Events, REST-API-Befehlen und OAuth2-Authentifizierung. Es gelten die Discord Developer Data Protection Agreements.</li>
            <li><strong>MongoDB Inc. (Atlas Cloud):</strong> Verschlüsselte Datenbank-Cluster zur Speicherung von Server-Einstellungen und Session-Informationen.</li>
            <li><strong>Cloudflare Inc. / Datacenter:</strong> Bereitstellung von SSL/TLS-Zertifikaten, DDoS-Schutz und Auslieferung statischer Web-Dateien.</li>
          </ul>
        `
      },
      {
        id: 'priv-sec-6',
        num: '06',
        title: 'Cookies & Lokale Speicherrichtlinie',
        badge: 'Cookies',
        content: `
          <p class="mb-4">Orbit verwendet ausschließlich technisch zwingend notwendige Cookies und lokale Speicherobjekte (LocalStorage). Wir setzen <strong>keine Tracking-, Werbe- oder Marketing-Cookies</strong> von Drittanbietern ein.</p>
          <div class="space-y-2.5 text-xs sm:text-sm mb-4">
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span class="font-mono text-indigo-400 font-bold">orbit_session</span>
              <p class="text-neutral-400 mt-1 leading-relaxed">Verschlüsseltes HTTP-only Cookie zur Aufrechterhaltung Ihrer Login-Sitzung im Web-Dashboard. Läuft nach 7 Tagen ab.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span class="font-mono text-indigo-400 font-bold">orbit_cookie_consent</span>
              <p class="text-neutral-400 mt-1 leading-relaxed">Speichert die Bestätigung des Cookie-Hinweises in Ihrem Browser.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span class="font-mono text-indigo-400 font-bold">orbit_lang & orbit_tz</span>
              <p class="text-neutral-400 mt-1 leading-relaxed">Speichert Ihre gewählte Sprache und Zeitzone für die korrekte Zeitanzeige im Dashboard.</p>
            </div>
          </div>
        `
      },
      {
        id: 'priv-sec-7',
        num: '07',
        title: 'Technische & Organisatorische Sicherheitsmaßnahmen (TOMs)',
        badge: 'Sicherheit',
        content: `
          <p class="mb-4">Wir schützen Ihre Daten durch modernste technische und organisatorische Maßnahmen nach Art. 32 DSGVO:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li><strong>Verschlüsselung in der Übertragung:</strong> Alle Web- und API-Verbindungen sind lückenlos mit TLS 1.3 / HTTPS verschlüsselt.</li>
            <li><strong>Datenbank-Sicherheit:</strong> Streng isolierte MongoDB-Verbindungen mit IP-Whitelisting und Credential-Tresoren.</li>
            <li><strong>Rollenbasierter Zugriff (RBAC):</strong> Server-Dashboards sind nur für authentifizierte Server-Eigentümer oder explizit berechtigte Administratoren einsehbar.</li>
            <li><strong>Minimaler Berechtigungsumfang:</strong> Der OAuth2-Login erfordert ausschließlich die Identitätsabfrage (<span class="font-mono text-neutral-400">identify</span>, <span class="font-mono text-neutral-400">guilds</span>) – Orbit fordert niemals Zugriff auf Ihre privaten Direktnachrichten oder Passwörter an.</li>
          </ul>
        `
      },
      {
        id: 'priv-sec-8',
        num: '08',
        title: 'Ihre Rechte nach der DSGVO & dem UK Data Protection Act',
        badge: 'Ihre Rechte',
        content: `
          <p class="mb-4">Als betroffene Person stehen Ihnen nach der DSGVO umfassende Rechte zu:</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm mb-4">
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <strong class="text-white block mb-1">Auskunftsrecht (Art. 15 DSGVO)</strong>
              Sie können jederzeit eine Bestätigung und Auskunft über die zu Ihrer Person verarbeiteten Daten verlangen.
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <strong class="text-white block mb-1">Recht auf Berichtigung (Art. 16 DSGVO)</strong>
              Sie haben das Recht auf Berichtigung unrichtiger Daten oder Vervollständigung unvollständiger Angaben.
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <strong class="text-white block mb-1">Recht auf Löschung (Art. 17 DSGVO)</strong>
              Sie können die unverzügliche Löschung („Recht auf Vergessenwerden“) Ihrer bei uns gespeicherten Daten verlangen.
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <strong class="text-white block mb-1">Recht auf Datenübertragbarkeit (Art. 20)</strong>
              Sie können Ihre Daten in einem strukturierten, gängigen JSON-Format anfordern.
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <strong class="text-white block mb-1">Einschränkung der Verarbeitung (Art. 18)</strong>
              Recht auf Einschränkung der Verarbeitung bei bestrittener Richtigkeit.
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <strong class="text-white block mb-1">Beschwerderecht (Art. 77 DSGVO)</strong>
              Recht auf Beschwerde bei einer Datenschutzaufsichtsbehörde (z. B. BfDI oder Landesdatenschutzbeauftragter).
            </div>
          </div>
        `
      },
      {
        id: 'priv-sec-9',
        num: '09',
        title: 'Rechte von Einwohnern Kaliforniens (CCPA / CPRA Notice)',
        badge: 'CCPA / CPRA',
        content: `
          <p class="mb-4">Gemäß dem California Consumer Privacy Act (CCPA) und dem California Privacy Rights Act (CPRA) haben Einwohner Kaliforniens das Recht zu erfahren, welche persönlichen Informationen gesammelt werden, und deren Löschung zu verlangen.</p>
          ${renderCallout('security', 'Kein Verkauf von Daten (Do Not Sell My Info):', 'Orbit verkauft oder teilt keine persönlichen Daten von Nutzern für kommerzielle Zwecke oder verhaltensbasierte Werbung. Sie werden bei der Ausübung Ihrer CCPA-Rechte in keiner Weise diskriminiert.')}
        `
      },
      {
        id: 'priv-sec-10',
        num: '10',
        title: 'Minderjährigenschutz & COPPA',
        badge: 'Minderjährige',
        content: `
          <p class="mb-4">Orbit richtet sich nicht an Personen unter 13 Jahren (bzw. dem jeweiligen nationalen Mindestalter). Wir erheben wissentlich keine personenbezogenen Daten von Kindern.</p>
          <p>Sollten Eltern oder Erziehungsberechtigte feststellen, dass ein Kind ohne ihre Zustimmung Orbit nutzt, bitten wir um Kontaktaufnahme zur sofortigen Löschung der Datensätze.</p>
        `
      },
      {
        id: 'priv-sec-11',
        num: '11',
        title: 'Anleitung zur Datenlöschung & Datenexport',
        badge: 'Löschung / Export',
        content: `
          <p class="mb-4">Wir machen es Ihnen einfach, von Ihrem Recht auf Datenlöschung Gebrauch zu machen:</p>
          <div class="space-y-3.5 text-xs sm:text-sm mb-4">
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span class="font-bold text-white block mb-1">Schritt 1: Support-Ticket eröffnen</span>
              <p class="text-neutral-400 leading-relaxed">Treten Sie unserem offiziellen <a href="https://discord.gg/orbit" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline">Support-Server</a> bei und eröffnen Sie ein Datenschutz- bzw. Lösch-Ticket unter Angabe Ihrer 18-stelligen Discord Snowflake-ID.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span class="font-bold text-white block mb-1">Schritt 2: Server-Daten & Dashboard</span>
              <p class="text-neutral-400 leading-relaxed">Server-Eigentümer können serverbezogene Daten direkt im Dashboard verwalten oder zurücksetzen. Nach dem Entfernen des Bots von einem Server werden alle Gildenkonfigurationen nach 30 Tagen automatisch unwiderruflich gelöscht.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span class="font-bold text-white block mb-1">Schritt 3: Bestätigung innerhalb von 30 Tagen</span>
              <p class="text-neutral-400 leading-relaxed">Gemäß Art. 12 Abs. 3 DSGVO werden alle verifizierten Löschanfragen innerhalb von maximal 30 Tagen vollständig aus sämtlichen Primärdatenbanken entfernt.</p>
            </div>
          </div>
        `
      },
      {
        id: 'priv-sec-12',
        num: '12',
        title: 'Änderungen dieser Datenschutzerklärung',
        badge: 'Aktualisierungen',
        content: `
          <p class="mb-4">Wir behalten uns das Recht vor, diese Datenschutzerklärung anzupassen, um stets den aktuellen rechtlichen Anforderungen zu entsprechen oder Änderungen unserer Funktionen abzubilden.</p>
          <p>Für Ihren erneuten Besuch gilt stets die jeweils aktuelle Datenschutzerklärung.</p>
        `
      },
      {
        id: 'priv-sec-13',
        num: '13',
        title: 'Datenschutz-Kontakt & Anfragen',
        badge: 'Kontakt',
        content: `
          <p class="mb-4">Für alle Fragen zum Datenschutz, Auskunftsersuchen oder Löschanträge wenden Sie sich bitte an:</p>
          <div class="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-sm text-neutral-300">
            <p class="font-bold text-white mb-1.5">Orbit Data Protection Support</p>
            <p class="mb-4 text-neutral-400">Erreichbar über unseren offiziellen Discord-Support-Server:</p>
            <a href="https://discord.gg/orbit" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors text-xs sm:text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              <span>Datenschutz-Ticket auf Discord eröffnen</span>
            </a>
          </div>
        `
      }
    ] : [
      {
        id: 'priv-sec-1',
        num: '01',
        title: 'Introduction & Data Controller Identification',
        badge: 'GDPR Art. 4',
        content: `
          <p class="mb-4">Your privacy and data rights are fundamental to <strong>Orbit</strong>. This Privacy Policy outlines with complete clarity what personal information is collected when you invite or interact with the Orbit Discord Bot, visit our web properties (<a href="/" class="text-indigo-400 underline">orbitbot.net</a>), or access our dashboard, tickets, and appeal systems.</p>
          <p class="mb-4">This policy complies strictly with the <strong>European Union General Data Protection Regulation (EU GDPR)</strong>, the <strong>United Kingdom Data Protection Act (UK GDPR)</strong>, the <strong>California Consumer Privacy Act (CCPA / CPRA)</strong>, and <strong>Discord Developer Data Policies</strong>.</p>
          <p>The data controller responsible for processing is the Orbit Development Team. Data inquiries may be directed to our privacy team via our verified Discord community support server.</p>
        `
      },
      {
        id: 'priv-sec-2',
        num: '02',
        title: 'Lawful Bases for Processing (GDPR Article 6)',
        badge: 'Legal Bases',
        content: `
          <p class="mb-4">Under GDPR Article 6, every processing operation conducted by Orbit relies on a defined lawful basis:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li><strong>Contractual Necessity (Art. 6(1)(b) GDPR):</strong> Required to deliver bot commands, guild setups, support tickets, role distribution, leveling metrics, and authenticated dashboard access requested by users and server managers.</li>
            <li><strong>Legitimate Interests (Art. 6(1)(f) GDPR):</strong> Enforcing auto-moderation filters, defending servers against raid attacks, rate limiting, bot protection, and maintaining the stability and security of our high-throughput backend.</li>
            <li><strong>Consent (Art. 6(1)(a) GDPR):</strong> Freely given when submitting voluntary ban appeals or configuring custom guild embeds.</li>
            <li><strong>Legal Obligation (Art. 6(1)(c) GDPR):</strong> Adhering to applicable legal mandates and law enforcement disclosure orders.</li>
          </ul>
        `
      },
      {
        id: 'priv-sec-3',
        num: '03',
        title: 'What Personal Data Orbit Collects & Why',
        badge: 'Data Categories',
        content: `
          <p class="mb-4">Orbit adheres to the principle of <strong>Data Minimization (GDPR Art. 5(1)(c))</strong>. We only collect the minimal identifiers essential to operate the features you enable.</p>
          
          <div class="overflow-x-auto my-5 border border-neutral-800 rounded-xl bg-neutral-900/30">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-neutral-900/90 text-neutral-300 border-b border-neutral-800 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="px-4 py-3.5">Data Category</th>
                  <th class="px-4 py-3.5">Specific Data Points</th>
                  <th class="px-4 py-3.5">Operational Purpose</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-800/60 text-neutral-300">
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Discord Identity Data</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">Snowflake User ID, Username, Avatar Hash, Global Display Name</td>
                  <td class="px-4 py-3.5">User level tracking, verification gate authentication, and dashboard session mapping.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Guild & Hierarchy Data</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">Guild ID, Server Name, Channel IDs, Role IDs, Permission Flags</td>
                  <td class="px-4 py-3.5">Preserving server builder blueprints, auto-mod channel rules, and staff role permissions.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Real-Time Chat Messages</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">Ephemeral message text (processed in RAM only)</td>
                  <td class="px-4 py-3.5">Evaluated in <5ms against regex word filters to block invites and toxicity. <strong>Messages are never permanently stored or sold.</strong></td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Support Tickets & Transcripts</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">Ticket channel ID, creator ID, claimed staff ID, transcript text</td>
                  <td class="px-4 py-3.5">Audit logging and customer support documentation for the respective server administration.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Ban Appeal Submissions</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">Ban reason, justification statement, applicant tag, submission date</td>
                  <td class="px-4 py-3.5">Review and adjudication of pardon requests by server moderation staff.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Leveling & XP Activity</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">XP points, current level, messages-sent counter, leaderboard position</td>
                  <td class="px-4 py-3.5">Calculating gamification milestones, level-up notifications, and public web rankings.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Web Dashboard Session</td>
                  <td class="px-4 py-3.5 font-mono text-xs text-neutral-400">Encrypted token (<span class="font-mono text-indigo-400">orbit_session</span>), selected language, timezone</td>
                  <td class="px-4 py-3.5">Managing active browser login state and localized timestamp rendering.</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        id: 'priv-sec-4',
        num: '04',
        title: 'Data Retention Periods & Automated Purge Schedules',
        badge: 'Retention',
        content: `
          <p class="mb-4">Data is retained exclusively for as long as needed to fulfill operational requirements or satisfy legal compliance standards:</p>
          
          <div class="overflow-x-auto my-5 border border-neutral-800 rounded-xl bg-neutral-900/30">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-neutral-900/90 text-neutral-300 border-b border-neutral-800 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th class="px-4 py-3.5">Data Record</th>
                  <th class="px-4 py-3.5">Standard Retention Duration</th>
                  <th class="px-4 py-3.5">Purge Trigger / Mechanism</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-800/60 text-neutral-300">
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Guild Configurations</td>
                  <td class="px-4 py-3.5">Active life of the guild with bot</td>
                  <td class="px-4 py-3.5">Automatically purged <strong>30 days</strong> following bot removal from the server.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">User XP & Progression</td>
                  <td class="px-4 py-3.5">Duration of user presence in guild</td>
                  <td class="px-4 py-3.5">Purged upon server data reset or verified request to our support team.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Moderation Case Logs</td>
                  <td class="px-4 py-3.5">Guild audit retention window</td>
                  <td class="px-4 py-3.5">Deletable by guild managers or purged during guild data wipes.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Ban Appeal Records</td>
                  <td class="px-4 py-3.5">Up to 90 days following decision</td>
                  <td class="px-4 py-3.5">Automatically rotated and purged 90 days after review.</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Dashboard Sessions</td>
                  <td class="px-4 py-3.5">7 days</td>
                  <td class="px-4 py-3.5">Expires automatically after 7 days or immediately upon clicking "Sign out".</td>
                </tr>
                <tr>
                  <td class="px-4 py-3.5 font-bold text-white">Access Logs (IPs)</td>
                  <td class="px-4 py-3.5">7 to 14 days</td>
                  <td class="px-4 py-3.5">Rotated and permanently destroyed for DDoS and rate-limit defense.</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        id: 'priv-sec-5',
        num: '05',
        title: 'Third-Party Sub-Processors & Data Sharing',
        badge: 'Processors',
        content: `
          <p class="mb-4"><strong>Orbit will never sell, rent, monetize, or trade your personal data to advertisers or data brokers.</strong></p>
          <p class="mb-4">To deliver our high-speed, 24/7 service, we engage trusted technical sub-processors under rigorous Data Processing Agreements (DPAs):</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li><strong>Discord Inc. (United States):</strong> Platform API provider for Gateway connection, command routing, and OAuth2 login authentication.</li>
            <li><strong>MongoDB Inc. (Atlas Cloud Datacenters):</strong> Managed cloud database infrastructure with end-to-end encryption for guild settings and session persistence.</li>
            <li><strong>Cloudflare Inc. / Datacenter Providers:</strong> DNS routing, SSL/TLS security termination, and DDoS mitigation.</li>
          </ul>
        `
      },
      {
        id: 'priv-sec-6',
        num: '06',
        title: 'Cookie & Browser Storage Policy',
        badge: 'Cookies',
        content: `
          <p class="mb-4">Orbit employs strictly essential cookies and local storage tokens. We do not use third-party analytics trackers, advertising beacons, or profiling cookies.</p>
          <div class="space-y-2.5 text-xs sm:text-sm mb-4">
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span class="font-mono text-indigo-400 font-bold">orbit_session</span>
              <p class="text-neutral-400 mt-1 leading-relaxed">Encrypted HTTP-only cookie maintaining your dashboard session. Automatically expires after 7 days.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span class="font-mono text-indigo-400 font-bold">orbit_cookie_consent</span>
              <p class="text-neutral-400 mt-1 leading-relaxed">Remembers your acknowledgment of our essential cookie notice.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span class="font-mono text-indigo-400 font-bold">orbit_lang & orbit_tz</span>
              <p class="text-neutral-400 mt-1 leading-relaxed">Stores your preferred UI language and detected/selected timezone for accurate timestamps.</p>
            </div>
          </div>
        `
      },
      {
        id: 'priv-sec-7',
        num: '07',
        title: 'Technical & Organizational Security Measures (TOMs)',
        badge: 'Security',
        content: `
          <p class="mb-4">In accordance with GDPR Article 32, Orbit implements robust technical safeguards to ensure data integrity:</p>
          <ul class="list-disc pl-5 space-y-2 mb-4 text-sm text-neutral-300">
            <li><strong>End-to-End Transport Encryption:</strong> All HTTP traffic is protected by TLS 1.3 encryption.</li>
            <li><strong>Network Isolation:</strong> MongoDB clusters run inside secured private networks with strict IP whitelisting.</li>
            <li><strong>Role-Based Access Control (RBAC):</strong> Dashboard access is strictly gated; guild settings can only be accessed by authenticated guild administrators.</li>
            <li><strong>Minimal Scopes:</strong> OAuth2 authentication requests only minimal identity permissions (<span class="font-mono text-neutral-400">identify</span> and <span class="font-mono text-neutral-400">guilds</span>). Orbit never requests access to your private DMs, email, or passwords.</li>
          </ul>
        `
      },
      {
        id: 'priv-sec-8',
        num: '08',
        title: 'Your Rights under GDPR & UK Data Protection Act',
        badge: 'Your Rights',
        content: `
          <p class="mb-4">As a data subject located in the EEA or UK, you possess explicit legal rights under GDPR:</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm mb-4">
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <strong class="text-white block mb-1">Right to Access (Art. 15 GDPR)</strong>
              You may request a complete report of all personal data maintained by Orbit regarding your account.
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <strong class="text-white block mb-1">Right to Rectification (Art. 16 GDPR)</strong>
              You have the right to correct any inaccurate or incomplete personal records.
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <strong class="text-white block mb-1">Right to Erasure (Art. 17 GDPR)</strong>
              You can demand the complete, permanent deletion of your personal data („Right to be Forgotten“).
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <strong class="text-white block mb-1">Right to Data Portability (Art. 20)</strong>
              Obtain your data in a structured, machine-readable JSON format for transfer to another service.
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <strong class="text-white block mb-1">Restriction of Processing (Art. 18)</strong>
              Temporarily halt processing of your data during dispute reviews.
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <strong class="text-white block mb-1">Right to Lodge a Complaint (Art. 77)</strong>
              File an official grievance with your national Data Protection Supervisory Authority (e.g., ICO in the UK, BfDI in Germany).
            </div>
          </div>
        `
      },
      {
        id: 'priv-sec-9',
        num: '09',
        title: 'California Consumer Privacy Act (CCPA / CPRA Notice)',
        badge: 'CCPA / CPRA',
        content: `
          <p class="mb-4">California consumers are afforded specific rights regarding their personal information:</p>
          ${renderCallout('security', 'Do Not Sell My Personal Information:', 'Orbit has not sold and will never sell consumer personal information. We do not share personal information with third parties for cross-context behavioral advertising. You have the right not to receive discriminatory treatment for the exercise of privacy rights conferred by the CCPA.')}
        `
      },
      {
        id: 'priv-sec-10',
        num: '10',
        title: 'Protection of Children (COPPA Compliance)',
        badge: 'Minors',
        content: `
          <p class="mb-4">Orbit is not directed to individuals under 13 years of age. We do not knowingly collect personal data from children under 13.</p>
          <p>If you are a parent or guardian and become aware that your child has provided personal information to Orbit without consent, please contact us immediately for prompt erasure.</p>
        `
      },
      {
        id: 'priv-sec-11',
        num: '11',
        title: 'How to Request Data Deletion & Export',
        badge: 'Data Deletion',
        content: `
          <p class="mb-4">We believe exercising your data privacy rights should be effortless:</p>
          <div class="space-y-3.5 text-xs sm:text-sm mb-4">
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span class="font-bold text-white block mb-1">Method 1: Support Server Deletion Ticket</span>
              <p class="text-neutral-400 leading-relaxed">Join our official <a href="https://discord.gg/orbit" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline">Support Server</a> and open a Data Protection Ticket with your 18-digit Discord Snowflake ID.</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span class="font-bold text-white block mb-1">Method 2: Guild Management / Dashboard</span>
              <p class="text-neutral-400 leading-relaxed">Server owners can reset guild data directly via the Web Dashboard or remove the bot (all configurations are purged within 30 days).</p>
            </div>
            <div class="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <span class="font-bold text-white block mb-1">Execution SLA</span>
              <p class="text-neutral-400 leading-relaxed">Pursuant to GDPR Article 12(3), all verified deletion and data export requests are executed within <strong>30 days</strong> of receipt.</p>
            </div>
          </div>
        `
      },
      {
        id: 'priv-sec-12',
        num: '12',
        title: 'Updates & Revisions to this Privacy Policy',
        badge: 'Updates',
        content: `
          <p class="mb-4">We may update this Privacy Policy from time to time to maintain compliance with relevant data protection legislation or reflect changes in our bot functionality.</p>
          <p>The updated version will be indicated by the "Last Updated" date at the top of this document.</p>
        `
      },
      {
        id: 'priv-sec-13',
        num: '13',
        title: 'Data Protection Officer & Privacy Inquiries',
        badge: 'Contact',
        content: `
          <p class="mb-4">For any inquiries, data deletion requests, or formal communications regarding this Privacy Policy, please contact our team:</p>
          <div class="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-sm text-neutral-300">
            <p class="font-bold text-white mb-1.5">Orbit Privacy & Data Protection Team</p>
            <p class="mb-4 text-neutral-400">Accessible directly via our official Discord community server:</p>
            <a href="https://discord.gg/orbit" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors text-xs sm:text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              <span>Open Privacy Support Ticket on Discord</span>
            </a>
          </div>
        `
      }
    ];

    container.innerHTML = `
      <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
        ${getLegalHeader('privacy')}

        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Table of Contents Sidebar (3 Cols / 25%) -->
            <aside class="hidden lg:block lg:col-span-3 sticky top-28 space-y-4">
              <div class="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xs uppercase tracking-wider text-neutral-400 font-bold">
                    ${isDe ? 'Inhaltsverzeichnis' : 'Table of Contents'}
                  </h3>
                  <span class="text-[11px] font-mono text-neutral-500">${sections.length} ${isDe ? 'Abschnitte' : 'Sections'}</span>
                </div>
                <nav class="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1" style="scrollbar-width: thin;">
                  ${sections.map(s => `
                    <a href="#${s.id}" data-target="${s.id}" class="toc-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-all group">
                      <span class="w-5 text-[10px] font-mono text-neutral-500 group-hover:text-indigo-400 font-bold">${s.num}</span>
                      <span class="truncate flex-1">${s.title}</span>
                    </a>
                  `).join('')}
                </nav>
              </div>

              <!-- Quick Deletion Action Box (Docs Style) -->
              <div class="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs shadow-sm">
                <div class="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
                  <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                  <span>${isDe ? 'Ihre Daten, Ihre Kontrolle' : 'Your Data, Your Control'}</span>
                </div>
                <p class="text-neutral-400 mb-3 leading-relaxed">${isDe ? 'Sie möchten Ihre Daten löschen oder exportieren? Öffnen Sie ein Ticket in unserem Support-Server.' : 'Want to erase or export your stored data? Open a ticket in our support server.'}</p>
                <a href="#priv-sec-11" class="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold">
                  <span>${isDe ? 'Zur Löschanleitung' : 'View Deletion Guide'}</span>
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
            </aside>

            <!-- Main Sections List (9 Cols / 75% - Spacious Reading Width) -->
            <main class="lg:col-span-9 space-y-6 min-w-0">
              
              <!-- Quick Overview Card (Fumadocs Card Style) -->
              <div class="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-sm text-neutral-300 space-y-4 leading-relaxed shadow-sm">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-white">${isDe ? 'Datenschutz auf einen Blick (DSGVO-Transparenz)' : 'Privacy at a Glance (GDPR Transparency)'}</h3>
                    <p class="text-xs text-neutral-400">${isDe ? 'Die wichtigsten Garantien verständlich zusammengefasst' : 'Essential privacy commitments summarized'}</p>
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div class="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                    <span class="text-white font-semibold block mb-1 text-sm">${isDe ? '1. Kein Verkauf von Daten' : '1. Zero Data Selling'}</span>
                    <span class="text-neutral-400 text-xs sm:text-sm leading-relaxed">${isDe ? 'Wir verkaufen Ihre Daten niemals an Werbetreibende oder Datenhändler.' : 'We never sell, monetize, or broker personal information to advertisers.'}</span>
                  </div>
                  <div class="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                    <span class="text-white font-semibold block mb-1 text-sm">${isDe ? '2. Keine dauerhafte Chat-Speicherung' : '2. No Chat Logging'}</span>
                    <span class="text-neutral-400 text-xs sm:text-sm leading-relaxed">${isDe ? 'Nachrichten werden flüchtig im RAM auf Auto-Mod-Regeln geprüft und sofort verworfen.' : 'Chat messages are evaluated in RAM for auto-mod rules and discarded immediately.'}</span>
                  </div>
                  <div class="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                    <span class="text-white font-semibold block mb-1 text-sm">${isDe ? '3. Keine Tracking-Cookies' : '3. No Tracking Cookies'}</span>
                    <span class="text-neutral-400 text-xs sm:text-sm leading-relaxed">${isDe ? 'Ausschließlich technisch notwendige Session-Cookies für den Dashboard-Login.' : 'Only essential session cookies for authentication, zero marketing tracking.'}</span>
                  </div>
                  <div class="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                    <span class="text-white font-semibold block mb-1 text-sm">${isDe ? '4. Recht auf Löschung jederzeit' : '4. Right to Erasure Anytime'}</span>
                    <span class="text-neutral-400 text-xs sm:text-sm leading-relaxed">${isDe ? 'Fordern Sie die vollständige Löschung Ihrer Daten unkompliziert per Support-Ticket an.' : 'Request complete deletion of your data easily via our support ticket system.'}</span>
                  </div>
                </div>
              </div>

              <!-- Filter No Results Indicator -->
              <div id="legal-no-results" class="hidden p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-400">
                <svg class="w-8 h-8 text-neutral-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                ${isDe ? 'Keine Abschnitte passend zu Ihrem Suchbegriff gefunden.' : 'No clauses match your search query.'}
              </div>

              <!-- Clause Cards (Spacious, Beautiful Docs Typography) -->
              ${sections.map(s => `
                <section id="${s.id}" class="legal-section p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700/80 transition-all scroll-mt-28 shadow-sm">
                  <div class="flex items-start justify-between gap-4 mb-4">
                    <div class="flex items-center gap-3">
                      <span class="flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700/60 text-xs font-mono font-bold text-emerald-400 shrink-0">
                        ${s.num}
                      </span>
                      <div>
                        <h2 class="text-base sm:text-xl font-bold text-white tracking-tight">${s.title}</h2>
                        <span class="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">${s.badge}</span>
                      </div>
                    </div>
                    <button type="button" onclick="copySectionLink('${s.id}')" class="p-2 text-neutral-500 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer" title="${isDe ? 'Link zu diesem Abschnitt kopieren' : 'Copy link to this section'}">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </button>
                  </div>
                  <div class="text-sm sm:text-[15px] text-neutral-300 leading-relaxed pt-2">
                    ${s.content}
                  </div>
                </section>
              `).join('')}

            </main>
          </div>
        </div>

        ${getSharedFooter()}
      </div>
    `;
  };

})();
