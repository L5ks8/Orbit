/**
 * Orbit Dashboard - Tickets Tab (/dashboard/:guildId/tickets)
 * 1:1 PeakBot Tickets UI with Stats Bar, Ticketarten + 4-Step Wizard Modal, Einreichungen Filter & Einstellungen
 */

DashboardTabs.Tickets = async function (container, guildId) {
  container.innerHTML = `
    <div>
      <div data-tour="feature-header" class="scroll-mt-24">
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket w-5 h-5"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
            </span>
            <h1 class="text-base font-medium text-white truncate">Tickets</h1>
          </div>
          <span id="tickets-save-status" class="text-[11px] font-medium text-neutral-500 transition-colors">Auto-saved</span>
        </div>
      </div>
      <div class="py-16 text-center text-neutral-500 text-xs">Lade Ticket-Konfiguration...</div>
    </div>
  `;

  try {
    const configRes = await API.getConfig(guildId);
    const allChannels = (configRes.channels || []).filter(c => c.type === 0 || c.type === 5 || c.type === undefined);
    const allCategories = configRes.categories || [];
    const allRoles = (configRes.roles || []).filter(r => r.name !== '@everyone');
    const allMembers = configRes.members || [];
    const tCfg = (configRes.config && configRes.config.ticket) || {};

    const escapeHtml = (str) => String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const getChannelById = (id) => allChannels.find(c => String(c.id) === String(id));
    const getRoleById = (id) => allRoles.find(r => String(r.id) === String(id));
    const getCategoryById = (id) => allCategories.find(c => String(c.id) === String(id));
    const getMemberById = (id) => allMembers.find(m => String(m.id) === String(id));

    const MODE_META = {
      channel: { label: 'Kanal', badgeClass: 'bg-indigo-500/10 text-indigo-400', color: 'rgb(88, 101, 242)' },
      form: { label: 'Bilden', badgeClass: 'bg-emerald-500/10 text-emerald-400', color: 'rgb(36, 128, 70)' },
      form_channel: { label: 'Formular → Kanal', badgeClass: 'bg-amber-500/10 text-amber-400', color: 'rgb(240, 178, 50)' },
      panel: { label: 'Panel', badgeClass: 'bg-purple-500/10 text-purple-400', color: 'rgb(168, 85, 247)' }
    };

    const TEMPLATES = {
      bug_report: {
        name: 'Fehlerbericht',
        mode: 'form',
        template_key: 'bug_report',
        color: 'rgb(218, 55, 60)',
        description: 'Melden Sie einen Fehler mit Reproduktionsschritten und Schweregrad.',
        button_label: 'Fehler melden',
        require_proof: false,
        questions: [
          { label: 'Zusammenfassung des Fehlers', placeholder: 'Kurze Beschreibung des Problems...', style: 'short', required: true },
          { label: 'Schritte zur Reproduktion', placeholder: '1. Gehe zu...\n2. Klicke auf...', style: 'paragraph', required: true },
          { label: 'Schweregrad (Niedrig / Mittel / Kritisch)', placeholder: 'z. B. Kritisch', style: 'short', required: true }
        ]
      },
      general_support: {
        name: 'Allgemeine Unterstützung',
        mode: 'channel',
        template_key: 'general_support',
        color: 'rgb(88, 101, 242)',
        description: 'Öffnen Sie einen privaten 1-zu-1 Support-Kanal mit unserem Team.',
        button_label: 'Ticket öffnen',
        require_proof: false,
        questions: [
          { label: 'Betreff', placeholder: 'Worum geht es in Ihrer Anfrage?', style: 'short', required: true },
          { label: 'Beschreibung', placeholder: 'Bitte beschreiben Sie Ihr Anliegen so genau wie möglich...', style: 'paragraph', required: true }
        ]
      },
      player_report: {
        name: 'Spielerbericht',
        mode: 'form',
        template_key: 'player_report',
        color: 'rgb(240, 178, 50)',
        description: 'Melden Sie Regelverstöße eines Spielers inklusive Beweisen.',
        button_label: 'Spieler melden',
        require_proof: true,
        questions: [
          { label: 'Gemeldeter Benutzer / ID', placeholder: 'Benutzername oder Discord-ID...', style: 'short', required: true },
          { label: 'Grund der Meldung', placeholder: 'Was ist vorgefallen?', style: 'paragraph', required: true },
          { label: 'Beweise (Screenshot-/Video-Links)', placeholder: 'Links zu Screenshots oder Clips...', style: 'short', required: true }
        ]
      },
      staff_application: {
        name: 'Personalbewerbung',
        mode: 'form',
        template_key: 'staff_application',
        color: 'rgb(36, 128, 70)',
        description: 'Bewerben Sie sich über unser Antragsformular für das Server-Team.',
        button_label: 'Jetzt bewerben',
        require_proof: false,
        questions: [
          { label: 'Alter & Zeitzone', placeholder: 'z. B. 19, MEZ (UTC+1)', style: 'short', required: true },
          { label: 'Bisherige Moderationserfahrung', placeholder: 'Auf welchen Servern haben Sie bereits moderiert?', style: 'paragraph', required: true },
          { label: 'Warum möchten Sie ins Team?', placeholder: 'Erzählen Sie uns etwas über Ihre Motivation...', style: 'paragraph', required: true }
        ]
      }
    };

    const state = {
      enabled: Boolean(tCfg.enabled),
      panel_title: tCfg.panel_title || 'Support Ticket Desk',
      panel_description: tCfg.panel_description || 'Click the button below to open a direct support channel with our team.',
      panel_instructions: tCfg.panel_instructions || '> Select your desired inquiry category in the dropdown menu below, then click **Create Ticket**.',
      panel_channel_id: String(tCfg.panel_channel_id || ''),
      log_channel_id: String(tCfg.log_channel_id || ''),
      auto_close_time_enabled: Boolean(tCfg.auto_close_time_enabled),
      auto_close_time_hours: parseInt(tCfg.auto_close_time_hours, 10) || 24,
      max_open_tickets: parseInt(tCfg.max_open_tickets, 10) || 3,
      naming_format: String(tCfg.naming_format || ''),
      staff_only_close: Boolean(tCfg.staff_only_close),
      ping_support_roles: tCfg.ping_support_roles !== undefined ? Boolean(tCfg.ping_support_roles) : true,
      ping_custom_role_enabled: Boolean(tCfg.ping_custom_role_enabled),
      ping_custom_role_id: String(tCfg.ping_custom_role_id || ''),
      claiming_enabled: Boolean(tCfg.claiming_enabled),
      ticketTypes: Array.isArray(tCfg.options_slots) ? tCfg.options_slots.map((s, idx) => ({
        id: String(s.id || `type_${Date.now()}_${idx}`),
        name: String(s.name || 'Allgemeine Unterstützung'),
        mode: String(s.mode || 'channel'),
        template_key: String(s.template_key || ''),
        color: String(s.color || (MODE_META[s.mode]?.color || 'rgb(88, 101, 242)')),
        description: String(s.description || 'Öffnen Sie ein Ticket, um mit unserem Team zu sprechen.'),
        button_label: String(s.button_label || s.name || 'Ticket öffnen'),
        panel_channel_id: String(s.panel_channel_id || tCfg.panel_channel_id || ''),
        log_channel_id: String(s.log_channel_id || tCfg.log_channel_id || ''),
        role_id: String(s.role_id || ''),
        category_id: String(s.category_id || ''),
        require_proof: Boolean(s.require_proof),
        questions: Array.isArray(s.questions) && s.questions.length > 0 ? s.questions.map(q => ({
          label: String(q.label || 'Frage'),
          placeholder: String(q.placeholder || ''),
          style: q.style === 'paragraph' ? 'paragraph' : 'short',
          required: q.required !== false
        })) : [
          { label: 'Betreff', placeholder: 'Kurze Zusammenfassung...', style: 'short', required: true },
          { label: 'Beschreibung', placeholder: 'Bitte beschreiben Sie Ihr Anliegen...', style: 'paragraph', required: true }
        ]
      })) : [],
      activeTickets: Array.isArray(tCfg.active_tickets_list) ? tCfg.active_tickets_list : [],
      closedTickets: Array.isArray(tCfg.closed_tickets_list) ? tCfg.closed_tickets_list : [],
      stats: tCfg.stats || { open: 0, claimed: 0, resolved: 0, avg_resolution: '<1Std' },
      submissionFilter: 'all'
    };

    let saveTimer = null;
    const setSaveIndicator = (text, tone = 'neutral') => {
      const el = document.getElementById('tickets-save-status');
      if (!el) return;
      el.textContent = text;
      el.className = 'text-[11px] font-medium transition-colors ' + (
        tone === 'saving' ? 'text-amber-400' :
        tone === 'saved' ? 'text-emerald-400' :
        tone === 'error' ? 'text-red-400' : 'text-neutral-500'
      );
    };

    const saveTicketConfig = async (immediate = false, extraTicketFields = {}) => {
      setSaveIndicator('Speichert...', 'saving');
      if (saveTimer) clearTimeout(saveTimer);

      const execSave = async () => {
        try {
          const primaryPanelChannel = state.ticketTypes[0]?.panel_channel_id || state.panel_channel_id || '';
          const primaryLogChannel = state.ticketTypes[0]?.log_channel_id || state.log_channel_id || '';
          await API.saveConfig(guildId, {
            ticket: {
              enabled: state.ticketTypes.length > 0 ? true : state.enabled,
              panel_title: state.panel_title,
              panel_description: state.panel_description,
              panel_instructions: state.panel_instructions,
              panel_channel_id: primaryPanelChannel,
              log_channel_id: primaryLogChannel,
              auto_close_time_enabled: state.auto_close_time_enabled,
              auto_close_time_hours: state.auto_close_time_hours,
              max_open_tickets: state.max_open_tickets,
              naming_format: state.naming_format,
              staff_only_close: state.staff_only_close,
              ping_support_roles: state.ping_support_roles,
              ping_custom_role_enabled: state.ping_custom_role_enabled,
              ping_custom_role_id: state.ping_custom_role_id,
              claiming_enabled: state.claiming_enabled,
              options_slots: state.ticketTypes,
              ...extraTicketFields
            }
          });
          setSaveIndicator('Gespeichert', 'saved');
          setTimeout(() => setSaveIndicator('Auto-saved', 'neutral'), 1800);
        } catch (err) {
          setSaveIndicator('Fehler beim Speichern', 'error');
          if (window.Notifications) Notifications.show(err.message || 'Fehler beim Speichern', 'error');
        }
      };

      if (immediate) {
        await execSave();
      } else {
        saveTimer = setTimeout(execSave, 400);
      }
    };

    const renderSwitchButton = (id, checked) => `
      <button type="button" id="${id}" role="switch" aria-checked="${checked}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 ${checked ? 'bg-white' : 'bg-neutral-700'}">
        <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${checked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-900'}"></span>
      </button>
    `;

    const updateSwitchVisual = (id, checked) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.setAttribute('aria-checked', String(checked));
      btn.classList.toggle('bg-white', checked);
      btn.classList.toggle('bg-neutral-700', !checked);
      const thumb = btn.querySelector('span');
      if (thumb) {
        thumb.className = `pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${checked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-900'}`;
      }
    };

    const computeLiveStats = () => {
      const openCount = state.activeTickets.filter(t => !t.claimed_by && t.status !== 'claimed').length;
      const claimedCount = state.activeTickets.filter(t => Boolean(t.claimed_by) || t.status === 'claimed').length;
      const nowSec = Date.now() / 1000;
      const resolved7d = state.closedTickets.filter(t => t.status !== 'rejected' && (!t.closed_at || (nowSec - t.closed_at) <= 7 * 86400)).length;
      const avgStr = (state.stats?.avg_resolution || '<1Std')
        .replace('<1h', '<1Std')
        .replace('h', 'Std');
      return { openCount, claimedCount, resolved7d, avgStr };
    };

    // Main Render
    const renderMain = () => {
      const { openCount, claimedCount, resolved7d, avgStr } = computeLiveStats();
      const typeCount = state.ticketTypes.length;
      const progressPct = Math.min(100, typeCount > 0 ? Math.max(4, (typeCount / 10) * 100) : 0);

      container.innerHTML = `
        <div>
          <!-- Feature Header -->
          <div data-tour="feature-header" class="scroll-mt-24">
            <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket w-5 h-5"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
                </span>
                <h1 class="text-base font-medium text-white truncate">Tickets</h1>
              </div>
              <span id="tickets-save-status" class="text-[11px] font-medium text-neutral-500 transition-colors">Auto-saved</span>
            </div>
          </div>

          <div class="mt-6">
            <!-- Top KPI Strip -->
            <div class="flex items-center gap-3 mb-6">
              <div class="flex flex-wrap items-center gap-2.5 flex-1">
                <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 whitespace-nowrap shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                  <span id="tkt-stat-open" class="text-sm font-semibold tabular-nums text-amber-400">${openCount}</span>
                  <span class="text-[11px] text-neutral-500">Offen</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 whitespace-nowrap shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                  <span id="tkt-stat-claimed" class="text-sm font-semibold tabular-nums text-blue-400">${claimedCount}</span>
                  <span class="text-[11px] text-neutral-500">Übernommen</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 whitespace-nowrap shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                  <span id="tkt-stat-resolved" class="text-sm font-semibold tabular-nums text-emerald-400">${resolved7d}</span>
                  <span class="text-[11px] text-neutral-500">Gelöst (7T)</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 whitespace-nowrap shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                  <span class="text-sm font-semibold tabular-nums text-neutral-300">${escapeHtml(avgStr)}</span>
                  <span class="text-[11px] text-neutral-500">Ø Lösungszeit</span>
                </div>
              </div>
              <button type="button" id="btn-goto-analytics" class="flex items-center gap-1.5 flex-shrink-0 -mr-1 px-1 py-1 text-xs text-neutral-500 hover:text-white whitespace-nowrap transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-lg">
                Analytics ansehen
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3 h-3 flex-shrink-0"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </button>
            </div>

            <!-- Ticketarten Section -->
            <div data-tour="tickets-roles" class="mb-8 scroll-mt-24">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 class="text-sm font-semibold text-white text-balance">Ticketarten</h3>
                <div class="flex items-center flex-wrap gap-2.5">
                  <div class="flex items-center gap-3">
                    <span id="tkt-types-counter" class="text-xs tabular-nums text-neutral-500">${typeCount}/999 Typen</span>
                    <div class="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden">
                      <div id="tkt-types-progress" class="h-full rounded-full transition-all bg-white/60" style="width: ${progressPct}%;"></div>
                    </div>
                  </div>
                  <button type="button" id="btn-create-ticket-type-top" data-tour="tickets-create" class="flex items-center gap-1.5 bg-white text-black font-medium text-sm rounded-xl h-10 pl-3.5 pr-4 hover:bg-neutral-200 whitespace-nowrap transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50 disabled:cursor-not-allowed scroll-mt-24">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-4 h-4 flex-shrink-0"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                    Ticket-Typ erstellen
                  </button>
                </div>
              </div>
              <div data-tour="tickets-types-list" class="scroll-mt-24">
                <div id="tickets-types-grid" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"></div>
              </div>
            </div>

            <!-- Einreichungen Section -->
            <div class="mb-8">
              <div class="flex items-center justify-between gap-3 mb-4">
                <h3 class="text-sm font-semibold text-white text-balance">Einreichungen</h3>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div id="submissions-filter-bar" class="flex flex-wrap gap-0.5 p-1 rounded-xl bg-neutral-800/50 border border-neutral-800"></div>
              </div>
              <div id="submissions-list-container"></div>
            </div>

            <!-- Einstellungen Section -->
            <div data-tour="tickets-channel" class="scroll-mt-24">
              <h3 class="text-sm font-semibold text-white text-balance mb-4">Einstellungen</h3>
              <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <!-- Row 1: Automatische Schließzeit -->
                <div data-tour="tickets-autoclose" class="relative px-5 py-4 flex items-center justify-between gap-4 scroll-mt-24">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-timer w-4 h-4 text-amber-400"><line x1="10" x2="14" y1="2" y2="2"></line><line x1="12" x2="15" y1="14" y2="11"></line><circle cx="12" cy="14" r="8"></circle></svg>
                    </div>
                    <p class="text-sm font-medium text-white min-w-0 truncate">Automatische Schließzeit</p>
                    <span class="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-[0_1px_2px_-0.5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-emerald-400 border-emerald-500/20 bg-gradient-to-b from-emerald-400/25 to-emerald-600/10 h-[19px] pl-[5px] pr-[6.5px] gap-[3px] rounded-[6px] text-[9.5px]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles shrink-0 -ml-px opacity-90" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                      Anlasser
                    </span>
                  </div>
                  <div class="flex items-center gap-2.5 flex-shrink-0">
                    <div id="autoclose-hours-wrap" class="flex items-center gap-1.5 ${state.auto_close_time_enabled ? '' : 'hidden'}">
                      <input id="tkt-autoclose-hours" type="number" min="1" max="720" value="${state.auto_close_time_hours}" class="w-16 px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white text-center tabular-nums focus:outline-none focus:border-neutral-500">
                      <span class="text-xs text-neutral-400">Std</span>
                    </div>
                    <div class="flex items-center gap-3">
                      ${renderSwitchButton('tkt-switch-autoclose', state.auto_close_time_enabled)}
                    </div>
                  </div>
                </div>

                <div class="border-t border-neutral-800/60"></div>

                <!-- Row 2: Maximale offene Tickets pro Benutzer -->
                <div class="px-5 py-4 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-4 h-4 text-blue-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <p class="text-sm font-medium text-white min-w-0 truncate">Maximale offene Tickets pro Benutzer</p>
                  </div>
                  <div class="w-20 flex-shrink-0">
                    <div class="w-full">
                      <div class="relative">
                        <input id="tkt-input-max-open" autocomplete="off" class="w-full px-4 py-3 sm:py-2.5 bg-white dark:bg-neutral-800 border rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600" min="1" max="25" placeholder="3" type="number" value="${state.max_open_tickets}">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="border-t border-neutral-800/60"></div>

                <!-- Row 3: Format des Kanalnamens -->
                <div data-tour="tickets-naming" class="px-5 py-4 flex items-center justify-between gap-4 scroll-mt-24">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-4 h-4 text-sky-400"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                    </div>
                    <p class="text-sm font-medium text-white min-w-0 truncate">Format des Kanalnamens</p>
                  </div>
                  <div class="w-52 flex-shrink-0">
                    <div class="w-full">
                      <div class="relative">
                        <input id="tkt-input-naming-format" autocomplete="off" class="w-full px-4 py-3 sm:py-2.5 bg-white dark:bg-neutral-800 border rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600" placeholder="{Typ}-{Nummer} · {Benutzer}" value="${escapeHtml(state.naming_format)}">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="border-t border-neutral-800/60"></div>

                <!-- Row 4: Nur Mitarbeiter können Tickets schließen -->
                <div class="px-5 py-4 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock w-4 h-4 text-rose-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <p class="text-sm font-medium text-white min-w-0 truncate">Nur Mitarbeiter können Tickets schließen</p>
                  </div>
                  <div class="flex-shrink-0">
                    <div class="flex items-center gap-3">
                      ${renderSwitchButton('tkt-switch-staff-close', state.staff_only_close)}
                    </div>
                  </div>
                </div>

                <div class="border-t border-neutral-800/60"></div>

                <!-- Row 5: Pingen Sie Support-Rollen auf ein neues Ticket -->
                <div class="px-5 py-4 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-at-sign w-4 h-4 text-violet-400"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"></path></svg>
                    </div>
                    <p class="text-sm font-medium text-white min-w-0 truncate">Pingen Sie Support-Rollen auf ein neues Ticket</p>
                  </div>
                  <div class="flex-shrink-0">
                    <div class="flex items-center gap-3">
                      ${renderSwitchButton('tkt-switch-ping-support', state.ping_support_roles)}
                    </div>
                  </div>
                </div>

                <div class="border-t border-neutral-800/60"></div>

                <!-- Row 6: Pingen Sie eine Rolle für ein neues Ticket -->
                <div class="px-5 py-4 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell w-4 h-4 text-violet-400"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                    </div>
                    <p class="text-sm font-medium text-white min-w-0 truncate">Pingen Sie eine Rolle für ein neues Ticket</p>
                  </div>
                  <div class="flex items-center gap-2.5 flex-shrink-0">
                    <div id="ping-custom-role-wrap" class="${state.ping_custom_role_enabled ? '' : 'hidden'}">
                      <select id="tkt-select-ping-role" class="h-9 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-neutral-500">
                        <option value="">Rolle wählen...</option>
                        ${allRoles.map(r => `<option value="${escapeHtml(r.id)}" ${String(r.id) === state.ping_custom_role_id ? 'selected' : ''}>@${escapeHtml(r.name)}</option>`).join('')}
                      </select>
                    </div>
                    <div class="flex items-center gap-3">
                      ${renderSwitchButton('tkt-switch-ping-custom', state.ping_custom_role_enabled)}
                    </div>
                  </div>
                </div>

                <div class="border-t border-neutral-800/60"></div>

                <!-- Row 7: Ticketanforderung -->
                <div data-tour="tickets-claiming" class="px-5 py-4 flex items-center justify-between gap-4 scroll-mt-24">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-4 h-4 text-emerald-400"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
                    </div>
                    <p class="text-sm font-medium text-white min-w-0 truncate">Ticketanforderung</p>
                  </div>
                  <div class="flex-shrink-0">
                    <div class="flex items-center gap-3">
                      ${renderSwitchButton('tkt-switch-claiming', state.claiming_enabled)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Mount Point -->
        <div id="tickets-modal-root"></div>
      `;

      renderTicketTypesGrid();
      renderSubmissionsSection();
      bindMainEvents();
    };

    // Render Ticketarten Grid
    const renderTicketTypesGrid = () => {
      const grid = document.getElementById('tickets-types-grid');
      const counterEl = document.getElementById('tkt-types-counter');
      const progressEl = document.getElementById('tkt-types-progress');
      if (!grid) return;

      const count = state.ticketTypes.length;
      if (counterEl) counterEl.textContent = `${count}/999 Typen`;
      if (progressEl) progressEl.style.width = `${Math.min(100, count > 0 ? Math.max(4, (count / 10) * 100) : 0)}%`;

      const cards = state.ticketTypes.map((t) => {
        const modeInfo = MODE_META[t.mode] || MODE_META.channel;
        const pCh = getChannelById(t.panel_channel_id);
        const lCh = getChannelById(t.log_channel_id);
        const sRole = getRoleById(t.role_id);
        const qCount = Array.isArray(t.questions) ? t.questions.length : 0;

        return `
          <div class="group rounded-xl border border-neutral-800 hover:border-neutral-600 bg-neutral-900 p-4 flex flex-col justify-between gap-3 min-h-[160px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] transition-all cursor-pointer" data-edit-ticket-type="${escapeHtml(t.id)}">
            <div>
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="grid place-items-center size-9 rounded-xl shrink-0" style="background-color: ${t.color.replace('rgb(', 'rgba(').replace(')', ', 0.12)')}">
                    <span class="w-3 h-3 rounded-full" style="background-color: ${t.color}"></span>
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-sm font-semibold text-white truncate">${escapeHtml(t.name)}</h4>
                    <p class="text-[11px] text-neutral-500 truncate">${pCh ? `#${escapeHtml(pCh.name)}` : 'Kein Panel-Kanal'}</p>
                  </div>
                </div>
                <span class="flex-shrink-0 px-1.5 py-0.5 rounded-[4px] text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap ${modeInfo.badgeClass}">
                  ${escapeHtml(modeInfo.label)}
                </span>
              </div>

              <p class="text-xs text-neutral-400 line-clamp-2 mt-2.5 leading-relaxed">${escapeHtml(t.description || 'Keine Beschreibung')}</p>
            </div>

            <div class="pt-2.5 border-t border-neutral-800/80 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 text-[11px] text-neutral-500 truncate">
                <span class="tabular-nums">${qCount} ${qCount === 1 ? 'Feld' : 'Felder'}</span>
                ${lCh ? `<span>· Log: #${escapeHtml(lCh.name)}</span>` : ''}
                ${sRole ? `<span>· @${escapeHtml(sRole.name)}</span>` : ''}
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button type="button" data-send-ticket-type="${escapeHtml(t.id)}" class="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-white hover:text-black text-[11px] font-medium text-neutral-200 transition-colors" title="Panel in Discord senden">
                  Panel senden
                </button>
                <button type="button" data-delete-ticket-type="${escapeHtml(t.id)}" class="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Löschen">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      });

      // Dashed "+ Ticket-Typ erstellen" card
      cards.push(`
        <button type="button" id="btn-create-ticket-type-card" class="group rounded-xl border-2 border-dashed border-neutral-700 p-4 hover:border-neutral-500 hover:bg-neutral-800/30 transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer flex flex-col items-center justify-center gap-2.5 min-h-[160px]">
          <div class="w-11 h-11 rounded-xl bg-neutral-800 flex items-center justify-center transition-transform duration-150 ease-out group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-5 h-5 text-neutral-400"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
          </div>
          <span class="text-sm font-medium text-neutral-400">Ticket-Typ erstellen</span>
        </button>
      `);

      grid.innerHTML = cards.join('');

      document.getElementById('btn-create-ticket-type-card')?.addEventListener('click', () => openTicketTypeModal(null));

      grid.querySelectorAll('[data-edit-ticket-type]').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('[data-send-ticket-type]') || e.target.closest('[data-delete-ticket-type]')) return;
          const tid = card.getAttribute('data-edit-ticket-type');
          const found = state.ticketTypes.find(t => t.id === tid);
          if (found) openTicketTypeModal(found);
        });
      });

      grid.querySelectorAll('[data-send-ticket-type]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const tid = btn.getAttribute('data-send-ticket-type');
          const found = state.ticketTypes.find(t => t.id === tid);
          if (!found) return;
          if (!found.panel_channel_id) {
            openTicketTypeModal(found, 2);
            if (window.Notifications) Notifications.show('Bitte wählen Sie zuerst einen Panel-Kanal aus.', 'info');
            return;
          }
          const orig = btn.textContent;
          btn.textContent = 'Sendet...';
          btn.disabled = true;
          try {
            await saveTicketConfig(true);
            await API.sendTicketPanel(guildId, {
              channel_id: found.panel_channel_id,
              slot_id: found.id,
              slot_name: found.name
            });
            if (window.Notifications) Notifications.show(`Panel für "${found.name}" wurde in Discord gepostet!`, 'success');
          } catch (err) {
            if (window.Notifications) Notifications.show(err.message || 'Fehler beim Senden des Panels', 'error');
          } finally {
            btn.textContent = orig;
            btn.disabled = false;
          }
        });
      });

      grid.querySelectorAll('[data-delete-ticket-type]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const tid = btn.getAttribute('data-delete-ticket-type');
          state.ticketTypes = state.ticketTypes.filter(t => t.id !== tid);
          renderTicketTypesGrid();
          await saveTicketConfig(true);
          if (window.Notifications) Notifications.show('Ticket-Typ gelöscht', 'success');
        });
      });
    };

    // Render Einreichungen Section
    const renderSubmissionsSection = () => {
      const filterBar = document.getElementById('submissions-filter-bar');
      const listContainer = document.getElementById('submissions-list-container');
      if (!filterBar || !listContainer) return;

      const FILTERS = [
        { key: 'all', label: 'Alle' },
        { key: 'waiting', label: 'Warten (keine Antwort 12h+)' },
        { key: 'open', label: 'Ausstehend' },
        { key: 'claimed', label: 'Übernommen' },
        { key: 'resolved', label: 'Gelöst' },
        { key: 'rejected', label: 'Abgelehnt' }
      ];

      filterBar.innerHTML = FILTERS.map(f => {
        const active = state.submissionFilter === f.key;
        if (active) {
          return `
            <button type="button" data-sub-filter="${f.key}" class="relative px-3 py-1.5 rounded-lg text-xs font-medium transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 text-black">
              <span class="absolute inset-0 bg-white rounded-lg" style="transform: none; transform-origin: 50% 50% 0px; opacity: 1;"></span>
              <span class="relative z-10">${escapeHtml(f.label)}</span>
            </button>
          `;
        }
        return `
          <button type="button" data-sub-filter="${f.key}" class="relative px-3 py-1.5 rounded-lg text-xs font-medium transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 text-neutral-400 hover:text-white">
            <span class="relative z-10">${escapeHtml(f.label)}</span>
          </button>
        `;
      }).join('');

      filterBar.querySelectorAll('[data-sub-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.submissionFilter = btn.getAttribute('data-sub-filter');
          renderSubmissionsSection();
        });
      });

      const allSubmissions = [
        ...state.activeTickets.map(t => ({
          ...t,
          status: t.status || (t.claimed_by ? 'claimed' : 'open'),
          is_active: true
        })),
        ...state.closedTickets.map(t => ({
          ...t,
          status: t.status || 'resolved',
          is_active: false
        }))
      ].sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

      const nowSec = Date.now() / 1000;
      const filtered = allSubmissions.filter(item => {
        if (state.submissionFilter === 'all') return true;
        if (state.submissionFilter === 'waiting') {
          return item.is_active && !item.claimed_by && item.created_at && (nowSec - item.created_at) >= 12 * 3600;
        }
        if (state.submissionFilter === 'open') return item.status === 'open';
        if (state.submissionFilter === 'claimed') return item.status === 'claimed';
        if (state.submissionFilter === 'resolved') return item.status === 'resolved';
        if (state.submissionFilter === 'rejected') return item.status === 'rejected';
        return true;
      });

      if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12 text-center bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div class="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-inbox w-5 h-5 text-neutral-500"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
            </div>
            <p class="text-sm font-medium text-neutral-400 mb-1 text-pretty">Noch keine Einreichungen</p>
          </div>
        `;
        return;
      }

      const STATUS_BADGE = {
        open: { label: 'Ausstehend', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        claimed: { label: 'Übernommen', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        resolved: { label: 'Gelöst', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
        rejected: { label: 'Abgelehnt', cls: 'bg-red-500/10 text-red-400 border-red-500/20' }
      };

      listContainer.innerHTML = `
        <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] divide-y divide-neutral-800/70 overflow-hidden">
          ${filtered.map(sub => {
            const st = STATUS_BADGE[sub.status] || STATUS_BADGE.open;
            const creator = getMemberById(sub.creator_id);
            const creatorName = creator ? (creator.display_name || creator.name) : `User ${sub.creator_id || 'Unbekannt'}`;
            const dateStr = sub.created_at ? new Date(sub.created_at * 1000).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
            const subId = String(sub.id || sub.channel_id);

            return `
              <div class="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-800/30 transition-colors">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-mono text-neutral-500">#${sub.number || 1}</span>
                    <span class="text-sm font-semibold text-white truncate">${escapeHtml(sub.subject || sub.category_option || 'Ticket')}</span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-medium border ${st.cls}">${st.label}</span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] bg-neutral-800 text-neutral-400">${escapeHtml(sub.category_option || 'Allgemein')}</span>
                  </div>
                  <p class="text-xs text-neutral-400 truncate mt-1">${escapeHtml(sub.description || '')}</p>
                  <p class="text-[11px] text-neutral-500 mt-1">Von <span class="text-neutral-300">${escapeHtml(creatorName)}</span> ${dateStr ? `· ${dateStr}` : ''}</p>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  ${sub.status === 'open' ? `
                    <button type="button" data-sub-action="claimed" data-sub-id="${escapeHtml(subId)}" class="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium transition-colors">Übernehmen</button>
                  ` : ''}
                  ${sub.status !== 'resolved' ? `
                    <button type="button" data-sub-action="resolved" data-sub-id="${escapeHtml(subId)}" class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors">Lösen</button>
                  ` : ''}
                  ${sub.status !== 'rejected' ? `
                    <button type="button" data-sub-action="rejected" data-sub-id="${escapeHtml(subId)}" class="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors">Ablehnen</button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      listContainer.querySelectorAll('[data-sub-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const subId = btn.getAttribute('data-sub-id');
          const newStatus = btn.getAttribute('data-sub-action');
          const activeIdx = state.activeTickets.findIndex(t => String(t.id || t.channel_id) === String(subId));
          if (activeIdx >= 0) {
            const item = state.activeTickets[activeIdx];
            item.status = newStatus;
            if (newStatus === 'resolved' || newStatus === 'rejected') {
              state.activeTickets.splice(activeIdx, 1);
              item.closed_at = Date.now() / 1000;
              state.closedTickets.unshift(item);
            } else if (newStatus === 'claimed') {
              item.claimed_by = 'staff';
            }
          } else {
            const closedItem = state.closedTickets.find(t => String(t.id || t.channel_id) === String(subId));
            if (closedItem) closedItem.status = newStatus;
          }
          renderMain();
          await saveTicketConfig(true, { submission_action: { id: subId, status: newStatus } });
        });
      });
    };

    // Bind Main Page Controls
    const bindMainEvents = () => {
      document.getElementById('btn-goto-analytics')?.addEventListener('click', () => {
        if (window.Router) Router.navigate(`/dashboard/${guildId}/analytics`);
      });

      document.getElementById('btn-create-ticket-type-top')?.addEventListener('click', () => {
        openTicketTypeModal(null);
      });

      // Settings switches & inputs
      document.getElementById('tkt-switch-autoclose')?.addEventListener('click', () => {
        state.auto_close_time_enabled = !state.auto_close_time_enabled;
        updateSwitchVisual('tkt-switch-autoclose', state.auto_close_time_enabled);
        document.getElementById('autoclose-hours-wrap')?.classList.toggle('hidden', !state.auto_close_time_enabled);
        saveTicketConfig();
      });

      document.getElementById('tkt-autoclose-hours')?.addEventListener('input', (e) => {
        state.auto_close_time_hours = Math.max(1, parseInt(e.target.value, 10) || 24);
        saveTicketConfig();
      });

      document.getElementById('tkt-input-max-open')?.addEventListener('input', (e) => {
        state.max_open_tickets = Math.max(1, Math.min(25, parseInt(e.target.value, 10) || 3));
        saveTicketConfig();
      });

      document.getElementById('tkt-input-naming-format')?.addEventListener('input', (e) => {
        state.naming_format = e.target.value;
        saveTicketConfig();
      });

      document.getElementById('tkt-switch-staff-close')?.addEventListener('click', () => {
        state.staff_only_close = !state.staff_only_close;
        updateSwitchVisual('tkt-switch-staff-close', state.staff_only_close);
        saveTicketConfig();
      });

      document.getElementById('tkt-switch-ping-support')?.addEventListener('click', () => {
        state.ping_support_roles = !state.ping_support_roles;
        updateSwitchVisual('tkt-switch-ping-support', state.ping_support_roles);
        saveTicketConfig();
      });

      document.getElementById('tkt-switch-ping-custom')?.addEventListener('click', () => {
        state.ping_custom_role_enabled = !state.ping_custom_role_enabled;
        updateSwitchVisual('tkt-switch-ping-custom', state.ping_custom_role_enabled);
        document.getElementById('ping-custom-role-wrap')?.classList.toggle('hidden', !state.ping_custom_role_enabled);
        saveTicketConfig();
      });

      document.getElementById('tkt-select-ping-role')?.addEventListener('change', (e) => {
        state.ping_custom_role_id = e.target.value;
        saveTicketConfig();
      });

      document.getElementById('tkt-switch-claiming')?.addEventListener('click', () => {
        state.claiming_enabled = !state.claiming_enabled;
        updateSwitchVisual('tkt-switch-claiming', state.claiming_enabled);
        saveTicketConfig();
      });
    };

    // Ticket-Typ Erstellen Modal (Step 0: Picker -> Steps 1..4: Wizard)
    const openTicketTypeModal = (existingType = null, initialStep = null) => {
      const modalRoot = document.getElementById('tickets-modal-root');
      if (!modalRoot) return;

      const isEditing = Boolean(existingType && existingType.id);
      let currentStep = isEditing ? (initialStep || 2) : 0; // 0 = Picker, 1 = Grundlagen, 2 = Aufstellen, 3 = Fragen, 4 = Rezension
      let openDropdownId = null;

      const draft = isEditing ? JSON.parse(JSON.stringify(existingType)) : {
        id: `type_${Date.now()}`,
        name: 'Fehlerbericht',
        mode: 'form',
        template_key: 'bug_report',
        color: 'rgb(218, 55, 60)',
        description: 'Melden Sie einen Fehler mit Reproduktionsschritten und Schweregrad.',
        button_label: 'Fehler melden',
        panel_channel_id: state.panel_channel_id || '',
        log_channel_id: state.log_channel_id || '',
        role_id: '',
        category_id: '',
        require_proof: false,
        post_immediately: true,
        questions: [
          { label: 'Zusammenfassung des Fehlers', placeholder: 'Kurze Beschreibung des Problems...', style: 'short', required: true },
          { label: 'Schritte zur Reproduktion', placeholder: '1. Gehe zu...\n2. Klicke auf...', style: 'paragraph', required: true },
          { label: 'Schweregrad', placeholder: 'Niedrig / Mittel / Kritisch', style: 'short', required: true }
        ]
      };

      const applyScratchOrTemplate = (configObj) => {
        draft.name = configObj.name;
        draft.mode = configObj.mode;
        draft.template_key = configObj.template_key || '';
        draft.color = configObj.color;
        draft.description = configObj.description;
        draft.button_label = configObj.button_label;
        draft.require_proof = Boolean(configObj.require_proof);
        draft.questions = JSON.parse(JSON.stringify(configObj.questions));
        // Jump straight to Step 2 ("Aufstellen") just like PeakBot when selecting a template/mode, while allowing Step 1 ("Grundlagen") click
        currentStep = 2;
        renderModalContent();
      };

      const closeModal = () => {
        modalRoot.innerHTML = '';
      };

      const renderModalContent = () => {
        // STEP 0: Picker View ("Tickettyp erstellen" — Fangen Sie bei Null an / Oder verwenden Sie eine Vorlage)
        if (currentStep === 0) {
          modalRoot.innerHTML = `
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <div class="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]" style="opacity: 1; transform: none;">
                <div class="flex items-center justify-between gap-3 px-5 py-3 border-b border-neutral-800 flex-shrink-0">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <h2 class="text-sm font-semibold text-white truncate text-balance">Tickettyp erstellen</h2>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button type="button" id="tkt-modal-close" class="grid place-items-center -mr-2 size-9 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                    </button>
                  </div>
                </div>
                <div class="flex-1 overflow-y-auto min-h-0">
                  <div style="opacity: 1; transform: none;">
                    <div class="p-5 space-y-7">
                      <div class="space-y-3">
                        <p class="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Fangen Sie bei Null an</p>
                        <div class="grid gap-2.5 grid-cols-1 sm:grid-cols-3">
                          <button type="button" data-pick-scratch="channel" class="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-800/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-neutral-800/60 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-left group">
                            <div class="grid place-items-center size-10 rounded-xl flex-shrink-0 transition-transform duration-150 ease-out group-active:scale-95" style="background-color: rgba(88, 101, 242, 0.1);">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-5 h-5" style="color: rgb(88, 101, 242);"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                            </div>
                            <p class="text-sm font-semibold text-white text-pretty leading-tight min-w-0">Kanal</p>
                          </button>
                          <button type="button" data-pick-scratch="form" class="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-800/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-neutral-800/60 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-left group">
                            <div class="grid place-items-center size-10 rounded-xl flex-shrink-0 transition-transform duration-150 ease-out group-active:scale-95" style="background-color: rgba(36, 128, 70, 0.1);">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square w-5 h-5" style="color: rgb(36, 128, 70);"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <p class="text-sm font-semibold text-white text-pretty leading-tight min-w-0">Bilden</p>
                          </button>
                          <button type="button" data-pick-scratch="form_channel" class="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-800/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-neutral-800/60 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-left group">
                            <div class="grid place-items-center size-10 rounded-xl flex-shrink-0 transition-transform duration-150 ease-out group-active:scale-95" style="background-color: rgba(240, 178, 50, 0.1);">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-5 h-5" style="color: rgb(240, 178, 50);"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                            </div>
                            <p class="text-sm font-semibold text-white text-pretty leading-tight min-w-0">Formular → Kanal</p>
                          </button>
                          <button type="button" data-pick-scratch="panel" class="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-800/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-neutral-800/60 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-left group">
                            <div class="grid place-items-center size-10 rounded-xl flex-shrink-0 transition-transform duration-150 ease-out group-active:scale-95" style="background-color: rgba(168, 85, 247, 0.1);">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers w-5 h-5" style="color: rgb(168, 85, 247);"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path></svg>
                            </div>
                            <p class="text-sm font-semibold text-white text-pretty leading-tight min-w-0">Panel</p>
                          </button>
                        </div>
                      </div>

                      <div class="space-y-3">
                        <p class="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Oder verwenden Sie eine Vorlage</p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <button type="button" data-pick-template="bug_report" class="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-800/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-neutral-800/60 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-left group">
                            <div class="grid place-items-center size-10 rounded-xl flex-shrink-0 transition-transform duration-150 ease-out group-active:scale-95" style="background-color: rgba(218, 55, 60, 0.1);">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bug w-[18px] h-[18px]" style="color: rgb(218, 55, 60);"><path d="m8 2 1.88 1.88"></path><path d="M14.12 3.88 16 2"></path><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"></path><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"></path><path d="M12 20v-9"></path><path d="M6.53 9C4.6 8.8 3 7.1 3 5"></path><path d="M6 13H2"></path><path d="M3 21c0-2.1 1.7-3.9 3.8-4"></path><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"></path><path d="M22 13h-4"></path><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"></path></svg>
                            </div>
                            <div class="min-w-0 flex-1">
                              <div class="flex items-center justify-between gap-2">
                                <p class="text-sm font-medium text-white truncate">Fehlerbericht</p>
                                <span class="flex-shrink-0 px-1.5 py-0.5 rounded-[4px] text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap bg-emerald-500/10 text-emerald-400">bilden</span>
                              </div>
                              <p class="text-[11px] text-neutral-500 text-pretty mt-0.5">Schweregrad + Reproschritte</p>
                            </div>
                          </button>

                          <button type="button" data-pick-template="general_support" class="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-800/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-neutral-800/60 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-left group">
                            <div class="grid place-items-center size-10 rounded-xl flex-shrink-0 transition-transform duration-150 ease-out group-active:scale-95" style="background-color: rgba(88, 101, 242, 0.1);">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-help-circle w-[18px] h-[18px]" style="color: rgb(88, 101, 242);"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
                            </div>
                            <div class="min-w-0 flex-1">
                              <div class="flex items-center justify-between gap-2">
                                <p class="text-sm font-medium text-white truncate">Allgemeine Unterstützung</p>
                                <span class="flex-shrink-0 px-1.5 py-0.5 rounded-[4px] text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap bg-indigo-500/10 text-indigo-400">Kanal</span>
                              </div>
                              <p class="text-[11px] text-neutral-500 text-pretty mt-0.5">Privater 1-zu-1-Kanal</p>
                            </div>
                          </button>

                          <button type="button" data-pick-template="player_report" class="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-800/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-neutral-800/60 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-left group">
                            <div class="grid place-items-center size-10 rounded-xl flex-shrink-0 transition-transform duration-150 ease-out group-active:scale-95" style="background-color: rgba(240, 178, 50, 0.1);">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert w-[18px] h-[18px]" style="color: rgb(240, 178, 50);"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
                            </div>
                            <div class="min-w-0 flex-1">
                              <div class="flex items-center justify-between gap-2">
                                <p class="text-sm font-medium text-white truncate">Spielerbericht</p>
                                <span class="flex-shrink-0 px-1.5 py-0.5 rounded-[4px] text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap bg-emerald-500/10 text-emerald-400">bilden</span>
                              </div>
                              <p class="text-[11px] text-neutral-500 text-pretty mt-0.5">Bericht mit Beweisen</p>
                            </div>
                          </button>

                          <button type="button" data-pick-template="staff_application" class="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-800/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-neutral-800/60 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-left group">
                            <div class="grid place-items-center size-10 rounded-xl flex-shrink-0 transition-transform duration-150 ease-out group-active:scale-95" style="background-color: rgba(36, 128, 70, 0.1);">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-[18px] h-[18px]" style="color: rgb(36, 128, 70);"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                            </div>
                            <div class="min-w-0 flex-1">
                              <div class="flex items-center justify-between gap-2">
                                <p class="text-sm font-medium text-white truncate">Personalbewerbung</p>
                                <span class="flex-shrink-0 px-1.5 py-0.5 rounded-[4px] text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap bg-emerald-500/10 text-emerald-400">bilden</span>
                              </div>
                              <p class="text-[11px] text-neutral-500 text-pretty mt-0.5">Benutzerdefiniertes Antragsformular</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;

          document.getElementById('tkt-modal-close')?.addEventListener('click', closeModal);

          modalRoot.querySelectorAll('[data-pick-scratch]').forEach(btn => {
            btn.addEventListener('click', () => {
              const modeKey = btn.getAttribute('data-pick-scratch');
              const meta = MODE_META[modeKey] || MODE_META.channel;
              applyScratchOrTemplate({
                name: meta.label === 'Bilden' ? 'Neues Formular' : `Neues ${meta.label}-Ticket`,
                mode: modeKey,
                template_key: '',
                color: meta.color,
                description: 'Klicken Sie unten, um ein Ticket oder Formular einzureichen.',
                button_label: 'Ticket öffnen',
                require_proof: false,
                questions: [
                  { label: 'Betreff', placeholder: 'Kurze Zusammenfassung...', style: 'short', required: true },
                  { label: 'Beschreibung', placeholder: 'Details zu Ihrem Anliegen...', style: 'paragraph', required: true }
                ]
              });
            });
          });

          modalRoot.querySelectorAll('[data-pick-template]').forEach(btn => {
            btn.addEventListener('click', () => {
              const tplKey = btn.getAttribute('data-pick-template');
              const tpl = TEMPLATES[tplKey];
              if (tpl) applyScratchOrTemplate(tpl);
            });
          });
          return;
        }

        // STEPS 1..4: 4-Step Wizard View
        const modeInfo = MODE_META[draft.mode] || MODE_META.channel;
        const pCh = getChannelById(draft.panel_channel_id);
        const lCh = getChannelById(draft.log_channel_id);
        const sRole = getRoleById(draft.role_id);
        const sCat = getCategoryById(draft.category_id);

        const renderStepTab = (stepNum, label, iconSvg) => {
          const isCurrent = currentStep === stepNum;
          const isDone = currentStep > stepNum || (stepNum === 1 && currentStep >= 2);
          if (isCurrent) {
            return `
              <button type="button" data-wizard-step="${stepNum}" class="relative flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-lg text-sm font-medium transition-[transform,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 text-black">
                <span class="absolute inset-0 bg-white rounded-lg shadow-[0_1px_4px_-1px_rgba(0,0,0,0.5)]"></span>
                <span class="relative z-10 flex items-center gap-1.5">${iconSvg}${escapeHtml(label)}</span>
              </button>
            `;
          }
          if (isDone) {
            return `
              <button type="button" data-wizard-step="${stepNum}" class="relative flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-lg text-sm font-medium transition-[transform,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 text-neutral-300 hover:text-white active:scale-[0.96]">
                <span class="relative z-10 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-3.5 h-3.5 text-emerald-400"><path d="M20 6 9 17l-5-5"></path></svg>
                  ${escapeHtml(label)}
                </span>
              </button>
            `;
          }
          return `
            <button type="button" data-wizard-step="${stepNum}" class="relative flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-lg text-sm font-medium transition-[transform,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 text-neutral-500 hover:text-neutral-300">
              <span class="relative z-10 flex items-center gap-1.5">${iconSvg}${escapeHtml(label)}</span>
            </button>
          `;
        };

        let stepBodyHtml = '';

        // STEP 1: Grundlagen
        if (currentStep === 1) {
          stepBodyHtml = `
            <div class="px-5 py-4 space-y-4">
              <div class="rounded-2xl bg-neutral-900/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden border border-neutral-800/80">
                <div class="px-4 py-3 border-b border-neutral-800/80 flex items-center gap-2.5">
                  <div class="grid place-items-center size-7 rounded-lg bg-indigo-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 text-indigo-400"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
                  </div>
                  <p class="text-xs font-semibold text-white">Grundlagen</p>
                </div>
                <div class="p-4 space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-neutral-300 mb-1.5">Name des Ticket-Typs *</label>
                      <input type="text" id="wiz-input-name" value="${escapeHtml(draft.name)}" placeholder="z. B. Fehlerbericht" class="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500">
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-neutral-300 mb-1.5">Button-Text</label>
                      <input type="text" id="wiz-input-btn-label" value="${escapeHtml(draft.button_label)}" placeholder="z. B. Ticket öffnen" class="w-full h-10 px-3.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500">
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1.5">Modus</label>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      ${Object.entries(MODE_META).map(([k, m]) => `
                        <button type="button" data-wiz-mode="${k}" class="px-3 py-2 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-colors ${draft.mode === k ? 'bg-neutral-800 border-white text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}">
                          <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${m.color}"></span>
                          <span class="truncate">${escapeHtml(m.label)}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1.5">Panel-Beschreibung</label>
                    <textarea id="wiz-input-desc" rows="3" placeholder="Erklären Sie kurz, wofür dieser Ticket-Typ gedacht ist..." class="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500">${escapeHtml(draft.description)}</textarea>
                  </div>
                </div>
              </div>
            </div>
          `;
        }

        // STEP 2: Aufstellen (Exact HTML from user's snippet!)
        else if (currentStep === 2) {
          stepBodyHtml = `
            <div class="px-5 py-4 space-y-4">
              <div class="rounded-2xl bg-neutral-900/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
                <div class="px-4 py-3 border-b border-neutral-800/80 flex items-center gap-2.5">
                  <div class="grid place-items-center size-7 rounded-lg bg-indigo-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-3.5 h-3.5 text-indigo-400"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                  </div>
                  <p class="text-xs font-semibold text-white">Kanäle</p>
                </div>
                <div class="p-4 space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <!-- Panel-Kanal * -->
                    <div class="w-full relative">
                      <label class="block text-sm font-medium text-neutral-300 mb-2">Panel-Kanal *</label>
                      <div class="relative">
                        <button type="button" id="wiz-dd-panel-channel-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 ${openDropdownId === 'panel_ch' ? 'border-neutral-500' : 'border-neutral-700 hover:border-neutral-600'} cursor-pointer">
                          <span class="min-w-0 truncate text-sm ${pCh ? 'text-white' : 'text-neutral-500'}">${pCh ? `#${escapeHtml(pCh.name)}` : 'Wo das Panel gepostet wird'}</span>
                          <div class="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 ${openDropdownId === 'panel_ch' ? 'rotate-180' : ''}"><path d="m6 9 6 6 6-6"></path></svg>
                          </div>
                        </button>
                        <div id="wiz-dd-panel-channel-menu" class="${openDropdownId === 'panel_ch' ? '' : 'hidden'} absolute z-50 left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1 space-y-0.5">
                          ${allChannels.map(c => `
                            <button type="button" data-select-panel-ch="${escapeHtml(c.id)}" class="w-full px-3 py-1.5 rounded-lg text-left text-xs flex items-center justify-between ${String(c.id) === String(draft.panel_channel_id) ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
                              <span class="truncate">#${escapeHtml(c.name)}</span>
                            </button>
                          `).join('')}
                        </div>
                      </div>
                    </div>

                    <!-- Mitarbeiter-/Log-Kanal -->
                    <div class="w-full relative">
                      <label class="block text-sm font-medium text-neutral-300 mb-2">Mitarbeiter-/Log-Kanal</label>
                      <div class="relative">
                        <button type="button" id="wiz-dd-log-channel-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 ${openDropdownId === 'log_ch' ? 'border-neutral-500' : 'border-neutral-700 hover:border-neutral-600'} cursor-pointer">
                          <span class="min-w-0 truncate text-sm ${lCh ? 'text-white' : 'text-neutral-500'}">${lCh ? `#${escapeHtml(lCh.name)}` : 'Einsendungen finden Sie hier'}</span>
                          <div class="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 ${openDropdownId === 'log_ch' ? 'rotate-180' : ''}"><path d="m6 9 6 6 6-6"></path></svg>
                          </div>
                        </button>
                        <div id="wiz-dd-log-channel-menu" class="${openDropdownId === 'log_ch' ? '' : 'hidden'} absolute z-50 left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1 space-y-0.5">
                          <button type="button" data-select-log-ch="" class="w-full px-3 py-1.5 rounded-lg text-left text-xs text-neutral-400 hover:bg-neutral-800/60">Kein Log-Kanal</button>
                          ${allChannels.map(c => `
                            <button type="button" data-select-log-ch="${escapeHtml(c.id)}" class="w-full px-3 py-1.5 rounded-lg text-left text-xs flex items-center justify-between ${String(c.id) === String(draft.log_channel_id) ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
                              <span class="truncate">#${escapeHtml(c.name)}</span>
                            </button>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Optional Support-Rolle & Kategorie -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div class="w-full relative">
                      <label class="block text-sm font-medium text-neutral-300 mb-2">Support-Rolle</label>
                      <div class="relative">
                        <button type="button" id="wiz-dd-role-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                          <span class="min-w-0 truncate text-sm ${sRole ? 'text-white' : 'text-neutral-500'}">${sRole ? `@${escapeHtml(sRole.name)}` : 'Zuständige Team-Rolle (optional)'}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400"><path d="m6 9 6 6 6-6"></path></svg>
                        </button>
                        <div id="wiz-dd-role-menu" class="${openDropdownId === 'role' ? '' : 'hidden'} absolute z-50 left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1 space-y-0.5">
                          <button type="button" data-select-wiz-role="" class="w-full px-3 py-1.5 rounded-lg text-left text-xs text-neutral-400 hover:bg-neutral-800/60">Keine spezifische Rolle</button>
                          ${allRoles.map(r => `
                            <button type="button" data-select-wiz-role="${escapeHtml(r.id)}" class="w-full px-3 py-1.5 rounded-lg text-left text-xs flex items-center justify-between ${String(r.id) === String(draft.role_id) ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
                              <span class="truncate">@${escapeHtml(r.name)}</span>
                            </button>
                          `).join('')}
                        </div>
                      </div>
                    </div>

                    <div class="w-full relative">
                      <label class="block text-sm font-medium text-neutral-300 mb-2">Ticket-Kategorie</label>
                      <div class="relative">
                        <button type="button" id="wiz-dd-cat-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                          <span class="min-w-0 truncate text-sm ${sCat ? 'text-white' : 'text-neutral-500'}">${sCat ? escapeHtml(sCat.name) : 'Automatisch (gleiche Kategorie)'}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400"><path d="m6 9 6 6 6-6"></path></svg>
                        </button>
                        <div id="wiz-dd-cat-menu" class="${openDropdownId === 'cat' ? '' : 'hidden'} absolute z-50 left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1 space-y-0.5">
                          <button type="button" data-select-wiz-cat="" class="w-full px-3 py-1.5 rounded-lg text-left text-xs text-neutral-400 hover:bg-neutral-800/60">Automatisch</button>
                          ${allCategories.map(cat => `
                            <button type="button" data-select-wiz-cat="${escapeHtml(cat.id)}" class="w-full px-3 py-1.5 rounded-lg text-left text-xs flex items-center justify-between ${String(cat.id) === String(draft.category_id) ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
                              <span class="truncate">${escapeHtml(cat.name)}</span>
                            </button>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Optionen Card -->
              <div class="rounded-2xl bg-neutral-900/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
                <div class="px-4 py-3 border-b border-neutral-800/80 flex items-center gap-2.5">
                  <div class="grid place-items-center size-7 rounded-lg bg-emerald-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings w-3.5 h-3.5 text-emerald-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </div>
                  <p class="text-xs font-semibold text-white">Optionen</p>
                </div>
                <div class="divide-y divide-neutral-800/50">
                  <div class="px-4 py-3">
                    <div class="flex items-center justify-between gap-3">
                      <span class="text-xs font-medium text-neutral-200">Ticketanforderung</span>
                      <span class="flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-neutral-800 text-neutral-400 whitespace-nowrap">Serverweit</span>
                    </div>
                    <p class="mt-1.5 text-[11px] text-neutral-500 leading-relaxed text-pretty">Die Beanspruchung ist eine serverweite Einstellung. Aktivieren Sie es in den Ticketeinstellungen und es gilt für jeden Typ.</p>
                  </div>
                  <div class="px-4 py-3">
                    <div class="flex items-center justify-between gap-3">
                      <span class="text-xs font-medium text-neutral-200">Beweise erforderlich</span>
                      <div class="flex items-center gap-3">
                        ${renderSwitchButton('wiz-switch-proof', draft.require_proof)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }

        // STEP 3: Fragen (Form Questions Builder)
        else if (currentStep === 3) {
          stepBodyHtml = `
            <div class="px-5 py-4 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-semibold text-white">Formularfelder (${draft.questions.length}/5)</h4>
                  <p class="text-[11px] text-neutral-500">Diese Fragen werden dem Benutzer beim Öffnen des Tickets im Discord-Modal gestellt.</p>
                </div>
                <button type="button" id="wiz-add-question" ${draft.questions.length >= 5 ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-medium hover:bg-neutral-200 disabled:opacity-40 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Feld hinzufügen
                </button>
              </div>

              <div class="space-y-3">
                ${draft.questions.map((q, qIdx) => `
                  <div class="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-xs font-semibold text-neutral-300">Feld #${qIdx + 1}</span>
                      <div class="flex items-center gap-3">
                        <label class="inline-flex items-center gap-1.5 text-xs text-neutral-400 cursor-pointer">
                          <input type="checkbox" data-q-req="${qIdx}" ${q.required !== false ? 'checked' : ''} class="rounded bg-neutral-800 border-neutral-700">
                          Pflichtfeld
                        </label>
                        ${draft.questions.length > 1 ? `
                          <button type="button" data-q-del="${qIdx}" class="p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                        ` : ''}
                      </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label class="block text-[11px] text-neutral-500 mb-1">Frage / Label</label>
                        <input type="text" data-q-label="${qIdx}" value="${escapeHtml(q.label)}" placeholder="z. B. Betreff" class="w-full h-9 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none">
                      </div>
                      <div>
                        <label class="block text-[11px] text-neutral-500 mb-1">Platzhalter</label>
                        <input type="text" data-q-ph="${qIdx}" value="${escapeHtml(q.placeholder)}" placeholder="Optionaler Hinweis..." class="w-full h-9 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none">
                      </div>
                      <div>
                        <label class="block text-[11px] text-neutral-500 mb-1">Antwort-Typ</label>
                        <select data-q-style="${qIdx}" class="w-full h-9 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none">
                          <option value="short" ${q.style !== 'paragraph' ? 'selected' : ''}>Kurztext (1 Zeile)</option>
                          <option value="paragraph" ${q.style === 'paragraph' ? 'selected' : ''}>Absatz (Mehrzeilig)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }

        // STEP 4: Rezension (Review & Publish)
        else if (currentStep === 4) {
          stepBodyHtml = `
            <div class="px-5 py-4 space-y-4">
              <div class="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <span class="w-3 h-3 rounded-full" style="background-color: ${draft.color}"></span>
                    <h4 class="text-sm font-semibold text-white">${escapeHtml(draft.name)}</h4>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${modeInfo.badgeClass}">${escapeHtml(modeInfo.label)}</span>
                </div>
                <p class="text-xs text-neutral-400">${escapeHtml(draft.description)}</p>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                  <div>
                    <span class="text-[11px] text-neutral-500 block">Panel-Kanal</span>
                    <span class="text-white font-medium">${pCh ? `#${escapeHtml(pCh.name)}` : 'Nicht gewählt'}</span>
                  </div>
                  <div>
                    <span class="text-[11px] text-neutral-500 block">Log-Kanal</span>
                    <span class="text-white font-medium">${lCh ? `#${escapeHtml(lCh.name)}` : 'Keiner'}</span>
                  </div>
                  <div>
                    <span class="text-[11px] text-neutral-500 block">Support-Rolle</span>
                    <span class="text-white font-medium">${sRole ? `@${escapeHtml(sRole.name)}` : 'Standard'}</span>
                  </div>
                  <div>
                    <span class="text-[11px] text-neutral-500 block">Fragen</span>
                    <span class="text-white font-medium">${draft.questions.length} Felder</span>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-4 flex items-center justify-between gap-3">
                <div>
                  <p class="text-xs font-semibold text-white">Panel sofort im Panel-Kanal veröffentlichen</p>
                  <p class="text-[11px] text-neutral-500">Sendet das interaktive Ticket-Panel direkt nach dem Speichern in ${pCh ? `#${escapeHtml(pCh.name)}` : 'den gewählten Kanal'}.</p>
                </div>
                ${renderSwitchButton('wiz-switch-post-now', draft.post_immediately !== false)}
              </div>
            </div>
          `;
        }

        const isNextDisabled = currentStep === 2 && !draft.panel_channel_id;

        modalRoot.innerHTML = `
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div class="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]" style="opacity: 1; transform: none;">
              <!-- Top Wizard Header -->
              <div class="flex items-center justify-between gap-3 px-5 py-3 border-b border-neutral-800 flex-shrink-0">
                <div class="flex items-center gap-1.5 min-w-0">
                  <button type="button" id="wiz-top-back" class="grid place-items-center -ml-2 size-9 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                  </button>
                  <h2 class="text-sm font-semibold text-white truncate text-balance">${isEditing ? 'Bearbeiten' : 'Neu'} – ${escapeHtml(draft.name)}</h2>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <div class="hidden sm:flex gap-0.5 p-1 rounded-xl bg-neutral-800/50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                    ${renderStepTab(1, 'Grundlagen', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-3.5 h-3.5 text-emerald-400"><path d="M20 6 9 17l-5-5"></path></svg>`)}
                    ${renderStepTab(2, 'Aufstellen', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings w-3.5 h-3.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`)}
                    ${renderStepTab(3, 'Fragen', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-3.5 h-3.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>`)}
                    ${renderStepTab(4, 'Rezension', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-3.5 h-3.5"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>`)}
                  </div>
                  <button type="button" id="tkt-modal-close" class="grid place-items-center -mr-2 size-9 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                  </button>
                </div>
              </div>

              <!-- Wizard Body -->
              <div class="flex-1 overflow-y-auto min-h-0">
                <div style="opacity: 1; transform: none;">
                  ${stepBodyHtml}
                </div>
              </div>

              <!-- Wizard Footer -->
              <div class="flex items-center justify-between gap-3 px-5 py-3 border-t border-neutral-800 flex-shrink-0">
                <button type="button" id="wiz-btn-prev" class="flex items-center gap-1.5 h-10 -ml-2.5 pl-2.5 pr-3.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left w-3.5 h-3.5"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                  Vorherige
                </button>
                <div class="flex items-center gap-3">
                  <div class="hidden sm:flex items-center gap-2.5 h-10 px-3.5 rounded-xl bg-neutral-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                    <div class="w-2.5 h-2.5 rounded-full outline outline-1 -outline-offset-1 outline-white/10" style="background-color: ${draft.color};"></div>
                    <span class="text-[10px] text-neutral-400 font-medium whitespace-nowrap">${escapeHtml(modeInfo.label)}</span>
                    <span class="text-[10px] text-neutral-700">/</span>
                    <span class="text-[10px] text-neutral-500 tabular-nums whitespace-nowrap">Schritt ${currentStep}/4</span>
                    <span class="text-[10px] text-neutral-700">/</span>
                    <span class="text-[10px] text-neutral-500 tabular-nums whitespace-nowrap">${draft.questions.length}/5 Felder</span>
                  </div>
                  <button type="button" id="wiz-btn-next" ${isNextDisabled ? 'disabled' : ''} class="flex items-center gap-1.5 bg-white text-black font-medium text-sm rounded-xl h-10 pl-4 pr-3.5 hover:bg-neutral-200 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-30 disabled:cursor-not-allowed">
                    ${currentStep === 4 ? (isEditing ? 'Speichern' : 'Ticket-Typ erstellen') : 'Nächste'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3.5 h-3.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        // Bind Wizard Controls
        document.getElementById('tkt-modal-close')?.addEventListener('click', closeModal);

        document.getElementById('wiz-top-back')?.addEventListener('click', () => {
          if (isEditing) {
            closeModal();
          } else {
            currentStep = 0;
            openDropdownId = null;
            renderModalContent();
          }
        });

        modalRoot.querySelectorAll('[data-wizard-step]').forEach(tab => {
          tab.addEventListener('click', () => {
            const targetStep = parseInt(tab.getAttribute('data-wizard-step'), 10);
            if (targetStep > 2 && !draft.panel_channel_id) {
              if (window.Notifications) Notifications.show('Bitte wählen Sie zuerst einen Panel-Kanal aus.', 'info');
              currentStep = 2;
            } else {
              currentStep = targetStep;
            }
            openDropdownId = null;
            renderModalContent();
          });
        });

        // Step 1 bindings
        document.getElementById('wiz-input-name')?.addEventListener('input', (e) => { draft.name = e.target.value; });
        document.getElementById('wiz-input-btn-label')?.addEventListener('input', (e) => { draft.button_label = e.target.value; });
        document.getElementById('wiz-input-desc')?.addEventListener('input', (e) => { draft.description = e.target.value; });
        modalRoot.querySelectorAll('[data-wiz-mode]').forEach(btn => {
          btn.addEventListener('click', () => {
            const mKey = btn.getAttribute('data-wiz-mode');
            draft.mode = mKey;
            draft.color = MODE_META[mKey]?.color || draft.color;
            renderModalContent();
          });
        });

        // Step 2 bindings
        document.getElementById('wiz-dd-panel-channel-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          openDropdownId = openDropdownId === 'panel_ch' ? null : 'panel_ch';
          renderModalContent();
        });
        modalRoot.querySelectorAll('[data-select-panel-ch]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            draft.panel_channel_id = btn.getAttribute('data-select-panel-ch') || '';
            openDropdownId = null;
            renderModalContent();
          });
        });

        document.getElementById('wiz-dd-log-channel-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          openDropdownId = openDropdownId === 'log_ch' ? null : 'log_ch';
          renderModalContent();
        });
        modalRoot.querySelectorAll('[data-select-log-ch]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            draft.log_channel_id = btn.getAttribute('data-select-log-ch') || '';
            openDropdownId = null;
            renderModalContent();
          });
        });

        document.getElementById('wiz-dd-role-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          openDropdownId = openDropdownId === 'role' ? null : 'role';
          renderModalContent();
        });
        modalRoot.querySelectorAll('[data-select-wiz-role]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            draft.role_id = btn.getAttribute('data-select-wiz-role') || '';
            openDropdownId = null;
            renderModalContent();
          });
        });

        document.getElementById('wiz-dd-cat-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          openDropdownId = openDropdownId === 'cat' ? null : 'cat';
          renderModalContent();
        });
        modalRoot.querySelectorAll('[data-select-wiz-cat]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            draft.category_id = btn.getAttribute('data-select-wiz-cat') || '';
            openDropdownId = null;
            renderModalContent();
          });
        });

        document.getElementById('wiz-switch-proof')?.addEventListener('click', () => {
          draft.require_proof = !draft.require_proof;
          updateSwitchVisual('wiz-switch-proof', draft.require_proof);
        });

        // Step 3 bindings
        document.getElementById('wiz-add-question')?.addEventListener('click', () => {
          if (draft.questions.length < 5) {
            draft.questions.push({ label: 'Neue Frage', placeholder: '', style: 'short', required: true });
            renderModalContent();
          }
        });
        modalRoot.querySelectorAll('[data-q-label]').forEach(inp => {
          inp.addEventListener('input', () => {
            draft.questions[parseInt(inp.getAttribute('data-q-label'), 10)].label = inp.value;
          });
        });
        modalRoot.querySelectorAll('[data-q-ph]').forEach(inp => {
          inp.addEventListener('input', () => {
            draft.questions[parseInt(inp.getAttribute('data-q-ph'), 10)].placeholder = inp.value;
          });
        });
        modalRoot.querySelectorAll('[data-q-style]').forEach(sel => {
          sel.addEventListener('change', () => {
            draft.questions[parseInt(sel.getAttribute('data-q-style'), 10)].style = sel.value;
          });
        });
        modalRoot.querySelectorAll('[data-q-req]').forEach(chk => {
          chk.addEventListener('change', () => {
            draft.questions[parseInt(chk.getAttribute('data-q-req'), 10)].required = chk.checked;
          });
        });
        modalRoot.querySelectorAll('[data-q-del]').forEach(btn => {
          btn.addEventListener('click', () => {
            draft.questions.splice(parseInt(btn.getAttribute('data-q-del'), 10), 1);
            renderModalContent();
          });
        });

        // Step 4 bindings
        document.getElementById('wiz-switch-post-now')?.addEventListener('click', () => {
          draft.post_immediately = draft.post_immediately === false ? true : false;
          updateSwitchVisual('wiz-switch-post-now', draft.post_immediately);
        });

        // Prev / Next footer buttons
        document.getElementById('wiz-btn-prev')?.addEventListener('click', () => {
          openDropdownId = null;
          if (currentStep > 1) {
            currentStep -= 1;
          } else if (!isEditing) {
            currentStep = 0;
          } else {
            closeModal();
            return;
          }
          renderModalContent();
        });

        document.getElementById('wiz-btn-next')?.addEventListener('click', async () => {
          openDropdownId = null;
          if (currentStep < 4) {
            currentStep += 1;
            renderModalContent();
            return;
          }

          // Final Step 4 Submit
          const existingIdx = state.ticketTypes.findIndex(t => t.id === draft.id);
          if (existingIdx >= 0) {
            state.ticketTypes[existingIdx] = draft;
          } else {
            state.ticketTypes.push(draft);
          }

          if (draft.panel_channel_id) state.panel_channel_id = draft.panel_channel_id;
          if (draft.log_channel_id) state.log_channel_id = draft.log_channel_id;
          state.enabled = true;

          closeModal();
          renderMain();
          await saveTicketConfig(true);

          if (draft.post_immediately !== false && draft.panel_channel_id) {
            try {
              await API.sendTicketPanel(guildId, {
                channel_id: draft.panel_channel_id,
                slot_id: draft.id,
                slot_name: draft.name
              });
              if (window.Notifications) Notifications.show(`Ticket-Typ "${draft.name}" erstellt & Panel in Discord gesendet!`, 'success');
            } catch (err) {
              if (window.Notifications) Notifications.show(`Ticket-Typ gespeichert, aber Panel-Versand fehlgeschlagen: ${err.message}`, 'error');
            }
          } else {
            if (window.Notifications) Notifications.show(`Ticket-Typ "${draft.name}" gespeichert!`, 'success');
          }
        });
      };

      renderModalContent();
    };

    renderMain();
  } catch (err) {
    container.innerHTML = `<div class="p-8 text-red-400 text-center text-sm">Fehler beim Laden des Ticket-Tabs: ${err.message}</div>`;
  }
};
