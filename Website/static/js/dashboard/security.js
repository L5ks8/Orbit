/**
 * Orbit Dashboard - Security & Anti-Raid Tab (/dashboard/:guildId/security)
 * 1:1 Pixel-Perfect Recreation of PeakBot Security System with Bot Enforcement
 */

DashboardTabs.Security = async function (container, guildId) {
  // 0ms Cache-First check
  const cachedCfg = API.getCache ? API.getCache(`config_${guildId}`) : null;
  if (!cachedCfg) {
    container.innerHTML = `
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="flex items-center gap-3 text-neutral-400">
          <svg class="animate-spin w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Loading Security Systems...</span>
        </div>
      </div>
    `;
  }

  // Inline SVG icons
  const SVGS = {
    shieldCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
    zap: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-red-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-orange-400"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`,
    userX: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-amber-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="13"></line><line x1="22" x2="17" y1="8" y2="13"></line></svg>`,
    webhook: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-cyan-400"><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"></path><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"></path><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"></path></svg>`,
    alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-amber-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m6 9 6 6 6-6"></path></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`
  };

  let rawConfig = {};
  let currentGuild = { id: guildId, name: 'Server' };
  let allChannels = [];
  let allRoles = [];

  try {
    const cfgRes = cachedCfg || await API.getConfig(guildId).catch(() => ({}));
    const configObj = (cfgRes && cfgRes.config) ? cfgRes.config : (cfgRes || {});
    rawConfig = configObj;
    if (cfgRes && cfgRes.security) {
      rawConfig.security = cfgRes.security;
    }
    if (cfgRes?.guild) {
      currentGuild = cfgRes.guild;
    } else if (window.__currentDashboardGuildObj) {
      currentGuild = window.__currentDashboardGuildObj;
    }

    const chList = Array.isArray(cfgRes?.channels) ? cfgRes.channels : [];
    const rList = Array.isArray(cfgRes?.roles) ? cfgRes.roles : [];
    allChannels = chList.filter(c => !c.type || c.type === 'text' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text')));
    allRoles = rList.filter(r => !r.managed && r.name !== '@everyone');
  } catch (err) {
    console.error('Failed to load security config:', err);
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12 select-none">
        <h2 class="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">Failed to load server security configuration</h2>
        <p class="text-sm font-semibold text-neutral-400 max-w-md mb-6">${escapeHtml(err.message || 'Unknown error occurred.')}</p>
        <button id="btn-retry-security" class="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-md">Retry</button>
      </div>
    `;
    const retryBtn = container.querySelector('#btn-retry-security');
    if (retryBtn) retryBtn.onclick = () => DashboardTabs.Security(container, guildId);
    return;
  }

  // State setup
  if (!rawConfig.security) rawConfig.security = {};
  const sec = rawConfig.security;

  // 1. Anti-Nuke defaults
  if (!sec.anti_nuke) sec.anti_nuke = {};
  const an = sec.anti_nuke;
  an.enabled = Boolean(an.enabled);
  an.level = an.level || 'recommended'; // conservative | recommended | aggressive
  an.test_mode = Boolean(an.test_mode);
  an.privilege_escalation = Boolean(an.privilege_escalation);
  an.webhook_firewall = Boolean(an.webhook_firewall);
  an.server_identity = Boolean(an.server_identity);
  an.block_unknown_bot = Boolean(an.block_unknown_bot);
  an.exempt_users = an.exempt_users || '';
  an.exempt_roles = Array.isArray(an.exempt_roles) ? an.exempt_roles.map(String) : [];
  an.permissions_granted_watch = Array.isArray(an.permissions_granted_watch) ? an.permissions_granted_watch : [];
  an.permissions_removed_watch = Array.isArray(an.permissions_removed_watch) ? an.permissions_removed_watch : [];
  an.mass_emoji_threshold = parseInt(an.mass_emoji_threshold || 3, 10);

  // 2. Anti-Raid defaults
  if (!sec.anti_raid) sec.anti_raid = {};
  const ar = sec.anti_raid;
  ar.enabled = Boolean(ar.enabled);
  ar.level = ar.level || 'balanced'; // lenient | balanced | strict
  ar.join_threshold = parseInt(ar.join_threshold || 10, 10);
  ar.join_time_window = parseInt(String(ar.join_time_window || 30).replace(/\D/g, '') || 30, 10);
  ar.young_account_cutoff = parseInt(String(ar.young_account_cutoff || 7).replace(/\D/g, '') || 7, 10);
  ar.action = ar.action || 'lockdown'; // lockdown | timeout | kick | ban
  ar.auto_unlock_after = parseInt(String(ar.auto_unlock_after || 60).replace(/\D/g, '') || 60, 10);
  ar.immune_users = ar.immune_users || '';
  ar.immune_roles = Array.isArray(ar.immune_roles) ? ar.immune_roles.map(String) : [];
  ar.verification_challenge = Boolean(ar.verification_challenge);
  ar.alert_channel = ar.alert_channel ? String(ar.alert_channel) : '';

  // 3. Suspicious Account (stored under anti_raid)
  ar.suspicious_account = Boolean(ar.suspicious_account);
  ar.suspicious_account_age = parseInt(String(ar.suspicious_account_age || 14).replace(/\D/g, '') || 14, 10);
  ar.no_profile_picture = Boolean(ar.no_profile_picture);
  ar.default_username = Boolean(ar.default_username);
  ar.suspicious_action = ar.suspicious_action || 'flag'; // flag | timeout | kick | ban
  ar.suspicious_alert_channel = ar.suspicious_alert_channel ? String(ar.suspicious_alert_channel) : '';

  // 4. Webhook Protection defaults
  if (!sec.webhook_protection) sec.webhook_protection = {};
  const wp = sec.webhook_protection;
  wp.enabled = Boolean(wp.enabled);
  wp.block_everyone = Boolean(wp.block_everyone);
  wp.block_invite_links = Boolean(wp.block_invite_links);
  wp.rate_limit = parseInt(wp.rate_limit || 5, 10);
  wp.action = wp.action || 'delete'; // delete | quarantine
  wp.trusted_webhooks = wp.trusted_webhooks || '';

  // 5. Threat Logs
  if (!Array.isArray(sec.threat_logs)) sec.threat_logs = [];

  let advancedDetectionOpen = false;
  let activeThreatFilter = 'all'; // all | raid | nuke | webhook
  let saveTimeout = null;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatRelativeTime(ts) {
    if (!ts) return 'just now';
    const seconds = Math.floor(Date.now() / 1000 - Number(ts));
    if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // Save security settings immediately or debounced
  let isSaving = false;
  async function performSave(showToast = true) {
    if (isSaving) return;
    isSaving = true;
    const saveBtn = container.querySelector('#btn-save-security');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `
        <svg class="animate-spin w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Saving...</span>
      `;
    }

    const payload = {
      anti_nuke: {
        enabled: Boolean(an.enabled),
        level: an.level || 'recommended',
        test_mode: Boolean(an.test_mode),
        privilege_escalation: Boolean(an.privilege_escalation),
        webhook_firewall: Boolean(an.webhook_firewall),
        server_identity: Boolean(an.server_identity),
        block_unknown_bot: Boolean(an.block_unknown_bot),
        exempt_users: an.exempt_users || '',
        exempt_roles: Array.isArray(an.exempt_roles) ? an.exempt_roles : [],
        permissions_granted_watch: Array.isArray(an.permissions_granted_watch) ? an.permissions_granted_watch : [],
        permissions_removed_watch: Array.isArray(an.permissions_removed_watch) ? an.permissions_removed_watch : [],
        mass_emoji_threshold: parseInt(an.mass_emoji_threshold || 3, 10)
      },
      anti_raid: {
        enabled: Boolean(ar.enabled),
        level: ar.level || 'balanced',
        join_threshold: parseInt(ar.join_threshold || 10, 10),
        join_time_window: `${parseInt(String(ar.join_time_window || 30).replace(/\\D/g, '') || 30, 10)}s`,
        young_account_cutoff: `${parseInt(String(ar.young_account_cutoff || 7).replace(/\\D/g, '') || 7, 10)}d`,
        action: ar.action || 'lockdown',
        auto_unlock_after: `${parseInt(String(ar.auto_unlock_after || 60).replace(/\\D/g, '') || 60, 10)}m`,
        immune_users: ar.immune_users || '',
        immune_roles: Array.isArray(ar.immune_roles) ? ar.immune_roles : [],
        verification_challenge: Boolean(ar.verification_challenge),
        alert_channel: ar.alert_channel || null,
        suspicious_account: Boolean(ar.suspicious_account),
        suspicious_account_age: `${parseInt(String(ar.suspicious_account_age || 14).replace(/\\D/g, '') || 14, 10)}d`,
        no_profile_picture: Boolean(ar.no_profile_picture),
        default_username: Boolean(ar.default_username),
        suspicious_action: ar.suspicious_action || 'flag',
        suspicious_alert_channel: ar.suspicious_alert_channel || null
      },
      webhook_protection: {
        enabled: Boolean(wp.enabled),
        block_everyone: Boolean(wp.block_everyone),
        block_invite_links: Boolean(wp.block_invite_links),
        rate_limit: parseInt(wp.rate_limit || 5, 10),
        action: wp.action || 'delete',
        trusted_webhooks: wp.trusted_webhooks || ''
      },
      threat_logs: Array.isArray(sec.threat_logs) ? sec.threat_logs : []
    };

    try {
      if (typeof API.saveSecurityConfig === 'function') {
        await API.saveSecurityConfig(guildId, payload);
      } else {
        await API.saveConfig(guildId, { security: payload });
      }
      if (showToast && window.Toast) {
        Toast.success('Security settings saved!');
      }
    } catch (err) {
      console.error('Failed to save security settings:', err);
      if (window.Toast) {
        Toast.error(err.message || 'Error saving security settings');
      }
    } finally {
      isSaving = false;
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          <span>Save Changes</span>
        `;
      }
    }
  }

  // Debounced auto-save
  function scheduleSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      performSave(true);
    }, 600);
  }

  // Custom Toggle Button Generator
  function renderToggle(id, isChecked, disabled = false) {
    return `
      <button 
        type="button" 
        role="switch" 
        id="${id}"
        aria-checked="${isChecked}" 
        ${disabled ? 'disabled' : ''}
        class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${isChecked ? 'bg-white' : 'bg-neutral-800 border border-neutral-700'}"
      >
        <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full transition-transform duration-200 ease-in-out ${isChecked ? 'translate-x-[21px] !bg-black' : 'translate-x-[3px] !bg-white'} shadow-sm"></span>
      </button>
    `;
  }

  // Custom Single Channel Dropdown
  function renderChannelDropdown(ddId, selectedId, placeholder = 'Select channel...') {
    const selectedCh = allChannels.find(c => String(c.id) === String(selectedId));
    const label = selectedCh ? `#${selectedCh.name}` : placeholder;
    const hasVal = Boolean(selectedCh);

    return `
      <div class="relative w-full custom-ch-dd" data-dd-id="${ddId}">
        <button 
          type="button" 
          id="${ddId}-trigger"
          class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer"
        >
          <span class="truncate text-sm ${hasVal ? 'text-white font-medium' : 'text-neutral-500'}">${escapeHtml(label)}</span>
          <div class="flex items-center gap-1 text-neutral-400">
            ${hasVal ? `
              <span role="button" data-clear-channel="${ddId}" class="p-1 -m-1 hover:text-white cursor-pointer" title="Clear selection">
                ${SVGS.x}
              </span>
            ` : ''}
            ${SVGS.chevronDown}
          </div>
        </button>

        <div 
          id="${ddId}-menu"
          class="orbit-dropdown-menu hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] overflow-hidden max-h-60 flex flex-col"
          data-lenis-prevent
        >
          <div class="p-2 border-b border-neutral-800 shrink-0">
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">${SVGS.search}</span>
              <input 
                type="text" 
                placeholder="Search channel..." 
                class="ch-search-inp w-full pl-8 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none" 
                autocomplete="off"
              />
            </div>
          </div>
          <div class="overflow-y-auto p-1 space-y-0.5 scrollbar-thin ch-options-list">
            <button 
              type="button" 
              data-pick-ch=""
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <span>None / Disabled</span>
              ${!hasVal ? `<span class="text-emerald-400">${SVGS.check}</span>` : ''}
            </button>
            ${allChannels.map(c => {
              const isSel = String(c.id) === String(selectedId);
              return `
                <button 
                  type="button" 
                  data-pick-ch="${c.id}"
                  class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${isSel ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}"
                >
                  <span class="truncate">#${escapeHtml(c.name)}</span>
                  ${isSel ? `<span class="text-emerald-400">${SVGS.check}</span>` : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Custom Multi-Role Dropdown
  function renderMultiRoleDropdown(ddId, selectedIds, placeholder = 'Add a trusted role...') {
    const selectedRoles = selectedIds.map(id => {
      const found = allRoles.find(r => String(r.id) === String(id));
      return {
        id: String(id),
        name: found ? found.name : `Role ${id}`,
        color: found && found.color && found.color !== 0 ? '#' + found.color.toString(16).padStart(6, '0') : null
      };
    });

    return `
      <div class="relative w-full custom-role-dd" data-dd-id="${ddId}">
        <button 
          type="button" 
          id="${ddId}-trigger"
          class="w-full flex items-center justify-between gap-2 min-h-[42px] px-3 py-1.5 bg-neutral-800 border rounded-xl text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer"
        >
          <div class="flex-1 flex flex-wrap gap-1.5 py-0.5">
            ${selectedRoles.map(r => `
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200">
                <span class="text-neutral-500">@</span>
                ${r.color ? `<span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${r.color}"></span>` : ''}
                <span class="truncate max-w-[120px]">${escapeHtml(r.name)}</span>
                <span class="remove-role-chip text-neutral-400 hover:text-rose-400 p-0.5 cursor-pointer" data-role-id="${r.id}">${SVGS.x}</span>
              </span>
            `).join('')}
            ${selectedRoles.length === 0 ? `<span class="text-neutral-500 text-sm py-0.5">${escapeHtml(placeholder)}</span>` : ''}
          </div>
          <div class="flex items-center gap-1 text-neutral-400 flex-shrink-0">
            ${SVGS.chevronDown}
          </div>
        </button>

        <div 
          id="${ddId}-menu"
          class="orbit-dropdown-menu hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] overflow-hidden max-h-60 flex flex-col"
          data-lenis-prevent
        >
          <div class="p-2 border-b border-neutral-800 shrink-0">
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">${SVGS.search}</span>
              <input 
                type="text" 
                placeholder="Search roles..." 
                class="role-search-inp w-full pl-8 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none" 
                autocomplete="off"
              />
            </div>
          </div>
          <div class="overflow-y-auto p-1 space-y-0.5 scrollbar-thin role-options-list">
            ${allRoles.map(r => {
              const isSel = selectedIds.includes(String(r.id));
              const rColor = r.color && r.color !== 0 ? '#' + r.color.toString(16).padStart(6, '0') : null;
              return `
                <button 
                  type="button" 
                  data-toggle-role="${r.id}"
                  class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${isSel ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}"
                >
                  <span class="flex items-center gap-2 truncate">
                    <span class="text-neutral-500">@</span>
                    ${rColor ? `<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${rColor}"></span>` : ''}
                    <span class="truncate">${escapeHtml(r.name)}</span>
                  </span>
                  ${isSel ? `<span class="text-emerald-400 shrink-0">${SVGS.check}</span>` : ''}
                </button>
              `;
            }).join('')}
            ${allRoles.length === 0 ? `<div class="p-3 text-xs text-neutral-500 text-center">No roles available</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Custom Action Dropdown (Max Action / Suspicious Action)
  function renderActionDropdown(ddId, currentVal, options) {
    const found = options.find(o => o.value === currentVal) || options[0] || { label: currentVal, value: currentVal };

    return `
      <div class="relative w-full custom-action-dd" data-dd-id="${ddId}">
        <button 
          type="button" 
          id="${ddId}-trigger"
          class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer"
        >
          <span class="truncate text-sm text-white font-medium">${escapeHtml(found.label)}</span>
          <div class="flex items-center gap-1 text-neutral-400">
            ${SVGS.chevronDown}
          </div>
        </button>

        <div 
          id="${ddId}-menu"
          class="orbit-dropdown-menu hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] overflow-hidden p-1 space-y-0.5"
          data-lenis-prevent
        >
          ${options.map(opt => {
            const isSel = opt.value === currentVal;
            return `
              <button 
                type="button" 
                data-pick-action="${opt.value}"
                class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${isSel ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}"
              >
                <span>${escapeHtml(opt.label)}</span>
                ${isSel ? `<span class="text-emerald-400">${SVGS.check}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderThreatLogsHtml() {
    let logs = sec.threat_logs || [];
    if (activeThreatFilter === 'raid') {
      logs = logs.filter(l => (l.type || '').toLowerCase().includes('raid'));
    } else if (activeThreatFilter === 'nuke') {
      logs = logs.filter(l => (l.type || '').toLowerCase().includes('nuke'));
    } else if (activeThreatFilter === 'webhook') {
      logs = logs.filter(l => (l.type || '').toLowerCase().includes('webhook'));
    }

    if (logs.length === 0) {
      return `
        <div class="relative bg-neutral-900 rounded-2xl border border-neutral-800">
          <div class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle w-10 h-10 text-neutral-700 mx-auto mb-3"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
            <p class="text-neutral-400 text-sm font-medium">No threats detected</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60 max-h-96 overflow-y-auto scrollbar-thin">
        ${logs.map(log => {
          const lType = (log.type || 'threat').toLowerCase();
          let badge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
          if (lType.includes('nuke')) badge = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
          else if (lType.includes('raid')) badge = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
          else if (lType.includes('webhook')) badge = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';

          return `
            <div class="flex items-start justify-between gap-4 px-4 py-3 hover:bg-neutral-800/30 transition-colors">
              <div class="flex items-start gap-3 min-w-0">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 mt-0.5 ${badge}">
                  ${escapeHtml(lType)}
                </span>
                <p class="text-xs text-neutral-200 leading-relaxed break-words">${escapeHtml(log.message || 'Security alert triggered')}</p>
              </div>
              <span class="text-[11px] text-neutral-500 shrink-0 tabular-nums">${formatRelativeTime(log.timestamp)}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function render() {
    container.innerHTML = `
      <div class="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto space-y-6">
        <!-- Feature Header -->
        <div data-tour="feature-header" class="scroll-mt-24">
          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                ${SVGS.shieldCheck}
              </span>
              <h1 class="text-base font-medium text-white truncate">Security</h1>
            </div>
            
          </div>
        </div>

        <div class="space-y-4">
          <!-- CARD 1: Anti-Nuke Protection -->
          <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
            <div class="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none" id="an-header-row">
              <div class="flex items-center gap-3 min-w-0">
                <div class="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-red-500/10">
                  ${SVGS.zap}
                </div>
                <span class="text-sm font-semibold text-white truncate">Anti-Nuke Protection</span>
              </div>
              <div class="shrink-0" onclick="event.stopPropagation()">
                ${renderToggle('an-toggle-master', an.enabled)}
              </div>
            </div>

            <div class="${an.enabled ? 'block' : 'hidden'} px-5 pb-5 pt-4 border-t border-neutral-800 transition-all duration-200">
              <!-- Preset Modes -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  type="button" 
                  data-an-preset="conservative"
                  class="relative px-4 py-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${an.level === 'conservative' ? 'bg-neutral-800 border-neutral-500 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/80'}"
                >
                  <div class="flex items-center justify-between gap-2 mb-1.5">
                    <span class="text-[13px] font-semibold">Conservative</span>
                  </div>
                  <div class="text-[11px] text-neutral-300 mb-2 font-medium">Strip roles → kick</div>
                  <div class="text-[11px] text-neutral-500 leading-snug">Soft, reversible. Best for established servers where mistakes cost more than missed nukes.</div>
                </button>

                <button 
                  type="button" 
                  data-an-preset="recommended"
                  class="relative px-4 py-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${an.level === 'recommended' ? 'bg-neutral-800 border-neutral-500 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/80'}"
                >
                  <div class="flex items-center justify-between gap-2 mb-1.5">
                    <span class="text-[13px] font-semibold">Recommended</span>
                  </div>
                  <div class="text-[11px] text-neutral-300 mb-2 font-medium">Strip roles → ban</div>
                  <div class="text-[11px] text-neutral-500 leading-snug">Balanced. Multi-signal required before banning. Right for almost every server.</div>
                </button>

                <button 
                  type="button" 
                  data-an-preset="aggressive"
                  class="relative px-4 py-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${an.level === 'aggressive' ? 'bg-neutral-800 border-neutral-500 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/80'}"
                >
                  <div class="flex items-center justify-between gap-2 mb-1.5">
                    <span class="text-[13px] font-semibold">Aggressive</span>
                  </div>
                  <div class="text-[11px] text-neutral-300 mb-2 font-medium">Kick → ban</div>
                  <div class="text-[11px] text-neutral-500 leading-snug">Single signal acts. Highest catch rate, more chance of false positives. High-value servers only.</div>
                </button>
              </div>

              <!-- Test Mode -->
              <div class="mt-5 flex items-center justify-between gap-4 py-3.5 border-t border-neutral-800/70">
                <p class="text-sm font-medium text-white">Test mode</p>
                <div class="flex items-center gap-3">
                  ${renderToggle('an-toggle-testmode', an.test_mode)}
                </div>
              </div>

              <!-- Sub-Toggles -->
              <div class="divide-y divide-neutral-800/70 border-y border-neutral-800/70">
                <div class="flex items-center justify-between gap-4 py-3.5">
                  <p class="text-sm font-medium text-white">Privilege escalation</p>
                  <div class="flex items-center gap-3">
                    ${renderToggle('an-toggle-privilege', an.privilege_escalation)}
                  </div>
                </div>

                <div class="flex items-center justify-between gap-4 py-3.5">
                  <p class="text-sm font-medium text-white">Webhook firewall</p>
                  <div class="flex items-center gap-3">
                    ${renderToggle('an-toggle-webhookfw', an.webhook_firewall)}
                  </div>
                </div>

                <div class="flex items-center justify-between gap-4 py-3.5">
                  <p class="text-sm font-medium text-white">Server identity protection</p>
                  <div class="flex items-center gap-3">
                    ${renderToggle('an-toggle-identity', an.server_identity)}
                  </div>
                </div>

                <div class="flex items-center justify-between gap-4 py-3.5">
                  <p class="text-sm font-medium text-white">Block unknown bot joins</p>
                  <div class="flex items-center gap-3">
                    ${renderToggle('an-toggle-blockbot', an.block_unknown_bot)}
                  </div>
                </div>
              </div>

              <!-- Trusted Users & Roles -->
              <div class="mt-5">
                <p class="text-sm font-medium text-white mb-3">Trusted users and roles</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="text-[11px] text-neutral-500 block mb-1.5">User IDs (exempt)</label>
                    <div class="flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl">
                      <input 
                        id="an-users-inp" 
                        placeholder="Add user IDs separated by commas..." 
                        autocomplete="off" 
                        class="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none py-0.5" 
                        value="${escapeHtml(an.exempt_users)}"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="text-[11px] text-neutral-500 block mb-1.5">Roles (exempt)</label>
                    ${renderMultiRoleDropdown('an-roles-dd', an.exempt_roles, 'Add a trusted role…')}
                  </div>
                </div>
              </div>

              <!-- Collapsible Advanced Settings -->
              <div class="mt-5 border-t border-neutral-800/70 pt-4">
                <button 
                  type="button" 
                  id="an-advanced-accordion-btn"
                  class="flex items-center justify-between gap-3 w-full text-left group transition-all duration-150 cursor-pointer rounded-lg py-1"
                >
                  <p class="text-sm font-medium text-white">Advanced detection settings</p>
                  <span class="text-neutral-500 transform transition-transform duration-200 ${advancedDetectionOpen ? 'rotate-180' : ''}">
                    ${SVGS.chevronDown}
                  </span>
                </button>

                <div class="${advancedDetectionOpen ? 'block' : 'hidden'} mt-4 space-y-4">
                  <div class="max-w-xs">
                    <label class="text-[11px] text-neutral-500 block mb-1.5">Mass-emoji-delete threshold</label>
                    <div class="flex items-center gap-2">
                      <input 
                        id="an-emoji-threshold-inp" 
                        type="number" 
                        min="2" 
                        max="50" 
                        value="${an.mass_emoji_threshold}" 
                        class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 outline-none focus:border-neutral-500"
                      />
                      <span class="text-xs text-neutral-500 flex-shrink-0">emojis / 30s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CARD 2: Anti-Raid System -->
          <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
            <div class="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none" id="ar-header-row">
              <div class="flex items-center gap-3 min-w-0">
                <div class="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-orange-500/10">
                  ${SVGS.shield}
                </div>
                <span class="text-sm font-semibold text-white truncate">Anti-Raid System</span>
              </div>
              <div class="shrink-0" onclick="event.stopPropagation()">
                ${renderToggle('ar-toggle-master', ar.enabled)}
              </div>
            </div>

            <div class="${ar.enabled ? 'block' : 'hidden'} px-5 pb-5 pt-4 border-t border-neutral-800 transition-all duration-200">
              <!-- Detection Sensitivity -->
              <div class="mb-4">
                <label class="text-[11px] text-neutral-500 block mb-1.5">Detection Sensitivity</label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    type="button" 
                    data-ar-sensitivity="lenient"
                    class="px-4 py-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${ar.level === 'lenient' ? 'bg-neutral-800 border-neutral-600 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}"
                  >
                    <div class="text-[13px] font-semibold">Lenient</div>
                    <div class="text-[11px] text-neutral-500 mt-1 leading-snug">Only confirmed coordinated raids</div>
                  </button>

                  <button 
                    type="button" 
                    data-ar-sensitivity="balanced"
                    class="px-4 py-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${ar.level === 'balanced' ? 'bg-neutral-800 border-neutral-600 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}"
                  >
                    <div class="text-[13px] font-semibold">Balanced</div>
                    <div class="text-[11px] text-neutral-500 mt-1 leading-snug">Moderate — recommended default</div>
                  </button>

                  <button 
                    type="button" 
                    data-ar-sensitivity="strict"
                    class="px-4 py-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${ar.level === 'strict' ? 'bg-neutral-800 border-neutral-600 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}"
                  >
                    <div class="text-[13px] font-semibold">Strict</div>
                    <div class="text-[11px] text-neutral-500 mt-1 leading-snug">Aggressive — more false positives</div>
                  </button>
                </div>
              </div>

              <!-- 3 Numeric Limits -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="text-[11px] text-neutral-500 block mb-1.5">Join limit</label>
                  <div class="flex items-center gap-2">
                    <input 
                      id="ar-join-limit-inp" 
                      type="number" 
                      min="3" 
                      max="50" 
                      value="${ar.join_threshold}" 
                      class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 outline-none focus:border-neutral-500"
                    />
                    <span class="text-xs text-neutral-500 flex-shrink-0">joins</span>
                  </div>
                </div>

                <div>
                  <label class="text-[11px] text-neutral-500 block mb-1.5">Time window</label>
                  <div class="flex items-center gap-2">
                    <input 
                      id="ar-time-window-inp" 
                      type="number" 
                      min="10" 
                      max="300" 
                      value="${ar.join_time_window}" 
                      class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 outline-none focus:border-neutral-500"
                    />
                    <span class="text-xs text-neutral-500 flex-shrink-0">sec</span>
                  </div>
                </div>

                <div>
                  <label class="text-[11px] text-neutral-500 block mb-1.5">Young-account cutoff</label>
                  <div class="flex items-center gap-2">
                    <input 
                      id="ar-young-cutoff-inp" 
                      type="number" 
                      min="0" 
                      max="365" 
                      value="${ar.young_account_cutoff}" 
                      class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 outline-none focus:border-neutral-500"
                    />
                    <span class="text-xs text-neutral-500 flex-shrink-0">days</span>
                  </div>
                </div>
              </div>

              <!-- Action & Auto-unlock -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label class="text-[11px] text-neutral-500 block mb-1.5">Max Action (ceiling)</label>
                  ${renderActionDropdown('ar-action-dd', ar.action, [
                    { label: 'Lockdown (Server lock)', value: 'lockdown' },
                    { label: 'Timeout (1 hour)', value: 'timeout' },
                    { label: 'Kick (Kicked from server)', value: 'kick' },
                    { label: 'Ban (Banned from server)', value: 'ban' }
                  ])}
                </div>

                <div>
                  <label class="text-[11px] text-neutral-500 block mb-1.5">Auto-unlock after</label>
                  <div class="flex items-center gap-2">
                    <input 
                      id="ar-autounlock-inp" 
                      type="number" 
                      min="1" 
                      max="1440" 
                      value="${ar.auto_unlock_after}" 
                      class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 outline-none focus:border-neutral-500"
                    />
                    <span class="text-xs text-neutral-500 flex-shrink-0">min</span>
                  </div>
                </div>
              </div>

              <!-- Advanced Settings -->
              <div class="border-t border-neutral-800 mt-5 pt-4">
                <h4 class="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Advanced</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="text-[11px] text-neutral-500 block mb-1.5">Trusted Users (immune)</label>
                    <div class="flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl">
                      <input 
                        id="ar-immune-users-inp" 
                        placeholder="Add user IDs..." 
                        autocomplete="off" 
                        class="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none py-0.5" 
                        value="${escapeHtml(ar.immune_users)}"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="text-[11px] text-neutral-500 block mb-1.5">Trusted Roles (immune)</label>
                    ${renderMultiRoleDropdown('ar-immune-roles-dd', ar.immune_roles, 'Add a trusted role...')}
                  </div>
                </div>

                <div class="mt-4 flex items-center justify-between gap-4">
                  <span class="text-sm font-medium text-white">Verification Challenge</span>
                  <div class="flex items-center gap-3">
                    ${renderToggle('ar-toggle-verifychallenge', ar.verification_challenge)}
                  </div>
                </div>

                <div class="mt-4">
                  <label class="text-[11px] text-neutral-500 block mb-1.5">Raid Alert Channel (optional)</label>
                  ${renderChannelDropdown('ar-alert-channel-dd', ar.alert_channel, 'Defaults to log channel')}
                </div>
              </div>
            </div>
          </div>

          <!-- CARD 3: Suspicious Account Detection -->
          <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
            <div class="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none" id="sa-header-row">
              <div class="flex items-center gap-3 min-w-0">
                <div class="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-amber-500/10">
                  ${SVGS.userX}
                </div>
                <span class="text-sm font-semibold text-white truncate">Suspicious Account Detection</span>
              </div>
              <div class="shrink-0" onclick="event.stopPropagation()">
                ${renderToggle('sa-toggle-master', ar.suspicious_account)}
              </div>
            </div>

            <div class="${ar.suspicious_account ? 'block' : 'hidden'} px-5 pb-5 pt-4 border-t border-neutral-800 transition-all duration-200">
              <!-- Criteria -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="text-[11px] text-neutral-500 block mb-1.5">Account age</label>
                  <div class="flex items-center gap-2">
                    <input 
                      id="sa-age-inp" 
                      type="number" 
                      min="0" 
                      max="365" 
                      value="${ar.suspicious_account_age}" 
                      class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 outline-none focus:border-neutral-500"
                    />
                    <span class="text-xs text-neutral-500 flex-shrink-0">days</span>
                  </div>
                </div>

                <div>
                  <label class="text-[11px] text-neutral-500 block mb-1.5">No profile picture</label>
                  <div class="flex items-center gap-3 pt-1">
                    ${renderToggle('sa-toggle-noavatar', ar.no_profile_picture)}
                  </div>
                </div>

                <div>
                  <label class="text-[11px] text-neutral-500 block mb-1.5">Default username</label>
                  <div class="flex items-center gap-3 pt-1">
                    ${renderToggle('sa-toggle-defuser', ar.default_username)}
                  </div>
                </div>
              </div>

              <!-- Action & Channel -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label class="text-[11px] text-neutral-500 block mb-1.5">Action</label>
                  ${renderActionDropdown('sa-action-dd', ar.suspicious_action, [
                    { label: 'Flag only (Alert)', value: 'flag' },
                    { label: 'Timeout (1 hour)', value: 'timeout' },
                    { label: 'Kick from server', value: 'kick' },
                    { label: 'Ban from server', value: 'ban' }
                  ])}
                </div>

                <div>
                  <label class="text-[11px] text-neutral-500 block mb-1.5">Alert channel</label>
                  ${renderChannelDropdown('sa-alert-channel-dd', ar.suspicious_alert_channel, 'Select channel...')}
                </div>
              </div>
            </div>
          </div>

          <!-- CARD 4: Webhook & App Protection -->
          <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
            <div class="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none" id="wp-header-row">
              <div class="flex items-center gap-3 min-w-0">
                <div class="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-cyan-500/10">
                  ${SVGS.webhook}
                </div>
                <span class="text-sm font-semibold text-white truncate">Webhook & App Protection</span>
              </div>
              <div class="shrink-0" onclick="event.stopPropagation()">
                ${renderToggle('wp-toggle-master', wp.enabled)}
              </div>
            </div>

            <div class="${wp.enabled ? 'block' : 'hidden'} px-5 pb-5 pt-4 border-t border-neutral-800 transition-all duration-200">
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="flex items-center justify-between gap-3 px-4 py-3 bg-neutral-800/50 rounded-xl">
                    <p class="text-sm font-medium text-white">Block @everyone from webhooks</p>
                    <div class="flex items-center gap-3">
                      ${renderToggle('wp-toggle-everyone', wp.block_everyone)}
                    </div>
                  </div>

                  <div class="flex items-center justify-between gap-3 px-4 py-3 bg-neutral-800/50 rounded-xl">
                    <p class="text-sm font-medium text-white">Block invite links from webhooks</p>
                    <div class="flex items-center gap-3">
                      ${renderToggle('wp-toggle-invites', wp.block_invite_links)}
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="text-[11px] text-neutral-500 block mb-1.5">Rate limit (messages/min)</label>
                    <div class="flex items-center gap-2">
                      <input 
                        id="wp-ratelimit-inp" 
                        type="number" 
                        min="1" 
                        max="30" 
                        value="${wp.rate_limit}" 
                        class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 outline-none focus:border-neutral-500"
                      />
                      <span class="text-xs text-neutral-500 flex-shrink-0">msg/min</span>
                    </div>
                  </div>

                  <div>
                    <label class="text-[11px] text-neutral-500 block mb-1.5">Action when triggered</label>
                    ${renderActionDropdown('wp-action-dd', wp.action, [
                      { label: 'Delete messages', value: 'delete' },
                      { label: 'Delete webhook', value: 'quarantine' },
                      { label: 'Timeout creator (1h)', value: 'timeout' },
                      { label: 'Kick creator', value: 'kick' },
                      { label: 'Ban creator', value: 'ban' }
                    ])}
                  </div>
                </div>

                <div>
                  <label class="text-[11px] text-neutral-500 block mb-1.5">Whitelisted webhook/app IDs</label>
                  <div class="flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl">
                    <input 
                      id="wp-trusted-inp" 
                      placeholder="Add trusted webhook or app IDs..." 
                      autocomplete="off" 
                      class="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none py-0.5" 
                      value="${escapeHtml(wp.trusted_webhooks)}"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 5: Threat Log -->
        <div class="mt-8 pt-6 border-t border-neutral-800">
          <div class="flex items-center justify-between gap-4 mb-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 shrink-0">
                ${SVGS.alertTriangle}
              </div>
              <h3 class="text-sm font-semibold text-white">Threat Log</h3>
            </div>

            ${sec.threat_logs && sec.threat_logs.length > 0 ? `
              <button 
                type="button" 
                id="threat-clear-btn" 
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                ${SVGS.trash}
                Clear Log
              </button>
            ` : ''}
          </div>

          <div class="space-y-4">
            <!-- Filter Tabs -->
            <div class="flex gap-0.5 p-1 rounded-xl bg-neutral-800/50 border border-neutral-800 w-fit">
              <button 
                type="button" 
                data-threat-tab="all" 
                class="relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${activeThreatFilter === 'all' ? 'bg-white text-black font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'}"
              >
                All
              </button>
              <button 
                type="button" 
                data-threat-tab="raid" 
                class="relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${activeThreatFilter === 'raid' ? 'bg-white text-black font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'}"
              >
                Raids
              </button>
              <button 
                type="button" 
                data-threat-tab="nuke" 
                class="relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${activeThreatFilter === 'nuke' ? 'bg-white text-black font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'}"
              >
                Nuke Events
              </button>
              <button 
                type="button" 
                data-threat-tab="webhook" 
                class="relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${activeThreatFilter === 'webhook' ? 'bg-white text-black font-semibold shadow-sm' : 'text-neutral-400 hover:text-white'}"
              >
                Webhooks
              </button>
            </div>

            <!-- Threat List / Empty State -->
            <div id="threat-log-container">
              ${renderThreatLogsHtml()}
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function closeAllDropdowns() {
    container.querySelectorAll('.orbit-dropdown-menu').forEach(m => m.classList.add('hidden'));
  }

  function bindEvents() {
    // 0. Manual Save Changes Button
    const saveBtn = container.querySelector('#btn-save-security');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        performSave(true);
      });
    }

    // 1. Master Toggles
    const anMaster = document.getElementById('an-toggle-master');
    if (anMaster) {
      anMaster.addEventListener('click', (e) => {
        e.stopPropagation();
        an.enabled = !an.enabled;
        scheduleSave();
        render();
      });
    }

    const arMaster = document.getElementById('ar-toggle-master');
    if (arMaster) {
      arMaster.addEventListener('click', (e) => {
        e.stopPropagation();
        ar.enabled = !ar.enabled;
        scheduleSave();
        render();
      });
    }

    const saMaster = document.getElementById('sa-toggle-master');
    if (saMaster) {
      saMaster.addEventListener('click', (e) => {
        e.stopPropagation();
        ar.suspicious_account = !ar.suspicious_account;
        scheduleSave();
        render();
      });
    }

    const wpMaster = document.getElementById('wp-toggle-master');
    if (wpMaster) {
      wpMaster.addEventListener('click', (e) => {
        e.stopPropagation();
        wp.enabled = !wp.enabled;
        scheduleSave();
        render();
      });
    }

    // 2. Anti-Nuke Presets
    container.querySelectorAll('[data-an-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lvl = btn.getAttribute('data-an-preset');
        if (an.level === lvl) return;
        an.level = lvl;
        scheduleSave();
        render();
      });
    });

    // 3. Anti-Nuke Sub-Toggles
    const bindToggle = (id, obj, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        obj[key] = !obj[key];
        scheduleSave();
        render();
      });
    };

    bindToggle('an-toggle-testmode', an, 'test_mode');
    bindToggle('an-toggle-privilege', an, 'privilege_escalation');
    bindToggle('an-toggle-webhookfw', an, 'webhook_firewall');
    bindToggle('an-toggle-identity', an, 'server_identity');
    bindToggle('an-toggle-blockbot', an, 'block_unknown_bot');

    // 4. Anti-Nuke Inputs
    document.getElementById('an-users-inp')?.addEventListener('input', (e) => {
      an.exempt_users = e.target.value;
      scheduleSave();
    });

    document.getElementById('an-emoji-threshold-inp')?.addEventListener('input', (e) => {
      an.mass_emoji_threshold = parseInt(e.target.value || 3, 10);
      scheduleSave();
    });

    // Advanced Detection Accordion
    document.getElementById('an-advanced-accordion-btn')?.addEventListener('click', () => {
      advancedDetectionOpen = !advancedDetectionOpen;
      render();
    });

    // 5. Anti-Raid Sensitivity Presets
    container.querySelectorAll('[data-ar-sensitivity]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sens = btn.getAttribute('data-ar-sensitivity');
        if (ar.level === sens) return;
        ar.level = sens;
        if (sens === 'lenient') {
          ar.join_threshold = 15;
          ar.join_time_window = 30;
        } else if (sens === 'balanced') {
          ar.join_threshold = 10;
          ar.join_time_window = 30;
        } else if (sens === 'strict') {
          ar.join_threshold = 5;
          ar.join_time_window = 20;
        }
        scheduleSave();
        render();
      });
    });

    // 6. Anti-Raid Numeric Limits
    document.getElementById('ar-join-limit-inp')?.addEventListener('input', (e) => {
      ar.join_threshold = Math.max(3, parseInt(e.target.value || 10, 10));
      scheduleSave();
    });

    document.getElementById('ar-time-window-inp')?.addEventListener('input', (e) => {
      ar.join_time_window = Math.max(10, parseInt(e.target.value || 30, 10));
      scheduleSave();
    });

    document.getElementById('ar-young-cutoff-inp')?.addEventListener('input', (e) => {
      ar.young_account_cutoff = Math.max(0, parseInt(e.target.value || 7, 10));
      scheduleSave();
    });

    document.getElementById('ar-autounlock-inp')?.addEventListener('input', (e) => {
      ar.auto_unlock_after = Math.max(1, parseInt(e.target.value || 60, 10));
      scheduleSave();
    });

    document.getElementById('ar-immune-users-inp')?.addEventListener('input', (e) => {
      ar.immune_users = e.target.value;
      scheduleSave();
    });

    bindToggle('ar-toggle-verifychallenge', ar, 'verification_challenge');

    // 7. Suspicious Account Controls
    document.getElementById('sa-age-inp')?.addEventListener('input', (e) => {
      ar.suspicious_account_age = Math.max(0, parseInt(e.target.value || 14, 10));
      scheduleSave();
    });

    bindToggle('sa-toggle-noavatar', ar, 'no_profile_picture');
    bindToggle('sa-toggle-defuser', ar, 'default_username');

    // 8. Webhook Protection Controls
    bindToggle('wp-toggle-everyone', wp, 'block_everyone');
    bindToggle('wp-toggle-invites', wp, 'block_invite_links');

    document.getElementById('wp-ratelimit-inp')?.addEventListener('input', (e) => {
      wp.rate_limit = Math.max(1, parseInt(e.target.value || 5, 10));
      scheduleSave();
    });

    document.getElementById('wp-trusted-inp')?.addEventListener('input', (e) => {
      wp.trusted_webhooks = e.target.value;
      scheduleSave();
    });

    // 9. Dropdown Handlers
    // Channel dropdown triggers
    container.querySelectorAll('.custom-ch-dd').forEach(dd => {
      const ddId = dd.getAttribute('data-dd-id');
      const trigger = document.getElementById(`${ddId}-trigger`);
      const menu = document.getElementById(`${ddId}-menu`);
      if (!trigger || !menu) return;

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = menu.classList.contains('hidden');
        closeAllDropdowns();
        if (isHidden) menu.classList.remove('hidden');
      });

      menu.querySelector('.ch-search-inp')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        menu.querySelectorAll('.ch-options-list button[data-pick-ch]').forEach(btn => {
          const txt = btn.textContent.toLowerCase();
          btn.style.display = txt.includes(query) ? '' : 'none';
        });
      });

      menu.querySelectorAll('[data-pick-ch]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const picked = btn.getAttribute('data-pick-ch');
          if (ddId === 'ar-alert-channel-dd') ar.alert_channel = picked;
          else if (ddId === 'sa-alert-channel-dd') ar.suspicious_alert_channel = picked;
          closeAllDropdowns();
          scheduleSave();
          render();
        });
      });

      trigger.querySelector('[data-clear-channel]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ddId === 'ar-alert-channel-dd') ar.alert_channel = '';
        else if (ddId === 'sa-alert-channel-dd') ar.suspicious_alert_channel = '';
        scheduleSave();
        render();
      });
    });

    // Multi-Role dropdown triggers
    container.querySelectorAll('.custom-role-dd').forEach(dd => {
      const ddId = dd.getAttribute('data-dd-id');
      const trigger = document.getElementById(`${ddId}-trigger`);
      const menu = document.getElementById(`${ddId}-menu`);
      if (!trigger || !menu) return;

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = menu.classList.contains('hidden');
        closeAllDropdowns();
        if (isHidden) menu.classList.remove('hidden');
      });

      menu.querySelector('.role-search-inp')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        menu.querySelectorAll('.role-options-list button[data-toggle-role]').forEach(btn => {
          const txt = btn.textContent.toLowerCase();
          btn.style.display = txt.includes(query) ? '' : 'none';
        });
      });

      menu.querySelectorAll('[data-toggle-role]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rId = String(btn.getAttribute('data-toggle-role'));
          const targetArray = (ddId === 'an-roles-dd') ? an.exempt_roles : ar.immune_roles;
          const idx = targetArray.indexOf(rId);
          if (idx !== -1) {
            targetArray.splice(idx, 1);
          } else {
            targetArray.push(rId);
          }
          scheduleSave();
          render();
        });
      });

      trigger.querySelectorAll('.remove-role-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const rId = String(btn.getAttribute('data-role-id'));
          const targetArray = (ddId === 'an-roles-dd') ? an.exempt_roles : ar.immune_roles;
          const idx = targetArray.indexOf(rId);
          if (idx !== -1) {
            targetArray.splice(idx, 1);
            scheduleSave();
            render();
          }
        });
      });
    });

    // Action dropdown triggers
    container.querySelectorAll('.custom-action-dd').forEach(dd => {
      const ddId = dd.getAttribute('data-dd-id');
      const trigger = document.getElementById(`${ddId}-trigger`);
      const menu = document.getElementById(`${ddId}-menu`);
      if (!trigger || !menu) return;

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = menu.classList.contains('hidden');
        closeAllDropdowns();
        if (isHidden) menu.classList.remove('hidden');
      });

      menu.querySelectorAll('[data-pick-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = btn.getAttribute('data-pick-action');
          if (ddId === 'ar-action-dd') ar.action = val;
          else if (ddId === 'sa-action-dd') ar.suspicious_action = val;
          else if (ddId === 'wp-action-dd') wp.action = val;
          closeAllDropdowns();
          scheduleSave();
          render();
        });
      });
    });

    // 10. Threat Filter Tabs
    container.querySelectorAll('[data-threat-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeThreatFilter = btn.getAttribute('data-threat-tab');
        render();
      });
    });

    // Clear Threat Log
    document.getElementById('threat-clear-btn')?.addEventListener('click', () => {
      sec.threat_logs = [];
      scheduleSave();
      render();
    });

    // Close open dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.orbit-dropdown-menu') && !e.target.closest('button')) {
        closeAllDropdowns();
      }
    }, { once: true });
  }

  render();
};
