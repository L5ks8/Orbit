/**
 * Orbit Landing Page
 * Pixel-perfect implementation of the modern PeakBot/Onyx dark theme landing page,
 * fully localized and integrated with the Orbit bot ecosystem.
 */

Pages.Landing = function(container) {
  // Check cookie consent state
  const cookieBannerHtml = !localStorage.getItem('orbit_cookie_consent') ? `
    <div id="cookie-banner" role="dialog" aria-label="Cookie-Zustimmung" class="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-[90] rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <p class="text-[13px] text-neutral-300 leading-relaxed">
        Wir verwenden Analyse-Cookies, um zu verstehen, wie die Website genutzt wird — nur zur Messung, niemals für Werbung. Sehen Sie sich unsere an <a class="text-white underline underline-offset-2 hover:text-neutral-400" href="/privacy">Datenschutzrichtlinie</a>.
      </p>
      <div class="mt-3 flex items-center gap-2">
        <button type="button" id="cookie-accept-btn" class="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-[13px] font-semibold transition-colors active:scale-[0.98] cursor-pointer">Akzeptieren</button>
        <button type="button" id="cookie-decline-btn" class="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[13px] font-medium border border-neutral-700 transition-colors active:scale-[0.98] cursor-pointer">Ablehnen</button>
      </div>
    </div>
  ` : '';

  // SVG Brand Logos for Template Cards
  const Logos = {
    twitch: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#9146FF"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>`,
    spotify: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
    valorant: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#FF4655"><path d="M3.003 2.502h5.75L21 21.498h-5.75zM21 2.502v6.248l-5.75 8.748V11.25z"/></svg>`,
    discord: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>`,
    github: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
    youtube: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    lol: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#C89B3C"><path d="M3 2h3.5v16.5H19V22H3V2zm14 3h4v10h-4V5z"/></svg>`,
    tiktok: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#EE1D52"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
    crypto: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#F7931A"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.351-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.169-1.064-.25l.53-2.127-1.316-.33-.54 2.161c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.41s.975.225.955.239c.535.136.63.496.615.783l-.615 2.47c.036.01.084.025.137.045l-.137-.035-.86 3.46c-.066.162-.232.405-.605.315.013.02-.955-.24-.955-.24l-.655 1.51 1.71.43c.318.08.63.164.939.244l-.545 2.19 1.315.33.54-2.17c.36.096.71.186 1.05.27l-.535 2.15 1.315.33.545-2.19c2.24.42 3.93.25 4.64-1.77.57-1.63-.03-2.57-1.21-3.19.86-.2 1.51-.77 1.68-1.95v.02zm-3.01 4.235c-.4 1.63-3.14.75-4.03.53l.72-2.88c.89.22 3.73.66 3.31 2.35zm.41-4.26c-.37 1.48-2.65.73-3.39.55l.65-2.62c.74.19 3.12.54 2.74 2.07z"/></svg>`,
    roblox: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path d="M5.333 0L0 18.667 18.667 24 24 5.333 5.333 0zm9.067 13.6l-4.267-1.2 1.2-4.267 4.267 1.2-1.2 4.267z"/></svg>`,
    podcast: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#FC3C44"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8zm-1.8 4.2v7.2l6-3.6-6-3.6z"/></svg>`,
    minecraft: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#52A535"><path d="M2.4 2.4h19.2v19.2H2.4V2.4zm2.4 2.4v4.8h4.8V4.8H4.8zm9.6 0v4.8h4.8V4.8h-4.8zm-4.8 4.8v4.8h4.8V9.6H9.6zm-4.8 4.8v4.8h4.8v-4.8H4.8zm9.6 0v4.8h4.8v-4.8h-4.8z"/></svg>`,
    dao: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#627EEA"><path d="M11.944 0L11.77 0.589v15.526l0.174 0.174 7.214-4.266L11.944 0zm0 17.659l-0.1 0.122v5.864l0.1 0.292 7.219-10.155-7.219 3.877zM11.944 0L4.726 12.023l7.218 4.266V0zm0 17.659l-7.218-3.877 7.218 10.155v-6.278zM11.944 15.021l6.155-3.639-6.155-2.8v6.439zm0-7.558l6.155 2.8-6.155-8.497V7.463zm-6.155 3.919l6.155 3.639V8.582l-6.155 2.8zm0-1.119l6.155-2.8V1.766l-6.155 8.497z"/></svg>`,
    epic: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path d="M4.5 0h15s4.5 3 4.5 12c0 9-4.5 12-4.5 12H4.5S0 21 0 12C0 3 4.5 0 4.5 0zm7.5 4.5c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5zm0 3c2.485 0 4.5 2.015 4.5 4.5s-2.015 4.5-4.5 4.5-4.5-2.015-4.5-4.5 2.015-4.5 4.5-4.5z"/></svg>`,
    cs2: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#DE9B35"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l-8-4v8l8 4 8-4v-8l-8 4z"/></svg>`
  };

  // Pre-made Community Server Templates Data
  const templates = [
    {
      title: "Twitch-Streamer",
      category: "Inhaltsersteller",
      color: "pink",
      borderColor: "border-pink-500/45 hover:shadow-pink-500/25",
      bgGradient: "from-pink-500/25 to-transparent",
      tagBg: "bg-pink-500/15 text-pink-300",
      iconSvg: Logos.twitch,
      channels: ["👋・Willkommen", "📜・Regeln", "🔔・Ankündigungen"],
      desc: "Eine Twitch-Community mit Bereichen für Clips, Subs und alle, die einschalten.",
      stats: "17 ch · 6 Rollen"
    },
    {
      title: "Musikproduktion",
      category: "Kunst/Kreativ",
      color: "rose",
      borderColor: "border-rose-500/45 hover:shadow-rose-500/25",
      bgGradient: "from-rose-500/25 to-transparent",
      tagBg: "bg-rose-500/15 text-rose-300",
      iconSvg: Logos.spotify,
      channels: ["📌・Willkommen", "📖・Regeln", "📣・Ankündigungen"],
      desc: "Produzenten-Community mit Feedback, Zusammenarbeit und Sample-Sharing.",
      stats: "15 ch · 5 Rollen"
    },
    {
      title: "Valorant-Team",
      category: "Spielen",
      color: "violet",
      borderColor: "border-violet-500/45 hover:shadow-violet-500/25",
      bgGradient: "from-violet-500/25 to-transparent",
      tagBg: "bg-violet-500/15 text-violet-300",
      iconSvg: Logos.valorant,
      channels: ["📢・Ankündigungen", "📜・Regeln", "📅・Zeitplan"],
      desc: "Wettbewerbsfähiger Valorant-Teamserver mit Scrims, Tryouts und VOD-Rezension.",
      stats: "17 ch · 6 Rollen"
    },
    {
      title: "Sozialer Treffpunkt",
      category: "Gemeinschaft",
      color: "green",
      borderColor: "border-green-500/45 hover:shadow-green-500/25",
      bgGradient: "from-green-500/25 to-transparent",
      tagBg: "bg-green-500/15 text-green-300",
      iconSvg: Logos.discord,
      channels: ["📜・Regeln", "👋・Einführungen", "🎭・Rollen"],
      desc: "Öffentlicher sozialer Server, um neue Leute kennenzulernen und Freunde zu finden.",
      stats: "15 ch · 6 Rollen"
    },
    {
      title: "Open-Source-Projekt",
      category: "Technik/Entw",
      color: "cyan",
      borderColor: "border-cyan-500/45 hover:shadow-cyan-500/25",
      bgGradient: "from-cyan-500/25 to-transparent",
      tagBg: "bg-cyan-500/15 text-cyan-300",
      iconSvg: Logos.github,
      channels: ["📌・Willkommen", "📣・Ankündigungen", "🚀・Veröffentlichungen"],
      desc: "Open-Source-Community mit Beiträgen, Problemen und schnellen Releases.",
      stats: "14 ch · 5 Rollen"
    },
    {
      title: "YouTube-Ersteller",
      category: "Inhaltsersteller",
      color: "pink",
      borderColor: "border-pink-500/45 hover:shadow-pink-500/25",
      bgGradient: "from-pink-500/25 to-transparent",
      tagBg: "bg-pink-500/15 text-pink-300",
      iconSvg: Logos.youtube,
      channels: ["📖・Willkommen", "📜・Regeln", "🔔・Ankündigungen"],
      desc: "Ein elegantes Zuhause für YouTuber – Clips, Diskussionen und Member-Bereiche.",
      stats: "18 ch · 5 Rollen"
    },
    {
      title: "Liga der Legenden",
      category: "Spielen",
      color: "violet",
      borderColor: "border-violet-500/45 hover:shadow-violet-500/25",
      bgGradient: "from-violet-500/25 to-transparent",
      tagBg: "bg-violet-500/15 text-violet-300",
      iconSvg: Logos.lol,
      channels: ["📢・Ankündigungen", "📜・Regeln", "🎭・Rollenauswahl"],
      desc: "LoL-Community mit Ranglisten-LFG, Champion-Diskussion und Turnieren.",
      stats: "16 ch · 6 Rollen"
    },
    {
      title: "TikTok-Ersteller",
      category: "Inhaltsersteller",
      color: "pink",
      borderColor: "border-pink-500/45 hover:shadow-pink-500/25",
      bgGradient: "from-pink-500/25 to-transparent",
      tagBg: "bg-pink-500/15 text-pink-300",
      iconSvg: Logos.tiktok,
      channels: ["👋・Willkommen", "📜・Regeln", "🔔・Ankündigungen"],
      desc: "Eine TikTok-Ersteller-Community für Kollaborationen, Trends und Chat.",
      stats: "14 ch · 5 Rollen"
    },
    {
      title: "Krypto-Handel",
      category: "Finanzen",
      color: "emerald",
      borderColor: "border-emerald-500/45 hover:shadow-emerald-500/25",
      bgGradient: "from-emerald-500/25 to-transparent",
      tagBg: "bg-emerald-500/15 text-emerald-300",
      iconSvg: Logos.crypto,
      channels: ["📊・Analyse", "🔔・Signale", "📰・Neuigkeiten"],
      desc: "Eine Krypto-Community für Chart-Analysen, Signale und Marktgespräche.",
      stats: "10 ch · 4 Rollen"
    },
    {
      title: "Roblox-Gruppe",
      category: "Spielen",
      color: "violet",
      borderColor: "border-violet-500/45 hover:shadow-violet-500/25",
      bgGradient: "from-violet-500/25 to-transparent",
      tagBg: "bg-violet-500/15 text-violet-300",
      iconSvg: Logos.roblox,
      channels: ["📢・Ankündigungen", "📜・Regeln", "🎁・Gruppenbelohnungen"],
      desc: "Roblox-Community für Spielempfehlungen, Handel und Gruppen-Events.",
      stats: "15 ch · 6 Rollen"
    },
    {
      title: "Podcast-Netzwerk",
      category: "Inhaltsersteller",
      color: "pink",
      borderColor: "border-pink-500/45 hover:shadow-pink-500/25",
      bgGradient: "from-pink-500/25 to-transparent",
      tagBg: "bg-pink-500/15 text-pink-300",
      iconSvg: Logos.podcast,
      channels: ["👋・Willkommen", "📜・Regeln", "🔔・Ankündigungen"],
      desc: "Podcast-Community mit Episodendiskussionen, Q&As und Feedback.",
      stats: "13 ch · 5 Rollen"
    },
    {
      title: "Minecraft SMP",
      category: "Spielen",
      color: "violet",
      borderColor: "border-violet-500/45 hover:shadow-violet-500/25",
      bgGradient: "from-violet-500/25 to-transparent",
      tagBg: "bg-violet-500/15 text-violet-300",
      iconSvg: Logos.minecraft,
      channels: ["📢・Ankündigungen", "📜・Regeln", "🌐・Server-IP"],
      desc: "Survival-Multiplayer-Server mit Build-Showcase und Events.",
      stats: "17 ch · 6 Rollen"
    },
    {
      title: "DAO-Governance",
      category: "Geschäft",
      color: "blue",
      borderColor: "border-blue-500/45 hover:shadow-blue-500/25",
      bgGradient: "from-blue-500/25 to-transparent",
      tagBg: "bg-blue-500/15 text-blue-300",
      iconSvg: Logos.dao,
      channels: ["👋・Willkommen", "📜・Regeln", "🔔・Ankündigungen"],
      desc: "Dezentrale Organisation mit Vorschlägen, Abstimmungen und Treasury.",
      stats: "14 ch · 5 Rollen"
    },
    {
      title: "Fortnite-Hub",
      category: "Spielen",
      color: "violet",
      borderColor: "border-violet-500/45 hover:shadow-violet-500/25",
      bgGradient: "from-violet-500/25 to-transparent",
      tagBg: "bg-violet-500/15 text-violet-300",
      iconSvg: Logos.epic,
      channels: ["📢・Ankündigungen", "📜・Regeln", "🛒・Item-Shop"],
      desc: "Fortnite-Community mit kreativen Codes, Item-Shop-Updates und Squads.",
      stats: "16 ch · 6 Rollen"
    },
    {
      title: "CS2-Team",
      category: "Spielen",
      color: "violet",
      borderColor: "border-violet-500/45 hover:shadow-violet-500/25",
      bgGradient: "from-violet-500/25 to-transparent",
      tagBg: "bg-violet-500/15 text-violet-300",
      iconSvg: Logos.cs2,
      channels: ["📢・Ankündigungen", "📜・Regeln", "📅・Zeitplan"],
      desc: "Counter-Strike 2-Wettbewerbsteam mit Trainingsplänen und Demos.",
      stats: "16 ch · 6 Rollen"
    }
  ];

  // Helper to render template cards HTML
  const renderTemplateCards = (list) => list.map(t => `
    <div class="block flex-shrink-0 w-[300px]">
      <div class="group relative rounded-[20px] overflow-hidden h-full bg-neutral-900 border ${t.borderColor} transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]">
        <div class="bg-gradient-to-b ${t.bgGradient} p-3 pb-0">
          <div class="bg-neutral-950/80 rounded-lg border border-white/[0.06] overflow-hidden">
            <div class="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-white/[0.04]">
              <span class="w-7 h-7 rounded-lg bg-neutral-900 grid place-items-center flex-shrink-0 shadow-sm ring-1 ring-white/10">
                ${t.iconSvg}
              </span>
              <span class="text-white text-xs font-semibold truncate">${t.title}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-500 ml-auto flex-shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
            </div>
            <div class="px-2.5 py-2 h-[74px] overflow-hidden">
              ${t.channels.map(ch => `
                <div class="flex items-center gap-1.5 px-1.5 py-[3px] text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-500 shrink-0"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                  <span class="text-[11px] truncate">${ch}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="h-3"></div>
        </div>
        <div class="px-5 pb-5 pt-1">
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="text-base font-semibold text-white leading-snug text-balance">${t.title}</h3>
            <span class="text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${t.tagBg}">${t.category}</span>
          </div>
          <p class="text-neutral-400 text-xs leading-relaxed mb-4 line-clamp-2 h-9 text-pretty">${t.desc}</p>
          <div class="flex items-center gap-4 text-xs pt-3 border-t border-neutral-800/60">
            <span class="flex items-center gap-1.5 text-neutral-400 tabular-nums">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path></svg>
              ${t.stats}
            </span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Assemble Complete Landing Page
  container.innerHTML = `
    <!-- Cookie Dialog -->
    ${cookieBannerHtml}

    <main class="min-h-screen bg-neutral-950 overflow-x-hidden text-neutral-100">
      
      <!-- HERO SECTION -->
      <section class="relative min-h-[100svh] flex items-center justify-center px-4 sm:px-6 overflow-hidden" style="background:linear-gradient(to bottom, #141420 0%, #0a0a0a 80%); padding-top: 7rem; padding-bottom: 3rem;">
        
        <!-- Radial Dot Grids & Glow Layers -->
        <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(ellipse 80% 60% at 50% 42%, rgba(255,255,255,0.04) 0%, transparent 70%)"></div>
        <div class="absolute inset-0 pointer-events-none" style="background-image:radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px); background-size:24px 24px; mask-image:radial-gradient(ellipse 70% 65% at 50% 48%, black 35%, transparent 82%); -webkit-mask-image:radial-gradient(ellipse 70% 65% at 50% 48%, black 35%, transparent 82%)"></div>
        
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[600px] h-[400px] sm:w-[900px] sm:h-[600px] rounded-full bg-indigo-500/[0.12] blur-[70px] sm:blur-[150px]"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[340px] h-[280px] sm:w-[500px] sm:h-[400px] rounded-full bg-violet-500/[0.09] blur-[60px] sm:blur-[120px]"></div>
        </div>

        <div class="max-w-3xl mx-auto w-full relative z-10 text-center pb-8 sm:pb-16 pt-12">
          
          <h1 class="hero-heading text-[2.2rem] sm:text-[2.8rem] md:text-[3.5rem] lg:text-[4rem] font-bold mb-3 sm:mb-4 animate-fade-in-up leading-[1.08] tracking-[-0.02em] text-white text-balance">
            Der einfachste Weg, Ihren Discord-Server aufzubauen
          </h1>

          <p class="hero-subtitle text-xs sm:text-sm md:text-base text-neutral-300 font-light text-pretty mb-6 sm:mb-8 lg:mb-10 max-w-xl mx-auto">
            Der All-in-One KI-Bot für Server-Setup, Rollen, Tickets, Moderation und mehr.
          </p>

          <!-- Interactive AI Prompt Form -->
          <form id="hero-ai-form" class="w-full max-w-2xl lg:max-w-3xl mx-auto mb-6 sm:mb-8 lg:mb-10">
            <div class="ai-input-glow relative rounded-[28px] bg-neutral-900/95 text-left">
              <div class="relative px-4 sm:px-7 py-4 sm:py-6 pr-12 sm:pr-[4.5rem]">
                <div class="min-h-[48px] sm:min-h-[60px] relative">
                  <p id="typewriter-placeholder" class="absolute top-0 left-0 right-0 text-neutral-500 text-sm sm:text-lg pointer-events-none select-none transition-opacity duration-200">
                    Bau mir ein <span id="typewriter-text" class="text-neutral-400">YouTube-Community mit Early Access und Member-Stufen</span><span class="inline-block w-[2px] h-4 sm:h-5 bg-indigo-400 ml-0.5 align-middle animate-pulse"></span>
                  </p>
                  <textarea id="hero-ai-input" class="w-full bg-transparent text-white text-sm sm:text-lg resize-none outline-none border-none focus:ring-0 focus:outline-none relative z-10 caret-indigo-400 appearance-none" rows="2"></textarea>
                </div>
                <button type="submit" id="hero-ai-submit" class="absolute bottom-3 sm:bottom-5 right-3 sm:right-5 bg-white hover:bg-neutral-200 text-black p-2 sm:p-2.5 rounded-full transition-all active:scale-[0.96] cursor-pointer shadow-lg z-20" aria-label="Nachricht senden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
                </button>
              </div>
            </div>
          </form>

          <!-- Call-to-Action Buttons -->
          <div class="hero-ctas flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            <a href="/dashboard" class="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black text-sm sm:text-base font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full btn-glow cursor-pointer transition-all active:scale-95">
              Gehen Sie zum Dashboard
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
            <a href="#features" class="flex items-center gap-2 text-white text-sm sm:text-base font-medium px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.18] transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer">
              Sehen Sie es in Aktion
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
          </div>

          <!-- Social Proof -->
          <div class="flex items-center justify-center gap-3">
            <div class="flex -space-x-2">
              <div class="w-8 h-8 rounded-full bg-indigo-600 border-2 border-neutral-950 flex items-center justify-center text-[10px] font-bold">🎮</div>
              <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-neutral-950 flex items-center justify-center text-[10px] font-bold">🚀</div>
              <div class="w-8 h-8 rounded-full bg-pink-600 border-2 border-neutral-950 flex items-center justify-center text-[10px] font-bold">💎</div>
            </div>
            <p class="text-sm text-neutral-400">
              Vertrauenswürdig von <span class="text-white font-semibold" id="hero-server-count">13.000+</span> Gemeinschaften
            </p>
          </div>

        </div>

        <!-- Bobbing Scroll Indicator -->
        <div class="absolute bottom-6 left-0 right-0 z-10 flex justify-center">
          <a href="#features" class="flex flex-col items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer" aria-label="Scrollen Sie nach unten">
            <span class="text-[10px] uppercase tracking-[0.2em] font-semibold">Scrollen</span>
            <div class="hero-bob">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
            </div>
          </a>
        </div>
      </section>

      <!-- FEATURES SECTION ("Ersetzen Sie 6 Bots durch einen") -->
      <section id="features" class="section-padding px-6 scroll-mt-20">
        <div class="max-w-5xl mx-auto">
          
          <div class="text-center mb-12 lg:mb-16 max-w-2xl mx-auto">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              Ersetzen Sie 6 Bots durch einen
            </h2>
            <p class="text-neutral-400 text-sm mt-3">Ein einziger Bot für Moderation, Tickets, Willkommen, Leveling, Statistiken und KI.</p>
          </div>

          <div class="space-y-12 lg:space-y-20">
            
            <!-- Feature 1: KI Server Builder -->
            <div class="flex flex-col-reverse lg:flex-row gap-6 lg:gap-14 items-center">
              <div class="w-full lg:w-1/2 flex-shrink-0">
                <div class="overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-900/90 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_30px_80px_-40px_rgba(0,0,0,0.9)] p-6">
                  <div class="flex items-center gap-2 pb-4 border-b border-neutral-800">
                    <span class="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
                    <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                    <span class="text-xs text-neutral-400 font-mono ml-2">Orbit AI Server Builder</span>
                  </div>
                  <div class="mt-4 space-y-2.5 font-mono text-xs">
                    <div class="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-indigo-300">
                      &gt; Generiere Discord Struktur für Gaming & Streaming...
                    </div>
                    <div class="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60 text-neutral-300 space-y-1">
                      <div class="text-emerald-400 font-bold">✓ 8 Kategorien erstellt</div>
                      <div class="text-neutral-400">✓ 24 Kanäle mit Berechtigungen konfiguriert</div>
                      <div class="text-neutral-400">✓ 6 Rollen (Admin, Mod, VIP, Member) zugewiesen</div>
                      <div class="text-indigo-400">✓ Ticket- & Auto-Mod-Filter scharfgeschaltet</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="w-full lg:w-1/2">
                <h3 class="text-2xl lg:text-3xl font-bold text-white mb-4 text-balance">KI-Server-Builder</h3>
                <p class="text-neutral-400 leading-relaxed mb-6 text-pretty">
                  Kompletter Server-Aufbau aus einer einfachen Beschreibung. KI, die deinen Server-Kontext wirklich versteht – Kanäle, Rollen, Berechtigungen und Automatisierung in Sekunden erstellt.
                </p>
                <a href="/dashboard" class="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-neutral-200 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer">
                  Loslegen
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </a>
              </div>
            </div>

            <!-- Feature 2: Fragen Sie Ihre Analyse -->
            <div class="flex flex-col-reverse lg:flex-row-reverse gap-6 lg:gap-14 items-center">
              <div class="w-full lg:w-1/2 flex-shrink-0">
                <div class="overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-900/90 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_30px_80px_-40px_rgba(0,0,0,0.9)] p-6">
                  <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
                    <span class="text-xs font-semibold text-white">Community Engagement Live</span>
                    <span class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">+28.4% Aktivität</span>
                  </div>
                  <div class="mt-4 flex items-end gap-2 h-32 pt-6">
                    <div class="flex-1 bg-neutral-800 rounded-t-lg h-[40%]"></div>
                    <div class="flex-1 bg-neutral-800 rounded-t-lg h-[60%]"></div>
                    <div class="flex-1 bg-indigo-900/60 rounded-t-lg h-[55%]"></div>
                    <div class="flex-1 bg-indigo-700/80 rounded-t-lg h-[75%]"></div>
                    <div class="flex-1 bg-indigo-500 rounded-t-lg h-[95%]"></div>
                    <div class="flex-1 bg-indigo-400 rounded-t-lg h-[85%]"></div>
                    <div class="flex-1 bg-white rounded-t-lg h-[100%] shadow-lg"></div>
                  </div>
                  <div class="mt-4 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
                    💡 <strong>Orbit Insight:</strong> Der Chat ist sonntags zwischen 19:00 und 22:00 Uhr am aktivsten.
                  </div>
                </div>
              </div>
              <div class="w-full lg:w-1/2">
                <h3 class="text-2xl lg:text-3xl font-bold text-white mb-4 text-balance">Fragen Sie Ihre Analyse</h3>
                <p class="text-neutral-400 leading-relaxed mb-6 text-pretty">
                  Stellen Sie eine einfache Frage und erhalten Sie ein Live-Diagramm mit einer klaren Antwort – und beheben Sie sofort, was die Aktivität auf Ihrem Server bremst.
                </p>
                <a href="/dashboard" class="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-neutral-200 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer">
                  Legen Sie los
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </a>
              </div>
            </div>

            <!-- Feature 3: Moderation & Commands -->
            <div class="flex flex-col-reverse lg:flex-row gap-6 lg:gap-14 items-center">
              <div class="w-full lg:w-1/2 flex-shrink-0">
                <div class="overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-900/90 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_30px_80px_-40px_rgba(0,0,0,0.9)] p-6">
                  <div class="flex items-center gap-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <span class="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">/</span>
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-white">/role all &lt;@Community&gt;</div>
                      <div class="text-[11px] text-neutral-400">Vergibt Rollen blitzschnell mit Components V2 Fortschritt.</div>
                    </div>
                  </div>
                  <div class="mt-3 flex items-center gap-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <span class="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">✓</span>
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-white">Automod &amp; Raid Protection</div>
                      <div class="text-[11px] text-neutral-400">Spam, Phishing-Links und bösartige Raids in 15ms blockiert.</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="w-full lg:w-1/2">
                <h3 class="text-2xl lg:text-3xl font-bold text-white mb-4 text-balance">Führen Sie es direkt von Discord aus</h3>
                <p class="text-neutral-400 leading-relaxed mb-6 text-pretty">
                  Rollen vergeben, Support-Tickets öffnen, Verstöße abmahnen und Kanäle sperren in einfachen Befehlen – kein ständiges Wechseln ins Web nötig.
                </p>
                <a href="/docs" class="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-neutral-200 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer">
                  Befehle ansehen
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </a>
              </div>
            </div>

          </div>

          <!-- 28 More Features Link -->
          <div class="mt-12 lg:mt-16 text-center">
            <a href="/docs" class="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm font-semibold transition-colors">
              +28 weitere Funktionen entdecken
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
          </div>

        </div>
      </section>

      <!-- TEMPLATES SECTION ("Beginnen Sie mit einer Vorlage") -->
      <section id="templates" class="section-padding scroll-mt-20 overflow-hidden">
        <div class="max-w-6xl mx-auto px-6 text-center mb-8 lg:mb-12">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight text-balance">
            Beginnen Sie mit einer Vorlage
          </h2>
          <p class="text-neutral-400 text-sm mt-2 max-w-lg mx-auto">Wählen Sie ein vorgefertigtes Template für Gaming, Content Creator, Krypto oder Communities.</p>
        </div>

        <div class="marquee-viewport py-2">
          <div class="marquee-track gap-5 py-2">
            ${renderTemplateCards(templates)}
            ${renderTemplateCards(templates)}
          </div>
        </div>

        <div class="flex justify-center mt-8 lg:mt-12 px-6">
          <a class="inline-flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] border border-neutral-800 hover:border-neutral-600 text-white text-sm font-medium px-6 py-3 rounded-full transition-all duration-200 hover:-translate-y-0.5 active:scale-95" href="/docs">
            Durchsuchen Sie alle Vorlagen
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </a>
        </div>
      </section>

      <!-- PRICING SECTION ("Der größte Teil von Orbit ist kostenlos") -->
      <section id="pricing" class="relative bg-neutral-950 py-20 sm:py-28">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div class="text-center mb-10 max-w-2xl mx-auto">
            <h2 class="text-4xl sm:text-5xl font-bold text-white tracking-tight text-balance">
              Der größte Teil von Orbit ist kostenlos
            </h2>
            <p class="text-neutral-400 text-sm mt-3">Skalierbar von der ersten Gaming-Gruppe bis zu 100.000+ Mitglieder Servern.</p>
          </div>

          <!-- Billing Interval Toggle -->
          <div class="flex flex-col items-center mb-10">
            <div role="group" aria-label="Abrechnungszeitraum" class="relative inline-grid grid-cols-2 p-1 bg-neutral-900/60 border border-neutral-800 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <span id="pricing-slider" aria-hidden="true" class="absolute top-1 bottom-1 left-1 rounded-lg bg-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.10)] transition-transform duration-300 ease-out" style="width:calc(50% - 4px); transform:translateX(100%);"></span>
              <button type="button" id="toggle-monthly" class="relative z-10 inline-flex items-center justify-center px-5 sm:px-7 min-h-[42px] text-sm rounded-lg font-semibold transition-colors duration-200 cursor-pointer text-neutral-400 hover:text-neutral-200">
                Monatlich
              </button>
              <button type="button" id="toggle-yearly" class="relative z-10 inline-flex items-center justify-center gap-2 px-5 sm:px-7 min-h-[42px] text-sm rounded-lg font-semibold transition-colors duration-200 cursor-pointer text-white">
                Jährlich <span class="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold">-25%</span>
              </button>
            </div>
          </div>

          <!-- 4 Tier Pricing Grid -->
          <div class="max-w-6xl mx-auto rounded-3xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-2xl">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-start">
              
              <!-- TIER 1: FREI -->
              <div class="relative h-full px-5 py-6">
                <div class="flex items-center justify-between gap-2 min-h-[24px]">
                  <span class="text-[22px] font-semibold text-white tracking-tight">Frei</span>
                </div>
                <div class="mt-5 flex items-baseline gap-1">
                  <span class="text-[32px] leading-none font-bold tracking-tight text-white tabular-nums">$0</span>
                  <span class="text-neutral-500 text-[13px]">/für immer</span>
                </div>
                <div class="mt-1.5 min-h-[17px]">
                  <p class="text-[12px] text-neutral-500">Kein Konto &amp; keine Kreditkarte erforderlich</p>
                </div>
                <div class="mt-5">
                  <a href="https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=564430072179839&scope=bot+applications.commands" target="_blank" class="w-full h-10 text-xs rounded-full font-semibold transition-all duration-150 active:scale-95 inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 cursor-pointer">
                    Zum Server hinzufügen
                  </a>
                </div>
                <div class="mt-6 pt-5 border-t border-neutral-800/60 space-y-2.5">
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Moderation, XP &amp; Levelaufstieg, Tickets</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Willkommensnachrichten und Rollen</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Anti-Raid Schutz und Audit Logs</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Benutzerdefinierter Embed-Builder</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Über 30 Funktionen, keine zeitliche Begrenzung</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center flex-shrink-0 text-neutral-600">✕</span>
                    <span class="text-[13px] leading-5 text-neutral-600">Kein benutzerdefiniertes Bot-Profil</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center flex-shrink-0 text-neutral-600">✕</span>
                    <span class="text-[13px] leading-5 text-neutral-600">Keine KI-Moderation</span>
                  </div>
                </div>
              </div>

              <!-- TIER 2: STARTER -->
              <div class="relative h-full px-5 py-6 md:border-l border-t md:border-t-0 border-neutral-800/60">
                <div class="flex items-center justify-between gap-2 min-h-[24px]">
                  <span class="text-[22px] font-semibold text-white tracking-tight">Starter</span>
                </div>
                <div class="mt-5 flex items-baseline gap-1">
                  <span class="text-[32px] leading-none font-bold tracking-tight text-white tabular-nums tier-starter-price">$4.00</span>
                  <span class="text-neutral-500 text-[13px]">/Mo</span>
                </div>
                <div class="mt-1.5 min-h-[17px]">
                  <p class="text-[12px] text-neutral-500 tier-starter-sub">in Rechnung gestellt $48.00/Jahr · war <span class="line-through text-neutral-600">$69.00</span></p>
                </div>
                <div class="mt-5">
                  <a href="/dashboard" class="w-full h-10 text-xs rounded-full font-semibold transition-all duration-150 active:scale-95 inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 cursor-pointer">
                    Wählen Sie Starter
                  </a>
                </div>
                <div class="mt-6 pt-5 border-t border-neutral-800/60 space-y-2.5">
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-white font-semibold">Alles im Free-Plan</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Benutzerdefiniertes Bot-Profil (Avatar &amp; Status)</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Willkommens-Bild-Uploads und Direktnachrichten</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Sprach-XP Multiplikatoren &amp; Aktivitäts-Tracking</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Automatisches Schließen von inaktiven Tickets</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">5 tägliche Server-Backups</span>
                  </div>
                </div>
              </div>

              <!-- TIER 3: PROFI (POPULAR) -->
              <div class="relative h-full px-5 py-6 bg-indigo-500/[0.06] md:border-l border-t md:border-t-0 border-neutral-800/60 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]">
                <div class="flex items-center justify-between gap-2 min-h-[24px]">
                  <span class="text-[22px] font-semibold text-white tracking-tight">Profi</span>
                  <span class="inline-flex items-center bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-[3px] rounded-full whitespace-nowrap shadow-md shadow-indigo-500/30">
                    Am beliebtesten
                  </span>
                </div>
                <div class="mt-5 flex items-baseline gap-1">
                  <span class="text-[32px] leading-none font-bold tracking-tight text-white tabular-nums tier-pro-price">$5.75</span>
                  <span class="text-neutral-500 text-[13px]">/Mo</span>
                </div>
                <div class="mt-1.5 min-h-[17px]">
                  <p class="text-[12px] text-neutral-500 tier-pro-sub">in Rechnung gestellt $69.00/Jahr · war <span class="line-through text-neutral-600">$99.00</span></p>
                </div>
                <div class="mt-5">
                  <a href="/dashboard" class="w-full h-10 text-xs rounded-full font-semibold transition-all duration-150 active:scale-95 inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_6px_20px_-6px_rgba(99,102,241,0.6)] cursor-pointer">
                    Holen Sie sich Pro
                  </a>
                </div>
                <div class="mt-6 pt-5 border-t border-neutral-800/60 space-y-2.5">
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-500 text-white font-bold">✓</span>
                    <span class="text-[13px] leading-5 text-white font-semibold">Alles im Starter-Plan</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-500 text-white font-bold">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-200 font-medium">KI Server Builder mit Plain-English Prompts</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-500 text-white font-bold">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">KI-Moderation (Text &amp; Bildfilter)</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-500 text-white font-bold">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Unbegrenzte KI-Moderationskanäle</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-500 text-white font-bold">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">25 tägliche automatische Backups</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-500 text-white font-bold">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Vorrangiger Priority Support</span>
                  </div>
                </div>
              </div>

              <!-- TIER 4: AGENTUR -->
              <div class="relative h-full px-5 py-6 md:border-l border-t md:border-t-0 border-neutral-800/60">
                <div class="flex items-center justify-between gap-2 min-h-[24px]">
                  <span class="text-[22px] font-semibold text-white tracking-tight">Agentur</span>
                </div>
                <div class="mt-5 flex items-baseline gap-1">
                  <span class="text-[32px] leading-none font-bold tracking-tight text-white tabular-nums tier-agency-price">$14.50</span>
                  <span class="text-neutral-500 text-[13px]">/Mo</span>
                </div>
                <div class="mt-1.5 min-h-[17px]">
                  <p class="text-[12px] text-neutral-500 tier-agency-sub">in Rechnung gestellt $174.00/Jahr · war <span class="line-through text-neutral-600">$249.00</span></p>
                </div>
                <div class="mt-5">
                  <a href="/dashboard" class="w-full h-10 text-xs rounded-full font-semibold transition-all duration-150 active:scale-95 inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 cursor-pointer">
                    Wählen Sie Agentur
                  </a>
                </div>
                <div class="mt-6 pt-5 border-t border-neutral-800/60 space-y-2.5">
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-white font-semibold">Alles in Pro enthalten</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Bis zu 100 Server pro Account abgedeckt</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">AI Server Builder auf jedem Server</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Unbegrenzte tägliche Backups</span>
                  </div>
                  <div class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.08] text-white">✓</span>
                    <span class="text-[13px] leading-5 text-neutral-300">Individuelles Branding &amp; Dedicated Manager</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- FAQ SECTION ("Häufige Fragen") -->
      <section id="faq" class="section-padding px-6">
        <div class="max-w-3xl mx-auto">
          
          <div class="text-center mb-10">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">Häufige Fragen</h2>
            <p class="text-neutral-400 text-sm mt-3">Hier finden Sie Antworten auf die wichtigsten Fragen rund um Orbit.</p>
          </div>

          <div class="space-y-3" id="faq-accordion-list">
            
            <!-- Q1 -->
            <div class="faq-item border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-200 bg-neutral-900/40 hover:border-neutral-700">
              <button type="button" class="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer">
                <span class="text-sm sm:text-base font-semibold text-white pr-4">Wie füge ich Orbit zu meinem Server hinzu?</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron text-neutral-400 transition-transform duration-200 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              <div class="faq-answer hidden px-5 sm:px-6 pb-5 pt-0 text-sm text-neutral-400 leading-relaxed">
                Klicken Sie einfach auf unserer Website auf „Add to Discord“, wählen Sie Ihren Discord-Server aus der Dropdown-Liste aus und genehmigen Sie die Berechtigungen. Orbit ist in weniger als 30 Sekunden live, für den Start ist keine Konfiguration erforderlich. Das kostenlose Kontingent ist dauerhaft gültig.
              </div>
            </div>

            <!-- Q2 -->
            <div class="faq-item border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-200 bg-neutral-900/40 hover:border-neutral-700">
              <button type="button" class="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer">
                <span class="text-sm sm:text-base font-semibold text-white pr-4">Ist Orbit kostenlos?</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron text-neutral-400 transition-transform duration-200 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              <div class="faq-answer hidden px-5 sm:px-6 pb-5 pt-0 text-sm text-neutral-400 leading-relaxed">
                Ja, Orbit bietet über 30 Kernfunktionen, die völlig kostenlos und ohne zeitliche Begrenzung verfügbar sind: Moderation, Willkommensnachrichten, Reaktionsrollen, XP &amp; Levelaufstieg, Tickets, Protokollierung, Raid-Schutz und der Embed-Builder sind alle dauerhaft gratis.
              </div>
            </div>

            <!-- Q3 -->
            <div class="faq-item border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-200 bg-neutral-900/40 hover:border-neutral-700">
              <button type="button" class="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer">
                <span class="text-sm sm:text-base font-semibold text-white pr-4">Benötige ich Programmierkenntnisse, um Orbit nutzen zu können?</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron text-neutral-400 transition-transform duration-200 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              <div class="faq-answer hidden px-5 sm:px-6 pb-5 pt-0 text-sm text-neutral-400 leading-relaxed">
                Überhaupt nicht. Orbit wurde für maximale Benutzerfreundlichkeit entwickelt. Mit dem intuitiven Dashboard und dem AI Server Builder können Sie Ihren gesamten Server in einfacher Sprache einrichten. Alle Einstellungen lassen sich mit Schaltern und Dropdown-Menüs steuern.
              </div>
            </div>

            <!-- Q4 -->
            <div class="faq-item border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-200 bg-neutral-900/40 hover:border-neutral-700">
              <button type="button" class="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer">
                <span class="text-sm sm:text-base font-semibold text-white pr-4">Was passiert, wenn mein Abonnement endet?</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron text-neutral-400 transition-transform duration-200 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              <div class="faq-answer hidden px-5 sm:px-6 pb-5 pt-0 text-sm text-neutral-400 leading-relaxed">
                Ihr Server läuft nahtlos mit allen kostenlosen Funktionen weiter – es werden keinerlei Daten oder Rollen gelöscht. Nur erweiterte Premium-Funktionen werden pausiert, bis Sie das Abonnement erneuern.
              </div>
            </div>

            <!-- Q5 -->
            <div class="faq-item border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-200 bg-neutral-900/40 hover:border-neutral-700">
              <button type="button" class="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer">
                <span class="text-sm sm:text-base font-semibold text-white pr-4">Kann ich Orbit auf mehreren Servern verwenden?</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron text-neutral-400 transition-transform duration-200 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              <div class="faq-answer hidden px-5 sm:px-6 pb-5 pt-0 text-sm text-neutral-400 leading-relaxed">
                Ja! Die kostenlose Stufe funktioniert auf unbegrenzt vielen Servern. Mit dem Agency-Plan können Sie bis zu 100 Server gleichzeitig mit Pro-Funktionen verwalten.
              </div>
            </div>

            <!-- Q6 -->
            <div class="faq-item border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-200 bg-neutral-900/40 hover:border-neutral-700">
              <button type="button" class="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer">
                <span class="text-sm sm:text-base font-semibold text-white pr-4">Wie funktioniert die KI-Moderation?</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron text-neutral-400 transition-transform duration-200 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              <div class="faq-answer hidden px-5 sm:px-6 pb-5 pt-0 text-sm text-neutral-400 leading-relaxed">
                Orbit nutzt modernste Sprachmodelle (Groq &amp; Llama-3), um Kontext und Absicht von Nachrichten zu verstehen. Dadurch werden Beleidigungen, Spam-Muster, Betrugsversuche und Raids in Echtzeit ohne störende Fehlalarme gestoppt.
              </div>
            </div>

            <!-- Q7 -->
            <div class="faq-item border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-200 bg-neutral-900/40 hover:border-neutral-700">
              <button type="button" class="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer">
                <span class="text-sm sm:text-base font-semibold text-white pr-4">Sind meine Serverdaten privat und sicher?</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="faq-chevron text-neutral-400 transition-transform duration-200 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              <div class="faq-answer hidden px-5 sm:px-6 pb-5 pt-0 text-sm text-neutral-400 leading-relaxed">
                Absolut. Wir speichern ausschließlich Daten, die für die Bot-Funktionalität nötig sind (z. B. Fall-IDs, Rollenkonfiguration und XP-Stände). Wir verkaufen niemals Daten an Dritte. Alle Datenbankverbindungen sind SSL-verschlüsselt.
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- BOTTOM CTA BANNER -->
      <section class="py-16 px-6 border-t border-neutral-800/80 bg-neutral-900/30">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Bereit für den perfekten Discord-Server?
          </h2>
          <p class="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Schließen Sie sich tausenden aktiven Communities an und rüsten Sie Ihren Server jetzt mit Orbit auf.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4">
            <a href="https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=564430072179839&scope=bot+applications.commands" target="_blank" class="px-8 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all active:scale-95 btn-glow">
              Jetzt kostenlos hinzufügen
            </a>
            <a href="/dashboard" class="px-8 py-3.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm border border-neutral-700 transition-all active:scale-95">
              Dashboard öffnen
            </a>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="border-t border-neutral-900 py-12 px-6 bg-black text-neutral-400 text-xs">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3">
            <img src="/img/logo.png" class="w-6 h-6 rounded-lg" alt="Orbit">
            <span class="text-white font-semibold text-sm">Orbit</span>
            <span class="text-neutral-600">|</span>
            <span>&copy; 2026 Orbit. Alle Rechte vorbehalten.</span>
          </div>
          <div class="flex flex-wrap items-center gap-6">
            <a href="/docs" class="hover:text-white transition-colors">Dokumentation</a>
            <a href="/benchmarks" class="hover:text-white transition-colors">Benchmarks</a>
            <a href="/status" class="hover:text-white transition-colors">Status</a>
            <a href="/privacy" class="hover:text-white transition-colors">Datenschutz</a>
            <a href="/terms" class="hover:text-white transition-colors">Nutzungsbedingungen</a>
            <a href="https://discord.gg/wekuhwCsUg" target="_blank" class="hover:text-white transition-colors">Discord Support</a>
          </div>
        </div>
      </footer>

    </main>
  `;

  // --- INTERACTIVE SCRIPTS & EVENT LISTENERS ---

  // 1. Cookie consent button handlers
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept-btn');
  const declineBtn = document.getElementById('cookie-decline-btn');

  if (cookieBanner && acceptBtn) {
    acceptBtn.onclick = () => {
      localStorage.setItem('orbit_cookie_consent', 'accepted');
      cookieBanner.remove();
    };
  }
  if (cookieBanner && declineBtn) {
    declineBtn.onclick = () => {
      localStorage.setItem('orbit_cookie_consent', 'declined');
      cookieBanner.remove();
    };
  }

  // 2. Typewriter animation for hero AI prompt placeholder
  const placeholderEl = document.getElementById('typewriter-text');
  const aiInput = document.getElementById('hero-ai-input');
  const promptSamples = [
    "YouTube-Community mit Early Access und Member-Stufen...",
    "Gaming-Server für mein Valorant-Team mit Scrims und Rollen...",
    "Support-Server mit Tickets, Auto-Mod und Willkommens-Karten...",
    "Krypto-Community mit Trading-Signalen, Analysen und VIP-Rollen...",
    "Twitch-Streamer Community mit Clips, Alerts und Community-Chat..."
  ];
  let sampleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typewriterTimeout = null;

  function typeEffect() {
    if (!placeholderEl) return;
    const currentSample = promptSamples[sampleIndex];

    if (isDeleting) {
      charIndex--;
      placeholderEl.textContent = currentSample.substring(0, charIndex);
    } else {
      charIndex++;
      placeholderEl.textContent = currentSample.substring(0, charIndex);
    }

    let delay = isDeleting ? 30 : 65;

    if (!isDeleting && charIndex === currentSample.length) {
      delay = 2400; // pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      sampleIndex = (sampleIndex + 1) % promptSamples.length;
      delay = 500;
    }

    typewriterTimeout = setTimeout(typeEffect, delay);
  }

  typeEffect();

  if (aiInput) {
    aiInput.addEventListener('input', () => {
      const ph = document.getElementById('typewriter-placeholder');
      if (ph) {
        ph.style.opacity = aiInput.value.trim().length > 0 ? '0' : '1';
      }
    });

    const aiForm = document.getElementById('hero-ai-form');
    if (aiForm) {
      aiForm.onsubmit = (e) => {
        e.preventDefault();
        const promptText = aiInput.value.trim() || promptSamples[sampleIndex];
        Router.navigate('/dashboard');
      };
    }
  }

  // 3. Pricing billing interval switcher (Monthly vs Yearly)
  const toggleMonthly = document.getElementById('toggle-monthly');
  const toggleYearly = document.getElementById('toggle-yearly');
  const slider = document.getElementById('pricing-slider');

  let isYearly = true;

  const updatePricing = () => {
    if (!slider) return;
    slider.style.transform = isYearly ? 'translateX(100%)' : 'translateX(0%)';

    if (isYearly) {
      toggleYearly.classList.add('text-white');
      toggleYearly.classList.remove('text-neutral-400');
      toggleMonthly.classList.remove('text-white');
      toggleMonthly.classList.add('text-neutral-400');

      document.querySelectorAll('.tier-starter-price').forEach(el => el.textContent = '$4.00');
      document.querySelectorAll('.tier-starter-sub').forEach(el => el.innerHTML = 'in Rechnung gestellt $48.00/Jahr · war <span class="line-through text-neutral-600">$69.00</span>');
      document.querySelectorAll('.tier-pro-price').forEach(el => el.textContent = '$5.75');
      document.querySelectorAll('.tier-pro-sub').forEach(el => el.innerHTML = 'in Rechnung gestellt $69.00/Jahr · war <span class="line-through text-neutral-600">$99.00</span>');
      document.querySelectorAll('.tier-agency-price').forEach(el => el.textContent = '$14.50');
      document.querySelectorAll('.tier-agency-sub').forEach(el => el.innerHTML = 'in Rechnung gestellt $174.00/Jahr · war <span class="line-through text-neutral-600">$249.00</span>');
    } else {
      toggleMonthly.classList.add('text-white');
      toggleMonthly.classList.remove('text-neutral-400');
      toggleYearly.classList.remove('text-white');
      toggleYearly.classList.add('text-neutral-400');

      document.querySelectorAll('.tier-starter-price').forEach(el => el.textContent = '$5.75');
      document.querySelectorAll('.tier-starter-sub').forEach(el => el.innerHTML = 'monatlich flexibel kündbar');
      document.querySelectorAll('.tier-pro-price').forEach(el => el.textContent = '$8.25');
      document.querySelectorAll('.tier-pro-sub').forEach(el => el.innerHTML = 'monatlich flexibel kündbar');
      document.querySelectorAll('.tier-agency-price').forEach(el => el.textContent = '$20.75');
      document.querySelectorAll('.tier-agency-sub').forEach(el => el.innerHTML = 'monatlich flexibel kündbar');
    }
  };

  if (toggleMonthly && toggleYearly) {
    toggleMonthly.onclick = () => { isYearly = false; updatePricing(); };
    toggleYearly.onclick = () => { isYearly = true; updatePricing(); };
  }

  // 4. FAQ accordion interaction
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('button');
    const answer = item.querySelector('.faq-answer');
    const chevron = item.querySelector('.faq-chevron');

    if (btn && answer) {
      btn.onclick = () => {
        const isOpen = !answer.classList.contains('hidden');
        if (isOpen) {
          answer.classList.add('hidden');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        } else {
          answer.classList.remove('hidden');
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        }
      };
    }
  });
};
