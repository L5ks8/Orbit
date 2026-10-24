/**
 * Orbit Dashboard - Tickets Tab (/dashboard/:guildId/tickets)
 * 1:1 PeakBot Tickets UI with Stats Bar, Ticketarten Cards Grid,
 * Multi-Option Modal Builder (Grundlagen -> Aufstellen/Optionen -> Rezension & Live Preview),
 * Submissions Filter & Global Settings.
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
    const [configRes, chRes, rolesRes] = await Promise.all([
      API.getConfig(guildId).catch(() => ({})),
      API.getChannels(guildId).catch(() => []),
      API.getRoles(guildId).catch(() => [])
    ]);

    const rawChannels = (Array.isArray(chRes) && chRes.length > 0)
      ? chRes
      : (Array.isArray(configRes?.channels) ? configRes.channels : []);
    let allChannels = rawChannels.filter(c => !c.type || c.type === 'text' || c.type === 'news' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text')));
    let allCategories = Array.isArray(configRes?.categories) ? [...configRes.categories] : [];
    if (allCategories.length === 0 && Array.isArray(rawChannels)) {
      rawChannels.forEach(c => {
        if (c.type === 4 || c.type === 'category' || (c.type && String(c.type).includes('category'))) {
          if (!allCategories.some(cat => String(cat.id) === String(c.id))) {
            allCategories.push({ id: String(c.id), name: c.name });
          }
        }
      });
    }
    const rawRoles = (Array.isArray(rolesRes) && rolesRes.length > 0)
      ? rolesRes
      : (Array.isArray(configRes?.roles) ? configRes.roles : []);
    let allRoles = rawRoles.filter(r => r.name !== '@everyone');
    const allMembers = configRes?.members || [];
    const tCfg = (configRes?.config && configRes.config.ticket) || {};

    const escapeHtml = (str) => String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const getChannelById = (id) => allChannels.find(c => String(c.id) === String(id));
    const getRoleById = (id) => allRoles.find(r => String(r.id) === String(id));
    const getCategoryById = (id) => allCategories.find(c => String(c.id) === String(id));
    const getMemberById = (id) => allMembers.find(m => String(m.id) === String(id));

    // Initial parsing of ticket panels
    const rawPanels = Array.isArray(tCfg.ticket_panels) && tCfg.ticket_panels.length > 0
      ? tCfg.ticket_panels
      : null;

    let initialPanels = [];
    if (rawPanels) {
      initialPanels = rawPanels.map((p, pIdx) => ({
        id: String(p.id || `panel_${Date.now()}_${pIdx}`),
        name: String(p.name || p.title || 'Support Ticket'),
        title: String(p.title || p.name || 'Support Ticket'),
        description: String(p.description || 'Öffnen Sie ein Ticket, um mit unserem Team zu sprechen.'),
        instructions: String(p.instructions || '> Select your desired inquiry category in the dropdown menu below, then click Create Ticket to open your private channel.'),
        color: String(p.color || '#5865F2'),
        panel_channel_id: String(p.panel_channel_id || tCfg.panel_channel_id || ''),
        log_channel_id: String(p.log_channel_id || tCfg.log_channel_id || ''),
        category_id: String(p.category_id || ''),
        role_ids: Array.isArray(p.role_ids) ? p.role_ids.map(String) : (p.role_id ? [String(p.role_id)] : []),
        role_id: String(p.role_id || (Array.isArray(p.role_ids) && p.role_ids[0]) || ''),
        button_label: String(p.button_label || 'Ticket öffnen'),
        options: Array.isArray(p.options) && p.options.length > 0 ? p.options.map((opt, oIdx) => ({
          id: String(opt.id || `opt_${pIdx}_${oIdx}`),
          name: String(opt.name || 'Allgemeine Unterstützung'),
          description: String(opt.description || 'Öffnen Sie einen privaten 1-zu-1 Support-Kanal mit unserem Team.'),
          color: String(opt.color || '#5865F2'),
          category_id: String(opt.category_id || ''),
          role_ids: Array.isArray(opt.role_ids) ? opt.role_ids.map(String) : (opt.role_id ? [String(opt.role_id)] : []),
          role_id: String(opt.role_id || (Array.isArray(opt.role_ids) && opt.role_ids[0]) || '')
        })) : [
          {
            id: `opt_${pIdx}_0`,
            name: 'Allgemeine Unterstützung',
            description: 'Öffnen Sie einen privaten 1-zu-1 Support-Kanal mit unserem Team.',
            color: '#5865F2',
            category_id: String(p.category_id || ''),
            role_ids: Array.isArray(p.role_ids) ? p.role_ids.map(String) : (p.role_id ? [String(p.role_id)] : []),
            role_id: String(p.role_id || '')
          }
        ]
      }));
    } else if (Array.isArray(tCfg.options_slots) && tCfg.options_slots.length > 0) {
      // Migrate legacy options_slots into 1 central panel with multiple options
      initialPanels = [{
        id: 'panel_default',
        name: String(tCfg.panel_title || 'Support Ticket'),
        title: String(tCfg.panel_title || 'Support Ticket'),
        description: String(tCfg.panel_description || 'Öffnen Sie ein Ticket, um mit unserem Team zu sprechen.'),
        instructions: String(tCfg.panel_instructions || '> Select your desired inquiry category in the dropdown menu below, then click Create Ticket to open your private channel.'),
        color: '#5865F2',
        panel_channel_id: String(tCfg.panel_channel_id || (tCfg.options_slots[0]?.panel_channel_id || '')),
        log_channel_id: String(tCfg.log_channel_id || (tCfg.options_slots[0]?.log_channel_id || '')),
        category_id: String(tCfg.options_slots[0]?.category_id || ''),
        role_ids: Array.isArray(tCfg.options_slots[0]?.role_ids) ? tCfg.options_slots[0].role_ids.map(String) : (tCfg.options_slots[0]?.role_id ? [String(tCfg.options_slots[0].role_id)] : []),
        role_id: String(tCfg.options_slots[0]?.role_id || ''),
        button_label: 'Ticket öffnen',
        options: tCfg.options_slots.map((s, idx) => ({
          id: String(s.id || `opt_${idx}`),
          name: String(s.name || 'Option'),
          description: String(s.description || 'Öffnen Sie ein Ticket.'),
          color: String(s.color || '#5865F2'),
          category_id: String(s.category_id || ''),
          role_ids: Array.isArray(s.role_ids) ? s.role_ids.map(String) : (s.role_id ? [String(s.role_id)] : []),
          role_id: String(s.role_id || '')
        }))
      }];
    }

    const state = {
      enabled: initialPanels.length > 0 || Boolean(tCfg.enabled),
      panels: initialPanels,
      auto_close_time_enabled: Boolean(tCfg.auto_close_time_enabled),
      auto_close_time_hours: parseInt(tCfg.auto_close_time_hours, 10) || 24,
      max_open_tickets: parseInt(tCfg.max_open_tickets, 10) || 3,
      naming_format: String(tCfg.naming_format || ''),
      staff_only_close: Boolean(tCfg.staff_only_close),
      ping_support_roles: tCfg.ping_support_roles !== undefined ? Boolean(tCfg.ping_support_roles) : true,
      ping_custom_role_enabled: Boolean(tCfg.ping_custom_role_enabled),
      ping_custom_role_id: String(tCfg.ping_custom_role_id || ''),
      claiming_enabled: Boolean(tCfg.claiming_enabled),
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
          // Construct flattened options_slots from all panels for bot backwards-compatibility
          const allSlots = [];
          state.panels.forEach(p => {
            (p.options || []).forEach(opt => {
              const optRoles = Array.isArray(opt.role_ids) && opt.role_ids.length > 0
                ? opt.role_ids
                : (opt.role_id ? [opt.role_id] : (Array.isArray(p.role_ids) && p.role_ids.length > 0 ? p.role_ids : (p.role_id ? [p.role_id] : [])));
              allSlots.push({
                id: opt.id,
                name: opt.name,
                description: opt.description,
                color: opt.color || p.color,
                panel_channel_id: p.panel_channel_id,
                log_channel_id: p.log_channel_id,
                category_id: opt.category_id || p.category_id,
                role_id: optRoles[0] || opt.role_id || p.role_id || '',
                role_ids: optRoles,
                button_label: p.button_label || 'Ticket öffnen'
              });
            });
          });

          const primaryPanel = state.panels[0] || {};
          await API.saveConfig(guildId, {
            ticket: {
              enabled: state.panels.length > 0 ? true : state.enabled,
              ticket_panels: state.panels,
              options_slots: allSlots,
              panel_title: primaryPanel.title || primaryPanel.name || 'Support Ticket',
              panel_description: primaryPanel.description || '',
              panel_instructions: primaryPanel.instructions || '',
              panel_channel_id: primaryPanel.panel_channel_id || '',
              log_channel_id: primaryPanel.log_channel_id || '',
              auto_close_time_enabled: state.auto_close_time_enabled,
              auto_close_time_hours: state.auto_close_time_hours,
              max_open_tickets: state.max_open_tickets,
              naming_format: state.naming_format,
              staff_only_close: state.staff_only_close,
              ping_support_roles: state.ping_support_roles,
              ping_custom_role_enabled: state.ping_custom_role_enabled,
              ping_custom_role_id: state.ping_custom_role_id,
              claiming_enabled: state.claiming_enabled,
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

    const closeAllDropdowns = () => {
      document.querySelectorAll('.orbit-dropdown-menu').forEach(m => m.classList.add('hidden'));
    };

    // Main Render Function
    const renderMain = () => {
      const { openCount, claimedCount, resolved7d, avgStr } = computeLiveStats();
      const count = state.panels.length;
      const progressPct = Math.min(100, count > 0 ? Math.max(4, (count / 10) * 100) : 0);

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
            <!-- Top Stats KPI Strip -->
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

            <!-- Ticketarten Section (Clean PeakBot Layout) -->
            <div data-tour="tickets-roles" class="mb-8 scroll-mt-24">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h3 class="text-sm font-semibold text-white text-balance">Ticketarten</h3>
                  <p class="text-xs text-neutral-400 mt-0.5">Erstellen und verwalten Sie verschiedene Ticketarten für Ihren Server.</p>
                </div>
                <div class="flex items-center flex-wrap gap-2.5">
                  <div class="flex items-center gap-3">
                    <span id="tkt-types-counter" class="text-xs tabular-nums text-neutral-500">${count}/999 Typen</span>
                    <div class="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden">
                      <div id="tkt-types-progress" class="h-full rounded-full transition-all bg-white/60" style="width: ${progressPct}%;"></div>
                    </div>
                  </div>
                  <button type="button" id="btn-create-ticket-top" data-tour="tickets-create" class="flex items-center gap-1.5 bg-white text-black font-medium text-sm rounded-xl h-10 pl-3.5 pr-4 hover:bg-neutral-200 whitespace-nowrap transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer scroll-mt-24">
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
              <div id="submissions-header" class="flex items-center justify-between gap-3 mb-4 flex-wrap">
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
                    <input id="tkt-input-max-open" autocomplete="off" class="w-full px-4 py-2.5 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600 text-center text-sm" min="1" max="25" placeholder="3" type="number" value="${state.max_open_tickets}">
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
                  <div class="w-60 flex-shrink-0">
                    <input id="tkt-input-naming-format" autocomplete="off" class="w-full px-4 py-2 bg-neutral-800 border rounded-xl text-white placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-700 hover:border-neutral-600 text-xs sm:text-sm" placeholder="{Typ}-{Nummer} · {Benutzer}" value="${escapeHtml(state.naming_format)}">
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

                <!-- Row 6: Pingen Sie eine Rolle für ein neues Ticket (Custom Searchable Dropdown) -->
                <div class="px-5 py-4 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell w-4 h-4 text-violet-400"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                    </div>
                    <p class="text-sm font-medium text-white min-w-0 truncate">Pingen Sie eine Rolle für ein neues Ticket</p>
                  </div>
                  <div class="flex items-center gap-2.5 flex-shrink-0">
                    <div id="ping-custom-role-wrap" class="relative ${state.ping_custom_role_enabled ? '' : 'hidden'}">
                      <button type="button" id="tkt-dd-ping-role-btn" class="h-9 px-3 min-w-[170px] bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-xs text-white flex items-center justify-between gap-2 transition-colors cursor-pointer">
                        <span id="tkt-dd-ping-role-label" class="truncate">
                          ${(() => {
                            const pr = allRoles.find(r => String(r.id) === String(state.ping_custom_role_id));
                            return pr ? `@${escapeHtml(pr.name)}` : 'Rolle wählen...';
                          })()}
                        </span>
                        <svg class="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                      <div id="tkt-dd-ping-role-menu" data-lenis-prevent="true" style="z-index: 99999;" class="orbit-dropdown-menu hidden absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl z-[99999] max-h-60 flex flex-col overflow-hidden">
                        <!-- Search Bar -->
                        <div class="orbit-searchbar-header sticky top-0 z-20 p-2 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/80 shrink-0">
                          <div class="relative w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                            <input type="text" id="tkt-search-ping-role" placeholder="Suchen..." class="orbit-searchbar-input w-full pl-9 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
                          </div>
                        </div>
                        <div class="overflow-y-auto p-1 space-y-0.5 flex-1 max-h-48" id="tkt-list-ping-role">
                          <button type="button" data-tkt-ping-role-opt="" class="w-full px-3 py-1.5 rounded-lg text-left text-xs text-neutral-400 hover:bg-neutral-800/60">Keine Rolle</button>
                          ${allRoles.map(r => `
                            <button type="button" data-tkt-ping-role-opt="${escapeHtml(r.id)}" class="w-full px-3 py-1.5 rounded-lg text-left text-xs text-neutral-300 hover:bg-neutral-800/60 flex items-center gap-2">
                              <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${escapeHtml(r.color || '#99aab5')}"></span>
                              <span class="truncate">@${escapeHtml(r.name)}</span>
                            </button>
                          `).join('')}
                        </div>
                      </div>
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

        <!-- Builder Modal Mount Point -->
        <div id="tickets-modal-root"></div>
      `;

      renderTicketTypesGrid();
      renderSubmissionsSection();
      bindMainEvents();
    };

    // Render Ticketarten Grid (PeakBot Cards)
    const renderTicketTypesGrid = () => {
      const grid = document.getElementById('tickets-types-grid');
      const counterEl = document.getElementById('tkt-types-counter');
      const progressEl = document.getElementById('tkt-types-progress');
      if (!grid) return;

      const count = state.panels.length;
      if (counterEl) counterEl.textContent = `${count}/999 Typen`;
      if (progressEl) progressEl.style.width = `${Math.min(100, count > 0 ? Math.max(4, (count / 10) * 100) : 0)}%`;

      if (count === 0) {
        grid.innerHTML = `
          <div class="col-span-full p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
            <div class="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path></svg>
            </div>
            <p class="text-sm font-medium text-neutral-300">Keine Ticketarten vorhanden</p>
            <p class="text-xs text-neutral-500 mt-1">Erstellen Sie Ihren ersten Ticket-Typ, um zu beginnen.</p>
            <button type="button" id="btn-create-first-ticket" class="mt-4 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-transform active:scale-[0.96] cursor-pointer">
              + Jetzt Ticket-Typ erstellen
            </button>
          </div>
        `;
        document.getElementById('btn-create-first-ticket')?.addEventListener('click', () => openTicketBuilderModal(null));
        return;
      }

      const cards = state.panels.map((p) => {
        const pCh = getChannelById(p.panel_channel_id);
        const optCount = Array.isArray(p.options) ? p.options.length : 1;
        // Count unique roles
        const roleSet = new Set();
        if (p.role_id) roleSet.add(p.role_id);
        (p.options || []).forEach(o => { if (o.role_id) roleSet.add(o.role_id); });
        const rolesCount = roleSet.size;

        return `
          <div class="group bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden hover:border-neutral-600 hover:bg-neutral-900/80 hover:shadow-lg hover:shadow-black/20 transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out cursor-pointer min-h-[160px] hover:-translate-y-0.5 active:scale-[0.96] active:translate-y-0 flex flex-col justify-between" data-open-panel-edit="${escapeHtml(p.id)}">
            <div class="h-[3px]" style="background-color: ${p.color || '#5865F2'};"></div>
            <div class="p-4 h-full flex flex-col flex-1 justify-between">
              <div>
                <div class="flex items-start gap-3 mb-2.5">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-inset ring-white/10 shadow-sm shadow-black/20" style="background-color: ${p.color ? p.color.replace('rgb(', 'rgba(').replace(')', ', 0.125)') : 'rgba(88, 101, 242, 0.125)'};">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-[18px] h-[18px]" style="color: ${p.color || '#5865F2'};"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                  </div>
                  <div class="flex-1 min-w-0 pt-0.5">
                    <h3 class="text-sm font-semibold text-white truncate leading-tight text-balance">${escapeHtml(p.name || p.title || 'Ticket')}</h3>
                    <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium bg-neutral-800 text-neutral-400 ring-1 ring-inset ring-white/10 whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-2.5 h-2.5 flex-shrink-0"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                        ${pCh ? escapeHtml(pCh.name) : 'Kanal'}
                      </span>
                      <span class="px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap bg-emerald-500/10 text-emerald-400">
                        Aktiv
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0 -mr-1 -mt-1 relative">
                    <button type="button" data-card-menu-trigger="${escapeHtml(p.id)}" class="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal w-4 h-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
                    <!-- Card Menu Dropdown -->
                    <div id="card-menu-${escapeHtml(p.id)}" class="orbit-dropdown-menu hidden absolute right-0 top-full mt-1 w-36 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-40 p-1 divide-y divide-neutral-800/80">
                      <div class="py-0.5">
                        <button type="button" data-card-action="edit" data-panel-id="${escapeHtml(p.id)}" class="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2">
                          <svg class="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                          Bearbeiten
                        </button>
                        <button type="button" data-card-action="duplicate" data-panel-id="${escapeHtml(p.id)}" class="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2">
                          <svg class="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                          Duplizieren
                        </button>
                      </div>
                      <div class="pt-1">
                        <button type="button" data-card-action="delete" data-panel-id="${escapeHtml(p.id)}" class="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                          <svg class="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                          Löschen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <p class="text-xs text-neutral-400 leading-relaxed line-clamp-2 mb-3 pl-[52px] text-pretty">
                  ${escapeHtml(p.description || 'Keine Beschreibung')}
                </p>
              </div>

              <div class="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
                <div class="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-neutral-500">
                  <div class="flex items-center gap-1 whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers w-3 h-3 flex-shrink-0"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path></svg>
                    <span class="tabular-nums">${optCount} Option${optCount === 1 ? '' : 'en'}</span>
                  </div>
                  <span class="text-neutral-700">·</span>
                  <div class="flex items-center gap-1 whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-3 h-3 flex-shrink-0"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
                    <span class="tabular-nums">${rolesCount} Rolle${rolesCount === 1 ? '' : 'n'}</span>
                  </div>
                  <span class="text-neutral-700">·</span>
                  <div class="flex items-center gap-1 whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-3 h-3 flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span class="tabular-nums">soeben</span>
                  </div>
                </div>

                <button type="button" data-deploy-panel-id="${escapeHtml(p.id)}" class="flex flex-shrink-0 items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket w-3.5 h-3.5"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
                  Einsetzen
                </button>
              </div>
            </div>
          </div>
        `;
      });

      grid.innerHTML = cards.join('');

      // Bind card clicks for editing
      grid.querySelectorAll('[data-open-panel-edit]').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('[data-card-menu-trigger]') || e.target.closest('.orbit-dropdown-menu') || e.target.closest('[data-deploy-panel-id]')) return;
          const pid = card.getAttribute('data-open-panel-edit');
          const panel = state.panels.find(p => p.id === pid);
          if (panel) openTicketBuilderModal(panel);
        });
      });

      // Bind 3-dots menus
      grid.querySelectorAll('[data-card-menu-trigger]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const pid = btn.getAttribute('data-card-menu-trigger');
          const menu = document.getElementById(`card-menu-${pid}`);
          const wasHidden = menu?.classList.contains('hidden');
          closeAllDropdowns();
          if (wasHidden) menu?.classList.remove('hidden');
        });
      });

      // Bind card actions (edit, duplicate, delete)
      grid.querySelectorAll('[data-card-action]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          closeAllDropdowns();
          const act = btn.getAttribute('data-card-action');
          const pid = btn.getAttribute('data-panel-id');
          const panel = state.panels.find(p => p.id === pid);
          if (!panel) return;

          if (act === 'edit') {
            openTicketBuilderModal(panel);
          } else if (act === 'duplicate') {
            const clone = JSON.parse(JSON.stringify(panel));
            clone.id = `panel_${Date.now()}`;
            clone.name = `${panel.name || panel.title || 'Ticket'} (Kopie)`;
            clone.title = clone.name;
            state.panels.push(clone);
            renderMain();
            await saveTicketConfig(true);
            if (window.Notifications) Notifications.show(`Ticket-Typ "${clone.name}" wurde dupliziert.`, 'success');
          } else if (act === 'delete') {
            const confirmed = await window.confirmDelete({
              title: `${panel.name || panel.title || 'Ticket-Typ'} löschen?`,
              message: 'Das kann nicht rückgängig gemacht werden. Das Ticket-Panel wird nicht mehr funktionieren.',
              confirmText: 'Löschen',
              cancelText: 'Abbrechen'
            });
            if (!confirmed) return;
            state.panels = state.panels.filter(p => p.id !== pid);
            renderMain();
            await saveTicketConfig(true);
            if (window.Notifications) Notifications.show(`Ticket-Typ wurde gelöscht.`, 'info');
          }
        });
      });

      // Bind direct Deploy (Einsetzen) button on card
      grid.querySelectorAll('[data-deploy-panel-id]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const pid = btn.getAttribute('data-deploy-panel-id');
          const panel = state.panels.find(p => p.id === pid);
          if (!panel) return;

          if (!panel.panel_channel_id) {
            if (window.Notifications) Notifications.show(`Bitte weisen Sie dem Ticket-Typ "${panel.name}" zuerst einen Panel-Kanal zu.`, 'info');
            openTicketBuilderModal(panel);
            return;
          }

          const origContent = btn.innerHTML;
          btn.innerHTML = `<span>Sendet...</span>`;
          btn.disabled = true;

          try {
            await saveTicketConfig(true);
            await API.sendTicketPanel(guildId, {
              panel_id: panel.id,
              channel_id: panel.panel_channel_id,
              panel_title: panel.title || panel.name || 'Support Ticket',
              panel_description: panel.description || '',
              panel_instructions: panel.instructions || '',
              color: panel.color || '#5865F2',
              options: panel.options || []
            });
            if (window.Notifications) Notifications.show(`Ticket-Panel "${panel.name || panel.title}" erfolgreich in Discord gesendet!`, 'success');
          } catch (err) {
            if (window.Notifications) Notifications.show(err.message || 'Fehler beim Senden des Ticket-Panels', 'error');
          } finally {
            btn.innerHTML = origContent;
            btn.disabled = false;
          }
        });
      });
    };

    // Render Einreichungen Section
    const renderSubmissionsSection = () => {
      const filterBar = document.getElementById('submissions-filter-bar');
      const listContainer = document.getElementById('submissions-list-container');
      const subHeader = document.getElementById('submissions-header');
      if (!filterBar || !listContainer) return;

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

      if (subHeader) {
        subHeader.innerHTML = `
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-white text-balance">Einreichungen</h3>
            <span class="text-xs text-neutral-500 tabular-nums">(${allSubmissions.length})</span>
          </div>
          ${state.closedTickets.length > 0 ? `
            <button type="button" id="btn-clear-closed-tickets" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
              <span>Geschlossene Tickets leeren</span>
              <span class="px-1.5 py-0.5 rounded-md bg-red-500/20 text-[10px] font-bold tabular-nums">${state.closedTickets.length}</span>
            </button>
          ` : ''}
        `;

        const clearBtn = subHeader.querySelector('#btn-clear-closed-tickets');
        if (clearBtn) {
          clearBtn.onclick = async () => {
            const count = state.closedTickets.length;
            if (!confirm(`Möchtest du wirklich alle ${count} geschlossenen Tickets aus dem Dashboard löschen?`)) return;
            try {
              if (API.clearClosedTickets) {
                await API.clearClosedTickets(guildId);
              } else {
                await saveTicketConfig(true, { clear_closed_tickets: true });
              }
              state.closedTickets = [];
              renderMain();
              if (window.Notifications) Notifications.show('Alle geschlossenen Tickets wurden gelöscht.', 'success');
              else if (window.Toast) Toast.success('Alle geschlossenen Tickets wurden gelöscht.');
            } catch (err) {
              if (window.Notifications) Notifications.show(err.message || 'Fehler beim Löschen.', 'error');
            }
          };
        }
      }

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
                    <button type="button" data-sub-action="claimed" data-sub-id="${escapeHtml(subId)}" class="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium transition-colors cursor-pointer">Übernehmen</button>
                  ` : ''}
                  ${sub.status !== 'resolved' ? `
                    <button type="button" data-sub-action="resolved" data-sub-id="${escapeHtml(subId)}" class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors cursor-pointer">Lösen</button>
                  ` : ''}
                  ${sub.status !== 'rejected' ? `
                    <button type="button" data-sub-action="rejected" data-sub-id="${escapeHtml(subId)}" class="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors cursor-pointer">Ablehnen</button>
                  ` : ''}
                  ${!sub.is_active ? `
                    <button type="button" data-sub-delete="${escapeHtml(subId)}" title="Geschlossenes Ticket aus Dashboard löschen" class="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ml-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      listContainer.querySelectorAll('[data-sub-delete]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const subId = btn.getAttribute('data-sub-delete');
          if (!confirm('Dieses geschlossene Ticket aus dem Dashboard löschen?')) return;
          try {
            if (API.clearClosedTickets) {
              await API.clearClosedTickets(guildId, subId);
            }
            state.closedTickets = state.closedTickets.filter(t => String(t.id || t.channel_id) !== String(subId));
            renderMain();
            if (window.Notifications) Notifications.show('Ticket aus dem Dashboard entfernt.', 'success');
            else if (window.Toast) Toast.success('Ticket aus dem Dashboard entfernt.');
          } catch (err) {
            if (window.Notifications) Notifications.show(err.message || 'Fehler beim Löschen.', 'error');
          }
        });
      });

      listContainer.querySelectorAll('[data-sub-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const subId = btn.getAttribute('data-sub-id');
          const newStatus = btn.getAttribute('data-sub-action');
          btn.disabled = true;

          const activeIdx = state.activeTickets.findIndex(t => String(t.id || t.channel_id) === String(subId));
          let ticketNum = 'Ticket';
          if (activeIdx >= 0) {
            const item = state.activeTickets[activeIdx];
            ticketNum = `#${item.number || subId}`;
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
            if (closedItem) {
              ticketNum = `#${closedItem.number || subId}`;
              closedItem.status = newStatus;
            }
          }
          renderMain();

          try {
            if (API.ticketAction) {
              await API.ticketAction(guildId, subId, newStatus);
            } else {
              await saveTicketConfig(true, { submission_action: { id: subId, status: newStatus } });
            }
            const msg = newStatus === 'resolved'
              ? `${ticketNum} als Gelöst markiert und in Discord geschlossen.`
              : (newStatus === 'rejected'
                ? `${ticketNum} als Abgelehnt markiert und in Discord geschlossen.`
                : `${ticketNum} erfolgreich übernommen.`);
            if (window.Notifications) Notifications.show(msg, 'success');
            else if (window.Toast) Toast.success(msg);
          } catch (err) {
            if (window.Notifications) Notifications.show(err.message || 'Fehler bei der Ticket-Aktion.', 'error');
          }
        });
      });
    };

    // Bind Main Page Events
    const bindMainEvents = () => {
      document.getElementById('btn-goto-analytics')?.addEventListener('click', () => {
        if (window.Router) Router.navigate(`/dashboard/${guildId}/analytics`);
      });

      document.getElementById('btn-create-ticket-top')?.addEventListener('click', () => {
        openTicketBuilderModal(null);
      });

      // Switch 1: Auto Close
      document.getElementById('tkt-switch-autoclose')?.addEventListener('click', () => {
        state.auto_close_time_enabled = !state.auto_close_time_enabled;
        updateSwitchVisual('tkt-switch-autoclose', state.auto_close_time_enabled);
        const wrap = document.getElementById('autoclose-hours-wrap');
        if (wrap) wrap.classList.toggle('hidden', !state.auto_close_time_enabled);
        saveTicketConfig();
      });

      document.getElementById('tkt-autoclose-hours')?.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val > 0) {
          state.auto_close_time_hours = val;
          saveTicketConfig();
        }
      });

      // Max Open
      document.getElementById('tkt-input-max-open')?.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1 && val <= 25) {
          state.max_open_tickets = val;
          saveTicketConfig();
        }
      });

      // Naming format
      document.getElementById('tkt-input-naming-format')?.addEventListener('input', (e) => {
        state.naming_format = e.target.value;
        saveTicketConfig();
      });

      // Switch 4: Staff only close
      document.getElementById('tkt-switch-staff-close')?.addEventListener('click', () => {
        state.staff_only_close = !state.staff_only_close;
        updateSwitchVisual('tkt-switch-staff-close', state.staff_only_close);
        saveTicketConfig();
      });

      // Switch 5: Ping support
      document.getElementById('tkt-switch-ping-support')?.addEventListener('click', () => {
        state.ping_support_roles = !state.ping_support_roles;
        updateSwitchVisual('tkt-switch-ping-support', state.ping_support_roles);
        saveTicketConfig();
      });

      // Switch 6: Ping custom role
      document.getElementById('tkt-switch-ping-custom')?.addEventListener('click', () => {
        state.ping_custom_role_enabled = !state.ping_custom_role_enabled;
        updateSwitchVisual('tkt-switch-ping-custom', state.ping_custom_role_enabled);
        const wrap = document.getElementById('ping-custom-role-wrap');
        if (wrap) wrap.classList.toggle('hidden', !state.ping_custom_role_enabled);
        saveTicketConfig();
      });

      // Switch 7: Claiming
      document.getElementById('tkt-switch-claiming')?.addEventListener('click', () => {
        state.claiming_enabled = !state.claiming_enabled;
        updateSwitchVisual('tkt-switch-claiming', state.claiming_enabled);
        saveTicketConfig();
      });

      // Custom Ping Role Dropdown
      const pingRoleBtn = document.getElementById('tkt-dd-ping-role-btn');
      const pingRoleMenu = document.getElementById('tkt-dd-ping-role-menu');
      const pingRoleSearch = document.getElementById('tkt-search-ping-role');
      const pingRoleLabel = document.getElementById('tkt-dd-ping-role-label');

      pingRoleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasHidden = pingRoleMenu?.classList.contains('hidden');
        closeAllDropdowns();
        if (wasHidden) {
          pingRoleMenu?.classList.remove('hidden');
          if (pingRoleSearch) {
            pingRoleSearch.value = '';
            pingRoleSearch.focus();
            filterRoleList('');
          }
        }
      });

      const filterRoleList = (term) => {
        const lower = term.toLowerCase().trim();
        document.querySelectorAll('#tkt-list-ping-role [data-tkt-ping-role-opt]').forEach(btn => {
          const txt = btn.textContent.toLowerCase();
          btn.style.display = (!lower || txt.includes(lower)) ? '' : 'none';
        });
      };

      pingRoleSearch?.addEventListener('input', (e) => filterRoleList(e.target.value));

      document.querySelectorAll('#tkt-list-ping-role [data-tkt-ping-role-opt]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rid = btn.getAttribute('data-tkt-ping-role-opt');
          state.ping_custom_role_id = rid;
          const found = allRoles.find(r => String(r.id) === String(rid));
          if (pingRoleLabel) {
            pingRoleLabel.textContent = found ? `@${found.name}` : 'Rolle wählen...';
          }
          pingRoleMenu?.classList.add('hidden');
          saveTicketConfig();
        });
      });

      document.addEventListener('click', () => closeAllDropdowns());
    };

    // ==========================================
    // THE BUILDER MODAL ("das soll der builder sein")
    // ==========================================
    const openTicketBuilderModal = (panelToEdit = null) => {
      const isEdit = Boolean(panelToEdit);

      // Lock background scrolling while modal is open
      const prevBodyOverflow = document.body.style.overflow;
      const prevDocOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (window.lenis && typeof window.lenis.stop === 'function') {
        window.lenis.stop();
      }

      const unlockScroll = () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevDocOverflow;
        if (window.lenis && typeof window.lenis.start === 'function') {
          window.lenis.start();
        }
      };

      const rawRoleIds = Array.isArray(panelToEdit?.role_ids)
        ? [...panelToEdit.role_ids].map(String)
        : (panelToEdit?.role_id ? [String(panelToEdit.role_id)] : (allRoles[0]?.id ? [String(allRoles[0].id)] : []));

      // Create a working copy of the panel
      const editingPanel = panelToEdit ? JSON.parse(JSON.stringify(panelToEdit)) : {
        id: `panel_${Date.now()}`,
        name: 'Support Ticket',
        title: 'Support Ticket Desk',
        description: 'Wählen Sie Ihr Anliegen aus und öffnen Sie ein Ticket.',
        instructions: '> Select your desired inquiry category in the dropdown menu below, then click Create Ticket to open your private channel.',
        color: '#5865F2',
        panel_channel_id: state.panels[0]?.panel_channel_id || (allChannels[0]?.id || ''),
        log_channel_id: state.panels[0]?.log_channel_id || '',
        category_id: allCategories[0]?.id || '',
        role_ids: rawRoleIds,
        role_id: rawRoleIds[0] || '',
        button_label: 'Ticket öffnen',
        options: [
          {
            id: `opt_${Date.now()}_1`,
            name: 'Allgemeine Unterstützung',
            description: 'Öffnen Sie einen privaten 1-zu-1 Support-Kanal mit unserem Team.',
            color: '#5865F2',
            category_id: allCategories[0]?.id || '',
            role_ids: rawRoleIds.length > 0 ? [...rawRoleIds] : [],
            role_id: rawRoleIds[0] || ''
          }
        ]
      };

      if (!Array.isArray(editingPanel.role_ids)) {
        editingPanel.role_ids = editingPanel.role_id ? [String(editingPanel.role_id)] : [];
      }
      if (!Array.isArray(editingPanel.options) || editingPanel.options.length === 0) {
        editingPanel.options = [
          {
            id: `opt_${Date.now()}_1`,
            name: 'Allgemeine Unterstützung',
            description: 'Öffnen Sie ein Support-Ticket.',
            color: editingPanel.color || '#5865F2',
            category_id: editingPanel.category_id || '',
            role_ids: [...editingPanel.role_ids],
            role_id: editingPanel.role_id || ''
          }
        ];
      }
      editingPanel.options.forEach(opt => {
        if (!Array.isArray(opt.role_ids)) {
          opt.role_ids = opt.role_id ? [String(opt.role_id)] : [];
        }
      });

      let currentStep = 1; // 1: Grundlagen, 2: Aufstellen (Optionen), 3: Rezension
      const modalRoot = document.getElementById('tickets-modal-root');
      if (!modalRoot) {
        unlockScroll();
        return;
      }

      const closeModal = () => {
        unlockScroll();
        window.removeEventListener('keydown', handleKeyDown);
        modalRoot.innerHTML = '';
      };

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      const syncInputsToState = () => {
        if (currentStep === 1) {
          const nameEl = document.getElementById('builder-input-name');
          const titleEl = document.getElementById('builder-input-title');
          const descEl = document.getElementById('builder-input-desc');
          const instrEl = document.getElementById('builder-input-instr');
          const colorEl = document.getElementById('builder-custom-color');
          if (nameEl) editingPanel.name = nameEl.value;
          if (titleEl) editingPanel.title = titleEl.value;
          if (descEl) editingPanel.description = descEl.value;
          if (instrEl) editingPanel.instructions = instrEl.value;
          if (colorEl && colorEl.value.trim()) {
            const raw = colorEl.value.trim();
            editingPanel.color = raw.startsWith('#') ? raw : `#${raw}`;
          }
        } else if (currentStep === 2) {
          modalRoot.querySelectorAll('[data-opt-field]').forEach(input => {
            const fld = input.getAttribute('data-opt-field');
            const idx = parseInt(input.getAttribute('data-opt-idx'), 10);
            if (!isNaN(idx) && editingPanel.options[idx]) {
              editingPanel.options[idx][fld] = input.value;
            }
          });
        }
      };

      const COLOR_CARDS = [
        { color: '#5865F2', name: 'Blurple', hex: '#5865F2' },
        { color: '#57F287', name: 'Grün', hex: '#57F287' },
        { color: '#248046', name: 'Smaragd', hex: '#248046' },
        { color: '#FEE75C', name: 'Gold', hex: '#FEE75C' },
        { color: '#ED4245', name: 'Karmesin', hex: '#ED4245' },
        { color: '#EB459E', name: 'Fuchsia', hex: '#EB459E' },
        { color: '#9B59B6', name: 'Violett', hex: '#9B59B6' },
        { color: '#1ABC9C', name: 'Türkis', hex: '#1ABC9C' },
      ];

      const renderModal = () => {
        const panelChannel = getChannelById(editingPanel.panel_channel_id);
        const logChannel = getChannelById(editingPanel.log_channel_id);
        const defCategory = getCategoryById(editingPanel.category_id);

        modalRoot.innerHTML = `
          <div id="builder-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-fadeIn select-none">
            <div class="w-[96vw] max-w-[1240px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_50px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] select-text">
              
              <!-- Modal Header -->
              <div class="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-neutral-800 flex-shrink-0 bg-neutral-900/90 backdrop-blur-sm">
                <div class="flex items-center gap-2 min-w-0">
                  <button type="button" id="modal-btn-back-header" class="grid place-items-center -ml-2 size-9 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer" title="${currentStep > 1 ? 'Zurück' : 'Schließen'}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                  </button>
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style="background-color: ${editingPanel.color || '#5865F2'};"></div>
                    <h2 class="text-sm font-semibold text-white truncate">
                      ${isEdit ? `Ticket-Typ bearbeiten – ${escapeHtml(editingPanel.name)}` : 'Neuer Ticket-Typ'}
                    </h2>
                  </div>
                </div>

                <div class="flex items-center gap-3 flex-shrink-0">
                  <!-- Step Navigation Pills -->
                  <div class="hidden sm:flex gap-1 p-1 rounded-xl bg-neutral-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                    <button type="button" data-nav-step="1" class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${currentStep === 1 ? 'text-black font-semibold bg-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'}">
                      ${currentStep > 1 ? '<svg class="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
                      <span>1. Grundlagen</span>
                    </button>

                    <button type="button" data-nav-step="2" class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${currentStep === 2 ? 'text-black font-semibold bg-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'}">
                      ${currentStep > 2 ? '<svg class="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
                      <span>2. Optionen (${editingPanel.options.length})</span>
                    </button>

                    <button type="button" data-nav-step="3" class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${currentStep === 3 ? 'text-black font-semibold bg-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'}">
                      <svg class="w-3.5 h-3.5 ${currentStep === 3 ? 'text-black' : 'text-neutral-400'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
                      <span>3. Rezension & Vorschau</span>
                    </button>
                  </div>

                  <button type="button" id="modal-btn-close-header" class="grid place-items-center -mr-2 size-9 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer" title="Schließen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                  </button>
                </div>
              </div>

              <!-- Modal Body Content -->
              <div class="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6" id="bld-modal-scroll-area">
                ${renderStepContent()}
              </div>

              <!-- Modal Footer -->
              <div class="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-neutral-800 flex-shrink-0 bg-neutral-900/90 backdrop-blur-sm">
                <button type="button" id="modal-btn-prev" class="flex items-center gap-1.5 h-10 px-3 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer ${currentStep === 1 ? 'opacity-30 pointer-events-none' : ''}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left w-3.5 h-3.5"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                  Vorherige
                </button>

                <div class="flex items-center gap-3">
                  <div class="hidden sm:flex items-center gap-2 h-10 px-3.5 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                    <span class="w-3 h-3 rounded-md shadow-sm shrink-0" style="background-color: ${editingPanel.color || '#5865F2'};"></span>
                    <span class="text-xs text-neutral-400 font-medium whitespace-nowrap">${editingPanel.options.length} Option${editingPanel.options.length === 1 ? '' : 'en'}</span>
                    <span class="text-neutral-600">·</span>
                    <span class="text-xs text-neutral-400 font-medium tabular-nums whitespace-nowrap">Schritt ${currentStep}/3</span>
                  </div>

                  <button type="button" id="modal-btn-next" class="inline-flex items-center justify-center gap-2 font-semibold rounded-xl bg-white text-black hover:bg-neutral-200 px-5 py-2.5 text-sm transition-all duration-150 active:scale-[0.96] cursor-pointer shadow-lg shadow-white/5">
                    ${currentStep === 3 ? (isEdit ? 'Änderungen speichern' : 'Ticket-Typ erstellen') : 'Weiter zu Schritt ' + (currentStep + 1)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        bindModalEvents();
      };

      const renderStepContent = () => {
        // STEP 1: Grundlagen
        if (currentStep === 1) {
          const panelChannel = getChannelById(editingPanel.panel_channel_id);
          const logChannel = getChannelById(editingPanel.log_channel_id);
          const defCategory = getCategoryById(editingPanel.category_id);

          return `
            <div class="space-y-6 max-w-4xl mx-auto w-full py-1">
              <div>
                <h3 class="text-base font-semibold text-white">Grundlagen des Ticket-Typs</h3>
                <p class="text-xs text-neutral-400 mt-1">Legen Sie Name, Kanäle, Akzentfarbe und Standard-Support-Rollen für dieses Ticket fest.</p>
              </div>

              <!-- Name & Title -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-neutral-300 mb-1.5">Interner Name *</label>
                  <input type="text" id="builder-input-name" value="${escapeHtml(editingPanel.name)}" placeholder="z. B. Community Support Desk" class="w-full h-10 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500">
                  <p class="text-[11px] text-neutral-500 mt-1">Wird im Dashboard und in Übersichten angezeigt.</p>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-neutral-300 mb-1.5">Panel-Titel (Discord Embed) *</label>
                  <input type="text" id="builder-input-title" value="${escapeHtml(editingPanel.title)}" placeholder="z. B. Support Ticket Desk" class="w-full h-10 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500">
                  <p class="text-[11px] text-neutral-500 mt-1">Wird als Überschrift der Nachricht auf Discord dargestellt.</p>
                </div>
              </div>

              <!-- Description & Instructions -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-neutral-300 mb-1.5">Panel-Beschreibung</label>
                  <textarea id="builder-input-desc" rows="3" placeholder="z. B. Öffnen Sie ein Ticket, um mit unserem Team zu sprechen." class="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500 resize-none">${escapeHtml(editingPanel.description)}</textarea>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-neutral-300 mb-1.5">Anweisungs-Blockquote im Discord Embed</label>
                  <textarea id="builder-input-instr" rows="3" placeholder="> Wählen Sie die passende Kategorie unten aus..." class="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-500 resize-none">${escapeHtml(editingPanel.instructions)}</textarea>
                </div>
              </div>

              <!-- Color Selection (Prominent Color Cards/Tiles) -->
              <div>
                <div class="flex items-center justify-between mb-2.5">
                  <div>
                    <label class="block text-xs font-semibold text-white">Akzentfarbe auswählen</label>
                    <p class="text-[11px] text-neutral-400 mt-0.5">Wählen Sie ein Farbfeld oder tragen Sie eine eigene HEX-Farbe ein.</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-3.5 h-3.5 rounded-md shadow-sm" style="background-color: ${editingPanel.color || '#5865F2'};"></span>
                    <span class="text-xs font-mono font-semibold text-white uppercase">${escapeHtml(editingPanel.color || '#5865F2')}</span>
                  </div>
                </div>

                <!-- 8 Color Preset Fields -->
                <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                  ${COLOR_CARDS.map(c => {
                    const isSelected = (editingPanel.color || '').toLowerCase() === c.color.toLowerCase();
                    return `
                      <button type="button" data-builder-color="${c.color}" class="group relative p-2.5 rounded-xl border flex flex-col items-start gap-1.5 transition-all duration-150 cursor-pointer ${isSelected ? 'border-white bg-neutral-800 ring-2 ring-white/20 shadow-md' : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700 hover:bg-neutral-800/80'}">
                        <div class="flex items-center justify-between w-full">
                          <span class="w-6 h-6 rounded-lg shadow-inner flex items-center justify-center shrink-0 border border-white/10" style="background-color: ${c.color};">
                            ${isSelected ? '<svg class="w-3.5 h-3.5 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
                          </span>
                          ${isSelected ? '<span class="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Aktiv</span>' : ''}
                        </div>
                        <div class="min-w-0 w-full text-left">
                          <p class="text-xs font-semibold text-white truncate">${c.name}</p>
                          <p class="text-[10px] text-neutral-500 font-mono truncate uppercase">${c.hex}</p>
                        </div>
                      </button>
                    `;
                  }).join('')}
                </div>

                <!-- Custom Color Field / Tile -->
                <div class="mt-2.5 p-3 rounded-xl bg-neutral-800/40 border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="relative w-9 h-9 rounded-xl overflow-hidden border border-neutral-700 shadow-inner shrink-0 flex items-center justify-center cursor-pointer" style="background-color: ${editingPanel.color || '#5865F2'};">
                      <input type="color" id="builder-native-color-picker" value="${editingPanel.color && editingPanel.color.startsWith('#') && editingPanel.color.length === 7 ? editingPanel.color : '#5865F2'}" class="absolute -inset-2 w-16 h-16 opacity-0 cursor-pointer">
                      <svg class="w-4 h-4 text-white drop-shadow pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 4-3 3 8 8 3-3-8-8Z"/><path d="m3 21 8-8"/><path d="m14 7 3 3"/></svg>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-white">Eigene Hex-Farbe</p>
                      <p class="text-[11px] text-neutral-400">Farbe per Picker anklicken oder HEX-Wert direkt eingeben.</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <span class="text-xs text-neutral-500 font-mono">#</span>
                    <input type="text" id="builder-custom-color" value="${(editingPanel.color || '#5865F2').replace(/^#/, '')}" placeholder="5865F2" maxlength="7" class="w-24 h-9 px-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white uppercase text-center font-mono focus:outline-none focus:border-neutral-500">
                  </div>
                </div>
              </div>

              <!-- Channels Row (Panel Channel & Log Channel) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <!-- Panel Channel Dropdown -->
                <div class="relative">
                  <label class="block text-xs font-semibold text-neutral-300 mb-1.5">Panel-Kanal (Hier wird das Ticket gepostet) *</label>
                  <button type="button" id="bld-dd-panel-ch-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-xs text-left transition-colors cursor-pointer">
                    <span id="bld-dd-panel-ch-label" class="min-w-0 truncate ${panelChannel ? 'text-white font-medium' : 'text-neutral-500'}">
                      ${panelChannel ? `#${escapeHtml(panelChannel.name)}` : 'Kanal auswählen...'}
                    </span>
                    <svg class="w-3.5 h-3.5 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div id="bld-dd-panel-ch-menu" data-lenis-prevent="true" class="orbit-dropdown-menu hidden absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] max-h-60 flex flex-col overflow-hidden">
                    <div class="p-2 bg-neutral-900/95 border-b border-neutral-800 shrink-0">
                      <div class="relative">
                        <svg class="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input type="text" id="bld-search-panel-ch" placeholder="Kanal suchen..." class="w-full pl-8 pr-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
                      </div>
                    </div>
                    <div class="overflow-y-auto p-1 space-y-0.5 flex-1 max-h-48" id="bld-list-panel-ch">
                      ${allChannels.map(c => `
                        <button type="button" data-bld-panel-ch="${escapeHtml(c.id)}" class="w-full px-3 py-1.5 rounded-lg text-left text-xs flex items-center justify-between ${String(c.id) === String(editingPanel.panel_channel_id) ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
                          <span class="truncate">#${escapeHtml(c.name)}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <!-- Log Channel Dropdown -->
                <div class="relative">
                  <label class="block text-xs font-semibold text-neutral-300 mb-1.5">Mitarbeiter-/Log-Kanal</label>
                  <button type="button" id="bld-dd-log-ch-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-xs text-left transition-colors cursor-pointer">
                    <span id="bld-dd-log-ch-label" class="min-w-0 truncate ${logChannel ? 'text-white font-medium' : 'text-neutral-500'}">
                      ${logChannel ? `#${escapeHtml(logChannel.name)}` : 'Kein Log-Kanal'}
                    </span>
                    <svg class="w-3.5 h-3.5 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div id="bld-dd-log-ch-menu" data-lenis-prevent="true" class="orbit-dropdown-menu hidden absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] max-h-60 flex flex-col overflow-hidden">
                    <div class="p-2 bg-neutral-900/95 border-b border-neutral-800 shrink-0">
                      <div class="relative">
                        <svg class="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input type="text" id="bld-search-log-ch" placeholder="Kanal suchen..." class="w-full pl-8 pr-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
                      </div>
                    </div>
                    <div class="overflow-y-auto p-1 space-y-0.5 flex-1 max-h-48" id="bld-list-log-ch">
                      <button type="button" data-bld-log-ch="" class="w-full px-3 py-1.5 rounded-lg text-left text-xs text-neutral-400 hover:bg-neutral-800/60">Kein Log-Kanal</button>
                      ${allChannels.map(c => `
                        <button type="button" data-bld-log-ch="${escapeHtml(c.id)}" class="w-full px-3 py-1.5 rounded-lg text-left text-xs flex items-center justify-between ${String(c.id) === String(editingPanel.log_channel_id) ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
                          <span class="truncate">#${escapeHtml(c.name)}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Default Category & Multi-Role Support -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <!-- Category Dropdown -->
                <div class="relative">
                  <label class="block text-xs font-semibold text-neutral-300 mb-1.5">Standard-Kategorie für geöffnete Tickets</label>
                  <button type="button" id="bld-dd-cat-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-xs text-left transition-colors cursor-pointer">
                    <span id="bld-dd-cat-label" class="min-w-0 truncate ${defCategory ? 'text-white font-medium' : 'text-neutral-500'}">
                      ${defCategory ? `📁 ${escapeHtml(defCategory.name)}` : 'Automatische Kategorie'}
                    </span>
                    <svg class="w-3.5 h-3.5 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div id="bld-dd-cat-menu" data-lenis-prevent="true" class="orbit-dropdown-menu hidden absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] max-h-60 flex flex-col overflow-hidden">
                    <div class="p-2 bg-neutral-900/95 border-b border-neutral-800 shrink-0">
                      <div class="relative">
                        <svg class="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input type="text" id="bld-search-cat" placeholder="Kategorie suchen..." class="w-full pl-8 pr-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
                      </div>
                    </div>
                    <div class="overflow-y-auto p-1 space-y-0.5 flex-1 max-h-48" id="bld-list-cat">
                      <button type="button" data-bld-cat="" class="w-full px-3 py-1.5 rounded-lg text-left text-xs text-neutral-400 hover:bg-neutral-800/60">Automatische Kategorie</button>
                      ${allCategories.map(c => `
                        <button type="button" data-bld-cat="${escapeHtml(c.id)}" class="w-full px-3 py-1.5 rounded-lg text-left text-xs flex items-center justify-between ${String(c.id) === String(editingPanel.category_id) ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
                          <span class="truncate">📁 ${escapeHtml(c.name)}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <!-- Support Roles Multi-Select -->
                <div>
                  <label class="block text-xs font-semibold text-neutral-300 mb-1.5">Standard-Support-Rollen</label>
                  <div class="p-2 bg-neutral-800 border border-neutral-700 rounded-xl flex flex-wrap items-center gap-1.5 min-h-[40px]">
                    ${(editingPanel.role_ids || []).map(rid => {
                      const r = getRoleById(rid);
                      if (!r) return '';
                      return `
                        <span class="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-0.5 rounded-lg text-xs font-medium bg-neutral-900 border border-neutral-700 text-white shadow-sm">
                          <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${escapeHtml(r.color || '#99aab5')}"></span>
                          <span class="truncate max-w-[140px]">@${escapeHtml(r.name)}</span>
                          <button type="button" data-bld-del-panel-role="${escapeHtml(r.id)}" class="p-0.5 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer" title="Rolle entfernen">
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                          </button>
                        </span>
                      `;
                    }).join('')}

                    <!-- Add Role Dropdown Button -->
                    <div class="relative inline-block">
                      <button type="button" id="bld-btn-add-panel-role" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-700 hover:bg-neutral-600 text-neutral-200 hover:text-white transition-colors cursor-pointer">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                        Rolle hinzufügen
                      </button>

                      <div id="bld-menu-add-panel-role" data-lenis-prevent="true" class="orbit-dropdown-menu hidden absolute left-0 top-full mt-1.5 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] max-h-60 flex flex-col overflow-hidden">
                        <div class="p-2 bg-neutral-900/95 border-b border-neutral-800 shrink-0">
                          <div class="relative">
                            <svg class="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            <input type="text" id="bld-search-add-panel-role" placeholder="Rolle suchen..." class="w-full pl-8 pr-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
                          </div>
                        </div>
                        <div class="overflow-y-auto p-1 space-y-0.5 flex-1 max-h-48" id="bld-list-add-panel-role">
                          ${allRoles.map(r => `
                            <button type="button" data-bld-add-panel-role-id="${escapeHtml(r.id)}" class="w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${editingPanel.role_ids.includes(String(r.id)) ? 'bg-neutral-800/80 text-emerald-400 font-medium' : 'text-neutral-300 hover:bg-neutral-800'}">
                              <div class="flex items-center gap-2 truncate">
                                <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${escapeHtml(r.color || '#99aab5')}"></span>
                                <span class="truncate">@${escapeHtml(r.name)}</span>
                              </div>
                              ${editingPanel.role_ids.includes(String(r.id)) ? '<svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
                            </button>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }

        // STEP 2: Aufstellen (Optionen hinzufügen)
        if (currentStep === 2) {
          const defCategory = getCategoryById(editingPanel.category_id);

          return `
            <div class="space-y-6 max-w-5xl mx-auto w-full py-1">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-neutral-800/30 p-4 rounded-2xl border border-neutral-800">
                <div>
                  <h3 class="text-sm font-semibold text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-400"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
                    Optionen in diesem Ticket (${editingPanel.options.length})
                  </h3>
                  <p class="text-xs text-neutral-400 mt-1">
                    Fügen Sie mehrere Auswahl-Optionen zu diesem Ticket-Panel hinzu (z. B. Support, Kauf-Hilfe, Bug Report). Jede Option kann eine eigene Support-Ping-Rolle und eine eigene Ziel-Kategorie besitzen!
                  </p>
                </div>
                <button type="button" id="bld-btn-add-option" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all duration-150 active:scale-[0.96] shrink-0 cursor-pointer shadow-md shadow-white/5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                  Option hinzufügen
                </button>
              </div>

              <!-- Options List Container -->
              <div class="space-y-4" id="bld-options-container">
                ${editingPanel.options.map((opt, oIdx) => {
                  const optCat = getCategoryById(opt.category_id);
                  const optRoleIds = Array.isArray(opt.role_ids) ? opt.role_ids : (opt.role_id ? [opt.role_id] : []);

                  return `
                    <div class="p-4 sm:p-5 rounded-2xl bg-neutral-800/40 border border-neutral-800 hover:border-neutral-700 space-y-4 transition-all" data-bld-opt-row="${oIdx}">
                      <!-- Option Header -->
                      <div class="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <span class="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300 tabular-nums shadow-inner">
                            #${oIdx + 1}
                          </span>
                          <span class="text-sm font-semibold text-white truncate">${escapeHtml(opt.name || `Option ${oIdx + 1}`)}</span>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                          <button type="button" data-bld-dup-opt="${oIdx}" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer" title="Option duplizieren">
                            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            <span class="hidden sm:inline">Duplizieren</span>
                          </button>
                          ${editingPanel.options.length > 1 ? `
                            <button type="button" data-bld-del-opt="${oIdx}" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer" title="Option entfernen">
                              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                              <span class="hidden sm:inline">Entfernen</span>
                            </button>
                          ` : ''}
                        </div>
                      </div>

                      <!-- Title & Description Fields -->
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-medium text-neutral-300 mb-1.5">Option-Titel *</label>
                          <input type="text" data-opt-field="name" data-opt-idx="${oIdx}" value="${escapeHtml(opt.name)}" placeholder="z. B. Allgemeiner Support" class="w-full h-10 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-neutral-500">
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-neutral-300 mb-1.5">Kurzbeschreibung</label>
                          <input type="text" data-opt-field="description" data-opt-idx="${oIdx}" value="${escapeHtml(opt.description)}" placeholder="z. B. Fragen zum Server, technische Hilfe..." class="w-full h-10 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-neutral-500">
                        </div>
                      </div>

                      <!-- Ziel-Kategorie & Ping-Rollen Row -->
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <!-- Ziel-Kategorie Searchable Dropdown -->
                        <div class="relative">
                          <label class="block text-xs font-medium text-neutral-300 mb-1.5">Ziel-Kategorie für diese Option</label>
                          <button type="button" id="bld-opt-cat-btn-${oIdx}" data-bld-opt-cat-idx="${oIdx}" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-xs text-left transition-colors cursor-pointer">
                            <span id="bld-opt-cat-label-${oIdx}" class="min-w-0 truncate ${optCat ? 'text-white font-medium' : 'text-neutral-400'}">
                              ${optCat ? `📁 ${escapeHtml(optCat.name)}` : `Standard-Kategorie verwenden (${defCategory ? escapeHtml(defCategory.name) : 'Automatisch'})`}
                            </span>
                            <svg class="w-3.5 h-3.5 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                          </button>
                          <div id="bld-opt-cat-menu-${oIdx}" data-lenis-prevent="true" class="orbit-dropdown-menu hidden absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] max-h-60 flex flex-col overflow-hidden">
                            <div class="p-2 bg-neutral-900/95 border-b border-neutral-800 shrink-0">
                              <div class="relative">
                                <svg class="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                <input type="text" id="bld-opt-cat-search-${oIdx}" placeholder="Kategorie suchen..." class="w-full pl-8 pr-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
                              </div>
                            </div>
                            <div class="overflow-y-auto p-1 space-y-0.5 flex-1 max-h-48" id="bld-opt-cat-list-${oIdx}">
                              <button type="button" data-bld-opt-cat-val="" data-opt-idx="${oIdx}" class="w-full px-3 py-1.5 rounded-lg text-left text-xs text-neutral-400 hover:bg-neutral-800/60">
                                Standard-Kategorie verwenden (${defCategory ? escapeHtml(defCategory.name) : 'Automatisch'})
                              </button>
                              ${allCategories.map(c => `
                                <button type="button" data-bld-opt-cat-val="${escapeHtml(c.id)}" data-opt-idx="${oIdx}" class="w-full px-3 py-1.5 rounded-lg text-left text-xs flex items-center justify-between ${String(c.id) === String(opt.category_id) ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
                                  <span class="truncate">📁 ${escapeHtml(c.name)}</span>
                                </button>
                              `).join('')}
                            </div>
                          </div>
                        </div>

                        <!-- Support Ping-Rollen Multi-Select -->
                        <div>
                          <label class="block text-xs font-medium text-neutral-300 mb-1.5">Support Ping-Rollen für diese Option</label>
                          <div class="p-2 bg-neutral-800 border border-neutral-700 rounded-xl flex flex-wrap items-center gap-1.5 min-h-[40px]">
                            ${optRoleIds.length === 0 ? `
                              <span class="text-[11px] text-neutral-400 italic py-0.5 px-1">Erbt Standard-Support-Rollen (${(editingPanel.role_ids || []).length})</span>
                            ` : optRoleIds.map(rid => {
                              const r = getRoleById(rid);
                              if (!r) return '';
                              return `
                                <span class="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-0.5 rounded-lg text-xs font-medium bg-neutral-900 border border-neutral-700 text-white shadow-sm">
                                  <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${escapeHtml(r.color || '#99aab5')}"></span>
                                  <span class="truncate max-w-[130px]">@${escapeHtml(r.name)}</span>
                                  <button type="button" data-bld-del-opt-role="${oIdx}:${escapeHtml(r.id)}" class="p-0.5 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer" title="Rolle entfernen">
                                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                  </button>
                                </span>
                              `;
                            }).join('')}

                            <!-- Add Role Button for Option -->
                            <div class="relative inline-block">
                              <button type="button" id="bld-opt-role-btn-${oIdx}" data-bld-opt-role-idx="${oIdx}" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-700 hover:bg-neutral-600 text-neutral-200 hover:text-white transition-colors cursor-pointer">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                                Rolle hinzufügen
                              </button>

                              <div id="bld-opt-role-menu-${oIdx}" data-lenis-prevent="true" class="orbit-dropdown-menu hidden absolute left-0 top-full mt-1.5 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] max-h-60 flex flex-col overflow-hidden">
                                <div class="p-2 bg-neutral-900/95 border-b border-neutral-800 shrink-0">
                                  <div class="relative">
                                    <svg class="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                    <input type="text" id="bld-opt-role-search-${oIdx}" placeholder="Rolle suchen..." class="w-full pl-8 pr-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
                                  </div>
                                </div>
                                <div class="overflow-y-auto p-1 space-y-0.5 flex-1 max-h-48" id="bld-opt-role-list-${oIdx}">
                                  ${allRoles.map(r => `
                                    <button type="button" data-bld-opt-add-role="${oIdx}:${escapeHtml(r.id)}" class="w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${optRoleIds.includes(String(r.id)) ? 'bg-neutral-800/80 text-emerald-400 font-medium' : 'text-neutral-300 hover:bg-neutral-800'}">
                                      <div class="flex items-center gap-2 truncate">
                                        <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${escapeHtml(r.color || '#99aab5')}"></span>
                                        <span class="truncate">@${escapeHtml(r.name)}</span>
                                      </div>
                                      ${optRoleIds.includes(String(r.id)) ? '<svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
                                    </button>
                                  `).join('')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Bottom Add Option Button -->
              <div class="pt-2">
                <button type="button" id="bld-btn-add-option-bottom" class="w-full py-3 rounded-2xl border border-dashed border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/40 text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                  Weitere Option zu diesem Ticket hinzufügen
                </button>
              </div>
            </div>
          `;
        }

        // STEP 3: Rezension (2-Column 1:1 Discord Live Preview)
        if (currentStep === 3) {
          const panelChannel = getChannelById(editingPanel.panel_channel_id);
          const logChannel = getChannelById(editingPanel.log_channel_id);
          const defCategory = getCategoryById(editingPanel.category_id);
          const optCount = editingPanel.options.length;

          return `
            <div class="grid grid-cols-1 lg:grid-cols-[1fr,360px] xl:grid-cols-[1fr,420px] gap-6 w-full py-1">
              <!-- Left Column: Summary Info -->
              <div class="space-y-5">
                <div>
                  <h3 class="text-base font-semibold text-white">Zusammenfassung & Vorschau</h3>
                  <p class="text-xs text-neutral-400 mt-1">Überprüfen Sie alle Einstellungen und testen Sie das Panel vor dem Speichern.</p>
                </div>

                <!-- Panel Info Box -->
                <div class="rounded-2xl bg-neutral-800/40 p-4 border border-neutral-800 flex items-center gap-3.5">
                  <div class="size-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style="background-color: ${editingPanel.color ? editingPanel.color.replace('rgb(', 'rgba(').replace(')', ', 0.15)') : 'rgba(88, 101, 242, 0.15)'};">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket" style="color: ${editingPanel.color || '#5865F2'};"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path></svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-semibold text-white truncate">${escapeHtml(editingPanel.name)}</p>
                      <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${editingPanel.color || '#5865F2'};"></span>
                    </div>
                    <p class="text-xs text-neutral-400 truncate mt-0.5">${escapeHtml(editingPanel.description || 'Keine Beschreibung')}</p>
                  </div>
                  <span class="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                    1 Ticket (${optCount} Opt.)
                  </span>
                </div>

                <!-- 4 KPI Tiles -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-xl p-3.5 bg-neutral-800/30 border border-neutral-800">
                    <p class="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider mb-1">Panel-Kanal</p>
                    <p class="text-xs truncate text-neutral-200 font-medium">${panelChannel ? `#${escapeHtml(panelChannel.name)}` : 'Kein Kanal gewählt'}</p>
                  </div>

                  <div class="rounded-xl p-3.5 bg-neutral-800/30 border border-neutral-800">
                    <p class="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider mb-1">Mitarbeiterkanal</p>
                    <p class="text-xs truncate text-neutral-200 font-medium">${logChannel ? `#${escapeHtml(logChannel.name)}` : 'Kein Log-Kanal'}</p>
                  </div>

                  <div class="rounded-xl p-3.5 bg-neutral-800/30 border border-neutral-800">
                    <p class="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider mb-1">Standard-Kategorie</p>
                    <p class="text-xs truncate text-neutral-200 font-medium">${defCategory ? `📁 ${escapeHtml(defCategory.name)}` : 'Automatisch'}</p>
                  </div>

                  <div class="rounded-xl p-3.5 bg-neutral-800/30 border border-neutral-800">
                    <p class="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider mb-1">Standard-Rollen</p>
                    <p class="text-xs truncate text-neutral-200 font-medium">
                      ${editingPanel.role_ids && editingPanel.role_ids.length > 0 ? `${editingPanel.role_ids.length} Rolle(n)` : 'Keine Standard-Rolle'}
                    </p>
                  </div>
                </div>

                <!-- Configured Options Summary -->
                <div class="rounded-2xl p-4 bg-neutral-800/30 border border-neutral-800 space-y-2.5">
                  <div class="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                    <span>Konfigurierte Optionen (${optCount}):</span>
                    <button type="button" data-nav-step="2" class="text-indigo-400 hover:text-indigo-300 text-xs cursor-pointer">Bearbeiten</button>
                  </div>
                  <div class="space-y-2">
                    ${editingPanel.options.map((opt, idx) => {
                      const c = getCategoryById(opt.category_id || editingPanel.category_id);
                      const optRoles = Array.isArray(opt.role_ids) && opt.role_ids.length > 0 ? opt.role_ids : (editingPanel.role_ids || []);
                      return `
                        <div class="flex items-center justify-between text-xs p-3 rounded-xl bg-neutral-800/50 border border-neutral-800 gap-3">
                          <div class="min-w-0">
                            <span class="font-semibold text-white">${idx + 1}. ${escapeHtml(opt.name)}</span>
                            ${opt.description ? `<p class="text-[11px] text-neutral-400 truncate mt-0.5">${escapeHtml(opt.description)}</p>` : ''}
                          </div>
                          <div class="flex items-center gap-1.5 text-[11px] text-neutral-400 shrink-0 flex-wrap justify-end">
                            ${c ? `<span class="px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-700">📁 ${escapeHtml(c.name)}</span>` : ''}
                            ${optRoles.length > 0 ? `<span class="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">${optRoles.length} Rolle(n)</span>` : ''}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>

              <!-- Right Column: 1:1 Discord Live-Vorschau -->
              <div class="lg:border-l border-neutral-800 lg:pl-6">
                <div class="px-1 py-1 mb-3 flex items-center gap-2">
                  <svg class="lucide lucide-eye w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <span class="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Discord Live-Vorschau</span>
                </div>

                <div class="rounded-2xl overflow-hidden border border-neutral-700/40 shadow-2xl bg-[#313338]">
                  <!-- Channel Header -->
                  <div class="bg-[#2b2d31] px-4 py-2.5 flex items-center gap-2 border-b border-[#1f2023]">
                    <svg class="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                    <span class="text-xs font-semibold text-white truncate">${panelChannel ? escapeHtml(panelChannel.name) : 'tickets'}</span>
                  </div>

                  <!-- Bot Message Content -->
                  <div class="p-4 space-y-3 font-sans text-neutral-200">
                    <div class="flex gap-3">
                      <div class="size-9 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md">
                        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path></svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span class="text-xs font-semibold text-white">Orbit</span>
                          <span class="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-[#5865F2] text-white rounded leading-none">BOT</span>
                          <span class="text-[10px] text-neutral-400">Heute um 12:00 Uhr</span>
                        </div>

                        <!-- Discord Embed -->
                        <div class="border-l-[4px] rounded-r-lg bg-[#2b2d31] p-3.5 space-y-2 shadow-sm" style="border-color: ${editingPanel.color || '#5865F2'};">
                          <p class="text-sm font-bold text-white leading-snug">${escapeHtml(editingPanel.title || editingPanel.name)}</p>
                          <p class="text-xs text-neutral-300 leading-relaxed">${escapeHtml(editingPanel.description || '')}</p>
                          ${editingPanel.instructions ? `
                            <div class="border-l-[3px] border-[#4e5058] pl-2.5 py-1 mt-2 bg-[#232428]/50 rounded-r">
                              <p class="text-[11px] text-neutral-300 leading-relaxed italic">${escapeHtml(editingPanel.instructions)}</p>
                            </div>
                          ` : ''}
                        </div>

                        <!-- Discord Select Menu Preview Component -->
                        <div class="mt-3">
                          <div class="w-full rounded-md bg-[#2b2d31] border border-[#1e1f22] p-2.5 flex items-center justify-between text-xs text-neutral-200 shadow-inner">
                            <span class="truncate text-neutral-300">Wähle eine Kategorie...</span>
                            <svg class="w-4 h-4 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        </div>

                        <!-- Discord Button Component -->
                        <div class="mt-2.5">
                          <button type="button" class="px-4 py-2 rounded-md text-xs font-semibold text-white flex items-center gap-2 shadow pointer-events-none" style="background-color: ${editingPanel.color || '#5865F2'};">
                            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path></svg>
                            ${escapeHtml(editingPanel.button_label || 'Ticket öffnen')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }

        return '';
      };

      const bindModalEvents = () => {
        // Step Navigation Pills
        modalRoot.querySelectorAll('[data-nav-step]').forEach(btn => {
          btn.addEventListener('click', () => {
            syncInputsToState();
            const stepNum = parseInt(btn.getAttribute('data-nav-step'), 10);
            if (stepNum && stepNum >= 1 && stepNum <= 3) {
              currentStep = stepNum;
              renderModal();
            }
          });
        });

        // Close / Back buttons in Header
        document.getElementById('modal-btn-close-header')?.addEventListener('click', closeModal);

        document.getElementById('builder-backdrop')?.addEventListener('click', (e) => {
          if (e.target.id === 'builder-backdrop') {
            closeModal();
          }
        });

        document.getElementById('modal-btn-back-header')?.addEventListener('click', () => {
          syncInputsToState();
          if (currentStep > 1) {
            currentStep--;
            renderModal();
          } else {
            closeModal();
          }
        });

        // Footer Prev / Next
        document.getElementById('modal-btn-prev')?.addEventListener('click', () => {
          syncInputsToState();
          if (currentStep > 1) {
            currentStep--;
            renderModal();
          }
        });

        document.getElementById('modal-btn-next')?.addEventListener('click', async () => {
          syncInputsToState();
          if (currentStep < 3) {
            currentStep++;
            renderModal();
          } else {
            // STEP 3 Save action!
            if (!editingPanel.name || !editingPanel.title) {
              if (window.Notifications) Notifications.show('Bitte geben Sie einen Namen für den Ticket-Typ ein.', 'info');
              currentStep = 1;
              renderModal();
              return;
            }

            if (!editingPanel.panel_channel_id) {
              if (window.Notifications) Notifications.show('Bitte wählen Sie einen Panel-Kanal für dieses Ticket aus.', 'info');
              currentStep = 1;
              renderModal();
              return;
            }

            // Save into state.panels
            if (isEdit) {
              const idx = state.panels.findIndex(p => p.id === editingPanel.id);
              if (idx >= 0) {
                state.panels[idx] = editingPanel;
              } else {
                state.panels.push(editingPanel);
              }
            } else {
              state.panels.push(editingPanel);
            }

            closeModal();
            renderMain();
            await saveTicketConfig(true);
            if (window.Notifications) Notifications.show(`Ticket-Typ "${editingPanel.name}" erfolgreich gespeichert!`, 'success');
          }
        });

        // Step 1 Event Listeners
        if (currentStep === 1) {
          const nameInput = document.getElementById('builder-input-name');
          const titleInput = document.getElementById('builder-input-title');
          const descInput = document.getElementById('builder-input-desc');
          const instrInput = document.getElementById('builder-input-instr');
          const customColorInput = document.getElementById('builder-custom-color');
          const nativeColorInput = document.getElementById('builder-native-color-picker');

          nameInput?.addEventListener('input', (e) => {
            editingPanel.name = e.target.value;
          });

          titleInput?.addEventListener('input', (e) => {
            editingPanel.title = e.target.value;
          });

          descInput?.addEventListener('input', (e) => {
            editingPanel.description = e.target.value;
          });

          instrInput?.addEventListener('input', (e) => {
            editingPanel.instructions = e.target.value;
          });

          customColorInput?.addEventListener('input', (e) => {
            const raw = e.target.value.trim();
            if (raw) {
              editingPanel.color = raw.startsWith('#') ? raw : `#${raw}`;
              if (nativeColorInput && editingPanel.color.length === 7) {
                nativeColorInput.value = editingPanel.color;
              }
            }
          });

          nativeColorInput?.addEventListener('input', (e) => {
            editingPanel.color = e.target.value;
            if (customColorInput) {
              customColorInput.value = e.target.value.replace(/^#/, '');
            }
          });

          modalRoot.querySelectorAll('[data-builder-color]').forEach(btn => {
            btn.addEventListener('click', () => {
              syncInputsToState();
              editingPanel.color = btn.getAttribute('data-builder-color');
              renderModal();
            });
          });

          // Panel Channel Searchable Dropdown
          const bldPanelChBtn = document.getElementById('bld-dd-panel-ch-btn');
          const bldPanelChMenu = document.getElementById('bld-dd-panel-ch-menu');
          const bldSearchPanelCh = document.getElementById('bld-search-panel-ch');
          const bldPanelChLabel = document.getElementById('bld-dd-panel-ch-label');

          bldPanelChBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasHidden = bldPanelChMenu?.classList.contains('hidden');
            closeAllDropdowns();
            if (wasHidden) {
              bldPanelChMenu?.classList.remove('hidden');
              if (bldSearchPanelCh) {
                bldSearchPanelCh.value = '';
                bldSearchPanelCh.focus();
                filterBldPanelCh('');
              }
            }
          });

          const filterBldPanelCh = (term) => {
            const lower = term.toLowerCase().trim();
            document.querySelectorAll('#bld-list-panel-ch [data-bld-panel-ch]').forEach(btn => {
              const txt = btn.textContent.toLowerCase();
              btn.style.display = (!lower || txt.includes(lower)) ? '' : 'none';
            });
          };

          bldSearchPanelCh?.addEventListener('input', (e) => filterBldPanelCh(e.target.value));

          document.querySelectorAll('#bld-list-panel-ch [data-bld-panel-ch]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const cid = btn.getAttribute('data-bld-panel-ch');
              editingPanel.panel_channel_id = cid;
              const ch = getChannelById(cid);
              if (bldPanelChLabel) {
                bldPanelChLabel.textContent = ch ? `#${ch.name}` : 'Kanal auswählen...';
                bldPanelChLabel.className = 'min-w-0 truncate text-white font-medium';
              }
              bldPanelChMenu?.classList.add('hidden');
            });
          });

          // Log Channel Searchable Dropdown
          const bldLogChBtn = document.getElementById('bld-dd-log-ch-btn');
          const bldLogChMenu = document.getElementById('bld-dd-log-ch-menu');
          const bldSearchLogCh = document.getElementById('bld-search-log-ch');
          const bldLogChLabel = document.getElementById('bld-dd-log-ch-label');

          bldLogChBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasHidden = bldLogChMenu?.classList.contains('hidden');
            closeAllDropdowns();
            if (wasHidden) {
              bldLogChMenu?.classList.remove('hidden');
              if (bldSearchLogCh) {
                bldSearchLogCh.value = '';
                bldSearchLogCh.focus();
                filterBldLogCh('');
              }
            }
          });

          const filterBldLogCh = (term) => {
            const lower = term.toLowerCase().trim();
            document.querySelectorAll('#bld-list-log-ch [data-bld-log-ch]').forEach(btn => {
              const txt = btn.textContent.toLowerCase();
              btn.style.display = (!lower || txt.includes(lower)) ? '' : 'none';
            });
          };

          bldSearchLogCh?.addEventListener('input', (e) => filterBldLogCh(e.target.value));

          document.querySelectorAll('#bld-list-log-ch [data-bld-log-ch]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const cid = btn.getAttribute('data-bld-log-ch');
              editingPanel.log_channel_id = cid;
              const ch = getChannelById(cid);
              if (bldLogChLabel) {
                bldLogChLabel.textContent = ch ? `#${ch.name}` : 'Kein Log-Kanal';
                bldLogChLabel.className = `min-w-0 truncate ${ch ? 'text-white font-medium' : 'text-neutral-500'}`;
              }
              bldLogChMenu?.classList.add('hidden');
            });
          });

          // Category Dropdown
          const bldCatBtn = document.getElementById('bld-dd-cat-btn');
          const bldCatMenu = document.getElementById('bld-dd-cat-menu');
          const bldSearchCat = document.getElementById('bld-search-cat');
          const bldCatLabel = document.getElementById('bld-dd-cat-label');

          bldCatBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasHidden = bldCatMenu?.classList.contains('hidden');
            closeAllDropdowns();
            if (wasHidden) {
              bldCatMenu?.classList.remove('hidden');
              if (bldSearchCat) {
                bldSearchCat.value = '';
                bldSearchCat.focus();
                filterBldCat('');
              }
            }
          });

          const filterBldCat = (term) => {
            const lower = term.toLowerCase().trim();
            document.querySelectorAll('#bld-list-cat [data-bld-cat]').forEach(btn => {
              const txt = btn.textContent.toLowerCase();
              btn.style.display = (!lower || txt.includes(lower)) ? '' : 'none';
            });
          };

          bldSearchCat?.addEventListener('input', (e) => filterBldCat(e.target.value));

          document.querySelectorAll('#bld-list-cat [data-bld-cat]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const catId = btn.getAttribute('data-bld-cat');
              editingPanel.category_id = catId;
              const c = getCategoryById(catId);
              if (bldCatLabel) {
                bldCatLabel.textContent = c ? `📁 ${c.name}` : 'Automatische Kategorie';
                bldCatLabel.className = `min-w-0 truncate ${c ? 'text-white font-medium' : 'text-neutral-500'}`;
              }
              bldCatMenu?.classList.add('hidden');
            });
          });

          // Panel Multi-Role Add / Delete Handlers
          const bldAddPanelRoleBtn = document.getElementById('bld-btn-add-panel-role');
          const bldAddPanelRoleMenu = document.getElementById('bld-menu-add-panel-role');
          const bldSearchAddPanelRole = document.getElementById('bld-search-add-panel-role');

          bldAddPanelRoleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasHidden = bldAddPanelRoleMenu?.classList.contains('hidden');
            closeAllDropdowns();
            if (wasHidden) {
              bldAddPanelRoleMenu?.classList.remove('hidden');
              if (bldSearchAddPanelRole) {
                bldSearchAddPanelRole.value = '';
                bldSearchAddPanelRole.focus();
                filterBldAddPanelRoles('');
              }
            }
          });

          const filterBldAddPanelRoles = (term) => {
            const lower = term.toLowerCase().trim();
            document.querySelectorAll('#bld-list-add-panel-role [data-bld-add-panel-role-id]').forEach(btn => {
              const txt = btn.textContent.toLowerCase();
              btn.style.display = (!lower || txt.includes(lower)) ? '' : 'none';
            });
          };

          bldSearchAddPanelRole?.addEventListener('input', (e) => filterBldAddPanelRoles(e.target.value));

          document.querySelectorAll('#bld-list-add-panel-role [data-bld-add-panel-role-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const rid = btn.getAttribute('data-bld-add-panel-role-id');
              if (!editingPanel.role_ids.includes(String(rid))) {
                editingPanel.role_ids.push(String(rid));
                editingPanel.role_id = editingPanel.role_ids[0] || '';
              }
              bldAddPanelRoleMenu?.classList.add('hidden');
              syncInputsToState();
              renderModal();
            });
          });

          modalRoot.querySelectorAll('[data-bld-del-panel-role]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const rid = btn.getAttribute('data-bld-del-panel-role');
              editingPanel.role_ids = editingPanel.role_ids.filter(id => String(id) !== String(rid));
              editingPanel.role_id = editingPanel.role_ids[0] || '';
              syncInputsToState();
              renderModal();
            });
          });
        }

        // Step 2 Event Listeners (Options Add/Remove/Duplicate/Update)
        if (currentStep === 2) {
          const addOpt = () => {
            syncInputsToState();
            const newIdx = editingPanel.options.length + 1;
            editingPanel.options.push({
              id: `opt_${Date.now()}_${newIdx}`,
              name: `Option ${newIdx}`,
              description: 'Öffnen Sie ein Ticket.',
              color: editingPanel.color || '#5865F2',
              category_id: editingPanel.category_id || '',
              role_ids: editingPanel.role_ids && editingPanel.role_ids.length > 0 ? [...editingPanel.role_ids] : [],
              role_id: editingPanel.role_id || ''
            });
            renderModal();
            setTimeout(() => {
              const newRow = modalRoot.querySelector(`[data-bld-opt-row="${editingPanel.options.length - 1}"]`);
              if (newRow) {
                newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                newRow.querySelector('input[data-opt-field="name"]')?.focus();
              }
            }, 50);
          };

          document.getElementById('bld-btn-add-option')?.addEventListener('click', addOpt);
          document.getElementById('bld-btn-add-option-bottom')?.addEventListener('click', addOpt);

          // Duplicate Option
          modalRoot.querySelectorAll('[data-bld-dup-opt]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              syncInputsToState();
              const idx = parseInt(btn.getAttribute('data-bld-dup-opt'), 10);
              const source = editingPanel.options[idx];
              if (source) {
                const dup = JSON.parse(JSON.stringify(source));
                dup.id = `opt_${Date.now()}_dup`;
                dup.name = `${dup.name || 'Option'} (Kopie)`;
                editingPanel.options.splice(idx + 1, 0, dup);
                renderModal();
                setTimeout(() => {
                  const newRow = modalRoot.querySelector(`[data-bld-opt-row="${idx + 1}"]`);
                  if (newRow) newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 50);
              }
            });
          });

          // Delete Option
          modalRoot.querySelectorAll('[data-bld-del-opt]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              syncInputsToState();
              const idx = parseInt(btn.getAttribute('data-bld-del-opt'), 10);
              if (!isNaN(idx) && editingPanel.options.length > 1) {
                editingPanel.options.splice(idx, 1);
                renderModal();
              }
            });
          });

          // Input field listeners
          modalRoot.querySelectorAll('[data-opt-field]').forEach(input => {
            const handleFieldUpdate = (e) => {
              const fld = input.getAttribute('data-opt-field');
              const idx = parseInt(input.getAttribute('data-opt-idx'), 10);
              if (editingPanel.options[idx]) {
                editingPanel.options[idx][fld] = e.target.value;
              }
            };
            input.addEventListener('input', handleFieldUpdate);
            input.addEventListener('change', handleFieldUpdate);
          });

          // Option Category Dropdowns
          modalRoot.querySelectorAll('[data-bld-opt-cat-idx]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const oIdx = btn.getAttribute('data-bld-opt-cat-idx');
              const menu = document.getElementById(`bld-opt-cat-menu-${oIdx}`);
              const searchInput = document.getElementById(`bld-opt-cat-search-${oIdx}`);
              const wasHidden = menu?.classList.contains('hidden');
              closeAllDropdowns();
              if (wasHidden) {
                menu?.classList.remove('hidden');
                if (searchInput) {
                  searchInput.value = '';
                  searchInput.focus();
                  filterOptCat(oIdx, '');
                }
              }
            });
          });

          const filterOptCat = (oIdx, term) => {
            const lower = term.toLowerCase().trim();
            document.querySelectorAll(`#bld-opt-cat-list-${oIdx} [data-bld-opt-cat-val]`).forEach(btn => {
              const txt = btn.textContent.toLowerCase();
              btn.style.display = (!lower || txt.includes(lower)) ? '' : 'none';
            });
          };

          modalRoot.querySelectorAll('[id^="bld-opt-cat-search-"]').forEach(input => {
            const oIdx = input.id.replace('bld-opt-cat-search-', '');
            input.addEventListener('input', (e) => filterOptCat(oIdx, e.target.value));
          });

          modalRoot.querySelectorAll('[data-bld-opt-cat-val]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const oIdx = parseInt(btn.getAttribute('data-opt-idx'), 10);
              const catId = btn.getAttribute('data-bld-opt-cat-val');
              if (editingPanel.options[oIdx]) {
                editingPanel.options[oIdx].category_id = catId;
                const c = getCategoryById(catId);
                const defCategory = getCategoryById(editingPanel.category_id);
                const labelEl = document.getElementById(`bld-opt-cat-label-${oIdx}`);
                if (labelEl) {
                  labelEl.textContent = c ? `📁 ${c.name}` : `Standard-Kategorie verwenden (${defCategory ? defCategory.name : 'Automatisch'})`;
                  labelEl.className = `min-w-0 truncate ${c ? 'text-white font-medium' : 'text-neutral-400'}`;
                }
              }
              document.getElementById(`bld-opt-cat-menu-${oIdx}`)?.classList.add('hidden');
            });
          });

          // Option Multi-Role Add / Delete
          modalRoot.querySelectorAll('[data-bld-opt-role-idx]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const oIdx = btn.getAttribute('data-bld-opt-role-idx');
              const menu = document.getElementById(`bld-opt-role-menu-${oIdx}`);
              const searchInput = document.getElementById(`bld-opt-role-search-${oIdx}`);
              const wasHidden = menu?.classList.contains('hidden');
              closeAllDropdowns();
              if (wasHidden) {
                menu?.classList.remove('hidden');
                if (searchInput) {
                  searchInput.value = '';
                  searchInput.focus();
                  filterOptRole(oIdx, '');
                }
              }
            });
          });

          const filterOptRole = (oIdx, term) => {
            const lower = term.toLowerCase().trim();
            document.querySelectorAll(`#bld-opt-role-list-${oIdx} [data-bld-opt-add-role]`).forEach(btn => {
              const txt = btn.textContent.toLowerCase();
              btn.style.display = (!lower || txt.includes(lower)) ? '' : 'none';
            });
          };

          modalRoot.querySelectorAll('[id^="bld-opt-role-search-"]').forEach(input => {
            const oIdx = input.id.replace('bld-opt-role-search-', '');
            input.addEventListener('input', (e) => filterOptRole(oIdx, e.target.value));
          });

          modalRoot.querySelectorAll('[data-bld-opt-add-role]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const [oIdxStr, rid] = btn.getAttribute('data-bld-opt-add-role').split(':');
              const oIdx = parseInt(oIdxStr, 10);
              const opt = editingPanel.options[oIdx];
              if (opt) {
                if (!Array.isArray(opt.role_ids)) opt.role_ids = opt.role_id ? [opt.role_id] : [];
                if (!opt.role_ids.includes(String(rid))) {
                  opt.role_ids.push(String(rid));
                  opt.role_id = opt.role_ids[0] || '';
                }
                syncInputsToState();
                renderModal();
              }
            });
          });

          modalRoot.querySelectorAll('[data-bld-del-opt-role]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const [oIdxStr, rid] = btn.getAttribute('data-bld-del-opt-role').split(':');
              const oIdx = parseInt(oIdxStr, 10);
              const opt = editingPanel.options[oIdx];
              if (opt && Array.isArray(opt.role_ids)) {
                opt.role_ids = opt.role_ids.filter(id => String(id) !== String(rid));
                opt.role_id = opt.role_ids[0] || '';
                syncInputsToState();
                renderModal();
              }
            });
          });
        }
      };

      renderModal();
    };

    renderMain();
  } catch (err) {
    container.innerHTML = `
      <div class="py-16 text-center text-red-400 text-xs">
        Fehler beim Laden des Ticket-Bereichs: ${err.message || 'Unbekannter Fehler'}
      </div>
    `;
  }
};
