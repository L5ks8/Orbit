/**
 * Orbit Landing Page
 * 1:1 Pixel-Perfect Replica of PeakBot (Dark Theme, SF Pro / Inter typography,
 * real showcase videos, interactive prompt typewriter,
 * active modules vs planned features toggle, and animated FAQ accordions).
 */

Pages.Landing = function(container) {
  // Check cookie consent
  const hasConsent = localStorage.getItem('orbit_cookie_consent');
  const cookieHtml = hasConsent ? '' : `
    <div id="cookie-banner" role="dialog" aria-label="Cookie-Zustimmung" class="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-[90] rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-opacity duration-300">
      <p class="text-[13px] text-neutral-300 leading-relaxed">
        Wir nutzen essentielle Cookies, um die Stabilität und Sicherheit von Orbit zu gewährleisten. Sehen Sie sich unsere <a class="text-white underline underline-offset-2 hover:text-neutral-400" href="/privacy">Datenschutzrichtlinie</a> an.
      </p>
      <div class="mt-3 flex items-center gap-2">
        <button type="button" id="cookie-accept-btn" class="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-[13px] font-semibold transition-colors active:scale-[0.98] cursor-pointer">Akzeptieren</button>
        <button type="button" id="cookie-decline-btn" class="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[13px] font-medium border border-neutral-700 transition-colors active:scale-[0.98] cursor-pointer">Ablehnen</button>
      </div>
    </div>
  `;

  const heroHtml = `
    <section class="relative min-h-[100svh] flex items-center justify-center px-4 sm:px-6 overflow-hidden" style="background:linear-gradient(to bottom, #141420 0%, #0a0a0a 80%);padding-top:calc(var(--promo-h, 0px) + var(--nav-h, 5.5rem) + 1.5rem);padding-bottom:2rem;transition:padding-top 450ms cubic-bezier(0.22, 1, 0.36, 1)">
      <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(ellipse 80% 60% at 50% 42%, rgba(255,255,255,0.04) 0%, transparent 70%)"></div>
      <div class="absolute inset-0 pointer-events-none" style="background-image:radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);background-size:24px 24px;mask-image:radial-gradient(ellipse 70% 65% at 50% 48%, black 35%, transparent 82%);-webkit-mask-image:radial-gradient(ellipse 70% 65% at 50% 48%, black 35%, transparent 82%)"></div>
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[600px] h-[400px] sm:w-[900px] sm:h-[600px] rounded-full bg-indigo-500/[0.12] blur-[70px] sm:blur-[150px]"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[340px] h-[280px] sm:w-[500px] sm:h-[400px] rounded-full bg-violet-500/[0.09] blur-[60px] sm:blur-[120px]"></div>
      </div>
      
      <div class="max-w-3xl mx-auto w-full relative z-10 text-center pb-10 sm:pb-20">
        <h1 class="hero-heading text-[2rem] sm:text-[2.5rem] md:text-[3.25rem] lg:text-[4rem] font-bold mb-3 sm:mb-4 animate-fade-in-up leading-[1.08] tracking-[-0.02em] text-white text-balance" style="font-family:-apple-system, BlinkMacSystemFont, 'SF Pro Display', var(--font-inter), 'Inter', system-ui, sans-serif">
          Der All-in-One Discord Bot für deine Community
        </h1>
        <p class="hero-subtitle hero-description text-xs sm:text-sm md:text-sm lg:text-base text-neutral-300 font-light text-pretty mb-5 sm:mb-7 lg:mb-10 max-w-xl mx-auto animate-fade-in-up delay-150">
          Tickets, Auto-Moderation, ServerStats, Leveling, Verifizierung und 30+ Funktionen in einem leistungsstarken Bot vereint.
        </p>
        
        <form class="w-full max-w-2xl lg:max-w-3xl mx-auto mb-5 sm:mb-7 lg:mb-10 animate-fade-in-up delay-200">
          <div class="ai-input-glow relative rounded-[28px] bg-neutral-900/95 text-left">
            <div class="relative px-4 sm:px-7 py-4 sm:py-6 pr-12 sm:pr-[4.5rem]">
              <div class="min-h-[48px] sm:min-h-[60px] relative">
                <p class="absolute top-0 left-0 right-0 text-neutral-500 text-sm sm:text-lg pointer-events-none select-none transition-opacity duration-200 opacity-100">
                  Konfiguriere <span></span><span class="inline-block w-[2px] h-4 sm:h-5 bg-neutral-400 ml-0.5 align-middle animate-pulse"></span>
                </p>
                <textarea class="w-full bg-transparent text-white text-sm sm:text-lg resize-none outline-none border-none focus:ring-0 focus:outline-none relative z-10 caret-neutral-400 appearance-none" style="color:transparent;box-shadow:none" rows="2"></textarea>
              </div>
              <button type="submit" disabled="" class="absolute bottom-3 sm:bottom-5 right-3 sm:right-5 bg-white hover:bg-neutral-200 disabled:bg-white/[0.06] disabled:text-neutral-600 disabled:cursor-not-allowed text-black p-2 sm:p-2.5 rounded-full transition-[background-color,transform] active:scale-[0.96] disabled:active:scale-100 before:content-[''] before:absolute before:inset-[-4px]" aria-label="Send message">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-4 h-4"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
              </button>
            </div>
          </div>
        </form>
        
        <div class="hero-ctas flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-10 lg:mb-14 animate-fade-in-up delay-225">
          <a href="/dashboard" class="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black text-sm sm:text-base font-semibold px-5 sm:px-8 py-3 sm:py-4 rounded-full btn-glow btn-arrow-container cursor-pointer">
            Go to Dashboard
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-4 h-4 btn-arrow"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </a>
          <button type="button" class="flex items-center gap-2 text-white text-sm sm:text-base font-medium px-5 sm:px-8 py-3 sm:py-4 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.18] transition-[background-color,border-color,transform] hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer" onclick="document.getElementById('features')?.scrollIntoView({behavior:'smooth'})">
            Funktionen ansehen
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-4 h-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        </div>
        
        <div class="flex items-center justify-center gap-3 animate-fade-in-up delay-300">
          <div id="hero-server-avatars" class="flex -space-x-2">
            <img alt="Community server" loading="lazy" width="32" height="32" decoding="async" class="w-8 h-8 rounded-full object-cover ring-2 ring-neutral-900 bg-neutral-800" src="/server-icon-1.png"/>
            <img alt="Community server" loading="lazy" width="32" height="32" decoding="async" class="w-8 h-8 rounded-full object-cover ring-2 ring-neutral-900 bg-neutral-800" src="/server-icon-2.png"/>
            <img alt="Community server" loading="lazy" width="32" height="32" decoding="async" class="w-8 h-8 rounded-full object-cover ring-2 ring-neutral-900 bg-neutral-800" src="/server-icon-3.png"/>
          </div>
          <p class="text-sm text-neutral-400">Trusted by <span id="hero-server-count" class="text-white font-semibold tabular-nums">10+</span> communities</p>
        </div>
      </div>
      
      <div class="absolute bottom-10 left-0 right-0 z-10 flex justify-center animate-fade-in-up delay-500 short-viewport-hide">
        <button class="flex flex-col items-center gap-2 text-white hover:text-white transition-colors cursor-pointer" aria-label="Scroll down">
          <span class="text-xs uppercase tracking-[0.2em] font-semibold">Scroll</span>
          <div class="hero-bob">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-7 h-7"><path d="m6 9 6 6 6-6"></path></svg>
          </div>
        </button>
      </div>
    </section>
  `;

  const featuresHtml = `
    <section id="features" class="section-padding px-6 scroll-mt-20">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-8 lg:mb-14 max-w-2xl mx-auto">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">Ersetze 6 Bots durch Orbit</h2>
        </div>
        
        <div class="space-y-8 lg:space-y-16">
          <!-- Feature 1: Modernes Ticket- & Support-System (same exact layout & video) -->
          <div class="scroll-animate flex flex-col-reverse lg:flex-row gap-5 lg:gap-12 items-center">
            <div class="w-full lg:w-1/2 flex-shrink-0">
              <div class="overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950 pointer-events-none select-none shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_30px_80px_-40px_rgba(0,0,0,0.9)]">
                <video src="/onyx-builder.mp4" autoplay muted loop playsinline class="block aspect-video w-full bg-neutral-950 object-cover"></video>
              </div>
            </div>
            <div class="w-full lg:w-1/2">
              <h3 class="text-2xl lg:text-3xl font-bold text-white mb-4 text-balance">Modernes Ticket- &amp; Support-System</h3>
              <p class="text-neutral-400 leading-relaxed mb-5 text-pretty">Vollautomatisierte Ticket-Erstellung mit Components v2, Multi-Kategorien, Button-Claiming für dein Team, Transkripten und interaktivem Discord-Support.</p>
              <a href="${botInviteUrl}" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-neutral-200 transition-[background-color,transform] hover:-translate-y-0.5 active:scale-[0.96] cursor-pointer group/cta">
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
            </div>
          </div>
          
          <!-- Feature 2: Ask your analytics (retained exact layout, video & text) -->
          <div class="scroll-animate flex flex-col-reverse lg:flex-row-reverse gap-5 lg:gap-12 items-center">
            <div class="w-full lg:w-1/2 flex-shrink-0">
              <div class="overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950 pointer-events-none select-none shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_30px_80px_-40px_rgba(0,0,0,0.9)]">
                <video src="/onyx-analytics.mp4" autoplay muted loop playsinline class="block aspect-video w-full bg-neutral-950 object-cover"></video>
              </div>
            </div>
            <div class="w-full lg:w-1/2">
              <h3 class="text-2xl lg:text-3xl font-bold text-white mb-4 text-balance">Ask your analytics</h3>
              <p class="text-neutral-400 leading-relaxed mb-5 text-pretty">Ask a plain question and get a live chart with a straight answer — then fix what’s slowing your server down.</p>
              <a href="${botInviteUrl}" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-neutral-200 transition-[background-color,transform] hover:-translate-y-0.5 active:scale-[0.96] cursor-pointer group/cta">
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
            </div>
          </div>
          
          <!-- Feature 3: Auto-Moderation & Server-Schutz (replaces /peak text, keeps layout & video) -->
          <div class="scroll-animate flex flex-col-reverse lg:flex-row gap-5 lg:gap-12 items-center">
            <div class="w-full lg:w-1/2 flex-shrink-0">
              <div class="overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950 pointer-events-none select-none shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_30px_80px_-40px_rgba(0,0,0,0.9)]">
                <video src="/onyx-peak.mp4" autoplay muted loop playsinline class="block aspect-video w-full bg-neutral-950 object-cover"></video>
              </div>
            </div>
            <div class="w-full lg:w-1/2">
              <h3 class="text-2xl lg:text-3xl font-bold text-white mb-4 text-balance">Auto-Moderation &amp; Server-Schutz</h3>
              <p class="text-neutral-400 leading-relaxed mb-5 text-pretty">Effektiver Schutz vor Spam, Phishing, Massen-Pings und unerwünschten Inhalten. Mit anpassbaren Filtern, AutoMod-Regeln und lückenlosen Moderations-Logs.</p>
              <a href="${botInviteUrl}" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-neutral-200 transition-[background-color,transform] hover:-translate-y-0.5 active:scale-[0.96] cursor-pointer group/cta">
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div class="mt-10 lg:mt-16 text-center">
          <a href="#pricing" class="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors group/more">
            Alle Module &amp; Funktionen ansehen
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3.5 h-3.5 group-hover/more:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </a>
        </div>
      </div>
    </section>
  `;

  // Section 4: All Orbit Features & Planned Features Matrix (100% matches original PeakBot pricing layout)
  const pricingHtml = `
    <section id="pricing" class="relative bg-neutral-950 py-20 sm:py-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12 max-w-2xl mx-auto">
          <h2 class="text-4xl sm:text-5xl font-bold text-white tracking-tight text-balance">100% Kostenlos für alle Server</h2>
          <p class="text-neutral-400 mt-3 text-sm sm:text-base">Keine versteckten Kosten, keine Abos. Alle Kernmodule sind dauerhaft kostenlos verfügbar.</p>
        </div>
        
        <div class="">
          <div class="flex flex-col items-center mb-8">
            <div role="group" aria-label="Feature Ansicht" class="relative inline-grid grid-cols-2 p-1 bg-neutral-900/40 border border-neutral-800 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <span id="feature-toggle-pill" aria-hidden="true" class="absolute top-1 bottom-1 left-1 rounded-lg bg-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.10)] transition-transform duration-300 ease-out" style="width:calc(50% - 4px);transform:translateX(0%)"></span>
              <button type="button" id="tab-active-btn" aria-pressed="true" class="relative z-10 inline-flex items-center justify-center px-5 sm:px-7 min-h-[42px] text-sm rounded-lg font-semibold transition-colors duration-200 active:scale-[0.96] focus-visible:outline-none text-white cursor-pointer">
                Aktive Module
              </button>
              <button type="button" id="tab-planned-btn" aria-pressed="false" class="relative z-10 inline-flex items-center justify-center px-5 sm:px-7 min-h-[42px] text-sm rounded-lg font-semibold transition-colors duration-200 active:scale-[0.96] focus-visible:outline-none text-neutral-400 hover:text-neutral-200 cursor-pointer">
                Planned Features
              </button>
            </div>
          </div>
          
          <div class="max-w-6xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
            <div id="features-cards-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-start">
              <!-- Dynamically populated or rendered below -->
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const faqHtml = `
    <section id="faq" class="section-padding px-6">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-6 sm:mb-10 scroll-animate">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Häufig gestellte Fragen</h2>
        </div>
        
        <div class="space-y-3">
          <div class="border border-neutral-800 rounded-xl overflow-hidden transition-[border-color] duration-200 scroll-animate scroll-animate-delay-1 hover:border-neutral-600">
            <button aria-expanded="false" class="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left">
              <span class="text-sm sm:text-base font-semibold text-white pr-4">Wie füge ich Orbit zu meinem Discord-Server hinzu?</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <div class="overflow-hidden transition-[max-height,padding] duration-200 max-h-0">
              <p class="px-4 sm:px-6 text-sm text-neutral-400 leading-relaxed">Klicke einfach auf &quot;Zu Discord hinzufügen&quot; oben auf der Website, wähle deinen Server aus und autorisiere den Bot. Orbit ist in unter 30 Sekunden einsatzbereit.</p>
            </div>
          </div>

          <div class="border border-neutral-800 rounded-xl overflow-hidden transition-[border-color] duration-200 scroll-animate scroll-animate-delay-2 hover:border-neutral-600">
            <button aria-expanded="false" class="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left">
              <span class="text-sm sm:text-base font-semibold text-white pr-4">Ist Orbit wirklich komplett kostenlos?</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <div class="overflow-hidden transition-[max-height,padding] duration-200 max-h-0">
              <p class="px-4 sm:px-6 text-sm text-neutral-400 leading-relaxed">Ja! Alle Kernfunktionen – Ticketsystem, Auto-Moderation, XP &amp; Leveling, Verifizierung, Server-Statistiken, Embed-Builder und Moderations-Logs – sind 100% dauerhaft kostenlos ohne versteckte Abonnements.</p>
            </div>
          </div>

          <div class="border border-neutral-800 rounded-xl overflow-hidden transition-[border-color] duration-200 scroll-animate scroll-animate-delay-3 hover:border-neutral-600">
            <button aria-expanded="false" class="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left">
              <span class="text-sm sm:text-base font-semibold text-white pr-4">Funktioniert Orbit mit bestehenden Servern?</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <div class="overflow-hidden transition-[max-height,padding] duration-200 max-h-0">
              <p class="px-4 sm:px-6 text-sm text-neutral-400 leading-relaxed">Ja, absolut. Orbit integriert sich nahtlos in deine bestehenden Rollen, Kanäle und Berechtigungen. Du kannst Module einzeln aktivieren und konfigurieren.</p>
            </div>
          </div>

          <div class="border border-neutral-800 rounded-xl overflow-hidden transition-[border-color] duration-200 scroll-animate scroll-animate-delay-4 hover:border-neutral-600">
            <button aria-expanded="false" class="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left">
              <span class="text-sm sm:text-base font-semibold text-white pr-4">Wie funktioniert das Components v2 Ticket-System?</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <div class="overflow-hidden transition-[max-height,padding] duration-200 max-h-0">
              <p class="px-4 sm:px-6 text-sm text-neutral-400 leading-relaxed">Orbit nutzt Discords neueste Komponenten-Architektur mit interaktiven Select-Menüs und Buttons. Teammitglieder können Tickets mit einem Klick claimen, und beim Schließen wird automatisch ein vollständiges HTML-Transkript gespeichert.</p>
            </div>
          </div>

          <div class="border border-neutral-800 rounded-xl overflow-hidden transition-[border-color] duration-200 scroll-animate scroll-animate-delay-5 hover:border-neutral-600">
            <button aria-expanded="false" class="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left">
              <span class="text-sm sm:text-base font-semibold text-white pr-4">Welche Features sind für die Zukunft geplant?</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <div class="overflow-hidden transition-[max-height,padding] duration-200 max-h-0">
              <p class="px-4 sm:px-6 text-sm text-neutral-400 leading-relaxed">Geplant sind unter anderem ein Server-KI-Assistent, ein umfassendes Economy- und Shop-System mit Minigames, 24/7 Voice &amp; Musik-Streaming sowie benutzerdefinierte Webhooks und eine REST-API.</p>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-10 scroll-animate">
          <p class="text-sm text-neutral-500">Noch Fragen? <a href="https://discord.gg/orbit" class="text-white font-medium hover:underline" target="_blank" rel="noopener noreferrer">Tritt unserem Discord bei</a></p>
        </div>
      </div>
    </section>
  `;

  const supportHtml = `
    <section id="support" class="py-8 sm:py-12 px-4 md:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.08] px-5 py-14 sm:px-10 sm:py-20 text-center" style="background:linear-gradient(135deg, #17171b 0%, #0d0d10 55%, #131316 100%)">
          <div class="relative z-10">
            <h2 class="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight text-balance">Bereit für deinen Server?</h2>
            <p class="text-white/85 text-base sm:text-lg mb-2 max-w-md mx-auto text-pretty">Füge Orbit mit einem Klick zu Discord hinzu oder tritt unserer Community bei.</p>
            <p class="text-sm text-white/60 mb-7 sm:mb-9">Dauerhaft kostenlos · Schnelle Einrichtung · 24/7 Support</p>
            <div class="flex items-center justify-center gap-4 flex-wrap">
              <a href="${botInviteUrl}" target="_blank" class="inline-flex items-center gap-3 font-semibold px-7 py-3.5 rounded-full transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 active:scale-[0.96] btn-arrow-container bg-white hover:bg-neutral-100 text-neutral-900 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                Orbit hinzufügen
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-4 h-4 btn-arrow"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
              <a href="https://discord.gg/orbit" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2.5 font-medium px-6 py-3.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.05] hover:bg-white/[0.1] text-white transition-all">
                Discord Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const footerHtml = `
    <footer class="border-t border-neutral-800">
      <div class="max-w-7xl mx-auto px-6 md:px-8">
        <div class="py-8 md:py-16 grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-6 md:gap-12">
          <div class="col-span-2 md:col-span-1">
            <div class="flex items-center gap-3 mb-4">
              <img src="/img/logo.png" alt="Orbit" width="32" height="32" class="rounded-xl"/>
              <span class="text-lg font-semibold text-white">Orbit</span>
            </div>
            <p class="text-sm text-neutral-400 leading-relaxed max-w-xs">
              Der All-in-One Discord Bot für Moderation, Tickets, Leveling, Begrüßungen und Server-Management.
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.15em] text-neutral-400 font-medium mb-4">Features</p>
            <ul class="space-y-3">
              <li><a href="#features" class="text-sm text-neutral-400 hover:text-white transition-colors">Tickets</a></li>
              <li><a href="#features" class="text-sm text-neutral-400 hover:text-white transition-colors">Auto-Mod</a></li>
              <li><a href="#features" class="text-sm text-neutral-400 hover:text-white transition-colors">Analytics</a></li>
              <li><a href="#pricing" class="text-sm text-neutral-400 hover:text-white transition-colors">Module</a></li>
            </ul>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.15em] text-neutral-400 font-medium mb-4">Dashboard</p>
            <ul class="space-y-3">
              <li><a href="/dashboard" class="text-sm text-neutral-400 hover:text-white transition-colors">Übersicht</a></li>
              <li><a href="/dashboard" class="text-sm text-neutral-400 hover:text-white transition-colors">Module</a></li>
              <li><a href="/docs" class="text-sm text-neutral-400 hover:text-white transition-colors">Wiki</a></li>
            </ul>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.15em] text-neutral-400 font-medium mb-4">Community</p>
            <ul class="space-y-3">
              <li><a href="https://discord.gg/orbit" target="_blank" rel="noopener noreferrer" class="text-sm text-neutral-400 hover:text-white transition-colors">Discord Server</a></li>
              <li><a href="${botInviteUrl}" target="_blank" class="text-sm text-neutral-400 hover:text-white transition-colors">Bot Einladen</a></li>
            </ul>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.15em] text-neutral-400 font-medium mb-4">Rechtliches</p>
            <ul class="space-y-3">
              <li><a href="/privacy" class="text-sm text-neutral-400 hover:text-white transition-colors">Datenschutz</a></li>
              <li><a href="/terms" class="text-sm text-neutral-400 hover:text-white transition-colors">Nutzungsbedingungen</a></li>
            </ul>
          </div>
        </div>
        <div class="py-6 border-t border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© ${new Date().getFullYear()} Orbit. Alle Rechte vorbehalten.</p>
          <p>Nicht mit Discord Inc. affiliiert.</p>
        </div>
      </div>
    </footer>
  `;

  container.innerHTML = cookieHtml + heroHtml + featuresHtml + pricingHtml + faqHtml + supportHtml + footerHtml;

  // 1. Cookie consent logic
  const cookieBanner = container.querySelector('#cookie-banner');
  if (cookieBanner) {
    const acceptBtn = cookieBanner.querySelector('#cookie-accept-btn');
    const declineBtn = cookieBanner.querySelector('#cookie-decline-btn');
    if (acceptBtn) {
      acceptBtn.onclick = () => {
        localStorage.setItem('orbit_cookie_consent', 'accepted');
        cookieBanner.classList.add('opacity-0');
        setTimeout(() => cookieBanner.remove(), 300);
      };
    }
    if (declineBtn) {
      declineBtn.onclick = () => {
        localStorage.setItem('orbit_cookie_consent', 'declined');
        cookieBanner.classList.add('opacity-0');
        setTimeout(() => cookieBanner.remove(), 300);
      };
    }
  }

  // 2. Interactive Typewriter Prompts
  const promptSpan = container.querySelector('.ai-input-glow p span:first-child');
  const textarea = container.querySelector('.ai-input-glow textarea');
  const placeholder = container.querySelector('.ai-input-glow p');
  const submitBtn = container.querySelector('.ai-input-glow button');
  const form = container.querySelector('form');

  if (promptSpan && form) {
    const samplePrompts = [
      "ein Ticketsystem mit Buttons und Support-Kategorien",
      "Auto-Moderation mit Anti-Spam und Link-Schutz",
      "XP- und Level-System mit automatischen Rollenbelohnungen",
      "Willkommens-Nachrichten mit Verifizierungs-Button",
      "Live Server-Counter für Mitglieder, Bots und Rollen",
      "Reaktionsrollen und Embed-Nachrichten im neuen Design"
    ];

    let promptIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeTimer = null;
    let isUserTyping = false;

    function tickTypewriter() {
      if (isUserTyping) return;
      const currentPrompt = samplePrompts[promptIdx];
      
      if (isDeleting) {
        charIdx--;
      } else {
        charIdx++;
      }

      if (promptSpan) {
        promptSpan.textContent = currentPrompt.slice(0, charIdx);
      }

      let speed = isDeleting ? 30 : 60;

      if (!isDeleting && charIdx === currentPrompt.length) {
        speed = 2200;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        promptIdx = (promptIdx + 1) % samplePrompts.length;
        speed = 400;
      }

      typeTimer = setTimeout(tickTypewriter, speed);
    }

    tickTypewriter();

    if (textarea) {
      textarea.addEventListener('input', () => {
        const val = textarea.value;
        if (val.trim().length > 0) {
          isUserTyping = true;
          clearTimeout(typeTimer);
          if (placeholder) placeholder.style.opacity = '0';
          textarea.style.color = '#ffffff';
          if (submitBtn) {
            submitBtn.removeAttribute('disabled');
            submitBtn.classList.remove('disabled:bg-white/[0.06]', 'disabled:text-neutral-600', 'disabled:cursor-not-allowed');
          }
        } else {
          isUserTyping = false;
          if (placeholder) placeholder.style.opacity = '1';
          textarea.style.color = 'transparent';
          if (submitBtn) {
            submitBtn.setAttribute('disabled', '');
          }
          charIdx = 0;
          isDeleting = false;
          tickTypewriter();
        }
      });

      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (textarea.value.trim().length > 0) {
            form.dispatchEvent(new Event('submit'));
          }
        }
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = textarea ? textarea.value.trim() : '';
      if (val) {
        window.location.href = '/dashboard?prompt=' + encodeURIComponent(val);
      } else {
        window.location.href = '/dashboard';
      }
    });
  }

  // 3. Modules & Planned Features Toggle Logic (Exact PeakBot Card Styling)
  const cardsGrid = container.querySelector('#features-cards-grid');
  const pill = container.querySelector('#feature-toggle-pill');
  const tabActiveBtn = container.querySelector('#tab-active-btn');
  const tabPlannedBtn = container.querySelector('#tab-planned-btn');

  const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-3 h-3 text-neutral-300"><path d="M20 6 9 17l-5-5"></path></svg>`;
  const checkIconIndigo = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-3 h-3 text-white"><path d="M20 6 9 17l-5-5"></path></svg>`;

  const activeModulesData = [
    {
      title: "Moderation & Schutz",
      badge: "",
      status: "Inklusive",
      sub: "Sofort einsatzbereit",
      btnText: "Zu Discord hinzufügen",
      btnClass: "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700",
      highlight: false,
      items: [
        "Anti-Spam & Link-Filter",
        "AutoMod Regeln & Regex-Filter",
        "Warn, Mute, Kick & Ban Befehle",
        "Detaillierte Moderations-Logs",
        "Components v2 Embeds",
        "Rollen- & Berechtigungsschutz",
        "Audit-Log Überwachung"
      ]
    },
    {
      title: "Community & Leveling",
      badge: "",
      status: "Inklusive",
      sub: "Sofort einsatzbereit",
      btnText: "Zu Discord hinzufügen",
      btnClass: "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700",
      highlight: false,
      items: [
        "Willkommens- & Abschiedsnachrichten",
        "Welcome Images & Direct Messages",
        "Auto-Rollen & Reaktionsrollen",
        "XP-System für Text & Voice",
        "Server-Ranglisten & Leaderboards",
        "Level-Up Rollenbelohnungen",
        "Verifizierungs-System mit Button"
      ]
    },
    {
      title: "Tickets & Support",
      badge: "Highlight",
      status: "Inklusive",
      sub: "Sofort einsatzbereit",
      btnText: "Zu Discord hinzufügen",
      btnClass: "bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_6px_20px_-6px_rgba(99,102,241,0.6)]",
      highlight: true,
      items: [
        "Interaktive Components v2 Panels",
        "Multi-Kategorien (Support, Team, etc.)",
        "Claiming & Zuweisung für Teammitglieder",
        "Automatische HTML-Transkripte",
        "Ticket-Schließung mit Bestätigung",
        "Private Discord Threads & Kanäle",
        "Voll konfigurierbar im Dashboard"
      ]
    },
    {
      title: "Stats & Utility",
      badge: "",
      status: "Inklusive",
      sub: "Sofort einsatzbereit",
      btnText: "Zu Discord hinzufügen",
      btnClass: "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700",
      highlight: false,
      items: [
        "Live Server-Counter (Kanäle)",
        "Member-, Rollen- & Bot-Zähler",
        "Embed Builder mit Live-Vorschau",
        "Giveaway-System mit Rollenboni",
        "Benutzer- & Server-Informationen",
        "Umfragen & Abstimmungen",
        "100% Free & Open Source"
      ]
    }
  ];

  const plannedFeaturesData = [
    {
      title: "KI-Assistent & Chat",
      badge: "",
      status: "In Entwicklung",
      sub: "Coming Soon",
      btnText: "Feature vorschlagen",
      btnClass: "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700",
      highlight: false,
      items: [
        "Discord KI-Chatbot für Mitglieder",
        "KI Server-Analyse & Optimierungstipps",
        "Kanal-Zusammenfassungen per Befehl",
        "Intelligente Ticket-Erstantworten",
        "Automatische FAQ-Erkennung",
        "Kontextbezogene Moderationshilfe"
      ]
    },
    {
      title: "Economy & Server-Shop",
      badge: "",
      status: "In Entwicklung",
      sub: "Coming Soon",
      btnText: "Feature vorschlagen",
      btnClass: "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700",
      highlight: false,
      items: [
        "Server-eigene Währung & Geldbörse",
        "Tägliche Belohnungen (/daily)",
        "Rollen-, Farb- & Item-Shop",
        "Mini-Games (Blackjack, Coin-Flip, Slots)",
        "Inventar- & Handels-System",
        "Dashboard Shop-Verwaltung"
      ]
    },
    {
      title: "Musik & Voice-Studio",
      badge: "Highlight",
      status: "In Entwicklung",
      sub: "Coming Soon",
      btnText: "Feature vorschlagen",
      btnClass: "bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_6px_20px_-6px_rgba(99,102,241,0.6)]",
      highlight: true,
      items: [
        "24/7 High-Quality Voice-Streaming",
        "Spotify, YouTube & Soundcloud Support",
        "Soundboard & Sound-Filter (Bassboost, 8D)",
        "Automatische Temporäre Sprachkanäle",
        "Web-Player Steuerung im Dashboard",
        "Warteschlangen- & Playlist-Verwaltung"
      ]
    },
    {
      title: "API & Integrationen",
      badge: "",
      status: "In Entwicklung",
      sub: "Coming Soon",
      btnText: "Feature vorschlagen",
      btnClass: "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700",
      highlight: false,
      items: [
        "Benutzerdefinierte Webhooks",
        "Twitch, YouTube & TikTok Live-Alerts",
        "REST API für Entwickler & Websites",
        "Cloud Backups & 1-Klick-Restore",
        "Benutzerdefiniertes Bot-Branding",
        "Detaillierte Export-Statistiken"
      ]
    }
  ];

  function renderCards(data) {
    if (!cardsGrid) return;
    cardsGrid.innerHTML = data.map((col, idx) => {
      const borderClass = idx > 0 ? 'md:border-l border-t md:border-t-0 border-neutral-800/60' : '';
      const bgClass = col.highlight ? 'bg-white/[0.04]' : '';
      const badgeHtml = col.badge ? `<span class="inline-flex items-center bg-indigo-500 text-white text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-[3px] rounded-full whitespace-nowrap">${col.badge}</span>` : '';
      const iconWrapClass = col.highlight ? 'bg-indigo-500' : 'bg-white/[0.08]';
      const icon = col.highlight ? checkIconIndigo : checkIcon;

      return `
        <div class="relative h-full px-5 py-6 ${borderClass} ${bgClass}">
          <div class="flex items-center justify-between gap-2 min-h-[24px]">
            <span class="text-[22px] font-semibold text-white tracking-tight">${col.title}</span>
            ${badgeHtml}
          </div>
          <div class="mt-5 flex items-baseline gap-1">
            <span class="text-[28px] leading-none font-bold tracking-tight text-white tabular-nums">${col.status}</span>
            <span class="text-neutral-500 text-[13px]">${col.sub.startsWith('/') ? col.sub : '/' + col.sub}</span>
          </div>
          <div class="mt-1.5 min-h-[17px]">
            <p class="text-[12px] leading-[1.4] text-neutral-500 tabular-nums">Dauerhaft 100% Free</p>
          </div>
          <div class="mt-4">
            <button type="button" class="feature-card-btn w-full h-10 text-xs rounded-full font-semibold transition-[transform,background-color] duration-150 active:scale-[0.96] inline-flex items-center justify-center gap-2 cursor-pointer ${col.btnClass}">
              ${col.btnText}
            </button>
          </div>
          <div class="mt-5 pt-5 border-t border-neutral-800/60 space-y-1">
            ${col.items.map(item => `
              <div class="flex items-start gap-2.5 py-[7px]">
                <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${iconWrapClass}">
                  ${icon}
                </span>
                <span class="text-[13px] leading-5 text-neutral-300">${item}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Hook card action buttons
    cardsGrid.querySelectorAll('.feature-card-btn').forEach(btn => {
      btn.onclick = () => {
        if (btn.textContent.includes('Feature vorschlagen')) {
          window.open('https://discord.gg/orbit', '_blank');
        } else {
          window.open(botInviteUrl, '_blank');
        }
      };
    });
  }

  // Initial render with Active Modules
  renderCards(activeModulesData);

  function setMode(mode) {
    if (mode === 'active') {
      if (pill) pill.style.transform = 'translateX(0%)';
      if (tabActiveBtn) {
        tabActiveBtn.setAttribute('aria-pressed', 'true');
        tabActiveBtn.classList.remove('text-neutral-400', 'hover:text-neutral-200');
        tabActiveBtn.classList.add('text-white');
      }
      if (tabPlannedBtn) {
        tabPlannedBtn.setAttribute('aria-pressed', 'false');
        tabPlannedBtn.classList.remove('text-white');
        tabPlannedBtn.classList.add('text-neutral-400', 'hover:text-neutral-200');
      }
      renderCards(activeModulesData);
    } else {
      if (pill) pill.style.transform = 'translateX(100%)';
      if (tabPlannedBtn) {
        tabPlannedBtn.setAttribute('aria-pressed', 'true');
        tabPlannedBtn.classList.remove('text-neutral-400', 'hover:text-neutral-200');
        tabPlannedBtn.classList.add('text-white');
      }
      if (tabActiveBtn) {
        tabActiveBtn.setAttribute('aria-pressed', 'false');
        tabActiveBtn.classList.remove('text-white');
        tabActiveBtn.classList.add('text-neutral-400', 'hover:text-neutral-200');
      }
      renderCards(plannedFeaturesData);
    }
  }

  if (tabActiveBtn) tabActiveBtn.onclick = () => setMode('active');
  if (tabPlannedBtn) tabPlannedBtn.onclick = () => setMode('planned');

  // 4. FAQ Accordion Interaction
  const faqSection = container.querySelector('#faq');
  if (faqSection) {
    const faqItems = faqSection.querySelectorAll('.border-neutral-800');
    faqItems.forEach(item => {
      const btn = item.querySelector('button');
      const content = item.querySelector('.overflow-hidden');
      const chevron = item.querySelector('svg');

      if (btn && content) {
        btn.onclick = () => {
          const isExpanded = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', !isExpanded);
          
          if (!isExpanded) {
            content.classList.remove('max-h-0');
            content.classList.add('max-h-96', 'pb-5', 'pt-1');
            if (chevron) chevron.classList.add('rotate-180');
          } else {
            content.classList.remove('max-h-96', 'pb-5', 'pt-1');
            content.classList.add('max-h-0');
            if (chevron) chevron.classList.remove('rotate-180');
          }
        };
      }
    });
  }

  // 5. Hero Scroll Down Bobbing Button
  const scrollDownBtn = container.querySelector('button[aria-label="Scroll down"]');
  if (scrollDownBtn) {
    scrollDownBtn.onclick = () => {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };
  }

  // 6. Dynamic Server Count & Real Server Profile Pictures (GIF & Non-Default)
  const heroCountSpan = container.querySelector('#hero-server-count');
  const heroAvatars = container.querySelector('#hero-server-avatars');

  if (window.API && typeof API.getStats === 'function') {
    API.getStats().then(stats => {
      if (stats && typeof stats.servers === 'number') {
        if (heroCountSpan) {
          heroCountSpan.textContent = stats.servers + (stats.servers >= 10 ? '+' : '');
        }
      }
      if (stats && Array.isArray(stats.server_icons) && stats.server_icons.length > 0 && heroAvatars) {
        heroAvatars.innerHTML = stats.server_icons.map((item, idx) => `
          <img alt="${(item.name || 'Discord Server').replace(/"/g, '&quot;')}" 
               title="${(item.name || 'Discord Server').replace(/"/g, '&quot;')}" 
               src="${item.icon}" 
               width="32" 
               height="32" 
               class="w-8 h-8 rounded-full object-cover ring-2 ring-neutral-900 bg-neutral-800 transition-transform duration-200 hover:scale-125 hover:z-20 hover:ring-white/40 cursor-pointer" 
               onerror="this.src='/server-icon-${(idx % 3) + 1}.png'" />
        `).join('');
      }
    }).catch(err => {
      console.warn('Could not load live server stats:', err);
    });
  }

  // 7. Ensure all feature cards and items are immediately visible
  const animatedElements = container.querySelectorAll('.scroll-animate');
  animatedElements.forEach(el => el.classList.add('is-visible'));
};
