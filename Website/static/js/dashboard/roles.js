/**
 * Orbit Dashboard - Roles Tab (/dashboard/:guildId/roles)
 * 1:1 PeakBot Roles UI with Reaction Panels, Auto Roles, Custom Rules, Sticky Roles, Booster Role, Tenure Roles & Activity Roles
 */

DashboardTabs.Roles = async function (container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col w-full">
      <div class="flex items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div class="flex items-center gap-2.5 min-w-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tags w-5 h-5 text-neutral-400 shrink-0"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"></path><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"></circle></svg>
          <h1 class="text-base font-medium text-white truncate">Roles</h1>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span id="roles-save-status" class="text-[11px] font-medium text-neutral-500 transition-colors">Auto-saved</span>
        </div>
      </div>
      <div class="py-16 text-center text-neutral-500 text-xs">Loading roles configuration...</div>
    </div>
  `;

  try {
    const [configRes, reactionPanelsRes] = await Promise.all([
      API.getConfig(guildId),
      API.getReactionRoles(guildId).catch(() => [])
    ]);

    const allRoles = (configRes.roles || []).filter(r => r.name !== '@everyone');
    const allChannels = (configRes.channels || []).filter(c => c.type === 0 || c.type === 5 || c.type === undefined);
    const jr = (configRes.config && configRes.config.joinroles) || {};

    const state = {
      reactionPanels: Array.isArray(reactionPanelsRes) ? reactionPanelsRes : [],
      autoRoles: Array.isArray(jr.user_roles) ? jr.user_roles.map(String) : [],
      botRolesEnabled: Boolean(jr.bot_roles_enabled),
      botRoles: Array.isArray(jr.bot_roles) ? jr.bot_roles.map(String) : [],
      tagRolesEnabled: Boolean(jr.tag_roles_enabled),
      tagRole: jr.tag_role ? String(jr.tag_role) : '',
      customRules: Array.isArray(jr.custom_rules) ? jr.custom_rules.map((r, i) => ({
        id: String(r.id || `rule_${Date.now()}_${i}`),
        name: String(r.name || 'Custom Rule'),
        enabled: r.enabled !== false,
        trigger: String(r.trigger || 'member_join'),
        condition_role_id: String(r.condition_role_id || ''),
        action: String(r.action || 'add_role'),
        role_id: String(r.role_id || ''),
        dm_message: String(r.dm_message || '')
      })) : [],
      stickyRoles: {
        enabled: Boolean(jr.sticky_roles && jr.sticky_roles.enabled),
        restore_all: jr.sticky_roles && jr.sticky_roles.restore_all !== undefined ? Boolean(jr.sticky_roles.restore_all) : true,
        roles: Array.isArray(jr.sticky_roles && jr.sticky_roles.roles) ? jr.sticky_roles.roles.map(String) : []
      },
      boosterRole: {
        enabled: Boolean(jr.booster_role && jr.booster_role.enabled),
        role_id: (jr.booster_role && jr.booster_role.role_id) ? String(jr.booster_role.role_id) : ''
      },
      tenureRoles: Array.isArray(jr.tenure_roles) ? jr.tenure_roles.map(t => ({
        role_id: String(t.role_id),
        days: Math.max(1, parseInt(t.days, 10) || 7)
      })) : [],
      activityRoles: Array.isArray(jr.activity_roles) ? jr.activity_roles.map(a => ({
        role_id: String(a.role_id),
        days: Math.max(1, parseInt(a.days, 10) || 7)
      })) : [],
      pendingTenureRoleId: '',
      pendingTenureDays: 7,
      pendingActivityRoleId: '',
      pendingActivityDays: 7
    };

    const escapeHtml = (str) => String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const getRoleById = (id) => allRoles.find(r => String(r.id) === String(id));
    const getChannelById = (id) => allChannels.find(c => String(c.id) === String(id));

    const getRoleDotColor = (role) => {
      if (!role || !role.color || role.color === '#000000' || role.color === '#99aab5') return '#a3a3a3';
      return role.color;
    };

    let saveTimeout = null;
    const setSaveIndicator = (text, tone = 'neutral') => {
      const el = document.getElementById('roles-save-status');
      if (!el) return;
      el.textContent = text;
      el.className = 'text-[11px] font-medium transition-colors ' + (
        tone === 'saving' ? 'text-amber-400' :
        tone === 'saved' ? 'text-emerald-400' :
        tone === 'error' ? 'text-red-400' : 'text-neutral-500'
      );
    };

    const saveRolesConfig = (immediate = false) => {
      setSaveIndicator('Saving...', 'saving');
      if (saveTimeout) clearTimeout(saveTimeout);
      const runSave = async () => {
        try {
          await API.saveConfig(guildId, {
            joinroles: {
              enabled: state.autoRoles.length > 0 || state.botRolesEnabled || state.tagRolesEnabled,
              user_roles_enabled: state.autoRoles.length > 0,
              user_roles: state.autoRoles,
              bot_roles_enabled: state.botRolesEnabled,
              bot_roles: state.botRoles,
              tag_roles_enabled: state.tagRolesEnabled,
              tag_role: state.tagRole || null,
              sticky_roles: {
                enabled: state.stickyRoles.enabled,
                restore_all: state.stickyRoles.restore_all,
                roles: state.stickyRoles.roles
              },
              booster_role: {
                enabled: state.boosterRole.enabled,
                role_id: state.boosterRole.role_id || null
              },
              tenure_roles: state.tenureRoles,
              activity_roles: state.activityRoles,
              custom_rules: state.customRules
            }
          });
          setSaveIndicator('Saved', 'saved');
          setTimeout(() => setSaveIndicator('Auto-saved', 'neutral'), 1800);
        } catch (err) {
          setSaveIndicator('Save failed', 'error');
          if (window.Notifications) Notifications.show(err.message || 'Failed to save roles config', 'error');
        }
      };

      if (immediate) {
        runSave();
      } else {
        saveTimeout = setTimeout(runSave, 450);
      }
    };

    // Main Render
    const renderMainShell = () => {
      container.innerHTML = `
        <div class="flex flex-col w-full">
          <!-- Feature Header -->
          <div class="flex items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div class="flex items-center gap-2.5 min-w-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tags w-5 h-5 text-neutral-400 shrink-0"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"></path><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"></circle></svg>
              <h1 class="text-base font-medium text-white truncate">Roles</h1>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span id="roles-save-status" class="text-[11px] font-medium text-neutral-500 transition-colors">Auto-saved</span>
            </div>
          </div>

          <!-- Top Grid: Reaction Panels + Auto Roles / Custom Rules -->
          <div class="mt-6">
            <div>
              <div class="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6 min-w-0 items-stretch">
                <!-- Left: Reaction Panels -->
                <div class="flex flex-col min-w-0">
                  <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col flex-1 min-h-0">
                    <div class="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-neutral-800">
                      <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile-plus w-4 h-4 text-rose-400 flex-shrink-0"><path d="M22 11v1a10 10 0 1 1-9-10"></path><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line><path d="M16 5h6"></path><path d="M19 2v6"></path></svg>
                        <h2 class="text-sm font-semibold text-white">Reaction Panels</h2>
                        <span id="rr-panels-count" class="text-[11px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 tabular-nums">0</span>
                      </div>
                    </div>
                    <div class="p-4 sm:p-5 flex-1 min-h-0">
                      <div id="rr-panels-grid" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 auto-rows-fr h-full"></div>
                    </div>
                  </div>
                </div>

                <!-- Right: Auto Roles & Custom Rules -->
                <div class="flex flex-col gap-5 flex-1">
                  <!-- Auto Roles -->
                  <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                    <div class="px-4 py-3 border-b border-neutral-800 flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-md bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-plus w-3.5 h-3.5 text-sky-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
                        </div>
                        <h3 class="text-sm font-semibold text-white">Auto Roles</h3>
                      </div>
                      <span id="autoroles-count-badge" class="text-[11px] tabular-nums text-neutral-500">0 assigned</span>
                    </div>
                    <div class="p-4 space-y-2.5">
                      <p class="text-[11px] text-neutral-500 leading-relaxed">Given to every member the moment they join, before they do anything.</p>
                      <div class="relative" id="autoroles-dropdown-wrap">
                        <div id="autoroles-trigger" class="min-h-[40px] px-3 py-1.5 bg-neutral-800 border rounded-xl cursor-pointer flex items-center justify-between gap-2 transition border-neutral-700 hover:border-neutral-600">
                          <div id="autoroles-selected-pills" class="flex flex-wrap gap-1 flex-1 min-w-0"></div>
                          <div class="flex items-center gap-1 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform"><path d="m6 9 6 6 6-6"></path></svg>
                          </div>
                        </div>
                        <div id="autoroles-menu" class="hidden absolute z-40 left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
                          <div class="p-2 border-b border-neutral-800">
                            <input type="text" id="autoroles-search" placeholder="Search roles..." class="w-full h-8 px-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500">
                          </div>
                          <div id="autoroles-options" class="max-h-52 overflow-y-auto p-1 space-y-0.5"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Custom Rules -->
                  <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col flex-1 min-h-[280px]">
                    <div class="px-4 py-3 border-b border-neutral-800 flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-workflow w-3.5 h-3.5 text-violet-400"><rect width="8" height="8" x="3" y="3" rx="2"></rect><path d="M7 11v4a2 2 0 0 0 2 2h4"></path><rect width="8" height="8" x="13" y="13" rx="2"></rect></svg>
                        </div>
                        <h3 class="text-sm font-semibold text-white">Custom Rules</h3>
                        <span id="custom-rules-count" class="text-[11px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 tabular-nums">0</span>
                      </div>
                    </div>
                    <div class="p-4 flex-1 flex flex-col justify-between min-h-0">
                      <div id="custom-rules-body" class="flex-1 flex flex-col justify-center"></div>
                      <div class="mt-4 pt-3 border-t border-neutral-800/50">
                        <button type="button" id="btn-open-rule-modal" class="w-full h-9 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-4 h-4"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                          Create Rule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bottom Section: Role Automations -->
              <div class="mt-6 pt-6 border-t border-neutral-800">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-semibold text-white text-balance">Role Automations</h3>
                    <span class="text-[11px] text-emerald-400 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">Live</span>
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                  <!-- Card 1: Sticky Roles -->
                  <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                    <div class="px-4 py-3 border-b border-neutral-800 flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin w-3.5 h-3.5 text-amber-400"><line x1="12" x2="12" y1="17" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                        </div>
                        <h3 class="text-sm font-semibold text-white truncate text-balance">Sticky Roles</h3>
                      </div>
                      <button type="button" id="sticky-enabled-switch" role="switch" aria-checked="${state.stickyRoles.enabled}" class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${state.stickyRoles.enabled ? 'bg-white' : 'bg-neutral-700'}">
                        <span class="pointer-events-none block h-4 w-4 rounded-full shadow-sm transition-transform duration-200 ${state.stickyRoles.enabled ? 'translate-x-4 bg-neutral-950' : 'translate-x-0 bg-white'}"></span>
                      </button>
                    </div>
                    <div class="p-4 space-y-3">
                      <p class="text-[11px] text-neutral-500 leading-relaxed text-pretty">A member who leaves and comes back gets their roles back automatically instead of starting over.</p>
                      <div class="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-neutral-800/40 border border-neutral-800">
                        <span class="text-xs text-neutral-300">Restore all roles</span>
                        <button type="button" id="sticky-restore-all-switch" role="switch" aria-checked="${state.stickyRoles.restore_all}" class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${state.stickyRoles.restore_all ? 'bg-white' : 'bg-neutral-700'}">
                          <span class="pointer-events-none block h-4 w-4 rounded-full shadow-sm transition-transform duration-200 ${state.stickyRoles.restore_all ? 'translate-x-4 bg-neutral-950' : 'translate-x-0 bg-white'}"></span>
                        </button>
                      </div>
                      <div id="sticky-specific-roles-wrap" class="${state.stickyRoles.restore_all ? 'hidden' : 'pt-1'}">
                        <p class="text-[11px] text-neutral-400 mb-1.5">Specific roles to restore:</p>
                        <div class="relative" id="sticky-roles-dropdown-wrap">
                          <div id="sticky-roles-trigger" class="min-h-[38px] px-3 py-1.5 bg-neutral-800 border rounded-xl cursor-pointer flex items-center justify-between gap-2 transition border-neutral-700 hover:border-neutral-600">
                            <div id="sticky-roles-pills" class="flex flex-wrap gap-1 flex-1 min-w-0"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
                          </div>
                          <div id="sticky-roles-menu" class="hidden absolute z-40 left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto p-1 space-y-0.5"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Card 2: Booster Role -->
                  <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                    <div class="px-4 py-3 border-b border-neutral-800 flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="w-6 h-6 rounded-md bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gem w-3.5 h-3.5 text-pink-400"><path d="M6 3h12l4 6-10 13L2 9Z"></path><path d="M11 3 8 9l4 13 4-13-3-6"></path><path d="M2 9h20"></path></svg>
                        </div>
                        <h3 class="text-sm font-semibold text-white truncate text-balance">Booster Role</h3>
                      </div>
                      <button type="button" id="booster-enabled-switch" role="switch" aria-checked="${state.boosterRole.enabled}" class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${state.boosterRole.enabled ? 'bg-white' : 'bg-neutral-700'}">
                        <span class="pointer-events-none block h-4 w-4 rounded-full shadow-sm transition-transform duration-200 ${state.boosterRole.enabled ? 'translate-x-4 bg-neutral-950' : 'translate-x-0 bg-white'}"></span>
                      </button>
                    </div>
                    <div class="p-4 space-y-3">
                      <p class="text-[11px] text-neutral-500 leading-relaxed text-pretty">Anyone boosting the server keeps this role for as long as the boost lasts, and loses it when they stop.</p>
                      <div class="relative" id="booster-role-dropdown-wrap">
                        <button type="button" id="booster-role-trigger" class="w-full h-10 px-3.5 bg-neutral-800 border rounded-xl text-left flex items-center justify-between gap-2 transition text-sm border-neutral-700 hover:border-neutral-600">
                          <span id="booster-role-label" class="truncate text-neutral-500">Select booster role...</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform"><path d="m6 9 6 6 6-6"></path></svg>
                        </button>
                        <div id="booster-role-menu" class="hidden absolute z-40 left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto p-1 space-y-0.5"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Card 3: Tenure Roles -->
                  <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                    <div class="px-4 py-3 border-b border-neutral-800 flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="w-6 h-6 rounded-md bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-clock w-3.5 h-3.5 text-sky-400"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h5"></path><path d="M17.5 17.5 16 16.3V14"></path><circle cx="16" cy="16" r="6"></circle></svg>
                        </div>
                        <h3 class="text-sm font-semibold text-white truncate text-balance">Tenure Roles</h3>
                        <span id="tenure-roles-count" class="text-[11px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 tabular-nums">0</span>
                      </div>
                    </div>
                    <div class="p-4 space-y-3">
                      <p class="text-[11px] text-neutral-500 leading-relaxed text-pretty">Rewards sticking around. A member who's been in the server long enough gets the role once.</p>
                      <div id="tenure-roles-list" class="space-y-1.5 empty:hidden"></div>
                      <div class="flex items-end gap-2">
                        <div class="flex-1 min-w-0">
                          <div class="relative" id="tenure-role-dropdown-wrap">
                            <button type="button" id="tenure-role-trigger" class="w-full h-10 px-3.5 bg-neutral-800 border rounded-xl text-left flex items-center justify-between gap-2 transition text-sm border-neutral-700 hover:border-neutral-600">
                              <span id="tenure-role-label" class="truncate text-neutral-500">Role…</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform"><path d="m6 9 6 6 6-6"></path></svg>
                            </button>
                            <div id="tenure-role-menu" class="hidden absolute z-40 left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto p-1 space-y-0.5"></div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1 flex-shrink-0">
                          <input id="tenure-days-input" class="w-20 h-10 px-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs tabular-nums focus:outline-none focus:border-white/40" min="1" max="3650" type="number" value="7">
                          <span class="text-[11px] text-neutral-500">days in server</span>
                        </div>
                        <button type="button" id="btn-add-tenure-role" aria-label="Add tenure role" disabled class="h-10 px-3 rounded-xl bg-white text-black text-xs font-medium hover:bg-neutral-200 disabled:opacity-40 transition-colors flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3.5 h-3.5"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Card 4: Activity Roles -->
                  <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                    <div class="px-4 py-3 border-b border-neutral-800 flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity w-3.5 h-3.5 text-emerald-400"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg>
                        </div>
                        <h3 class="text-sm font-semibold text-white truncate text-balance">Activity Roles</h3>
                        <span id="activity-roles-count" class="text-[11px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 tabular-nums">0</span>
                      </div>
                    </div>
                    <div class="p-4 space-y-3">
                      <p class="text-[11px] text-neutral-500 leading-relaxed text-pretty">Rewards showing up. Members active recently keep the role and lose it if they go quiet.</p>
                      <div id="activity-roles-list" class="space-y-1.5 empty:hidden"></div>
                      <div class="flex items-end gap-2">
                        <div class="flex-1 min-w-0">
                          <div class="relative" id="activity-role-dropdown-wrap">
                            <button type="button" id="activity-role-trigger" class="w-full h-10 px-3.5 bg-neutral-800 border rounded-xl text-left flex items-center justify-between gap-2 transition text-sm border-neutral-700 hover:border-neutral-600">
                              <span id="activity-role-label" class="truncate text-neutral-500">Role…</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform"><path d="m6 9 6 6 6-6"></path></svg>
                            </button>
                            <div id="activity-role-menu" class="hidden absolute z-40 left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto p-1 space-y-0.5"></div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1 flex-shrink-0">
                          <input id="activity-days-input" class="w-20 h-10 px-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs tabular-nums focus:outline-none focus:border-white/40" min="1" max="3650" type="number" value="7">
                          <span class="text-[11px] text-neutral-500">days active</span>
                        </div>
                        <button type="button" id="btn-add-activity-role" aria-label="Add activity role" disabled class="h-10 px-3 rounded-xl bg-white text-black text-xs font-medium hover:bg-neutral-200 disabled:opacity-40 transition-colors flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3.5 h-3.5"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Mount Point -->
        <div id="roles-modal-root"></div>
      `;
    };

    // 1. Reaction Panels Grid Renderer (3x3 slots like PeakBot)
    const renderReactionPanelsGrid = () => {
      const grid = document.getElementById('rr-panels-grid');
      const countEl = document.getElementById('rr-panels-count');
      if (!grid) return;

      const panels = state.reactionPanels || [];
      if (countEl) countEl.textContent = String(panels.length);

      const cardsHtml = panels.map((panel) => {
        const title = panel.embed?.title || panel.name || 'Role Selection';
        const comps = Array.isArray(panel.components) ? panel.components : [];
        const ch = getChannelById(panel.channel_id);
        const panelTypeLabel = panel.panel_type === 'reactions' ? 'Reactions' : 'Buttons';
        const isLive = Boolean(panel.message_id || panel.msg_id);

        return `
          <div class="group relative rounded-xl border border-neutral-800 hover:border-neutral-600 bg-neutral-950/60 hover:bg-neutral-800/40 p-3.5 flex flex-col justify-between gap-2.5 transition-all min-h-[116px] cursor-pointer" data-edit-panel="${escapeHtml(panel.id)}">
            <div>
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <h4 class="text-xs font-semibold text-white truncate">${escapeHtml(title)}</h4>
                  <p class="text-[11px] text-neutral-500 truncate mt-0.5">
                    ${ch ? `#${escapeHtml(ch.name)}` : 'No channel set'} · ${panelTypeLabel}
                  </p>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${isLive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-400'}">
                  ${isLive ? 'Published' : 'Draft'}
                </span>
              </div>
              <div class="flex flex-wrap gap-1 mt-2.5">
                ${comps.slice(0, 3).map(c => {
                  const r = getRoleById(c.role_id);
                  const dot = getRoleDotColor(r);
                  const label = c.label || (r ? r.name : 'Role');
                  return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-800/90 border border-neutral-700/60 text-[10px] text-neutral-200 max-w-[110px] truncate">
                    ${c.emoji ? `<span>${escapeHtml(c.emoji)}</span>` : `<span class="w-1.5 h-1.5 rounded-full shrink-0" style="background:${dot}"></span>`}
                    <span class="truncate">${escapeHtml(label)}</span>
                  </span>`;
                }).join('')}
                ${comps.length > 3 ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">+${comps.length - 3}</span>` : ''}
                ${comps.length === 0 ? `<span class="text-[10px] text-neutral-600">No roles added</span>` : ''}
              </div>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-neutral-800/70">
              <span class="text-[10px] text-neutral-500 tabular-nums">${comps.length} ${comps.length === 1 ? 'role' : 'roles'}</span>
              <div class="flex items-center gap-1">
                <button type="button" data-send-panel="${escapeHtml(panel.id)}" title="Publish / Resend to Discord" class="px-2 py-0.5 rounded bg-neutral-800 hover:bg-white hover:text-black text-[10px] font-medium text-neutral-300 transition-colors">
                  Send
                </button>
                <button type="button" data-delete-panel="${escapeHtml(panel.id)}" title="Delete panel" class="p-1 rounded hover:bg-red-500/15 text-neutral-500 hover:text-red-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      });

      // Primary "New Panel" card
      cardsHtml.push(`
        <button type="button" data-create-panel="primary" class="group rounded-xl border border-dashed border-neutral-700 hover:border-neutral-500 bg-transparent hover:bg-neutral-800/30 p-3 flex flex-col items-center justify-center gap-1.5 text-neutral-400 hover:text-white transition-colors min-h-[116px]">
          <div class="w-8 h-8 rounded-full bg-neutral-800/80 group-hover:bg-neutral-700/80 flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-4 h-4"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
          </div>
          <span class="text-xs font-medium">New Panel</span>
        </button>
      `);

      // Fill remaining slots up to 9 total cells in the 3x3 grid
      const totalSlots = Math.max(9, cardsHtml.length);
      while (cardsHtml.length < totalSlots) {
        cardsHtml.push(`
          <button type="button" data-create-panel="slot" class="rounded-xl border border-dashed border-neutral-800/70 hover:border-neutral-600 bg-transparent hover:bg-neutral-800/20 p-3 flex items-center justify-center text-neutral-700 hover:text-neutral-400 transition-colors min-h-[116px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-4 h-4"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
          </button>
        `);
      }

      grid.innerHTML = cardsHtml.join('');

      grid.querySelectorAll('[data-create-panel]').forEach(btn => {
        btn.addEventListener('click', () => openReactionPanelModal(null));
      });

      grid.querySelectorAll('[data-edit-panel]').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('[data-send-panel]') || e.target.closest('[data-delete-panel]')) return;
          const pid = card.getAttribute('data-edit-panel');
          const found = state.reactionPanels.find(p => String(p.id) === String(pid));
          if (found) openReactionPanelModal(found);
        });
      });

      grid.querySelectorAll('[data-send-panel]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const pid = btn.getAttribute('data-send-panel');
          const found = state.reactionPanels.find(p => String(p.id) === String(pid));
          if (!found) return;
          if (!found.channel_id) {
            openReactionPanelModal(found);
            if (window.Notifications) Notifications.show('Please select a channel to post this panel', 'info');
            return;
          }
          const origText = btn.textContent;
          btn.textContent = '...';
          btn.disabled = true;
          try {
            const res = await API.sendReactionRole(guildId, { id: found.id, channel_id: found.channel_id });
            found.message_id = res.message_id || res.msg_id || 'sent';
            renderReactionPanelsGrid();
            if (window.Notifications) Notifications.show('Reaction panel sent to Discord!', 'success');
          } catch (err) {
            if (window.Notifications) Notifications.show(err.message || 'Failed to send panel', 'error');
            btn.textContent = origText;
            btn.disabled = false;
          }
        });
      });

      grid.querySelectorAll('[data-delete-panel]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const pid = btn.getAttribute('data-delete-panel');
          try {
            await API.deleteReactionRole(guildId, pid);
            state.reactionPanels = state.reactionPanels.filter(p => String(p.id) !== String(pid));
            renderReactionPanelsGrid();
            if (window.Notifications) Notifications.show('Reaction panel deleted', 'success');
          } catch (err) {
            if (window.Notifications) Notifications.show(err.message || 'Failed to delete panel', 'error');
          }
        });
      });
    };

    // 2. Auto Roles Multi-Select Renderer
    const renderAutoRoles = (filterText = '') => {
      const pillsWrap = document.getElementById('autoroles-selected-pills');
      const countBadge = document.getElementById('autoroles-count-badge');
      const optionsWrap = document.getElementById('autoroles-options');
      if (!pillsWrap || !optionsWrap) return;

      if (countBadge) {
        countBadge.textContent = `${state.autoRoles.length} assigned`;
      }

      if (state.autoRoles.length === 0) {
        pillsWrap.innerHTML = `<span class="text-sm text-neutral-500 py-0.5">Select roles…</span>`;
      } else {
        pillsWrap.innerHTML = state.autoRoles.map(rid => {
          const role = getRoleById(rid);
          const name = role ? role.name : `Role ${rid}`;
          const dot = getRoleDotColor(role);
          return `
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white">
              <span class="w-2 h-2 rounded-full shrink-0" style="background:${dot}"></span>
              <span class="truncate max-w-[130px]">${escapeHtml(name)}</span>
              <button type="button" data-remove-autorole="${escapeHtml(rid)}" class="text-neutral-400 hover:text-white ml-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </span>
          `;
        }).join('');
      }

      pillsWrap.querySelectorAll('[data-remove-autorole]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rid = btn.getAttribute('data-remove-autorole');
          state.autoRoles = state.autoRoles.filter(id => id !== rid);
          renderAutoRoles(document.getElementById('autoroles-search')?.value || '');
          saveRolesConfig();
        });
      });

      const q = filterText.trim().toLowerCase();
      const filteredRoles = allRoles.filter(r => !q || r.name.toLowerCase().includes(q));

      if (filteredRoles.length === 0) {
        optionsWrap.innerHTML = `<div class="px-3 py-2 text-xs text-neutral-500">No roles found</div>`;
      } else {
        optionsWrap.innerHTML = filteredRoles.map(r => {
          const selected = state.autoRoles.includes(String(r.id));
          const dot = getRoleDotColor(r);
          return `
            <button type="button" data-toggle-autorole="${escapeHtml(r.id)}" class="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between gap-2 text-xs transition-colors ${selected ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${dot}"></span>
                <span class="truncate">${escapeHtml(r.name)}</span>
              </div>
              ${selected ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-white shrink-0"><path d="M20 6 9 17l-5-5"/></svg>` : ''}
            </button>
          `;
        }).join('');
      }

      optionsWrap.querySelectorAll('[data-toggle-autorole]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rid = String(btn.getAttribute('data-toggle-autorole'));
          if (state.autoRoles.includes(rid)) {
            state.autoRoles = state.autoRoles.filter(id => id !== rid);
          } else {
            state.autoRoles.push(rid);
          }
          renderAutoRoles(document.getElementById('autoroles-search')?.value || '');
          saveRolesConfig();
        });
      });
    };

    // 3. Custom Rules Renderer
    const TRIGGER_LABELS = {
      member_join: 'When a member joins',
      member_verify: 'When a member verifies',
      member_boost: 'When a member boosts',
      message_sent: 'When a member sends a message',
      reaction_add: 'When a member adds a reaction',
      has_role: 'When a member receives a role'
    };

    const ACTION_LABELS = {
      add_role: 'Add role',
      remove_role: 'Remove role',
      send_dm: 'Send welcome DM'
    };

    const renderCustomRules = () => {
      const body = document.getElementById('custom-rules-body');
      const countEl = document.getElementById('custom-rules-count');
      if (!body) return;

      if (countEl) countEl.textContent = String(state.customRules.length);

      if (state.customRules.length === 0) {
        body.innerHTML = `
          <div class="text-center py-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-workflow w-6 h-6 text-neutral-700 mx-auto mb-1.5"><rect width="8" height="8" x="3" y="3" rx="2"></rect><path d="M7 11v4a2 2 0 0 0 2 2h4"></path><rect width="8" height="8" x="13" y="13" rx="2"></rect></svg>
            <p class="text-xs font-medium text-neutral-300">Build if/then role logic</p>
            <p class="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">When something happens, automatically add or remove a role.</p>
            <div class="flex flex-wrap justify-center gap-1.5 mt-3">
              <button type="button" data-preset-rule="default_role" class="text-[11px] px-2.5 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-neutral-300 hover:border-violet-500/40 hover:text-white transition-colors">Auto-assign default role</button>
              <button type="button" data-preset-rule="verify_promote" class="text-[11px] px-2.5 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-neutral-300 hover:border-violet-500/40 hover:text-white transition-colors">Promote on verification</button>
              <button type="button" data-preset-rule="welcome_dm" class="text-[11px] px-2.5 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-neutral-300 hover:border-violet-500/40 hover:text-white transition-colors">Welcome DM on join</button>
            </div>
          </div>
        `;

        body.querySelectorAll('[data-preset-rule]').forEach(btn => {
          btn.addEventListener('click', () => {
            const preset = btn.getAttribute('data-preset-rule');
            const firstRole = allRoles[0] ? String(allRoles[0].id) : '';
            if (preset === 'default_role') {
              openCustomRuleModal({
                id: '',
                name: 'Auto-assign default role',
                enabled: true,
                trigger: 'member_join',
                condition_role_id: '',
                action: 'add_role',
                role_id: firstRole,
                dm_message: ''
              });
            } else if (preset === 'verify_promote') {
              openCustomRuleModal({
                id: '',
                name: 'Promote on verification',
                enabled: true,
                trigger: 'member_verify',
                condition_role_id: '',
                action: 'add_role',
                role_id: firstRole,
                dm_message: ''
              });
            } else if (preset === 'welcome_dm') {
              openCustomRuleModal({
                id: '',
                name: 'Welcome DM on join',
                enabled: true,
                trigger: 'member_join',
                condition_role_id: '',
                action: 'send_dm',
                role_id: '',
                dm_message: 'Hey {user}, welcome to **{server}**!'
              });
            }
          });
        });
        return;
      }

      body.innerHTML = `
        <div class="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
          ${state.customRules.map((rule) => {
            const targetRole = getRoleById(rule.role_id);
            const trigText = TRIGGER_LABELS[rule.trigger] || rule.trigger;
            const actText = rule.action === 'send_dm'
              ? 'Send DM'
              : `${ACTION_LABELS[rule.action] || 'Add role'} ${targetRole ? `@${targetRole.name}` : ''}`;
            return `
              <div class="p-2.5 rounded-xl bg-neutral-800/50 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1 cursor-pointer" data-edit-rule="${escapeHtml(rule.id)}">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full ${rule.enabled ? 'bg-violet-400' : 'bg-neutral-600'}"></span>
                    <p class="text-xs font-medium text-white truncate">${escapeHtml(rule.name)}</p>
                  </div>
                  <p class="text-[11px] text-neutral-400 truncate mt-0.5">${escapeHtml(trigText)} → ${escapeHtml(actText)}</p>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button type="button" data-toggle-rule="${escapeHtml(rule.id)}" role="switch" aria-checked="${rule.enabled}" class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors ${rule.enabled ? 'bg-white' : 'bg-neutral-700'}">
                    <span class="pointer-events-none block h-3 w-3 rounded-full transition-transform ${rule.enabled ? 'translate-x-3 bg-neutral-950' : 'translate-x-0 bg-white'}"></span>
                  </button>
                  <button type="button" data-delete-rule="${escapeHtml(rule.id)}" class="p-1 rounded hover:bg-red-500/15 text-neutral-500 hover:text-red-400 transition-colors" title="Delete rule">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      body.querySelectorAll('[data-edit-rule]').forEach(el => {
        el.addEventListener('click', () => {
          const rid = el.getAttribute('data-edit-rule');
          const found = state.customRules.find(r => r.id === rid);
          if (found) openCustomRuleModal(found);
        });
      });

      body.querySelectorAll('[data-toggle-rule]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rid = btn.getAttribute('data-toggle-rule');
          const found = state.customRules.find(r => r.id === rid);
          if (found) {
            found.enabled = !found.enabled;
            btn.setAttribute('aria-checked', String(found.enabled));
            btn.classList.toggle('bg-white', found.enabled);
            btn.classList.toggle('bg-neutral-700', !found.enabled);
            const thumb = btn.querySelector('span');
            if (thumb) {
              thumb.className = `pointer-events-none block h-4 w-4 rounded-full shadow-sm transition-transform duration-200 ${found.enabled ? 'translate-x-4 bg-neutral-950' : 'translate-x-0 bg-white'}`;
            }
            saveRolesConfig();
          }
        });
      });

      body.querySelectorAll('[data-delete-rule]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rid = btn.getAttribute('data-delete-rule');
          state.customRules = state.customRules.filter(r => r.id !== rid);
          renderCustomRules();
          saveRolesConfig();
        });
      });
    };

    const syncCompactSwitch = (btn, checked) => {
      if (!btn) return;
      btn.setAttribute('aria-checked', String(checked));
      btn.className = `relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${checked ? 'bg-white' : 'bg-neutral-700'}`;
      let thumb = btn.querySelector('span');
      if (!thumb) {
        thumb = document.createElement('span');
        btn.appendChild(thumb);
      }
      thumb.className = `pointer-events-none block h-4 w-4 rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4 bg-neutral-950' : 'translate-x-0 bg-white'}`;
    };

    // 4. Sticky Roles Renderer
    const renderStickyRoles = () => {
      const enabledBtn = document.getElementById('sticky-enabled-switch');
      const restoreAllBtn = document.getElementById('sticky-restore-all-switch');
      const specificWrap = document.getElementById('sticky-specific-roles-wrap');
      const pillsWrap = document.getElementById('sticky-roles-pills');
      const menuWrap = document.getElementById('sticky-roles-menu');

      syncCompactSwitch(enabledBtn, state.stickyRoles.enabled);
      syncCompactSwitch(restoreAllBtn, state.stickyRoles.restore_all);

      if (specificWrap) {
        specificWrap.className = state.stickyRoles.restore_all ? 'hidden' : 'pt-1';
      }

      if (pillsWrap && menuWrap) {
        if (state.stickyRoles.roles.length === 0) {
          pillsWrap.innerHTML = `<span class="text-xs text-neutral-500">Select sticky roles…</span>`;
        } else {
          pillsWrap.innerHTML = state.stickyRoles.roles.map(rid => {
            const role = getRoleById(rid);
            const dot = getRoleDotColor(role);
            return `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white">
                <span class="w-2 h-2 rounded-full shrink-0" style="background:${dot}"></span>
                <span class="truncate max-w-[120px]">${escapeHtml(role ? role.name : rid)}</span>
              </span>
            `;
          }).join('');
        }

        menuWrap.innerHTML = allRoles.map(r => {
          const selected = state.stickyRoles.roles.includes(String(r.id));
          const dot = getRoleDotColor(r);
          return `
            <button type="button" data-toggle-sticky-role="${escapeHtml(r.id)}" class="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between gap-2 text-xs transition-colors ${selected ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${dot}"></span>
                <span class="truncate">${escapeHtml(r.name)}</span>
              </div>
              ${selected ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-white shrink-0"><path d="M20 6 9 17l-5-5"/></svg>` : ''}
            </button>
          `;
        }).join('');

        menuWrap.querySelectorAll('[data-toggle-sticky-role]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rid = String(btn.getAttribute('data-toggle-sticky-role'));
            if (state.stickyRoles.roles.includes(rid)) {
              state.stickyRoles.roles = state.stickyRoles.roles.filter(id => id !== rid);
            } else {
              state.stickyRoles.roles.push(rid);
            }
            renderStickyRoles();
            saveRolesConfig();
          });
        });
      }
    };

    // 5. Booster Role Renderer
    const renderBoosterRole = () => {
      const switchBtn = document.getElementById('booster-enabled-switch');
      const labelEl = document.getElementById('booster-role-label');
      const menuEl = document.getElementById('booster-role-menu');

      syncCompactSwitch(switchBtn, state.boosterRole.enabled);

      const selectedRole = getRoleById(state.boosterRole.role_id);
      if (labelEl) {
        if (selectedRole) {
          const dot = getRoleDotColor(selectedRole);
          labelEl.className = 'truncate text-white flex items-center gap-2';
          labelEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${dot}"></span><span class="truncate">${escapeHtml(selectedRole.name)}</span>`;
        } else {
          labelEl.className = 'truncate text-neutral-500';
          labelEl.textContent = 'Select booster role...';
        }
      }

      if (menuEl) {
        menuEl.innerHTML = `
          <button type="button" data-select-booster-role="" class="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-neutral-400 hover:bg-neutral-800/60">None</button>
          ${allRoles.map(r => {
            const isSel = String(r.id) === String(state.boosterRole.role_id);
            const dot = getRoleDotColor(r);
            return `
              <button type="button" data-select-booster-role="${escapeHtml(r.id)}" class="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between gap-2 text-xs transition-colors ${isSel ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${dot}"></span>
                  <span class="truncate">${escapeHtml(r.name)}</span>
                </div>
                ${isSel ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-white shrink-0"><path d="M20 6 9 17l-5-5"/></svg>` : ''}
              </button>
            `;
          }).join('')}
        `;

        menuEl.querySelectorAll('[data-select-booster-role]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rid = btn.getAttribute('data-select-booster-role') || '';
            state.boosterRole.role_id = rid;
            if (rid && !state.boosterRole.enabled) {
              state.boosterRole.enabled = true;
            }
            menuEl.classList.add('hidden');
            renderBoosterRole();
            saveRolesConfig();
          });
        });
      }
    };

    // 6. Tenure Roles Renderer
    const renderTenureRoles = () => {
      const countEl = document.getElementById('tenure-roles-count');
      const listEl = document.getElementById('tenure-roles-list');
      const labelEl = document.getElementById('tenure-role-label');
      const menuEl = document.getElementById('tenure-role-menu');
      const addBtn = document.getElementById('btn-add-tenure-role');

      if (countEl) countEl.textContent = String(state.tenureRoles.length);

      if (listEl) {
        listEl.innerHTML = state.tenureRoles.map((item, idx) => {
          const r = getRoleById(item.role_id);
          const dot = getRoleDotColor(r);
          return `
            <div class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-neutral-800/60 border border-neutral-800">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${dot}"></span>
                <span class="text-xs font-medium text-white truncate">${escapeHtml(r ? r.name : `Role ${item.role_id}`)}</span>
                <span class="text-[11px] text-neutral-400 shrink-0">· after ${item.days} ${item.days === 1 ? 'day' : 'days'}</span>
              </div>
              <button type="button" data-remove-tenure="${idx}" class="p-1 rounded hover:bg-red-500/15 text-neutral-500 hover:text-red-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          `;
        }).join('');

        listEl.querySelectorAll('[data-remove-tenure]').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-remove-tenure'), 10);
            state.tenureRoles.splice(idx, 1);
            renderTenureRoles();
            saveRolesConfig();
          });
        });
      }

      const pendingRole = getRoleById(state.pendingTenureRoleId);
      if (labelEl) {
        if (pendingRole) {
          const dot = getRoleDotColor(pendingRole);
          labelEl.className = 'truncate text-white flex items-center gap-2';
          labelEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${dot}"></span><span class="truncate">${escapeHtml(pendingRole.name)}</span>`;
        } else {
          labelEl.className = 'truncate text-neutral-500';
          labelEl.textContent = 'Role…';
        }
      }

      if (addBtn) {
        addBtn.disabled = !state.pendingTenureRoleId;
      }

      if (menuEl) {
        menuEl.innerHTML = allRoles.map(r => {
          const isSel = String(r.id) === String(state.pendingTenureRoleId);
          const dot = getRoleDotColor(r);
          return `
            <button type="button" data-select-tenure-role="${escapeHtml(r.id)}" class="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between gap-2 text-xs transition-colors ${isSel ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${dot}"></span>
                <span class="truncate">${escapeHtml(r.name)}</span>
              </div>
            </button>
          `;
        }).join('');

        menuEl.querySelectorAll('[data-select-tenure-role]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.pendingTenureRoleId = String(btn.getAttribute('data-select-tenure-role'));
            menuEl.classList.add('hidden');
            renderTenureRoles();
          });
        });
      }
    };

    // 7. Activity Roles Renderer
    const renderActivityRoles = () => {
      const countEl = document.getElementById('activity-roles-count');
      const listEl = document.getElementById('activity-roles-list');
      const labelEl = document.getElementById('activity-role-label');
      const menuEl = document.getElementById('activity-role-menu');
      const addBtn = document.getElementById('btn-add-activity-role');

      if (countEl) countEl.textContent = String(state.activityRoles.length);

      if (listEl) {
        listEl.innerHTML = state.activityRoles.map((item, idx) => {
          const r = getRoleById(item.role_id);
          const dot = getRoleDotColor(r);
          return `
            <div class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-neutral-800/60 border border-neutral-800">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${dot}"></span>
                <span class="text-xs font-medium text-white truncate">${escapeHtml(r ? r.name : `Role ${item.role_id}`)}</span>
                <span class="text-[11px] text-neutral-400 shrink-0">· active within ${item.days} ${item.days === 1 ? 'day' : 'days'}</span>
              </div>
              <button type="button" data-remove-activity="${idx}" class="p-1 rounded hover:bg-red-500/15 text-neutral-500 hover:text-red-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          `;
        }).join('');

        listEl.querySelectorAll('[data-remove-activity]').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-remove-activity'), 10);
            state.activityRoles.splice(idx, 1);
            renderActivityRoles();
            saveRolesConfig();
          });
        });
      }

      const pendingRole = getRoleById(state.pendingActivityRoleId);
      if (labelEl) {
        if (pendingRole) {
          const dot = getRoleDotColor(pendingRole);
          labelEl.className = 'truncate text-white flex items-center gap-2';
          labelEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${dot}"></span><span class="truncate">${escapeHtml(pendingRole.name)}</span>`;
        } else {
          labelEl.className = 'truncate text-neutral-500';
          labelEl.textContent = 'Role…';
        }
      }

      if (addBtn) {
        addBtn.disabled = !state.pendingActivityRoleId;
      }

      if (menuEl) {
        menuEl.innerHTML = allRoles.map(r => {
          const isSel = String(r.id) === String(state.pendingActivityRoleId);
          const dot = getRoleDotColor(r);
          return `
            <button type="button" data-select-activity-role="${escapeHtml(r.id)}" class="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between gap-2 text-xs transition-colors ${isSel ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-300 hover:bg-neutral-800/60'}">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${dot}"></span>
                <span class="truncate">${escapeHtml(r.name)}</span>
              </div>
            </button>
          `;
        }).join('');

        menuEl.querySelectorAll('[data-select-activity-role]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.pendingActivityRoleId = String(btn.getAttribute('data-select-activity-role'));
            menuEl.classList.add('hidden');
            renderActivityRoles();
          });
        });
      }
    };

    // Reaction Panel Builder Modal (1:1 PeakBot "Neues Reaktionspanel")
    const openReactionPanelModal = (existingPanel = null) => {
      const modalRoot = document.getElementById('roles-modal-root');
      if (!modalRoot) return;

      const isEditing = Boolean(existingPanel && existingPanel.id);
      let channelDropdownOpen = false;
      let openRoleDropdownIdx = null;
      let openEmojiPickerIdx = null;
      let messageBuilderExpanded = false;

      const draft = {
        id: existingPanel?.id || '',
        name: existingPanel?.name || existingPanel?.embed?.title || 'Role Selection',
        channel_id: existingPanel?.channel_id ? String(existingPanel.channel_id) : '',
        panel_type: existingPanel?.panel_type || 'buttons',
        mode: existingPanel?.mode || 'multi',
        post_on_save: true,
        embed: {
          title: existingPanel?.embed?.title || existingPanel?.name || 'Role Selection',
          description: existingPanel?.embed?.description || '',
          color: existingPanel?.embed?.color || 'rgb(88, 101, 242)'
        },
        components: Array.isArray(existingPanel?.components) && existingPanel.components.length > 0
          ? existingPanel.components.map(c => ({
              role_id: String(c.role_id || ''),
              label: String(c.label || ''),
              emoji: String(c.emoji || '✨'),
              color: String(c.color || 'blue')
            }))
          : []
      };

      const MODE_META = {
        multi: {
          label: 'Mehrfachauswahl',
          desc: 'Klicken Sie zum Hinzufügen oder Entfernen. Stapeln Sie so viele, wie Sie möchten.',
          previewText: 'Mehrfachauswahl Modus',
          previewColor: 'text-emerald-300',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-checks relative z-10 w-3.5 h-3.5"><path d="m3 17 2 2 4-4"></path><path d="m3 7 2 2 4-4"></path><path d="M13 6h8"></path><path d="M13 12h8"></path><path d="M13 18h8"></path></svg>`
        },
        pick_one: {
          label: 'Wählen Sie eine aus',
          desc: 'Mitglieder können jeweils nur eine Rolle aus diesem Panel auswählen.',
          previewText: 'Einzelauswahl Modus',
          previewColor: 'text-sky-300',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target relative z-10 w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`
        },
        verify: {
          label: 'Verifizieren',
          desc: 'Tippen vergibt die Rolle dauerhaft (ideal für Verifizierungs-Gates).',
          previewText: 'Verifizieren Modus',
          previewColor: 'text-emerald-300',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check relative z-10 w-3.5 h-3.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>`
        },
        opt_out: {
          label: 'Opt-out',
          desc: 'Tippen entfernt die Rolle dauerhaft von Ihrem Profil.',
          previewText: 'Opt-out Modus',
          previewColor: 'text-amber-300',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ban relative z-10 w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><path d="m4.9 4.9 14.2 14.2"></path></svg>`
        },
        reversed: {
          label: 'Umgedreht',
          desc: 'Reagieren entfernt die Rolle, Entfernen der Reaktion gibt sie zurück.',
          previewText: 'Umgedreht Modus',
          previewColor: 'text-rose-300',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus-circle relative z-10 w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path></svg>`
        }
      };

      const QUICK_EMOJIS = ['✨', '🎨', '🎮', '🔔', '✅', '🛡️', '🌍', '💬', '🔥', '💎', '👑', '💜', '💙', '💚', '❤️', '🧡'];

      const applyTemplate = (tplKey) => {
        const pickRole = (idx) => allRoles[idx % Math.max(1, allRoles.length)];
        if (tplKey === 'color') {
          draft.embed.title = 'Farbrollen';
          draft.embed.description = 'Wähle deine Lieblingsfarbe für deinen Namen auf dem Server!';
          draft.embed.color = 'rgb(235, 69, 158)';
          draft.mode = 'pick_one';
          const emojis = ['❤️', '💙', '💚', '💜'];
          draft.components = emojis.slice(0, Math.min(4, Math.max(1, allRoles.length))).map((em, i) => {
            const r = pickRole(i);
            return { role_id: r ? String(r.id) : '', label: r ? r.name : `Farbe ${i + 1}`, emoji: em, color: 'blue' };
          });
        } else if (tplKey === 'pronouns') {
          draft.embed.title = 'Pronomen';
          draft.embed.description = 'Wähle deine Pronomen aus, damit andere wissen, wie sie dich ansprechen können.';
          draft.embed.color = 'rgb(88, 101, 242)';
          draft.mode = 'multi';
          const emojis = ['💙', '💖', '✨'];
          draft.components = emojis.slice(0, Math.min(3, Math.max(1, allRoles.length))).map((em, i) => {
            const r = pickRole(i);
            return { role_id: r ? String(r.id) : '', label: r ? r.name : 'Pronomen', emoji: em, color: 'gray' };
          });
        } else if (tplKey === 'region') {
          draft.embed.title = 'Region';
          draft.embed.description = 'Wähle deine Region aus, um Mitglieder aus deiner Zeitzone zu finden.';
          draft.embed.color = 'rgb(59, 165, 92)';
          draft.mode = 'pick_one';
          const emojis = ['🌍', '🌎', '🌏'];
          draft.components = emojis.slice(0, Math.min(3, Math.max(1, allRoles.length))).map((em, i) => {
            const r = pickRole(i);
            return { role_id: r ? String(r.id) : '', label: r ? r.name : 'Region', emoji: em, color: 'blue' };
          });
        } else if (tplKey === 'games') {
          draft.embed.title = 'Spiel-Pings';
          draft.embed.description = 'Klicke auf deine Lieblingsspiele, um bei Mitspieler-Suchen benachrichtigt zu werden.';
          draft.embed.color = 'rgb(250, 166, 26)';
          draft.mode = 'multi';
          const emojis = ['🎮', '🕹️', '🏆'];
          draft.components = emojis.slice(0, Math.min(3, Math.max(1, allRoles.length))).map((em, i) => {
            const r = pickRole(i);
            return { role_id: r ? String(r.id) : '', label: r ? r.name : 'Gamer', emoji: em, color: 'blue' };
          });
        } else if (tplKey === 'notifications') {
          draft.embed.title = 'Benachrichtigungen';
          draft.embed.description = 'Wähle aus, für welche Ankündigungen, Events oder Updates du gepingt werden möchtest.';
          draft.embed.color = 'rgb(155, 89, 182)';
          draft.mode = 'multi';
          const emojis = ['🔔', '📢', '🎁'];
          draft.components = emojis.slice(0, Math.min(3, Math.max(1, allRoles.length))).map((em, i) => {
            const r = pickRole(i);
            return { role_id: r ? String(r.id) : '', label: r ? r.name : 'Updates', emoji: em, color: 'blue' };
          });
        } else if (tplKey === 'verify') {
          draft.embed.title = 'Verifizierung';
          draft.embed.description = 'Klicke unten auf das Häkchen, um die Regeln zu akzeptieren und Zugriff auf den Server zu erhalten.';
          draft.embed.color = 'rgb(87, 242, 135)';
          draft.mode = 'verify';
          const r = pickRole(0);
          draft.components = [
            { role_id: r ? String(r.id) : '', label: r ? r.name : 'Verifiziert', emoji: '✅', color: 'green' }
          ];
        }
        draft.name = draft.embed.title;
        renderModal();
      };

      const renderPreviewCardHtml = () => {
        const modeInfo = MODE_META[draft.mode] || MODE_META.multi;
        const selectedChannel = getChannelById(draft.channel_id);
        const channelName = selectedChannel ? selectedChannel.name : 'Reaktionsrollen';
        const displayTitle = (!draft.embed.title || draft.embed.title === 'Role Selection')
          ? 'Rollenauswahl'
          : draft.embed.title;
        const hasDesc = Boolean(draft.embed.description && draft.embed.description.trim());

        return `
          <div class="rounded-xl overflow-hidden border border-neutral-800 lg:sticky lg:top-0">
            <div class="flex items-center gap-2 px-3 py-2 bg-[#2f3136] border-b border-neutral-900/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-3.5 h-3.5 text-neutral-500"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
              <span class="text-[12px] font-medium text-neutral-300 truncate">${escapeHtml(channelName)}</span>
            </div>
            <div class="bg-[#313338] p-3">
              <div class="flex gap-2.5">
                <div class="w-8 h-8 rounded-full bg-[#5865F2] flex-shrink-0 overflow-hidden flex items-center justify-center">
                  <img src="/img/logo.png" alt="PeakBot" class="w-full h-full object-cover outline outline-1 -outline-offset-1 outline-white/10">
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5 mb-1">
                    <span class="text-[12px] font-semibold text-white">PeakBot</span>
                    <span class="inline-flex items-center gap-[0.15em] px-1 py-px bg-[#5865F2] rounded text-[8.5px] font-bold text-white leading-tight">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="h-[0.85em] w-[0.85em]"><path d="M20 6 9 17l-5-5"></path></svg>BOT
                    </span>
                  </div>
                  <div class="flex rounded overflow-hidden max-w-sm">
                    <div class="w-1 flex-shrink-0" style="background-color: ${escapeHtml(draft.embed.color || 'rgb(88, 101, 242)')};"></div>
                    <div class="bg-[#2b2d31] py-2 px-2.5 flex-1 min-w-0">
                      <p class="text-[11.5px] font-semibold text-white mb-0.5 break-words leading-snug">${escapeHtml(displayTitle)}</p>
                      ${hasDesc ? `
                        <p class="text-[10.5px] text-neutral-300 whitespace-pre-wrap break-words leading-snug">${escapeHtml(draft.embed.description)}</p>
                      ` : `
                        <p class="text-[10.5px] text-neutral-500 italic leading-snug">Beschreibung erscheint hier.</p>
                      `}
                      <p class="text-[9.5px] mt-1.5 ${modeInfo.previewColor}">${escapeHtml(modeInfo.previewText)}</p>
                    </div>
                  </div>
                  ${draft.components.length === 0 ? `
                    <p class="text-[10.5px] text-neutral-500 italic mt-1.5 text-pretty">Sobald Sie Rollen hinzufügen, werden hier Schaltflächen angezeigt.</p>
                  ` : `
                    <div class="flex flex-wrap gap-1.5 mt-2">
                      ${draft.components.map(comp => {
                        const r = getRoleById(comp.role_id);
                        const lbl = comp.label || (r ? r.name : 'Rolle');
                        const dot = r ? getRoleDotColor(r) : '#99aab5';
                        if (draft.panel_type === 'reactions') {
                          return `
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#2b2d31] border border-[#5865F2]/60 text-[11px] text-neutral-200">
                              <span>${escapeHtml(comp.emoji || '✨')}</span>
                              <span class="text-[10px] font-semibold text-indigo-300">1</span>
                            </span>
                          `;
                        }
                        return `
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#4e5058] hover:bg-[#6d6f78] text-[11px] font-medium text-white">
                            <span>${escapeHtml(comp.emoji || '✨')}</span>
                            <span class="w-2 h-2 rounded-full shrink-0" style="background:${dot}"></span>
                            <span class="truncate max-w-[130px]">${escapeHtml(lbl)}</span>
                          </span>
                        `;
                      }).join('')}
                    </div>
                  `}
                </div>
              </div>
            </div>
          </div>
        `;
      };

      const renderFooterStatusAndBtnHtml = () => {
        const validComps = draft.components.filter(c => c.role_id);
        const canSubmit = validComps.length > 0 && (!draft.post_on_save || Boolean(draft.channel_id));
        const btnLabel = (draft.post_on_save && draft.channel_id)
          ? 'Speichern & auf Discord posten'
          : 'Als Entwurf speichern';

        let hintText = 'Fügen Sie mindestens eine Rolle hinzu';
        if (validComps.length > 0 && draft.post_on_save && !draft.channel_id) {
          hintText = 'Wählen Sie einen Kanal zum Posten aus';
        } else if (validComps.length > 0) {
          hintText = `${validComps.length} Rolle${validComps.length === 1 ? '' : 'n'} bereit`;
        }

        return `
          <span class="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-3 h-3"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
            ${escapeHtml(hintText)}
          </span>
          <button type="button" id="rr-modal-submit" ${canSubmit ? '' : 'disabled=""'} class="flex items-center gap-1.5 bg-white text-black font-semibold text-sm rounded-xl h-10 px-4 hover:bg-neutral-200 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-30 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-3.5 h-3.5"><path d="M20 6 9 17l-5-5"></path></svg> ${escapeHtml(btnLabel)}
          </button>
        `;
      };

      const refreshLivePreviewAndFooter = () => {
        const prevContainer = document.getElementById('rr-preview-container');
        if (prevContainer) prevContainer.innerHTML = renderPreviewCardHtml();
        const footerRight = document.getElementById('rr-footer-right');
        if (footerRight) {
          footerRight.innerHTML = renderFooterStatusAndBtnHtml();
          document.getElementById('rr-modal-submit')?.addEventListener('click', handleSubmit);
        }
      };

      const handleSubmit = async () => {
        const validComps = draft.components.filter(c => c.role_id);
        if (validComps.length === 0) {
          if (window.Notifications) Notifications.show('Fügen Sie mindestens eine Rolle hinzu', 'error');
          return;
        }
        const postToDiscord = Boolean(draft.post_on_save && draft.channel_id);
        const payload = {
          ...draft,
          name: draft.embed.title || 'Rollenauswahl',
          components: validComps,
          post_to_discord: postToDiscord
        };
        const submitBtn = document.getElementById('rr-modal-submit');
        if (submitBtn) submitBtn.disabled = true;
        try {
          const res = await API.saveReactionRole(guildId, payload);
          payload.id = res.id || payload.id || `rr_${Date.now()}`;
          if (res.message_id || res.msg_id) {
            payload.message_id = res.message_id || res.msg_id;
          }
          const existingIdx = state.reactionPanels.findIndex(p => String(p.id) === String(payload.id));
          if (existingIdx >= 0) {
            state.reactionPanels[existingIdx] = payload;
          } else {
            state.reactionPanels.push(payload);
          }
          modalRoot.innerHTML = '';
          renderReactionPanelsGrid();
          if (window.Notifications) {
            Notifications.show(postToDiscord ? 'Reaktionspanel gespeichert & auf Discord gepostet!' : 'Reaktionspanel als Entwurf gespeichert!', 'success');
          }
        } catch (err) {
          if (submitBtn) submitBtn.disabled = false;
          if (window.Notifications) Notifications.show(err.message || 'Fehler beim Speichern des Reaktionspanels', 'error');
        }
      };

      const renderModal = () => {
        const modeInfo = MODE_META[draft.mode] || MODE_META.multi;
        const selectedChannel = getChannelById(draft.channel_id);
        const needsChannelWarning = draft.post_on_save && !draft.channel_id;

        modalRoot.innerHTML = `
          <div id="rr-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div class="w-full max-w-5xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col" style="opacity: 1; transform: none;">
              <!-- Modal Header -->
              <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-800 flex-shrink-0">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-lg bg-rose-500/10 ring-1 ring-rose-500/15 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile-plus w-4 h-4 text-rose-400"><path d="M22 11v1a10 10 0 1 1-9-10"></path><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line><path d="M16 5h6"></path><path d="M19 2v6"></path></svg>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-white truncate">${isEditing ? 'Reaktionspanel bearbeiten' : 'Neues Reaktionspanel'}</p>
                    <p class="text-[11px] text-neutral-500">Mitglieder tippen auf ein Emoji, um eine Rolle zu übernehmen</p>
                  </div>
                </div>
                <button type="button" id="rr-modal-close" class="p-1 text-neutral-500 hover:text-white transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                </button>
              </div>

              <!-- Scrollable 2-Column Body -->
              <div class="flex-1 min-h-0 overflow-y-auto" data-lenis-prevent="true">
                <div class="grid grid-cols-1 lg:grid-cols-[1fr,360px] min-h-full">
                  <!-- Left Column -->
                  <div class="divide-y divide-neutral-800/60">
                    <!-- 1. Beginnen Sie mit einer Vorlage -->
                    <div class="px-5 py-4">
                      <p class="text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-2">Beginnen Sie mit einer Vorlage</p>
                      <div class="flex flex-wrap gap-1.5">
                        <button type="button" data-rr-tpl="color" class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette w-3.5 h-3.5"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>Farbe
                        </button>
                        <button type="button" data-rr-tpl="pronouns" class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type w-3.5 h-3.5"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" x2="15" y1="20" y2="20"></line><line x1="12" x2="12" y1="4" y2="20"></line></svg>Pronomen
                        </button>
                        <button type="button" data-rr-tpl="region" class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>Region
                        </button>
                        <button type="button" data-rr-tpl="games" class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gamepad2 w-3.5 h-3.5"><line x1="6" x2="10" y1="11" y2="11"></line><line x1="8" x2="8" y1="9" y2="13"></line><line x1="15" x2="15.01" y1="12" y2="12"></line><line x1="18" x2="18.01" y1="10" y2="10"></line><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path></svg>Spiel-Pings
                        </button>
                        <button type="button" data-rr-tpl="notifications" class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell w-3.5 h-3.5"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>Benachrichtigungen
                        </button>
                        <button type="button" data-rr-tpl="verify" class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-3.5 h-3.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>Tor überprüfen
                        </button>
                      </div>
                    </div>

                    <!-- 2. Verhalten -->
                    <div class="px-5 py-4">
                      <p class="text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-2">Verhalten</p>
                      <div class="grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 rounded-xl bg-neutral-800/50 border border-neutral-800">
                        ${Object.entries(MODE_META).map(([mKey, mObj]) => {
                          const isActive = draft.mode === mKey;
                          return `
                            <button type="button" data-rr-mode="${mKey}" class="relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${isActive ? 'text-black' : 'text-neutral-400 hover:text-white'}">
                              ${isActive ? '<span class="absolute inset-0 bg-white rounded-lg shadow-sm" style="opacity: 1;"></span>' : ''}
                              ${mObj.icon}
                              <span class="relative z-10">${escapeHtml(mObj.label)}</span>
                            </button>
                          `;
                        }).join('')}
                      </div>
                      <p class="text-[11px] text-neutral-500 mt-2 leading-relaxed">${escapeHtml(modeInfo.desc)}</p>
                    </div>

                    <!-- 3. Titel & Beschreibung -->
                    <div class="px-5 py-4 space-y-3">
                      <div>
                        <label class="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">Titel</label>
                        <input id="rr-modal-title" maxlength="256" placeholder="Wählen Sie Ihre Rollen" class="w-full bg-neutral-800 border border-neutral-700 rounded-xl h-10 px-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors" type="text" value="${escapeHtml(draft.embed.title)}">
                      </div>
                      <div>
                        <label class="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">Beschreibung</label>
                        <textarea id="rr-modal-desc" maxlength="1024" rows="2" placeholder="Optional" class="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 resize-none transition-colors">${escapeHtml(draft.embed.description)}</textarea>
                      </div>
                    </div>

                    <!-- 4. Nachricht -->
                    <div class="px-5 py-4">
                      <p class="text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-2">Nachricht</p>
                      <button type="button" id="rr-toggle-msg-builder" class="group w-full flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800/70 hover:border-neutral-700 px-3.5 py-3 text-left transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40">
                        <span class="grid place-items-center w-9 h-9 flex-shrink-0 rounded-lg bg-indigo-500/15 text-indigo-300 group-hover:bg-indigo-500/25 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil w-4 h-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                        </span>
                        <span class="min-w-0 flex-1 text-sm font-medium text-white">Im Nachrichten-Builder bearbeiten</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-4 h-4 flex-shrink-0 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-[transform,color] duration-150"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                      </button>
                      ${messageBuilderExpanded ? `
                        <div class="mt-3 p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-800 space-y-3">
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label class="block text-[11px] font-medium text-neutral-400 mb-1">Embed-Farbe</label>
                              <div class="flex items-center gap-1.5">
                                ${['rgb(88, 101, 242)', 'rgb(87, 242, 135)', 'rgb(235, 69, 158)', 'rgb(250, 166, 26)', 'rgb(237, 66, 69)', 'rgb(155, 89, 182)'].map(col => `
                                  <button type="button" data-rr-embed-col="${col}" class="w-6 h-6 rounded-full border-2 ${draft.embed.color === col ? 'border-white scale-110' : 'border-transparent opacity-75 hover:opacity-100'} transition-all" style="background-color: ${col};"></button>
                                `).join('')}
                              </div>
                            </div>
                            <div>
                              <label class="block text-[11px] font-medium text-neutral-400 mb-1">Interaktions-Stil</label>
                              <div class="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-neutral-900 border border-neutral-800">
                                <button type="button" data-rr-ptype="buttons" class="py-1 rounded-md text-[11px] font-medium ${draft.panel_type === 'buttons' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}">Schaltflächen</button>
                                <button type="button" data-rr-ptype="reactions" class="py-1 rounded-md text-[11px] font-medium ${draft.panel_type === 'reactions' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}">Reaktionen</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ` : ''}
                    </div>

                    <!-- 5. Kanal & Beim Speichern auf Discord posten -->
                    <div class="px-5 py-4 space-y-3">
                      <div>
                        <label class="block text-[11px] uppercase tracking-wider font-medium text-neutral-500 mb-1.5">
                          Kanal${needsChannelWarning ? `<span class="ml-2 text-amber-400 normal-case tracking-normal font-normal">· zum Posten erforderlich</span>` : ''}
                        </label>
                        <div class="rounded-xl transition-shadow ${needsChannelWarning ? 'ring-1 ring-amber-500/40' : ''}">
                          <div class="w-full">
                            <div class="relative">
                              <button type="button" id="rr-channel-trigger" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                                ${selectedChannel ? `
                                  <span class="min-w-0 truncate text-sm text-white font-medium flex items-center gap-1.5">
                                    <span class="text-neutral-400">#</span>${escapeHtml(selectedChannel.name)}
                                  </span>
                                ` : `
                                  <span class="min-w-0 truncate text-sm text-neutral-500">Wählen Sie einen Kanal…</span>
                                `}
                                <div class="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 ${channelDropdownOpen ? 'rotate-180' : ''}"><path d="m6 9 6 6 6-6"></path></svg>
                                </div>
                              </button>
                              <div id="rr-channel-menu" data-lenis-prevent="true" class="orbit-dropdown-menu ${channelDropdownOpen ? '' : 'hidden'} absolute left-0 right-0 top-11 z-[99999] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-1 max-h-52 overflow-y-auto overscroll-contain scrollbar-thin space-y-0.5">
                                ${allChannels.length === 0 ? `
                                  <div class="px-3 py-2 text-xs text-neutral-500">Keine Textkanäle verfügbar</div>
                                ` : allChannels.map(ch => {
                                  const isSel = String(ch.id) === String(draft.channel_id);
                                  return `
                                    <button type="button" data-rr-select-channel="${escapeHtml(ch.id)}" class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs text-left transition-colors ${isSel ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800/70'}">
                                      <span class="truncate"><span class="text-neutral-500 mr-1">#</span>${escapeHtml(ch.name)}</span>
                                      ${isSel ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-emerald-400 shrink-0"><path d="M20 6 9 17l-5-5"/></svg>` : ''}
                                    </button>
                                  `;
                                }).join('')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-neutral-800/40 border border-neutral-800">
                        <div class="min-w-0">
                          <p class="text-[12.5px] font-medium text-white">Beim Speichern auf Discord posten</p>
                          <p class="text-[11px] text-neutral-500 mt-0.5">${selectedChannel ? `Wird beim Speichern direkt in #${escapeHtml(selectedChannel.name)} gepostet.` : 'Wählen Sie oben einen Kanal zum Posten aus.'}</p>
                        </div>
                        <button type="button" id="rr-post-switch" class="w-10 h-5 rounded-full transition-[transform,background-color] duration-200 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 relative flex-shrink-0 ${draft.post_on_save ? 'bg-emerald-500' : 'bg-neutral-700'}">
                          <span class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ease-out ${draft.post_on_save ? 'left-[22px]' : 'left-0.5'}"></span>
                        </button>
                      </div>
                    </div>

                    <!-- 6. Rollen (0/25) -->
                    <div class="px-5 py-4 space-y-2.5">
                      <div class="flex items-center justify-between">
                        <p class="text-[11px] uppercase tracking-wider font-medium text-neutral-500">Rollen</p>
                        <span class="text-[10.5px] text-neutral-600 tabular-nums">${draft.components.length}/25</span>
                      </div>

                      <div class="space-y-2">
                        ${draft.components.map((comp, idx) => {
                          const r = getRoleById(comp.role_id);
                          const dot = getRoleDotColor(r);
                          const isRoleMenuOpen = openRoleDropdownIdx === idx;
                          const isEmojiOpen = openEmojiPickerIdx === idx;
                          return `
                            <div class="flex items-center gap-2 p-2 rounded-xl bg-neutral-800/50 border border-neutral-800">
                              <!-- Emoji Picker Button -->
                              <div class="relative flex-shrink-0">
                                <button type="button" data-rr-emoji-btn="${idx}" class="h-9 w-11 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-neutral-600 flex items-center justify-center text-base transition-colors" title="Emoji wählen">
                                  ${escapeHtml(comp.emoji || '✨')}
                                </button>
                                <div data-lenis-prevent="true" class="orbit-dropdown-menu ${isEmojiOpen ? '' : 'hidden'} absolute left-0 bottom-11 z-[99999] w-56 p-2 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl space-y-2">
                                  <div class="grid grid-cols-8 gap-1">
                                    ${QUICK_EMOJIS.map(em => `
                                      <button type="button" data-rr-pick-emoji="${idx}" data-emoji-val="${em}" class="h-6 w-6 rounded hover:bg-neutral-800 flex items-center justify-center text-sm">${em}</button>
                                    `).join('')}
                                  </div>
                                  <input type="text" data-rr-custom-emoji="${idx}" value="${escapeHtml(comp.emoji || '')}" placeholder="Eigenes Emoji eingeben…" class="w-full h-7 px-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none">
                                </div>
                              </div>

                              <!-- Custom Role Selector -->
                              <div class="relative flex-1 min-w-0">
                                <button type="button" data-rr-role-btn="${idx}" class="w-full h-9 px-3 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-neutral-600 flex items-center justify-between gap-2 text-xs text-left transition-colors">
                                  ${r ? `
                                    <span class="flex items-center gap-2 min-w-0 truncate text-white font-medium">
                                      <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${dot}"></span>
                                      <span class="truncate">${escapeHtml(r.name)}</span>
                                    </span>
                                  ` : `
                                    <span class="text-neutral-500 truncate">Rolle auswählen…</span>
                                  `}
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-400 shrink-0"><path d="m6 9 6 6 6-6"/></svg>
                                </button>
                                <div data-lenis-prevent="true" class="orbit-dropdown-menu ${isRoleMenuOpen ? '' : 'hidden'} absolute left-0 right-0 top-10 z-[99999] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-1 max-h-48 overflow-y-auto overscroll-contain scrollbar-thin space-y-0.5">
                                  ${allRoles.length === 0 ? `
                                    <div class="px-2.5 py-2 text-xs text-neutral-500">Keine Rollen verfügbar</div>
                                  ` : allRoles.map(roleItem => {
                                    const rSel = String(roleItem.id) === String(comp.role_id);
                                    const rDot = getRoleDotColor(roleItem);
                                    return `
                                      <button type="button" data-rr-select-role="${idx}" data-role-val="${escapeHtml(roleItem.id)}" class="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between gap-2 text-xs transition-colors ${rSel ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800/60'}">
                                        <span class="flex items-center gap-2 min-w-0 truncate">
                                          <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${rDot}"></span>
                                          <span class="truncate">${escapeHtml(roleItem.name)}</span>
                                        </span>
                                        ${rSel ? `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-emerald-400 shrink-0"><path d="M20 6 9 17l-5-5"/></svg>` : ''}
                                      </button>
                                    `;
                                  }).join('')}
                                </div>
                              </div>

                              <!-- Optional Label Input -->
                              <input type="text" data-rr-comp-label="${idx}" value="${escapeHtml(comp.label || '')}" placeholder="Beschriftung (optional)" class="hidden sm:block w-36 h-9 px-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500">

                              <!-- Delete Row -->
                              <button type="button" data-rr-del-comp="${idx}" class="h-9 w-9 rounded-lg flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0" title="Entfernen">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                              </button>
                            </div>
                          `;
                        }).join('')}

                        ${draft.components.length < 25 ? `
                          <button type="button" id="rr-add-role-btn" class="flex items-center justify-center gap-1.5 w-full h-10 border border-dashed border-neutral-700 rounded-xl text-xs text-neutral-400 hover:text-white hover:border-neutral-500 hover:bg-neutral-800/30 transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3.5 h-3.5"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>${draft.components.length === 0 ? 'Fügen Sie Ihre erste Rolle hinzu' : 'Rolle hinzufügen'}
                          </button>
                        ` : ''}
                      </div>
                    </div>
                  </div>

                  <!-- Right Column: Live Discord Preview -->
                  <div class="flex flex-col border-t lg:border-t-0 lg:border-l border-neutral-800/60 bg-neutral-900/40">
                    <div class="px-4 py-2.5 border-b border-neutral-800/60 flex items-center gap-2 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye w-3.5 h-3.5 text-neutral-500"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      <span class="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Vorschau</span>
                    </div>
                    <div id="rr-preview-container" class="flex-1 p-4 overflow-y-auto">
                      ${renderPreviewCardHtml()}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-neutral-800 flex-shrink-0">
                <button type="button" id="rr-modal-cancel" class="text-xs text-neutral-500 hover:text-white transition-[transform,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-md px-1">Stornieren</button>
                <div id="rr-footer-right" class="flex items-center gap-3">
                  ${renderFooterStatusAndBtnHtml()}
                </div>
              </div>
            </div>
          </div>
        `;

        // Bind events inside the modal
        const closeModal = () => { modalRoot.innerHTML = ''; };
        document.getElementById('rr-modal-close')?.addEventListener('click', closeModal);
        document.getElementById('rr-modal-cancel')?.addEventListener('click', closeModal);
        document.getElementById('rr-modal-backdrop')?.addEventListener('click', (e) => {
          if (e.target.id === 'rr-modal-backdrop') closeModal();
        });

        // Template pills
        modalRoot.querySelectorAll('[data-rr-tpl]').forEach(btn => {
          btn.addEventListener('click', () => {
            applyTemplate(btn.getAttribute('data-rr-tpl'));
          });
        });

        // Behavior mode selector
        modalRoot.querySelectorAll('[data-rr-mode]').forEach(btn => {
          btn.addEventListener('click', () => {
            draft.mode = btn.getAttribute('data-rr-mode') || 'multi';
            renderModal();
          });
        });

        // Live Title & Description inputs
        const titleInput = document.getElementById('rr-modal-title');
        const descInput = document.getElementById('rr-modal-desc');
        titleInput?.addEventListener('input', () => {
          draft.embed.title = titleInput.value;
          draft.name = titleInput.value || 'Role Selection';
          refreshLivePreviewAndFooter();
        });
        descInput?.addEventListener('input', () => {
          draft.embed.description = descInput.value;
          refreshLivePreviewAndFooter();
        });

        // Message builder toggle & options
        document.getElementById('rr-toggle-msg-builder')?.addEventListener('click', () => {
          messageBuilderExpanded = !messageBuilderExpanded;
          renderModal();
        });
        modalRoot.querySelectorAll('[data-rr-embed-col]').forEach(btn => {
          btn.addEventListener('click', () => {
            draft.embed.color = btn.getAttribute('data-rr-embed-col') || 'rgb(88, 101, 242)';
            renderModal();
          });
        });
        modalRoot.querySelectorAll('[data-rr-ptype]').forEach(btn => {
          btn.addEventListener('click', () => {
            draft.panel_type = btn.getAttribute('data-rr-ptype') || 'buttons';
            renderModal();
          });
        });

        // Channel dropdown
        document.getElementById('rr-channel-trigger')?.addEventListener('click', (e) => {
          e.stopPropagation();
          channelDropdownOpen = !channelDropdownOpen;
          openRoleDropdownIdx = null;
          openEmojiPickerIdx = null;
          renderModal();
        });
        modalRoot.querySelectorAll('[data-rr-select-channel]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            draft.channel_id = btn.getAttribute('data-rr-select-channel') || '';
            channelDropdownOpen = false;
            renderModal();
          });
        });

        // Post on save switch (in-place smooth transition)
        const postSwitch = document.getElementById('rr-post-switch');
        postSwitch?.addEventListener('click', () => {
          draft.post_on_save = !draft.post_on_save;
          postSwitch.classList.toggle('bg-emerald-500', draft.post_on_save);
          postSwitch.classList.toggle('bg-neutral-700', !draft.post_on_save);
          const thumb = postSwitch.querySelector('span');
          if (thumb) {
            thumb.classList.toggle('left-[22px]', draft.post_on_save);
            thumb.classList.toggle('left-0.5', !draft.post_on_save);
          }
          refreshLivePreviewAndFooter();
        });

        // Add Role button
        document.getElementById('rr-add-role-btn')?.addEventListener('click', () => {
          if (draft.components.length >= 25) return;
          const nextRole = allRoles[draft.components.length % Math.max(1, allRoles.length)];
          const nextEmoji = QUICK_EMOJIS[draft.components.length % QUICK_EMOJIS.length];
          draft.components.push({
            role_id: nextRole ? String(nextRole.id) : '',
            label: nextRole ? nextRole.name : '',
            emoji: nextEmoji,
            color: 'blue'
          });
          channelDropdownOpen = false;
          openRoleDropdownIdx = null;
          openEmojiPickerIdx = null;
          renderModal();
        });

        // Role rows bindings
        modalRoot.querySelectorAll('[data-rr-emoji-btn]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.getAttribute('data-rr-emoji-btn'), 10);
            openEmojiPickerIdx = openEmojiPickerIdx === idx ? null : idx;
            openRoleDropdownIdx = null;
            channelDropdownOpen = false;
            renderModal();
          });
        });
        modalRoot.querySelectorAll('[data-rr-pick-emoji]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.getAttribute('data-rr-pick-emoji'), 10);
            draft.components[idx].emoji = btn.getAttribute('data-emoji-val') || '✨';
            openEmojiPickerIdx = null;
            renderModal();
          });
        });
        modalRoot.querySelectorAll('[data-rr-custom-emoji]').forEach(inp => {
          inp.addEventListener('click', (e) => e.stopPropagation());
          inp.addEventListener('input', () => {
            const idx = parseInt(inp.getAttribute('data-rr-custom-emoji'), 10);
            draft.components[idx].emoji = inp.value || '✨';
            refreshLivePreviewAndFooter();
          });
        });

        modalRoot.querySelectorAll('[data-rr-role-btn]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.getAttribute('data-rr-role-btn'), 10);
            openRoleDropdownIdx = openRoleDropdownIdx === idx ? null : idx;
            openEmojiPickerIdx = null;
            channelDropdownOpen = false;
            renderModal();
          });
        });
        modalRoot.querySelectorAll('[data-rr-select-role]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.getAttribute('data-rr-select-role'), 10);
            const rid = btn.getAttribute('data-role-val') || '';
            draft.components[idx].role_id = rid;
            const r = getRoleById(rid);
            if (r) draft.components[idx].label = r.name;
            openRoleDropdownIdx = null;
            renderModal();
          });
        });

        modalRoot.querySelectorAll('[data-rr-comp-label]').forEach(inp => {
          inp.addEventListener('input', () => {
            const idx = parseInt(inp.getAttribute('data-rr-comp-label'), 10);
            draft.components[idx].label = inp.value;
            refreshLivePreviewAndFooter();
          });
        });

        modalRoot.querySelectorAll('[data-rr-del-comp]').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-rr-del-comp'), 10);
            draft.components.splice(idx, 1);
            renderModal();
          });
        });

        document.getElementById('rr-modal-submit')?.addEventListener('click', handleSubmit);
      };

      renderModal();
    };

    // Custom Rule Builder Modal
    const openCustomRuleModal = (existingRule = null) => {
      const modalRoot = document.getElementById('roles-modal-root');
      if (!modalRoot) return;

      const isEdit = Boolean(existingRule && existingRule.id);
      const draft = {
        id: existingRule?.id || `rule_${Date.now()}`,
        name: existingRule?.name || 'New Role Rule',
        enabled: existingRule?.enabled !== false,
        trigger: existingRule?.trigger || 'member_join',
        condition_role_id: existingRule?.condition_role_id || '',
        action: existingRule?.action || 'add_role',
        role_id: existingRule?.role_id || (allRoles[0] ? String(allRoles[0].id) : ''),
        dm_message: existingRule?.dm_message || 'Welcome to {server}, {user}!'
      };

      const TRIGGER_OPTIONS = [
        { value: 'member_join', label: 'Member joins the server' },
        { value: 'member_verify', label: 'Member completes verification' },
        { value: 'member_boost', label: 'Member boosts the server' },
        { value: 'message_sent', label: 'Member sends a message' },
        { value: 'reaction_add', label: 'Member reacts to a message' },
        { value: 'has_role', label: 'Member receives a specific role' }
      ];

      const ACTION_OPTIONS = [
        { value: 'add_role', label: 'Add Role' },
        { value: 'remove_role', label: 'Remove Role' },
        { value: 'send_dm', label: 'Send Direct Message (DM)' }
      ];

      const renderRuleModal = () => {
        const currentTriggerObj = TRIGGER_OPTIONS.find(t => t.value === draft.trigger) || TRIGGER_OPTIONS[0];
        const currentActionObj = ACTION_OPTIONS.find(a => a.value === draft.action) || ACTION_OPTIONS[0];
        const currentCondRole = allRoles.find(r => String(r.id) === String(draft.condition_role_id));
        const currentTargetRole = allRoles.find(r => String(r.id) === String(draft.role_id)) || allRoles[0];

        modalRoot.innerHTML = `
          <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div id="rule-modal-dialog" class="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md flex flex-col shadow-2xl">
              <div class="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-violet-400"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>
                  </div>
                  <h3 class="text-sm font-semibold text-white">${isEdit ? 'Edit Custom Rule' : 'Create Custom Rule'}</h3>
                </div>
                <button type="button" id="rule-modal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>

              <div class="p-5 space-y-4">
                <div>
                  <label class="block text-[11px] font-medium text-neutral-400 mb-1">Rule Name</label>
                  <input type="text" id="rule-modal-name" value="${escapeHtml(draft.name)}" placeholder="e.g. Promote on verification" class="w-full h-9 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white/40">
                </div>

                <!-- IF (Trigger) -->
                <div class="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-violet-400 block">IF (Trigger)</span>
                  <div class="relative" data-rule-dd-wrap="trigger">
                    <button type="button" id="rule-dd-trigger-btn" class="w-full h-9 px-3 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-xs text-white flex items-center justify-between gap-2 transition-colors cursor-pointer">
                      <span id="rule-dd-trigger-label" class="truncate">${escapeHtml(currentTriggerObj.label)}</span>
                      <svg class="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 transition-transform duration-150" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <div id="rule-dd-trigger-menu" data-lenis-prevent class="orbit-dropdown-menu hidden absolute left-0 right-0 top-full mt-1.5 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-1 z-40 max-h-56 overflow-y-auto">
                      ${TRIGGER_OPTIONS.map(t => `
                        <button type="button" data-rule-trigger-opt="${t.value}" class="w-full px-3 py-2 text-left text-xs ${draft.trigger === t.value ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800/70 hover:text-white'} flex items-center justify-between transition-colors">
                          <span>${escapeHtml(t.label)}</span>
                          ${draft.trigger === t.value ? '<svg class="w-3.5 h-3.5 text-violet-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <div id="rule-modal-cond-wrap" class="${draft.trigger === 'has_role' ? '' : 'hidden'} pt-1">
                    <label class="block text-[11px] text-neutral-400 mb-1">Required Condition Role</label>
                    <div class="relative" data-rule-dd-wrap="cond-role">
                      <button type="button" id="rule-dd-cond-role-btn" class="w-full h-9 px-3 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-xs text-white flex items-center justify-between gap-2 transition-colors cursor-pointer">
                        <span id="rule-dd-cond-role-label" class="flex items-center gap-2 min-w-0 truncate">
                          ${currentCondRole ? `<span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${escapeHtml(currentCondRole.color || '#99aab5')}"></span><span class="truncate">@${escapeHtml(currentCondRole.name)}</span>` : '<span class="text-neutral-400">Any role</span>'}
                        </span>
                        <svg class="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                      <div id="rule-dd-cond-role-menu" data-lenis-prevent class="orbit-dropdown-menu hidden absolute left-0 right-0 top-full mt-1.5 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-1 z-40 max-h-48 overflow-y-auto">
                        <button type="button" data-rule-cond-role-opt="" class="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">Any role</button>
                        ${allRoles.map(r => `
                          <button type="button" data-rule-cond-role-opt="${escapeHtml(r.id)}" class="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2 transition-colors">
                            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${escapeHtml(r.color || '#99aab5')}"></span>
                            <span class="truncate">@${escapeHtml(r.name)}</span>
                          </button>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- THEN (Action) -->
                <div class="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">THEN (Action)</span>
                  <div class="relative" data-rule-dd-wrap="action">
                    <button type="button" id="rule-dd-action-btn" class="w-full h-9 px-3 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-xs text-white flex items-center justify-between gap-2 transition-colors cursor-pointer">
                      <span id="rule-dd-action-label" class="truncate">${escapeHtml(currentActionObj.label)}</span>
                      <svg class="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <div id="rule-dd-action-menu" data-lenis-prevent class="orbit-dropdown-menu hidden absolute left-0 right-0 top-full mt-1.5 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-1 z-40">
                      ${ACTION_OPTIONS.map(a => `
                        <button type="button" data-rule-action-opt="${a.value}" class="w-full px-3 py-2 text-left text-xs ${draft.action === a.value ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800/70 hover:text-white'} flex items-center justify-between transition-colors">
                          <span>${escapeHtml(a.label)}</span>
                          ${draft.action === a.value ? '<svg class="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <div id="rule-modal-role-wrap" class="${draft.action === 'send_dm' ? 'hidden' : ''}">
                    <label class="block text-[11px] text-neutral-400 mb-1">Target Role</label>
                    <div class="relative" data-rule-dd-wrap="target-role">
                      <button type="button" id="rule-dd-target-role-btn" class="w-full h-9 px-3 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-xs text-white flex items-center justify-between gap-2 transition-colors cursor-pointer">
                        <span id="rule-dd-target-role-label" class="flex items-center gap-2 min-w-0 truncate">
                          ${currentTargetRole ? `<span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${escapeHtml(currentTargetRole.color || '#99aab5')}"></span><span class="truncate">@${escapeHtml(currentTargetRole.name)}</span>` : '<span class="text-neutral-400">Select role...</span>'}
                        </span>
                        <svg class="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                      <div id="rule-dd-target-role-menu" data-lenis-prevent class="orbit-dropdown-menu hidden absolute left-0 right-0 top-full mt-1.5 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-1 z-40 max-h-48 overflow-y-auto">
                        ${allRoles.map(r => `
                          <button type="button" data-rule-target-role-opt="${escapeHtml(r.id)}" class="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2 transition-colors">
                            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${escapeHtml(r.color || '#99aab5')}"></span>
                            <span class="truncate">@${escapeHtml(r.name)}</span>
                          </button>
                        `).join('')}
                      </div>
                    </div>
                  </div>

                  <div id="rule-modal-dm-wrap" class="${draft.action === 'send_dm' ? '' : 'hidden'}">
                    <label class="block text-[11px] text-neutral-400 mb-1">DM Message ({user}, {server}, {memberCount})</label>
                    <textarea id="rule-modal-dm" rows="2" class="w-full p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white">${escapeHtml(draft.dm_message)}</textarea>
                  </div>
                </div>
              </div>

              <div class="px-5 py-3.5 border-t border-neutral-800 flex items-center justify-end gap-2 bg-neutral-950/60 rounded-b-2xl">
                <button type="button" id="rule-modal-cancel" class="h-9 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300">Cancel</button>
                <button type="button" id="rule-modal-save" class="h-9 px-4 rounded-xl bg-white hover:bg-neutral-200 text-xs font-semibold text-black">Save Rule</button>
              </div>
            </div>
          </div>
        `;

        const closeRuleDropdowns = (exceptMenuId = null) => {
          ['rule-dd-trigger-menu', 'rule-dd-cond-role-menu', 'rule-dd-action-menu', 'rule-dd-target-role-menu'].forEach(mid => {
            if (mid !== exceptMenuId) {
              document.getElementById(mid)?.classList.add('hidden');
            }
          });
        };

        document.getElementById('rule-modal-dialog')?.addEventListener('click', (e) => {
          if (!e.target.closest('[data-rule-dd-wrap]')) {
            closeRuleDropdowns();
          }
        });

        // Trigger dropdown
        document.getElementById('rule-dd-trigger-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          const menu = document.getElementById('rule-dd-trigger-menu');
          closeRuleDropdowns('rule-dd-trigger-menu');
          menu?.classList.toggle('hidden');
        });
        modalRoot.querySelectorAll('[data-rule-trigger-opt]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            draft.name = document.getElementById('rule-modal-name')?.value ?? draft.name;
            draft.dm_message = document.getElementById('rule-modal-dm')?.value ?? draft.dm_message;
            draft.trigger = btn.getAttribute('data-rule-trigger-opt') || 'member_join';
            renderRuleModal();
          });
        });

        // Condition role dropdown
        document.getElementById('rule-dd-cond-role-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          const menu = document.getElementById('rule-dd-cond-role-menu');
          closeRuleDropdowns('rule-dd-cond-role-menu');
          menu?.classList.toggle('hidden');
        });
        modalRoot.querySelectorAll('[data-rule-cond-role-opt]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            draft.name = document.getElementById('rule-modal-name')?.value ?? draft.name;
            draft.dm_message = document.getElementById('rule-modal-dm')?.value ?? draft.dm_message;
            draft.condition_role_id = btn.getAttribute('data-rule-cond-role-opt') || '';
            renderRuleModal();
          });
        });

        // Action dropdown
        document.getElementById('rule-dd-action-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          const menu = document.getElementById('rule-dd-action-menu');
          closeRuleDropdowns('rule-dd-action-menu');
          menu?.classList.toggle('hidden');
        });
        modalRoot.querySelectorAll('[data-rule-action-opt]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            draft.name = document.getElementById('rule-modal-name')?.value ?? draft.name;
            draft.dm_message = document.getElementById('rule-modal-dm')?.value ?? draft.dm_message;
            draft.action = btn.getAttribute('data-rule-action-opt') || 'add_role';
            renderRuleModal();
          });
        });

        // Target role dropdown
        document.getElementById('rule-dd-target-role-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          const menu = document.getElementById('rule-dd-target-role-menu');
          closeRuleDropdowns('rule-dd-target-role-menu');
          menu?.classList.toggle('hidden');
        });
        modalRoot.querySelectorAll('[data-rule-target-role-opt]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            draft.name = document.getElementById('rule-modal-name')?.value ?? draft.name;
            draft.dm_message = document.getElementById('rule-modal-dm')?.value ?? draft.dm_message;
            draft.role_id = btn.getAttribute('data-rule-target-role-opt') || '';
            renderRuleModal();
          });
        });

        const closeRuleModal = () => { modalRoot.innerHTML = ''; };
        document.getElementById('rule-modal-close')?.addEventListener('click', closeRuleModal);
        document.getElementById('rule-modal-cancel')?.addEventListener('click', closeRuleModal);

        document.getElementById('rule-modal-save')?.addEventListener('click', () => {
          draft.name = document.getElementById('rule-modal-name')?.value?.trim() || 'Custom Rule';
          draft.dm_message = document.getElementById('rule-modal-dm')?.value ?? draft.dm_message;

          const existingIdx = state.customRules.findIndex(r => r.id === draft.id);
          if (existingIdx >= 0) {
            state.customRules[existingIdx] = draft;
          } else {
            state.customRules.push(draft);
          }

          closeRuleModal();
          renderCustomRules();
          saveRolesConfig(true);
        });
      };

      renderRuleModal();
    };

    // Mount & Bind Event Listeners
    renderMainShell();
    renderReactionPanelsGrid();
    renderAutoRoles();
    renderCustomRules();
    renderStickyRoles();
    renderBoosterRole();
    renderTenureRoles();
    renderActivityRoles();

    // Dropdown open/close management
    const closeAllMenus = (exceptId = null) => {
      ['autoroles-menu', 'sticky-roles-menu', 'booster-role-menu', 'tenure-role-menu', 'activity-role-menu'].forEach(id => {
        if (id !== exceptId) {
          document.getElementById(id)?.classList.add('hidden');
        }
      });
    };

    document.getElementById('autoroles-trigger')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.getElementById('autoroles-menu');
      const willOpen = menu?.classList.contains('hidden');
      closeAllMenus('autoroles-menu');
      if (menu) {
        menu.classList.toggle('hidden');
        if (willOpen) document.getElementById('autoroles-search')?.focus();
      }
    });

    document.getElementById('autoroles-search')?.addEventListener('click', (e) => e.stopPropagation());
    document.getElementById('autoroles-search')?.addEventListener('input', (e) => {
      renderAutoRoles(e.target.value);
    });

    document.getElementById('btn-open-rule-modal')?.addEventListener('click', () => {
      openCustomRuleModal(null);
    });

    // Sticky Roles switches & dropdown
    document.getElementById('sticky-enabled-switch')?.addEventListener('click', () => {
      state.stickyRoles.enabled = !state.stickyRoles.enabled;
      renderStickyRoles();
      saveRolesConfig();
    });

    document.getElementById('sticky-restore-all-switch')?.addEventListener('click', () => {
      state.stickyRoles.restore_all = !state.stickyRoles.restore_all;
      renderStickyRoles();
      saveRolesConfig();
    });

    document.getElementById('sticky-roles-trigger')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.getElementById('sticky-roles-menu');
      closeAllMenus('sticky-roles-menu');
      menu?.classList.toggle('hidden');
    });

    // Booster Role switch & dropdown
    document.getElementById('booster-enabled-switch')?.addEventListener('click', () => {
      state.boosterRole.enabled = !state.boosterRole.enabled;
      renderBoosterRole();
      saveRolesConfig();
    });

    document.getElementById('booster-role-trigger')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.getElementById('booster-role-menu');
      closeAllMenus('booster-role-menu');
      menu?.classList.toggle('hidden');
    });

    // Tenure Roles dropdown & add button
    document.getElementById('tenure-role-trigger')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.getElementById('tenure-role-menu');
      closeAllMenus('tenure-role-menu');
      menu?.classList.toggle('hidden');
    });

    document.getElementById('btn-add-tenure-role')?.addEventListener('click', () => {
      if (!state.pendingTenureRoleId) return;
      const daysVal = Math.max(1, Math.min(3650, parseInt(document.getElementById('tenure-days-input')?.value, 10) || 7));
      const existing = state.tenureRoles.find(t => String(t.role_id) === String(state.pendingTenureRoleId));
      if (existing) {
        existing.days = daysVal;
      } else {
        state.tenureRoles.push({ role_id: state.pendingTenureRoleId, days: daysVal });
      }
      state.pendingTenureRoleId = '';
      renderTenureRoles();
      saveRolesConfig();
    });

    // Activity Roles dropdown & add button
    document.getElementById('activity-role-trigger')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.getElementById('activity-role-menu');
      closeAllMenus('activity-role-menu');
      menu?.classList.toggle('hidden');
    });

    document.getElementById('btn-add-activity-role')?.addEventListener('click', () => {
      if (!state.pendingActivityRoleId) return;
      const daysVal = Math.max(1, Math.min(3650, parseInt(document.getElementById('activity-days-input')?.value, 10) || 7));
      const existing = state.activityRoles.find(a => String(a.role_id) === String(state.pendingActivityRoleId));
      if (existing) {
        existing.days = daysVal;
      } else {
        state.activityRoles.push({ role_id: state.pendingActivityRoleId, days: daysVal });
      }
      state.pendingActivityRoleId = '';
      renderActivityRoles();
      saveRolesConfig();
    });

    // Global click outside to close dropdown menus
    document.addEventListener('click', () => closeAllMenus(null));
  } catch (err) {
    if (typeof window.renderErrorState === 'function') {
      window.renderErrorState(container, {
        title: 'Rollenkonfiguration konnte nicht geladen werden',
        message: 'Beim Abrufen der Rollen vom Server ist ein Fehler aufgetreten. Bitte überprüfe deine Verbindung oder lade die Seite neu.',
        details: err?.message || String(err),
        statusCode: err?.status || (err?.message && err.message.includes('500') ? 500 : 404),
        onRetry: () => DashboardTabs.Roles(container, guildId),
        backUrl: `/dashboard/${guildId}`
      });
    } else {
      container.innerHTML = `<div class="p-8 text-red-400 text-center text-sm">Failed to load Roles configuration: ${err.message}</div>`;
    }
  }
};
