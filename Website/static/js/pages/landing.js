/**
 * Orbit Landing Page
 * 1:1 Pixel-Perfect Replica of PeakBot in English
 * - Dark Theme, SF Pro / Inter typography
 * - Equal height card layout (aligned titles, prices, buttons, and checklists)
 * - Removed highlight cards (consistent dark styling across all columns)
 * - 100% in English across all sections
 * - Dynamic server count and animated GIF avatar support
 */

Pages.Landing = function(container) {
  const botInviteUrl = 'https://discord.com/oauth2/authorize?client_id=1411032158406541353&permissions=8&scope=bot%20applications.commands';

  // Check cookie consent safely
  let hasConsent = null;
  try {
    if (typeof localStorage !== 'undefined') {
      hasConsent = localStorage.getItem('orbit_cookie_consent');
    }
  } catch (e) {}
  const cookieHtml = hasConsent ? '' : `
    <div id="cookie-banner" role="dialog" aria-label="Cookie Consent" class="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-[90] rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-opacity duration-300">
      <p class="text-[13px] text-neutral-300 leading-relaxed">
        We use essential cookies to ensure the stability and security of Orbit. See our <a class="text-white underline underline-offset-2 hover:text-neutral-400" href="/privacy">Privacy Policy</a>.
      </p>
      <div class="mt-3 flex items-center gap-2">
        <button type="button" id="cookie-accept-btn" class="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-[13px] font-semibold transition-colors active:scale-[0.98] cursor-pointer">Accept</button>
        <button type="button" id="cookie-decline-btn" class="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[13px] font-medium border border-neutral-700 transition-colors active:scale-[0.98] cursor-pointer">Decline</button>
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
          The Easiest Way to Build Your Discord Server
        </h1>
        <p class="hero-subtitle hero-description text-xs sm:text-sm md:text-sm lg:text-base text-neutral-300 font-light text-pretty mb-5 sm:mb-7 lg:mb-10 max-w-xl mx-auto animate-fade-in-up delay-150">
          The all-in-one Discord bot for tickets, auto-moderation, leveling, verification, server stats, and 30+ free tools.
        </p>
        
        <form class="w-full max-w-2xl lg:max-w-3xl mx-auto mb-5 sm:mb-7 lg:mb-10 animate-fade-in-up delay-200">
          <div class="orbit-input-glow relative rounded-[28px] bg-neutral-900/95 text-left">
            <div class="relative px-4 sm:px-7 py-4 sm:py-6 pr-12 sm:pr-[4.5rem]">
              <div class="min-h-[48px] sm:min-h-[60px] relative">
                <p class="absolute top-0 left-0 right-0 text-neutral-500 text-sm sm:text-lg pointer-events-none select-none transition-opacity duration-200 opacity-100">
                  Configure a <span></span><span class="inline-block w-[2px] h-4 sm:h-5 bg-neutral-400 ml-0.5 align-middle animate-pulse"></span>
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
            See Features
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
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">Replace 6 bots with Orbit</h2>
        </div>
        
        <div class="space-y-8 lg:space-y-16">
          <!-- Feature 1: Modern Ticket & Support System -->
          <div class="scroll-animate flex flex-col-reverse lg:flex-row gap-5 lg:gap-12 items-center">
            <div class="w-full lg:w-1/2 flex-shrink-0">
              <div class="overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950 pointer-events-none select-none shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_30px_80px_-40px_rgba(0,0,0,0.9)]">
                <video src="/onyx-builder.mp4" autoplay muted loop playsinline class="block aspect-video w-full bg-neutral-950 object-cover"></video>
              </div>
            </div>
            <div class="w-full lg:w-1/2">
              <h3 class="text-2xl lg:text-3xl font-bold text-white mb-4 text-balance">Modern Ticket &amp; Support System</h3>
              <p class="text-neutral-400 leading-relaxed mb-5 text-pretty">Automated ticket creation with Components v2, multi-category routing, moderator button claiming, HTML transcripts, and real-time Discord support.</p>
              <a href="${botInviteUrl}" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-neutral-200 transition-[background-color,transform] hover:-translate-y-0.5 active:scale-[0.96] cursor-pointer group/cta">
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
            </div>
          </div>
          
          <!-- Feature 2: Ask your analytics -->
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
          
          <!-- Feature 3: Auto-Moderation & Server Protection -->
          <div class="scroll-animate flex flex-col-reverse lg:flex-row gap-5 lg:gap-12 items-center">
            <div class="w-full lg:w-1/2 flex-shrink-0">
              <div class="overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950 pointer-events-none select-none shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_30px_80px_-40px_rgba(0,0,0,0.9)]">
                <video src="/onyx-peak.mp4" autoplay muted loop playsinline class="block aspect-video w-full bg-neutral-950 object-cover"></video>
              </div>
            </div>
            <div class="w-full lg:w-1/2">
              <h3 class="text-2xl lg:text-3xl font-bold text-white mb-4 text-balance">Auto-Moderation &amp; Server Protection</h3>
              <p class="text-neutral-400 leading-relaxed mb-5 text-pretty">Powerful protection against spam, phishing links, mass mentions, and raids. Configurable filters, AutoMod rules, and detailed moderation logs.</p>
              <a href="${botInviteUrl}" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-neutral-200 transition-[background-color,transform] hover:-translate-y-0.5 active:scale-[0.96] cursor-pointer group/cta">
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div class="mt-10 lg:mt-16 text-center">
          <a href="#pricing" class="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors group/more">
            Explore all modules &amp; features
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3.5 h-3.5 group-hover/more:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </a>
        </div>
      </div>
    </section>
  `;

  // Section 4: All Orbit Features & Planned Features Matrix
  const pricingHtml = `
    <section id="pricing" class="relative bg-neutral-950 py-20 sm:py-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-12 max-w-2xl mx-auto">
          <h2 class="text-4xl sm:text-5xl font-bold text-white tracking-tight text-balance">100% Free for All Servers</h2>
          <p class="text-neutral-400 mt-3 text-sm sm:text-base">No hidden fees, no subscriptions. All core modules are permanently free to use.</p>
        </div>
        
        <div>
          <div class="flex flex-col items-center mb-8">
            <div role="group" aria-label="Feature view" class="relative inline-grid grid-cols-2 p-1 bg-neutral-900/40 border border-neutral-800 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <span id="feature-toggle-pill" aria-hidden="true" class="absolute top-1 bottom-1 left-1 rounded-lg bg-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.10)] transition-transform duration-300 ease-out" style="width:calc(50% - 4px);transform:translateX(0%)"></span>
              <button type="button" id="tab-active-btn" aria-pressed="true" class="relative z-10 inline-flex items-center justify-center px-5 sm:px-7 min-h-[42px] text-sm rounded-lg font-semibold transition-colors duration-200 active:scale-[0.96] focus-visible:outline-none text-white cursor-pointer">
                Active Modules
              </button>
              <button type="button" id="tab-planned-btn" aria-pressed="false" class="relative z-10 inline-flex items-center justify-center px-5 sm:px-7 min-h-[42px] text-sm rounded-lg font-semibold transition-colors duration-200 active:scale-[0.96] focus-visible:outline-none text-neutral-400 hover:text-neutral-200 cursor-pointer">
                Planned Features
              </button>
            </div>
          </div>
          
          <div class="max-w-6xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
            <div id="features-cards-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-stretch">
              <!-- Dynamically populated below -->
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
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Frequently Asked Questions</h2>
        </div>
        
        <div class="space-y-3">
          <div class="border border-neutral-800 rounded-xl overflow-hidden transition-[border-color] duration-200 scroll-animate scroll-animate-delay-1 hover:border-neutral-600">
            <button aria-expanded="false" class="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left cursor-pointer">
              <span class="text-sm sm:text-base font-semibold text-white pr-4">How do I add Orbit to my Discord server?</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <div class="overflow-hidden transition-[max-height,padding] duration-200 max-h-0">
              <p class="px-4 sm:px-6 text-sm text-neutral-400 leading-relaxed">Simply click &quot;Add to My Server&quot; at the top of the website, choose your server from the dropdown, and authorize the bot. Orbit is live and ready in under 30 seconds.</p>
            </div>
          </div>

          <div class="border border-neutral-800 rounded-xl overflow-hidden transition-[border-color] duration-200 scroll-animate scroll-animate-delay-2 hover:border-neutral-600">
            <button aria-expanded="false" class="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left cursor-pointer">
              <span class="text-sm sm:text-base font-semibold text-white pr-4">Is Orbit really completely free?</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <div class="overflow-hidden transition-[max-height,padding] duration-200 max-h-0">
              <p class="px-4 sm:px-6 text-sm text-neutral-400 leading-relaxed">Yes! All core modules — ticket system, auto-moderation, XP &amp; leveling, verification, server stats, embed builder, and audit logs — are permanently 100% free with no paywalls or recurring subscriptions.</p>
            </div>
          </div>

          <div class="border border-neutral-800 rounded-xl overflow-hidden transition-[border-color] duration-200 scroll-animate scroll-animate-delay-3 hover:border-neutral-600">
            <button aria-expanded="false" class="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left cursor-pointer">
              <span class="text-sm sm:text-base font-semibold text-white pr-4">Does Orbit work with my existing server?</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <div class="overflow-hidden transition-[max-height,padding] duration-200 max-h-0">
              <p class="px-4 sm:px-6 text-sm text-neutral-400 leading-relaxed">Yes, absolutely. Orbit integrates smoothly with your existing channels, roles, and permissions. You can configure and toggle each module independently without disrupting your server.</p>
            </div>
          </div>

          <div class="border border-neutral-800 rounded-xl overflow-hidden transition-[border-color] duration-200 scroll-animate scroll-animate-delay-4 hover:border-neutral-600">
            <button aria-expanded="false" class="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left cursor-pointer">
              <span class="text-sm sm:text-base font-semibold text-white pr-4">How does the Components v2 ticket system work?</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <div class="overflow-hidden transition-[max-height,padding] duration-200 max-h-0">
              <p class="px-4 sm:px-6 text-sm text-neutral-400 leading-relaxed">Orbit utilizes Discord's latest component architecture with interactive select menus and buttons. Moderators can claim tickets instantly, and closing a ticket automatically saves a full HTML transcript.</p>
            </div>
          </div>

          <div class="border border-neutral-800 rounded-xl overflow-hidden transition-[border-color] duration-200 scroll-animate scroll-animate-delay-5 hover:border-neutral-600">
            <button aria-expanded="false" class="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left cursor-pointer">
              <span class="text-sm sm:text-base font-semibold text-white pr-4">What features are planned for future releases?</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            <div class="overflow-hidden transition-[max-height,padding] duration-200 max-h-0">
              <p class="px-4 sm:px-6 text-sm text-neutral-400 leading-relaxed">Our upcoming roadmap includes a rich server economy and shop system with mini-games, 24/7 high-fidelity music streaming, advanced automated moderation, custom webhooks, and an open REST API.</p>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-10 scroll-animate">
          <p class="text-sm text-neutral-500">Still have questions? <a href="https://discord.gg/orbit" class="text-white font-medium hover:underline" target="_blank" rel="noopener noreferrer">Join our Discord</a></p>
        </div>
      </div>
    </section>
  `;

  const supportHtml = `
    <section id="support" class="py-10 sm:py-16 px-4 md:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="relative overflow-hidden rounded-3xl border border-white/[0.08] px-6 py-16 sm:px-12 sm:py-24 text-center bg-[#0d0d10] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          
          <!-- Background Floating 3D Rounded Cubes Pattern (Matches Screenshot 1:1) -->
          <div class="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
            <!-- Left cluster of 3D floating tiles -->
            <div class="orbit-pattern-tile absolute rounded-2xl w-16 h-16 top-[13%] left-[3%] opacity-75"></div>
            <div class="orbit-pattern-tile absolute rounded-xl w-11 h-11 top-[37%] left-[9%] opacity-85"></div>
            <div class="orbit-pattern-tile absolute rounded-lg w-7 h-7 top-[22%] left-[17%] opacity-60"></div>
            <div class="orbit-pattern-tile absolute rounded-md w-5 h-5 top-[14%] left-[26%] opacity-40"></div>
            <div class="orbit-pattern-tile absolute rounded-lg w-6 h-6 top-[53%] left-[17%] opacity-55"></div>
            <div class="orbit-pattern-tile absolute rounded-2xl w-[68px] h-[68px] top-[56%] left-[4%] opacity-85"></div>
            <div class="orbit-pattern-tile absolute rounded-lg w-6 h-6 top-[77%] left-[13%] opacity-45"></div>

            <!-- Right cluster of 3D floating tiles -->
            <div class="orbit-pattern-tile absolute rounded-md w-5 h-5 top-[15%] right-[27%] opacity-40"></div>
            <div class="orbit-pattern-tile absolute rounded-2xl w-16 h-16 top-[17%] right-[4%] opacity-75"></div>
            <div class="orbit-pattern-tile absolute rounded-xl w-10 h-10 top-[29%] right-[16%] opacity-65"></div>
            <div class="orbit-pattern-tile absolute rounded-xl w-9 h-9 top-[43%] right-[11%] opacity-80"></div>
            <div class="orbit-pattern-tile absolute rounded-lg w-6 h-6 top-[59%] right-[19%] opacity-50"></div>
            <div class="orbit-pattern-tile absolute rounded-2xl w-[68px] h-[68px] top-[63%] right-[5%] opacity-85"></div>
            <div class="orbit-pattern-tile absolute rounded-xl w-8 h-8 top-[79%] right-[15%] opacity-60"></div>
          </div>

          <!-- Content in Center -->
          <div class="relative z-10 max-w-2xl mx-auto">
            <h2 class="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Need Help?</h2>
            <p class="text-neutral-300 text-base sm:text-lg mb-2 max-w-xl mx-auto leading-relaxed">
              Join our support server for fast help, feature requests, and updates.
            </p>
            <p class="text-sm text-neutral-400 mb-8 sm:mb-10 font-normal">
              Average response time under 1 hour
            </p>
            <div class="flex items-center justify-center">
              <a href="https://discord.gg/orbit" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2.5 font-semibold px-7 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]">
                <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                Join Support Server
                <svg class="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
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
              The all-in-one Discord bot for tickets, auto-moderation, leveling, welcomes, and community management.
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.15em] text-neutral-400 font-medium mb-4">Features</p>
            <ul class="space-y-3">
              <li><a href="#features" class="text-sm text-neutral-400 hover:text-white transition-colors">Tickets</a></li>
              <li><a href="#features" class="text-sm text-neutral-400 hover:text-white transition-colors">Auto-Mod</a></li>
              <li><a href="#features" class="text-sm text-neutral-400 hover:text-white transition-colors">Analytics</a></li>
              <li><a href="#pricing" class="text-sm text-neutral-400 hover:text-white transition-colors">Modules</a></li>
            </ul>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.15em] text-neutral-400 font-medium mb-4">Dashboard</p>
            <ul class="space-y-3">
              <li><a href="/dashboard" class="text-sm text-neutral-400 hover:text-white transition-colors">Overview</a></li>
              <li><a href="/dashboard" class="text-sm text-neutral-400 hover:text-white transition-colors">Modules</a></li>
              <li><a href="/docs" class="text-sm text-neutral-400 hover:text-white transition-colors">Wiki</a></li>
            </ul>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.15em] text-neutral-400 font-medium mb-4">Community</p>
            <ul class="space-y-3">
              <li><a href="https://discord.gg/orbit" target="_blank" rel="noopener noreferrer" class="text-sm text-neutral-400 hover:text-white transition-colors">Discord Server</a></li>
              <li><a href="${botInviteUrl}" target="_blank" class="text-sm text-neutral-400 hover:text-white transition-colors">Invite Bot</a></li>
            </ul>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.15em] text-neutral-400 font-medium mb-4">Legal</p>
            <ul class="space-y-3">
              <li><a href="/privacy" class="text-sm text-neutral-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" class="text-sm text-neutral-400 hover:text-white transition-colors">Terms of Service</a></li>
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

  container.innerHTML = cookieHtml + heroHtml + featuresHtml + pricingHtml + faqHtml + supportHtml + footerHtml;

  // 1. Cookie consent logic
  const cookieBanner = container.querySelector('#cookie-banner');
  if (cookieBanner) {
    const acceptBtn = cookieBanner.querySelector('#cookie-accept-btn');
    const declineBtn = cookieBanner.querySelector('#cookie-decline-btn');
    if (acceptBtn) {
      acceptBtn.onclick = () => {
        try { localStorage.setItem('orbit_cookie_consent', 'accepted'); } catch (e) {}
        cookieBanner.classList.add('opacity-0');
        setTimeout(() => cookieBanner.remove(), 300);
      };
    }
    if (declineBtn) {
      declineBtn.onclick = () => {
        try { localStorage.setItem('orbit_cookie_consent', 'declined'); } catch (e) {}
        cookieBanner.classList.add('opacity-0');
        setTimeout(() => cookieBanner.remove(), 300);
      };
    }
  }

  // 2. Interactive Typewriter Prompts (in English)
  const promptSpan = container.querySelector('.orbit-input-glow p span:first-child');
  const textarea = container.querySelector('.orbit-input-glow textarea');
  const placeholder = container.querySelector('.orbit-input-glow p');
  const submitBtn = container.querySelector('.orbit-input-glow button');
  const form = container.querySelector('form');

  if (promptSpan && form) {
    const samplePrompts = [
      "ticket system with buttons and support categories",
      "auto-moderation with anti-spam and link protection",
      "XP and leveling system with automated role rewards",
      "welcome messages with verification button",
      "live server counter for members, bots, and roles",
      "reaction roles and custom embed messages"
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

  // 3. Modules & Planned Features Toggle Logic
  // ALL 4 CARDS HAVE EQUAL HEIGHTS:
  // - Title: min-h-[56px] / h-14 flex items-center
  // - Status: h-10 flex items-baseline justify-between
  // - Subtitle: h-5 flex items-center
  // - Button: h-10
  // - NO highlight styling (no blue card, no lighter background, no blue button)
  const cardsGrid = container.querySelector('#features-cards-grid');
  const pill = container.querySelector('#feature-toggle-pill');
  const tabActiveBtn = container.querySelector('#tab-active-btn');
  const tabPlannedBtn = container.querySelector('#tab-planned-btn');

  const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-3 h-3 text-neutral-300"><path d="M20 6 9 17l-5-5"></path></svg>`;

  const activeModulesData = [
    {
      title: "Moderation & Protection",
      status: "Included",
      sub: "Permanent",
      btnText: "Add to Server",
      items: [
        "Anti-spam & malicious link filters",
        "AutoMod rules & regex pattern blocks",
        "Warn, mute, kick & ban commands",
        "Detailed moderation audit logs",
        "Discord Components v2 embeds",
        "Role & permission protection",
        "Automated server raid shield"
      ]
    },
    {
      title: "Community & Leveling",
      status: "Included",
      sub: "Permanent",
      btnText: "Add to Server",
      items: [
        "Custom welcome & goodbye messages",
        "Welcome image cards & direct messages",
        "Auto roles & interactive reaction roles",
        "Text & voice XP leveling system",
        "Server leaderboards & rank cards",
        "Level-up automated role rewards",
        "Interactive button verification"
      ]
    },
    {
      title: "Tickets & Support",
      status: "Included",
      sub: "Permanent",
      btnText: "Add to Server",
      items: [
        "Interactive Components v2 ticket panels",
        "Multi-category routing (Support, Staff, etc.)",
        "Moderator ticket claiming & assignment",
        "Searchable HTML transcript archives",
        "One-click ticket close with confirmation",
        "Private Discord channels & threads",
        "Full web dashboard configuration"
      ]
    },
    {
      title: "Stats & Utilities",
      status: "Included",
      sub: "Permanent",
      btnText: "Add to Server",
      items: [
        "Live channel server counters",
        "Member, bot, and role count statistics",
        "Rich embed builder with live preview",
        "Giveaway system with role multipliers",
        "User & server information commands",
        "Interactive polls & voting tools",
        "100% free and open-source foundation"
      ]
    }
  ];

  const plannedFeaturesData = [
    {
      title: "Automated Workflows",
      status: "Planned",
      sub: "Coming Soon",
      btnText: "Suggest Feature",
      items: [
        "Scheduled server announcements & recurring events",
        "Auto-publishing in announcement channels",
        "Custom event triggers & action automations",
        "Server milestone badges & celebrations",
        "Temporary dynamic voice & text channels",
        "Full web dashboard workflow manager"
      ]
    },
    {
      title: "Economy & Server Shop",
      status: "Planned",
      sub: "Coming Soon",
      btnText: "Suggest Feature",
      items: [
        "Custom server currency & digital wallet",
        "Daily login activity rewards (/daily)",
        "Role, color & badge cosmetic shop",
        "Mini-games (Blackjack, Coin-flip, Slots)",
        "Member inventory & item trading system",
        "Web dashboard shop management"
      ]
    },
    {
      title: "Music & Voice Studio",
      status: "Planned",
      sub: "Coming Soon",
      btnText: "Suggest Feature",
      items: [
        "24/7 high-quality voice audio streaming",
        "Spotify, YouTube & SoundCloud support",
        "Soundboard & audio filters (Bassboost, 8D)",
        "Automated temporary voice channels",
        "Web player controls in dashboard",
        "Queue & playlist management"
      ]
    },
    {
      title: "API & Integrations",
      status: "Planned",
      sub: "Coming Soon",
      btnText: "Suggest Feature",
      items: [
        "Custom webhook notifications",
        "Twitch, YouTube & TikTok live alerts",
        "REST API for developers & websites",
        "Cloud backups & 1-click restore",
        "Custom bot branding (Name & Avatar)",
        "Detailed analytics data export"
      ]
    }
  ];

  function renderCards(data) {
    if (!cardsGrid) return;
    cardsGrid.innerHTML = data.map((col, idx) => {
      const borderClass = idx > 0 ? 'md:border-l border-t md:border-t-0 border-neutral-800/60' : '';

      return `
        <div class="relative h-full flex flex-col justify-between px-5 py-6 ${borderClass} bg-transparent">
          <div>
            <!-- Exactly aligned title container -->
            <div class="h-14 flex items-center min-h-[56px]">
              <span class="text-[20px] sm:text-[21px] font-semibold text-white tracking-tight leading-snug">${col.title}</span>
            </div>
            
            <!-- Exactly aligned status / price container -->
            <div class="mt-4 h-10 flex items-baseline justify-between gap-1">
              <span class="text-[22px] font-bold tracking-tight text-white tabular-nums whitespace-nowrap">${col.status}</span>
              <span class="text-neutral-500 text-xs tracking-tight whitespace-nowrap">${col.sub.startsWith('/') ? col.sub : '/' + col.sub}</span>
            </div>
            
            <!-- Exactly aligned subtitle container -->
            <div class="mt-1 h-5 flex items-center min-h-[20px]">
              <p class="text-[12px] leading-[1.4] text-neutral-500 tabular-nums">100% Free forever</p>
            </div>
            
            <!-- Exactly aligned button container -->
            <div class="mt-4">
              <button type="button" class="feature-card-btn w-full h-10 text-xs rounded-full font-semibold transition-[transform,background-color] duration-150 active:scale-[0.96] inline-flex items-center justify-center gap-2 cursor-pointer bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700">
                ${col.btnText}
              </button>
            </div>
            
            <!-- Exactly aligned checklist starting line -->
            <div class="mt-5 pt-5 border-t border-neutral-800/60 space-y-1">
              ${col.items.map(item => `
                <div class="flex items-start gap-2.5 py-[7px]">
                  <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08]">
                    ${checkIcon}
                  </span>
                  <span class="text-[13px] leading-5 text-neutral-300">${item}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Hook card action buttons
    cardsGrid.querySelectorAll('.feature-card-btn').forEach(btn => {
      btn.onclick = () => {
        if (btn.textContent.includes('Suggest Feature')) {
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

  if (typeof window !== 'undefined' && window.API && typeof window.API.getStats === 'function') {
    window.API.getStats().then(stats => {
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
